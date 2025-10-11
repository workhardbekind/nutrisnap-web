'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Upload, Loader, TrendingUp } from 'lucide-react';

interface NutritionResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  healthScore: number;
  breakdown: Array<{
    name: string;
    value: number;
    unit: string;
    color: string;
  }>;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      analyzeImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
      reset();
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {!selectedImage && !result && (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl">
            <Camera size={48} className="text-indigo-500" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">NutriSnap</h1>
          <p className="text-xl text-white/90 mb-12 text-center max-w-md">
            Upload a photo of your food and get instant nutrition insights
          </p>

          <label className="bg-white hover:scale-105 transition-transform cursor-pointer rounded-2xl p-12 shadow-2xl flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload size={64} className="text-indigo-500 mb-4" />
            <span className="text-xl font-semibold text-indigo-500">
              Upload Photo
            </span>
          </label>
        </div>
      )}

      {analyzing && (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
          <div className="relative w-80 h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Food"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Loader size={32} className="text-white animate-spin" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Analyzing your food...
          </h2>
          <p className="text-white/80">Calculating nutritional values</p>
        </div>
      )}

      {result && !analyzing && (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pb-12 pt-8 px-4 rounded-b-3xl">
            <div className="container mx-auto max-w-2xl">
              <button
                onClick={reset}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full mb-6 transition-colors"
              >
                ← Back
              </button>
              
              <h1 className="text-4xl font-bold text-white mb-2">
                {result.foodName}
              </h1>
              <p className="text-white/80">Nutritional Analysis</p>
            </div>
          </div>

          <div className="container mx-auto max-w-2xl px-4 -mt-8">
            {/* Health Score Card */}
            <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg text-center">
              <div 
                className="w-32 h-32 rounded-full mx-auto mb-6 relative"
                style={{
                  background: `conic-gradient(${getHealthScoreColor(result.healthScore)} ${result.healthScore}%, #e5e7eb 0)`
                }}
              >
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: getHealthScoreColor(result.healthScore) }}
                  >
                    {result.healthScore}
                  </span>
                  <span className="text-sm text-gray-500">Score</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Health Score
              </h3>
              <p className="text-gray-600">
                {result.healthScore >= 80 ? 'Excellent choice!' : 
                 result.healthScore >= 60 ? 'Good choice' : 
                 'Consider healthier alternatives'}
              </p>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg text-center">
              <TrendingUp size={48} className="text-indigo-500 mx-auto mb-4" />
              <h2 className="text-6xl font-bold text-gray-800 mb-2">
                {result.calories}
              </h2>
              <p className="text-xl text-gray-600 font-semibold">
                Total Calories
              </p>
            </div>

            {/* Macronutrients */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Nutritional Breakdown
              </h3>

              {result.breakdown.map((nutrient, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {nutrient.name}
                    </span>
                    <span 
                      className="font-bold"
                      style={{ color: nutrient.color }}
                    >
                      {nutrient.value}{nutrient.unit}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((nutrient.value / 50) * 100, 100)}%`,
                        backgroundColor: nutrient.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all"
            >
              Analyze Another Meal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
