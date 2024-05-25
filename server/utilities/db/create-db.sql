CREATE DATABASE IF NOT EXISTS cvp;
USE cvp;

CREATE TABLE IF NOT EXISTS users(
    user_id VARCHAR(45) PRIMARY KEY NOT NULL,
    username VARCHAR(24) NOT NULL UNIQUE,
    display_name VARCHAR(24) DEFAULT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(90),
    google_id VARCHAR(45) UNIQUE DEFAULT NULL,
    dateJoined DATE NOT NULL DEFAULT (NOW()),
    account_type ENUM('admin','user') NOT NULL DEFAULT 'user',
    activation_status ENUM('active','banned','pending','suspended') NOT NULL DEFAULT 'pending',
    settingRefreshTitle TINYINT(1) NOT NULL DEFAULT 1,
    settingRefreshDescription TINYINT(1) NOT NULL DEFAULT 1,
    settingRefreshThumbnail TINYINT(1) NOT NULL DEFAULT 1,
    pic_url VARCHAR(150) NOT NULL DEFAULT 'https://res.cloudinary.com/dlv7hwwa7/image/upload/v1677570982/Programminghelp/profile-pic-default_ggecfy.jpg',
    pic_filename VARCHAR(90) NOT NULL DEFAULT 'Programminghelporg/profile-pic-default_ggecfy',
    about_me VARCHAR(1024) DEFAULT NULL,
    banner_url VARCHAR(150) DEFAULT NULL,
    banner_filename VARCHAR(90) DEFAULT NULL,
    subscribers INT NOT NULL DEFAULT 0,
    subscriptions INT NOT NULL DEFAULT 0
)ENGINE=InnoDB CHAR SET 'utf8mb4';

CREATE TABLE IF NOT EXISTS topics(
    name VARCHAR(45) PRIMARY KEY NOT NULL,
    description VARCHAR(512) NOT NULL,
    difficulty ENUM('Beginner','Intermediate','Advanced'),
    imageUrl VARCHAR(150) DEFAULT NULL,
    filename VARCHAR(90) DEFAULT NULL,
    username VARCHAR(24) NOT NULL,
    timeCreated DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
)ENGINE=InnoDB CHAR SET 'utf8mb4';

