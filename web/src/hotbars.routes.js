const userRoutes = (router, config) => {
  router.get("/user-route", (req, res) => {
    res.json({
      message: "User route message",
    });
  });

  router.get("/user-test", (req, res) => {
    res.json({
      message: "User test message",
    });
  });

  router.post("/user-test", (req, res) => {
    res.json({
      message: "User test message",
    });
  });
};

module.exports = userRoutes;
