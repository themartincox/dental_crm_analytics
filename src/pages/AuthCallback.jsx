import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'
; // your singleton client

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Must run in the browser: swaps ?code for a session and sets auth cookies/localStorage
    supabase?.auth?.exchangeCodeForSession(window.location?.href)?.then(({ error }) => {
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?auth=error', { replace: true });
        } else {
          // You're signed in now — head to your app navigate('/dashboard', { replace: true });
        }
      });
  }, [navigate]);

  return null; // or a tiny spinner
}