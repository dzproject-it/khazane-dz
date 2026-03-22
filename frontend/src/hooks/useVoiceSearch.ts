import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import type { Locale } from '../i18n/translations';

const speechLocaleMap: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA',
};

export type VoiceError = 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'unknown';

function getSpeechRecognitionCtor(): (new () => any) | null {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function useVoiceSearch(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<VoiceError | null>(null);
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const { locale } = useI18n();

  // Keep ref in sync so toggle never reads stale state
  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    // Stop any running instance first
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    setError(null);
    const recognition = new Ctor();
    recognition.lang = speechLocaleMap[locale] || 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      const map: Record<string, VoiceError> = {
        'not-allowed': 'not-allowed',
        'service-not-allowed': 'not-allowed',
        'no-speech': 'no-speech',
        'network': 'network',
        'aborted': 'aborted',
      };
      setError(map[event.error] || 'unknown');
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('unknown');
      recognitionRef.current = null;
    }
  }, [locale, onResult, stop]);

  const toggle = useCallback(() => {
    // Use ref to avoid stale closure on listening
    if (listeningRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* unmount */ }
    };
  }, []);

  return { listening, supported, error, toggle, start, stop };
}
