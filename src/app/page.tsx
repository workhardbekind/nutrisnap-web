'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Camera, Upload, Loader, TrendingUp, X, RotateCw, 
  Image as ImageIcon, Heart, AlertCircle, Info,
  Zap, Droplet, Wheat, Apple, Fish, Pill, Shield,
  ChevronDown, ChevronUp, Check, AlertTriangle
} from 'lucide-react';

interface NutritionValue {
  value: number;
  unit: string;
  dailyValue?: number | null;
}

interface NutritionResult {
  foodName: string;
  servingSize: string;
  calories: number;
  healthScore: number;
  macronutrients: {
    protein: NutritionValue;
    carbohydrates: NutritionValue;
    totalFat: NutritionValue;
    saturatedFat: NutritionValue;
    unsaturatedFat: NutritionValue;
    transFat: NutritionValue;
    fiber: NutritionValue;
    sugar: NutritionValue;
    addedSugar: NutritionValue;
  };
  vitamins: Record<string, NutritionValue>;
  minerals: Record<string, NutritionValue>;
  other: Record<string, NutritionValue>;
  glycemicIndex?: number | null;
  glycemicLoad?: number | null;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  healthBenefits: string[];
  healthConcerns: string[];
  recommendations: {
    portion: string;
    frequency: string;
    improvements: string[];
    pairings: string[];
  };
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['macros']));
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please check permissions or use file upload.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Take photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      setSelectedImage(imageData);
      setShowCamera(false);
      stopCamera();
      analyzeImage(imageData);
    }
  };

  // Handle file upload
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

  // Analyze image
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

  // Reset everything
  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setAnalyzing(false);
    setShowCamera(false);
    setCameraError(null);
    setExpandedSections(new Set(['macros']));
    stopCamera();
  };

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Get daily value color
  const getDailyValueColor = (value: number) => {
    if (value <= 20) return '#10b981';
    if (value <= 50) return '#3b82f6';
    if (value <= 100) return '#f59e0b';
    return '#ef4444';
  };

  // Format nutrient name for display
  const formatNutrientName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [facingMode]);

  // Start camera when showCamera becomes true
  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showCamera]);

  // Camera View
  if (showCamera) {
    return (
      <main className="min-h-screen bg-black relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {cameraError ? (
            <div className="text-center p-8">
              <p className="text-white mb-4">{cameraError}</p>
              <button
                onClick={() => {
                  setShowCamera(false);
                  setCameraError(null);
                }}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold"
              >
                Use File Upload Instead
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                  }
                }}
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 pb-12">
                <div className="flex items-center justify-around max-w-md mx-auto">
                  <button
                    onClick={reset}
                    className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </button>
                  
                  <button
                    onClick={toggleCamera}
                    className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <RotateCw size={24} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  // Home screen
  if (!selectedImage && !result) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl">
            <Camera size={48} className="text-indigo-500" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">NutriSnap</h1>
          <p className="text-xl text-white/90 mb-12 text-center max-w-md">
            Take a photo or upload an image of your food for instant nutrition insights
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => setShowCamera(true)}
              className="flex-1 bg-white hover:scale-105 transition-transform rounded-2xl p-8 shadow-2xl flex flex-col items-center"
            >
              <Camera size={48} className="text-indigo-500 mb-3" />
              <span className="text-lg font-semibold text-indigo-500">
                Take Photo
              </span>
            </button>

            <label className="flex-1 bg-white/90 hover:bg-white hover:scale-105 transition-all cursor-pointer rounded-2xl p-8 shadow-2xl flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <ImageIcon size={48} className="text-purple-500 mb-3" />
              <span className="text-lg font-semibold text-purple-500">
                Upload Photo
              </span>
            </label>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur rounded-2xl p-6 max-w-md">
            <p className="text-white text-center text-sm">
              📸 For best results, capture the entire meal in good lighting
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Analyzing screen
  if (analyzing) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
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
          <p className="text-white/80">Calculating detailed nutritional values</p>
        </div>
      </main>
    );
  }

  // Results screen
  if (result && !analyzing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pb-12 pt-8 px-4 rounded-b-3xl">
          <div className="container mx-auto max-w-4xl">
            <button
              onClick={reset}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full mb-6 transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              {result.foodName}
            </h1>
            <p className="text-white/80">Serving Size: {result.servingSize}</p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 -mt-8 pb-8">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Health Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-3 relative"
                style={{
                  background: `conic-gradient(${getHealthScoreColor(result.healthScore)} ${result.healthScore}%, #e5e7eb 0)`
                }}
              >
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                  <span 
                    className="text-3xl font-bold"
                    style={{ color: getHealthScoreColor(result.healthScore) }}
                  >
                    {result.healthScore}
                  </span>
                  <span className="text-xs text-gray-500">Score</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Health Score</h3>
            </div>

            {/* Calories */}
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mx-auto mb-3 flex items-center justify-center">
                <Zap size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{result.calories}</h3>
              <p className="text-sm text-gray-600">Calories</p>
            </div>

            {/* Glycemic Index */}
            {result.glycemicIndex !== null && result.glycemicIndex !== undefined && (
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{result.glycemicIndex}</h3>
                <p className="text-sm text-gray-600">Glycemic Index</p>
              </div>
            )}
          </div>

          {/* Dietary Tags */}
          {result.dietaryTags.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex flex-wrap gap-2">
                {result.dietaryTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Macronutrients Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('macros')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wheat className="text-orange-500" size={24} />
                Macronutrients
              </h3>
              {expandedSections.has('macros') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.has('macros') && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {Object.entries(result.macronutrients).map(([key, nutrient]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          {formatNutrientName(key)}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">
                            {nutrient.value}{nutrient.unit}
                          </span>
                          {nutrient.dailyValue !== null && nutrient.dailyValue !== undefined && (
                            <span 
                              className="ml-2 text-sm"
                              style={{ color: getDailyValueColor(nutrient.dailyValue) }}
                            >
                              ({nutrient.dailyValue}% DV)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((nutrient.dailyValue || 0), 100)}%`,
                            backgroundColor: getDailyValueColor(nutrient.dailyValue || 0)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vitamins Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('vitamins')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Apple className="text-green-500" size={24} />
                Vitamins
              </h3>
              {expandedSections.has('vitamins') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.has('vitamins') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.vitamins).map(([key, nutrient]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {formatNutrientName(key)}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">
                          {nutrient.value}{nutrient.unit}
                        </span>
                        {nutrient.dailyValue !== null && nutrient.dailyValue !== undefined && (
                          <span 
                            className="ml-2 text-sm"
                            style={{ color: getDailyValueColor(nutrient.dailyValue) }}
                          >
                            ({nutrient.dailyValue}% DV)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Minerals Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('minerals')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Pill className="text-blue-500" size={24} />
                Minerals
              </h3>
              {expandedSections.has('minerals') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.has('minerals') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.minerals).map(([key, nutrient]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {formatNutrientName(key)}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">
                          {nutrient.value}{nutrient.unit}
                        </span>
                        {nutrient.dailyValue !== null && nutrient.dailyValue !== undefined && (
                          <span 
                            className="ml-2 text-sm"
                            style={{ color: getDailyValueColor(nutrient.dailyValue) }}
                          >
                            ({nutrient.dailyValue}% DV)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other Nutrients Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('other')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Droplet className="text-cyan-500" size={24} />
                Other Nutrients
              </h3>
              {expandedSections.has('other') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.has('other') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.other).map(([key, nutrient]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {formatNutrientName(key)}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">
                          {nutrient.value}{nutrient.unit}
                        </span>
                        {nutrient.dailyValue !== null && nutrient.dailyValue !== undefined && (
                          <span 
                            className="ml-2 text-sm"
                            style={{ color: getDailyValueColor(nutrient.dailyValue) }}
                          >
                            ({nutrient.dailyValue}% DV)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Ingredients */}
            {result.ingredients.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Fish className="text-purple-500" size={24} />
                  Main Ingredients
                </h3>
                <div className="space-y-2">
                  {result.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {result.allergens.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  Potential Allergens
                </h3>
                <div className="space-y-2">
                  {result.allergens.map((allergen, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{allergen}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Health Benefits & Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Health Benefits */}
            {result.healthBenefits.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Heart className="text-green-600" size={24} />
                  Health Benefits
                </h3>
                <ul className="space-y-2">
                  {result.healthBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-green-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Health Concerns */}
            {result.healthConcerns.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={24} />
                  Health Concerns
                </h3>
                <ul className="space-y-2">
                  {result.healthConcerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-indigo-500" size={24} />
                Recommendations
              </h3>
              {expandedSections.has('recommendations') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.has('recommendations') && result.recommendations && (
              <div className="px-6 pb-6 space-y-4">
                {/* Portion Size */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Portion Size</h4>
                  <p className="text-blue-700">{result.recommendations.portion}</p>
                </div>

                {/* Frequency */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Consumption Frequency</h4>
                  <p className="text-purple-700">{result.recommendations.frequency}</p>
                </div>

                {/* Improvements */}
                {result.recommendations.improvements.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">How to Make It Healthier</h4>
                    <ul className="space-y-1">
                      {result.recommendations.improvements.map((improvement, index) => (
                        <li key={index} className="text-orange-700 flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pairings */}
                {result.recommendations.pairings.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Nutritional Pairings</h4>
                    <ul className="space-y-1">
                      {result.recommendations.pairings.map((pairing, index) => (
                        <li key={index} className="text-green-700 flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>{pairing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all"
            >
              Analyze Another Meal
            </button>
            
            <button
              onClick={() => {
                const nutritionText = `
${result.foodName} - Nutritional Analysis
Serving Size: ${result.servingSize}
Calories: ${result.calories}
Health Score: ${result.healthScore}/100

Macronutrients:
${Object.entries(result.macronutrients).map(([key, n]) => 
  `${formatNutrientName(key)}: ${n.value}${n.unit}`).join('\n')}

${result.healthBenefits.length > 0 ? `\nHealth Benefits:\n${result.healthBenefits.join('\n')}` : ''}
${result.recommendations.improvements.length > 0 ? `\nImprovements:\n${result.recommendations.improvements.join('\n')}` : ''}
                `.trim();
                
                navigator.clipboard.writeText(nutritionText);
                alert('Nutrition information copied to clipboard!');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all"
            >
              Copy Nutrition Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}