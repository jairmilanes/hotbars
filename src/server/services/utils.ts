import fs from "fs-extra"


export async  function readJson(path: string) {
  return fs.readJson(path, { encoding: "utf-8" })
}