const { DataManager } = require("@jmilanes/hotbars");

const userRoutes = (router) => {
  const db = DataManager.get("lowDb");

  router.get("/user-route", (req, res) => {
    res.json(db.from("user").eq("userName", "Melissa_Souza").single());
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
