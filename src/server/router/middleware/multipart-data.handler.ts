import { Server } from "../../core";
import { Multipart } from "../../services";
import { logger } from "../../../services";

export const multipartDataHandler = () => {
  const multipart = new Multipart();
  const middleware = multipart.configure();
  Server.app.post("/*", middleware);
  Server.app.patch("/*", middleware);
  Server.app.put("/*", middleware);

  logger.debug("%p%P Multipart handlers", 3, 0);
  logger.debug("%p%P [POST]/*", 5, 0);
  logger.debug("%p%P [PATCH]/*", 5, 0);
  logger.debug("%p%P [PUT]/*", 5, 0);
};
