/* Utopia invitation request form.
   Turns every mailto:vip@utopia.vegas link into a pop-up form that is sent
   through FormSubmit (https://formsubmit.co) to vip@utopia.vegas.
   Without JavaScript the links still work as plain email links. */
(function () {
  var TO = 'vip@utopia.vegas';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  var css = '' +
    '.rq-back{position:fixed;inset:0;z-index:1000;background:rgba(8,7,6,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}' +
    '.rq-back.open{opacity:1}' +
    '.rq{position:relative;width:100%;max-width:520px;max-height:calc(100vh - 32px);overflow:auto;background:#141210;border:1px solid rgba(217,154,139,.35);border-radius:4px;padding:36px 32px 32px;color:#f4eee2;font-family:"Libre Franklin","Helvetica Neue",Arial,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6)}' +
    '.rq h2{font-family:"Anton","Impact","Arial Narrow",sans-serif;font-weight:400;text-transform:uppercase;font-size:34px;line-height:1.05;margin:0 0 8px;letter-spacing:.01em}' +
    '.rq p.rq-lead{margin:0 0 22px;font-size:16px;line-height:1.5;color:#ddd4c5}' +
    '.rq label{display:block;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#EDB8AB;margin:0 0 6px}' +
    '.rq .rq-f{margin-bottom:16px}' +
    '.rq input,.rq textarea,.rq select{width:100%;box-sizing:border-box;background:#0b0a08;border:1px solid #3a332b;border-radius:2px;color:#f4eee2;font:16px/1.4 "Libre Franklin","Helvetica Neue",Arial,sans-serif;padding:13px 14px;outline:none;transition:border-color .15s}' +
    '.rq input:focus,.rq textarea:focus,.rq select:focus{border-color:#D99A8B}' +
    '.rq select{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,#D99A8B 50%),linear-gradient(135deg,#D99A8B 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 14px) 50%;background-size:6px 6px;background-repeat:no-repeat;padding-right:36px}' +
    '.rq .rq-req{color:#EDB8AB}' +
    '.rq .rq-note{margin:-12px 0 18px;font-size:14px;color:#9d9383}' +
    '.rq .rq-opt{color:#9d9383;font-weight:400;letter-spacing:.04em;text-transform:none}' +
    '.rq textarea{min-height:96px;resize:vertical}' +
    '.rq .rq-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.rq button[type=submit]{width:100%;margin-top:6px;background:#D99A8B;color:#14110b;border:0;border-radius:2px;font:700 16px "Libre Franklin","Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:18px;cursor:pointer;transition:background .2s}' +
    '.rq button[type=submit]:hover{background:#EDB8AB}' +
    '.rq button[type=submit][disabled]{opacity:.6;cursor:wait}' +
    '.rq .rq-x{position:absolute;top:10px;right:12px;background:none;border:0;color:#cfc6b6;font-size:30px;line-height:1;cursor:pointer;padding:6px 10px}' +
    '.rq .rq-x:hover{color:#EDB8AB}' +
    '.rq .rq-hint{display:block;min-height:0;font-size:14px;line-height:1.4;margin-top:6px;color:#ffb4a6}' +
    '.rq .rq-hint:empty{display:none}' +
    '.rq .rq-hint button{background:none;border:0;padding:0;color:#EDB8AB;font:inherit;text-decoration:underline;cursor:pointer}' +
    '.rq input.rq-bad{border-color:#e07a6a}' +
    '.rq .rq-err{color:#ffb4a6;font-size:15px;margin:10px 0 0;display:none}' +
    '.rq .rq-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '.rq .rq-done{text-align:center;padding:20px 0 6px}' +
    '.rq .rq-done p{font-size:17px;line-height:1.55;color:#ddd4c5;margin:10px 0 0}' +
    '@media (max-width:520px){.rq{padding:30px 20px 22px}.rq .rq-row{grid-template-columns:1fr;gap:0}.rq h2{font-size:28px}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var back = null, lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build(subject, isEvent) {
    back = document.createElement('div');
    back.className = 'rq-back';
    back.innerHTML =
      '<div class="rq" role="dialog" aria-modal="true" aria-labelledby="rq-title">' +
      '<button type="button" class="rq-x" aria-label="Close">&times;</button>' +
      '<form novalidate>' +
      '<h2 id="rq-title">' + (isEvent ? 'Request an invitation to the launch' : 'Request an invitation') + '</h2>' +
      '<p class="rq-lead">Leave your details and our team will be in touch personally.</p>' +
      '<p class="rq-note"><span class="rq-req">*</span> Required</p>' +
      '<div class="rq-f"><label for="rq-name">Full name <span class="rq-req">*</span></label><input id="rq-name" name="name" autocomplete="name" required></div>' +
      '<div class="rq-row">' +
      '<div class="rq-f"><label for="rq-email">Email <span class="rq-req">*</span></label><input id="rq-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required><small class="rq-hint" data-for="email"></small></div>' +
      '<div class="rq-f"><label for="rq-phone">Phone <span class="rq-req">*</span></label><input id="rq-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(702) 555-0123" maxlength="20" required><small class="rq-hint" data-for="phone"></small></div>' +
      '</div>' +
      '<div class="rq-row">' +
      '<div class="rq-f"><label for="rq-ig">Instagram</label><input id="rq-ig" name="instagram" placeholder="@handle"></div>' +
      '<div class="rq-f"><label for="rq-ref">Referred by a member?</label><input id="rq-ref" name="referred_by" placeholder="Their name"></div>' +
      '</div>' +
      '<div class="rq-f"><label for="rq-li">LinkedIn</label><input id="rq-li" name="linkedin" type="text" inputmode="url" maxlength="200" placeholder="linkedin.com/in/yourname"><small class="rq-hint" data-for="linkedin"></small></div>' +
      '<div class="rq-row">' +
      '<div class="rq-f"><label for="rq-int">Interested in <span class="rq-req">*</span></label><select id="rq-int" name="interest">' +
        ['Membership', 'Private event or buyout', 'Private tour', 'Investor overview', 'Something else'].map(function (o) { return '<option' + ('Membership' === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
      '</select></div>' +
      (isEvent ? '<div class="rq-f"><label for="rq-guests">Number of guests</label><input id="rq-guests" name="guests" type="number" min="1" max="10" value="1"></div>' : '<div></div>') +
      '</div>' +
      '<div class="rq-f"><label for="rq-msg">Tell us a little about yourself <span class="rq-req">*</span></label><textarea id="rq-msg" name="message" required></textarea></div>' +
      '<div class="rq-hp" aria-hidden="true"><input name="_honey" tabindex="-1" autocomplete="off"></div>' +
      '<button type="submit">Send request</button>' +
      '<p class="rq-err" role="alert"></p>' +
      '</form></div>';
    document.body.appendChild(back);

    var form = back.querySelector('form');
    var err = back.querySelector('.rq-err');
    var btn = back.querySelector('button[type=submit]');

    back.querySelector('.rq-x').addEventListener('click', close);
    back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });

    function hint(field, html) {
      var h = back.querySelector('.rq-hint[data-for="' + field + '"]');
      h.innerHTML = html || '';
      form[field].classList.toggle('rq-bad', !!html && !/rq-sug/.test(html));
    }

    // Email: format check plus a "did you mean" for common domain typos.
    var TYPOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmail.con': 'hotmail.com',
      'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlook.con': 'outlook.com', 'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com', 'icloud.con': 'icloud.com', 'icoud.com': 'icloud.com', 'aol.co': 'aol.com', 'me.co': 'me.com' };
    var EMAIL_RE = /^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
    function checkEmail(strict) {
      var v = form.email.value.trim();
      if (!v) { hint('email', strict ? 'Please enter your email.' : ''); return false; }
      if (!EMAIL_RE.test(v) || /\.\./.test(v)) { hint('email', 'Please enter a valid email, like name@gmail.com'); return false; }
      var dom = v.split('@')[1].toLowerCase();
      if (TYPOS[dom]) { var fix = v.split('@')[0] + '@' + TYPOS[dom]; hint('email', '<span class="rq-sug">Did you mean <button type="button" data-fix="' + esc(fix) + '">' + esc(fix) + '</button>?</span>'); return true; }
      hint('email', ''); return true;
    }

    // Phone: formats US numbers as (702) 555-0123; international numbers start with +.
    function digits(v) { return v.replace(/\D/g, ''); }
    function formatPhone() {
      var v = form.phone.value;
      if (/^\s*\+/.test(v)) return;
      var d = digits(v);
      if (d.length === 11 && d[0] === '1') d = d.slice(1);
      if (d.length > 10) return;
      var out = d;
      if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
      else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
      form.phone.value = out;
    }
    function checkPhone(strict) {
      var v = form.phone.value.trim(), d = digits(v);
      if (!v) { hint('phone', strict ? 'Please enter your phone number.' : ''); return false; }
      var ok = /^\+/.test(v) ? (d.length >= 8 && d.length <= 15) : (d.length === 10 || (d.length === 11 && d[0] === '1'));
      hint('phone', ok ? '' : (/^\+/.test(v) ? 'Please enter a full international number.' : 'Please enter a 10-digit number, or start with + for international.'));
      return ok;
    }

    // LinkedIn: optional, but if filled it should be a LinkedIn profile.
    function checkLinkedIn() {
      var v = form.linkedin.value.trim();
      if (!v) { hint('linkedin', ''); return true; }
      var ok = /linkedin\.com\//i.test(v) || /^[a-z0-9-]{3,100}$/i.test(v);
      hint('linkedin', ok ? '' : 'Please paste your LinkedIn profile link, like linkedin.com/in/yourname');
      return ok;
    }

    form.phone.addEventListener('input', function () { formatPhone(); if (form.phone.classList.contains('rq-bad')) checkPhone(false); });
    form.phone.addEventListener('blur', function () { checkPhone(false); });
    form.email.addEventListener('blur', function () { checkEmail(false); });
    form.email.addEventListener('input', function () { if (form.email.classList.contains('rq-bad')) checkEmail(false); });
    form.linkedin.addEventListener('blur', checkLinkedIn);
    back.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fix]');
      if (b) { form.email.value = b.getAttribute('data-fix'); hint('email', ''); form.email.focus(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.style.display = 'none';
      var name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim(), msg = form.message.value.trim();
      var okEmail = checkEmail(true), okPhone = checkPhone(true), okLi = checkLinkedIn(true);
      if (!name || !okEmail || !okPhone || !msg || !okLi) {
        err.textContent = (!name || !msg) ? 'Please fill in all the required fields.' : 'Please check the highlighted fields.';
        err.style.display = 'block';
        (!name ? form.name : !okEmail ? form.email : !okPhone ? form.phone : !okLi ? form.linkedin : form.message).focus();
        return;
      }
      if (form._honey.value) { done(name); return; }
      var data = {
        _subject: subject + ' from ' + name,
        _template: 'table',
        _replyto: email,
        name: name,
        email: email,
        phone: phone,
        interested_in: form.interest.value,
        instagram: form.instagram.value.trim(),
        linkedin: (function (v) { return v && /linkedin\.com/i.test(v) && !/^https?:\/\//i.test(v) ? 'https://' + v : v; })(form.linkedin.value.trim()),
        referred_by: form.referred_by.value.trim(),
        message: form.message.value.trim(),
        page: location.href
      };
      if (form.guests) data.guests = form.guests.value;
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || String(j.success) === 'false') throw new Error(j.message || 'failed'); }); })
        .then(function () { done(name); })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Send request';
          err.innerHTML = 'Sorry, that didn’t go through. Please try again, or email us at <a href="mailto:' + TO + '" style="color:#EDB8AB">' + TO + '</a>.';
          err.style.display = 'block';
        });
    });

    function done(name) {
      back.querySelector('.rq').innerHTML =
        '<button type="button" class="rq-x" aria-label="Close">&times;</button>' +
        '<div class="rq-done"><h2>Thank you, ' + esc(name.split(' ')[0]) + '</h2>' +
        '<p>Your request has been received. Our team will reach out to you personally.</p></div>';
      back.querySelector('.rq-x').addEventListener('click', close);
      back.querySelector('.rq-x').focus();
    }
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  function open(subject, isEvent) {
    lastFocus = document.activeElement;
    build(subject, isEvent);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () { back.classList.add('open'); });
    setTimeout(function () { var f = back.querySelector('#rq-name'); if (f) f.focus(); }, 60);
  }

  function close() {
    if (!back) return;
    var b = back; back = null;
    b.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { b.remove(); }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:' + TO + '"]');
    if (!a || !a.classList.contains('btn')) return;
    e.preventDefault();
    var m = a.getAttribute('href').match(/subject=([^&]*)/);
    var subject = m ? decodeURIComponent(m[1]) : 'Utopia invitation request';
    open(subject, /event/i.test(subject));
  });
})();
