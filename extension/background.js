let db;
let user;

chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        log("onActivated", tabs[0]);
    });
});

chrome.tabs.onUpdated.addListener(() => {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        log("onActivated", tabs[0]);
    });
});


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
