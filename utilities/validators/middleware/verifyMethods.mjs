/**
 * The purpose of this file is to dynamically add 405 responses to unused methods
 * for each route. It also handles the OPTIONS method and returns usable methods
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
 * @param {string[]} methods - array of acceptable HTTP methods (do NOT include OPTIONS as it's generated automatically) 
 * @returns 
 */
const verifyMethods = (methods) => {
    return async (req,res,next) => {
        const options = sendOptionsResponse(methods,res);
        if (req.method === 'OPTIONS') {
            return res.status(200).send(options);
        }
        else {
            return next(new AppError(405,`${req.method} method not allowed`));
        }
    }
}

export {verifyMethods};