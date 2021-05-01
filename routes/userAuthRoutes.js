const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const {
  registrationValidation,
} = require("../utilities/validators/middleware/validators");
const {
  renderLogin,
  loginUser,
  logoutUser,
  renderRegistration,
  registerUser,
} = require("../controllers/userAuthCont");

router.route("/login").get(renderLogin).post(loginUser);
router.get("/logout", logoutUser);
router
  .route("/register")
  .get(renderRegistration)
  .post(registrationValidation, registerUser);

module.exports = router;