CREATE TABLE IF NOT EXISTS videos(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    title VARCHAR(105) NOT NULL,
    url VARCHAR(90) NOT NULL,
    description VARCHAR(2048) DEFAULT NULL,
    views VARCHAR(12) DEFAULT NULL,
    thumbnail VARCHAR(90) DEFAULT NULL,
    topic VARCHAR(45) NOT NULL,
    username VARCHAR(24) NOT NULL,
    timeCreated DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (topic) REFERENCES topics(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT uniqueVideoInTopic UNIQUE (url,topic)
)ENGINE=InnoDB CHAR SET 'utf8mb4';

CREATE TABLE IF NOT EXISTS registration(
    user_id VARCHAR(45) PRIMARY KEY NOT NULL,
    activation_key VARCHAR(45) NOT NULL,
    timeJoined DATETIME NOT NULL DEFAULT NOW(),
    timeExpires DATETIME NOT NULL DEFAULT (NOW() + INTERVAL 1 DAY),
    complete TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
)ENGINE=InnoDB CHAR SET 'utf8mb4';

CREATE TABLE IF NOT EXISTS subscribers(
    user_id VARCHAR(45) NOT NULL,
    subscriber_id VARCHAR(45) NOT NULL,
    PRIMARY KEY(user_id,subscriber_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
)ENGINE=InnoDB CHAR SET 'utf8mb4';

DROP TRIGGER IF EXISTS on_subscribe;
DELIMITER //
CREATE TRIGGER on_subscribe
AFTER INSERT ON subscribers
FOR EACH ROW
BEGIN
    DECLARE msg CHAR(35);
	IF NEW.subscriber_id != NEW.user_id THEN
		UPDATE users SET subscribers = subscribers + 1 WHERE user_id = NEW.subscriber_id;
		UPDATE users SET subscriptions = subscriptions + 1 WHERE user_id = NEW.user_id;
	ELSE
		SET msg = "You cannot subscribe to yourself!";
        SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = msg;
	END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS on_unsubscribe;
DELIMITER //
CREATE TRIGGER on_unsubscribe
BEFORE DELETE ON subscribers
FOR EACH ROW
BEGIN
    UPDATE users SET subscribers = subscribers - 1 WHERE user_id = OLD.subscriber_id;
    UPDATE users SET subscriptions = subscriptions - 1 WHERE user_id = OLD.user_id;
END//
DELIMITER ;

DROP VIEW IF EXISTS recent_topics;
CREATE VIEW recent_topics AS
    SELECT 
        t.name AS name,
        t.description AS description,
        t.difficulty AS difficulty,
        t.imageUrl AS imageUrl,
        t.filename AS filename,
        t.username AS username,
        t.timeCreated AS timeCreated,
        u.pic_url AS pic_url
    FROM
        topics t
        JOIN users u ON u.username = t.username
    ORDER BY t.timeCreated DESC;

DROP VIEW IF EXISTS recent_videos;
CREATE VIEW recent_videos AS
    SELECT 
        v.title AS title,
        v.url AS url,
        v.thumbnail AS thumbnail,
        v.topic AS topic,
        v.username AS username,
        v.timeCreated AS timeCreated,
        u.pic_url AS pic_url
    FROM
        videos v
        JOIN users u ON v.username = u.username
    ORDER BY v.id DESC;

DROP VIEW IF EXISTS search_videos;
CREATE VIEW search_videos AS
    SELECT 
        v.title AS title,
        v.url AS url,
        v.thumbnail AS thumbnail,
        v.description AS description,
        v.username AS username,
        v.topic AS topic,
        u.pic_url AS pic_url
    FROM
        videos v
        JOIN users u ON v.username = u.username;

DROP PROCEDURE IF EXISTS deleteExpiredKeys;
DELIMITER //
CREATE PROCEDURE deleteExpiredKeys()
BEGIN
	DECLARE sql_error TINYINT DEFAULT FALSE;
	BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION SET sql_error = TRUE;
		START TRANSACTION;
		DELETE FROM users WHERE user_id IN (SELECT user_id FROM registration WHERE (NOW() > timeExpires)) AND activation_status = 'pending';
		DELETE FROM registration WHERE (NOW() > timeExpires);
	END;
    IF sql_error = TRUE THEN
		ROLLBACK;
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Failed to delete expired keys";
	ELSE
		COMMIT;
	END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS registerUser;
DELIMITER //
CREATE PROCEDURE registerUser(user_id VARCHAR(45),username VARCHAR(24),email VARCHAR(45),pass VARCHAR(90),pic_url VARCHAR(150),pic_filename VARCHAR(90),activation_key VARCHAR(45))
BEGIN
	DECLARE sql_error TINYINT DEFAULT FALSE;
	BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION SET sql_error = TRUE;
		START TRANSACTION;
        IF (SELECT count(*) AS user_count FROM (SELECT 1 FROM users LIMIT 1) AS users) > 0 THEN
            INSERT INTO users(user_id,username,email,password,pic_url,pic_filename) VALUES(user_id,username,email,pass,pic_url,pic_filename);
        ELSE
            INSERT INTO users(user_id,username,email,password,account_type,pic_url,pic_filename) VALUES(user_id,username,email,pass,'admin',pic_url,pic_filename);
        END IF;

        INSERT INTO registration(user_id,activation_key) VALUES(user_id,activation_key);
	END;
    IF sql_error = TRUE THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error Registering User";
	ELSE
		COMMIT;
    END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS registerUserUsingGoogle;
DELIMITER //
CREATE PROCEDURE registerUserUsingGoogle(user_id VARCHAR(45),username VARCHAR(24), email VARCHAR(45),google_id VARCHAR(45), pic_url VARCHAR(150),pic_filename VARCHAR(90))
BEGIN
	DECLARE sql_error TINYINT DEFAULT FALSE;
	BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION SET sql_error = TRUE;
		START TRANSACTION;
        IF (SELECT count(*) AS user_count FROM (SELECT 1 FROM users LIMIT 1) AS users) > 0 THEN
            INSERT INTO users(user_id,username,email,google_id,pic_url,pic_filename, activation_status) VALUES(user_id,username,email,google_id,pic_url,pic_filename,'active');
        ELSE
            INSERT INTO users(user_id,username,email,google_id,account_type,pic_url,pic_filename, activation_status) VALUES(user_id,username,email,google_id,'admin',pic_url,pic_filename,'active');
        END IF;

        INSERT INTO registration(user_id,activation_key) VALUES(user_id,activation_key);
	END;
    IF sql_error = TRUE THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error Registering User";
	ELSE
		COMMIT;
    END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS swap_video_rows;
DELIMITER //
CREATE PROCEDURE swap_video_rows(id_1 INT, id_2 INT)
BEGIN
	DECLARE sql_error TINYINT DEFAULT false;
	BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION
			SET sql_error = true;
		START TRANSACTION;
		SELECT url INTO @tempUrl1 FROM videos WHERE id = id_1;
		SELECT url INTO @tempUrl2 FROM videos WHERE id = id_2;
	
		UPDATE videos
			SET url = NULL
		WHERE id = id_1 OR id = id_2;
			
		UPDATE videos
			SET url = IF(id = id_1, @tempUrl2, @tempUrl1)
		WHERE id IN (id_1, id_2);
		
		UPDATE videos v1 INNER JOIN videos v2
			ON (v1.id, v2.id) IN ((id_1,id_2),(id_2,id_1))
		SET
			v1.title = v2.title,
			v1.description = v2.description,
			v1.views = v2.views,
			v1.thumbnail = v2.thumbnail;
	END;
	IF sql_error = TRUE THEN
		ROLLBACK;
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Something went wrong!";
	ELSE
		COMMIT;
	END IF;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS verifyEmail;
DELIMITER //
CREATE PROCEDURE verifyEmail(id varchar(45),act_key varchar(45))
BEGIN
	DECLARE msg varchar(50);
    DECLARE auth_status varchar(10);
	DECLARE sql_error TINYINT DEFAULT FALSE;
	DECLARE input_error TINYINT DEFAULT FALSE;
	BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION SET sql_error = TRUE;
		
		START TRANSACTION;
		SELECT activation_status INTO auth_status FROM users WHERE user_id = id;
		IF auth_status != 'pending' THEN
			SET msg = "User status is not pending verification";
			SET input_error = TRUE;
		ELSE
			IF act_key = (SELECT activation_key FROM registration WHERE user_id = id) THEN
				UPDATE users SET activation_status = 'active' WHERE user_id = id;
				UPDATE registration SET complete = true WHERE user_id = id;
			ELSE
				SET msg = "Keys don't match!";
				SET input_error = TRUE;
			END IF;
		END IF;
	END;
    IF input_error = TRUE THEN
		ROLLBACK;
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
	ELSEIF sql_error = TRUE THEN
		ROLLBACK;
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Couldn't verify email.";
	ELSE
		SELECT "Email has been verified!" as message;
		COMMIT;
	END IF;
END//
DELIMITER ;

DROP EVENT IF EXISTS deleteOldKeys;
DELIMITER //
CREATE EVENT deleteOldKeys
ON SCHEDULE EVERY 1 DAY
STARTS NOW()
DO BEGIN
	DECLARE sql_error TINYINT DEFAULT FALSE;
    BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION
			SET sql_error = TRUE;
		START TRANSACTION;
		DELETE FROM users WHERE id IN (SELECT userId FROM registration WHERE NOW() > expiration) AND account_status = 'pending';
        DELETE FROM registration WHERE NOW() > expiration;
    END;
    IF sql_error = TRUE THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error Deleting Expired Keys';
    ELSE
		COMMIT;
    END IF;
END//
DELIMITER ;