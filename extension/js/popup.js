function authError(error){
  let message;
  if (error.code == 'auth/weak-password') {
    message = 'The password is too weak.';
  } else if (error.message) {
    message = error.message;
  } else {
    message = "success"
  }

  const authStatus =  document.getElementById('auth_status');
  authStatus.innerText = message;
  console.log(error);
}

function beforeLoad() {
  const ul = document.querySelector('ul');
  ul.innerText = "...";
}

function loaded(dataArray){
  const ul = document.querySelector('ul');

  ul.innerText = "";

  dataArray.forEach((data) =>{
    console.log(data);

    const duration = data.duration ? data.duration / 1000 : "now";

    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href = data.url;
    a.target = "_blank";
    a.innerText = `${data.title} : ${duration}s `;

    li.appendChild(a);
    ul.appendChild(li);

    const texts = data.texts || [];

    texts.forEach((text) => {
      const text_li = document.createElement('li');
      text_li.innerText = text;
      li.appendChild(text_li);
    });

    if (data.fileKey) {
      const request = {
        message: 'downloadUrl',
        fileKey: data.fileKey
      };

      chrome.extension.sendRequest(request, (url) =>{
        const img = document.createElement('img');
        img.src = url;
        li.appendChild(img);
      });
    }
  });
}


function initApp() {

  const loginButton = document.getElementById('login');
  const registerButton = document.getElementById('register');
  const loadButton = document.getElementById('load');

  const email = document.querySelector('input[type="email"]');
  const password = document.querySelector('input[type="password"]');

  loginButton.addEventListener('click', () => {
    const request = {
      message: 'login',
      email: email.value,
      password: password.value
    };
    chrome.extension.sendRequest(request, (error) =>{ authError(error) });
  });

  registerButton.addEventListener('click', () => {
    const request = {
      message: 'register',
      email: email.value,
      password: password.value
    };
    chrome.extension.sendRequest(request, (error) =>{ authError(error) });
  });


  beforeLoad();
  chrome.extension.sendRequest({'message':'loadForPopup'}, (response) =>{
    loaded(response);
  });

  loadButton.addEventListener('click', () => {
    beforeLoad();
    chrome.extension.sendRequest({'message':'forceLoad'}, (response) => {
      loaded(response);
    });
  });
}

window.onload = function() {
  initApp();
};