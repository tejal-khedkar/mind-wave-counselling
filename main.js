/* =========================================
   MindWave Counselling — Main JavaScript
   ========================================= */

// ─── EMAILJS CONFIGURATION ───
// 1. Go to https://www.emailjs.com, create a free account
// 2. Add Gmail service → copy your SERVICE_ID
// 3. Create template with: {{from_name}}, {{from_email}}, {{phone}}, {{session_type}}, {{message}}
// 4. Copy your PUBLIC_KEY from Account → API Keys
var EMAILJS_PUBLIC_KEY   = 'YOUR_PUBLIC_KEY';
var EMAILJS_SERVICE_ID   = 'YOUR_SERVICE_ID';
var EMAILJS_TEMPLATE_ID  = 'YOUR_TEMPLATE_ID';

(function () {
  if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
})();

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
  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  // Close on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });
})();

// ─── STICKY NAV SHADOW ───
window.addEventListener('scroll', function () {
  var nav = document.querySelector('nav');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(74,55,40,.08)' : '';
});

// ─── BOOKING FORM ───
function doBook() {
  var fn  = document.getElementById('bf').value.trim();
  var ln  = document.getElementById('bl').value.trim();
  var em  = document.getElementById('be').value.trim();
  var ph  = document.getElementById('bp').value.trim();
  var tp  = document.getElementById('bt').value;
  var ms  = document.getElementById('bm').value.trim();
  var btn = document.getElementById('bookBtn');
  var msg = document.getElementById('formMsg');

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

  var params = {
    from_name:    fn + ' ' + ln,
    first_name:   fn,
    last_name:    ln,
    from_email:   em,
    phone:        ph,
    session_type: tp,
    message:      ms || 'No additional message.',
    to_email:     'tejalrkhedkar@gmail.com',
    reply_to:     em
  };

  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.style.display = 'none';
  msg.className = 'form-msg';

  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    setTimeout(function () {
      msg.textContent = '✓ Thank you! We\'ll be in touch within 24 hours.';
      msg.className = 'form-msg ok';
      btn.disabled = false;
      btn.textContent = 'Request Appointment →';
    }, 900);
    return;
  }

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(function () {
      msg.textContent = '✓ Appointment request sent! Dr. Tejal will reply within 24 hours.';
      msg.className = 'form-msg ok';
      ['bf','bl','be','bp','bm'].forEach(function (id) { document.getElementById(id).value = ''; });
      document.getElementById('bt').value = '';
    }, function () {
      msg.textContent = '✗ Something went wrong. Please email us directly.';
      msg.className = 'form-msg err';
    })
    .finally(function () {
      btn.disabled = false;
      btn.textContent = 'Request Appointment →';
    });
}

// ─── ASSESSMENT TABS ───
function switchTab(tab) {
  document.querySelectorAll('.atab').forEach(function (t) { t.classList.remove('on'); });
  document.querySelectorAll('.apanel').forEach(function (p) { p.classList.remove('on'); });
  document.getElementById('tab-' + tab).classList.add('on');
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
  var g  = document.createElement('div');
  g.className = 'bai-grid';
  var LV = ['Not at all', 'Mildly', 'Moderately', 'Severely'];
  BA.forEach(function (s, si) {
    var d = document.createElement('div');
    d.className = 'bai-item';
    var sc = LV.map(function (lv, li) {
      return '<div class="bai-opt"><input type="radio" name="ba' + si + '" id="ba' + si + '_' + li + '" value="' + li + '"/><label for="ba' + si + '_' + li + '">' + lv + '</label></div>';
    }).join('');
    d.innerHTML = '<div class="bai-lbl"><span class="bai-n">' + (si + 1) + '</span>' + s + '</div><div class="bai-scale">' + sc + '</div>';
    g.appendChild(d);
  });
  c.appendChild(g);
})();

function scoreBDI() {
  var total = 0, miss = 0;
  for (var i = 0; i < 21; i++) {
    var s = document.querySelector('input[name="bd' + i + '"]:checked');
    if (s) total += parseInt(s.value); else miss++;
  }
  if (miss > 0) { alert('Please answer all ' + miss + ' remaining question(s).'); return; }
  var l, c, d, a;
  if (total <= 13)      { l = 'Minimal Depression';  c = 'r0'; d = 'Your responses suggest minimal or no depression at this time.'; a = 'Continue nurturing your wellbeing through self-care, connection, and healthy routines.'; }
  else if (total <= 19) { l = 'Mild Depression';     c = 'r1'; d = 'Your responses suggest mild depressive symptoms — some low mood or loss of motivation.'; a = 'Speaking with a counsellor can help address these early signs before they deepen.'; }
  else if (total <= 28) { l = 'Moderate Depression'; c = 'r2'; d = 'Your responses suggest moderate depression. These feelings deserve proper attention.'; a = 'I would encourage you to book a session. Therapy can make a meaningful difference at this stage.'; }
  else                  { l = 'Severe Depression';   c = 'r3'; d = 'Your responses suggest severe depressive symptoms. Please know — you are not alone.'; a = 'It is important to seek professional support as soon as possible. Please reach out.'; }
  showR('bdi-result', total, l, c, d, a);
}

function scoreBAI() {
  var total = 0, miss = 0;
  for (var i = 0; i < 21; i++) {
    var s = document.querySelector('input[name="ba' + i + '"]:checked');
    if (s) total += parseInt(s.value); else miss++;
  }
  if (miss > 0) { alert('Please answer all ' + miss + ' remaining question(s).'); return; }
  var l, c, d, a;
  if (total <= 7)       { l = 'Minimal Anxiety';  c = 'r0'; d = 'Your anxiety levels appear minimal. You seem to be managing well right now.'; a = 'Keep practising stress management and mindfulness to maintain your calm.'; }
  else if (total <= 15) { l = 'Mild Anxiety';     c = 'r1'; d = 'Your responses suggest mild anxiety — some tension or worry in daily life.'; a = 'Relaxation techniques and brief therapy can be very effective at this stage.'; }
  else if (total <= 25) { l = 'Moderate Anxiety'; c = 'r2'; d = 'Your responses indicate moderate anxiety that may be affecting daily functioning.'; a = 'Therapy — especially CBT or REBT — can help you regain control. Consider booking a session.'; }
  else                  { l = 'Severe Anxiety';   c = 'r3'; d = 'Your responses suggest severe anxiety. This level of distress deserves professional attention.'; a = 'Please reach out for support soon. You do not have to manage this alone.'; }
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
