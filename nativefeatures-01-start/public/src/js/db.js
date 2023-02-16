//var idb=require("https://cdn.jsdelivr.net/npm/idb@7/build/umd.js");

var databaseName = "LMS";

var db = {};
var dbPromise = idb.openDB(databaseName, 1, {
  upgrade(db, oldversion, newversion, transaction, event) {
    if (!db.objectStoreNames.contains("sync-courses")) {
      db.createObjectStore("sync-courses", { autoIncrement: true });
      // db.createObjectStore("sync-courses", { autoIncrement: true });
      //db.createObjectStore("sync-courses", { autoIncrement: true });
    }
  },
});

db.writeData = (storeName, data) => {
  return dbPromise.then((database) => {
    const txn = database.transaction(storeName, "readwrite");
    const store = txn.objectStore(storeName);
    store.put(data);
    return txn.done;
  });
};

db.readAllData = (storeName) => {
  return dbPromise.then((database) => {
    const txn = database.transaction(storeName, "readonly");
    const store = txn.objectStore(storeName);
    return store.getAll();
  });
};

db.deleteData = (storeName, key) => {
  return dbPromise.then((database) => {
    const txn = database.transaction(storeName, "readwrite");
    const store = txn.objectStore(storeName);
    store.delete(data);
    return txn.done;
  });
};
