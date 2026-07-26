#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Programación de recordatorios por franjas (GEN-01 · X-05 del plan)
 *   node scripts/check-reminder-slots.js
 *
 * Las logopedas de ACOPROS buscaron dónde elegir cuántos avisos recibir y no lo
 * encontraron: la funcionalidad no existía. Ahora existe, y lo que este
 * chequeo protege es el criterio de aceptación entero, incluido el que es fácil
 * de romper sin notarlo:
 *
 *   C1 · Sin preferencia guardada llegan las cuatro franjas (comportamiento
 *        histórico: nadie pierde avisos al actualizar).
 *   C2 · Con un subconjunto elegido, llegan ESAS y solo esas.
 *   C3 · La franja de las 20:00 lleva consejo para el adulto, no aviso de juego.
 *   C4 · DESACTIVAR UNA FRANJA CANCELA SUS AVISOS YA PROGRAMADOS, no solo deja
 *        de reprogramarlos. Es el riesgo que el propio item señalaba: una
 *        notificación diaria ya en cola sigue sonando aunque nadie la renueve.
 *   C5 · Cero franjas equivale a desactivar (y lo deja registrado como 'off').
 *   C6 · La preferencia sobrevive al reinicio y a la reprogramación diaria.
 *   C7 · Una preferencia con valores desconocidos se sanea en vez de dejar al
 *        usuario sin ningún aviso.
 *
 * El módulo real no es puro (importa react-native, expo-notifications y
 * AsyncStorage), así que se compila y se carga con esos tres módulos
 * sustituidos por dobles en memoria. Se prueba el código de producción, no una
 * copia de su lógica.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-reminders-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);
const comprueba = (cond, msg) => (cond ? ok(msg) : fallo(msg));

// ---------------------------------------------------------------- dobles ----
// Agenda de notificaciones: guarda lo programado y respeta las cancelaciones,
// que es justo lo que hay que observar para C4.
const agenda = {
  programadas: [],
  cancelaciones: 0,
  reset() { this.programadas = []; this.cancelaciones = 0; },
};

const almacen = new Map();

const notificacionesFalsas = {
  AndroidImportance: { MAX: 5 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  setNotificationHandler: () => {},
  setNotificationChannelAsync: async () => {},
  getPermissionsAsync: async () => ({ granted: true }),
  requestPermissionsAsync: async () => ({ granted: true }),
  scheduleNotificationAsync: async ({ content, trigger }) => {
    agenda.programadas.push({ hour: trigger.hour, title: content.title, body: content.body });
  },
  cancelAllScheduledNotificationsAsync: async () => {
    agenda.cancelaciones += 1;
    agenda.programadas = [];
  },
};

const almacenFalso = {
  getItem: async (k) => (almacen.has(k) ? almacen.get(k) : null),
  setItem: async (k, v) => { almacen.set(k, String(v)); },
  removeItem: async (k) => { almacen.delete(k); },
};

const DOBLES = {
  'react-native': { Platform: { OS: 'android' } },
  'expo-notifications': notificacionesFalsas,
  '@react-native-async-storage/async-storage': { default: almacenFalso, ...almacenFalso },
};

const cargaOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(DOBLES, request)) return DOBLES[request];
  return cargaOriginal.apply(this, arguments);
};

// Horas de cada franja, escritas aquí a propósito: si alguien cambia el horario
// en el módulo, este chequeo debe fallar y obligar a decidirlo, no adaptarse solo.
const HORAS = { manana: 9, mediodia: 13, tarde: 17, consejo: 20 };
const TODAS = ['manana', 'mediodia', 'tarde', 'consejo'];
const horasProgramadas = () => agenda.programadas.map((n) => n.hour).sort((a, b) => a - b);
const iguales = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

