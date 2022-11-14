import { Strategy } from "passport";
import { Request, Response, NextFunction } from "express";


export abstract class AuthStrategyAbstract {

  abstract name: string;
  abstract successRedirect: string;

  abstract createStrategy(): Strategy;

  abstract configure(): {[key: string]: any};

  abstract authenticate(...args: any[]): void;

  onSuccess(req: Request, res: Response, next: NextFunction): void {
    res.redirect('/');
  };
}


export { Strategy } from "passport";