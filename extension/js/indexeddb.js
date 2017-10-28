import {
  console
} from "./extensionEvents";

let db;
const dbName = "db";
const tableName = "log";

export const setData = (data) => {
  const transaction = db.transaction([tableName], "readwrite");

  transaction.oncomplete = (event) => {
      console.log(event)
  };

  transaction.objectStore(tableName).add(data)
};


export const updateLastRecord = (values) => {
  const objectStore = db.transaction([tableName], "readwrite").objectStore(tableName);

  // 最後のものを更新
  objectStore.openCursor(null, "prev").onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor){
      const updateData = Object.assign(cursor.value, values);

      const request = cursor.update(updateData);
      request.onsuccess = () => {
        console.log("updated");
      };
    }
  };
};

export const updateLastRecordSelectText = (text) => {
  const objectStore = db.transaction([tableName], "readwrite").objectStore(tableName);

  // 最後のものを更新
  objectStore.openCursor(null, "prev").onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor){
      const texts = cursor.value.texts || [];
      texts.push(text);
      const updateData = Object.assign(cursor.value, {texts});

      const request = cursor.update(updateData);
      request.onsuccess = () => {
        console.log("updated");
      };
    }
  };
};

export const pluckAll = (pushPromise) => {
  const objectStore = db.transaction([tableName], "readwrite").objectStore(tableName);

  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor){
      const key = cursor.key;
      const values = cursor.value;

      // 閲覧が終わっていないのであればsendしない。
      if (values.duration && values.duration >= 0) {
        pushPromise(cursor.value).then(() => {
          const objectStore = db.transaction([tableName], "readwrite").objectStore(tableName);
          objectStore.delete(key);
        });
      }

      cursor.continue();
    } else {
      console.log("que end")
    }
  };


};

export const initIndexedDB = () => {
  var request = indexedDB.open(dbName, 1);

  request.onsuccess = function(event) {
    db = event.target.result;

    console.log("indexed db init All done!");
  };

  request.onerror = function(event) {
    // エラー処理
    console.log("indexed db init error", event);
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;

    console.log("indexed db upgrade start");

    db.createObjectStore(tableName, { autoIncrement : true });

  };
};