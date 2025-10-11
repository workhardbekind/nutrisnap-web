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

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide a detailed nutritional breakdown. 
              
              Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
              {
                "foodName": "Name of the dish",
                "calories": number (total calories),
                "protein": number (grams),
                "carbs": number (grams),
                "fats": number (grams),
                "fiber": number (grams),
                "healthScore": number (0-100, where 100 is healthiest),
                "breakdown": [
                  {"name": "Protein", "value": number, "unit": "g", "color": "#3b82f6"},
                  {"name": "Carbs", "value": number, "unit": "g", "color": "#f59e0b"},
                  {"name": "Fats", "value": number, "unit": "g", "color": "#ef4444"},
                  {"name": "Fiber", "value": number, "unit": "g", "color": "#10b981"}
                ]
              }
              
              Base the health score on: nutritional balance, whole foods vs processed, vegetable content, healthy fats, etc.`
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
      max_tokens: 500,
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