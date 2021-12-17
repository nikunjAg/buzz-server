const passport = require('passport');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    const error = new Error();
    error.statusCode = 401;
    error.message = 'You are not authenticated to access this resource.';
    next(error);
  }
};

const isUnauthenticated = (req, res, next) => {
  if (req.isUnauthenticated()) {
    next();
  } else {
    const error = new Error();
    error.message = 'You are not unauthenticated to access this resource.';
    next(error);
  }
};

module.exports = {
  isAuthenticated,
  isUnauthenticated,
};
