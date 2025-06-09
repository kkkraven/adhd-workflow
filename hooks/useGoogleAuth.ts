
import { useState, useEffect, useCallback, useRef } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_API_KEY, GOOGLE_CALENDAR_SCOPES } from '../constants';
import { GoogleAuthState } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any; // For Google Identity Services token client
  }
}

const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isSignedIn: false,
    user: null, // For GIS, user info is usually from the ID token, not a GAPI profile object
    error: null,
    isLoading: true,
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const gapiLoadedRef = useRef(false); // To track if GAPI client for Calendar API is loaded
  const gisInitializedRef = useRef(false); // To track if GIS itself is initialized

  // Helper to parse JWT for basic user info (name, email, picture)
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return null;
    }
  };
  
  // 1. Load GAPI client and specific Calendar API
  const initAndLoadGapiClient = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi && window.gapi.load) {
        window.gapi.load('client', () => { // Load the base GAPI client library
          console.log('GAPI base client platform loaded.');
          window.gapi.client.init({ apiKey: GOOGLE_API_KEY }) // Initialize with API key for discovery
            .then(() => {
              console.log('GAPI client initialized (for API calls).');
              return window.gapi.client.load('calendar', 'v3'); // Load Calendar API
            })
            .then(() => {
              console.log('Google Calendar API (v3) loaded via GAPI.');
              gapiLoadedRef.current = true;
              resolve();
            })
            .catch((err: any) => {
              console.error('Error initializing GAPI client or loading Calendar API:', err);
              reject(new Error('Failed to init/load GAPI client for Calendar API.'));
            });
        });
      } else {
        reject(new Error('window.gapi.load not available.'));
      }
    });
  }, []);


  // 2. Initialize Google Identity Services (GIS)
  const initializeGis = useCallback(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      console.log("GIS library found, initializing GIS for Sign-In.");
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (credentialResponse: any) => {
            console.log('GIS Sign-In (ID Token) received:', credentialResponse);
            if (credentialResponse.credential) {
              const idToken = credentialResponse.credential;
              const userInfoFromIdToken = parseJwt(idToken);
              
              setAuthState(prev => ({
                ...prev,
                isSignedIn: true, // Tentatively true, confirmed by access token
                user: userInfoFromIdToken ? { 
                  getName: () => userInfoFromIdToken.name, 
                  getImageUrl: () => userInfoFromIdToken.picture, 
                  getEmail: () => userInfoFromIdToken.email 
                } : null,
                isLoading: true, // Now attempting to get access token
              }));
              requestAccessToken(); // Request access token for API scopes
            } else {
              console.error("GIS Sign-In callback error: No credential in response", credentialResponse);
              setAuthState(prev => ({ ...prev, error: new Error("Google Sign-In failed: No credential."), isLoading: false }));
            }
          },
          error_callback: (error: any) => {
            console.error('GIS ID initialize error_callback:', error);
            setAuthState(prev => ({ ...prev, error: new Error(error?.message || 'Google Sign-In initialization failed.'), isLoading: false }));
          }
        });
        gisInitializedRef.current = true;
      } catch (e) {
        console.error("Error during google.accounts.id.initialize:", e);
        setAuthState(prev => ({...prev, error: new Error("Failed to initialize Google Sign-In service."), isLoading: false}));
      }
    } else {
        console.warn("GIS (google.accounts.id) not available for initialization yet.");
    }
  }, []); // requestAccessToken dependency is indirect

  // Effect to ensure both GAPI and GIS are loaded and initialized
  useEffect(() => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    let gapiPromise = initAndLoadGapiClient().catch(err => {
        setAuthState(prev => ({ ...prev, error: err, isLoading: false }));
        gapiLoadedRef.current = false; // Mark as not loaded on error
    });
    
    // Poll for GIS script then initialize
    let gisAttempts = 0;
    const gisInterval = setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            clearInterval(gisInterval);
            if (!gisInitializedRef.current) {
                initializeGis();
            }
        } else {
            gisAttempts++;
            if (gisAttempts > 20) { // Wait for ~10 seconds
                clearInterval(gisInterval);
                console.error("Timeout waiting for GIS script to load.");
                if(!authState.error) { // Don't overwrite GAPI error if it occurred
                   setAuthState(prev => ({ ...prev, error: new Error("Google Sign-In script (GIS) failed to load."), isLoading: false }));
                }
            }
        }
    }, 500);

    Promise.allSettled([gapiPromise]).then(() => {
        // Check if both are ready after GAPI promise and GIS attempts
        // GIS init is called above, this just ensures loading doesn't hang indefinitely
        if (gapiLoadedRef.current && gisInitializedRef.current) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        } else if (gapiLoadedRef.current && !gisInitializedRef.current && gisAttempts > 20) {
            // GAPI loaded, GIS timed out
             setAuthState(prev => ({ ...prev, isLoading: false, error: prev.error || new Error("Google Sign-In script (GIS) timed out.")}));
        }
        // If GAPI failed, error is already set.
    });

    return () => {
        clearInterval(gisInterval);
    };
  }, [initAndLoadGapiClient, initializeGis, authState.error]); // Added authState.error to avoid re-running if already errored

  const requestAccessToken = useCallback(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.error("GIS token client prerequisites not met.");
      setAuthState(prev => ({ ...prev, error: new Error("Google auth (token component) not ready."), isLoading: false }));
      return;
    }
    if (String(GOOGLE_CLIENT_ID) === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.error("Google Client ID not configured for token request.");
      setAuthState(prev => ({ ...prev, error: new Error("Google Client ID not configured."), isLoading: false }));
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_CALENDAR_SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            console.log('GIS Access Token acquired:', tokenResponse.access_token.substring(0,10) + "...");
            setAccessToken(tokenResponse.access_token);
            if (window.gapi && window.gapi.client) {
              window.gapi.client.setToken({ access_token: tokenResponse.access_token });
            }
            // Confirm sign-in state now that we have the access token
            setAuthState(prev => ({ ...prev, isSignedIn: true, error: null, isLoading: false }));
          } else {
            console.error('GIS Token response error or no access_token:', tokenResponse);
            setAuthState(prev => ({
              ...prev,
              isSignedIn: false, // Access token failed
              error: new Error(tokenResponse?.error_description || tokenResponse?.error || 'Failed to get access token from Google.'),
              isLoading: false,
            }));
            setAccessToken(null);
          }
        },
        error_callback: (error: any) => { // This is for errors during the token client flow
          console.error('GIS Token client error_callback (requestAccessToken):', error);
          setAuthState(prev => ({
            ...prev,
            isSignedIn: false,
            error: new Error(error?.message || error?.type || 'Google token request failed.'),
            isLoading: false,
          }));
          setAccessToken(null);
        },
      });
      tokenClient.requestAccessToken({ prompt: '' }); // prompt: 'consent' for explicit user consent if needed, '' or 'none' for silent if possible
    } catch (e) {
      console.error("Error initializing or using GIS token client:", e);
      setAuthState(prev => ({ ...prev, isLoading: false, error: new Error("Failed to setup Google token request.") }));
    }
  }, []);

  const signIn = useCallback(() => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    if (!gisInitializedRef.current) {
        console.error("GIS not initialized. Cannot sign in.");
        setAuthState(prev => ({ ...prev, isLoading: false, error: new Error("Google Sign-In service not ready.") }));
        return;
    }
    // For GIS, signIn primarily means getting an access token for scopes.
    // The ID token (demographic sign-in) is often handled by google.accounts.id.prompt() or a rendered button.
    // If we call requestAccessToken directly, it should trigger consent if needed.
    requestAccessToken();
  }, [requestAccessToken]);

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {
        console.log('GIS Access token revoked.');
      });
    }
    window.google?.accounts?.id?.disableAutoSelect();
    
    setAuthState({
      isSignedIn: false,
      user: null,
      error: null,
      isLoading: false,
    });
    setAccessToken(null);
    if (window.gapi && window.gapi.client) {
      window.gapi.client.setToken(null);
    }
    console.log("User signed out from app, GIS session cleared.");
  }, [accessToken]);

  return { ...authState, accessToken, signIn, signOut, isLoading: authState.isLoading };
};

export default useGoogleAuth;
