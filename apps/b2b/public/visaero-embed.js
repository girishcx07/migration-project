(function initVisaeroEmbed(global, document) {
  "use strict";

  var VERSION = "0.1.0";
  var EVENT_PREFIX = "visaero.portal.";
  var activeInstance = null;

  function isElement(value) {
    return value && value.nodeType === 1;
  }

  function getScriptOrigin() {
    var script = document.currentScript;

    if (!script || !script.src) return global.location.origin;

    return new URL(script.src, global.location.href).origin;
  }

  function resolveContainer(container) {
    if (!container) return document.body;
    if (isElement(container)) return container;

    if (typeof container === "string") {
      var element = document.querySelector(container);

      if (element) return element;
    }

    throw new Error("VisaeroPortal: mount container was not found.");
  }

  function normalizeOrigin(value) {
    try {
      return new URL(value, global.location.href).origin;
    } catch (_error) {
      return "";
    }
  }

  function appendSearchParams(url, config) {
    var query = Object.assign({}, config.params || {}, config.query || {});
    var mappedParams = {
      evmRequestId: "evm_request_id",
      host: "host",
      sessionId: "session_id",
      userId: "user_id",
    };

    Object.keys(mappedParams).forEach(function addMappedParam(key) {
      if (config[key] !== undefined && config[key] !== null) {
        query[mappedParams[key]] = config[key];
      }
    });

    if (query.host === undefined || query.host === null || query.host === "") {
      query.host = global.location.host;
    }

    query.visaero_embed = "1";

    if (global.location.origin && global.location.origin !== "null") {
      query.parent_origin = global.location.origin;
    }

    Object.keys(query).forEach(function addQueryParam(key) {
      var value = query[key];

      if (value === undefined || value === null || value === "") return;

      url.searchParams.set(key, String(value));
    });
  }

  function createUrl(config) {
    var portalUrl = config.portalUrl || config.baseUrl || getScriptOrigin();
    var moduleName = config.module || "qr-visa";
    var flow = config.flow || "initialize";
    var path = config.path || "/" + moduleName + "/" + flow;
    var url = new URL(config.src || path, portalUrl);

    appendSearchParams(url, config);

    return url.toString();
  }

  function dispatch(callback, payload) {
    if (typeof callback === "function") {
      callback(payload);
    }
  }

  function VisaeroPortalInstance(config) {
    this.config = Object.assign({}, config || {});
    this.container = resolveContainer(
      this.config.container || this.config.mount,
    );
    this.iframe = null;
    this.unsubscribe = null;
    this.initialized = false;
  }

  VisaeroPortalInstance.prototype.createIframe = function createIframe() {
    var iframe = document.createElement("iframe");
    var style = Object.assign(
      {
        border: "0",
        display: "block",
        height: this.config.height || "720px",
        width: this.config.width || "100%",
      },
      this.config.style || {},
    );

    iframe.title = this.config.iframeTitle || "Visaero portal";
    iframe.src = createUrl(this.config);
    iframe.allow =
      this.config.allow || "clipboard-read; clipboard-write; payment";
    iframe.referrerPolicy =
      this.config.referrerPolicy || "strict-origin-when-cross-origin";
    iframe.setAttribute("data-visaero-portal", "true");

    if (this.config.className) {
      iframe.className = this.config.className;
    }

    Object.keys(style).forEach(function assignStyle(key) {
      iframe.style[key] = style[key];
    });

    return iframe;
  };

  VisaeroPortalInstance.prototype.listen = function listen() {
    var self = this;
    var portalOrigin = normalizeOrigin(
      this.config.portalUrl || this.config.baseUrl || getScriptOrigin(),
    );

    function onMessage(event) {
      var data = event.data || {};
      var eventName = data.event || "";
      var callbackPayload;

      if (!self.iframe || event.source !== self.iframe.contentWindow) return;
      if (portalOrigin && event.origin !== portalOrigin) return;
      if (data.source !== "visaero-portal") return;

      if (
        !eventName &&
        typeof data.type === "string" &&
        data.type.indexOf(EVENT_PREFIX) === 0
      ) {
        eventName = data.type.slice(EVENT_PREFIX.length);
      }

      callbackPayload = Object.assign({}, data.payload || {}, {
        iframe: self.iframe,
        rawEvent: event,
      });

      if (eventName === "initialize" || eventName === "ready") {
        dispatch(self.config.onInitialize, callbackPayload);
      } else if (eventName === "success") {
        dispatch(self.config.onSuccess, callbackPayload);
      } else if (eventName === "failed" || eventName === "failure") {
        dispatch(
          self.config.onFailed || self.config.onFailure,
          callbackPayload,
        );
      } else if (eventName === "routeChange") {
        dispatch(self.config.onRouteChange, callbackPayload);
      } else if (eventName === "close") {
        dispatch(self.config.onClose, callbackPayload);
      }
    }

    global.addEventListener("message", onMessage);

    this.unsubscribe = function unsubscribe() {
      global.removeEventListener("message", onMessage);
    };
  };

  VisaeroPortalInstance.prototype.open = function open(nextConfig) {
    this.config = Object.assign({}, this.config, nextConfig || {});

    if (!this.iframe) {
      this.mount();
      return this;
    }

    this.iframe.hidden = false;
    this.iframe.src = createUrl(this.config);

    return this;
  };

  VisaeroPortalInstance.prototype.close = function close() {
    if (this.iframe) {
      this.iframe.hidden = true;
    }

    return this;
  };

  VisaeroPortalInstance.prototype.destroy = function destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }

    this.iframe = null;

    if (activeInstance === this) {
      activeInstance = null;
    }
  };

  VisaeroPortalInstance.prototype.getUrl = function getUrl(nextConfig) {
    return createUrl(Object.assign({}, this.config, nextConfig || {}));
  };

  VisaeroPortalInstance.prototype.mount = function mount() {
    var self = this;

    this.iframe = this.createIframe();
    this.listen();

    this.iframe.addEventListener("load", function onLoad() {
      if (self.initialized) return;

      self.initialized = true;
      dispatch(self.config.onInitialize, {
        iframe: self.iframe,
        module: self.config.module || "qr-visa",
        status: "loaded",
        url: self.iframe.src,
      });
    });

    if (this.config.replace !== false) {
      this.container.replaceChildren(this.iframe);
    } else {
      this.container.appendChild(this.iframe);
    }

    return this;
  };

  function initialize(config) {
    var instance = new VisaeroPortalInstance(config || {});

    if (activeInstance && config && config.replaceActive !== false) {
      activeInstance.destroy();
    }

    activeInstance = instance.mount();

    return activeInstance;
  }

  global.VisaeroPortal = {
    createUrl: function publicCreateUrl(config) {
      return createUrl(config || {});
    },
    destroy: function destroyActiveInstance() {
      if (activeInstance) {
        activeInstance.destroy();
      }
    },
    initialize: initialize,
    version: VERSION,
  };
})(window, document);
