import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import jobReducer from './jobSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage

const persistConfig = {
  key: 'root',
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer, jobReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    job: persistedUserReducer,
  },
});

export const persistor = persistStore(store);