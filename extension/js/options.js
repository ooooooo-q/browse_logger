const setSetting =  () => {
  const input = document.querySelector("input");
  const setting = {
    excludeDomains: input.value
  };

  chrome.storage.local.set(setting, (items) => {
    console.log(items)
  })
};

const load = () => {

  const defaults = {
    excludeDomains: ""
  };

  chrome.storage.local.get(defaults, (items) => {
    const input = document.querySelector("input");
    input.value = items.excludeDomains;
  });
};



window.onload = function() {
  load();

  const button = document.querySelector("button");
  button.onclick = setSetting;
};