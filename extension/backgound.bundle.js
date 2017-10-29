(function () {
'use strict';

const getLastTab = (cb) => {
  const queryOption = {'active': true, 'lastFocusedWindow': true};

  chrome.tabs.query(queryOption, (tabs) => {
    if (tabs.length > 0) {
      cb(tabs[0]);
    }
  });
};




const initAddListener = (movedNewPage, onRemove, onSetText, loadForPopup) => {
  chrome.tabs.onActivated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onUpdated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onRemoved.addListener((id) => onRemove(id));

  chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
    switch(request.message)
    {
      case 'setText':
        onSetText(request.text);
        break;
      case 'loadForPopup':
        loadForPopup((data) => sendResponse(data));
        break;
    }
  });
};


const console = chrome.extension.getBackgroundPage().console;

let db;
let user;

//const collectionKey = (uid) => `/log/${uid}/raw`;
const collectionKey = (uid) => `/log/${uid}/raw_2`;

//export const setDuration = (ref, lastActivatedTime) => {
//  const timestamp = Date.now();
//
//  ref.update({"duration": timestamp - lastActivatedTime})
//    .then(() => {console.log("Document update with ID: ")})
//    .catch((error) => {console.log("Error update document: ", error)})
//};
//
//
//export const add = (url, title, timestamp, cb) => {
//  const uid =  user.uid;
//  const collection = collectionKey(uid);
//
//  db.collection(collection).add({uid, url, title, timestamp})
//    .then((docRef) => {
//      console.log("Document written with ID: ", docRef.id);
//      cb(docRef);
//    })
//    .catch((error) => {console.log("Error adding document: ", error)})
//};


const put = (values) => {

  console.log("values",values);

  const uid =  user.uid;
  const collection = collectionKey(uid);
  const data = Object.assign(values, {uid});

  return db.collection(collection).add(data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {console.log("Error adding document: ", error);})
};




const isLoggedIn = () => {
  return !!user;
};

const loadLatest = () => {
  const uid =  user.uid;
  const collection = collectionKey(uid);

  return db.collection(collection).orderBy("timestamp", "desc").limit(10)
    .get().then((querySnapshot) => querySnapshot.docs.map((d) => d.data()));
};


const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();

  firebase.auth().onAuthStateChanged((_user) => {
    user = _user;
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
};

let db$1;
const dbName = "db";
const tableName = "log";

const setData = (data) => {
  const transaction = db$1.transaction([tableName], "readwrite");

  transaction.oncomplete = (event) => {
      console.log(event);
  };

  transaction.objectStore(tableName).add(data);
};


const updateLastRecord = (values) => {
  const objectStore = db$1.transaction([tableName], "readwrite").objectStore(tableName);

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

const updateLastRecordSelectText = (text) => {
  const objectStore = db$1.transaction([tableName], "readwrite").objectStore(tableName);

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

const pluckAll = (pushPromise) => {
  const objectStore = db$1.transaction([tableName], "readwrite").objectStore(tableName);

  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor){
      const key = cursor.key;
      const values = cursor.value;

      // 閲覧が終わっていないのであればsendしない。
      if (values.duration && values.duration >= 0) {
        pushPromise(cursor.value).then(() => {
          const objectStore = db$1.transaction([tableName], "readwrite").objectStore(tableName);
          objectStore.delete(key);
        });
      }

      cursor.continue();
    } else {
      console.log("que end");
    }
  };


};

const initIndexedDB = () => {
  var request = indexedDB.open(dbName, 1);

  request.onsuccess = function(event) {
    db$1 = event.target.result;

    console.log("indexed db init All done!");
  };

  request.onerror = function(event) {
    // エラー処理
    console.log("indexed db init error", event);
  };

  request.onupgradeneeded = function(event) {
    db$1 = event.target.result;

    console.log("indexed db upgrade start");

    db$1.createObjectStore(tableName, { autoIncrement : true });

  };
};

let lastActiveTabId = null;
let lastActiveUrl = null;
let lastActivatedTime = null;

const movedNewPage = (tab) => {

  if (!isLoggedIn()) {return;}

  // 変更がなかったら記録しない
  if (lastActiveUrl === tab.url){return;}

  const url = tab.url;
  const title = tab.title;
  const timestamp = Date.now();

  updateLastRecord({duration: timestamp - lastActivatedTime});

  lastActivatedTime = timestamp;

  lastActiveTabId = tab.id;
  lastActiveUrl = url;

  setData({url, title, timestamp});
};

const onRemove = (id) => {
  if (id === lastActiveTabId) {

    const timestamp = Date.now();

    updateLastRecord({duration: timestamp - lastActivatedTime});

    lastActiveTabId = null;
    lastActiveUrl = null;
  }
};


const sendTest = () => {
  pluckAll((values) => put(values));
};

const onSetText = (text) => {
  updateLastRecordSelectText(text);
};


const loadForPopup = (cb) => {
  loadLatest().then(cb);
};

const initApp = () => {
  initFireBaseAuth();
  initIndexedDB();
  initAddListener(movedNewPage, onRemove, onSetText, loadForPopup);

  setInterval(sendTest, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};

}());
