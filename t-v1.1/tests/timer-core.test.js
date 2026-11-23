/**
 * NO.5 CHRONO — Automated Unit Test Suite (tests/timer-core.test.js)
 * Runnable directly on macOS via:
 *   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/timer-core.test.js
 */
(function () {
  'use strict';

  if (typeof load === 'function') {
    load('timer-core.js');
  } else if (typeof require === 'function') {
    globalThis.TimerCore = require('../timer-core.js');
  }

  const TC = globalThis.TimerCore;
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      passed++;
    } else {
      failed++;
      print('FAIL: ' + msg);
    }
  }

  function assertNear(actual, expected, eps, msg) {
    const ok = Math.abs(actual - expected) <= eps;
    if (ok) {
      passed++;
    } else {
      failed++;
      print('FAIL: ' + msg + ' (expected ' + expected + ', got ' + actual + ')');
    }
  }

  // 1. escapeHtml XSS protection
  assert(
    TC.escapeHtml('<script>alert("x")</script>&\'') === '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;',
    'escapeHtml escapes all HTML special characters'
  );
  assert(TC.escapeHtml(null) === '', 'escapeHtml handles null cleanly');

  // 2. snapEase & clamp
  assert(TC.clamp(120, 1, 90) === 90, 'clamp upper bound');
  assert(TC.clamp(-5, 1, 90) === 1, 'clamp lower bound');
  assert(TC.snapEase(0) === 0 && TC.snapEase(0.5) === 0.5 && TC.snapEase(1) === 1, 'snapEase boundary & midpoint');

  // 3. Ōtsuka Lōtec No. 5 Kai Satellite Kinematics
  const a1200 = TC.computeSatelliteAngles(0, 0);
  assertNear(a1200.carouselDeg, 30, 0.001, '12:00 carouselDeg === 30°');
  assertNear(a1200.discs[0].orbitDeg, -60, 0.001, '12:00 disc 0 sits at -60° (00 min mark)');
  assertNear(a1200.discs[0].localSpinDeg, 0, 0.001, '12:00 disc 0 localSpinDeg === 0° (shows 12)');
  assertNear(a1200.minuteTrackDeg(0), -60, 0.001, '0 min track === -60°');
  assertNear(a1200.minuteTrackDeg(30), 0, 0.001, '30 min track === 0° (3 oclock)');
  assertNear(a1200.minuteTrackDeg(60), 60, 0.001, '60 min track === +60° (5 oclock)');

  // 2:30 -> disc 2 (hours [2,5,8,11]) must be at 3 o'clock (0°) with localSpinDeg === 0
  const a0230 = TC.computeSatelliteAngles(2.5, 15);
  assertNear(a0230.discs[2].orbitDeg, 0, 0.001, '2:30 disc 2 sits at 0° (30 min mark)');
  assertNear(a0230.discs[2].localSpinDeg, 0, 0.001, '2:30 disc 2 shows 2');
  assertNear(a0230.secondsDiscDeg, -90, 0.001, '15s small seconds disc === -90°');

  // 3:00 -> disc 0 returns to 1 o'clock (-60° ≡ 300°) having indexed -90° to display 3
  const a0300 = TC.computeSatelliteAngles(3.0, 0);
  assertNear(((a0300.discs[0].orbitDeg % 360) + 360) % 360, 300, 0.001, '3:00 disc 0 orbits back to -60° (300°)');
  assertNear(a0300.discs[0].localSpinDeg, -90, 0.001, '3:00 disc 0 has completed -90° indexing to show 3');

  // 8 o'clock roller indexing zone check: disc 0 at t = 1.75 (midpoint of [1.45, 2.05])
  const aIdxMid = TC.computeSatelliteAngles(1.75, 0);
  assert(aIdxMid.discs[0].isIndexing === true, 'disc 0 isIndexing === true at u=1.75');
  assertNear(aIdxMid.discs[0].localSpinDeg, -45, 0.01, 'disc 0 localSpinDeg === -45° at indexing midpoint');

  // 5:45 check -> disc 2 (cycle=1, numeral 5) should be at -60 + 45*2 = +30°
  const a0545 = TC.computeSatelliteAngles(5.75, 30);
  assertNear(((a0545.discs[2].orbitDeg % 360) + 360) % 360, 30, 0.001, '5:45 disc 2 sits at +30° (45 min mark)');
  assertNear(a0545.discs[2].localSpinDeg, -90, 0.001, '5:45 disc 2 localSpinDeg === -90° (shows 5)');

  // 4. formatDurationMs
  assert(TC.formatDurationMs(25 * 60 * 1000, false) === '25:00', 'formatDurationMs 25:00');
  assert(TC.formatDurationMs(3661000, false) === '01:01:01', 'formatDurationMs >=1h shows HH:MM:SS');
  assert(TC.formatDurationMs(5000, true) === '00:00:05', 'formatDurationMs forced hours');

  // 5. Drift-free timestamp calculation across simulated 1-hour background tab jump
  const tBase = 1700000000000;
  const sw = TC.createTimer({ mode: 'stopwatch' });
  sw.start(tBase);
  assertNear(sw.getElapsedMs(tBase + 3600000), 3600000, 0, 'Stopwatch exact 1h elapsed with zero drift');
  sw.pause(tBase + 3600000);
  assertNear(sw.getElapsedMs(tBase + 9999999), 3600000, 0, 'Paused stopwatch does not drift');
  sw.start(tBase + 4000000);
  assertNear(sw.getElapsedMs(tBase + 4000000 + 2100000), 5700000, 0, 'Resumed stopwatch adds exact delta (1h 35m)');
  const swSnap = sw.getDialSnapshot(tBase + 4000000 + 2100000);
  assert(swSnap.digitalText === '01:35:00', 'Stopwatch 1h35m digitalText');
  assertNear(swSnap.tHours, 1 + 35 / 60, 0.001, 'Stopwatch 1h35m maps to tHours 1.5833');

  // 6. Pomodoro round progression (focus -> break -> focus round 2 -> ... -> round 12 -> round 1)
  const pomo = TC.createTimer({ mode: 'pomodoro', focusMinutes: 25, breakMinutes: 5 });
  pomo.start(tBase);
  assert(pomo.tick(tBase + 24 * 60000) === null, 'Pomodoro does not complete early at 24m');
  const warnSnap = pomo.getDialSnapshot(tBase + 23 * 60000);
  assert(warnSnap.isWarning === true, 'Pomodoro warning flag activates at <= 3 min remaining');

  const focusEvt = pomo.tick(tBase + 25 * 60000);
  assert(focusEvt !== null && focusEvt.finishedPhase === 'focus' && focusEvt.minutes === 25, 'Pomodoro focus completes at 25m');
  assert(pomo.state.phase === 'break' && pomo.state.round === 1, 'Transitions to break on same round #1');

  pomo.start(tBase + 26 * 60000);
  const breakEvt = pomo.tick(tBase + 31 * 60000);
  assert(breakEvt !== null && breakEvt.finishedPhase === 'break' && breakEvt.nextRound === 2, 'Break completion increments round to #2');
  assert(pomo.state.phase === 'focus' && pomo.state.round === 2, 'State ready for round #2 focus');

  // Round 12 rollover to 1
  pomo.state.round = 12;
  pomo.state.phase = 'break';
  pomo.start(tBase + 40 * 60000);
  const rollEvt = pomo.tick(tBase + 45 * 60000);
  assert(rollEvt.nextRound === 1 && pomo.state.round === 1, 'Pomodoro round 12 rolls cleanly to round 1');

  // 7. Auto-start break mode
  const autoPomo = TC.createTimer({ mode: 'pomodoro', focusMinutes: 25, breakMinutes: 5 });
  autoPomo.state.autoStartBreak = true;
  autoPomo.start(tBase);
  autoPomo.tick(tBase + 25 * 60000);
  assert(autoPomo.state.running === true && autoPomo.state.phase === 'break', 'autoStartBreak immediately starts break timer');

  // 8. Countdown & adjustMinutes (crown) clamping
  const cd = TC.createTimer({ mode: 'countdown', countdownMinutes: 25 });
  assert(cd.adjustMinutes(5) === true && cd.state.countdownMinutes === 30, 'Crown +5m works when stopped');
  assert(cd.adjustMinutes(100) === true && cd.state.countdownMinutes === 60, 'Countdown clamps at 60m max');
  assert(cd.adjustMinutes(-100) === true && cd.state.countdownMinutes === 1, 'Countdown clamps at 1m min');
  cd.start(tBase);
  assert(cd.adjustMinutes(5) === false, 'Crown adjustment locked while running');
  const cdDone = cd.tick(tBase + 60000);
  assert(cdDone !== null && cdDone.finishedPhase === 'countdown' && cdDone.minutes === 1, 'Countdown emits completion event');

  // 9. Pomodoro 90/20 preset + crown adjustment preserves 90m ceiling
  const p90 = TC.createTimer({ mode: 'pomodoro' });
  p90.setPomodoroPreset(90, 20);
  assert(p90.state.focusMinutes === 90 && p90.state.breakMinutes === 20, '90/20 preset applied');
  p90.adjustMinutes(-1);
  assert(p90.state.focusMinutes === 89, '90m pomodoro adjusts smoothly down to 89m (not clamped to 60)');
  const snap90 = p90.getDialSnapshot(tBase);
  assert(snap90.targetArcMinutes === 60, '90m pomodoro targetArcMinutes maps cleanly across full 60m (120°) arc');

  // 10. Clock & Demo snapshots
  const clk = TC.createTimer({ mode: 'clock' });
  assert(clk.start(tBase) === false, 'Clock mode ignores start()');
  const demoSnap = clk.getDialSnapshot(tBase, tBase);
  assert(demoSnap.mode === 'demo' && demoSnap.running === true, 'Demo snapshot overrides cleanly');

  print('TEST SUMMARY: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    throw new Error('Unit tests failed: ' + failed);
  }
})();
