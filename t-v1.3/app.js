/**
 * NO.1 PRO — Application Controller (app.js)
 * Wires TimerCore, SatelliteEngine, ChronoAudio, and ChronoStorage.
 * Zero-Build, file:// safe, 0 inline handlers, XSS-safe rendering.
 */
(function () {
  'use strict';

  const escapeHtml = window.TimerCore.escapeHtml;

  const MODE_ORDER = ['pomodoro', 'countdown', 'stopwatch', 'clock'];

  const MODE_LABELS = {
    pomodoro: '포모도로',
    countdown: '타이머',
    stopwatch: '스톱워치',
    clock: '데스크 시계'
  };

  // Load persisted user preferences (Steel-only design)
  const prefs = window.ChronoStorage.loadPrefs();
  prefs.theme = 'steel';
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
  let toastTimerId = null;
  let savedAmbience = null; // For M-key quick mute/restore
  let activeMusic = null;   // { id, title, url, parsed }
  let musicPlaying = false;
  let musicMuted = false;
  let musicFrameCollapsed = false;
  let musicDetailOpen = false;
  let musicStandbyVideoOpen = false;
  let drumCurrentMode = 'pomodoro';
  let drumAnimTimerId = null;
  let lastDrumWheelMs = 0;
  let lastLockedCrownToastMs = 0;

  // DOM references
  const dom = {
    metaThemeColor: document.getElementById('metaThemeColor'),
    stageStatusStrip: document.getElementById('stageStatusStrip'),
    activeStateLabel: document.getElementById('activeStateLabel'),
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
    digitalReadout: document.getElementById('digitalReadout'),
    statusLine: document.getElementById('statusLine'),
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
    demoActive = false;
    timer.setMode(nextMode);
    syncWakeLock(false);
    syncModeUI(dir);
    window.ChronoAudio.playCrownRatchet();
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
        dom.crownModeBadge.textContent = '용두 2단 · ±10분 설정';
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
  }

  function openGuideModal() {
    if (dom.guideModal) dom.guideModal.hidden = false;
  }

  function closeGuideModal() {
    if (dom.guideModal) dom.guideModal.hidden = true;
  }

  // Mount Satellite Watch SVG Engine
  const satellite = window.SatelliteEngine.mount(dom.satelliteMount, {
    onCrownPullChange: function (pos) {
      if (pos > 0) {
        if (demoActive) {
          satellite.setCrownPosition(0, true);
          showToast('시연 모드에서는 용두 인출이 비활성화됩니다');
          return;
        }
        if (timer.state.running) {
          satellite.setCrownPosition(0, true);
          showToast('타이머 일시정지 후 용두를 뽑아 시간을 조절하세요');
          return;
        }
        if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
          satellite.setCrownPosition(0, true);
          showToast('포모도로·타이머 모드에서 용두를 뽑아 시간을 설정할 수 있습니다');
          return;
        }
        window.ChronoAudio.playCrownPull(true);
        if (pos === 1) {
          showToast('용두 1단 인출 — ±1분 설정 (한 번 더 클릭 시 2단 ±10분)');
        } else {
          showToast('용두 2단 인출 — ±10분 설정 (다시 클릭 시 잠금 복귀)');
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
        showToast('용두가 잠겨 있습니다 — 클릭해 1단(±1분) 또는 2단(±10분)으로 뽑아 조절하세요');
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
      triggerManualGong();
    },
    onDialDoubleClick: function () {
      toggleDemoMode();
    }
  });

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
  }

  function syncTimerConfigUI() {
    const st = timer.state;
    if (dom.roundIndicator) {
      const phaseTxt = st.phase === 'break' ? '휴식' : '집중';
      dom.roundIndicator.textContent = `라운드 #${st.round} (${phaseTxt})`;
    }
    if (dom.configMinutesDisplay) {
      if (st.mode === 'pomodoro') {
        const mins = st.phase === 'break' ? st.breakMinutes : st.focusMinutes;
        dom.configMinutesDisplay.textContent = formatMinutesKo(mins);
      } else if (st.mode === 'countdown') {
        dom.configMinutesDisplay.textContent = formatMinutesKo(st.countdownMinutes);
      }
    }
    document.querySelectorAll('[data-action="set-preset"]').forEach(function (btn) {
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
      const elapsed = timer.getElapsedMs(Date.now());
      dom.btnSaveStopwatch.hidden = !(st.mode === 'stopwatch' && elapsed >= 10000);
    }
    syncLiveStatusStrip();
  }

  function renderSubjects() {
    if (!dom.subjectChips) return;
    syncLiveStatusStrip();
    dom.subjectChips.innerHTML = prefs.subjects.map(function (sub) {
      const isAct = sub === prefs.selectedSubject;
      const safe = escapeHtml(sub);
      return `<button type="button" class="subject-chip${isAct ? ' is-active' : ''}" data-action="select-subject" data-subject="${safe}">${safe}</button>`;
    }).join('');
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
  }

  function openReflectionModal(logEntry, titleText) {
    activeReflectionLogId = logEntry.id;
    if (dom.reflectionTitle) dom.reflectionTitle.textContent = titleText;
    if (dom.reflectionDesc) {
      dom.reflectionDesc.textContent = `[${logEntry.subject}] ${formatMinutesKo(logEntry.minutes)} 세션이 저장되었습니다. 1줄 회고 메모를 추가할 수 있습니다.`;
    }
    if (dom.reflectionInput) dom.reflectionInput.value = '';
    if (dom.reflectionModal) dom.reflectionModal.hidden = false;
    setTimeout(function () {
      if (dom.reflectionInput) dom.reflectionInput.focus();
    }, 30);
  }

  function closeReflectionModal() {
    activeReflectionLogId = null;
    if (dom.reflectionModal) dom.reflectionModal.hidden = true;
  }

  function handleCompletionEvent(evt) {
    if (!evt) return;
    if (satellite) satellite.triggerVisualAlarm();
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
      openReflectionModal(saved, `${formatMinutesKo(evt.minutes)} 집중을 마쳤습니다`);
    } else if (evt.finishedPhase === 'break') {
      showToast(`휴식 완료 — 집중 라운드 #${evt.nextRound} 준비됨`);
    }

    syncWakeLock(timer.state.running);
    syncMusicWithTimer(timer.state.running);
    syncTimerConfigUI();
    syncControlLabels();
  }

  function switchTab(tabName) {
    const map = { timer: 'panelTimer', sound: 'panelSound', log: 'panelLog' };
    if (!map[tabName]) return;
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
    }
  }

  function toggleStandby() {
    const willEnter = !document.body.classList.contains('is-standby');
    document.body.classList.toggle('is-standby', willEnter);
    if (dom.standbyHud) dom.standbyHud.setAttribute('aria-hidden', String(!willEnter));
    if (dom.chkStandbyMode) dom.chkStandbyMode.checked = willEnter;
    if (dom.topbarStandbySwitch) dom.topbarStandbySwitch.classList.toggle('is-active', willEnter);
    if (willEnter) {
      musicStandbyVideoOpen = false;
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
      showToast('풀스크린 스탠바이 모드 ON — Esc 또는 F로 종료합니다', 3400);
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
    if (demoActive) {
      document.title = '[600× 시연] NO.1 PRO';
      return;
    }
    if (snapshot.mode === 'clock') {
      document.title = `[${snapshot.digitalText}] NO.1 PRO`;
      return;
    }
    if (snapshot.running) {
      const phaseShort = snapshot.mode === 'stopwatch'
        ? '스톱워치'
        : (snapshot.phase === 'break' ? '휴식' : '집중');
      document.title = `[${snapshot.digitalText}] ${phaseShort} · NO.1 PRO`;
    } else {
      document.title = 'NO.1 PRO — 기계식 새틀라이트 공부 타이머';
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

  // Event Delegation for all [data-action] buttons
  document.addEventListener('click', function (e) {
    if (dom.guideModal && !dom.guideModal.hidden && e.target === dom.guideModal) {
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

      case 'toggle-timer':
        if (demoActive) {
          demoActive = false;
        }
        if (satellite && satellite.isCrownPulled()) {
          satellite.setCrownPulled(false, true);
        }
        window.ChronoAudio.ensureContext();
        timer.toggle(Date.now());
        syncWakeLock(timer.state.running);
        syncMusicWithTimer(timer.state.running);
        syncWatchHint();
        syncControlLabels();
        break;

      case 'reset-timer':
        timer.reset();
        syncWakeLock(false);
        syncMusicWithTimer(false);
        syncControlLabels();
        syncTimerConfigUI();
        showToast('타이머를 초기화했습니다');
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

      case 'switch-tab':
        switchTab(target.getAttribute('data-tab'));
        break;

      case 'set-mode':
        demoActive = false;
        timer.setMode(target.getAttribute('data-mode'));
        syncWakeLock(false);
        syncModeUI();
        break;

      case 'step-mode-drum':
        stepModeDrum(Number(target.getAttribute('data-dir')) || 1);
        break;

      case 'set-preset': {
        const focus = Number(target.getAttribute('data-focus')) || 25;
        const brk = Number(target.getAttribute('data-break')) || 5;
        timer.setPomodoroPreset(focus, brk);
        persistTimerMinutes();
        syncTimerConfigUI();
        syncControlLabels();
        window.ChronoAudio.playCrownRatchet();
        break;
      }

      case 'adjust-min': {
        const delta = Number(target.getAttribute('data-delta')) || 0;
        if (timer.state.running) {
          showToast('일시정지 상태에서 시간을 조절할 수 있습니다');
          break;
        }
        if (timer.adjustMinutes(delta)) {
          window.ChronoAudio.playCrownRatchet();
          persistTimerMinutes();
          syncTimerConfigUI();
        }
        break;
      }

      case 'reset-round':
        timer.reset({ resetRound: true });
        syncWakeLock(false);
        syncTimerConfigUI();
        syncControlLabels();
        showToast('포모도로 라운드를 #1로 초기화했습니다');
        break;

      case 'select-subject': {
        const sub = target.getAttribute('data-subject');
        if (sub) {
          prefs.selectedSubject = sub;
          window.ChronoStorage.savePrefs(prefs);
          renderSubjects();
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
      if (activeReflectionLogId) {
        window.ChronoStorage.updateLogMemo(activeReflectionLogId, dom.reflectionInput.value);
        renderLogsAndStats();
        showToast('회고 메모가 저장되었습니다');
      }
      closeReflectionModal();
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

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (e.key === 'Escape' && !dom.reflectionModal.hidden) {
        closeReflectionModal();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (dom.guideModal && !dom.guideModal.hidden) {
        closeGuideModal();
      } else if (!dom.reflectionModal.hidden) {
        closeReflectionModal();
      } else if (document.body.classList.contains('is-standby')) {
        toggleStandby();
      }
      return;
    }

    if (e.code === 'Space') {
      if (timer.state.mode !== 'clock') {
        e.preventDefault();
        if (demoActive) demoActive = false;
        if (satellite && satellite.isCrownPulled()) {
          satellite.setCrownPulled(false, true);
        }
        window.ChronoAudio.ensureContext();
        timer.toggle(Date.now());
        syncWakeLock(timer.state.running);
        syncMusicWithTimer(timer.state.running);
        syncWatchHint();
        syncControlLabels();
      }
      return;
    }

    const lower = (e.key || '').toLowerCase();
    if (lower === 'r' && timer.state.mode !== 'clock') {
      timer.reset();
      syncWakeLock(false);
      syncMusicWithTimer(false);
      syncControlLabels();
      syncTimerConfigUI();
      showToast('타이머 초기화');
    } else if (lower === 'f') {
      toggleStandby();
    } else if (lower === 'p') {
      toggleMusicPlayPause();
    } else if (lower === 'm') {
      toggleAmbienceMute();
    } else if (e.key === '1') {
      timer.setMode('pomodoro');
      syncWakeLock(false);
      syncModeUI();
    } else if (e.key === '2') {
      timer.setMode('countdown');
      syncWakeLock(false);
      syncModeUI();
    } else if (e.key === '3') {
      timer.setMode('stopwatch');
      syncWakeLock(false);
      syncModeUI();
    } else if (e.key === '4') {
      timer.setMode('clock');
      syncWakeLock(false);
      syncModeUI();
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
  let lastTitleText = '';
  let lastDigitalText = '';
  let lastStatusText = '';

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
    if (dom.statusLine && snap.statusText !== lastStatusText) {
      lastStatusText = snap.statusText;
      dom.statusLine.textContent = snap.statusText;
    }
    if (timer.state.mode === 'stopwatch' && dom.btnSaveStopwatch) {
      dom.btnSaveStopwatch.hidden = !(snap.elapsedMs >= 10000);
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
