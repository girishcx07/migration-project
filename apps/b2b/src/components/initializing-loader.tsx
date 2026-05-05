"use client";

import { motion, useReducedMotion } from "motion/react";

interface InitializingLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function InitializingLoader({
  message = "Initializing application...",
}: InitializingLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-primary/5 absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="bg-primary/5 absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: "easeOut" }
        }
        className="relative flex flex-col items-center gap-10"
      >
        <div className="relative flex h-28 w-28 items-center justify-center">
          <motion.div
            className="border-primary/20 absolute inset-0 rounded-full border-2"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 8, repeat: Infinity, ease: "linear" }
            }
          >
            <div className="bg-primary absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full" />
          </motion.div>

          <motion.div
            className="border-primary/30 absolute inset-4 rounded-full border-2"
            animate={shouldReduceMotion ? undefined : { rotate: -360 }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 5, repeat: Infinity, ease: "linear" }
            }
          >
            <div className="bg-primary/60 absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" />
          </motion.div>

          <motion.div
            className="bg-primary/15 h-10 w-10 rounded-full"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <motion.div
              className="bg-primary/30 h-full w-full rounded-full"
              animate={shouldReduceMotion ? undefined : { scale: [1, 0.85, 1] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }
              }
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.p
            className="text-foreground text-sm font-medium tracking-wide"
            animate={
              shouldReduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            {message}
          </motion.p>

          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="bg-primary/50 h-1.5 w-1.5 rounded-full"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }
                }
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
