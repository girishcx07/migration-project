"use client";

// import { useEffect, useState } from "react";

// /**
//  * Hook to detect if viewport is mobile (default: <768px)
//  * Works seamlessly with Next.js + shadcn
//  */
// export function useIsMobile(breakpoint = 768) {
//   const [isMobile, setIsMobile] = useState<boolean | null>(null);

//   useEffect(() => {
//     const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

//     const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
//     // set initial
//     setIsMobile(mediaQuery.matches);
//     // listen for resize
//     mediaQuery.addEventListener("change", handleChange);

//     return () => mediaQuery.removeEventListener("change", handleChange);
//   }, [breakpoint]);

//   return isMobile;
// }




import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const getMatches = () =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false;

  const [isMobile, setIsMobile] = useState(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}