// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Banco de Preguntas Interactivas
// Catálogo clínico estructurado por grupos de edad (0 a 10 años).
// Basado en el protocolo clínico de lenguaje, fonología, fluidez y pragmática.
// ============================================================================

import type { PictoKey } from '../../ValeriaPixelArt';

export type AgeBand = '0-2' | '2-3' | '3-4' | '4-5' | '5-7' | '7-10';

/**
 * Quién actúa en el ítem. El catálogo mezclaba las dos y la pantalla las
 * pintaba igual: «Señala el perro» y «No responde» salían como dos botones
 * gemelos, cuando el segundo no es algo que el niño elija sino algo que el
 * adulto observa.
 *
 *   child_choice · el niño toca una ficha. TODA opción lleva pictograma: por
 *                  debajo de 4 años no se lee, y sin dibujo el ítem no se
 *                  puede responder. Lo exige verify-aventuras-lua.js.
 *   adult_record · el adulto mira al niño y registra lo que hizo. Las opciones
 *                  son la hoja de registro, no estímulos, y no se locutan.
 */
export type LuaResponseMode = 'child_choice' | 'adult_record';

export type AssessmentArea =
  | 'atencion_imitacion'
  | 'vocabulario_fonologia'
  | 'instrucciones_fluidez'
  | 'sintaxis_narrativa'
  | 'conciencia_fonologica'
  | 'lenguaje_abstracto';

export interface LuaAssessmentOption {
  id: string;
  label: string;
  isTarget: boolean;
  /** Ficha del banco propio (ValeriaPixelArt). Obligatoria en 'child_choice'. */
  pic?: PictoKey;
}

export interface LuaClinicalSupport {
  /** Refuerzo verbal inmediato y positivo al responder la opción esperada */
  targetFeedback: string;
  /** Modelado verbal (recasting) y pauta sin castigo ante cualquier otro intento */
  modelingFeedback: string;
  /** Sugerencia práctica para el terapeuta o acompañante */
  adultGuidance?: string;
}

export interface LuaAssessmentQuestion {
  id: string;
  ageBand: AgeBand;
  area: AssessmentArea;
  order: number; // 1 a 10 dentro de su rango de edad
  mode: LuaResponseMode;
  prompt: string;
  subPrompt?: string;
  /** Dibujo de la consigna. También en los ítems de observación: el niño
   *  necesita ver de qué se le habla aunque no toque nada. */
  questionPic?: PictoKey;
  /**
   * Lo que oye el NIÑO cuando no acierta. NO es `modelingFeedback`: aquella
   * está escrita para el adulto («Se repite la consigna señalando…») y se le
   * locutaba al niño tal cual, en el momento más frágil de la actividad.
   */
  childRecast: string;
  options: LuaAssessmentOption[];
  clinicalSupport: LuaClinicalSupport;
}

