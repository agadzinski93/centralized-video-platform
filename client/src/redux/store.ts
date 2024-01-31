import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'
import { api } from './api/api'

export default configureStore({
    reducer: {
        auth: authReducer,
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});