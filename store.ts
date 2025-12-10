import { create } from 'zustand';
import { AppState, HandGesture } from './types';

interface TreeStore {
  appState: AppState;
  handGesture: HandGesture;
  isCameraReady: boolean;
  setAppState: (state: AppState) => void;
  setHandGesture: (gesture: HandGesture) => void;
  setCameraReady: (ready: boolean) => void;
  toggleState: () => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  appState: AppState.FORMED,
  handGesture: { gesture: 'None', x: 0.5, y: 0.5 },
  isCameraReady: false,
  setAppState: (state) => set({ appState: state }),
  setHandGesture: (gesture) => set({ handGesture: gesture }),
  setCameraReady: (ready) => set({ isCameraReady: ready }),
  toggleState: () => set((state) => ({ 
    appState: state.appState === AppState.FORMED ? AppState.CHAOS : AppState.FORMED 
  })),
}));
