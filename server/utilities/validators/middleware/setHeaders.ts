import { Request, Response, NextFunction } from "express";
import { NODE_ENV } from "../../config";

const setCache = (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-cache, max-age=3600, must-revalidate');
    next();
}

const setCors = (options = { origin: null }) => (req: Request, res: Response, next: NextFunction) => {
    if (NODE_ENV === 'production') {
        let {
            origin = (req.get('ORIGIN')) ? req.get('ORIGIN') : req.get('REFERER')
        } = options;
        if (!origin) origin = '*'; //This fallback will disable requests with credentials

        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        //When in development, check to see if making request from Vite frontend
        const referer = req.get('REFERER');
        let origin: string | undefined;
        if (referer) {
            origin = referer;
        }
        if (!origin) origin = req.get('HOST') || '*';
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
}

export { setCache, setCors };