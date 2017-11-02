import {
  console
} from "./extensionEvents";

let db;
let user;

//const collectionKey = (uid) => `/log/${uid}/raw`;
const collectionKey = (uid) => `/log/${uid}/raw_2`;


export const put = (values) => {

  console.log("values",values);

  const uid =  user.uid;
  const collection = collectionKey(uid);
  const data = Object.assign(values, {uid});

  return db.collection(collection).add(data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {console.log("Error adding document: ", error)})
};


export const uploadScreenShotUrl = (screenShotUrl) =>  {
 const base64String = screenShotUrl.split("base64,")[1];

  const uid =  user.uid;
  const fileKey = `/capture/${uid}/${Date.now()}.png`;

  const metadata = {
    contentType: 'image/png'
  };

  const storageRef = firebase.storage().ref(fileKey);

  return storageRef.putString(base64String, 'base64', metadata)
    .then(() => fileKey);
};

export const isLoggedIn = () => {
  return !!user;
};

export const loadLatest = () => {
  const uid =  user.uid;
  const collection = collectionKey(uid);

  return db.collection(collection)
    .orderBy("timestamp", "desc").limit(10).get()
    .then((querySnapshot) => querySnapshot.docs.map((d) => d.data()));
};

export const downloadUrl = (fileKey) => {
  return firebase.storage().ref(fileKey).getDownloadURL()
};



export const register = (email, password) => {
  return firebase.auth().createUserWithEmailAndPassword(email, password);
};

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password);
};


export const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();

  firebase.auth().onAuthStateChanged((_user) => {
    user = _user;
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
};

