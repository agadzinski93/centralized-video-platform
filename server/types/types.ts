import { Request } from "express"
import { AppError } from "../utilities/AppError"

/* Req w/ User Data */
interface RequestWithUser extends Request {
    user: UserObject
}

declare global {
    namespace Express {
        interface User extends UserObject {
        }
    }
}

/* API Response */

interface ApiResponse {
    response: string,
    status: number,
    message: string,
    prevPath?: string,
    data?: object
}

/* Passport-Related Types */
interface UserObject {
    user_id: string,
    username: string,
    email: string,
    password?: string,
    google_id?: string,
    activation_status: string,
    pic_url: string,
    pic_filename?: string,
    banner_url?: string,
    banner_filename?: string,
    settingRefreshTitle?: number,
    settingRefreshDescription?: number,
    settingRefreshThumbnail?: number
}

/* Pagination */
interface setPaginationDataObj {
    resultsPerPage: number,
    pageNum: number
}

/* Video Object */

interface ytVideoObject {
    title: string,
    description: string,
    url: string,
    views: number | string,
    thumbnail: string
}

interface videoObject extends ytVideoObject {
    username: string
}

/* Video Helpers */
type modifyVideoFn = {
    (id: string, title: string, description: string, thumbnail: string): Promise<{ title: string, description: string, thumbnail: string } | AppError>;
    (id: string, title: null, description: string, thumbnail: string): Promise<{ title: null, description: string, thumbnail: string } | AppError>;
    (id: string, title: string, description: null, thumbnail: string): Promise<{ title: string, description: null, thumbnail: string } | AppError>;
    (id: string, title: string, description: string, thumbnail: null): Promise<{ title: string, description: string, thumbnail: null } | AppError>;
    (id: string, title: null, description: null, thumbnail: string): Promise<{ title: null, description: null, thumbnail: string } | AppError>;
    (id: string, title: string, description: null, thumbnail: null): Promise<{ title: string, description: null, thumbnail: null } | AppError>;
    (id: string, title: null, description: string, thumbnail: null): Promise<{ title: null, description: string, thumbnail: null } | AppError>;
    (id: string, title: null, description: null, thumbnail: null): Promise<{ title: null, description: null, thumbnail: null } | AppError>;
}

export {
    RequestWithUser,
    ApiResponse,
    UserObject,
    ytVideoObject,
    videoObject,
    setPaginationDataObj,
    modifyVideoFn
}