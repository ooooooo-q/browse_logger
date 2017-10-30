
function register(email, password){
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(authError);
}

function login(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password).catch(authError);
}

function authError(error){
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  if (errorCode == 'auth/weak-password') {
    alert('The password is too weak.');
  } else {
    alert(errorMessage);
  }

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
      var storage = firebase.storage();

      console.log(data.fileKey);
      storage.ref(data.fileKey).getDownloadURL().then((url) => {

        console.log(url)

        const img = document.createElement('img');
        img.src = url;
        li.appendChild(img);
      }, (err) => {console.log(err)});
    }
  });
}

function initApp() {
  firebase.initializeApp(config);

  const loginButton = document.getElementById('login');
  const registerButton = document.getElementById('register');
  const loadButton = document.getElementById('load');

  const email = document.querySelector('input[type="email"]');
  const password = document.querySelector('input[type="password"]');
  const authStatus =  document.getElementById('auth_status');

  loginButton.addEventListener('click', () => {login(email.value, password.value)});
  registerButton.addEventListener('click', () => {register(email.value, password.value)});

  beforeLoad();
  chrome.extension.sendRequest({'message':'loadForPopup'}, (response) =>{
    loaded(response);
  })

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