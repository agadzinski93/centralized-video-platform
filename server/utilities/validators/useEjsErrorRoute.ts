import { Request, Response, NextFunction } from "express"

/**
 * Checks the request path to determine whether error route should use res.render or res.json
 * @param req 
 * @param res 
 * @param next 
 */
const useEjsErrorRoute = (path: string): boolean => {
    let resRender = false;
    switch (path) {
        case '/':
        case '/search':
        case '/:topic':
        case '/:topic/:video':
        case '/login':
        case '/register':
        case '/:username':
        case '/:username/settings':
        case '/:username/dashboard':
        case '*':
            resRender = true;
            break;
        default:
            resRender = false;
    }
    return resRender;
}

export { useEjsErrorRoute };