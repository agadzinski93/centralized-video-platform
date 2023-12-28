const setHeaders = (req,res,next) => {
    res.set('Cache-Control','no-cache, max-age=3600, must-revalidate');
    next();
}

export {setHeaders};