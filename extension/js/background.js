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
  pluckAll((values) => put(values))
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
