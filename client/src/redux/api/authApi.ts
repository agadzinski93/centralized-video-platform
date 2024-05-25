import { api } from "./api";

import type { ApiResponse } from "../../types/types";

const AUTH_PATH = '/auth';

type registerData = {
    username: string,
    email: string,
    password: string,
    confirmPassword: string
}
type registerGoogle = {
    username: string,
    email: string,
    google_id: string
}
type loginData = {
    username: string,
    password: string
}
type usernameData = {
    username: string,
    email?: string,
    google_id?: string
}
type verifyEmailData = {
    userId: string,
    key: string
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
        registerUserGoogle: build.mutation<ApiResponse, registerGoogle>({
            query: formData => ({
                url: `${AUTH_PATH}/register/google`,
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
        }),
        usernameExists: build.mutation<ApiResponse, usernameData>({
            query: formData => ({
                url: `${AUTH_PATH}/usernameExists`,
                method: 'POST',
                body: formData
            })
        }),
        verifyEmail: build.mutation<ApiResponse, verifyEmailData>({
            query: params => ({
                url: `${AUTH_PATH}/${params.userId}/verifyEmail/${params.key}`,
                method: 'GET'
            })
        })
    }),
    overrideExisting: false
});

export const {
    useRegisterUserMutation,
    useRegisterUserGoogleMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useUsernameExistsMutation,
    useVerifyEmailMutation
} = authApi;