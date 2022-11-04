import { SafeObject } from "../../types";

export class HandlebarsException extends Error {
  data?: SafeObject | Error;

  constructor(message: string, data?: SafeObject | Error) {
    super(message);

    if (data instanceof Error) {
      this.stack = message.concat("\r\n", data.stack as string);
    } else {
      this.data = data;
    }
  }
}
