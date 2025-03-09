
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
    prices: {
      crop: string;
      price: string;
      trend: "up" | "down" | "stable";
    }[];
  }
}

export interface InsightError {
  message: string;
}

const createPrompt = (weather: WeatherData): string => {
  const { temperature, humidity, wind_speed, description, clouds, rain } = weather;
  
  return `
You are an agricultural expert AI assistant focused on Tamil Nadu agriculture. Based on the following weather data, provide concise recommendations for crop management and market insights specific to Tamil Nadu. Format your response in a structured, clear manner that's easy to parse. Do NOT use asterisks or bold formatting in your response.

Weather data for ${weather.city}, ${weather.country}:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Wind Speed: ${wind_speed} m/s
- Weather Condition: ${description}
- Cloud Cover: ${clouds}%
${rain ? `- Rainfall: ${rain['1h'] || rain['3h'] || 0} mm` : '- No rainfall data available'}

Please provide the following information specific to Tamil Nadu agriculture:
1. Crops that would thrive in these specific conditions in Tamil Nadu (list at least 5-7 specific crops)
2. Crops to avoid in these specific conditions in Tamil Nadu (list at least 3-5 specific crops)
3. Detailed crop management advice for these weather conditions in Tamil Nadu (2-3 detailed paragraphs)
4. Agricultural market outlook based on these weather conditions in Tamil Nadu (1-2 detailed paragraphs)
5. Specific market recommendations for Tamil Nadu farmers (list at least 3-5 specific recommendations)
6. Potential risks to monitor in Tamil Nadu agriculture (list at least 3-5 specific risks)
7. Current market prices in Tamil Nadu for at least 8-10 common crops (format as "crop = price per kg/unit" for each)

Format your response with clear headings and avoid using asterisks or markdown formatting. For the market prices, be specific about current Tamil Nadu market rates, indicating which crops have high prices and which have low prices currently.
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
      return provideFallbackInsights(weatherData);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return provideFallbackInsights(weatherData);
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Remove any asterisks from the response
    const cleanedResponse = textResponse.replace(/\*\*/g, '');
    
    // Parse the AI response to extract structured data
    const insights = parseAIResponse(cleanedResponse, weatherData);
    return insights;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return provideFallbackInsights(weatherData);
  }
};

const parseAIResponse = (text: string, weatherData: WeatherData): InsightData => {
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
      risks: [],
      prices: []
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
    const risksMatch = text.match(/[Pp]otential [Rr]isks|[Rr]isks to [Mm]onitor[^:]*:(.*?)(?=\d\.|[Cc]urrent [Mm]arket [Pp]rices|$)/si);
    if (risksMatch && risksMatch[1]) {
      defaultInsights.market.risks = risksMatch[1]
        .split(/,|\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
    }
    
    // Extract current market prices
    const pricesMatch = text.match(/[Cc]urrent [Mm]arket [Pp]rices[^:]*:(.*?)(?=\d\.|$)/si);
    if (pricesMatch && pricesMatch[1]) {
      const priceItems = pricesMatch[1]
        .split(/\n|-|•/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^\d+\.?$/));
      
      defaultInsights.market.prices = priceItems.map(item => {
        // Try to parse "crop = price" format
        const matches = item.match(/(.*?)(?:=|:|\s-\s)(.*)/);
        if (matches) {
          const crop = matches[1].trim();
          const priceText = matches[2].trim();
          // Determine price trend
          let trend: "up" | "down" | "stable" = "stable";
          if (priceText.includes("increasing") || priceText.includes("high")) {
            trend = "up";
          } else if (priceText.includes("decreasing") || priceText.includes("low")) {
            trend = "down";
          }
          return {
            crop,
            price: priceText,
            trend
          };
        }
        return {
          crop: item,
          price: "Market price unavailable",
          trend: "stable"
        };
      });
    }
    
    return defaultInsights;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return provideFallbackInsights(weatherData);
  }
};

// Fallback insights based on weather conditions
const provideFallbackInsights = (weather: WeatherData): InsightData => {
  const temp = weather.temperature;
  let recommendedCrops: string[] = [];
  let avoidCrops: string[] = [];
  
  // Temperature-based crop recommendations
  if (temp >= 25 && temp <= 35) {
    recommendedCrops = ["Rice", "Sugarcane", "Groundnut", "Banana", "Coconut", "Cotton", "Black Gram"];
    avoidCrops = ["Wheat", "Apple", "Potato", "Carrot", "Cauliflower"];
  } else if (temp >= 20 && temp < 25) {
    recommendedCrops = ["Tomato", "Brinjal", "Chillies", "Onion", "Pulses", "Okra", "Green Vegetables"];
    avoidCrops = ["Mango", "Cashew", "Papaya", "Watermelon", "Pomegranate"];
  } else if (temp >= 15 && temp < 20) {
    recommendedCrops = ["Cabbage", "Carrot", "Cauliflower", "Beetroot", "Radish", "Peas", "Green Leafy Vegetables"];
    avoidCrops = ["Rice", "Banana", "Sugarcane", "Cotton", "Coconut"];
  } else if (temp < 15) {
    recommendedCrops = ["Potato", "Peas", "Garlic", "Ginger", "Mustard", "Wheat", "Barley"];
    avoidCrops = ["Rice", "Sugarcane", "Coconut", "Banana", "Mango"];
  } else {
    recommendedCrops = ["Millet", "Sorghum", "Pearl Millet", "Cowpea", "Pigeon Pea", "Drought-resistant Cotton", "Sesame"];
    avoidCrops = ["Rice", "Vegetables", "Fruits", "Pulses", "Wheat"];
  }

  // Create fallback prices data
  const currentPrices = [
    { crop: "Rice", price: "₹38-42 per kg", trend: "up" as const },
    { crop: "Tomato", price: "₹30-35 per kg", trend: "down" as const },
    { crop: "Onion", price: "₹45-50 per kg", trend: "up" as const },
    { crop: "Potato", price: "₹25-30 per kg", trend: "stable" as const },
    { crop: "Banana", price: "₹60-70 per dozen", trend: "stable" as const },
    { crop: "Sugarcane", price: "₹350-400 per quintal", trend: "up" as const },
    { crop: "Groundnut", price: "₹75-85 per kg", trend: "down" as const },
    { crop: "Coconut", price: "₹18-25 per piece", trend: "up" as const },
    { crop: "Black Gram", price: "₹110-120 per kg", trend: "stable" as const },
    { crop: "Green Gram", price: "₹90-100 per kg", trend: "down" as const }
  ];
  
  return {
    crops: {
      recommended: recommendedCrops,
      avoid: avoidCrops,
      management: `Based on the current temperature of ${temp}°C in ${weather.city}, farmers should focus on optimal water management. ${
        temp > 30 ? "Due to high temperatures, ensure frequent irrigation to prevent moisture stress." : 
        temp < 20 ? "The cooler temperatures reduce evaporation, so adjust irrigation schedules accordingly." :
        "Maintain regular irrigation schedules appropriate for the moderate temperatures."
      }
      
      Pest and disease pressure ${
        temp > 28 ? "may be high due to warm conditions. Monitor regularly for insect pests like aphids, thrips, and whiteflies." : 
        "should be moderate under these conditions, but regular monitoring is still essential."
      } Consider implementing integrated pest management techniques using neem-based organic pesticides which are effective in Tamil Nadu's conditions while being environmentally friendly.`
    },
    market: {
      outlook: `The current agricultural market in Tamil Nadu is ${
        temp > 30 ? "experiencing pressure due to high temperatures affecting crop quality and yield." : 
        temp < 20 ? "favorable for cool-weather crops, which could see good returns due to limited supply." :
        "relatively stable with good conditions for a variety of crops."
      } Farmers should closely monitor market trends and consider ${
        temp > 28 ? "value-added processing to mitigate potential losses from heat stress." : 
        "direct marketing channels to maximize profits."
      }`,
      recommendations: [
        "Focus on crops with high market demand like vegetables and fruits for local markets",
        "Consider contract farming with food processing companies to ensure stable prices",
        "Implement grading and proper packaging to obtain premium prices",
        "Explore organic certification for higher value in urban markets",
        "Use Tamil Nadu government's market intelligence services for price forecasting"
      ],
      risks: [
        "Sudden price fluctuations due to market oversupply",
        "Transportation challenges affecting timely delivery to markets",
        "Quality degradation during storage and transport",
        "Competition from imported agricultural products",
        "Climate variability affecting crop quality and quantity"
      ],
      prices: currentPrices
    }
  };
};

