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

const loadCachedUserInfo = () => {
  try {
    const cachedRole = localStorage.getItem('userRole');
    const cachedEmail = localStorage.getItem('userEmail');
    const cachedName = localStorage.getItem('userName');

    if (cachedRole && cachedEmail) {
      Object.assign(userInfo, {
        role: cachedRole,
        email: cachedEmail,
        name: cachedName || ''
      });
      console.log('✅ Loaded cached user info:', userInfo);
    }
  } catch (error) {
    console.warn('Failed to load cached user info:', error);
  }
};

const cacheUserInfo = (user) => {
  try {
    if (user && user.email) {
      localStorage.setItem('userRole', user.role || 'guest');
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userName', user.name || '');
    } else {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  } catch (error) {
    console.warn('Failed to cache user info:', error);
  }
};

// immediately load cached user info
loadCachedUserInfo();

const getUserInfo = async (user) => {
  if (!user) {
    Object.assign(userInfo, { role: 'guest' })
    cacheUserInfo(null);
    return;
  }
  const q = query(collection(db, "users"), where("email", "==", user.email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    Object.assign(userInfo, doc.data())
    cacheUserInfo(userInfo);
  });
  return
}

onAuthStateChanged(auth, (user) => {
  getUserInfo(user).then(() => {
    authInitialized.value = true
    console.log('✅ Firebase auth initialized:', userInfo)
    console.log(router.currentRoute)
  })
});

const logout = () => signOut(auth).then(() => {
  Object.assign(userInfo, { role: 'guest' })
  cacheUserInfo(null);
})

const cacheLoaded = ref(true);

export { login, logout, register, userInfo, getUserInfo, authInitialized, cacheLoaded }
