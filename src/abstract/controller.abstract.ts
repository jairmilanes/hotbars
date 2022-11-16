import { Request, Response } from "express";
import { SafeObject } from "../types";
import { Config } from "../lib/core";

export abstract class ControllerAbstract {
  private config: Config;

  protected constructor(config: Config) {
    this.config = config;
  }

  abstract handle(req: Request, res: Response): Promise<SafeObject>;
}
