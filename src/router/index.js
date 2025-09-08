import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "../components/LoginForm.vue";
import Register from "@/components/Register.vue";
import AuthPage from "@/views/AuthPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/auth"
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthPage,
      children: [
        {
          path: "",
          name: "login",
          component: LoginForm,
        },
        {
          path: "",
          name: "register",
          component: Register,
        },
      ],
    },
  ],
});

export default router;
