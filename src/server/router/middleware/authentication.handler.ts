import * as _ from "lodash";
import { Router, NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import passport from "passport";
import fetch from "node-fetch";
import {
  AUTH_ERROR_CODE,
  LocalAuthStrategy,
} from "../../auth/strategies/local.strategy";
import { AuthManager } from "../../auth";
import { ContextConfig, Config, DashboardConfig, Server } from "../../core";
import { logger } from "../../../services";
import { Mailer } from "../../services";
import { User } from "../../types";
import { Controllers } from "../../controllers";
import cookieParser from "cookie-parser";
import { rememberUser, signOut } from "../../auth/strategies/remember-me.strategy";

const authPageHandler =
  (view: string) => async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      return res.redirect(ContextConfig.init(req).get("auth.views.signInRedirect") || "/");
    }

    const context = await Controllers.handle(`/${view}`, view, req, res);

    return res.render(view, context);
  };

/**
 * Sign's up a new user, creating their account and sending the
 * email confirmation message.
 *
 * @param req
 * @param res
 * @param next
 */
const signUpProviderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (AuthManager.has(req.params.provider)) {
    ContextConfig.init(req);
    const instance = AuthManager.get<LocalAuthStrategy>(req.params.provider);

    try {
      const user = await instance.createUser(req.body);

      if (user) {
        await instance.sendEmailConfirmation(user, req.params.provider);

        return res.redirect(`/${ContextConfig.get("auth.views.signUpPending")}`);
      }

      return res.redirect(`/${ContextConfig.get("auth.views.signUp")}?failed=true`);
    } catch (e) {
      logger.error(e);
      return next(new Error(`Error trying to register a new user.`));
    }
  }

  return next(
    new Error(
      `Provider ${req.params.provider} not found, please check your configuration and try again.`
    )
  );
};

/**
 * Resends the email confirmation message to the given user.
 * @todo Must throutle this endpoint, a new message cannot be sent if the last link sent is still valid.
 *
 * @param req
 * @param res
 */
const resendConfirmationHandler = async (req: Request, res: Response) => {
  ContextConfig.init(req);
  if (!req.isAuthenticated()) {
    return res.redirect(`/${ContextConfig.get("auth.views.signIn")}`);
  }

  if (!_.get(req.user, "confirmed")) {
    const instance = AuthManager.get<LocalAuthStrategy>(req.params.provider);

    await instance.sendEmailConfirmation(req.user as User, req.params.provider);

    return res.redirect(`/${ContextConfig.get("auth.views.signUpPending")}`);
  }

  res.redirect("/");
};

/**
 * Handles authentication and authentication callbacks
 * from OAuth providers.
 *
 * @param req
 * @param res
 * @param next
 */
const oAuthHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.warn("Providers", AuthManager.names())

  if (AuthManager.has(req.params.provider)) {
    req.session.messages = [];

    const instance = AuthManager.get(req.params.provider);
    const provider = passport.authenticate(instance.name, instance.configure(req));

    return provider(req, res, () => {
      return res.redirect(
        `/${ContextConfig.get("auth.views.signInRedirect")}` || "/"
      )
    });
  }

  next(
    new Error(
      `Provider ${req.params.provider} not found, please check your configuration and try again.`
    )
  );
};


/**
 * Confirms a user comming from an email confirmation message
 *
 * @param req
 * @param res
 * @param next
 */
const signUpProviderConfirmHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ContextConfig.init(req);
  const { username, provider } = req.query;

  const instance = AuthManager.has(provider as string)
    ? AuthManager.get<LocalAuthStrategy>(provider as string)
    : AuthManager.get<LocalAuthStrategy>("local");

  try {
    const user = await instance.confirmEmail(username as string);

    await Mailer.sendTemplate(
      user.email,
      "Account Created",
      "sign-up-success",
      { user }
    );

    res.redirect(`/${ContextConfig.get("auth.views.signIn")}?action=confirmed`);
  } catch (e) {
    next(new Error(`Failed user email confirmation.`));
  }
};

const passwordRecoveryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ContextConfig.init(req);

  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  if (_.toLower(req.method) === "post") {
    const { email } = req.body;
    const { provider } = req.params;

    const instance = AuthManager.has(provider as string)
      ? AuthManager.get<LocalAuthStrategy>(provider as string)
      : AuthManager.get<LocalAuthStrategy>("local");

    try {
      const { error } = await instance.sendPasswordRecovery(email as string);

      if (error) {
        logger.error(error);
      }

      return res.redirect(
        `/${ContextConfig.get("auth.views.passwordRecovery")}?email-sent=true`
      );
    } catch (e) {
      return next(new Error(`Failed user email confirmation.`));
    }
  }

  return next();
};

const passwordResetCodeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ContextConfig.init(req);
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  const { code, provider } = _.assign({}, req.query, req.body);

  const instance = AuthManager.has(provider as string)
    ? AuthManager.get<LocalAuthStrategy>(provider as string)
    : AuthManager.get<LocalAuthStrategy>("local");

  try {
    const valid = await instance.validateRecoveryCode(code as string);

    if (!valid) {
      req.session.messages = [
        "Your recovery link is either expired or invalid, enter your email to try again.",
      ];

      return res.redirect(`/${ContextConfig.get("auth.views.passwordRecovery")}`);
    }

    return next();
  } catch (e) {
    logger.error(e as Error);
  }

  return res.redirect(`/${ContextConfig.get("auth.views.passwordRecovery")}`);
};

const passwordResetHandler = async (
  req: Request,
  res: Response,
) => {
  ContextConfig.init(req);
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  const { code, password, "confirm-password": confirm, provider } = req.body;

  const instance = AuthManager.has(provider as string)
    ? AuthManager.get<LocalAuthStrategy>(provider as string)
    : AuthManager.get<LocalAuthStrategy>("local");

  try {
    const valid = await instance.validateRecoveryCode(code as string);

    if (!valid) {
      req.session.messages = [
        "Your recovery link is either expired or invalid, enter your email to try again.",
      ];

      return res.redirect(`/${ContextConfig.get("auth.views.passwordRecovery")}`);
    }

    const { error, data: user } = await instance.updatePassword(
      valid.email,
      password,
      confirm
    );

    if (error) {
      logger.error(error);

      req.session.messages = [error.message];

      if (error.code === AUTH_ERROR_CODE.INVALID_EMAIL_ADDRESS) {
        return res.redirect(`/${ContextConfig.get("auth.views.signIn")}`);
      }

      return res.redirect(
        `/${ContextConfig.get(
          "auth.views.passwordReset"
        )}?code=${code}&provider=${provider}`
      );
    }

    req.session.messages = ["Password updated successfully!"];

    await Mailer.sendTemplate(
      user?.email as string,
      "Your Password Changed",
      "password-changed",
      {
        user,
      }
    );

    return res.redirect(`/${ContextConfig.get("auth.views.signIn")}`);
  } catch (e) {
    logger.error(e as Error);

    req.session.messages = ["Unexpected error."];

    return res.redirect(
      `/${ContextConfig.get(
        "auth.views.passwordReset"
      )}?code=${code}&provider=${provider}`
    );
  }
};

const verifyUserRecaptcha = async (
  req: Request,
  res: Response,
) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Re-capatcha error." });
  }

  try {
    const body = {
      secret: _.get(process.env, "HOTBARS_GOOGLE_CAPTCHA_SECRET", ""),
      response: token,
    };

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(Object.entries(body)).toString(),
      }
    );

    const result = await response.json();

    if (_.get(result, "success")) {
      return res.json({ message: "Success", ...result });
    }

    return res.status(400).json({ message: "Failed" });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ message: "Unexpected error" });
  }
};

