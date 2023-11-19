let pathCSS;
let pathAssets

if (process.env.HOSTED_ONLINE === 'true') {
    pathCSS = '/public/css/';
    pathAssets = '/public/assets/';
}
else
{
    pathCSS = '/css/';
    pathAssets = '/assets/';
}

module.exports = {
    pathCSS,
    pathAssets
}