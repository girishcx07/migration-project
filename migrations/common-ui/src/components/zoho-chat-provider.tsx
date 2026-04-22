// "use client";

// import { useEffect } from "react";

// declare global {
//     interface Window {
//         $zoho?: any;
//     }
// }

// const ZOHO_SCRIPT_ID = "zsiqscript";

// const ZohoChatProvider = () => {
//     useEffect(() => {
//         if (typeof window === "undefined") return;        

//         // Prevent duplicate script injection
//         if (document.getElementById(ZOHO_SCRIPT_ID)) return;

//         const script = document.createElement("script");
//         script.id = ZOHO_SCRIPT_ID;
//         script.src =
//             "https://salesiq.zohopublic.in/widget?wc=siq0a71aa105dabb2a5642381a327a13b85797cb5cfdc2dfa613ac507aa72b2f4e4"; // your widget id
//         script.async = true;
//         script.defer = true;

//         document.body.appendChild(script);

//         window.$zoho = window.$zoho || {};
//         window.$zoho.salesiq = window.$zoho.salesiq || {
//             ready: function () {
//                 const color = localStorage.getItem("brand_color") || "black";

//                 window.$zoho.salesiq.chat.theme(color);

//                 // Hide default button
//                 window.$zoho.salesiq.floatbutton.visible("hide");

//                 // Sync close → React UI (optional event)
//                 window.$zoho.salesiq.floatwindow.close(function () {
//                     window.dispatchEvent(new Event("zoho-chat-closed"));
//                 });
//             },
//         };
//     }, []);

//     return null;
// };

// export default ZohoChatProvider;








"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        $zoho?: any;
    }
}

const ZOHO_SCRIPT_ID = "zsiqscript";

const ZohoChatProvider = () => {
    useEffect(() => {
        if (typeof window === "undefined") return;

        // ---------- Helpers ----------
        const getPrimaryColor = () => {
            const value = getComputedStyle(document.documentElement)
                .getPropertyValue("--color-primary")
                .trim();

            return value || "#000000";
        };



        const observeChatDOM = () => {
            const observer = new MutationObserver(() => {
                const chat = document.getElementById("siq_chatwindow");
                if (chat) {
                    observer.disconnect();
                    // store cleanup if needed
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            return observer;
        };

        const configureZoho = () => {
            if (!window.$zoho?.salesiq) return;

            const color = getPrimaryColor();

            window.$zoho.salesiq?.chat?.theme(color);
            window.$zoho.salesiq.floatbutton.visible("hide");

            window.$zoho.salesiq.floatwindow.close(() => {
                window.dispatchEvent(new Event("zoho-chat-closed"));
            });
        };

        // ---------- INIT ----------
        window.$zoho = window.$zoho || {};
        window.$zoho.salesiq = window.$zoho.salesiq || {};

        const prevReady = window.$zoho.salesiq.ready;

        window.$zoho.salesiq.ready = function () {
            prevReady && prevReady();

            configureZoho();
            observeChatDOM(); // IMPORTANT: wait for DOM injection
        };

        // ---------- SCRIPT LOAD ----------
        if (!document.getElementById(ZOHO_SCRIPT_ID)) {
            const script = document.createElement("script");
            script.id = ZOHO_SCRIPT_ID;
            script.src =
                "https://salesiq.zohopublic.in/widget?wc=siq0a71aa105dabb2a5642381a327a13b85797cb5cfdc2dfa613ac507aa72b2f4e4";
            script.async = true;
            script.defer = true;

            document.body.appendChild(script);
        } else {
            // If already loaded
            if (window.$zoho?.salesiq) {
                configureZoho();
                observeChatDOM();
            }
        }

        // ---------- CLEANUP ----------
        return () => {
            // NOTE: observer cleanup missing — you should track it if needed
        };
    }, []);

    return null;
};

export default ZohoChatProvider;