import {
  getLastTab,
  initAddListener,
  getScreenShotUrl
} from "./api/extensionEvents"

import {
  isLoggedIn,
  put,
  loadLatest,
  uploadScreenShotUrl,
  initFireBaseAuth
} from "./api/firebase"

import {
  setData,
  initIndexedDB,
  updateLastRecord,
  updateLastRecordSelectText,
  pluckAll
} from "./api/indexeddb";

import {
  resizeImage
} from "./util";


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

  if (isLastRecordLogging()){
    updateLastRecord({duration: timestamp - lastActivatedTime});
  }

  if(isExcludeUrl(url)) {
    lastActiveTabId = null;
    lastActiveUrl = null;

    return;
  }

  lastActivatedTime = timestamp;

  lastActiveTabId = tab.id;
  lastActiveUrl = url;

  setData({url, title, timestamp});

  // 3分後に同じページであればキャプチャをとる
  setTimeout(() => capture(url), 0.5 * 60 * 1000);
};

const onRemove = (id) => {
  if (id === lastActiveTabId || isLastRecordLogging()) {

    const timestamp = Date.now();

    updateLastRecord({duration: timestamp - lastActivatedTime});

    lastActiveTabId = null;
    lastActiveUrl = null;
  }
};

const isExcludeUrl = (_url) => {
  const url = new URL(_url);

  if (url.protocol === "http" || url.protocol === "https" ){
    return true;
  } else {
    return false;
  }
};

const isLastRecordLogging = () => !!lastActiveUrl;


const capture = (url) =>  {
  getLastTab((tab) => {
    if (tab.url !== url || !isLastRecordLogging()) { return; }

    getScreenShotUrl((screenShotUrl) => {
      resizeImage(screenShotUrl)
        .then(uploadScreenShotUrl)
        .then((fileKey) => {
          updateLastRecord({fileKey});
          console.log(fileKey);
        })
    });
  });
};



const sendToFireStore = () => {
  pluckAll((values) => put(values))
};

const onSetText = (text) => {
  if(isLastRecordLogging()) {
    updateLastRecordSelectText(text);
  }
};


const loadForPopup = (cb) => {
  loadLatest().then(cb);
};

const initApp = () => {
  initFireBaseAuth();
  initIndexedDB();
  initAddListener(movedNewPage, onRemove, onSetText, loadForPopup);

  setInterval(sendToFireStore, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};
