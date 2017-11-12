import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE
} from 'admin-on-rest';
import config from "./config";

const firebase = window.firebase;


let user, db;

const collectionKey = (uid) => `/log/${uid}/raw_2`;

export const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();


  firebase.auth().onAuthStateChanged((_user) => {
    user = _user;
    console.log('logged in', user);
  });
};

const loginCheck = () => {
  if (user) {
    return Promise.resolve();
  }

  return firebase.auth().signInWithEmailAndPassword("", "");
};


const getList = (resource, params) => {
  console.log(resource, params);
  //const uid =  user.uid;
  //const collection = collectionKey(uid);

  return loginCheck()
    .then(() => {
      return db.collection(collectionKey(user.uid))
        .orderBy("timestamp", "desc")
        .limit(50).get()
    })
    .then((querySnapshot) => querySnapshot.docs.map((d) => d.data()))
    .then((_data) => {
      const data = _data.map((d, idx) => {
        return {...d, id: idx, duration_sec: Math.ceil(d.duration / 1000)}
      }); // idがないと一つしか出ない

      return {data, total: 10}
    });
};


export default (apiUrl) => {

  initFireBaseAuth();

  return (type, resource, params) => {
    switch (type) {
      case GET_LIST:
      case GET_ONE:
      case GET_MANY:
      case GET_MANY_REFERENCE:
      case CREATE:
      case UPDATE:
      case DELETE:
      default:
        return getList(resource, params);
    }
  }
}