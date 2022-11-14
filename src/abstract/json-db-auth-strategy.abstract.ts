import { JsonDb } from "../lib/services/json-db";
import { LocalAuthStrateygyAbstract } from "./local-auth-strateygy.abstract";


export abstract class JsonDbAuthStrateygyAbstract extends LocalAuthStrateygyAbstract {

  name = "local"
  successRedirect = "/"

  authenticate(username: string, password: string, done: (error: Error, user: any) => void) {
    console.log(JsonDb.db.get('user')); // .getById("755b03cc-ee8a-490f-b9c2-ae8ebd0bdd05"))
  }
}