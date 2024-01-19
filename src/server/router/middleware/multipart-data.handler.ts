import { Server } from "../../core";
import { Multipart } from "../../services";

export const multipartDataHandler = () => {
  const multipart = new Multipart();
  const middleware = multipart.configure();
  Server.app.post("/*", middleware);
  Server.app.patch("/*", middleware);
  Server.app.put("/*", middleware);
};
