import type { unstable_RSCRouteConfig as RSCRouteConfig } from "react-router";

export function routes() {
  return [
    {
      id: "root",
      path: "",
      lazy: () => import("./root/route"),
      children: [
        {
          id: "home",
          index: true,
          lazy: () => import("./home/route"),
        },
        {
          id: "module",
          path: ":module",
          lazy: () => import("./[module]/route"),
          children: [
            {
              id: "module-index",
              index: true,
              lazy: () => import("./[module]/index/route"),
            },
            {
              id: "module-initialize",
              path: "initialize",
              lazy: () => import("./[module]/initialize/route"),
            },
            {
              id: "module-apply-visa",
              path: "apply-visa",
              lazy: () => import("./[module]/apply-visa/route"),
            },
            {
              id: "module-review",
              path: "review",
              lazy: () => import("./[module]/review/route"),
            },
            {
              id: "module-payment-summary",
              path: "payment-summary",
              lazy: () => import("./[module]/payment-summary/route"),
            },
            {
              id: "module-payment-success",
              path: "payment-success",
              lazy: () => import("./[module]/payment-success/route"),
            },
            {
              id: "module-application-details",
              path: "application-details",
              lazy: () => import("./[module]/application-details/route"),
            },
            {
              id: "module-track-applications",
              path: "track-applications",
              lazy: () => import("./[module]/track-applications/route"),
            },
            {
              id: "module-unauthorized",
              path: "unauthorized",
              lazy: () => import("./[module]/unauthorized/route"),
            },
          ],
        },
      ],
    },
  ] satisfies RSCRouteConfig;
}
