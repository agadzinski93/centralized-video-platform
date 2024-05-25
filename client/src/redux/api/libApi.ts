import { api } from "./api";

import type { ApiResponseTopicScreen, ApiResponseVideoScreen } from "../../types/types";

const LIB_PATH = '/lib';

type topicParams = {
    topic: string
}

type videoParams = {
    topic: string,
    video: string
}

const libApi = api.injectEndpoints({
    endpoints: build => ({
        renderTopicScreen: build.mutation<ApiResponseTopicScreen, topicParams>({
            query: params => ({
                url: `${LIB_PATH}/${params.topic}/renderTopicScreen`,
                method: 'GET'
            })
        }),
        renderVideoScreen: build.mutation<ApiResponseVideoScreen, videoParams>({
            query: params => ({
                url: `${LIB_PATH}/${params.topic}/${params.video}/renderVideoScreen`,
                method: 'GET'
            })
        })
    }),
    overrideExisting: false
});

export const { useRenderTopicScreenMutation, useRenderVideoScreenMutation } = libApi;