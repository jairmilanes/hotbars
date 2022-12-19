import { SafeObject } from "../types";

export class AuthException extends Error {
  name = "AuthException";
  code: string;
  data?: SafeObject | Error;

  constructor(message: string, code: string, data?: SafeObject | Error) {
    super(message);

    this.code = code;

    if (data instanceof Error) {
      this.stack = message.concat("\r\n", data.stack as string);
    } else {
      this.data = data;
    }
  }
}
