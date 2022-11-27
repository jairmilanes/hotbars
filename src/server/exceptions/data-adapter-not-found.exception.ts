export class DataAdapterNotFoundException extends Error {
  name = "DataAdapterNotFoundException";

  constructor(name: string, path: string, original?: Error) {
    super(`Data adapter "${name}" couold not be found at: ${path}.`);

    this.stack = original?.stack;
  }
}
