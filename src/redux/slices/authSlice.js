import { createSlice } from '@reduxjs/toolkit';

const loadUser = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    return user && token ? { user: JSON.parse(user), token } : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadUser()?.user ?? null,
  token: loadUser()?.token ?? null,
  isAuthenticated: !!loadUser()?.token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
