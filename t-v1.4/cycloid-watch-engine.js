/**
 * CASPER™ V1 — NO.3 CYCLOID Caliber Pure SVG Engine (cycloid-watch-engine.js)
 * Forensic Tribute to Ōtsuka Lōtec No. 6 (6号):
 *   - Wide circular-brushed 316L steel bezel with 8 evenly spaced countersunk slotted bezel screws
 *   - Authentic 2:20 (-22°) flared diamond-knurled pinion crown (0단 잠금 · 1단 ±1분 · 2단 ±5분)
 *   - Vertical straight-brushed silver dial with coaxial double-retrograde Japanese instrument fan gauge:
 *       * Outer fan arc (0..60m, labeled 10·20·30·40·50) + integrated study minute progress arc
 *       * Inner fan arc (0..12h radially aligned numerals) + integrated study hour progress arc
 *   - Top center stud splitting curved perimeter engravings ("NO.3 CYCLOID" / "CASPER™ · V1")
 *   - Semi-circular open small-seconds window with rotating tick disc & golden brass movement glimpse
 *   - Round stepped steel lower-right aperture displaying live Pomodoro round / calendar day
 *   - Twin ultra-slim mirror-edged silver steel coaxial retrograde needles emerging from behind
 *     the iconic swooping gull-wing horizontal-brushed lower bridge
 *   - Box sapphire crystal optical reflection overlay
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const CX = 150;
  const CY = 150;

  // Exact Ōtsuka Lōtec No. 6 coaxial retrograde fan geometry (pivot concealed behind gull-wing bridge!)
  const PX = 150;
  const PY = 204;
  const FAN_START = -48;
  const FAN_SPAN = 96;

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        el.setAttribute(keys[i], String(attrs[keys[i]]));
      }
    }
    return el;
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startDeg, endDeg, ccw) {
    const s = polar(cx, cy, r, startDeg);
    const e = polar(cx, cy, r, endDeg);
    const span = Math.abs(endDeg - startDeg);
    const largeArc = span > 180 ? 1 : 0;
    const sweep = ccw ? 0 : (endDeg >= startDeg ? 1 : 0);
    return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) +
      ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArc + ' ' + sweep + ' ' +
      e.x.toFixed(2) + ' ' + e.y.toFixed(2);
  }

  function appendSlottedScrew(parent, cx, cy, r, slotAngleDeg, withCountersink) {
    const g = createSvgEl('g', { transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ')' });
    if (withCountersink) {
      g.appendChild(createSvgEl('circle', {
        cx: '0', cy: '0', r: (r + 1.0).toFixed(2),
        fill: '#474F5B', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.5'
      }));
    }
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: r.toFixed(2),
      fill: 'url(#n6ScrewHead)', stroke: '#4A525E',
      'stroke-width': Math.max(0.55, r * 0.14).toFixed(2)
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.82).toFixed(2),
      fill: 'none', stroke: 'rgba(255,255,255,0.74)', 'stroke-width': '0.45'
    }));
    const sl = r * 0.84;
    g.appendChild(createSvgEl('line', {
      x1: (-sl).toFixed(2), y1: '0', x2: sl.toFixed(2), y2: '0',
      stroke: '#252B33',
      'stroke-width': Math.max(0.68, r * 0.21).toFixed(2),
      'stroke-linecap': 'butt',
      transform: 'rotate(' + slotAngleDeg + ')',
      class: 'jump-screw-slot'
    }));
    parent.appendChild(g);
  }

  function buildDiamondCrown2H() {
    const CROWN_D = 'M 290.0,138.2 L 303.6,133.2 L 306.8,136.2 L 306.8,163.8 L 303.6,166.8 L 290.0,161.8 Z';

    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(-22 150 150)',
      filter: 'url(#n6MechShadow)'
    });
    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '278', y: '116', width: '46', height: '68', rx: '8', fill: 'transparent'
    }));
    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '283.5', y: '146.2', width: '16.5', height: '7.6',
      fill: 'url(#n6CrownNeck)', stroke: '#252A32', 'stroke-width': '0.8'
    }));

    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });
    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '284.5', y: '143.2', width: '6.2', height: '13.6',
      fill: 'url(#n6CrownNeck)', stroke: '#2F343C', 'stroke-width': '0.8'
    }));
    crownSlideEl.appendChild(createSvgEl('path', {
      d: CROWN_D, class: 'crown-body', fill: 'url(#n6CrownCyl)', stroke: '#323842', 'stroke-width': '1.1'
    }));

    const clipG = createSvgEl('g', { 'clip-path': 'url(#n6CrownClip)' });
    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls' });
    for (let i = -8; i <= 14; i++) {
      const y0 = 130 + i * 3.4;
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '289', y1: y0.toFixed(1), x2: '308', y2: (y0 + 14).toFixed(1),
        stroke: 'rgba(20, 24, 30, 0.62)', 'stroke-width': '1.05'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '289', y1: (y0 + 14).toFixed(1), x2: '308', y2: y0.toFixed(1),
        stroke: 'rgba(20, 24, 30, 0.52)', 'stroke-width': '0.95'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '289', y1: (y0 + 1.1).toFixed(1), x2: '308', y2: (y0 + 15.1).toFixed(1),
        stroke: 'rgba(255, 255, 255, 0.58)', 'stroke-width': '0.6'
      }));
    }
    clipG.appendChild(crownKnurlsEl);
    crownSlideEl.appendChild(clipG);
    crownSlideEl.appendChild(createSvgEl('line', { x1: '303.8', y1: '133.6', x2: '303.8', y2: '166.4', stroke: '#323842', 'stroke-width': '0.9' }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '305.0', y1: '135.4', x2: '305.0', y2: '164.6', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.75' }));
    crownEl.appendChild(crownSlideEl);
    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl, crownD: CROWN_D };
  }

  function buildCycloidSvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-16 -16 332 332',
      width: '100%',
      height: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'no5-svg is-cycloid-caliber is-no6-tribute',
      role: 'img',
      'aria-label': 'NO.3 CYCLOID — CASPER V1 더블 레트로그레이드 부채꼴 시계'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildDiamondCrown2H();

    // Wide Circular-Brushed 316L Steel Bezel with authentic photo metallic sheen
    const gBezel = createSvgEl('linearGradient', { id: 'n6BezelSheen', x1: '12%', y1: '4%', x2: '88%', y2: '96%' });
    [
      ['0%', '#D4DAE2'],
      ['18%', '#F5F7FA'],
      ['38%', '#B6BEC8'],
      ['56%', '#EFF2F6'],
      ['78%', '#9FA8B4'],
      ['100%', '#78818D']
    ].forEach(function (s) {
      gBezel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBezel);

    // Vertical Straight-Brushed Silver Upper Dial Plate
    const gUpperDial = createSvgEl('linearGradient', { id: 'n6UpperDial', x1: '10%', y1: '8%', x2: '90%', y2: '84%' });
    [
      ['0%', '#ECEFF3'],
      ['32%', '#F6F8FA'],
      ['62%', '#DDE2E8'],
      ['100%', '#CBD1DA']
    ].forEach(function (s) {
      gUpperDial.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gUpperDial);

    const pVertBrush = createSvgEl('pattern', { id: 'n6VertBrush', width: '2.6', height: '18', patternUnits: 'userSpaceOnUse' });
    pVertBrush.appendChild(createSvgEl('line', { x1: '0.6', y1: '0', x2: '0.6', y2: '18', stroke: 'rgba(255,255,255,0.44)', 'stroke-width': '0.5' }));
    pVertBrush.appendChild(createSvgEl('line', { x1: '1.8', y1: '0', x2: '1.8', y2: '18', stroke: 'rgba(42,48,58,0.12)', 'stroke-width': '0.45' }));
    defs.appendChild(pVertBrush);

    // Horizontal Brushed Steel Lower Gull-Wing Bridge (dark left-mid -> luminous center-right sheen, exact Image 2!)
    const gGullWing = createSvgEl('linearGradient', { id: 'n6GullWing', x1: '6%', y1: '15%', x2: '94%', y2: '85%' });
    [
      ['0%', '#C8CFD8'],
      ['24%', '#7A828D'],
      ['48%', '#BFC6D0'],
      ['70%', '#ECEFF4'],
      ['88%', '#C4CBD4'],
      ['100%', '#8E96A2']
    ].forEach(function (s) {
      gGullWing.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGullWing);

    const pHorizBrush = createSvgEl('pattern', { id: 'n6HorizBrush', width: '18', height: '2.4', patternUnits: 'userSpaceOnUse' });
    pHorizBrush.appendChild(createSvgEl('line', { x1: '0', y1: '0.6', x2: '18', y2: '0.6', stroke: 'rgba(255,255,255,0.36)', 'stroke-width': '0.48' }));
    pHorizBrush.appendChild(createSvgEl('line', { x1: '0', y1: '1.7', x2: '18', y2: '1.7', stroke: 'rgba(25,30,38,0.16)', 'stroke-width': '0.45' }));
    defs.appendChild(pHorizBrush);

    const gScrewHead = createSvgEl('radialGradient', { id: 'n6ScrewHead', cx: '35%', cy: '30%', r: '70%' });
    [['0%', '#FFFFFF'], ['58%', '#D5DCE4'], ['100%', '#9099A5']].forEach(function (s) {
      gScrewHead.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gScrewHead);

    const gCrownNeck = createSvgEl('linearGradient', { id: 'n6CrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#282D35'], ['35%', '#A0A8B3'], ['70%', '#4D5560'], ['100%', '#20252C']].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    const gCrownCyl = createSvgEl('linearGradient', { id: 'n6CrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#3A4049'], ['22%', '#D6DCE3'], ['42%', '#FFFFFF'], ['66%', '#A8B0BA'], ['100%', '#2C313A']].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownCyl);

    const gBrass = createSvgEl('linearGradient', { id: 'n6Brass', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#F5DA8A'], ['50%', '#C9973E'], ['100%', '#825B18']].forEach(function (s) {
      gBrass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBrass);

    const gGlass = createSvgEl('linearGradient', { id: 'n6GlassShine', x1: '8%', y1: '4%', x2: '92%', y2: '96%' });
    [
      ['0%', 'rgba(255,255,255,0.22)'],
      ['18%', 'rgba(255,255,255,0.06)'],
      ['34%', 'rgba(255,255,255,0)'],
      ['50%', 'rgba(255,255,255,0.05)'],
      ['58%', 'rgba(255,255,255,0)'],
      ['100%', 'rgba(20,24,30,0.08)']
    ].forEach(function (s) {
      gGlass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGlass);

    // Shadows (userSpaceOnUse prevents WebKit/iOS Safari zero-bbox hand clipping!)
    const fMechShadow = createSvgEl('filter', {
      id: 'n6MechShadow', filterUnits: 'userSpaceOnUse', x: '-24', y: '-24', width: '348', height: '348'
    });
    fMechShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.1', dy: '2.0', stdDeviation: '2.0', 'flood-color': '#14181F', 'flood-opacity': '0.36' }));
    defs.appendChild(fMechShadow);

    const fHandShadow = createSvgEl('filter', {
      id: 'n6HandShadow', filterUnits: 'userSpaceOnUse', x: '-24', y: '-24', width: '348', height: '348'
    });
    fHandShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.2', dy: '2.2', stdDeviation: '1.4', 'flood-color': '#11161E', 'flood-opacity': '0.42' }));
    defs.appendChild(fHandShadow);

    // Clip paths
    const clipDial = createSvgEl('clipPath', { id: 'n6DialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '114.5' }));
    defs.appendChild(clipDial);

    const clipSecWin = createSvgEl('clipPath', { id: 'n6SecWinClip' });
    clipSecWin.appendChild(createSvgEl('circle', { cx: '150', cy: '193', r: '21.5' }));
    defs.appendChild(clipSecWin);

    const clipCrown = createSvgEl('clipPath', { id: 'n6CrownClip' });
    clipCrown.appendChild(createSvgEl('path', { d: crownBuilt.crownD }));
    defs.appendChild(clipCrown);

    // Curved perimeter typography paths (matching Ōtsuka Lōtec No. 6 layout cleanly above gull-wing bridge!)
    defs.appendChild(createSvgEl('path', { id: 'n6TopLeftTxtPath', d: describeArc(CX, CY, 100.5, -42, -9, false) }));
    defs.appendChild(createSvgEl('path', { id: 'n6TopRightTxtPath', d: describeArc(CX, CY, 100.5, 9, 42, false) }));
    defs.appendChild(createSvgEl('path', { id: 'n6SideLeftTxtPath', d: describeArc(CX, CY, 102.5, -124, -84, false) }));
    defs.appendChild(createSvgEl('path', { id: 'n6SideRightTxtPath', d: describeArc(CX, CY, 102.5, 84, 124, false) }));

    svg.appendChild(defs);

    // Visual alarm breathing ring
    const visualAlarmRingEl = createSvgEl('circle', {
      cx: CX, cy: CY, r: '144.8', fill: 'none', class: 'visual-alarm-ring', 'stroke-width': '4'
    });
    svg.appendChild(visualAlarmRingEl);

    // 2:20 Flared Diamond-Knurled Crown
    svg.appendChild(crownBuilt.crownEl);

    const dialClickableEl = createSvgEl('g', { class: 'dial-clickable' });

    // =========================================================================
    // LAYER (1): Wide 8-Screw Circular-Brushed 316L Steel Bezel (r=140.5 -> 114.5)
    // =========================================================================
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '140.5', fill: 'url(#n6BezelSheen)', stroke: '#4A525D', 'stroke-width': '1.4'
    }));
    const bezelLatheG = createSvgEl('g', { opacity: '0.26', 'pointer-events': 'none' });
    for (let r = 120.5; r <= 139.0; r += 1.6) {
      bezelLatheG.appendChild(createSvgEl('circle', {
        cx: CX, cy: CY, r: r.toFixed(1), fill: 'none',
        stroke: r % 3.2 < 1.6 ? 'rgba(255,255,255,0.60)' : 'rgba(22,26,34,0.42)',
        'stroke-width': '0.45'
      }));
    }
    dialClickableEl.appendChild(bezelLatheG);
    // 8 Evenly-Spaced Countersunk Slotted Bezel Screws (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°!)
    const bezelAngles = [
      [0, 4], [45, -38], [90, 86], [135, 32],
      [180, -82], [225, 18], [270, 82], [315, -24]
    ];
    bezelAngles.forEach(function (cfg) {
      const p = polar(CX, CY, 129.6, cfg[0]);
      appendSlottedScrew(dialClickableEl, p.x, p.y, 4.1, cfg[1], true);
    });

    // Bright polished stepped inner bezel lip framing crystal
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.2', fill: '#E7EBF0', stroke: '#545D69', 'stroke-width': '1.05'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '117.4', fill: 'none', stroke: 'rgba(255,255,255,0.88)', 'stroke-width': '0.9'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '114.5', fill: 'url(#n6UpperDial)', stroke: '#4E5764', 'stroke-width': '0.95', class: 'cyc-dial-plate'
    }));

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#n6DialClip)' });

    // Authentic Vertical Straight-Brushed Silver Dial Grain
    dialInner.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '114.5', fill: 'url(#n6VertBrush)', opacity: '0.68', 'pointer-events': 'none'
    }));

    // =========================================================================
    // LAYER (2): Top Center Stud & 4 Curved Japanese Instrument Gauge Legends
    // =========================================================================
    appendSlottedScrew(dialInner, 150, 50.5, 4.2, 90, false);

    function appendCurvedLegend(pathId, text, cls) {
      const t = createSvgEl('text', { class: cls });
      const tp = createSvgEl('textPath', { href: '#' + pathId, startOffset: '50%', 'text-anchor': 'middle' });
      tp.setAttributeNS(XLINK_NS, 'xlink:href', '#' + pathId);
      tp.textContent = text;
      t.appendChild(tp);
      dialInner.appendChild(t);
    }
    appendCurvedLegend('n6TopLeftTxtPath', 'NO.3 CYCLOID', 'n6-arc-legend');
    appendCurvedLegend('n6TopRightTxtPath', 'CASPER™ · V1', 'n6-arc-legend');
    appendCurvedLegend('n6SideLeftTxtPath', 'ISOCHRONOUS', 'n6-side-legend');
    appendCurvedLegend('n6SideRightTxtPath', 'RETROGRADE', 'n6-side-legend');

    // =========================================================================
    // LAYER (3): Coaxial Double-Retrograde VU-Meter Fan Scales (Pivot PX=150, PY=204)
    // =========================================================================
    // Outer Minute Fan Arc (0..60m, r=120.0)
    dialInner.appendChild(createSvgEl('path', {
      d: describeArc(PX, PY, 120.0, FAN_START, FAN_START + FAN_SPAN, false),
      fill: 'none', stroke: '#151920', 'stroke-width': '1.15'
    }));
    for (let m = 0; m <= 60; m++) {
      const deg = FAN_START + (m / 60) * FAN_SPAN;
      const isTen = m % 10 === 0;
      const isFive = m % 5 === 0;
      const rIn = isTen ? 115.6 : (isFive ? 117.6 : 120.0);
      const rOut = isTen ? 125.6 : (isFive ? 124.2 : 122.8);
      const p1 = polar(PX, PY, rIn, deg);
      const p2 = polar(PX, PY, rOut, deg);
      dialInner.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(1), y1: p1.y.toFixed(1),
        x2: p2.x.toFixed(1), y2: p2.y.toFixed(1),
        stroke: '#12161D',
        'stroke-width': isTen ? '1.25' : (isFive ? '0.95' : '0.68')
      }));
      if (isTen && m > 0 && m < 60) {
        const pt = polar(PX, PY, 132.5, deg);
        const tm = createSvgEl('text', {
          x: pt.x.toFixed(1), y: (pt.y + 3.4).toFixed(1),
          'text-anchor': 'middle', class: 'n6-min-num',
          transform: 'rotate(' + deg.toFixed(1) + ' ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')'
        });
        tm.textContent = String(m);
        dialInner.appendChild(tm);
      }
    }

    // Inner Hour Fan Arc (0..12h, r=95.5 — radially aligned numerals matching Image 2!)
    dialInner.appendChild(createSvgEl('path', {
      d: describeArc(PX, PY, 95.5, FAN_START, FAN_START + FAN_SPAN, false),
      fill: 'none', stroke: '#151920', 'stroke-width': '1.05'
    }));

    for (let h = 0; h <= 24; h++) {
      const deg = FAN_START + (h / 24) * FAN_SPAN;
      const isHour = h % 2 === 0;
      const p1 = polar(PX, PY, isHour ? 90.4 : 93.4, deg);
      const p2 = polar(PX, PY, isHour ? 99.0 : 97.4, deg);
      dialInner.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(1), y1: p1.y.toFixed(1),
        x2: p2.x.toFixed(1), y2: p2.y.toFixed(1),
        stroke: '#14181F',
        'stroke-width': isHour ? '1.1' : '0.62'
      }));
      if (isHour) {
        const hourNum = h / 2;
        const pt = polar(PX, PY, 106.5, deg);
        const th = createSvgEl('text', {
          x: pt.x.toFixed(1), y: (pt.y + 3.4).toFixed(1),
          'text-anchor': 'middle', class: 'n6-hr-num',
          transform: 'rotate(' + deg.toFixed(1) + ' ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')'
        });
        th.textContent = String(hourNum);
        dialInner.appendChild(th);
      }
    }

    // =========================================================================
    // LAYER (4): Semi-Circular Open Small-Seconds Window + Round Date/Round Aperture
    // =========================================================================
    // Semi-circular open small-seconds window (150, 193, r=21.5) tucked right behind lower bridge!
    dialInner.appendChild(createSvgEl('circle', { cx: '150', cy: '193', r: '22.8', fill: '#3E4550', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.8' }));
    dialInner.appendChild(createSvgEl('circle', { cx: '150', cy: '193', r: '21.5', fill: '#282E38' }));
    const secWinG = createSvgEl('g', { 'clip-path': 'url(#n6SecWinClip)' });
    // Rotating silver small-seconds disc inside the recessed window
    const secDiscEl = createSvgEl('g', { id: 'cycSecHand' });
    secDiscEl.appendChild(createSvgEl('circle', { cx: '150', cy: '193', r: '21.0', fill: '#DDE2E8', stroke: '#7A8390', 'stroke-width': '0.8' }));
    for (let s = 0; s < 60; s += 2) {
      const deg = s * 6;
      const isFive = s % 5 === 0;
      const p1 = polar(150, 193, isFive ? 14.5 : 16.5, deg);
      const p2 = polar(150, 193, 20.6, deg);
      secDiscEl.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(1), y1: p1.y.toFixed(1),
        x2: p2.x.toFixed(1), y2: p2.y.toFixed(1),
        stroke: '#252B34', 'stroke-width': isFive ? '1.0' : '0.58'
      }));
    }
    secDiscEl.appendChild(createSvgEl('circle', { cx: '150', cy: '193', r: '12.5', fill: '#B8C0CA', stroke: '#6E7784', 'stroke-width': '0.6' }));
    secWinG.appendChild(secDiscEl);
    // Authentic glimpse of warm golden brass movement plate right behind the bottom of the seconds window (Image 2!)
    secWinG.appendChild(createSvgEl('path', {
      d: 'M 129,193 Q 150,185 171,193 L 171,216 L 129,216 Z',
      fill: 'url(#n6Brass)', opacity: '0.72', stroke: '#6B4E18', 'stroke-width': '0.6'
    }));
    secWinG.appendChild(createSvgEl('line', {
      x1: '150', y1: '171.5', x2: '150', y2: '177.5',
      stroke: '#C84B31', 'stroke-width': '1.3', class: 'cyc-accent-stroke'
    }));
    dialInner.appendChild(secWinG);

    // Round Stepped Steel Date / Study-Round Aperture at lower-right (196, 171) — exact Image 2 signature!
    const dateG = createSvgEl('g', { filter: 'url(#n6MechShadow)' });
    dateG.appendChild(createSvgEl('circle', { cx: '196', cy: '171', r: '15.2', fill: 'url(#n6BezelSheen)', stroke: '#4A525E', 'stroke-width': '0.95', class: 'jump-turret-bezel' }));
    dateG.appendChild(createSvgEl('circle', { cx: '196', cy: '171', r: '11.4', fill: '#F7F9FB', stroke: '#2B313B', 'stroke-width': '0.9' }));
    const roundBadgeEl = createSvgEl('text', {
      id: 'n6RoundNum', x: '196', y: '175.4', 'text-anchor': 'middle', class: 'n6-date-num'
    });
    roundBadgeEl.textContent = '1';
    dateG.appendChild(roundBadgeEl);
    dialInner.appendChild(dateG);

    // 2 Slotted Dial Screws flanking the lower gull-wing shoulders (exact Image 2 placement!)
    appendSlottedScrew(dialInner, 105, 194, 4.4, -42, false);
    appendSlottedScrew(dialInner, 195, 194, 4.4, 8, false);

    // =========================================================================
    // LAYER (5): Twin Ultra-Slim Mirror-Edged Silver Steel Retrograde Needles
    //            (Pivot at PX=150, PY=204 concealed neatly behind gull-wing bridge!)
    // =========================================================================
    // Shorter Hour Needle (reaches inner 0..12h scale at r=95.5)
    const hourHandEl = createSvgEl('g', { id: 'cycHourHand', class: 'cyc-retro-hand', filter: 'url(#n6HandShadow)' });
    hourHandEl.appendChild(createSvgEl('path', {
      d: 'M 148.1,206 L 149.2,110 L 150,106.5 L 150.8,110 L 151.9,206 Z',
      fill: '#ECEFF4', stroke: '#323842', 'stroke-width': '0.68', class: 'cyc-hr-hand-body'
    }));
    hourHandEl.appendChild(createSvgEl('line', {
      x1: '150', y1: '204', x2: '150', y2: '108',
      stroke: '#FFFFFF', 'stroke-width': '0.6'
    }));
    dialInner.appendChild(hourHandEl);

    // Longer Minute Needle (reaches outer 0..60m scale at r=122)
    const minHandEl = createSvgEl('g', { id: 'cycMinHand', class: 'cyc-retro-hand', filter: 'url(#n6HandShadow)' });
    minHandEl.appendChild(createSvgEl('path', {
      d: 'M 148.3,206 L 149.3,85 L 150,80.5 L 150.7,85 L 151.7,206 Z',
      fill: '#F5F7FA', stroke: '#2B313B', 'stroke-width': '0.65'
    }));
    minHandEl.appendChild(createSvgEl('line', {
      x1: '150', y1: '204', x2: '150', y2: '83',
      stroke: '#FFFFFF', 'stroke-width': '0.65'
    }));
    dialInner.appendChild(minHandEl);

    // =========================================================================
    // LAYER (6): Iconic Swooping Gull-Wing Horizontal-Brushed Lower Steel Bridge
    //            (Exact signature wave contour from Ōtsuka Lōtec No. 6 photo!)
    // =========================================================================
    const gullG = createSvgEl('g', { filter: 'url(#n6MechShadow)' });
    const gullTopCurve = 'M 32,199 C 60,218 82,216 104,204 C 126,192 174,192 196,204 C 218,216 240,218 268,199';
    const gullBridgeD = gullTopCurve + ' L 268,274 L 32,274 Z';

    gullG.appendChild(createSvgEl('path', {
      d: gullBridgeD, fill: 'url(#n6GullWing)', stroke: '#4A525E', 'stroke-width': '1.05', class: 'cyc-lower-bridge'
    }));
    gullG.appendChild(createSvgEl('path', {
      d: gullBridgeD, fill: 'url(#n6HorizBrush)', opacity: '0.62', 'pointer-events': 'none'
    }));
    // Gleaming polished silver chamfer wire bevel along the entire gull-wing upper contour!
    gullG.appendChild(createSvgEl('path', {
      d: gullTopCurve, fill: 'none', stroke: '#4A525E', 'stroke-width': '2.3', 'stroke-linecap': 'round'
    }));
    gullG.appendChild(createSvgEl('path', {
      d: gullTopCurve, fill: 'none', stroke: '#F4F7FB', 'stroke-width': '1.25', 'stroke-linecap': 'round'
    }));
    dialInner.appendChild(gullG);

    // =========================================================================
    // LAYER (7): Box Sapphire Crystal Optical Reflection Overlay
    // =========================================================================
    dialInner.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '114.5', fill: 'url(#n6GlassShine)', 'pointer-events': 'none' }));
    dialInner.appendChild(createSvgEl('path', { d: 'M 56,82 Q 112,42 184,48 Q 126,66 72,114 Z', fill: 'rgba(255,255,255,0.12)', 'pointer-events': 'none' }));
    dialClickableEl.appendChild(dialInner);

    dialClickableEl.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '114.5', fill: 'none', stroke: 'rgba(255,255,255,0.52)', 'stroke-width': '1.35', 'pointer-events': 'none' }));
    svg.appendChild(dialClickableEl);

    return {
      svg: svg,
      dialClickableEl: dialClickableEl,
      crownEl: crownBuilt.crownEl,
      crownKnurlsEl: crownBuilt.crownKnurlsEl,
      hourHandEl: hourHandEl,
      minHandEl: minHandEl,
      secDiscEl: secDiscEl,
      roundBadgeEl: roundBadgeEl,
      visualAlarmRingEl: visualAlarmRingEl
    };
  }

  function mount(containerEl, callbacks) {
    const cb = callbacks || {};
    containerEl.innerHTML = '';
    const parts = buildCycloidSvg();
    containerEl.appendChild(parts.svg);

    const crownOverlayEl = document.createElement('div');
    crownOverlayEl.id = 'no5CrownTouchOverlay';
    crownOverlayEl.className = 'crown-touch-overlay is-crown-2h';
    crownOverlayEl.setAttribute('tabindex', '0');
    crownOverlayEl.setAttribute('role', 'slider');
    crownOverlayEl.setAttribute('aria-label', '2시 용두 (0단 잠금) — 1회 클릭 1단(±1분), 2회 클릭 2단(±5분)');
    containerEl.appendChild(crownOverlayEl);

    let crownPosition = 0;
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let downClientX = 0, downClientY = 0, lastClientX = 0, lastClientY = 0;
    let dragAccum = 0, gestureStepsEmitted = 0, lockedHintEmitted = false;
    let turnTimerId = null;
    const COS_M22 = Math.cos((-22 * Math.PI) / 180);
    const SIN_M22 = Math.sin((-22 * Math.PI) / 180);

    function setCrownPosition(pos, silent) {
      const next = Math.max(0, Math.min(2, Math.round(Number(pos) || 0)));
      if (next === crownPosition) return;
      crownPosition = next;
      const isPulled = crownPosition > 0;
      parts.crownEl.classList.toggle('is-pulled', isPulled);
      parts.crownEl.classList.toggle('is-pos-1', crownPosition === 1);
      parts.crownEl.classList.toggle('is-pos-2', crownPosition === 2);
      parts.svg.classList.toggle('is-crown-pulled', isPulled);
      parts.svg.classList.toggle('is-crown-pos-1', crownPosition === 1);
      parts.svg.classList.toggle('is-crown-pos-2', crownPosition === 2);
      crownOverlayEl.classList.toggle('is-pulled', isPulled);
      crownOverlayEl.classList.toggle('is-pos-1', crownPosition === 1);
      crownOverlayEl.classList.toggle('is-pos-2', crownPosition === 2);
      if (!silent && typeof cb.onCrownPullChange === 'function') cb.onCrownPullChange(crownPosition);
    }

    function setCrownPulled(pulled, silent) {
      setCrownPosition(typeof pulled === 'number' ? pulled : (pulled ? 1 : 0), silent);
    }

    function cycleCrownPosition() { setCrownPosition((crownPosition + 1) % 3, false); }
    function notifyLockedAttempt() { if (typeof cb.onCrownLockedAttempt === 'function') cb.onCrownLockedAttempt(); }

    function animateCrown(delta) {
      crownVisualShift = ((crownVisualShift + delta) % 4 + 4) % 4;
      parts.crownKnurlsEl.setAttribute('transform', 'translate(0, ' + ((crownVisualShift - 1.5) * 0.7).toFixed(2) + ')');
      parts.crownEl.classList.add('is-turning');
      if (turnTimerId) clearTimeout(turnTimerId);
      turnTimerId = setTimeout(function () { parts.crownEl.classList.remove('is-turning'); }, 150);
    }

    function emitCrownStep(dir) {
      if (crownPosition === 0) { notifyLockedAttempt(); return; }
      animateCrown(dir > 0 ? 1 : -1);
      if (typeof cb.onCrownStep === 'function') cb.onCrownStep(dir * (crownPosition === 2 ? 5 : 1), crownPosition);
    }

    function applyCrownDelta(dx, dy, baseThresholdPx) {
      dragAccum += (-dy * COS_M22) + (dx * SIN_M22 * 0.65);
      if (crownPosition === 0) {
        if (!lockedHintEmitted && Math.abs(dragAccum) >= 14) { lockedHintEmitted = true; notifyLockedAttempt(); }
        return;
      }
      const thresholdPx = crownPosition === 2 ? Math.max(14, baseThresholdPx + 5) : baseThresholdPx;
      while (Math.abs(dragAccum) >= thresholdPx) {
        const dir = dragAccum > 0 ? 1 : -1;
        dragAccum -= dir * thresholdPx;
        gestureStepsEmitted += 1;
        emitCrownStep(dir);
      }
    }

    function bindCrownTarget(targetEl) {
      if (!targetEl) return;
      targetEl.addEventListener('mouseenter', function () { parts.crownEl.classList.add('is-hover'); });
      targetEl.addEventListener('mouseleave', function () { parts.crownEl.classList.remove('is-hover'); });
      targetEl.addEventListener('wheel', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (crownPosition === 0) { notifyLockedAttempt(); return; }
        emitCrownStep(e.deltaY < 0 ? 1 : -1);
      }, { passive: false });
      targetEl.addEventListener('touchstart', function (e) {
        if (!e.touches || !e.touches.length) return;
        e.preventDefault(); e.stopPropagation();
        touchDragging = true;
        downClientX = lastClientX = e.touches[0].clientX; downClientY = lastClientY = e.touches[0].clientY;
        dragAccum = 0; gestureStepsEmitted = 0; lockedHintEmitted = false;
        parts.crownEl.classList.add('is-dragging'); crownOverlayEl.classList.add('is-dragging');
      }, { passive: false });
      targetEl.addEventListener('touchmove', function (e) {
        if (!touchDragging || !e.touches || !e.touches.length) return;
        e.preventDefault(); e.stopPropagation();
        const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
        applyCrownDelta(cx - lastClientX, cy - lastClientY, 9);
        lastClientX = cx; lastClientY = cy;
      }, { passive: false });
      function endTouch(e) {
        if (!touchDragging) return;
        if (e && e.cancelable) e.preventDefault();
        const wasTap = e && e.type === 'touchend' && gestureStepsEmitted === 0 && !lockedHintEmitted && Math.hypot(lastClientX - downClientX, lastClientY - downClientY) < 8;
        touchDragging = false; parts.crownEl.classList.remove('is-dragging'); crownOverlayEl.classList.remove('is-dragging');
        if (wasTap) cycleCrownPosition();
      }
      targetEl.addEventListener('touchend', endTouch, { passive: false });
      targetEl.addEventListener('touchcancel', endTouch, { passive: false });
      targetEl.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        e.preventDefault(); e.stopPropagation();
        pointerDragging = true;
        downClientX = lastClientX = e.clientX; downClientY = lastClientY = e.clientY;
        dragAccum = 0; gestureStepsEmitted = 0; lockedHintEmitted = false;
        parts.crownEl.classList.add('is-dragging'); crownOverlayEl.classList.add('is-dragging');
        if (targetEl.setPointerCapture) { try { targetEl.setPointerCapture(e.pointerId); } catch (err) {} }
      });
      targetEl.addEventListener('pointermove', function (e) {
        if (!pointerDragging || e.pointerType === 'touch') return;
        e.preventDefault();
        applyCrownDelta(e.clientX - lastClientX, e.clientY - lastClientY, 10);
        lastClientX = e.clientX; lastClientY = e.clientY;
      });
      function endPointer(e) {
        if (!pointerDragging) return;
        const wasClick = e && e.type === 'pointerup' && gestureStepsEmitted === 0 && !lockedHintEmitted && Math.hypot(lastClientX - downClientX, lastClientY - downClientY) < 6;
        pointerDragging = false; parts.crownEl.classList.remove('is-dragging'); crownOverlayEl.classList.remove('is-dragging');
        if (e && targetEl.releasePointerCapture) { try { targetEl.releasePointerCapture(e.pointerId); } catch (err) {} }
        if (wasClick) cycleCrownPosition();
      }
      targetEl.addEventListener('pointerup', endPointer);
      targetEl.addEventListener('pointercancel', endPointer);
      targetEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); emitCrownStep(1); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); emitCrownStep(-1); }
        else if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); e.stopPropagation(); cycleCrownPosition(); }
      });
    }

    bindCrownTarget(crownOverlayEl);
    bindCrownTarget(parts.crownEl);

    let lastDialClickMs = 0, dialSingleClickTimer = null;
    parts.dialClickableEl.addEventListener('click', function () {
      const now = Date.now();
      if (now - lastDialClickMs < 320) {
        lastDialClickMs = 0;
        if (dialSingleClickTimer) { clearTimeout(dialSingleClickTimer); dialSingleClickTimer = null; }
        if (typeof cb.onDialDoubleClick === 'function') cb.onDialDoubleClick();
        return;
      }
      lastDialClickMs = now;
      if (dialSingleClickTimer) clearTimeout(dialSingleClickTimer);
      dialSingleClickTimer = setTimeout(function () {
        dialSingleClickTimer = null;
        if (typeof cb.onDialClick === 'function') cb.onDialClick();
      }, 280);
    });

    function render(snapshot) {
      if (!snapshot) return;
      const isTimerMode = snapshot.mode === 'pomodoro' || snapshot.mode === 'countdown' || snapshot.mode === 'stopwatch';
      const tHours = Number(snapshot.tHours) || 0;
      const hourScaleVal = isTimerMode && typeof snapshot.rawHours === 'number'
        ? Math.max(0, Math.min(12, snapshot.rawHours))
        : (((tHours % 12) + 12) % 12);
      const wholeH = Math.floor(hourScaleVal + 1e-6);
      const fracMin = isTimerMode && wholeH >= 12
        ? 0
        : Math.max(0, Math.min(60, (hourScaleVal - wholeH) * 60));
      const secSweep = Number(snapshot.secondsSweep) || 0;

      // Retrograde Minute Needle (-48° -> +48° across 0..60m, sweeps backward in countdown!)
      const minDeg = FAN_START + (fracMin / 60) * FAN_SPAN;
      parts.minHandEl.setAttribute('transform', 'rotate(' + minDeg.toFixed(2) + ' ' + PX + ' ' + PY + ')');

      // Retrograde Hour Needle (-48° -> +48° across 0..12h, sweeps backward in countdown!)
      const hrDeg = FAN_START + (hourScaleVal / 12) * FAN_SPAN;
      parts.hourHandEl.setAttribute('transform', 'rotate(' + hrDeg.toFixed(2) + ' ' + PX + ' ' + PY + ')');

      // Semi-circular rotating small-seconds disc (unwinds backward in countdown!)
      parts.secDiscEl.setAttribute('transform', 'rotate(' + (-secSweep * 6).toFixed(2) + ' 150 193)');

      // Round Aperture: today's date in Desk Clock, Pomodoro round in Pomodoro, whole hours in Countdown/Stopwatch
      if (parts.roundBadgeEl) {
        let badgeVal;
        if (snapshot.mode === 'clock') {
          badgeVal = String(new Date().getDate());
        } else if (snapshot.mode === 'pomodoro') {
          badgeVal = String(snapshot.round || 1);
        } else {
          badgeVal = String(wholeH);
        }
        if (parts.roundBadgeEl.textContent !== badgeVal) {
          parts.roundBadgeEl.textContent = badgeVal;
        }
      }

      parts.svg.classList.toggle('is-break-phase', snapshot.phase === 'break');
      parts.svg.classList.toggle('is-warning-phase', Boolean(snapshot.isWarning));
    }

    function triggerVisualAlarm() {
      parts.visualAlarmRingEl.classList.remove('is-pulsing');
      void parts.visualAlarmRingEl.offsetWidth;
      parts.visualAlarmRingEl.classList.add('is-pulsing');
    }

    function setFinish(finishId) {
      parts.svg.classList.remove('finish-blued', 'finish-gold', 'finish-lume');
      if (finishId === 'blued' || finishId === 'gold' || finishId === 'lume') {
        parts.svg.classList.add('finish-' + finishId);
      }
    }

    return {
      svgRoot: parts.svg,
      render: render,
      triggerVisualAlarm: triggerVisualAlarm,
      setCrownPosition: setCrownPosition,
      getCrownPosition: function () { return crownPosition; },
      setCrownPulled: setCrownPulled,
      isCrownPulled: function () { return crownPosition > 0; },
      setFinish: setFinish
    };
  }

  global.CycloidWatchEngine = {
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
