// src/services/notificationService.ts

import * as Notifications from "expo-notifications";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

// Pedir permiso de notificaciones
export const registerForPushNotifications = async (userId: string): Promise<void> => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permiso de notificaciones denegado");
  }
};

// Enviar notificación local
export const sendLocalNotification = async (
  title: string,
  body: string
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true
    },
    trigger: null
  });
};

// Calcular distancia entre dos coordenadas en km
export const getDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};