// src/hooks/useShareCard.ts
import { useRef, useCallback } from 'react';
import { Share, Platform } from 'react-native';

export function useShareCard() {
  const cardRef = useRef<any>(null);

  const shareCard = useCallback(async (options?: {
    message?: string;
    title?:   string;
  }) => {
    const message = options?.message
      ?? '⚽ ¡Mira mi predicción en GOLZI — Mundial 2026!\n¿Puedes superarme? 👉 golzi.app';

    try {
      // Intentar capturar imagen si view-shot está disponible
      if (cardRef.current && typeof cardRef.current.capture === 'function') {
        const uri = await cardRef.current.capture();
        if (Platform.OS === 'web') {
          const link = document.createElement('a');
          link.href = uri;
          link.download = 'golzi-prediccion.png';
          link.click();
          return;
        }
        await Share.share({
          url:     uri,
          message: Platform.OS === 'android' ? `${message}\n${uri}` : message,
          title:   options?.title ?? 'GOLZI — Mi predicción',
        });
        return;
      }
    } catch {}

    // Fallback: compartir solo texto (funciona en todos los builds)
    try {
      await Share.share({
        message,
        title: options?.title ?? 'GOLZI — Mi predicción',
      });
    } catch (e) {
      console.error('Error compartiendo:', e);
    }
  }, []);

  return { cardRef, shareCard };
}