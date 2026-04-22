"use client";

import * as React from "react";

export type AppRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
};

export type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

type NavigationAdapter = {
  router?: Partial<AppRouter>;
  pathname?: string;
  searchParams?: URLSearchParams;
  LinkComponent?: React.ComponentType<AppLinkProps>;
};

const NavigationContext = React.createContext<NavigationAdapter | null>(null);

export const NavigationProvider = ({
  children,
  adapter,
}: {
  children: React.ReactNode;
  adapter: NavigationAdapter;
}) => {
  return (
    <NavigationContext.Provider value={adapter}>
      {children}
    </NavigationContext.Provider>
  );
};

const getWindowLocation = () =>
  typeof window !== "undefined" ? window.location : null;

const createFallbackRouter = (): AppRouter => ({
  push: (href) => {
    const location = getWindowLocation();
    if (location) location.assign(href);
  },
  replace: (href) => {
    const location = getWindowLocation();
    if (location) location.replace(href);
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  forward: () => {
    if (typeof window !== "undefined") window.history.forward();
  },
  refresh: () => {
    const location = getWindowLocation();
    if (location) location.reload();
  },
});

export const useAppRouter = (): AppRouter => {
  const ctx = React.useContext(NavigationContext);
  return {
    ...createFallbackRouter(),
    ...(ctx?.router ?? {}),
  };
};

export const useAppPathname = (): string => {
  const ctx = React.useContext(NavigationContext);
  const [pathname, setPathname] = React.useState(
    () =>
      ctx?.pathname ??
      (typeof window !== "undefined" ? window.location.pathname : ""),
  );

  React.useEffect(() => {
    if (ctx?.pathname !== undefined) {
      setPathname(ctx.pathname);
      return;
    }
    if (typeof window === "undefined") return;

    const handler = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [ctx?.pathname]);

  return pathname;
};

export const useAppSearchParams = (): URLSearchParams => {
  const ctx = React.useContext(NavigationContext);
  const [params, setParams] = React.useState(
    () =>
      ctx?.searchParams ??
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      ),
  );

  React.useEffect(() => {
    if (ctx?.searchParams) {
      setParams(ctx.searchParams);
      return;
    }
    if (typeof window === "undefined") return;

    const handler = () =>
      setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [ctx?.searchParams]);

  return params;
};

export const AppLink = ({ href, ...rest }: AppLinkProps) => {
  const ctx = React.useContext(NavigationContext);
  const LinkComponent = ctx?.LinkComponent;
  if (LinkComponent) {
    return <LinkComponent href={href} {...rest} />;
  }
  return <a href={href} {...rest} />;
};
