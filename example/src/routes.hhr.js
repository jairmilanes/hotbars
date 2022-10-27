const userRoutes = (app, createRouter, config) => {
  app.get("/user-route", (req, res) => {
    res.json({
      message: "User route message",
    });
  });

  app.get("/user-test", (req, res) => {
    res.json({
      message: "User test message",
    });
  });

  app.post("/user-test", (req, res) => {
    res.json({
      message: "User test message",
    });
  });

  app.put("/user-test", (req, res) => {
    res.json({
      message: "User test message",
    });
  });

  app.get("/user/planos", (req, res) => {
    res.json({
      message: "User test message",
    });
  });

  const router = createRouter();

  router
    .route("/product")
    .get((req, res) => {
      res.send("Product");
    })
    .post((req, res) => {
      res.send("Product");
    })
    .patch((req, res) => {
      res.send("Product");
    });

  app.use("/store/here", router);

  const router2 = createRouter();

  router2
    .get("/address", (req, res) => {
      res.send("address");
    })
    .get("/numbers", (req, res) => {
      res.send("numbers");
    });

  app.use(router2);
};

module.exports = userRoutes;
