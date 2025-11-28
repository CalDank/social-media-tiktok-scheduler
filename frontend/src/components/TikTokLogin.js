import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

function TikTokLogin({ onLoginSuccess }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check TikTok connection status
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const status = await authAPI.getTikTokStatus('primary');
      if (status.connected) {
        onLoginSuccess?.();
      }
    } catch (error) {
      console.log('Not connected yet');
    }
  };

  const handleLogin = async () => {
    try {
      setConnecting(true);
      setError(null);

      // For testing: Auto-login with demo account (TikTok connection optional)
      let token = localStorage.getItem('authToken');
      if (!token) {
        try {
          // Try login first
          const loginResult = await authAPI.login('demo@example.com', 'demo123');
          token = loginResult.token;
        } catch (loginError) {
          // If login fails, try registering
          try {
            const registerResult = await authAPI.register('demo@example.com', 'demo123');
            token = registerResult.token;
          } catch (registerError) {
            // If both fail, show error but still allow test mode
            console.log('Auto-login failed, but allowing test mode access');
          }
        }
      }

      // For testing: Skip TikTok connection requirement
      // Just simulate a quick connection check and proceed
      console.log('Test mode: Skipping TikTok connection requirement');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConnecting(false);
      
      // Notify parent component - allow access without TikTok
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Even on error, allow test mode access
      setError(null); // Don't show error for testing
      setConnecting(false);
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 
        'radial-gradient(circle at 20% 30%, rgba(0, 201, 255, 0.15) 0, transparent 50%), ' +
        'radial-gradient(circle at 80% 70%, rgba(255, 103, 224, 0.12) 0, transparent 50%), ' +
        'radial-gradient(circle at top left, #101320 0, #05070a 48%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(11, 16, 24, 0.95) 0%, rgba(21, 25, 34, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '28px',
        padding: window.innerWidth <= 600 ? '32px 24px' : '48px 56px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Logo/Brand */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #00c9ff 0%, #ff67e0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: '#020617',
          boxShadow: '0 0 30px rgba(0, 201, 255, 0.4)'
        }}>
          <i className="fa-solid fa-bolt"></i>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 12px',
          background: 'linear-gradient(135deg, #f5f7fb 0%, rgba(255, 255, 255, 0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Videotto Scheduler
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--text-soft)',
          margin: '0 0 40px',
          lineHeight: '1.6'
        }}>
          Start testing the scheduler! TikTok connection is optional for testing.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 92, 92, 0.1)',
            border: '1px solid rgba(255, 92, 92, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#ff5c5c',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={connecting}
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#020617',
            background: connecting 
              ? 'linear-gradient(135deg, rgba(0, 201, 255, 0.5) 0%, rgba(255, 103, 224, 0.5) 100%)'
              : 'linear-gradient(135deg, #00c9ff 0%, #ff67e0 100%)',
            border: 'none',
            borderRadius: '14px',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: connecting 
              ? 'none' 
              : '0 4px 20px rgba(0, 201, 255, 0.3)',
            transition: 'all 0.3s ease',
            opacity: connecting ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!connecting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 24px rgba(0, 201, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!connecting) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(0, 201, 255, 0.3)';
            }
          }}
        >
          {connecting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Connecting to TikTok...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-rocket" style={{ fontSize: '20px' }}></i>
              <span>Start Testing</span>
            </>
          )}
        </button>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-soft)',
          margin: '32px 0 0',
          lineHeight: '1.5'
        }}>
          Test mode: TikTok integration is disabled. You can test draft posting and calendar features.
        </p>
      </div>
    </div>
  );
}

export default TikTokLogin;

