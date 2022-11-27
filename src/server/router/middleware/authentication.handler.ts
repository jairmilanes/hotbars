import * as _ from "lodash";
import { NextFunction, Request, Response } from "express";
import { AuthManager } from "../../auth";
import passport from "passport";
import { Config, Server } from "../../core";
import { logger } from "../../../services";
import { Mailer } from "../../services";
import { User } from "../../types";
import session, { SessionOptions } from "express-session";

/**
 * Renders the sign-in page, or redirects to home if the user is
 * already authenticated.
 *
 * @param req
 * @param res
 */
const signInHandler = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  return res.render("sign-in");
};

/**
 * Sign's up a new user, creating their account and sending the
 * email confirmation message.
 *
 * @param req
 * @param res
 * @param next
 */
const signUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (AuthManager.has(req.params.provider)) {
    const instance = AuthManager.get(req.params.provider);

    try {
      const user = await instance.createUser(req.body);

      if (user) {
        await instance.sendEmailConfirmation(user, req.params.provider);

        return res.redirect("/sign-up/pending");
      }

      return res.redirect("/sign-up?failed=true");
    } catch (e) {
      next(new Error(`Error trying to register a new user.`));
    }
  }

  next(
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
  if (!req.isAuthenticated()) {
    return res.redirect("/sign-in");
  }

  if (!_.get(req.user, "confirmed")) {
    const instance = AuthManager.get(req.params.provider);

    await instance.sendEmailConfirmation(req.user as User, req.params.provider);

    return res.redirect("/sign-in");
  }

  res.redirect("/");
};

/**
 * Signs a user out destroying the existing user session.
 *
 * @param req
 * @param res
 * @param next
 */
const signOutHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  }
  return res.redirect("/");
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
  if (AuthManager.has(req.params.provider)) {
    const instance = AuthManager.get(req.params.provider);
    const provider = passport.authenticate(instance.name, instance.configure());
    return provider(req, res, next);
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
const signUpConfirmationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, provider } = req.query;

  if (AuthManager.has(provider as string)) {
    const instance = AuthManager.get(provider as string);

    try {
      const user = await instance.confirmEmail(username);

      await Mailer.sendTemplate(user.email, "sign-up-success", { user });

      res.redirect("/sign-in?action=confirmed");
    } catch (e) {
      next(new Error(`Failed user email confirmation.`));
    }
  }
};

export const authenticateHandler = () => {
  if (!Config.enabled("auth")) {
    return;
  }

  if (!Config.enabled("mailer")) {
    return;
  }

  logger.debug("%p%P Auth enabled %o", 1, 1, Config.get("auth"));

  Server.app.use(session(Config.get<SessionOptions>("auth.session")));
  Server.app.use(passport.initialize());
  Server.app.use(passport.session());

  Server.app.get(`/sign-in`, signInHandler);
  Server.app.post(`/sign-up/:provider`, signUpHandler);
  Server.app.get(`/sign-up/confirm`, signUpConfirmationHandler);
  Server.app.get(`/sign-up/confirm/re-send`, resendConfirmationHandler);

  Server.app.post(`/auth/:provider`, oAuthHandler);
  Server.app.get(`/auth/:provider/callback`, oAuthHandler);
  Server.app.post(`/sign-out`, signOutHandler);

  logger.debug("%p%P Auth handlers", 3, 0);
  logger.debug("%p%P [GET]/sign-in - Sign-in page", 5, 0);
  logger.debug("%p%P [POST]/sign-out - Sign-out handler", 5, 0);
  logger.debug("%p%P [POST]/auth/:provider - Sign-in handler", 5, 0);
  logger.debug(
    "%p%P [POST]/auth/:provider/callback - OAuth callback handler",
    5,
    0
  );
};
