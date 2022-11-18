<div align="center">
<h1 style="font-size: 45px">Hotbars</h1>
<h3>Handlebars & Sass hot reloading Express web server for development and productions.</h3>
</div>

<div align="center">

<!-- x-release-please-start-version -->

[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/NPM-1.6.4?style=for-the-badge)](https://www.npmjs.com/package/@jmilanes/hotbars)
![Documentation](https://img.shields.io/badge/Documentation-Yes-green?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-brightgreen?style=for-the-badge)

<!-- x-release-please-end -->

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

Below is an example of the suggested project structure, which can be configured through the `.hotbarsrc.json` file:

```shell
...
├── src
  # Publicly accessable files, Sass files
  └── public
      # Css files, when using Sass, this is where
      # the compiled css is exported to.
      └── styles
          └── styles.css
      # Images used int he client side
      └── images
          └── some-image.jpg
          └── some-other-image.png
      # Scripts used in the client side
      └── scripts
          └── some-script.js
  # Your static data files, passed as context to templates
  └── data
      └── settings.json
      └── metadata.json
  # Custom handlebars helpers
  └── data
      └── myHelper.js
      └── myOtherHelper.js
  # Optional controllers, called on every request to a view
  # must follow the same folder structure as the views.
  └── controllers
      └── portfolio
          └── projects.js
          └── project.js
      └── about.js
      └── contact.js
      └── index.js
  # Layouts which are extended to build pages
  └── layouts
      └── default.hbs
  # Parts of your application, which can be re-used in
  # multiple views, not available in the client side.
  └── partials
      └── header.hbs
      ├── footer.hbs
      └── hero.hbs
  # Templates that will be pre-compiled and sent to
  # the client side, not available on server side.
  └── precompiled
      └── template-one.hbs
      ├── template-two.hbs
      └── template-three.hbs
  # Templates that are available on server side as well as pre-compiled
  # and sent to the client side.
  └── shared
      └── template-one.hbs
      ├── template-two.hbs
      └── template-three.hbs
  # Your pages, the structure you create here will become your
  # routes automagically.
  └── views
      └── portfolio
          └── projects.hbs
          └── project.hbs
      └── about.hbs
      └── contact.hbs
      └── index.hbs
  # Bootstrapping file, here you may initialize any data that
  # only needs to run when the server starts, use this to
  # pre-load data, configure third-party modules and so on.
  └── hotbars.bootstrap.js
  # Custom routes file, must return a function that recieves
  # a router and full configuration object which you can use
  # to create custom route endpoints, usefull for custom
  # logic or data processing that is not directly related to
  # any page.
  └── hotbars.routes.js
# Hotbars configuration file where you can customize many
# functionalities and folder structure.
├── .hotbarsrc.json
├── package.json
```

## Bootstrapping

If there is any logic or configuration that must happen when the server starts, you can use a `hotbars.bootstrap.js` file to do so, this file must be created within your source directory, and it must return a single function that will receive the Hotbars configuration object as it's only argument.

Any data returned from this bootstrap function is frozen, and will be passed as a context to every page request.

```js
// Import third party modules
const { createClient } = require("@supabase/supabase-js");

module.exports = async function (config) {
  // Some custom logic here
  config.set(
    "supabase",
    createClient("https://xyzcompany.supabase.co", "public-anon-key")
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User will be accessable from config within controllers and custom routes.
  config.set("user", user);

  // Data will be available in every page rendering context.
  return {
    authenticated: true,
    user: user,
  };
};
```

## Pages & Routing

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
GET /user/:id/profile
```

## Controllers

For every view (page) you create under `/views` you can optionally associate a controller to it, all you have to do is create a `.js` file under `/controllers` following the same folder structure and file name as the view.

Controllers must return a Promise, and are called when a page is requested, before rendering the page, which allows you to perform any logic related to that page, returning data that will subsequentely be passed as a context to the view template, or even rendering or returning anything other than the requested page html.

This is very usefull for form submittions and dynamic data loading from third-party services and or databases, and it's completly optional.

Below is an example of a controller, the callback receives 3 parameters:

- **config**: The Hotbars configuration object
- **request**: The Express server Request instance
- **response**: The Express server Response instance

```js
// Import third party modules
const supabase = require("@supabase/supabase-js");

module.exports = async function (config, req, res) {
  // Accessing request data
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);

  // Some custom logic
  const { data, error } = await supabase
    .from("countries")
    .select()
    .eq("name", req.query.country);

  // Return data which can be used in yout page template.
  if (error) {
    return {
      error: error.message,
    };
  }

  return data;
};
```

### Custom Routes

You can create custom routes and handle however logic you need using the routes configuration file, which by default it's named `hotbars.routes.js` and it should be placed inside you source directory which defaults to `./src`.

The routes file must export a function, which receives the Express router and the Hotbars config instance:

```js
// src/routes.hotbars.js
module.exports = (router, config) => {
  router.use((req, res, next) => {
    // some glogal logic to this router here
    next();
  });

  router.get("/custom-route", (res, req, next) => {
    res.render("viewName");
  });

  router.post("/custom-route", (res, req, next) => {
    res.render("viewName");
  });

  router
    .route("/special-route")
    .get((res, req, next) => {
      res.json({ data: "some data" });
    })
    .delete((res, req, next) => {
      res.json({ message: "record deleted" });
    });
};
```

## Partials

Partials are available within your other `.hbs` files like other partials, layouts and views and also through a special endpoint `/partial/:partialId`, which you can use to request compiled partials from the client side, the endpoint uses a `POST` method, so you can pass data that will be injected into your template's context, allowing to use dynamic data and it will return the fully rendered partial in html format.

```html
<script>
  fetch("/partials/my-partial", {
    method: "POST",
    headers: {
      "Content-Type": "text/html",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("#container").innerHTML = html;
    });
</script>
```

## Pre-Compiled Templates

Handlebars files you have in the `/precompile` directory, will get pre-compiled by Handlebars and sent to the client side, and they will all be available to use by accessing the client side Handlebars runtime instance:

```html
<script>
  const preCompiledTemplate = Handlebars.template("my-template");

  document.getElementById("container").innerHTML = preCompiledTemplate({
    data: "Some data object",
  });
</script>
```

By default only the templates whithin the `/precompile` folder are sent to the client side, which means none of your other partials are available to these templates and if you try to use a partial within them, you will end up with an error, to make a selection of your partials available to pre-compiled templates, use the `/shared` folder, any partil in the shared folder will be available on both server and client side, we suggest to place your larger more complex partials in `/partials` and smaller UI components in `/shared` for a flexible and lightweight result.

## Forms and Uploads

Hotbars is able to handle `multipart/form-data` out of the box with automatic file upload processing and storage, to process forms with file upload use `POST`, `PUT`, or `PATCH` type of requests, any endpoint is handled as long as one of these methods is used.

Behind the curtains, Hotbars uses [Multer](https://www.npmjs.com/package/multer) middleware to handle file uploads and allow for your custom route to do the rest.

File uploads must be enabled and upload field names must be configured in your `.hotbars.json` file, only files for field names configured will be processed:

```json5
{
    ...
    "uploads": {
      "enabled": true,
      "path": "uploads/",
      "limit": 10,
      "maxFileSize": 1048576,
      "types": [
        "avatar", // This will allow up to 10 avatars to be uploaded at once
        { name: "resume", maxCount:  1 } // File is limited to a single file per request
      ]
    },
    ...
}
```

Bellow is a form example, pay attention to the `enctype` and the file fields naming, which must match one of the types configured above:

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

You may use a custom route or a controller to handle the rest of the multipart form logic, at this point files have already been saved and are available within the `request.files` object:

```js
router.post("/my-custom-route", (req, res) => {
  const { name, age, address } = req.body;
  const avatar = req.files["avatar"];
  const resume = req.files["document"][0];

  // Process your form here

  res.status(200).send();
});
```

## Data sanitization & validation

When processing forms it is important to sanitize and validate users input data, for that you may use any library or custom code of your preference, I like to recommend [express-validator](https://express-validator.github.io/) which is a library that integrates nicely with Express syntax:

```js
const { body, validationResult } = require("express-validator");

app.post(
  "/my-custom-route",
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

## Json Server

Hotbars integrates the well known [Json Server](https://github.com/typicode/json-server) library, and makes it available through a special endpoint `/_api`, it must be enabled in your `.hotbarsrc.json` file by passing the folder name where you will keep your json database files:

```json5
...
  "jsonServer": "db"
...
```

This will tell Hotbars, to pass the json files in this folder to Json Server, which you can later interact with through the `/_api` endpoint:

```json5
// ./src/db/users.json
{
  "users": [
    {
      "name": "John",
      "city": "Chicago"
    },
    {
      "name": "Kevin",
      "city": "Boston"
    },
    ...
  ]
}
```

Now query your data like so:

```js
fetch("/_api/users?name=John")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    // { "name": "John", "city": "Chicago" }
  });
```

There is mutch more that Json Server can do, for more info on how Json Server works, vist their Github page and make sure to leave a star, because it is awesome! [Json Server](https://github.com/typicode/json-server).

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

  // Path to save log data, not all logs endup here
  // I plan on making this more configured soon.
  logFilePath: "./logs/log.txt",

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

  // The bootstrap file, it will be searched within the source directory in the following order:
  // └ `.<configName>.js`,
  // └ `.<configName>.cjs`,
  bootstrapName: "hotbars.bootstrap",

  // The routes configuration file, it will be searched within the source directory in the following order:
  // └ `.<configName>.js`,
  // └ `.<configName>.cjs`,
  routesConfigName: "routes.hotbars",

  // The static data directory and
  data: "data/**/*.{json,js,cjs}",

  // Handlebars helpers directory
  helpers: "helpers/**/*.{js,cjs}",

  // Handlebars layouts directory
  layouts: "layouts",

  // Handlebars partials directory
  partials: "partials",

  // Pre-compilation templates
  precompile: "precompile",

  // Server and client side shared partials
  shared: "shared",

  // Handlebars views directory
  views: "views",

  // Page controllers
  controllers: "controllers",

  // Customize which methods are available
  // to your page routes, by default only
  // GET is created, but creating a new entry
  // with your view name allows you to dictate
  // which other methods should be created for
  // each page, you may also set to "*" to allow
  // all methods for a page.
  autoroute: {
    methods: ["get"],
    login: ["get", "post"],
  },

  // Styles mode
  // options: css, scss
  // Sass will send compiled css files to the configured public folder
  // in a folder with the same name as the configured styles folder below
  // eg: /src/public/styles by default.
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

# Hotbars Dashboard

Still under heavy development, but the goel is to make this a toolkit to manage and develop your websites and applications with Hotbars, I will soon post more details on how to access it and what it will be able to do, make sure to hit the notifications and leave a star if you want to be notified about the next updates.

# Roadmap

Some of the features I'm working to implement and improve:

- Testing - Increase test coverage
- Hotbars Dashboard - A control panel for your Hotbars apps and websites
- User Management - Integrate various authentication methods within the Dashboard
- Fake data generation for Json Server
- Schema Validation - Integrated form schema validation
- Integrations - Seamless integrations with:
  - [Supabase](https://supabase.com/)
  - [Supabase](https://supabase.com/)
  - [Deta](https://deta.sh/)
  - [Netlify](https://www.netlify.com/)
  - [Heroku](https://www.heroku.com/)
- Suggestions? Please post an issue and label it `enhancement` for feature requests!

## Show your support

Give a ⭐ if you think this project is promising or even just to show your support for my work, I'll really appretiate it!

## 📝 License

This project is [MIT](https://github.com/jairmilanes/hotbars/blob/main/LICENSE) licensed.
