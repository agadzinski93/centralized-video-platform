import { AppError } from "../../AppError.mjs";
import multer from "multer";

/**
 * Verify that the requested HTTP method exists for path
 * @param {object} map - example {GET: {cont: controllerFunc, pre[]: middleware to run first}} 
 * @returns 
 */
const verifyMethods = (map) => {
    return async (req,res,next) => {
        let controller = null;
        let middleware = null;
        let post = null;
        // First, check to see if req path contains the requested method
        if (Object.keys(map).includes(req.method)) {
            switch (req.method) {
                case 'GET':
                    middleware = map.GET.pre;  //Optional array of middleware that should run first
                    controller = map.GET.cont; //Controller function to execute
                    post = map.GET.post;       //Optional array of middleware after controller
                    break;
                case 'POST':
                    middleware = map.POST.pre;
                    controller = map.POST.cont;
                    post = map.POST.post;
                    break;
                case 'PUT':
                    middleware = map.PUT.pre;
                    controller = map.PUT.cont;
                    post = map.PUT.post;
                    break;
                case 'PATCH':
                    middleware = map.PATCH.pre;
                    controller = map.PATCH.cont;
                    post = map.PATCH.post;
                    break;
                case 'DELETE':
                    middleware = map.DELETE.pre;
                    controller = map.DELETE.cont;
                    post = map.DELETE.post;
                    break;
                default:
                    return next(new AppError(405,`${req.method} method not allowed`));
            };
            if (middleware) {
                for (let i = 0; i < middleware.length; i++) {
                    await middleware[i](req,res,next);
                    // If headers were returned in a middleware, exit out immediately
                    if (res.headersSent) return;
                }
            }
            if (typeof controller === 'function') {
                await controller(req,res,next);
                if (res.headersSent) return;
            }
            else {
                return next(new AppError(500, 'Method Verification Failed.'));
            }
            if (post) {
                for (let i = 0; i < post.length; i++) {
                    await post[i](req,res,next);
                    // If headers were returned in a middleware, exit out immediately
                    if (res.headersSent) return;
                }
            }
        }
        else {
            return next(new AppError(405,`${req.method} method not allowed`));
        }
    }
}

export {verifyMethods};