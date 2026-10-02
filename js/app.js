/* App bootstrap: navigation, cross-tab sync, service worker registration. */
(function (global) {
  'use strict';

  var current = 'home';

  function go(page) {
    current = page;
    document.querySelectorAll('.page').forEach(function (section) {
      section.hidden = section.dataset.page !== page;
    });
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.goto === page);
    });
    if (page === 'admin') Admin.syncGate();
    window.scrollTo({ top: 0 });
  }

  function bindNav() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-goto]');
      if (!btn) return;
      go(btn.dataset.goto);
    });

    document.getElementById('adminBtn').addEventListener('click', function () {
      go(current === 'admin' ? 'home' : 'admin');
    });

    document.getElementById('resultSearch').addEventListener('input', UI.renderResults);
    document.getElementById('downloadScoreboardBtn').addEventListener('click', UI.downloadScoreboard);
    document.getElementById('resultCategories').addEventListener('click', function (e) {
      var tab = e.target.closest('[data-category]');
      if (tab) UI.selectCategory(tab.dataset.category);
    });
    document.getElementById('teamList').addEventListener('click', function (e) {
      var box = e.target.closest('[data-team-id]');
      if (box) UI.selectTeam(box.dataset.teamId);
    });
    document.getElementById('teamDetail').addEventListener('click', function (e) {
      if (e.target.closest('[data-team-back]')) UI.clearTeam();
    });
    document.getElementById('teamBackBtn').addEventListener('click', UI.clearTeam);
    document.getElementById('refreshBtn').addEventListener('click', function () {
      Store.load();
      UI.renderAll();
      if (Store.isAuthed()) Admin.renderAdmin();
    });
  }

  function bindSync() {
    // Keep other open tabs/windows on the same device up to date.
    window.addEventListener('storage', function (e) {
      if (e.key !== 'bible-kalolsavam-data-v1') return;
      Store.load();
      UI.renderAll();
      if (Store.isAuthed()) Admin.renderAdmin();
    });
    window.addEventListener('kalolsavam-remote-update', function () {
      UI.renderAll();
      if (Store.isAuthed()) Admin.renderAdmin();
    });
    window.addEventListener('kalolsavam-auth-update', function () {
      Admin.syncGate();
      UI.renderAll();
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    navigator.serviceWorker.register('sw.js').catch(function () { /* offline support optional */ });
  }

  function start() {
    Store.load();
    Store.ensurePasswordHash().then(function () {
      UI.renderAll();
      Admin.init();
      bindNav();
      bindSync();
      go('home');
      registerServiceWorker();
      Store.whenRemoteReady().then(function () {
        UI.renderAll();
        if (Store.isAuthed()) Admin.renderAdmin();
      });
    });
  }

  global.App = { go: go };
  document.addEventListener('DOMContentLoaded', start);
})(window);
