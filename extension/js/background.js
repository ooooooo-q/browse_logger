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
  loadLatest,
  uploadScreenShotUrl,
  initFireBaseAuth
} from "./firebase"

import {
  setData,
  initIndexedDB,
  updateLastRecord,
  updateLastRecordSelectText,
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

  // 3分後に同じページであればキャプチャをとる
  setTimeout(() => capture(url), 3 * 60 * 1000);
};

const onRemove = (id) => {
  if (id === lastActiveTabId) {

    const timestamp = Date.now();

    updateLastRecord({duration: timestamp - lastActivatedTime});

    lastActiveTabId = null;
    lastActiveUrl = null;
  }
};


const capture = (url) =>  {
  getLastTab((tab) => {
    if (tab.url !== url) { return; }

    getScreenShotUrl((screenShotUrl) => {
      resizeImage(screenShotUrl, (resizeUrl) => {
        uploadScreenShotUrl(resizeUrl).then((fileKey) => {
          updateLastRecord({fileKey});
          console.log(fileKey);
        })
      });
    });
  });
};


// http://www.bokukoko.info/entry/2016/03/28/JavaScript_%E3%81%A7%E7%94%BB%E5%83%8F%E3%82%92%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95
const resizeImage = (base64image, callback) => {
  const MIN_SIZE = 256;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();
  image.crossOrigin = "Anonymous";

  image.onload = function(event) {
    var dstWidth, dstHeight;
    if (this.width > this.height) {
      dstWidth = MIN_SIZE;
      dstHeight = this.height * MIN_SIZE / this.width;
    } else {
      dstHeight = MIN_SIZE;
      dstWidth = this.width * MIN_SIZE / this.height;
    }
    canvas.width = dstWidth;
    canvas.height = dstHeight;
    ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, dstWidth, dstHeight);

    callback(canvas.toDataURL());
  };

  image.src = base64image;
};


const sendToFireStore = () => {
  pluckAll((values) => put(values))
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

  setInterval(sendToFireStore, 60 * 1000);
};


window.onload = () =>  {
    initApp();
};
