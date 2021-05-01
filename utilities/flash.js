const express = require("express");
const flash = require("connect-flash");

module.exports = (req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
};
