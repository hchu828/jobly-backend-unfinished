"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use after a user has logged in and must have isAdmin : true
 * 
 * If not, raises Unauthorized.
 */

function isAdmin(req, res, next) {
  try {
    if (res.locals.user.isAdmin !== true) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

// This is commented out for now since currentUser is not required at the moment
/** Middleware to use to validate if current user is a parameter in route
 * 
 * If not, raises Unauthorized
 */

// function isCorrectUser(req, res, next) {
//   try {
//     if (req.params.username !== res.locals.user) throw new UnauthorizedError();
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// }


// TODO: Ask if we can nest middleware

/** Middleware used to validate if current user is a parameter in route
 * OR if have isAdmin : true
 * 
 * If not, raises Unauthorized
 */

function isCorrectUserOrIsAdmin(req, res, next) {
  try {
    if (
      res.locals.user.isAdmin !== true &&
      req.params.username !== res.locals.user.username
    ) {
      throw new UnauthorizedError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isAdmin,
  isCorrectUserOrIsAdmin
};
