function refreshStylesheets() {
  const sheets = [].slice.call(document.getElementsByTagName("link"));

  for (let i = 0; i < sheets.length; ++i) {
    const elem = sheets[i];

    if (!elem.href) continue;

    if (elem.href.indexOf(window.location.host) < 0) {
      continue;
    }

    if (!elem.rel || elem.rel.toLowerCase() === "stylesheet") {
      const time = new Date().valueOf();
      const prefix = elem.href.indexOf("?") >= 0 ? "&" : "?";
      const key = "_cacheOverride";

      if (elem.href.indexOf(key) < 0) {
        elem.href = `${elem.href}${prefix}${key}=${time}`;
      } else {
        elem.href = elem.href.replace(
          /_cacheOverride=\d+/,
          "_cacheOverride=" + time
        );
      }
    }
  }
}

if ("WebSocket" in window) {
  (function () {
    const protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
    const address = protocol + window.location.host + "/ws/_connect";
    const socket = new WebSocket(address);

    socket.onopen = (socket) => {
      console.info(`Hot reload server connected at: ${address}`);
    };

    socket.onerror = (err) => {
      console.error("Failed to connect", err);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("HOT Reloading", data)

      if (data === "close") {
        return window.close();
      }

      if (data.type === "scss") {
        return;
      }

      if (data.type === "css") {
        return refreshStylesheets(data.file);
      }

      return window.location.reload();
    };

    socket.onclose = (err) => {
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
