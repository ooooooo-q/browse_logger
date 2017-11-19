import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
} from 'admin-on-rest';
import {getDb, getUser, authCheck} from "./auth_client";


const collectionKey = (uid) => `/log/${uid}/raw_2`;

const getList = (resource, params) => {
  console.log(resource, params);

  const db = getDb();
  const user = getUser();
  const collection = collectionKey(user.uid);

  const page = params.pagination.page;
  console.log(page, 50 * page);

  const dataPromise =  db.collection(collection)
    .orderBy("timestamp", "desc")
    .limit(50)
    .get()
    .then((querySnapshot) => querySnapshot.docs.map((d) => d.data()));

  const lengthPromise = db.collection(collection).get().then((snapshot) => snapshot.docs.length);

  return Promise.all([dataPromise, lengthPromise])
    .then((res) => {
      const data = res[0].map((d, idx) => {
        return {...d, id: idx, duration_sec: Math.ceil(d.duration / 1000)}
      }); // idがないと一つしか出ない

      return {data, total: res[1]};
    });
};


export default () => {
  return (type, resource, params) => {
    // firebaseの認証に時間がかかるのでpromiseで渡さないとだめ
    return authCheck().then(() => {
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
    });
  }
}