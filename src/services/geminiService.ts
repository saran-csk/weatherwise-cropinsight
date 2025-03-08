
import { WeatherData } from './weatherService';

const API_KEY = "AIzaSyBY0ztqoXpNBo4y6tpqpHUxtuiqmpjHs6s";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface InsightData {
  crops: {
    recommended: string[];
    avoid: string[];
    management: string;
  };
  market: {
    outlook: string;
    recommendations: string[];
    risks: string[];
  }
}

export interface InsightError {
  message: string;
}

const createPrompt = (weather: WeatherData): string => {
  const { temperature, humidity, wind_speed, description, clouds, rain } = weather;
  
  return `
You are an agricultural consulting expert specializing in Tamil Nadu agriculture. Based on the following weather data, provide professional and detailed recommendations for crop management and market insights tailored for business professionals and agricultural enterprises in Tamil Nadu. Format your response in a structured, clear manner without using asterisks or bold formatting.

Weather data for ${weather.city}, ${weather.country}:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Wind Speed: ${wind_speed} m/s
- Weather Condition: ${description}
- Cloud Cover: ${clouds}%
${rain ? `- Rainfall: ${rain['1h'] || rain['3h'] || 0} mm` : '- No rainfall data available'}

Please provide the following information specific to Tamil Nadu agriculture:

1. High-value crops suited for these conditions in Tamil Nadu (list 5-7 specific crops with very brief justification)
2. Crops to avoid in these conditions in Tamil Nadu's climate (list 3-5 specific crops with brief reasoning)
3. Professional crop management recommendations (2-3 detailed paragraphs providing actionable management advice for Tamil Nadu farmers)
4. Agricultural market analysis for Tamil Nadu (1-2 detailed paragraphs analyzing current and projected market conditions)
5. Strategic market recommendations for agribusiness professionals (list at least 4-5 specific, actionable business recommendations)
6. Key risk factors and mitigation strategies (list 4-5 specific risks with brief mitigation suggestions)

Format your response with clear professional headings. Your response should be suitable for presentation to agricultural business stakeholders and investors in Tamil Nadu.
`;
};

export const fetchInsights = async (
  weatherData: WeatherData
): Promise<InsightData | InsightError> => {
  try {
    const prompt = createPrompt(weatherData);
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return {
        message: 'Failed to generate insights',
      };
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return {
        message: 'No insights were generated',
      };
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Remove any asterisks from the response
    const cleanedResponse = textResponse.replace(/\*\*/g, '');
    
    // Parse the AI response to extract structured data
    const insights = parseAIResponse(cleanedResponse);
    return insights;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return {
      message: 'Failed to connect to AI service',
    };
  }
};

const parseAIResponse = (text: string): InsightData => {
  // Default structure with empty values
  const defaultInsights: InsightData = {
    crops: {
      recommended: [],
      avoid: [],
      management: "No specific management advice available for Tamil Nadu.",
    },
    market: {
      outlook: "No Tamil Nadu market outlook available.",
      recommendations: [],
      risks: []
    }
  };
  
  try {
    // Extract recommended crops with more robust pattern matching
    const recommendedMatch = text.match(/High-value crops|Recommended Crops|Crops suited for these conditions[^:]*:(.*?)(?=\d\.|Crops to avoid|$)/si);
    if (recommendedMatch && recommendedMatch[1]) {
      defaultInsights.crops.recommended = recommendedMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract crops to avoid
    const avoidMatch = text.match(/Crops to avoid[^:]*:(.*?)(?=\d\.|Crop management|Professional crop management|$)/si);
    if (avoidMatch && avoidMatch[1]) {
      defaultInsights.crops.avoid = avoidMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract crop management advice
    const managementMatch = text.match(/[Cc]rop [Mm]anagement [Rr]ecommendations?|Professional [Cc]rop [Mm]anagement[^:]*:(.*?)(?=\d\.|[Aa]gricultural [Mm]arket|[Mm]arket [Aa]nalysis|$)/si);
    if (managementMatch && managementMatch[1]) {
      defaultInsights.crops.management = managementMatch[1].trim();
    }
    
    // Extract market outlook/analysis
    const outlookMatch = text.match(/[Aa]gricultural [Mm]arket [Aa]nalysis|[Mm]arket [Oo]utlook|[Mm]arket [Aa]nalysis[^:]*:(.*?)(?=\d\.|[Ss]trategic [Mm]arket|[Mm]arket [Rr]ecommendations|$)/si);
    if (outlookMatch && outlookMatch[1]) {
      defaultInsights.market.outlook = outlookMatch[1].trim();
    }
    
    // Extract market recommendations
    const recommendationsMatch = text.match(/[Ss]trategic [Mm]arket [Rr]ecommendations|[Mm]arket [Rr]ecommendations[^:]*:(.*?)(?=\d\.|[Kk]ey [Rr]isk [Ff]actors|[Rr]isks? [Tt]o [Mm]onitor|[Pp]otential [Rr]isks|$)/si);
    if (recommendationsMatch && recommendationsMatch[1]) {
      defaultInsights.market.recommendations = recommendationsMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract risks and mitigation strategies
    const risksMatch = text.match(/[Kk]ey [Rr]isk [Ff]actors|[Rr]isks? [Tt]o [Mm]onitor|[Pp]otential [Rr]isks[^:]*:(.*?)(?=\d\.|$)/si);
    if (risksMatch && risksMatch[1]) {
      defaultInsights.market.risks = risksMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    return defaultInsights;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return defaultInsights;
  }
};
