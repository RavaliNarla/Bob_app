// src/store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './userSlice';
import jobReducer from './jobSlice';
import resumeReducer from './resumestore'; // <-- your new batch uploader slice

// 1) Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  job: jobReducer,
  resume: resumeReducer, // holds File objects; don't persist this
});

// 2) Persist config
//    Option A: blacklist 'resume' so only user & job are persisted.
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['resume'],
};

// If you prefer whitelist instead, use:
// const persistConfig = { key: 'root', storage, whitelist: ['user', 'job'] };

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3) Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      // resume slice keeps File objects (non-serializable) -> disable check
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 4) Persistor
export const persistor = persistStore(store);
