module.exports = (req, res, next) => {
  setTimeout(() => {
    next();
  }, 1000 * req?.delay || 0);
};
