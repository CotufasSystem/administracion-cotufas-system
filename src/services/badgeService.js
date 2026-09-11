import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Dynamically draws a badge count onto the favicon so it's visible in browser tabs
 * and on bookmark / mobile browser icons even if App Badging API is restricted.
 */
const updateFaviconWithBadge = (count) => {
  if (typeof document === 'undefined') return;
  try {
    const favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) return;

    if (count <= 0) {
      favicon.href = '/favicon.ico';
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/favicon.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original icon
      ctx.drawImage(img, 0, 0, 64, 64);

      // Draw badge circle (red)
      const text = count > 99 ? '99+' : String(count);
      const radius = 18;
      const x = 46;
      const y = 18;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);

      favicon.href = canvas.toDataURL('image/png');
    };
  } catch (e) {
    console.log('[Badge] Favicon badge error:', e);
  }
};

/**
 * Set the notification badge count on the app icon (homescreen/launcher).
 * Works on Mobile (iOS / Android) and Web PWA / Desktop (Chrome, Edge, Safari 16.4+).
 * 
 * @param {number} count - Total unread/pending notifications
 */
export const updateAppBadge = async (count = 0) => {
  const numericCount = Math.max(0, parseInt(count, 10) || 0);

  // 1. Web / PWA Badging API & Favicon Badge
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    // A) Try Native App Badging API
    try {
      if (numericCount > 0) {
        if ('setAppBadge' in navigator) {
          await navigator.setAppBadge(numericCount);
        }
      } else {
        if ('clearAppBadge' in navigator) {
          await navigator.clearAppBadge();
        }
      }
    } catch (err) {
      console.log('[Badge] navigator.setAppBadge error/not permitted:', err?.message || err);
    }

    // B) Update dynamic badge directly onto favicon canvas
    updateFaviconWithBadge(numericCount);

    // C) Also update document title on web (e.g. "(3) Administración Cotufas System")
    try {
      if (typeof document !== 'undefined') {
        const baseTitle = 'Administración Cotufas System';
        if (numericCount > 0) {
          document.title = `(${numericCount}) ${baseTitle}`;
        } else {
          document.title = baseTitle;
        }
      }
    } catch (e) {}
    return;
  }

  // 2. Mobile (iOS / Android via expo-notifications)
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    await Notifications.setBadgeCountAsync(numericCount);
  } catch (err) {
    console.log('[Badge] Error setting badge count:', err?.message || err);
  }
};

export const clearAppBadge = async () => {
  await updateAppBadge(0);
};
