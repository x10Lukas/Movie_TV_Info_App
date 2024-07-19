import React, { useState, useEffect } from 'react';
import { Search, X, Cog, TvMinimalPlay } from 'lucide-react';
import './App.css';

const API_KEY = '48efb99c';

const simulatedDB = {
  users: {}
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const fetchResults = async (type) => {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=${type}`);
    const data = await response.json();
    if (data.Response === 'True' && data.Search && data.Search.length > 0) {
      return data.Search;
    }
    return [];
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setError('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const movieResults = await fetchResults('movie');
      const seriesResults = await fetchResults('series');
      
      const combinedResults = [...movieResults, ...seriesResults];
      
      if (combinedResults.length > 0) {
        setSearchResults(combinedResults);
      } else {
        setError('Keine Ergebnisse gefunden. Bitte überprüfen Sie Ihre Suchanfrage.');
      }
    } catch (error) {
      console.error('Fehler bei der API-Anfrage:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      if (username in simulatedDB.users) {
        if (simulatedDB.users[username].password === password) {
          loginUser(username);
        } else {
          setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
        }
      } else {
        simulatedDB.users[username] = { password, createdAt: new Date() };
        loginUser(username);
      }
    } else {
      setError('Bitte geben Sie Benutzername und Passwort ein.');
    }
  };

  const loginUser = (username) => {
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
    setCurrentUser({ username, createdAt: simulatedDB.users[username].createdAt });
    localStorage.setItem('currentUser', JSON.stringify({ username, createdAt: simulatedDB.users[username].createdAt }));
    setUsername('');
    setPassword('');
    setError(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const addToWatchlist = (item) => {
    if (!watchlist.some(watchlistItem => watchlistItem.imdbID === item.imdbID)) {
      setWatchlist([...watchlist, item]);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  const removeFromWatchlist = (imdbID) => {
    setWatchlist(watchlist.filter(item => item.imdbID !== imdbID));
  };

  return (
    <div className={`ios-app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="status-bar"></div>
      <header>
        <h1>
          {activeTab === 'search' ? 'Filme & TV Serien' :
          activeTab === 'watchlist' ? 'Watchlist' :
          'Einstellungen'}
        </h1>
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
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((result) => (
                        <div key={result.imdbID} className="movie-card">
                          <div className='movie-text'>
                            <h3>{result.Title}</h3>
                            <h4>{result.Year}</h4>
                          </div>
                          <img className='image' src={result.Poster !== 'N/A' ? result.Poster : 'placeholder-image-url'} alt={result.Title} />
                          <button className="movie-button" onClick={() => addToWatchlist(result)}>+ Watchlist</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {activeTab === 'watchlist' && (
            <div className="watchlist">
              {watchlist.map((item) => (
                <div key={item.imdbID} className="movie-card">
                  <div className='movie-text'>
                    <h3>{item.Title}</h3>
                    <h4>{item.Year}</h4>
                  </div>
                  <img className='image' src={item.Poster !== 'N/A' ? item.Poster : 'placeholder-image-url'} alt={item.Title} />
                  <button className='movie-remove-button' onClick={() => removeFromWatchlist(item.imdbID)}>Entfernen</button>
                </div>
              ))}
              {watchlist.length === 0 && <p>Ihre Watchlist ist leer.</p>}
            </div>
          )}
          {activeTab === 'settings' && (
            <ul className="settings-list">
              <li>
                <p className='account-text'>
                  {isLoggedIn ? `Username: ${currentUser.username}` : 'Account'}
                </p>
                <div className="account-section">
                  {isLoggedIn ? (
                    <div>
                      <button className="ios-button" onClick={handleLogout}>Abmelden</button>
                    </div>
                  ) : (
                    <div>
                      <button className="ios-button" onClick={() => setIsLoginDialogOpen(true)}>Anmelden</button>
                    </div>
                  )}
                </div>
              </li>
            </ul>
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
          className={activeTab === 'watchlist' ? 'active' : ''}
          onClick={() => setActiveTab('watchlist')}
        >
          <TvMinimalPlay size={24} />
          Watchlist
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          <Cog size={24} />
          Einstellungen
        </button>
      </div>

      {isLoginDialogOpen && (
        <div className="login-dialog-overlay">
          <div className="login-dialog">
            <h2>Anmelden / Registrieren</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="username">Benutzername</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Passwort</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="button-group">
                <button type="submit" className="ios-button">Anmelden / Registrieren</button>
                <button type="button" className="ios-button secondary" onClick={() => setIsLoginDialogOpen(false)}>Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          Erfolgreich zur Watchlist hinzugefügt
        </div>
      )}
    </div>
  );
};

export default App;