(async () => {
  try {
    execSync(
      ['npx tsc', JSON.stringify(path.join(ROOT, 'src', 'valeriaNotifications.ts')),
        '--module commonjs', '--target es2020', '--moduleResolution node',
        '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
      { cwd: ROOT, stdio: 'inherit' },
    );

    const N = require(path.join(tmp, 'valeriaNotifications.js'));
    const CLAVE_ON = '@valeria_recordatorios';
    const CLAVE_FRANJAS = '@valeria_recordatorios_franjas';

    // ---- C1: sin preferencia, las cuatro -------------------------------
    almacen.clear(); agenda.reset();
    comprueba(iguales(await N.loadReminderSlots(), TODAS),
      'C1 · sin preferencia guardada, las cuatro franjas activas');
    await N.enableDailyReminders();
    comprueba(iguales(horasProgramadas(), [9, 13, 17, 20]),
      `C1 · se programan las cuatro horas (obtenido: ${horasProgramadas().join(', ') || 'ninguna'})`);

    // ---- C2 y C3: subconjunto elegido ----------------------------------
    almacen.clear(); agenda.reset();
    await N.enableDailyReminders(['manana', 'consejo']);
    comprueba(iguales(horasProgramadas(), [HORAS.manana, HORAS.consejo]),
      `C2 · solo llegan las franjas elegidas (obtenido: ${horasProgramadas().join(', ') || 'ninguna'})`);
    const nocturna = agenda.programadas.find((n) => n.hour === HORAS.consejo);
    comprueba(!!nocturna && /Consejo \d/.test(nocturna.title),
      `C3 · la franja de las 20:00 lleva consejo para el adulto (obtenido: «${nocturna ? nocturna.title : 'nada'}»)`);
    const diurna = agenda.programadas.find((n) => n.hour === HORAS.manana);
    comprueba(!!diurna && !/Consejo \d/.test(diurna.title),
      'C3 · las franjas de día llevan aviso de juego, no el consejo');

    // ---- C4: apagar una franja cancela lo ya programado -----------------
    almacen.clear(); agenda.reset();
    await N.enableDailyReminders(TODAS);
    const antes = agenda.programadas.length;
    await N.setReminderSlots(['manana', 'mediodia']);
    comprueba(antes === 4 && agenda.cancelaciones >= 2,
      'C4 · reprogramar empieza cancelando lo que hubiera en cola');
    comprueba(iguales(horasProgramadas(), [HORAS.manana, HORAS.mediodia]),
      `C4 · las franjas retiradas dejan de estar programadas (obtenido: ${horasProgramadas().join(', ') || 'ninguna'})`);

    // ---- C5: cero franjas equivale a desactivar ------------------------
    const encendidoAntes = await N.remindersEnabled();
    const seguiaEncendido = await N.setReminderSlots([]);
    comprueba(encendidoAntes === true && seguiaEncendido === false,
      'C5 · quedarse sin franjas devuelve false (el interruptor maestro se apaga)');
    comprueba(agenda.programadas.length === 0,
      `C5 · no queda ningún aviso programado (obtenido: ${agenda.programadas.length})`);
    comprueba(almacen.get(CLAVE_ON) === 'off',
      `C5 · la preferencia queda registrada como apagada (obtenido: ${almacen.get(CLAVE_ON)})`);

    // ---- C6: la preferencia sobrevive a la reprogramación diaria -------
    almacen.clear(); agenda.reset();
    await N.enableDailyReminders(['tarde']);
    comprueba(almacen.get(CLAVE_FRANJAS) === JSON.stringify(['tarde']),
      'C6 · la selección se persiste');
    agenda.reset();
    await N.refreshDailyReminders();
    comprueba(iguales(horasProgramadas(), [HORAS.tarde]),
      `C6 · el refresco diario respeta la selección guardada (obtenido: ${horasProgramadas().join(', ') || 'ninguna'})`);

    // Y con los recordatorios apagados, el refresco no programa nada.
    await N.disableReminders(); agenda.reset();
    await N.refreshDailyReminders();
    comprueba(agenda.programadas.length === 0,
      'C6 · con los recordatorios apagados, el refresco diario no programa nada');

    // ---- C7: preferencia corrupta o de otra versión --------------------
    almacen.clear();
    almacen.set(CLAVE_FRANJAS, JSON.stringify(['manana', 'madrugada', 'siesta']));
    comprueba(iguales(await N.loadReminderSlots(), ['manana']),
      'C7 · las franjas desconocidas se descartan y se conserva lo válido');
    almacen.set(CLAVE_FRANJAS, 'esto no es json');
    comprueba(iguales(await N.loadReminderSlots(), TODAS),
      'C7 · una preferencia ilegible cae a las cuatro, no a ninguna');
  } finally {
    Module._load = cargaOriginal;
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  if (fallos) {
    console.error(`\n✖ ${fallos} incumplimientos en la programación de recordatorios.`);
    console.error('  Ver docs/plan-mejoras-acopros-logopedas.json → GEN-01.');
    process.exit(1);
  }
  console.log('\n✓ Los recordatorios respetan las franjas elegidas (GEN-01).');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
