import { api } from "./api";

import type { ApiResponseSearchScreen, ApiResponseGetMoreResults } from "../../types/types";

type searchQuery = {
    q: string
}

type searchQueryPaginate = {
    searchQuery: string,
    pageNumber: number
}

const searchApi = api.injectEndpoints({
    endpoints: build => ({
        renderSearchScreen: build.mutation<ApiResponseSearchScreen, searchQuery>({
            query: query => ({
                url: `/renderSearchScreen/?q=${query.q}`,
                method: 'GET'
            })
        }),
        getMoreResults: build.mutation<ApiResponseGetMoreResults, searchQueryPaginate>({
            query: body => ({
                url: `/search`,
                method: 'POST',
                body
            })
        })
    }),
    overrideExisting: false
});

export const { useRenderSearchScreenMutation, useGetMoreResultsMutation } = searchApi;