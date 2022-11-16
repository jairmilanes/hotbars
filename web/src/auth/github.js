const GithubStrategy = require("passport-github2");
const { StrategyAbstract } = require("@jmilanes/hotbars");

console.log(StrategyAbstract);

class GithubAuth extends StrategyAbstract {
  constructor() {
    super("github");
  }

  createStrategy() {
    return new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: this.getCallbackUrl(),
      },
      this.authenticate.bind(this)
    );
  }

  configure() {
    return {
      scope: ["user:email"],
      failureRedirect: this.failureRedirect,
      successRedirect: this.successRedirect,
    };
  }

  authenticate(...args) {
    const [accessToken, refreshToken, profile, done] = args;
    console.log("TOKENS", accessToken, refreshToken);

    const user = this.getUser(profile.username);

    if (!user) {
      return done(undefined, false);
    }

    return done(undefined, user);
  }

  getUser(username) {
    return null;
  }
}

module.exports = GithubAuth;
