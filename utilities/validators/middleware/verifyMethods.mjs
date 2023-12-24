/**
 * The purpose of this file is to dynamically add 405 responses to unused methods
 * for each route. It also handles the OPTIONS method and returns usuable methods
 * to the client for that route.
 * 
 * The OPTIONS method and methods that return 405 will also have the 'Allow'
 * header included in the response.
 */

import { AppError } from "../../AppError.mjs";

const sendOptionsResponse = (methods,res) => {
    let output = '';
    for (let i = 0; i < methods.length; i++) {
        if (i === methods.length - 1) {
            output += `${methods[i]}`;
        }
        else {
            output += `${methods[i]},`;
        }
    }
    res.set('Allow',output);
    return output;
}

/**
 * Verify that the requested HTTP method exists for path
 * @param {object} map - example {GET: {cont: controllerFunc, pre[]: middleware to run first}} 
 * @returns 
 */
const verifyMethods = (methods) => {
    return async (req,res,next) => {
        if (req.method === 'OPTIONS') {
            const options = sendOptionsResponse(methods,res);
            return res.status(200).send(options);
        }
        else {
            const options = sendOptionsResponse(methods,res);
            return next(new AppError(405,`${req.method} method not allowed`));
        }
    }
}

export {verifyMethods};