import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Utensils, KeyRound, Settings } from 'lucide-react';

const loadingSteps = [
  "Consulting the AI Chef...",
  "Inventing a unique recipe...",
  "Calculating perfect macros...",
  "Visualizing the final dish...",
  "Plating your masterpiece..."
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyErrorGlow, setApiKeyErrorGlow] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowApiKeyModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          if (prev < loadingSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 1000); 
    } else {
      setLoadingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generateRecipe = async (overrideQuery) => {
    const activeQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!activeQuery.trim()) return;
    
    if (!userApiKey.trim()) {
      setApiKeyErrorGlow(true);
      setShowApiKeyModal(true);
      setTimeout(() => setApiKeyErrorGlow(false), 3000);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const prompt = `
        You are a Michelin-star AI Chef. Generate a creative, delicious recipe based on this input: "${activeQuery}".
        You must return ONLY a raw JSON object (no markdown formatting, no backticks, just the JSON string).
        
        The JSON must perfectly match this schema:
        {
          "title": "A creative, appetizing name for the dish",
          "imagePrompt": "A highly descriptive, photorealistic prompt for an AI image generator to create a stunning, mouth-watering cinematic photo of this exact dish on a beautiful plate.",
          "ingredients": ["1 cup of X", "2 tbsp of Y"],
          "steps": ["First, do X.", "Then, do Y."],
          "calories": 450,
          "protein": 25,
          "carbs": 30,
          "fat": 15,
          "suggestions": [
            {"title": "Alternative Dish 1"},
            {"title": "Alternative Dish 2"},
            {"title": "Alternative Dish 3"}
          ]
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${userApiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || 'Failed to fetch from Gemini API';
        throw new Error(`API Error: ${errorMsg}`);
      }
      
      // Extract the text response
      let rawText = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown code blocks if the AI accidentally includes them
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const recipeData = JSON.parse(rawText);

      // Generate the dynamic AI image URL using Pollinations.ai
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(recipeData.imagePrompt + ", highly detailed food photography, 8k resolution, cinematic lighting, masterpiece")}?width=800&height=600&nologo=true`;

      const recipePayload = {
        title: recipeData.title,
        image: imageUrl,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        calories: recipeData.calories,
        protein: recipeData.protein,
        carbs: recipeData.carbs,
        fat: recipeData.fat,
        suggestions: recipeData.suggestions,
        query: activeQuery
      };

      // Ensure the loader runs long enough to see the animation, but Gemini might take 2-4 seconds anyway
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/recipe', { state: { recipe: recipePayload } });
      
    } catch (err) {
      console.error("Full error details:", err);
      setError(err.message.includes('API Error') ? err.message : 'AI generation failed. Please check console for details or verify your API key.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.autoGenerate) {
      const autoQuery = location.state.autoGenerate;
      setQuery(autoQuery);
      navigate('/', { replace: true, state: {} });
      generateRecipe(autoQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateRecipe();
    }
  };

  return (
    <div className="home-page">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      
      <div className="top-nav" ref={settingsRef}>
        <button 
          className={`settings-btn ${apiKeyErrorGlow ? 'glow-red' : ''}`}
          onClick={() => setShowApiKeyModal(!showApiKeyModal)}
          title="API Key Settings"
        >
          <Settings size={24} />
        </button>
        {showApiKeyModal && (
          <div className="api-modal">
            <h3><KeyRound size={20} /> API Settings</h3>
            <input 
              type="password" 
              className={`api-input ${apiKeyErrorGlow ? 'error-placeholder' : ''}`}
              placeholder={apiKeyErrorGlow ? "Please enter your API key first!" : "Paste Gemini API key..."}
              value={userApiKey}
              onChange={(e) => {
                setUserApiKey(e.target.value);
                localStorage.setItem('gemini_api_key', e.target.value);
                if (e.target.value.trim()) setApiKeyErrorGlow(false);
              }}
            />
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="api-link">
              Don't have one? Get it here
            </a>
          </div>
        )}
      </div>
      


      {isLoading && (
        <div className="loading-overlay">
          <div className="loader-container">
            <div className="cooking-animation">
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
              <Utensils className="loader-icon" size={48} strokeWidth={1.5} />
            </div>
            <p className="loading-text">{loadingSteps[loadingStepIndex]}</p>
          </div>
        </div>
      )}

      <div className="home-content">
        <div className="header">
          <h1>What's in your fridge?</h1>
          <p>Enter ingredients or a dish name and let AI craft your perfect meal.</p>
        </div>
        
        <div className="input-group">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. Chicken breast, broccoli, garlic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          <button 
            className="generate-btn"
            onClick={generateRecipe}
            disabled={isLoading || !query.trim()}
          >
            <Sparkles size={20} />
            Generate Recipe
          </button>
          


          {error && <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
