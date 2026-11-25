/**
 * NO.1 PRO — Application Controller (app.js)
 * Wires TimerCore, SatelliteEngine, ChronoAudio, and ChronoStorage.
 * Zero-Build, file:// safe, 0 inline handlers, XSS-safe rendering.
 */
(function () {
  'use strict';

  const escapeHtml = window.TimerCore.escapeHtml;

  const MODE_ORDER = ['clock', 'pomodoro', 'countdown', 'stopwatch'];

  const MODE_LABELS = {
    pomodoro: '포모도로',
    countdown: '타이머',
    stopwatch: '스톱워치',
    clock: '데스크 시계'
  };

  // Load persisted user preferences & watchmaker atelier state
  const prefs = window.ChronoStorage.loadPrefs();
  prefs.theme = 'steel';
  let atelierState = window.ChronoStorage.loadAtelier();
  let mountedCaliberId = null;
  const timer = window.TimerCore.createTimer({
    mode: 'clock',
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
  let drumCurrentMode = 'clock';
  let drumAnimTimerId = null;
  let lastDrumWheelMs = 0;
  let lastLockedCrownToastMs = 0;
  let deckFlipped = false;
  let atelierTapCount = 0;
  let lastAtelierTapMs = 0;
  let lastTitleText = '';
  let lastDigitalText = '';
  let lastPhaseKey = '';

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
    btnAssemblePart: document.getElementById('btnAssemblePart'),
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
    standbyHud: document.getElementById('standbyHud'),
    btnStandbyToggle: document.getElementById('btnStandbyToggle'),
    btnStandbyMusic: document.getElementById('btnStandbyMusic'),
    standbyMusicPill: document.getElementById('standbyMusicPill'),
    satelliteMount: document.getElementById('satelliteMount'),
    modeDrumChassis: document.getElementById('modeDrumChassis'),
    modeDrumViewport: document.getElementById('modeDrumViewport'),
    modeDrumStage: document.getElementById('modeDrumStage'),
    phaseBadgeRow: document.getElementById('phaseBadgeRow'),
    phaseBadge: document.getElementById('phaseBadge'),
    digitalReadout: document.getElementById('digitalReadout'),
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
    sheetPresetsRow: document.getElementById('sheetPresetsRow'),
    sheetMinutesDisplay: document.getElementById('sheetMinutesDisplay'),
    subjectSheet: document.getElementById('subjectSheet'),
    quickSubjectChips: document.getElementById('quickSubjectChips'),
    btnReflectionPrimary: document.getElementById('btnReflectionPrimary'),
    btnReflectionSaveOnly: document.getElementById('btnReflectionSaveOnly'),
    btnToggle: document.getElementById('btnToggle'),
    btnReset: document.getElementById('btnReset'),
    btnSaveStopwatch: document.getElementById('btnSaveStopwatch'),
    podClockPlate: document.getElementById('podClockPlate'),
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

  function showToast(message, durationMs) {
    if (!dom.toastBanner) return;
    dom.toastBanner.textContent = message;
    dom.toastBanner.hidden = false;
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = setTimeout(function () {
      dom.toastBanner.hidden = true;
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
    try {
      const notif = new Notification(title, {
        body: body,
        tag: 'casper-timer-complete',
        silent: Boolean(prefs.mannerMode)
      });
      notif.onclick = function () {
        try { window.focus(); } catch (e) {}
        notif.close();
      };
    } catch (e) {}
  }

  // A-3: Reset Confirmation Guard (when session has elapsed time)
  function clearResetConfirm() {
    resetConfirmArmed = false;
    if (resetConfirmTimerId) {
      clearTimeout(resetConfirmTimerId);
      resetConfirmTimerId = null;
    }
    if (dom.btnReset) {
      dom.btnReset.textContent = '리셋';
      dom.btnReset.classList.remove('is-confirm-reset');
    }
  }

  function handleProtectedReset(doneToastText) {
    const elapsedMs = timer.getElapsedMs(Date.now());
    if (elapsedMs > 0 && !resetConfirmArmed) {
      resetConfirmArmed = true;
      if (dom.btnReset) {
        dom.btnReset.textContent = '정말 리셋?';
        dom.btnReset.classList.add('is-confirm-reset');
      }
      if (resetConfirmTimerId) clearTimeout(resetConfirmTimerId);
      resetConfirmTimerId = setTimeout(clearResetConfirm, 3500);
      showToast('진행 중인 세션이 있습니다 — 한 번 더 누르면 리셋됩니다', 3200);
      return false;
    }
    clearResetConfirm();
    clearCompletionTimer();
    timer.reset();
    syncWakeLock(false);
    syncMusicWithTimer(false);
    syncControlLabels();
    syncTimerConfigUI();
    showToast(doneToastText || '타이머를 초기화했습니다');
    return true;
  }

  // A-3: Protected Mode Switch (blocks mode switch while timer is running)
  function trySwitchMode(nextMode, drumDir) {
    if (timer.state.running) {
      showToast('일시정지 후 모드를 바꾸세요');
      return false;
    }
    clearResetConfirm();
    clearCompletionTimer();
    demoActive = false;
    timer.setMode(nextMode);
    syncWakeLock(false);
    syncModeUI(drumDir);
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
    if (willStart) {
      requestNotificationPermissionOnce();
      closeQuickTimeSheet();
      closeSubjectSheet();
    }
    window.ChronoAudio.ensureContext();
    timer.toggle(Date.now());
    if (timer.state.running) {
      scheduleCompletionTimer();
    } else {
      clearCompletionTimer();
    }
    syncWakeLock(timer.state.running);
    syncMusicWithTimer(timer.state.running);
    syncWatchHint();
    syncControlLabels();
    syncTimerConfigUI();
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

  function openSubjectSheet() {
    renderSubjects();
    if (dom.subjectSheet) dom.subjectSheet.hidden = false;
    if (dom.frontSubjectTag) dom.frontSubjectTag.setAttribute('aria-expanded', 'true');
  }

  function closeSubjectSheet() {
    if (dom.subjectSheet) dom.subjectSheet.hidden = true;
    if (dom.frontSubjectTag) dom.frontSubjectTag.setAttribute('aria-expanded', 'false');
  }

  function isAnyModalOpen() {
    return Boolean(
      (dom.guideModal && !dom.guideModal.hidden) ||
      (dom.reflectionModal && !dom.reflectionModal.hidden) ||
      (dom.quickTimeSheet && !dom.quickTimeSheet.hidden) ||
      (dom.subjectSheet && !dom.subjectSheet.hidden)
    );
  }

  function applySteelTheme() {
    document.documentElement.setAttribute('data-theme', 'steel');
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', '#E6E9EE');
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
          ? '독서실 · 도서관 무음 매너 모드 ON — 모든 타종·배경음·음악을 음소거하고 외곽 링 발광으로만 알립니다'
          : '무음 매너 모드 OFF — 타종·배경음·음악 사운드 알림이 복원되었습니다',
        4200
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

  function setMusicDetailOpen(open) {
    musicDetailOpen = Boolean(open);
    if (dom.musicDetailDrawer) dom.musicDetailDrawer.hidden = !musicDetailOpen;
    if (dom.musicPlayerDock) dom.musicPlayerDock.classList.toggle('is-detail-open', musicDetailOpen);
    if (dom.btnMusicToggleDetail) {
      dom.btnMusicToggleDetail.classList.toggle('is-active', musicDetailOpen);
      dom.btnMusicToggleDetail.setAttribute('aria-expanded', String(musicDetailOpen));
      dom.btnMusicToggleDetail.textContent = musicDetailOpen ? '닫기' : '상세';
    }
  }

  function syncMusicControlsUI() {
    const inStandby = document.body.classList.contains('is-standby');
    const dockVisible = Boolean(dom.musicPlayerDock && !dom.musicPlayerDock.hidden);
    const effectivelyMuted = Boolean(musicMuted || prefs.mannerMode || Number(prefs.musicVolume) === 0);

    document.body.classList.toggle('has-standby-music-open', inStandby && dockVisible);
    if (dom.standbyMusicPill) {
      dom.standbyMusicPill.hidden = !inStandby || dockVisible;
    }
    if (dom.musicLiveDot) {
      dom.musicLiveDot.classList.toggle('is-playing', Boolean(activeMusic && musicPlaying && !effectivelyMuted));
      dom.musicLiveDot.classList.toggle('is-idle', !activeMusic);
    }
    if (dom.musicNowTitle) {
      dom.musicNowTitle.textContent = activeMusic ? activeMusic.title : '재생할 음악을 선택하세요';
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
      dom.btnMusicPlayPause.textContent = (activeMusic && musicPlaying) ? '정지' : '재생';
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
      showToast('올바른 YouTube Music 또는 YouTube 링크를 입력해 주세요');
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
    if (dom.musicPlayerDock) dom.musicPlayerDock.hidden = false;
    if (dom.musicIframe) {
      dom.musicIframe.src = embedUrl;
    }

    renderMusicPresets();
    syncMusicControlsUI();
    showToast(isFileProto ? '로컬 파일 실행 중 — YT↗ 팝업으로 열면 바로 재생됩니다' : `[${title}] 불러옴`);
    return true;
  }

  function unloadMusicTrack() {
    activeMusic = null;
    musicPlaying = false;
    musicStandbyVideoOpen = false;
    setMusicDetailOpen(false);
    if (dom.musicIframe) dom.musicIframe.src = 'about:blank';
    if (dom.musicPlayerDock) dom.musicPlayerDock.hidden = true;
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
        if (dom.musicPlayerDock) dom.musicPlayerDock.hidden = false;
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
    const nextIdx = (idx + delta + MODE_ORDER.length) % MODE_ORDER.length;
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
      showToast('600× 기계식 고속 시연 시작 (다이얼 더블 클릭 시 종료)');
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
          showToast('타이머 일시정지 후 용두를 뽑아 시간을 조절하세요');
          return;
        }
        if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
          if (satellite) satellite.setCrownPosition(0, true);
          showToast('포모도로·타이머 모드에서 용두를 뽑아 시간을 설정할 수 있습니다');
          return;
        }
        window.ChronoAudio.playCrownPull(true);
        if (pos === 1) {
          showToast('용두 1단 인출 — ±1분 설정 (한 번 더 클릭 시 2단 ±5분)');
        } else {
          showToast('용두 2단 인출 — ±5분 설정 (다시 클릭 시 잠금 복귀)');
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
        showToast('타이머 일시정지 후 용두를 뽑아 시간을 조절하세요');
      } else if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
        showToast('포모도로·타이머 모드에서 용두를 뽑아 시간을 설정할 수 있습니다');
      } else {
        showToast('용두가 잠겨 있습니다 — 클릭해 1단(±1분) 또는 2단(±5분)으로 뽑아 조절하세요');
      }
    },
    onCrownStep: function (deltaMinutes) {
      if (demoActive) {
        showToast('시연 모드에서는 용두 조절이 비활성화됩니다');
        return;
      }
      if (timer.state.running) {
        showToast('타이머 일시정지 후 용두를 뽑아 시간을 조절하세요');
        return;
      }
      const changed = timer.adjustMinutes(deltaMinutes);
      if (changed) {
        window.ChronoAudio.playCrownRatchet();
        persistTimerMinutes();
        syncTimerConfigUI();
      } else if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
        showToast('포모도로·타이머 모드에서 용두를 뽑아 시간을 설정할 수 있습니다');
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

  const CALIBER_META = {
    'cal-a': {
      title: 'NO.1 ALGEBRA',
      homage: 'CASPER · GOLDEN RATIO MOONPHASE'
    },
    'cal-e': {
      title: 'NO.5 ELLIPSE',
      homage: 'CASPER · SATELLITE ORBIT'
    },
    'cal-b': {
      title: 'NO.2 BINARY',
      homage: 'CASPER · 0/1 JUMPING HOUR'
    },
    'cal-c': {
      title: 'NO.3 CYCLOID',
      homage: 'CASPER · DOUBLE RETROGRADE'
    },
    'cal-g': {
      title: 'NO.7 GEOMETRY',
      homage: 'CASPER · BAUHAUS TANGENTE'
    }
  };

  function mountActiveCaliber(caliberId, finishId) {
    let targetId = 'cal-e';
    if (caliberId === 'cal-a' && window.AlgebraWatchEngine) targetId = 'cal-a';
    else if (caliberId === 'cal-b' && window.JumpWatchEngine) targetId = 'cal-b';
    else if (caliberId === 'cal-c' && window.CycloidWatchEngine) targetId = 'cal-c';
    else if (caliberId === 'cal-g' && window.GeometryWatchEngine) targetId = 'cal-g';

    if (mountedCaliberId !== targetId) {
      mountedCaliberId = targetId;
      if (targetId === 'cal-a') {
        satellite = window.AlgebraWatchEngine.mount(dom.satelliteMount, watchCallbacks);
      } else if (targetId === 'cal-b') {
        satellite = window.JumpWatchEngine.mount(dom.satelliteMount, watchCallbacks);
      } else if (targetId === 'cal-c') {
        satellite = window.CycloidWatchEngine.mount(dom.satelliteMount, watchCallbacks);
      } else if (targetId === 'cal-g') {
        satellite = window.GeometryWatchEngine.mount(dom.satelliteMount, watchCallbacks);
      } else {
        satellite = window.SatelliteEngine.mount(dom.satelliteMount, watchCallbacks);
      }
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
      showToast('독서실 무음 모드 — 시각 발광 알림 테스트');
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
    syncModeDrum(mode, drumDir);
    document.querySelectorAll('[data-action="set-mode"]').forEach(function (btn) {
      const nextActive = btn.getAttribute('data-mode') === mode;
      const wasActive = btn.classList.contains('is-active');
      btn.classList.toggle('is-active', nextActive);
      btn.setAttribute('aria-pressed', nextActive ? 'true' : 'false');
      if (wasActive && !nextActive) triggerRockerRebound(btn);
    });

    const isClock = mode === 'clock';
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
    const currentMins = st.mode === 'pomodoro'
      ? (st.phase === 'break' ? st.breakMinutes : st.focusMinutes)
      : st.countdownMinutes;
    const formattedMins = formatMinutesKo(currentMins);

    if (dom.roundIndicator) {
      const phaseTxt = st.phase === 'break' ? '휴식' : '집중';
      dom.roundIndicator.textContent = `라운드 #${st.round} (${phaseTxt})`;
    }
    if (dom.configMinutesDisplay && isAdjustableMode) {
      dom.configMinutesDisplay.textContent = formattedMins;
    }
    if (dom.sheetMinutesDisplay && isAdjustableMode) {
      dom.sheetMinutesDisplay.textContent = formattedMins;
    }
    if (dom.sheetPresetsRow) {
      dom.sheetPresetsRow.hidden = st.mode !== 'pomodoro';
    }
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
    if (dom.quickTimeLabel && isAdjustableMode) {
      dom.quickTimeLabel.textContent = formattedMins;
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
      dom.btnToggle.textContent = label;
      dom.btnToggle.classList.toggle('is-running', st.running);
    }
    if (dom.btnStandbyToggle) {
      dom.btnStandbyToggle.hidden = st.mode === 'clock';
      dom.btnStandbyToggle.textContent = st.running ? '일시정지' : '시작';
    }
    if (dom.btnSaveStopwatch) {
      const isSw = st.mode === 'stopwatch';
      const elapsed = timer.getElapsedMs(Date.now());
      dom.btnSaveStopwatch.hidden = !isSw;
      dom.btnSaveStopwatch.disabled = !(isSw && elapsed >= 10000);
    }
    syncLiveStatusStrip();
  }

  function renderSubjects() {
    syncLiveStatusStrip();
    const htmlBack = prefs.subjects.map(function (sub) {
      const isAct = sub === prefs.selectedSubject;
      const safe = escapeHtml(sub);
      return `<button type="button" class="subject-chip${isAct ? ' is-active' : ''}" data-action="select-subject" data-subject="${safe}">${safe}</button>`;
    }).join('');
    if (dom.subjectChips) {
      dom.subjectChips.innerHTML = htmlBack;
    }
    if (dom.quickSubjectChips) {
      dom.quickSubjectChips.innerHTML = prefs.subjects.map(function (sub) {
        const isAct = sub === prefs.selectedSubject;
        const safe = escapeHtml(sub);
        return `<button type="button" class="subject-chip${isAct ? ' is-active' : ''}" data-action="select-subject-quick" data-subject="${safe}">${safe}</button>`;
      }).join('');
    }
  }

  // B-3 & B-5: Front Motivation One-Liner + Desktop Summary (reuses Storage & Atelier snapshots!)
  function syncMotivationLine(precomputedSummary, precomputedSnap) {
    const logs = window.ChronoStorage.loadLogs();
    const summary = precomputedSummary || window.ChronoStorage.getStatsSummary(logs);
    const snap = precomputedSnap || (window.CasperAtelier
      ? window.CasperAtelier.computeAtelierSnapshot(logs, atelierState)
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
        line = `${prefix} · ${snap.readyPart.code} 부품 조립 가능!`;
      } else if (snap.machiningPart) {
        line = `${todayPart} · 다음 부품까지 ${fmt(snap.machiningPart.remainingMinutes)}`;
      } else {
        line = todayPart;
      }

      if (dom.deskAtelierLabel && dom.deskAtelierBarFill) {
        if (snap.allProjectsComplete) {
          dom.deskAtelierLabel.textContent = '공방 4종 칼리버(NO.1·2·3·7) 조립 완료';
          dom.deskAtelierBarFill.style.width = '100%';
        } else if (snap.readyPart) {
          dom.deskAtelierLabel.textContent = `${snap.activeProject.name} · ${snap.readyPart.code} 조립 가능!`;
          dom.deskAtelierBarFill.style.width = '100%';
        } else if (snap.machiningPart) {
          dom.deskAtelierLabel.textContent = `${snap.activeProject.name} · 다음 부품까지 ${fmt(snap.machiningPart.remainingMinutes)} (${snap.machiningPart.pct}%)`;
          dom.deskAtelierBarFill.style.width = `${snap.machiningPart.pct}%`;
        }
      }
    } else {
      line = todayMins > 0 ? `오늘 ${formatMinutesKo(todayMins)} 집중` : '첫 세션을 시작해 보세요';
    }

    if (dom.statusLine) {
      dom.statusLine.textContent = line;
    }
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
    const snap = window.CasperAtelier.computeAtelierSnapshot(logs, atelierState);
    const fmt = window.CasperAtelier.formatMinutesShortKo;

    // Keep mounted watch in lockstep with unlocked state
    mountActiveCaliber(snap.activeWatch, 'steel');

    if (dom.frontAtelierDot) dom.frontAtelierDot.hidden = !snap.hasActionablePart;
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
        dom.atelierNextPartLabel.textContent = 'NO.1 · NO.2 · NO.3 · NO.7 모든 공방 칼리버 조립 완료!';
        dom.atelierNextPartPct.textContent = '100%';
        dom.atelierBarFill.style.width = '100%';
      } else if (snap.readyPart) {
        dom.atelierNextPartLabel.textContent = `${proj.name} · ${snap.readyPart.code} ${snap.readyPart.name} 가공 완료!`;
        dom.atelierNextPartPct.textContent = '조립 가능';
        dom.atelierBarFill.style.width = '100%';
      } else if (snap.machiningPart) {
        dom.atelierNextPartLabel.textContent = `${snap.machiningPart.code} ${snap.machiningPart.name} 가공 중`;
        dom.atelierNextPartPct.textContent = `${snap.machiningPart.pct}%`;
        dom.atelierBarFill.style.width = `${snap.machiningPart.pct}%`;
      }
    }

    if (dom.atelierPartsGrid) {
      dom.atelierPartsGrid.innerHTML = snap.parts.map(function (p) {
        const badge = p.status === 'assembled'
          ? '완료'
          : (p.status === 'ready' ? '조립!' : `${p.pct}%`);
        return [
          `<div class="atelier-part-chip is-${p.status}" title="${escapeHtml(p.desc)} (목표 누적 ${fmt(p.cumMinutes)})">`,
          `  <span class="part-code">${escapeHtml(p.code)}</span>`,
          `  <span class="part-name">${escapeHtml(p.name)}</span>`,
          `  <span class="part-state">${escapeHtml(badge)}</span>`,
          '</div>'
        ].join('');
      }).join('');
    }

    if (dom.btnAssemblePart) {
      if (snap.allProjectsComplete) {
        dom.btnAssemblePart.disabled = true;
        dom.btnAssemblePart.classList.remove('is-ready');
        dom.btnAssemblePart.textContent = '공방 4종 칼리버(NO.1·2·3·7) 조립 완료';
      } else if (snap.readyPart) {
        dom.btnAssemblePart.disabled = false;
        dom.btnAssemblePart.classList.add('is-ready');
        dom.btnAssemblePart.textContent = `${proj.name} · ${snap.readyPart.code} ${snap.readyPart.name} 조립하기`;
      } else if (snap.machiningPart) {
        dom.btnAssemblePart.disabled = true;
        dom.btnAssemblePart.classList.remove('is-ready');
        dom.btnAssemblePart.textContent = `${snap.machiningPart.code} ${snap.machiningPart.name} 가공 중 (${fmt(snap.machiningPart.remainingMinutes)} 남음)`;
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
        return [
          `<div class="caliber-row${c.active ? ' is-equipped' : ''}${c.unlocked ? ' is-unlocked' : ' is-locked'}${c.playable ? ' is-playable' : ' is-concept'}">`,
          `  <span class="caliber-letter-badge${c.active ? ' is-active' : (c.playable ? ' is-playable' : '')}" aria-hidden="true">${escapeHtml(c.num || c.letter)}</span>`,
          '  <div class="caliber-info">',
          `    <div class="caliber-name">${escapeHtml(c.name)} <span class="caliber-ko">${escapeHtml(c.korean)}</span></div>`,
          `    <div class="caliber-sub">${escapeHtml(c.subtitle)}</div>`,
          '  </div>',
          `  <button type="button" class="small-btn${c.active ? ' is-solid' : ''}" data-action="select-caliber" data-caliber="${escapeHtml(c.id)}"${disabledAttr}>${escapeHtml(stateText)}</button>`,
          '</div>'
        ].join('');
      }).join('');
    }
    syncMotivationLine(null, snap);
  }

  function openReflectionModal(logEntry, titleText, opts) {
    const o = opts || {};
    activeReflectionLogId = logEntry.id;
    activeReflectionCanStartBreak = Boolean(o.canStartBreak);
    if (dom.reflectionTitle) dom.reflectionTitle.textContent = titleText;
    if (dom.reflectionDesc) {
      dom.reflectionDesc.textContent = `[${logEntry.subject}] ${formatMinutesKo(logEntry.minutes)} 세션이 저장되었습니다. 1줄 회고 메모를 남겨보세요.`;
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
      const snap = window.CasperAtelier.computeAtelierSnapshot(window.ChronoStorage.loadLogs(), atelierState);
      const fmt = window.CasperAtelier.formatMinutesShortKo;
      let rewardHtml = '';
      if (snap.readyPart) {
        rewardHtml = `<strong>+${formatMinutesKo(logEntry.minutes)} 공방 반영</strong> · <span>${escapeHtml(snap.activeProject.name)} ${escapeHtml(snap.readyPart.code)} ${escapeHtml(snap.readyPart.name)} 가공 완료! 뒷면 공방에서 조립하세요</span>`;
      } else if (snap.machiningPart) {
        rewardHtml = `<strong>+${formatMinutesKo(logEntry.minutes)} 공방 반영</strong> · <span>${escapeHtml(snap.activeProject.name)} ${escapeHtml(snap.machiningPart.code)} ${escapeHtml(snap.machiningPart.name)} ${snap.machiningPart.pct}% (${fmt(snap.machiningPart.remainingMinutes)} 남음)</span>`;
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
      const canStartBreak = evt.mode === 'pomodoro' && timer.state.phase === 'break' && !timer.state.running;
      openReflectionModal(saved, `${formatMinutesKo(evt.minutes)} 집중을 마쳤습니다`, { canStartBreak: canStartBreak });
      sendBackgroundNotification(
        `CASPER — ${formatMinutesKo(evt.minutes)} 집중 완료`,
        `[${prefs.selectedSubject}] 세션이 기록되었습니다.${canStartBreak ? ' 휴식을 시작할 준비가 되었습니다.' : ''}`
      );
    } else if (evt.finishedPhase === 'break') {
      showToast(`휴식 완료 — 집중 라운드 #${evt.nextRound} 준비됨`);
      sendBackgroundNotification(
        'CASPER — 휴식 완료',
        `집중 라운드 #${evt.nextRound}를 시작할 시간입니다.`
      );
    }

    if (timer.state.running) {
      scheduleCompletionTimer();
    }
    syncWakeLock(timer.state.running);
    syncMusicWithTimer(timer.state.running);
    syncTimerConfigUI();
    syncControlLabels();
  }

  function handleAtelierDevTap() {
    const now = Date.now();
    if (now - lastAtelierTapMs > 2500) {
      atelierTapCount = 0;
    }
    lastAtelierTapMs = now;
    atelierTapCount += 1;
    if (atelierTapCount === 4) {
      showToast(atelierState.devMode ? '1회 더 누르면 개발자 모드가 해제됩니다' : '1회 더 누르면 개발자 모드가 활성화됩니다', 1600);
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

  function setDeckFlipped(flipped, silent) {
    const next = Boolean(flipped);
    if (next === deckFlipped) return;
    deckFlipped = next;
    if (dom.monolithFlipper) {
      dom.monolithFlipper.classList.toggle('is-flipped', deckFlipped);
    }
    if (dom.backControlDeck) {
      dom.backControlDeck.setAttribute('aria-hidden', String(!deckFlipped));
    }
    if (deckFlipped && satellite && satellite.isCrownPulled()) {
      satellite.setCrownPosition(0, true);
      syncLiveStatusStrip();
    }
    if (!silent) {
      window.ChronoAudio.playCrownRatchet();
    }
  }

  function toggleStandby() {
    const willEnter = !document.body.classList.contains('is-standby');
    if (willEnter && deckFlipped) {
      setDeckFlipped(false, true);
    }
    document.body.classList.toggle('is-standby', willEnter);
    if (dom.standbyHud) dom.standbyHud.setAttribute('aria-hidden', String(!willEnter));
    if (dom.chkStandbyMode) dom.chkStandbyMode.checked = willEnter;
    if (dom.topbarStandbySwitch) dom.topbarStandbySwitch.classList.toggle('is-active', willEnter);
    if (willEnter) {
      musicStandbyVideoOpen = false;
      const isDesktopFinePointer = Boolean(
        window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
      );
      if (isDesktopFinePointer && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
      showToast('스탠바이 모드 ON — 시계 클릭으로 시작/정지 · Esc로 종료', 3400);
    } else {
      if (!activeMusic && dom.musicPlayerDock) {
        dom.musicPlayerDock.hidden = true;
        setMusicDetailOpen(false);
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    }
    syncMusicControlsUI();
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
      document.title = `CASPER — ${watchTitle} 기계식 공부 타이머`;
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
    if (dom.btnQuickTick) dom.btnQuickTick.classList.toggle('is-on', t > 0);
    if (dom.btnQuickRain) dom.btnQuickRain.classList.toggle('is-on', r > 0);
    if (dom.btnQuickCafe) dom.btnQuickCafe.classList.toggle('is-on', c > 0);
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
    if (e.target === dom.subjectSheet) {
      closeSubjectSheet();
      return;
    }
    if (e.target === dom.guideModal) {
      closeGuideModal();
      return;
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;
    if (target.closest('summary')) {
      e.preventDefault();
      e.stopPropagation();
    }
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
        handleProtectedReset('타이머를 초기화했습니다');
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
        syncWakeLock(false);
        syncControlLabels();
        renderLogsAndStats();
        openReflectionModal(saved, `스톱워치 ${formatMinutesKo(mins)} 기록 완료`);
        break;
      }

      case 'flip-deck':
        setDeckFlipped(!deckFlipped, false);
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
        showToast('[DEV] +60분 테스트 순공 기록을 추가했습니다');
        break;

      case 'dev-reset-parts':
        if (!atelierState.devMode) break;
        atelierState.assembledParts = { 'cal-b': [], 'cal-c': [], 'cal-g': [], 'cal-a': [] };
        atelierState = window.ChronoStorage.saveAtelier(atelierState);
        window.ChronoAudio.playCrownRatchet();
        renderAtelier();
        showToast('[DEV] NO.1 · NO.2 · NO.3 · NO.7 부품 조립 상태를 초기화했습니다');
        break;

      case 'assemble-part': {
        if (!window.CasperAtelier) break;
        const logs = window.ChronoStorage.loadLogs();
        const res = window.CasperAtelier.assembleNextPart(logs, atelierState);
        if (!res.ok) {
          showToast('아직 조립 가능한 부품이 없습니다');
          break;
        }
        atelierState = window.ChronoStorage.saveAtelier(res.state);
        if (res.completedCaliber && res.completedCaliberId) {
          atelierState.activeWatch = res.completedCaliberId;
          atelierState = window.ChronoStorage.saveAtelier(atelierState);
          window.ChronoAudio.strikeClassicGong('low', 0);
          window.ChronoAudio.strikeClassicGong('high', 0.24);
          showToast(`${res.completedCaliberName} 최종 완성! 앞면 시계에 새 칼리버가 장착되었습니다`, 4200);
        } else {
          window.ChronoAudio.playCrownPull(true);
          showToast(`${res.assembledPart.code} ${res.assembledPart.name} 조립 완료!`, 3000);
        }
        renderAtelier();
        break;
      }

      case 'select-caliber': {
        const calId = target.getAttribute('data-caliber');
        if (!calId || !window.CasperAtelier) break;
        const snap = window.CasperAtelier.computeAtelierSnapshot(window.ChronoStorage.loadLogs(), atelierState);
        const found = snap.calibers.find(function (c) { return c.id === calId; });
        if (!found || !found.unlocked) {
          showToast('아직 완성되지 않은 칼리버입니다');
          break;
        }
        atelierState.activeWatch = calId;
        atelierState = window.ChronoStorage.saveAtelier(atelierState);
        window.ChronoAudio.playCrownRatchet();
        renderAtelier();
        showToast(`${found.name} 칼리버를 앞면 시계에 장착했습니다`);
        break;
      }

      case 'set-mode':
        trySwitchMode(target.getAttribute('data-mode'));
        break;

      case 'step-mode-drum':
        stepModeDrum(Number(target.getAttribute('data-dir')) || 1);
        break;

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
          showToast('일시정지 상태에서 시간을 조절할 수 있습니다');
          break;
        }
        if (timer.adjustMinutes(delta)) {
          clearResetConfirm();
          window.ChronoAudio.playCrownRatchet();
          persistTimerMinutes();
          syncTimerConfigUI();
        }
        break;
      }

      case 'reset-round':
        clearResetConfirm();
        clearCompletionTimer();
        timer.reset({ resetRound: true });
        syncWakeLock(false);
        syncTimerConfigUI();
        syncControlLabels();
        showToast('포모도로 라운드를 #1로 초기화했습니다');
        break;

      case 'select-subject':
      case 'select-subject-quick': {
        const sub = target.getAttribute('data-subject');
        if (sub) {
          prefs.selectedSubject = sub;
          window.ChronoStorage.savePrefs(prefs);
          renderSubjects();
          if (action === 'select-subject-quick') {
            closeSubjectSheet();
            window.ChronoAudio.playCrownRatchet();
            showToast(`과목 [${sub}] 선택됨`);
          }
        }
        break;
      }

      case 'set-alarm':
        applyAlarmType(target.getAttribute('data-alarm'), true);
        break;

      case 'test-alarm':
        if (prefs.mannerMode) {
          if (satellite) satellite.triggerVisualAlarm();
          showToast('독서실 무음 모드 활성화 상태 — 시각 발광으로 표시했습니다');
        } else {
          window.ChronoAudio.playSessionCompleteAlarm();
        }
        break;

      case 'mute-ambience':
        toggleAmbienceMute();
        break;

      case 'export-json': {
        const blob = new Blob([window.ChronoStorage.exportBackupJson()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `no1-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showToast('공부 기록 JSON 백업 파일을 저장했습니다');
        break;
      }

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
          showToast('먼저 유효한 YouTube Music 링크를 붙여넣어 주세요');
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
        const dockHidden = dom.musicPlayerDock ? dom.musicPlayerDock.hidden : true;
        if (dockHidden) {
          if (dom.musicPlayerDock) dom.musicPlayerDock.hidden = false;
          setMusicDetailOpen(!activeMusic || !musicDetailOpen);
        } else if (activeMusic) {
          setMusicDetailOpen(!musicDetailOpen);
        } else {
          setMusicDetailOpen(false);
          if (dom.musicPlayerDock) dom.musicPlayerDock.hidden = true;
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
          showToast('유효한 YouTube Music 링크를 붙여넣어 주세요');
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
          const labels = { tick: '4Hz 탈진기 ASMR', rain: '빗소리', cafe: '카페 앰비언스' };
          showToast(`${labels[ch] || ch} ${cur > 0 ? '꺼짐' : '40% 켜짐'}`);
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
      showToast(`과목 [${val}] 선택됨`);
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
        scheduleCompletionTimer();
        syncWakeLock(true);
        syncMusicWithTimer(true);
        syncControlLabels();
        syncTimerConfigUI();
        showToast(savedMemo ? '메모 저장 완료 · 휴식을 시작합니다' : '휴식을 시작합니다');
      } else if (savedMemo) {
        showToast('회고 메모가 저장되었습니다');
      }
    });
  }

  if (dom.chkAutoBreak) {
    dom.chkAutoBreak.addEventListener('change', function () {
      timer.state.autoStartBreak = dom.chkAutoBreak.checked;
    });
  }

  if (dom.chkMannerMode) {
    dom.chkMannerMode.addEventListener('change', function () {
      applyMannerMode(dom.chkMannerMode.checked, true);
    });
  }

  if (dom.chkStandbyMode) {
    dom.chkStandbyMode.addEventListener('change', function () {
      const wantStandby = dom.chkStandbyMode.checked;
      const isStandby = document.body.classList.contains('is-standby');
      if (wantStandby !== isStandby) {
        toggleStandby();
      }
    });
  }

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
          showToast(`복원 완료: ${res.added}건 추가 (총 ${res.total}건)`);
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
      if (dom.quickTimeSheet && !dom.quickTimeSheet.hidden) {
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
      toggleStandby();
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

  // Re-acquire Wake Lock & snap immediately when returning from background tab
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      syncWakeLock(timer.state.running);
      const evt = timer.tick(Date.now());
      if (evt) handleCompletionEvent(evt);
    }
  });

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
    if (satellite) satellite.render(snap, nowPerf);

    if (dom.digitalReadout && snap.digitalText !== lastDigitalText) {
      lastDigitalText = snap.digitalText;
      dom.digitalReadout.textContent = snap.digitalText;
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
    syncPhaseBadge(snap);
    if (timer.state.mode === 'stopwatch' && dom.btnSaveStopwatch) {
      dom.btnSaveStopwatch.hidden = false;
      dom.btnSaveStopwatch.disabled = !(snap.elapsedMs >= 10000);
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

  // Initial Hydrate (Brushed Steel single theme)
  applySteelTheme();
  applyMannerMode(prefs.mannerMode, false);
  applyAlarmType(prefs.alarmType, false);
  if (dom.chkHourlyChime) dom.chkHourlyChime.checked = Boolean(prefs.hourlyChime);
  setMusicAutoSync(prefs.musicAutoSync !== false);
  renderMusicPresets();
  syncMusicControlsUI();
  renderSubjects();
  syncModeUI();
  renderLogsAndStats();
  requestAnimationFrame(renderFrame);

  // Safe PWA Service Worker registration (http/https only; skipped safely on file://)
  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
