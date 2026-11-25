/**
 * NO.1 PRO — Automated Unit Test Suite (tests/timer-core.test.js)
 * Runnable directly on macOS via:
 *   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/timer-core.test.js
 */
(function () {
  'use strict';

  if (typeof load === 'function') {
    load('timer-core.js');
    load('music-player.js');
    load('atelier-engine.js');
  } else if (typeof require === 'function') {
    globalThis.TimerCore = require('../timer-core.js');
    globalThis.ChronoMusic = require('../music-player.js');
    globalThis.CasperAtelier = require('../atelier-engine.js');
  }

  const TC = globalThis.TimerCore;
  const CM = globalThis.ChronoMusic;
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
  assert(CA.CALIBERS[1].name === 'NO.2 BINARY' && CA.CALIBERS[1].engine === 'CASPER™ · V1', 'NO.2 Binary uses CASPER™ · V1 engine branding');
  assert(CA.NO2_PARTS.length === 6 && CA.NO2_PARTS[5].cumMinutes === 720, 'Stage 1 B · BINARY has 6 parts totaling 720m (12h)');
  assert(CA.PARTS_BY_CALIBER['cal-c'][5].cumMinutes === 1440, 'Stage 2 C · CYCLOID completes at 1440m (24h)');
  assert(CA.PARTS_BY_CALIBER['cal-g'][5].cumMinutes === 2160, 'Stage 3 G · GEOMETRY completes at 2160m (36h)');

  // Legacy storage migration ('no1-pro' -> 'cal-e', 'no2-jump' -> 'cal-b')
  const migState = CA.sanitizeAtelierState({
    activeWatch: 'no2-jump',
    activeFinish: 'steel',
    assembledParts: { 'no2-jump': ['mainplate', 'barrel', 'geartrain', 'escapement', 'jumpcam', 'turretcase'] }
  });
  assert(migState.activeWatch === 'cal-b' && migState.assembledParts['cal-b'].length === 6, 'Legacy completed no2-jump migrates seamlessly to cal-b');
  const migStarter = CA.sanitizeAtelierState({ activeWatch: 'no1-pro', assembledParts: { 'no2-jump': ['mainplate'] } });
  assert(migStarter.activeWatch === 'cal-e' && migStarter.assembledParts['cal-b'].length === 1, 'Legacy no1-pro & partial parts migrate cleanly to cal-e / cal-b');

  let aState = CA.createDefaultAtelierState();
  const s0 = CA.computeAtelierSnapshot([], aState);
  assert(s0.activeWatch === 'cal-e' && s0.activeProject.id === 'cal-b', '0m starts with E · ELLIPSE equipped and B · BINARY as Stage 1 build project');
  assert(s0.assembledCount === 0 && !s0.isBinaryComplete && !s0.hasActionablePart, '0m logs -> 0 assembled, not actionable');
  assert(s0.machiningPart && s0.machiningPart.id === 'mainplate' && s0.machiningPart.remainingMinutes === 90, 'Part 01 requires 90m');
  assert(s0.finishes.filter(function (f) { return f.unlocked; }).length === 1, 'Only steel finish unlocked at 0m');

  // 90m in 2 sessions (one 50m deepwork -> unlocks blued finish + Part 01 ready!)
  const logs90 = [
    { id: 'a', minutes: 50, dateKey: '2026-11-23' },
    { id: 'b', minutes: 40, dateKey: '2026-11-24' }
  ];
  const s90 = CA.computeAtelierSnapshot(logs90, aState);
  assert(s90.readyPart && s90.readyPart.id === 'mainplate', '90m makes B Part 01 ready to assemble');
  assert(s90.finishes.find(function (f) { return f.id === 'blued'; }).unlocked === true, '50m deepwork unlocks blued steel finish');
  assert(s90.finishes.find(function (f) { return f.id === 'gold'; }).unlocked === false, '2-day streak does not yet unlock gold finish');

  const r1 = CA.assembleNextPart(logs90, aState);
  assert(r1.ok && r1.assembledPart.id === 'mainplate' && !r1.completedCaliber, 'Assembles B Part 01 cleanly');
  aState = r1.state;
  const r1Again = CA.assembleNextPart(logs90, aState);
  assert(!r1Again.ok, 'Cannot assemble B Part 02 before 180m');

  // 720m across 3 consecutive days -> unlocks gold, lume, completes Stage 1 B · BINARY & advances activeProject to Stage 2 C · CYCLOID!
  const logs720 = [
    { id: 'd1', minutes: 240, dateKey: '2026-11-23' },
    { id: 'd2', minutes: 240, dateKey: '2026-11-24' },
    { id: 'd3', minutes: 240, dateKey: '2026-11-25' }
  ];
  const s720pre = CA.computeAtelierSnapshot(logs720, aState);
  assert(s720pre.finishes.find(function (f) { return f.id === 'gold'; }).unlocked === true, '3-day streak unlocks gold finish');
  assert(s720pre.finishes.find(function (f) { return f.id === 'lume'; }).unlocked === true, '>=300m unlocks lume finish');

  let completedB = false;
  let completedBId = null;
  for (let step = 2; step <= 6; step++) {
    const res = CA.assembleNextPart(logs720, aState);
    assert(res.ok, 'Assembles B part #' + step + ' sequentially');
    aState = res.state;
    if (step === 6) {
      completedB = res.completedCaliber;
      completedBId = res.completedCaliberId;
    }
  }
  assert(completedB === true && completedBId === 'cal-b', 'Assembling Part 06 completes B · BINARY caliber');
  const sAfterB = CA.computeAtelierSnapshot(logs720, aState);
  assert(sAfterB.isBinaryComplete && sAfterB.activeProject.id === 'cal-c', 'Completing B · BINARY advances active build project to C · CYCLOID');
  assert(sAfterB.calibers.find(function (c) { return c.id === 'cal-b'; }).unlocked === true, 'B · BINARY unlocked in A–J collection shelf');
  assert(sAfterB.calibers.find(function (c) { return c.id === 'cal-c'; }).unlocked === false, 'C · CYCLOID still locked at 720m');

  // 2160m -> completes Stage 2 C · CYCLOID (6 parts) and Stage 3 G · GEOMETRY (6 parts)!
  const logs2160 = [{ id: 'm1', minutes: 2160, dateKey: '2026-11-25' }];
  for (let step = 1; step <= 6; step++) {
    const resC = CA.assembleNextPart(logs2160, aState);
    assert(resC.ok, 'Assembles C · CYCLOID part #' + step);
    aState = resC.state;
    if (step === 6) assert(resC.completedCaliber && resC.completedCaliberId === 'cal-c', 'Part 06 completes C · CYCLOID');
  }
  const sAfterC = CA.computeAtelierSnapshot(logs2160, aState);
  assert(sAfterC.activeProject.id === 'cal-g', 'Completing C · CYCLOID advances active build project to G · GEOMETRY');

  for (let step = 1; step <= 6; step++) {
    const resG = CA.assembleNextPart(logs2160, aState);
    assert(resG.ok, 'Assembles G · GEOMETRY part #' + step);
    aState = resG.state;
    if (step === 6) assert(resG.completedCaliber && resG.completedCaliberId === 'cal-g', 'Part 06 completes G · GEOMETRY');
  }
  const sAllDone = CA.computeAtelierSnapshot(logs2160, aState);
  assert(sAllDone.allProjectsComplete === true && !sAllDone.hasActionablePart, 'All 3 buildable calibers (B, C, G) completed cleanly');
  assert(sAllDone.calibers.filter(function (c) { return c.unlocked; }).length === 4, 'All 4 playable calibers (E, B, C, G) unlocked');

  // Developer Mode ON unlocks all 4 playable calibers (E, B, C, G) + all 4 finishes at 0m, OFF reverts cleanly!
  const devOnState = CA.sanitizeAtelierState({ activeWatch: 'cal-g', activeFinish: 'lume', devMode: true });
  const sDevOn = CA.computeAtelierSnapshot([], devOnState);
  assert(sDevOn.devMode === true && sDevOn.activeWatch === 'cal-g' && sDevOn.activeFinish === 'lume', 'Dev mode allows G · GEOMETRY & lume at 0m');
  assert(sDevOn.finishes.every(function (f) { return f.unlocked; }), 'Dev mode unlocks all 4 finishes');
  assert(sDevOn.calibers.filter(function (c) { return c.unlocked; }).length === 4, 'Dev mode unlocks all 4 playable calibers (E, B, C, G)');

  const devOffState = CA.sanitizeAtelierState({ activeWatch: 'cal-g', activeFinish: 'lume', devMode: false });
  const sDevOff = CA.computeAtelierSnapshot([], devOffState);
  assert(sDevOff.devMode === false && sDevOff.activeWatch === 'cal-e' && sDevOff.activeFinish === 'steel', 'Turning Dev mode OFF cleanly reverts to E · ELLIPSE & steel');

  print('TEST SUMMARY: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    throw new Error('Unit tests failed: ' + failed);
  }
})();
