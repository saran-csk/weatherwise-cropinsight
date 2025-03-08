
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
You are an agricultural expert AI assistant. Based on the following weather data, provide concise recommendations for crop management and market insights. Format your response in a structured, clear manner that's easy to parse. Do NOT use asterisks or bold formatting in your response.

Weather data for ${weather.city}, ${weather.country}:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Wind Speed: ${wind_speed} m/s
- Weather Condition: ${description}
- Cloud Cover: ${clouds}%
${rain ? `- Rainfall: ${rain['1h'] || rain['3h'] || 0} mm` : '- No rainfall data available'}

Please provide the following information:
1. Crops that would thrive in these conditions (list at least 5-7 specific crops)
2. Crops to avoid in these conditions (list at least 3-5 specific crops)
3. Detailed crop management advice for these weather conditions (2-3 detailed paragraphs)
4. Agricultural market outlook based on these weather conditions (1-2 detailed paragraphs)
5. Specific market recommendations (list at least 3-5 specific recommendations)
6. Potential risks to monitor (list at least 3-5 specific risks)

Format your response with clear headings and avoid using asterisks or markdown formatting.
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
  // Improved parser for better extraction
  const defaultInsights: InsightData = {
    crops: {
      recommended: [],
      avoid: [],
      management: "No specific management advice available.",
    },
    market: {
      outlook: "No market outlook available.",
      recommendations: [],
      risks: []
    }
  };
  
  try {
    // Extract crops that would thrive - more robust pattern matching
    const recommendedMatch = text.match(/Crops that would thrive|Recommended Crops[^:]*:(.*?)(?=\d\.|Crops to avoid|$)/si);
    if (recommendedMatch && recommendedMatch[1]) {
      defaultInsights.crops.recommended = recommendedMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract crops to avoid
    const avoidMatch = text.match(/Crops to avoid[^:]*:(.*?)(?=\d\.|Crop management|$)/si);
    if (avoidMatch && avoidMatch[1]) {
      defaultInsights.crops.avoid = avoidMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract crop management advice - capture more text
    const managementMatch = text.match(/[Cc]rop [Mm]anagement[^:]*:(.*?)(?=\d\.|[Mm]arket [Oo]utlook|[Aa]gricultural [Mm]arket|$)/si);
    if (managementMatch && managementMatch[1]) {
      defaultInsights.crops.management = managementMatch[1].trim();
    }
    
    // Extract market outlook - more comprehensive
    const outlookMatch = text.match(/[Mm]arket [Oo]utlook|[Aa]gricultural [Mm]arket [Oo]utlook[^:]*:(.*?)(?=\d\.|[Mm]arket [Rr]ecommendations|[Ss]pecific [Mm]arket|$)/si);
    if (outlookMatch && outlookMatch[1]) {
      defaultInsights.market.outlook = outlookMatch[1].trim();
    }
    
    // Extract market recommendations
    const recommendationsMatch = text.match(/[Mm]arket [Rr]ecommendations|[Ss]pecific [Mm]arket [Rr]ecommendations[^:]*:(.*?)(?=\d\.|[Pp]otential [Rr]isks|[Rr]isks to [Mm]onitor|$)/si);
    if (recommendationsMatch && recommendationsMatch[1]) {
      defaultInsights.market.recommendations = recommendationsMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract potential risks
    const risksMatch = text.match(/[Pp]otential [Rr]isks|[Rr]isks to [Mm]onitor[^:]*:(.*?)(?=\d\.|$)/si);
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
