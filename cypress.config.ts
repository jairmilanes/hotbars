import { defineConfig } from "cypress";

const login = async () => {
  return fetch(`/_hotbars/_sign-in/local?type=json`, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      "username": "jmilanes@dashfy.ca",
      "password": "09089816"
    })
  })
    .then(response => response.json())
    .then((response) => {
      if (response.status === 200) {
        return response.body;
      }
      throw new Error("Sign-in attempt failed.");
    });
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here3
      on('before:run', async (details) => {
        /* ... */
        await login()
      })
    },
  },
});
