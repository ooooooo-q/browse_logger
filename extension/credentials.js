
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
        const li = document.createElement('li');
        li.innerText = data.url
        ul.appendChild(li);
      });
  });
}

function initApp() {
  firebase.initializeApp(config);

  const loginButton = document.getElementById('login');
  const registerButton = document.getElementById('register');

  const email = document.querySelector('input[type="email"]');
  const password = document.querySelector('input[type="password"]');


  loginButton.addEventListener('click', () => {login(email.value, password.value)});
  registerButton.addEventListener('click', () => {register(email.value, password.value)});

  firebase.auth().onAuthStateChanged(function(user) {
    load(user)
  });

}

window.onload = function() {
  initApp();
};