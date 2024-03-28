import { HOSTED_ONLINE } from "./config.mjs";

let pathCSS;
let pathAssets

if (HOSTED_ONLINE === 'true') {
    pathCSS = '/public/css/';
    pathAssets = '/public/assets/';
}
else
{
    pathCSS = '/css/';
    pathAssets = '/assets/';
}

export {
    pathCSS,
    pathAssets
};