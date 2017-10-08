chrome.tabs.onActivated.addListener(() => {

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        var url = tabs[0].url;
        chrome.extension.getBackgroundPage().console.log(url);
    });
});

