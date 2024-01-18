const setCache = (req,res,next) => {
    res.set('Cache-Control','no-cache, max-age=3600, must-revalidate');
    next();
}

const setCors = (options = {}) => (req,res,next) => {
    let {
        origin = (req.get('ORIGIN')) ? req.get('ORIGIN') : req.get('REFERER')
    } = options;
    if (!origin) origin = '*'; //This fallback will disable requests with credentials

    res.set('Access-Control-Allow-Origin',origin);
    next();
}

export {setCache,setCors};