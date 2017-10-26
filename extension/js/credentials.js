
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

  chrome.extension.getBackgroundPage().console.log(error);
}


function load(user){
  const collection = `/log/${user.uid}/raw`;

  const db = firebase.firestore();
  db.collection(collection).orderBy("timestamp", "desc").limit(10)
    .get().then(function(querySnapshot) {
      const ul = document.querySelector('ul');
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " => ", doc.data());
        const data = doc.data();
        const duration = data.duration ? data.duration / 1000 : "now";

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = data.url;
        a.innerText = `${data.title} : ${duration}s `;
        li.appendChild(a);
        ul.appendChild(li);
      });
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

  firebase.auth().onAuthStateChanged(function(user) {
    load(user)

    loadButton.addEventListener('click', () => {load(email.value, password.value)});

    authStatus.innerText = "connected!";
  });

}

window.onload = function() {
  initApp();
};