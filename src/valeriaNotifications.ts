// ============================================================================
// Valeria+ · Recordatorios en pantalla de bloqueo (V4.1)
// Notificaciones locales con expo-notifications, sin servidor:
//   · Máximo 4 recordatorios al día (9:00, 13:00, 17:00 y 20:00, repetición diaria).
//   · Mensajes lúdicos rotatorios con la osita Valeria para animar a la sesión.
//   · El aviso de las 20:00 es un consejo para padres ("El hogar como centro
//     de rehabilitación") que rota cada día entre los 5 consejos básicos.
//   · Canal Android de máxima prioridad y visibilidad pública (pantalla de bloqueo).
//
// API:
//   initNotifications()            → registrar handler + canal (llamar al arrancar).
//   remindersEnabled()             → lee la preferencia guardada.
//   enableDailyReminders()         → pide permiso y programa los 4 avisos diarios.
//   refreshDailyReminders()        → reprograma en silencio para rotar los mensajes
//                                    y el consejo del día (llamar al arrancar).
//   disableReminders()             → cancela todo y guarda la preferencia.
// ============================================================================
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { STORAGE_KEYS } from './valeriaTheme';

const CHANNEL_ID = 'valeria-recordatorios';
// Máximo 4 avisos al día, repartidos entre mañana, mediodía, tarde y noche.
export const REMINDER_HOURS = [9, 13, 17, 20];

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

// "El hogar como centro de rehabilitación": 5 consejos básicos para padres.
// Ocupan el aviso de las 20:00 y rotan uno por día. En Android el cuerpo se
// expande completo al deslizar la notificación.
export const PARENT_TIPS: { title: string; body: string }[] = [
  {
    title: '👀 Consejo 1 · Tus ojos y tu boca son su mapa',
    body: 'Para aprender a articular, tu hijo necesita ver cómo se fabrican las palabras. Agáchate a su nivel, mírale a los ojos y deja que vea tu boca: su cerebro es un espejo que copia tus movimientos. Si le hablas desde otra habitación, de espaldas o mirando el celular, le quitas el mapa visual que necesita para mover los labios y la lengua.',
  },
  {
    title: '📵 Consejo 2 · La trampa de las pantallas educativas',
    body: 'Celulares, tabletas y televisores no enseñan a hablar, aunque el programa repita números o colores. El lenguaje vivo requiere turnos: hablar, escuchar y responder. Una pantalla no hace pausas para escuchar a tu hijo, no le sonríe cuando lo intenta ni le corrige con cariño. Las horas de práctica real solo se las puedes dar tú.',
  },
  {
    title: '🤫 Consejo 3 · La regla del silencio',
    body: 'Los adultos hablamos rápido y llenamos todos los silencios. Cuando le ofrezcas algo (por ejemplo, leche) y le preguntes "¿qué quieres?", haz una pausa y cuenta mentalmente hasta cinco. Dale tiempo a su cerebro para procesar y organizar los músculos. Ese silencio estratégico es el que lo empuja a usar un sonido, un gesto o una palabra.',
  },
  {
    title: '🛁 Consejo 4 · La rutina es tu mejor terapia',
    body: 'No necesitas una hora de ejercicios ni materiales costosos. El mejor momento para el lenguaje es lo que ya haces cada día: mientras lo bañas, nombra el jabón, el agua y las partes del cuerpo; mientras recogen la ropa, nombra los colores. Repetir palabras sencillas en situaciones reales de la casa graba el vocabulario de forma definitiva.',
  },
  {
    title: '🐶 Consejo 5 · Expande lo que dice, sin regañar',
    body: 'Si señala un perro y dice "guau guau", no le digas "así no se dice": devuélvele la frase mejorada, "¡sí, es un perro grande!". Si dice "agua", respóndele "quieres tomar agua". Al expandir sus palabras sin criticarlo le das el modelo correcto y le confirmas que su intento de comunicarse fue exitoso y valorado.',
  },
];
// Hora reservada al consejo diario para padres (los niños ya suelen estar en
// rutina de noche y el mensaje va dirigido al adulto).
const TIP_HOUR = 20;

export const initNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
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

// Programa los 4 avisos del día: mensajes lúdicos en las primeras horas y el
// consejo para padres del día en la hora TIP_HOUR. El índice por día hace que,
// al reprogramar en cada arranque, tanto los mensajes como el consejo roten.
const scheduleDailyContent = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const day = Math.floor(Date.now() / 86_400_000);
  let msg = 0;
  for (const hour of REMINDER_HOURS) {
    const m = hour === TIP_HOUR
      ? PARENT_TIPS[day % PARENT_TIPS.length]
      : MESSAGES[(day * (REMINDER_HOURS.length - 1) + msg++) % MESSAGES.length];
    await Notifications.scheduleNotificationAsync({
      content: { title: m.title, body: m.body, sound: false },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: CHANNEL_ID,
        hour,
        minute: 0,
      },
    });
  }
};

// Programa como máximo 4 recordatorios diarios (uno por cada hora de
// REMINDER_HOURS). Devuelve true si el permiso fue concedido y quedaron
// programados.
export const enableDailyReminders = async (): Promise<boolean> => {
  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }
  if (!granted) return false;

  await scheduleDailyContent();
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'on');
  } catch (e) { /* noop */ }
  return true;
};

// Reprograma los avisos al arrancar la app (si el usuario los tiene activos)
// para que el consejo para padres y los mensajes lúdicos cambien cada día.
// No pide permisos: si se revocaron, simplemente no hace nada.
export const refreshDailyReminders = async (): Promise<void> => {
  try {
    if (!(await remindersEnabled())) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await scheduleDailyContent();
  } catch (e) { /* noop (p.ej. web) */ }
};

export const disableReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => { /* noop */ });
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'off');
  } catch (e) { /* noop */ }
};
