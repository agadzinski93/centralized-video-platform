interface FlashMessageInfo {
    type: string,
    message: string
}

interface FlashMessageType extends FlashMessageInfo {
    id: number,
}

interface ApiResponse {
    response: string,
    status: number,
    message: string,
    prevPath: string,
    data?: object
}

interface ApiResponseTopicScreen extends ApiResponse {
    data: {
        topic: topic,
        videos: video[]
    }
}

interface ApiResponseVideoScreen extends ApiResponse {
    data: {
        topic: topic,
        video: video & { videoId: string, subscribers: number },
        videos: video[],
        subscribed: boolean | null
    }
}

interface ApiResponseUserScreen extends ApiResponse {
    data: {
        author: {
            user_id: string,
            username: string,
            pic_url: string
        },
        user: user
    }
}

interface RtkQueryResponse<T = ApiResponse> {
    data?: T,
    error?: {
        data: T,
        error: string
    }
}

type authState = {
    auth: {
        isAuthenticated: boolean,
        token: object | null,
        isLoading: boolean
    };
};
interface topic {
    name: string,
    description: string,
    difficulty: string,
    username: string,
    topicUrl: string,
    imageUrl: string,
    pic_url: string,
    timeCreated: string
}
interface video {
    title: string,
    description: string,
    url: string,
    topic: string,
    thumbnail: string,
    username: string,
    pic_url: string,
    topicUrl: string,
    timeCreated: string
}

interface user {
    user_id: string,
    username: string,
    display_name: string,
    dateJoined: string,
    pic_url: string,
    banner_url: string,
    about_me: string,
    subscribers: number,
    subscriptions: number
}

const castApiResponse = <T = ApiResponse>(input: { error: object } | { data: T }) => {
    return (input as RtkQueryResponse<T>);
}

export type {
    FlashMessageInfo,
    FlashMessageType,
    ApiResponse,
    ApiResponseTopicScreen,
    ApiResponseVideoScreen,
    ApiResponseUserScreen,
    RtkQueryResponse,
    authState,
    topic,
    video
};
export { castApiResponse };