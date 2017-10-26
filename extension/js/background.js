let db;
let user;

let stockUrl;
let storage;

let lastActiveTabId = null;
let lastActiveUrl = null;
let lastDocRef = null;
let lastActivatedTime = null;


const getLastTab = (cb) => {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
    if (tabs.length > 0) {
      cb(tabs[0])
    }
  });
};

const getScreenShotUrl = (cb) => {
  chrome.tabs.captureVisibleTab(function(screenShotUrl) {
    cb(screenShotUrl)
  });
};

const console = chrome.extension.getBackgroundPage().console;

chrome.tabs.onActivated.addListener(() => getLastTab((tab) => loggedUrl(tab)));
chrome.tabs.onUpdated.addListener(() => getLastTab((tab) => loggedUrl(tab)));
chrome.tabs.onRemoved.addListener((id) => onRemove(id));



function loggedUrl(tab) {

  if (!user) {return;}

  const url = tab.url;
  const title = tab.title;
  const timestamp = Date.now();
  const uid = user.uid;

  // 変更がなかったら記録しない
  if (lastActiveUrl === url){return;}

  lastActiveTabId = tab.id;
  lastActiveUrl = url;

  console.log(url);

  const collection = `/log/${uid}/raw`;

  if (lastDocRef) {
    lastDocRef.update({"duration": timestamp - lastActivatedTime})
      .then(() => {
        console.log("Document update with ID: ")
      })
      .catch((error) => {console.log("Error update document: ", error)})
  }

  lastActivatedTime = timestamp;

  db.collection(collection).add({uid, url, title, timestamp})
  .then((docRef) => {
    console.log("Document written with ID: ", docRef.id)
    lastDocRef = docRef;
  })
  .catch((error) => {console.log("Error adding document: ", error)})

  //setTimeout(capture, 10 * 1000) ライフサイクルを考えてから
}

const onRemove = (id) => {
  if (id === lastActiveTabId) {

    if (lastDocRef) {
      const timestamp = Date.now();
      lastDocRef.update({"duration": timestamp - lastActivatedTime})
        .then(() => {
          console.log("Document update with ID: ")
        })
        .catch((error) => {console.log("Error update document: ", error)})
    }

    lastActiveTabId = null;
    lastActiveUrl = null;
    lastDocRef = null;
  }
};


function capture() {
  if (!lastActiveUrl){return}

  getLastTab((tab) => {
    if (tab.url !== lastActiveUrl) { return;}

    getScreenShotUrl((screenShotUrl) => {

      const base64String = screenShotUrl.split("base64,")[1];
      const fileKey = `${Date.now()}.jpg`

      const metadata = {
        contentType: 'image/jpeg',
      };

      var storageRef = firebase.storage().ref(fileKey);

      storageRef.putString(base64String, 'base64', metadata)
        .then((snapshot) => {console.log('Uploaded a base64 string!', snapshot)}
          , (e) => {console.log(e);});
    });
  });
}



function initApp(){
    firebase.initializeApp(config);
    db = firebase.firestore();

    firebase.auth().onAuthStateChanged(function(_user) {
        user = _user;
        console.log('User state change detected from the Background script of the Chrome Extension:', user);
    });
}


window.onload = function() {
    initApp();
};
