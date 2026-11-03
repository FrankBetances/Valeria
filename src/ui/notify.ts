// Avisos de la app («guardado», «modo profesional») con sonner-native (MIT):
// aparecen arriba, se apartan deslizando y se leen con el lector de pantalla.
import { toast } from 'sonner-native';

export const notify = (message: string) => { if (message) toast.success(message); };
