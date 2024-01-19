

class IndexedDb {
  _db
  _upgradeCallback
  _blockedCallback
  _callbacks = {}

  constructor(name, upgradeCallback, blockedCallback) {
    const request= indexedDB.open(name, 2)

    this.setUpgradeCallback(upgradeCallback)
    this.setBlockedCallback(blockedCallback)

    request.onerror = this.onError.bind(this)
    request.onsuccess = this.onSuccess.bind(this)
    request.onupgradeneeded = this.onUpgradeNeeded.bind(this)
    request.onblocked = this.onBlocked.bind(this)
  }

  setUpgradeCallback(upgradeCallback) {
    this._upgradeCallback = upgradeCallback
  }

  setBlockedCallback(blockedCallback) {
    this._blockedCallback = blockedCallback
  }

  createStore(name, options, callback) {
    return new Promise((resolve, reject) => {
      console.log("Creatying DB", name, options)
      const store = this._db
        .createObjectStore(name, {
          keyPath: options.key,
          autoIncrement: options.autoIncrement || false
        })

      console.log("---store", store)

      store.transaction.oncomplete = (event) => {
        console.log("Create Store:OnComplete", event)

        if (typeof callback === "function") {
          callback(store, this._db)
        }

        resolve(event)
      }

      store.transaction.onerror = this.handleError("Create Store", reject)
    })

    // store.createIndex("key", "key", { unique: true })
    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    /* store.transaction.oncomplete = (event) => {
        // Store values in the newly created objectStore.
        const customerObjectStore = db
        .transaction("customers", "readwrite")
        .objectStore("customers")

        customerData.forEach((customer) => {
          customerObjectStore.add(customer)
        });
      }; */
  }

  store(table, write = false) {
    return this._db.transaction([table], write ? "readwrite" : null).objectStore(table);
  }

  get(table, value) {
    const store = this.store(table)
    const request = store.get(value)

    return new Promise((resolve, reject) => {
      request.onerror = this.handleError("Get", reject)

      request.onsuccess = (event) => {
        console.log("Get:OnSuccess", event)
        const data = event.target.result;
        resolve(data)
      }
    })
  }

  add(table, data) {
    const store = this.store(table)
    const request = store.add(data)

    return new Promise((resolve, reject) => {
      request.onerror = this.handleError("Add", reject)

      request.onsuccess = (event) => {
        const data = event.target.result;
        resolve(data)
      }
    })
  }

  remove(table, value) {
    const store = this.store(table, true)
    return new Promise((resolve, reject) => {
      const request = store.delete(value);
      request.onerror = this.handleError("Remove", reject)
      request.onsuccess = resolve
    })
  }

  update(table, value, data) {
    const record = this.get(table, value)

    return new Promise((resolve, reject) => {
      if (record) {
        const objectStore = this.store(table);
        const requestUpdate = objectStore.put(data);
        requestUpdate.onerror = this.handleError("Update", reject);
        requestUpdate.onsuccess = resolve;
      }
    })
  }

  upsert(table, value, data) {
    const record = this.get(table, value)

    return new Promise((resolve, reject) => {
      const objectStore = this.store(table);

      if (record) {
        const requestUpdate = objectStore.put(data);
        requestUpdate.onerror = this.handleError("Upsert", reject);
        requestUpdate.onsuccess = resolve;
      } else {
        const requestUpdate = objectStore.add(data);
        requestUpdate.onerror = this.handleError("Upsert", reject);
        requestUpdate.onsuccess = resolve;
      }
    })
  }

  each(table, callback) {
    const objectStore = this.store(table);

    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        callback(cursor.key, cursor.value)
        cursor.continue();
      }
    };
  }

  on(eventName, callback) {
    if (Array.isArray(this._callbacks[eventName])) {
      this._callbacks[eventName] = []
    }
    this._callbacks[eventName].push(callback)
  }

  off(eventName, callback) {
    if (eventName in this._callbacks) {
      this._callbacks[eventName] = this._callbacks[eventName]
        .filter(cb => cb !== callback)
    }
  }

  handleError(name, callback) {
    return (event) => {
      console.error(`${name}:onError`, event)
      callback(event)
    }
  }

  onBlocked(event) {
    // If some other tab is loaded with the database, then it needs to be closed
    // before we can proceed.
    console.warn("Please close all other tabs with this site open!");
    console.warn("Blocked Event", event)
    if (typeof this._blockedCallback === "function") {
      this._blockedCallback(this)
    }
  }

  onUpgradeNeeded(event) {
    // All other databases have been closed. Set everything up.
    // this._db.createObjectStore(/* … */);
    this.useDatabase(event.target.result)

    if (typeof this._upgradeCallback === "function") {
      this._upgradeCallback(this)
    }
  }

  onSuccess(event) {
    this.useDatabase(event.target.result)
  }

  onError(event) {
    this.useDatabase(event.target.result)
  }

  useDatabase(db) {
    this._db = db
    // Make sure to add a handler to be notified if another page requests a version
    // change. We must close the database. This allows the other page to upgrade the database.
    // If you don't do this then the upgrade won't happen until the user closes the tab.
    db.onversionchange = (event) => {
      db.close();
      console.log(
        "A new version of this page is ready. Please reload or close this tab!",
      )
    }
  }
}

(() => {
  $.indexDb = (name, upgradeCallback, blockedCallback) =>
    new IndexedDb(name, upgradeCallback, blockedCallback)

  $.cache = function() {
    const table = "cache"

    const cache = $.indexDb(
      table,
      async (instance) => {
        console.log("DB CREATED!")
        const store = await instance.createStore("cache", { key: "_cache" })

        store.createIndex("key", "key", { unique: true })

        store.transaction.oncomplete = (event) => {
          console.info("Cache DB Created!")
        }
      })

    return {
      set: (key, data) => cache.upsert(table, key, data),
      get: (key) => cache.get(table, key),
      remove: (key) => cache.remove(table, key),
    }
  }
})()