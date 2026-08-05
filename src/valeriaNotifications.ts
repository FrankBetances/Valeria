// ============================================================================
// Valeria+ · Recordatorios en pantalla de bloqueo (V4.2)
// Notificaciones locales con expo-notifications, sin servidor:
//   · Hasta 4 franjas al día (9:00, 13:00, 17:00 y 20:00), y el usuario ELIGE
//     cuáles quiere: de las cuatro a ninguna.
//   · Mensajes lúdicos rotatorios con la osita Valeria para animar a la sesión.
//   · La franja de las 20:00 es un consejo para padres ("El hogar como centro
//     de rehabilitación") que rota cada día entre los 5 consejos básicos.
//   · Canal Android de máxima prioridad y visibilidad pública (pantalla de bloqueo).
//
// GEN-01 · Las logopedas de ACOPROS buscaron dónde elegir cuántos avisos
// recibir y no lo encontraron, porque no existía: la tarjeta prometía «hasta
// 4 al día» describiendo un LÍMITE DEL SISTEMA como si fuera una opción, y
// las cuatro horas eran una constante de módulo. Ahora son una preferencia.
//
// API:
//   initNotifications()            → registrar handler + canal (llamar al arrancar).
//   remindersEnabled()             → lee la preferencia de encendido.
//   loadReminderSlots()            → franjas elegidas (las cuatro por defecto).
//   enableDailyReminders(slots?)   → pide permiso y programa las franjas elegidas.
//   setReminderSlots(slots)        → cambia la selección y reprograma; lista vacía
//                                    equivale a desactivar.
//   refreshDailyReminders()        → reprograma en silencio para rotar los mensajes
//                                    y el consejo del día (llamar al arrancar).
//   disableReminders()             → cancela todo y guarda la preferencia.
// ============================================================================
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { STORAGE_KEYS } from './valeriaTheme';
// Del módulo PURO, no de './i18n': este fichero lo compila y ejecuta en Node
// el gate check-reminder-slots.js, y './i18n' arrastra React por el hook.
import { tNow } from './i18n/catalog';

const CHANNEL_ID = 'valeria-recordatorios';

// Las cuatro franjas configurables. El identificador es estable y no depende
// de la hora, para poder mover un horario sin invalidar la preferencia ya
// guardada en los dispositivos.
export type ReminderSlot = 'manana' | 'mediodia' | 'tarde' | 'consejo';

// Solo el identificador y la hora: la ETIQUETA y la descripción de cada franja
// viven en el catálogo de interfaz (t.hub.slotLabel / t.hub.slotHint), que es
// quien sabe en qué idioma las lee el adulto y en qué formato horario.
export interface ReminderSlotDef {
  slot: ReminderSlot;
  hour: number;
}

export const REMINDER_SLOTS: ReminderSlotDef[] = [
  { slot: 'manana', hour: 9 },
  { slot: 'mediodia', hour: 13 },
  { slot: 'tarde', hour: 17 },
  // La franja de noche NO es un aviso de juego: va dirigida al adulto, y la
  // etiqueta del catálogo lo dice, o se apagará pensando que despierta al niño.
  { slot: 'consejo', hour: 20 },
];

export const ALL_REMINDER_SLOTS: ReminderSlot[] = REMINDER_SLOTS.map((s) => s.slot);

const hoursFor = (slots: ReminderSlot[]): number[] =>
  REMINDER_SLOTS.filter((d) => slots.includes(d.slot)).map((d) => d.hour);

// Mensajes rotatorios: cercanos, breves y con llamada a la acción de juego.
// Se leen del catálogo EN EL MOMENTO DE PROGRAMAR, no al importar el módulo:
// así el aviso sale en el idioma que el adulto tiene puesto ahora.
const messages = () => tNow().notifications.messages();

// "El hogar como centro de rehabilitación": 5 consejos básicos para padres.
// Ocupan el aviso de las 20:00 y rotan uno por día. En Android el cuerpo se
// expande completo al deslizar la notificación.
export const parentTips = () => tNow().notifications.parentTips();
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
      name: tNow().notifications.channelName,
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

// Franjas elegidas. Sin preferencia guardada (instalación nueva o versión
// anterior a GEN-01) valen las cuatro, que es lo que hacía la constante.
// Se sanean los valores desconocidos para que una preferencia de una versión
// futura no deje al usuario sin ningún aviso en una versión antigua.
export const loadReminderSlots = async (): Promise<ReminderSlot[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.recordatoriosFranjas);
    if (!raw) return [...ALL_REMINDER_SLOTS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...ALL_REMINDER_SLOTS];
    return ALL_REMINDER_SLOTS.filter((s) => parsed.includes(s));
  } catch (e) {
    return [...ALL_REMINDER_SLOTS];
  }
};

const saveReminderSlots = async (slots: ReminderSlot[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatoriosFranjas, JSON.stringify(slots));
  } catch (e) { /* noop */ }
};

// Programa un aviso por franja elegida: mensajes lúdicos en las horas de juego
// y el consejo para padres del día en TIP_HOUR. El índice por día hace que, al
// reprogramar en cada arranque, tanto los mensajes como el consejo roten.
//
// Empieza SIEMPRE por cancelar todo lo programado. Es lo que hace que apagar
// una franja apague de verdad sus avisos ya en cola, y no solo deje de
// reprogramarlos (el riesgo que GEN-01 señalaba).
const scheduleDailyContent = async (hours: number[]): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const day = Math.floor(Date.now() / 86_400_000);
  // Cuántos mensajes lúdicos consume un día, para que el desfase diario siga
  // rotando el banco entero aunque el usuario deje activa una sola franja.
  const playful = Math.max(1, hours.filter((h) => h !== TIP_HOUR).length);
  let msg = 0;
  for (const hour of hours) {
    const tips = parentTips();
    const msgs = messages();
    const m = hour === TIP_HOUR
      ? tips[day % tips.length]
      : msgs[(day * playful + msg++) % msgs.length];
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

// Activa los recordatorios en las franjas indicadas (por defecto, las que ya
// tuviera guardadas). Devuelve true si el permiso fue concedido y quedaron
// programados. Una lista vacía no es un error: significa desactivar.
export const enableDailyReminders = async (slots?: ReminderSlot[]): Promise<boolean> => {
  const elegidas = slots ?? (await loadReminderSlots());
  if (!elegidas.length) {
    await disableReminders();
    return false;
  }

  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }
  if (!granted) return false;

  await scheduleDailyContent(hoursFor(elegidas));
  await saveReminderSlots(elegidas);
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'on');
  } catch (e) { /* noop */ }
  return true;
};

// Cambia la selección de franjas con los recordatorios ya activos. Quedarse sin
// ninguna equivale a apagarlos: se cancela lo programado y el interruptor
// maestro de la tarjeta se apaga (devuelve false).
export const setReminderSlots = async (slots: ReminderSlot[]): Promise<boolean> => {
  if (!slots.length) {
    await disableReminders();
    return false;
  }
  return enableDailyReminders(slots);
};

// Reprograma los avisos al arrancar la app (si el usuario los tiene activos)
// para que el consejo para padres y los mensajes lúdicos cambien cada día.
// No pide permisos: si se revocaron, simplemente no hace nada.
export const refreshDailyReminders = async (): Promise<void> => {
  try {
    if (!(await remindersEnabled())) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    const slots = await loadReminderSlots();
    if (!slots.length) return;
    await scheduleDailyContent(hoursFor(slots));
  } catch (e) { /* noop (p.ej. web) */ }
};

export const disableReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => { /* noop */ });
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recordatorios, 'off');
  } catch (e) { /* noop */ }
};
