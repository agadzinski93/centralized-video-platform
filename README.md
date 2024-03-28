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
    * [Cloudinary](#Cloudinary)
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

By default the server should be running on localhost:5000, the client on localhost:3000, and phpMyAdmin on localhost:8080. You can login to phpMyAdmin using either root or the user you created in the aforementioned secret files.

## Manual Installation

* [NodeJS](https://nodejs.org/en/download) (v16 or later)

* [MySQL](https://www.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/)

* This web app uses BCrypt which requires either an internet connection or a C++ compiler that supports C++17 installed on your system during `npm install`

### Database Setup
#### MySQL
1. Open your RDBMS software (e.g. MySQL Workbench/phpMyAdmin)
2. Open the script found in `server/utilities/db/create-db.sql`
3. (Optional) In the first 3 lines of the SQL script, you may rename the database as you see fit
4. Run the script
5. Set the system variable `innodb_autoinc_lock_mode = 1`
6. For #5 to take effect, restart the MySQL service in `services.msc` in Windows or using `systemd` in Linux

#### Redis (Optional)
Redis is optional. The application will still run without it. Make sure the env variable `REDIS_ENABLED` is set to `false` otherwise the web app will try to connect to it for some routes. It won't cause a crash, but will go through the 10-second connection timeout process before continuing through the code.

### Additional Setup
1. To satisfy the environemnt variables below, you will need to create a Cloudinary account and get an account name, API key, and secret.
2. This app uses Nodemailer for sending emails to new users. Make sure you have some sort of email server set up. It doesn't need to be remote. You can set up something like Mercury included in [XAMPP](https://www.apachefriends.org/download.html) locally on your machine to handle this requirement.

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

4. `USE_DOCKER`
    * Default: false
    * Is the current environment using Docker

5. `DOMAIN_PUBLIC`
    * Hostname (domain name or IP) of the online version of this app

6. `DOMAIN_PRIVATE`
    * Default: localhost

7. `YOUTUBE_KEY`
    * Your YouTube API key

8. `PASSPORT_SECRET`
    * Secret for PassportJS

9. `COOKIE_SECRET`
    * Secret attached to cookie associated with Passport

### Database Configurations
You are only required to provide details based on whether your environment will be in development, development w/ Docker, or production.

#### DB in Development with Docker

1. `DB_DOCKER_HOST`
    * Default: localhost
    * local hostname for database (you'll likely need to use the service name for the database server in the compose YAML file)

2. `DB_DOCKER_PORT`
    * Default: 3306
    * local port for database

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
    * name of MySQL DB

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

### Cloudinary

1. `CLOUDINARY_NAME`
    * Name of Cloudinary Account

2. `CLOUDINARY_API_KEY`
    * API Key from Cloundinary Account

3. `CLOUDINARY_SECRET`
    * Secret from Cloudinary

4. `DEFAULT_PROFILE_PIC`
    * URL for default profile pic for new accounts

5. `DEFAULT_PIC_FILENAME`
    * Filename associated with the aforementioned image, this is necessary to interact with the Cloudinary API

### Email
These variables are for connecting to a SMTP server responsible for sending emails (e.g. email verification upon registration)

1. `EMAIL_HOST`
    * Remote hostname for sending emails

2. `EMAIL_PASS`
    * Password to access email server

3. `EMAIL_PORT`
    * Default: 587
    * Port number to access email server

4. `EMAIL_USER`
    * Email account that is responsible for sending emails

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

1. `VITE_PROXY_TARGET_HOST`
    * Target hostname (service/IP/domain name). Do NOT include protocol or port number. When in development via Docker, this will be the service name found in the compose YAML file (e.g. server). If not in Docker, this value will likely be localhost.