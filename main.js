/* =========================================
   MindWave Counselling — Main JavaScript
   ========================================= */

// ─── GOOGLE APPS SCRIPT ENDPOINT ───
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbybg2YONqMXa4agUIsyLjr4zW6YM-15NmbjuZmOZFzslnOEqLdb8UaWk4qW84TmrAkYFA/exec';

// ─── ASSESSMENT RESULT STORE ───
var completedAssessments = {};

// ─── SCROLL REVEAL ───
(function () {
  var els = document.querySelectorAll('.rv');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { obs.observe(el); });
})();

// ─── MOBILE NAV TOGGLE ───
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  function setNavState(isOpen) {
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    links.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    links.querySelectorAll('a').forEach(function (a) {
      a.setAttribute('tabindex', isOpen ? '0' : '-1');
    });
  }

  // Initialize closed state when toggle is visible (mobile)
  if (window.getComputedStyle(toggle).display !== 'none') {
    setNavState(false);
  }

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    setNavState(isOpen);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      setNavState(false);
    });
  });

  // Restore on resize to desktop
  window.addEventListener('resize', function () {
    if (window.getComputedStyle(toggle).display === 'none') {
      links.removeAttribute('aria-hidden');
      links.querySelectorAll('a').forEach(function (a) { a.removeAttribute('tabindex'); });
    } else if (!links.classList.contains('open')) {
      setNavState(false);
    }
  });
})();

// ─── STICKY NAV SHADOW ───
window.addEventListener('scroll', function () {
  var nav = document.querySelector('nav');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(74,55,40,.08)' : '';
});

// ─── BOOKING FORM ───
var _bookCooldown = false;

function doBook() {
  var fn  = document.getElementById('bf').value.trim();
  var ln  = document.getElementById('bl').value.trim();
  var em  = document.getElementById('be').value.trim();
  var ph  = document.getElementById('bp').value.trim();
  var tp  = document.getElementById('bt').value;
  var ms  = document.getElementById('bm').value.trim();
  var btn = document.getElementById('bookBtn');
  var msg = document.getElementById('formMsg');

  if (_bookCooldown) {
    msg.textContent = '⚠️ Please wait a moment before submitting again.';
    msg.className = 'form-msg err';
    return;
  }

  if (!fn || !em || !ph || !tp) {
    msg.textContent = '⚠️ Please fill in Name, Email, Phone and Session Type.';
    msg.className = 'form-msg err';
    return;
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(em)) {
    msg.textContent = '⚠️ Please enter a valid email address.';
    msg.className = 'form-msg err';
    return;
  }

  var phoneRe = /^\+?[\d\s\-().]{7,15}$/;
  if (!phoneRe.test(ph)) {
    msg.textContent = '⚠️ Please enter a valid phone number.';
    msg.className = 'form-msg err';
    return;
  }

  var params = {
    first_name:   fn,
    last_name:    ln,
    email:        em,
    phone:        ph,
    session_type: tp,
    message:      ms || '',
    assessments:  Object.keys(completedAssessments).length ? completedAssessments : null,
    mode:         _spMode     || null,
    slot_id:      _spSelected ? _spSelected.id        : null,
    slot_date:    _spSelected ? _spSelected.date       : null,
    slot_time:    _spSelected ? _spSelected.timeStart  : null
  };

  btn.disabled = true;
  _bookCooldown = true;
  btn.textContent = 'Sending…';
  msg.style.display = 'none';
  msg.className = 'form-msg';

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify(params)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.status === 'slot_taken') {
        msg.textContent = '⚠️ That slot was just booked by someone else. Please choose another slot or submit without one.';
        msg.className = 'form-msg err';
        btn.disabled = false;
        btn.textContent = 'Request Appointment →';
        _bookCooldown = false;
        _spSelected = null;
        document.getElementById('spSelected').style.display = 'none';
        spFetchSlots();
        return;
      }
      if (data.status === 'ok') {
        var formBox = document.querySelector('.bk-form');
        var originalHTML = formBox.innerHTML;
        var successDiv = document.createElement('div');
        successDiv.className = 'bk-success';
        var iconDiv = document.createElement('div');
        iconDiv.className = 'bk-success-icon';
        iconDiv.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        var h3 = document.createElement('h3');
        h3.textContent = 'Request Sent!';
        var p1 = document.createElement('p');
        var s1 = document.createElement('strong');
        s1.textContent = fn;
        p1.appendChild(document.createTextNode('Thank you, '));
        p1.appendChild(s1);
        p1.appendChild(document.createTextNode('. Your appointment request has been received.'));
        var p2 = document.createElement('p');
        var s2 = document.createElement('strong');
        s2.textContent = em;
        p2.appendChild(document.createTextNode('Tejal will get back to you at '));
        p2.appendChild(s2);
        p2.appendChild(document.createTextNode(' within 24 hours.'));
        successDiv.appendChild(iconDiv);
        successDiv.appendChild(h3);
        successDiv.appendChild(p1);
        successDiv.appendChild(p2);
        formBox.innerHTML = '';
        formBox.appendChild(successDiv);
        formBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () {
          successDiv.style.opacity = '0';
          setTimeout(function () {
            formBox.innerHTML = originalHTML;
            spFetchSlots();
          }, 800);
        }, 3500);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    })
    .catch(function () {
      msg.textContent = '✗ Something went wrong. Please email or WhatsApp directly.';
      msg.className = 'form-msg err';
      btn.disabled = false;
      btn.textContent = 'Request Appointment →';
      _bookCooldown = false;
    });
}

