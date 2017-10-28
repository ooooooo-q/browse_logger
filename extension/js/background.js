import {
  getLastTab,
  initAddListener,
  getScreenShotUrl
} from "./extensionEvents"

import {
  isLoggedIn,
  setDuration,
  add,
  uploadScreenShotUrl,
  initFireBaseAuth
} from "./firebase"


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
    setDuration(lastDocRef, lastActivatedTime)
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


const capture = () =>  {
  if (!lastActiveUrl){return}

  getLastTab((tab) => {
    if (tab.url !== lastActiveUrl) { return;}

    getScreenShotUrl(uploadScreenShotUrl);
  });
};



const initApp = () => {
  initFireBaseAuth();
  initAddListener(movedNewPage, onRemove);
};


window.onload = () =>  {
    initApp();
};
