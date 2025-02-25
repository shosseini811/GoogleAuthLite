import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const App = () => {
  // Debug all relevant environment variables
  // console.log('%c Google OAuth Debug Info ', 'background: #333; color: #fff');
  // console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
  console.log('Environment:', process.env.NODE_ENV); // 'Environment the App is running in'
  
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
      console.log("Fetching user profile with token:", token);
      const response = await axios.get('http://localhost:5001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Profile response:", response.data);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("credentialResponse", credentialResponse);
      const response = await axios.post('http://localhost:5001/api/auth/google', {
        token: credentialResponse.credential
      });
      console.log("response", response.data);
      const { token, user } = response.data;
      console.log("User data:", user);
      console.log("Profile picture URL:", user.picture);
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
              onSuccess={handleGoogleSuccess} // After successful authentication, Google sends back an ID token (or other credentials) as part of the OAuth response.
              onError={() => console.log('Login Failed')}
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>
      ) : (
        <div style={styles.profileContainer}>
          {user.picture ? (
            <img 
              src={user.picture} 
              alt="profile" 
              style={styles.profilePic}
              onError={(e) => {
                console.error("Error loading profile image:", e);
                e.target.onerror = null;
                e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=random";
              }}
            />
          ) : (
            <div style={{...styles.profilePic, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0e0e0'}}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
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
    marginBottom: '15px',
    objectFit: 'cover',
    border: '2px solid #eaeaea'
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
