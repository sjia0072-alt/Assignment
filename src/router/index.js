import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "../components/LoginForm.vue";
import Register from "@/components/Register.vue";
import AuthPage from "@/views/AuthPage.vue";
import HomePage from "@/views/HomePage.vue";
import AllUsersPage from "@/views/AllUsersPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/users",
      name: "users",
      component: AllUsersPage,
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
