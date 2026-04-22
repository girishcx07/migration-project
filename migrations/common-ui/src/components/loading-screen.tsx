"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "@workspace/ui/components/magicui/globe";

interface GlobeLoadingProps {
  trigger?: () => void;
}

const GlobeLoading: React.FC<GlobeLoadingProps> = ({ trigger }) => {
  const [isContentVisible, setContentVisible] = useState(false);
  const [isGlobeVisible, setGlobeVisible] = useState(false);

  useEffect(() => {
    const contentTimeout = setTimeout(() => {
      setContentVisible(true);
    }, 600); // Delay for content animation

    const globeTimeout = setTimeout(() => {
      setGlobeVisible(true);
    }, 1100); // Delay for globe animation

    const timeout = setTimeout(() => {
      if (trigger) trigger?.();
    }, 2400);

    return () => {
      clearTimeout(timeout);
      clearTimeout(contentTimeout);
      clearTimeout(globeTimeout);
    };
  }, []);

  return (
    <div>
      {isContentVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="div"
        >
          <h2 className="text-center text-xl mt-5 md:text-4xl font-bold text-black dark:text-white">
            We provide visa services worldwide
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            Explore the world and apply for visas for tourism and festive
            events. Find visa requirements and services for different countries.
          </p>
        </motion.div>
      )}

      {isGlobeVisible && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
          <Globe className="top-36" />
        </motion.div>
      )}
    </div>
  );
};

export default GlobeLoading;
