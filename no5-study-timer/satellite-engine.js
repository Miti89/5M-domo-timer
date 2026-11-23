/**
 * NO.5 CHRONO — Ōtsuka Lōtec No. 5 Kai Pure SVG Engine (satellite-engine.js)
 * Renders the 8-layer mechanical satellite hour watch, 120° study target/elapsed arcs,
 * interactive 4 o'clock knurled crown, and manner-mode visual alarm ring.
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const ORBIT_R = 56;
  const ARC_R = 88.2;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  function svgEl(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, String(attrs[k]));
      });
    }
    return node;
  }

  function describeMinuteArc(radius, startMin, endMin) {
    const clampedStart = Math.max(0, Math.min(60, startMin));
    const clampedEnd = Math.max(0, Math.min(60, endMin));
    if (clampedEnd - clampedStart < 0.08) return '';
    const deg1 = -60 + clampedStart * 2;
    const deg2 = -60 + clampedEnd * 2;
    const r1 = (deg1 * Math.PI) / 180;
    const r2 = (deg2 * Math.PI) / 180;
    const x1 = (150 + radius * Math.cos(r1)).toFixed(2);
    const y1 = (150 + radius * Math.sin(r1)).toFixed(2);
    const x2 = (150 + radius * Math.cos(r2)).toFixed(2);
    const y2 = (150 + radius * Math.sin(r2)).toFixed(2);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  }

  function buildSvgMarkup() {
    return [
      '<svg class="no5-svg" viewBox="-12 -12 324 324" role="img" aria-label="NO.5 CHRONO 새틀라이트 아워 기계식 공부 타이머">',
      '  <defs>',
      '    <linearGradient id="no5SteelCase" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" class="grad-case-0" stop-color="#ECEFF2" />',
      '      <stop offset="35%" class="grad-case-1" stop-color="#BCC2C9" />',
      '      <stop offset="68%" class="grad-case-2" stop-color="#DCE0E5" />',
      '      <stop offset="100%" class="grad-case-3" stop-color="#878E97" />',
      '    </linearGradient>',
      '    <linearGradient id="no5SteelBridge" x1="0%" y1="0%" x2="0%" y2="100%">',
      '      <stop offset="0%" class="grad-bridge-0" stop-color="#F1F3F6" />',
      '      <stop offset="50%" class="grad-bridge-1" stop-color="#C9CFD6" />',
      '      <stop offset="100%" class="grad-bridge-2" stop-color="#9BA2AC" />',
      '    </linearGradient>',
      '    <radialGradient id="no5DialBase" cx="42%" cy="38%" r="65%">',
      '      <stop offset="0%" class="grad-dial-0" stop-color="#454950" />',
      '      <stop offset="70%" class="grad-dial-1" stop-color="#282B30" />',
      '      <stop offset="100%" class="grad-dial-2" stop-color="#191B1E" />',
      '    </radialGradient>',
      '    <radialGradient id="no5SatDisc" cx="35%" cy="30%" r="70%">',
      '      <stop offset="0%" class="grad-disc-0" stop-color="#F7F8FA" />',
      '      <stop offset="65%" class="grad-disc-1" stop-color="#D7DCE2" />',
      '      <stop offset="100%" class="grad-disc-2" stop-color="#AEB5BE" />',
      '    </radialGradient>',
      '    <linearGradient id="no5BrassGear" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" stop-color="#F2D07D" />',
      '      <stop offset="55%" stop-color="#C8963E" />',
      '      <stop offset="100%" stop-color="#855E1E" />',
      '    </linearGradient>',
      '    <linearGradient id="no5GlassShine" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" stop-color="rgba(255,255,255,0.26)" />',
      '      <stop offset="32%" stop-color="rgba(255,255,255,0.04)" />',
      '      <stop offset="62%" stop-color="rgba(255,255,255,0)" />',
      '      <stop offset="100%" stop-color="rgba(0,0,0,0.14)" />',
      '    </linearGradient>',
      '    <filter id="no5MechShadow" x="-20%" y="-20%" width="140%" height="140%">',
      '      <feDropShadow dx="1.4" dy="2.2" stdDeviation="2.4" flood-color="#000" flood-opacity="0.46" />',
      '    </filter>',
      '    <filter id="no5LumeGlow" x="-30%" y="-30%" width="160%" height="160%">',
      '      <feGaussianBlur stdDeviation="2.2" result="blur" />',
      '      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>',
      '    </filter>',
      '    <clipPath id="no5DialClip">',
      '      <circle cx="150" cy="150" r="124" />',
      '    </clipPath>',
      '    <path id="no5HomageArc" d="M 58.58 216.42 A 113 113 0 0 0 126.51 260.53" fill="none" />',
      '  </defs>',
      '',
      '  <!-- 독서실 매너 모드 / 완료 시각 발광 링 -->',
      '  <circle id="no5VisualAlarmRing" class="visual-alarm-ring" cx="150" cy="150" r="144" fill="none" stroke-width="4" />',
      '',
      '  <!-- 4시 방향 인터랙티브 톱니 용두 (스크롤/드래그로 타이머 분 조절) -->',
      '  <g id="no5CrownControl" class="crown-control" transform="rotate(30 150 150)" tabindex="0" role="slider" aria-label="4시 용두 — 스크롤 또는 드래그로 타이머 시간 조절">',
      '    <rect class="crown-hit" x="276" y="128" width="28" height="44" rx="8" fill="transparent" />',
      '    <rect x="279" y="142" width="6" height="16" rx="1.5" fill="#707780" />',
      '    <rect class="crown-body" x="283" y="135" width="14" height="30" rx="3.2" fill="url(#no5SteelCase)" stroke="#555B63" stroke-width="1.2" />',
      '    <g id="no5CrownKnurls">',
      '      <line x1="286" y1="138" x2="294" y2="138" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="142" x2="294" y2="142" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="146" x2="294" y2="146" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="150" x2="294" y2="150" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="154" x2="294" y2="154" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="158" x2="294" y2="158" stroke="#5A6068" stroke-width="1.1" />',
      '      <line x1="286" y1="162" x2="294" y2="162" stroke="#5A6068" stroke-width="1.1" />',
      '    </g>',
      '  </g>',
      '',
      '  <!-- 316L 외곽 케이스 베젤 -->',
      '  <g id="no5DialClickable" class="dial-clickable">',
      '    <circle cx="150" cy="150" r="138" fill="url(#no5SteelCase)" stroke="#626870" stroke-width="1.5" class="case-bezel" />',
      '    <circle cx="150" cy="150" r="131" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.9" />',
      '    <circle cx="150" cy="150" r="127" fill="#5A6068" class="case-rehaut" />',
      '    <circle cx="150" cy="150" r="124" fill="url(#no5DialBase)" class="dial-base" />',
      '',
      '    <!-- 다이얼 내부 클립 그룹 -->',
      '    <g clip-path="url(#no5DialClip)">',
      '      <!-- 메인플레이트 미세 동심원 텍스처 -->',
      '      <circle cx="150" cy="150" r="106" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.8" />',
      '      <circle cx="150" cy="150" r="78" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.8" />',
      '',
      '      <!-- 1~2시 오픈워크 황동 밸런스 휠 (4Hz 진동) -->',
      '      <g id="no5BalanceWheel" transform="translate(178, 92)">',
      '        <circle r="24" fill="none" stroke="url(#no5BrassGear)" stroke-width="4.4" />',
      '        <circle r="15" fill="none" stroke="rgba(242,208,125,0.35)" stroke-width="0.8" stroke-dasharray="2 2" />',
      '        <line x1="-22" y1="0" x2="22" y2="0" stroke="url(#no5BrassGear)" stroke-width="2.1" />',
      '        <line x1="0" y1="-22" x2="0" y2="22" stroke="url(#no5BrassGear)" stroke-width="2.1" />',
      '        <circle r="5" fill="#D94336" stroke="#F4D387" stroke-width="1.2" />',
      '      </g>',
      '',
      '      <!-- 9시 방향 서브 기어 트레인 -->',
      '      <g id="no5SubGear" transform="translate(92, 148)" opacity="0.72">',
      '        <circle r="26" fill="#4C515A" stroke="#9EA5AE" stroke-width="2" stroke-dasharray="4 3" />',
      '        <circle r="13" fill="#2A2D32" stroke="#8A919A" stroke-width="1.2" />',
      '        <line x1="-11" y1="0" x2="11" y2="0" stroke="#7A818A" stroke-width="1.2" />',
      '        <line x1="0" y1="-11" x2="0" y2="11" stroke="#7A818A" stroke-width="1.2" />',
      '      </g>',
      '',
      '      <!-- 5시 30분 독립 스몰 세컨드 디스크 (1.5mm 볼베어링) -->',
      '      <g transform="translate(178, 224)">',
      '        <circle r="44" fill="#1F2226" stroke="#7A818A" stroke-width="1.2" />',
      '        <g id="no5SecondsDisc">',
      '          <circle r="41" fill="url(#no5SatDisc)" stroke="#8B929B" stroke-width="1" class="sat-disc-face" />',
      '          <g id="no5SecTicks"></g>',
      '        </g>',
      '        <circle r="13" fill="url(#no5SteelBridge)" stroke="#555B63" stroke-width="1" />',
      '        <circle r="7" fill="#2B2E34" stroke="#B7BEC6" stroke-width="1.4" stroke-dasharray="2.2 1.8" />',
      '        <circle r="3" fill="#DCE0E5" />',
      '        <polygon points="0,-39 -4.5,-30 4.5,-30" class="sec-pointer" fill="#D93829" />',
      '      </g>',
      '',
      '      <!-- 8시 방향 커스텀 롤러 볼베어링 (90° 자전 인덱싱 핀) -->',
      '      <g id="no5RollerBearing" transform="translate(76, 193)" filter="url(#no5MechShadow)">',
      '        <circle r="13" fill="url(#no5SteelCase)" stroke="#4D535B" stroke-width="1.4" />',
      '        <g id="no5RollerBalls">',
      '          <circle r="8.5" fill="#2A2D32" stroke="#CBD1D8" stroke-width="2" stroke-dasharray="2.6 2.1" />',
      '        </g>',
      '        <circle r="4" fill="#ECEFF2" stroke="#5A6068" stroke-width="0.8" />',
      '      </g>',
      '',
      '      <!-- 3개 위성 시침 디스크 + 중앙 3-Arm 캐러셀 -->',
      '      <g id="no5SatelliteAssembly" filter="url(#no5MechShadow)">',
      '        <g id="no5SatDisc0"></g>',
      '        <g id="no5SatDisc1"></g>',
      '        <g id="no5SatDisc2"></g>',
      '',
      '        <g id="no5CarouselBridge">',
      '          <g transform="rotate(0 150 150)">',
      '            <path d="M139,150 L141,92 C141,85 159,85 159,92 L161,150 Z" fill="url(#no5SteelBridge)" stroke="#5B616A" stroke-width="1.2" class="bridge-arm" />',
      '            <rect x="147" y="102" width="6" height="32" rx="3" fill="#7D848D" opacity="0.65" />',
      '            <circle cx="150" cy="94" r="5" fill="#DCE0E5" stroke="#555B63" stroke-width="1" />',
      '            <line x1="146.5" y1="94" x2="153.5" y2="94" stroke="#555B63" stroke-width="1" />',
      '          </g>',
      '          <g transform="rotate(120 150 150)">',
      '            <path d="M139,150 L141,92 C141,85 159,85 159,92 L161,150 Z" fill="url(#no5SteelBridge)" stroke="#5B616A" stroke-width="1.2" class="bridge-arm" />',
      '            <rect x="147" y="102" width="6" height="32" rx="3" fill="#7D848D" opacity="0.65" />',
      '            <circle cx="150" cy="94" r="5" fill="#DCE0E5" stroke="#555B63" stroke-width="1" />',
      '            <line x1="146.5" y1="94" x2="153.5" y2="94" stroke="#555B63" stroke-width="1" />',
      '          </g>',
      '          <g transform="rotate(240 150 150)">',
      '            <path d="M139,150 L141,92 C141,85 159,85 159,92 L161,150 Z" fill="url(#no5SteelBridge)" stroke="#5B616A" stroke-width="1.2" class="bridge-arm" />',
      '            <rect x="147" y="102" width="6" height="32" rx="3" fill="#7D848D" opacity="0.65" />',
      '            <circle cx="150" cy="94" r="5" fill="#DCE0E5" stroke="#555B63" stroke-width="1" />',
      '            <line x1="146.5" y1="94" x2="153.5" y2="94" stroke="#555B63" stroke-width="1" />',
      '          </g>',
      '          <circle cx="150" cy="150" r="15" fill="url(#no5SteelBridge)" stroke="#555B63" stroke-width="1.2" />',
      '          <circle cx="150" cy="150" r="7.5" fill="url(#no5BrassGear)" stroke="#6B4C16" stroke-width="1" />',
      '          <circle cx="150" cy="150" r="3" fill="#2A2D32" />',
      '        </g>',
      '      </g>',
      '',
      '      <!-- 우측 고정 120° 분 스케일 플레이트 (-60° = 00분 ~ +60° = 60분) -->',
      '      <g id="no5MinutePlate">',
      '        <path class="minute-plate-face" d="M 193,75.5 A 86,86 0 0,1 193,224.5 L 212,257.4 A 124,124 0 0,0 212,42.6 Z" fill="url(#no5SatDisc)" stroke="#5C626B" stroke-width="1.4" />',
      '        <!-- 공부 타이머 목표 아크 & 경과 아크 -->',
      '        <path id="no5TargetArc" class="study-target-arc" d="" fill="none" stroke-width="4.4" stroke-linecap="round" />',
      '        <path id="no5ElapsedArc" class="study-elapsed-arc" d="" fill="none" stroke-width="4.4" stroke-linecap="round" />',
      '        <circle id="no5TargetDot" class="study-target-dot" cx="0" cy="0" r="2.8" opacity="0" />',
      '        <g id="no5MinuteTicks"></g>',
      '      </g>',
      '',
      '      <!-- 좌상 / 좌하 아치 명판 (오츠카 로텍 No. 5 Kai 오마주) -->',
      '      <path class="plaque-arch" d="M 57,102 A 104,104 0 0,1 170,48 L 173,32 A 122,122 0 0,0 44,92 Z" fill="url(#no5SatDisc)" stroke="#697079" stroke-width="1" opacity="0.95" />',
      '      <text class="plaque-title" x="115" y="62" text-anchor="middle" font-size="8.2" font-weight="900" fill="#2A2D32" transform="rotate(-24 115 62)" letter-spacing="1.1">NO.5 CHRONO</text>',
      '      <text class="plaque-sub" font-size="6.0" font-weight="800" fill="#CBD1D8" letter-spacing="0.8"><textPath href="#no5HomageArc" startOffset="50%" text-anchor="middle">HOMAGE · NO.5 KAI</textPath></text>',
      '',
      '      <!-- 박스 사파이어 글래스 반사 -->',
      '      <circle cx="150" cy="150" r="124" fill="url(#no5GlassShine)" pointer-events="none" />',
      '    </g>',
      '    <circle cx="150" cy="150" r="124" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" pointer-events="none" />',
      '  </g>',
      '</svg>'
    ].join('\n');
  }

  function mount(containerEl, handlers) {
    if (!containerEl) return null;
    const cb = handlers || {};
    containerEl.innerHTML = buildSvgMarkup();

    const svgRoot = containerEl.querySelector('svg');
    const minTicksG = svgRoot.querySelector('#no5MinuteTicks');
    const secTicksG = svgRoot.querySelector('#no5SecTicks');
    const bridgeEl = svgRoot.querySelector('#no5CarouselBridge');
    const secDiscEl = svgRoot.querySelector('#no5SecondsDisc');
    const balEl = svgRoot.querySelector('#no5BalanceWheel');
    const subGearEl = svgRoot.querySelector('#no5SubGear');
    const rollerBallsEl = svgRoot.querySelector('#no5RollerBalls');
    const targetArcEl = svgRoot.querySelector('#no5TargetArc');
    const elapsedArcEl = svgRoot.querySelector('#no5ElapsedArc');
    const targetDotEl = svgRoot.querySelector('#no5TargetDot');
    const visualRingEl = svgRoot.querySelector('#no5VisualAlarmRing');
    const crownEl = svgRoot.querySelector('#no5CrownControl');
    const crownKnurlsEl = svgRoot.querySelector('#no5CrownKnurls');
    const dialClickableEl = svgRoot.querySelector('#no5DialClickable');

    // 1. Build 120° minute scale ticks (-60° = 00m .. +60° = 60m, 2°/min)
    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const isQuarter = m % 15 === 0;
      const rIn = isMajor ? 92 : 95;
      const rOut = isMajor ? 101.5 : 99.5;
      minTicksG.appendChild(svgEl('line', {
        x1: (150 + rIn * Math.cos(rad)).toFixed(2),
        y1: (150 + rIn * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut * Math.cos(rad)).toFixed(2),
        y2: (150 + rOut * Math.sin(rad)).toFixed(2),
        class: isQuarter ? 'min-tick-quarter' : (isMajor ? 'min-tick-major' : 'min-tick-minor'),
        stroke: isQuarter ? '#C0362C' : '#1E2024',
        'stroke-width': isMajor ? 1.8 : 0.9,
        'stroke-linecap': 'round'
      }));
      if (isMajor) {
        const rTxt = 113;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const t = svgEl('text', {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': isQuarter ? '10.2' : '8.8',
          'font-weight': '900',
          class: isQuarter ? 'min-label-quarter' : 'min-label',
          fill: isQuarter ? '#B52F25' : '#23262B',
          transform: `rotate(${deg} ${tx.toFixed(1)} ${ty.toFixed(1)})`
        });
        t.textContent = String(m).padStart(2, '0');
        minTicksG.appendChild(t);
      }
    }

    // 2. Build 5:30 small-seconds disc ticks (00..55)
    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 34 : 36;
      const r2 = 40;
      secTicksG.appendChild(svgEl('line', {
        x1: (r1 * Math.cos(rad)).toFixed(2),
        y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2),
        y2: (r2 * Math.sin(rad)).toFixed(2),
        class: s === 0 ? 'sec-tick-zero' : 'sec-tick',
        stroke: s === 0 ? '#C0362C' : '#23262B',
        'stroke-width': major ? 1.5 : 0.7
      }));
      if (s % 10 === 0) {
        const rt = 26;
        const x = rt * Math.cos(rad);
        const y = rt * Math.sin(rad);
        const txt = svgEl('text', {
          x: x.toFixed(1),
          y: y.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '7.4',
          'font-weight': '900',
          class: s === 0 ? 'sec-label-zero' : 'sec-label',
          fill: s === 0 ? '#C0362C' : '#1E2024',
          transform: `rotate(${s * 6} ${x.toFixed(1)} ${y.toFixed(1)})`
        });
        txt.textContent = String(s).padStart(2, '0');
        secTicksG.appendChild(txt);
      }
    }

    // 3. Build 3 satellite hour discs
    const satGroups = [0, 1, 2].map(function (k) {
      const outer = svgRoot.querySelector(`#no5SatDisc${k}`);
      const plate = svgEl('g');
      plate.appendChild(svgEl('circle', {
        cx: 0, cy: 0, r: 30,
        fill: 'url(#no5SatDisc)',
        stroke: '#5D636C',
        'stroke-width': 1.4,
        class: 'sat-disc-face'
      }));
      plate.appendChild(svgEl('circle', {
        cx: 0, cy: 0, r: 22,
        fill: 'none',
        stroke: 'rgba(40,45,52,0.16)',
        'stroke-width': 0.8
      }));
      DISC_NUMS[k].forEach(function (num, j) {
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 18.5;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);
        plate.appendChild(svgEl('polygon', {
          points: '26,-2.5 31.5,0 26,2.5',
          class: 'sat-pointer',
          fill: '#C0362C',
          transform: `rotate(${deg})`
        }));
        const t = svgEl('text', {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '13',
          'font-weight': '900',
          class: 'sat-numeral',
          fill: '#181A1E',
          transform: `rotate(${deg} ${tx.toFixed(1)} ${ty.toFixed(1)})`
        });
        t.textContent = String(num);
        plate.appendChild(t);
      });
      outer.appendChild(plate);
      return { outer: outer, inner: plate };
    });

    // 4. Interactive 4 o'clock crown (wheel + pointer drag + keyboard arrows)
    let crownVisualShift = 0;
    let dragging = false;
    let dragStartY = 0;
    let dragAccum = 0;

    function animateCrown(delta) {
      crownVisualShift = ((crownVisualShift + delta) % 4 + 4) % 4;
      crownKnurlsEl.setAttribute('transform', `translate(0, ${(crownVisualShift - 1.5).toFixed(1)})`);
      crownEl.classList.add('is-turning');
      setTimeout(function () {
        crownEl.classList.remove('is-turning');
      }, 140);
    }

    function emitCrownStep(delta) {
      animateCrown(delta > 0 ? 1 : -1);
      if (typeof cb.onCrownStep === 'function') {
        cb.onCrownStep(delta);
      }
    }

    crownEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 5 : 1;
      const dir = e.deltaY < 0 ? 1 : -1;
      emitCrownStep(dir * step);
    }, { passive: false });

    crownEl.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      dragging = true;
      dragStartY = e.clientY;
      dragAccum = 0;
      crownEl.classList.add('is-dragging');
      if (crownEl.setPointerCapture) {
        try { crownEl.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });

    crownEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      const dy = dragStartY - e.clientY;
      dragStartY = e.clientY;
      dragAccum += dy;
      const threshold = 10;
      while (Math.abs(dragAccum) >= threshold) {
        const dir = dragAccum > 0 ? 1 : -1;
        dragAccum -= dir * threshold;
        emitCrownStep(dir * (e.shiftKey ? 5 : 1));
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      crownEl.classList.remove('is-dragging');
      if (e && crownEl.releasePointerCapture) {
        try { crownEl.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }
    crownEl.addEventListener('pointerup', endDrag);
    crownEl.addEventListener('pointercancel', endDrag);

    crownEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        emitCrownStep(e.shiftKey ? 5 : 1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        emitCrownStep(e.shiftKey ? -5 : -1);
      }
    });

    dialClickableEl.addEventListener('click', function () {
      if (typeof cb.onDialClick === 'function') {
        cb.onDialClick();
      }
    });

    let rollerSpinDeg = 0;
    let alarmTimerId = null;

    function triggerVisualAlarm() {
      visualRingEl.classList.remove('is-pulsing');
      // Force reflow so repeated triggers replay cleanly
      void visualRingEl.getBoundingClientRect();
      visualRingEl.classList.add('is-pulsing');
      if (alarmTimerId) clearTimeout(alarmTimerId);
      alarmTimerId = setTimeout(function () {
        visualRingEl.classList.remove('is-pulsing');
      }, 4200);
    }

    function render(snapshot, nowPerf) {
      if (!snapshot || !snapshot.angles) return;
      const angles = snapshot.angles;

      // 1. 3-Arm CNC Carousel
      bridgeEl.setAttribute('transform', `rotate(${angles.carouselDeg.toFixed(3)} 150 150)`);

      // 2. 3 Satellite Discs + 8 o'clock indexing roller rotation
      let anyIndexing = false;
      for (let k = 0; k < 3; k++) {
        const d = angles.discs[k];
        const rad = (d.orbitDeg * Math.PI) / 180;
        const x = 150 + ORBIT_R * Math.cos(rad);
        const y = 150 + ORBIT_R * Math.sin(rad);
        satGroups[k].outer.setAttribute('transform', `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${d.orbitDeg.toFixed(3)})`);
        satGroups[k].inner.setAttribute('transform', `rotate(${d.localSpinDeg.toFixed(3)})`);
        if (d.isIndexing) anyIndexing = true;
      }

      if (anyIndexing && snapshot.running) {
        rollerSpinDeg = (rollerSpinDeg + 3.5) % 360;
        rollerBallsEl.setAttribute('transform', `rotate(${rollerSpinDeg.toFixed(1)})`);
      }

      // 3. 5:30 Small-Seconds Disc
      secDiscEl.setAttribute('transform', `rotate(${angles.secondsDiscDeg.toFixed(2)})`);

      // 4. 1~2 o'clock 4Hz Brass Balance Wheel & 9 o'clock sub-gear
      const balAngle = snapshot.running ? Math.sin((nowPerf || 0) * 0.025) * 14 : 0;
      balEl.setAttribute('transform', `translate(178, 92) rotate(${balAngle.toFixed(1)})`);
      const gearAngle = (snapshot.tHours * 45) % 360;
      subGearEl.setAttribute('transform', `translate(92, 148) rotate(${gearAngle.toFixed(2)})`);

      // 5. Right 120° Study Target & Elapsed Arcs
      const targetMin = snapshot.targetArcMinutes || 0;
      const elapsedMin = snapshot.elapsedArcMinutes || 0;
      const isBreak = snapshot.phase === 'break';

      svgRoot.classList.toggle('is-break-phase', isBreak);
      svgRoot.classList.toggle('is-warning-phase', Boolean(snapshot.isWarning));
      svgRoot.classList.toggle('is-running', Boolean(snapshot.running));

      if (targetMin > 0) {
        const targetPath = describeMinuteArc(ARC_R, 0, targetMin);
        targetArcEl.setAttribute('d', targetPath);
        targetArcEl.setAttribute('opacity', '1');

        const dotDeg = -60 + Math.min(60, targetMin) * 2;
        const dotRad = (dotDeg * Math.PI) / 180;
        targetDotEl.setAttribute('cx', (150 + ARC_R * Math.cos(dotRad)).toFixed(2));
        targetDotEl.setAttribute('cy', (150 + ARC_R * Math.sin(dotRad)).toFixed(2));
        targetDotEl.setAttribute('opacity', '1');
      } else {
        targetArcEl.setAttribute('d', '');
        targetArcEl.setAttribute('opacity', '0');
        targetDotEl.setAttribute('opacity', '0');
      }

      if (elapsedMin > 0.08) {
        elapsedArcEl.setAttribute('d', describeMinuteArc(ARC_R, 0, elapsedMin));
        elapsedArcEl.setAttribute('opacity', '1');
      } else {
        elapsedArcEl.setAttribute('d', '');
        elapsedArcEl.setAttribute('opacity', '0');
      }
    }

    return {
      svgRoot: svgRoot,
      render: render,
      triggerVisualAlarm: triggerVisualAlarm
    };
  }

  global.SatelliteEngine = {
    mount: mount,
    describeMinuteArc: describeMinuteArc
  };
})(typeof window !== 'undefined' ? window : globalThis);
