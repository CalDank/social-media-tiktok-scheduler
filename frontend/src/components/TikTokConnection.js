import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

function TikTokConnection({ account = 'primary', onConnectionChange }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionInfo, setConnectionInfo] = useState(null);

  // Check connection status on mount and when account changes
  useEffect(() => {
    checkConnectionStatus();
  }, [account]);

  // Notify parent when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connected);
    }
  }, [connected, onConnectionChange]);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setConnected(false);
        setLoading(false);
        return;
      }

      const status = await authAPI.getTikTokStatus(account);
      setConnected(status.connected || false);
      setConnectionInfo(status);
    } catch (error) {
      console.error('Error checking TikTok connection:', error);
      setError('Failed to check connection status');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to your account first');
        setConnecting(false);
        return;
      }

      // Get TikTok OAuth URL and redirect
      const { authUrl } = await authAPI.getTikTokAuthUrl(account);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting TikTok:', error);
      setError(error.message || 'Failed to connect TikTok account');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your TikTok account? You won\'t be able to post until you reconnect.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authAPI.disconnectTikTok(account);
      setConnected(false);
      setConnectionInfo(null);
      if (onConnectionChange) {
        onConnectionChange(false);
      }
      alert('TikTok account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting TikTok:', error);
      setError(error.message || 'Failed to disconnect TikTok account');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function
  const refresh = () => {
    checkConnectionStatus();
  };

  if (loading && !connectionInfo) {
    return (
      <div style={{ 
        padding: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        color: 'var(--text-soft)',
        fontSize: '13px'
      }}>
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Checking connection...</span>
      </div>
    );
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    return (
      <div style={{ 
        padding: '12px',
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--text-soft)'
      }}>
        <i className="fa-solid fa-info-circle" style={{ marginRight: '8px' }}></i>
        Please log in to connect your TikTok account
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      border: connected 
        ? '1px solid rgba(0, 201, 255, 0.3)' 
        : '1px solid rgba(255, 255, 255, 0.1)',
      background: connected 
        ? 'rgba(0, 201, 255, 0.05)' 
        : 'rgba(255, 255, 255, 0.02)',
      marginBottom: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i 
            className="fa-brands fa-tiktok" 
            style={{ 
              fontSize: '20px',
              color: connected ? '#00C9FF' : 'var(--text-soft)'
            }}
          ></i>
          <div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '14px',
              color: 'var(--text)'
            }}>
              TikTok Account
            </div>
            <div style={{ 
              fontSize: '12px',
              color: 'var(--text-soft)',
              marginTop: '2px'
            }}>
              {account === 'primary' ? 'Main account' : account}
            </div>
          </div>
        </div>
        {connected && (
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            background: 'rgba(0, 201, 255, 0.2)',
            color: '#00C9FF',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Connected
          </span>
        )}
      </div>

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '12px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fa-solid fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {connected && connectionInfo && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-soft)',
          marginBottom: '12px',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Connected:</strong> {new Date(connectionInfo.connectedAt).toLocaleDateString()}
          </div>
          {connectionInfo.expiresAt && (
            <div>
              <strong>Token expires:</strong> {new Date(connectionInfo.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: connecting ? 'rgba(0, 201, 255, 0.5)' : '#00C9FF',
              color: 'white',
              fontWeight: '600',
              fontSize: '13px',
              cursor: connecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!connecting) {
                e.target.style.background = '#00b8e6';
              }
            }}
            onMouseLeave={(e) => {
              if (!connecting) {
                e.target.style.background = '#00C9FF';
              }
            }}
          >
            {connecting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <i className="fa-brands fa-tiktok"></i>
                <span>Connect TikTok Account</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'transparent',
              color: '#ef4444',
              fontWeight: '600',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <i className="fa-solid fa-unlink"></i>
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {connected && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          fontSize: '12px',
          color: '#22c55e'
        }}>
          <i className="fa-solid fa-check-circle" style={{ marginRight: '6px' }}></i>
          Your TikTok account is connected! You can now schedule and post videos.
        </div>
      )}
    </div>
  );
}

export default TikTokConnection;
