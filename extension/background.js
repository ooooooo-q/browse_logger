let db;


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


    const url = tab.url;
    const title = tab.title;
    const timestamp = Date.now();

    const console = chrome.extension.getBackgroundPage().console;

    console.log(url);

    db.collection("log").add({url, title, status, timestamp})
    .then((docRef) => {console.log("Document written with ID: ", docRef.id)})
    .catch((error) => {console.log("Error adding document: ", error)})
}


function initApp(){
    firebase.initializeApp(config);
    db = firebase.firestore();

}


window.onload = function() {
    initApp();
};
