export class UnregistredDataAdapterException extends Error {
  name = "UnregistredDataAdapterException";

  constructor(name?: string) {
    super(
      `Data adapter "${name || "default"}" has not been loaded and registered.`
    );
  }
}
