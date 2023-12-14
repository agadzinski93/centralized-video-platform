# Centralized Video Platform

The main goal of this application is to allow users to import videos from other platforms as a centralized hub. The intention is to make it easier for content creators to link viewers tot ehir content regardless of origin.

This is a long-term project that will be ongoing.

## To do List

### Soon
- [ ] Redo Dashboard UI to accomodate multiple platforms
- [ ] Utilize the Drag and Drop API to ease the reordering process for videos
- [ ] Utilize the Server Sent API to handle live updates

### Future
- [ ] Incorporate the Rumble API

## Installation Requirements

* [NodeJS](https://nodejs.org/en/download) (v16 or later)

* [MySQL](https://www.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/)

* This web app uses BCrypt which requires either an internet connection or a C++ compiler that supports C++17 installed on your system during `npm install`

## Database Setup
1. Open your RDBMS software (e.g. MySQL Workbench/phpMyAdmin)
2. Open the script found in `utilities/create-db.sql`
3. (Optional) In the first 3 lines of the SQL script, you may rename the database as you see fit.
4. Run the script

## Additional Setup
1. To satisfy the environemnt variables below, you will need to create a Cloudinary account and get an account name, API key, and secret.
2. This app uses Nodemailer for sending emails to new users. Make sure you have some sort of email server set up. It doesn't need to be remote. You can set up something like XAMPP locally on your machine to handle this requirement.

## Environment Variables
Create the `.env` file in the root of the project.

`NODE_ENV` - 'development' or 'production'

`HOSTED_ONLINE` - true/false - handles the pathing to the public directory with all web assets (e.g. css/scripts/images)

`PORT`

`DOMAIN_PUBLIC=` - Hostname (domain name or IP) of the online version of this app

`DOMAIN_PRIVATE` - likely localhost

`YOUTUBE_KEY` - Your YouTube API key

`MYSQL_HOST` - local host for MySQL (likely localhost)

`MYSQL_PORT` - local port for MySQL (likely 3306)

`MYSQL_USER` - username to access your local DB

`MYSQL_PASS` - password for aforementioned user

`MYSQL_DATABASE` - name of MySQL DB

`PHP_MY_ADMIN_HOST` - Hostname or domain name hosting your remote MySQL DB

`PHP_MY_ADMIN_PORT` - Port of your remote MySQL DB

`PHP_MY_ADMIN_USER` - Username to access your remote MySQL DB

`PHP_MY_ADMIN_PASS` - Password for the user to access your remote MySQL DB

`PHP_MY_ADMIN_DATABASE` - Name of database to access in your remote MySQL DB

`PASSPORT_SECRET` - Secret for PassportJS

`COOKIE_SECRET` - Secret attached to cookie associated with Passport

`CLOUDINARY_NAME` - Name of Cloudinary Account

`CLOUDINARY_API_KEY` - API Key from Cloundinary Account

`CLOUDINARY_SECRET` - Secret from Cloudinary

`DEFAULT_PROFILE_PIC` - URL for default profile pic for new accounts

`DEFAULT_PIC_FILENAME` - FIlename associated with the aforementioned image, this is necessary to interact with the Cloudinary API

`EMAIL_HOST` - Remote hostname for sending emails

`EMAIL_PASS` - Password to access email server

`EMAIL_PORT` - Port number to access email server

`EMAIL_USER` - Email account that is responsible for sending emails

## Final Steps

You should be good to go! Just run `npm install` followed by `npm run dev` and give it a try.