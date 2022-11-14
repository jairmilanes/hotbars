import { Strategy as LocalStrategy } from "passport-local";
import { AuthStrategyAbstract } from "./auth-strategy.abstract";


export abstract class LocalAuthStrateygyAbstract extends AuthStrategyAbstract {

  name = "local"
  successRedirect = "/"

  createStrategy() {
    return new LocalStrategy(
      (username, password, done) => {
        this.authenticate(username, password, done);
      }
    )
  }

  configure() {
    return { failureRedirect: "/login" };
  }
}