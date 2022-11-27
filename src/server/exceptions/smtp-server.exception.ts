import { SafeObject } from "../types";

export class SMTPServerException extends Error {
  name = "SMTPServerException";
  responseCode: number;
  data?: SafeObject | Error;

  constructor(message: string, code: number, data?: SafeObject | Error) {
    super(message);

    this.responseCode = code;

    if (data instanceof Error) {
      this.stack = message.concat("\r\n", data.stack as string);
    } else {
      this.data = data;
    }
  }
}
