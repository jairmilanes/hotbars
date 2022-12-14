/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import { logger } from "../../services";

export enum ServerEvent {
  INIT = "hotbars/init",
  HOT_RELOAD = "hotbars/hot-reload",
  PRE_COMPILED_CHANGED = "hotbars/pre-compiled-changed",
  ROUTES_CHANGED = "hotbars/routes-changed",
  SASS_CHANGED = "hotbars/sass-changed",
  USER_RUNTIME_CHANGED = "hotbars/user-runtime-changed",
  DASHBOARD_RUNTIME_CHANGED = "hotbars/dashboard-runtime-changed",
  VIEWS_CHANGED = "hotbars/views-changed",
  AUTH_HANDLERS_CHANGED = "hotbars/auth-handlers-changed",
  CONTROLLERS_CHANGED = "hotbars/controllers-changed",
  FILES_CHANGED = "hotbars/files-changed",
  EMAIL_FILES_CHANGED = "hotbars/email-files-changed",

  RELOAD = "reload",
}

export class EventManager {
  private static instance: EventEmitter;

  static create() {
    logger.info(`%p%P Event Manager`, 1, 1);
    this.instance = new EventEmitter();
  }

  static get i() {
    return this.instance;
  }
}
