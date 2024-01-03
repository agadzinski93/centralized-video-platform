type ApiResponse = {
    response: string;
    status: number;
    message: string;
    previousUrl: string;
    data?: object;
};

export type { ApiResponse };