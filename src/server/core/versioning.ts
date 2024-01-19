import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";
import { Config, EventManager, ServerEvent } from "../core";
import { logger } from "../../services";
import process from "process";
import { BranchSummary } from "simple-git/dist/typings/response";
import { Env } from "../types";

interface BaseParams {
  owner: string;
  repo: string,
  [prop: string]: any
}

type GitTypes = RestEndpointMethodTypes["git"]
type RepoTypes = RestEndpointMethodTypes["repos"]

export class Versioning {
  private static instance: Versioning;

  api: Octokit;

  _api: SimpleGit

  repoName = "my-hotbars-app";

  owner?: string;

  org?: string;

  branch?: BranchSummary;

  remote = "origin"

  messages: Record<string, any>[] = []

  isRepo = false;

  private constructor() {
    this.api = new Octokit({ auth: process.env.GITHUB_TOKEN })
    this.repoName = Config.get("git.repo");
    this.owner = Config.get("git.name");
    this.org = Config.get("git.org");

    logger.debug(`%p%P Git root: %s`, 1, 1, Config.get("root"))

    const options: Partial<SimpleGitOptions> = {
      baseDir: Config.get("root"),
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    // when setting all options in a single object
    this._api = simpleGit(options);
  }

  static create() {
    logger.debug(`%p%P Versioning`, 1, 1);
    this.instance = new Versioning()
  }

  static get() {
    return this.instance
  }

  static async load() {
    logger.debug("%p%P Versioning init", 1, 1)

    this.instance.isRepo = await this.instance._api.checkIsRepo();

    if (!this.instance.isRepo) {
      const message = "Root is not a repository."

      this.instance.messages.push({
        id: "GIT:REPO:FALSE",
        message
      })

      logger.debug(`%p%P %s`, 3, 1, message)
      return this
    } else {
      logger.debug(`%p%P Repository ready`, 3, 0)
    }

    const remotes = await this.instance._api.getRemotes()

    logger.debug("REMOTES %o", Object.keys(remotes))

    this.instance.branch = await this.instance._api.branch()

    logger.debug(`%p%P Current branch is "%s"`, 3, 0, this.instance.branch.current)

    if (this.instance.branch.current !== Config.get("env")) {
      // await this._api.checkout(targetBranch)
      this.instance.messages.push({
        id: "GIT:BRANCH:CONFLICT",
        message: "Git remote conflict"
      })

      logger.debug(`%p%P Environment branch "%s" is different than the active branch "%s"`, 3, 0, Config.get("env"), this.instance.branch.current)
    }

    return this
  }

  static async init() {
    logger.debug("%p%P Repo init")

    if (!this.instance.isRepo) {
      await this.instance._api.init({
        "--initial-branch": Env.Dev
      })

      this.instance._api.add("./*")
      this.instance.branch = await this.instance._api.branch()

      await this.instance._api.branch({ "branchname": Env.Test })
      await this.instance._api.branch({ "branchname": Env.Prod })
      await this.instance._api.commit("Hotbars: Init")

      if (!this.instance.branch) {
        throw new Error("Could not create git branch")
      }

      if (Config.get("git.remote")) {
        this.instance._api.addRemote(this.instance.remote, Config.get("git.remote"))
        await this.instance._api.commit("Hotbars: Configure remote")
      }

      await this.instance._api
        .push(['-u', this.instance.remote, this.instance.branch?.current as string]);

      logger.log("Hotbars: Git repository initialized!")

      this.instance.messages.push({
        id: "GIT:REMOTE:ERROR",
        message: "Git remote conflict"
      })

      this.instance.isRepo = true;
    } else {
      this.instance.branch = await this.instance._api.branch()
    }
  }

  static async status() {
    return this.instance._api.status()
  }

  static async changes() {
    return this.status().then((result) => {
      return result.modified
    })
  }

  async repo() {
    const repo = await this.api.repos.get(
      this.options<RepoTypes["get"]["parameters"]>({})
    )

    if (!repo) {
      return await this.createRepo();
    }

    return repo;
  }

  async pull() {
    if (!Config.get("git.remote")) return;

    try {
      const update = await this._api
        .exec(() => {
          logger.log("Hotbars: Starting pull...")
        })
        .pull()

      if (update && update?.summary.changes) {
        logger.log("Hotbars: Pull complete!")
        EventManager.i.emit(ServerEvent.RELOAD)
      }
    } catch(e) {
      logger.error(e)
    }
  }

  async push(
    message: string
  ) {
    try {
      if (!this.branch) throw new Error("Must set branch before push.")

      await this._api.commit(message)

      if (!Config.get("git.remote")) {
        await this._api.push(
          ['-u', this.remote, this.branch?.current],
          () => {
            logger.log("Hotbars: Git repository initialized!")
          }
        );
      }

      return true;
    } catch(e) {
      logger.error(e)
      return e
    }
  }

  async user() {
    const {
      data: { id, name, avatar_url, url, login}
    } = await this.api.users.getAuthenticated();

    return { id, name, avatar_url, url, login };
  }

  async authenticated() {
    const { login} = await this.user();
    console.log("Hello, %s", login);
    return login;
  }

  private options<T extends BaseParams>(append: Record<string, any>): T {
    return {
      owner: (this.org || this.owner) as string,
      repo: this.repoName,
      ...(append || {})
    } as T
  }

  private async createRepo() {
    const options: RepoTypes["createInOrg"]["parameters"] = {
      name: this.repoName,
      org: this.org as string,
      auto_init: true
    };

    const { data } = this.org
      ? await this.api.repos.createInOrg(options)
      : await this.api.repos.createForAuthenticatedUser({ name: this.repoName });

    return data;
  }
}