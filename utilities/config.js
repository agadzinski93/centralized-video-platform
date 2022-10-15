let pathCSS;

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'Development') {
    pathCSS = '/css/'
}
else
{
    pathCSS = '/public/css/'
}

module.exports = {
    pathCSS
}