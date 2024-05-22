class RestError extends Error {
  status;
  constructor(statusCode, message) {
    super(message);
    this.status = statusCode
  }
}

const defaults = {
  headers: {
    "Content-Type": "application/json"
  }
};

$.rest = {
  get: (url, params) => {
    return fetch($.url(url, params)).then(response => response.json())
  },
  post: (url, body) => {
    return fetch($.url(url), {
      method: "POST",
      body: JSON.stringify(body),
      ...defaults
    }).then(response => {
      if ([200, 201].indexOf(response.status) < 0) {
        throw new RestError(response.status, response.statusText)
      }
      return response.json()
    })
  },
  patch: (url, body) => {
    return fetch($.url(url), {
      method: "PATCH",
      body: JSON.stringify(body),
      ...defaults
    }).then(response => response.json())
  },
  put: (url, body) => {
    return fetch($.url(url), {
      method: "PUT",
      body: JSON.stringify(body),
      ...defaults
    }).then(response => response.json())
  },
  delete: (url) => {
    return fetch($.url(url), {
      method: "DELETE"
    }).then(response => response.json())
  },
  custom: (url, method, options) => {
    return fetch($.url(url), {
      method: method,
      ...options
    })
  }
}