const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const { isLoggedIn } = require("../utilities/userAuth");
const {
    subscribe,
    unsubscribe
} = require("../controllers/subscriberCont");

router.route("/")
    .post(isLoggedIn,subscribe)
    .delete(isLoggedIn,unsubscribe);

module.exports = router;