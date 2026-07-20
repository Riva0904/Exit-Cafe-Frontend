import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '@/api/client';
import type { AuthResponse, AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

function loadInitialUser(): AuthUser | null {
  const raw = localStorage.getItem('exitcaff_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: loadInitialUser(),
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { accessToken, refreshToken, ...user } = action.payload;
      tokenStorage.setTokens(accessToken, refreshToken);
      localStorage.setItem('exitcaff_user', JSON.stringify(user));
      state.user = user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      tokenStorage.clear();
      localStorage.removeItem('exitcaff_user');
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
