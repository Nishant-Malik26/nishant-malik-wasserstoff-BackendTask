module.exports = (req, res, next) => {
  const diff = process.hrtime(req.startTime);
  const time = diff[0] * 1e3 + diff[1] * 1e-6; // convert to milliseconds
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } - Request ended. Duration: ${time.toFixed(3)} ms`
  );

  next();
};
