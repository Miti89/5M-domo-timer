/**
 * NO.1 PRO — Automated Unit Test Suite (tests/timer-core.test.js)
 * Runnable directly on macOS via:
 *   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/timer-core.test.js
 */
(function () {
  'use strict';

  if (typeof load === 'function') {
    load('version.js');
    load('timer-core.js');
    load('music-player.js');
    load('atelier-engine.js');
    load('storage.js');
    load('cheers-engine.js');
    load('sw.js');
  } else if (typeof require === 'function') {
    globalThis.CASPER_VERSION = require('../version.js').CASPER_VERSION;
    globalThis.TimerCore = require('../timer-core.js');
    globalThis.ChronoMusic = require('../music-player.js');
    globalThis.CasperAtelier = require('../atelier-engine.js');
    globalThis.ChronoStorage = require('../storage.js');
    globalThis.CasperCheers = require('../cheers-engine.js');
    globalThis.CasperSw = require('../sw.js');
    globalThis.CasperInfo = require('../casper-info.js');
  }

  function readProjectFile(relPath) {
    if (typeof readFile === 'function') {
      return readFile(relPath);
    }
    if (typeof require === 'function') {
      const fs = require('fs');
      const path = require('path');
      return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
    }
    return '';
  }

  const logLine = typeof print === 'function' ? print : console.log;

  const TC = globalThis.TimerCore;
  const CM = globalThis.ChronoMusic;
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      passed++;
    } else {
      failed++;
      logLine('FAIL: ' + msg);
    }
  }

  function assertNear(actual, expected, eps, msg) {
    const ok = Math.abs(actual - expected) <= eps;
    if (ok) {
      passed++;
    } else {
      failed++;
      logLine('FAIL: ' + msg + ' (expected ' + expected + ', got ' + actual + ')');
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

  // 8. Countdown & adjustMinutes / adjustHours (2-position crown) clamping & dual-gauge arcs
  const cd = TC.createTimer({ mode: 'countdown', countdownMinutes: 25 });
  assert(cd.adjustMinutes(5) === true && cd.state.countdownMinutes === 30, 'Crown pushed-in +5m works when stopped');
  assert(cd.adjustHours(2) === true && cd.state.countdownMinutes === 150, 'Crown pulled-out +2h raises 30m -> 2h 30m (150m)');
  const cdSnap150 = cd.getDialSnapshot(tBase);
  assert(cdSnap150.targetArcHours === 2 && cdSnap150.targetArcMinutes === 30, '2h 30m splits cleanly: Left Hour Gauge=2h, Right Minute Gauge=30m');
  assert(cdSnap150.digitalText === '02:30:00', '2h 30m formats as HH:MM:SS');
  assert(cd.adjustHours(-2) === true && cd.state.countdownMinutes === 30, 'Crown pulled-out -2h returns 2h 30m -> 30m');
  assert(cd.adjustHours(-1) === false && cd.state.countdownMinutes === 30, 'Crown pulled-out -1h at 0h preserves remaining 30m');
  assert(cd.adjustHours(20) === true && cd.state.countdownMinutes === 720, 'Countdown hours clamp cleanly at 12h (720m) max');
  assert(cd.adjustMinutes(-1000) === true && cd.state.countdownMinutes === 1, 'Countdown minutes clamp at 1m min');
  cd.start(tBase);
  assert(cd.adjustMinutes(5) === false, 'Crown minute adjustment locked while running');
  assert(cd.adjustHours(1) === false, 'Crown hour adjustment locked while running');
  const cdDone = cd.tick(tBase + 60000);
  assert(cdDone !== null && cdDone.finishedPhase === 'countdown' && cdDone.minutes === 1, 'Countdown emits completion event');

  // 9. Pomodoro 90/20 preset + dual-gauge mapping + crown hour/minute adjustment
  const p90 = TC.createTimer({ mode: 'pomodoro' });
  p90.setPomodoroPreset(90, 20);
  assert(p90.state.focusMinutes === 90 && p90.state.breakMinutes === 20, '90/20 preset applied');
  const snap90 = p90.getDialSnapshot(tBase);
  assert(snap90.targetArcHours === 1 && snap90.targetArcMinutes === 30, '90m (1h 30m) pomodoro shows Left Hour Gauge=1h, Right Minute Gauge=30m');
  p90.adjustMinutes(-1);
  assert(p90.state.focusMinutes === 89, '90m pomodoro adjusts smoothly down to 89m');
  p90.adjustHours(1);
  assert(p90.state.focusMinutes === 149, 'Pulled-out crown +1h turns 1h 29m into 2h 29m (149m)');
  const snap149 = p90.getDialSnapshot(tBase);
  assert(snap149.targetArcHours === 2 && snap149.targetArcMinutes === 29, '2h 29m pomodoro shows Left Hour Gauge=2h, Right Minute Gauge=29m');

  // 9b. Pure Reverse-Running Mechanical Watch Countdown Kinematics (Pomodoro & Countdown)
  const revPomo = TC.createTimer({ mode: 'pomodoro', focusMinutes: 25, breakMinutes: 5 });
  const revIdle = revPomo.getDialSnapshot(tBase);
  assert(revIdle.isCountdown === true, 'Pomodoro snapshot sets isCountdown=true');
  assertNear(revIdle.rawHours, 25 / 60, 0.0001, '25:00 idle maps directly to 0h 25m on watch face');
  assertNear(revIdle.secondsSweep, 0, 0.001, '25:00 idle small seconds sits at 00/60');
  assertNear(revIdle.remainingRatio, 1, 0.0001, '25:00 idle remainingRatio === 1.0');
  revPomo.start(tBase);
  const revTick1 = revPomo.getDialSnapshot(tBase + 1000); // 24:59 remaining
  assert(revTick1.tHours < revIdle.tHours, 'Watch hour/minute mechanism unwinds BACKWARD during countdown');
  assertNear(revTick1.secondsSweep, 59, 0.001, 'Seconds disc unwinds BACKWARD 60 -> 59 after 1s');
  const revMid = revPomo.getDialSnapshot(tBase + 12.5 * 60000); // 12:30 remaining
  assertNear(revMid.remainingRatio, 0.5, 0.001, 'Halfway remainingRatio === 0.5');
  assertNear(revMid.rawHours, 12.5 / 60, 0.001, 'Halfway watch shows 0h 12m 30s');
  assertNear(revMid.secondsSweep, 30, 0.001, 'Halfway seconds sits at 30');

  // Multi-hour reverse countdown (3h 20m -> unwinds 3:20:00 -> 2:59:59)
  const revCd = TC.createTimer({ mode: 'countdown', countdownMinutes: 200 });
  const revCd0 = revCd.getDialSnapshot(tBase);
  assertNear(revCd0.rawHours, 200 / 60, 0.0001, '3h 20m countdown starts at 3.3333h');
  revCd.start(tBase);
  const revCdAfter21m = revCd.getDialSnapshot(tBase + 21 * 60000); // 2h 59m remaining
  assertNear(revCdAfter21m.rawHours, 179 / 60, 0.001, 'After 21m, 3h 20m unwinds across hour boundary to 2h 59m');

  // 10. Clock & Demo snapshots
  const clk = TC.createTimer({ mode: 'clock' });
  assert(clk.start(tBase) === false, 'Clock mode ignores start()');
  const demoSnap = clk.getDialSnapshot(tBase, tBase);
  assert(demoSnap.mode === 'demo' && demoSnap.running === true, 'Demo snapshot overrides cleanly');

  // 11. YouTube Music / YouTube URL parsing & XSS rejection
  const ytmSong = CM.parseYouTubeUrl('https://music.youtube.com/watch?v=jfKfPfyJRdk&feature=share');
  assert(ytmSong && ytmSong.videoId === 'jfKfPfyJRdk' && ytmSong.kind === 'video', 'Parses music.youtube.com track URL');
  const ytmList = CM.parseYouTubeUrl('https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI');
  assert(ytmList && ytmList.kind === 'playlist' && ytmList.listId === 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', 'Parses music.youtube.com playlist URL');
  const ytmCombo = CM.parseYouTubeUrl('https://music.youtube.com/watch?v=mIYzp5rcTvU&list=PL1234567890abcdef');
  assert(ytmCombo && ytmCombo.videoId === 'mIYzp5rcTvU' && ytmCombo.embeddableList === 'PL1234567890abcdef', 'Parses track + playlist URL');
  const ytmAutoMix = CM.parseYouTubeUrl('https://music.youtube.com/watch?v=jfKfPfyJRdk&list=RDAMVMjfKfPfyJRdk');
  assert(ytmAutoMix && ytmAutoMix.videoId === 'jfKfPfyJRdk' && ytmAutoMix.embeddableList === null, 'Auto-mix RDAMVM list degrades safely to video embed');
  const ytShort = CM.parseYouTubeUrl('https://youtu.be/4xDzrJKXOOY?si=test123');
  assert(ytShort && ytShort.videoId === '4xDzrJKXOOY', 'Parses youtu.be short link');
  const ytLive = CM.parseYouTubeUrl('https://www.youtube.com/live/jfKfPfyJRdk');
  assert(ytLive && ytLive.videoId === 'jfKfPfyJRdk', 'Parses youtube.com/live/ link');
  const rawId = CM.parseYouTubeUrl('jfKfPfyJRdk');
  assert(rawId && rawId.videoId === 'jfKfPfyJRdk', 'Parses raw 11-char video ID');

  const embed1 = CM.buildEmbedUrl(ytmSong, { autoplay: true, origin: 'http://127.0.0.1:8766' });
  assert(embed1.indexOf('https://www.youtube.com/embed/jfKfPfyJRdk?') === 0 && embed1.indexOf('enablejsapi=1') > 0 && embed1.indexOf('autoplay=1') > 0, 'Builds safe video embed URL with JS API');
  const embed2 = CM.buildEmbedUrl(ytmList, { autoplay: false });
  assert(embed2.indexOf('https://www.youtube.com/embed/videoseries?') === 0 && embed2.indexOf('list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI') > 0, 'Builds safe playlist embed URL');
  assert(CM.buildYouTubeMusicUrl(ytmSong) === 'https://music.youtube.com/watch?v=jfKfPfyJRdk', 'Builds music.youtube.com popup URL for video');
  assert(CM.buildYouTubeMusicUrl(ytmList) === 'https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', 'Builds music.youtube.com popup URL for playlist');

  // Strict security rejection of non-YouTube / XSS URLs
  assert(CM.parseYouTubeUrl('javascript:alert(1)') === null, 'Rejects javascript: URI');
  assert(CM.parseYouTubeUrl('https://evil.example.com/watch?v=jfKfPfyJRdk') === null, 'Rejects non-YouTube domain');
  assert(CM.parseYouTubeUrl('https://music.youtube.com/watch?v=<script>alert(1)</script>') === null, 'Rejects malicious video ID');
  assert(CM.parseYouTubeUrl('https://music.youtube.com/playlist?list=short') === null, 'Rejects invalid short list ID');

  // -------------------------------------------------------------------------
  // 11. CASPER™ A–J Mathematical Horology Atelier (Multi-Stage + Migration + DevMode)
  // -------------------------------------------------------------------------
  const CA = globalThis.CasperAtelier;
  assert(CA && CA.CALIBERS.length === 10, 'Atelier defines all 10 A–J mathematical calibers');
  assert(CA.CALIBERS.map(function (c) { return c.letter; }).join('') === 'ABCDEFGHIJ', 'Calibers span A through J in exact order');
  assert(CA.CALIBERS[2].name === 'NO.3 CYCLOID' && CA.CALIBERS[4].name === 'NO.5 ELLIPSE' && CA.CALIBERS[6].name === 'NO.7 GEOMETRY', 'NO.3 Cycloid, NO.5 Ellipse, NO.7 Geometry confirmed');
  assert(CA.CALIBERS[1].name === 'NO.2 BINARY' && CA.CALIBERS[1].engine === 'CASPER', 'NO.2 Binary uses CASPER engine branding');
  assert(CA.NO2_PARTS.length === 6 && CA.NO2_PARTS[5].cumMinutes === 30, 'Stage 1 B · BINARY has 6 parts totaling 30m (5m each)');
  assert(CA.BUILD_ORDER.join(',') === 'cal-b,cal-d,cal-c,cal-e,cal-f,cal-g,cal-h,cal-i,cal-j,cal-a', 'BUILD_ORDER follows 10-watch curve B->D->C->E->F->G->H->I->J->A');
  assert(CA.PARTS_BY_CALIBER['cal-d'][5].cumMinutes === 120, 'Stage 2 D · DELTA completes at 120m (2h)');
  assert(CA.PARTS_BY_CALIBER['cal-c'][5].cumMinutes === 300, 'Stage 3 C · CYCLOID completes at 300m (5h)');
  assert(CA.PARTS_BY_CALIBER['cal-e'][5].cumMinutes === 600, 'Stage 4 E · ELLIPSE completes at 600m (10h)');
  assert(CA.PARTS_BY_CALIBER['cal-f'][5].cumMinutes === 1200, 'Stage 5 F · FRACTAL completes at 1200m (20h)');
  assert(CA.PARTS_BY_CALIBER['cal-g'][5].cumMinutes === 1920, 'Stage 6 G · GEOMETRY completes at 1920m (32h)');
  assert(CA.PARTS_BY_CALIBER['cal-h'][5].cumMinutes === 2820, 'Stage 7 H · HARMONIC completes at 2820m (47h)');
  assert(CA.PARTS_BY_CALIBER['cal-i'][5].cumMinutes === 3900, 'Stage 8 I · INTEGRAL completes at 3900m (65h)');
  assert(CA.PARTS_BY_CALIBER['cal-j'][5].cumMinutes === 4800, 'Stage 9 J · JOULE completes at 4800m (80h)');
  assert(CA.PARTS_BY_CALIBER['cal-a'][5].cumMinutes === 6000, 'Stage 10 A · ALGEBRA completes at 6000m (100h)');

  // Legacy storage migration ('no1-pro' -> 'cal-e', 'no2-jump' -> 'cal-b')
  const migState = CA.sanitizeAtelierState({
    activeWatch: 'no2-jump',
    activeFinish: 'steel',
    assembledParts: { 'no2-jump': ['mainplate', 'barrel', 'geartrain', 'escapement', 'jumpcam', 'turretcase'] }
  });
  assert(migState.activeWatch === 'cal-b' && migState.assembledParts['cal-b'].length === 6, 'Legacy completed no2-jump migrates seamlessly to cal-b');
  const migStarter = CA.sanitizeAtelierState({ activeWatch: 'no1-pro', assembledParts: { 'no2-jump': ['mainplate'] } });
  assert(migStarter.activeWatch === 'cal-e' && migStarter.assembledParts['cal-b'].length === 1, 'Legacy no1-pro & partial parts migrate cleanly to cal-e / cal-b');

  // Pre-release default devMode check (flip DEFAULT_DEV_MODE to false at launch)
  const defaultState = CA.createDefaultAtelierState();
  assert(CA.DEFAULT_DEV_MODE === true && defaultState.devMode === true, 'Pre-release default atelier state enables devMode by default');

  let aState = CA.createDefaultAtelierState();
  aState.devMode = false; // Test normal progression rules with devMode OFF
  const s0 = CA.computeAtelierSnapshot([], aState);
  assert(s0.activeWatch === 'cal-b' && s0.activeProject.id === 'cal-b', '0m starts with B · BINARY equipped by default');
  assert(s0.assembledCount === 0 && !s0.isBinaryComplete && !s0.hasActionablePart, '0m logs -> 0 assembled, not actionable');
  assert(s0.machiningPart && s0.machiningPart.id === 'mainplate' && s0.machiningPart.remainingMinutes === 5, 'BINARY Part 01 requires 5m');
  assert(s0.calibers.find(function (c) { return c.id === 'cal-e'; }).unlocked === true, 'ELLIPSE remains usable from 0m as starter');

  // 5m -> BINARY Part 01 ready!
  const logs5 = [{ id: 'a5', minutes: 5, dateKey: '2026-11-25' }];
  const s5 = CA.computeAtelierSnapshot(logs5, aState);
  assert(s5.readyPart && s5.readyPart.id === 'mainplate', '5m makes B Part 01 ready to assemble');

  const r1 = CA.assembleNextPart(logs5, aState);
  assert(r1.ok && r1.assembledPart.id === 'mainplate' && !r1.completedCaliber, 'Assembles B Part 01 cleanly at 5m');
  aState = r1.state;
  const r1Again = CA.assembleNextPart(logs5, aState);
  assert(!r1Again.ok, 'Cannot assemble B Part 02 before 10m');

  // 30m -> completes Stage 1 B · BINARY & advances activeProject to Stage 2 D · DELTA!
  const logs30 = [{ id: 'b30', minutes: 30, dateKey: '2026-11-25' }];
  let completedB = false;
  let completedBId = null;
  for (let step = 2; step <= 6; step++) {
    const res = CA.assembleNextPart(logs30, aState);
    assert(res.ok, 'Assembles B part #' + step + ' sequentially at 30m');
    aState = res.state;
    if (step === 6) {
      completedB = res.completedCaliber;
      completedBId = res.completedCaliberId;
    }
  }
  assert(completedB === true && completedBId === 'cal-b', 'Assembling Part 06 at 30m completes B · BINARY caliber');
  const sAfterB = CA.computeAtelierSnapshot(logs30, aState);
  assert(sAfterB.isBinaryComplete && sAfterB.activeProject.id === 'cal-d', 'Completing B · BINARY advances active build project to D · DELTA');
  assert(sAfterB.calibers.find(function (c) { return c.id === 'cal-d'; }).unlocked === false, 'D · DELTA still locked at 30m');

  // Phase 2 full 0m -> 100h (6000m) simulation: all 10 watches complete in exact BUILD_ORDER and ALGEBRA opens last
  let simState = CA.createDefaultAtelierState();
  simState.devMode = false;
  const completedSequence = [];
  const stageEndMinutes = {
    'cal-b': 30, 'cal-d': 120, 'cal-c': 300, 'cal-e': 600, 'cal-f': 1200,
    'cal-g': 1920, 'cal-h': 2820, 'cal-i': 3900, 'cal-j': 4800, 'cal-a': 6000
  };
  CA.BUILD_ORDER.forEach(function (cid) {
    const mins = stageEndMinutes[cid];
    if (cid !== 'cal-a') {
      const preSnap = CA.computeAtelierSnapshot([], simState, mins);
      const algBefore = preSnap.calibers.find(function (c) { return c.id === 'cal-a'; });
      assert(algBefore && algBefore.unlocked === false, 'NO.1 ALGEBRA stays locked before stage ' + cid + ' completes');
    }
    for (let p = 1; p <= 6; p++) {
      const stepRes = CA.assembleNextPart([], simState, mins);
      assert(stepRes.ok, '100h sim assembles ' + cid + ' part #' + p + ' at ' + mins + 'm');
      simState = stepRes.state;
      if (p === 6) {
        assert(stepRes.completedCaliber && stepRes.completedCaliberId === cid, '100h sim completes ' + cid + ' at part 6');
        completedSequence.push(stepRes.completedCaliberId);
      }
    }
  });
  assert(completedSequence.join(',') === 'cal-b,cal-d,cal-c,cal-e,cal-f,cal-g,cal-h,cal-i,cal-j,cal-a', 'All 10 watches complete in exact B->D->C->E->F->G->H->I->J->A order');
  const sAllDone = CA.computeAtelierSnapshot([], simState, 6000);
  assert(sAllDone.allProjectsComplete === true && !sAllDone.hasActionablePart, 'All 10 calibers completed cleanly at 6000m (100h)');
  assert(sAllDone.calibers.filter(function (c) { return c.unlocked; }).length === 10, 'All 10 calibers unlocked at 100h');
  assert(sAllDone.calibers.find(function (c) { return c.id === 'cal-a'; }).unlocked === true, 'NO.1 ALGEBRA opens as the final 10th watch');

  // v1.6 migration check: previously assembled parts for cal-b/cal-c/cal-g/cal-a are NOT lost when order changes
  const v16RawState = {
    activeWatch: 'cal-g',
    activeFinish: 'steel',
    devMode: false,
    assembledParts: {
      'cal-b': ['mainplate', 'barrel', 'geartrain', 'escapement', 'jumpcam', 'turretcase'],
      'cal-c': ['cyc_plate', 'cyc_snail', 'cyc_rack', 'cyc_spring', 'cyc_fan', 'cyc_case'],
      'cal-g': ['geo_plate', 'geo_barrel'],
      'cal-a': []
    }
  };
  const v16Migrated = CA.sanitizeAtelierState(v16RawState);
  assert(v16Migrated.assembledParts['cal-b'].length === 6, 'v1.6 migration preserves all 6 cal-b parts');
  assert(v16Migrated.assembledParts['cal-c'].length === 6, 'v1.6 migration preserves all 6 cal-c parts');
  assert(v16Migrated.assembledParts['cal-g'].length === 2, 'v1.6 migration preserves 2 partial cal-g parts');
  const v16Snap = CA.computeAtelierSnapshot([], v16Migrated, 1500);
  assert(v16Snap.activeProject.id === 'cal-d' && v16Snap.readyPart && v16Snap.readyPart.id === 'del_plate', 'v1.6 user with 1500m sees newly inserted D · DELTA immediately ready to assemble');

  // Developer Mode ON unlocks all 10 calibers at 0m, OFF reverts cleanly!
  const devOnState = CA.sanitizeAtelierState({ activeWatch: 'cal-a', activeFinish: 'steel', devMode: true });
  const sDevOn = CA.computeAtelierSnapshot([], devOnState);
  assert(sDevOn.devMode === true && sDevOn.activeWatch === 'cal-a', 'Dev mode allows A · ALGEBRA at 0m');
  assert(sDevOn.calibers.filter(function (c) { return c.unlocked; }).length === 10, 'Dev mode unlocks all 10 calibers');

  const devOffState = CA.sanitizeAtelierState({ activeWatch: 'cal-a', activeFinish: 'steel', devMode: false });
  const sDevOff = CA.computeAtelierSnapshot([], devOffState);
  assert(sDevOff.devMode === false && sDevOff.activeWatch === 'cal-b' && sDevOff.activeFinish === 'steel', 'Turning Dev mode OFF cleanly reverts to B · BINARY & steel');
  const algLocked = sDevOff.calibers.find(function (c) { return c.id === 'cal-a'; });
  const algUnlocked = sDevOn.calibers.find(function (c) { return c.id === 'cal-a'; });
  assert(algLocked && algLocked.subtitle === '아직 풀리지 않은 미지수 · 9개 모델 완성 시 해금', 'Locked NO.1 ALGEBRA shows mystery locked subtitle');
  assert(algUnlocked && algUnlocked.subtitle === '마침내 풀어낸 미지수 x · 황금비 오프센터 & 빅데이트', 'Unlocked NO.1 ALGEBRA shows unlocked narrative+spec subtitle');

  // -------------------------------------------------------------------------
  // 12. CASPER v1.7 Phase 1 — Non-Punitive Accumulation & Restore Tests
  // -------------------------------------------------------------------------
  const CS = globalThis.ChronoStorage;
  function createMockLocalStorage() {
    const map = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
      setItem: function (k, v) { map[k] = String(v); },
      removeItem: function (k) { delete map[k]; },
      clear: function () { Object.keys(map).forEach(function (k) { delete map[k]; }); }
    };
  }

  // 12-1. Over 1,000 logs: lifetimeMinutes & atelier progress NEVER decrease, old logs compact by date
  globalThis.localStorage = createMockLocalStorage();
  const baseDayMs = Date.UTC(2026, 10, 1, 9, 0, 0);
  const seedLogs = [];
  for (let i = 0; i < 1050; i++) {
    const dayOffset = Math.floor(i / 25); // 42 days, 25 sessions/day
    const ts = baseDayMs + dayOffset * 86400000 + (i % 25) * 600000;
    const d = new Date(ts);
    const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    seedLogs.push({
      id: 'seed-' + i,
      subject: '전공',
      mode: 'pomodoro',
      minutes: 5,
      memo: '',
      endedAt: ts,
      dateKey: dk
    });
  }
  // Simulate legacy v1.6 logs stored before migration (1050 * 5 = 5250m)
  globalThis.localStorage.setItem('no5_chrono_logs_v1', JSON.stringify(seedLogs));
  const migratedLifetime = CS.getLifetimeMinutes();
  assert(migratedLifetime === 5250, 'First-run migration initializes lifetimeMinutes from existing 1,050 logs (5250m)');

  // Add one more 10m log -> triggers compaction (> 1000) and increases lifetimeMinutes to 5260m
  CS.addLog({ subject: '전공', mode: 'pomodoro', minutes: 10, endedAt: baseDayMs + 50 * 86400000 });
  const compactedLogs = CS.loadLogs();
  const lifetimeAfter1051 = CS.getLifetimeMinutes();
  const compactedSum = compactedLogs.reduce(function (acc, l) { return acc + (Number(l.minutes) || 0); }, 0);
  assert(compactedLogs.length < 1000, 'Compaction keeps stored log array under 1,000 entries');
  assert(compactedLogs.some(function (l) { return l.isSummary === true; }), 'Older logs beyond 1,000 are compacted into daily summary entries');
  assert(compactedSum === 5260, 'Daily summary compaction preserves 100% of total minutes (5260m)');
  assert(lifetimeAfter1051 === 5260, 'lifetimeMinutes grows to 5260m without ever decreasing past 1,000 logs');

  const p1State = CA.sanitizeAtelierState({ activeWatch: 'cal-b', devMode: false });
  const snapOver1000 = CA.computeAtelierSnapshot(compactedLogs, p1State, lifetimeAfter1051);
  assert(snapOver1000.metrics.totalMinutes === 5260 && snapOver1000.readyPart !== null, 'Atelier progress reflects full 5260m lifetimeMinutes past 1,000 logs');

  // 12-2. Deleting individual logs or clearing all logs NEVER reduces lifetimeMinutes or atelier progress
  const firstId = compactedLogs[0].id;
  CS.deleteLog(firstId);
  assert(CS.getLifetimeMinutes() === 5260, 'Deleting a log does NOT reduce lifetimeMinutes');
  CS.clearAllLogs();
  assert(CS.loadLogs().length === 0, 'clearAllLogs empties visible log list');
  assert(CS.getLifetimeMinutes() === 5260, 'clearAllLogs does NOT reduce lifetimeMinutes');
  const snapAfterClear = CA.computeAtelierSnapshot(CS.loadLogs(), p1State, CS.getLifetimeMinutes());
  assert(snapAfterClear.metrics.totalMinutes === 5260 && snapAfterClear.readyPart && snapAfterClear.readyPart.id === 'mainplate', 'Atelier progress does NOT decrease after deleting all logs');

  // Backup export & import preserves max(existing, imported) lifetimeMinutes
  const exportedJson = CS.exportBackupJson();
  const parsedExport = JSON.parse(exportedJson);
  assert(parsedExport.lifetimeMinutes === 5260, 'exportBackupJson includes lifetimeMinutes');
  // Import a smaller backup (100m) -> must keep larger existing 5260m
  const smallerImport = JSON.stringify({ app: 'CASPER', schema: 3, lifetimeMinutes: 100, logs: [] });
  CS.importBackupJson(smallerImport);
  assert(CS.getLifetimeMinutes() === 5260, 'importBackupJson keeps max(existing, imported) when imported is smaller');
  // Import a larger backup (6000m) -> must raise to 6000m
  const largerImport = JSON.stringify({ app: 'CASPER', schema: 3, lifetimeMinutes: 6000, logs: [] });
  CS.importBackupJson(largerImport);
  assert(CS.getLifetimeMinutes() === 6000, 'importBackupJson adopts larger imported lifetimeMinutes');

  // 12-3. Archiving at 7 minutes records 7 minutes as partial and reflects in atelier progress
  globalThis.localStorage = createMockLocalStorage();
  const tPartial = TC.createTimer({ mode: 'pomodoro', focusMinutes: 25, breakMinutes: 5 });
  tPartial.start(tBase);
  const elapsedAt7m = tPartial.getElapsedMs(tBase + 7 * 60000);
  const archivedMins = Math.floor(elapsedAt7m / 60000);
  assert(archivedMins === 7, '7m elapsed computes exact 7 archived minutes');
  const savedPartial = CS.addLog({ subject: '코딩', mode: 'partial', minutes: archivedMins, endedAt: tBase + 7 * 60000 });
  assert(savedPartial.mode === 'partial' && savedPartial.minutes === 7, '7m partial session recorded with mode=partial');
  assert(CS.getLifetimeMinutes() === 7, '7m partial session increments lifetimeMinutes to 7');
  const snapAt7m = CA.computeAtelierSnapshot(CS.loadLogs(), p1State, CS.getLifetimeMinutes());
  assert(snapAt7m.metrics.totalMinutes === 7 && snapAt7m.readyPart && snapAt7m.readyPart.id === 'mainplate', '7m partial archive reflects in atelier progress (BINARY Part 01 5m ready)');

  // 30-min resume vault window
  CS.saveResumeVault({ mode: 'pomodoro', phase: 'focus', remainingMinutes: 18, subject: '코딩', savedAtMs: tBase });
  assert(CS.loadResumeVault(tBase + 29 * 60000) !== null, 'Resume vault available within 30 minutes');
  assert(CS.loadResumeVault(tBase + 31 * 60000) === null, 'Resume vault expires cleanly after 30 minutes');

  // 12-4. Active session persistence & restore (accurate elapsed + single completion when target exceeded)
  const tRun = TC.createTimer({ mode: 'pomodoro', focusMinutes: 25, breakMinutes: 5 });
  tRun.start(tBase);
  const serializedRunning = tRun.serialize(tBase + 5 * 60000);
  CS.saveActiveSession(serializedRunning);

  // Restore at 10m -> still running, exact 10m elapsed
  const tMidRestore = TC.createTimer({ mode: 'clock' });
  const resMid = tMidRestore.restore(CS.loadActiveSession(), tBase + 10 * 60000);
  assert(resMid.restored === true && resMid.completedEvent === null && tMidRestore.state.running === true, 'Restoring running session before target resumes smoothly');
  assertNear(tMidRestore.getElapsedMs(tBase + 10 * 60000), 10 * 60000, 0, 'Restored running session has exact 10m elapsed time');

  // Restore at 40m (past 25m target) -> completes ONCE for 25m and subsequent tick() returns null
  const tOverRestore = TC.createTimer({ mode: 'clock' });
  const resOver = tOverRestore.restore(CS.loadActiveSession(), tBase + 40 * 60000);
  assert(resOver.restored === true && resOver.completedEvent !== null && resOver.completedEvent.minutes === 25, 'Restoring past target emits completion event for target 25m');
  assert(tOverRestore.state.running === false && tOverRestore.tick(tBase + 41 * 60000) === null, 'Overdue restored session completes exactly once (no double completion)');

  // Stopwatch left running >= 12 hours -> does NOT auto-save; requests gentle review
  const tSwLong = TC.createTimer({ mode: 'stopwatch' });
  tSwLong.start(tBase);
  const swSaved = tSwLong.serialize(tBase);
  const tSwRestore = TC.createTimer({ mode: 'clock' });
  const resSwLong = tSwRestore.restore(swSaved, tBase + 13 * 3600000);
  assert(resSwLong.restored === true && resSwLong.needsStopwatchReview === true && resSwLong.completedEvent === null && tSwRestore.state.running === false, 'Stopwatch running >= 12h pauses and prompts gentle check-in without auto-saving');

  // -------------------------------------------------------------------------
  // 13. CASPER v1.7 Phase 3 — Override Target, Dev Reset, Stories & Onboarding
  // -------------------------------------------------------------------------

  // 13-1. Resume vault one-shot overrideTargetMinutes preserves default focusMinutes (25m) & prefs
  globalThis.localStorage = createMockLocalStorage();
  const basePrefs = CS.loadPrefs();
  basePrefs.focusMinutes = 25;
  basePrefs.breakMinutes = 5;
  basePrefs.countdownMinutes = 25;
  CS.savePrefs(basePrefs);

  const tResume = TC.createTimer({
    mode: 'pomodoro',
    focusMinutes: basePrefs.focusMinutes,
    breakMinutes: basePrefs.breakMinutes,
    countdownMinutes: basePrefs.countdownMinutes
  });
  tResume.start(tBase);
  // Archive at 7m -> 18m remaining
  const remAfter7m = Math.ceil((tResume.getTargetMs() - tResume.getElapsedMs(tBase + 7 * 60000)) / 60000);
  assert(remAfter7m === 18, '25m focus archived at 7m leaves 18m remaining');
  tResume.reset();
  tResume.setMode('pomodoro');
  tResume.setOverrideTargetMinutes(remAfter7m);
  assert(tResume.getTargetMs() === 18 * 60000, 'Resume session uses one-shot 18m overrideTargetMinutes');
  assert(tResume.state.focusMinutes === 25, 'Default focusMinutes stays 25m during 18m resumed session');

  // Verify serialize/restore keeps overrideTargetMinutes intact
  tResume.start(tBase + 8 * 60000);
  const serOverride = tResume.serialize(tBase + 10 * 60000);
  assert(serOverride.overrideTargetMinutes === 18 && serOverride.focusMinutes === 25, 'serialize preserves overrideTargetMinutes=18 and focusMinutes=25');
  const tResumeRestored = TC.createTimer({ mode: 'clock' });
  tResumeRestored.restore(serOverride, tBase + 10 * 60000);
  assert(tResumeRestored.state.overrideTargetMinutes === 18 && tResumeRestored.getTargetMs() === 18 * 60000, 'restore preserves one-shot overrideTargetMinutes');

  // Complete the 18m resumed session -> next focus round returns to 25m and prefs remain 25m
  const evt18 = tResume.tick(tBase + 8 * 60000 + 18 * 60000);
  assert(evt18 !== null && evt18.minutes === 18, 'Resumed session completes at 18m');
  assert(tResume.state.overrideTargetMinutes === null, 'overrideTargetMinutes clears automatically upon completion');
  assert(tResume.state.phase === 'break' && tResume.getTargetMs() === 5 * 60000, 'Transitions to 5m break after resumed focus');
  // Complete 5m break -> next focus round is 25m
  tResume.start(tBase + 30 * 60000);
  const evtBrk = tResume.tick(tBase + 35 * 60000);
  assert(evtBrk !== null && evtBrk.finishedPhase === 'break', '5m break completes');
  assert(tResume.state.phase === 'focus' && tResume.getTargetMs() === 25 * 60000 && tResume.state.focusMinutes === 25, 'Next focus round returns to original 25m');
  assert(CS.loadPrefs().focusMinutes === 25, 'Saved prefs.focusMinutes remains 25m');

  // Onboarding 5m countdown uses one-shot override and unlocks BINARY Part 01 (5m)
  const tOnb = TC.createTimer({ mode: 'clock', countdownMinutes: 25 });
  tOnb.setMode('countdown');
  tOnb.setOverrideTargetMinutes(5);
  assert(tOnb.getTargetMs() === 5 * 60000 && tOnb.state.countdownMinutes === 25, 'Onboarding 5m countdown does not alter default countdownMinutes (25m)');
  tOnb.start(tBase);
  const evtOnb = tOnb.tick(tBase + 5 * 60000);
  assert(evtOnb !== null && evtOnb.minutes === 5 && tOnb.state.overrideTargetMinutes === null && tOnb.getTargetMs() === 25 * 60000, 'After 5m onboarding countdown completes, target reverts to 25m');
  CS.addLog({ subject: '전공', mode: 'countdown', minutes: 5, endedAt: tBase + 5 * 60000 });
  const snapAfter5m = CA.computeAtelierSnapshot(CS.loadLogs(), CA.sanitizeAtelierState({ devMode: false }), CS.getLifetimeMinutes());
  assert(snapAfter5m.readyPart && snapAfter5m.readyPart.id === 'mainplate', '5m onboarding session makes BINARY Part 01 immediately ready to assemble');

  // 13-2. Dev-mode-only complete progress reset (devResetAllProgress)
  CS.addLog({ subject: '코딩', mode: 'pomodoro', minutes: 60, endedAt: tBase + 10 * 60000 });
  const beforeResetLifetime = CS.getLifetimeMinutes();
  assert(beforeResetLifetime === 65, 'Lifetime is 65m before dev reset test');
  // Refuses when devMode is false
  const blockedReset = CS.devResetAllProgress(false);
  assert(blockedReset === false && CS.getLifetimeMinutes() === 65 && CS.loadLogs().length === 2, 'devResetAllProgress(false) refuses and leaves lifetimeMinutes & logs intact');
  // Succeeds when devMode is true
  const allowedReset = CS.devResetAllProgress(true);
  assert(allowedReset === true && CS.getLifetimeMinutes() === 0 && CS.loadLogs().length === 0, 'devResetAllProgress(true) resets lifetimeMinutes to 0 and clears logs');
  const resetAtelier = CS.loadAtelier();
  assert(CA.BUILD_ORDER.every(function (cid) { return Array.isArray(resetAtelier.assembledParts[cid]) && resetAtelier.assembledParts[cid].length === 0; }), 'devResetAllProgress(true) clears all 10 calibers assembledParts');

  // 13-3. All 60 parts have non-empty story and concatenated pieces match exact appendix text (ignoring whitespace)
  const EXPECTED_STORIES = {
    'cal-b': '시작하지 않은 0의 세계와, 이미 발을 디딘 1의 세계 사이에는 어정쩡한 회색이 없다. 망설임을 반으로 자르고, 단 한 번의 호흡으로 이쪽으로 건너온다.',
    'cal-d': '겉보기엔 어제와 똑같은 하루 같아도, 바늘이 1밀리미터 움직인 그 미세한 틈(Δ) 사이로 이미 다른 내가 자라고 있다.',
    'cal-c': '공이 가장 빠르게 굴러내리는 길은 직선이 아니라, 아래로 깊게 떨어졌다가 다시 솟아오르는 곡선이다. 집중이 무너지고 다시 제자리로 돌아오는 그 궤적 자체가, 사실은 가장 빠른 길이었다.',
    'cal-e': '완벽한 원은 중심이 하나지만, 타원은 두 개의 초점을 품고 돈다. 때로 멀어지고 삐뚤어지더라도 결국 다시 돌아오게 만드는 중력. 완벽하지 않아서 오히려 오래 버티는 나의 궤도.',
    'cal-f': '오늘 책상 앞에서 보낸 보잘것없는 5분을 끝없이 확대해 보면, 거기엔 내 일생의 모양이 그대로 닮아 있다. 작은 하루의 무늬가 결국 거대한 나를 빚는다.',
    'cal-g': '요란한 계획과 불안한 장식을 모두 걷어내고 오직 선과 점만 남겼을 때, 비로소 눈앞의 세계가 고요하고 선명해진다.',
    'cal-h': '바깥의 세상은 늘 불협화음으로 밀려오지만, 내 안의 추는 오직 제 진동수만 기억한다. 외부의 속도에 휩쓸리지 않는 단단한 평정.',
    'cal-i': '흘려보낸 줄 알았던 시간들은 사실 어디로도 사라지지 않았다. 얇게 썰린 찰나(dt)들이 겹겹이 쌓여, 어느새 나를 지탱하는 가장 단단한 지층이 되어 있었다.',
    'cal-j': '시간은 차가운 숫자가 아니라 열기였다. 고요히 앉아 태워낸 모든 밤들이, 이제 나를 내일로 밀어 올리는 보이지 않는 온기(에너지)가 된다.',
    'cal-a': "고대어로 CASPER는 '보물을 지키는 자'를 뜻합니다. 아홉 개의 시계를 지나 다시 첫 번째 번호로 돌아온 오늘, 보이지 않는 곳에서 당신의 밤을 지키던 관리자가 비로소 금고의 문을 엽니다. 대수학(Algebra)은 알 수 없는 미지수 x를 찾아내는 학문입니다. 당신이 매일 타이머를 켜며 풀어내려 했던 x, 그리고 CASPER가 그토록 소중히 보관해 온 단 하나의 보물은 흘러간 숫자가 아니었습니다. 그 모든 시간을 견뎌내고, 지금 여기 단단히 앉아 있는 당신 자신입니다."
  };
  const stripWs = function (s) { return String(s || '').replace(/\s+/g, ''); };
  CA.BUILD_ORDER.forEach(function (cid) {
    const parts = CA.PARTS_BY_CALIBER[cid];
    assert(Array.isArray(parts) && parts.length === 6, cid + ' has 6 parts for story check');
    const allNonEmpty = parts.every(function (p) { return typeof p.story === 'string' && p.story.trim().length > 0; });
    assert(allNonEmpty, cid + ' all 6 parts have non-empty story strings');
    const joined = parts.map(function (p) { return p.story; }).join(' ');
    assert(stripWs(joined) === stripWs(EXPECTED_STORIES[cid]), cid + ' joined part stories exactly match appendix text (ignoring whitespace)');
  });

  // 13-4. isNewUser() detection (returns false if any log, lifetime>0, atelier key, or onboardingSeen exists)
  globalThis.localStorage = createMockLocalStorage();
  assert(CS.isNewUser() === true, 'Completely empty storage is detected as new user');
  assert(CS.isNewUser() === true, 'Repeated isNewUser() calls do not mutate storage');

  // With onboardingSeen flag
  CS.saveNarrativeMeta({ onboardingSeen: true, prologueSeen: false, epilogueSeen: false, hintsSeen: { deck: false, crown: false } });
  assert(CS.isNewUser() === false, 'onboardingSeen=true suppresses onboarding');

  // With logs only
  globalThis.localStorage = createMockLocalStorage();
  globalThis.localStorage.setItem('no5_chrono_logs_v1', JSON.stringify([{ id: 'l1', minutes: 10, dateKey: '2026-11-25' }]));
  assert(CS.isNewUser() === false, 'Existing logs suppress onboarding');

  // With lifetimeMinutes > 0 only
  globalThis.localStorage = createMockLocalStorage();
  globalThis.localStorage.setItem('no1_pro_lifetime_v1', JSON.stringify({ minutes: 15 }));
  assert(CS.isNewUser() === false, 'Positive lifetimeMinutes suppresses onboarding');

  // With v1.6 / Phase 2 atelier state key only (even at 0 logs & 0 lifetime)
  globalThis.localStorage = createMockLocalStorage();
  globalThis.localStorage.setItem('no1_pro_atelier_v1', JSON.stringify({ activeWatch: 'cal-b', devMode: false, assembledParts: {} }));
  assert(CS.isNewUser() === false, 'Existing atelier state (v1.6 / Phase 2 user) suppresses onboarding');

  // -------------------------------------------------------------------------
  // 14. CASPER v1.7 Phase 4 — Version Sync, Legacy Backup & SW Routing Tests
  // -------------------------------------------------------------------------
  const VER = globalThis.CASPER_VERSION;
  const SW = globalThis.CasperSw;
  assert(typeof VER === 'string' && /^\d+\.\d+\.\d+$/.test(VER), 'CASPER_VERSION is a valid semver string (' + VER + ')');
  assert(SW && SW.CACHE_NAME === 'casper-v' + VER, 'sw.js CACHE_NAME matches casper-v' + VER);

  // 14-1. All ?v= queries in index.html and sw.js ASSETS must match CASPER_VERSION
  const htmlSrc = readProjectFile('index.html');
  const htmlQueryMatches = htmlSrc.match(/\?v=([0-9]+\.[0-9]+\.[0-9]+)/g) || [];
  assert(htmlQueryMatches.length >= 13, 'index.html contains versioned asset queries (found ' + htmlQueryMatches.length + ')');
  assert(htmlQueryMatches.every(function (q) { return q === '?v=' + VER; }), 'All ?v= queries in index.html match CASPER_VERSION (' + VER + ')');

  const swSrc = readProjectFile('sw.js');
  assert(swSrc.indexOf("importScripts('version.js')") !== -1, "sw.js loads version.js via importScripts('version.js')");
  const swAssetQueries = (SW.ASSETS || []).filter(function (a) { return a.indexOf('?v=') !== -1; });
  assert(swAssetQueries.length >= 13, 'sw.js ASSETS includes versioned static assets (found ' + swAssetQueries.length + ')');
  assert(swAssetQueries.every(function (a) { return a.endsWith('?v=' + VER); }), 'All ?v= entries in sw.js ASSETS match CASPER_VERSION (' + VER + ')');

  // Verify PNG icons cached in sw.js and declared in manifest.json
  const reqIcons = ['./icon-192.png', './icon-512.png', './icon-192-maskable.png', './icon-512-maskable.png', './apple-touch-icon.png'];
  reqIcons.forEach(function (ic) {
    assert(SW.ASSETS.includes(ic), 'sw.js ASSETS caches ' + ic);
  });
  const manifestObj = JSON.parse(readProjectFile('manifest.json'));
  assert(manifestObj.theme_color === '#080B0F' && manifestObj.background_color === '#080B0F', 'manifest theme_color matches background_color (#080B0F)');
  assert(manifestObj.icons.some(function (i) { return i.sizes === '192x192' && i.purpose === 'any' && i.type === 'image/png'; }), 'manifest includes 192x192 any PNG');
  assert(manifestObj.icons.some(function (i) { return i.sizes === '512x512' && i.purpose === 'any' && i.type === 'image/png'; }), 'manifest includes 512x512 any PNG');
  assert(manifestObj.icons.some(function (i) { return i.sizes === '192x192' && i.purpose === 'maskable' && i.type === 'image/png'; }), 'manifest includes 192x192 maskable PNG');
  assert(manifestObj.icons.some(function (i) { return i.sizes === '512x512' && i.purpose === 'maskable' && i.type === 'image/png'; }), 'manifest includes 512x512 maskable PNG');

  // 14-2. Legacy backup import (app: 'NO.1 PRO', schema: 2, without lifetimeMinutes)
  globalThis.localStorage = createMockLocalStorage();
  const legacyBackup = JSON.stringify({
    app: 'NO.1 PRO',
    schema: 2,
    exportedAt: '2026-10-01T00:00:00.000Z',
    prefs: { focusMinutes: 50, breakMinutes: 10 },
    atelier: {
      activeWatch: 'no2-jump',
      devMode: false,
      assembledParts: {
        'no2-jump': ['mainplate', 'barrel']
      }
    },
    logs: [
      { id: 'legacy-1', subject: '전공', mode: 'pomodoro', minutes: 25, memo: 'v1.6 기록', endedAt: tBase - 7200000, dateKey: '2026-10-01' },
      { id: 'legacy-2', subject: '코딩', mode: 'countdown', minutes: 50, memo: '', endedAt: tBase - 3600000, dateKey: '2026-10-01' }
    ]
  });
  const legacyRes = CS.importBackupJson(legacyBackup);
  assert(legacyRes.added === 2 && legacyRes.total === 2 && legacyRes.lifetimeMinutes === 75, 'Legacy NO.1 PRO schema 2 backup imports cleanly and computes lifetimeMinutes=75');
  assert(CS.getLifetimeMinutes() === 75, 'Lifetime minutes updated to 75m after legacy backup import');
  const legacyAtelier = CS.loadAtelier();
  assert(legacyAtelier.assembledParts['cal-b'].length === 2 && legacyAtelier.assembledParts['cal-b'][0] === 'mainplate', 'Legacy no2-jump parts migrate cleanly to cal-b on import');

  // 14-3. Service Worker pickStrategy(url, mode, selfOrigin) routing rules
  const origin = 'https://casper.example.com';
  assert(SW.pickStrategy(origin + '/', 'navigate', origin) === 'network-first', 'Root navigation uses network-first');
  assert(SW.pickStrategy(origin + '/index.html', 'navigate', origin) === 'network-first', 'index.html navigation uses network-first');
  assert(SW.pickStrategy(origin + '/app.js?v=' + VER, 'no-cors', origin) === 'cache-first', 'Versioned JS asset uses cache-first');
  assert(SW.pickStrategy(origin + '/styles.css?v=' + VER, 'cors', origin) === 'cache-first', 'Versioned CSS asset uses cache-first');
  assert(SW.pickStrategy(origin + '/icon-192.png', 'no-cors', origin) === 'cache-first', 'Local PNG icon uses cache-first');
  assert(SW.pickStrategy('https://music.youtube.com/watch?v=abc123', 'no-cors', origin) === 'passthrough', 'External YouTube Music URL (even with ?v=) uses passthrough');
  assert(SW.pickStrategy('https://www.youtube.com/embed/xyz', 'cors', origin) === 'passthrough', 'External YouTube embed uses passthrough');
  assert(SW.pickStrategy(origin + '/unversioned/data.json', 'cors', origin) === 'passthrough', 'Unversioned non-icon request uses passthrough');
  assert(SW.pickStrategy(origin + '/cheers.json', 'cors', origin) === 'network-first', 'cheers.json uses network-first strategy');
  assert(SW.ASSETS.includes('./cheers.json'), 'sw.js ASSETS includes ./cheers.json');

  // -------------------------------------------------------------------------
  // 15. CASPER v1.7 Finisher One-Line Cheers Tests
  // -------------------------------------------------------------------------
  const CH = globalThis.CasperCheers;
  assert(CH && typeof CH.validateCheerText === 'function', 'CasperCheers module is loaded');

  // 15-1. Visibility gate: hidden until NO.1 ALGEBRA is complete (except devMode)
  const incompleteSnap = CA.computeAtelierSnapshot([], CA.sanitizeAtelierState({ devMode: false }), 100);
  assert(CH.canComposeCheer(incompleteSnap, false) === false, 'Cheer composer hidden when ALGEBRA is incomplete and devMode=false');
  assert(CH.canComposeCheer(incompleteSnap, true) === true, 'Cheer composer previewable when devMode=true');

  const fullParts = {};
  CA.BUILD_ORDER.forEach(function (cid) {
    fullParts[cid] = CA.PARTS_BY_CALIBER[cid].map(function (p) { return p.id; });
  });
  const completeSnap = CA.computeAtelierSnapshot([], CA.sanitizeAtelierState({ devMode: false, assembledParts: fullParts }), 6000);
  assert(CH.canComposeCheer(completeSnap, false) === true, 'Cheer composer unlocked when NO.1 ALGEBRA is complete');

  // 15-2. Input validation: empty/whitespace, >60 chars, URL, email, phone blocked
  assert(CH.validateCheerText('   ').ok === false, 'Whitespace-only cheer is rejected');
  assert(CH.validateCheerText('가'.repeat(60)).ok === true, 'Exactly 60-char cheer is accepted');
  assert(CH.validateCheerText('가'.repeat(61)).ok === false, '61-char cheer is rejected');
  assert(CH.validateCheerText('힘내세요 https://example.com').ok === false, 'URL in cheer is rejected');
  assert(CH.validateCheerText('www.naver.com 방문하세요').ok === false, 'www URL in cheer is rejected');
  assert(CH.validateCheerText('연락은 test@example.com 으로').ok === false, 'Email in cheer is rejected');
  assert(CH.validateCheerText('전화 010-1234-5678 주세요').ok === false, 'Phone number in cheer is rejected');
  assert(CH.validateCheerText('오늘의 5분도 분명 쌓이고 있어요.').ok === true, 'Clean Korean cheer is accepted');

  // 15-3. Submit URL builder: encodes message; returns null when CHEERS_SUBMIT_URL is empty
  assert(CH.buildSubmitUrl('오늘도 잘 버텼어요', '') === null, 'Empty submit URL returns null (submit disabled)');
  const formBase = 'https://docs.google.com/forms/d/e/1FAIpQL/viewform?usp=pp_url&entry.999=';
  const builtUrl = CH.buildSubmitUrl('오늘도 잘 버텼어요', formBase);
  assert(builtUrl === formBase + encodeURIComponent('오늘도 잘 버텼어요'), 'Submit URL appends URL-encoded cheer text only');
  assert(CH.buildSubmitUrl('bad@email.com', formBase) === null, 'Invalid cheer text returns null submit URL');

  // 15-4. Daily display rules: once per day, full cycle before repeat, disabled when off
  const cheersJson = JSON.parse(readProjectFile('cheers.json'));
  const parsedCheers = CH.parseCheersPayload(cheersJson);
  assert(parsedCheers.length === 3 && parsedCheers.every(function (c) { return c.sample === true; }), 'cheers.json loads 3 sample messages');

  // Disabled setting -> never shows
  const offRes = CH.pickDailyCheer(parsedCheers, {}, '2026-11-25', false);
  assert(offRes.message === null, 'Cheer does not show when cheersEnabled=false');

  // Missing / failed cheers.json payload -> gracefully hides with null and no throw
  assert(CH.parseCheersPayload(null).length === 0, 'Missing cheers.json payload returns empty array without error');
  assert(CH.pickDailyCheer([], {}, '2026-11-25', true).message === null, 'Empty cheer list hides gracefully');

  // Day 1 -> c001, same day second call -> null (once per day)
  const d1 = CH.pickDailyCheer(parsedCheers, {}, '2026-11-25', true);
  assert(d1.message && d1.message.id === 'c001', 'Day 1 shows first cheer (c001)');
  const d1Again = CH.pickDailyCheer(parsedCheers, d1.nextState, '2026-11-25', true);
  assert(d1Again.message === null, 'Same day second trigger shows nothing (max once per day)');

  // Day 2 -> c002, Day 3 -> c003 (no repeats before all seen)
  const d2 = CH.pickDailyCheer(parsedCheers, d1.nextState, '2026-11-26', true);
  const d3 = CH.pickDailyCheer(parsedCheers, d2.nextState, '2026-11-27', true);
  assert(d2.message && d2.message.id === 'c002', 'Day 2 shows unseen cheer (c002)');
  assert(d3.message && d3.message.id === 'c003', 'Day 3 shows unseen cheer (c003)');

  // Day 4 -> cycle resets and repeats without immediate back-to-back c003
  const d4 = CH.pickDailyCheer(parsedCheers, d3.nextState, '2026-11-28', true);
  assert(d4.message && d4.message.id === 'c001', 'Day 4 restarts cycle after all cheers have been seen');

  // 15-5. Local myCheer backup export & restore
  globalThis.localStorage = createMockLocalStorage();
  const nMeta = CS.loadNarrativeMeta();
  nMeta.myCheer = '당신의 5분도 분명 빛나요.';
  CS.saveNarrativeMeta(nMeta);
  const cheerBackup = CS.exportBackupJson();
  assert(JSON.parse(cheerBackup).myCheer === '당신의 5분도 분명 빛나요.', 'exportBackupJson includes myCheer');
  globalThis.localStorage = createMockLocalStorage();
  CS.importBackupJson(cheerBackup);
  assert(CS.loadNarrativeMeta().myCheer === '당신의 5분도 분명 빛나요.', 'importBackupJson restores myCheer');

  // -------------------------------------------------------------------------
  // 16. CASPER v1.7.1 / v1.7.2 — Update Gate, Reload Guard, Cheers & In-Design
  // -------------------------------------------------------------------------
  const CV = globalThis.CasperVersion;
  assert(VER === '1.8.0', 'CASPER_VERSION is bumped to 1.8.0');
  assert(CV && typeof CV.shouldShowUpdateBanner === 'function', 'CasperVersion.shouldShowUpdateBanner is available');
  assert(CV.shouldShowUpdateBanner(true, true) === false, 'Update banner stays hidden while timer is running');
  assert(CV.shouldShowUpdateBanner(true, false) === true, 'Update banner shows once timer stops/completes');
  assert(CV.shouldShowUpdateBanner(false, false) === false, 'Update banner stays hidden when no waiting SW exists');
  assert(CV.shouldCheckForUpdate(0, tBase) === true, 'Initial visibility check triggers SW update check');
  assert(CV.shouldCheckForUpdate(tBase, tBase + 30 * 60000) === false, 'SW update check is throttled within 1 hour');
  assert(CV.shouldCheckForUpdate(tBase, tBase + 61 * 60000) === true, 'SW update check runs again after 1 hour');

  // v1.7.2: controllerchange reload guard (never reloads on first-visit clients.claim())
  assert(typeof CV.shouldReloadOnControllerChange === 'function', 'CasperVersion.shouldReloadOnControllerChange is exported');
  assert(CV.shouldReloadOnControllerChange({ requested: false, alreadyReloading: false }) === false, 'Does NOT reload on controllerchange when user did not request update');
  assert(CV.shouldReloadOnControllerChange({ requested: true, alreadyReloading: false }) === true, 'Reloads once when user explicitly requested update');
  assert(CV.shouldReloadOnControllerChange({ requested: true, alreadyReloading: true }) === false, 'Prevents duplicate reload when already reloading');

  // v1.7.2: Showing onboarding without clicking a button keeps isNewUser() === true
  globalThis.localStorage = createMockLocalStorage();
  assert(CS.isNewUser() === true, 'Fresh user sees onboarding (isNewUser=true)');
  // Simulating display without button click (no onboardingSeen saved, only prefs/atelier read)
  CS.loadPrefs();
  CS.loadAtelier();
  assert(CS.isNewUser() === true, 'Showing onboarding without clicking button keeps isNewUser() === true');
  // After user explicitly clicks "5분만 앉아보기" or "둘러보기"
  const afterClickMeta = CS.loadNarrativeMeta();
  afterClickMeta.onboardingSeen = true;
  CS.saveNarrativeMeta(afterClickMeta);
  assert(CS.isNewUser() === false, 'Explicit onboarding action sets onboardingSeen=true so isNewUser() becomes false');

  // Sample vs Real finisher cheer title & priority
  assert(CH.getCheerTitle({ id: 'c001', text: '예시', sample: true }) === '공방지기의 한 줄', 'Sample cheer uses title "공방지기의 한 줄"');
  assert(CH.getCheerTitle({ id: 'c100', text: '완주자' }) === '먼저 완주한 누군가의 한 줄', 'Real finisher cheer uses title "먼저 완주한 누군가의 한 줄"');
  assert(d1.title === '공방지기의 한 줄', 'pickDailyCheer returns "공방지기의 한 줄" when only sample cheers exist');

  const mixedCheers = parsedCheers.concat([
    { id: 'r001', text: '실제 완주자의 첫 응원입니다.', sample: false }
  ]);
  const mixedPick = CH.pickDailyCheer(mixedCheers, {}, '2026-11-29', true);
  assert(mixedPick.message && mixedPick.message.id === 'r001' && mixedPick.title === '먼저 완주한 누군가의 한 줄', 'Real finisher cheer is prioritized over sample cheers and uses finisher title');
  const mixedPickNext = CH.pickDailyCheer(mixedCheers, mixedPick.nextState, '2026-11-30', true);
  assert(mixedPickNext.message && mixedPickNext.message.id === 'r001', 'Sample cheers are not chosen when real finisher cheers exist');

  // inDesign caliber badge check
  assert(typeof CA.isCaliberInDesign === 'function', 'CasperAtelier.isCaliberInDesign is exported');
  assert(CA.isCaliberInDesign('cal-d') === true && CA.isCaliberInDesign('cal-f') === true && CA.isCaliberInDesign('cal-h') === true && CA.isCaliberInDesign('cal-i') === true && CA.isCaliberInDesign('cal-j') === true, 'All 5 in-design calibers (D, F, H, I, J) return true');
  assert(CA.isCaliberInDesign('cal-a') === false && CA.isCaliberInDesign('cal-b') === false && CA.isCaliberInDesign('cal-c') === false && CA.isCaliberInDesign('cal-e') === false && CA.isCaliberInDesign('cal-g') === false, 'All 5 dedicated-engine calibers (A, B, C, E, G) return false');

  // Verify no <button> remains inside <summary> in index.html
  const summaryBlocks = htmlSrc.match(/<summary[\s\S]*?<\/summary>/g) || [];
  assert(summaryBlocks.length > 0 && summaryBlocks.every(function (b) { return b.indexOf('<button') === -1; }), 'No <button> elements remain inside <summary> in index.html');

  // -------------------------------------------------------------------------
  // 17. CASPER v1.7.3 — Service record (changelog) + legal footer
  // -------------------------------------------------------------------------
  const CI = globalThis.CasperInfo;
  assert(CI && Array.isArray(CI.CHANGELOG) && CI.CHANGELOG.length > 0, 'CasperInfo.CHANGELOG is a non-empty array');
  assert(CI.CHANGELOG[0].version === VER, 'Latest changelog entry matches CASPER_VERSION (' + VER + ')');
  assert(CI.CHANGELOG.every(function (c) { return c.version && c.title && Array.isArray(c.notes) && c.notes.length > 0; }), 'Every changelog entry has version, title and non-empty notes');
  assert(CI.CHANGELOG.every(function (c) { return c.date === '' || /^\d{4}-\d{2}-\d{2}$/.test(c.date); }), 'Changelog dates are YYYY-MM-DD (or empty for legacy)');
  const ciVersions = CI.CHANGELOG.map(function (c) { return c.version; });
  assert(new Set(ciVersions).size === ciVersions.length, 'Changelog versions are unique');
  const ciDated = CI.CHANGELOG.filter(function (c) { return c.date; }).map(function (c) { return c.date; });
  assert(ciDated.every(function (d, i) { return i === 0 || ciDated[i - 1] >= d; }), 'Changelog is sorted newest first');
  assert(CI.HOLDER === 'Wadakiz!', 'Copyright holder is Wadakiz!');
  assert(['terms', 'privacy', 'medical'].every(function (k) { return CI.PAGES[k] && CI.PAGES[k][1].length > 0; }), 'Footer notice pages (terms, privacy, medical) exist');
  assert(SW.ASSETS.includes('./casper-info.js?v=' + VER), 'sw.js ASSETS caches casper-info.js');
  assert(htmlSrc.indexOf('casper-info.js?v=' + VER) !== -1, 'index.html loads casper-info.js');
  assert(htmlSrc.indexOf('casper-info.js') < htmlSrc.indexOf('app.js?v='), 'casper-info.js loads before app.js');
  const ciSrc = readProjectFile('casper-info.js');
  assert(!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(ciSrc), 'No contact e-mail address in footer notices');

  // 18. v1.7.3 — Current YouTube track title from embed infoDelivery messages
  assert(typeof CM.parseYouTubeInfoMessage === 'function', 'ChronoMusic.parseYouTubeInfoMessage is exported');
  const ytInfo = CM.parseYouTubeInfoMessage(JSON.stringify({ event: 'infoDelivery', info: { videoData: { title: ' Lofi Track ', author: 'Lofi Girl' }, playerState: 1 } }), 'https://www.youtube.com');
  assert(ytInfo && ytInfo.title === 'Lofi Track' && ytInfo.author === 'Lofi Girl' && ytInfo.playerState === 1, 'infoDelivery message yields trimmed title, author and player state');
  assert(CM.parseYouTubeInfoMessage(JSON.stringify({ event: 'infoDelivery', info: { videoData: { title: 'X' } } }), 'https://evil.example') === null, 'Messages from non-YouTube origins are ignored');
  assert(CM.parseYouTubeInfoMessage('not json', 'https://www.youtube.com') === null, 'Non-JSON messages are ignored');
  assert(CM.parseYouTubeInfoMessage({ event: 'onReady' }, 'https://www.youtube-nocookie.com') === null, 'Unrelated YouTube events are ignored');
  assert(typeof CM.sendListeningHandshake === 'function' && CM.sendListeningHandshake(null) === false, 'sendListeningHandshake is safe without an iframe');

  // 19. v1.7.3 — White noise settings: renamed card, dock sliders, timer-gated playback
  assert(htmlSrc.indexOf('오프라인 자체 합성') === -1, 'Sound tab no longer mentions "오프라인 자체 합성"');
  assert(htmlSrc.indexOf('화이트 노이즈 설정') !== -1, 'Sound mixer card is titled "화이트 노이즈 설정"');
  assert(['btnQuickTick', 'btnQuickRain', 'btnQuickCafe'].every(function (id) { return htmlSrc.indexOf('id="' + id + '"') !== -1; }) && htmlSrc.indexOf('class="dock-noise"') !== -1, 'Music dock contains white noise on/off chips');
  const audioSrc = readProjectFile('audio-engine.js');
  assert(/ambienceActive/.test(audioSrc) && /settings\.ambienceActive === false\) \? 0/.test(audioSrc), 'Audio engine silences white noise when ambienceActive is false');

  logLine('TEST SUMMARY: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    if (typeof process !== 'undefined' && process && typeof process.exit === 'function') {
      process.exit(1);
    }
    throw new Error('Unit tests failed: ' + failed);
  }
})();
