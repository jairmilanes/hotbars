import { logger } from "../../services";


type HookCallback = (data: Record<string, any>) => void

interface Hook {
  name: string;
  callback: HookCallback
}


export class Hooks {

  private static instance: Hooks;

  private hooks: Map<string, Set<HookCallback>> = new Map()

  static create() {
    this.instance = new Hooks();
  }

  static async run(name: string, data: Record<string, any>) {
    if (!this.instance.hooks.get(name)) {
      return;
    }

    const callbacks = this.instance.hooks.get(name)

    if (callbacks?.size) {
      await Array.from(callbacks).reduce(
        async (ac, cb) => {
          await ac;
          return cb(data);
        }, Promise.resolve())
    }
  }

  static unregister(name: string, callback: HookCallback) {
    const callbacks = this.instance.hooks.get(name)

    if (callbacks?.has(callback)) {
      callbacks?.delete(callback)
    }
  }

  static register(name: string, cllback: HookCallback) {
    if (!this.instance.hooks.get(name)) {
      this.instance.hooks.set(name, new Set())
    }

    const callbacks = this.instance.hooks.get(name)

    callbacks?.add(cllback)
  }
}