import {
  AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK
} from 'admin-on-rest';
import config from "./config";

const firebase = window.firebase;
let isFirebaseInit = null;

let user, db;

export const getUser = () => user;
export const getDb = () => db;

export const initFireBaseAuth = () => {
  firebase.initializeApp(config);
  db = firebase.firestore();

  isFirebaseInit = new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((_user) => {
      user = _user;
      console.log('logged in', user);
      resolve();
    });
  })
};

export const authCheck = () => {
  if (user) {
    console.log("auth check user");
    return Promise.resolve();
  }

  return isFirebaseInit.then(() => {
    console.log("auth check with fire base init");
    return user ? Promise.resolve() : Promise.reject({ redirectTo: '/login' });
  })
};


const authLogin = (_, params) => {
  const { username, password } = params;
  console.log(params)
  return firebase.auth().signInWithEmailAndPassword(username, password);
};

const authLogout = () => {
  console.log(arguments);
};

const authError = () => {
  console.log(arguments);

};


export default (type, params) => {

  if(!db){initFireBaseAuth();}

  switch (type) {
    case AUTH_CHECK:
      return authCheck(type, params);
    case AUTH_LOGIN:
      return authLogin(type, params);
    case AUTH_LOGOUT:
      return authLogout(type, params);
    case AUTH_ERROR:
      return authError(type, params);
    default:
      console.log(params);
  }
}