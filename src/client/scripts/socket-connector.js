function refreshStylesheets() {
  const sheets = [].slice.call(document.getElementsByTagName("link"));
  const head = document.getElementsByTagName("head")[0];

  for (let i = 0; i < sheets.length; ++i) {
    const elem = sheets[i];

    head.removeChild(elem);

    const rel = elem.rel;

    if (
      (elem.href && typeof rel != "string") ||
      rel.length == 0 ||
      rel.toLowerCase() == "stylesheet"
    ) {
      const url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, "");

      elem.href =
        url +
        (url.indexOf("?") >= 0 ? "&" : "?") +
        "_cacheOverride=" +
        new Date().valueOf();
    }

    head.appendChild(elem);
  }
}

if ("WebSocket" in window) {
  (function () {
    const protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
    const pathname = window.location.pathname.replace(new RegExp("/$"), "");
    const address = protocol + window.location.host + pathname + "/ws/_connect";
    const socket = new WebSocket(address);

    socket.onopen = function (socket) {
      console.info(`Hot reload server connected at: ${address}`);
    };

    socket.onerror = function (err) {
      console.error("Failed to connect", err);
    };

    socket.onmessage = function (event) {
      console.debug("Socket message", event.data);

      if (event.data === "close") {
        return window.close();
      }

      if (["css", "scss"].indexOf(event.data) > -1) {
        return refreshStylesheets();
      }

      return window.location.reload();
    };

    socket.onclose = function (err) {
      if (err) {
        console.error("Connection closed error:", err);
      }

      socket.close();

      if (!err) {
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };
  })();
}
