import { createSlice } from '@reduxjs/toolkit';

export type Theme = 'dark' | 'light';

function loadInitialTheme(): Theme {
  const stored = localStorage.getItem('exitcaff_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
}

const initialState = { theme: loadInitialTheme() };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('exitcaff_theme', state.theme);
    },
  },
});

export const { toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
