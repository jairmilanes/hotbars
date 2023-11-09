export class ConfigFileException extends Error {
  name = "ConfigFileException";

  constructor(name: string, original?: Error) {
    super(`Config file "${name}" couold not be found.`);

    this.stack = original?.stack;
  }
}