// ─── ACTIVE NAV HIGHLIGHT ───
(function () {
  var sections = document.querySelectorAll('section[id], div[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.remove('nav-active'); });
        var active = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('nav-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { obs.observe(s); });
})();

// ─── ASSESSMENT TABS ───
function switchTab(tab) {
  document.querySelectorAll('.atab').forEach(function (t) {
    t.classList.remove('on');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.apanel').forEach(function (p) { p.classList.remove('on'); });
  var activeTab = document.getElementById('tab-' + tab);
  activeTab.classList.add('on');
  activeTab.setAttribute('aria-selected', 'true');
  document.getElementById('panel-' + tab).classList.add('on');
}

// ─── BECK DEPRESSION INVENTORY (BDI-II) ───
var BD = [
  {t:'Sadness',o:['I do not feel sad.','I feel sad much of the time.','I am sad all the time.','I am so sad or unhappy that I can\'t stand it.']},
  {t:'Pessimism',o:['I am not discouraged about my future.','I feel more discouraged about my future than I used to be.','I do not expect things to work out for me.','I feel my future is hopeless and will only get worse.']},
  {t:'Past Failure',o:['I do not feel like a failure.','I have failed more than I should have.','As I look back, I see a lot of failures.','I feel I am a total failure as a person.']},
  {t:'Loss of Pleasure',o:['I get as much pleasure as I ever did from the things I enjoy.','I don\'t enjoy things as much as I used to.','I get very little pleasure from the things I used to enjoy.','I can\'t get any pleasure from the things I used to enjoy.']},
  {t:'Guilty Feelings',o:['I don\'t feel particularly guilty.','I feel guilty over many things I have done or should have done.','I feel quite guilty most of the time.','I feel guilty all of the time.']},
  {t:'Punishment Feelings',o:['I don\'t feel I am being punished.','I feel I may be punished.','I expect to be punished.','I feel I am being punished.']},
  {t:'Self-Dislike',o:['I feel the same about myself as ever.','I have lost confidence in myself.','I am disappointed in myself.','I dislike myself.']},
  {t:'Self-Criticalness',o:['I don\'t criticise or blame myself more than usual.','I am more critical of myself than I used to be.','I criticise myself for all of my faults.','I blame myself for everything bad that happens.']},
  {t:'Suicidal Thoughts',o:['I don\'t have any thoughts of killing myself.','I have thoughts of killing myself, but I would not carry them out.','I would like to kill myself.','I would kill myself if I had the chance.']},
  {t:'Crying',o:['I don\'t cry any more than I used to.','I cry more than I used to.','I cry over every little thing.','I feel like crying, but I can\'t.']},
  {t:'Agitation',o:['I am no more restless or wound up than usual.','I feel more restless or wound up than usual.','I am so restless or agitated that it\'s hard to stay still.','I am so restless or agitated that I have to keep moving or doing something.']},
  {t:'Loss of Interest',o:['I have not lost interest in other people or activities.','I am less interested in other people or things than before.','I have lost most of my interest in other people or things.','It is hard to get interested in anything.']},
  {t:'Indecisiveness',o:['I make decisions about as well as ever.','I find it more difficult to make decisions than usual.','I have much greater difficulty making decisions than I used to.','I have trouble making any decisions.']},
  {t:'Worthlessness',o:['I do not feel I am worthless.','I do not consider myself as worthwhile and useful as I used to.','I feel more worthless as compared to other people.','I feel utterly worthless.']},
  {t:'Loss of Energy',o:['I have as much energy as ever.','I have less energy than I used to have.','I do not have enough energy to do very much.','I do not have enough energy to do anything.']},
  {t:'Changes in Sleeping',o:['I have not experienced any change in my sleeping pattern.','I sleep somewhat more or less than usual.','I sleep a lot more or less than usual.','I sleep most of the day or wake up 1 to 2 hours early and cannot get back to sleep.']},
  {t:'Irritability',o:['I am no more irritable than usual.','I am more irritable than usual.','I am much more irritable than usual.','I am irritable all the time.']},
  {t:'Changes in Appetite',o:['I have not experienced any change in my appetite.','My appetite is somewhat less or greater than usual.','My appetite is much less or greater than usual.','I have no appetite at all or I crave food all the time.']},
  {t:'Concentration Difficulty',o:['I can concentrate as well as ever.','I cannot concentrate as well as usual.','It is hard to keep my mind on anything for very long.','I find I cannot concentrate on anything.']},
  {t:'Tiredness or Fatigue',o:['I am no more tired or fatigued than usual.','I get tired or fatigued more easily than usual.','I am too tired or fatigued to do a lot of things I used to do.','I am too tired or fatigued to do most things I used to do.']},
  {t:'Loss of Interest in Sex',o:['I have not noticed any recent change in my interest in sex.','I am less interested in sex than I used to be.','I am much less interested in sex now.','I have lost interest in sex completely.']}
];

var BA = ['Numbness or tingling','Feeling hot','Wobbliness in legs','Unable to relax','Fear of worst happening','Dizzy or lightheaded','Heart pounding / racing','Unsteady','Terrified or afraid','Nervous','Feeling of choking','Hands trembling','Shaky / unsteady','Fear of losing control','Difficulty breathing','Fear of dying','Scared','Indigestion','Faint / lightheaded','Face flushed','Hot / cold sweats'];

// Render BDI
(function () {
  var c = document.getElementById('bdi-qs');
  BD.forEach(function (q, qi) {
    var d = document.createElement('div');
    d.className = 'bdi-item' + (qi === 0 ? ' bdi-active' : ' bdi-locked');
    d.id = 'bdi-q' + qi;
    var o = q.o.map(function (txt, oi) {
      return '<div class="bdi-opt"><input type="radio" name="bd' + qi + '" id="bd' + qi + '_' + oi + '" value="' + oi + '" onchange="bdiNext(' + qi + ')"/><label for="bd' + qi + '_' + oi + '"><strong>' + oi + '</strong> — ' + txt + '</label></div>';
    }).join('');
    d.innerHTML = '<div class="bdi-ttl"><span class="bdi-n">' + (qi + 1) + '</span>' + q.t + '</div><div class="bdi-opts">' + o + '</div>';
    c.appendChild(d);
  });
})();

function bdiNext(qi) {
  var cur  = document.getElementById('bdi-q' + qi);
  cur.classList.remove('bdi-active');
  cur.classList.add('bdi-done');
  var next = document.getElementById('bdi-q' + (qi + 1));
  if (next) {
    next.classList.remove('bdi-locked');
    next.classList.add('bdi-active');
    setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  } else {
    setTimeout(function () { document.querySelector('#panel-bdi .assess-submit').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  }
}

// Render BAI
(function () {
  var c  = document.getElementById('bai-qs');
  var LV = ['Not at all', 'Mildly', 'Moderately', 'Severely'];
  BA.forEach(function (s, si) {
    var d = document.createElement('div');
    d.className = 'bdi-item' + (si === 0 ? ' bdi-active' : ' bdi-locked');
    d.id = 'bai-q' + si;
    var opts = LV.map(function (lv, li) {
      return '<div class="bdi-opt"><input type="radio" name="ba' + si + '" id="ba' + si + '_' + li + '" value="' + li + '" onchange="baiNext(' + si + ')"/><label for="ba' + si + '_' + li + '"><strong>' + li + '</strong> — ' + lv + '</label></div>';
    }).join('');
    d.innerHTML = '<div class="bdi-ttl"><span class="bdi-n">' + (si + 1) + '</span>' + s + '</div><div class="bdi-opts">' + opts + '</div>';
    c.appendChild(d);
  });
})();

function baiNext(si) {
  var cur  = document.getElementById('bai-q' + si);
  cur.classList.remove('bdi-active');
  cur.classList.add('bdi-done');
  var next = document.getElementById('bai-q' + (si + 1));
  if (next) {
    next.classList.remove('bdi-locked');
    next.classList.add('bdi-active');
    setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  } else {
    setTimeout(function () { document.querySelector('#panel-bai .assess-submit').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  }
}

function scoreBDI() {
  var total = 0, miss = 0;
  for (var i = 0; i < 21; i++) {
    var s = document.querySelector('input[name="bd' + i + '"]:checked');
    if (s) total += parseInt(s.value); else miss++;
  }
  if (miss > 0) {
    var bdiErr = document.getElementById('bdi-result');
    bdiErr.className = 'a-result';
    bdiErr.style.display = 'block';
    bdiErr.textContent = 'Please answer all ' + miss + ' remaining question(s) before calculating your score.';
    bdiErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  var l, c, d, a;
  if (total <= 13)      { l = 'Minimal Depression';  c = 'r0'; d = 'Your responses suggest minimal or no depression at this time.'; a = 'Continue nurturing your wellbeing through self-care, connection, and healthy routines.'; }
  else if (total <= 19) { l = 'Mild Depression';     c = 'r1'; d = 'Your responses suggest mild depressive symptoms — some low mood or loss of motivation.'; a = 'Speaking with a counsellor can help address these early signs before they deepen.'; }
  else if (total <= 28) { l = 'Moderate Depression'; c = 'r2'; d = 'Your responses suggest moderate depression. These feelings deserve proper attention.'; a = 'I would encourage you to book a session. Therapy can make a meaningful difference at this stage.'; }
  else                  { l = 'Severe Depression';   c = 'r3'; d = 'Your responses suggest severe depressive symptoms. Please know — you are not alone.'; a = 'It is important to seek professional support as soon as possible. Please reach out.'; }
  var bdiQA = BD.map(function(q, qi) {
    var sel = document.querySelector('input[name="bd' + qi + '"]:checked');
    var val = sel ? parseInt(sel.value) : 0;
    return { num: qi + 1, question: q.t, score: val, answer: q.o[val] };
  });
  completedAssessments.bdi = { name: 'Beck Depression Inventory (BDI-II)', score: total, max: 63, level: l, qa: bdiQA };
  showR('bdi-result', total, l, c, d, a);
}

function scoreBAI() {
  var total = 0, miss = 0;
  for (var i = 0; i < 21; i++) {
    var s = document.querySelector('input[name="ba' + i + '"]:checked');
    if (s) total += parseInt(s.value); else miss++;
  }
  if (miss > 0) {
    var baiErr = document.getElementById('bai-result');
    baiErr.className = 'a-result';
    baiErr.style.display = 'block';
    baiErr.textContent = 'Please answer all ' + miss + ' remaining question(s) before calculating your score.';
    baiErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  var l, c, d, a;
  if (total <= 7)       { l = 'Minimal Anxiety';  c = 'r0'; d = 'Your anxiety levels appear minimal. You seem to be managing well right now.'; a = 'Keep practising stress management and mindfulness to maintain your calm.'; }
  else if (total <= 15) { l = 'Mild Anxiety';     c = 'r1'; d = 'Your responses suggest mild anxiety — some tension or worry in daily life.'; a = 'Relaxation techniques and brief therapy can be very effective at this stage.'; }
  else if (total <= 25) { l = 'Moderate Anxiety'; c = 'r2'; d = 'Your responses indicate moderate anxiety that may be affecting daily functioning.'; a = 'Therapy — especially CBT or REBT — can help you regain control. Consider booking a session.'; }
  else                  { l = 'Severe Anxiety';   c = 'r3'; d = 'Your responses suggest severe anxiety. This level of distress deserves professional attention.'; a = 'Please reach out for support soon. You do not have to manage this alone.'; }
  var baiLV = ['Not at all', 'Mildly', 'Moderately', 'Severely'];
  var baiQA = BA.map(function(s, si) {
    var sel = document.querySelector('input[name="ba' + si + '"]:checked');
    var val = sel ? parseInt(sel.value) : 0;
    return { num: si + 1, question: s, score: val, answer: baiLV[val] };
  });
  completedAssessments.bai = { name: 'Beck Anxiety Inventory (BAI)', score: total, max: 63, level: l, qa: baiQA };
  showR('bai-result', total, l, c, d, a);
}

function showR(id, score, level, cls, desc, advice) {
  var el = document.getElementById(id);
  el.className = 'a-result ' + cls;
  el.style.display = 'block';
  el.innerHTML = '<div class="r-score">' + score + '</div><div class="r-level">' + level + '</div>'
    + '<p class="r-desc">' + desc + '</p>'
    + '<p class="r-advice">' + advice + '</p>'
    + '<a href="#book" class="r-cta">Book a Session →</a>';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── COPYRIGHT YEAR ───
(function () {
  var el = document.getElementById('copy-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ─── SLOT PICKER ─────────────────────────────────────────────────────────────

var _spSlots      = [];        // all slots from GAS (14-day window)
var _spWeekOffset = 0;         // 0 = current week, 1 = next week
var _spSelected   = null;      // { id, date, timeStart, timeEnd, type } or null
var _spLoaded     = false;     // true after first fetch attempt
var _spMode       = null;      // 'online' or 'in-person' — set by mode buttons

// Pre-fetch slots when the booking section enters the viewport,
// so they are ready by the time the user picks a mode.
(function () {
  var target = document.getElementById('slotPicker');
  if (!target) return;
  if (!window.IntersectionObserver) return; // fetch on demand via spSetMode
  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !_spLoaded) {
      _spLoaded = true;
      spFetchSlots();
      obs.unobserve(target);
    }
  }, { threshold: 0.1 });
  obs.observe(target);
})();

function spSetMode(mode) {
  _spMode = mode;

  // Update mode button pressed states
  var onlineBtn   = document.getElementById('spModeOnline');
  var inpersonBtn = document.getElementById('spModeInperson');
  if (onlineBtn)   onlineBtn.setAttribute('aria-pressed',   mode === 'online'    ? 'true' : 'false');
  if (inpersonBtn) inpersonBtn.setAttribute('aria-pressed', mode === 'in-person' ? 'true' : 'false');

  // Update slot area label
  var lbl = document.getElementById('spSlotLabel');
  if (lbl) lbl.textContent = (mode === 'online' ? 'Online' : 'In-Person') + ' slots';

  // Clear any previously selected slot if mode changed
  if (_spSelected && _spSelected.type !== mode) {
    _spSelected = null;
    var sel = document.getElementById('spSelected');
    if (sel) sel.style.display = 'none';
  }

  // Show the slot area
  var slotArea = document.getElementById('spSlotArea');
  if (slotArea) slotArea.style.display = 'block';

  // Fetch slots once, re-render on mode change
  if (!_spLoaded) {
    spInit();
  } else {
    spRenderWeek();
  }
}

function spInit() {
  _spLoaded = true;
  spFetchSlots();
}

function spFetchSlots() {
  if (_spMode) spShowState('loading');

  var timeout = new Promise(function (_, reject) {
    setTimeout(function () { reject(new Error('timeout')); }, 10000);
  });
  var request = fetch(APPS_SCRIPT_URL, { method: 'GET', redirect: 'follow' })
    .then(function (r) { return r.json(); });

  Promise.race([request, timeout])
    .then(function (data) {
      if (data.status !== 'ok') throw new Error(data.message || 'bad status');
      _spSlots = data.slots || [];
      if (_spMode) spRenderWeek();
    })
    .catch(function () {
      if (_spMode) spShowState('error');
    });
}

// ── Week rendering ────────────────────────────────────────────────────────────

function spGetWeekBounds(offset) {
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offset * 7);
  var end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: start, end: end };
}

function spRenderWeek() {
  var bounds = spGetWeekBounds(_spWeekOffset);

  // Update week label
  var weekLabel = document.getElementById('spWeekLabel');
  if (weekLabel) {
    weekLabel.textContent = spFriendlyDate(bounds.start) + ' \u2013 ' + spFriendlyDate(new Date(bounds.end - 1));
  }

  // Update nav button states
  var prevBtn = document.getElementById('spPrev');
  var nextBtn = document.getElementById('spNext');
  if (prevBtn) prevBtn.disabled = _spWeekOffset === 0;
  // Disable next if no slots exist beyond current week window
  if (nextBtn) nextBtn.disabled = _spWeekOffset >= 1;

  // Filter slots within this week, restricted to selected mode
  var filtered = _spSlots.filter(function (s) {
    var d = new Date(s.date + 'T12:00:00');
    return d >= bounds.start && d < bounds.end
      && (_spMode ? s.type === _spMode : true);
  });

  if (!filtered.length) {
    spShowState('empty');
    return;
  }

  spShowState('cols');
  spBuildCols(filtered);
}

function spBuildCols(slots) {
  // Group by date
  var grouped = {};
  var dates = [];
  slots.forEach(function (s) {
    if (!grouped[s.date]) { grouped[s.date] = []; dates.push(s.date); }
    grouped[s.date].push(s);
  });
  dates.sort();

  var cols = document.getElementById('spCols');
  cols.innerHTML = '';

  dates.forEach(function (date) {
    var col = document.createElement('div');
    col.className = 'sp-col';
    col.setAttribute('role', 'listitem');

    var hdr = document.createElement('div');
    hdr.className = 'sp-col-date';
    hdr.textContent = spFriendlyDate(new Date(date + 'T12:00:00'));
    col.appendChild(hdr);

    grouped[date].forEach(function (slot) {
      var isSel = _spSelected && _spSelected.id === slot.id;
      var btn = document.createElement('button');
      btn.className = 'sp-slot' + (isSel ? ' sp-slot--selected' : '');
      btn.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      btn.setAttribute('type', 'button');
      btn.dataset.slotId    = slot.id;
      btn.dataset.slotDate  = slot.date;
      btn.dataset.slotTime  = slot.timeStart;
      btn.dataset.slotEnd   = slot.timeEnd;
      btn.dataset.slotType  = slot.type;
      btn.onclick = function () { spSelectSlot(btn); };

      var timeSpan = document.createElement('span');
      timeSpan.className = 'sp-slot-time';
      timeSpan.textContent = slot.timeStart + '\u2013' + slot.timeEnd;

      var badge = document.createElement('span');
      var typeKey = slot.type === 'online' ? 'online' : 'inperson';
      badge.className = 'sp-slot-badge sp-badge-' + typeKey;
      badge.textContent = slot.type === 'online' ? 'Online' : 'In-Person';

      btn.appendChild(timeSpan);
      btn.appendChild(badge);
      col.appendChild(btn);
    });

    cols.appendChild(col);
  });
}

// ── Selection ─────────────────────────────────────────────────────────────────

function spSelectSlot(btn) {
  // Re-click = deselect
  if (_spSelected && _spSelected.id === btn.dataset.slotId) {
    spDeselect();
    return;
  }

  _spSelected = {
    id:        btn.dataset.slotId,
    date:      btn.dataset.slotDate,
    timeStart: btn.dataset.slotTime,
    timeEnd:   btn.dataset.slotEnd,
    type:      btn.dataset.slotType
  };

  // Update button states
  document.querySelectorAll('.sp-slot').forEach(function (b) {
    b.classList.remove('sp-slot--selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('sp-slot--selected');
  btn.setAttribute('aria-pressed', 'true');

  spUpdateSummary();
}

function spDeselect() {
  _spSelected = null;
  document.querySelectorAll('.sp-slot').forEach(function (b) {
    b.classList.remove('sp-slot--selected');
    b.setAttribute('aria-pressed', 'false');
  });
  document.getElementById('spSelected').style.display = 'none';
}

function spUpdateSummary() {
  var sel = document.getElementById('spSelected');
  var txt = document.getElementById('spSelText');
  var typeLabel = _spSelected.type === 'online' ? 'Online' : 'In-Person';
  var dateLabel = spFriendlyDate(new Date(_spSelected.date + 'T12:00:00'));
  txt.textContent = '\u2714 ' + dateLabel + ' at ' + _spSelected.timeStart + ' \u2014 ' + typeLabel;
  sel.style.display = 'flex';
}

// ── Navigation ────────────────────────────────────────────────────────────────

function spNavWeek(dir) {
  var next = _spWeekOffset + dir;
  if (next < 0) return;
  if (next > 1) return; // only 14 days fetched
  _spWeekOffset = next;
  spRenderWeek();
}

// ── State display ─────────────────────────────────────────────────────────────

function spShowState(state) {
  var loading = document.getElementById('spLoading');
  var error   = document.getElementById('spError');
  var empty   = document.getElementById('spEmpty');
  var cols    = document.getElementById('spCols');
  if (loading) loading.style.display = state === 'loading' ? 'flex'  : 'none';
  if (error)   error.style.display   = state === 'error'   ? 'block' : 'none';
  if (empty)   empty.style.display   = state === 'empty'   ? 'block' : 'none';
  if (cols)    cols.style.display    = state === 'cols'    ? 'flex'  : 'none';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function spFriendlyDate(d) {
  // Returns e.g. "Sat, 14 Jun"
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
