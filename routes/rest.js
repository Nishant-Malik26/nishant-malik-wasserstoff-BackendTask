const express = require("express");
const router = express.Router();

// fast servicce
router.get("/fast", (req, res) => {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  return res.status(200).json({ msg: "So fst!!", server: host });
});

// slow service 
router.get("/slow", (req, res) => {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  setTimeout(() => {
    return res.status(200).json({ msg: "Ooh slo!!", server: host });
  }, 1000 * 5);
});

module.exports = {
  router,
};
