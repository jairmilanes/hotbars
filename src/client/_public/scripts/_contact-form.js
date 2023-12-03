/* const constrains = {
  name: {
    presence: true,
    type: "string"
  },
  email: {
    presence: true,
    type: "string",
    email: true
  },
  message: {
    presence: true,
    type: "string",
    length: {
      minimum: 20,
      maximum: 600
    }
  }
} */

/* (() => {
  console.log($(`[hb-contact-form="true"]`))
  $(`[hb-contact-form="true"]`)
    .on("submit", async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const formData = new FormData(e.currentTarget);
      const form = $(e.currentTarget);

      const data = {
        name: form[0].name.value,
        email: form[0].email.value,
        message: form[0].message.value,
      }

      const payload = {
        to: form[0].to.value,
        subject: "New contact message!",
        template: "contact",
        context: {
          name: form[0].name.value,
          email: form[0].email.value,
          message: form[0].message.value,
        }
      };

      await fetch("/_mail/send", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json"
        }
      }).then((response) => {
        console.log("RESPONSE", response)
      });
    });
})()*/
