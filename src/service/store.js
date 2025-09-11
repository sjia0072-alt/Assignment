import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

const userCollection = collection(db, 'users')

const save = (path, data) => addDoc(collection(db, path), data)

export { save, userCollection };
