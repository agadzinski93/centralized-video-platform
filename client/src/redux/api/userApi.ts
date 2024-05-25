import { api } from "./api";

const USER_PATH = '/user';

import type { ApiResponseUserScreen } from "../../types/types";

type userParams = {
    username: string
}

const userApi = api.injectEndpoints({
    endpoints: build => ({
        renderUserScreen: build.mutation<ApiResponseUserScreen, userParams>({
            query: params => ({
                url: `${USER_PATH}/${params.username}/renderUserScreen`,
                method: 'GET'
            })
        })
    }),
    overrideExisting: false
});

export const { useRenderUserScreenMutation } = userApi;