// src/hooks/useShareCard.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook para capturar el componente ShareCard como imagen y compartirla
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback } from 'react';
import { Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';

export function useShareCard() {
  const cardRef = useRef<ViewShot>(null);

  const shareCard = useCallback(async (options?: {
    message?: string;
    title?:   string;
  }) => {
    try {
      if (!cardRef.current) return;

      // Capturar la vista como imagen PNG
      const uri = await (cardRef.current as any).capture();

      const message = options?.message
        ?? '⚽ ¡Mira mi predicción en GOLZI — Mundial 2026!\n¿Puedes superarme? 👉 golzi.app';

      if (Platform.OS === 'web') {
        // En web: descargar la imagen
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'golzi-prediccion.png';
        link.click();
        return;
      }

      // En móvil: compartir imagen + texto
      await Share.share({
        url:     uri,      // iOS
        message: Platform.OS === 'android' ? `${message}\n${uri}` : message,
        title:   options?.title ?? 'GOLZI — Mi predicción',
      });

    } catch (error) {
      console.error('Error compartiendo tarjeta:', error);
    }
  }, []);

  return { cardRef, shareCard };
}