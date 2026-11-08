// Un icono propio por tarea de los bloques Audición, Lenguaje, TEA y Dislexia
// (R20, Frank 8/11/2026): cada fila se distingue por lo que trabaja. Lucide (ISC).
import type React from 'react';
import {
  BadgeHelp, BookOpen, Brain, CaseSensitive, CircleAlert, CircleHelp, Combine, Copy, Eye, FlipHorizontal, FlipHorizontal2, Hand, Headphones, HeartHandshake, Hourglass, Layers, Layers3, ListChecks, ListOrdered, Locate, MessageCircle, MessageSquareText, PenLine, Repeat2, ScanEye, ScanFace, SearchX, Shirt, Shuffle, SmilePlus, Sparkles, Speech, TextCursorInput, Users, VenusAndMars, Workflow, Zap,
} from 'lucide-react-native';

export type TaskIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export const TASK_ICON: Record<string, TaskIcon> = {
  ff1: CaseSensitive,
  ff2: Speech,
  ff3: TextCursorInput,
  se1: SearchX,
  se2: BadgeHelp,
  se3: Shirt,
  ms1: Layers,
  ms2: VenusAndMars,
  ms3: Workflow,
  ms4: PenLine,
  pr1: CircleHelp,
  pr2: MessageSquareText,
  pr3: SmilePlus,
  pr4: Repeat2,
  ra1: Headphones,
  ra2: ScanFace,
  ra3: ListChecks,
  ra4: Hourglass,
  ra5: Locate,
  atencion_conjunta: Eye,
  imitacion: Copy,
  comprension: Brain,
  expresion: MessageCircle,
  comunicacion_funcional: Hand,
  regulacion_conductual: HeartHandshake,
  interaccion_social: Users,
  tea1: ScanEye,
  tea2: CircleAlert,
  tea3: FlipHorizontal,
  tea4: Shuffle,
  tea5: ListOrdered,
  tea6: Layers3,
  dx1: SearchX,
  dx2: BookOpen,
  dx3: Combine,
  dx4: Sparkles,
  dx5: FlipHorizontal2,
  dx6: Zap,
};
