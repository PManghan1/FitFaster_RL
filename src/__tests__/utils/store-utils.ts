// Updated to specify type for initialState
import { create } from 'zustand';

export const createStore = (initialState: object) => create(() => initialState);
