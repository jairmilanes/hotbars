## Authetication

Hotbars provides access to it's Passport integration, allowing you to extend it's available authentication strategies with ease.

First, make sure to enable authentication in your `.hotbarsrc` file:

```json5
{
  ...
  "auth": {
    "enabled": false,
    "path": "auth", // Path where your authentication strategies will be placed
    "securePath": "secure", // Name of the secure views folder.
    "usersTable": "users", // Name of the table where users are stored in your database
    "usernameColumn": "username", // Name of the username column in your users table
    "passwordColumn": "password", // Name of the password column in your users table
  },
  ...
}
```

### Auth handler endpoints

Hotbars provides to special endpoints used to handle authentication requests, one of wich must be configured in your authentication forms:

* `POST: /auth/:provider` The main authentication endpoint, used by both local and OAuth2 strategies, set this as your authentication form action with a post method.
* `POST: /auth/:provider/callback` OAuth callback handler endpoint, use this to configure you callback url in your OAuth2 provider.

The `:provider` parameter must be replaced with the name of the used provider for them to properly work.

### Availbale Strategies

To facilitate, Hotbars provides 2 pre-configured authentication classes great that can be quickly implemented:

### Local

To implement a simple username and password authentication, all you must do is create a auth class and provide a method that attemps to retrieve a user from the database like so:

```javascript
const { StrategyAbstract, DataManager } = require("@jmilanes/hotbars");

class PasswordAuth extends LocalAuthStrateygyAbstract {
  async getUser(username) {
    // find and return the user object from your database.
  }
}
```
Create a sign-in form with username and password field, set the action to `/auth/local` and it's method to `post`, everything else will be handled by the `LocalAuthStrateygyAbstract`.

### Json DB 

This one is great for development poupouses, if you not enabled the `jsonDb` in your configuration file you ill need to do so for this to work, you will also need to configure a user schema and have and have some users generated with the `fake` command or created manually in your database json file.

For this example we are using the following schema:
```json5
{
  "size": 10,
  "name": "users",
  "schema": {
    "id": "datatype.uuid",
    "createdAt": "date.past",
    "firstName": "unique:name.firstName:prop.gender",
    "lastName": "unique:name.lastName:prop.gender",
    "username": "lodash.join:prop.firstName,prop.lastName _",
    "password": "hash:internet.password",
    "avatar": "unique:internet.avatar",
  }
}
```

Next create your strategy class under the the configured `auth` directory.

```javascript
const { JsonDbAuthStrategy } = require("@jmilanes/hotbars");

class JsonDbAuth extends JsonDbAuthStrategy {}

module.exports = JsonDbAuth;

```
Create a sign-in form with username and password field, set the action to `/auth/jsonDb` and it's method to `post`, everything else will be handled by the `JsonDbAuthStrateygy`.


### Adding other strategies

To find other strategies, navigate to the [Passport strategies](https://www.passportjs.org/packages/) page and choose the strategy you wish to implement, there is over 500 strategies available.

For this example we are going to use the Github authentication strategy, along with a local LowDb json based database to serve and persist our user's data.

Install the `passport-github2` strategy:
```shell
npm i --save passport-github2
```

Create your Github OAuth app in Github settings, and add your credentials to the `.env` file of your project:
```shell
GITHUB_CLIENT_ID=<YOUR CLIENT ID>
GITHUB_CLIENT_SECRET=<YOUR CLIENT SECRET>
```

Next, create a new file under the `auth` directory in your project, with the following logic to handle the Github OAuth2 authentication flow:
```javascript
const GithubStrategy = require("passport-github2");
const random = require('random-seed');
const { StrategyAbstract, DataManager } = require("@jmilanes/hotbars");

// Authentication classes MUST extend from the provided StrategyAbstract
class GithubAuth extends StrategyAbstract {
    // Required, initialize the class with the strategy name
    // The name is required, the last 2 arguments are optional:
    //    * the successRedirectUrl which defaults to /sign-in
    //    * the failureRedirectedUrl which defaults to "/"
    constructor() {
        super("github", "/", "/sign-in");
    }
    
    // Required method used to instantiate and configure the strategy with your credentials
    // For this, follor the instructions for your chosen strategy.
    createStrategy() {
        return new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                // Use the available special method `getCallbackUrl`
                // to get your full callback url
                callbackURL: this.getCallbackUrl(),
            },
            this.authenticate.bind(this)
        );
    }

    // Required method used to pass configuration data to `passport.authenticate` call
    configure() {
        return {
            scope: ["user:email"],
            failureRedirect: this.failureRedirect,
            successRedirect: this.successRedirect,
        };
    }

    // Async method that ill be called once a user has authenticated with the provider
    // here we want to find the user in our database, if the user exists, pass the user
    // to the callback function, if not, you may want to create the user, or return `false`
    // otherwise.
    async authenticate(...args) {
        const [accessToken, refreshToken, profile, done] = args;
        const user = await this.getUser(profile.emails[0].value);

        // user is trying to sign-up with Github, lets create the user
        if (!user) {
            const user = await this.createUser(profile, accessToken, refreshToken)
            return done(undefined, user);
        }

        return done(undefined, user);
    }
    
    // helper method to create a user during the sign-up process
    async createUser(profile, accessToken, refreshToken) {
        return DataManager.get("lowDb").from("users").insert({
            provider: profile.provider,
            accessToken,
            refreshToken,
            username: profile.username,
            email: profile.emails?.length ? profile.emails[0].value : null,
            avatar: profile.photos?.length ? profile.photos[0].value : `https://avatars.dicebear.com/api/bottts/${random.create()}.svg`,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
        });
    }

    // Required method to retrieve a user from the database based on their email address.
    async getUser(email) {
        return DataManager.get("lowDb").from("users").eq("email", email).single();
    }
}

module.exports = GithubAuth;
```

The last step is to create a form, and configure to post the user creadentials to the `/auth/:provider` endpoint, for the pourpouse of this example we will use `/auth/github`:

```html
<form action="/auth/github" method="post">
  <button type="submit">Sign-in with Github</button>
</form>
```

That's it, when a user clicks the "Sign-In with Github" button, the user the following will happen:

* User is redirected to the Github authorization page
* Once and if the user authenticates with Github, they will be redirected to the available `/auth/:provider/callback` endpoint
* The `.authenticate` method is called with the user credentials from Github
* Our implemented `GithubAuth` will find or create the user and pass to the the callback fundtion
* Finally, the user is redirected to the home page `/` by default.
* If anything fails, the user is redirected back to the `/sign-in` page with one of two errors:
    * `invalid_credentials` which indicates the information provided by the user was wrong
    * `auth_error` which indicates an unknown error has ocurred during the process, at which point you should validate your implementation for errors.
