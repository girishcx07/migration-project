import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingDuration?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  onLoadingComplete?: () => void;
  containerClassName?: string;
  overlayClassName?: string;
}

const LoadingOverlay = ({
  children,
  isLoading = false,
  loadingDuration = 3000,
  overlayColor = "bg-blue-500",
  overlayOpacity = 0.2,
  onLoadingComplete,
  className,
  containerClassName,
  overlayClassName,
  ...props
}: LoadingOverlayProps) => {
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingPhase(1);
      setIsComplete(false);
      return;
    }

    const phase1Duration = loadingDuration * 0.3;
    const phase2Duration = loadingDuration * 0.6;

    // Phase 1: 0-30%
    const phase1 = setTimeout(() => {
      setLoadingPhase(2);
    }, phase1Duration);

    // Phase 2: 30-70%
    const phase2 = setTimeout(() => {
      setLoadingPhase(3);
    }, phase2Duration);

    // Complete: 70-100%
    const complete = setTimeout(() => {
      setIsComplete(true);
      onLoadingComplete?.();
    }, loadingDuration);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(complete);
    };
  }, [isLoading, loadingDuration, onLoadingComplete]);

  const getLoadingWidth = () => {
    switch (loadingPhase) {
      case 1:
        return "30%";
      case 2:
        return "70%";
      case 3:
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        containerClassName,
        className
      )}
      {...props}
    >
      {children}

      <AnimatePresence>
        {isLoading && !isComplete && (
          <motion.div
            className={cn("absolute inset-0", overlayColor, overlayClassName)}
            initial={{
              height: "100%",
              width: "0%",
              opacity: overlayOpacity,
            }}
            animate={{
              width: getLoadingWidth(),
              opacity: overlayOpacity,
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5 },
            }}
            transition={{
              width: { duration: loadingDuration / 3000, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            className={cn("absolute inset-0", overlayColor, overlayClassName)}
            initial={{ opacity: overlayOpacity }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => setIsComplete(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingOverlay;
