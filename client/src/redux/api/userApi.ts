import { api } from "./api";

const USER_PATH = '/user';

import type { ApiResponseUserScreen, ApiResponseGetUserContent } from "../../types/types";

type userParams = {
    username: string
}

type getAuthorContent = {
    username: string,
    content?: 'topics' | 'videos' | 'about-me',
    viewAll?: boolean,
    page?: number
}

const userApi = api.injectEndpoints({
    endpoints: build => ({
        renderUserScreen: build.mutation<ApiResponseUserScreen, userParams>({
            query: params => ({
                url: `${USER_PATH}/${params.username}/renderUserScreen`,
                method: 'GET'
            })
        }),
        getUserContent: build.mutation<ApiResponseGetUserContent, getAuthorContent>({
            query: params => {
                const content = (params.content) || 'topics';
                const viewAll = (params.viewAll) ? params.viewAll.toString() : 'false';
                const page = (params.page) ? params.page.toString() : '0';
                return {
                    url: `${USER_PATH}/${params.username}/getUserContent?content=${content}&viewAll=${viewAll}&page=${page}`,
                    method: 'GET'
                }
            }
        })
    }),
    overrideExisting: false
});

export const { useRenderUserScreenMutation, useGetUserContentMutation } = userApi;