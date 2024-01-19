import { persistParams } from "./persist-params.handler";
import { requestLoggerHandler } from "./request-logger.handler";
import { staticFilesHandler } from "./static-files.handler";
import { authenticateHandler } from "./authentication.handler";
import { multipartDataHandler } from "./multipart-data.handler";
import { jsonDbHandler } from "./json-db.handler";
import { partialsHandler } from "./partial-renderer.handler";
import { preCompilerHandler } from "./pre-compiler.handler";
import { hotReloadHandler } from "./hot-reloader.handler";
import { notFoundPageHandler } from "./not-found-page.handler";
import { errorPageHandler } from "./error-page.handler";
import { lighthouseHandler } from "./lighthouse.handler"
import { generateViewHandlers } from "./views.handler";
import { createUserRouter } from "./custom-routes.handler";
import { dashboardHandler } from "./dashboard.handler";
import { fallbackHandler } from "./fallback.handler";
import { errorHandler } from "./error.handler";
import { smtpMailHandlers } from "./smtp-server-handlers";
import { githugHandler } from "./github.handler"
import { deploymentHandler } from "./deployment.handler"

export const mountRoutes = () => {
  hotReloadHandler();
  staticFilesHandler();
  preCompilerHandler();
  persistParams();
  requestLoggerHandler();
  lighthouseHandler();
  authenticateHandler();
  multipartDataHandler();
  partialsHandler();
  dashboardHandler();
  githugHandler();
  deploymentHandler();
  jsonDbHandler();
  smtpMailHandlers();
  notFoundPageHandler();
  errorPageHandler();
  generateViewHandlers();
  createUserRouter();
  fallbackHandler();
  errorHandler();
};
