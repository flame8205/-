import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult, StockFinancials, NewsItem } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to clean numeric strings from AI (e.g., "12.5%" -> 12.5)
const cleanNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove %, commas, currency symbols, and whitespace
    const cleaned = value.replace(/[%$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const analyzeStockData = async (query: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a professional financial analyst.
    Please search for the latest financial data and news for the stock: "${query}".
    
    I need you to find and calculate the following specific metrics based on the most recent available reports (Monthly Revenue, Quarterly Reports, or Annual Reports).
    
    **Part 1: Financial Metrics**
    1. Current Month Revenue (Identify the specific month, e.g., "Nov 2024").
    2. Accumulated Revenue Year-Over-Year (YoY) Growth Rate (%). (Must be a number).
    3. Current Quarter Gross Margin (%). (Must be a number).
    4. Accumulated Gross Margin (Year-to-Date) (%). (Must be a number).
    5. Accumulated Gross Margin YoY Growth Rate (%). (This is the growth rate of the margin percentage itself).
    
    **Part 2: News Search**
    Search for recent news (within the last 3-6 months) about this company. 
    You must specifically look for articles that contain the following strategic keywords/concepts. 
    
    - **Expansion (擴廠)**
    - **Factory Setup/Location (設廠, 在哪裡設廠)**
    - **Investment Details (投資, 投資甚麼)**
    - **Major Capital Expenditure (重大資本支出)**
    - **Latest Technology (最新技術)**
    - **Order Volume (訂單量)**
    - **Cooperation with US Companies (與美國公司合作)**
    
    **Part 3: Calculation**
    Calculate the "Growth Score" using the Rule of 40 concept:
    **Score = (Accumulated Revenue YoY %) + (Accumulated Gross Margin %)**
    
    Determine if this Score is >= 40.

    **OUTPUT FORMAT INSTRUCTION:**
    
    Step 1: Provide a **brief analysis summary** in Traditional Chinese.
    Step 2: Provide the **JSON Data** in a strictly formatted code block.
    
    For the "news" "tags" array, you MUST classify the news into one or more of these EXACT English categories:
    - "Expansion", "Investment", "Technology", "Orders", "US_Cooperation"
    
    \`\`\`json
    {
      "financials": {
        "symbol": "Stock Symbol",
        "companyName": "Company Name",
        "currency": "Currency Code",
        "currentMonthRevenue": "Value string",
        "accumulatedRevenueYoY": Number,
        "currentQuarterGrossMargin": Number,
        "accumulatedGrossMargin": Number,
        "accumulatedGrossMarginYoY": Number
      },
      "news": [
        {
          "headline": "News Headline",
          "source": "News Source",
          "date": "Date string",
          "summary": "Brief summary",
          "tags": ["Expansion"] 
        }
      ],
      "score": Number,
      "isHighGrowth": Boolean,
      "summary": "Brief analysis summary in Traditional Chinese"
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    let text = response.text;
    
    // Fallback: Check candidates parts if text is undefined
    if (!text && response.candidates && response.candidates.length > 0) {
       const parts = response.candidates[0].content?.parts;
       if (parts) {
         text = parts.map(p => p.text || "").join("");
       }
    }

    if (!text) {
      console.error("Empty response from AI:", JSON.stringify(response, null, 2));
      throw new Error("AI 未回傳內容，可能是被安全設定阻擋或搜尋失敗。");
    }
    
    // Robust JSON Extraction: Find the outermost braces
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    let jsonStr = "";
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = text.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("無法解析 AI 回傳格式 (找不到 JSON)");
    }
    
    let data: AnalysisResult;
    try {
        data = JSON.parse(jsonStr) as AnalysisResult;
    } catch (e) {
        // Try to cleanup markdown if simple parse fails
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "");
        try {
            data = JSON.parse(jsonStr) as AnalysisResult;
        } catch (e2) {
             console.error("JSON Parse Error:", e2);
             throw new Error("資料格式錯誤，請重試");
        }
    }

    // Sanitize Financial Numbers (Crucial Fix for "NaN" or String concatenation issues)
    if (data.financials) {
        data.financials.accumulatedRevenueYoY = cleanNumber(data.financials.accumulatedRevenueYoY);
        data.financials.currentQuarterGrossMargin = cleanNumber(data.financials.currentQuarterGrossMargin);
        data.financials.accumulatedGrossMargin = cleanNumber(data.financials.accumulatedGrossMargin);
        data.financials.accumulatedGrossMarginYoY = cleanNumber(data.financials.accumulatedGrossMarginYoY);
    }
    
    // Recalculate Score to be safe
    data.score = (data.financials.accumulatedRevenueYoY || 0) + (data.financials.accumulatedGrossMargin || 0);
    data.isHighGrowth = data.score >= 40;
    
    // Grounding / Source Injection
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && data.news) {
        let chunkIndex = 0;
        data.news = data.news.map(item => {
            // Case-insensitive title matching
            const itemHeadlineLower = item.headline.toLowerCase();
            
            const chunk = groundingChunks.find(c => {
                if (!c.web?.title) return false;
                const chunkTitleLower = c.web.title.toLowerCase();
                return chunkTitleLower.includes(itemHeadlineLower) || itemHeadlineLower.includes(chunkTitleLower);
            });

            if (chunk && chunk.web?.uri) {
                return { ...item, url: chunk.web.uri };
            }
            
            // Fallback: Assign valid chunks in order if no exact match
            if (groundingChunks.length > 0) {
                // Ensure we skip chunks without web URIs
                let attempts = 0;
                while (attempts < groundingChunks.length) {
                    const currentChunk = groundingChunks[chunkIndex];
                    chunkIndex = (chunkIndex + 1) % groundingChunks.length;
                    
                    if (currentChunk?.web?.uri) {
                        return { ...item, url: currentChunk.web.uri };
                    }
                    attempts++;
                }
            }
            return item;
        });
    }

    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};