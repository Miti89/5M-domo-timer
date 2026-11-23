/**
 * NO.5 CHRONO — Application Controller (app.js)
 * Wires TimerCore, SatelliteEngine, ChronoAudio, and ChronoStorage.
 * Zero-Build, file:// safe, 0 inline handlers, XSS-safe rendering.
 */
(function () {
  'use strict';

  const escapeHtml = window.TimerCore.escapeHtml;

  const MODE_LABELS = {
    pomodoro: '포모도로',
    countdown: '카운트다운',
    stopwatch: '순공 스톱워치',
    clock: '데스크 시계'
  };

  const THEME_META_COLORS = {
    steel: '#E6E9EE',
    paper: '#EFE7DC',
    luminova: '#080B0F'
  };

  // Load persisted user preferences
  const prefs = window.ChronoStorage.loadPrefs();
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

  // DOM references
  const dom = {
    metaThemeColor: document.getElementById('metaThemeColor'),
    activeSubjectBadge: document.getElementById('activeSubjectBadge'),
    activeModeBadge: document.getElementById('activeModeBadge'),
    wakeLockBadge: document.getElementById('wakeLockBadge'),
    mannerBadge: document.getElementById('mannerBadge'),
    btnTopManner: document.getElementById('btnTopManner'),
    standbyHud: document.getElementById('standbyHud'),
    btnStandbyToggle: document.getElementById('btnStandbyToggle'),
    satelliteMount: document.getElementById('satelliteMount'),
    watchHint: document.getElementById('watchHint'),
    digitalReadout: document.getElementById('digitalReadout'),
    statusLine: document.getElementById('statusLine'),
    btnToggle: document.getElementById('btnToggle'),
    btnReset: document.getElementById('btnReset'),
    btnSaveStopwatch: document.getElementById('btnSaveStopwatch'),
    btnDemo: document.getElementById('btnDemo'),
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
    toastBanner: document.getElementById('toastBanner')
  };

  function showToast(message) {
    if (!dom.toastBanner) return;
    dom.toastBanner.textContent = message;
    dom.toastBanner.hidden = false;
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = setTimeout(function () {
      dom.toastBanner.hidden = true;
    }, 2600);
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

  function applyTheme(themeName, persist) {
    const valid = ['steel', 'paper', 'luminova'].includes(themeName) ? themeName : 'steel';
    document.documentElement.setAttribute('data-theme', valid);
    if (dom.metaThemeColor) {
      dom.metaThemeColor.setAttribute('content', THEME_META_COLORS[valid] || '#E6E9EE');
    }
    document.querySelectorAll('[data-action="set-theme"]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-theme') === valid);
    });
    if (persist) {
      prefs.theme = valid;
      window.ChronoStorage.savePrefs(prefs);
    }
  }

  function applyMannerMode(enabled, persist) {
    const on = Boolean(enabled);
    prefs.mannerMode = on;
    window.ChronoAudio.updateSettings({ mannerMode: on });
    if (dom.chkMannerMode) dom.chkMannerMode.checked = on;
    if (dom.mannerBadge) dom.mannerBadge.hidden = !on;
    if (dom.btnTopManner) {
      dom.btnTopManner.classList.toggle('is-active', on);
      dom.btnTopManner.setAttribute('aria-pressed', String(on));
    }
    if (persist) {
      window.ChronoStorage.savePrefs(prefs);
      showToast(on ? '독서실 무음 매너 모드 활성화 (시각 알림만 작동)' : '사운드 알림이 복원되었습니다');
    }
  }

  function applyAlarmType(type, persist) {
    const valid = ['gong', 'chime', 'silent'].includes(type) ? type : 'gong';
    prefs.alarmType = valid;
    window.ChronoAudio.updateSettings({ alarmType: valid });
    document.querySelectorAll('[data-action="set-alarm"]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-alarm') === valid);
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

  // Mount Satellite Watch SVG Engine
  const satellite = window.SatelliteEngine.mount(dom.satelliteMount, {
    onCrownStep: function (deltaMin) {
      if (demoActive) {
        showToast('시연 모드에서는 용두 조절이 비활성화됩니다');
        return;
      }
      if (timer.state.running) {
        showToast('타이머 일시정지 후 4시 용두로 시간을 조절하세요');
        return;
      }
      const changed = timer.adjustMinutes(deltaMin);
      if (changed) {
        window.ChronoAudio.playCrownRatchet();
        persistTimerMinutes();
        syncTimerConfigUI();
      } else if (timer.state.mode === 'clock' || timer.state.mode === 'stopwatch') {
        showToast('포모도로·카운트다운 모드에서 용두로 목표 분을 설정할 수 있습니다');
      }
    },
    onDialClick: function () {
      triggerManualGong();
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

  function syncModeUI() {
    const mode = timer.state.mode;
    if (dom.activeModeBadge) {
      dom.activeModeBadge.textContent = MODE_LABELS[mode] || mode;
    }
    document.querySelectorAll('[data-action="set-mode"]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-mode') === mode);
    });

    const isClock = mode === 'clock';
    const isStopwatch = mode === 'stopwatch';
    const isPomodoro = mode === 'pomodoro';

    if (dom.timeConfigCard) dom.timeConfigCard.hidden = isClock || isStopwatch;
    if (dom.pomodoroPresetsRow) dom.pomodoroPresetsRow.hidden = !isPomodoro;
    if (dom.pomodoroOptionsRow) dom.pomodoroOptionsRow.hidden = !isPomodoro;
    if (dom.roundIndicator) dom.roundIndicator.hidden = !isPomodoro;

    if (dom.timeConfigTitle) {
      dom.timeConfigTitle.textContent = isPomodoro ? '포모도로 구성' : '카운트다운 목표 시간';
    }

    if (dom.btnToggle) dom.btnToggle.hidden = isClock;
    if (dom.btnReset) dom.btnReset.hidden = isClock;
    if (dom.watchHint) {
      dom.watchHint.textContent = isClock
        ? '다이얼을 클릭하면 현재 시각 5270P 미닛 리피터가 타종됩니다'
        : '4시 용두 휠·드래그로 ±1분(Shift ±5분) 조절 · 다이얼 클릭 시 5270P 타종';
    }

    syncTimerConfigUI();
    syncControlLabels();
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
        dom.configMinutesDisplay.textContent = `${mins}분`;
      } else if (st.mode === 'countdown') {
        dom.configMinutesDisplay.textContent = `${st.countdownMinutes}분`;
      }
    }
    document.querySelectorAll('[data-action="set-preset"]').forEach(function (btn) {
      const f = Number(btn.getAttribute('data-focus'));
      const b = Number(btn.getAttribute('data-break'));
      btn.classList.toggle('is-active', st.focusMinutes === f && st.breakMinutes === b);
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
      label = '순공 시작';
    } else if (st.mode === 'countdown') {
      label = '타이머 시작';
    }

    if (dom.btnToggle) dom.btnToggle.textContent = label;
    if (dom.btnStandbyToggle) {
      dom.btnStandbyToggle.hidden = st.mode === 'clock';
      dom.btnStandbyToggle.textContent = st.running ? '일시정지' : '시작';
    }
    if (dom.btnSaveStopwatch) {
      const elapsed = timer.getElapsedMs(Date.now());
      dom.btnSaveStopwatch.hidden = !(st.mode === 'stopwatch' && elapsed >= 10000);
    }
  }

  function renderSubjects() {
    if (!dom.subjectChips) return;
    if (dom.activeSubjectBadge) {
      dom.activeSubjectBadge.textContent = `과목 · ${prefs.selectedSubject}`;
    }
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
      openReflectionModal(saved, `${evt.minutes}분 집중을 마쳤습니다`);
    } else if (evt.finishedPhase === 'break') {
      showToast(`휴식 완료 — 집중 라운드 #${evt.nextRound} 준비됨`);
    }

    syncWakeLock(timer.state.running);
    syncTimerConfigUI();
    syncControlLabels();
  }

  function switchTab(tabName) {
    const map = { timer: 'panelTimer', sound: 'panelSound', log: 'panelLog' };
    if (!map[tabName]) return;
    document.querySelectorAll('[data-action="switch-tab"]').forEach(function (btn) {
      const active = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
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
    if (willEnter) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
      showToast('풀스크린 스탠바이 모드 (Esc 또는 F로 종료)');
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    }
  }

  function updateDocumentTitle(snapshot) {
    if (demoActive) {
      document.title = '[600× 시연] NO.5 CHRONO';
      return;
    }
    if (snapshot.mode === 'clock') {
      document.title = `[${snapshot.digitalText}] NO.5 CHRONO`;
      return;
    }
    if (snapshot.running) {
      const phaseShort = snapshot.mode === 'stopwatch'
        ? '순공'
        : (snapshot.phase === 'break' ? '휴식' : '집중');
      document.title = `[${snapshot.digitalText}] ${phaseShort} · NO.5 CHRONO`;
    } else {
      document.title = 'NO.5 CHRONO — 기계식 새틀라이트 공부 타이머';
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
    window.ChronoAudio.updateSettings({
      tickVol: t / 100,
      rainVol: r / 100,
      cafeVol: c / 100
    });
  }

  // Event Delegation for all [data-action] buttons
  document.addEventListener('click', function (e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');

    switch (action) {
      case 'set-theme':
        applyTheme(target.getAttribute('data-theme'), true);
        break;

      case 'toggle-manner':
        applyMannerMode(!prefs.mannerMode, true);
        break;

      case 'toggle-standby':
        toggleStandby();
        break;

      case 'toggle-timer':
        if (demoActive) {
          demoActive = false;
          if (dom.btnDemo) {
            dom.btnDemo.classList.remove('is-active');
            dom.btnDemo.setAttribute('aria-pressed', 'false');
          }
        }
        window.ChronoAudio.ensureContext();
        timer.toggle(Date.now());
        syncWakeLock(timer.state.running);
        syncControlLabels();
        break;

      case 'reset-timer':
        timer.reset();
        syncWakeLock(false);
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
        openReflectionModal(saved, `순공 ${formatMinutesKo(mins)} 기록 완료`);
        break;
      }

      case 'strike-gong':
        triggerManualGong();
        break;

      case 'toggle-demo':
        demoActive = !demoActive;
        if (demoActive) {
          demoEpochMs = Date.now();
          showToast('600× 메커니즘 시연 중 (8시 롤러 90° 자전 관찰)');
        }
        if (dom.btnDemo) {
          dom.btnDemo.classList.toggle('is-active', demoActive);
          dom.btnDemo.setAttribute('aria-pressed', String(demoActive));
        }
        break;

      case 'switch-tab':
        switchTab(target.getAttribute('data-tab'));
        break;

      case 'set-mode':
        demoActive = false;
        if (dom.btnDemo) {
          dom.btnDemo.classList.remove('is-active');
          dom.btnDemo.setAttribute('aria-pressed', 'false');
        }
        timer.setMode(target.getAttribute('data-mode'));
        syncWakeLock(false);
        syncModeUI();
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
        a.download = `no5-chrono-backup-${new Date().toISOString().slice(0, 10)}.json`;
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

  if (dom.chkHourlyChime) {
    dom.chkHourlyChime.addEventListener('change', function () {
      prefs.hourlyChime = dom.chkHourlyChime.checked;
      window.ChronoStorage.savePrefs(prefs);
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
      if (!dom.reflectionModal.hidden) {
        closeReflectionModal();
      } else if (document.body.classList.contains('is-standby')) {
        toggleStandby();
      }
      return;
    }

    if (e.code === 'Space') {
      if (timer.state.mode !== 'clock') {
        e.preventDefault();
        window.ChronoAudio.ensureContext();
        timer.toggle(Date.now());
        syncWakeLock(timer.state.running);
        syncControlLabels();
      }
      return;
    }

    const lower = (e.key || '').toLowerCase();
    if (lower === 'r' && timer.state.mode !== 'clock') {
      timer.reset();
      syncWakeLock(false);
      syncControlLabels();
      syncTimerConfigUI();
      showToast('타이머 초기화');
    } else if (lower === 'f') {
      toggleStandby();
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

  // Initial Hydrate
  applyTheme(prefs.theme, false);
  applyMannerMode(prefs.mannerMode, false);
  applyAlarmType(prefs.alarmType, false);
  if (dom.chkHourlyChime) dom.chkHourlyChime.checked = Boolean(prefs.hourlyChime);
  renderSubjects();
  syncModeUI();
  renderLogsAndStats();
  requestAnimationFrame(renderFrame);

  // Safe PWA Service Worker registration (http/https only; skipped safely on file://)
  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
