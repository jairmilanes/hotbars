import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import {
  simpleGit,
  SimpleGit,
  SimpleGitOptions,
  RemoteWithoutRefs,
  BranchSummaryBranch,
  RemoteWithRefs
} from "simple-git";
import { Config, EventManager, ServerEvent } from "../core";
import { logger } from "../../services";
import process from "process";
import { BranchSummary } from "simple-git/dist/typings/response";
import { Env } from "../types";
import { BranchSummaryResult } from "simple-git/dist/src/lib/responses/BranchSummary";

interface BaseParams {
  owner: string;
  repo: string,
  [prop: string]: any
}

type GitTypes = RestEndpointMethodTypes["git"]
type RepoTypes = RestEndpointMethodTypes["repos"]


function onInit (err: any, initResult: any) {
  logger.debug("%p%P Debug after init", 1, 1)
  logger.debug("%p%P %o", 3, 1, err)
  logger.debug("%p%P %o", 3, 1, initResult)
}

export class Versioning {
  private static instance: Versioning

  api: Octokit

  _api: SimpleGit

  repoName = "my-hotbars-app"

  owner?: string

  org?: string

  git?: BranchSummary | undefined

  remotes?: RemoteWithRefs[] | undefined

  remote = "hotbars"

  messages: Record<string, any>[] = []

  isRepo = false

  branchConflict = false

  context: Record<string, any> = {
    pending: false
  }

  private constructor() {
    this.api = new Octokit({ auth: process.env.GITHUB_TOKEN })
    this.repoName = Config.get("git.repo");
    this.owner = Config.get("git.name");
    this.org = Config.get("git.org");

    logger.silly(`%p%P Git root: %s %s`, 1, 1, Config.get("root"))

    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false
    };

