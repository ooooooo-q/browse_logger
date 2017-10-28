import {
  console
} from "./extensionEvents";

let db;
let user;

const collectionKey = (uid) => `/log/${uid}/raw`;

export const setDuration = (ref, lastActivatedTime) => {
  const timestamp = Date.now();

  ref.update({"duration": timestamp - lastActivatedTime})
    .then(() => {console.log("Document update with ID: ")})
    .catch((error) => {console.log("Error update document: ", error)})
};


export const add = (url, title, timestamp, cb) => {
  const uid =  user.uid;
  const collection = collectionKey(uid);

  db.collection(collection).add({uid, url, title, timestamp})
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      cb(docRef);
    })
    .catch((error) => {console.log("Error adding document: ", error)})
};

export const uploadScreenShotUrl = (screenShotUrl) =>  {
 const base64String = screenShotUrl.split("base64,")[1];
  const fileKey = `${Date.now()}.jpg`

  const metadata = {
    contentType: 'image/jpeg',
  };

  var storageRef = firebase.storage().ref(fileKey);

  storageRef.putString(base64String, 'base64', metadata)
    .then((snapshot) => {console.log('Uploaded a base64 string!', snapshot)}
      , (e) => {console.log(e);});
};

export const isLoggedIn = () => {
  return !!user;
};

export const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();

  firebase.auth().onAuthStateChanged((_user) => {
    user = _user;
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
};

