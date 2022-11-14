import { LowdbSync } from 'lowdb';
import { SafeObject } from "../../types";

export class JsonDb {
  private readonly _db: LowdbSync<SafeObject>;

  private static instance: JsonDb;

  private constructor(db: LowdbSync<SafeObject>) {
    this._db = db;
  }

  static create(db: LowdbSync<any>) {
    this.instance = new this(db);
  }

  static get db(): LowdbSync<SafeObject> {
    return this.instance._db;
  }
}