// Modalidad I · Solo Lúa (PLAN-INTEGRACION-AR-LUA-CONSTRUYE v3.0 §4).
// Actividades sin set que se juegan con un ejercicio nativo que YA existe.
// L04 («despertar sereno») no está: el plan la apoyaba en AR-3, que es
// selección por fijación, no calma sostenida. Frank eligió el 2/11/2026
// sustituirla por L07 sobre AR-6.
//
// El módulo nativo solo devuelve el resultado al cerrar: Lúa cambia de cara al
// empezar y al terminar, nunca a mitad del gesto. Nada de aquí se locuta.
import type { ArExerciseId } from '../valeriaArBridge';
import type { AdultText, LuaSemanticExpression, TripartiteCycle } from './types';
import { a } from './worlds/retos';

export type LuaSoloId = 'L01' | 'L07';

export interface LuaSoloActivity {
  readonly id: LuaSoloId;
  readonly exerciseId: ArExerciseId;
  readonly title: AdultText;
  readonly summary: AdultText;
  readonly ages: string;
  readonly cycle: TripartiteCycle;
  /** Cara de Lúa antes de abrir la cámara y al acabar la sesión. */
  readonly luaStart: LuaSemanticExpression;
  readonly luaEnd: LuaSemanticExpression;
}

export const LUA_SOLO_ACTIVITIES: readonly LuaSoloActivity[] = [
  {
    id: 'L01',
    exerciseId: 'ar1',
    ages: '2–6',
    title: a(['El espejo de gestos de Lúa', 'Lúa’s gesture mirror', 'El mirall de gestos de la Lúa', 'O espello de xestos de Lúa']),
    summary: a([
      'Boca redonda frente a la cámara, sin hablar. El micrófono está apagado.',
      'Round lips in front of the camera, no talking. The microphone is off.',
      'Boca rodona davant de la càmera, sense parlar. El micròfon està apagat.',
      'Boca redonda diante da cámara, sen falar. O micrófono está apagado.',
    ]),
    cycle: {
      observa: {
        phenomenonTrigger: a([
          'Pon a Lúa al lado del soporte, mirando al niño. Haz tú la boca de pompón despacio y quédate quieto.',
          'Place Lúa next to the stand, facing the child. Make a slow bubble mouth yourself and hold still.',
          'Posa la Lúa al costat del suport, mirant el nen. Fes tu la boca de bombolla a poc a poc i queda’t quiet.',
          'Pon a Lúa ao lado do soporte, mirando para o neno. Fai ti a boca de pompa amodo e quédate quieto.',
        ]),
        socraticQuestion: a([
          '¿Qué le pasa a mi boca cuando soplo una pompa sin soplar?',
          'What does my mouth do when I blow a bubble without blowing?',
          'Què fa la meva boca quan bufo una bombolla sense bufar?',
          'Que lle pasa á miña boca cando sopro unha pompa sen soprar?',
        ]),
        mandatorySilenceSec: 5,
      },
      experimenta: {
        adultStepByStep: a([
          'Abre la cámara. El niño pone boca redonda o abierta y la sostiene un momento; el coche avanza mientras dura.',
          'Open the camera. The child makes a round or open mouth and holds it a moment; the car moves while it lasts.',
          'Obre la càmera. El nen fa boca rodona o oberta i l’aguanta un moment; el cotxe avança mentre dura.',
          'Abre a cámara. O neno pon a boca redonda ou aberta e mantena un intre; o coche avanza mentres dura.',
        ]),
        hints: {
          level1Socratic: a([
            '¿Y si escondemos los labios o los estiramos despacito?',
            'What if we hide our lips or stretch them slowly?',
            'I si amaguem els llavis o els estirem a poc a poc?',
            'E se agochamos os beizos ou os estiramos amodiño?',
          ]),
          level2PhysicalModel: a([
            'Entra en el encuadre al lado del niño y haz el gesto a cámara lenta.',
            'Step into the frame next to the child and do the gesture in slow motion.',
            'Entra a l’enquadrament al costat del nen i fes el gest a càmera lenta.',
            'Entra no encadre ao lado do neno e fai o xesto a cámara lenta.',
          ]),
        },
      },
      construye: {
        tangibleMakeChallenge: a([
          'Al acabar, el niño elige un accesorio del armario de Lúa y se lo pone.',
          'When done, the child picks an item from Lúa’s wardrobe and puts it on her.',
          'En acabar, el nen tria un accessori de l’armari de la Lúa i l’hi posa.',
          'Ao rematar, o neno escolle un accesorio do armario de Lúa e pónllelo.',
        ]),
        transferQuestion: a([
          '¿Con qué otra cosa ponemos la boca redonda? ¿Al besar, al soplar una vela?',
          'When else do we make a round mouth? Kissing, blowing out a candle?',
          'Amb què més posem la boca rodona? En fer un petó, en bufar una espelma?',
          'Con que outra cousa poñemos a boca redonda? Ao bicar, ao soprar unha vela?',
        ]),
      },
    },
    luaStart: 'atenta',
    luaEnd: 'celebra_corta',
  },
  {
    id: 'L07',
    exerciseId: 'ar6',
    ages: '3–6',
    title: a(['Imita a Lúa', 'Copy Lúa', 'Imita la Lúa', 'Imita a Lúa']),
    summary: a([
      'Lúa hace un gesto con la cara y el niño lo copia frente a la cámara.',
      'Lúa makes a face and the child copies it in front of the camera.',
      'La Lúa fa un gest amb la cara i el nen el copia davant de la càmera.',
      'Lúa fai un xesto coa cara e o neno cópiao diante da cámara.',
    ]),
    cycle: {
      observa: {
        phenomenonTrigger: a([
          'Pon a Lúa al lado del soporte. Copia tú, despacio, una cara: sonrisa grande o mejillas infladas.',
          'Place Lúa next to the stand. Slowly copy a face yourself: a big smile or puffed cheeks.',
          'Posa la Lúa al costat del suport. Copia tu, a poc a poc, una cara: un gran somriure o les galtes inflades.',
          'Pon a Lúa ao lado do soporte. Copia ti, amodo, unha cara: un sorriso grande ou as meixelas inchadas.',
        ]),
        socraticQuestion: a([
          '¿Qué cara estoy poniendo? ¿Me sale igual que a Lúa?',
          'What face am I making? Does it look like Lúa’s?',
          'Quina cara faig? Em surt igual que a la Lúa?',
          'Que cara estou a poñer? Sáeme igual que a Lúa?',
        ]),
        mandatorySilenceSec: 5,
      },
      experimenta: {
        adultStepByStep: a([
          'Abre la cámara. Lúa en 3D enseña un gesto; el niño lo copia y lo sostiene hasta que Lúa celebra.',
          'Open the camera. 3D Lúa shows a gesture; the child copies it and holds it until Lúa celebrates.',
          'Obre la càmera. La Lúa en 3D ensenya un gest; el nen el copia i l’aguanta fins que la Lúa ho celebra.',
          'Abre a cámara. Lúa en 3D amosa un xesto; o neno cópiao e mantéño ata que Lúa o celebra.',
        ]),
        hints: {
          level1Socratic: a([
            '¿Lúa tiene la boca abierta o cerrada? ¿Y los mofletes?',
            'Is Lúa’s mouth open or closed? And her cheeks?',
            'La Lúa té la boca oberta o tancada? I les galtes?',
            'Lúa ten a boca aberta ou pechada? E as meixelas?',
          ]),
          level2PhysicalModel: a([
            'Ponte junto al niño, haz el gesto con él y sostenedlo a la vez.',
            'Sit next to the child, make the gesture together and hold it at the same time.',
            'Posa’t al costat del nen, fes el gest amb ell i aguanteu-lo alhora.',
            'Ponte xunto ao neno, fai o xesto con el e mantédeo á vez.',
          ]),
        },
      },
      construye: {
        tangibleMakeChallenge: a([
          'Ahora el niño inventa una cara y Lúa (tú, con la gata en la mano) la copia.',
          'Now the child invents a face and Lúa (you, holding the cat) copies it.',
          'Ara el nen s’inventa una cara i la Lúa (tu, amb la gata a la mà) la copia.',
          'Agora o neno inventa unha cara e Lúa (ti, coa gata na man) cópiaa.',
        ]),
        transferQuestion: a([
          '¿Qué cara pones cuando algo te sorprende? ¿Y cuando estás contento?',
          'What face do you make when something surprises you? And when you are happy?',
          'Quina cara fas quan alguna cosa et sorprèn? I quan estàs content?',
          'Que cara pos cando algo te sorprende? E cando estás contento?',
        ]),
      },
    },
    luaStart: 'curiosa',
    luaEnd: 'alegre',
  },
];

export function luaSoloActivity(id: LuaSoloId): LuaSoloActivity | undefined {
  return LUA_SOLO_ACTIVITIES.find((x) => x.id === id);
}
