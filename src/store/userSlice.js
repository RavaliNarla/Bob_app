import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authUser: null,
  candidateId: null,
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
    setCandidate(state, action) {
      state.candidateId = action.payload; // Step 2: Handle candidateId
    },
    clearUser(state) {
      state.user = null;
      state.authUser = null;
    },
  },
});

export const { setUser, setAuthUser, clearUser, setCandidate } = userSlice.actions;
export default userSlice.reducer;