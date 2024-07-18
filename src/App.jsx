import React, { useState } from 'react';
import { Search, X, Cog } from 'lucide-react';
import './App.css';

const API_KEY = '48efb99c';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setError('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&t=${searchTerm}`);
      const data = await response.json();

      if (data.Response === 'True') {
        setSearchResults(data);
      } else {
        setError('Keine Ergebnisse gefunden.');
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults(null);
    setError(null);
  };

  const renderInfoItem = (label, value) => {
    if (value && value !== 'N/A') {
      return (
        <p className="description">
          <strong>{label}:</strong> {value}
        </p>
      );
    }
    return null;
  };

  return (
    <div className={`ios-app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="status-bar"></div>
      <header>
        <h1>Filme & TV Serien</h1>
      </header>
      <main>
        <div className="ios-content">
          {activeTab === 'search' && (
            <>
              <div className="search-box">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Film oder Serie suchen"
                />
                {searchTerm && (
                  <button className="clear-button" onClick={handleClear}>
                    <X size={20} />
                  </button>
                )}
              </div>
              <button className="ios-button" onClick={handleSearch}>
                Suchen
              </button>
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-animation"></div>
                </div>
              ) : (
                <>
                  {error && <p className="error-message">{error}</p>}
                  {searchResults && (
                    <div className="food-info-display">
                      <h2 className="food-name">{searchResults.Title}</h2>
                      <div className="food-image-container">
                        <img src={searchResults.Poster} alt={searchResults.Title} className="food-image" />
                      </div>
                      <div className="food-details">
                        {renderInfoItem('Jahr', searchResults.Year)}
                        {renderInfoItem('Erscheinungsdatum', searchResults.Released)}
                        {renderInfoItem('Laufzeit', searchResults.Runtime)}
                        {renderInfoItem('Genre', searchResults.Genre)}
                        {renderInfoItem('Regisseur', searchResults.Director)}
                        {renderInfoItem('Drehbuchautor', searchResults.Writer)}
                        {renderInfoItem('Schauspieler', searchResults.Actors)}
                        {renderInfoItem('Handlung', searchResults.Plot)}
                        {renderInfoItem('Land', searchResults.Country)}
                        {renderInfoItem('Sprache', searchResults.Language)}
                        {renderInfoItem('IMDb-Bewertung', `${searchResults.imdbRating}/10`)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {activeTab === 'settings' && (
            <ul className="settings-list">
              <li>
                Dark Mode
                <label className="ios-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <span className="slider"></span>
                </label>
              </li>
            </ul>
          )}
        </div>
      </main>
      <div className="tab-bar">
        <button
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          <Search size={24} />
          Suche
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          <Cog size={24} />
          Einstellungen
        </button>
      </div>
    </div>
  );
};

export default App;