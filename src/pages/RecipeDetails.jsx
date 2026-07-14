import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat, Flame, Apple, ArrowRight } from 'lucide-react';

export default function RecipeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // If no state exists (user navigated directly to /recipe), send back to home
    if (!location.state || !location.state.recipe) {
      navigate('/');
    } else {
      setRecipe(location.state.recipe);
    }
  }, [location, navigate]);

  if (!recipe) return null;

  return (
    <div className="recipe-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        Back to Generator
      </button>

      <div className="recipe-header">
        <div className="recipe-title-area">
          <h1 className="recipe-title">{recipe.title}</h1>
        </div>
        <div className="hero-image-wrapper">
          {/* Dynamic Loading Animation for AI Image Generation */}
          {!imageLoaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', zIndex: 5 }}>
              <div className="cooking-animation" style={{ transform: 'scale(0.8)' }}>
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <ChefHat className="loader-icon" size={40} strokeWidth={1.5} />
              </div>
              <p style={{ color: 'var(--color-primary)', marginTop: '1rem', fontWeight: 500, letterSpacing: '1px', animation: 'pulseText 1.5s ease-in-out infinite' }}>
                Generating Masterpiece...
              </p>
            </div>
          )}
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' }}
          />
        </div>
      </div>

      <div className="recipe-grid">
        {/* LEFT COLUMN: Ingredients & Instructions */}
        <div className="recipe-main-content">
          <div className="info-card">
            <h2 className="section-title">
              <Apple size={22} />
              Ingredients
            </h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-card">
            <h2 className="section-title">
              <ChefHat size={22} />
              Preparation Process
            </h2>
            <ol className="instructions-list">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* RIGHT COLUMN: Nutrition & Suggestions */}
        <div className="recipe-sidebar">
          <div className="info-card">
            <h2 className="section-title">
              <Flame size={22} />
              Nutritional Profile
            </h2>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-value">{recipe.calories}</span>
                <span className="nutrition-label">Calories</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{recipe.protein}g</span>
                <span className="nutrition-label">Protein</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{recipe.carbs}g</span>
                <span className="nutrition-label">Carbs</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{recipe.fat}g</span>
                <span className="nutrition-label">Fat</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2 className="section-title">What Else Can I Make?</h2>
            <p style={{ color: 'var(--color-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Since you searched for <strong>{recipe.query}</strong>, here are some other AI-recommended dishes:
            </p>
            <div className="suggestion-list">
              {recipe.suggestions && recipe.suggestions.map((sug, index) => (
                <div key={index} className="suggestion-card" onClick={() => navigate('/', { state: { autoGenerate: sug.title } })}>
                  <Flame className="suggestion-icon" size={20} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{sug.title}</span>
                  <ArrowRight size={16} style={{ color: 'var(--color-text)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
