import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// const userCollection = collection(db, 'users')

const save = (path, data) => addDoc(collection(db, path), data)
const loadAll = async (path) => {
  const querySnapshot = await getDocs(collection(db, path));
  let list = [];
  querySnapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() });
  })
  return list;
};
const deleteOne = (path, id) => deleteDoc(doc(collection(db, path), id));
const updateOne = (path, id, fields) => updateDoc(doc(collection(db, path), id), fields)

export { save, loadAll, deleteOne, updateOne };
