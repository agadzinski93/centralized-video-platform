import { createSlice } from "@reduxjs/toolkit";
const token: string | null = localStorage.getItem('userToken') || null;

type authState = {
    token: string | null,
    isLoading: boolean
}

const initialState: authState = {
    token: token,
    isLoading: true
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isLoading = false;
            localStorage.setItem('userToken', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.token = null;
            state.isLoading = false;
            localStorage.removeItem('userToken');
        }
    }
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;