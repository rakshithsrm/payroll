/* Shared by employees / payroll / attendance / reports pages:
   blocks anyone who is not signed in, and adds the rain + top bar. */
(function () {
  var ok = false;
  try { ok = sessionStorage.getItem('rmvAuth') === '1'; } catch (e) {}
  if (!ok) { location.replace('index.html'); return; }

  document.body.classList.add('in-home');
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="rain" aria-hidden="true"></div>' +
    '<header class="bar glass">' +
      '<div class="brand">' +
        '<button class="flow out" id="backBtn" type="button" aria-label="Go back"><span class="label">\u2190 Back</span></button>' +
        '<div class="mark" aria-hidden="true">RMV</div><div class="name">RMV MANPOVER SERVICES</div></div>' +
      '<div class="right">' +
        '<a class="flow out" href="index.html" style="text-decoration:none"><span class="label">Home</span></a>' +
        '<div class="user"><i class="dot" aria-hidden="true"></i><span>Signed in</span></div>' +
        '<button class="flow out" id="signOut"><span class="label">Sign out</span></button>' +
      '</div>' +
    '</header>');

  // Back: the page you came from; if there isn't one (opened directly), go to the home page
  document.getElementById('backBtn').addEventListener('click', function () {
    if (history.length > 1) history.back(); else location.href = 'index.html';
  });

  // pressing the browser's Back after signing out must not show a cached page
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var ok = false; try { ok = sessionStorage.getItem('rmvAuth') === '1'; } catch (x) {}
    if (!ok) location.replace('index.html');
  });

  document.getElementById('signOut').addEventListener('click', function () {
    try { sessionStorage.removeItem('rmvAuth'); } catch (e) {}
    location.href = 'index.html';
  });
})();
