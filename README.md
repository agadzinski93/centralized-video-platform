# Centralized Video Platform

The main goal of this application is to allow users to import videos from other platforms as a centralized hub. The intention is to make it easier for content creators to link viewers to their content regardless of origin.

This is a long-term project.

## Contents
1. [To-do List](#To-do-List)
    * [Soon](#Soon)
    * [Future](#Future)
2. [Docker Installation](#Docker-Installation)
    * [Prerequisites](#Prerequisites)
    * [Project Setup](#Project-Setup)
3. [Manual Installation](#Manual-Installation)
    * [Database Setup](#Database-Setup)
        * [MySQL](#MySQL)
        * [Redis](#Redis)
    * [Additional Setup](#Additional-Setup)
    * [Env Setup](#Env-Setup)
    * [Final Steps](#Final-Steps)
4. [Node Environment Variables](#Node-Environment-Variables)
    * [General](#General)
    * [Database Configurations](#Database-Configurations)
        * [DB in Development with Docker](#DB-in-Development-with-Docker)
        * [DB in Development without Docker](#DB-in-Development-without-Docker)
        * [DB in Production](#DB-in-Production)
    * [Google OAuth](#Google-OAuth)
    * [Files and Uploads](#Files-and-Uploads)
    * [Cloudinary](#Cloudinary)
    * [Google Cloud Storage](#Google-Cloud-Storage)
    * [AWS S3](#AWS-S3)
    * [Email](#Email)
5. [React Environment Variables](#React-Environment-Variables)

## To-do List

### Soon
- [ ] Redo Dashboard UI to accommodate multiple platforms
- [ ] Utilize the Drag and Drop API to ease the reordering process for videos
- [ ] Utilize the Server Sent API to handle live updates

### Future
- [ ] Incorporate the Rumble API

## Docker Installation
Installing via Docker is designed for development purposes. It is not recommended to use this method for production.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) (If you're developing on Windows)

### Project Setup
1. Clone the project into a folder on your PC
2. Create the following secret text files in `server/utilties/db`. These secrets will be used when creating the MariaDB container. These text files should only hold the value you want stored, no newlines or anything else.
    1. db_root_password.txt (password for root user)
    2. db_user.txt (username for new non-root user)
    3. db_password.txt (password for non-root user)
3. Fill out the necessary Env variables found in the last section
4. You may open `server/utilities/db/create-db.sql` and rename the database found on the first 2 lines as you wish. Be sure your Env variables reflect these changes as the web app will use `cvp` by default.
5. In the root of the project, run ```docker-compose up```

By default the server should be running on localhost:5000, the client on localhost:3000, phpMyAdmin on localhost:8080, and Roundcube on localhost:8000. You can login to phpMyAdmin using either root or the user you created in the aforementioned secret files.

6. You will have 2 minutes to generate an email for the email-server service. Open the command line and run `docker exec -it email-server bash`. Inside, create the first email you'd like the application to use when sending emails in the format: `setup email add <email>@<hostname>.com <password>`. Here is an example: `setup email add no-reply@mail.cvp.com admin`. Be sure the hostname matches the hostname given in the compose YAML file (and must have a prefix to the domain name such as `mail.example.com`). Make sure the the full email address and password are used for the ENV variables `EMAIL_USER` and `EMAIL_PASS`. You can always return into the email-server container to create more emails so you can create more accounts in the application.
7. After creating your own account, you can log in to the email account at localhost:8000. This is where your auto-generated email will be sent when registering on the website.

## Manual Installation

* [NodeJS](https://nodejs.org/en/download) (v16 or later)

* [MySQL](https://www.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/)

* This web app uses BCrypt which requires either an internet connection or a C++ compiler that supports C++17 installed on your system during `npm install`

### Database Setup
#### MySQL
1. Open your RDBMS software (e.g. MySQL Workbench/phpMyAdmin)
2. Open the script found in `server/utilities/db/create-db.sql`
3. (Optional) In the first 2 lines of the SQL script, you may rename the database as you see fit
4. Run the script
5. Set the system variable `innodb_autoinc_lock_mode = 1`
6. For #5 to take effect, restart the MySQL service in `services.msc` in Windows or using `systemd` in Linux

#### Redis (Optional)
Redis is optional. The application will still run without it. Make sure the env variable `REDIS_ENABLED` is set to `false` otherwise the web app will try to connect to it for some routes. It won't cause a crash, but will go through the 10-second connection timeout process before continuing through the code.

### Additional Setup
1. When in development, uploaded files will be stored in `/server/public/uploads` or what you define in the Env variable `LOCAL_UPLOADS_DIR`.
2. This app uses Nodemailer for sending emails to new users. Make sure you have some sort of email server set up. It doesn't need to be remote. You can set up an IMAP/SMTP server like Mercury included in [XAMPP](https://www.apachefriends.org/download.html) locally on your machine to handle this requirement. You can also use an email client such as [Mozilla Thunderbird](https://www.thunderbird.net/en-US/) to access your local email.

### Env Setup

Be sure to fill out all required ENV variables listed in the last section.

### Final Steps

You should be good to go! Just run the code below and give it a try.
```bash
npm install
npm run dev
```

## Node Environment Variables
Create the `.env` file in the root of the project.

### General

1. `NODE_ENV`
    * Default: development

2. `HOSTED_ONLINE` 
    * true or false
    * Default: false
    * Handles the pathing to the public directory with all web assets (e.g. css/scripts/images)

3. `PORT`
    * Default: 5000
    * Port for Node app

4. `CLIENT_PORT`
    * Default: 3000
    * Port for client app

5. `USE_DOCKER`
    * Default: false
    * Is the current environment using Docker

6. `DOMAIN_PUBLIC`
    * Hostname (domain name or IP) of the online version of this app

7. `DOMAIN_PRIVATE`
    * Default: localhost

8. `YOUTUBE_KEY`
    * Your YouTube API key

9. `PASSPORT_SECRET`
    * Secret for PassportJS

10. `COOKIE_SECRET`
    * Secret attached to cookie associated with Passport

11. `SESSION SECRET`
    * Secret for sessions used with OAuth

### Database Configurations
You are only required to provide details based on whether your environment will be in development, development w/ Docker, or production.

#### DB in Development with Docker

1. `DB_DOCKER_HOST`
    * Default: localhost
    * Local hostname for database (you'll likely need to use the service name for the database server in the compose YAML file)

2. `DB_DOCKER_PORT`
    * Default: 3306
    * Local port for database

3. `DB_DOCKER_USER`
    * Username to access your local DB

4. `DB_DOCKER_PASS`
    * Password for aforementioned user

5. `DB_DOCKER_DATABASE`
    * Default: cvp
    * Name of MySQL DB

#### DB in Development without Docker

1. `DB_DEV_HOST`
    * Default: localhost
    * Local hostname for database

2. `DB_DEV_PORT`
    * Default: 3306
    * Local port for database

3. `DB_DEV_USER`
    * Username to access your local DB

4. `DB_DEV_PASS`
    * Password for aforementioned user

5. `DB_DEV_DATABASE`
    * Default: cvp
    * Name of MySQL DB

#### DB in Production

1. `DB_PRO_HOST`
    * Default: localhost
    * Hostname or domain name hosting your remote MySQL DB

2. `DB_PRO_PORT`
    * Default: 3306
    * Port of your remote MySQL DB

3. `DB_PRO_USER`
    * Username to access your remote MySQL DB

4. `DB_PRO_PASS`
    * Password for the user to access your remote MySQL DB

5. `DB_PRO_DATABASE`
    * Default: cvp
    * Name of database to access in your remote MySQL DB

### Google OAuth
These variables are provided by Google when creating your credentials in Google Cloud for OAuth support

1. `GOOGLE_CLIENT_ID`
    * Client ID provided by Google

2. `GOOGLE_CLIENT_SECRET`
    * Secret provided by Google

3. `GOOGLE_CALLBACK_URL`
    * The callback URL you provided when creating the above credentials

### Files and Uploads
In development, local files will be uploaded wherever you define the Env variable `LOCAL_UPLOADS_DIR`. In production, you must either define the Env variables for Cloudinary, Google Cloud Storage, or AWS S3.

1. `DEFAULT_PIC_FILENAME`
    * Filename associated with the aforementioned image, this is only necessary with the Cloudinary API

2. `LOCAL_UPLOADS_DIR`
    * Default: ./server/public/uploads
    * Directory for uploading files locally on your PC when in development

3. `DEFAULT_PROFILE_PIC`
    * URL for default profile pic for new accounts

### Cloudinary

1. `CLOUDINARY_NAME`
    * Name of Cloudinary Account

2. `CLOUDINARY_API_KEY`
    * API Key from Cloundinary Account

3. `CLOUDINARY_SECRET`
    * Secret from Cloudinary

### Google Cloud Storage

1. `GCS_KEY_PATH`
    * This is the path to the key.json file for your Google account starting from the root of the application

2. `GCS_PROJECT_ID`
    * The project ID that is associated with the bucket you will use

3. `GCS_BUCKET`
    * Name of GCS bucket that will store your files

### AWS S3

1. `AWS_S3_ACCESS_KEY`
    * S3 Access key

2. `AWS_S3_SECRET_KEY`
    * S3 secret key

3. `AWS_S3_BUCKET`
    * Name of S3 bucket that will store your files

4. `AWS_S3_REGION`
    * Region of S3 storage
    * Example: us-west-1

### Email
These variables are for connecting to a SMTP server responsible for sending emails (e.g. email verification upon registration)

1. `EMAIL_HOST`
    * Default: email-server
    * Hostname for sending emails. If using Docker in development, use the service name for the email server listed in the compose YAML file (email-server is the default) 

2. `EMAIL_PORT`
    * Default: 25
    * Port number to access email server

3. `EMAIL_USER`
    * Email account that is responsible for sending emails

4. `EMAIL_PASS`
    * Password to access email server

5. `EMAIL_SECURE`
    * Default: false
    * Will the email connection use SSL/TLS?

### Redis (Optional)
These variables are only required if you wish to use Redis.

1. `REDIS_ENABLED`
    * true or false
    * Default: false
    * Enable/disable redis

2. `REDIS_DOCKER_HOST`
    * Default: redis
    * Hostname or service name (as  seen in the compose YAML file)

3. `REDIS_PATH`
    * Path on server to redis socket file

4. `REDIS_PORT`
    * Default: 6379
    * Port to redis database

## React Environment Variables
Create the `.env`  file in `./client`.

1. `VITE_PROXY_TARGET_HOST`
    * Target hostname (service/IP/domain name). Do NOT include protocol or port number. When in development via Docker, this will be the service name found in the compose YAML file (e.g. server). If not in Docker, this value will likely be localhost.

2. `VITE_PROXY_TARGET_PORT`
    * Target port used for testing in the deployment workflow. This port is needed when running mock API calls during testing in Github Actions.