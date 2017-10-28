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




const initAddListener = (movedNewPage, onRemove) => {
  chrome.tabs.onActivated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onUpdated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onRemoved.addListener((id) => onRemove(id));
};


const console = chrome.extension.getBackgroundPage().console;

let db;
let user;

const collectionKey = (uid) => `/log/${uid}/raw`;

const setDuration = (ref, lastActivatedTime) => {
  const timestamp = Date.now();

  ref.update({"duration": timestamp - lastActivatedTime})
    .then(() => {console.log("Document update with ID: ");})
    .catch((error) => {console.log("Error update document: ", error);});
};


const add = (url, title, timestamp, cb) => {
  const uid =  user.uid;
  const collection = collectionKey(uid);

  db.collection(collection).add({uid, url, title, timestamp})
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      cb(docRef);
    })
    .catch((error) => {console.log("Error adding document: ", error);});
};



const isLoggedIn = () => {
  return !!user;
};

const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();

  firebase.auth().onAuthStateChanged((_user) => {
    user = _user;
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
};

let lastActiveTabId = null;
let lastActiveUrl = null;
let lastDocRef = null;
let lastActivatedTime = null;

const movedNewPage = (tab) => {

  if (!isLoggedIn()) {return;}

  // 変更がなかったら記録しない
  if (lastActiveUrl === tab.url){return;}

  const url = tab.url;
  const title = tab.title;
  const timestamp = Date.now();

  //console.log(url);

  if (lastDocRef) {
    setDuration(lastDocRef, lastActivatedTime);
  }

  add(url, title, timestamp, (_ref) => {
    lastDocRef = _ref;

    lastActiveTabId = tab.id;
    lastActiveUrl = url;
    lastActivatedTime = timestamp;

    //setTimeout(capture, 10 * 1000) ライフサイクルを考えてから
  });
};

const onRemove = (id) => {
  if (id === lastActiveTabId) {

    if (lastDocRef) {
      setDuration(lastDocRef, lastActivatedTime);
    }

    lastActiveTabId = null;
    lastActiveUrl = null;
    lastDocRef = null;
  }
};


const initApp = () => {
  initFireBaseAuth();
  initAddListener(movedNewPage, onRemove);
};


window.onload = () =>  {
    initApp();
};

}());
