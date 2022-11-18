/* eslint-disable @typescript-eslint/no-explicit-any */
import { LowdbSync } from "lowdb";
import {
  eq,
  gt,
  gte,
  lt,
  lte,
  pick,
  isNumber,
  get,
  isNil,
  CollectionChain,
} from "lodash";
import { SafeObject } from "../../../types";
import { QueryBuilder } from "./query-builder";

const filters: { [key: string]: (value: any, other: any) => boolean } = {
  "==": eq,
  ">": gt,
  "<": lt,
  ">=": gte,
  "<=": lte,
};

interface Db {
  [name: string]: object[];
}

export default class LowdbAdaptor extends QueryBuilder {
  _api: LowdbSync<Db>;

  constructor(lowDb: LowdbSync<Db>, collection?: string) {
    super(collection);
    this._api = lowDb;
  }

  from(collection: string): LowdbAdaptor {
    return new LowdbAdaptor(this._api, collection);
  }

  protected query(
    collection: CollectionChain<object>
  ): CollectionChain<object> {
    this.queue.forEach((op) => {
      if (op.type === "eq" && op.args.length === 2) {
        collection = collection.filter(
          (e: SafeObject) => get(e, String(op.args[0])) === op.args[1]
        );
      }

      if (op.type === "neq" && op.args.length === 2) {
        collection = collection.filter(
          (e: SafeObject) => get(e, String(op.args[0])) !== op.args[1]
        );
      }

      if (op.type === "gt" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));

          if (isNil(value) || !isNumber(value) || !isNumber(op.args[1]))
            return false;

          return value > op.args[1];
        });
      }

      if (op.type === "gte" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));

          if (isNil(value) || !isNumber(value) || !isNumber(op.args[0]))
            return false;

          return Number(value) >= op.args[0];
        });
      }

      if (op.type === "lt" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));

          if (isNil(value) || !isNumber(value) || !isNumber(op.args[0]))
            return false;

          return Number(value) < op.args[0];
        });
      }

      if (op.type === "lte" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));

          if (isNil(value) || !isNumber(value) || !isNumber(op.args[0]))
            return false;

          return Number(value) <= op.args[0];
        });
      }

      if (op.type === "in" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));
          return (op.args[1] as any[]).indexOf(value) > -1;
        });
      }

      if (op.type === "nin" && op.args.length === 2) {
        collection = collection.filter((e: SafeObject) => {
          const value = get(e, String(op.args[0]));
          return (op.args[1] as any[]).indexOf(value) === -1;
        });
      }

      if (op.type === "filter") {
        collection = collection.filter((e: object) => {
          const value = get(e, String(op.args[0]));

          if (op.args[1] === "!=") {
            return !filters["eq"](value, op.args[2]);
          }

          return filters[op.args[1] as string](value, op.args[2]);
        });
      }

      if (op.type === "cb") {
        collection = collection.filter((e: object) => {
          if (typeof op.args[0] !== "function") {
            return false;
          }

          return op.args[0](e);
        });
      }
    });

    if (this._order.length) {
      collection = collection.orderBy(...this._order);
    }

    return collection;
  }

  protected async exec() {
    if (!this.collection) {
      throw new Error("Query executed without a collection.");
    }

    let collection = this._api.get(this.collection);

    if (this.id) {
      return collection.getById(this.id as string).value();
    }

    collection = this.query(collection);

    if (this._limit === 1) {
      if (this.fields.length) {
        return collection.first().pick(this.fields).value();
      }
      return collection.first().value();
    }

    if (this._offset > 0) {
      if (this._limit > this._offset) {
        collection = collection.slice(
          this._offset - 1,
          this._offset - 1 + this._limit
        );
      } else {
        collection = collection.slice(this._offset - 1);
      }
    }

    if (!this._offset && this._limit > 1) {
      collection = collection.take(this._limit);
    }

    if (this.fields.length) {
      return collection.map((c) => pick(c, this.fields)).value();
    }

    return collection.value();
  }

  async insert(record: Record<string, any>): Promise<Record<string, any>> {
    const row = this._api.get(this.collection).insert(record).value();
    return this.write<Record<string, any>>(row);
  }

  async upsert(record: Record<string, any>): Promise<Record<string, any>> {
    const row = this._api.get(this.collection).upsert(record).value();
    return this.write<Record<string, any>>(row);
  }

  async update(
    id: string,
    record: Record<string, any>
  ): Promise<Record<string, any>> {
    const row = this._api.get(this.collection).updateById(id, record).value();
    return this.write<Record<string, any>>(row);
  }

  async updateWhere(
    predicate: Record<string, any>,
    attr: Record<string, any>
  ): Promise<Record<string, any>[]> {
    const rows = this._api.get(this.collection).updateWhere(predicate, attr).value();
    return this.write<Record<string, any>[]>(rows)
  }

  async delete(id: string): Promise<Record<string, any>> {
    const row = this._api.get(this.collection).removeById(id).value();
    return this.write<Record<string, any>>(row)
  }

  async deleteWhere(
    predicate: Record<string, any>
  ): Promise<Record<string, any>[]> {
    const rows = this._api.get(this.collection).removeWhere(predicate).value();
    return this.write<Record<string, any>[]>(rows)
  }

  private write<T>(record: T): T {
    this._api.write()
    return record as T;
  }
}
