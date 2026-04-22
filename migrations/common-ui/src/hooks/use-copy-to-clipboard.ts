// import { useState, useCallback } from "react";

// type UseCopyToClipboardReturnType = {
//   isCopied: boolean;
//   copyToClipboard: (value: string) => void;
// };

// const useCopyToClipboard = (): UseCopyToClipboardReturnType => {
//   const [isCopied, setIsCopied] = useState<boolean>(false);

//   // Function to copy document details to clipboard
//   const copyToClipboard = useCallback((value: string) => {
//     // Create a temporary textarea to copy the text to the clipboard
//     console.log("copy text", value);
//     const txtArea = document.createElement("textarea");
//     txtArea.value = value;
//     document.body.appendChild(txtArea);
//     txtArea.select();
//     document.execCommand("copy");
//     document.body.removeChild(txtArea);

//     setIsCopied(true);
//     setTimeout(() => {
//       setIsCopied(false);
//     }, 2000);
//   }, []);

//   return { isCopied, copyToClipboard };
// };

// export default useCopyToClipboard;

import { useState, useCallback } from "react";

type UseCopyToClipboardReturnType = {
  isCopied: boolean;
  copyToClipboard: (value: string) => void;
};

const useCopyToClipboard = (): UseCopyToClipboardReturnType => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      // if (navigator.clipboard && window.isSecureContext) {
      //   await navigator.clipboard.writeText(value);
      // } else {
      // Fallback for older browsers
      const txtArea = document.createElement("textarea");
      txtArea.value = value;
      document.body.appendChild(txtArea);
      txtArea.select();
      document.execCommand("copy");
      document.body.removeChild(txtArea);
      // }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }, []);

  return { isCopied, copyToClipboard };
};

export default useCopyToClipboard;
