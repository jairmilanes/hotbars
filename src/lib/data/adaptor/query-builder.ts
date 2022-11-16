export type FilterCallback = (value: Record<string, any>) => boolean;

export type MixedValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | FilterCallback
  | null;

export type Filter = { type: string; args: MixedValue[] };

export abstract class QueryBuilder {
  protected collection = "";

  protected id: string | number | null = null;

  protected fields: string[] = [];

  protected queue: Filter[] = [];

  protected _order: Array<string[]> = [];

  protected _offset = 0;

  protected _limit = -1;

  protected constructor(collection?: string) {
    if (collection) {
      this.collection = collection;
    }
  }

  abstract from(collection: string): QueryBuilder;

  select(...fdls: string[]) {
    this.fields = fdls;
    return this;
  }

  get(id: string) {
    this.id = id;
    return this.exec();
  }

  eq(field: string, value: string) {
    this.queue.push({ type: "eq", args: [field, value] });
    return this;
  }

  neq(field: string, value: string) {
    this.queue.push({ type: "neq", args: [field, value] });
    return this;
  }

  is(field: string, value: string) {
    this.queue.push({ type: "is", args: [field, value] });
    return this;
  }

  gt(field: string, value: string) {
    this.queue.push({ type: "gt", args: [field, value] });
    return this;
  }

  lt(field: string, value: string) {
    this.queue.push({ type: "lt", args: [field, value] });
    return this;
  }

  gte(field: string, value: string) {
    this.queue.push({ type: "gte", args: [field, value] });
    return this;
  }

  lte(field: string, value: string) {
    this.queue.push({ type: "lte", args: [field, value] });
    return this;
  }

  in(field: string, values: string[]) {
    this.queue.push({ type: "in", args: [field, values] });
    return this;
  }

  filter(field: string, condition: string, value: string) {
    const conditions = ["==", "!=", ">", "<", ">=", "<="];

    if (conditions.indexOf(condition) < 0)
      throw new Error(
        `Invalid filter condition, must be one of (${conditions.join(", ")})`
      );

    this.queue.push({ type: "filter", args: [field, condition, value] });
    return this;
  }

  callback(cb: FilterCallback) {
    this.queue.push({ type: "cb", args: [cb] });
    return this;
  }

  order(fields: string[], direction: string[]) {
    this._order = [fields, direction];
  }

  offset(offset: number) {
    this._offset = offset;
    return this;
  }

  limit(limit: number) {
    this._limit = limit;
    return this.exec();
  }

  single() {
    this._limit = 1;
    return this.exec();
  }

  all() {
    return this.exec();
  }

  abstract exec(): any;
}
