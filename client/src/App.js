import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const App = () => {
  // Debug all relevant environment variables
  console.log('%c Google OAuth Debug Info ', 'background: #333; color: #fff');
  console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
  console.log('Environment:', process.env.NODE_ENV);
  
  // Add error handler for Google OAuth
  window.addEventListener('error', (event) => {
    if (event.message.includes('google')) {
      console.error('Google OAuth Error:', event);
    }
  });
  const [user, setUser] = useState(null);
// debugger;
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) { // This is a common pattern to persist login state across page refreshes
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:5001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/google', {
        token: credentialResponse.credential
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Google Auth Lite</h1>
      
      {!user ? (
        <div style={styles.loginContainer}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'NOT_FOUND'}>
            {/* Debug output */}
            <div style={{display: 'none'}}>
              Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'NOT_FOUND'}
            </div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>
      ) : (
        <div style={styles.profileContainer}>
          <img src={user.picture} alt="profile" style={styles.profilePic} />
          <h2>Welcome, {user.name}!</h2>
          <p>{user.email}</p>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5'
  },
  title: {
    color: '#333',
    marginBottom: '30px'
  },
  loginContainer: {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  profileContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  profilePic: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    marginBottom: '15px'
  },
  logoutButton: {
    marginTop: '15px',
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

// This line tells JavaScript, 
// “Hey, this thing called App is the main thing I want to share from this file (App.js). 
//Other files can grab it and use it.”
export default App;
