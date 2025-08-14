import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setAuthUser(state, action) {
      state.authUser = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.authUser = null;
    },
  },
});

export const { setUser, setAuthUser, clearUser } = userSlice.actions;
export default userSlice.reducer;