// Adaptador que conserva la última escritura fallida para reintentarla.
// redux-persist captura los errores de setItem: flush() por sí solo no los propaga.
export function almacenamientoRecuperable(base: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<unknown>;
}) {
  let pendiente: { key: string; value: string } | null = null;
  let cola: Promise<unknown> = Promise.resolve();
  const setItem = (key: string, value: string): Promise<unknown> => {
    const trabajo = cola.catch(() => {}).then(async () => {
      pendiente = { key, value };
      await base.setItem(key, value);
      pendiente = null;
    });
    cola = trabajo;
    return trabajo;
  };
  return {
    getItem: base.getItem, removeItem: base.removeItem, setItem,
    async verificar() {
      await cola.catch(() => {});
      if (pendiente) await setItem(pendiente.key, pendiente.value);
    },
  };
}
