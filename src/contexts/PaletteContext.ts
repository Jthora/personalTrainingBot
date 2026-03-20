import { createContext, useContext } from 'react';

interface PaletteControl {
  open: () => void;
}

export const PaletteContext = createContext<PaletteControl>({ open: () => {} });

export const usePalette = (): PaletteControl => useContext(PaletteContext);
