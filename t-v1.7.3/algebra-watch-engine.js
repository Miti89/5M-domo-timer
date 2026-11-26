/**
 * CASPER™ V1 — NO.1 ALGEBRA Caliber Pure SVG Engine (algebra-watch-engine.js)
 * Forensic Tribute to A. Lange & Söhne Lange 1 Moon Phase (v5.8.1 Golden Ratio Edition):
 *   - Golden Ratio (1 : 1.618) & Exact Non-Overlapping Isosceles Triangle Architecture:
 *       * Main Time Subdial center M(103.5, 150.0), rOuter=63.5, rInner=39.25 (63.5 / 39.25 = 1.618!)
 *       * Outsize Date center D(189.5, 100.5), frame 45.3 x 28.0 (45.3 / 28.0 = 1.618!)
 *       * Moon Phase & Small Seconds center S(189.5, 199.5), r=34.0
 *       * Exact Isosceles Triangle: |MD| = |MS| = 99.23px (0.00px asymmetry!), |DS| = 99.00px, zero overlap
 *   - Patented Twin-Aperture Outsize Date with authentic 0.15mm dual-disc physical step depth:
 *       * Left tens disc sits 0.15mm higher (brighter matte porcelain) than right units disc
 *         (subtle recessed cooler plane + cast shadow along central platinum divider wall)
 *       * 4 hand-chamfered miter corners on the stepped platinum double frame
 *   - Right-side AUF / AB Power Reserve sector (PX=185.0, PY=150.0) balancing Outsize Date & Moon Phase
 *     with 5 crisp hollow triangular wedges aimed cleanly toward the pivot
 *   - Pure round lugless double-stepped mirror platinum case (r=136.5 -> dial r=119.5),
 *     10 o'clock recessed rectangular outsize-date pusher & 3 o'clock finely fluted crown (0/1/2 stages)
 *   - ZERO SVG <filter> elements: pure layered vector shadows & bevels for locked 60fps Retina clarity
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const CX = 150;
  const CY = 150;

  // Exact Golden-Ratio (φ ≈ 1.618) & Isosceles Triangle Coordinates:
  //   M(103.5, 150.0), D(189.5, 100.5), S(189.5, 199.5) -> |MD| = |MS| = 99.228px, |DS| = 99.000px
  const MX = 103.5;
  const MY = 150.0;
  const R_MAIN = 63.5;
  const R_INNER = 39.25; // R_MAIN / R_INNER = 1.6178 ≈ φ

  // Outsize Date centered at D(189.5, 100.5) with exact Golden-Ratio aspect (45.3 / 28.0 = 1.6179 ≈ φ)
  const BD_W = 45.3;
  const BD_H = 28.0;
  const BD_X = 189.5 - BD_W / 2; // 166.85
  const BD_Y = 100.5 - BD_H / 2; // 86.50

  // Right-side AUF / AB Power Reserve pivot on exact horizontal midline (balances Date above & Moon below)
  const PX = 185.0;
  const PY = 150.0;

  // Lower-right Celestial Moon Phase & Small Seconds centered at S(189.5, 199.5) (1.73px clean tangency!)
  const SX = 189.5;
  const SY = 199.5;
  const R_SEC = 34.0;

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

  // Clock angle polar helper: 0° = 12 o'clock (up), +90° = 3 o'clock (right)
  function polar(cx, cy, r, clockDeg) {
    const rad = (clockDeg - 90) * (Math.PI / 180);
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

  function starPoints(cx, cy, rOuter, rInner, rotDeg) {
    const pts = [];
    const base = (rotDeg || 0) - 90;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const rad = ((base + i * 36) * Math.PI) / 180;
      pts.push((cx + r * Math.cos(rad)).toFixed(2) + ',' + (cy + r * Math.sin(rad)).toFixed(2));
    }
    return pts.join(' ');
  }

  /**
   * Appends a sculpted 3D applied white-gold/rhodium Roman numeral (XII, III, VI, IX)
   * radially aligned around the off-center main subdial with authentic cast shadow & specular ridge.
   */
  function appendAppliedRomanNumeral(parent, numeral, deg) {
    const pt = polar(MX, MY, 48.1, deg);
    const g = createSvgEl('g', {
      transform: 'translate(' + pt.x.toFixed(2) + ', ' + pt.y.toFixed(2) + ') rotate(' + deg + ')',
      class: 'alg-roman-group'
    });

    const sh = createSvgEl('text', {
      x: '0.55',
      y: '0.85',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'alg-roman-shadow'
    });
    sh.textContent = numeral;
    g.appendChild(sh);

    const face = createSvgEl('text', {
      x: '0',
      y: '0',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'alg-roman-face'
    });
    face.textContent = numeral;
    g.appendChild(face);

    const hi = createSvgEl('text', {
      x: '-0.28',
      y: '-0.28',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'alg-roman-hi'
    });
    hi.textContent = numeral;
    g.appendChild(hi);

    parent.appendChild(g);
  }

  /**
   * Appends a diamond-cut 3D split-facet white-gold/rhodium lancet lozenge hour marker
   * at positions 1, 2, 4, 5, 7, 8, 10, 11 o'clock on the main subdial.
   */
  function appendFacetedLozenge(parent, deg) {
    const pt = polar(MX, MY, 48.2, deg);
    const g = createSvgEl('g', {
      transform: 'translate(' + pt.x.toFixed(2) + ', ' + pt.y.toFixed(2) + ') rotate(' + deg + ')',
      class: 'alg-lozenge-group'
    });

    // Cast shadow on matte silver chapter ring
    g.appendChild(createSvgEl('polygon', {
      points: '0,-5.2 2.45,0.5 0,4.8 -2.45,0.5',
      fill: 'rgba(16,22,32,0.26)',
      transform: 'translate(0.65, 0.95)'
    }));
    // Bright left platinum facet
    g.appendChild(createSvgEl('polygon', {
      points: '0,-5.2 0,4.8 -2.35,0.5',
      fill: 'url(#algFacetLight)',
      stroke: '#525C6A',
      'stroke-width': '0.36',
      'stroke-linejoin': 'miter',
      class: 'alg-marker-light'
    }));
    // Deep shaded right rhodium facet
    g.appendChild(createSvgEl('polygon', {
      points: '0,-5.2 2.35,0.5 0,4.8',
      fill: 'url(#algFacetDark)',
      stroke: '#3D4654',
      'stroke-width': '0.36',
      'stroke-linejoin': 'miter',
      class: 'alg-marker-dark'
    }));
    // Crisp specular center keel line
    g.appendChild(createSvgEl('line', {
      x1: '0', y1: '-4.5', x2: '0', y2: '4.1',
      stroke: 'rgba(255,255,255,0.92)', 'stroke-width': '0.40'
    }));

    parent.appendChild(g);
  }

  /**
   * Builds the 3 o'clock finely fluted cylindrical platinum crown (0/1/2 stages).
   */
  function buildLangeCrown() {
    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(0 150 150)'
    });

    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '278', y: '116', width: '46', height: '68', rx: '8', fill: 'transparent'
    }));

    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '281.0', y: '146.2', width: '18.0', height: '7.6',
      fill: 'url(#algCrownNeck)', stroke: '#2A3039', 'stroke-width': '0.75'
    }));

    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });

    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '288.4', y: '136.4', width: '14.2', height: '29.6', rx: '2.6',
      fill: 'rgba(18,24,34,0.20)', 'pointer-events': 'none'
    }));

    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '285.2', y: '141.6', width: '3.6', height: '16.8',
      fill: 'url(#algCrownNeck)', stroke: '#343C48', 'stroke-width': '0.7'
    }));

    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '288.0', y: '135.2', width: '14.2', height: '29.6', rx: '2.5',
      class: 'crown-body', fill: 'url(#algCrownCyl)', stroke: '#2F3642', 'stroke-width': '1.0'
    }));

    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls', 'clip-path': 'url(#algCrownClip)' });
    for (let y = 136.6; y <= 163.6; y += 2.35) {
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '288.6', y1: y.toFixed(2), x2: '300.6', y2: y.toFixed(2),
        stroke: 'rgba(18, 23, 31, 0.62)', 'stroke-width': '1.0'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '288.6', y1: (y + 0.95).toFixed(2), x2: '300.6', y2: (y + 0.95).toFixed(2),
        stroke: 'rgba(255, 255, 255, 0.86)', 'stroke-width': '0.68'
      }));
    }
    crownSlideEl.appendChild(crownKnurlsEl);

    crownSlideEl.appendChild(createSvgEl('line', {
      x1: '300.6', y1: '136.6', x2: '300.6', y2: '163.4',
      stroke: 'rgba(255,255,255,0.88)', 'stroke-width': '0.9'
    }));

    crownEl.appendChild(crownSlideEl);
    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl };
  }

  /**
   * Builds the iconic 10 o'clock recessed rectangular Outsize-Date corrector pusher.
   */
  function buildDatePusher10H() {
    const g = createSvgEl('g', {
      class: 'alg-date-pusher',
      transform: 'rotate(-150 150 150)'
    });
    g.appendChild(createSvgEl('rect', {
      x: '284.2', y: '137.0', width: '7.4', height: '27.0', rx: '1.8',
      fill: 'rgba(16,22,32,0.18)', 'pointer-events': 'none'
    }));
    g.appendChild(createSvgEl('rect', {
      x: '283.6', y: '136.5', width: '7.2', height: '27.0', rx: '1.7',
      fill: 'url(#algCrownCyl)', stroke: '#353D49', 'stroke-width': '0.95'
    }));
    g.appendChild(createSvgEl('line', {
      x1: '289.1', y1: '138.2', x2: '289.1', y2: '161.8',
      stroke: 'rgba(255,255,255,0.86)', 'stroke-width': '0.85'
    }));
    g.appendChild(createSvgEl('line', {
      x1: '285.0', y1: '138.0', x2: '285.0', y2: '162.0',
      stroke: 'rgba(24,30,40,0.42)', 'stroke-width': '0.7'
    }));
    return g;
  }

  function buildAlgebraSvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-16 -16 332 332',
      width: '100%',
      height: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'no5-svg is-algebra-caliber is-lange1-tribute',
      role: 'img',
      'aria-label': 'NO.1 ALGEBRA — CASPER 황금비 오프센터 문페이즈 시계'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildLangeCrown();

    // Liquid-chrome 950 Platinum convex mirror bezel sheen
    const gCase = createSvgEl('linearGradient', { id: 'algPlatCase', x1: '14%', y1: '2%', x2: '86%', y2: '98%' });
    [
      ['0%', '#FFFFFF'],
      ['14%', '#E6EBF2'],
      ['28%', '#6D7684'],
      ['44%', '#FFFFFF'],
      ['60%', '#CFD6E0'],
      ['76%', '#565F6D'],
      ['90%', '#EDF1F6'],
      ['100%', '#98A2B0']
    ].forEach(function (s) {
      gCase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCase);

    const gBezelStep = createSvgEl('linearGradient', { id: 'algBezelStep', x1: '86%', y1: '8%', x2: '14%', y2: '92%' });
    [
      ['0%', '#434B57'],
      ['20%', '#F5F7FA'],
      ['42%', '#8C95A3'],
      ['64%', '#FFFFFF'],
      ['84%', '#5C6573'],
      ['100%', '#E2E7EE']
    ].forEach(function (s) {
      gBezelStep.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBezelStep);

    const gCrownCyl = createSvgEl('linearGradient', { id: 'algCrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#363E4A'], ['18%', '#DDE3EC'], ['38%', '#FFFFFF'], ['64%', '#B0B9C7'], ['86%', '#606976'], ['100%', '#282E38']].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownCyl);

    const gCrownNeck = createSvgEl('linearGradient', { id: 'algCrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#282E36'], ['34%', '#8B94A0'], ['68%', '#4E5662'], ['100%', '#20252D']].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    // Solid-Silver Matte Argenté Dial Plate
    const gDial = createSvgEl('radialGradient', { id: 'algArgenteDial', cx: '45%', cy: '36%', r: '72%' });
    [['0%', '#F1F3F6'], ['52%', '#E4E7EC'], ['84%', '#D4D9E0'], ['100%', '#C3C8D1']].forEach(function (s) {
      gDial.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDial);

    const pGrain = createSvgEl('pattern', { id: 'algSilverGrain', width: '4', height: '4', patternUnits: 'userSpaceOnUse' });
    pGrain.appendChild(createSvgEl('circle', { cx: '1.0', cy: '1.1', r: '0.42', fill: 'rgba(110,118,130,0.085)' }));
    pGrain.appendChild(createSvgEl('circle', { cx: '3.0', cy: '2.9', r: '0.38', fill: 'rgba(255,255,255,0.34)' }));
    defs.appendChild(pGrain);

    const gDialAO = createSvgEl('radialGradient', { id: 'algDialAO', cx: '50%', cy: '50%', r: '50%' });
    [['0%', 'rgba(15,23,42,0)'], ['89%', 'rgba(15,23,42,0)'], ['95.5%', 'rgba(15,23,42,0.07)'], ['100%', 'rgba(15,23,42,0.24)']].forEach(function (s) {
      gDialAO.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDialAO);

    // Main Time Subdial Outer Chapter Ring & Golden-Ratio Recessed Inner Disc
    const gSubChapter = createSvgEl('radialGradient', { id: 'algSubChapter', cx: '42%', cy: '38%', r: '66%' });
    [['0%', '#EEF1F5'], ['65%', '#E1E5EB'], ['100%', '#D1D6DF']].forEach(function (s) {
      gSubChapter.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSubChapter);

    const gSubInner = createSvgEl('radialGradient', { id: 'algSubInner', cx: '56%', cy: '58%', r: '65%' });
    [['0%', '#E4E8ED'], ['70%', '#D8DCE4'], ['100%', '#C7CCD6']].forEach(function (s) {
      gSubInner.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSubInner);

    // Outsize Date Sculpted Platinum Double Frame & 0.15mm Dual-Disc Depth Gradients
    const gDateFrame = createSvgEl('linearGradient', { id: 'algDateFrame', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#FFFFFF'], ['24%', '#CFD5DF'], ['50%', '#F8FAFC'], ['76%', '#8B94A2'], ['100%', '#505866']].forEach(function (s) {
      gDateFrame.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateFrame);

    // Left Tens Disc (upper plane, 0.15mm closer to sapphire crystal)
    const gDateTensWell = createSvgEl('linearGradient', { id: 'algDateTensWell', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#FFFFFF'], ['70%', '#FAFBFD'], ['100%', '#F1F4F8']].forEach(function (s) {
      gDateTensWell.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateTensWell);

    // Right Units Disc (0.15mm recessed lower plane -> subtly cooler satin tone & deeper shadow)
    const gDateUnitsWell = createSvgEl('linearGradient', { id: 'algDateUnitsWell', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#EFF2F7'], ['30%', '#F6F8FB'], ['100%', '#E9EDF3']].forEach(function (s) {
      gDateUnitsWell.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateUnitsWell);

    const gDateLipShallow = createSvgEl('linearGradient', { id: 'algDateLipShallow', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', 'rgba(15,20,28,0.22)'], ['26%', 'rgba(15,20,28,0.04)'], ['100%', 'rgba(15,20,28,0)']].forEach(function (s) {
      gDateLipShallow.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateLipShallow);

    const gDateLipDeep = createSvgEl('linearGradient', { id: 'algDateLipDeep', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', 'rgba(15,20,28,0.34)'], ['32%', 'rgba(15,20,28,0.09)'], ['100%', 'rgba(15,20,28,0)']].forEach(function (s) {
      gDateLipDeep.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateLipDeep);

    const gDateStepSide = createSvgEl('linearGradient', { id: 'algDateStepSide', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [['0%', 'rgba(15,20,28,0.26)'], ['45%', 'rgba(15,20,28,0.07)'], ['100%', 'rgba(15,20,28,0)']].forEach(function (s) {
      gDateStepSide.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDateStepSide);

    // 3D Split-Facet Rhodium/White-Gold Hands & Markers
    const gFacetLight = createSvgEl('linearGradient', { id: 'algFacetLight', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#FFFFFF'], ['45%', '#F1F4F8'], ['100%', '#C4CCD8']].forEach(function (s) {
      gFacetLight.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gFacetLight);

    const gFacetDark = createSvgEl('linearGradient', { id: 'algFacetDark', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#B0B9C6'], ['45%', '#747E8D'], ['100%', '#424A57']].forEach(function (s) {
      gFacetDark.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gFacetDark);

    const gHubCap = createSvgEl('radialGradient', { id: 'algHubCap', cx: '36%', cy: '30%', r: '70%' });
    [['0%', '#FFFFFF'], ['45%', '#DCE2EB'], ['82%', '#858E9D'], ['100%', '#444C59']].forEach(function (s) {
      gHubCap.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gHubCap);

    // Deep Royal Celestial Blue Enamel Sky & Solid-Silver Moon Disc
    const gMoonSky = createSvgEl('radialGradient', { id: 'algMoonSky', cx: '50%', cy: '36%', r: '66%' });
    [['0%', '#2860C7'], ['46%', '#194497'], ['84%', '#102D6B'], ['100%', '#0A1C46']].forEach(function (s) {
      gMoonSky.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gMoonSky);

    const gMoonOrb = createSvgEl('radialGradient', { id: 'algMoonOrb', cx: '36%', cy: '30%', r: '68%' });
    [['0%', '#FFFFFF'], ['44%', '#EEF2F7'], ['76%', '#C4CCD8'], ['100%', '#909AA8']].forEach(function (s) {
      gMoonOrb.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gMoonOrb);

    const gMoonInnerShadow = createSvgEl('radialGradient', { id: 'algMoonInnerShadow', cx: '50%', cy: '52%', r: '52%' });
    [['0%', 'rgba(5,12,30,0)'], ['74%', 'rgba(5,12,30,0)'], ['92%', 'rgba(5,12,30,0.20)'], ['100%', 'rgba(5,12,30,0.48)']].forEach(function (s) {
      gMoonInnerShadow.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gMoonInnerShadow);

    const gSecDish = createSvgEl('radialGradient', { id: 'algSecDish', cx: '52%', cy: '58%', r: '64%' });
    [['0%', '#EAECEF'], ['70%', '#DCE0E6'], ['100%', '#C7CCD5']].forEach(function (s) {
      gSecDish.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSecDish);

    const gGlass = createSvgEl('linearGradient', { id: 'algGlassAR', x1: '8%', y1: '4%', x2: '92%', y2: '96%' });
    [
      ['0%', 'rgba(255,255,255,0.20)'],
      ['16%', 'rgba(210,228,255,0.06)'],
      ['32%', 'rgba(255,255,255,0)'],
      ['50%', 'rgba(255,255,255,0.04)'],
      ['60%', 'rgba(255,255,255,0)'],
      ['100%', 'rgba(15,23,42,0.06)']
    ].forEach(function (s) {
      gGlass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGlass);

    // Clip paths
    const clipDial = createSvgEl('clipPath', { id: 'algDialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '119.5' }));
    defs.appendChild(clipDial);

    const clipCrown = createSvgEl('clipPath', { id: 'algCrownClip' });
    clipCrown.appendChild(createSvgEl('rect', { x: '288.0', y: '135.2', width: '14.2', height: '29.6', rx: '2.5' }));
    defs.appendChild(clipCrown);

    // Exact Lange 1 arched Moon Phase aperture: upper dome (r=26.8) over sculpted double-hump silver cloud bridge
    const moonApertureD = [
      'M ' + (SX - 26.8).toFixed(2) + ',' + (SY + 0.8).toFixed(2),
      'A 26.8,26.8 0 0,1 ' + (SX + 26.8).toFixed(2) + ',' + (SY + 0.8).toFixed(2),
      'A 14.3,14.3 0 0,0 ' + SX.toFixed(2) + ',' + (SY + 3.6).toFixed(2),
      'A 14.3,14.3 0 0,0 ' + (SX - 26.8).toFixed(2) + ',' + (SY + 0.8).toFixed(2),
      'Z'
    ].join(' ');

    const clipMoon = createSvgEl('clipPath', { id: 'algMoonApertureClip' });
    clipMoon.appendChild(createSvgEl('path', { d: moonApertureD }));
    defs.appendChild(clipMoon);

    // Curved Glashütte perimeter typography paths
    defs.appendChild(createSvgEl('path', {
      id: 'algTopBrandPath',
      d: describeArc(CX, CY, 102.8, -44, 40, false)
    }));
    defs.appendChild(createSvgEl('path', {
      id: 'algBotBarrelPath',
      d: describeArc(CX, CY, 107.6, 224, 174, true)
    }));
    defs.appendChild(createSvgEl('path', {
      id: 'algSubStudioPath',
      d: describeArc(MX, MY, 69.2, 206, 154, true)
    }));
    defs.appendChild(createSvgEl('path', {
      id: 'algAufPath',
      d: describeArc(CX, CY, 103.8, 43, 57, false)
    }));
    defs.appendChild(createSvgEl('path', {
      id: 'algAbPath',
      d: describeArc(CX, CY, 103.8, 108, 121, false)
    }));

    svg.appendChild(defs);

    const visualAlarmRingEl = createSvgEl('circle', {
      cx: CX, cy: CY, r: '143.5', fill: 'none', class: 'visual-alarm-ring', 'stroke-width': '4'
    });
    svg.appendChild(visualAlarmRingEl);

    // LAYER (1): 10 o'clock Recessed Date Pusher & 3 o'clock Finely Fluted Platinum Crown
    svg.appendChild(buildDatePusher10H());
    svg.appendChild(crownBuilt.crownEl);

    const dialClickableEl = createSvgEl('g', { class: 'dial-clickable' });

    // =========================================================================
    // LAYER (2): Pure Round Lugless Double-Stepped Mirror-Polished Platinum Case
    // =========================================================================
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '136.5',
      fill: 'url(#algPlatCase)', stroke: '#323945', 'stroke-width': '1.35', class: 'alg-case-outer'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '134.8',
      fill: 'none', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.9'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '130.6',
      fill: 'url(#algBezelStep)', stroke: 'rgba(30,36,46,0.52)', 'stroke-width': '0.95'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '128.4',
      fill: 'none', stroke: 'rgba(255,255,255,0.88)', 'stroke-width': '1.0'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '123.0',
      fill: 'url(#algPlatCase)', stroke: 'rgba(34,40,50,0.44)', 'stroke-width': '0.85'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '121.0',
      fill: 'none', stroke: 'rgba(255,255,255,0.76)', 'stroke-width': '0.75'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.5',
      fill: 'url(#algArgenteDial)', stroke: '#4A5362', 'stroke-width': '0.9', class: 'alg-dial-face'
    }));

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#algDialClip)' });
    dialInner.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.5', fill: 'url(#algSilverGrain)', opacity: '0.76', 'pointer-events': 'none'
    }));
    dialInner.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.5', fill: 'url(#algDialAO)', 'pointer-events': 'none'
    }));

    // =========================================================================
    // LAYER (3): Authentic Glashütte Perimeter & Sub-Signature Typography
    // =========================================================================
    const topBrandEl = createSvgEl('text', { class: 'alg-brand-arc' });
    const topBrandPath = createSvgEl('textPath', { href: '#algTopBrandPath', startOffset: '50%', 'text-anchor': 'middle' });
    topBrandPath.setAttributeNS(XLINK_NS, 'xlink:href', '#algTopBrandPath');
    topBrandPath.textContent = 'CASPER  &  ALGEBRA';
    topBrandEl.appendChild(topBrandPath);
    dialInner.appendChild(topBrandEl);

    const subBrandEl = createSvgEl('text', {
      x: '148.0', y: '68.6', 'text-anchor': 'middle', class: 'alg-sub-txt'
    });
    subBrandEl.textContent = 'CALIBRE NO.1';
    dialInner.appendChild(subBrandEl);

    const botBarrelEl = createSvgEl('text', { class: 'alg-barrel-arc' });
    const botBarrelPath = createSvgEl('textPath', { href: '#algBotBarrelPath', startOffset: '50%', 'text-anchor': 'middle' });
    botBarrelPath.setAttributeNS(XLINK_NS, 'xlink:href', '#algBotBarrelPath');
    botBarrelPath.textContent = 'DOUBLE BARREL';
    botBarrelEl.appendChild(botBarrelPath);
    dialInner.appendChild(botBarrelEl);

    const studioEl = createSvgEl('text', { class: 'alg-studio-txt' });
    const studioPath = createSvgEl('textPath', { href: '#algSubStudioPath', startOffset: '50%', 'text-anchor': 'middle' });
    studioPath.setAttributeNS(XLINK_NS, 'xlink:href', '#algSubStudioPath');
    studioPath.textContent = 'CASPER STUDIO';
    studioEl.appendChild(studioPath);
    dialInner.appendChild(studioEl);

    // =========================================================================
    // LAYER (4): Golden-Ratio Off-Center Main Time Subdial
    //            M(103.5, 150.0), rOuter = 63.5, rInner = 39.25 (1 : 1.618!)
    // =========================================================================
    const mainSubG = createSvgEl('g', { class: 'alg-main-subdial' });

    // Outer stepped subdial bezel rim with machined concave shadow + catchlight
    mainSubG.appendChild(createSvgEl('circle', {
      cx: MX, cy: MY, r: R_MAIN.toFixed(2),
      fill: 'url(#algSubChapter)', stroke: 'rgba(42,50,62,0.38)', 'stroke-width': '1.0', class: 'alg-sub-plate'
    }));
    mainSubG.appendChild(createSvgEl('path', {
      d: describeArc(MX, MY, R_MAIN - 0.65, 130, 310, true),
      fill: 'none', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.9'
    }));

    // Subtle concentric satin azurage sheen inside chapter ring
    for (let ar = 42.5; ar <= 54.5; ar += 3.0) {
      mainSubG.appendChild(createSvgEl('circle', {
        cx: MX, cy: MY, r: ar.toFixed(1), fill: 'none',
        stroke: ar % 6 < 3 ? 'rgba(255,255,255,0.22)' : 'rgba(54,64,78,0.06)',
        'stroke-width': '0.6', 'pointer-events': 'none'
      }));
    }

    // Precision 60-minute perimeter track + 12 applied faceted rhodium luminous box pips
    for (let m = 0; m < 60; m++) {
      const deg = m * 6;
      if (m % 5 === 0) {
        const pBox = polar(MX, MY, 59.1, deg);
        const boxG = createSvgEl('g', {
          transform: 'translate(' + pBox.x.toFixed(2) + ', ' + pBox.y.toFixed(2) + ') rotate(' + deg + ')'
        });
        boxG.appendChild(createSvgEl('rect', {
          x: '-1.35', y: '-2.1', width: '2.7', height: '4.2', rx: '0.35',
          fill: '#F5F7FB', stroke: '#363F4D', 'stroke-width': '0.72', class: 'alg-pip-box'
        }));
        mainSubG.appendChild(boxG);
      } else {
        const p1 = polar(MX, MY, 57.5, deg);
        const p2 = polar(MX, MY, 60.9, deg);
        mainSubG.appendChild(createSvgEl('line', {
          x1: p1.x.toFixed(2), y1: p1.y.toFixed(2),
          x2: p2.x.toFixed(2), y2: p2.y.toFixed(2),
          stroke: '#191E26', 'stroke-width': '0.74', 'stroke-linecap': 'butt', class: 'alg-min-tick'
        }));
      }
    }

    // Golden-Ratio Recessed Matte Inner Circle (r = 39.25, R_MAIN / R_INNER = 1.618!)
    mainSubG.appendChild(createSvgEl('circle', {
      cx: MX, cy: MY, r: R_INNER.toFixed(2),
      fill: 'url(#algSubInner)', stroke: 'rgba(38,46,58,0.38)', 'stroke-width': '0.85', class: 'alg-sub-inner'
    }));
    mainSubG.appendChild(createSvgEl('path', {
      d: describeArc(MX, MY, R_INNER - 0.6, 125, 305, true),
      fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.78'
    }));

    // 4 Applied Radial 3D Rhodium Roman Numerals (XII, III, VI, IX)
    appendAppliedRomanNumeral(mainSubG, 'XII', 0);
    appendAppliedRomanNumeral(mainSubG, 'III', 90);
    appendAppliedRomanNumeral(mainSubG, 'VI', 180);
    appendAppliedRomanNumeral(mainSubG, 'IX', 270);

    // 8 Applied Diamond-Cut 3D Split-Facet Lozenge Markers (1, 2, 4, 5, 7, 8, 10, 11)
    [30, 60, 120, 150, 210, 240, 300, 330].forEach(function (deg) {
      appendFacetedLozenge(mainSubG, deg);
    });

    dialInner.appendChild(mainSubG);

    // =========================================================================
    // LAYER (5): Patented Outsize Date — Golden Ratio Frame (45.3 x 28.0 = 1.618!)
    //            Centered on Isosceles Apex D(189.5, 100.5) with 0.15mm Dual-Disc Step!
    // =========================================================================
    const bigDateG = createSvgEl('g', { class: 'alg-big-date' });

    // Cast shadow beneath sculpted platinum double frame
    bigDateG.appendChild(createSvgEl('rect', {
      x: (BD_X + 0.9).toFixed(2), y: (BD_Y + 1.55).toFixed(2),
      width: BD_W.toFixed(2), height: BD_H.toFixed(2), rx: '1.1',
      fill: 'rgba(16,22,32,0.24)', 'pointer-events': 'none'
    }));
    // Outer sculpted 3D stepped platinum double frame
    bigDateG.appendChild(createSvgEl('rect', {
      x: BD_X.toFixed(2), y: BD_Y.toFixed(2),
      width: BD_W.toFixed(2), height: BD_H.toFixed(2), rx: '1.0',
      fill: 'url(#algDateFrame)', stroke: '#454E5C', 'stroke-width': '0.9', class: 'alg-date-frame'
    }));
    // Bright beveled inner step edge + 4 hand-chamfered diagonal miter corner lines
    bigDateG.appendChild(createSvgEl('rect', {
      x: (BD_X + 1.15).toFixed(2), y: (BD_Y + 1.15).toFixed(2),
      width: (BD_W - 2.3).toFixed(2), height: (BD_H - 2.3).toFixed(2), rx: '0.5',
      fill: 'none', stroke: 'rgba(255,255,255,0.86)', 'stroke-width': '0.68'
    }));

    const winY = BD_Y + 2.85;
    const winH = BD_H - 5.7;
    const leftWinX = BD_X + 2.85;
    const divW = 2.0;
    const winW = (BD_W - 5.7 - divW) / 2; // 18.80px each!
    const rightWinX = leftWinX + winW + divW;

    const clipDateLeft = createSvgEl('clipPath', { id: 'algClipDateLeft' });
    clipDateLeft.appendChild(createSvgEl('rect', {
      x: leftWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: winH.toFixed(2)
    }));
    defs.appendChild(clipDateLeft);

    const clipDateRight = createSvgEl('clipPath', { id: 'algClipDateRight' });
    clipDateRight.appendChild(createSvgEl('rect', {
      x: rightWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: winH.toFixed(2)
    }));
    defs.appendChild(clipDateRight);

    // 4 crisp diagonal bevel miter seams connecting outer frame to inner aperture corners
    [
      [BD_X, BD_Y, leftWinX, winY],
      [BD_X + BD_W, BD_Y, rightWinX + winW, winY],
      [BD_X, BD_Y + BD_H, leftWinX, winY + winH],
      [BD_X + BD_W, BD_Y + BD_H, rightWinX + winW, winY + winH]
    ].forEach(function (c) {
      bigDateG.appendChild(createSvgEl('line', {
        x1: c[0].toFixed(2), y1: c[1].toFixed(2), x2: c[2].toFixed(2), y2: c[3].toFixed(2),
        stroke: 'rgba(54,62,74,0.35)', 'stroke-width': '0.55', 'pointer-events': 'none'
      }));
    });

    // Left Tens Window (upper plane: 0.15mm higher -> brighter porcelain white, shallower lip shadow)
    bigDateG.appendChild(createSvgEl('rect', {
      x: leftWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: winH.toFixed(2),
      fill: 'url(#algDateTensWell)', stroke: '#4A5260', 'stroke-width': '0.65', class: 'alg-date-well'
    }));
    // Right Units Window (0.15mm lower stepped plane -> subtly cooler tone + deeper bevel/divider shadow)
    bigDateG.appendChild(createSvgEl('rect', {
      x: rightWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: winH.toFixed(2),
      fill: 'url(#algDateUnitsWell)', stroke: '#3F4755', 'stroke-width': '0.70', class: 'alg-date-well'
    }));

    const bigDateTensEl = createSvgEl('text', {
      id: 'algBigDateTens',
      x: (leftWinX + winW / 2).toFixed(2),
      y: (winY + winH / 2 + 0.2).toFixed(2),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'clip-path': 'url(#algClipDateLeft)',
      class: 'alg-date-num'
    });
    bigDateTensEl.textContent = '2';
    bigDateG.appendChild(bigDateTensEl);

    const bigDateUnitsEl = createSvgEl('text', {
      id: 'algBigDateUnits',
      x: (rightWinX + winW / 2).toFixed(2),
      y: (winY + winH / 2 + 0.4).toFixed(2),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'clip-path': 'url(#algClipDateRight)',
      class: 'alg-date-num'
    });
    bigDateUnitsEl.textContent = '5';
    bigDateG.appendChild(bigDateUnitsEl);

    // Dual-plane physical step shadows (shallow on left tens disc, deeper + vertical divider cast on right units disc!)
    bigDateG.appendChild(createSvgEl('rect', {
      x: leftWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: '5.0',
      fill: 'url(#algDateLipShallow)', 'pointer-events': 'none'
    }));
    bigDateG.appendChild(createSvgEl('rect', {
      x: rightWinX.toFixed(2), y: winY.toFixed(2), width: winW.toFixed(2), height: '7.2',
      fill: 'url(#algDateLipDeep)', 'pointer-events': 'none'
    }));
    bigDateG.appendChild(createSvgEl('rect', {
      x: rightWinX.toFixed(2), y: winY.toFixed(2), width: '2.8', height: winH.toFixed(2),
      fill: 'url(#algDateStepSide)', 'pointer-events': 'none'
    }));

    // Center vertical polished platinum divider bar between Tens and Units discs
    bigDateG.appendChild(createSvgEl('rect', {
      x: (leftWinX + winW).toFixed(2), y: (winY - 0.6).toFixed(2),
      width: divW.toFixed(2), height: (winH + 1.2).toFixed(2),
      fill: 'url(#algDateFrame)', stroke: '#4E5765', 'stroke-width': '0.45'
    }));
    bigDateG.appendChild(createSvgEl('line', {
      x1: (leftWinX + winW + 0.65).toFixed(2), y1: winY.toFixed(2),
      x2: (leftWinX + winW + 0.65).toFixed(2), y2: (winY + winH).toFixed(2),
      stroke: 'rgba(255,255,255,0.90)', 'stroke-width': '0.48'
    }));

    dialInner.appendChild(bigDateG);

    // =========================================================================
    // LAYER (6): Right-Side AUF / AB Power Reserve Sector (PX=185.0, PY=150.0)
    //            Balances Outsize Date above & Moon Phase below along right flank!
    // =========================================================================
    const prG = createSvgEl('g', { class: 'alg-power-reserve' });

    const aufTxt = createSvgEl('text', { class: 'alg-aufab-txt' });
    const aufPath = createSvgEl('textPath', { href: '#algAufPath', startOffset: '50%', 'text-anchor': 'middle' });
    aufPath.setAttributeNS(XLINK_NS, 'xlink:href', '#algAufPath');
    aufPath.textContent = 'AUF';
    aufTxt.appendChild(aufPath);
    prG.appendChild(aufTxt);

    const abTxt = createSvgEl('text', { class: 'alg-aufab-txt' });
    const abPath = createSvgEl('textPath', { href: '#algAbPath', startOffset: '50%', 'text-anchor': 'middle' });
    abPath.setAttributeNS(XLINK_NS, 'xlink:href', '#algAbPath');
    abPath.textContent = 'AB';
    abTxt.appendChild(abPath);
    prG.appendChild(abTxt);

    // 5 Delicate Hollow Triangular Wedges curving along right perimeter, each aiming cleanly toward pivot (PX, PY)!
    const wedgeAngles = [62, 72.5, 83, 93.5, 103.5];
    wedgeAngles.forEach(function (deg) {
      const centerPt = polar(CX, CY, 103.4, deg);
      const vx = PX - centerPt.x;
      const vy = PY - centerPt.y;
      const vLen = Math.hypot(vx, vy) || 1;
      const ux = vx / vLen, uy = vy / vLen; // unit vector pointing directly toward pivot (PX, PY)
      const tx = -uy, ty = ux;              // perpendicular tangent vector
      const tipX = centerPt.x + ux * 2.8;
      const tipY = centerPt.y + uy * 2.8;
      const baseX = centerPt.x - ux * 2.6;
      const baseY = centerPt.y - uy * 2.6;
      const b1x = baseX + tx * 2.4, b1y = baseY + ty * 2.4;
      const b2x = baseX - tx * 2.4, b2y = baseY - ty * 2.4;

      prG.appendChild(createSvgEl('polygon', {
        points: tipX.toFixed(2) + ',' + tipY.toFixed(2) + ' ' +
                b1x.toFixed(2) + ',' + b1y.toFixed(2) + ' ' +
                b2x.toFixed(2) + ',' + b2y.toFixed(2),
        fill: 'none',
        stroke: '#191F28',
        'stroke-width': '0.94',
        'stroke-linejoin': 'miter',
        class: 'alg-pr-wedge'
      }));
    });

    // Slim 3D Faceted Rhodium Power Reserve Lancet Needle (pivoted at PX=185.0, PY=150.0, length=55.5)
    const prHandEl = createSvgEl('g', { id: 'algPowerHand', transform: 'rotate(-17 ' + PX + ' ' + PY + ')' });
    prHandEl.appendChild(createSvgEl('polygon', {
      points: (PX - 4.2) + ',' + PY + ' ' + (PX + 9.5) + ',' + (PY - 2.35) + ' ' + (PX + 55.5) + ',' + PY + ' ' + (PX + 9.5) + ',' + (PY + 2.35),
      fill: 'rgba(16,22,32,0.22)', transform: 'translate(0.95, 1.65)'
    }));
    prHandEl.appendChild(createSvgEl('polygon', {
      points: (PX - 3.6) + ',' + PY + ' ' + (PX + 9.0) + ',' + (PY - 2.25) + ' ' + (PX + 55.2) + ',' + PY,
      fill: 'url(#algFacetLight)', stroke: '#454E5C', 'stroke-width': '0.35', class: 'alg-hand-light'
    }));
    prHandEl.appendChild(createSvgEl('polygon', {
      points: (PX - 3.6) + ',' + PY + ' ' + (PX + 55.2) + ',' + PY + ' ' + (PX + 9.0) + ',' + (PY + 2.25),
      fill: 'url(#algFacetDark)', stroke: '#363E4B', 'stroke-width': '0.35', class: 'alg-hand-dark'
    }));
    prG.appendChild(prHandEl);

    // Polished circular pivot boss for AUF/AB needle
    prG.appendChild(createSvgEl('circle', {
      cx: PX + 0.4, cy: PY + 0.7, r: '3.9', fill: 'rgba(16,22,32,0.18)', 'pointer-events': 'none'
    }));
    prG.appendChild(createSvgEl('circle', {
      cx: PX, cy: PY, r: '3.8', fill: 'url(#algHubCap)', stroke: '#454E5B', 'stroke-width': '0.78'
    }));
    prG.appendChild(createSvgEl('circle', {
      cx: PX, cy: PY, r: '1.5', fill: '#454E5B', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.35'
    }));

    dialInner.appendChild(prG);

    // =========================================================================
    // LAYER (7): Lower-Right Moon Phase & Small Seconds Subdial
    //            Centered on Isosceles Apex S(189.5, 199.5), r = 34.0
    // =========================================================================
    const secSubG = createSvgEl('g', { class: 'alg-sec-subdial' });

    secSubG.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY, r: R_SEC.toFixed(1),
      fill: 'url(#algSecDish)', stroke: 'rgba(40,48,60,0.42)', 'stroke-width': '0.92', class: 'alg-sec-dish'
    }));
    secSubG.appendChild(createSvgEl('path', {
      d: describeArc(SX, SY, R_SEC - 0.55, 130, 310, true),
      fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.75'
    }));

    // Fine concentric guilloché azurage rings inside lower silver half
    for (let r = 8.0; r <= 24.5; r += 3.0) {
      secSubG.appendChild(createSvgEl('circle', {
        cx: SX, cy: SY, r: r.toFixed(1), fill: 'none',
        stroke: 'rgba(66,76,90,0.12)', 'stroke-width': '0.45'
      }));
    }

    // 60-Second Precision Perimeter Track (r=28.4..32.7)
    for (let s = 0; s < 60; s++) {
      const deg = s * 6;
      const isTen = s % 10 === 0;
      const isFive = s % 5 === 0;
      const rIn = isTen ? 27.6 : (isFive ? 28.5 : 29.5);
      const rOut = 32.7;
      const p1 = polar(SX, SY, rIn, deg);
      const p2 = polar(SX, SY, rOut, deg);
      secSubG.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(2), y1: p1.y.toFixed(2),
        x2: p2.x.toFixed(2), y2: p2.y.toFixed(2),
        stroke: '#181E27',
        'stroke-width': isTen ? '1.14' : (isFive ? '0.90' : '0.58'),
        class: 'alg-sec-tick'
      }));
    }

    // Lower-arc Small Seconds Numerals: 20, 30, 40
    [
      { val: '20', deg: 120, rot: -60 },
      { val: '30', deg: 180, rot: 0 },
      { val: '40', deg: 240, rot: 60 }
    ].forEach(function (item) {
      const pt = polar(SX, SY, 22.8, item.deg);
      const t = createSvgEl('text', {
        x: pt.x.toFixed(1),
        y: pt.y.toFixed(1),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        transform: 'rotate(' + item.rot + ' ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')',
        class: 'alg-sec-num'
      });
      t.textContent = item.val;
      secSubG.appendChild(t);
    });

    // Celestial Moon Phase Disc clipped cleanly inside upper arched cloud aperture
    const moonClipG = createSvgEl('g', { 'clip-path': 'url(#algMoonApertureClip)' });
    const moonPivotY = SY + 9.0;
    const moonDiscEl = createSvgEl('g', { id: 'algMoonDisc', transform: 'rotate(0 ' + SX + ' ' + moonPivotY + ')' });

    moonDiscEl.appendChild(createSvgEl('circle', {
      cx: SX, cy: moonPivotY, r: '37.0', fill: 'url(#algMoonSky)', class: 'alg-moon-sky'
    }));

    const bigStars = [
      { dx: -15.2, dy: -21.8, r: 2.1, rot: 12 },
      { dx: -4.0,  dy: -25.4, r: 2.35, rot: -8 },
      { dx: 7.5,   dy: -23.8, r: 2.25, rot: 18 },
      { dx: 16.5,  dy: -17.5, r: 2.0, rot: -15 },
      { dx: 1.5,   dy: -16.0, r: 2.45, rot: 5 },
      { dx: 11.4,  dy: -11.4, r: 1.9, rot: 22 },
      { dx: -12.0, dy: 16.0, r: 2.1, rot: 10 },
      { dx: 2.0,   dy: 22.0, r: 2.3, rot: -12 },
      { dx: 14.5,  dy: 14.5, r: 2.0, rot: 20 }
    ];
    bigStars.forEach(function (st) {
      moonDiscEl.appendChild(createSvgEl('polygon', {
        points: starPoints(SX + st.dx, moonPivotY + st.dy, st.r, st.r * 0.42, st.rot),
        fill: '#F5F8FE', class: 'alg-moon-star'
      }));
    });
    const microStars = [
      [-10.2, -18.0], [-0.8, -20.6], [13.2, -21.0], [19.8, -11.8],
      [-19.5, -13.5], [5.8, -10.5], [-7.5, -28.0], [10.0, -28.2],
      [-6.0, 21.0], [8.5, 19.5]
    ];
    microStars.forEach(function (ms) {
      moonDiscEl.appendChild(createSvgEl('circle', {
        cx: (SX + ms[0]).toFixed(1), cy: (moonPivotY + ms[1]).toFixed(1), r: '0.72',
        fill: 'rgba(244, 248, 255, 0.88)', class: 'alg-moon-star'
      }));
    });

    const moonOrbs = [
      { dx: -12.4, dy: -14.4 },
      { dx: 12.4,  dy: 14.4 }
    ];
    moonOrbs.forEach(function (orb) {
      moonDiscEl.appendChild(createSvgEl('circle', {
        cx: (SX + orb.dx).toFixed(1), cy: (moonPivotY + orb.dy).toFixed(1), r: '9.8',
        fill: 'url(#algMoonOrb)', stroke: 'rgba(255,255,255,0.90)', 'stroke-width': '0.60', class: 'alg-moon-orb'
      }));
      moonDiscEl.appendChild(createSvgEl('circle', {
        cx: (SX + orb.dx - 1.6).toFixed(1), cy: (moonPivotY + orb.dy - 1.8).toFixed(1), r: '6.8',
        fill: 'rgba(255,255,255,0.24)'
      }));
    });

    moonClipG.appendChild(moonDiscEl);
    // Recessed optical depth shadow cast by the silver dial plate onto the celestial sky disc
    moonClipG.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY + 0.5, r: '27.0', fill: 'url(#algMoonInnerShadow)', 'pointer-events': 'none'
    }));
    secSubG.appendChild(moonClipG);

    // Sculpted double-beveled silver rim outlining the moon aperture & double-hump cloud ridge
    secSubG.appendChild(createSvgEl('path', {
      d: moonApertureD,
      fill: 'none', stroke: '#424C5C', 'stroke-width': '1.05', class: 'alg-moon-rim'
    }));
    secSubG.appendChild(createSvgEl('path', {
      d: 'M ' + (SX - 26.4).toFixed(2) + ',' + (SY + 1.3).toFixed(2) +
         ' A 14.3,14.3 0 0,1 ' + SX.toFixed(2) + ',' + (SY + 4.05).toFixed(2) +
         ' A 14.3,14.3 0 0,1 ' + (SX + 26.4).toFixed(2) + ',' + (SY + 1.3).toFixed(2),
      fill: 'none', stroke: 'rgba(255,255,255,0.88)', 'stroke-width': '0.82'
    }));

    // Slim Tapered Faceted Rhodium Small-Seconds Needle (pivoted at SX, SY)
    const secHandEl = createSvgEl('g', { id: 'algSecHand', transform: 'rotate(202 ' + SX + ' ' + SY + ')' });
    secHandEl.appendChild(createSvgEl('polygon', {
      points: (SX - 0.85) + ',' + (SY + 7.5) + ' ' + (SX + 0.85) + ',' + (SY + 7.5) + ' ' + (SX + 0.35) + ',' + (SY - 29.4) + ' ' + (SX - 0.35) + ',' + (SY - 29.4),
      fill: 'rgba(15,20,30,0.24)', transform: 'translate(0.7, 1.3)'
    }));
    secHandEl.appendChild(createSvgEl('polygon', {
      points: (SX - 1.05) + ',' + (SY + 7.4) + ' ' + SX + ',' + (SY + 7.4) + ' ' + SX + ',' + (SY - 29.6) + ' ' + (SX - 0.45) + ',' + (SY - 29.6),
      fill: 'url(#algFacetLight)', stroke: '#4A5362', 'stroke-width': '0.26', class: 'alg-hand-light'
    }));
    secHandEl.appendChild(createSvgEl('polygon', {
      points: SX + ',' + (SY + 7.4) + ' ' + (SX + 1.05) + ',' + (SY + 7.4) + ' ' + (SX + 0.45) + ',' + (SY - 29.6) + ' ' + SX + ',' + (SY - 29.6),
      fill: 'url(#algFacetDark)', stroke: '#38404D', 'stroke-width': '0.26', class: 'alg-hand-dark'
    }));
    secSubG.appendChild(secHandEl);

    secSubG.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY, r: '2.85', fill: 'url(#algHubCap)', stroke: '#464F5D', 'stroke-width': '0.65'
    }));
    secSubG.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY, r: '1.08', fill: '#47505E'
    }));

    dialInner.appendChild(secSubG);

    // =========================================================================
    // LAYER (8): Sculpted 3D Faceted Rhodium Alpha/Lancet Hour & Minute Hands
    //            (Pivoted at Off-Center Main Subdial M(103.5, 150.0)!)
    // =========================================================================
    const hourHandEl = createSvgEl('g', { id: 'algHourHand', transform: 'rotate(52 ' + MX + ' ' + MY + ')' });
    const hPathAll = [
      'M ' + (MX - 1.55) + ',' + (MY + 7.6),
      'L ' + (MX - 4.1) + ',' + (MY - 10.6),
      'L ' + MX + ',' + (MY - 38.6),
      'L ' + (MX + 4.1) + ',' + (MY - 10.6),
      'L ' + (MX + 1.55) + ',' + (MY + 7.6),
      'Z'
    ].join(' ');
    hourHandEl.appendChild(createSvgEl('path', {
      d: hPathAll, fill: 'rgba(15,21,32,0.24)', transform: 'translate(1.25, 2.05)'
    }));
    hourHandEl.appendChild(createSvgEl('path', {
      d: 'M ' + (MX - 1.55) + ',' + (MY + 7.6) + ' L ' + (MX - 4.1) + ',' + (MY - 10.6) + ' L ' + MX + ',' + (MY - 38.6) + ' L ' + MX + ',' + (MY + 7.6) + ' Z',
      fill: 'url(#algFacetLight)', stroke: '#464F5E', 'stroke-width': '0.44', 'stroke-linejoin': 'miter', class: 'alg-hand-light'
    }));
    hourHandEl.appendChild(createSvgEl('path', {
      d: 'M ' + MX + ',' + (MY + 7.6) + ' L ' + MX + ',' + (MY - 38.6) + ' L ' + (MX + 4.1) + ',' + (MY - 10.6) + ' L ' + (MX + 1.55) + ',' + (MY + 7.6) + ' Z',
      fill: 'url(#algFacetDark)', stroke: '#363E4B', 'stroke-width': '0.44', 'stroke-linejoin': 'miter', class: 'alg-hand-dark'
    }));
    hourHandEl.appendChild(createSvgEl('polygon', {
      points: (MX - 1.45) + ',' + (MY - 11.2) + ' ' + MX + ',' + (MY - 30.4) + ' ' + (MX + 1.45) + ',' + (MY - 11.2) + ' ' + MX + ',' + (MY - 8.0),
      fill: '#FAFBF7', stroke: 'rgba(58,68,84,0.38)', 'stroke-width': '0.30', class: 'alg-hand-lume'
    }));
    dialInner.appendChild(hourHandEl);

    const minHandEl = createSvgEl('g', { id: 'algMinHand', transform: 'rotate(312 ' + MX + ' ' + MY + ')' });
    const mPathAll = [
      'M ' + (MX - 1.35) + ',' + (MY + 9.2),
      'L ' + (MX - 3.35) + ',' + (MY - 13.2),
      'L ' + MX + ',' + (MY - 58.2),
      'L ' + (MX + 3.35) + ',' + (MY - 13.2),
      'L ' + (MX + 1.35) + ',' + (MY + 9.2),
      'Z'
    ].join(' ');
    minHandEl.appendChild(createSvgEl('path', {
      d: mPathAll, fill: 'rgba(15,21,32,0.24)', transform: 'translate(1.35, 2.25)'
    }));
    minHandEl.appendChild(createSvgEl('path', {
      d: 'M ' + (MX - 1.35) + ',' + (MY + 9.2) + ' L ' + (MX - 3.35) + ',' + (MY - 13.2) + ' L ' + MX + ',' + (MY - 58.2) + ' L ' + MX + ',' + (MY + 9.2) + ' Z',
      fill: 'url(#algFacetLight)', stroke: '#464F5E', 'stroke-width': '0.42', 'stroke-linejoin': 'miter', class: 'alg-hand-light'
    }));
    minHandEl.appendChild(createSvgEl('path', {
      d: 'M ' + MX + ',' + (MY + 9.2) + ' L ' + MX + ',' + (MY - 58.2) + ' L ' + (MX + 3.35) + ',' + (MY - 13.2) + ' L ' + (MX + 1.35) + ',' + (MY + 9.2) + ' Z',
      fill: 'url(#algFacetDark)', stroke: '#363E4B', 'stroke-width': '0.42', 'stroke-linejoin': 'miter', class: 'alg-hand-dark'
    }));
    minHandEl.appendChild(createSvgEl('polygon', {
      points: (MX - 1.1) + ',' + (MY - 14.0) + ' ' + MX + ',' + (MY - 45.2) + ' ' + (MX + 1.1) + ',' + (MY - 14.0) + ' ' + MX + ',' + (MY - 10.6),
      fill: '#FAFBF7', stroke: 'rgba(58,68,84,0.38)', 'stroke-width': '0.28', class: 'alg-hand-lume'
    }));
    dialInner.appendChild(minHandEl);

    // Sculpted multi-tier domed rhodium center hub cap
    dialInner.appendChild(createSvgEl('circle', {
      cx: MX + 0.65, cy: MY + 1.05, r: '5.55', fill: 'rgba(16,22,32,0.24)', 'pointer-events': 'none'
    }));
    dialInner.appendChild(createSvgEl('circle', {
      cx: MX, cy: MY, r: '5.45', fill: 'url(#algHubCap)', stroke: '#434C59', 'stroke-width': '0.88'
    }));
    dialInner.appendChild(createSvgEl('circle', {
      cx: MX, cy: MY, r: '3.05', fill: '#D7DEE7', stroke: '#525B68', 'stroke-width': '0.58'
    }));
    dialInner.appendChild(createSvgEl('circle', {
      cx: MX, cy: MY, r: '1.25', fill: '#4E5765'
    }));

    // =========================================================================
    // LAYER (9): AR-Coated Domed Sapphire Crystal Specular Glint
    // =========================================================================
    dialInner.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.5', fill: 'url(#algGlassAR)', 'pointer-events': 'none'
    }));
    dialInner.appendChild(createSvgEl('path', {
      d: 'M 60,82 Q 114,44 190,50 Q 130,68 74,114 Z',
      fill: 'rgba(255,255,255,0.11)', 'pointer-events': 'none'
    }));
    dialClickableEl.appendChild(dialInner);

    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '119.5', fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '1.25', 'pointer-events': 'none'
    }));
    svg.appendChild(dialClickableEl);

    return {
      svg: svg,
      crownEl: crownBuilt.crownEl,
      crownSlideEl: crownBuilt.crownSlideEl,
      crownKnurlsEl: crownBuilt.crownKnurlsEl,
      dialClickableEl: dialClickableEl,
      visualAlarmRingEl: visualAlarmRingEl,
      hourHandEl: hourHandEl,
      minHandEl: minHandEl,
      secHandEl: secHandEl,
      prHandEl: prHandEl,
      moonDiscEl: moonDiscEl,
      moonPivotY: moonPivotY,
      bigDateTensEl: bigDateTensEl,
      bigDateUnitsEl: bigDateUnitsEl
    };
  }

  function mount(containerEl, handlers) {
    if (!containerEl) return null;
    const cb = handlers || {};
    containerEl.textContent = '';

    const parts = buildAlgebraSvg();
    containerEl.appendChild(parts.svg);

    const crownOverlayEl = document.createElement('div');
    crownOverlayEl.id = 'no5CrownTouchOverlay';
    crownOverlayEl.className = 'crown-touch-overlay is-crown-3h';
    crownOverlayEl.setAttribute('tabindex', '0');
    crownOverlayEl.setAttribute('role', 'slider');
    crownOverlayEl.setAttribute('aria-label', '3시 용두 (0단 잠금) — 1회 클릭 1단(±1분), 2회 클릭 2단(±5분)');
    containerEl.appendChild(crownOverlayEl);

    let crownPosition = 0;
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let downClientX = 0, downClientY = 0, lastClientX = 0, lastClientY = 0;
    let dragAccum = 0, gestureStepsEmitted = 0, lockedHintEmitted = false;
    let turnTimerId = null;
    let lastBigDateStr = '';

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
      dragAccum += -dy;
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
      const tHours = Number(snapshot.tHours) || 0;
      const hrDeg = (tHours % 12) * 30;
      const minDeg = (tHours - Math.floor(tHours)) * 360;
      const secSweep = Number(snapshot.secondsSweep) || 0;

      parts.hourHandEl.setAttribute('transform', 'rotate(' + hrDeg.toFixed(2) + ' ' + MX + ' ' + MY + ')');
      parts.minHandEl.setAttribute('transform', 'rotate(' + minDeg.toFixed(2) + ' ' + MX + ' ' + MY + ')');
      parts.secHandEl.setAttribute('transform', 'rotate(' + (secSweep * 6).toFixed(2) + ' ' + SX + ' ' + SY + ')');

      // Right-side AUF / AB Power Reserve needle (-24° at AUF full -> +23° at AB empty)
      let prRatio = 0.84;
      if (snapshot.isCountdown) {
        prRatio = Math.max(0, Math.min(1, Number(snapshot.remainingRatio) || 0));
      } else if (snapshot.mode === 'stopwatch') {
        prRatio = Math.max(0, Math.min(1, ((Number(snapshot.elapsedMs) || 0) / 3600000)));
      }
      const prDeg = 23 - prRatio * 47;
      parts.prHandEl.setAttribute('transform', 'rotate(' + prDeg.toFixed(2) + ' ' + PX + ' ' + PY + ')');

      let dateNum;
      if (snapshot.isCountdown) {
        dateNum = Math.min(99, Math.max(0, Math.ceil((Number(snapshot.remainingMs) || 0) / 60000)));
      } else if (snapshot.mode === 'stopwatch') {
        dateNum = Math.min(99, Math.max(0, Math.floor((Number(snapshot.elapsedMs) || 0) / 60000)));
      } else {
        dateNum = new Date().getDate();
      }
      const dateStr = String(dateNum).padStart(2, '0');
      if (dateStr !== lastBigDateStr) {
        lastBigDateStr = dateStr;
        parts.bigDateTensEl.textContent = (!snapshot.isCountdown && snapshot.mode !== 'stopwatch' && dateNum < 10)
          ? ''
          : dateStr[0];
        parts.bigDateUnitsEl.textContent = dateStr[1];
      }

      let moonDeg = 0;
      if (snapshot.isCountdown) {
        moonDeg = (1 - prRatio) * 32;
      } else if (snapshot.mode === 'demo') {
        moonDeg = (tHours * 15) % 360;
      } else {
        const nowH = new Date().getHours() + new Date().getMinutes() / 60;
        moonDeg = ((nowH - 12) / 24) * 36;
      }
      parts.moonDiscEl.setAttribute('transform', 'rotate(' + moonDeg.toFixed(2) + ' ' + SX + ' ' + parts.moonPivotY + ')');

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

  global.AlgebraWatchEngine = {
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
