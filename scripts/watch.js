const path = require("path");
const { spawn } = require("node:child_process");
const copyFiles = require("copyfiles");
const chokidar = require("chokidar");
const { Command } = require("commander");

const program = new Command();

program.name("hhr-dev").description("Handlebars hot reload development server");

program
  .command("watch")
  .description("Start the development server")
  .action(async (args, options) => {
    const srcPath = "src";
    const distPath = "dist";

    const copy = (file) => {
      copyFiles([file, distPath], { up: 1 }, () => {
        console.info(`Files updated ${file} => ${distPath}`);
      });
    };

    const watcher = chokidar.watch([path.join(srcPath, "views", "**/*")]);

    watcher
      .on("change", copy)
      .on("add", copy)
      .on("unlink", copy)
      .on("addDir", copy)
      .on("unlinkDir", copy)
      .on("ready", () => {
        console.log("File watcher ready...", "src/client", distPath);
        copyFiles(["src/client/**/*", distPath], { up: 1 }, () => {
          console.info(`First copy successful!`);
        });
      })
      .on("error", function (err) {
        console.log("File watcher error:", err);
      });

    const ts = spawn("tsc", ["--watch"], {
      cwd: path.resolve(__dirname, ".."),
      shell: true,
    });

    ts.on("spawn", () => {
      console.info("Typescript ready...");
    });

    ts.stdout.on("data", (data) => {
      console.info(data.toString().trim());
    });

    ts.stderr.on("data", (data) => {
      console.error(data.toString().trim());
    });

    ts.on("message", (message) => {
      console.info(message);
    });

    ts.on("error", (error) => {
      console.error(error);
      process.exit(1);
    });

    ts.on("close", (error) => {
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.info("SIGTERM signal received.");
      ts.kill("SIGTERM");
      watcher.close();
    });
  });

program.parse(process.argv);
