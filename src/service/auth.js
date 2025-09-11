import { auth } from "./firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { save } from "./store"

const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

const register = (name, email, password, role) =>
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => save("users", {
      name: name,
      email: email,
      role: role,
    }))

export { login, register }
