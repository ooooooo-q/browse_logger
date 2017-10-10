let db;
let user;
let currentUrl;
let stockUrl;
let storage;

chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
    if (tabs.length > 0) {
      log("onActivated", tabs[0]);
    }
  });
});

chrome.tabs.onUpdated.addListener(() => {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
    if (tabs.length > 0) {
      log("onUpdated", tabs[0]);
    }
  });
});


function capture() {
  if (!currentUrl){return}

  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
    if (tabs[0] && tabs[0].url === currentUrl) {
      chrome.tabs.captureVisibleTab(function(screenShotUrl) {

        const console = chrome.extension.getBackgroundPage().console;
        const base64String = screenShotUrl.split("base64,")[1];
        const fileKey = `${Date.now()}.jpg`

        const metadata = {
          contentType: 'image/jpeg',
        };

        var storageRef = firebase.storage().ref(fileKey);

        storageRef.putString(base64String, 'base64', metadata).then(function(snapshot) {
          console.log('Uploaded a base64 string!', snapshot);
        }, (e) => {
          console.log(e);
        });
      });
    }
  });
}


function log(status, tab) {

  if(!user) {return};

  const url = tab.url;
  const title = tab.title;
  const timestamp = Date.now();
  const uid = user.uid;

  const console = chrome.extension.getBackgroundPage().console;

  console.log(url);

  const collection = `/log/${uid}/raw`;

  db.collection(collection).add({uid, url, title, status, timestamp})
  .then((docRef) => {console.log("Document written with ID: ", docRef.id)})
  .catch((error) => {console.log("Error adding document: ", error)})

  currentUrl = url;
  //setTimeout(capture, 10 * 1000) ライフサイクルを考えてから
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
