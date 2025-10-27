// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST handler - this MUST be exported
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { image } = body;

    // Validate image data
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Call OpenAI Vision API with enhanced nutritional analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide a comprehensive nutritional breakdown. 
              
              Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
              {
                "foodName": "Name of the dish",
                "servingSize": "Estimated serving size (e.g., '1 cup', '250g', '1 medium plate')",
                "calories": number (total calories),
                "healthScore": number (0-100, where 100 is healthiest),
                "macronutrients": {
                  "protein": {"value": number, "unit": "g", "dailyValue": number (percentage)},
                  "carbohydrates": {"value": number, "unit": "g", "dailyValue": number},
                  "totalFat": {"value": number, "unit": "g", "dailyValue": number},
                  "saturatedFat": {"value": number, "unit": "g", "dailyValue": number},
                  "unsaturatedFat": {"value": number, "unit": "g", "dailyValue": number},
                  "transFat": {"value": number, "unit": "g", "dailyValue": number},
                  "fiber": {"value": number, "unit": "g", "dailyValue": number},
                  "sugar": {"value": number, "unit": "g", "dailyValue": number},
                  "addedSugar": {"value": number, "unit": "g", "dailyValue": number}
                },
                "vitamins": {
                  "vitaminA": {"value": number, "unit": "μg", "dailyValue": number},
                  "vitaminC": {"value": number, "unit": "mg", "dailyValue": number},
                  "vitaminD": {"value": number, "unit": "μg", "dailyValue": number},
                  "vitaminE": {"value": number, "unit": "mg", "dailyValue": number},
                  "vitaminK": {"value": number, "unit": "μg", "dailyValue": number},
                  "vitaminB6": {"value": number, "unit": "mg", "dailyValue": number},
                  "vitaminB12": {"value": number, "unit": "μg", "dailyValue": number},
                  "thiamin": {"value": number, "unit": "mg", "dailyValue": number},
                  "riboflavin": {"value": number, "unit": "mg", "dailyValue": number},
                  "niacin": {"value": number, "unit": "mg", "dailyValue": number},
                  "folate": {"value": number, "unit": "μg", "dailyValue": number}
                },
                "minerals": {
                  "calcium": {"value": number, "unit": "mg", "dailyValue": number},
                  "iron": {"value": number, "unit": "mg", "dailyValue": number},
                  "magnesium": {"value": number, "unit": "mg", "dailyValue": number},
                  "phosphorus": {"value": number, "unit": "mg", "dailyValue": number},
                  "potassium": {"value": number, "unit": "mg", "dailyValue": number},
                  "sodium": {"value": number, "unit": "mg", "dailyValue": number},
                  "zinc": {"value": number, "unit": "mg", "dailyValue": number},
                  "selenium": {"value": number, "unit": "μg", "dailyValue": number}
                },
                "other": {
                  "cholesterol": {"value": number, "unit": "mg", "dailyValue": number},
                  "caffeine": {"value": number, "unit": "mg", "dailyValue": null},
                  "water": {"value": number, "unit": "g", "dailyValue": null},
                  "alcohol": {"value": number, "unit": "g", "dailyValue": null},
                  "omega3": {"value": number, "unit": "g", "dailyValue": null},
                  "omega6": {"value": number, "unit": "g", "dailyValue": null}
                },
                "glycemicIndex": number (0-100, null if not applicable),
                "glycemicLoad": number (null if not applicable),
                "ingredients": ["List of identified main ingredients"],
                "allergens": ["List of potential allergens"],
                "dietaryTags": ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", etc - only include applicable ones],
                "healthBenefits": ["List of 3-5 key health benefits"],
                "healthConcerns": ["List of any health concerns or warnings"],
                "recommendations": {
                  "portion": "Portion size recommendation",
                  "frequency": "How often this could be consumed",
                  "improvements": ["Suggestions to make this meal healthier"],
                  "pairings": ["Foods that would complement this nutritionally"]
                }
              }
              
              Base the health score on: 
              - Nutritional density and balance
              - Whole foods vs processed foods
              - Vegetable and fruit content
              - Healthy vs unhealthy fats
              - Added sugars and sodium levels
              - Fiber content
              - Overall contribution to a balanced diet
              
              Provide realistic estimates based on typical portions and ingredients visible in the image.
              For values you cannot determine precisely, provide reasonable estimates based on similar foods.
              Set null for any values that are truly not applicable.`
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent nutritional estimates
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const nutritionData = JSON.parse(content);

    // Return the nutrition data
    return NextResponse.json(nutritionData);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // If parsing failed, try to extract JSON from the response
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Failed to parse nutrition data',
          details: 'Invalid response format from AI' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Optional: Add runtime config if needed
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
