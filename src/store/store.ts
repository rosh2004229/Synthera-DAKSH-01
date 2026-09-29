import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import deviceReducer from './deviceSlice';
import settingsReducer from './settingsSlice';
import logsReducer from './logsSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    settings: settingsReducer,
    logs: logsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // For responsive high-frequency 20Hz telemetry dispatches
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
