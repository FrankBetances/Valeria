// React Native 0.88 retiró InteractionManager. Su sustituto oficial es
// requestIdleCallback: el trabajo espera a que el hilo de JS quede libre.
type Handle = { cancel: () => void };

export function runAfterInteractions(task: () => unknown): Handle {
  const g = globalThis as unknown as {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (g.requestIdleCallback) {
    const id = g.requestIdleCallback(() => { void task(); });
    return { cancel: () => g.cancelIdleCallback?.(id) };
  }
  const id = setTimeout(() => { void task(); }, 0);
  return { cancel: () => clearTimeout(id) };
}
