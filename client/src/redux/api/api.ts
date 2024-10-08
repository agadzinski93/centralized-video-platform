import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

//Default PORT of 3000 is supplied for use with Github Actions
const PORT = import.meta.env.VITE_PROXY_TARGET_PORT || 3000;
const BASE_PATH = (import.meta.env.PROD) ? '/api/v1' : `http://localhost:${PORT}/api/v1`

const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_PATH
    }),
    endpoints: () => ({})
});

export { api };