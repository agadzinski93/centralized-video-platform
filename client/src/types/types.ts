interface ApiResponse {
    response: string,
    status: number,
    message: string,
    prevPath: string,
    data?: object
}

interface RtkQueryResponse {
    data?: ApiResponse,
    error?: {
        data: ApiResponse
    }
}

type authState = {
    auth: {
        token: string | null;
    };
};

const castApiResponse = (input: { error: object } | { data: object }) => {
    return (input as RtkQueryResponse);
}

export type { ApiResponse, RtkQueryResponse, authState };
export { castApiResponse };