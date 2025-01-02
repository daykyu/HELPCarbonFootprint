import React, { useEffect } from 'react';

const FacebookLogin = () => {
  useEffect(() => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'your_app_id',
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
    };

    // Load Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Check URL parameters for Facebook code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('facebook_code');
    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const handleFacebookLogin = () => {
    const redirectUri = 'http://localhost:5000/auth/facebook/callback';
    const scope = 'email,public_profile';
    
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=your_app_id` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scope}`;
  };

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch('http://localhost:5000/auth/facebook/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (data.access_token) {
        // Save token and fetch user profile
        localStorage.setItem('fb_access_token', data.access_token);
        await fetchUserProfile(data.access_token);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:5000/auth/facebook/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const profile = await response.json();
      console.log('Facebook Profile:', profile);
      // Handle successful login (e.g., update state, redirect, etc.)
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <button onClick={handleFacebookLogin}>
      Login with Facebook
    </button>
  );
};

export default FacebookLogin;
