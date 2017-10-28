import {
  getLastTab,
  initAddListener,
  getScreenShotUrl
} from "./extensionEvents"

import {
  isLoggedIn,
  //setDuration,
  //add,
  put,
  uploadScreenShotUrl,
  initFireBaseAuth
} from "./firebase"

import {
  setData,
  initIndexedDB,
  updateLastRecord,
  pluckAll
} from "./indexeddb";


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


const capture = () =>  {
  if (!lastActiveUrl){ return; }

  getLastTab((tab) => {
    if (tab.url !== lastActiveUrl) { return; }

    getScreenShotUrl(uploadScreenShotUrl);
  });
};


const sendTest = () => {
  pluckAll((values) => put(values))
};


const initApp = () => {
  initFireBaseAuth();
  initIndexedDB();
  initAddListener(movedNewPage, onRemove);

  setInterval(sendTest, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};