    // when setting all options in a single object
    this._api = simpleGit(options);
  }

  static create() {
    logger.debug(`Versioning`);
    this.instance = new Versioning()
  }

  static get() {
    return this.instance
  }

  static async load() {
    logger.info("Versioning...")

    this.instance.isRepo = await this.instance._api.checkIsRepo()

    await this.instance.init()
  }

  static async status() {
    return this.instance._api.status()
  }

  static async changes() {
    return this.status().then((result) => {
      return result.modified
    })
  }

  async init() {
    logger.debug("%p%P Repo init...", 1, 1)

    if (!this.isRepo) {
      logger.debug("%p%P Creating repository...", 3, 0)
      await this.makeRepo()
    }

    logger.debug("%p%P Configuring user...", 3, 0)
    await this.configUsername()
    await this.configEmail()

    logger.debug("%p%P Fetching branches...", 3, 0)
    this.git = await this.getBranches()

    await this.makeBranches()

    this.git?.all.forEach(name =>
      logger.silly("%p%P %s %s", 5, 1, name, this.git?.branches[name].current ? "(current)" : "")
    )

    await this.ensureRepoIsClean()

    if (this.git?.current !== Config.get("env")) {
      logger.silly("%p%P Switching branch to: %s", 3, 0, Config.get("env"))
      await this._api.checkout(Config.get("env"))
      this.git = await this.getBranches()
    }

    logger.debug("%p%P Configuring remote...", 3, 0)
    await this.configRemote()

    if (this.context.pending) {
      logger.debug("%p%P Pushing pending changes...", 3, 0)

      try {
        await this._api
          .push(this.remote, this.git?.current as string, []);
      } catch(e) {
        const err = e as Error
        logger.warn(`%p%P Push failed with message: "%s"`, 3, 0, err.message)
      }
    }

    this.isRepo = true;

    logger.debug("%p%P Repo initialized!", 3, 0)
  }

  async makeRepo() {
    await this._api.init({
      "--initial-branch": Env.Local
    })

    await this._api.add("./*")
    await this._api.commit("Hotbars: Init")
    logger.silly("%p%P Repository created!", 3, 0)
    this.context.pending = true
  }

  async configUsername() {
    const username = await this._api.getConfig('user.name')
    if (process.env.GITHUB_USERNAME && (username.value !== process.env.GITHUB_USERNAME)) {
      await this._api.addConfig('user.name', process.env.GITHUB_USERNAME)
      logger.silly("%p%P Username: %s", 5, 1, process.env.GITHUB_USERNAME)
    } else {
      logger.silly("%p%P Username: %s", 5, 1, username.value)
    }
  }

  async configEmail() {
    const email = await this._api.getConfig('user.email')
    if (process.env.GITHUB_EMAIL && (email.value !== process.env.GITHUB_EMAIL) ) {
      await this._api.addConfig('user.email', process.env.GITHUB_EMAIL)
      logger.silly("%p%P Email: %s", 5, 1, process.env.GITHUB_EMAIL)
    } else {
      logger.silly("%p%P Email: %s", 5, 1, email.value)
    }
  }

  checkBranches() {
    const branchNames = [Env.Dev, Env.Test, Env.Prod]
    const missing = []
    for (let i = 0; i < branchNames.length; i++) {
      if (!this.git || this.git.all.indexOf(branchNames[i]) < 0) {
        missing.push(branchNames[i])
      }
    }
    return missing.length ? missing : undefined
  }

  async makeBranches() {
    // Local is not included because it is the --initial-branch
    // when creating the repository
    const branchNames = [Env.Dev, Env.Test, Env.Prod]
    for (let i = 0; i < branchNames.length; i++) {
      if (!this.git || this.git.all.indexOf(branchNames[i]) < 0) {
        this.git = await this._api.branch([branchNames[i]])
        logger.silly(`%p%P Created branch "%s"`, 5, 1, branchNames[i])
        this.context.pending = true
      }
    }
  }

  async configRemote() {
    this.remotes = await this.getRemotes()

    const remote = this.remotes?.find(remote =>
      remote.name === this.remote
    )

    if (!remote) {
      const remoteUrl = `https://${Config.get("git.name")}:${process.env.GITHUB_TOKEN}@github.com/${Config.get("git.name")}/${Config.get("git.repo")}.git`

      logger.silly("%p%P Remote %s set to: %s", 5, 1, this.remote, remoteUrl)

      await this._api.addRemote(
        this.remote,
        remoteUrl
      );

      this.remotes = await this.getRemotes()
      this.context.pending = true
    } else {
      logger.silly("%p%P Remote %s is: %s", 5, 1, remote.name, remote.refs.fetch)
    }
  }

  async ensureRepoIsClean() {
    const status = await this._api.status()

    if (!status.isClean()) {
      logger.warn("%p%P Repo is dirty...", 3, 0)
      await this._api.add("./*")
      await this._api.commit("Hotbars: Cleaning up %s".replace("%s", Date.now().toString()))
      logger.warn("%p%P Repo cleaned!", 3, 0)
      this.context.pending = true
    }
  }

  async getBranches() {
    try {
      const branches = await this._api.branch()

      if (branches?.current !== Config.get("env")) {
        this.branchConflict = true;

        // await this._api.checkout(targetBranch)
        /* this.messages.push({
          code: "GIT:BRANCH:CONFLICT",
          message: "Git remote conflict"
        })

        logger.warn(`%p%P Environment branch "%s" is different than the active branch "%s"`, 3, 0, Config.get("env"), branches.current) */
      }

      return branches;
    } catch(e) {
      logger.error("%p%P Failed to fetch branches %o", 3, 0, e)
    }
  }

  async getRemotes() {
    logger.silly("%p%P Fetching upstream...", 5, 1)

    try {
      return this._api.getRemotes(true);
    } catch(e) {
      logger.warn("%p%P Failed to fetch upstream %o", 5, 1, e)
    }
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
      if (!this.git) throw new Error("Must set branch before push.")

      await this._api.commit(message)

      if (!Config.get("git.remote")) {
        await this._api.push(
          ['-u', this.remote, this.git?.current],
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