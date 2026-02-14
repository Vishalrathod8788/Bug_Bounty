import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CompanyAccount from './components/CompanyAccount';
import BugDetail from './components/BugDetail';

// API Base URL - Backend address
export const API_URL = 'http://localhost:5544/api';

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // if token is invalid or expired, logout the user
        logout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    }
  };

  // after login, get token and user data, then save in state
  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    navigate('/');
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} logout={logout} />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<Dashboard user={user} token={token} />}
          />

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/company"
            element={
              user?.role === 'company' ? (
                <CompanyAccount
                  user={user}
                  token={token}
                  refreshUser={fetchUserProfile}
                />
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                  <p className="text-gray-600 mt-2">Only companies can access this page</p>
                </div>
              )
            }
          />

          <Route
            path="/bug/:bugId"
            element={
              <BugDetail
                user={user}
                token={token}
                refreshUser={fetchUserProfile}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;