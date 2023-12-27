import { AppError } from "./AppError.mjs";
import { paramsExist } from "./validators/paramsExist.mjs";
import { escapeHTML } from "./helpers/sanitizers.mjs";
import { usernameMatch } from "./helpers/authHelpers.mjs";

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  res.cookie("requestUrl", req.originalUrl);
  req.flash("error", "You need to be logged in");
  res.redirect(`/auth/login`);
}
const isAuthor = async (req, res, next) => {
  if (paramsExist([req.user?.username, req.params.username])) {
    const loggedUsername = escapeHTML(req.user.username);
    const urlUsername = escapeHTML(req.params.username);

    if (loggedUsername && urlUsername) {
      const match = await usernameMatch(loggedUsername, urlUsername);
      if (match instanceof AppError) return next(match);

      return next();
    }
  }
  else {
    return next(new AppError(400, "Arguments not provided."));
  }
}

export {isLoggedIn,isAuthor};