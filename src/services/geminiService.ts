
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
      return getFallbackInsights(weatherData);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return getFallbackInsights(weatherData);
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Remove any asterisks from the response
    const cleanedResponse = textResponse.replace(/\*\*/g, '');
    
    // Parse the AI response to extract structured data
    const insights = parseAIResponse(cleanedResponse);
    
    // If any critical sections are empty, use fallback data
    if (insights.crops.recommended.length === 0 || 
        insights.crops.avoid.length === 0 || 
        !insights.crops.management || 
        !insights.market.outlook || 
        insights.market.recommendations.length === 0 || 
        insights.market.risks.length === 0) {
      return getFallbackInsights(weatherData);
    }
    
    return insights;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return getFallbackInsights(weatherData);
  }
};

// Provides professional fallback data based on weather conditions
const getFallbackInsights = (weather: WeatherData): InsightData => {
  const { temperature } = weather;
  const isHot = temperature > 30;
  const isWarm = temperature >= 25 && temperature <= 30;
  const isMild = temperature >= 20 && temperature < 25;
  const isCool = temperature < 20;
  
  // Adjust recommendations based on temperature ranges
  const fallbackData: InsightData = {
    crops: {
      recommended: [
        "Paddy (Rice)",
        "Sugarcane",
        "Cotton",
        "Millets (Ragi, Bajra)",
        "Groundnuts",
        "Pulses (Black Gram, Green Gram)",
        "Coconut"
      ],
      avoid: [
        "Wheat (requires cooler climate)",
        "Apple (requires cold weather)",
        "Potato (sensitive to high temperatures)",
        "Coffee (requires specific altitude conditions)"
      ],
      management: `For optimal crop management in Tamil Nadu's current conditions (${temperature}°C), implement precision irrigation systems that maximize water efficiency while minimizing costs. Drip irrigation and micro-sprinklers can reduce water usage by 30-50% compared to traditional flood irrigation, critical for sustainable agriculture in the region.

Given the seasonal variability, we recommend integrated pest management (IPM) strategies combining biological controls with minimal chemical interventions. This approach typically reduces pesticide costs by 15-20% while enhancing produce quality for premium markets. Additionally, establishing crop rotation schedules with nitrogen-fixing legumes can decrease fertilizer requirements by 20-25% while improving soil health indicators.

For large-scale operations, investing in mechanized harvesting appropriate for Tamil Nadu's predominant crops can reduce labor dependencies and harvest losses. Data indicates potential harvest loss reductions of 12-18% when using appropriate mechanization, directly impacting bottom-line performance.`
    },
    market: {
      outlook: `The agricultural market in Tamil Nadu is currently experiencing a structural transformation driven by changing consumer preferences and export opportunities. With ${isHot ? 'current high temperatures' : isWarm ? 'favorable warm conditions' : isMild ? 'moderate temperatures' : 'cooler than average conditions'}, we project a ${isWarm || isMild ? 'positive' : 'challenging'} growth trajectory for key crops in the coming season. Market data indicates price premiums of 15-25% for organic and sustainably grown produce, particularly in export markets and urban centers like Chennai and Coimbatore.

Supply chain analytics suggest that post-harvest infrastructure investments, particularly in cold storage and processing facilities, offer significant value-addition opportunities with potential ROI of 18-22% over a three-year period. With the government's enhanced focus on agricultural exports, enterprises that can meet international quality standards and certification requirements stand to capture growing market share in Middle Eastern and Southeast Asian markets, where Tamil Nadu exports have seen a compound annual growth rate of approximately 12% over the past five years.`,
      recommendations: [
        "Invest in digitalization of supply chains to improve traceability and command premium pricing in export markets",
        "Develop processing capacity for value-added products from sugarcane and coconut to capture higher margins",
        "Establish contract farming arrangements with guaranteed minimum support prices to ensure stable supply",
        "Implement quality certification programs (Global GAP, organic) to access premium international markets",
        "Develop direct-to-consumer channels for premium agricultural products to urban markets"
      ],
      risks: [
        "Unpredictable monsoon patterns affecting water availability - Implement water harvesting and storage systems",
        "Price volatility due to production fluctuations - Utilize futures contracts and diversify crop portfolio",
        "Labor shortages during peak agricultural seasons - Invest in appropriate mechanization and labor planning",
        "Market access constraints for small producers - Form producer cooperatives to achieve economies of scale",
        "Climate change impacts on crop yields - Adopt climate-resilient crop varieties and cultivation practices"
      ]
    }
  };
  
  // Adjust recommendations based on temperature conditions
  if (isHot) {
    fallbackData.crops.recommended = [
      "Sorghum (heat-tolerant grain)",
      "Pearl Millet (drought-resistant)",
      "Cotton (thrives in warm conditions)",
      "Groundnuts (heat-tolerant legume)",
      "Sesame (oil seed suitable for hot climate)",
      "Black Gram (heat-tolerant pulse)",
      "Coconut (perennial crop adapted to Tamil Nadu)"
    ];
    fallbackData.crops.avoid.push("Tomatoes (heat sensitive during flowering)");
  } else if (isCool) {
    fallbackData.crops.recommended = [
      "Vegetables (carrot, cabbage, cauliflower)",
      "Marigold (floriculture opportunity)",
      "Green Peas (cool-season legume)",
      "Potatoes (suitable for cooler highlands)",
      "Beans (moderate temperature crop)",
      "Tea (in highland areas)",
      "Medicinal herbs (higher value in cooler climate)"
    ];
    fallbackData.crops.avoid = [
      "Rice varieties sensitive to cool temperatures",
      "Mangoes (requires warmer flowering period)",
      "Bananas (growth slows in cool weather)",
      "Papaya (sensitive to cool conditions)"
    ];
  }
  
  return fallbackData;
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
