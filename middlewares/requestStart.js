module.exports = (req, res, next) => {
  req.startTime = process.hrtime();
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } - Request started`
  );
  next();
};
