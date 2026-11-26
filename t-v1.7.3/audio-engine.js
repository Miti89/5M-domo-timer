/**
 * NO.1 PRO — Zero-Asset Web Audio Synthesizer (audio-engine.js)
 * Synthesizes Patek 5270P Classic Gong, Crown Ratchet Click,
 * 4Hz Miyota 90S5 Mechanical Escapement ASMR, Rain, and Study Ambience.
 */
(function (global) {
  'use strict';

  let ctx = null;
  let noiseBuffer = null;
  let tickTimer = null;
  let rainNode = null;
  let rainGain = null;
  let cafeNode = null;
  let cafeGain = null;

  const settings = {
    mannerMode: false,      // 독서실 무음 (시각 알림만)
    alarmType: 'gong',      // 'gong' | 'chime' | 'silent'
    tickVol: 0,             // 0..1 (4Hz mechanical escapement ASMR)
    rainVol: 0,             // 0..1
    cafeVol: 0,             // 0..1
    ambienceActive: true    // v1.7.3: white noise plays only while a timer is running (app gates this)
  };

  function ensureContext() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (ctx && !noiseBuffer) {
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }
      noiseBuffer = buf;
    }
    return ctx;
  }

  /**
   * Single Patek Philippe 5270P style classic gong strike
   */
  function strikeClassicGong(type, delaySec) {
    if (settings.mannerMode) return;
    const ac = ensureContext();
    if (!ac) return;
    const t0 = ac.currentTime + (delaySec || 0);
    const baseFreq = type === 'high' ? 783.99 : 523.25; // G5 / C5
    const partials = [
      [1.000, 0.34, 2.00],
      [2.756, 0.16, 1.15],
      [5.404, 0.07, 0.58],
      [8.933, 0.025, 0.28]
    ];

    const master = ac.createGain();
    master.gain.setValueAtTime(0.75, t0);
    master.connect(ac.destination);

    partials.forEach(([ratio, amp, decay]) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(amp, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + decay + 0.05);
    });
  }

  function playMinuteRepeaterDemo(dateObj) {
    if (settings.mannerMode) return false;
    const d = dateObj || new Date();
    const h = (d.getHours() % 12) || 12;
    const q = Math.floor(d.getMinutes() / 15);
    const remM = d.getMinutes() % 15;
    // Concise aesthetic cadence (max 4 low + quarters + up to 3 high for pleasant desk use)
    const lowCount = Math.min(h, 4);
    let offset = 0;
    for (let i = 0; i < lowCount; i++) {
      strikeClassicGong('low', offset);
      offset += 0.42;
    }
    offset += 0.25;
    for (let i = 0; i < Math.min(q, 3); i++) {
      strikeClassicGong('low', offset);
      strikeClassicGong('high', offset + 0.18);
      offset += 0.5;
    }
    if (remM > 0) {
      offset += 0.15;
      for (let i = 0; i < Math.min(remM, 3); i++) {
        strikeClassicGong('high', offset);
        offset += 0.34;
      }
    }
    return true;
  }

  function playSessionCompleteAlarm() {
    if (settings.mannerMode || settings.alarmType === 'silent') return false;
    if (settings.alarmType === 'chime') {
      strikeClassicGong('high', 0);
      strikeClassicGong('high', 0.45);
      return true;
    }
    // Classic 5270P double cadence: low → high → low → high
    strikeClassicGong('low', 0);
    strikeClassicGong('high', 0.24);
    strikeClassicGong('low', 0.95);
    strikeClassicGong('high', 1.19);
    return true;
  }

  function playCrownRatchet() {
    if (settings.mannerMode) return;
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.022);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  function playCrownPull(isPulled) {
    if (settings.mannerMode) return;
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    if (isPulled) {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.026);
    } else {
      osc.frequency.setValueAtTime(1650, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.032);
    }
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  // 4Hz Miyota 90S5 Mechanical Escapement Micro-Tick (8 beats / sec)
  let tickBeatParity = 0;
  function emitEscapementBeat() {
    if (settings.mannerMode || settings.tickVol <= 0.005) return;
    const ac = ensureContext();
    if (!ac || ac.state !== 'running') return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const bp = ac.createBiquadFilter();
    const g = ac.createGain();
    tickBeatParity = 1 - tickBeatParity;
    osc.type = 'square';
    osc.frequency.setValueAtTime(tickBeatParity ? 3400 : 2950, now);
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(tickBeatParity ? 4200 : 3700, now);
    bp.Q.setValueAtTime(3.2, now);
    const amp = settings.tickVol * 0.045;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(amp, now + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.011);
    osc.connect(bp);
    bp.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.014);
  }

  function syncEscapementLoop() {
    const shouldRun = !settings.mannerMode && settings.ambienceActive !== false && settings.tickVol > 0.005;
    if (shouldRun && !tickTimer) {
      ensureContext();
      tickTimer = setInterval(emitEscapementBeat, 125); // 8 Hz (4 Hz double-beat)
    } else if (!shouldRun && tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function syncAmbientChannel(kind, vol) {
    const effective = (settings.mannerMode || settings.ambienceActive === false) ? 0 : vol;
    if (effective <= 0.005) {
      if (kind === 'rain' && rainNode) {
        try { rainNode.stop(); } catch (e) {}
        rainNode = null;
        rainGain = null;
      }
      if (kind === 'cafe' && cafeNode) {
        try { cafeNode.stop(); } catch (e) {}
        cafeNode = null;
        cafeGain = null;
      }
      return;
    }
    const ac = ensureContext();
    if (!ac || !noiseBuffer) return;

    if (kind === 'rain') {
      if (!rainNode) {
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1150;
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 160;
        const g = ac.createGain();
        g.gain.value = effective * 0.35;
        src.connect(lp);
        lp.connect(hp);
        hp.connect(g);
        g.connect(ac.destination);
        src.start();
        rainNode = src;
        rainGain = g;
      } else if (rainGain) {
        rainGain.gain.setTargetAtTime(effective * 0.35, ac.currentTime, 0.08);
      }
    } else if (kind === 'cafe') {
      if (!cafeNode) {
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 460;
        bp.Q.value = 0.65;
        const g = ac.createGain();
        g.gain.value = effective * 0.28;
        src.connect(bp);
        bp.connect(g);
        g.connect(ac.destination);
        src.start();
        cafeNode = src;
        cafeGain = g;
      } else if (cafeGain) {
        cafeGain.gain.setTargetAtTime(effective * 0.28, ac.currentTime, 0.08);
      }
    }
  }

  function updateSettings(partial) {
    Object.assign(settings, partial || {});
    syncEscapementLoop();
    syncAmbientChannel('rain', settings.rainVol);
    syncAmbientChannel('cafe', settings.cafeVol);
  }

  function stopAllAmbience() {
    settings.tickVol = 0;
    settings.rainVol = 0;
    settings.cafeVol = 0;
    syncEscapementLoop();
    syncAmbientChannel('rain', 0);
    syncAmbientChannel('cafe', 0);
  }

  global.ChronoAudio = {
    settings,
    ensureContext,
    strikeClassicGong,
    playMinuteRepeaterDemo,
    playSessionCompleteAlarm,
    playCrownRatchet,
    playCrownPull,
    updateSettings,
    stopAllAmbience
  };
})(typeof window !== 'undefined' ? window : globalThis);
