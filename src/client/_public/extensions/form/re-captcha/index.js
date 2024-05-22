async function onSubmitWithCaptcha(token, captchaName) {
  const response = await fetch(`/re-captcha/verify/${token}`);
  const captchaElem = $(`#${captchaName}`);

  if (response.status === 200) {
    $("button[type=submit]").removeAttr("disabled");
    captchaElem.data("captcha", true);
    return;
  }

  grecaptcha.reset();

  captchaElem.data("loaded", false);
  captchaElem.data("captcha", false);
}