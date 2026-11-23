/**
 * NO.5 CHRONO — Timer Core & Satellite Kinematics (timer-core.js)
 * Zero-Build, DOM-independent state machine & math engine.
 * Works in browser (<script>), file://, Node, and macOS jsc.
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function snapEase(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /**
   * Ōtsuka Lōtec No. 5 Kai Satellite Hour Kinematics
   * @param {number} tHours continuous hours in [0, 12)
   * @param {number} sSweep continuous or 4Hz-quantized seconds in [0, 60)
   * @returns {object} exact carousel, 3 satellite discs, and small-seconds angles
   */
  function computeSatelliteAngles(tHours, sSweep) {
    const normT = ((tHours % 12) + 12) % 12;
    const normS = ((sSweep % 60) + 60) % 60;
    const carouselDeg = normT * 120 + 30; // arm 0 points to -60° (1 o'clock) at t=0

    const discs = [];
    for (let k = 0; k < 3; k++) {
      const orbitDeg = normT * 120 - 60 - k * 120;
      const diff = normT - k;
      const cycle = Math.floor(diff / 3);
      const u = ((diff % 3) + 3) % 3; // [0, 3)
      // 8 o'clock custom ball-bearing roller zone: u in [1.45, 2.05]
      const stepProg = snapEase(clamp((u - 1.45) / 0.6, 0, 1));
      const localSpinDeg = -90 * (cycle + stepProg);
      discs.push({
        index: k,
        orbitDeg,
        localSpinDeg,
        phaseU: u,
        isIndexing: u >= 1.45 && u <= 2.05
      });
    }

    return {
      carouselDeg,
      discs,
      secondsDiscDeg: -normS * 6,
      minuteTrackDeg: (m) => -60 + clamp(m, 0, 60) * 2
    };
  }

  function pad2(n) {
    return String(Math.floor(Math.max(0, n))).padStart(2, '0');
  }

  function formatDurationMs(ms, showHours) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (showHours || h > 0) {
      return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
    }
    return `${pad2(m)}:${pad2(s)}`;
  }

  const POMODORO_PRESETS = {
    '25_5': { label: '25 / 5', focusMin: 25, breakMin: 5 },
    '50_10': { label: '50 / 10', focusMin: 50, breakMin: 10 },
    '90_20': { label: '90 / 20', focusMin: 90, breakMin: 20 }
  };

  /**
   * Drift-free study timer state machine using wall-clock timestamp deltas.
   */
  function createTimer(initialOpts) {
    const opts = initialOpts || {};
    const state = {
      mode: opts.mode || 'pomodoro', // 'pomodoro' | 'countdown' | 'stopwatch' | 'clock'
      phase: 'focus',                // 'focus' | 'break' (for pomodoro)
      running: false,
      startedAtMs: null,
      accumulatedMs: 0,
      focusMinutes: clamp(Number(opts.focusMinutes) || 25, 1, 90),
      breakMinutes: clamp(Number(opts.breakMinutes) || 5, 1, 30),
      countdownMinutes: clamp(Number(opts.countdownMinutes) || 25, 1, 60),
      round: 1,                      // 1..12 displayed on satellite hour disc in pomodoro
      autoStartBreak: false,
      completedCount: 0
    };

    function getTargetMs() {
      if (state.mode === 'pomodoro') {
        const mins = state.phase === 'break' ? state.breakMinutes : state.focusMinutes;
        return mins * 60 * 1000;
      }
      if (state.mode === 'countdown') {
        return state.countdownMinutes * 60 * 1000;
      }
      return 0;
    }

    function getElapsedMs(nowMs) {
      const now = typeof nowMs === 'number' ? nowMs : Date.now();
      if (!state.running || state.startedAtMs === null) {
        return state.accumulatedMs;
      }
      return state.accumulatedMs + Math.max(0, now - state.startedAtMs);
    }

    function start(nowMs) {
      if (state.mode === 'clock' || state.running) return false;
      const now = typeof nowMs === 'number' ? nowMs : Date.now();
      state.running = true;
      state.startedAtMs = now;
      return true;
    }

    function pause(nowMs) {
      if (!state.running) return false;
      const now = typeof nowMs === 'number' ? nowMs : Date.now();
      state.accumulatedMs = getElapsedMs(now);
      state.running = false;
      state.startedAtMs = null;
      return true;
    }

    function toggle(nowMs) {
      return state.running ? pause(nowMs) : start(nowMs);
    }

    function reset(optsReset) {
      const r = optsReset || {};
      state.running = false;
      state.startedAtMs = null;
      state.accumulatedMs = 0;
      if (r.resetRound) {
        state.round = 1;
        state.phase = 'focus';
      }
    }

    function setMode(nextMode) {
      if (!['pomodoro', 'countdown', 'stopwatch', 'clock'].includes(nextMode)) return;
      state.mode = nextMode;
      state.running = false;
      state.startedAtMs = null;
      state.accumulatedMs = 0;
      if (nextMode === 'pomodoro') {
        state.phase = 'focus';
      }
    }

    function setPomodoroPreset(focusMin, breakMin) {
      state.focusMinutes = clamp(Number(focusMin) || 25, 1, 90);
      state.breakMinutes = clamp(Number(breakMin) || 5, 1, 30);
      if (state.mode === 'pomodoro' && !state.running) {
        state.accumulatedMs = 0;
      }
    }

    function adjustMinutes(deltaMin) {
      if (state.running || state.mode === 'clock' || state.mode === 'stopwatch') return false;
      if (state.mode === 'pomodoro') {
        if (state.phase === 'break') {
          state.breakMinutes = clamp(state.breakMinutes + deltaMin, 1, 30);
        } else {
          state.focusMinutes = clamp(state.focusMinutes + deltaMin, 1, 90);
        }
        state.accumulatedMs = 0;
        return true;
      }
      if (state.mode === 'countdown') {
        state.countdownMinutes = clamp(state.countdownMinutes + deltaMin, 1, 60);
        state.accumulatedMs = 0;
        return true;
      }
      return false;
    }

    /**
     * Poll tick: detects completion without drift and transitions phase cleanly.
     * @returns {object|null} completion event payload if just finished
     */
    function tick(nowMs) {
      const now = typeof nowMs === 'number' ? nowMs : Date.now();
      if (!state.running || state.mode === 'clock' || state.mode === 'stopwatch') {
        return null;
      }
      const targetMs = getTargetMs();
      const elapsedMs = getElapsedMs(now);
      if (targetMs > 0 && elapsedMs >= targetMs) {
        const finishedPhase = state.mode === 'pomodoro' ? state.phase : 'countdown';
        const finishedMinutes = Math.round(targetMs / 60000);
        const finishedRound = state.round;

        state.running = false;
        state.startedAtMs = null;
        state.accumulatedMs = 0;

        if (state.mode === 'pomodoro') {
          if (state.phase === 'focus') {
            state.completedCount += 1;
            state.phase = 'break';
          } else {
            state.phase = 'focus';
            state.round = (state.round % 12) + 1;
          }
          if (state.autoStartBreak) {
            state.running = true;
            state.startedAtMs = now;
          }
        } else {
          state.completedCount += 1;
        }

        return {
          mode: state.mode,
          finishedPhase,
          minutes: finishedMinutes,
          round: finishedRound,
          nextPhase: state.phase,
          nextRound: state.round,
          endedAtMs: now
        };
      }
      return null;
    }

    /**
     * Computes exact satellite dial display state for any mode.
     */
    function getDialSnapshot(nowMs, demoEpochMs) {
      const now = typeof nowMs === 'number' ? nowMs : Date.now();

      // Demo fast-forward mode overrides dial with simulated clock time
      if (typeof demoEpochMs === 'number') {
        const d = new Date(demoEpochMs);
        const h12 = d.getHours() % 12;
        const m = d.getMinutes();
        const s = d.getSeconds() + d.getMilliseconds() / 1000;
        const tHours = h12 + m / 60 + s / 3600;
        return {
          mode: 'demo',
          phase: 'demo',
          running: true,
          tHours,
          secondsSweep: s,
          targetArcMinutes: 0,
          elapsedArcMinutes: 0,
          remainingMs: 0,
          elapsedMs: 0,
          digitalText: `${pad2(d.getHours())}:${pad2(m)}:${pad2(d.getSeconds())}`,
          statusText: `600× 메커니즘 시연 · ${h12 === 0 ? 12 : h12}시 ${pad2(m)}분`,
          isWarning: false,
          angles: computeSatelliteAngles(tHours, s)
        };
      }

      if (state.mode === 'clock') {
        const d = new Date(now);
        const h24 = d.getHours();
        const h12 = h24 % 12;
        const m = d.getMinutes();
        const ms = d.getMilliseconds();
        const sSweep = d.getSeconds() + Math.floor(ms / 125) * 0.125; // 4Hz Miyota 90S5 sweep
        const tHours = h12 + m / 60 + sSweep / 3600;
        return {
          mode: 'clock',
          phase: 'clock',
          running: true,
          tHours,
          secondsSweep: sSweep,
          targetArcMinutes: 0,
          elapsedArcMinutes: 0,
          remainingMs: 0,
          elapsedMs: 0,
          digitalText: `${pad2(h24)}:${pad2(m)}:${pad2(d.getSeconds())}`,
          statusText: `데스크 시계 · ${h12 === 0 ? 12 : h12}시 ${pad2(m)}분 지시 중`,
          isWarning: false,
          angles: computeSatelliteAngles(tHours, sSweep)
        };
      }

      const elapsedMs = getElapsedMs(now);

      if (state.mode === 'stopwatch') {
        const totalSec = elapsedMs / 1000;
        const qSec = state.running ? Math.floor(totalSec * 8) / 8 : totalSec;
        const tHours = (qSec / 3600) % 12;
        const sSweep = qSec % 60;
        const mWithinHour = (qSec % 3600) / 60;
        return {
          mode: 'stopwatch',
          phase: 'focus',
          running: state.running,
          tHours,
          secondsSweep: sSweep,
          targetArcMinutes: 60,
          elapsedArcMinutes: mWithinHour,
          remainingMs: 0,
          elapsedMs,
          digitalText: formatDurationMs(elapsedMs, true),
          statusText: state.running
            ? `순공 기록 중 · ${Math.floor(totalSec / 3600)}시간 ${Math.floor((totalSec % 3600) / 60)}분`
            : (elapsedMs > 0 ? '순공 일시정지' : '시작 버튼을 눌러 순공을 기록하세요'),
          isWarning: false,
          angles: computeSatelliteAngles(tHours, sSweep)
        };
      }

      // Pomodoro or Countdown
      const targetMs = getTargetMs();
      const clampedElapsed = clamp(elapsedMs, 0, targetMs);
      const remainingMs = Math.max(0, targetMs - clampedElapsed);
      const elapsedSec = clampedElapsed / 1000;
      const qElapsedSec = state.running ? Math.floor(elapsedSec * 8) / 8 : elapsedSec;
      const targetMin = targetMs / 60000;

      // Map minutes onto the 120° right track (0..60m). For >60m (e.g. 90m), wrap smoothly onto track
      const dialHourIndex = state.mode === 'pomodoro' ? (state.round % 12) : 1;
      const trackMinutes = targetMin <= 60
        ? (qElapsedSec / 60)
        : ((qElapsedSec / (targetMin * 60)) * 60);
      const tHours = dialHourIndex + (trackMinutes / 60);
      const sSweep = qElapsedSec % 60;
      const isWarning = state.running && remainingMs > 0 && remainingMs <= 180000; // <= 3 min

      const phaseLabel = state.mode === 'pomodoro'
        ? (state.phase === 'break' ? `휴식 #${state.round}` : `집중 라운드 #${state.round}`)
        : `${state.countdownMinutes}분 카운트다운`;

      return {
        mode: state.mode,
        phase: state.mode === 'pomodoro' ? state.phase : 'focus',
        running: state.running,
        round: state.round,
        tHours,
        secondsSweep: sSweep,
        targetArcMinutes: Math.min(60, targetMin),
        elapsedArcMinutes: clamp(trackMinutes, 0, Math.min(60, targetMin)),
        remainingMs,
        elapsedMs: clampedElapsed,
        digitalText: formatDurationMs(remainingMs, remainingMs >= 3600000),
        statusText: state.running
          ? `${phaseLabel} · ${Math.ceil(remainingMs / 60000)}분 남음`
          : `${phaseLabel} · ${Math.round(targetMin)}분 목표`,
        isWarning,
        angles: computeSatelliteAngles(tHours, sSweep)
      };
    }

    return {
      state,
      start,
      pause,
      toggle,
      reset,
      setMode,
      setPomodoroPreset,
      adjustMinutes,
      getTargetMs,
      getElapsedMs,
      tick,
      getDialSnapshot
    };
  }

  const TimerCore = {
    version: '1.0.0',
    escapeHtml,
    clamp,
    snapEase,
    computeSatelliteAngles,
    formatDurationMs,
    POMODORO_PRESETS,
    createTimer
  };

  global.TimerCore = TimerCore;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerCore;
  }
})(typeof window !== 'undefined' ? window : globalThis);
