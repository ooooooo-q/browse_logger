

export const getLastTab = () => {
  return new Promise((resolve, reject) => {
    const queryOption = {'active': true, 'lastFocusedWindow': true};

    chrome.tabs.query(queryOption, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0])
      } else {
        reject(new Error("tabs not found"))
      }
    });
  })
};

export const getScreenShotUrl = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(resolve)
  })
};


export const initAddListener = (movedNewPage, onRemove, popupRequestHandling) => {
  chrome.tabs.onActivated.addListener(() => getLastTab().then((tab)=> movedNewPage(tab)));
  chrome.tabs.onUpdated.addListener(() => getLastTab().then((tab) => movedNewPage(tab)));
  chrome.tabs.onRemoved.addListener((id) => onRemove(id));

  chrome.extension.onRequest.addListener(popupRequestHandling);
};


export const console = chrome.extension.getBackgroundPage().console;
