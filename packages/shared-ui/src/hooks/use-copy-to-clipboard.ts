"use client";

import { useCallback, useState } from "react";

type UseCopyToClipboardReturnType = {
  isCopied: boolean;
  copyToClipboard: (value: string) => void;
};

export default function useCopyToClipboard(): UseCopyToClipboardReturnType {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text", error);
    }
  }, []);

  return { isCopied, copyToClipboard };
}
