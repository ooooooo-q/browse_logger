(function () {
'use strict';

const getLastTab = () => {
  return new Promise((resolve, reject) => {
    const queryOption = {'active': true, 'lastFocusedWindow': true};

    chrome.tabs.query(queryOption, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject(new Error("tabs not found"));
      }
    });
  })
};

const getScreenShotUrl = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(resolve);
  })
};


const initAddListener = (movedNewPage, onRemove, popupRequestHandling) => {
  chrome.tabs.onActivated.addListener(() => getLastTab().then((tab)=> movedNewPage(tab)));
  chrome.tabs.onUpdated.addListener(() => getLastTab().then((tab) => movedNewPage(tab)));
  chrome.tabs.onRemoved.addListener((id) => onRemove(id));

  chrome.extension.onRequest.addListener(popupRequestHandling);
};


const console$1 = chrome.extension.getBackgroundPage().console;

let db;
let user;

//const collectionKey = (uid) => `/log/${uid}/raw`;
const collectionKey = (uid) => `/log/${uid}/raw_2`;


const put = (values) => {

  console$1.log("values",values);

  const uid =  user.uid;
  const collection = collectionKey(uid);
  const data = Object.assign(values, {uid});

  return db.collection(collection).add(data)
    .then((docRef) => {
      console$1.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {console$1.log("Error adding document: ", error);})
};


const uploadScreenShotUrl = (screenShotUrl) =>  {
 const base64String = screenShotUrl.split("base64,")[1];

  const uid =  user.uid;
  const fileKey = `/capture/${uid}/${Date.now()}.png`;

  const metadata = {
    contentType: 'image/png',
  };

  const storageRef = firebase.storage().ref(fileKey);

  return storageRef.putString(base64String, 'base64', metadata)
    .then((snapshot) => {
      console$1.log('Uploaded a base64 string!', snapshot);
      return fileKey;
    }, (e) => {console$1.log(e);});
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
    console$1.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
};

let db$1;
const dbName = "db";
const tableName = "log";

const setData = (data) => {
  const transaction = db$1.transaction([tableName], "readwrite");

  transaction.oncomplete = (event) => {
      console$1.log(event);
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
        console$1.log("updated");
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
        console$1.log("updated");
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
      console$1.log("que end");
    }
  };


};

const initIndexedDB = () => {
  var request = indexedDB.open(dbName, 1);

  request.onsuccess = function(event) {
    db$1 = event.target.result;

    console$1.log("indexed db init All done!");
  };

  request.onerror = function(event) {
    // エラー処理
    console$1.log("indexed db init error", event);
  };

  request.onupgradeneeded = function(event) {
    db$1 = event.target.result;

    console$1.log("indexed db upgrade start");

    db$1.createObjectStore(tableName, { autoIncrement : true });

  };
};

const resizeImage = (base64image) => (
  new Promise((resolve, reject) => {
    const MIN_SIZE = 256;

    const canvas = document.createElement('canvas');
    canvas.width = MIN_SIZE;

    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "Anonymous";

    // https://stackoverflow.com/a/19262385
    image.onload = function() {

      /// set size proportional to image
      canvas.height = canvas.width * (image.height / image.width);

      /// step 1 - resize to 50%
      var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

      oc.width = image.width * 0.5;
      oc.height = image.height * 0.5;
      octx.drawImage(image, 0, 0, oc.width, oc.height);

      /// step 2 - resize 50% of step 1
      octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

      /// step 3, resize to final size
      ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
        0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL());
    };

    image.onerror = function(event) {
      reject(event);
    };

    image.src = base64image;
  })
);

let lastActiveTabId = null;
let lastActiveUrl = null;
let lastActivatedTime = null;

// 状態判定

const isExcludeUrl = (_url) => {
  const url = new URL(_url);

  if (url.protocol === "http" || url.protocol === "https" ){
    return true;
  } else {
    return false;
  }
};

const isLastRecordLogging = () => !!lastActiveUrl;


// 記録イベント

const movedNewPage = (tab) => {

  if (!isLoggedIn()) {return;}

  // 変更がなかったら記録しない
  if (lastActiveUrl === tab.url){return;}

  const timestamp = Date.now();

  if (isLastRecordLogging()){
    updateLastRecord({duration: timestamp - lastActivatedTime});
  }

  if(isExcludeUrl(tab.url)) {
    lastActiveTabId = null;
    lastActiveUrl = null;

    return;
  }

  lastActivatedTime = timestamp;
  lastActiveTabId = tab.id;
  lastActiveUrl = tab.url;

  const url = tab.url;
  const title = tab.title;
  setData({url, title, timestamp});

  // 3分後に同じページであればキャプチャをとる
  setTimeout(() => capture(url), 3 * 60 * 1000);
};

const onRemove = (id) => {
  if (id !== lastActiveTabId ||! isLastRecordLogging()) {
    return;
  }

  const timestamp = Date.now();

  updateLastRecord({duration: timestamp - lastActivatedTime});

  lastActiveTabId = null;
  lastActiveUrl = null;
};


const capture = (url) =>  {
  getLastTab()
    .then((tab) => {
      if (tab.url !== url || !isLastRecordLogging()) {
        throw Error('capture url is not match')
      }
    })
    .then(getScreenShotUrl)
    .then(resizeImage)
    .then(uploadScreenShotUrl)
    .then((fileKey) => {
      updateLastRecord({fileKey});
      console.log(fileKey);
    }).catch(() => {
      //
    });
};

const onSetText = (text) => {
  if(isLastRecordLogging()) {
    updateLastRecordSelectText(text);
  }
};



const popupRequestHandling = (request, sender, sendResponse) => {
  switch(request.message)
  {
    case 'setText':
      onSetText(request.text);
      break;
    case 'loadForPopup':
      loadLatest().then(sendResponse);
      break;
  }
};

// indexed db -> firestore

const sendToFireStore = () => {
  pluckAll((values) => put(values));
};



const initApp = () => {
  initFireBaseAuth();
  initIndexedDB();
  initAddListener(movedNewPage, onRemove, popupRequestHandling);

  setInterval(sendToFireStore, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};

}());
