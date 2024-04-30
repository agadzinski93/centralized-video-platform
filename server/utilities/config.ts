const NODE_ENV = process.env.NODE_ENV || 'development';
const HOSTED_ONLINE: string = process.env.HOSTED_ONLINE || 'false';
const PORT: string = process.env.PORT || '5000';

const USE_DOCKER: string = process.env.USE_DOCKER || 'false';

const DOMAIN_PUBLIC: string | undefined = process.env.DOMAIN_PUBLIC;
const DOMAIN_PRIVATE: string = process.env.DOMAIN_PRIVATE || 'localhost';

//Control path to public resources depending on environment
const PATH_CSS: string = (NODE_ENV === 'production') ? '/css/' : '/css/';
const PATH_ASSETS: string = (NODE_ENV === 'production') ? '/assets/' : '/assets/';

//Alter the paths for links on the old EJS version of site when in production
const API_PATH: string = (NODE_ENV === 'production') ? '/api/v1' : '';

const YOUTUBE_KEY: string | undefined = process.env.YOUTUBE_KEY;

//Database Connection Info In Development
const DB_DEV_HOST: string = process.env.DB_DEV_HOST || 'localhost';
const DB_DEV_PORT: string = process.env.DB_DEV_PORT || '3306';
const DB_DEV_USER: string | undefined = process.env.DB_DEV_USER;
const DB_DEV_PASS: string | undefined = process.env.DB_DEV_PASS;
const DB_DEV_DATABASE: string = process.env.DB_DEV_DATABASE || 'cvp';

//Database Connection Info In Docker Env
const DB_DOCKER_HOST: string = process.env.DB_DOCKER_HOST || 'mariadb-server';
const DB_DOCKER_PORT: string = process.env.DB_DOCKER_PORT || '3306';
const DB_DOCKER_USER: string | undefined = process.env.DB_DOCKER_USER;
const DB_DOCKER_PASS: string | undefined = process.env.DB_DOCKER_PASS;
const DB_DOCKER_DATABASE: string = process.env.DB_DOCKER_DATABASE || 'cvp';

//Database Connection Info In Production
const DB_PRO_HOST: string = process.env.DB_PRO_HOST || 'localhost';
const DB_PRO_PORT: string = process.env.DB_PRO_PORT || '3306';
const DB_PRO_USER: string | undefined = process.env.DB_PRO_USER;
const DB_PRO_PASS: string | undefined = process.env.DB_PRO_PASS;
const DB_PRO_DATABASE: string = process.env.DB_PRO_DATABASE || 'cvp';

const PASSPORT_SECRET: string | undefined = process.env.PASSPORT_SECRET;
const COOKIE_SECRET: string | undefined = process.env.COOKIE_SECRET;

const CLOUDINARY_NAME: string | undefined = process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY: string | undefined = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET: string | undefined = process.env.CLOUDINARY_SECRET;

const DEFAULT_PROFILE_PIC: string | undefined = process.env.DEFAULT_PROFILE_PIC;
const DEFAULT_PIC_FILENAME: string | undefined = process.env.DEFAULT_PIC_FILENAME;

const EMAIL_HOST: string = process.env.EMAIL_HOST || 'email-server';
const EMAIL_PORT: string = process.env.EMAIL_PORT || '25';
const EMAIL_USER: string | undefined = process.env.EMAIL_USER;
const EMAIL_PASS: string | undefined = process.env.EMAIL_PASS;
const EMAIL_SECURE: string = process.env.EMAIL_SECURE || 'false';

const REDIS_ENABLED: string = process.env.REDIS_ENABLED || 'false';
const REDIS_DOCKER_HOST: string = process.env.REDIS_DOCKER_HOST || 'redis';
const REDIS_PATH: string | undefined = process.env.REDIS_PATH;
const REDIS_PORT: string = process.env.REDIS_PORT || '6379';

export {
    NODE_ENV,
    HOSTED_ONLINE,
    PORT,
    USE_DOCKER,
    DOMAIN_PUBLIC,
    DOMAIN_PRIVATE,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    YOUTUBE_KEY,
    DB_DEV_HOST,
    DB_DEV_PORT,
    DB_DEV_USER,
    DB_DEV_PASS,
    DB_DEV_DATABASE,
    DB_DOCKER_HOST,
    DB_DOCKER_PORT,
    DB_DOCKER_USER,
    DB_DOCKER_PASS,
    DB_DOCKER_DATABASE,
    DB_PRO_HOST,
    DB_PRO_PORT,
    DB_PRO_USER,
    DB_PRO_PASS,
    DB_PRO_DATABASE,
    PASSPORT_SECRET,
    COOKIE_SECRET,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET,
    DEFAULT_PROFILE_PIC,
    DEFAULT_PIC_FILENAME,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SECURE,
    REDIS_ENABLED,
    REDIS_DOCKER_HOST,
    REDIS_PATH,
    REDIS_PORT
}