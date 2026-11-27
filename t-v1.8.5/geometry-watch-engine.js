/**
 * CASPER™ V1 — NO.7 GEOMETRY Caliber SVG Engine (geometry-watch-engine.js)
 * Forensic Tribute to NOMOS Glashütte Tangente Gangreserve (Power Reserve):
 *   - Slim parallel-walled mirror-polished 316L Tangente straight lugs
 *   - Double-stepped mirror-polished stainless steel bezel with high-contrast chrome reflections
 *   - Finely fluted 3 o'clock cylindrical steel crown (0단 잠금 · 1단 ±1분 · 2단 ±5분)
 *   - Warm galvanized silver-white matte dial with soft outer rehaut depth & fine grain
 *   - Custom razor-slim condensed Bauhaus vector numerals (12, 2, 4, 8, 10) radially oriented
 *     alternating with long hairline black baton indices (1, 3, 5, 7, 9, 11)
 *   - Iconic 1 o'clock recessed circular Gangreserve (Power Reserve) aperture with live
 *     crimson-red crescent arc tracking study timer reserve (and classic crescent in Desk Clock)
 *   - Asymmetric 9:30 wide-tracked Bauhaus brand signature ("CASPER / V1 · NO.7")
 *     + micro curved 6 o'clock perimeter legend ("NO.7 GEOMETRY")
 *   - Sunken concentric-lathe 6 o'clock small-seconds subdial with 12 hairline ticks
 *   - Tapered thermally flame-blued cobalt steel hands with prominent circular blued center hub
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const CX = 150;
  const CY = 150;

  // 1 o'clock recessed Gangreserve (Power Reserve) aperture geometry
  const PRX = 161.0;
  const PRY = 104.5;
  const PR_R = 15.8;

  // 6 o'clock sunken Small Seconds subdial geometry
  const SSX = 150.0;
  const SSY = 197.5;
  const SS_R = 27.5;

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, String(attrs[k]));
      });
    }
    return el;
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startDeg, endDeg, ccw) {
    const span = Math.min(359.5, Math.abs(endDeg - startDeg));
    const end = startDeg + (endDeg >= startDeg ? span : -span);
    const s = polar(cx, cy, r, startDeg);
    const e = polar(cx, cy, r, end);
    const largeArc = span > 180 ? 1 : 0;
    const sweep = ccw ? 0 : (endDeg >= startDeg ? 1 : 0);
    return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) +
      ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArc + ' ' + sweep + ' ' +
      e.x.toFixed(2) + ' ' + e.y.toFixed(2);
  }

  function describeAnnularSector(cx, cy, rIn, rOut, startDeg, endDeg) {
    const span = Math.max(0, Math.min(359.2, endDeg - startDeg));
    if (span < 0.5) return '';
    const p1 = polar(cx, cy, rOut, startDeg);
    const p2 = polar(cx, cy, rOut, startDeg + span);
    const p3 = polar(cx, cy, rIn, startDeg + span);
    const p4 = polar(cx, cy, rIn, startDeg);
    const largeArc = span > 180 ? 1 : 0;
    return 'M ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2) +
      ' A ' + rOut.toFixed(2) + ' ' + rOut.toFixed(2) + ' 0 ' + largeArc + ' 1 ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2) +
      ' L ' + p3.x.toFixed(2) + ' ' + p3.y.toFixed(2) +
      ' A ' + rIn.toFixed(2) + ' ' + rIn.toFixed(2) + ' 0 ' + largeArc + ' 0 ' + p4.x.toFixed(2) + ' ' + p4.y.toFixed(2) +
      ' Z';
  }

  /**
   * Appends authentic ultra-condensed geometric NOMOS Tangente Bauhaus vector numerals
   * (12, 2, 4, 8, 10) rotated radially outward from center to match reference macro.
   */
  function appendBauhausNumeral(parent, numStr, cx, cy, rotDeg) {
    const g = createSvgEl('g', {
      transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ') rotate(' + rotDeg + ')',
      class: 'geo-bauhaus-glyph'
    });

    const strokeAttrs = {
      fill: 'none',
      stroke: '#13171D',
      'stroke-width': '1.62',
      'stroke-linecap': 'butt',
      'stroke-linejoin': 'miter',
      class: 'geo-bauhaus-stroke'
    };

    function addPath(d, tx) {
      const attrs = Object.assign({}, strokeAttrs, { d: d });
      if (tx) attrs.transform = tx;
      g.appendChild(createSvgEl('path', attrs));
    }

    if (numStr === '12') {
      // Narrow tall Bauhaus "1" (tiny angled upper spur + flat hairline base foot)
      addPath('M -6.4,-9.2 L -4.3,-11.0 L -4.3,11.0 M -6.2,11.0 L -2.4,11.0');
      // Slim geometric Bauhaus "2" (high arch, crisp diagonal drop, flat horizontal base)
      addPath('M -0.4,-6.8 C -0.4,-11.6 6.2,-11.6 6.2,-6.5 C 6.2,-3.3 4.1,-0.9 -0.5,10.7 L 6.7,10.7');
    } else if (numStr === '2') {
      addPath('M -4.2,-7.0 C -4.2,-12.0 4.0,-12.0 4.0,-6.6 C 4.0,-3.2 1.6,-0.6 -4.3,11.0 L 4.6,11.0');
    } else if (numStr === '4') {
      addPath('M 2.3,11.4 L 2.3,-11.0 L -5.0,4.6 L 5.0,4.6');
    } else if (numStr === '8') {
      // Pure geometric stacked Bauhaus double-oval "8" (smaller outer top loop, fuller inner base loop)
      g.appendChild(createSvgEl('ellipse', Object.assign({}, strokeAttrs, {
        cx: '0', cy: '-6.0', rx: '3.65', ry: '4.9'
      })));
      g.appendChild(createSvgEl('ellipse', Object.assign({}, strokeAttrs, {
        cx: '0', cy: '4.9', rx: '4.35', ry: '6.0'
      })));
    } else if (numStr === '10') {
      // Condensed Bauhaus "1" + stadium-pill "0"
      addPath('M -6.8,-9.2 L -4.8,-11.0 L -4.8,11.0 M -6.5,11.0 L -2.9,11.0');
      addPath('M -0.5,-6.5 A 3.85,4.5 0 0,1 7.2,-6.5 L 7.2,6.5 A 3.85,4.5 0 0,1 -0.5,6.5 Z');
    }

    parent.appendChild(g);
  }

  function buildBauhausCrown() {
    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(0 150 150)',
      filter: 'url(#geoSoftShadow)'
    });
    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '274', y: '118', width: '44', height: '64', rx: '6', fill: 'transparent'
    }));
    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '277', y: '146.2', width: '16', height: '7.6',
      fill: 'url(#geoCrownNeck)', stroke: '#2A3039', 'stroke-width': '0.75'
    }));

    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });
    // Stepped slim neck collar emerging from 3h case flank
    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '278.5', y: '141.5', width: '3.2', height: '17',
      fill: 'url(#geoCrownNeck)', stroke: '#353D48', 'stroke-width': '0.65'
    }));
    // Finely fluted cylindrical NOMOS crown body
    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '281.0', y: '134.5', width: '13.2', height: '31.0', rx: '2.0',
      class: 'crown-body', fill: 'url(#geoCrownCyl)', stroke: '#343C48', 'stroke-width': '1.0'
    }));

    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls', 'clip-path': 'url(#geoCrownClip)' });
    for (let y = 135.8; y <= 164.6; y += 2.35) {
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '281.8', y1: y.toFixed(2), x2: '292.8', y2: y.toFixed(2),
        stroke: 'rgba(22, 27, 36, 0.56)', 'stroke-width': '0.95'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '281.8', y1: (y + 0.95).toFixed(2), x2: '292.8', y2: (y + 0.95).toFixed(2),
        stroke: 'rgba(255, 255, 255, 0.84)', 'stroke-width': '0.68'
      }));
    }
    crownSlideEl.appendChild(crownKnurlsEl);
    // Subtle vertical polished bevel along right cap rim
    crownSlideEl.appendChild(createSvgEl('line', {
      x1: '292.6', y1: '135.5', x2: '292.6', y2: '164.5',
      stroke: 'rgba(255,255,255,0.82)', 'stroke-width': '0.85'
    }));
    crownEl.appendChild(crownSlideEl);
    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl };
  }

  function buildGeometrySvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-16 -16 332 332',
      width: '100%',
      height: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'no5-svg is-geometry-caliber is-tangente-gangreserve',
      role: 'img',
      'aria-label': 'NO.7 GEOMETRY — CASPER 탕겐테 강리저브 시계'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildBauhausCrown();

    // High-contrast liquid-chrome mirror-polished 316L Tangente bezel sheen
    const gCase = createSvgEl('linearGradient', { id: 'geoSteelCase', x1: '12%', y1: '4%', x2: '88%', y2: '96%' });
    [
      ['0%', '#FFFFFF'],
      ['16%', '#DCE2EB'],
      ['31%', '#697280'],
      ['46%', '#FFFFFF'],
      ['63%', '#CFD6E0'],
      ['80%', '#565E6B'],
      ['93%', '#ECEFF4'],
      ['100%', '#A2ABB8']
    ].forEach(function (s) {
      gCase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCase);

    // Mirror-polished inner bezel step ring gradient (contrasting phase for authentic double-step rim!)
    const gBezelStep = createSvgEl('linearGradient', { id: 'geoBezelStep', x1: '84%', y1: '8%', x2: '16%', y2: '92%' });
    [
      ['0%', '#424A56'],
      ['22%', '#F6F8FB'],
      ['44%', '#8B94A2'],
      ['66%', '#FFFFFF'],
      ['85%', '#5C6472'],
      ['100%', '#E4E9F0']
    ].forEach(function (s) {
      gBezelStep.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBezelStep);

    // Mirror-polished parallel Tangente lug vertical chrome sheen
    const gLugChrome = createSvgEl('linearGradient', { id: 'geoLugChrome', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [
      ['0%', '#474F5C'],
      ['26%', '#F8FAFC'],
      ['52%', '#FFFFFF'],
      ['76%', '#9AA3B1'],
      ['100%', '#363D48']
    ].forEach(function (s) {
      gLugChrome.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gLugChrome);

    const gCrownCyl = createSvgEl('linearGradient', { id: 'geoCrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#3A424E'], ['18%', '#DDE3EC'], ['38%', '#FFFFFF'], ['64%', '#B4BDCB'], ['86%', '#646D7A'], ['100%', '#2C323C']].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownCyl);

    const gCrownNeck = createSvgEl('linearGradient', { id: 'geoCrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#2A2F37'], ['34%', '#89929E'], ['68%', '#505864'], ['100%', '#232830']].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    // Warm galvanized silver-white plated matte dial (iconic NOMOS Glashütte ivory-silver tone!)
    const gDial = createSvgEl('radialGradient', { id: 'geoSilverDial', cx: '46%', cy: '38%', r: '72%' });
    [['0%', '#FDFCF9'], ['58%', '#F6F5F0'], ['88%', '#ECEBE5'], ['100%', '#DFDDD5']].forEach(function (s) {
      gDial.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDial);

    const pGrain = createSvgEl('pattern', { id: 'geoSilverGrain', width: '4', height: '4', patternUnits: 'userSpaceOnUse' });
    pGrain.appendChild(createSvgEl('circle', { cx: '1', cy: '1', r: '0.42', fill: 'rgba(130,136,142,0.09)' }));
    pGrain.appendChild(createSvgEl('circle', { cx: '3', cy: '3', r: '0.38', fill: 'rgba(255,255,255,0.32)' }));
    defs.appendChild(pGrain);

    const gDialAO = createSvgEl('radialGradient', { id: 'geoDialAO', cx: '50%', cy: '50%', r: '50%' });
    [['0%', 'rgba(15,23,42,0)'], ['90%', 'rgba(15,23,42,0)'], ['96%', 'rgba(15,23,42,0.06)'], ['100%', 'rgba(15,23,42,0.22)']].forEach(function (s) {
      gDialAO.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gDialAO);

    // Recessed Gangreserve aperture dish, smooth circular bevel & crimson-red reserve gradients
    const gPRWell = createSvgEl('radialGradient', { id: 'geoPRWell', cx: '58%', cy: '60%', r: '62%' });
    [['0%', '#F8F7F2'], ['72%', '#F0EFE9'], ['100%', '#E2E0D8']].forEach(function (s) {
      gPRWell.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPRWell);

    const gPRDishShadow = createSvgEl('radialGradient', { id: 'geoPRDishShadow', cx: '62%', cy: '64%', r: '64%' });
    [['0%', 'rgba(18, 22, 30, 0)'], ['66%', 'rgba(18, 22, 30, 0)'], ['86%', 'rgba(18, 22, 30, 0.08)'], ['100%', 'rgba(18, 22, 30, 0.24)']].forEach(function (s) {
      gPRDishShadow.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPRDishShadow);

    const gPRRimBevel = createSvgEl('linearGradient', { id: 'geoPRRimBevel', x1: '14%', y1: '14%', x2: '86%', y2: '86%' });
    [['0%', 'rgba(110, 114, 120, 0.42)'], ['45%', 'rgba(185, 184, 178, 0.28)'], ['75%', 'rgba(255, 255, 255, 0.88)'], ['100%', 'rgba(255, 255, 255, 0.98)']].forEach(function (s) {
      gPRRimBevel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPRRimBevel);

    const gPRRed = createSvgEl('linearGradient', { id: 'geoPRRed', gradientUnits: 'userSpaceOnUse', x1: '150', y1: '92', x2: '174', y2: '118' });
    [['0%', '#A2162A'], ['28%', '#D82740'], ['72%', '#E4384E'], ['100%', '#C81E36']].forEach(function (s) {
      gPRRed.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPRRed);

    // Sunken 6 o'clock Small Seconds dish gradient
    const gSub = createSvgEl('radialGradient', { id: 'geoSubDial', cx: '56%', cy: '58%', r: '60%' });
    [['0%', '#F5F4EF'], ['72%', '#EAE9E2'], ['100%', '#D8D6CE']].forEach(function (s) {
      gSub.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSub);

    // 290°C Flame-Tempered Cobalt-Cerulean Heat-Blued Steel hands (userSpaceOnUse prevents 0-width bug!)
    const gBlued = createSvgEl('linearGradient', { id: 'geoBluedHand', gradientUnits: 'userSpaceOnUse', x1: '95', y1: '45', x2: '205', y2: '215' });
    [
      ['0%', '#06264B'],
      ['30%', '#0E5598'],
      ['54%', '#1D80C9'],
      ['76%', '#0C4782'],
      ['100%', '#051E3C']
    ].forEach(function (s) {
      gBlued.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBlued);

    // Prominent circular flame-blued steel center boss gradient
    const gBluedHub = createSvgEl('radialGradient', { id: 'geoBluedHub', cx: '36%', cy: '32%', r: '70%' });
    [['0%', '#2B94DF'], ['45%', '#0E5496'], ['82%', '#072F5B'], ['100%', '#041A36']].forEach(function (s) {
      gBluedHub.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBluedHub);

    // AR Sapphire crystal reflection
    const gGlass = createSvgEl('linearGradient', { id: 'geoGlassAR', x1: '8%', y1: '4%', x2: '92%', y2: '96%' });
    [
      ['0%', 'rgba(255,255,255,0.18)'],
      ['15%', 'rgba(186,218,255,0.06)'],
      ['30%', 'rgba(255,255,255,0)'],
      ['50%', 'rgba(147,197,253,0.03)'],
      ['58%', 'rgba(255,255,255,0)'],
      ['100%', 'rgba(15,23,42,0.05)']
    ].forEach(function (s) {
      gGlass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGlass);

    // Subtle floating shadows (userSpaceOnUse prevents WebKit/iOS Safari zero-width hand disappearance!)
    const fSoft = createSvgEl('filter', {
      id: 'geoSoftShadow', filterUnits: 'userSpaceOnUse', x: '-24', y: '-24', width: '348', height: '348'
    });
    fSoft.appendChild(createSvgEl('feDropShadow', { dx: '0.9', dy: '1.8', stdDeviation: '1.6', 'flood-color': '#141B26', 'flood-opacity': '0.26' }));
    defs.appendChild(fSoft);

    const fHand = createSvgEl('filter', {
      id: 'geoHandShadow', filterUnits: 'userSpaceOnUse', x: '-24', y: '-24', width: '348', height: '348'
    });
    fHand.appendChild(createSvgEl('feDropShadow', { dx: '0.9', dy: '1.9', stdDeviation: '1.35', 'flood-color': '#0F172A', 'flood-opacity': '0.28' }));
    defs.appendChild(fHand);

    const clipDial = createSvgEl('clipPath', { id: 'geoDialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '120.5' }));
    defs.appendChild(clipDial);

    const clipPR = createSvgEl('clipPath', { id: 'geoPRClip' });
    clipPR.appendChild(createSvgEl('circle', { cx: PRX, cy: PRY, r: '14.9' }));
    defs.appendChild(clipPR);

    const crownClip = createSvgEl('clipPath', { id: 'geoCrownClip' });
    crownClip.appendChild(createSvgEl('rect', { x: '281.0', y: '134.5', width: '13.2', height: '31.0', rx: '2.0' }));
    defs.appendChild(crownClip);

    // Bottom 6 o'clock curved micro legend path (sits cleanly in the m=29..31 bay, exact NOMOS layout!)
    defs.appendChild(createSvgEl('path', {
      id: 'geoBottomSigPath',
      d: describeArc(CX, CY, 113.2, 206, 154, true)
    }));

    svg.appendChild(defs);

    // LAYER (2): 3 o'clock Finely Fluted Cylindrical Crown (pure round lugless case)
    svg.appendChild(crownBuilt.crownEl);

    const dialClickableEl = createSvgEl('g', { class: 'dial-clickable' });

    // =========================================================================
    // LAYER (3): Double-Stepped Mirror-Polished 316L Tangente Case & Bezel
    // =========================================================================
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '130.0', fill: 'url(#geoSteelCase)', stroke: '#2F3642', 'stroke-width': '1.35', filter: 'url(#geoSoftShadow)'
    }));
    // Outer mirror step groove & contrasting inner polished bezel ring
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '126.2', fill: 'url(#geoBezelStep)', stroke: 'rgba(30,36,46,0.48)', 'stroke-width': '0.9'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '124.4', fill: 'none', stroke: 'rgba(255,255,255,0.90)', 'stroke-width': '0.95'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '122.4', fill: 'none', stroke: 'rgba(35,42,52,0.42)', 'stroke-width': '0.8'
    }));
    // Warm Galvanized Silver-White Matte Dial
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '120.5', fill: 'url(#geoSilverDial)', stroke: '#4E5766', 'stroke-width': '0.85', class: 'geo-dial-face'
    }));

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#geoDialClip)' });
    dialInner.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '120.5', fill: 'url(#geoSilverGrain)', opacity: '0.68', 'pointer-events': 'none' }));
    dialInner.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '120.5', fill: 'url(#geoDialAO)', 'pointer-events': 'none' }));

    // =========================================================================
    // LAYER (4): Precision 60-Minute Perimeter Track (m=29,30,31 omitted for 6h Legend)
    // =========================================================================
    for (let m = 0; m < 60; m++) {
      if (m === 29 || m === 30 || m === 31) continue; // Clean 24° bay for bottom 6h curved signature
      const deg = m * 6;
      const isFive = m % 5 === 0;
      const rIn = isFive ? 108.2 : 110.6;
      const rOut = 115.8;
      const p1 = polar(CX, CY, rIn, deg);
      const p2 = polar(CX, CY, rOut, deg);
      dialInner.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(2), y1: p1.y.toFixed(2),
        x2: p2.x.toFixed(2), y2: p2.y.toFixed(2),
        stroke: isFive ? '#11151C' : '#1E242D',
        'stroke-width': isFive ? '1.6' : '0.78',
        'stroke-linecap': 'butt',
        class: 'geo-tick'
      }));
    }

    // Bottom curved micro legend along 6 o'clock rim (NOMOS "MADE IN GERMANY" position)
    const tBotSig = createSvgEl('text', { class: 'geo-bottom-sig' });
    const tBotPath = createSvgEl('textPath', { href: '#geoBottomSigPath', startOffset: '50%', 'text-anchor': 'middle' });
    tBotPath.setAttributeNS(XLINK_NS, 'xlink:href', '#geoBottomSigPath');
    tBotPath.textContent = 'NO.7 GEOMETRY';
    tBotSig.appendChild(tBotPath);
    dialInner.appendChild(tBotSig);

    // =========================================================================
    // LAYER (5): Radially-Oriented Bauhaus Vector Numerals (12, 2, 4, 8, 10)
    //            & Long Razor-Thin Black Batons (1, 3, 5, 7, 9, 11)
    // =========================================================================
    const numeralHours = { 12: '12', 2: '2', 4: '4', 8: '8', 10: '10' };
    for (let h = 1; h <= 12; h++) {
      if (h === 6) continue;
      const deg = (h % 12) * 30;
      if (numeralHours[h]) {
        const pt = polar(CX, CY, 90.0, deg);
        appendBauhausNumeral(dialInner, numeralHours[h], pt.x, pt.y, deg);
      } else {
        const p1 = polar(CX, CY, 78.2, deg);
        const p2 = polar(CX, CY, 103.8, deg);
        dialInner.appendChild(createSvgEl('line', {
          x1: p1.x.toFixed(2), y1: p1.y.toFixed(2),
          x2: p2.x.toFixed(2), y2: p2.y.toFixed(2),
          stroke: '#12161D', 'stroke-width': '1.62', 'stroke-linecap': 'butt',
          class: 'geo-baton-idx'
        }));
      }
    }

    // =========================================================================
    // LAYER (6): Iconic 1 o'clock Recessed Circular Gangreserve (Power Reserve)
    //            Aperture with Smooth Full-Circle Chamfer & Sunken Crimson Arc
    // =========================================================================
    const prG = createSvgEl('g', { id: 'geoGangreserve', class: 'geo-gangreserve' });
    // Soft outer dial chamfer halo
    prG.appendChild(createSvgEl('circle', {
      cx: PRX, cy: PRY, r: PR_R,
      fill: 'url(#geoPRWell)', stroke: 'url(#geoPRRimBevel)', 'stroke-width': '1.35',
      class: 'geo-pr-well'
    }));
    // Clipped sunken reserve arc & smooth top-left interior dish shadow (100% full-circle, zero broken arc seams)
    const prClipG = createSvgEl('g', { 'clip-path': 'url(#geoPRClip)' });
    const powerArcEl = createSvgEl('path', {
      id: 'geoPowerArc',
      class: 'geo-pr-arc',
      d: describeAnnularSector(PRX, PRY, 8.6, 13.4, 92, 188),
      fill: 'url(#geoPRRed)',
      stroke: 'rgba(84, 12, 22, 0.34)',
      'stroke-width': '0.55',
      'stroke-linejoin': 'round'
    });
    prClipG.appendChild(powerArcEl);
    // Smooth full-circle upper-left interior dish shadow (matches NOMOS recessed aperture)
    prClipG.appendChild(createSvgEl('circle', {
      cx: PRX, cy: PRY, r: '14.9',
      fill: 'url(#geoPRDishShadow)',
      'pointer-events': 'none'
    }));
    prG.appendChild(prClipG);
    dialInner.appendChild(prG);

    // =========================================================================
    // LAYER (7): Asymmetric 9:30 Wide-Tracked Bauhaus Signature (NOMOS Position)
    // =========================================================================
    const tBrand = createSvgEl('text', { x: '98', y: '134.5', 'text-anchor': 'middle', class: 'geo-brand-txt' });
    tBrand.textContent = 'CASPER';
    dialInner.appendChild(tBrand);

    const tSub = createSvgEl('text', { x: '98', y: '143.2', 'text-anchor': 'middle', class: 'geo-sub-txt' });
    tSub.textContent = 'NO.7';
    dialInner.appendChild(tSub);

    // =========================================================================
    // LAYER (8): Sunken Concentric-Lathe 6 o'clock Small Seconds Subdial
    // =========================================================================
    const subG = createSvgEl('g', { class: 'geo-subdial' });
    subG.appendChild(createSvgEl('circle', {
      cx: SSX, cy: SSY, r: SS_R,
      fill: 'url(#geoSubDial)', stroke: 'url(#geoPRRimBevel)', 'stroke-width': '1.15',
      class: 'geo-subdial-well'
    }));
    subG.appendChild(createSvgEl('circle', {
      cx: SSX, cy: SSY, r: SS_R - 0.5,
      fill: 'url(#geoPRDishShadow)',
      opacity: '0.68',
      'pointer-events': 'none'
    }));
    // Ultra-delicate concentric lathe rings inside sunken subdial
    for (let r = 6.5; r <= 24.5; r += 2.2) {
      subG.appendChild(createSvgEl('circle', {
        cx: SSX, cy: SSY, r: r.toFixed(1),
        fill: 'none', stroke: 'rgba(55, 62, 72, 0.08)', 'stroke-width': '0.4'
      }));
    }
    // 12 crisp radial Bauhaus small-seconds ticks (4 bold cardinal, 8 slim intermediate)
    for (let s = 0; s < 60; s += 5) {
      const deg = s * 6;
      const isQ = s % 15 === 0;
      const p1 = polar(SSX, SSY, isQ ? 18.8 : 20.5, deg);
      const p2 = polar(SSX, SSY, 24.4, deg);
      subG.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(2), y1: p1.y.toFixed(2),
        x2: p2.x.toFixed(2), y2: p2.y.toFixed(2),
        stroke: '#13171D',
        'stroke-width': isQ ? '1.35' : '0.88',
        'stroke-linecap': 'butt',
        class: 'geo-tick'
      }));
    }
    // Tapered Flame-Blued Small-Seconds Hand + Blued Hub + Polished Pinion
    const secHandEl = createSvgEl('g', { id: 'geoSecHand', filter: 'url(#geoHandShadow)' });
    secHandEl.appendChild(createSvgEl('polygon', {
      points: '149.1,203.0 149.45,175.8 150.0,173.8 150.55,175.8 150.9,203.0',
      fill: 'url(#geoBluedHand)', class: 'geo-hand-fill'
    }));
    secHandEl.appendChild(createSvgEl('circle', {
      cx: SSX, cy: SSY, r: '3.2',
      fill: 'url(#geoBluedHub)', stroke: '#062040', 'stroke-width': '0.4', class: 'geo-hand-fill'
    }));
    secHandEl.appendChild(createSvgEl('circle', {
      cx: SSX, cy: SSY, r: '1.15', fill: '#E4EAF2'
    }));
    subG.appendChild(secHandEl);
    dialInner.appendChild(subG);

    // =========================================================================
    // LAYER (9): Tapered Flame-Tempered Cobalt-Blued Steel Hands (NO Rear Tail!)
    //            + Prominent Circular Blued Steel Center Boss (NOMOS Signature!)
    // =========================================================================
    const hourHandEl = createSvgEl('g', { id: 'geoHourHand', filter: 'url(#geoHandShadow)' });
    hourHandEl.appendChild(createSvgEl('polygon', {
      points: '148.1,150.0 149.15,82.0 150.0,78.5 150.85,82.0 151.9,150.0',
      fill: 'url(#geoBluedHand)', class: 'geo-hand-fill'
    }));
    hourHandEl.appendChild(createSvgEl('line', {
      x1: '149.55', y1: '146.0', x2: '149.85', y2: '82.0',
      stroke: 'rgba(186, 224, 255, 0.56)', 'stroke-width': '0.52'
    }));
    dialInner.appendChild(hourHandEl);

    const minHandEl = createSvgEl('g', { id: 'geoMinHand', filter: 'url(#geoHandShadow)' });
    minHandEl.appendChild(createSvgEl('polygon', {
      points: '148.45,150.0 149.42,41.5 150.0,38.0 150.58,41.5 151.55,150.0',
      fill: 'url(#geoBluedHand)', class: 'geo-hand-fill'
    }));
    minHandEl.appendChild(createSvgEl('line', {
      x1: '149.65', y1: '146.0', x2: '149.90', y2: '42.0',
      stroke: 'rgba(186, 224, 255, 0.62)', 'stroke-width': '0.46'
    }));
    dialInner.appendChild(minHandEl);

    // Prominent NOMOS Circular Flame-Blued Center Boss & Stepped Steel Pinion
    const hubG = createSvgEl('g', { filter: 'url(#geoHandShadow)' });
    hubG.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '6.3', fill: 'url(#geoBluedHub)', stroke: '#052040', 'stroke-width': '0.55', class: 'geo-hand-fill'
    }));
    hubG.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '5.5', fill: 'none', stroke: 'rgba(147, 210, 255, 0.48)', 'stroke-width': '0.55'
    }));
    hubG.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '3.0', fill: '#0A3361', stroke: 'rgba(205, 232, 255, 0.55)', 'stroke-width': '0.55'
    }));
    hubG.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '1.5', fill: '#DCE4EE'
    }));
    dialInner.appendChild(hubG);

    // Whisper-subtle AR Sapphire Crystal Reflection Overlay
    dialInner.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '120.5', fill: 'url(#geoGlassAR)', 'pointer-events': 'none' }));
    dialInner.appendChild(createSvgEl('path', {
      d: 'M 54,82 Q 112,38 192,46 Q 134,64 74,114 Z',
      fill: 'rgba(255,255,255,0.12)', 'pointer-events': 'none'
    }));
    dialClickableEl.appendChild(dialInner);

    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '120.5', fill: 'none', stroke: 'rgba(255,255,255,0.58)', 'stroke-width': '1.05', 'pointer-events': 'none'
    }));

    const visualAlarmRingEl = createSvgEl('circle', {
      cx: CX, cy: CY, r: '134.5', fill: 'none', class: 'visual-alarm-ring', 'stroke-width': '3'
    });
    dialClickableEl.appendChild(visualAlarmRingEl);
    svg.appendChild(dialClickableEl);

    return {
      svg: svg,
      dialClickableEl: dialClickableEl,
      crownEl: crownBuilt.crownEl,
      crownKnurlsEl: crownBuilt.crownKnurlsEl,
      hourHandEl: hourHandEl,
      minHandEl: minHandEl,
      secHandEl: secHandEl,
      powerArcEl: powerArcEl,
      visualAlarmRingEl: visualAlarmRingEl
    };
  }

  function mount(containerEl, callbacks) {
    const cb = callbacks || {};
    containerEl.innerHTML = '';
    const parts = buildGeometrySvg();
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

      parts.hourHandEl.setAttribute('transform', 'rotate(' + hrDeg.toFixed(2) + ' 150 150)');
      parts.minHandEl.setAttribute('transform', 'rotate(' + minDeg.toFixed(2) + ' 150 150)');
      parts.secHandEl.setAttribute('transform', 'rotate(' + (secSweep * 6).toFixed(2) + ' ' + SSX + ' ' + SSY + ')');

      // Live 1 o'clock Gangreserve (Power Reserve) crimson arc indicator:
      // Perfectly concentric annular band (r=8.4..14.1) with zero off-center distortion!
      let prSpanDeg = 96;
      if (snapshot.isCountdown) {
        const reserveRatio = Math.max(0.05, Math.min(1, Number(snapshot.remainingRatio) || 0));
        prSpanDeg = 18 + reserveRatio * 252;
      }
      parts.powerArcEl.setAttribute('d', describeAnnularSector(PRX, PRY, 8.6, 13.4, 92, 92 + prSpanDeg));

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

  global.GeometryWatchEngine = {
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
