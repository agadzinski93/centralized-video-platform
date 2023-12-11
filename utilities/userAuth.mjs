import { AppError } from "./AppError.mjs";
import { escapeHTML } from "./helpers/sanitizers.mjs";
import { usernameMatch } from "./helpers/authHelpers.mjs";

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  res.cookie("requestUrl", req.originalUrl);
  req.flash("error", "You need to be logged in");
  res.redirect(`/auth/login`);
}
const isAuthor = async (req, res, next) => {
  const loggedUsername = escapeHTML(req.user.username);
  const urlUsername = escapeHTML(req.params.username);

  const match = await usernameMatch(loggedUsername, urlUsername);
  if (match instanceof AppError) return next(match);

  return next();
}

export {isLoggedIn,isAuthor};