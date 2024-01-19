import { Config, Server } from "../../core";

export const notFoundPageHandler = () => {
  Server.app.get(["/not-found", "/404"], (req, res) =>
    res.render("notFound", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    })
  );
};
