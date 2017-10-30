

export const getLastTab = (cb) => {
  const queryOption = {'active': true, 'lastFocusedWindow': true};

  chrome.tabs.query(queryOption, (tabs) => {
    if (tabs.length > 0) {
      cb(tabs[0])
    }
  });
};

export const getScreenShotUrl = (cb) => {chrome.tabs.captureVisibleTab(cb)};


export const initAddListener = (movedNewPage, onRemove, onSetText, loadForPopup) => {
  chrome.tabs.onActivated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onUpdated.addListener(() => getLastTab((tab) => movedNewPage(tab)));
  chrome.tabs.onRemoved.addListener((id) => onRemove(id));

  chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
    switch(request.message)
    {
      case 'setText':
        onSetText(request.text);
        break;
      case 'loadForPopup':
        loadForPopup((data) => sendResponse(data));
        break;
    }
  });
};


export const console = chrome.extension.getBackgroundPage().console;
