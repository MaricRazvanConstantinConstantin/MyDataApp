import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipesReducer from './recipesSlice';
import messagesReducer from './messagesSlice';
import reviewsReducer from './reviewsSlice';
import timersReducer from './timersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipesReducer,
    messages: messagesReducer,
    reviews: reviewsReducer,
    timers: timersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
