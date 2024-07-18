import React, { useState, useEffect } from 'react';
import { Search, X, Cog } from 'lucide-react';
import './App.css';

const API_KEY = '48efb99c';

const simulatedDB = {
  users: {}
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setError('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${searchTerm}`);
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      if (username in simulatedDB.users) {
        // Überprüfen des bestehenden Benutzers
        if (simulatedDB.users[username].password === password) {
          loginUser(username);
        } else {
          setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
        }
      } else {
        // Neuen Benutzer registrieren
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

  return (
    <div className={`ios-app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="status-bar"></div>
      <header>
        <h1>{activeTab === 'search' ? 'Filme & TV Serien' : 'Einstellungen'}</h1>
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
                    <div className="movie-info-display">
                      <h2 className="movie-name">{searchResults.Title}</h2>
                      <div className="movie-image-container">
                        <img src={searchResults.Poster} alt={searchResults.Title} className="movie-image" />
                      </div>
                      <div className="movie-details">
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
    </div>
  );
};

export default App;