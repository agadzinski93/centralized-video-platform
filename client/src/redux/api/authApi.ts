import { api } from "./api";

import type { ApiResponse } from "../../types/types";

const AUTH_PATH = '/auth';

type registerData = {
    username: string,
    email: string,
    password: string,
    confirmPassword: string
}
type loginData = {
    username: string,
    password: string
}

const authApi = api.injectEndpoints({
    endpoints: build => ({
        registerUser: build.mutation<ApiResponse, registerData>({
            query: formData => ({
                url: `${AUTH_PATH}/registerUser`,
                method: 'POST',
                body: formData
            })
        }),
        loginUser: build.mutation<ApiResponse, loginData>({
            query: formData => ({
                url: `${AUTH_PATH}/loginUser`,
                method: 'POST',
                body: formData
            })
        }),
        logoutUser: build.mutation<ApiResponse, null>({
            query: () => ({
                url: `${AUTH_PATH}/logoutUser`,
                method: 'POST'
            })
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation
} = authApi;