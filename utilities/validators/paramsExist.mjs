/**
 * Pass in all req.params and req.body variables you wish to verify exist
 * @param {[]} args 
 * @returns 
 */
const paramsExist = (args) => {
    let exists = true;
    let i = 0;
    if (args.length > 0) {
        do {
            if (!args[i]) exists = false;
            i++;
        } while(i < args.length && exists);
    }
    return exists;
}
export {paramsExist};