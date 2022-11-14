const userRoutes = (router, config, db) => {
  router.get("/user-route", (req, res) => {

    console.log(db.get('user').find(e => e.username = "MariaAlice_Albuquerque").value())

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
