// ============================================================================
// Valeria+ · Servicio de datos en Cloud Firestore (edición Standard)
// ----------------------------------------------------------------------------
// Modelo de datos (propiedad por profesional autenticado):
//
//   professionals/{uid}                      ← perfil del profesional
//   professionals/{uid}/pacientes/{id}       ← fichas de sus pacientes
//   professionals/{uid}/sesiones/{id}        ← historial de sesiones/ejercicios
//
// Todo cuelga del uid del profesional, de modo que las Security Rules pueden
// garantizar que cada uno solo lee/escribe SUS datos (ver firestore.rules).
//
// Estas funciones son la capa de acceso lista para usar desde las pantallas.
// Aún NO están cableadas dentro del flujo local (AsyncStorage) para no romper
// nada existente: se integran cuando quieras migrar los datos a la nube.
// ============================================================================
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './firebaseApp';

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('No hay profesional autenticado.');
  }
  return uid;
}

// --- Perfil del profesional -------------------------------------------------

export async function upsertProfessionalProfile(
  data: Record<string, unknown>,
): Promise<void> {
  const uid = requireUid();
  await setDoc(
    doc(db, 'professionals', uid),
    { ...data, uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

// --- Pacientes --------------------------------------------------------------

export type PacienteDoc = Record<string, unknown> & { id: string };

function pacientesCol(uid: string) {
  return collection(db, 'professionals', uid, 'pacientes');
}

/** Crea o actualiza una ficha de paciente. Devuelve su id. */
export async function savePaciente(
  paciente: Record<string, unknown> & { id?: string },
): Promise<string> {
  const uid = requireUid();
  const { id, ...data } = paciente;
  if (id) {
    await setDoc(
      doc(db, 'professionals', uid, 'pacientes', id),
      { ...data, uid, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return id;
  }
  const ref = await addDoc(pacientesCol(uid), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPaciente(id: string): Promise<PacienteDoc | null> {
  const uid = requireUid();
  const snap = await getDoc(doc(db, 'professionals', uid, 'pacientes', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PacienteDoc) : null;
}

export async function listPacientes(): Promise<PacienteDoc[]> {
  const uid = requireUid();
  const snap = await getDocs(query(pacientesCol(uid), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PacienteDoc);
}

/** Suscripción en tiempo real a la lista de pacientes del profesional. */
export function subscribePacientes(
  onChange: (pacientes: PacienteDoc[]) => void,
): Unsubscribe {
  const uid = requireUid();
  return onSnapshot(
    query(pacientesCol(uid), orderBy('updatedAt', 'desc')),
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PacienteDoc)),
  );
}

export async function deletePaciente(id: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(db, 'professionals', uid, 'pacientes', id));
}

// --- Sesiones / historial de ejercicios ------------------------------------

/** Registra una sesión de ejercicio en el historial del profesional. */
export async function addSesion(sesion: Record<string, unknown>): Promise<string> {
  const uid = requireUid();
  const ref = await addDoc(collection(db, 'professionals', uid, 'sesiones'), {
    ...sesion,
    uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listSesiones(): Promise<
  (Record<string, unknown> & { id: string })[]
> {
  const uid = requireUid();
  const snap = await getDocs(
    query(collection(db, 'professionals', uid, 'sesiones'), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
