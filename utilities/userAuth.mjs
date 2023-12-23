import { AppError } from "./AppError.mjs";
import { paramsExist } from "./validators/paramsExist.mjs";
import { escapeHTML } from "./helpers/sanitizers.mjs";
import { usernameMatch } from "./helpers/authHelpers.mjs";

const isLoggedIn = (req, res, next) => {
  console.log(1);
  if (req.isAuthenticated()) return next();

  res.cookie("requestUrl", req.originalUrl);
  req.flash("error", "You need to be logged in");
  res.redirect(`/auth/login`);
}
const isAuthor = async (req, res, next) => {
  console.log(2);
  let exist = paramsExist(req.user?.username, req.params.username);
  if (exist) {
    console.log(3);
    const loggedUsername = escapeHTML(req.user.username);
    const urlUsername = escapeHTML(req.params.username);

    if (loggedUsername && urlUsername) {
      console.log(4);
      const match = await usernameMatch(loggedUsername, urlUsername);
      console.log(5);
      if (match instanceof AppError) return next(match);

      console.log(6);
      return next();
    }
  }
  else {
    return next(new AppError(400, "Arguments not provided."));
  }
}

export {isLoggedIn,isAuthor};