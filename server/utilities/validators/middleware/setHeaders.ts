import { Request, Response, NextFunction } from "express";

const setCache = (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-cache, max-age=3600, must-revalidate');
    next();
}

const setCors = (options = { origin: null }) => (req: Request, res: Response, next: NextFunction) => {
    let {
        origin = (req.get('ORIGIN')) ? req.get('ORIGIN') : req.get('REFERER')
    } = options;
    if (!origin) origin = '*'; //This fallback will disable requests with credentials

    res.set('Access-Control-Allow-Origin', origin);
    next();
}

export { setCache, setCors };