export const authRoutes = (config: typeof Config | typeof DashboardConfig, app: Router) => {
  app.use(cookieParser(config.get<string>("auth.session.secret")));
  app.use(session(config.get<SessionOptions>("auth.session")));
  app.use(passport.initialize());
  app.use(passport.session());

  // Enables remember me logic
  if (config.get("auth.rememberMe")) {
    app.use(passport.authenticate("rememberMe"));
  }

  logger.debug("%p%P Auth handlers", 3, 0);

  // Sign Out View
  const signOutView = config.get<string>("auth.views.signOut").replace("_hotbars/", "");
  logger.debug("%p%P [GET]/%s", 5, 0, signOutView);
  app.get(`/${signOutView}`, signOut('/'));
  app.post(`/${signOutView}`, signOut('/'));

  // Sign In Handlers
  const signInView = config.get<string>("auth.views.signIn").replace("_hotbars/", "");
  logger.debug("%p%P [GET]/%s/:provider/callback", 5, 0, signInView);
  app.get(`/${signInView}/:provider/callback`, oAuthHandler);
  logger.debug("%p%P [POST]/%s/:provider", 5, 0, signInView);
  app.post(`/${signInView}/:provider`, oAuthHandler, rememberUser);
  logger.debug("%p%P [GET]/%s", 5, 0, signInView);
  app.get(`/${signInView}`, authPageHandler(signInView));

  // Sign Up Handlers
  const signUpView = config.get<string>("auth.views.signUp").replace("_hotbars/", "");
  app.get(`/${signUpView}`, authPageHandler(signUpView));
  logger.debug("%p%P [GET]/%s", 5, 0, signUpView);
  app.get(`/${signUpView}/confirm`, signUpProviderConfirmHandler);
  logger.debug("%p%P [GET]/%s/confirm", 5, 0, signUpView);
  app.post(`/${signUpView}/:provider`, signUpProviderHandler);
  logger.debug("%p%P [POST]/%s/:provider", 5, 0, signUpView);
  app.get(`/${signUpView}/confirm/re-send`, resendConfirmationHandler);
  logger.debug("%p%P [GET]/%s/confirm/re-send", 5, 0, signUpView);

  const signUpPendingView = config.get<string>("auth.views.signUpPending").replace("_hotbars/", "");
  logger.debug("%p%P [GET]/%s", 5, 0, signUpPendingView);
  app.get(`/${signUpPendingView}`, authPageHandler(signUpPendingView));

  // Password Recovery Handlers
  const passRecoverView = config.get<string>("auth.views.passwordRecovery").replace("_hotbars/", "");
  logger.debug("%p%P [POST]/%s/:provider", 5, 0, passRecoverView);
  app.post(`/${passRecoverView}/:provider`, passwordRecoveryHandler);
  logger.debug("%p%P [GET]/%s", 5, 0, passRecoverView);
  app.get(`/${passRecoverView}`, authPageHandler(passRecoverView));

  // Password Reset Handlers
  const passResetView = config.get<string>("auth.views.passwordReset").replace("_hotbars/", "");
  logger.debug("%p%P [GET]/%s", 5, 0, passResetView);
  app.get(
    `/${passResetView}`,
    passwordResetCodeHandler,
    authPageHandler(passResetView)
  );
  logger.debug("%p%P [POST]/%s", 5, 0, passResetView);
  app.post(
    `/${passResetView}`,
    passwordResetCodeHandler,
    passwordResetHandler
  );

  // Re-Captcha verification
  logger.debug("%p%P [GET]/re-captcha/verify", 5, 0);
  app.get(`/re-captcha/verify/:token`, verifyUserRecaptcha);
}

export const authenticateHandler = () => {
  logger.debug("%p%P Authentication enabled", 1, 1);

  if (!Config.enabled("auth")) {
    return;
  }

  if (Config.get("auth.confirmEmail") && !Config.enabled("mailer")) {
    return;
  }



  authRoutes(Config, Server.app);
};
