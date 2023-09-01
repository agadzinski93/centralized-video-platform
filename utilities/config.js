let pathCSS;

if (process.env.HOSTED_ONLINE === 'true') {
    pathCSS = '/public/css/'
}
else
{
    pathCSS = '/css/'
}

module.exports = {
    pathCSS
}