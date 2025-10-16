import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "../components/LoginForm.vue";
import Register from "@/components/Register.vue";
import AuthPage from "@/views/AuthPage.vue";
import HomePage from "@/views/HomePage.vue";
import AllUsersPage from "@/views/AllUsersPage.vue";
import HealthRecommendationsPage from "@/views/HealthRecommendationsPage.vue";
import ApiUsersPage from "@/views/ApiUsersPage.vue";
import ApiHealthRecommendationsPage from "@/views/ApiHealthRecommendationsPage.vue";
import Recommend from "@/views/Recommend.vue";
import UserInfo from "@/views/UserInfo.vue";
import EmailBroadcastPage from "@/views/EmailBroadcastPage.vue";
import InteractiveMapPage from "@/views/InteractiveMapPage.vue";
import NotFound from "@/views/NotFound.vue";
import { userInfo, authInitialized, cacheLoaded } from "@/service/auth";

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
      meta: { requiresRole: ["admin", "user"] },
    },
    {
      path: "/recommendations",
      name: "recommendations",
      component: HealthRecommendationsPage,
      meta: { requiresRole: ["admin", "user"] },
    },
    {
      path: "/user-info",
      name: "user-info",
      component: UserInfo,
      meta: { requiresRole: ["admin", "user"] },
    },
    {
      path: "/users",
      name: "users",
      component: AllUsersPage,
      meta: { requiresRole: ["admin"] },
    },
    {
      path: "/api/users",
      name: "api-users",
      component: ApiUsersPage,
      meta: { requiresRole: ["admin"], isApiPage: true },
    },
    {
      path: "/api/recommendations",
      name: "api-recommendations",
      component: ApiHealthRecommendationsPage,
      meta: { requiresRole: ["admin", "user"], isApiPage: true },
    },
    {
      path: "/email-broadcast",
      name: "email-broadcast",
      component: EmailBroadcastPage,
      meta: { requiresRole: ["admin"] },
    },
    {
      path: "/interactive-map",
      name: "interactive-map",
      component: InteractiveMapPage,
      meta: { requiresRole: ["admin", "user"] },
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthPage,
      meta: { requiresRole: ["guest"] },
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
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userRole = userInfo.role;

  // For API pages, skip role checks
  if (to.meta.isApiPage) {
    if (!to.meta.requiresRole) {
      next();
      return;
    }

    if (!to.meta.requiresRole.includes(userRole)) {
      if (userRole === "guest") {
        console.log("API: Redirecting to auth");
        next({ name: "login", query: { redirect: to.fullPath } });
      } else {
        console.log("API: Insufficient permissions");
        next({ name: "home" });
      }
      return;
    }

    next();
    return;
  }

  if (!authInitialized.value) {
    await new Promise((resolve) => {
      const unwatch = setInterval(() => {
        if (authInitialized.value) {
          clearInterval(unwatch);
          resolve();
        }
      }, 50);
    });
  }

  if (!to.meta.requiresRole) {
    next();
    return;
  }

  if (!to.meta.requiresRole.includes(userRole)) {
    if (userRole === "guest") {
      console.log(
        "Redirecting to auth - requires:",
        to.meta.requiresRole,
        "current:",
        userRole
      );
      next({ name: "login", query: { redirect: to.fullPath } });
    } else {
      console.log("Redirecting to home - insufficient permissions");
      next({ name: "home" });
    }
    return;
  }

  next();
});

export default router;
