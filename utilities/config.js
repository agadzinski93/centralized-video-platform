let pathCSS;

if (process.env.HOSTED_ONLINE === 'true') {
    pathCSS = '/'
}
else
{
    pathCSS = '/css/'
}

module.exports = {
    pathCSS
}