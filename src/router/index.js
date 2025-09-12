import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "../components/LoginForm.vue";
import Register from "@/components/Register.vue";
import AuthPage from "@/views/AuthPage.vue";
import HomePage from "@/views/HomePage.vue";
import AllUsersPage from "@/views/AllUsersPage.vue";
import Recommend from "@/views/Recommend.vue";
import UserInfo from "@/views/UserInfo.vue";
import { userInfo } from "@/service/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/recommend",
      name: "recommend",
      component: Recommend,
      meta: { requiresRole: ['admin', 'user'] },
    },
    {
      path: "/user-info",
      name: "user-info",
      component: UserInfo,
      meta: { requiresRole: ['admin', 'user'] },
    },
    {
      path: "/users",
      name: "users",
      component: AllUsersPage,
      meta: { requiresRole: ['admin'] },
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthPage,
      meta: { requiresRole: ['guest'] },
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

router.beforeEach((to, from, next) => {
  const userRole = userInfo.role;
  if (!to.meta.requiresRole) {
    next();
  }
  if (!to.meta.requiresRole.includes(userRole)) {
    if (userRole === 'guest') {
      console.log("log", to.meta.requiresRole, userRole)
      return next({ name: 'auth', query: { redirect: to.fullPath } });
    } else {
      console.log("home")
      return next({ name: 'home' });
    }
  }
  next();
});

export default router;
