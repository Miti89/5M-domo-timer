/**
 * NO.1 PRO — Application Controller (app.js)
 * Wires TimerCore, SatelliteEngine, ChronoAudio, and ChronoStorage.
 * Zero-Build, file:// safe, 0 inline handlers, XSS-safe rendering.
 */
(function () {
  'use strict';

  const escapeHtml = window.TimerCore.escapeHtml;

  const MODE_ORDER = ['pomodoro', 'countdown', 'stopwatch'];

  const MODE_LABELS = {
    pomodoro: '포모도로',
    countdown: '타이머',
    stopwatch: '스톱워치',
    clock: '데스크 시계',
    partial: '금고 보관',
    summary: '일일 요약'
  };

  // Check brand-new user BEFORE loadAtelier() touches any storage flags
  const isBrandNewUserOnBoot = Boolean(
    window.ChronoStorage && typeof window.ChronoStorage.isNewUser === 'function' && window.ChronoStorage.isNewUser()
  );

  // Load persisted user preferences & watchmaker atelier state
  const prefs = window.ChronoStorage.loadPrefs();
  prefs.theme = 'steel';
  let atelierState = window.ChronoStorage.loadAtelier();
  let narrativeMeta = (window.ChronoStorage && typeof window.ChronoStorage.loadNarrativeMeta === 'function')
    ? window.ChronoStorage.loadNarrativeMeta()
    : { onboardingSeen: false, prologueSeen: false, epilogueSeen: false, hintsSeen: { deck: false, crown: false } };
  let mountedCaliberId = null;
  const timer = window.TimerCore.createTimer({
    mode: 'pomodoro',
    focusMinutes: prefs.focusMinutes,
    breakMinutes: prefs.breakMinutes,
    countdownMinutes: prefs.countdownMinutes
  });

  // Runtime state
  let demoActive = false;
  let demoEpochMs = Date.now();
  let lastPerfMs = performance.now();
  let wakeLockSentinel = null;
  let lastChimedHourKey = '';
  let activeReflectionLogId = null;
  let activeReflectionCanStartBreak = false;
  let toastTimerId = null;
  let resetConfirmArmed = false;
  let resetConfirmTimerId = null;
  let completionTimeoutId = null;
  let notificationPermissionAsked = false;
  let savedAmbience = null; // For M-key quick mute/restore
  let activeMusic = null;   // { id, title, url, parsed }
  let musicPlaying = false;
  let musicMuted = false;
  let musicFrameCollapsed = false;
  let musicDetailOpen = false;
  let musicStandbyVideoOpen = false;
  let drumCurrentMode = 'pomodoro';
  let lastNonClockMode = 'pomodoro';
  let drumAnimTimerId = null;
  let lastDrumWheelMs = 0;
  let lastLockedCrownToastMs = 0;
  let deckFlipped = false;
  let deckFlipTimer = 0;
  const casebackArtEl = document.getElementById('casebackArt');
  let casebackBalT = 0;
  let casebackLastPerf = 0;
  let casebackLastKey = '';
  let casebackParts = null;
  let atelierTapCount = 0;
  let lastAtelierTapMs = 0;
  let lastTitleText = '';
  let lastDigitalText = '';
  let lastPhaseKey = '';
  let pendingPrologueAfterReflection = false;
  let prologueCardIndex = 0;
  let expandedCodexCaliberId = null;
  let activeHintKey = null;
  let swRegistration = null;
  let waitingServiceWorker = null;
  let swUpdateRequested = false;
  let swRefreshing = false;
  let lastSwUpdateCheckMs = 0;
  let cheersMessages = [];

  const PROLOGUE_CARDS = [
    '세상에서 가장 귀하지만, 손가락 사이로 가장 쉽게 흩어지는 보물은 시간입니다.',
    'CASPER는 당신의 책상 한쪽에 소리 없이 머무는 보이지 않는 관리자입니다.',
    '집중이 무너지는 밤에도, 겨우 5분을 버텨낸 오후에도,\n당신이 흘려보낸 줄 알았던 찰나들을 톱니바퀴 속에 고이 보관합니다.\n이제, 흩어진 시간을 조립할 차례입니다.'
  ];

  const FEATURE_HINTS = {
    deck: '톱니를 누르면 시계 뒷면 설정으로 가요',
    crown: '숫자를 누르거나 용두를 돌려 시간을 맞춰요',
    screenOn: '화면을 켜 두면 끝날 때 알려 드려요'
  };

  // DOM references
  const dom = {
    metaThemeColor: document.getElementById('metaThemeColor'),
    brandTitle: document.getElementById('brandTitle'),
    brandHomage: document.getElementById('brandHomage'),
    monolithFlipper: document.getElementById('monolithFlipper'),
    backControlDeck: document.getElementById('backControlDeck'),
    devModeBadge: document.getElementById('devModeBadge'),
    atelierDevStrip: document.getElementById('atelierDevStrip'),
    frontAtelierDot: document.getElementById('frontAtelierDot'),
    tabAtelierDot: document.getElementById('tabAtelierDot'),
    atelierProjectTitle: document.getElementById('atelierProjectTitle'),
    atelierProgressMeta: document.getElementById('atelierProgressMeta'),
    atelierBlueprintMount: document.getElementById('atelierBlueprintMount'),
    atelierNextPartLabel: document.getElementById('atelierNextPartLabel'),
    atelierNextPartPct: document.getElementById('atelierNextPartPct'),
    atelierBarFill: document.getElementById('atelierBarFill'),
    atelierPartsGrid: document.getElementById('atelierPartsGrid'),
    atelierDesignNotice: document.getElementById('atelierDesignNotice'),
    btnAssemblePart: document.getElementById('btnAssemblePart'),
    atelierStoryFeedback: document.getElementById('atelierStoryFeedback'),
    atelierCaliberList: document.getElementById('atelierCaliberList'),
    reflectionAtelierReward: document.getElementById('reflectionAtelierReward'),
    stageStatusStrip: document.getElementById('stageStatusStrip'),
    activeStateLabel: document.getElementById('activeStateLabel'),
    frontSubjectTag: document.getElementById('frontSubjectTag'),
    activeSubjectBadge: document.getElementById('activeSubjectBadge'),
    activeModeBadge: document.getElementById('activeModeBadge'),
    crownModeBadge: document.getElementById('crownModeBadge'),
    wakeLockBadge: document.getElementById('wakeLockBadge'),
    mannerBadge: document.getElementById('mannerBadge'),
    topbarMannerSwitch: document.getElementById('topbarMannerSwitch'),
    topbarStandbySwitch: document.getElementById('topbarStandbySwitch'),
    chkStandbyMode: document.getElementById('chkStandbyMode'),
    topbarDeskClockSwitch: document.getElementById('topbarDeskClockSwitch'),
    chkDeskClockMode: document.getElementById('chkDeskClockMode'),
    standbyHud: document.getElementById('standbyHud'),
    btnStandbyToggle: document.getElementById('btnStandbyToggle'),
    btnStandbyMusic: document.getElementById('btnStandbyMusic'),
    standbyMusicPill: document.getElementById('standbyMusicPill'),
    satelliteMount: document.getElementById('satelliteMount'),
    watchDesignBadge: document.getElementById('watchDesignBadge'),
    modeDrumChassis: document.getElementById('modeDrumChassis'),
    modeDrumViewport: document.getElementById('modeDrumViewport'),
    modeDrumStage: document.getElementById('modeDrumStage'),
    phaseBadgeRow: document.getElementById('phaseBadgeRow'),
    phaseBadge: document.getElementById('phaseBadge'),
    digitalReadout: document.getElementById('digitalReadout'),
    pomoCycleMeta: document.getElementById('pomoCycleMeta'),
    pomoMetaFocus: document.getElementById('pomoMetaFocus'),
    pomoMetaBreak: document.getElementById('pomoMetaBreak'),
    btnQuickTime: document.getElementById('btnQuickTime'),
    quickTimeLabel: document.getElementById('quickTimeLabel'),
    remainingGauge: document.getElementById('remainingGauge'),
    remainingGaugeFill: document.getElementById('remainingGaugeFill'),
    statusLine: document.getElementById('statusLine'),
    deskTodayMinutes: document.getElementById('deskTodayMinutes'),
    deskTodaySessions: document.getElementById('deskTodaySessions'),
    deskAtelierLabel: document.getElementById('deskAtelierLabel'),
    deskAtelierBarFill: document.getElementById('deskAtelierBarFill'),
    quickTimeSheet: document.getElementById('quickTimeSheet'),
    quickTimeTitle: document.getElementById('quickTimeTitle'),
    qtPickerStage: document.getElementById('qtPickerStage'),
    qtLabelLeft: document.getElementById('qtLabelLeft'),
    qtLabelRight: document.getElementById('qtLabelRight'),
    qtWheelLeft: document.getElementById('qtWheelLeft'),
    qtWheelRight: document.getElementById('qtWheelRight'),
    qtValLeft: document.getElementById('qtValLeft'),
    qtValRight: document.getElementById('qtValRight'),
    qtWheelSep: document.getElementById('qtWheelSep'),
    sheetPresetsPomo: document.getElementById('sheetPresetsPomo'),
    sheetPresetsTimer: document.getElementById('sheetPresetsTimer'),
    subjectSheet: document.getElementById('subjectSheet'),
    quickSubjectChips: document.getElementById('quickSubjectChips'),
    btnReflectionPrimary: document.getElementById('btnReflectionPrimary'),
    btnReflectionSaveOnly: document.getElementById('btnReflectionSaveOnly'),
    btnToggle: document.getElementById('btnToggle'),
    btnReset: document.getElementById('btnReset'),
    btnSaveStopwatch: document.getElementById('btnSaveStopwatch'),
    podClockPlate: document.getElementById('podClockPlate'),
    podDiscardRow: document.getElementById('podDiscardRow'),
    btnDiscardSession: document.getElementById('btnDiscardSession'),
    resumeVaultBanner: document.getElementById('resumeVaultBanner'),
    resumeVaultText: document.getElementById('resumeVaultText'),
    backupPromptBanner: document.getElementById('backupPromptBanner'),
    backupPromptText: document.getElementById('backupPromptText'),
    iosInstallBanner: document.getElementById('iosInstallBanner'),
    featureHintBanner: document.getElementById('featureHintBanner'),
    featureHintText: document.getElementById('featureHintText'),
    swUpdateBanner: document.getElementById('swUpdateBanner'),
    cheerNoticeBanner: document.getElementById('cheerNoticeBanner'),
    cheerNoticeTitle: document.getElementById('cheerNoticeTitle'),
    cheerNoticeText: document.getElementById('cheerNoticeText'),
    chkCheersEnabled: document.getElementById('chkCheersEnabled'),
    appVersionLabel: document.getElementById('appVersionLabel'),
    reflectionCheerBox: document.getElementById('reflectionCheerBox'),
    reflectionCheerTitle: document.getElementById('reflectionCheerTitle'),
    reflectionCheerText: document.getElementById('reflectionCheerText'),
    cheerComposeModal: document.getElementById('cheerComposeModal'),
    cheerComposeForm: document.getElementById('cheerComposeForm'),
    cheerComposeInput: document.getElementById('cheerComposeInput'),
    cheerComposeError: document.getElementById('cheerComposeError'),
    cheerComposeCount: document.getElementById('cheerComposeCount'),
    btnCheerSubmitExternal: document.getElementById('btnCheerSubmitExternal'),
    stopwatchReviewModal: document.getElementById('stopwatchReviewModal'),
    stopwatchReviewForm: document.getElementById('stopwatchReviewForm'),
    stopwatchReviewMinutes: document.getElementById('stopwatchReviewMinutes'),
    onboardingOverlay: document.getElementById('onboardingOverlay'),
    prologueOverlay: document.getElementById('prologueOverlay'),
    prologueStage: document.getElementById('prologueStage'),
    prologueCardText: document.getElementById('prologueCardText'),
    prologueDots: document.getElementById('prologueDots'),
    btnPrologueNext: document.getElementById('btnPrologueNext'),
    epilogueOverlay: document.getElementById('epilogueOverlay'),
    timeConfigCard: document.getElementById('timeConfigCard'),
    timeConfigTitle: document.getElementById('timeConfigTitle'),
    roundIndicator: document.getElementById('roundIndicator'),
    pomodoroPresetsRow: document.getElementById('pomodoroPresetsRow'),
    fineTuneRow: document.getElementById('fineTuneRow'),
    pomodoroOptionsRow: document.getElementById('pomodoroOptionsRow'),
    configMinutesDisplay: document.getElementById('configMinutesDisplay'),
    chkAutoBreak: document.getElementById('chkAutoBreak'),
    subjectChips: document.getElementById('subjectChips'),
    addSubjectForm: document.getElementById('addSubjectForm'),
    newSubjectInput: document.getElementById('newSubjectInput'),
    chkMannerMode: document.getElementById('chkMannerMode'),
    chkHourlyChime: document.getElementById('chkHourlyChime'),
    musicUrlForm: document.getElementById('musicUrlForm'),
    musicUrlInput: document.getElementById('musicUrlInput'),
    musicTitleInput: document.getElementById('musicTitleInput'),
    musicPresetChips: document.getElementById('musicPresetChips'),
    chkMusicAutoSync: document.getElementById('chkMusicAutoSync'),
    musicPlayerDock: document.getElementById('musicPlayerDock'),
    musicLiveDot: document.getElementById('musicLiveDot'),
    musicNowTitle: document.getElementById('musicNowTitle'),
    musicTypeBadge: document.getElementById('musicTypeBadge'),
    btnMusicPlayPause: document.getElementById('btnMusicPlayPause'),
    btnMusicToggleDetail: document.getElementById('btnMusicToggleDetail'),
    btnMusicMute: document.getElementById('btnMusicMute'),
    sliderMusicVol: document.getElementById('sliderMusicVol'),
    valMusicVol: document.getElementById('valMusicVol'),
    btnMusicToggleFrame: document.getElementById('btnMusicToggleFrame'),
    musicDetailDrawer: document.getElementById('musicDetailDrawer'),
    dockPresetChips: document.getElementById('dockPresetChips'),
    chkDockAutoSync: document.getElementById('chkDockAutoSync'),
    dockUrlForm: document.getElementById('dockUrlForm'),
    dockUrlInput: document.getElementById('dockUrlInput'),
    btnQuickTick: document.getElementById('btnQuickTick'),
    btnQuickRain: document.getElementById('btnQuickRain'),
    btnQuickCafe: document.getElementById('btnQuickCafe'),
    musicFileNotice: document.getElementById('musicFileNotice'),
    musicIframeWrap: document.getElementById('musicIframeWrap'),
    musicIframe: document.getElementById('musicIframe'),
    sliderTick: document.getElementById('sliderTick'),
    sliderRain: document.getElementById('sliderRain'),
    sliderCafe: document.getElementById('sliderCafe'),
    valTick: document.getElementById('valTick'),
    valRain: document.getElementById('valRain'),
    valCafe: document.getElementById('valCafe'),
    statTodayMinutes: document.getElementById('statTodayMinutes'),
    statTodaySessions: document.getElementById('statTodaySessions'),
    heatmapGrid: document.getElementById('heatmapGrid'),
    subjectBars: document.getElementById('subjectBars'),
    recentLogsList: document.getElementById('recentLogsList'),
    importFileInput: document.getElementById('importFileInput'),
    reflectionModal: document.getElementById('reflectionModal'),
    reflectionTitle: document.getElementById('reflectionTitle'),
    reflectionDesc: document.getElementById('reflectionDesc'),
    reflectionForm: document.getElementById('reflectionForm'),
    reflectionInput: document.getElementById('reflectionInput'),
    guideModal: document.getElementById('guideModal'),
    toastBanner: document.getElementById('toastBanner')
  };

  // v1.8: 모든 안내는 화면 위쪽 유리 알약에 한 줄로. 넘치면 글자를 조금씩 줄여 맞춤.
  function fitNoticeOneLine(el) {
    if (!el || el.hidden) return;
    const target = el.querySelector('.gentle-banner-copy, .cheer-banner-body') || el;
    target.style.fontSize = '';
    let size = parseFloat(getComputedStyle(target).fontSize) || 13;
    let guard = 0;
    while (target.scrollWidth > target.clientWidth + 0.5 && size > 10.5 && guard < 12) {
      size -= 0.5; guard += 1;
      target.style.fontSize = size + 'px';
    }
  }
  // v1.8: 종료 알림음 같은 세그먼트 버튼 — 유리 알약이 선택된 칸으로 미끄러져 이동
  function setupGlassSegments() {
    document.querySelectorAll('.segmented-row').forEach(function (row) {
      if (row.querySelector('.seg-glass-slider')) return;
      row.classList.add('is-glass-seg');
      const slider = document.createElement('span');
      slider.className = 'seg-glass-slider';
      slider.setAttribute('aria-hidden', 'true');
      row.insertBefore(slider, row.firstChild);
      const place = function (instant) {
        const act = row.querySelector('.seg-btn.is-active');
        if (!act || !act.offsetWidth) { slider.style.opacity = act ? slider.style.opacity : '0'; return; }
        if (instant) slider.classList.add('is-instant');
        slider.style.opacity = '1';
        slider.style.width = act.offsetWidth + 'px';
        slider.style.height = act.offsetHeight + 'px';
        slider.style.transform = 'translate(' + act.offsetLeft + 'px, ' + act.offsetTop + 'px)';
        if (instant) { void slider.offsetHeight; slider.classList.remove('is-instant'); }
      };
      place(true);
      if (window.MutationObserver) {
        new MutationObserver(function () { place(false); })
          .observe(row, { attributes: true, attributeFilter: ['class'], subtree: true });
      }
      if (window.ResizeObserver) new ResizeObserver(function () { place(true); }).observe(row);
    });
  }

  function setupNoticeStack() {
    if (document.getElementById('noticeStack')) return;
    const stack = document.createElement('div');
    stack.id = 'noticeStack';
    stack.className = 'notice-stack';
    document.body.appendChild(stack);
    const items = [];
    if (dom.toastBanner) items.push(dom.toastBanner);
    document.querySelectorAll('.gentle-banner').forEach(function (el) { items.push(el); });
    items.forEach(function (el) { stack.appendChild(el); });
    if (window.MutationObserver) {
      const mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          const el = m.target.closest ? m.target.closest('.gentle-banner, .toast-banner') : null;
          if (el) requestAnimationFrame(function () { fitNoticeOneLine(el); });
          // 안내 카드가 닫히면 복제본을 남겨 위로 스르륵 사라지게
          if (m.type === 'attributes' && m.attributeName === 'hidden' && m.target === el &&
              el.classList.contains('gentle-banner') && el.hidden && m.oldValue === null) {
            const ghost = el.cloneNode(true);
            ghost.removeAttribute('id');
            ghost.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
            ghost.hidden = false;
            ghost.setAttribute('aria-hidden', 'true');
            ghost.classList.add('is-ghost', 'is-leaving');
            el.parentNode.insertBefore(ghost, el);
            setTimeout(function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }, 560);
          }
        });
      });
      items.forEach(function (el) { mo.observe(el, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true, childList: true, subtree: true, characterData: true }); });
    }
    window.addEventListener('resize', function () { items.forEach(fitNoticeOneLine); });
  }

  let toastLeaveId = null;
  function showToast(message, durationMs) {
    const el = dom.toastBanner;
    if (!el) return;
    const wasShown = !el.hidden && !el.classList.contains('is-leaving');
    if (toastLeaveId) { clearTimeout(toastLeaveId); toastLeaveId = null; }
    el.classList.remove('is-leaving');
    if (wasShown) {
      // 이미 떠 있으면 다시 튀지 않고 글자만 부드럽게 바꿈
      el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap');
      el.textContent = message;
    } else {
      el.textContent = message;
      el.hidden = false;
      el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop');
    }
    fitNoticeOneLine(el);
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = setTimeout(function () {
      el.classList.add('is-leaving');
      toastLeaveId = setTimeout(function () {
        el.hidden = true;
        el.classList.remove('is-leaving', 'is-pop', 'is-swap');
        toastLeaveId = null;
      }, 520);
    }, durationMs || 2600);
  }

  function formatMinutesKo(totalMins) {
    const mins = Math.max(0, Math.round(totalMins));
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
    }
    return `${mins}분`;
  }

  // A-4: Background Notification & Exact Completion Timeout
  function requestNotificationPermissionOnce() {
    if (notificationPermissionAsked) return;
    notificationPermissionAsked = true;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default' && typeof Notification.requestPermission === 'function') {
      try {
        const res = Notification.requestPermission();
        if (res && typeof res.catch === 'function') res.catch(function () {});
      } catch (e) {}
    }
  }

  function clearCompletionTimer() {
    if (completionTimeoutId) {
      clearTimeout(completionTimeoutId);
      completionTimeoutId = null;
    }
  }

  function scheduleCompletionTimer() {
    clearCompletionTimer();
    const st = timer.state;
    if (!st.running || (st.mode !== 'pomodoro' && st.mode !== 'countdown')) return;
    const nowMs = Date.now();
    const targetMs = timer.getTargetMs();
    const elapsedMs = timer.getElapsedMs(nowMs);
    const remainingMs = Math.max(0, targetMs - elapsedMs);
    if (targetMs <= 0) return;
    completionTimeoutId = setTimeout(function () {
      completionTimeoutId = null;
      const evt = timer.tick(Date.now());
      if (evt) handleCompletionEvent(evt);
    }, remainingMs + 40);
  }

  function sendBackgroundNotification(title, body) {
    if (!document.hidden) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const notifOpts = {
      body: body,
      tag: 'casper-timer-complete',
      icon: './icon-192.png',
      silent: Boolean(prefs.mannerMode)
    };
    const fallbackNotify = function () {
      try {
        const notif = new Notification(title, notifOpts);
        notif.onclick = function () {
          try { window.focus(); } catch (e) {}
          notif.close();
        };
      } catch (e) {}
    };
    if (swRegistration && typeof swRegistration.showNotification === 'function') {
      try {
        const p = swRegistration.showNotification(title, notifOpts);
        if (p && typeof p.catch === 'function') p.catch(fallbackNotify);
        return;
      } catch (e) {}
    }
    if ('serviceWorker' in navigator && typeof navigator.serviceWorker.getRegistration === 'function') {
      try {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg && typeof reg.showNotification === 'function') {
            swRegistration = reg;
            return reg.showNotification(title, notifOpts);
          }
          fallbackNotify();
        }).catch(fallbackNotify);
        return;
      } catch (e) {}
    }
    fallbackNotify();
  }

  // Phase 1-3: Active session persistence
  function persistActiveSession() {
    if (!window.ChronoStorage || typeof window.ChronoStorage.saveActiveSession !== 'function') return;
    const st = timer.state;
    if (st.mode === 'clock') {
      window.ChronoStorage.clearActiveSession();
      return;
    }
    window.ChronoStorage.saveActiveSession(timer.serialize(Date.now()));
  }

  // Phase 1-4: Reusable backup export & storage safety prompts
  function downloadBackupFile() {
    const blob = new Blob([window.ChronoStorage.exportBackupJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast('백업 파일을 저장했어요');
  }

  function afterSessionRecorded() {
    if (!window.ChronoStorage || typeof window.ChronoStorage.loadSafetyMeta !== 'function') return;
    const safety = window.ChronoStorage.loadSafetyMeta();
    let changed = false;

    // 1-4a: Request persistent storage once after first session
    if (!safety.storagePersistRequested) {
      safety.storagePersistRequested = true;
      changed = true;
      if (navigator.storage && typeof navigator.storage.persist === 'function') {
        try {
          const p = navigator.storage.persist();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) {}
      }
    }

    // 1-4b: Gentle one-time backup suggestion at 5h (300m), 20h (1200m), 50h (3000m)
    const lifetimeMins = window.ChronoStorage.getLifetimeMinutes();
    const milestones = [5, 20, 50];
    let hitHour = null;
    for (let i = 0; i < milestones.length; i++) {
      const hrs = milestones[i];
      if (lifetimeMins >= hrs * 60 && !safety.backupPromptedHours.includes(hrs)) {
        hitHour = hrs;
      }
    }
    if (hitHour !== null) {
      for (let i = 0; i < milestones.length; i++) {
        if (milestones[i] <= hitHour && !safety.backupPromptedHours.includes(milestones[i])) {
          safety.backupPromptedHours.push(milestones[i]);
        }
      }
      changed = true;
      if (dom.backupPromptText) {
        dom.backupPromptText.textContent = `누적 ${hitHour}시간이 쌓였습니다. 기기 정리에 대비해 백업 파일을 한 번 저장해 두시겠어요?`;
      }
      if (dom.backupPromptBanner) {
        dom.backupPromptBanner.hidden = false;
      }
    }

    if (changed) {
      window.ChronoStorage.saveSafetyMeta(safety);
    }

    // Phase 3-2: Queue prologue once after the user's first recorded session
    if (!narrativeMeta.prologueSeen) {
      pendingPrologueAfterReflection = true;
    }
  }

  // Phase 3: Narrative, Onboarding, Prologue, Epilogue & One-Time Hints
  function saveNarrativeState() {
    if (window.ChronoStorage && typeof window.ChronoStorage.saveNarrativeMeta === 'function') {
      window.ChronoStorage.saveNarrativeMeta(narrativeMeta);
    }
  }

  function markFeatureHintSeen(hintKey) {
    if (!hintKey || !narrativeMeta.hintsSeen) return;
    if (!narrativeMeta.hintsSeen[hintKey]) {
      narrativeMeta.hintsSeen[hintKey] = true;
      saveNarrativeState();
    }
    if (activeHintKey === hintKey && dom.featureHintBanner) {
      dom.featureHintBanner.hidden = true;
      activeHintKey = null;
    }
  }

  function maybeShowFeatureHint(hintKey) {
    if (!hintKey || !FEATURE_HINTS[hintKey] || !dom.featureHintBanner || !dom.featureHintText) return;
    if (narrativeMeta.hintsSeen && narrativeMeta.hintsSeen[hintKey]) return;
    if (deckFlipped && hintKey === 'deck') {
      markFeatureHintSeen('deck');
      return;
    }
    activeHintKey = hintKey;
    narrativeMeta.hintsSeen[hintKey] = true;
    saveNarrativeState();
    dom.featureHintText.textContent = FEATURE_HINTS[hintKey];
    dom.featureHintBanner.hidden = false;
  }

  function dismissFeatureHint() {
    activeHintKey = null;
    if (dom.featureHintBanner) dom.featureHintBanner.hidden = true;
  }

  function openOnboardingOverlay() {
    if (!dom.onboardingOverlay) return;
    // Do NOT mark onboardingSeen here; save only when user explicitly clicks a button
    dom.onboardingOverlay.hidden = false;
  }

  function closeOnboardingOverlay(markSeen) {
    if (markSeen) {
      narrativeMeta.onboardingSeen = true;
      saveNarrativeState();
    }
    if (dom.onboardingOverlay) dom.onboardingOverlay.hidden = true;
  }

  function startOnboardingFiveMinutes() {
    closeOnboardingOverlay(true);
    clearResetConfirm();
    clearCompletionTimer();
    demoActive = false;
    timer.setMode('countdown');
    timer.setOverrideTargetMinutes(5);
    requestNotificationPermissionOnce();
    window.ChronoAudio.ensureContext();
    timer.start(Date.now());
    persistActiveSession();
    scheduleCompletionTimer();
    syncModeUI();
    syncWakeLock(true);
    enterFocusOnTimerStart();
    syncMusicWithTimer(true);
    syncResumeVaultBanner();
    maybeShowFeatureHint('screenOn');
    showToast('5분만 함께 앉아볼까요', 3400);
  }

  function renderPrologueCard() {
    if (!dom.prologueCardText) return;
    const idx = Math.max(0, Math.min(PROLOGUE_CARDS.length - 1, prologueCardIndex));
    dom.prologueCardText.textContent = PROLOGUE_CARDS[idx];
    if (dom.prologueDots) {
      const dots = dom.prologueDots.querySelectorAll('.prologue-dot');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === idx);
      });
    }
    if (dom.btnPrologueNext) {
      dom.btnPrologueNext.textContent = idx >= PROLOGUE_CARDS.length - 1 ? '시작하기' : '다음';
    }
  }

  function openPrologueModal() {
    if (!dom.prologueOverlay) return;
    prologueCardIndex = 0;
    pendingPrologueAfterReflection = false;
    if (!narrativeMeta.prologueSeen) {
      narrativeMeta.prologueSeen = true;
      saveNarrativeState();
    }
    renderPrologueCard();
    dom.prologueOverlay.hidden = false;
  }

  function closePrologueModal() {
    if (dom.prologueOverlay) dom.prologueOverlay.hidden = true;
    if (!deckFlipped) {
      maybeShowFeatureHint('deck');
    }
  }

  function advancePrologueCard() {
    if (prologueCardIndex < PROLOGUE_CARDS.length - 1) {
      prologueCardIndex += 1;
      renderPrologueCard();
    } else {
      closePrologueModal();
    }
  }

  function openEpilogueOverlay() {
    if (!dom.epilogueOverlay) return;
    if (!narrativeMeta.epilogueSeen) {
      narrativeMeta.epilogueSeen = true;
      saveNarrativeState();
    }
    dom.epilogueOverlay.classList.remove('is-animating');
    dom.epilogueOverlay.hidden = false;
    void dom.epilogueOverlay.offsetWidth;
    dom.epilogueOverlay.classList.add('is-animating');
  }

  function closeEpilogueOverlay() {
    if (!dom.epilogueOverlay) return;
    const wasOpen = !dom.epilogueOverlay.hidden;
    dom.epilogueOverlay.hidden = true;
    dom.epilogueOverlay.classList.remove('is-animating');
    if (wasOpen && canComposeCurrentCheer()) {
      openCheerComposeModal();
    }
  }

  // Finisher One-Line Cheers: silent loader, daily trigger, and composer modal
  function loadCheersPool() {
    if (!window.CasperCheers || typeof fetch !== 'function') return;
    if (location.protocol === 'file:') return; // file:// skips fetch silently without error
    fetch('./cheers.json').then(function (resp) {
      if (!resp || !resp.ok) return null;
      return resp.json();
    }).then(function (data) {
      cheersMessages = window.CasperCheers.parseCheersPayload(data);
    }).catch(function () {
      cheersMessages = [];
    });
  }

  function getTodayLocalDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function canComposeCurrentCheer() {
    if (!window.CasperCheers || !window.CasperAtelier) return false;
    const snap = window.CasperAtelier.computeAtelierSnapshot(
      window.ChronoStorage.loadLogs(),
      atelierState,
      window.ChronoStorage.getLifetimeMinutes()
    );
    return window.CasperCheers.canComposeCheer(snap, Boolean(atelierState.devMode));
  }

  function maybeConsumeDailyCheer() {
    if (!window.CasperCheers) return null;
    const enabled = prefs.cheersEnabled !== false;
    const res = window.CasperCheers.pickDailyCheer(
      cheersMessages,
      narrativeMeta.cheerState,
      getTodayLocalDateKey(),
      enabled
    );
    if (!res || !res.message) return null;
    narrativeMeta.cheerState = res.nextState;
    saveNarrativeState();
    return {
      title: res.title || window.CasperCheers.getCheerTitle(res.message),
      text: res.message.text
    };
  }

  function showCheerBanner(cheer) {
    if (!cheer || !cheer.text || !dom.cheerNoticeBanner || !dom.cheerNoticeText) return;
    if (dom.cheerNoticeTitle) {
      dom.cheerNoticeTitle.textContent = cheer.title || '먼저 완주한 누군가의 한 줄';
    }
    dom.cheerNoticeText.textContent = cheer.text;
    dom.cheerNoticeBanner.hidden = false;
  }

  function syncSwUpdateBanner() {
    if (!dom.swUpdateBanner) return;
    const show = (window.CasperVersion && typeof window.CasperVersion.shouldShowUpdateBanner === 'function')
      ? window.CasperVersion.shouldShowUpdateBanner(Boolean(waitingServiceWorker), Boolean(timer.state.running))
      : (Boolean(waitingServiceWorker) && !timer.state.running);
    dom.swUpdateBanner.hidden = !show;
  }

  function dismissCheerBanner() {
    if (dom.cheerNoticeBanner) dom.cheerNoticeBanner.hidden = true;
  }

  function maybeShowReturningCheer() {
    if (!window.CasperCheers) return;
    const logs = window.ChronoStorage.loadLogs();
    if (window.CasperCheers.isReturningAfterDays(logs, Date.now(), 2)) {
      const cheerText = maybeConsumeDailyCheer();
      if (cheerText) showCheerBanner(cheerText);
    }
  }

  function syncCheerComposeCounter() {
    if (!dom.cheerComposeInput || !dom.cheerComposeCount) return;
    const len = dom.cheerComposeInput.value.length;
    const maxLen = (window.CasperCheers && window.CasperCheers.MAX_CHEER_LENGTH) || 60;
    dom.cheerComposeCount.textContent = `${len} / ${maxLen}`;
  }

  function setCheerComposeError(msg) {
    if (!dom.cheerComposeError) return;
    if (msg) {
      dom.cheerComposeError.textContent = msg;
      dom.cheerComposeError.hidden = false;
    } else {
      dom.cheerComposeError.textContent = '';
      dom.cheerComposeError.hidden = true;
    }
  }

  function openCheerComposeModal() {
    if (!dom.cheerComposeModal || !canComposeCurrentCheer()) return;
    if (dom.cheerComposeInput) {
      dom.cheerComposeInput.value = narrativeMeta.myCheer || '';
    }
    setCheerComposeError('');
    syncCheerComposeCounter();
    if (dom.btnCheerSubmitExternal) {
      const hasUrl = Boolean(window.CasperCheers && String(window.CasperCheers.CHEERS_SUBMIT_URL || '').trim());
      dom.btnCheerSubmitExternal.hidden = !hasUrl;
    }
    dom.cheerComposeModal.hidden = false;
  }

  function closeCheerComposeModal() {
    if (dom.cheerComposeModal) dom.cheerComposeModal.hidden = true;
    setCheerComposeError('');
  }

  function maybeShowIosInstallBanner() {
    if (!dom.iosInstallBanner || !window.ChronoStorage || typeof window.ChronoStorage.loadSafetyMeta !== 'function') return;
    const safety = window.ChronoStorage.loadSafetyMeta();
    if (safety.iosInstallPrompted) return;
    const ua = navigator.userAgent || '';
    const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = Boolean(window.navigator.standalone) || Boolean(
      window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
    );
    if (isIos && !isStandalone) {
      dom.iosInstallBanner.hidden = false;
    }
  }

  function syncResumeVaultBanner() {
    if (!dom.resumeVaultBanner || !window.ChronoStorage || typeof window.ChronoStorage.loadResumeVault !== 'function') return;
    const vault = window.ChronoStorage.loadResumeVault(Date.now());
    const hasActiveRun = timer.state.running || timer.getElapsedMs(Date.now()) > 0;
    if (!vault || hasActiveRun) {
      dom.resumeVaultBanner.hidden = true;
      return;
    }
    if (dom.resumeVaultText) {
      dom.resumeVaultText.textContent = `[${vault.subject || prefs.selectedSubject}] 남은 ${formatMinutesKo(vault.remainingMinutes)}`;
    }
    dom.resumeVaultBanner.hidden = false;
  }

  function openStopwatchReviewModal() {
    if (!dom.stopwatchReviewModal) return;
    if (dom.stopwatchReviewMinutes) dom.stopwatchReviewMinutes.value = '60';
    dom.stopwatchReviewModal.hidden = false;
  }

  function closeStopwatchReviewModal() {
    if (dom.stopwatchReviewModal) dom.stopwatchReviewModal.hidden = true;
  }

  // Phase 1-2: Non-punitive archive ("여기까지 보관") + 30-min resume vault
  function canArchiveCurrentMode() {
    const st = timer.state;
    return (st.mode === 'pomodoro' && st.phase === 'focus') || st.mode === 'countdown' || st.mode === 'stopwatch';
  }

  function clearResetConfirm() {
    resetConfirmArmed = false;
    if (resetConfirmTimerId) {
      clearTimeout(resetConfirmTimerId);
      resetConfirmTimerId = null;
    }
  }

  function handleProtectedReset(doneToastText, opts) {
    const o = opts || {};
    const now = Date.now();
    const st = timer.state;
    const elapsedMs = timer.getElapsedMs(now);
    const archivable = canArchiveCurrentMode();

    clearResetConfirm();
    clearCompletionTimer();

    if (archivable && elapsedMs >= 60000) {
      const savedMinutes = Math.floor(elapsedMs / 60000);
      const targetMs = timer.getTargetMs();
      const remainingMs = targetMs > 0 ? Math.max(0, targetMs - elapsedMs) : 0;

      const saved = window.ChronoStorage.addLog({
        subject: prefs.selectedSubject,
        mode: 'partial',
        minutes: savedMinutes,
        memo: '',
        endedAt: now
      });

      if ((st.mode === 'pomodoro' && st.phase === 'focus') || st.mode === 'countdown') {
        if (remainingMs >= 60000 && typeof window.ChronoStorage.saveResumeVault === 'function') {
          window.ChronoStorage.saveResumeVault({
            mode: st.mode,
            phase: st.phase,
            remainingMinutes: Math.max(1, Math.ceil(remainingMs / 60000)),
            subject: prefs.selectedSubject,
            round: st.round,
            savedMinutes: savedMinutes,
            savedAtMs: now
          });
        }
      }

      timer.reset();
      persistActiveSession();
      syncWakeLock(false);
      syncMusicWithTimer(false);
      syncControlLabels();
      syncTimerConfigUI();
      renderLogsAndStats();
      afterSessionRecorded();
      syncResumeVaultBanner();

      const msg = `${formatMinutesKo(savedMinutes)}이 금고에 보관되었습니다.`;
      showToast(msg, 3400);
      openReflectionModal(saved, `${formatMinutesKo(savedMinutes)}이 금고에 보관되었습니다`, {
        canStartBreak: false,
        isPartial: true
      });
      return true;
    }

    timer.reset();
    persistActiveSession();
    syncWakeLock(false);
    syncMusicWithTimer(false);
    syncControlLabels();
    syncTimerConfigUI();
    syncResumeVaultBanner();
    if (!o.silent) {
      showToast(elapsedMs > 0 && archivable
        ? '1분 미만 진행 시간은 기록 없이 정리했습니다'
        : (doneToastText || '타이머를 정리했습니다'));
    }
    return true;
  }

  function discardCurrentSession() {
    clearResetConfirm();
    clearCompletionTimer();
    timer.reset();
    persistActiveSession();
    syncWakeLock(false);
    syncMusicWithTimer(false);
    syncControlLabels();
    syncTimerConfigUI();
    syncResumeVaultBanner();
    showToast('기록하지 않고 타이머를 비웠습니다');
  }

  function resumeFromVault() {
    if (!window.ChronoStorage || typeof window.ChronoStorage.loadResumeVault !== 'function') return;
    const vault = window.ChronoStorage.loadResumeVault(Date.now());
    if (!vault) {
      syncResumeVaultBanner();
      showToast('이어서 하기 시간(30분)이 지났어요');
      return;
    }
    window.ChronoStorage.clearResumeVault();
    clearCompletionTimer();
    demoActive = false;

    const nextMode = vault.mode === 'countdown' ? 'countdown' : 'pomodoro';
    const remMins = window.TimerCore.clamp(Number(vault.remainingMinutes) || 1, 1, 720);
    timer.setMode(nextMode);
    if (nextMode === 'pomodoro') {
      timer.state.phase = 'focus';
      timer.state.round = window.TimerCore.clamp(Number(vault.round) || 1, 1, 12);
    }
    timer.setOverrideTargetMinutes(remMins);
    requestNotificationPermissionOnce();
    window.ChronoAudio.ensureContext();
    timer.start(Date.now());
    persistActiveSession();
    scheduleCompletionTimer();
    syncModeUI();
    syncWakeLock(true);
    enterFocusOnTimerStart();
    syncMusicWithTimer(true);
    syncResumeVaultBanner();
    maybeShowFeatureHint('screenOn');
    maybeShowReturningCheer();
    showToast(`남은 ${formatMinutesKo(vault.remainingMinutes)} 이어서 시작`, 3000);
  }

  // Protected Mode Switch (blocks while running; archives paused progress via same vault flow)
  function trySwitchMode(nextMode, drumDir) {
    if (timer.state.running) {
      showToast('일시정지 후 모드를 바꾸세요');
      return false;
    }
    if (nextMode !== timer.state.mode && timer.getElapsedMs(Date.now()) > 0) {
      handleProtectedReset('', { silent: true });
    }
    clearResetConfirm();
    clearCompletionTimer();
    demoActive = false;
    timer.setMode(nextMode);
    persistActiveSession();
    syncWakeLock(false);
    syncModeUI(drumDir);
    syncResumeVaultBanner();
    if (nextMode === 'pomodoro' || nextMode === 'countdown') {
      maybeShowFeatureHint('crown');
    }
    return true;
  }

  // Unified Timer Start/Pause Toggle
  function toggleTimerRun() {
    if (timer.state.mode === 'clock') return;
    if (demoActive) {
      demoActive = false;
    }
    if (satellite && satellite.isCrownPulled()) {
      satellite.setCrownPulled(false, true);
    }
    clearResetConfirm();
    const willStart = !timer.state.running;
    if (willStart && timer.state.mode === 'countdown' && timer.getTargetMs() <= 0) {
      showToast('시간을 설정해 주세요', 1800);
      openQuickTimeSheet();
      return;
    }
    if (willStart) {
      requestNotificationPermissionOnce();
      closeQuickTimeSheet();
      closeSubjectSheet();
    }
    window.ChronoAudio.ensureContext();
    timer.toggle(Date.now());
    persistActiveSession();
    if (timer.state.running) {
      scheduleCompletionTimer();
      maybeShowFeatureHint('screenOn');
      maybeShowReturningCheer();
    } else {
      clearCompletionTimer();
    }
    syncWakeLock(timer.state.running);
    if (willStart && timer.state.running) enterFocusOnTimerStart();
    if (!willStart && !timer.state.running && document.body.classList.contains('is-standby')) {
      toggleStandby();
    }
    syncMusicWithTimer(timer.state.running);
    syncWatchHint();
    syncControlLabels();
    syncTimerConfigUI();
    syncResumeVaultBanner();
  }

  // B-2 & B-4: Front Quick Time Sheet & Quick Subject Picker
  function openQuickTimeSheet() {
    if (timer.state.mode !== 'pomodoro' && timer.state.mode !== 'countdown') return;
    if (timer.state.running) {
      showToast('일시정지 후 시간을 변경할 수 있습니다');
      return;
    }
    syncTimerConfigUI();
    if (dom.quickTimeSheet) dom.quickTimeSheet.hidden = false;
    if (dom.btnQuickTime) dom.btnQuickTime.setAttribute('aria-expanded', 'true');
  }

  function closeQuickTimeSheet() {
    if (dom.quickTimeSheet) dom.quickTimeSheet.hidden = true;
    if (dom.btnQuickTime) dom.btnQuickTime.setAttribute('aria-expanded', 'false');
  }

  // v1.8.4: Liquid Glass Drum Wheel Picker helpers
  function padQt(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function wrapQtVal(val, min, max) {
    const span = max - min + 1;
    return min + ((((val - min) % span) + span) % span);
  }

  function renderQtWheelCol(colEl, prev, curr, next, meta) {
    if (!colEl) return;
    const prevEl = colEl.querySelector('.is-prev');
    const currEl = colEl.querySelector('.is-curr');
    const nextEl = colEl.querySelector('.is-next');
    if (prevEl) prevEl.textContent = padQt(prev);
    if (currEl) currEl.textContent = padQt(curr);
    if (nextEl) nextEl.textContent = padQt(next);
    if (meta) {
      colEl.setAttribute('aria-label', meta.label);
      colEl.setAttribute('aria-valuemin', String(meta.min));
      colEl.setAttribute('aria-valuemax', String(meta.max));
      colEl.setAttribute('aria-valuenow', String(curr));
      colEl.setAttribute('aria-valuetext', meta.text);
    }
  }

  function syncQuickTimeWheelUI() {
    if (!dom.qtPickerStage) return;
    const st = timer.state;
    const isPomo = st.mode === 'pomodoro';
    const isCountdown = st.mode === 'countdown';
    if (!isPomo && !isCountdown) return;

    dom.qtPickerStage.setAttribute('data-mode', st.mode);
    if (dom.quickTimeTitle) {
      dom.quickTimeTitle.textContent = isPomo ? '포모도로 시간 설정' : '타이머 시간 설정';
    }
    if (dom.sheetPresetsPomo) dom.sheetPresetsPomo.hidden = !isPomo;
    if (dom.sheetPresetsTimer) dom.sheetPresetsTimer.hidden = !isCountdown;

    if (isPomo) {
      if (dom.qtLabelLeft) dom.qtLabelLeft.textContent = '집중 (분)';
      if (dom.qtLabelRight) dom.qtLabelRight.textContent = '휴식 (분)';
      if (dom.qtWheelSep) dom.qtWheelSep.textContent = '/';
      const f = st.focusMinutes;
      const b = st.breakMinutes;
      renderQtWheelCol(
        dom.qtWheelLeft,
        wrapQtVal(f - 1, 1, 720), f, wrapQtVal(f + 1, 1, 720),
        { label: '집중 시간(분)', min: 1, max: 720, text: `${f}분` }
      );
      renderQtWheelCol(
        dom.qtWheelRight,
        wrapQtVal(b - 1, 1, 180), b, wrapQtVal(b + 1, 1, 180),
        { label: '휴식 시간(분)', min: 1, max: 180, text: `${b}분` }
      );
      if (dom.sheetPresetsPomo) {
        dom.sheetPresetsPomo.querySelectorAll('.qt-preset-pill').forEach(function (btn) {
          const pf = Number(btn.getAttribute('data-focus'));
          const pb = Number(btn.getAttribute('data-break'));
          const active = f === pf && b === pb;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });
      }
    } else {
      if (dom.qtLabelLeft) dom.qtLabelLeft.textContent = '시간';
      if (dom.qtLabelRight) dom.qtLabelRight.textContent = '분';
      if (dom.qtWheelSep) dom.qtWheelSep.textContent = ':';
      const total = st.countdownMinutes;
      const h = Math.floor(total / 60);
      const m = total % 60;
      renderQtWheelCol(
        dom.qtWheelLeft,
        wrapQtVal(h - 1, 0, 12), h, wrapQtVal(h + 1, 0, 12),
        { label: '시간', min: 0, max: 12, text: `${h}시간` }
      );
      const mPrev = h === 12 ? 59 : wrapQtVal(m - 1, 0, 59);
      const mNext = h === 12 ? 1 : wrapQtVal(m + 1, 0, 59);
      renderQtWheelCol(
        dom.qtWheelRight,
        mPrev, m, mNext,
        { label: '분', min: 0, max: 59, text: `${m}분` }
      );
      if (dom.sheetPresetsTimer) {
        dom.sheetPresetsTimer.querySelectorAll('.qt-preset-pill').forEach(function (btn) {
          const pm = Number(btn.getAttribute('data-minutes'));
          const active = total === pm;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });
      }
    }
  }

  function stepQuickTimeWheel(side, delta) {
    if (!delta || timer.state.running) return;
    const st = timer.state;
    if (st.mode === 'pomodoro') {
      if (side === 'left') {
        const nextFocus = wrapQtVal(st.focusMinutes + delta, 1, 720);
        timer.setPomodoroPreset(nextFocus, st.breakMinutes);
      } else {
        const nextBreak = wrapQtVal(st.breakMinutes + delta, 1, 180);
        timer.setPomodoroPreset(st.focusMinutes, nextBreak);
      }
    } else if (st.mode === 'countdown') {
      let h = Math.floor(st.countdownMinutes / 60);
      let m = st.countdownMinutes % 60;
      if (side === 'left') {
        h = wrapQtVal(h + delta, 0, 12);
        if (h === 12) m = 0;
      } else {
        if (h === 12) {
          if (delta > 0) {
            h = 0;
            m = wrapQtVal(delta, 0, 59);
          } else {
            h = 11;
            m = wrapQtVal(60 + delta, 0, 59);
          }
        } else {
          m = wrapQtVal(m + delta, 0, 59);
        }
      }
      timer.setCountdownMinutes(h * 60 + m);
    } else {
      return;
    }
    clearResetConfirm();
    window.ChronoAudio.playCrownRatchet();
    persistTimerMinutes();
    persistActiveSession();
    syncTimerConfigUI();
    syncControlLabels();
  }

  function bindQuickTimeWheels() {
    const wheels = [
      { el: dom.qtWheelLeft, side: 'left' },
      { el: dom.qtWheelRight, side: 'right' }
    ];
    wheels.forEach(function (w) {
      if (!w.el) return;
      let wheelAcc = 0;
      let wheelResetTimer = 0;
      let dragActive = false;
      let dragMoved = false;
      let dragLastY = 0;
      let dragPointerId = null;

      w.el.addEventListener('wheel', function (e) {
        e.preventDefault();
        wheelAcc += e.deltaY;
        clearTimeout(wheelResetTimer);
        wheelResetTimer = setTimeout(function () { wheelAcc = 0; }, 160);
        const threshold = 28;
        while (Math.abs(wheelAcc) >= threshold) {
          const dir = wheelAcc > 0 ? 1 : -1;
          wheelAcc -= dir * threshold;
          stepQuickTimeWheel(w.side, dir);
        }
      }, { passive: false });

      w.el.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        dragActive = true;
        dragMoved = false;
        dragLastY = e.clientY;
        dragPointerId = e.pointerId;
      });

      w.el.addEventListener('pointermove', function (e) {
        if (!dragActive || e.pointerId !== dragPointerId) return;
        const dy = dragLastY - e.clientY;
        if (!dragMoved && Math.abs(dy) >= 8) {
          dragMoved = true;
          try { w.el.setPointerCapture(e.pointerId); } catch (_) {}
        }
        if (dragMoved && Math.abs(dy) >= 26) {
          const steps = Math.trunc(dy / 26);
          if (steps !== 0) {
            dragLastY -= steps * 26;
            stepQuickTimeWheel(w.side, steps);
          }
        }
      });

      function endDrag(e) {
        if (!dragActive) return;
        if (dragPointerId !== null && w.el.hasPointerCapture && w.el.hasPointerCapture(dragPointerId)) {
          try { w.el.releasePointerCapture(dragPointerId); } catch (_) {}
        }
        const wasMoved = dragMoved;
        dragActive = false;
        dragPointerId = null;
        if (wasMoved) {
          w.el.dataset.qtSuppressClick = '1';
          setTimeout(function () { delete w.el.dataset.qtSuppressClick; }, 60);
        }
      }

      w.el.addEventListener('pointerup', endDrag);
      w.el.addEventListener('pointercancel', endDrag);

      w.el.addEventListener('click', function (e) {
        if (w.el.dataset.qtSuppressClick === '1') return;
        const btn = e.target.closest('[data-qt-step]');
        if (!btn) return;
        const delta = Number(btn.getAttribute('data-delta')) || 0;
        if (delta) stepQuickTimeWheel(w.side, delta);
      });

      w.el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') { e.preventDefault(); stepQuickTimeWheel(w.side, -1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); stepQuickTimeWheel(w.side, 1); }
        else if (e.key === 'PageUp') { e.preventDefault(); stepQuickTimeWheel(w.side, -5); }
        else if (e.key === 'PageDown') { e.preventDefault(); stepQuickTimeWheel(w.side, 5); }
      });
    });
  }

  // v1.7.3: subject picker drops down right under the tag instead of opening a sheet
  let subjectDropTimer = 0;
  // v1.7.3: one glass pill slides between subjects (follows the finger or mouse, glides to the pick)
  let subjectSlideDrag = false;
  let subjectSuppressClick = false;
  function moveSubjectSlider(chip, instant) {
    const box = dom.quickSubjectChips;
    const slider = box && box.querySelector('.subject-slider');
    if (!slider) return;
    if (!chip) { slider.style.opacity = '0'; return; }
    if (instant) slider.classList.add('is-instant');
    slider.style.opacity = '1';
    slider.style.height = chip.offsetHeight + 'px';
    slider.style.transform = 'translateY(' + chip.offsetTop + 'px)';
    if (instant) { void slider.offsetHeight; slider.classList.remove('is-instant'); }
  }
  // v1.8: 설정의 과목 칩도 유리 알약이 부드럽게 미끄러져 이동
  function moveBackSubjectSlider(chip, instant) {
    const box = dom.subjectChips;
    const slider = box && box.querySelector('.back-subject-slider');
    if (!slider) return;
    if (!chip || !chip.offsetWidth) { slider.style.opacity = chip ? slider.style.opacity : '0'; return; }
    if (instant) slider.classList.add('is-instant');
    slider.style.opacity = '1';
    slider.style.width = chip.offsetWidth + 'px';
    slider.style.height = chip.offsetHeight + 'px';
    slider.style.transform = 'translate(' + chip.offsetLeft + 'px, ' + chip.offsetTop + 'px)';
    if (instant) { void slider.offsetHeight; slider.classList.remove('is-instant'); }
  }
  function bindBackSubjectSlider() {
    const box = dom.subjectChips;
    if (!box || box.dataset.sliderBound) return;
    box.dataset.sliderBound = '1';
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        moveBackSubjectSlider(box.querySelector('.subject-chip.is-active'), true);
      }).observe(box);
    }
  }
  function selectSubjectBack(sub, chip) {
    if (!sub || !dom.subjectChips) return;
    const changed = prefs.selectedSubject !== sub;
    dom.subjectChips.querySelectorAll('.subject-chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
    moveBackSubjectSlider(chip, false);
    prefs.selectedSubject = sub;
    window.ChronoStorage.savePrefs(prefs);
    if (changed && window.ChronoAudio && window.ChronoAudio.playCrownRatchet) window.ChronoAudio.playCrownRatchet();
    clearTimeout(selectSubjectBack.t);
    selectSubjectBack.t = setTimeout(renderSubjects, 340);
  }
  function subjectChipAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const chip = el && el.closest ? el.closest('.subject-drop-chips .subject-chip') : null;
    return chip && dom.quickSubjectChips && dom.quickSubjectChips.contains(chip) ? chip : null;
  }
  function selectSubjectQuick(sub, chip) {
    if (!sub) return;
    const box = dom.quickSubjectChips;
    if (box) {
      box.querySelectorAll('.subject-chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      moveSubjectSlider(chip, false);
    }
    const changed = prefs.selectedSubject !== sub;
    prefs.selectedSubject = sub;
    window.ChronoStorage.savePrefs(prefs);
    if (changed) window.ChronoAudio.playCrownRatchet();
    clearTimeout(subjectDropTimer);
    subjectDropTimer = setTimeout(function () {
      closeSubjectSheet();
      renderSubjects();
    }, 260);
  }
  function bindSubjectSlider() {
    const box = dom.quickSubjectChips;
    if (!box || box.dataset.sliderBound) return;
    box.dataset.sliderBound = '1';
    box.addEventListener('pointerdown', function (e) {
      const chip = subjectChipAt(e.clientX, e.clientY);
      if (!chip) return;
      subjectSlideDrag = true;
      moveSubjectSlider(chip, false);
    });
    box.addEventListener('pointermove', function (e) {
      if (!subjectSlideDrag && e.pointerType !== 'mouse') return;
      const chip = subjectChipAt(e.clientX, e.clientY);
      if (chip) moveSubjectSlider(chip, false);
      if (subjectSlideDrag && e.pointerType !== 'mouse') e.preventDefault();
    });
    box.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' && !subjectSlideDrag) moveSubjectSlider(box.querySelector('.subject-chip.is-active'), false);
    });
    const finish = function (e) {
      if (!subjectSlideDrag) return;
      subjectSlideDrag = false;
      const chip = subjectChipAt(e.clientX, e.clientY);
      if (chip) {
        subjectSuppressClick = true;
        setTimeout(function () { subjectSuppressClick = false; }, 400);
        selectSubjectQuick(chip.getAttribute('data-subject'), chip);
      } else {
        moveSubjectSlider(box.querySelector('.subject-chip.is-active'), false);
      }
    };
    document.addEventListener('pointerup', finish);
    document.addEventListener('pointercancel', function () { subjectSlideDrag = false; moveSubjectSlider(box.querySelector('.subject-chip.is-active'), false); });
    box.addEventListener('click', function (e) {
      if (subjectSuppressClick) { e.stopPropagation(); e.preventDefault(); subjectSuppressClick = false; }
    }, true);
  }
  function openSubjectSheet() {
    if (!dom.subjectSheet) return;
    if (!dom.subjectSheet.hidden && dom.subjectSheet.classList.contains('is-open')) { closeSubjectSheet(); return; }
    renderSubjects();
    bindSubjectSlider();
    clearTimeout(subjectDropTimer);
    dom.subjectSheet.hidden = false;
    void dom.subjectSheet.offsetHeight;
    moveSubjectSlider(dom.quickSubjectChips && dom.quickSubjectChips.querySelector('.subject-chip.is-active'), true);
    dom.subjectSheet.classList.add('is-open');
    if (dom.frontSubjectTag) dom.frontSubjectTag.setAttribute('aria-expanded', 'true');
  }

  function closeSubjectSheet() {
    if (!dom.subjectSheet) return;
    dom.subjectSheet.classList.remove('is-open');
    if (dom.frontSubjectTag) dom.frontSubjectTag.setAttribute('aria-expanded', 'false');
    clearTimeout(subjectDropTimer);
    subjectDropTimer = setTimeout(function () {
      if (!dom.subjectSheet.classList.contains('is-open')) dom.subjectSheet.hidden = true;
    }, 260);
  }

  function isAnyModalOpen() {
    return Boolean(
      (dom.onboardingOverlay && !dom.onboardingOverlay.hidden) ||
      (dom.prologueOverlay && !dom.prologueOverlay.hidden) ||
      (dom.epilogueOverlay && !dom.epilogueOverlay.hidden) ||
      (dom.cheerComposeModal && !dom.cheerComposeModal.hidden) ||
      (dom.guideModal && !dom.guideModal.hidden) ||
      (dom.reflectionModal && !dom.reflectionModal.hidden) ||
      (dom.stopwatchReviewModal && !dom.stopwatchReviewModal.hidden) ||
      (dom.quickTimeSheet && !dom.quickTimeSheet.hidden)
    );
  }

  function applySteelTheme() {
    document.documentElement.setAttribute('data-theme', 'steel');
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', '#080B0F');
    }
  }

  function applyMannerMode(enabled, persist) {
    const on = Boolean(enabled);
    prefs.mannerMode = on;
    window.ChronoAudio.updateSettings({ mannerMode: on });
    if (activeMusic && dom.musicIframe && window.ChronoMusic) {
      window.ChronoMusic.sendPlayerCommand(dom.musicIframe, (on || musicMuted) ? 'mute' : 'unMute');
    }
    syncMusicControlsUI();
    if (dom.chkMannerMode) dom.chkMannerMode.checked = on;
    if (dom.mannerBadge) dom.mannerBadge.hidden = !on;
    if (dom.topbarMannerSwitch) {
      dom.topbarMannerSwitch.classList.toggle('is-active', on);
    }
    if (persist) {
      window.ChronoStorage.savePrefs(prefs);
      showToast(
        on
          ? '무음 모드 ON'
          : '무음 모드 OFF'
      );
    }
  }

  // YouTube Music Unified Console Helpers
  function getAllMusicItems() {
    const curated = (window.ChronoMusic && window.ChronoMusic.CURATED_PRESETS) ? window.ChronoMusic.CURATED_PRESETS : [];
    const custom = Array.isArray(prefs.musicBookmarks) ? prefs.musicBookmarks : [];
    return curated.concat(custom);
  }

  function buildMusicChipsHtml(includeDelete) {
    const items = getAllMusicItems();
    return items.map(function (item) {
      const isAct = activeMusic && activeMusic.id === item.id;
      const safeId = escapeHtml(item.id);
      const safeTitle = escapeHtml(item.title);
      const delHtml = (!includeDelete || item.curated)
        ? ''
        : `<button type="button" class="music-chip-del" data-action="delete-music-bookmark" data-music-id="${safeId}" aria-label="북마크 삭제">×</button>`;
      return [
        `<span class="music-chip-wrap${isAct ? ' is-active' : ''}">`,
        `  <button type="button" class="music-chip-btn" data-action="play-music-preset" data-music-id="${safeId}">${safeTitle}</button>`,
        delHtml,
        '</span>'
      ].join('');
    }).join('');
  }

  function renderMusicPresets() {
    if (dom.musicPresetChips) {
      dom.musicPresetChips.innerHTML = buildMusicChipsHtml(true);
    }
    if (dom.dockPresetChips) {
      dom.dockPresetChips.innerHTML = buildMusicChipsHtml(false);
    }
  }

  let musicDockLeaveTimerId = null;
  let musicDrawerLeaveTimerId = null;

  function showMusicDock() {
    if (!dom.musicPlayerDock) return;
    if (musicDockLeaveTimerId) {
      clearTimeout(musicDockLeaveTimerId);
      musicDockLeaveTimerId = null;
    }
    dom.musicPlayerDock.style.maxHeight = '';
    dom.musicPlayerDock.style.borderWidth = '';
    dom.musicPlayerDock.classList.remove('is-leaving');
    dom.musicPlayerDock.hidden = false;
  }

  function hideMusicDock(immediate) {
    if (!dom.musicPlayerDock) return;
    if (musicDockLeaveTimerId) {
      clearTimeout(musicDockLeaveTimerId);
      musicDockLeaveTimerId = null;
    }
    if (dom.musicPlayerDock.hidden) {
      dom.musicPlayerDock.classList.remove('is-leaving');
      dom.musicPlayerDock.style.maxHeight = '';
      dom.musicPlayerDock.style.borderWidth = '';
      return;
    }
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (immediate || reduced) {
      dom.musicPlayerDock.classList.remove('is-leaving');
      dom.musicPlayerDock.style.maxHeight = '';
      dom.musicPlayerDock.style.borderWidth = '';
      dom.musicPlayerDock.hidden = true;
      syncMusicControlsUI();
      return;
    }
    const isFixed = window.getComputedStyle(dom.musicPlayerDock).position === 'fixed';
    if (!isFixed) {
      dom.musicPlayerDock.style.maxHeight = dom.musicPlayerDock.scrollHeight + 'px';
    }
    dom.musicPlayerDock.classList.remove('is-leaving');
    void dom.musicPlayerDock.offsetWidth;
    dom.musicPlayerDock.classList.add('is-leaving');
    if (!isFixed) {
      dom.musicPlayerDock.style.maxHeight = '0px';
      dom.musicPlayerDock.style.borderWidth = '0px';
    }
    musicDockLeaveTimerId = setTimeout(function () {
      musicDockLeaveTimerId = null;
      if (dom.musicPlayerDock) {
        dom.musicPlayerDock.hidden = true;
        dom.musicPlayerDock.classList.remove('is-leaving');
        dom.musicPlayerDock.style.maxHeight = '';
        dom.musicPlayerDock.style.borderWidth = '';
      }
      if (dom.musicDetailDrawer) {
        dom.musicDetailDrawer.hidden = true;
        dom.musicDetailDrawer.classList.remove('is-leaving');
      }
      syncMusicControlsUI();
    }, 360);
  }

  function setMusicDetailOpen(open, opts) {
    musicDetailOpen = Boolean(open);
    const immediate = Boolean(opts && opts.immediate);
    if (dom.musicDetailDrawer) {
      if (musicDrawerLeaveTimerId) {
        clearTimeout(musicDrawerLeaveTimerId);
        musicDrawerLeaveTimerId = null;
      }
      if (musicDetailOpen) {
        dom.musicDetailDrawer.classList.remove('is-leaving');
        dom.musicDetailDrawer.hidden = false;
      } else if (!dom.musicDetailDrawer.hidden) {
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (immediate || reduced) {
          dom.musicDetailDrawer.classList.remove('is-leaving');
          dom.musicDetailDrawer.hidden = true;
        } else {
          dom.musicDetailDrawer.classList.remove('is-leaving');
          void dom.musicDetailDrawer.offsetWidth;
          dom.musicDetailDrawer.classList.add('is-leaving');
          musicDrawerLeaveTimerId = setTimeout(function () {
            musicDrawerLeaveTimerId = null;
            if (dom.musicDetailDrawer && !musicDetailOpen) {
              dom.musicDetailDrawer.hidden = true;
              dom.musicDetailDrawer.classList.remove('is-leaving');
            }
          }, 340);
        }
      }
    }
    if (dom.musicPlayerDock) dom.musicPlayerDock.classList.toggle('is-detail-open', musicDetailOpen);
    if (dom.btnMusicToggleDetail) {
      dom.btnMusicToggleDetail.classList.toggle('is-active', musicDetailOpen);
      dom.btnMusicToggleDetail.setAttribute('aria-expanded', String(musicDetailOpen));
      dom.btnMusicToggleDetail.textContent = '목록';
    }
  }

  function syncMusicControlsUI() {
    const inStandby = document.body.classList.contains('is-standby');
    const dockVisible = Boolean(dom.musicPlayerDock && !dom.musicPlayerDock.hidden && !dom.musicPlayerDock.classList.contains('is-leaving'));
    const effectivelyMuted = Boolean(musicMuted || prefs.mannerMode || Number(prefs.musicVolume) === 0);

    document.body.classList.toggle('has-standby-music-open', inStandby && dockVisible);
    if (dom.standbyMusicPill) {
      // v1.7.3: 상단 '음악' 버튼과 기능이 같아 좌하단 필은 쓰지 않음
      dom.standbyMusicPill.hidden = true;
    }
    if (dom.musicLiveDot) {
      dom.musicLiveDot.classList.toggle('is-playing', Boolean(activeMusic && musicPlaying && !effectivelyMuted));
      dom.musicLiveDot.classList.toggle('is-idle', !activeMusic);
    }
    if (dom.musicNowTitle) {
      const nowTitle = activeMusic ? (activeMusic.trackTitle || activeMusic.title) : '재생할 음악을 선택하세요';
      dom.musicNowTitle.textContent = nowTitle;
      dom.musicNowTitle.title = activeMusic && activeMusic.trackTitle
        ? (activeMusic.trackTitle + (activeMusic.trackAuthor ? ' · ' + activeMusic.trackAuthor : '') + ' — ' + activeMusic.title)
        : nowTitle;
    }
    if (dom.musicTypeBadge) {
      if (!activeMusic) {
        dom.musicTypeBadge.hidden = true;
      } else {
        const isPl = activeMusic.parsed && (activeMusic.parsed.kind === 'playlist' || activeMusic.parsed.embeddableList);
        dom.musicTypeBadge.textContent = isPl ? 'LIST' : 'TRACK';
        dom.musicTypeBadge.hidden = false;
      }
    }
    if (dom.btnMusicPlayPause) {
      dom.btnMusicPlayPause.textContent = (activeMusic && musicPlaying) ? '❚❚' : '▶';
      dom.btnMusicPlayPause.setAttribute('aria-label', (activeMusic && musicPlaying) ? '일시정지' : '재생');
    }
    if (dom.btnMusicMute) {
      dom.btnMusicMute.classList.toggle('is-active', effectivelyMuted);
      dom.btnMusicMute.setAttribute('aria-pressed', String(effectivelyMuted));
      dom.btnMusicMute.textContent = effectivelyMuted ? '음소거됨' : '음소거';
    }
    const vol = Math.max(0, Math.min(100, Number(prefs.musicVolume != null ? prefs.musicVolume : 75)));
    if (dom.sliderMusicVol) dom.sliderMusicVol.value = String(vol);
    if (dom.valMusicVol) dom.valMusicVol.textContent = `${vol}%`;

    if (dom.btnMusicToggleFrame) {
      if (inStandby) {
        dom.btnMusicToggleFrame.textContent = musicStandbyVideoOpen ? '영상 숨김' : '영상 보기';
        dom.btnMusicToggleFrame.classList.toggle('is-active', musicStandbyVideoOpen);
      } else {
        dom.btnMusicToggleFrame.textContent = musicFrameCollapsed ? '펼치기' : '접기';
        dom.btnMusicToggleFrame.classList.toggle('is-active', false);
      }
    }
    if (dom.musicPlayerDock) {
      dom.musicPlayerDock.classList.toggle('is-video-open', musicStandbyVideoOpen);
    }
  }

  function applyMusicVolume(volNum, persist) {
    const vol = Math.max(0, Math.min(100, Math.round(Number(volNum) || 0)));
    prefs.musicVolume = vol;
    if (vol > 0 && musicMuted) {
      musicMuted = false;
    }
    if (activeMusic && dom.musicIframe && window.ChronoMusic) {
      window.ChronoMusic.sendPlayerCommand(dom.musicIframe, 'setVolume', [vol]);
      if (!prefs.mannerMode) {
        window.ChronoMusic.sendPlayerCommand(dom.musicIframe, vol === 0 ? 'mute' : 'unMute');
      }
    }
    syncMusicControlsUI();
    if (persist) {
      window.ChronoStorage.savePrefs(prefs);
    }
  }

  function loadMusicTrack(rawUrl, customTitle, presetId) {
    if (!window.ChronoMusic) return false;
    const parsed = window.ChronoMusic.parseYouTubeUrl(rawUrl);
    if (!parsed) {
      showToast('올바른 YouTube 링크를 넣어 주세요');
      return false;
    }

    const isFileProto = location.protocol === 'file:';
    const title = String(customTitle || '').trim() || (parsed.kind === 'playlist' ? 'YouTube Music 플레이리스트' : 'YouTube Music 트랙');
    const willAutoplay = !prefs.mannerMode && !isFileProto;
    const embedUrl = window.ChronoMusic.buildEmbedUrl(parsed, {
      autoplay: willAutoplay,
      origin: isFileProto ? '' : location.origin
    });

    activeMusic = {
      id: presetId || ('ad-hoc-' + Date.now()),
      title: title,
      url: rawUrl,
      parsed: parsed
    };
    musicPlaying = willAutoplay;

    if (dom.musicFileNotice) dom.musicFileNotice.hidden = !isFileProto;
    showMusicDock();
    if (dom.musicIframe) {
      dom.musicIframe.src = embedUrl;
      startYouTubeTitleWatch();
    }

    renderMusicPresets();
    syncMusicControlsUI();
    showToast(isFileProto ? '로컬 실행 중 · YT↗ 팝업으로 재생' : `[${title}] 불러옴`);
    return true;
  }

  // v1.7.3: show the title of the track YouTube is actually playing (from the embed's infoDelivery messages)
  let ytHandshakeTimer = null;
  function startYouTubeTitleWatch() {
    if (!dom.musicIframe || !window.ChronoMusic || typeof window.ChronoMusic.sendListeningHandshake !== 'function') return;
    if (ytHandshakeTimer) clearInterval(ytHandshakeTimer);
    let tries = 0;
    const ping = function () {
      tries++;
      window.ChronoMusic.sendListeningHandshake(dom.musicIframe);
      if (tries > 20 || (activeMusic && activeMusic.trackTitle)) {
        clearInterval(ytHandshakeTimer);
        ytHandshakeTimer = null;
      }
    };
    dom.musicIframe.addEventListener('load', function onLoad() {
      dom.musicIframe.removeEventListener('load', onLoad);
      ping();
    });
    ytHandshakeTimer = setInterval(ping, 1000);
  }

  window.addEventListener('message', function (ev) {
    if (!activeMusic || !window.ChronoMusic || typeof window.ChronoMusic.parseYouTubeInfoMessage !== 'function') return;
    if (dom.musicIframe && ev.source && ev.source !== dom.musicIframe.contentWindow) return;
    const info = window.ChronoMusic.parseYouTubeInfoMessage(ev.data, ev.origin);
    if (!info || !info.title) return;
    if (info.title !== activeMusic.trackTitle) {
      activeMusic.trackTitle = info.title;
      activeMusic.trackAuthor = info.author || '';
      syncMusicControlsUI();
    }
  });

  function unloadMusicTrack() {
    activeMusic = null;
    musicPlaying = false;
    musicStandbyVideoOpen = false;
    setMusicDetailOpen(false, { immediate: true });
    if (dom.musicIframe) dom.musicIframe.src = 'about:blank';
    hideMusicDock();
    renderMusicPresets();
    syncMusicControlsUI();
  }

  function toggleMusicPlayPause() {
    if (!activeMusic) {
      const items = getAllMusicItems();
      if (items.length > 0) {
        loadMusicTrack(items[0].url, items[0].title, items[0].id);
      } else {
        setMusicDetailOpen(true);
        showMusicDock();
        syncMusicControlsUI();
      }
      return;
    }
    musicPlaying = !musicPlaying;
    if (dom.musicIframe && window.ChronoMusic) {
      if (musicPlaying && prefs.mannerMode) {
        showToast('독서실 무음 모드를 끄면 음악이 들립니다');
      }
      window.ChronoMusic.sendPlayerCommand(dom.musicIframe, musicPlaying ? 'playVideo' : 'pauseVideo');
    }
    syncMusicControlsUI();
  }

  function stepMusicTrack(delta) {
    if (activeMusic && activeMusic.parsed && (activeMusic.parsed.kind === 'playlist' || activeMusic.parsed.embeddableList)) {
      if (dom.musicIframe && window.ChronoMusic) {
        window.ChronoMusic.sendPlayerCommand(dom.musicIframe, delta > 0 ? 'nextVideo' : 'previousVideo');
        musicPlaying = true;
        syncMusicControlsUI();
        showToast(delta > 0 ? '다음 트랙으로 이동' : '이전 트랙으로 이동');
      }
      return;
    }
    const items = getAllMusicItems();
    if (items.length === 0) return;
    let idx = activeMusic ? items.findIndex(function (it) { return it.id === activeMusic.id; }) : -1;
    idx = idx === -1 ? 0 : (idx + delta + items.length) % items.length;
    const nextItem = items[idx];
    if (dom.musicUrlInput) dom.musicUrlInput.value = nextItem.url;
    loadMusicTrack(nextItem.url, nextItem.title, nextItem.id);
  }

  function syncMusicWithTimer(isRunning) {
    if (!prefs.musicAutoSync || !activeMusic || !dom.musicIframe || !window.ChronoMusic) return;
    if (prefs.mannerMode && isRunning) return;
    musicPlaying = Boolean(isRunning);
    window.ChronoMusic.sendPlayerCommand(dom.musicIframe, isRunning ? 'playVideo' : 'pauseVideo');
    syncMusicControlsUI();
  }

  function setMusicAutoSync(enabled) {
    prefs.musicAutoSync = Boolean(enabled);
    if (dom.chkMusicAutoSync) dom.chkMusicAutoSync.checked = prefs.musicAutoSync;
    if (dom.chkDockAutoSync) dom.chkDockAutoSync.checked = prefs.musicAutoSync;
    window.ChronoStorage.savePrefs(prefs);
  }

  function triggerRockerRebound(btn) {
    btn.classList.remove('is-rebounding');
    void btn.offsetWidth;
    btn.classList.add('is-rebounding');
    btn.addEventListener('animationend', function () {
      btn.classList.remove('is-rebounding');
    }, { once: true });
  }

  function applyAlarmType(type, persist) {
    const valid = ['gong', 'chime', 'silent'].includes(type) ? type : 'gong';
    prefs.alarmType = valid;
    window.ChronoAudio.updateSettings({ alarmType: valid });
    document.querySelectorAll('[data-action="set-alarm"]').forEach(function (btn) {
      const nextActive = btn.getAttribute('data-alarm') === valid;
      const wasActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active', nextActive);
      btn.setAttribute('aria-pressed', String(nextActive));
      if (wasActive && !nextActive) triggerRockerRebound(btn);
    });
    if (persist) {
      window.ChronoStorage.savePrefs(prefs);
    }
  }

  // Screen Wake Lock management
  async function syncWakeLock(shouldKeepAwake) {
    if (!('wakeLock' in navigator)) return;
    try {
      if (shouldKeepAwake && !wakeLockSentinel && !document.hidden) {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        if (dom.wakeLockBadge) dom.wakeLockBadge.hidden = false;
        wakeLockSentinel.addEventListener('release', function () {
          wakeLockSentinel = null;
          if (dom.wakeLockBadge) dom.wakeLockBadge.hidden = true;
        });
      } else if (!shouldKeepAwake && wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
        if (dom.wakeLockBadge) dom.wakeLockBadge.hidden = true;
      }
    } catch (e) {
      // Ignore permission/battery-saver rejection silently
    }
  }

  function syncWatchHint() {
    // Watch hint text was replaced by the rotating 3D mode drum selector;
    // keep this no-op hook so crown/demo callers remain decoupled.
  }

  function syncModeDrum(nextMode, explicitDir) {
    if (!dom.modeDrumStage) return;
    const faces = dom.modeDrumStage.querySelectorAll('.mode-drum-face');
    if (!faces.length) return;

    const prevMode = drumCurrentMode;
    drumCurrentMode = nextMode;
    dom.modeDrumStage.setAttribute('data-active-mode', nextMode);

    if (drumAnimTimerId) {
      clearTimeout(drumAnimTimerId);
      drumAnimTimerId = null;
    }

    const animate = prevMode && prevMode !== nextMode;
    const prevIdx = MODE_ORDER.indexOf(prevMode);
    const nextIdx = MODE_ORDER.indexOf(nextMode);
    const dir = explicitDir || (nextIdx > prevIdx ? 'up' : 'down');

    faces.forEach(function (face) {
      face.classList.remove('is-active', 'is-exiting-up', 'is-exiting-down', 'is-entering-up', 'is-entering-down');
      const fMode = face.getAttribute('data-drum-mode');
      if (!animate) {
        const on = fMode === nextMode;
        face.classList.toggle('is-active', on);
        face.setAttribute('aria-hidden', on ? 'false' : 'true');
      } else {
        face.setAttribute('aria-hidden', fMode === nextMode ? 'false' : 'true');
      }
    });

    if (!animate) return;

    void dom.modeDrumStage.offsetWidth;

    const prevEl = dom.modeDrumStage.querySelector(`.mode-drum-face[data-drum-mode="${prevMode}"]`);
    const nextEl = dom.modeDrumStage.querySelector(`.mode-drum-face[data-drum-mode="${nextMode}"]`);

    if (prevEl) prevEl.classList.add(dir === 'up' ? 'is-exiting-up' : 'is-exiting-down');
    if (nextEl) nextEl.classList.add(dir === 'up' ? 'is-entering-up' : 'is-entering-down');

    if (dom.modeDrumChassis) {
      dom.modeDrumChassis.querySelectorAll('.mode-drum-knurl').forEach(function (knurl) {
        knurl.classList.remove('is-scrolling-up', 'is-scrolling-down');
        void knurl.offsetWidth;
        knurl.classList.add(dir === 'up' ? 'is-scrolling-up' : 'is-scrolling-down');
      });
    }

    drumAnimTimerId = setTimeout(function () {
      drumAnimTimerId = null;
      faces.forEach(function (face) {
        const isCurrent = face.getAttribute('data-drum-mode') === drumCurrentMode;
        face.classList.remove('is-exiting-up', 'is-exiting-down', 'is-entering-up', 'is-entering-down');
        face.classList.toggle('is-active', isCurrent);
        face.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });
      if (dom.modeDrumChassis) {
        dom.modeDrumChassis.querySelectorAll('.mode-drum-knurl').forEach(function (knurl) {
          knurl.classList.remove('is-scrolling-up', 'is-scrolling-down');
        });
      }
    }, 290);
  }

  function stepModeDrum(delta) {
    const idx = MODE_ORDER.indexOf(timer.state.mode);
    const nextIdx = idx === -1 ? 0 : (idx + delta + MODE_ORDER.length) % MODE_ORDER.length;
    const nextMode = MODE_ORDER[nextIdx];
    const dir = delta >= 0 ? 'up' : 'down';
    if (trySwitchMode(nextMode, dir)) {
      window.ChronoAudio.playCrownRatchet();
    }
  }

  function syncLiveStatusStrip() {
    const st = timer.state;
    const crownPos = satellite && typeof satellite.getCrownPosition === 'function'
      ? satellite.getCrownPosition()
      : 0;
    if (dom.crownModeBadge) {
      dom.crownModeBadge.hidden = crownPos === 0;
      dom.crownModeBadge.classList.toggle('is-pos-1', crownPos === 1);
      dom.crownModeBadge.classList.toggle('is-pos-2', crownPos === 2);
      if (crownPos === 1) {
        dom.crownModeBadge.textContent = '용두 1단 · ±1분 설정';
      } else if (crownPos === 2) {
        dom.crownModeBadge.textContent = '용두 2단 · ±5분 설정';
      }
    }
    if (dom.activeSubjectBadge) {
      dom.activeSubjectBadge.textContent = prefs.selectedSubject;
    }
    if (dom.activeModeBadge) {
      dom.activeModeBadge.textContent = MODE_LABELS[st.mode] || st.mode;
    }
    if (!dom.stageStatusStrip || !dom.activeStateLabel) return;

    let label = '대기 중';
    let isRunningCls = false;
    let isBreakCls = false;
    let isPausedCls = false;
    let isDemoCls = false;
    let isClockCls = false;

    if (demoActive) {
      label = '600× 시연 중';
      isDemoCls = true;
    } else if (st.mode === 'clock') {
      label = '실시간 시계';
      isClockCls = true;
    } else if (st.running) {
      isRunningCls = true;
      if (st.mode === 'stopwatch') {
        label = '측정 중';
      } else if (st.mode === 'pomodoro' && st.phase === 'break') {
        label = '휴식 진행 중';
        isBreakCls = true;
      } else {
        label = '집중 진행 중';
      }
    } else if (st.accumulatedMs > 0) {
      label = '일시정지';
      isPausedCls = true;
    }

    dom.activeStateLabel.textContent = label;
    dom.stageStatusStrip.classList.toggle('is-running', isRunningCls);
    dom.stageStatusStrip.classList.toggle('is-break', isBreakCls);
    dom.stageStatusStrip.classList.toggle('is-paused', isPausedCls);
    dom.stageStatusStrip.classList.toggle('is-demo', isDemoCls);
    dom.stageStatusStrip.classList.toggle('is-clock', isClockCls);
  }

  function toggleDemoMode() {
    demoActive = !demoActive;
    if (demoActive) {
      if (satellite && satellite.isCrownPulled()) {
        satellite.setCrownPulled(false, true);
      }
      demoEpochMs = Date.now();
      showToast('600× 시연 시작 · 더블 클릭으로 종료');
    } else {
      showToast('600× 시연을 종료했습니다');
    }
    syncWatchHint();
    syncLiveStatusStrip();
    syncMotivationLine();
  }

  function openGuideModal() {
    if (dom.guideModal) dom.guideModal.hidden = false;
  }

  function closeGuideModal() {
    if (dom.guideModal) dom.guideModal.hidden = true;
  }

  // Dynamic Watch Caliber Mount (NO.1 PRO Satellite ↔ NO.2 JUMP Turret)
  let satellite = null;
  const watchCallbacks = {
    onCrownPullChange: function (pos) {
      if (pos > 0) {
        if (demoActive) {
          if (satellite) satellite.setCrownPosition(0, true);
          showToast('시연 모드에서는 용두 인출이 비활성화됩니다');
          return;
        }
        if (timer.state.running) {
          if (satellite) satellite.setCrownPosition(0, true);
          showToast('일시정지 후 용두로 조절하세요');
          return;
        }
        if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
          if (satellite) satellite.setCrownPosition(0, true);
          showToast('포모도로·타이머에서 용두로 설정해요');
          return;
        }
        window.ChronoAudio.playCrownPull(true);
        markFeatureHintSeen('crown');
        if (pos === 1) {
          showToast('용두 1단 · ±1분');
        } else {
          showToast('용두 2단 · ±5분');
        }
      } else {
        window.ChronoAudio.playCrownPull(false);
        showToast('용두 0단 복귀 — 잠금 상태');
      }
      syncWatchHint();
      syncLiveStatusStrip();
    },
    onCrownLockedAttempt: function () {
      const now = performance.now();
      if (now - lastLockedCrownToastMs < 1400) return;
      lastLockedCrownToastMs = now;
      if (demoActive) {
        showToast('시연 모드에서는 용두 조절이 비활성화됩니다');
      } else if (timer.state.running) {
        showToast('일시정지 후 용두로 조절하세요');
      } else if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
        showToast('포모도로·타이머에서 용두로 설정해요');
      } else {
        showToast('용두를 눌러 뽑은 뒤 돌려요');
      }
    },
    onCrownStep: function (deltaMinutes) {
      if (demoActive) {
        showToast('시연 모드에서는 용두 조절이 비활성화됩니다');
        return;
      }
      if (timer.state.running) {
        showToast('일시정지 후 용두로 조절하세요');
        return;
      }
      const changed = timer.adjustMinutes(deltaMinutes);
      if (changed) {
        window.ChronoAudio.playCrownRatchet();
        persistTimerMinutes();
        syncTimerConfigUI();
      } else if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
        showToast('포모도로·타이머에서 용두로 설정해요');
      }
    },
    onDialClick: function () {
      if (document.body.classList.contains('is-standby') && timer.state.mode !== 'clock') {
        toggleTimerRun();
        showToast(timer.state.running ? '타이머 시작' : '타이머 일시정지', 1400);
      }
    },
    onDialDoubleClick: function () {
      toggleDemoMode();
    }
  };

  const WATCH_ENGINES = {
    'cal-a': 'AlgebraWatchEngine',
    'cal-b': 'JumpWatchEngine',
    'cal-c': 'CycloidWatchEngine',
    'cal-d': 'SatelliteEngine',
    'cal-e': 'SatelliteEngine',
    'cal-f': 'SatelliteEngine',
    'cal-g': 'GeometryWatchEngine',
    'cal-h': 'SatelliteEngine',
    'cal-i': 'SatelliteEngine',
    'cal-j': 'SatelliteEngine'
  };

  const CALIBER_META = {
    'cal-a': {
      title: 'NO.1 ALGEBRA',
      homage: 'CASPER · GOLDEN RATIO MOONPHASE'
    },
    'cal-b': {
      title: 'NO.2 BINARY',
      homage: 'CASPER · 0/1 JUMPING HOUR'
    },
    'cal-c': {
      title: 'NO.3 CYCLOID',
      homage: 'CASPER · DOUBLE RETROGRADE'
    },
    'cal-d': {
      title: 'NO.4 DELTA (설계 중)',
      homage: 'CASPER · SLIDE RULE CHRONOGRAPH'
    },
    'cal-e': {
      title: 'NO.5 ELLIPSE',
      homage: 'CASPER · SATELLITE ORBIT'
    },
    'cal-f': {
      title: 'NO.6 FRACTAL (설계 중)',
      homage: 'CASPER · SKELETON RECURSIVE'
    },
    'cal-g': {
      title: 'NO.7 GEOMETRY',
      homage: 'CASPER · BAUHAUS TANGENTE'
    },
    'cal-h': {
      title: 'NO.8 HARMONIC (설계 중)',
      homage: 'CASPER · OPEN-HEART BALANCE'
    },
    'cal-i': {
      title: 'NO.9 INTEGRAL (설계 중)',
      homage: 'CASPER · LINEAR CUMULATIVE GAUGE'
    },
    'cal-j': {
      title: 'NO.10 JOULE (설계 중)',
      homage: 'CASPER · POWER RESERVE DYNAMOMETER'
    }
  };

  function mountActiveCaliber(caliberId, finishId) {
    const requestedId = Object.prototype.hasOwnProperty.call(WATCH_ENGINES, caliberId) ? caliberId : 'cal-b';
    const engineKey = WATCH_ENGINES[requestedId] || 'SatelliteEngine';
    const engineObj = (window[engineKey] && typeof window[engineKey].mount === 'function')
      ? window[engineKey]
      : window.SatelliteEngine;
    const targetId = (window[engineKey] && typeof window[engineKey].mount === 'function') ? requestedId : 'cal-e';

    if (mountedCaliberId !== targetId && engineObj) {
      mountedCaliberId = targetId;
      if (typeof syncCasebackCaliber === 'function') syncCasebackCaliber(targetId);
      satellite = engineObj.mount(dom.satelliteMount, watchCallbacks);
      const meta = CALIBER_META[targetId] || CALIBER_META['cal-e'];
      if (dom.brandTitle) {
        dom.brandTitle.textContent = meta.title;
      }
      if (dom.brandHomage) {
        dom.brandHomage.textContent = meta.homage;
      }
      lastTitleText = '';
    }
    if (satellite && typeof satellite.setFinish === 'function') {
      satellite.setFinish(finishId || 'steel');
    }
    if (satellite && typeof satellite.setModelLabel === 'function') {
      const calDef = window.CasperAtelier && typeof window.CasperAtelier.getCaliberDef === 'function'
        ? window.CasperAtelier.getCaliberDef(targetId)
        : null;
      satellite.setModelLabel(calDef ? calDef.name : 'NO.5 ELLIPSE');
    }
    if (dom.watchDesignBadge) {
      const inDesign = Boolean(
        window.CasperAtelier && typeof window.CasperAtelier.isCaliberInDesign === 'function' && window.CasperAtelier.isCaliberInDesign(targetId)
      );
      dom.watchDesignBadge.hidden = !inDesign;
    }
    syncLiveStatusStrip();
  }

  mountActiveCaliber('cal-b', 'steel');

  function persistTimerMinutes() {
    prefs.focusMinutes = timer.state.focusMinutes;
    prefs.breakMinutes = timer.state.breakMinutes;
    prefs.countdownMinutes = timer.state.countdownMinutes;
    window.ChronoStorage.savePrefs(prefs);
  }

  function triggerManualGong() {
    if (prefs.mannerMode) {
      if (satellite) satellite.triggerVisualAlarm();
      showToast('무음 모드 · 빛으로 알림 테스트');
      return;
    }
    if (timer.state.mode === 'clock') {
      window.ChronoAudio.playMinuteRepeaterDemo(new Date());
      showToast('5270P 미닛 리피터 타종 중');
    } else {
      window.ChronoAudio.strikeClassicGong('low', 0);
      window.ChronoAudio.strikeClassicGong('high', 0.24);
      showToast('5270P 클래식 공 타종');
    }
  }

  function syncModeUI(drumDir) {
    const mode = timer.state.mode;
    const isClock = mode === 'clock';
    if (!isClock) {
      lastNonClockMode = mode;
    }
    if (dom.chkDeskClockMode) dom.chkDeskClockMode.checked = isClock;
    if (dom.topbarDeskClockSwitch) dom.topbarDeskClockSwitch.classList.toggle('is-active', isClock);
    syncModeDrum(isClock ? lastNonClockMode : mode, drumDir);
    document.querySelectorAll('[data-action="set-mode"]').forEach(function (btn) {
      const nextActive = btn.getAttribute('data-mode') === mode;
      const wasActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active', nextActive);
      btn.setAttribute('aria-pressed', nextActive ? 'true' : 'false');
      if (wasActive && !nextActive) triggerRockerRebound(btn);
    });

    const isStopwatch = mode === 'stopwatch';
    const isPomodoro = mode === 'pomodoro';

    if ((isClock || isStopwatch) && satellite && satellite.isCrownPulled()) {
      satellite.setCrownPulled(false, true);
    }

    if (dom.timeConfigCard) dom.timeConfigCard.hidden = isClock || isStopwatch;
    if (dom.pomodoroPresetsRow) dom.pomodoroPresetsRow.hidden = !isPomodoro;
    if (dom.pomodoroOptionsRow) dom.pomodoroOptionsRow.hidden = !isPomodoro;
    if (dom.roundIndicator) dom.roundIndicator.hidden = !isPomodoro;

    if (dom.timeConfigTitle) {
      dom.timeConfigTitle.textContent = isPomodoro ? '포모도로 구성' : '타이머 목표 시간';
    }

    if (dom.btnToggle) dom.btnToggle.hidden = isClock;
    if (dom.btnReset) dom.btnReset.hidden = isClock;
    if (dom.podClockPlate) dom.podClockPlate.hidden = !isClock;

    syncWatchHint();
    syncTimerConfigUI();
    syncControlLabels();
    syncLiveStatusStrip();
    syncMotivationLine();
  }

  function syncTimerConfigUI() {
    const st = timer.state;
    const isAdjustableMode = st.mode === 'pomodoro' || st.mode === 'countdown';
    const hasOverride = st.overrideTargetMinutes !== null && (st.mode === 'countdown' || (st.mode === 'pomodoro' && st.phase === 'focus'));
    const currentMins = hasOverride
      ? st.overrideTargetMinutes
      : (st.mode === 'pomodoro'
        ? (st.phase === 'break' ? st.breakMinutes : st.focusMinutes)
        : st.countdownMinutes);
    const formattedMins = formatMinutesKo(currentMins);

    if (dom.roundIndicator) {
      const phaseTxt = st.phase === 'break' ? '휴식' : '집중';
      dom.roundIndicator.textContent = `라운드 #${st.round} (${phaseTxt})`;
    }
    if (dom.configMinutesDisplay && isAdjustableMode) {
      dom.configMinutesDisplay.textContent = formattedMins;
    }
    syncQuickTimeWheelUI();
    if (dom.btnQuickTime) {
      dom.btnQuickTime.hidden = false;
      dom.btnQuickTime.classList.toggle('is-mode-hidden', !isAdjustableMode);
      dom.btnQuickTime.disabled = !isAdjustableMode || Boolean(st.running);
      dom.btnQuickTime.classList.toggle('is-disabled', Boolean(st.running));
      dom.btnQuickTime.tabIndex = isAdjustableMode ? 0 : -1;
      dom.btnQuickTime.setAttribute('aria-hidden', String(!isAdjustableMode));
      dom.btnQuickTime.setAttribute('aria-label', st.running
        ? `현재 목표 ${formattedMins} (실행 중 변경 불가)`
        : `목표 시간 ${formattedMins} 빠르게 변경`);
    }
    if (dom.digitalReadout) {
      const canTap = isAdjustableMode && !st.running;
      dom.digitalReadout.classList.toggle('is-tappable', canTap);
      dom.digitalReadout.tabIndex = canTap ? 0 : -1;
      dom.digitalReadout.setAttribute('aria-label', canTap ? `목표 시간 ${formattedMins}, 눌러서 설정` : '남은 시간');
    }
    if (dom.quickTimeLabel && isAdjustableMode) {
      dom.quickTimeLabel.textContent = formattedMins;
    }
    if (dom.pomoCycleMeta) {
      const isPomo = st.mode === 'pomodoro';
      dom.pomoCycleMeta.hidden = false;
      dom.pomoCycleMeta.classList.toggle('is-mode-hidden', !isPomo);
      dom.pomoCycleMeta.setAttribute('aria-hidden', String(!isPomo));
      dom.pomoCycleMeta.tabIndex = isPomo ? 0 : -1;
      dom.pomoCycleMeta.disabled = !isPomo || Boolean(st.running);
      if (isPomo) {
        const focusM = hasOverride ? st.overrideTargetMinutes : st.focusMinutes;
        const breakM = st.breakMinutes;
        if (dom.pomoMetaFocus) {
          dom.pomoMetaFocus.textContent = `집중 ${formatMinutesKo(focusM)}`;
          dom.pomoMetaFocus.classList.toggle('is-current', st.phase !== 'break');
        }
        if (dom.pomoMetaBreak) {
          dom.pomoMetaBreak.textContent = `휴식 ${formatMinutesKo(breakM)}`;
          dom.pomoMetaBreak.classList.toggle('is-current', st.phase === 'break');
        }
        dom.pomoCycleMeta.setAttribute(
          'aria-label',
          `포모도로 집중 ${formatMinutesKo(focusM)}, 휴식 ${formatMinutesKo(breakM)} (눌러서 변경)`
        );
      }
    }
    document.querySelectorAll('[data-action="set-preset"], [data-action="set-preset-quick"]').forEach(function (btn) {
      const f = Number(btn.getAttribute('data-focus'));
      const b = Number(btn.getAttribute('data-break'));
      const nextActive = st.focusMinutes === f && st.breakMinutes === b;
      const wasActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active', nextActive);
      btn.setAttribute('aria-pressed', String(nextActive));
      if (wasActive && !nextActive) triggerRockerRebound(btn);
    });
  }

  function syncControlLabels() {
    const st = timer.state;
    let label = '집중 시작';
    if (st.running) {
      label = '일시정지';
    } else if (st.accumulatedMs > 0) {
      label = '계속하기';
    } else if (st.mode === 'pomodoro' && st.phase === 'break') {
      label = '휴식 시작';
    } else if (st.mode === 'stopwatch') {
      label = '스톱워치 시작';
    } else if (st.mode === 'countdown') {
      label = '타이머 시작';
    }

    if (dom.btnToggle) {
      const ico = st.running
        ? '<svg class="ctrl-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.2"/></svg>'
        : '<svg class="ctrl-ico" viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(-1 0)" d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.3 0-1.7l-10-6.4C8.9 4.3 8 4.8 8 5.6z"/></svg>';
      if (dom.btnToggle.dataset.ico !== String(st.running)) {
        dom.btnToggle.innerHTML = ico;
        dom.btnToggle.dataset.ico = String(st.running);
      }
      dom.btnToggle.setAttribute('aria-label', label);
      dom.btnToggle.title = label;
      dom.btnToggle.classList.add('is-icon');
      dom.btnToggle.classList.toggle('is-running', st.running);
    }
    if (dom.btnStandbyToggle) {
      dom.btnStandbyToggle.hidden = st.mode === 'clock';
      dom.btnStandbyToggle.textContent = st.running ? '일시정지' : '시작';
    }
    const sbPlay = document.getElementById('btnStandbyPlay');
    if (sbPlay) {
      sbPlay.hidden = st.mode === 'clock';
      if (sbPlay.dataset.ico !== String(st.running)) {
        sbPlay.innerHTML = st.running
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5.5" width="3.4" height="13" rx="1.1"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1.1"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(-0.8 0)" d="M8.5 6.1v11.8c0 .75.82 1.2 1.46.8l9.2-5.9c.58-.37.58-1.22 0-1.6l-9.2-5.9c-.64-.4-1.46.05-1.46.8z"/></svg>';
        sbPlay.dataset.ico = String(st.running);
      }
      sbPlay.setAttribute('aria-label', st.running ? '일시정지' : '계속하기');
    }
    const sbMode = document.getElementById('btnStandbyMode');
    if (sbMode) {
      sbMode.hidden = st.mode === 'clock';
      const modeIcons = {
        clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v4.8l3.2 1.8"/></svg>',
        pomodoro: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13.2" r="7.4"/><path d="M12 5.8c0-1.6 1-2.8 2.4-3.3"/><path d="M9.4 6.2c1.4-.9 3.8-.9 5.2 0"/><path d="M12 9.4v3.8l2.6 1.5"/></svg>',
        countdown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 4.5h9.6"/><path d="M7.2 19.5h9.6"/><path d="M8.4 4.5v3.2c0 1.8 1.6 3.1 3.6 4.3-2 1.2-3.6 2.5-3.6 4.3v3.2"/><path d="M15.6 4.5v3.2c0 1.8-1.6 3.1-3.6 4.3 2 1.2 3.6 2.5 3.6 4.3v3.2"/></svg>',
        stopwatch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.8 3.2h4.4"/><path d="M12 3.2v2.4"/><path d="M17.8 7.4l1.3-1.3"/><circle cx="12" cy="13.2" r="7.6"/><path d="M12 13.2l3-3"/></svg>'
      };
      const modeNames = {
        clock: '데스크 시계',
        pomodoro: '포모도로',
        countdown: '타이머',
        stopwatch: '스톱워치'
      };
      if (sbMode.dataset.mode !== st.mode) {
        sbMode.innerHTML = modeIcons[st.mode] || modeIcons.pomodoro;
        sbMode.dataset.mode = st.mode;
      }
      const modeLabel = modeNames[st.mode] || '모드';
      sbMode.setAttribute('aria-label', `모드 변경 (현재: ${modeLabel})`);
      sbMode.title = `모드: ${modeLabel} (눌러서 변경)`;
    }
    if (dom.btnSaveStopwatch) {
      const isSw = st.mode === 'stopwatch';
      const elapsed = timer.getElapsedMs(Date.now());
      dom.btnSaveStopwatch.hidden = false;
      dom.btnSaveStopwatch.classList.toggle('is-collapsed', !isSw);
      dom.btnSaveStopwatch.setAttribute('aria-hidden', String(!isSw));
      dom.btnSaveStopwatch.tabIndex = isSw ? 0 : -1;
      dom.btnSaveStopwatch.disabled = !(isSw && elapsed >= 10000);
    }
    const elapsedNow = timer.getElapsedMs(Date.now());
    const showArchiveLabel = canArchiveCurrentMode() && elapsedNow > 0;
    if (dom.btnReset) {
      dom.btnReset.textContent = showArchiveLabel ? '여기까지 보관' : '리셋';
      dom.btnReset.classList.toggle('is-archive-ready', showArchiveLabel);
    }
    if (dom.podDiscardRow) {
      dom.podDiscardRow.hidden = !(st.mode !== 'clock' && elapsedNow > 0);
    }
    syncLiveStatusStrip();
    syncSwUpdateBanner();
  }

  function renderSubjects() {
    syncLiveStatusStrip();
    const htmlBack = prefs.subjects.map(function (sub) {
      const isAct = sub === prefs.selectedSubject;
      const safe = escapeHtml(sub);
      return `<button type="button" class="subject-chip${isAct ? ' is-active' : ''}" data-action="select-subject" data-subject="${safe}">${safe}</button>`;
    }).join('');
    if (dom.subjectChips) {
      dom.subjectChips.innerHTML = '<span class="subject-slider back-subject-slider" aria-hidden="true"></span>' + htmlBack;
      moveBackSubjectSlider(dom.subjectChips.querySelector('.subject-chip.is-active'), true);
      bindBackSubjectSlider();
    }
    if (dom.quickSubjectChips) {
      dom.quickSubjectChips.innerHTML = '<span class="subject-slider" aria-hidden="true"></span>' + prefs.subjects.map(function (sub) {
        const isAct = sub === prefs.selectedSubject;
        const safe = escapeHtml(sub);
        return `<button type="button" class="subject-chip${isAct ? ' is-active' : ''}" data-action="select-subject-quick" data-subject="${safe}">${safe}</button>`;
      }).join('');
      moveSubjectSlider(dom.quickSubjectChips.querySelector('.subject-chip.is-active'), true);
    }
  }

  // B-3 & B-5: Front Motivation One-Liner + Desktop Summary (reuses Storage & Atelier snapshots!)
  function syncMotivationLine(precomputedSummary, precomputedSnap) {
    const logs = window.ChronoStorage.loadLogs();
    const summary = precomputedSummary || window.ChronoStorage.getStatsSummary(logs);
    const snap = precomputedSnap || (window.CasperAtelier
      ? window.CasperAtelier.computeAtelierSnapshot(logs, atelierState, window.ChronoStorage.getLifetimeMinutes())
      : null);
    const fmt = (window.CasperAtelier && window.CasperAtelier.formatMinutesShortKo) || formatMinutesKo;
    const todayMins = summary.todayMinutes || 0;

    if (dom.deskTodayMinutes) dom.deskTodayMinutes.textContent = formatMinutesKo(todayMins);
    if (dom.deskTodaySessions) dom.deskTodaySessions.textContent = `${summary.todaySessions || 0}회`;

    let line = '';
    if (demoActive) {
      line = '600× 기계식 고속 시연 중 · 다이얼 더블 클릭 종료';
    } else if (snap) {
      const todayPart = todayMins > 0 ? `오늘 ${formatMinutesKo(todayMins)}` : '첫 세션을 시작해 보세요';
      if (snap.allProjectsComplete) {
        line = `${todayPart} · 공방 전 칼리버 완성`;
      } else if (snap.readyPart) {
        const prefix = todayMins > 0 ? `오늘 ${formatMinutesKo(todayMins)}` : '오늘 0분';
        line = `${prefix} · ${snap.readyPart.name} 획득`;
      } else if (snap.machiningPart) {
        line = `${todayPart} · ${snap.machiningPart.name}까지 ${fmt(snap.machiningPart.remainingMinutes)} 남음`;
      } else {
        line = todayPart;
      }

      if (dom.deskAtelierLabel && dom.deskAtelierBarFill) {
        if (snap.allProjectsComplete) {
          dom.deskAtelierLabel.textContent = '공방 10종 칼리버(NO.1~NO.10) 조립 완료';
          dom.deskAtelierBarFill.style.width = '100%';
        } else {
          // v1.8: 게이지 = 아직 시간이 안 찬 다음 부품까지 남은 시간 (전체 칼리버 순서 기준)
          const parts = [];
          Object.keys(snap.projects || {}).forEach(function (k) {
            const pr = snap.projects[k];
            if (pr && Array.isArray(pr.parts)) pr.parts.forEach(function (pt) { parts.push(pt); });
          });
          const lifeMins = (snap.metrics && Number(snap.metrics.totalMinutes)) || Number(window.ChronoStorage.getLifetimeMinutes()) || 0;
          const target = parts.find(function (pt) { return pt && pt.status !== 'assembled' && pt.cumMinutes > lifeMins; }) || null;
          const remain = target ? Math.max(0, Math.ceil(target.cumMinutes - lifeMins)) : 0;
          if (target && remain > 0) {
            const step = Math.max(1, target.stepMinutes);
            const pct = Math.max(0, Math.min(100, Math.round(((step - Math.min(step, remain)) / step) * 100)));
            dom.deskAtelierLabel.textContent = `${target.name}까지 ${fmt(remain)} 남음`;
            dom.deskAtelierBarFill.style.width = `${pct}%`;
          } else if (snap.readyPart) {
            dom.deskAtelierLabel.textContent = `${snap.readyPart.name} 획득 · 조립 대기`;
            dom.deskAtelierBarFill.style.width = '100%';
          } else if (target) {
            dom.deskAtelierLabel.textContent = `${target.name} 획득 가능`;
            dom.deskAtelierBarFill.style.width = '100%';
          }
        }
      }
    } else {
      line = todayMins > 0 ? `오늘 ${formatMinutesKo(todayMins)} 집중` : '첫 세션을 시작해 보세요';
    }

    if (dom.statusLine) {
      dom.statusLine.textContent = line;
    }
  }

  // v1.8: 스탠바이 시간 아래 = 종 아이콘 · 오전/오후 · 타이머가 끝나는 시각
  let lastEndTimeKey = '';
  function syncStandbyEndTime(snap, nowMs) {
    const box = document.getElementById('standbyEndTime');
    if (!box) return;
    const show = Boolean(snap && snap.isCountdown) && !demoActive && Number(snap.remainingMs) > 0;
    if (!show) {
      if (!box.hidden) { box.hidden = true; lastEndTimeKey = ''; }
      return;
    }
    const end = new Date(nowMs + Number(snap.remainingMs));
    const h24 = end.getHours();
    const ampm = h24 < 12 ? '오전' : '오후';
    const h12 = (h24 % 12) || 12;
    const clock = h12 + ':' + String(end.getMinutes()).padStart(2, '0');
    const key = ampm + clock;
    if (key !== lastEndTimeKey) {
      lastEndTimeKey = key;
      const a = document.getElementById('standbyEndAmPm');
      const c = document.getElementById('standbyEndClock');
      if (a) a.textContent = ampm;
      if (c) c.textContent = clock;
      box.setAttribute('aria-label', '끝나는 시각 ' + ampm + ' ' + clock);
    }
    if (box.hidden) box.hidden = false;
  }

  function syncPhaseBadge(snap) {
    if (!dom.phaseBadge || !snap) return;
    const key = `${demoActive}:${snap.mode}:${snap.phase}:${snap.round}:${snap.running}`;
    if (key === lastPhaseKey) return;
    lastPhaseKey = key;

    let label = '집중 #1';
    let isBreak = false;
    if (demoActive) {
      label = '600× 시연';
    } else if (snap.mode === 'pomodoro') {
      isBreak = snap.phase === 'break';
      label = isBreak ? `휴식 #${snap.round}` : `집중 #${snap.round}`;
    } else if (snap.mode === 'countdown') {
      label = '타이머';
    } else if (snap.mode === 'stopwatch') {
      label = '스톱워치';
    } else if (snap.mode === 'clock') {
      label = '데스크 시계';
    }
    dom.phaseBadge.textContent = label;
    dom.phaseBadge.classList.toggle('is-break', isBreak);
    dom.phaseBadge.classList.toggle('is-running', Boolean(snap.running) && !demoActive);
  }

  function renderLogsAndStats() {
    const logs = window.ChronoStorage.loadLogs();
    const summary = window.ChronoStorage.getStatsSummary(logs);

    if (dom.statTodayMinutes) {
      dom.statTodayMinutes.textContent = formatMinutesKo(summary.todayMinutes);
    }
    if (dom.statTodaySessions) {
      dom.statTodaySessions.textContent = `${summary.todaySessions}회`;
    }

    // 7-day heatmap
    if (dom.heatmapGrid) {
      dom.heatmapGrid.innerHTML = summary.last7.map(function (day) {
        const titleAttr = escapeHtml(`${day.dateKey}: ${day.minutes}분`);
        const numLabel = day.minutes > 0 ? `${day.minutes}` : '';
        return [
          `<div class="heat-cell" title="${titleAttr}">`,
          `  <div class="heat-box lvl-${day.level}">${escapeHtml(numLabel)}</div>`,
          `  <span class="heat-day">${escapeHtml(day.label)}</span>`,
          '</div>'
        ].join('');
      }).join('');
    }

    // Today's subject breakdown bars
    if (dom.subjectBars) {
      if (summary.subjectShares.length === 0) {
        dom.subjectBars.innerHTML = '<div class="empty-note">오늘 완료된 집중 세션이 아직 없습니다.</div>';
      } else {
        dom.subjectBars.innerHTML = summary.subjectShares.map(function (item) {
          return [
            '<div class="sub-bar-item">',
            '  <div class="sub-bar-meta">',
            `    <span>${escapeHtml(item.name)}</span>`,
            `    <span>${escapeHtml(formatMinutesKo(item.minutes))} (${item.pct}%)</span>`,
            '  </div>',
            '  <div class="sub-bar-track">',
            `    <div class="sub-bar-fill" style="width:${Math.max(4, item.pct)}%"></div>`,
            '  </div>',
            '</div>'
          ].join('');
        }).join('');
      }
    }

    // Recent session log list
    if (dom.recentLogsList) {
      if (logs.length === 0) {
        dom.recentLogsList.innerHTML = '<div class="empty-note">타이머를 완주하거나 순공 기록을 저장하면 여기에 차곡차곡 쌓입니다.</div>';
      } else {
        dom.recentLogsList.innerHTML = logs.slice(0, 25).map(function (item) {
          const d = new Date(item.endedAt || Date.now());
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          const modeTxt = MODE_LABELS[item.mode] || item.mode;
          const memoHtml = item.memo
            ? `<div class="log-memo">${escapeHtml(item.memo)}</div>`
            : '';
          return [
            '<div class="log-row">',
            '  <div class="log-main">',
            '    <div class="log-top">',
            `      <span class="log-tag">${escapeHtml(item.subject)}</span>`,
            `      <span>${escapeHtml(formatMinutesKo(item.minutes))}</span>`,
            `      <span class="log-time">${escapeHtml(item.dateKey || '')} ${hh}:${mm} · ${escapeHtml(modeTxt)}</span>`,
            '    </div>',
            memoHtml,
            '  </div>',
            `  <button type="button" class="log-del-btn" data-action="delete-log" data-log-id="${escapeHtml(item.id)}" aria-label="기록 삭제">삭제</button>`,
            '</div>'
          ].join('');
        }).join('');
      }
    }
    renderAtelier();
  }

  function renderAtelier() {
    if (!window.CasperAtelier) return;
    const logs = window.ChronoStorage.loadLogs();
    const snap = window.CasperAtelier.computeAtelierSnapshot(logs, atelierState, window.ChronoStorage.getLifetimeMinutes());
    const fmt = window.CasperAtelier.formatMinutesShortKo;

    // Keep mounted watch in lockstep with unlocked state
    mountActiveCaliber(snap.activeWatch, 'steel');

    if (dom.frontAtelierDot) dom.frontAtelierDot.hidden = true; // v1.7.3: 앞면 설정 버튼의 빨간 점은 표시하지 않음
    if (dom.tabAtelierDot) dom.tabAtelierDot.hidden = !snap.hasActionablePart;
    if (dom.devModeBadge) dom.devModeBadge.hidden = !snap.devMode;
    if (dom.atelierDevStrip) dom.atelierDevStrip.hidden = !snap.devMode;

    const proj = snap.activeProject;
    if (dom.atelierDevStrip) {
      dom.atelierDevStrip.querySelectorAll('.dev-cal-btn').forEach(function (btn) {
        const active = btn.getAttribute('data-caliber') === snap.activeWatch;
        btn.classList.toggle('is-solid', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    if (dom.atelierProjectTitle) {
      dom.atelierProjectTitle.textContent = snap.allProjectsComplete
        ? `전 칼리버 완성 · ${proj.name}`
        : `제작 중 · ${proj.name}`;
    }
    if (dom.atelierProgressMeta) {
      dom.atelierProgressMeta.textContent = `조립 ${proj.assembledCount}/${proj.totalParts} · 누적 ${fmt(snap.metrics.totalMinutes)} / ${fmt(proj.totalMinutes)}`;
    }

    if (dom.atelierBlueprintMount) {
      window.CasperAtelier.renderBlueprintSvg(dom.atelierBlueprintMount, snap);
    }

    if (dom.atelierNextPartLabel && dom.atelierNextPartPct && dom.atelierBarFill) {
      if (snap.allProjectsComplete) {
        dom.atelierNextPartLabel.textContent = '모든 칼리버 조립 완료';
        dom.atelierNextPartPct.textContent = '100%';
        dom.atelierBarFill.style.width = '100%';
      } else if (snap.readyPart) {
        dom.atelierNextPartLabel.textContent = `${snap.readyPart.name} 가공 완료`;
        dom.atelierNextPartPct.textContent = '조립 가능';
        dom.atelierBarFill.style.width = '100%';
      } else if (snap.machiningPart) {
        dom.atelierNextPartLabel.textContent = `${snap.machiningPart.name} 가공 중`;
        dom.atelierNextPartPct.textContent = `${snap.machiningPart.pct}%`;
        dom.atelierBarFill.style.width = `${snap.machiningPart.pct}%`;
      }
    }

    if (dom.atelierPartsGrid) {
      dom.atelierPartsGrid.innerHTML = snap.parts.map(function (p) {
        const badge = p.status === 'assembled'
          ? '완료'
          : (p.status === 'ready' ? '조립 가능' : `${p.pct}%`);
        return [
          `<div class="atelier-part-chip is-${p.status}" title="${escapeHtml(p.desc)} (목표 누적 ${fmt(p.cumMinutes)})">`,
          `  <span class="part-code">${escapeHtml(p.code)}</span>`,
          `  <span class="part-name">${escapeHtml(p.name)}</span>`,
          `  <span class="part-state">${escapeHtml(badge)}</span>`,
          '</div>'
        ].join('');
      }).join('');
    }

    if (dom.atelierDesignNotice) {
      const isProjInDesign = Boolean(
        !snap.allProjectsComplete &&
        window.CasperAtelier &&
        typeof window.CasperAtelier.isCaliberInDesign === 'function' &&
        window.CasperAtelier.isCaliberInDesign(proj.id)
      );
      dom.atelierDesignNotice.hidden = !isProjInDesign;
    }

    if (dom.btnAssemblePart) {
      if (snap.allProjectsComplete) {
        dom.btnAssemblePart.disabled = true;
        dom.btnAssemblePart.classList.remove('is-ready');
        dom.btnAssemblePart.textContent = '공방 10종 칼리버 조립 완료';
      } else if (snap.readyPart) {
        dom.btnAssemblePart.disabled = false;
        dom.btnAssemblePart.classList.add('is-ready');
        dom.btnAssemblePart.textContent = `${snap.readyPart.name} 조립하기`;
      } else if (snap.machiningPart) {
        dom.btnAssemblePart.disabled = true;
        dom.btnAssemblePart.classList.remove('is-ready');
        dom.btnAssemblePart.textContent = `${snap.machiningPart.name}까지 ${fmt(snap.machiningPart.remainingMinutes)} 남음`;
      }
    }

    if (dom.atelierCaliberList) {
      dom.atelierCaliberList.innerHTML = snap.calibers.map(function (c) {
        let stateText = '설계 예정';
        if (c.active) {
          stateText = '장착 중';
        } else if (c.unlocked) {
          stateText = '장착하기';
        } else if (c.playable) {
          if (c.id === 'cal-a') {
            stateText = '미지수 잠금';
          } else {
            stateText = c.isCurrentProject ? `제작 중 ${c.buildPct}%` : `누적 ${fmt(c.totalMinutes)}`;
          }
        }
        const disabledAttr = (!c.unlocked || c.active) ? ' disabled' : '';
        const designTag = c.inDesign ? ' <span class="caliber-design-tag">설계 중</span>' : '';
        const projInfo = snap.projects[c.id];
        const assembledCnt = projInfo ? projInfo.assembledCount : 0;
        const totalPartsCnt = projInfo ? projInfo.totalParts : 6;
        const isExpanded = expandedCodexCaliberId === c.id;

        let storyPanelHtml = '';
        if (isExpanded && projInfo && Array.isArray(projInfo.parts)) {
          const segmentsHtml = projInfo.parts.map(function (part, idx) {
            const revealed = idx < assembledCnt;
            const cls = revealed ? 'story-seg is-revealed' : 'story-seg is-veiled';
            const ariaAttr = revealed ? '' : ' aria-hidden="true"';
            return `<span class="${cls}"${ariaAttr}>${escapeHtml(part.story || '')}</span>`;
          }).join(' ');
          const completeBadge = assembledCnt >= totalPartsCnt
            ? '<span class="caliber-story-complete-tag">서사 완성</span>'
            : `<span>해금 ${assembledCnt}/${totalPartsCnt}</span>`;
          const canCheer = Boolean(c.id === 'cal-a' && window.CasperCheers && window.CasperCheers.canComposeCheer(snap, Boolean(snap.devMode)));
          const myCheerSlotHtml = (canCheer && narrativeMeta.myCheer)
            ? '<div class="caliber-my-cheer"><div class="caliber-my-cheer-label">내가 남긴 한 줄</div><div class="caliber-my-cheer-text" data-my-cheer-slot="1"></div></div>'
            : '';
          const algebraActions = [];
          if (c.id === 'cal-a' && (c.completed || narrativeMeta.epilogueSeen)) {
            algebraActions.push('<button type="button" class="small-btn is-solid" data-action="open-epilogue">에필로그 다시 보기</button>');
          }
          if (canCheer) {
            const cheerBtnLabel = narrativeMeta.myCheer ? '내가 남긴 한 줄 수정' : '다음 사람에게 한 줄 남기기';
            algebraActions.push(`<button type="button" class="small-btn" data-action="open-cheer-compose">${cheerBtnLabel}</button>`);
          }
          const epilogueBtnHtml = algebraActions.length > 0
            ? `<div class="caliber-story-actions">${algebraActions.join('')}</div>`
            : '';
          storyPanelHtml = [
            '<div class="caliber-story-panel">',
            '  <div class="caliber-story-head">',
            `    <span>${escapeHtml(c.name)} 서사</span>`,
            `    ${completeBadge}`,
            '  </div>',
            `  <div class="caliber-story-body">${segmentsHtml}</div>`,
            myCheerSlotHtml,
            epilogueBtnHtml,
            '</div>'
          ].join('');
        }

        return [
          '<div class="caliber-item">',
          `  <div class="caliber-row${c.active ? ' is-equipped' : ''}${c.unlocked ? ' is-unlocked' : ' is-locked'}${c.playable ? ' is-playable' : ' is-concept'}${c.inDesign ? ' is-in-design' : ''}" data-action="toggle-codex-story" data-caliber="${escapeHtml(c.id)}" aria-expanded="${String(isExpanded)}">`,
          '    <div class="caliber-info">',
          `      <span class="caliber-letter-badge${c.active ? ' is-active' : (c.playable ? ' is-playable' : '')}" aria-hidden="true">${escapeHtml(c.num ? 'NO.' + parseInt(c.num, 10) : c.letter)}</span>`,
          `      <div class="caliber-name">${escapeHtml(String(c.name).replace(/^NO\.\s*\d+\s*/i, ''))}${designTag}</div>`,
          `      <div class="caliber-sub">${escapeHtml(c.subtitle)}</div>`,
          '    </div>',
          `    <button type="button" class="small-btn${c.active ? ' is-solid' : ''}" data-action="select-caliber" data-caliber="${escapeHtml(c.id)}"${disabledAttr}>${escapeHtml(stateText)}</button>`,
          '  </div>',
          storyPanelHtml,
          '</div>'
        ].join('');
      }).join('');
      // Inject user's saved one-line cheer strictly via textContent (never innerHTML)
      const myCheerSlot = dom.atelierCaliberList.querySelector('[data-my-cheer-slot="1"]');
      if (myCheerSlot) {
        myCheerSlot.textContent = narrativeMeta.myCheer || '';
      }
    }
    syncMotivationLine(null, snap);
  }

  function openReflectionModal(logEntry, titleText, opts) {
    const o = opts || {};
    activeReflectionLogId = logEntry.id;
    activeReflectionCanStartBreak = Boolean(o.canStartBreak);
    if (dom.reflectionTitle) dom.reflectionTitle.textContent = titleText;
    if (dom.reflectionDesc) {
      dom.reflectionDesc.textContent = o.isPartial
        ? `[${logEntry.subject}] ${formatMinutesKo(logEntry.minutes)}이 금고에 보관되었습니다. 원하시면 1줄 메모를 남겨보세요.`
        : `[${logEntry.subject}] ${formatMinutesKo(logEntry.minutes)} 세션이 저장되었습니다. 1줄 회고 메모를 남겨보세요.`;
    }
    if (dom.btnReflectionPrimary) {
      dom.btnReflectionPrimary.textContent = activeReflectionCanStartBreak
        ? '메모 저장하고 휴식 시작'
        : '메모 저장';
    }
    if (dom.btnReflectionSaveOnly) {
      dom.btnReflectionSaveOnly.hidden = !activeReflectionCanStartBreak;
    }
    if (dom.reflectionAtelierReward && window.CasperAtelier) {
      const snap = window.CasperAtelier.computeAtelierSnapshot(
        window.ChronoStorage.loadLogs(),
        atelierState,
        window.ChronoStorage.getLifetimeMinutes()
      );
      const fmt = window.CasperAtelier.formatMinutesShortKo;
      let rewardHtml = '';
      if (snap.readyPart) {
        rewardHtml = `<strong>+${formatMinutesKo(logEntry.minutes)} 공방 반영</strong> · <span>${escapeHtml(snap.readyPart.name)} 가공 완료 · 공방에서 조립하기</span>`;
      } else if (snap.machiningPart) {
        rewardHtml = `<strong>+${formatMinutesKo(logEntry.minutes)} 공방 반영</strong> · <span>${escapeHtml(snap.machiningPart.name)}까지 ${fmt(snap.machiningPart.remainingMinutes)} 남음</span>`;
      } else if (snap.allProjectsComplete) {
        rewardHtml = `<strong>+${formatMinutesKo(logEntry.minutes)} 기록 완료</strong> · <span>누적 순공 ${fmt(snap.metrics.totalMinutes)} 달성</span>`;
      }
      if (rewardHtml) {
        dom.reflectionAtelierReward.innerHTML = rewardHtml;
        dom.reflectionAtelierReward.hidden = false;
      } else {
        dom.reflectionAtelierReward.hidden = true;
      }
    }
    if (dom.reflectionInput) dom.reflectionInput.value = '';
    if (dom.reflectionCheerBox && dom.reflectionCheerText) {
      if (o.isPartial) {
        const cheer = maybeConsumeDailyCheer();
        if (cheer && cheer.text) {
          if (dom.reflectionCheerTitle) {
            dom.reflectionCheerTitle.textContent = cheer.title || '먼저 완주한 누군가의 한 줄';
          }
          dom.reflectionCheerText.textContent = cheer.text;
          dom.reflectionCheerBox.hidden = false;
        } else {
          dom.reflectionCheerBox.hidden = true;
        }
      } else {
        dom.reflectionCheerBox.hidden = true;
      }
    }
    if (dom.reflectionModal) dom.reflectionModal.hidden = false;
    // B-6: Do NOT auto-focus on touch/mobile devices so keyboard never hides atelier reward text
    const isDesktopFinePointer = Boolean(
      window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
    if (isDesktopFinePointer) {
      setTimeout(function () {
        if (dom.reflectionInput) dom.reflectionInput.focus();
      }, 30);
    }
  }

  function closeReflectionModal() {
    activeReflectionLogId = null;
    activeReflectionCanStartBreak = false;
    if (dom.reflectionModal) dom.reflectionModal.hidden = true;
    if (pendingPrologueAfterReflection) {
      pendingPrologueAfterReflection = false;
      openPrologueModal();
    } else if (!deckFlipped) {
      maybeShowFeatureHint('deck');
    }
  }

  function saveReflectionMemoIfAny() {
    if (!activeReflectionLogId) return false;
    const val = dom.reflectionInput ? dom.reflectionInput.value.trim() : '';
    if (val) {
      window.ChronoStorage.updateLogMemo(activeReflectionLogId, val);
      renderLogsAndStats();
      return true;
    }
    return false;
  }

  function handleCompletionEvent(evt) {
    if (!evt) return;
    clearCompletionTimer();
    clearResetConfirm();
    if (satellite) satellite.triggerVisualAlarm();
    window.ChronoAudio.ensureContext();
    window.ChronoAudio.playSessionCompleteAlarm();

    if (evt.finishedPhase === 'focus' || evt.finishedPhase === 'countdown') {
      const saved = window.ChronoStorage.addLog({
        subject: prefs.selectedSubject,
        mode: evt.mode,
        minutes: evt.minutes,
        memo: '',
        endedAt: evt.endedAtMs
      });
      renderLogsAndStats();
      afterSessionRecorded();
      const canStartBreak = evt.mode === 'pomodoro' && timer.state.phase === 'break' && !timer.state.running;
      openReflectionModal(saved, `${formatMinutesKo(evt.minutes)} 집중을 마쳤습니다`, { canStartBreak: canStartBreak });
      sendBackgroundNotification(
        `CASPER — ${formatMinutesKo(evt.minutes)} 집중 완료`,
        `[${prefs.selectedSubject}] 세션이 기록되었습니다.${canStartBreak ? ' 휴식을 시작할 준비가 되었습니다.' : ''}`
      );
    } else if (evt.finishedPhase === 'break') {
      showToast(`휴식 끝 · 집중 #${evt.nextRound} 준비`);
      sendBackgroundNotification(
        'CASPER — 휴식 완료',
        `집중 라운드 #${evt.nextRound}를 시작할 시간입니다.`
      );
    }

    persistActiveSession();
    if (timer.state.running) {
      scheduleCompletionTimer();
    }
    syncWakeLock(timer.state.running);
    syncMusicWithTimer(timer.state.running);
    syncTimerConfigUI();
    syncControlLabels();
    syncResumeVaultBanner();
  }

  function handleAtelierDevTap() {
    const now = Date.now();
    if (now - lastAtelierTapMs > 2500) {
      atelierTapCount = 0;
    }
    lastAtelierTapMs = now;
    atelierTapCount += 1;
    if (atelierTapCount === 4) {
      showToast(atelierState.devMode ? '한 번 더 누르면 개발자 모드 해제' : '한 번 더 누르면 개발자 모드 켜짐', 1600);
      return;
    }
    if (atelierTapCount >= 5) {
      atelierTapCount = 0;
      atelierState.devMode = !atelierState.devMode;
      atelierState = window.ChronoStorage.saveAtelier(atelierState);
      window.ChronoAudio.playCrownPull(atelierState.devMode);
      renderAtelier();
      showToast(
        atelierState.devMode
          ? '개발자 모드 ON — 모든 시계·마감·기능이 해제되었습니다 (공방 5회 클릭 시 해제)'
          : '개발자 모드 OFF — 실제 순공 진행도로 복귀했습니다',
        3800
      );
    }
  }

  function switchTab(tabName) {
    const map = { timer: 'panelTimer', sound: 'panelSound', log: 'panelLog', atelier: 'panelAtelier' };
    if (!map[tabName]) return;
    if (tabName !== 'atelier') {
      atelierTapCount = 0;
    }
    document.querySelectorAll('[data-action="switch-tab"]').forEach(function (btn) {
      const active = btn.getAttribute('data-tab') === tabName;
      const wasActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
      if (wasActive && !active) triggerRockerRebound(btn);
    });
    Object.keys(map).forEach(function (key) {
      const panel = document.getElementById(map[key]);
      if (!panel) return;
      const active = key === tabName;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    if (tabName === 'log') {
      renderLogsAndStats();
    } else if (tabName === 'atelier') {
      renderAtelier();
    }
  }

  // 1.8.3: on wide screens the watch sits left of the controls, so the caseback has to appear
  // exactly where the watch was (same centre, same case size) instead of jumping to the middle.
  function anchorCasebackToWatch() {
    const art = document.getElementById('casebackArt');
    const flipper = dom.monolithFlipper;
    const svg = document.querySelector('.satellite-mount svg');
    if (!art || !flipper || !svg) return;
    art.classList.remove('is-anchored');
    if (window.innerWidth < 861) return;
    let big = null;
    svg.querySelectorAll('circle').forEach(function (c) {
      const q = c.getBoundingClientRect();
      if (!big || q.width > big.width) big = q;
    });
    const fr = flipper.getBoundingClientRect();
    if (!big || big.width < 40 || !fr.width) return;
    const cx = big.left + big.width / 2 - fr.left;
    if (Math.abs(cx - fr.width / 2) < 40) return;
    const size = big.width / 0.805; // caseback case = 322 of the 400 viewBox
    const cy = big.top + big.height / 2 - fr.top;
    art.style.setProperty('--cb-left', (cx - size / 2).toFixed(1) + 'px');
    art.style.setProperty('--cb-top', (cy - size / 2).toFixed(1) + 'px');
    art.style.setProperty('--cb-size', size.toFixed(1) + 'px');
    art.classList.add('is-anchored');
  }
  window.addEventListener('resize', function () {
    const art = document.getElementById('casebackArt');
    if (art) art.classList.remove('is-anchored');
  });

  function setDeckFlipped(flipped, silent) {
    const next = Boolean(flipped);
    if (next === deckFlipped) return;
    deckFlipped = next;
    if (next) anchorCasebackToWatch();
    if (next) {
      if (!casebackPeekPending) setCasebackPeek(false, 1);
      casebackPeekPending = false;
    }
    if (dom.monolithFlipper) {
      // v1.7.3: on phones the visible face first turns away to 90deg, then the other face turns in,
      // so the watch reads as one continuous 180deg turn.
      const flipper = dom.monolithFlipper;
      const wantFlipped = deckFlipped;
      clearTimeout(deckFlipTimer);
      // v1.8: same motion in portrait and landscape (was phones only)
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && !silent && !flipper.classList.contains('is-flip-out')) {
        flipper.classList.add('is-flip-out');
        deckFlipTimer = setTimeout(function () {
          flipper.classList.remove('is-flip-out');
          flipper.classList.toggle('is-flipped', deckFlipped);
        }, 300);
      } else {
        flipper.classList.remove('is-flip-out');
        flipper.classList.toggle('is-flipped', wantFlipped);
      }
    }
    if (dom.backControlDeck) {
      dom.backControlDeck.setAttribute('aria-hidden', String(!deckFlipped));
    }
    const gearBtn = document.getElementById('btnFlipToBack');
    if (gearBtn) {
      if (deckFlipped) {
        setTimeout(function () { if (deckFlipped) gearBtn.classList.add('is-turning'); }, 0);
      } else {
        // coming back: brass fades to steel again once the front is visible
        gearBtn.classList.add('is-turning');
        setTimeout(function () { if (!deckFlipped) gearBtn.classList.remove('is-turning'); }, 760);
      }
    }
    if (deckFlipped) {
      markFeatureHintSeen('deck');
    }
    if (deckFlipped && satellite && satellite.isCrownPulled()) {
      satellite.setCrownPosition(0, true);
      syncLiveStatusStrip();
    }
    if (!silent) {
      window.ChronoAudio.playCrownRatchet();
    }
  }

  // v1.7.3: smooth standby swap (FLIP) — the watch and time glide to their new spot instead of jumping
  function animateStandbySwap(apply) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = [dom.satelliteMount || document.getElementById('satelliteMount'), document.querySelector('.hero-stage .readout-block')]
      .filter(function (el) { return el && el.getBoundingClientRect; });
    if (reduce || !targets.length) {
      apply();
      return;
    }
    const before = targets.map(function (el) { return el.getBoundingClientRect(); });
    // 1.8.5: the swap class goes on BEFORE the layout changes, so width/padding transitions are off
    // and the "after" rect is the real end position (otherwise the watch glided to a half-grown spot,
    // then grew again = jolt).
    document.body.classList.remove('is-mode-swapping');
    void document.body.offsetWidth;
    document.body.classList.add('is-mode-swapping');
    apply();
    targets.forEach(function (el, i) {
      const a = before[i];
      const b = el.getBoundingClientRect();
      if (!a.width || !b.width) return;
      const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
      const dy = (a.top + a.height / 2) - (b.top + b.height / 2);
      // 1.8.5: only the watch scales; the time text just glides (its width changes with the format)
      const sc = el.classList.contains('readout-block') ? 1 : a.width / b.width;
      el.style.transition = 'none';
      el.style.transformOrigin = 'center center';
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + sc + ')';
    });
    void document.body.offsetWidth;
    requestAnimationFrame(function () {
      targets.forEach(function (el) {
        el.style.transition = 'transform 0.46s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
      });
    });
    setTimeout(function () {
      targets.forEach(function (el) { el.style.transition = ''; el.style.transformOrigin = ''; });
      document.body.classList.remove('is-mode-swapping');
    }, 520);
  }

  // v1.7.3: starting a timer switches to the standby layout.
  // Web: "focus" middle mode (standby UI without fullscreen). Android app: standby (the shell hides system bars).
  function enterFocusOnTimerStart() {
    if (document.body.classList.contains('is-standby')) return;
    toggleStandby({ fullscreen: false, auto: true });
  }

  function toggleStandby(opts) {
    const o = (opts && typeof opts === 'object' && !opts.type) ? opts : {};
    const willEnter = !document.body.classList.contains('is-standby');
    animateStandbySwap(function () { applyStandbyState(willEnter, o); });
  }

  function applyStandbyState(willEnter, o) {
    if (willEnter && deckFlipped) {
      setDeckFlipped(false, true);
    }
    document.body.classList.toggle('is-standby', willEnter);
    if (dom.standbyHud) dom.standbyHud.setAttribute('aria-hidden', String(!willEnter));
    if (willEnter) {
      musicStandbyVideoOpen = false;
      const isDesktopFinePointer = Boolean(
        window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
      );
      document.body.classList.toggle('is-focus-mode', Boolean(o.auto));
      // v1.8: 스탠바이는 스탠바이만 — 브라우저 전체 화면으로 바꾸지 않음 (사용자 요구)
      void isDesktopFinePointer;
      if (o.auto) {
        if (timer.state.mode !== 'clock') showToast('시계를 누르면 일시정지', 3000);
      } else {
        showToast('스탠바이 · 시계를 눌러 시작/정지', 3400);
      }
    } else {
      document.body.classList.remove('is-focus-mode');
      // v1.8: 데스크 시계를 뺀 모든 모드는 스탠바이에서만 작동 — 대기 보드로 돌아오면 멈춤
      if (timer.state.running && timer.state.mode !== 'clock') {
        toggleTimerRun();
      }
      if (!activeMusic && dom.musicPlayerDock) {
        dom.musicPlayerDock.hidden = true;
        setMusicDetailOpen(false);
      }
    }
    syncMusicControlsUI();
  }

  let pendingFullscreenWidths = null;
  let fsAnimCleanupTimer = 0;

  function getFullscreenAnimTargets() {
    if (document.body.classList.contains('is-standby')) {
      return [
        dom.satelliteMount || document.getElementById('satelliteMount'),
        document.querySelector('.hero-stage .readout-block')
      ].filter(function (el) { return el && el.getBoundingClientRect; });
    }
    const scene = document.querySelector('.monolith-scene');
    return scene ? [scene] : [];
  }

  function captureFullscreenWidths() {
    const targets = getFullscreenAnimTargets();
    pendingFullscreenWidths = targets.map(function (el) {
      return el.getBoundingClientRect().width;
    });
  }

  function runFullscreenOrganicGlide(entering) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      pendingFullscreenWidths = null;
      return;
    }
    const targets = getFullscreenAnimTargets();
    if (!targets.length) {
      pendingFullscreenWidths = null;
      return;
    }
    const prevWidths = pendingFullscreenWidths;
    pendingFullscreenWidths = null;

    clearTimeout(fsAnimCleanupTimer);
    document.body.classList.add('is-fullscreen-gliding');
    void document.body.offsetWidth;
    targets.forEach(function (el, i) {
      const afterW = el.getBoundingClientRect().width;
      if (!afterW) return;
      let sc;
      if (prevWidths && prevWidths[i] > 0) {
        sc = prevWidths[i] / afterW;
      } else {
        sc = entering ? 0.88 : 1.12;
      }
      sc = Math.max(0.62, Math.min(1.5, sc));
      if (Math.abs(sc - 1) < 0.015) return;
      el.style.transition = 'none';
      el.style.willChange = 'transform';
      el.style.transformOrigin = 'center center';
      el.style.transform = 'scale(' + sc.toFixed(4) + ')';
    });

    void document.body.offsetWidth;
    requestAnimationFrame(function () {
      targets.forEach(function (el) {
        if (!el.style.transform) return;
        el.style.transition = 'transform 0.56s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = 'scale(1)';
      });
    });

    fsAnimCleanupTimer = setTimeout(function () {
      document.body.classList.remove('is-fullscreen-gliding');
      targets.forEach(function (el) {
        el.style.transition = '';
        el.style.transform = '';
        el.style.transformOrigin = '';
        el.style.willChange = '';
      });
    }, 600);
  }

  function isFullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function syncFullscreenSwitch() {
    const wasActive = document.body.classList.contains('is-fullscreen');
    const active = isFullscreenActive();
    document.body.classList.toggle('is-fullscreen', active);
    if (dom.chkStandbyMode) dom.chkStandbyMode.checked = active;
    if (dom.topbarStandbySwitch) dom.topbarStandbySwitch.classList.toggle('is-active', active);
    if (wasActive !== active) {
      runFullscreenOrganicGlide(active);
    }
  }

  function toggleFullscreen(wantFullscreen) {
    const active = isFullscreenActive();
    const target = typeof wantFullscreen === 'boolean' ? wantFullscreen : !active;
    if (target === active) {
      syncFullscreenSwitch();
      return;
    }
    captureFullscreenWidths();
    if (target) {
      const root = document.documentElement;
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if (!req) {
        syncFullscreenSwitch();
        showToast('이 브라우저에서는 전체 화면을 지원하지 않습니다');
        return;
      }
      try {
        const res = req.call(root);
        if (res && typeof res.then === 'function') {
          res.then(syncFullscreenSwitch).catch(function () {
            syncFullscreenSwitch();
            showToast('전체 화면 전환이 차단되었습니다');
          });
        } else {
          syncFullscreenSwitch();
        }
      } catch (_) {
        syncFullscreenSwitch();
        showToast('전체 화면 전환이 차단되었습니다');
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit && active) {
        try {
          const res = exit.call(document);
          if (res && typeof res.then === 'function') {
            res.then(syncFullscreenSwitch).catch(syncFullscreenSwitch);
          } else {
            syncFullscreenSwitch();
          }
        } catch (_) {
          syncFullscreenSwitch();
        }
      } else {
        syncFullscreenSwitch();
      }
    }
  }

  function updateDocumentTitle(snapshot) {
    const watchTitle = (CALIBER_META[mountedCaliberId] && CALIBER_META[mountedCaliberId].title) || 'NO.5 ELLIPSE';
    if (demoActive) {
      document.title = `[600× 시연] ${watchTitle}`;
      return;
    }
    if (snapshot.mode === 'clock') {
      document.title = `[${snapshot.digitalText}] ${watchTitle}`;
      return;
    }
    if (snapshot.running) {
      const phaseShort = snapshot.mode === 'stopwatch'
        ? '스톱워치'
        : (snapshot.phase === 'break' ? '휴식' : '집중');
      document.title = `[${snapshot.digitalText}] ${phaseShort} · ${watchTitle}`;
    } else {
      document.title = `CASPER — 시간을 보관하는 공방`;
    }
  }

  function checkHourlyChime(nowMs) {
    if (!prefs.hourlyChime || timer.state.mode !== 'clock' || demoActive) return;
    const d = new Date(nowMs);
    if (d.getMinutes() === 0 && d.getSeconds() <= 2) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      if (key !== lastChimedHourKey) {
        lastChimedHourKey = key;
        if (prefs.mannerMode) {
          if (satellite) satellite.triggerVisualAlarm();
        } else {
          window.ChronoAudio.strikeClassicGong('low', 0);
          window.ChronoAudio.strikeClassicGong('high', 0.25);
        }
      }
    }
  }

  function toggleAmbienceMute() {
    const t = Number(dom.sliderTick.value);
    const r = Number(dom.sliderRain.value);
    const c = Number(dom.sliderCafe.value);
    if (t > 0 || r > 0 || c > 0) {
      savedAmbience = { t: t, r: r, c: c };
      dom.sliderTick.value = '0';
      dom.sliderRain.value = '0';
      dom.sliderCafe.value = '0';
      syncMixerUI();
      showToast('백색소음 음소거됨 (M으로 복원)');
    } else if (savedAmbience) {
      dom.sliderTick.value = String(savedAmbience.t);
      dom.sliderRain.value = String(savedAmbience.r);
      dom.sliderCafe.value = String(savedAmbience.c);
      syncMixerUI();
      showToast('백색소음이 복원되었습니다');
    } else {
      window.ChronoAudio.stopAllAmbience();
      showToast('백색소음이 꺼져 있습니다');
    }
  }

  function syncMixerUI() {
    const t = Number(dom.sliderTick.value) || 0;
    const r = Number(dom.sliderRain.value) || 0;
    const c = Number(dom.sliderCafe.value) || 0;
    if (dom.valTick) dom.valTick.textContent = `${t}%`;
    if (dom.valRain) dom.valRain.textContent = `${r}%`;
    if (dom.valCafe) dom.valCafe.textContent = `${c}%`;
    if (dom.btnQuickTick) { dom.btnQuickTick.classList.toggle('is-on', t > 0); dom.btnQuickTick.setAttribute('aria-pressed', String(t > 0)); }
    if (dom.btnQuickRain) { dom.btnQuickRain.classList.toggle('is-on', r > 0); dom.btnQuickRain.setAttribute('aria-pressed', String(r > 0)); }
    if (dom.btnQuickCafe) { dom.btnQuickCafe.classList.toggle('is-on', c > 0); dom.btnQuickCafe.setAttribute('aria-pressed', String(c > 0)); }
    window.ChronoAudio.updateSettings({
      tickVol: t / 100,
      rainVol: r / 100,
      cafeVol: c / 100
    });
  }

  // Delegated click handler (also handles backdrop dismissal & <summary> action isolation)
  document.addEventListener('click', function (e) {
    if (e.target === dom.quickTimeSheet) {
      closeQuickTimeSheet();
      return;
    }
    if (dom.subjectSheet && dom.subjectSheet.classList.contains('is-open') &&
        !dom.subjectSheet.contains(e.target) &&
        !(dom.frontSubjectTag && dom.frontSubjectTag.contains(e.target))) {
      closeSubjectSheet();
    }
    if (e.target === dom.guideModal) {
      closeGuideModal();
      return;
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');

    switch (action) {
      case 'toggle-manner':
        applyMannerMode(!prefs.mannerMode, true);
        break;

      case 'toggle-standby':
        toggleStandby();
        break;

      case 'open-guide':
        openGuideModal();
        break;

      case 'close-guide':
        closeGuideModal();
        break;

      case 'open-quick-time':
        if (document.body.classList.contains('is-standby')) break;
        openQuickTimeSheet();
        break;

      case 'close-quick-time':
        closeQuickTimeSheet();
        break;

      case 'open-subject-picker':
        openSubjectSheet();
        break;

      case 'close-subject-picker':
        closeSubjectSheet();
        break;

      case 'open-subject-manage':
        closeSubjectSheet();
        switchTab('timer');
        setDeckFlipped(true, false);
        break;

      case 'open-back-tab': {
        const tabId = target.getAttribute('data-tab') || 'atelier';
        switchTab(tabId);
        setDeckFlipped(true, false);
        break;
      }

      case 'toggle-timer':
        toggleTimerRun();
        break;

      case 'reset-timer':
        handleProtectedReset('타이머를 정리했습니다');
        break;

      case 'discard-session':
        discardCurrentSession();
        break;

      case 'resume-vault-session':
        resumeFromVault();
        break;

      case 'dismiss-resume-vault':
        if (window.ChronoStorage && typeof window.ChronoStorage.clearResumeVault === 'function') {
          window.ChronoStorage.clearResumeVault();
        }
        syncResumeVaultBanner();
        break;

      case 'accept-backup-prompt':
        downloadBackupFile();
        if (dom.backupPromptBanner) dom.backupPromptBanner.hidden = true;
        break;

      case 'dismiss-backup-prompt':
        if (dom.backupPromptBanner) dom.backupPromptBanner.hidden = true;
        break;

      case 'dismiss-ios-install':
        if (dom.iosInstallBanner) dom.iosInstallBanner.hidden = true;
        if (window.ChronoStorage && typeof window.ChronoStorage.loadSafetyMeta === 'function') {
          const meta = window.ChronoStorage.loadSafetyMeta();
          meta.iosInstallPrompted = true;
          window.ChronoStorage.saveSafetyMeta(meta);
        }
        break;

      case 'pick-sw-review': {
        const picked = Math.max(1, Math.min(720, Number(target.getAttribute('data-minutes')) || 60));
        if (dom.stopwatchReviewMinutes) dom.stopwatchReviewMinutes.value = String(picked);
        break;
      }

      case 'discard-sw-review':
        closeStopwatchReviewModal();
        persistActiveSession();
        showToast('스톱워치 기록을 비웠습니다');
        break;

      case 'save-stopwatch': {
        const elapsed = timer.getElapsedMs(Date.now());
        if (elapsed < 10000) {
          showToast('10초 이상 측정 후 저장할 수 있습니다');
          break;
        }
        const mins = Math.max(1, Math.round(elapsed / 60000));
        const saved = window.ChronoStorage.addLog({
          subject: prefs.selectedSubject,
          mode: 'stopwatch',
          minutes: mins,
          memo: '',
          endedAt: Date.now()
        });
        timer.reset();
        persistActiveSession();
        syncWakeLock(false);
        syncControlLabels();
        renderLogsAndStats();
        afterSessionRecorded();
        openReflectionModal(saved, `스톱워치 ${formatMinutesKo(mins)} 기록 완료`);
        break;
      }

      case 'flip-deck':
        if (!deckFlipped && target && target.id === 'btnFlipToBack') {
          // v1.7.3: the steel wheel turns to brass first, then the watch flips over
          if (target.classList.contains('is-turning')) break;
          startCasebackMotion();
          const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reduce) { setDeckFlipped(true, false); break; }
          target.classList.add('is-turning');
          setTimeout(function () { setDeckFlipped(true, false); }, 280);
        } else {
          setDeckFlipped(!deckFlipped, false);
        }
        break;

      case 'switch-tab': {
        const nextTab = target.getAttribute('data-tab');
        switchTab(nextTab);
        if (nextTab === 'atelier') {
          handleAtelierDevTap();
        }
        break;
      }

      case 'dev-toggle-demo':
        if (!atelierState.devMode) break;
        setDeckFlipped(false, true);
        toggleDemoMode();
        break;

      case 'dev-add-session':
        if (!atelierState.devMode) break;
        window.ChronoStorage.addLog({
          subject: prefs.selectedSubject,
          mode: 'pomodoro',
          minutes: 60,
          memo: '[DEV] 테스트 가공 세션',
          endedAt: Date.now()
        });
        window.ChronoAudio.playCrownRatchet();
        renderLogsAndStats();
        showToast('[DEV] +60분 기록 추가');
        break;

      case 'dev-reset-parts': {
        if (!atelierState.devMode) break;
        const resetParts = {};
        const order = (window.CasperAtelier && Array.isArray(window.CasperAtelier.BUILD_ORDER))
          ? window.CasperAtelier.BUILD_ORDER
          : [];
        order.forEach(function (cid) { resetParts[cid] = []; });
        atelierState.assembledParts = resetParts;
        atelierState = window.ChronoStorage.saveAtelier(atelierState);
        if (dom.atelierStoryFeedback) dom.atelierStoryFeedback.hidden = true;
        window.ChronoAudio.playCrownRatchet();
        renderAtelier();
        showToast('[DEV] 부품 조립 초기화');
        break;
      }

      case 'dev-reset-all': {
        if (!atelierState.devMode) break;
        if (!window.confirm('[DEV] 누적 시간(lifetimeMinutes), 모든 기록, 조립 부품을 0으로 완전히 초기화할까요?')) break;
        if (window.ChronoStorage && typeof window.ChronoStorage.devResetAllProgress === 'function') {
          window.ChronoStorage.devResetAllProgress(Boolean(atelierState.devMode));
          atelierState = window.ChronoStorage.loadAtelier();
          timer.reset({ resetRound: true });
          clearCompletionTimer();
          if (dom.atelierStoryFeedback) dom.atelierStoryFeedback.hidden = true;
          syncModeUI();
          renderLogsAndStats();
          syncResumeVaultBanner();
          window.ChronoAudio.playCrownRatchet();
          showToast('[DEV] 전체 초기화 완료', 3200);
        }
        break;
      }

      case 'dev-preview-epilogue':
        if (!atelierState.devMode) break;
        openEpilogueOverlay();
        break;

      case 'onboarding-start-5m':
        startOnboardingFiveMinutes();
        break;

      case 'onboarding-dismiss':
        closeOnboardingOverlay(true);
        break;

      case 'open-prologue':
        openPrologueModal();
        break;

      case 'prologue-next':
        advancePrologueCard();
        break;

      case 'prologue-skip':
        closePrologueModal();
        break;

      case 'open-epilogue':
        openEpilogueOverlay();
        break;

      case 'close-epilogue':
        closeEpilogueOverlay();
        break;

      case 'dismiss-feature-hint':
        dismissFeatureHint();
        break;

      case 'dismiss-cheer-banner':
        dismissCheerBanner();
        break;

      case 'apply-sw-update':
        if (waitingServiceWorker) {
          swUpdateRequested = true;
          persistActiveSession();
          waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
        }
        break;

      case 'open-cheer-compose':
        openCheerComposeModal();
        break;

      case 'close-cheer-compose':
        closeCheerComposeModal();
        break;

      case 'submit-cheer-external': {
        if (!window.CasperCheers || !dom.cheerComposeInput) break;
        const check = window.CasperCheers.validateCheerText(dom.cheerComposeInput.value);
        if (!check.ok) {
          setCheerComposeError(check.message);
          break;
        }
        const url = window.CasperCheers.buildSubmitUrl(check.text);
        if (!url) {
          setCheerComposeError('외부 제출 링크가 아직 설정되지 않았습니다');
          break;
        }
        narrativeMeta.myCheer = check.text;
        saveNarrativeState();
        renderAtelier();
        closeCheerComposeModal();
        window.open(url, '_blank', 'noopener,noreferrer');
        showToast('응원 보관 · 제출 양식을 열었어요', 3400);
        break;
      }

      case 'toggle-codex-story': {
        const calId = target.getAttribute('data-caliber');
        if (!calId) break;
        expandedCodexCaliberId = (expandedCodexCaliberId === calId) ? null : calId;
        renderAtelier();
        break;
      }

      case 'assemble-part': {
        if (!window.CasperAtelier) break;
        const logs = window.ChronoStorage.loadLogs();
        const res = window.CasperAtelier.assembleNextPart(logs, atelierState, window.ChronoStorage.getLifetimeMinutes());
        if (!res.ok) {
          showToast('아직 조립 가능한 부품이 없습니다');
          break;
        }
        atelierState = window.ChronoStorage.saveAtelier(res.state);
        if (dom.atelierStoryFeedback && res.assembledPart && res.assembledPart.story) {
          dom.atelierStoryFeedback.innerHTML = [
            `<div class="atelier-story-feedback-meta">${escapeHtml(res.assembledPart.name)} 조립 완료</div>`,
            `<div class="atelier-story-feedback-quote">“${escapeHtml(res.assembledPart.story)}”</div>`
          ].join('');
          dom.atelierStoryFeedback.hidden = false;
        }
        if (res.completedCaliber && res.completedCaliberId) {
          atelierState.activeWatch = res.completedCaliberId;
          atelierState = window.ChronoStorage.saveAtelier(atelierState);
          window.ChronoAudio.strikeClassicGong('low', 0);
          window.ChronoAudio.strikeClassicGong('high', 0.24);
          showToast(`${res.completedCaliberName} 완성! 앞면에 장착했어요`, 4200);
          if (res.completedCaliberId === 'cal-a') {
            openEpilogueOverlay();
          } else {
            const cheerText = maybeConsumeDailyCheer();
            if (cheerText) showCheerBanner(cheerText);
          }
        } else {
          window.ChronoAudio.playCrownPull(true);
          const storyPreview = res.assembledPart.story ? ` — ${res.assembledPart.story}` : '';
          void storyPreview; showToast(`${res.assembledPart.name} 조립 완료`, 3000);
        }
        renderAtelier();
        break;
      }

      case 'select-caliber': {
        const calId = target.getAttribute('data-caliber');
        if (!calId || !window.CasperAtelier) break;
        const snap = window.CasperAtelier.computeAtelierSnapshot(
          window.ChronoStorage.loadLogs(),
          atelierState,
          window.ChronoStorage.getLifetimeMinutes()
        );
        const found = snap.calibers.find(function (c) { return c.id === calId; });
        if (!found || !found.unlocked) {
          showToast('아직 완성되지 않은 칼리버입니다');
          break;
        }
        atelierState.activeWatch = calId;
        atelierState = window.ChronoStorage.saveAtelier(atelierState);
        window.ChronoAudio.playCrownRatchet();
        renderAtelier();
        showToast(`${found.name} 장착 완료`);
        break;
      }

      case 'set-mode':
        trySwitchMode(target.getAttribute('data-mode'));
        break;

      case 'step-mode-drum':
        stepModeDrum(Number(target.getAttribute('data-dir')) || 1);
        break;

      case 'standby-cycle-mode': {
        if (timer.state.running) {
          timer.pause(Date.now());
          clearCompletionTimer();
          syncWakeLock(false);
          syncMusicWithTimer(false);
        }
        stepModeDrum(1);
        const modeNames = {
          clock: '데스크 시계',
          pomodoro: '포모도로',
          countdown: '타이머',
          stopwatch: '스톱워치'
        };
        showToast(modeNames[timer.state.mode] || '모드 변경', 1400);
        break;
      }

      case 'qt-preset-pomo': {
        if (timer.state.running) {
          showToast('일시정지 후 프리셋을 변경할 수 있습니다');
          break;
        }
        const focus = Number(target.getAttribute('data-focus')) || 25;
        const brk = Number(target.getAttribute('data-break')) || 5;
        clearResetConfirm();
        timer.setPomodoroPreset(focus, brk);
        persistTimerMinutes();
        persistActiveSession();
        syncTimerConfigUI();
        syncControlLabels();
        window.ChronoAudio.playCrownRatchet();
        break;
      }

      case 'qt-preset-timer': {
        if (timer.state.running) {
          showToast('일시정지 후 프리셋을 변경할 수 있습니다');
          break;
        }
        const mins = Number(target.getAttribute('data-minutes')) || 15;
        clearResetConfirm();
        timer.setCountdownMinutes(mins);
        persistTimerMinutes();
        persistActiveSession();
        syncTimerConfigUI();
        syncControlLabels();
        window.ChronoAudio.playCrownRatchet();
        break;
      }

      case 'set-preset':
      case 'set-preset-quick': {
        if (timer.state.running) {
          showToast('일시정지 후 프리셋을 변경할 수 있습니다');
          break;
        }
        const focus = Number(target.getAttribute('data-focus')) || 25;
        const brk = Number(target.getAttribute('data-break')) || 5;
        clearResetConfirm();
        timer.setPomodoroPreset(focus, brk);
        persistTimerMinutes();
        persistActiveSession();
        syncTimerConfigUI();
        syncControlLabels();
        window.ChronoAudio.playCrownRatchet();
        if (action === 'set-preset-quick') {
          closeQuickTimeSheet();
          showToast(`포모도로 ${focus}/${brk}분 설정 완료`);
        }
        break;
      }

      case 'adjust-min': {
        const delta = Number(target.getAttribute('data-delta')) || 0;
        if (timer.state.running) {
          showToast('일시정지 후 조절할 수 있어요');
          break;
        }
        if (timer.adjustMinutes(delta)) {
          clearResetConfirm();
          window.ChronoAudio.playCrownRatchet();
          persistTimerMinutes();
          persistActiveSession();
          syncTimerConfigUI();
        }
        break;
      }

      case 'reset-round':
        clearResetConfirm();
        clearCompletionTimer();
        timer.reset({ resetRound: true });
        persistActiveSession();
        syncWakeLock(false);
        syncTimerConfigUI();
        syncControlLabels();
        showToast('포모도로 라운드를 #1로 초기화했습니다');
        break;

      case 'select-subject':
      case 'select-subject-quick': {
        const sub = target.getAttribute('data-subject');
        if (sub && action === 'select-subject-quick') {
          selectSubjectQuick(sub, target);
        } else if (sub) {
          selectSubjectBack(sub, target);
        }
        break;
      }

      case 'set-alarm':
        applyAlarmType(target.getAttribute('data-alarm'), true);
        break;

      case 'test-alarm':
        if (prefs.mannerMode) {
          if (satellite) satellite.triggerVisualAlarm();
          showToast('무음 모드 · 빛으로 알렸어요');
        } else {
          window.ChronoAudio.playSessionCompleteAlarm();
        }
        break;

      case 'mute-ambience':
        toggleAmbienceMute();
        break;

      case 'export-json':
        downloadBackupFile();
        break;

      case 'trigger-import':
        if (dom.importFileInput) dom.importFileInput.click();
        break;

      case 'clear-logs':
        if (window.confirm('저장된 모든 공부 기록을 삭제하시겠습니까?')) {
          window.ChronoStorage.clearAllLogs();
          renderLogsAndStats();
          showToast('공부 기록을 비웠습니다');
        }
        break;

      case 'delete-log': {
        const logId = target.getAttribute('data-log-id');
        if (logId) {
          window.ChronoStorage.deleteLog(logId);
          renderLogsAndStats();
        }
        break;
      }

      case 'save-reflection-only': {
        const savedMemo = saveReflectionMemoIfAny();
        closeReflectionModal();
        if (savedMemo) showToast('회고 메모가 저장되었습니다');
        break;
      }

      case 'close-reflection':
        closeReflectionModal();
        break;

      case 'play-music-preset': {
        const musicId = target.getAttribute('data-music-id');
        const found = getAllMusicItems().find(function (m) { return m.id === musicId; });
        if (found) {
          if (dom.musicUrlInput) dom.musicUrlInput.value = found.url;
          loadMusicTrack(found.url, found.title, found.id);
        }
        break;
      }

      case 'save-music-bookmark': {
        const rawUrl = dom.musicUrlInput ? dom.musicUrlInput.value.trim() : '';
        const parsed = window.ChronoMusic ? window.ChronoMusic.parseYouTubeUrl(rawUrl) : null;
        if (!parsed) {
          showToast('YouTube Music 링크를 먼저 넣어 주세요');
          break;
        }
        const customTitle = (dom.musicTitleInput ? dom.musicTitleInput.value.trim() : '')
          || (parsed.kind === 'playlist' ? '내 공부 플리' : '내 공부 트랙');
        const entry = {
          id: 'bm-' + Date.now(),
          title: customTitle.slice(0, 28),
          url: rawUrl.slice(0, 300)
        };
        prefs.musicBookmarks = [entry].concat(prefs.musicBookmarks || []).slice(0, 16);
        window.ChronoStorage.savePrefs(prefs);
        if (dom.musicTitleInput) dom.musicTitleInput.value = '';
        renderMusicPresets();
        loadMusicTrack(entry.url, entry.title, entry.id);
        showToast(`북마크 [${entry.title}] 저장 완료`);
        break;
      }

      case 'delete-music-bookmark': {
        const delId = target.getAttribute('data-music-id');
        prefs.musicBookmarks = (prefs.musicBookmarks || []).filter(function (b) { return b.id !== delId; });
        window.ChronoStorage.savePrefs(prefs);
        if (activeMusic && activeMusic.id === delId) {
          unloadMusicTrack();
        } else {
          renderMusicPresets();
        }
        showToast('북마크를 삭제했습니다');
        break;
      }

      case 'open-ytm-popup': {
        const rawInput = dom.musicUrlInput ? dom.musicUrlInput.value.trim() : '';
        const parsedInput = rawInput && window.ChronoMusic ? window.ChronoMusic.parseYouTubeUrl(rawInput) : null;
        const targetParsed = (activeMusic && activeMusic.parsed) || parsedInput || null;
        if (window.ChronoMusic) {
          window.ChronoMusic.openYouTubeMusicPopup(targetParsed);
          showToast('YouTube Music 미니 팝업을 열었습니다');
        }
        break;
      }

      case 'standby-toggle-music': {
        const dockClosedOrLeaving = !dom.musicPlayerDock || dom.musicPlayerDock.hidden || dom.musicPlayerDock.classList.contains('is-leaving');
        if (dockClosedOrLeaving) {
          showMusicDock();
          setMusicDetailOpen(!activeMusic || !musicDetailOpen);
        } else if (activeMusic) {
          setMusicDetailOpen(!musicDetailOpen);
        } else {
          // 전체 독이 사라지는 동안 내부 서랍도 함께 유지되어 부드럽게 통째로 내려감
          musicDetailOpen = false;
          if (dom.btnMusicToggleDetail) {
            dom.btnMusicToggleDetail.classList.remove('is-active');
            dom.btnMusicToggleDetail.setAttribute('aria-expanded', 'false');
          }
          hideMusicDock();
        }
        syncMusicControlsUI();
        break;
      }

      case 'music-toggle-play':
        toggleMusicPlayPause();
        break;

      case 'music-prev':
        stepMusicTrack(-1);
        break;

      case 'music-next':
        stepMusicTrack(1);
        break;

      case 'music-toggle-detail':
        setMusicDetailOpen(!musicDetailOpen);
        syncMusicControlsUI();
        break;

      case 'music-toggle-mute':
        if (prefs.mannerMode) {
          showToast('독서실 무음 매너 모드가 켜져 있습니다');
          break;
        }
        musicMuted = !musicMuted;
        if (activeMusic && dom.musicIframe && window.ChronoMusic) {
          window.ChronoMusic.sendPlayerCommand(dom.musicIframe, musicMuted ? 'mute' : 'unMute');
        }
        syncMusicControlsUI();
        break;

      case 'music-toggle-frame':
        if (document.body.classList.contains('is-standby')) {
          musicStandbyVideoOpen = !musicStandbyVideoOpen;
          if (musicStandbyVideoOpen && dom.musicIframeWrap) {
            dom.musicIframeWrap.classList.remove('is-collapsed');
          }
        } else {
          musicFrameCollapsed = !musicFrameCollapsed;
          if (dom.musicIframeWrap) dom.musicIframeWrap.classList.toggle('is-collapsed', musicFrameCollapsed);
        }
        syncMusicControlsUI();
        break;

      case 'dock-save-bookmark': {
        const rawUrl = dom.dockUrlInput ? dom.dockUrlInput.value.trim() : '';
        const parsed = window.ChronoMusic ? window.ChronoMusic.parseYouTubeUrl(rawUrl) : null;
        if (!parsed) {
          showToast('YouTube Music 링크를 넣어 주세요');
          break;
        }
        const entry = {
          id: 'bm-' + Date.now(),
          title: (parsed.kind === 'playlist' ? '스탠바이 플리' : '스탠바이 트랙'),
          url: rawUrl.slice(0, 300)
        };
        prefs.musicBookmarks = [entry].concat(prefs.musicBookmarks || []).slice(0, 16);
        window.ChronoStorage.savePrefs(prefs);
        if (dom.dockUrlInput) dom.dockUrlInput.value = '';
        renderMusicPresets();
        loadMusicTrack(entry.url, entry.title, entry.id);
        showToast('플레이리스트 북마크에 저장했습니다');
        break;
      }

      case 'quick-ambient': {
        const ch = target.getAttribute('data-channel');
        const map = { tick: dom.sliderTick, rain: dom.sliderRain, cafe: dom.sliderCafe };
        const slider = map[ch];
        if (slider) {
          window.ChronoAudio.ensureContext();
          const cur = Number(slider.value) || 0;
          slider.value = cur > 0 ? '0' : '40';
          syncMixerUI();
          const labels = { tick: '시계 초침 소리', rain: '빗소리', cafe: '카페' };
          const idleNote = (cur > 0 || (timer.state.running && timer.state.mode !== 'clock')) ? '' : ' · 타이머와 함께 재생';
          showToast(`${labels[ch] || ch} ${cur > 0 ? '꺼짐' : '켜짐'}${idleNote}`);
        }
        break;
      }

      case 'music-unload':
        unloadMusicTrack();
        showToast('음악 플레이어를 닫았습니다');
        break;
    }
  });

  // Form & Input Listeners
  if (dom.addSubjectForm) {
    dom.addSubjectForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = dom.newSubjectInput.value.trim().slice(0, 16);
      if (!val) return;
      if (!prefs.subjects.includes(val)) {
        prefs.subjects.push(val);
        if (prefs.subjects.length > 12) prefs.subjects.shift();
      }
      prefs.selectedSubject = val;
      window.ChronoStorage.savePrefs(prefs);
      dom.newSubjectInput.value = '';
      renderSubjects();
    });
  }

  if (dom.reflectionForm) {
    dom.reflectionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const shouldStartBreak = activeReflectionCanStartBreak;
      const savedMemo = saveReflectionMemoIfAny();
      closeReflectionModal();
      if (shouldStartBreak && timer.state.mode === 'pomodoro' && timer.state.phase === 'break' && !timer.state.running) {
        requestNotificationPermissionOnce();
        window.ChronoAudio.ensureContext();
        timer.start(Date.now());
        persistActiveSession();
        scheduleCompletionTimer();
        syncWakeLock(true);
        syncMusicWithTimer(true);
        syncControlLabels();
        syncTimerConfigUI();
        enterFocusOnTimerStart();
        showToast(savedMemo ? '메모 저장 · 휴식 시작' : '휴식을 시작합니다');
      } else if (savedMemo) {
        showToast('회고 메모가 저장되었습니다');
      }
    });
  }

  if (dom.stopwatchReviewForm) {
    dom.stopwatchReviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rawMins = dom.stopwatchReviewMinutes ? Number(dom.stopwatchReviewMinutes.value) : 60;
      const mins = Math.max(1, Math.min(720, Math.round(rawMins || 60)));
      const saved = window.ChronoStorage.addLog({
        subject: prefs.selectedSubject,
        mode: 'partial',
        minutes: mins,
        memo: '',
        endedAt: Date.now()
      });
      closeStopwatchReviewModal();
      persistActiveSession();
      renderLogsAndStats();
      afterSessionRecorded();
      showToast(`${formatMinutesKo(mins)} 금고에 보관`);
      openReflectionModal(saved, `${formatMinutesKo(mins)}이 금고에 보관되었습니다`, { isPartial: true });
    });
  }

  if (dom.chkAutoBreak) {
    dom.chkAutoBreak.addEventListener('change', function () {
      timer.state.autoStartBreak = dom.chkAutoBreak.checked;
    });
  }

  if (dom.chkCheersEnabled) {
    dom.chkCheersEnabled.addEventListener('change', function () {
      prefs.cheersEnabled = dom.chkCheersEnabled.checked;
      window.ChronoStorage.savePrefs(prefs);
      if (!prefs.cheersEnabled) {
        dismissCheerBanner();
      }
    });
  }

  if (dom.cheerComposeInput) {
    dom.cheerComposeInput.addEventListener('input', function () {
      syncCheerComposeCounter();
      setCheerComposeError('');
    });
  }

  if (dom.cheerComposeForm) {
    dom.cheerComposeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.CasperCheers || !dom.cheerComposeInput) return;
      const check = window.CasperCheers.validateCheerText(dom.cheerComposeInput.value);
      if (!check.ok) {
        setCheerComposeError(check.message);
        return;
      }
      narrativeMeta.myCheer = check.text;
      saveNarrativeState();
      renderAtelier();
      closeCheerComposeModal();
      showToast('내가 남긴 한 줄을 공방에 보관했습니다', 3000);
    });
  }

  if (dom.chkMannerMode) {
    dom.chkMannerMode.addEventListener('change', function () {
      applyMannerMode(dom.chkMannerMode.checked, true);
    });
  }

  if (dom.chkDeskClockMode) {
    dom.chkDeskClockMode.addEventListener('change', function () {
      const wantClock = dom.chkDeskClockMode.checked;
      if (wantClock) {
        if (timer.state.running) {
          timer.pause(Date.now());
          clearCompletionTimer();
          syncWakeLock(false);
          syncMusicWithTimer(false);
        }
        // 1.8.5: measure the board layout BEFORE the mode changes, so the watch glides from where it
        // really was (switching mode first reflowed the board and the watch jumped/zoomed).
        if (document.body.classList.contains('is-standby')) {
          trySwitchMode('clock');
        } else {
          animateStandbySwap(function () {
            trySwitchMode('clock');
            applyStandbyState(true, { fullscreen: false, auto: true });
          });
        }
      } else {
        if (document.body.classList.contains('is-standby')) {
          animateStandbySwap(function () {
            trySwitchMode(lastNonClockMode || 'pomodoro');
            applyStandbyState(false, {});
          });
        } else {
          trySwitchMode(lastNonClockMode || 'pomodoro');
        }
      }
    });
  }

  if (dom.chkStandbyMode) {
    dom.chkStandbyMode.addEventListener('change', function () {
      toggleFullscreen(dom.chkStandbyMode.checked);
    });
  }
  document.addEventListener('fullscreenchange', syncFullscreenSwitch);
  document.addEventListener('webkitfullscreenchange', syncFullscreenSwitch);
  document.addEventListener('fullscreenerror', syncFullscreenSwitch);
  document.addEventListener('webkitfullscreenerror', syncFullscreenSwitch);

  if (dom.chkHourlyChime) {
    dom.chkHourlyChime.addEventListener('change', function () {
      prefs.hourlyChime = dom.chkHourlyChime.checked;
      window.ChronoStorage.savePrefs(prefs);
    });
  }

  if (dom.musicUrlForm) {
    dom.musicUrlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rawUrl = dom.musicUrlInput ? dom.musicUrlInput.value.trim() : '';
      const title = dom.musicTitleInput ? dom.musicTitleInput.value.trim() : '';
      loadMusicTrack(rawUrl, title, null);
    });
  }

  if (dom.chkMusicAutoSync) {
    dom.chkMusicAutoSync.addEventListener('change', function () {
      setMusicAutoSync(dom.chkMusicAutoSync.checked);
    });
  }

  if (dom.chkDockAutoSync) {
    dom.chkDockAutoSync.addEventListener('change', function () {
      setMusicAutoSync(dom.chkDockAutoSync.checked);
    });
  }

  if (dom.dockUrlForm) {
    dom.dockUrlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rawUrl = dom.dockUrlInput ? dom.dockUrlInput.value.trim() : '';
      if (loadMusicTrack(rawUrl, '', null) && dom.dockUrlInput) {
        dom.dockUrlInput.value = '';
      }
    });
  }

  if (dom.sliderMusicVol) {
    dom.sliderMusicVol.addEventListener('input', function () {
      applyMusicVolume(dom.sliderMusicVol.value, false);
    });
    dom.sliderMusicVol.addEventListener('change', function () {
      applyMusicVolume(dom.sliderMusicVol.value, true);
    });
  }

  if (dom.musicIframe) {
    dom.musicIframe.addEventListener('load', function () {
      if (!activeMusic || !window.ChronoMusic) return;
      setTimeout(function () {
        if (!activeMusic || !dom.musicIframe) return;
        const vol = Math.max(0, Math.min(100, Number(prefs.musicVolume != null ? prefs.musicVolume : 75)));
        window.ChronoMusic.sendPlayerCommand(dom.musicIframe, 'setVolume', [vol]);
        if (prefs.mannerMode || musicMuted || vol === 0) {
          window.ChronoMusic.sendPlayerCommand(dom.musicIframe, 'mute');
        }
      }, 750);
    });
  }

  [dom.sliderTick, dom.sliderRain, dom.sliderCafe].forEach(function (slider) {
    if (slider) {
      slider.addEventListener('input', syncMixerUI);
    }
  });

  // v1.7.3: white noise plays only while a pomodoro/countdown/stopwatch is actually running
  let lastAmbienceActive = null;
  function syncAmbienceGate() {
    const active = Boolean(timer.state.running) && timer.state.mode !== 'clock';
    if (active === lastAmbienceActive) return;
    lastAmbienceActive = active;
    document.body.classList.toggle('is-timer-running', active);
    window.ChronoAudio.updateSettings({ ambienceActive: active });
    const hint = document.getElementById('dockNoiseHint');
    if (hint) hint.textContent = active ? '재생 중' : '타이머 중에만';
  }
  syncAmbienceGate();
  setInterval(syncAmbienceGate, 400);

  if (dom.importFileInput) {
    dom.importFileInput.addEventListener('change', function () {
      const file = dom.importFileInput.files && dom.importFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const res = window.ChronoStorage.importBackupJson(String(reader.result || ''));
          atelierState = window.ChronoStorage.loadAtelier();
          renderLogsAndStats();
          showToast(`복원 완료 · ${res.added}건 추가`);
        } catch (err) {
          showToast(err.message || 'JSON 복원 실패');
        }
        dom.importFileInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Watch-side 3D Rotating Mode Drum (wheel, touch/pointer swipe, tap, keyboard)
  if (dom.modeDrumChassis) {
    dom.modeDrumChassis.addEventListener('wheel', function (e) {
      e.preventDefault();
      const now = performance.now();
      if (now - lastDrumWheelMs < 130) return;
      lastDrumWheelMs = now;
      stepModeDrum(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  if (dom.modeDrumViewport) {
    let drumDragStartY = null;
    let drumDragSwiped = false;

    dom.modeDrumViewport.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      drumDragStartY = e.clientY;
      drumDragSwiped = false;
      if (dom.modeDrumViewport.setPointerCapture) {
        try { dom.modeDrumViewport.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });

    dom.modeDrumViewport.addEventListener('pointermove', function (e) {
      if (drumDragStartY === null) return;
      const dy = e.clientY - drumDragStartY;
      if (Math.abs(dy) >= 16) {
        drumDragSwiped = true;
        drumDragStartY = e.clientY;
        stepModeDrum(dy < 0 ? 1 : -1);
      }
    });

    dom.modeDrumViewport.addEventListener('pointerup', function () {
      if (drumDragStartY !== null && !drumDragSwiped) {
        stepModeDrum(1);
      }
      drumDragStartY = null;
      drumDragSwiped = false;
    });

    dom.modeDrumViewport.addEventListener('pointercancel', function () {
      drumDragStartY = null;
      drumDragSwiped = false;
    });

    dom.modeDrumViewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        stepModeDrum(-1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        stepModeDrum(1);
      }
    });
  }

  // Keyboard shortcuts (A-1 modifier guard, A-2 restore Tab -> S, A-3 session protection)
  document.addEventListener('keydown', function (e) {
    const targetEl = e.target;
    const tag = (targetEl && targetEl.tagName) || '';
    const isTextInput = tag === 'TEXTAREA' || tag === 'SELECT' || (
      tag === 'INPUT' && targetEl.type !== 'checkbox' && targetEl.type !== 'range'
    );
    if (isTextInput) {
      if (e.key === 'Escape' && dom.reflectionModal && !dom.reflectionModal.hidden) {
        closeReflectionModal();
      }
      return;
    }

    // A-1: Never hijack browser/OS shortcuts (Cmd+F, Ctrl+P, Cmd+1..4, Ctrl+R, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Escape') {
      if (dom.cheerComposeModal && !dom.cheerComposeModal.hidden) {
        closeCheerComposeModal();
      } else if (dom.epilogueOverlay && !dom.epilogueOverlay.hidden) {
        closeEpilogueOverlay();
      } else if (dom.prologueOverlay && !dom.prologueOverlay.hidden) {
        closePrologueModal();
      } else if (dom.onboardingOverlay && !dom.onboardingOverlay.hidden) {
        closeOnboardingOverlay(true);
      } else if (dom.quickTimeSheet && !dom.quickTimeSheet.hidden) {
        closeQuickTimeSheet();
      } else if (dom.subjectSheet && !dom.subjectSheet.hidden) {
        closeSubjectSheet();
      } else if (dom.guideModal && !dom.guideModal.hidden) {
        closeGuideModal();
      } else if (dom.reflectionModal && !dom.reflectionModal.hidden) {
        closeReflectionModal();
      } else if (document.body.classList.contains('is-standby')) {
        toggleStandby();
      } else if (deckFlipped) {
        setDeckFlipped(false, false);
      }
      return;
    }

    // Block single-key shortcuts while any modal or bottom sheet is open
    if (isAnyModalOpen()) return;

    if (e.code === 'Space') {
      if (timer.state.mode !== 'clock') {
        e.preventDefault();
        toggleTimerRun();
      }
      return;
    }

    const lower = (e.key || '').toLowerCase();
    if (lower === 's' && !document.body.classList.contains('is-standby')) {
      setDeckFlipped(!deckFlipped, false);
    } else if (lower === 'r' && timer.state.mode !== 'clock') {
      handleProtectedReset('타이머 초기화');
    } else if (lower === 'f') {
      toggleFullscreen();
    } else if (lower === 'p') {
      toggleMusicPlayPause();
    } else if (lower === 'm') {
      toggleAmbienceMute();
    } else if (e.key === '1') {
      trySwitchMode('clock');
    } else if (e.key === '2') {
      trySwitchMode('pomodoro');
    } else if (e.key === '3') {
      trySwitchMode('countdown');
    } else if (e.key === '4') {
      trySwitchMode('stopwatch');
    }
  });

  // Re-acquire Wake Lock, snap immediately & check for SW updates (at most once/hour) when returning
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      syncWakeLock(timer.state.running);
      const evt = timer.tick(Date.now());
      if (evt) handleCompletionEvent(evt);
      if (swRegistration && typeof swRegistration.update === 'function') {
        const nowMs = Date.now();
        const shouldCheck = (window.CasperVersion && typeof window.CasperVersion.shouldCheckForUpdate === 'function')
          ? window.CasperVersion.shouldCheckForUpdate(lastSwUpdateCheckMs, nowMs)
          : (nowMs - lastSwUpdateCheckMs >= 3600000);
        if (shouldCheck) {
          lastSwUpdateCheckMs = nowMs;
          swRegistration.update().catch(function () {});
        }
      }
    }
  });

  // v1.7.3: the caseback movement runs off the same snapshot as the front watch,
  // so it turns, reverses and stops exactly when the front movement does.
  function syncCaseback(snap, nowPerf) {
    if (!casebackArtEl || !snap) return;
    const dt = casebackLastPerf ? Math.min(100, Math.max(0, nowPerf - casebackLastPerf)) : 0;
    casebackLastPerf = nowPerf;
    if (!deckFlipped) return;
    stepCasebackRotor(dt);
    const isTimerMode = snap.mode === 'pomodoro' || snap.mode === 'countdown' || snap.mode === 'stopwatch';
    const hours = isTimerMode && typeof snap.rawHours === 'number' ? snap.rawHours : (Number(snap.tHours) || 0);
    const minutes = hours * 60;
    const sec = Number(snap.secondsSweep) || 0;
    if (snap.running) casebackBalT += dt;
    const bal = 46 * Math.sin(casebackBalT * 0.001 * Math.PI * 2 * 3);
    const key = sec.toFixed(3) + '|' + minutes.toFixed(3) + '|' + bal.toFixed(1);
    if (key === casebackLastKey) return;
    casebackLastKey = key;
    if (!casebackParts) {
      casebackParts = {};
      ['sec', 'esc', 'bal', 'center', 'third', 'barrel'].forEach(function (k) {
        casebackParts[k] = Array.prototype.slice.call(casebackArtEl.querySelectorAll('.cb-' + k));
      });
    }
    const setRot = function (k, deg) {
      const list = casebackParts[k];
      for (let i = 0; i < list.length; i++) list[i].style.transform = 'rotate(' + deg + 'deg)';
    };
    setRot('sec', (sec * 6).toFixed(2));
    setRot('esc', String(-Math.round(sec * 8) * 12));
    setRot('bal', bal.toFixed(1));
    setRot('center', (minutes * 6).toFixed(2));
    setRot('third', (-minutes * 48).toFixed(2));
    setRot('barrel', (-minutes * 0.75).toFixed(2));
  }

  // v1.7.3: the automatic rotor swings to hang toward the ground, driven by the phone's motion sensor.
  // Mass side of the rotor points at 215deg (screen coords) when the pivot rotation is 0.
  const CB_ROTOR_MASS_DEG = 220;
  const cbGravity = { x: 0, y: 0, ok: false };
  let cbRotorAngle = 0;
  let cbRotorVel = 0;
  let cbRotorEl = null;
  let cbMotionAsked = false;
  function onCasebackMotion(e) {
    const g = e && e.accelerationIncludingGravity;
    if (!g || g.x === null || g.y === null) return;
    let gx = Number(g.x) || 0;
    let gy = Number(g.y) || 0;
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) { gx = -gx; gy = -gy; }
    const ang = (screen.orientation && typeof screen.orientation.angle === 'number')
      ? screen.orientation.angle
      : (typeof window.orientation === 'number' ? window.orientation : 0);
    const r = -ang * Math.PI / 180;
    // device frame: x right, y up the screen. Rotate into the current screen frame.
    const sx = gx * Math.cos(r) - gy * Math.sin(r);
    const sy = gx * Math.sin(r) + gy * Math.cos(r);
    // "down" in screen coordinates (y grows downward) is opposite the reaction vector
    cbGravity.x = -sx;
    cbGravity.y = sy;
    if (!cbGravity.ok) {
      cbGravity.ok = true;
      if (casebackArtEl) casebackArtEl.classList.add('has-gravity');
    }
  }
  // v1.8: iOS는 '사용자 터치 안'에서만 센서 권한을 물을 수 있음. 스와이프(pointerup)는 제스처로 안 쳐서
  // 거절되던 문제 → touchend/click에서도 요청하고, 실패하면 다음 터치 때 다시 시도.
  let cbMotionListening = false;
  let cbMotionPending = false;
  function startCasebackMotion() {
    if (cbMotionListening || cbMotionPending || typeof window.DeviceMotionEvent === 'undefined') return;
    const listen = function () {
      if (cbMotionListening) return;
      cbMotionListening = true;
      cbMotionAsked = true;
      window.addEventListener('devicemotion', onCasebackMotion);
    };
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && typeof DeviceMotionEvent.requestPermission === 'function') {
      cbMotionPending = true;
      let req;
      try { req = DeviceMotionEvent.requestPermission(); } catch (err) { cbMotionPending = false; return; }
      Promise.resolve(req).then(function (res) {
        cbMotionPending = false;
        if (res === 'granted') listen();
      }).catch(function () { cbMotionPending = false; });
    } else {
      listen();
    }
  }
  ['touchend', 'click'].forEach(function (type) {
    [document.querySelector('.watch-frame .satellite-mount'), dom.backControlDeck, document.getElementById('btnFlipToBack')].forEach(function (el) {
      if (el) el.addEventListener(type, function () { startCasebackMotion(); }, { passive: true });
    });
  });
  function stepCasebackRotor(dtMs) {
    if (!cbGravity.ok || !casebackArtEl) return;
    if (!cbRotorEl) cbRotorEl = casebackArtEl.querySelector('.cb-rotor-pivot');
    if (!cbRotorEl) return;
    const dt = Math.min(0.05, Math.max(0, dtMs / 1000));
    if (!dt) return;
    const mag = Math.hypot(cbGravity.x, cbGravity.y);
    const target = Math.atan2(cbGravity.y, cbGravity.x);
    const mass = (CB_ROTOR_MASS_DEG + cbRotorAngle) * Math.PI / 180;
    // pendulum: pull toward gravity in proportion to how upright the phone is, with bearing friction
    const pull = 90 * Math.min(1, mag / 9.8) * Math.sin(target - mass);
    const acc = pull - 2.4 * cbRotorVel;
    cbRotorVel += acc * dt;
    cbRotorAngle += cbRotorVel * dt * 180 / Math.PI;
    cbRotorAngle = ((cbRotorAngle % 360) + 360) % 360;
    cbRotorEl.style.transform = 'rotate(' + cbRotorAngle.toFixed(2) + 'deg)';
  }

  if (typeof window.DeviceMotionEvent !== 'undefined' &&
      !(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))) {
    startCasebackMotion();
  }

  // v1.7.3: swipe the watch sideways on the main screen to turn it over and look at the caseback
  // (caseback only, no settings panels). Swipe again or tap to turn it back.
  var casebackPeek = false;
  var casebackPeekPending = false;
  function setCasebackPeek(on, dir) {
    casebackPeek = Boolean(on);
    const flipper = dom.monolithFlipper;
    if (!flipper) return;
    if (casebackPeek) {
      const front = flipper.querySelector('.monolith-face.is-front');
      const h = front ? front.getBoundingClientRect().height : 0;
      if (h > 120) flipper.style.setProperty('--peek-h', Math.round(h) + 'px');
    }
    flipper.classList.toggle('is-peek', casebackPeek);
    flipper.classList.toggle('turn-rev', dir < 0);
  }
  function bindSwipe(el, onSwipe, onTap) {
    if (!el) return;
    let sx = 0, sy = 0, st = 0, id = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; st = Date.now();
    }, true);
    el.addEventListener('pointerup', function (e) {
      if (id !== e.pointerId) return;
      id = null;
      const dx = e.clientX - sx, dy = e.clientY - sy, t = Date.now() - st;
      if (Math.abs(dx) >= 56 && Math.abs(dx) > Math.abs(dy) * 1.5 && t < 900) onSwipe(dx > 0 ? 1 : -1);
      else if (onTap && Math.abs(dx) < 8 && Math.abs(dy) < 8 && t < 400) onTap();
    }, true);
    el.addEventListener('pointercancel', function () { id = null; }, true);
  }
  bindSwipe(document.querySelector('.watch-frame .satellite-mount'), function (dir) {
    if (deckFlipped || isAnyModalOpen() || document.body.classList.contains('is-standby')) return;
    if (satellite && satellite.isCrownPulled && satellite.isCrownPulled()) return;
    startCasebackMotion();
    setCasebackPeek(true, dir);
    casebackPeekPending = true;
    setDeckFlipped(true, false);
  });
  bindSwipe(dom.backControlDeck, function (dir) {
    if (!deckFlipped || !casebackPeek) return;
    dom.monolithFlipper.classList.toggle('turn-rev', dir < 0);
    setDeckFlipped(false, false);
  }, function () {
    if (deckFlipped && casebackPeek) setDeckFlipped(false, false);
  });

  function syncCasebackCaliber(caliberId) {
    if (!casebackArtEl) return;
    casebackArtEl.setAttribute('data-caseback', caliberId);
    const meta = CALIBER_META[caliberId];
    if (!meta) return;
    const title = String(meta.title).replace(/\s*\(.*\)\s*$/, '');
    const m = /^NO\.(\d+)\s+(.*)$/.exec(title);
    const num = m ? m[1] : '5';
    const name = m ? m[2] : title;
    const put = function (cls, text) {
      const list = casebackArtEl.querySelectorAll(cls);
      for (let i = 0; i < list.length; i++) list[i].textContent = text;
    };
    put('.pb-t-no', 'NO.' + num);
    put('.pb-t-name', name);
    put('.pb-t-serial', 'C0' + num + '-00001');
    put('.pb-t-cal', 'C0' + num);
  }

  // Smooth mechanical hand/disc glide when switching modes (no abrupt hand snapping)
  let lastDialMode = null;
  let lastRenderedDial = null;
  let dialGlide = null;

  function lerpAngleWrap(fromVal, toVal, period, t) {
    const half = period / 2;
    let delta = ((toVal - fromVal) % period + period) % period;
    if (delta > half) delta -= period;
    return ((fromVal + delta * t) % period + period) % period;
  }

  function getSmoothDialSnapshot(snap, nowPerf) {
    if (!snap) return snap;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetRaw = typeof snap.rawHours === 'number' ? snap.rawHours : (Number(snap.tHours) || 0);
    const targetT = Number(snap.tHours) || 0;
    const targetS = Number(snap.secondsSweep) || 0;

    if (demoActive || reduce || !lastRenderedDial) {
      dialGlide = null;
      lastDialMode = snap.mode;
      lastRenderedDial = { rawHours: targetRaw, tHours: targetT, secondsSweep: targetS };
      return snap;
    }

    if (snap.mode !== lastDialMode) {
      lastDialMode = snap.mode;
      const diffRaw = Math.abs(targetRaw - lastRenderedDial.rawHours);
      const diffS = Math.abs(targetS - lastRenderedDial.secondsSweep);
      if (diffRaw > 0.005 || diffS > 0.15) {
        dialGlide = {
          startPerf: nowPerf,
          durationMs: 560,
          fromRaw: lastRenderedDial.rawHours,
          fromT: lastRenderedDial.tHours,
          fromS: lastRenderedDial.secondsSweep
        };
      }
    }

    if (!dialGlide) {
      lastRenderedDial = { rawHours: targetRaw, tHours: targetT, secondsSweep: targetS };
      return snap;
    }

    const p = Math.min(1, Math.max(0, (nowPerf - dialGlide.startPerf) / dialGlide.durationMs));
    const ease = 1 - Math.pow(1 - p, 4); // smooth mechanical ease-out quart
    if (p >= 1) {
      dialGlide = null;
      lastRenderedDial = { rawHours: targetRaw, tHours: targetT, secondsSweep: targetS };
      return snap;
    }

    const curRaw = dialGlide.fromRaw + (targetRaw - dialGlide.fromRaw) * ease;
    const curT = ((curRaw % 12) + 12) % 12;
    const curS = lerpAngleWrap(dialGlide.fromS, targetS, 60, ease);
    lastRenderedDial = { rawHours: curRaw, tHours: curT, secondsSweep: curS };

    const angles = (window.TimerCore && typeof window.TimerCore.computeSatelliteAngles === 'function')
      ? window.TimerCore.computeSatelliteAngles(curT, curS)
      : snap.angles;

    return Object.assign({}, snap, {
      rawHours: curRaw,
      tHours: curT,
      secondsSweep: curS,
      angles: angles
    });
  }

  // Main Animation Loop (foreground 60fps) + 1s background heartbeat
  function renderFrame(nowPerf) {
    const dt = Math.min(100, Math.max(0, nowPerf - lastPerfMs));
    lastPerfMs = nowPerf;

    const nowMs = Date.now();
    if (demoActive) {
      demoEpochMs += dt * 600;
    }

    const evt = timer.tick(nowMs);
    if (evt) handleCompletionEvent(evt);

    const snap = timer.getDialSnapshot(nowMs, demoActive ? demoEpochMs : undefined);
    const dialSnap = getSmoothDialSnapshot(snap, nowPerf);
    if (satellite) satellite.render(dialSnap, nowPerf);
    syncCaseback(dialSnap, nowPerf);

    if (dom.digitalReadout && snap.digitalText !== lastDigitalText) {
      lastDigitalText = snap.digitalText;
      dom.digitalReadout.innerHTML = String(snap.digitalText).replace(/[^0-9:\-+ ]/g, '').replace(/:/g, '<span class="dr-colon">:</span>');
    }
    if (dom.remainingGauge && dom.remainingGaugeFill) {
      const showReserve = Boolean(snap.isCountdown) && !demoActive;
      dom.remainingGauge.hidden = false;
      dom.remainingGauge.classList.toggle('is-inactive', !showReserve);
      dom.remainingGauge.setAttribute('aria-hidden', String(!showReserve));
      if (showReserve) {
        const ratio = Math.max(0, Math.min(1, Number(snap.remainingRatio) || 0));
        dom.remainingGaugeFill.style.transform = `scaleX(${ratio.toFixed(4)})`;
        dom.remainingGauge.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
        dom.remainingGauge.classList.toggle('is-break', snap.phase === 'break');
        dom.remainingGauge.classList.toggle('is-warning', Boolean(snap.isWarning));
      }
    }
    syncStandbyEndTime(snap, nowMs);
    syncPhaseBadge(snap);
    if (timer.state.mode === 'stopwatch' && dom.btnSaveStopwatch) {
      dom.btnSaveStopwatch.hidden = false;
      dom.btnSaveStopwatch.disabled = !(snap.elapsedMs >= 10000);
    }
    if (dom.btnReset && timer.state.mode !== 'clock') {
      const showArchive = canArchiveCurrentMode() && snap.elapsedMs > 0;
      const wantTxt = showArchive ? '여기까지 보관' : '리셋';
      if (dom.btnReset.textContent !== wantTxt) {
        dom.btnReset.textContent = wantTxt;
        dom.btnReset.classList.toggle('is-archive-ready', showArchive);
      }
      if (dom.podDiscardRow) {
        dom.podDiscardRow.hidden = !(snap.elapsedMs > 0);
      }
    }

    const titleKey = `${snap.mode}:${snap.running}:${snap.digitalText}:${demoActive}`;
    if (titleKey !== lastTitleText) {
      lastTitleText = titleKey;
      updateDocumentTitle(snap);
    }

    requestAnimationFrame(renderFrame);
  }

  // Background-safe 1-second heartbeat for completion detection, title sync, and hourly chime
  setInterval(function () {
    const nowMs = Date.now();
    const evt = timer.tick(nowMs);
    if (evt) handleCompletionEvent(evt);
    checkHourlyChime(nowMs);
    if (document.hidden) {
      const snap = timer.getDialSnapshot(nowMs);
      updateDocumentTitle(snap);
    }
  }, 1000);

  // Persist active session cleanly before tab unload / iOS background suspension
  window.addEventListener('pagehide', persistActiveSession);
  window.addEventListener('beforeunload', persistActiveSession);

  // Initial Hydrate (Brushed Steel single theme)
  applySteelTheme();
  applyMannerMode(prefs.mannerMode, false);
  applyAlarmType(prefs.alarmType, false);
  if (dom.chkHourlyChime) dom.chkHourlyChime.checked = Boolean(prefs.hourlyChime);
  if (dom.chkCheersEnabled) dom.chkCheersEnabled.checked = prefs.cheersEnabled !== false;
  if (dom.appVersionLabel && window.CASPER_VERSION) {
    dom.appVersionLabel.textContent = 'v' + String(window.CASPER_VERSION).replace(/\.0$/, '');
  }
  setMusicAutoSync(prefs.musicAutoSync !== false);
  renderMusicPresets();
  syncMusicControlsUI();
  renderSubjects();

  setupNoticeStack();
  setupGlassSegments();

  // Phase 1-3: Restore active session (if any) from localStorage
  (function restoreSavedSessionOnBoot() {
    if (!window.ChronoStorage || typeof window.ChronoStorage.loadActiveSession !== 'function') return;
    const saved = window.ChronoStorage.loadActiveSession();
    if (!saved || saved.mode === 'clock') return;
    const res = timer.restore(saved, Date.now());
    if (!res.restored) return;
    if (res.completedEvent) {
      // Save stopped state first so a reload cannot double-complete
      persistActiveSession();
      syncModeUI();
      handleCompletionEvent(res.completedEvent);
    } else if (res.needsStopwatchReview) {
      persistActiveSession();
      syncModeUI();
      openStopwatchReviewModal();
    } else {
      syncModeUI();
      if (timer.state.running) {
        scheduleCompletionTimer();
        syncWakeLock(true);
        showToast('진행 중이던 세션을 불러왔어요', 2800);
        enterFocusOnTimerStart();
      }
    }
  })();

  bindQuickTimeWheels();
  syncModeUI();
  renderLogsAndStats();
  syncResumeVaultBanner();
  maybeShowIosInstallBanner();
  loadCheersPool();
  if (isBrandNewUserOnBoot) {
    openOnboardingOverlay();
  }
  requestAnimationFrame(renderFrame);

  // Safe PWA Service Worker registration (http/https only; skipped safely on file://)
  // Never force-reloads while a timer is running; surfaces an update banner when idle.
  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      const shouldReload = (window.CasperVersion && typeof window.CasperVersion.shouldReloadOnControllerChange === 'function')
        ? window.CasperVersion.shouldReloadOnControllerChange({ requested: swUpdateRequested, alreadyReloading: swRefreshing })
        : (swUpdateRequested && !swRefreshing);
      if (!shouldReload) return;
      swRefreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('sw.js').then(function (reg) {
      swRegistration = reg;
      lastSwUpdateCheckMs = Date.now();

      function trackWaiting(worker) {
        if (!worker) return;
        waitingServiceWorker = worker;
        syncSwUpdateBanner();
      }

      if (reg.waiting) {
        trackWaiting(reg.waiting);
      }

      reg.addEventListener('updatefound', function () {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', function () {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            trackWaiting(reg.waiting || newWorker);
          }
        });
      });
    }).catch(function () {});
  }
})();
