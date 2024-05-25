import { createSlice } from "@reduxjs/toolkit";
const token: string | null = localStorage.getItem('userToken') || null;
const profile = (typeof token === 'string') ? JSON.parse(token) : token;

const verifyProfile = (unverifiedProfile: object | null) => {
    if (unverifiedProfile) {
        return ['user_id', 'email', 'username', 'pic_url'].every((prop) => Object.prototype.hasOwnProperty.call(unverifiedProfile, prop));
    } else {
        return false;
    }
}

type authState = {
    isAuthenticated: boolean,
    profile: object | null
}

const initialState: authState = {
    isAuthenticated: (profile) ? verifyProfile(profile) : false,
    profile: (verifyProfile(profile)) ? profile : null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isAuthenticated = true;
            state.profile = action.payload;
            localStorage.setItem('userToken', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.profile = null;
            localStorage.removeItem('userToken');
        }
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;