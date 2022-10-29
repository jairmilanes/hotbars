<div align="center">
<h1 style="font-size: 45px">Hotbars</h1>
<h3>Handlebars & Sass hot reloading Express web server for development and productions.</h3>
</div>

<div align="center">

[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/NPM-1.2.0-red?style=for-the-badge)](https://www.npmjs.com/package/@jmilanes/hotbars)
![Documentation](https://img.shields.io/badge/Documentation-Yes-green?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-brightgreen?style=for-the-badge)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![Markdown](https://img.shields.io/badge/markdown-%23000000.svg?style=for-the-badge&logo=markdown&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

## Motivation

These days developers seem to always go for the hot new thing, when simple is most times the best choice they could make, sometimes all you need is a simple web server with fast and versatile templating system to make a fast and easy to maintain website or small application, and that's what this project aims to provide.

Hotbars uses Node.js, Express.js and Handlebars to give you just that, a dynamic, server rendered application that is easy to develop and simple to deploy, along with flexibility what else you use to implement extra logic.

## Installation

Install it globally if you have multiple projects:

```shell
npm install --global @jmilanes/hotbars
```

Or locally if you only using it for a single project:

```shell
npm install -D @jmilanes/hotbars
```

## Usage

To run the development server use:

```shell
Usage: hotbars serve [options]                                                                                                                                                                                                       
                                                                                                                                                                                                                                     
Options:                                                                                                                                                                                                                             
  -e, --env <number>           Environment name (choices: "development", "production", default: "development", env: PORT)                                                                                                            
  -p, --port <number>          HTTP Port you want to serve the file (default: 3000, env: PORT)                                                                                                                                       
  -sp, --socketPort <number>   Socket port for hot reloading (default: 5001, env: PORT)                                                                                                                                              
  -c, --configName <filePath>  Config file name to load, defaults to hotbarsrc, and must be placed in the root of your project, it may also start with a dot ".hotbarsrc"" and or end with .js, .json or .cjs. (default: "hotbarsrc")
  -l, --logLevel <number>      Log level, must be a number between 1 and 4 (1: debug, 2: info, 3: warn, 4: error) (choices: "1", "2", "3", "4", "5", default: 1)                                                                     
  --browser                    Browser to open (choices: "msedge", "chrome", "firefox")                                                                                                                                              
  -h, --help                   display help for command
```

This will start you dev server at `http://localhost:3000` unless you have provided a custom port number, and that's it, start
creating!

## Project structure

Below is an example of the suggested project structure:

```shell
...
├── src
  # Your static data files
  └── data
      └── settings.json
      └── metadata.json
  # Layouts which are extended to build pages
  └── layouts
      └── default.hbs
  # Small re-usable ui components
  └── partials
      └── header.hbs
      ├── footer.hbs
      └── hero.hbs
  # Templates that will be pre-compiled by Handlebars and sent to
  # the client side.
  └── precompiled
      └── template-one.hbs
      ├── template-two.hbs
      └── template-three.hbs
  # Your pages, the structure you create here will become your
  # routes automatically.
  └── views
      └── portfolio
          └── projects.hbs
          └── project.hbs
      └── about.hbs
      └── contact.hbs
      └── index.hbs
  └── layouts
  └── routes.hotbars.js

```

## Routing

Every view file in the views directory are automatically configured as a page route, additionally they can also be dynamic. To use dynamic paths just name your view folder or file the name of your expected parameter name surrounded by brackets like so:

```shell
...
├── src
  ...
  └── views
      └── portfolio
          └── projects.hbs
          └── [projectName].hbs
      └── user
          └── [id]
              └── profile.hbs
  ...
```

The structure above will create the following routes without any extra configuration:

```shell
GET /portfolio/projects
GET /portfolio/:projectName
GET /user/:id:profile
```

### Custom routes

You can also create custom routes and handle however you need using the routes configuration file, which by default it's named `routes.hotbars.js` and it should be placed inside you source directory which defaults to `./src`.
The routes file must export a function, which receives the Express app and router:

```js
// src/routes.hotbars.js
module.exports = (app, createRouter) => {
  app.get("/custom-route", (res, req, next) => {
    res.render("viewName");
  });

  app.post("/custom-route", (res, req, next) => {
    res.render("viewName");
  });

  app.use((res, req, next) => {
    res.render("viewName");
  });

  const router = createRouter();

  router
    .route("/special-route")
    .get((res, req, next) => {
      res.json({ data: "some data" });
    })
    .delete((res, req, next) => {
      res.json({ message: "record deleted" });
    });

  app.use(router);

  const otherRouter = createRouter();

  otherRouter.get("/other-1", (res, req, next) => {
    res.render("viewName");
  });

  otherRouter.delete("/other-1", (res, req, next) => {
    res.status(204).send();
  });

  app.use("/my", router);
};
```

This file must be provided as CommonJS, if by any means you wish to use other format like Typescript or ES6 you must first compile it to CommonJS using your tool of preference (Tsc, Webpack, Parcel, Babel and so on).

This file will is also added to the watcher paths, so if you make any changes to it, the whole route configuration will be reloaded, and you will be able to use your routes without the need to re-start the server.

## Partials

Partials are available within your other `.hbs` files like other partials, layouts and views and also through a special endpoint `/partial/:partialId`, which you can use to request partials from the client side, the endpoint uses a `POST` method, so you can pass data securely to it, the data you pass will be injected into your template's context, allowing to use dynamic data and it will return the fully rendered partial in html format.

```html
<script>
  fetch("/partials/my-partial", {
    method: "POST",
    headers: {
      "Content-Type": "text/html",
    },
    body: JSON.stringify(data),
  }).then((data) => {
    document.getElementById("#container").innerHTML = data;
  });
</script>
```

## Pre-Compiled Templates

There is one more useful concept, which is pre-compiled templates, any hHandlebars files you have in the precompiled directory, will get pre-compiled by Handlebars and sent to the client side, and they will all be available to use by accessing the client side Handlebars runtime instance:

```html
<script>
  const preCompiledTemplate = Handlebars.template("my-template");

  document.getElementById("container").innerHTML = preCompiledTemplate({
    data: "Some data object",
  });
</script>
```

## Forms and Uploads

Hotbars is able to handle `multipart/form-data` out of the box with automatic file upload processing and storage, to process form with file upload use the available `/_form/*` endpoint, the wildcard should be replaced with a path like `/_form/profile` or `/_form/product` which are routes that you must create in your routes configuration file to handle logic other than the file upload.

Behind the curtains, any route that begins with `_/form/` uses [Multer](https://www.npmjs.com/package/multer) middleware to handle file uploads and allow for your custom route to do the rest.

File uploads must be enabled in the configuration file for uploads to work like below:

```json5
{
    ...
    "uploads": {
      "enabled": true,
      "path": "uploads/",
      "limit": 10,
      "maxFileSize": 1048576,
      "types": [
        "avatar", // This will allow up to 10 files to be uploaded
        { name: "document", maxCount:  1 } // File is limited toa  single file
      ]
    },
    ...
}
```

Configure your custom route to handle extra logic for the form:

```js
app.post("/_form/my-custom-route", (req, res) => {
  const { name, age, address } = req.body;
  const avatar = req.files["avatar"];
  const resume = req.files["resume"][0];

  // Process your form here

  res.status(200).send();
});
```

Next create your form, pay attention to the `enctype` and the file fields naming, which must match one of the types configured above:

```html
<form
  action="/_form/my-custom-route"
  enctype="multipart/form-data"
  method="post"
>
  <div>
    <input type="file" name="avatar" />
    <input type="file" name="resume" />
    <input type="text" name="name" />
    <input type="number" name="age" />
    <input type="text" name="address" />
    <input type="submit" value="Save user" />
  </div>
</form>
```

Once submitted, both group of files will be processed first and saved to the configure uploads path, and passed to your custom route to handle the rest of the fields.

## Data sanitization & validation

When processing forms it is important to sanitize and validate users input data, for that you may use any library or custom code of your preference, I like to recommend [express-validator](https://express-validator.github.io/) which is a library that integrates nicely with Express syntax:

```js
const { body, validationResult } = require("express-validator");

app.post(
  "/_form/my-custom-route",
  body("name").isLength({ min: 3, max: 50 }).trim().escape(),
  body("age").isInt({ gt: 18 }),
  body("password").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  (req, res) => {
    const errors = validationResult(req);

    // Validation errors were found
    if (!errors.isEmpty()) {
      // {
      //   "errors": [
      //      {
      //        "location": "body",
      //        "msg": "Invalid value",
      //        "param": "password"
      //      }
      //   ]
      // }
      return res.status(400).json({ errors: errors.array() });
    }

    // Data is valid, process as needed
    console.log(req.body);
  }
);
```

## Configuration

There is many options to customize the behavior of the server, for that create a configuration file in the root
of your project

```json5
{
  // Current environment
  // options: development, production
  env: "development",

  // Configure the debug level for the server
  // 1: debug, 2: info, 3: warn, 4: error
  logLevel: 1,

  // File encoding when reading template files and when saving uploaded files
  encoding: "utf-8",

  // Currently only http is supported but https in development
  protocol: "http",

  // Server host name
  host: "127.0.0.1",

  // Browser used for development
  // options: chrome, edge or firefox
  browser: "edge",

  // Server port number
  port: 3000,

  // Websocket port number
  // Socket is used to handle hot reloading
  socket_port: 5001,

  // Templates extension name
  // options: .hbs, .handlebars, .html
  extname: "hbs",

  // The source files directory
  // All paths like layouts, data, partials, precompile and helpers
  // are relative to this directory.
  source: "src",

  // The configuration file name, it will be searched in the root of your project in the following order:
  //
  // └ /project/root/`.<configName>`,
  // └ /project/root/`.<configName>.json`,
  // └ /project/root/`.<configName>.js`,
  // └ /project/root/`.<configName>.cjs`,
  // └ /project/root/`<configName>.json`,
  // └ /project/root/`<configName>.js`,
  // └ /project/root/`<configName>.cjs`,
  configName: "hotbarsrc",

  // The routes configuration file, it will be searched within the source directory in the following order:
  // └ `.<configName>.js`,
  // └ `.<configName>.cjs`,
  routesConfigName: "routes.hotbars",

  // The static data directory and
  data: "data/**/*.{json,js,cjs}",

  // Handlebars helpers directory
  helpers: "helpers/**/*.{js,cjs}",

  // Handlebars layouts directory
  layouts: "layouts/**/*.<extname>",

  // Handlebars partials directory
  partials: "partials/**/*.<extname>",

  // Pre-compilation templates
  precompile: "precompile/**/*.<extname>",

  // Handlebars views directory
  views: "views",

  // Styles mode
  // options: css, scss
  styleMode: "css",

  // The styles directory relative to the source directory
  styles: "styles",

  // The public directory, where files like images are served from
  // relative to the source directory
  public: "public",

  // Directories paths to ignore from the watcher
  // These files will not reload the application when changed
  ignore: [],

  // A pattern to ignore
  // eg: src/someFolder/**/*
  ignorePattern: null,

  // Uploads configuration
  uploads: {
    enabled: true,
    path: "uploads/",
    limit: 10,
    maxFileSize: 1048576,
  },

  // Cors configuration
  cors: {
    enabled: true,
  },
}
```

# Roadmap

Some of the features I'm working to implement and improve:

- Testing - Increase test coverage
- User Management - Integrate various authentication methods
- Schema Validation - Integrated form schema validation
- Integrations - Seamless integrations with:
  - [Supabase](https://supabase.com/)
  - [Netlify](https://www.netlify.com/)
  - [Heroku](https://www.heroku.com/)
- Suggestions? Please post an issue and label it `enhancement` for feature requests!

## Show your support

Give a ⭐ if you think this project is promising!

## 📝 License

This project is [MIT](https://github.com/tolgaerdonmez/handlebars-hot-reload/blob/main/LICENSE) licensed.
