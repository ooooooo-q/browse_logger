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

let cursor ;

const getList = (resource, params) => {
  console.log(resource, params);

  const db = getDb();
  const user = getUser();
  const collection = collectionKey(user.uid);
  const page = params.pagination.page;
  const durationSec = params.filter && params.filter.durationSec ? params.filter.durationSec : null;

  console.log(durationSec)

  let query = db.collection(collection);
  //query = durationSec ? query.where('duration', '>' , durationSec * 1000) : query;
  query = query.orderBy("timestamp", "desc");
  query = page > 1 && cursor ? query.startAt(cursor.data().timestamp) : query;
  query = query.limit(10);

  return query.get()
    .then((querySnapshot) => {
      const docs = querySnapshot.docs;
      cursor = docs[ docs.length - 1 ];
      //console.log(cursor)

      const data = querySnapshot.docs.map((d) => d.data()).map((d, idx) => {
        return {...d, id: idx, duration_sec: Math.ceil(d.duration / 1000)}
      }); // idがないと一つしか出ない

      return {data, total: 100}; // totalは使えないのでダミー
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