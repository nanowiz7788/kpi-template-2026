/* Team gate. Stores a SHA-256 digest only — the shared secret is not in this file. */
(function () {
  'use strict';
  var KEY = 'j3-team-gate:kpi-template-2026';
  var PREFIX = 'j3-team-gate:kpi-template-2026:v1:';
  var DIGEST = 'ae9e5d4839bba068f47d9a4a7a4888118b18b8f2d5b9216ec26909a19f258cdd';

  function eq(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    var d = 0;
    for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return d === 0;
  }
  function readStore(store) {
    try { return store.getItem(KEY); } catch (e) { return null; }
  }
  function writeStore(store) {
    try { store.setItem(KEY, DIGEST); } catch (e) {}
  }
  function unlocked() {
    return eq(readStore(window.localStorage) || '', DIGEST) || eq(readStore(window.sessionStorage) || '', DIGEST);
  }
  function persist() {
    writeStore(window.localStorage);
    writeStore(window.sessionStorage);
  }
  function hex(buf) {
    return Array.from(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }
  function matches(value) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) return Promise.resolve(false);
    var bytes = new TextEncoder().encode(PREFIX + value);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      return eq(hex(buf), DIGEST);
    });
  }
  function openApp() {
    window.__J3_UNLOCKED = true;
    var gate = document.getElementById('gate');
    if (gate) gate.remove();
    document.dispatchEvent(new CustomEvent('j3-gate-open'));
  }

  if (!window.J3_GATE_SHELL) {
    if (unlocked()) {
      window.__J3_GATE_PASS = true;
      document.documentElement.classList.add('j3-open');
    } else {
      var target = new URL('../../index.html', location.href);
      if (location.href !== target.href) location.replace(target.href);
    }
    return;
  }

  if (unlocked()) {
    openApp();
    return;
  }

  var form = document.getElementById('gateForm');
  var input = document.getElementById('gatePw');
  var err = document.getElementById('gateErr');
  var button = document.getElementById('gateGo');
  if (!form || !input || !err) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = input.value;
    input.value = '';
    if (!value) {
      err.hidden = false;
      err.textContent = '비밀번호를 입력해 주세요.';
      input.focus();
      return;
    }
    if (button) button.disabled = true;
    matches(value).then(function (ok) {
      value = '';
      if (button) button.disabled = false;
      if (!ok) {
        err.hidden = false;
        err.textContent = '비밀번호가 올바르지 않습니다. 다시 입력해 주세요.';
        input.focus();
        return;
      }
      err.hidden = true;
      persist();
      openApp();
    }).catch(function () {
      value = '';
      if (button) button.disabled = false;
      err.hidden = false;
      err.textContent = '비밀번호를 확인하지 못했습니다. 다시 입력해 주세요.';
      input.focus();
    });
  });
})();
