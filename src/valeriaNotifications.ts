// ============================================================================
// Valeria+ · Recordatorios en pantalla de bloqueo (V4.0)
// Notificaciones locales con expo-notifications, sin servidor:
//   · Un recordatorio cada hora dentro de la franja 09:00–20:00 (repetición diaria).
//   · Mensajes lúdicos rotatorios con la osita Valeria para animar a la sesión.
//   · Canal Android de máxima prioridad y visibilidad pública (pantalla de bloqueo).
//
// API:
//   initNotifications()            → registrar handler + canal (llamar al arrancar).
//   remindersEnabled()             → lee la preferencia guardada.
//   enableHourlyReminders()        → pide permiso y programa la franja completa.
//   disableReminders()             → cancela todo y guarda la preferencia.
// ============================================================================
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { STORAGE_KEYS } from './valeriaTheme';

const CHANNEL_ID = 'valeria-recordatorios';
const START_HOUR = 9;   // primera notificación del día
const END_HOUR = 20;    // última notificación del día

// Mensajes rotatorios: cercanos, breves y con llamada a la acción de juego.
const MESSAGES: { title: string; body: string }[] = [
  { title: '🧸 ¡La osita Valeria te espera!', body: '5 minutitos de juego valen oro. ¿Hacemos una sesión rápida?' },
  { title: '🔥 ¡No pierdas tu racha!', body: 'Una sesión al día mantiene viva la llama. ¡Vamos a jugar!' },
  { title: '👂 Momento de escuchar', body: '¿Probamos el juego de los sonidos? Solo toma unos minutos.' },
  { title: '⭐ Hora de ganar estrellas', body: 'Cada ejercicio suma XP. ¡A por las 3 estrellas!' },
  { title: '🐸 ¡A saltar y aprender!', body: 'Los juegos con movimiento son los favoritos. ¿Jugamos?' },
  { title: '🎯 Pequeño reto, gran avance', body: 'Un ejercicio ahora = un gran paso en su terapia.' },
  { title: '🎉 ¡Valeria tiene un juego nuevo!', body: 'Entra y descubre la pausa activa de hoy.' },
  { title: '💪 Constancia = progreso', body: 'Las familias que practican a diario ven el doble de avance.' },
  { title: '🌈 Un ratito juntos', body: 'Jugar, mover el cuerpo y aprender: todo en una sesión Valeria.' },
  { title: '🏆 Tu logro te espera', body: 'Estás cerca de desbloquear una insignia nueva. ¡Entra a por ella!' },
  { title: '🎵 ¿Oyes eso?', body: 'Es la hora del Test de Ling y los juegos de audición.' },
  { title: '🧩 Última llamada del día', body: 'Todavía estás a tiempo de sumar la sesión de hoy. ¡Ánimo!' },
];

export const initNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de sesión',
      importance: Notifications.AndroidImportance.MAX,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00c4be',
    }).catch(() => { /* canal no disponible (p.ej. web) */ });
  }
};

export const remindersEnabled = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.recordatorios)) === 'on';
  } catch (e) {
    return false;
  }
};

// Programa un recordatorio diario por cada hora de la franja. Devuelve true si
// el permiso fue concedido y quedaron programados.
export const enableHourlyReminders = async (): Promise<boolean> => {
  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }
  if (!granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  let msg = 0;
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const m = MESSAGES[msg % MESSAGES.length];
    msg += 1;
    await Notifications.scheduleNotificationAsync({
      content: { title: m.title, body: m.body, sound: false },
      trigger: { channelId: CHANNEL_ID, hour, minute: 0, repeats: true },
    });
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'on');
  } catch (e) { /* noop */ }
  return true;
};

export const disableReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => { /* noop */ });
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'off');
  } catch (e) { /* noop */ }
};
