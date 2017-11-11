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
  initFireBaseAuth,
  downloadUrl,
  register,
  login
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

let excludeDomains = [];

// 状態判定

const isExcludeUrl = (_url) => {
  const url = new URL(_url);

  // http, https 以外は記録しない
  if (!["http:", "https:"].includes(url.protocol)) {
    return true;
  }

  // option pageで , 区切りで設定したドメインと完全一致していたら記録しない
  return excludeDomains.some((domain) => domain === url.host);
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
    console.log("not loggged", tab.url);

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
  setTimeout(() => capture(url), 0.5 * 60 * 1000);
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
    case 'forceLoad':
      sendToFireStore().then(() =>loadLatest()).then(sendResponse);
      break;
    case 'login':
      login(request.email, request.password)
        .then(()=> sendResponse({}), (e) => sendResponse({code: e.code, message: e.message}));
      break;
    case 'register':
      register(request.email, request.password)
        .then(() => sendResponse({}), (e) => sendResponse({code: e.code, message: e.message}));
      break;
    case 'isLoggedIn':
      sendResponse(isLoggedIn());
      break;
    case 'downloadUrl':
      downloadUrl(request.fileKey).then(sendResponse);
      break;
    default:
      break;
  }
};

// indexed db -> firestore

const sendToFireStore = () => {
  return pluckAll((values) => put(values))
};


// setting

const initSettingLoad = () => {
  const defaults = {
    excludeDomains: ""
  };

  chrome.storage.local.get(defaults, (items) => {
    excludeDomains = items.excludeDomains.split(",").map((s) => s.trim());
  });
};

const initApp = () => {
  initFireBaseAuth();
  initIndexedDB();
  initAddListener(movedNewPage, onRemove, popupRequestHandling);
  initSettingLoad();

  setInterval(sendToFireStore, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};
