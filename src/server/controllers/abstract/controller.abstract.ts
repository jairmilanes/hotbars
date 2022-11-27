import { Request, Response } from "express";
import { Config } from "../../core";
import { SafeObject } from "../../types";

export abstract class ControllerAbstract {
  private config: Config;

  protected constructor(config: Config) {
    this.config = config;
  }

  abstract handle(req: Request, res: Response): Promise<SafeObject>;
}