export const LUA_ASSESSMENT_CATALOG: LuaAssessmentQuestion[] = [
  // ==========================================================================
  // 0–2 AÑOS — Atención conjunta, imitación y primeras vocalizaciones
  // ==========================================================================
  {
    id: 'lua_eval_0_2_01',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 1,
    mode: 'child_choice',
    prompt: '¿Dónde está el perrito?',
    childRecast: '¡Mira! Este es el perro.',
    options: [
      { id: 'opt_perro', label: 'Perro', isTarget: true, pic: 'perro' },
      { id: 'opt_pelota', label: 'Pelota', isTarget: false, pic: 'pelota' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien! ¡Ahí está el perrito!',
      modelingFeedback: 'Si no responde, el adulto o Lúa señala y nombra: "¡Aquí está! ¡Perrito!".',
      adultGuidance: 'Reforzar el seguimiento de la mirada y el contacto visual.',
    },
  },
  {
    id: 'lua_eval_0_2_02',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 2,
    mode: 'adult_record',
    questionPic: 'vaca',
    prompt: '¿Qué dice la vaca?',
    childRecast: '¡La vaca dice muuu!',
    options: [
      { id: 'opt_muu', label: 'Imita "muuu" o vocaliza', isTarget: true },
      { id: 'opt_no_resp', label: 'No responde', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Eso es! La vaca dice ¡muuu!',
      modelingFeedback: 'Cualquier vocalización se refuerza; se modela el sonido exagerando la redondez labial.',
      adultGuidance: 'Aceptar cualquier aproximación vocálica sonora.',
    },
  },
  {
    id: 'lua_eval_0_2_03',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 3,
    mode: 'adult_record',
    questionPic: 'pelota',
    prompt: 'Dame la pelota (instrucción simple con objeto a la vista)',
    childRecast: '¡Esta es la pelota! Dámela.',
    options: [
      { id: 'opt_da_pelota', label: 'Entrega la pelota', isTarget: true },
      { id: 'opt_da_otro', label: 'Entrega otro objeto', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Gracias! Me diste la pelota.',
      modelingFeedback: 'Se repite la consigna señalando con la mano abierta el objeto correcto.',
      adultGuidance: 'Favorece el seguimiento instruccional directo con referencia visual.',
    },
  },
  {
    id: 'lua_eval_0_2_04',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 4,
    mode: 'adult_record',
    prompt: 'Di "adiós" (con gesto de despedida con la mano)',
    childRecast: '¡Adiós! Dile adiós con la mano.',
    options: [
      { id: 'opt_imita_gesto', label: 'Imita el gesto y/o la palabra', isTarget: true },
      { id: 'opt_solo_mira', label: 'Solo observa', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Adiós, amigo! ¡Hasta luego!',
      modelingFeedback: 'Se refuerza cualquier intento de imitación, sea verbal, con balbuceo o motor con la mano.',
      adultGuidance: 'Pragmática gestual temprana de saludo y despedida.',
    },
  },
  {
    id: 'lua_eval_0_2_05',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 5,
    mode: 'adult_record',
    prompt: '¿Dónde está mamá? (en foto familiar o presencia)',
    childRecast: '¡Aquí está mamá!',
    options: [
      { id: 'opt_mira_mama', label: 'Mira o señala la foto', isTarget: true },
      { id: 'opt_no_localiza', label: 'No localiza', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Sí! ¡Ahí está mamá!',
      modelingFeedback: 'Apoyo con señalamiento conjunto y repetición afectuosa del nombre.',
      adultGuidance: 'Reconocimiento de figuras de apego y atención conjunta.',
    },
  },
  {
    id: 'lua_eval_0_2_06',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 6,
    mode: 'adult_record',
    questionPic: 'soplar',
    prompt: 'Sopla la burbuja (modelo del adulto o Lúa)',
    childRecast: '¡Sopla conmigo! Fffff.',
    options: [
      { id: 'opt_sopla', label: 'Imita la acción de soplar', isTarget: true },
      { id: 'opt_no_sopla', label: 'No imita el soplido', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Mira cómo vuelan las burbujas! ¡Fuuu!',
      modelingFeedback: 'Se practica el patrón motor oral varias veces con juego lúdico sin presión.',
      adultGuidance: 'Praxia bucofonatoria de control de aire espiratorio.',
    },
  },
  {
    id: 'lua_eval_0_2_07',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 7,
    mode: 'adult_record',
    questionPic: 'gato',
    prompt: '¿Qué dice el gato?',
    childRecast: '¡El gato dice miau!',
    options: [
      { id: 'opt_miau', label: 'Imita "miau" o vocaliza', isTarget: true },
      { id: 'opt_gato_callado', label: 'No responde', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Miau! ¡Qué lindo gatico!',
      modelingFeedback: 'Se refuerza cualquier aproximación sonora (/ia/, /au/, etc.).',
      adultGuidance: 'Estimulación del repertorio onomatopéyico.',
    },
  },
  {
    id: 'lua_eval_0_2_08',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 8,
    mode: 'adult_record',
    questionPic: 'mano',
    prompt: 'Aplaude conmigo (imitación motora)',
    childRecast: '¡Palmas, palmas! Aplaude conmigo.',
    options: [
      { id: 'opt_aplaude', label: 'Imita el aplauso', isTarget: true },
      { id: 'opt_no_aplaude', label: 'No imita', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Bravo! ¡Chocamos esas palmas!',
      modelingFeedback: 'Se modela de nuevo con ritmo suave, mano sobre mano si es necesario.',
      adultGuidance: 'Coordinación visomotora y sincronía comunicativa.',
    },
  },
  {
    id: 'lua_eval_0_2_09',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 9,
    mode: 'child_choice',
    prompt: 'Dame el osito (elección entre 2 objetos a la vista)',
    childRecast: '¡Este es el osito!',
    options: [
      { id: 'opt_elige_osito', label: 'Osito', isTarget: true, pic: 'osito-grande' },
      { id: 'opt_elige_otro', label: 'Pelota', isTarget: false, pic: 'pelota' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué suave es el osito! ¡Muchas gracias!',
      modelingFeedback: 'Se nombra el objeto correcto señalándolo claramente: "Mira, este es el osito".',
      adultGuidance: 'Discriminación léxica receptiva temprana.',
    },
  },
  {
    id: 'lua_eval_0_2_10',
    ageBand: '0-2',
    area: 'atencion_imitacion',
    order: 10,
    mode: 'child_choice',
    prompt: '¿Quién hace "guau guau"? (perro / pato)',
    childRecast: '¡El perro hace guau guau!',
    options: [
      { id: 'opt_elige_perro', label: 'Perro', isTarget: true, pic: 'perro' },
      { id: 'opt_elige_pato', label: 'Pato', isTarget: false, pic: 'pato' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Exacto! El perro hace ¡guau, guau!',
      modelingFeedback: 'Se repite el sonido asociado a cada animal: "El perro dice guau, el pato dice cua".',
      adultGuidance: 'Asociación sonido-objeto en discriminación forzada de 2 alternativas.',
    },
  },

  // ==========================================================================
  // 2–3 AÑOS — Vocabulario y fonología temprana
  // ==========================================================================
  {
    id: 'lua_eval_2_3_01',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 1,
    mode: 'child_choice',
    prompt: '¿Cuál es la pelota? (pelota / pato / taza)',
    childRecast: '¡Esta es la pelota! ¿Puedes decir pelota?',
    options: [
      { id: 'opt_pelota_sel', label: 'Pelota', isTarget: true, pic: 'pelota' },
      { id: 'opt_pato_sel', label: 'Pato', isTarget: false, pic: 'pato' },
      { id: 'opt_taza_sel', label: 'Taza', isTarget: false, pic: 'taza' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien! ¡Esa es la pelota redonda!',
      modelingFeedback: 'Si elige otra opción: "¡Casi! Esta es la pelota. ¿Puedes decir pelota?".',
      adultGuidance: 'Evitar corregir con "no"; modelar la palabra completa.',
    },
  },
  {
    id: 'lua_eval_2_3_02',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 2,
    mode: 'child_choice',
    prompt: 'Toca la imagen que empieza con el sonido /p/ (pato / sol / mesa)',
    childRecast: '¡Pato! Empieza con /p/.',
    options: [
      { id: 'opt_pato_p', label: 'Pato', isTarget: true, pic: 'pato' },
      { id: 'opt_sol_p', label: 'Sol', isTarget: false, pic: 'sol' },
      { id: 'opt_mesa_p', label: 'Mesa', isTarget: false, pic: 'mesa' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Sí! /p/… ¡Pato empieza con /p/!',
      modelingFeedback: 'Lúa repite el sonido inicial exagerado antes de mostrar el resultado: "/p/… pato".',
      adultGuidance: 'Conciencia fonológica de consonante oclusiva bilabial temprana.',
    },
  },
  {
    id: 'lua_eval_2_3_03',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 3,
    mode: 'child_choice',
    prompt: 'Dame el juguete rojo (selección por color, 3 opciones)',
    childRecast: '¡Este es el rojo!',
    options: [
      { id: 'opt_rojo', label: 'Rojo', isTarget: true, pic: 'color-rojo' },
      { id: 'opt_azul', label: 'Azul', isTarget: false, pic: 'color-azul' },
      { id: 'opt_verde', label: 'Verde', isTarget: false, pic: 'color-verde' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Genial! Este es el juguete rojo.',
      modelingFeedback: 'Se nombra el color en voz alta señalando el objeto adecuado con afecto.',
      adultGuidance: 'Comprensión de adjetivos de color primario.',
    },
  },
  {
    id: 'lua_eval_2_3_04',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 4,
    mode: 'child_choice',
    prompt: '¿Qué está haciendo el niño en la imagen?',
    subPrompt: 'Imagen: niño comiendo una fruta',
    childRecast: '¡El niño está comiendo!',
    options: [
      { id: 'opt_comiendo', label: 'Comiendo', isTarget: true, pic: 'comer' },
      { id: 'opt_durmiendo', label: 'Durmiendo', isTarget: false, pic: 'dormir' },
      { id: 'opt_corriendo', label: 'Corriendo', isTarget: false, pic: 'correr' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Eso es! El niño come rico.',
      modelingFeedback: 'Se modela la frase completa expandida: "El niño está comiendo".',
      adultGuidance: 'Comprensión y expresión de verbos de acción cotidiana.',
    },
  },
  {
    id: 'lua_eval_2_3_05',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 5,
    mode: 'adult_record',
    questionPic: 'mesa',
    prompt: 'Pon el vaso arriba de la mesa (instrucción espacial)',
    childRecast: '¡Arriba! El vaso va arriba de la mesa.',
    options: [
      { id: 'opt_arriba', label: 'Coloca arriba', isTarget: true },
      { id: 'opt_abajo', label: 'Coloca abajo', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Perfecto! El vaso está arriba.',
      modelingFeedback: 'Se repite con gesto manual de apoyo señalando hacia arriba.',
      adultGuidance: 'Nociones topológicas espaciales básicas.',
    },
  },
  {
    id: 'lua_eval_2_3_06',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 6,
    mode: 'child_choice',
    prompt: '¿Cuál es más grande? (elefante / hormiga)',
    childRecast: '¡El elefante es más grande!',
    options: [
      { id: 'opt_elefante', label: 'Elefante', isTarget: true, pic: 'elefante' },
      { id: 'opt_hormiga', label: 'Hormiga', isTarget: false, pic: 'hormiga' },
    ],
    clinicalSupport: {
      targetFeedback: '¡El elefante es gigante y muy grande!',
      modelingFeedback: 'Se refuerza el concepto comparando tamaños abriendo los brazos ampliamente.',
      adultGuidance: 'Conceptos dimensionales de tamaño relativo.',
    },
  },
  {
    id: 'lua_eval_2_3_07',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 7,
    mode: 'child_choice',
    prompt: 'Toca la imagen que empieza con el sonido /m/ (mesa / sol / pato)',
    childRecast: '¡Mesa! Empieza con /m/.',
    options: [
      { id: 'opt_mesa_m', label: 'Mesa', isTarget: true, pic: 'mesa' },
      { id: 'opt_sol_m', label: 'Sol', isTarget: false, pic: 'sol' },
      { id: 'opt_pato_m', label: 'Pato', isTarget: false, pic: 'pato' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Mmm… mesa! ¡Empieza con /m/!',
      modelingFeedback: 'Se junta la boca y se exagera el sonido nasal /m/ antes de repetir.',
      adultGuidance: 'Discriminación de punto articulatorio bilabial sonoro.',
    },
  },
  {
    id: 'lua_eval_2_3_08',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 8,
    mode: 'adult_record',
    questionPic: 'pelota',
    prompt: 'Juego de turnos: "Mi turno… tu turno" con la pelota',
    childRecast: '¡Ahora es tu turno!',
    options: [
      { id: 'opt_espera_turno', label: 'Espera su turno y responde', isTarget: true },
      { id: 'opt_interrumpe', label: 'Interrumpe o no espera', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué bien esperaste tu turno! ¡Ahora te toca a ti!',
      modelingFeedback: 'Se refuerza visualmente con una tarjeta o señal de "Tu turno".',
      adultGuidance: 'Regulación conductual y toma de turnos comunicativos.',
    },
  },
  {
    id: 'lua_eval_2_3_09',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 9,
    mode: 'child_choice',
    prompt: '¿Qué comemos cuando tenemos hambre? (comida / juguete / zapato)',
    childRecast: '¡Cuando tenemos hambre, comemos!',
    options: [
      { id: 'opt_comida', label: 'Pan', isTarget: true, pic: 'pan' },
      { id: 'opt_juguete', label: 'Juguete', isTarget: false, pic: 'pelota' },
      { id: 'opt_zapato', label: 'Zapato', isTarget: false, pic: 'zapato' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Claro! Comemos una rica comida.',
      modelingFeedback: 'Se conecta la sensación corporal "hambre" con la acción adaptativa correcta.',
      adultGuidance: 'Relación de causa y efecto funcional.',
    },
  },
  {
    id: 'lua_eval_2_3_10',
    ageBand: '2-3',
    area: 'vocabulario_fonologia',
    order: 10,
    mode: 'adult_record',
    questionPic: 'vaso',
    prompt: 'Imita la frase: "Quiero agua"',
    childRecast: 'Quiero agua. ¿Lo dices conmigo?',
    options: [
      { id: 'opt_imita_frase', label: 'Imita la frase completa o parcial', isTarget: true },
      { id: 'opt_no_imita_frase', label: 'No imita', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien dicho! "Quiero agua fresca".',
      modelingFeedback: 'Se acepta cualquier combinación aproximada de 2 palabras (ej. "quiero agua", "dame agua").',
      adultGuidance: 'Construcción de enunciados sintácticos pivote.',
    },
  },

  // ==========================================================================
  // 3–4 AÑOS — Instrucciones, pragmática temprana y fluidez suave
  // ==========================================================================
  {
    id: 'lua_eval_3_4_01',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 1,
    mode: 'child_choice',
    prompt: 'El niño tiene hambre, ¿qué debería hacer?',
    childRecast: '¡Si tiene hambre, pide comida!',
    options: [
      { id: 'opt_pedir_comida', label: 'Pedir comida', isTarget: true, pic: 'comer' },
      { id: 'opt_dormir', label: 'Dormir', isTarget: false, pic: 'dormir' },
      { id: 'opt_jugar', label: 'Jugar', isTarget: false, pic: 'pelota' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Sí! Cuando tenemos hambre, pedimos comida.',
      modelingFeedback: 'Refuerza la relación causa-efecto y la petición social verbal.',
      adultGuidance: 'Pragmática de resolución de necesidades básicas.',
    },
  },
  {
    id: 'lua_eval_3_4_02',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 2,
    mode: 'adult_record',
    questionPic: 'mano-limpia',
    prompt: 'Primero lávate las manos, luego toca la manzana (secuencia de 2 pasos)',
    childRecast: 'Primero las manos, y después la manzana.',
    options: [
      { id: 'opt_dos_pasos_ok', label: 'Sigue ambos pasos en orden', isTarget: true },
      { id: 'opt_solo_un_paso', label: 'Completa solo un paso', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Excelente! Primero lavarse y luego comer.',
      modelingFeedback: 'Si la respuesta es parcial, se repite con íconos numerados de apoyo visual: 1 y 2.',
      adultGuidance: 'Memoria de trabajo secuencial.',
    },
  },
  {
    id: 'lua_eval_3_4_03',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 3,
    mode: 'child_choice',
    prompt: '¿Cuál empieza como "sol"? (sapo / luna / pan)',
    childRecast: 'Sol… sapo. ¡Las dos empiezan igual!',
    options: [
      { id: 'opt_sapo', label: 'Sapo', isTarget: true, pic: 'sapo' },
      { id: 'opt_luna', label: 'Luna', isTarget: false, pic: 'luna' },
      { id: 'opt_pan', label: 'Pan', isTarget: false, pic: 'pan' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Sss-ol y Sss-apo! ¡Las dos empiezan con /s/!',
      modelingFeedback: 'Se alarga el sonido fricativo /s/ inicial antes de repetir la pregunta.',
      adultGuidance: 'Aliteración y reconocimiento fonológico.',
    },
  },
  {
    id: 'lua_eval_3_4_04',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 4,
    mode: 'child_choice',
    prompt: '¿Qué usamos cuando llueve?',
    childRecast: '¡Cuando llueve usamos el paraguas!',
    options: [
      { id: 'opt_paraguas', label: 'Paraguas', isTarget: true, pic: 'paraguas' },
      { id: 'opt_gorra', label: 'Gorra', isTarget: false, pic: 'gorra' },
      { id: 'opt_bufanda', label: 'Bufanda', isTarget: false, pic: 'bufanda' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Un paraguas para no mojarnos con la lluvia!',
      modelingFeedback: 'Se conecta la situación climática con el objeto funcional correcto.',
      adultGuidance: 'Semántica funcional de objetos.',
    },
  },
  {
    id: 'lua_eval_3_4_05',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 5,
    mode: 'adult_record',
    prompt: 'Juego de roles "el doctor": "¿Qué le duele al paciente?"',
    childRecast: '¿Dónde le duele? ¿Aquí?',
    options: [
      { id: 'opt_responde_cuerpo', label: 'Responde señalando o nombrando la parte del cuerpo', isTarget: true },
      { id: 'opt_no_responde_rol', label: 'No responde en el juego', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Pobre osito, le dolía el brazo! Ya lo curamos.',
      modelingFeedback: 'Se modela una respuesta simple en juego simbólico y se invita a repetirla.',
      adultGuidance: 'Desarrollo de juego simbólico y esquema corporal.',
    },
  },
  {
    id: 'lua_eval_3_4_06',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 6,
    mode: 'adult_record',
    prompt: 'Cuando alguien te saluda y dice "hola", tú…',
    childRecast: '¡Hola! Cuando te saludan, tú saludas.',
    options: [
      { id: 'opt_saluda_vuelta', label: 'Saludas de vuelta', isTarget: true },
      { id: 'opt_se_va_silencio', label: 'Te vas sin responder', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué amable! Decimos "¡Hola!" con una sonrisa.',
      modelingFeedback: 'Mini historia social con apoyo de Lúa reforzando la reciprocidad social.',
      adultGuidance: 'Pragmática conversacional de cortesía.',
    },
  },
  {
    id: 'lua_eval_3_4_07',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 7,
    mode: 'adult_record',
    prompt: 'Practica decir "quiero jugar" con voz suave y relajada',
    subPrompt: 'Estrategia clínica de inicio vocal suave para fluidez',
    childRecast: 'Suavecito: quiero jugar.',
    options: [
      { id: 'opt_habla_relajada', label: 'Produce la frase de forma relajada', isTarget: true },
      { id: 'opt_tension_bloqueo', label: 'Muestra tensión o bloqueo', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué suave salió tu voz! Como una pluma en el aire.',
      modelingFeedback: 'Sin presión de tiempo; Lúa modela la frase respirando despacio, sin señalar error.',
      adultGuidance: 'Manejo clínico preventivo de disfluencias.',
    },
  },
  {
    id: 'lua_eval_3_4_08',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 8,
    mode: 'child_choice',
    prompt: '¿Cuál no pertenece a este grupo? (manzana, plátano/banana, silla)',
    childRecast: 'La manzana y el plátano se comen. ¡La silla no!',
    options: [
      { id: 'opt_silla_intrusa', label: 'Silla', isTarget: true, pic: 'silla' },
      { id: 'opt_manzana_intrusa', label: 'Manzana', isTarget: false, pic: 'manzana' },
      { id: 'opt_platano_intruso', label: 'Plátano', isTarget: false, pic: 'platano' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Exacto! La manzana y el plátano son frutas; la silla es un mueble.',
      modelingFeedback: 'Se explica la categoría: "La silla no se come, la silla es para sentarse".',
      adultGuidance: 'Clasificación y detección del elemento intruso.',
    },
  },
  {
    id: 'lua_eval_3_4_09',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 9,
    mode: 'adult_record',
    questionPic: 'abrazo',
    prompt: 'Ordena la historia: niño tropieza → llora → mamá lo abraza',
    childRecast: 'Primero tropieza, después llora, y mamá lo abraza.',
    options: [
      { id: 'opt_historia_ok', label: 'Ordena las 3 imágenes correctamente', isTarget: true },
      { id: 'opt_historia_err', label: 'Ordena de forma incorrecta', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien! Primero tropezó, se puso triste y mamá le dio un gran abrazo.',
      modelingFeedback: 'Se guía paso a paso con preguntas: "¿Qué pasó primero? ¿Y después?".',
      adultGuidance: 'Estructuración narrativa cronológica.',
    },
  },
  {
    id: 'lua_eval_3_4_10',
    ageBand: '3-4',
    area: 'instrucciones_fluidez',
    order: 10,
    mode: 'adult_record',
    prompt: '¿Qué dirías si quieres jugar con un amigo?',
    childRecast: '¿Puedo jugar contigo?',
    options: [
      { id: 'opt_puedo_jugar', label: '"¿Puedo jugar contigo?"', isTarget: true },
      { id: 'opt_no_dice_nada', label: 'No dice nada o quita el juguete', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Palabras mágicas! Preguntar con cariño abre todas las puertas.',
      modelingFeedback: 'Se modela la frase en dramatización con Lúa y se practica con naturalidad.',
      adultGuidance: 'Iniciación social asertiva con iguales.',
    },
  },

  // ==========================================================================
  // 4–5 AÑOS — Narrativa, sintaxis y conceptos
  // ==========================================================================
  {
    id: 'lua_eval_4_5_01',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 1,
    mode: 'adult_record',
    prompt: 'Imagen de un niño junto a su helado caído en el suelo: "¿Qué pasó aquí?"',
    childRecast: 'Se le cayó el helado. ¡Está triste!',
    options: [
      { id: 'opt_helado_triste', label: '"Se le cayó el helado y está triste"', isTarget: true },
      { id: 'opt_esta_comiendo', label: '"Está comiendo"', isTarget: false },
      { id: 'opt_esta_saltando', label: '"Está saltando"', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Comprendiste muy bien la situación! Pobre niño, se cayó su helado.',
      modelingFeedback: 'Se acepta respuesta libre explicativa; las opciones sirven de apoyo si el niño duda.',
      adultGuidance: 'Lectura emocional e inferencia de causa contextual.',
    },
  },
  {
    id: 'lua_eval_4_5_02',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 2,
    mode: 'adult_record',
    questionPic: 'perro',
    prompt: 'El niño dice "perro corre". Lúa responde: "¡Sí! El perro corre rápido. ¿Puedes decirlo así?"',
    childRecast: '¡El perro corre rápido!',
    options: [
      { id: 'opt_repite_expandida', label: 'Repite la oración expandida', isTarget: true },
      { id: 'opt_repite_corta', label: 'Repite solo "perro corre"', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué bien suena tu oración larga y completa!',
      modelingFeedback: 'Técnica de recasting: se enriquece la sintaxis sin señalar error gramatical.',
      adultGuidance: 'Expansión sintáctica y modelado indirecto.',
    },
  },
  {
    id: 'lua_eval_4_5_03',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 3,
    mode: 'child_choice',
    prompt: '¿Cuál es lo opuesto de "grande"?',
    childRecast: 'Lo contrario de grande es pequeño.',
    options: [
      { id: 'opt_pequeno', label: 'Pequeño', isTarget: true, pic: 'osito-pequeno' },
      { id: 'opt_alto', label: 'Alto', isTarget: false, pic: 'arbol' },
      { id: 'opt_rapido', label: 'Rápido', isTarget: false, pic: 'correr' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Excelente! Lo contrario de grande es pequeño.',
      modelingFeedback: 'Se muestra visualmente el contraste entre un objeto grande y uno pequeño.',
      adultGuidance: 'Desarrollo de relaciones semánticas de antonimia.',
    },
  },
  {
    id: 'lua_eval_4_5_04',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 4,
    mode: 'adult_record',
    questionPic: 'sol',
    prompt: '¿Con qué sonido empieza la palabra "sol"?',
    childRecast: 'Ssss… sol. ¡Empieza con /s/!',
    options: [
      { id: 'opt_fonema_s', label: '/s/', isTarget: true },
      { id: 'opt_fonema_m', label: '/m/', isTarget: false },
      { id: 'opt_fonema_p', label: '/p/', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Sss-ol! ¡Empieza con el sonido /s/!',
      modelingFeedback: 'Lúa muestra la boca sonriente produciendo el sonido /s/ antes de repetir.',
      adultGuidance: 'Aislamiento fonémico inicial.',
    },
  },
  {
    id: 'lua_eval_4_5_05',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 5,
    mode: 'adult_record',
    questionPic: 'mesa',
    prompt: '¿Cuántas sílabas tiene "me-sa"?',
    childRecast: 'Me-sa. ¡Dos palmadas!',
    options: [
      { id: 'opt_silabas_dos', label: '2 sílabas', isTarget: true },
      { id: 'opt_silabas_una', label: '1 sílaba', isTarget: false },
      { id: 'opt_silabas_tres', label: '3 sílabas', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Dos palmadas! Me-sa tiene 2 sílabas.',
      modelingFeedback: 'Lúa da dos palmadas rítmicas al decir: "¡ME (1) - SA (2)!".',
      adultGuidance: 'Conciencia silábica con apoyo cinestésico.',
    },
  },
  {
    id: 'lua_eval_4_5_06',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 6,
    mode: 'adult_record',
    prompt: 'Juego de mesa: espera tu turno y sigue la instrucción del compañero',
    childRecast: '¡Espera un poquito! Ahora te toca.',
    options: [
      { id: 'opt_espera_regla', label: 'Espera y sigue la regla', isTarget: true },
      { id: 'opt_no_espera_juego', label: 'No espera su turno', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Gran jugador! Sabes esperar y divertirte en equipo.',
      modelingFeedback: 'Se acompaña de un reloj de arena animado o tarjeta de turno.',
      adultGuidance: 'Habilidades pragmáticas y funciones ejecutivas de inhibición.',
    },
  },
  {
    id: 'lua_eval_4_5_07',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 7,
    mode: 'adult_record',
    prompt: '¿Qué pasaría si se te cae un juguete al agua?',
    childRecast: 'Si cae al agua, se moja.',
    options: [
      { id: 'opt_moja_flota', label: '"Se moja / flota / se hunde"', isTarget: true },
      { id: 'opt_no_pasa_nada', label: '"No pasa nada"', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Buena deducción! El juguete se moja con el agua.',
      modelingFeedback: 'Se acepta cualquier predicción lógica y razonada.',
      adultGuidance: 'Razonamiento hipotético temprano.',
    },
  },
  {
    id: 'lua_eval_4_5_08',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 8,
    mode: 'adult_record',
    questionPic: 'perro',
    prompt: 'Nombra 3 animales que conozcas',
    childRecast: 'Perro, gato, pato. ¡Tres animales!',
    options: [
      { id: 'opt_tres_animales', label: 'Nombra 3 o más animales', isTarget: true },
      { id: 'opt_menos_animales', label: 'Nombra 1 o ninguno', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué gran zoológico conoces! ¡Tres animales geniales!',
      modelingFeedback: 'Si el niño se detiene, Lúa muestra siluetas de animales como pista amable.',
      adultGuidance: 'Fluidez léxica por categoría semántica.',
    },
  },
  {
    id: 'lua_eval_4_5_09',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 9,
    mode: 'adult_record',
    prompt: 'Cuenta con voz suave y relajada un cuento cortito de 2 líneas',
    childRecast: 'Despacito y suave, como Lúa.',
    options: [
      { id: 'opt_fluidez_cuento', label: 'Mantiene fluidez relajada', isTarget: true },
      { id: 'opt_bloqueos_cuento', label: 'Muestra tensión o repeticiones marcadas', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Me encantó tu historia! La contaste con calma y alegría.',
      modelingFeedback: 'Se continúa la historia de forma colaborativa sin remarcar ningún titubeo.',
      adultGuidance: 'Monitoreo de fluidez en habla conectada.',
    },
  },
  {
    id: 'lua_eval_4_5_10',
    ageBand: '4-5',
    area: 'sintaxis_narrativa',
    order: 10,
    mode: 'adult_record',
    questionPic: 'boca',
    prompt: 'Repite la secuencia de sonidos con Lúa: "pa-pa-pa, ma-ma-ma"',
    childRecast: 'Pa-pa-pa, ma-ma-ma. ¡Conmigo!',
    options: [
      { id: 'opt_repite_secuencia', label: 'Repite la secuencia motora', isTarget: true },
      { id: 'opt_falla_secuencia', label: 'No logra la secuencia rítmica', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Boca lista y afinada! ¡Pa-pa-pa, ma-ma-ma!',
      modelingFeedback: 'Lúa muestra en grande la boca abriendo y cerrando rítmicamente.',
      adultGuidance: 'Diadococinesia y praxias bucofonatorias secuenciales.',
    },
  },

  // ==========================================================================
  // 5–7 AÑOS — Conciencia fonológica, pragmática y estrategias de fluidez
  // ==========================================================================
  {
    id: 'lua_eval_5_7_01',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 1,
    mode: 'adult_record',
    prompt: '¿Cuántas sílabas tiene "ma-ri-po-sa"?',
    childRecast: 'Ma-ri-po-sa. ¡Cuatro palmadas!',
    options: [
      { id: 'opt_mariposa_cuatro', label: '4 sílabas', isTarget: true },
      { id: 'opt_mariposa_tres', label: '3 sílabas', isTarget: false },
      { id: 'opt_mariposa_dos', label: '2 sílabas', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Exacto! Ma-ri-po-sa tiene cuatro sílabas.',
      modelingFeedback: 'Lúa cuenta con las patitas: ma (1) - ri (2) - po (3) - sa (4).',
      adultGuidance: 'Segmentación de palabras polisilábicas.',
    },
  },
  {
    id: 'lua_eval_5_7_02',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 2,
    mode: 'adult_record',
    prompt: 'Tu amigo está triste porque perdió su juguete. ¿Qué le dices?',
    childRecast: '¿Quieres que te ayude a buscarlo?',
    options: [
      { id: 'opt_ayudo_buscar', label: '"¿Quieres que te ayude a buscarlo?"', isTarget: true },
      { id: 'opt_juega_solo', label: '"No importa, juega solo"', isTarget: false },
      { id: 'opt_juguete_feo', label: '"Ese juguete era feo"', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué buen amigo eres! Ayudar y escuchar consuela a los demás.',
      modelingFeedback: 'Lúa explica cómo la empatía y la colaboración hacen crecer las amistades.',
      adultGuidance: 'Habilidades de empatía y teoría de la mente.',
    },
  },
  {
    id: 'lua_eval_5_7_03',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 3,
    mode: 'adult_record',
    questionPic: 'saltar',
    prompt: 'Sigue esta instrucción sin mirar: "Toca tu cabeza y luego salta"',
    childRecast: 'Primero la cabeza, y después saltas.',
    options: [
      { id: 'opt_dos_pasos_auditivo', label: 'Completa ambos pasos en orden', isTarget: true },
      { id: 'opt_un_paso_auditivo', label: 'Completa solo uno de los pasos', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Atención de campeón! Oídos bien despiertos.',
      modelingFeedback: 'Se repite la consigna verbalmente una sola vez más antes de brindar apoyo visual.',
      adultGuidance: 'Procesamiento auditivo de órdenes complejas.',
    },
  },
  {
    id: 'lua_eval_5_7_04',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 4,
    mode: 'adult_record',
    prompt: '¿Qué palabra significa lo mismo que "contento"?',
    childRecast: 'Contento y feliz quieren decir lo mismo.',
    options: [
      { id: 'opt_sinonimo_feliz', label: 'Feliz', isTarget: true },
      { id: 'opt_sinonimo_triste', label: 'Triste', isTarget: false },
      { id: 'opt_sinonimo_cansado', label: 'Cansado', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Correcto! Estar contento es lo mismo que estar feliz.',
      modelingFeedback: 'Se comparan ambas palabras en una frase de ejemplo con Lúa sonriente.',
      adultGuidance: 'Relaciones de sinonimia léxica.',
    },
  },
  {
    id: 'lua_eval_5_7_05',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 5,
    mode: 'adult_record',
    prompt: '¿Cuál es lo opuesto de "alto"?',
    childRecast: 'Lo contrario de alto es bajo.',
    options: [
      { id: 'opt_antonimo_bajo', label: 'Bajo', isTarget: true },
      { id: 'opt_antonimo_rapido', label: 'Rápido', isTarget: false },
      { id: 'opt_antonimo_fuerte', label: 'Fuerte', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Eso es! Lo contrario de un árbol alto es un arbusto bajo.',
      modelingFeedback: 'Se apoya con la comparación visual de dos estaturas.',
      adultGuidance: 'Relaciones de antonimia dimensional.',
    },
  },
  {
    id: 'lua_eval_5_7_06',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 6,
    mode: 'adult_record',
    prompt: 'Escucha la historia y responde: "¿Por qué el niño se puso feliz?"',
    childRecast: 'Se puso feliz por lo que le pasó en el cuento.',
    options: [
      { id: 'opt_causa_acertada', label: 'Responde con la causa correcta del relato', isTarget: true },
      { id: 'opt_no_relaciona_causa', label: 'No relaciona la causa con la emoción', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Comprendiste la emoción del personaje perfectamente!',
      modelingFeedback: 'Se relee la parte relevante del cuento destacando la causa que produjo la alegría.',
      adultGuidance: 'Comprensión de causalidad emocional en textos narrativos.',
    },
  },
  {
    id: 'lua_eval_5_7_07',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 7,
    mode: 'adult_record',
    prompt: 'Practica un inicio suave de la palabra "mamá" antes de tu turno en el juego',
    childRecast: 'Mmmamá. Empieza suave, sin prisa.',
    options: [
      { id: 'opt_inicio_suave_ok', label: 'Produce un inicio suave y relajado', isTarget: true },
      { id: 'opt_inicio_con_tension', label: 'Muestra bloqueo o golpe de glotis', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué suave salió esa "m"! Como una caricia de aire.',
      modelingFeedback: 'Lúa respira hondo, junta suavemente los labios y emite: "mmmamá".',
      adultGuidance: 'Técnica de arranque vocal relajado para prevención de disfluencias.',
    },
  },
  {
    id: 'lua_eval_5_7_08',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 8,
    mode: 'child_choice',
    prompt: '¿Qué palabra rima con "gato"?',
    childRecast: 'Gato y pato riman: suenan igual al final.',
    options: [
      { id: 'opt_rima_pato', label: 'Pato', isTarget: true, pic: 'pato' },
      { id: 'opt_rima_perro', label: 'Perro', isTarget: false, pic: 'perro' },
      { id: 'opt_rima_casa', label: 'Casa', isTarget: false, pic: 'casa' },
    ],
    clinicalSupport: {
      targetFeedback: '¡Ga-to y Pa-to riman al final!',
      modelingFeedback: 'Se exageran las terminaciones rimadas: "ga-TO, pa-TO, los dos suenan igual".',
      adultGuidance: 'Conciencia fonológica de rima consonante.',
    },
  },
  {
    id: 'lua_eval_5_7_09',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 9,
    mode: 'adult_record',
    prompt: 'Cuéntale a Lúa algo divertido que hiciste el fin de semana (¿qué?, ¿quién?, ¿cuándo?)',
    childRecast: 'Cuéntame: ¿qué hiciste y con quién?',
    options: [
      { id: 'opt_narra_elementos', label: 'Narra con al menos 2 elementos estructurados', isTarget: true },
      { id: 'opt_narra_aislada', label: 'Responde con una sola palabra', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué gran aventura me contaste! Me lo imaginé todito.',
      modelingFeedback: 'Se apoya con preguntas facilitadoras: "¿Y quién fue contigo? ¿Qué hicieron primero?".',
      adultGuidance: 'Estructuración de discurso narrativo personal.',
    },
  },
  {
    id: 'lua_eval_5_7_10',
    ageBand: '5-7',
    area: 'conciencia_fonologica',
    order: 10,
    mode: 'adult_record',
    questionPic: 'perro',
    prompt: 'Lee en voz alta y pronuncia con calma el sonido /r/ en "perro"',
    childRecast: 'Perrrro. Con calma, sin apretar.',
    options: [
      { id: 'opt_produce_r', label: 'Produce el sonido con o sin apoyo', isTarget: true },
      { id: 'opt_sustituye_r', label: 'Sustituye u omite el sonido /r/', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Bravo por ese sonido de motor! ¡Pe-rro!',
      modelingFeedback: 'Lúa modela la vibración de la punta de la lengua en el paladar con una sonrisa.',
      adultGuidance: 'Articulación de la vibrante múltiple sin forzar ni frustrar.',
    },
  },

  // ==========================================================================
  // 7–10 AÑOS — Lenguaje abstracto, narrativa compleja y autorregulación
  // ==========================================================================
  {
    id: 'lua_eval_7_10_01',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 1,
    mode: 'adult_record',
    prompt: '¿Qué significa la expresión "estar en las nubes"?',
    childRecast: 'Estar en las nubes es estar distraído.',
    options: [
      { id: 'opt_distraido', label: 'Estar distraído o soñando despierto', isTarget: true },
      { id: 'opt_en_avion', label: 'Estar volando en un avión', isTarget: false },
      { id: 'opt_tener_frio', label: 'Tener mucho frío', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Exacto! Es una frase hecha que usamos cuando pensamos en otra cosa.',
      modelingFeedback: 'Se explica el sentido figurado con un ejemplo cotidiano: "Cuando te quedas pensando en tu juego".',
      adultGuidance: 'Comprensión de lenguaje figurado y modismos.',
    },
  },
  {
    id: 'lua_eval_7_10_02',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 2,
    mode: 'adult_record',
    prompt: 'Escucha tu propia voz grabada: "¿Sentiste tu habla suave y relajada en esta frase?"',
    childRecast: 'Escúchate otra vez. ¿Sonó suave?',
    options: [
      { id: 'opt_autoeval_facil', label: '"Sí, se sintió fácil y suave"', isTarget: true },
      { id: 'opt_autoeval_tensa', label: '"Un poco tensa o rápida"', isTarget: true },
      { id: 'opt_autoeval_duda', label: '"No estoy seguro"', isTarget: true },
    ],
    clinicalSupport: {
      targetFeedback: '¡Gran autoevaluación! Escucharse a uno mismo es el superpoder de los comunicadores.',
      modelingFeedback: 'Si percibió tensión, Lúa invita a respirar con las burbujas antes de continuar.',
      adultGuidance: 'Metacognición y automonitoreo de la tensión laríngea.',
    },
  },
  {
    id: 'lua_eval_7_10_03',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 3,
    mode: 'adult_record',
    prompt: 'En la historia, el personaje se fue sin decir una palabra. ¿Por qué crees que hizo eso?',
    childRecast: 'Quizá se fue porque estaba disgustado.',
    options: [
      { id: 'opt_inferencia_valida', label: 'Aporta una inferencia razonada (ej. estaba disgustado o apenado)', isTarget: true },
      { id: 'opt_no_sabe_inferir', label: 'Dice "no sé" sin intentar inferir', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Gran intuición! Los personajes a veces dicen mucho con lo que callan.',
      modelingFeedback: 'Lúa rescata pistas del texto: "Recuerda que acababa de perder su juego favorito…".',
      adultGuidance: 'Inferencia psicológica sobre intenciones y emociones.',
    },
  },
  {
    id: 'lua_eval_7_10_04',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 4,
    mode: 'adult_record',
    prompt: 'Un compañero copia tus respuestas en clase sin que el profesor lo vea. ¿Qué harías?',
    childRecast: 'Piénsalo con calma. ¿Qué harías tú?',
    options: [
      { id: 'opt_respuesta_reflexiva', label: 'Aporta una respuesta reflexiva y equilibrada', isTarget: true },
      { id: 'opt_evita_responder', label: 'Evita responder o da una respuesta impulsiva', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien reflexionado! Hablar con respeto y honestidad soluciona los problemas.',
      modelingFeedback: 'Se exploran con Lúa distintas alternativas asertivas (dialogar con el amigo, cuidar el examen).',
      adultGuidance: 'Razonamiento moral y resolución de conflictos sociales.',
    },
  },
  {
    id: 'lua_eval_7_10_05',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 5,
    mode: 'adult_record',
    prompt: '¿Qué es un "ecosistema"? Explícalo con tus propias palabras',
    childRecast: 'Un ecosistema son los seres vivos y su entorno.',
    options: [
      { id: 'opt_def_funcional', label: 'Da una definición funcional aproximada (seres vivos y su entorno)', isTarget: true },
      { id: 'opt_no_define', label: 'No logra definir el concepto', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué explicación tan clara! La naturaleza en equilibrio.',
      modelingFeedback: 'Se brinda un ejemplo concreto: "Como un bosque donde viven animales, árboles y ríos ayudándose".',
      adultGuidance: 'Definición de conceptos científicos y vocabulario abstracto.',
    },
  },
  {
    id: 'lua_eval_7_10_06',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 6,
    mode: 'adult_record',
    prompt: 'Organiza tu historia: inicio, problema y solución',
    childRecast: 'Inicio, problema y solución. ¡Las tres partes!',
    options: [
      { id: 'opt_tres_partes_historia', label: 'Incluye las 3 partes de forma coherente', isTarget: true },
      { id: 'opt_omite_partes', label: 'Omite el nudo o el desenlace', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Estructura de escritor experto! Tu historia tiene principio, emoción y final feliz.',
      modelingFeedback: 'Lúa muestra un mapa visual con 3 casillas: "¿Cómo empezó? ¿Qué se complicó? ¿Cómo se arregló?".',
      adultGuidance: 'Superestructura textual del discurso narrativo.',
    },
  },
  {
    id: 'lua_eval_7_10_07',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 7,
    mode: 'adult_record',
    prompt: '¿Cuál es el chiste o doble sentido en: "¿Por qué el libro de matemáticas estaba triste? ¡Porque tenía muchos problemas!"?',
    childRecast: 'Problemas de matemáticas y problemas de verdad. ¡Por eso hace gracia!',
    options: [
      { id: 'opt_explica_doble_sentido', label: 'Explica el juego de palabras (problemas matemáticos vs dificultades personales)', isTarget: true },
      { id: 'opt_no_capta_chiste', label: 'No identifica el doble sentido', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Exacto! "Problemas" de sumar y "problemas" de preocupaciones. ¡Qué ingenioso!',
      modelingFeedback: 'Lúa explica la polisemia de la palabra de forma amena y divertida.',
      adultGuidance: 'Metalingüística y comprensión del humor verbal.',
    },
  },
  {
    id: 'lua_eval_7_10_08',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 8,
    mode: 'adult_record',
    prompt: 'Practica el sonido /s/ mientras conversas espontáneamente con Lúa sobre tu día favorito',
    childRecast: 'Ssss… sigue contándome tu día.',
    options: [
      { id: 'opt_generaliza_s', label: 'Articula el sonido correctamente en habla espontánea', isTarget: true },
      { id: 'opt_solo_aislada_s', label: 'Solo lo logra en palabras leídas o aisladas', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Se te entiende estupendo! Tus frases fluyen con claridad.',
      modelingFeedback: 'Lúa conversa manteniendo el ritmo relajado y destacando auditivamente las /s/ con naturalidad.',
      adultGuidance: 'Generalización de la articulación al habla cotidiana.',
    },
  },
  {
    id: 'lua_eval_7_10_09',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 9,
    mode: 'adult_record',
    prompt: 'En la historia, primero llovió mucho y luego se llenó de agua la calle. ¿Cuál fue la causa de que se inundara?',
    childRecast: 'Se inundó porque llovió mucho.',
    options: [
      { id: 'opt_causa_lluvia', label: 'La lluvia abundante', isTarget: true },
      { id: 'opt_causa_inundacion', label: 'La inundación misma', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Muy bien pensado! La lluvia fue la causa que provocó que subiera el agua.',
      modelingFeedback: 'Lúa traza una línea de tiempo: "Causa (la lluvia) → Efecto (la calle con agua)".',
      adultGuidance: 'Relaciones de causalidad compleja en textos informativos y narrativos.',
    },
  },
  {
    id: 'lua_eval_7_10_10',
    ageBand: '7-10',
    area: 'lenguaje_abstracto',
    order: 10,
    mode: 'adult_record',
    questionPic: 'gato',
    prompt: 'Debate guiado: "¿Es mejor tener un perro o un gato de mascota?" Da tu opinión y escucha la de Lúa',
    childRecast: 'Di lo que piensas y escucha también a Lúa.',
    options: [
      { id: 'opt_debate_argumenta', label: 'Argumenta su punto de vista y respeta el turno', isTarget: true },
      { id: 'opt_debate_interrumpe', label: 'Interrumpe o no justifica su preferencia', isTarget: false },
    ],
    clinicalSupport: {
      targetFeedback: '¡Qué gran argumento me diste! Da gusto conversar y debatir contigo.',
      modelingFeedback: 'Lúa agradece el turno y ofrece un contraargumento amistoso para practicar el diálogo.',
      adultGuidance: 'Pragmática de la conversación dialéctica y argumentación oral.',
    },
  },
];

export const getQuestionsByAge = (ageBand: AgeBand): LuaAssessmentQuestion[] =>
  LUA_ASSESSMENT_CATALOG.filter((q) => q.ageBand === ageBand);

export const getQuestionById = (id: string): LuaAssessmentQuestion | undefined =>
  LUA_ASSESSMENT_CATALOG.find((q) => q.id === id);
