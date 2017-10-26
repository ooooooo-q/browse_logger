const console = chrome.extension.getBackgroundPage().console;

// https://developer.chrome.com/extensions/tabs#events
const events = [
  "onCreated",
  "onActivated",
  "onUpdated",
  "onMoved",
  "onHighlighted",
  "onDetached",
  "onAttached",
  "onRemoved",
  "onReplaced",
  "onZoomChange"
];

events.forEach((eventName) => {
  chrome.tabs[eventName].addListener(() => {
    console.log(eventName, new Date);

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
      const tab = tabs && tabs[0];
      console.log(eventName, "query", tab, new Date);
    });
  });
});



