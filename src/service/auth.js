import { auth, db } from "./firebase"
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { save } from "./store"
import { reactive, ref } from "vue"
import { collection, getDocs, query, where } from "firebase/firestore"
import router from "@/router"

const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

const register = (name, email, password, role) =>
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => save("users", {
      name: name,
      email: email,
      role: 'user',
    }))

const userInfo = reactive({ role: 'guest' })
const authInitialized = ref(false)

const getUserInfo = async (user) => {
  if (!user) {
    Object.assign(userInfo, { role: 'guest' })
    return;
  }
  const q = query(collection(db, "users"), where("email", "==", user.email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    Object.assign(userInfo, doc.data())
  });
  return
}

onAuthStateChanged(auth, (user) => {
  getUserInfo(user).then(() => {
    authInitialized.value = true
    console.log(userInfo)
    console.log(router.currentRoute)
  })
});

const logout = () => signOut(auth).then(() =>
  Object.assign(userInfo, { role: 'guest' })
)

export { login, logout, register, userInfo, getUserInfo, authInitialized }
