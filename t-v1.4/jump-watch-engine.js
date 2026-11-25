/**
 * CASPER™ V1 — NO.2 BINARY Caliber Pure SVG Engine (jump-watch-engine.js)
 * Forensic Tribute to Ōtsuka Lōtec No. 7.5 (7.5号) — v5.6.0 Macro-Precision Edition:
 *   1. High-density, minimal-margin tri-turret proportions filling the frosted silver dial
 *      (Hour r=38.5 at 84,114 | Massive Concentric-Grooved Minute r=59.5 at 189,117 | Seconds Collar r=46.5 at 129,215)
 *   2. Authentic Minute Lens interior: visible top movement cavity gap above the arched white wheel,
 *      long bold radial black ticks, huge condensed 50·55·00 numerals, sculpted brushed-steel
 *      teardrop pointer with countersunk slotted screw & warm copper-brass jewel tab peeking left
 *   3. Authentic No. 7.5 Crown at 4:15 (+39°): smooth polished concave-flared trumpet neck
 *      supporting a compact, wide, flat-capped diamond-knurled grip ring (0단 잠금 · 1단 ±1분 · 2단 ±5분)
 *   4. Large CNC-milled debossed steel collar typography ("CASPER" / "NO.2 V1") with dual-edge
 *      metallic relief + deep cylindrical small-seconds optical well with eccentric rotating tick wheel
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const CX = 150;
  const CY = 150;

  // High-density Ōtsuka Lōtec No. 7.5 tri-turret geometry (minimal wasted margin!)
  const HX = 84, HY = 114;       // Top-Left Jumping Hour Turret
  const MX = 189, MY = 117;      // Top-Right Massive Concentric-Grooved Minute Lens
  const MWY = 171;               // Rotating Minute Wheel Center Y (top edge sits ~7px below lens rim!)
  const SX = 129, SY = 215;      // Bottom-Center Deep-Well Small Seconds & Engraved Collar
  const SWX = 142, SWY = 201;    // Eccentric Rotating Small-Seconds Disc Center (diagonally arched scale!)

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
    const sweep = ccw ? 0 : 1;
    return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) +
      ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArc + ' ' + sweep + ' ' +
      e.x.toFixed(2) + ' ' + e.y.toFixed(2);
  }

  /**
   * Builds the authentic Ōtsuka Lōtec No. 7.5 Crown (Reference Point #3):
   *   - Smooth, polished concave-flared steel trumpet stem neck (un-knurled!)
   *   - Compact, wide, flat-capped diamond-knurled cylindrical grip band with crisp pyramidal teeth
   */
  function buildAuthenticNo75Crown() {
    const CROWN_GRIP_D =
      'M 298.8,133.2 L 308.4,132.4 Q 311.2,132.4 311.4,135.2 L 311.4,164.8 Q 311.2,167.6 308.4,167.6 L 298.8,166.8 Z';

    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(39 150 150)',
      filter: 'url(#n75MechShadow)'
    });

    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '282', y: '116', width: '48', height: '68', rx: '8', fill: 'transparent'
    }));

    // Fixed inner winding stem shaft (revealed cleanly when pulled to Pos 1 & Pos 2)
    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '286.0', y: '146.0', width: '16.5', height: '8.0',
      fill: 'url(#n75CrownNeck)', stroke: '#232830', 'stroke-width': '0.8'
    }));

    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });

    // 1. Smooth Polished Concave-Flared Trumpet Stem Neck (exact No. 7.5 crown silhouette!)
    const trumpetNeckD =
      'M 289.2,143.2 Q 295.0,142.2 299.2,136.0 L 299.2,164.0 Q 295.0,157.8 289.2,156.8 Z';
    crownSlideEl.appendChild(createSvgEl('path', {
      d: trumpetNeckD, fill: 'url(#n75CrownNeck)', stroke: '#2A3038', 'stroke-width': '0.9'
    }));
    // Silky metallic specular ribbon along center of polished trumpet neck
    crownSlideEl.appendChild(createSvgEl('path', {
      d: 'M 289.8,147.6 Q 294.6,147.2 298.8,145.6',
      fill: 'none', stroke: 'rgba(255,255,255,0.82)', 'stroke-width': '1.35', 'stroke-linecap': 'round'
    }));

    // 2. Serrated diamond-pyramid edge teeth around top, bottom & right rim of compact grip band
    const rimTeeth = [
      'M 299.2,133.4 L 300.6,130.8 L 302.4,132.6 L 304.2,130.4 L 306.0,132.4 L 307.8,130.4 L 309.6,132.6',
      'M 299.2,166.6 L 300.6,169.2 L 302.4,167.4 L 304.2,169.6 L 306.0,167.6 L 307.8,169.6 L 309.6,167.4',
      'M 310.8,135.2 L 313.0,137.0 L 311.2,139.2 L 313.2,141.4 L 311.2,143.6 L 313.4,146.0 L 311.2,148.4 ' +
      'L 313.4,150.8 L 311.2,153.2 L 313.2,155.6 L 311.2,158.0 L 313.0,160.2 L 311.2,162.4 L 312.6,164.6 L 310.8,165.4'
    ];
    rimTeeth.forEach(function (d) {
      crownSlideEl.appendChild(createSvgEl('path', {
        d: d, fill: 'url(#n75CrownCyl)', stroke: '#343A44', 'stroke-width': '0.72', 'stroke-linejoin': 'miter'
      }));
    });

    // 3. Compact wide diamond-knurled grip head
    crownSlideEl.appendChild(createSvgEl('path', {
      d: CROWN_GRIP_D, class: 'crown-body', fill: 'url(#n75CrownCyl)', stroke: '#2F353F', 'stroke-width': '1.05'
    }));

    // Deep pyramidal cross-hatched diamond knurling strictly inside the grip ring
    const clipG = createSvgEl('g', { 'clip-path': 'url(#n75CrownClip)' });
    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls' });
    for (let i = -8; i <= 14; i++) {
      const y0 = 128 + i * 3.2;
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '297.5', y1: y0.toFixed(1), x2: '313.0', y2: (y0 + 13.5).toFixed(1),
        stroke: 'rgba(18, 22, 28, 0.72)', 'stroke-width': '1.1'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '297.5', y1: (y0 + 13.5).toFixed(1), x2: '313.0', y2: y0.toFixed(1),
        stroke: 'rgba(18, 22, 28, 0.62)', 'stroke-width': '1.0'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '297.5', y1: (y0 + 1.05).toFixed(1), x2: '313.0', y2: (y0 + 14.55).toFixed(1),
        stroke: 'rgba(255, 255, 255, 0.68)', 'stroke-width': '0.62'
      }));
    }
    clipG.appendChild(crownKnurlsEl);
    crownSlideEl.appendChild(clipG);

    // Crisp bright chamfer lip along inner & outer faces of grip ring
    crownSlideEl.appendChild(createSvgEl('line', { x1: '299.2', y1: '134.0', x2: '299.2', y2: '166.0', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.8' }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '309.6', y1: '133.5', x2: '309.6', y2: '166.5', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.78' }));

    crownEl.appendChild(crownSlideEl);
    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl, crownD: CROWN_GRIP_D };
  }

  function buildJumpSvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-20 -20 340 340',
      class: 'no5-svg is-jump-caliber is-binary-caliber is-no75-tribute',
      role: 'img',
      'aria-label': 'NO.2 BINARY — CASPER V1 점핑 아워 3창 터렛 시계'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildAuthenticNo75Crown();

    // Wide Radial-Sheen Circular Brushed Steel Bezel (dark 12h/6h, bright 3h/9h — exact photo!)
    const gBezel = createSvgEl('linearGradient', { id: 'n75BezelSheen', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [
      ['0%', '#3B4149'],
      ['14%', '#7C838E'],
      ['34%', '#DCE1E7'],
      ['50%', '#F7F9FB'],
      ['68%', '#CBD2DB'],
      ['88%', '#646B76'],
      ['100%', '#2D323A']
    ].forEach(function (s) {
      gBezel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBezel);

    const gBezelCross = createSvgEl('linearGradient', { id: 'n75BezelCross', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [
      ['0%', 'rgba(255,255,255,0.32)'],
      ['26%', 'rgba(255,255,255,0.02)'],
      ['50%', 'rgba(14,18,24,0.26)'],
      ['74%', 'rgba(255,255,255,0.04)'],
      ['100%', 'rgba(255,255,255,0.32)']
    ].forEach(function (s) {
      gBezelCross.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBezelCross);

    // Bead-Blasted Frosted Anodized Silver Front Plate
    const gMattePlate = createSvgEl('linearGradient', { id: 'n75MattePlate', x1: '18%', y1: '8%', x2: '82%', y2: '92%' });
    [['0%', '#E5E8EC'], ['46%', '#D6DADF'], ['78%', '#C8CDD3'], ['100%', '#B7BDC6']].forEach(function (s) {
      gMattePlate.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gMattePlate);

    const pBead = createSvgEl('pattern', { id: 'n75BeadGrain', width: '3.6', height: '3.6', patternUnits: 'userSpaceOnUse' });
    pBead.appendChild(createSvgEl('circle', { cx: '0.9', cy: '0.9', r: '0.45', fill: 'rgba(255,255,255,0.42)' }));
    pBead.appendChild(createSvgEl('circle', { cx: '2.6', cy: '2.3', r: '0.42', fill: 'rgba(42,48,58,0.09)' }));
    pBead.appendChild(createSvgEl('circle', { cx: '1.8', cy: '3.1', r: '0.35', fill: 'rgba(255,255,255,0.28)' }));
    defs.appendChild(pBead);

    // Sculpted Tri-Lobe Island & Turret Brushed Steel Gradients
    const gIsland = createSvgEl('linearGradient', { id: 'n75IslandMetal', x1: '14%', y1: '10%', x2: '86%', y2: '90%' });
    [['0%', '#F2F4F7'], ['38%', '#CFD4DC'], ['68%', '#AEB5BF'], ['100%', '#878E99']].forEach(function (s) {
      gIsland.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gIsland);

    const gTurretRim = createSvgEl('linearGradient', { id: 'n75TurretRim', x1: '12%', y1: '0%', x2: '88%', y2: '100%' });
    [
      ['0%', '#4E555F'],
      ['22%', '#C9CFD7'],
      ['46%', '#F7F9FB'],
      ['70%', '#B2B9C3'],
      ['90%', '#5B626D'],
      ['100%', '#353B44']
    ].forEach(function (s) {
      gTurretRim.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gTurretRim);

    // Brushed flat engraved collar sheen (matching raw satin-brushed steel in Reference #4!)
    const gCollarSteel = createSvgEl('linearGradient', { id: 'n75CollarSteel', x1: '0%', y1: '15%', x2: '100%', y2: '85%' });
    [
      ['0%', '#CBD1DA'],
      ['24%', '#E6EAF0'],
      ['52%', '#B5BCC6'],
      ['78%', '#DDE2E9'],
      ['100%', '#98A0AC']
    ].forEach(function (s) {
      gCollarSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCollarSteel);

    const gWhiteDisc = createSvgEl('radialGradient', { id: 'n75WhiteDisc', cx: '45%', cy: '38%', r: '68%' });
    [['0%', '#FFFFFF'], ['68%', '#F4F6F8'], ['100%', '#DEE2E8']].forEach(function (s) {
      gWhiteDisc.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gWhiteDisc);

    // Convex optical lens glint & deep perimeter refraction shadow
    const gLens = createSvgEl('radialGradient', { id: 'n75LensOptic', cx: '38%', cy: '30%', r: '70%' });
    [
      ['0%', 'rgba(255,255,255,0.28)'],
      ['48%', 'rgba(255,255,255,0.02)'],
      ['80%', 'rgba(18,22,28,0.12)'],
      ['100%', 'rgba(10,14,20,0.48)']
    ].forEach(function (s) {
      gLens.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gLens);

    // Smooth polished trumpet neck cylindrical reflection (high-contrast dark/bright/dark!)
    const gCrownNeck = createSvgEl('linearGradient', { id: 'n75CrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#1E232A'], ['28%', '#9CA5B0'], ['48%', '#F8FAFC'], ['72%', '#58606C'], ['100%', '#181C22']].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    const gCrownCyl = createSvgEl('linearGradient', { id: 'n75CrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#363C46'], ['22%', '#D6DCE3'], ['42%', '#FFFFFF'], ['66%', '#A8B0BA'], ['100%', '#282E36']].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownCyl);

    // Shadows for genuine sculpted CNC relief
    const fMechShadow = createSvgEl('filter', { id: 'n75MechShadow', x: '-22%', y: '-22%', width: '144%', height: '144%' });
    fMechShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.2', dy: '2.2', stdDeviation: '2.2', 'flood-color': '#12161E', 'flood-opacity': '0.38' }));
    defs.appendChild(fMechShadow);

    const fTurretShadow = createSvgEl('filter', { id: 'n75TurretShadow', x: '-22%', y: '-22%', width: '144%', height: '144%' });
    fTurretShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.5', dy: '3.2', stdDeviation: '3.2', 'flood-color': '#0F131A', 'flood-opacity': '0.45' }));
    defs.appendChild(fTurretShadow);

    // Clip paths
    const clipDial = createSvgEl('clipPath', { id: 'n75DialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '123.5' }));
    defs.appendChild(clipDial);

    const clipCrown = createSvgEl('clipPath', { id: 'n75CrownClip' });
    clipCrown.appendChild(createSvgEl('path', { d: crownBuilt.crownD }));
    defs.appendChild(clipCrown);

    const clipHour = createSvgEl('clipPath', { id: 'n75ClipHour' });
    clipHour.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '25.2' }));
    defs.appendChild(clipHour);

    const clipMin = createSvgEl('clipPath', { id: 'n75ClipMin' });
    clipMin.appendChild(createSvgEl('circle', { cx: MX, cy: MY, r: '41.5' }));
    defs.appendChild(clipMin);

    const clipSec = createSvgEl('clipPath', { id: 'n75ClipSec' });
    clipSec.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '15.8' }));
    defs.appendChild(clipSec);

    // Wide radial-centered CNC engraving arcs along bottom brushed collar (collar 31.5..46.5,
    // textPath baseline at r=35.4 places 7.2px cap-height dead-center across 35.4..42.6!)
    defs.appendChild(createSvgEl('path', {
      id: 'n75CollarLeftPath',
      d: describeArc(SX, SY, 35.4, -142, 4, false)
    }));
    defs.appendChild(createSvgEl('path', {
      id: 'n75CollarRightPath',
      d: describeArc(SX, SY, 35.4, 30, 154, false)
    }));

    svg.appendChild(defs);

    // Visual alarm breathing ring
    const visualAlarmRingEl = createSvgEl('circle', {
      cx: CX, cy: CY, r: '146.5', fill: 'none', class: 'visual-alarm-ring', 'stroke-width': '4'
    });
    svg.appendChild(visualAlarmRingEl);

    // 4:15 Authentic Trumpet-Neck + Compact Diamond-Knurled Crown (Point #3)
    svg.appendChild(crownBuilt.crownEl);

    const dialClickableEl = createSvgEl('g', { class: 'dial-clickable' });

    // =========================================================================
    // LAYER (1): Wide Circular-Brushed 316L Monobloc Steel Bezel (r=142 -> 123.5)
    // =========================================================================
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '142.0', fill: 'url(#n75BezelSheen)', stroke: '#353B44', 'stroke-width': '1.35'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '141.4', fill: 'url(#n75BezelCross)', 'pointer-events': 'none'
    }));
    const bezelLatheG = createSvgEl('g', { opacity: '0.26', 'pointer-events': 'none' });
    for (let r = 125.0; r <= 140.5; r += 1.6) {
      bezelLatheG.appendChild(createSvgEl('circle', {
        cx: CX, cy: CY, r: r.toFixed(1), fill: 'none',
        stroke: r % 3.2 < 1.6 ? 'rgba(255,255,255,0.58)' : 'rgba(18,22,28,0.48)',
        'stroke-width': '0.45'
      }));
    }
    dialClickableEl.appendChild(bezelLatheG);
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '125.0', fill: 'none', stroke: 'rgba(255,255,255,0.64)', 'stroke-width': '0.9'
    }));
    dialClickableEl.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '123.5', fill: 'url(#n75MattePlate)', stroke: '#4A515B', 'stroke-width': '1.05', class: 'jump-front-plate'
    }));

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#n75DialClip)' });

    // Frosted Bead-Blasted Anodized Silver Micro-Grain Texture
    dialInner.appendChild(createSvgEl('circle', {
      cx: CX, cy: CY, r: '123.5', fill: 'url(#n75BeadGrain)', opacity: '0.88', 'pointer-events': 'none'
    }));

    // =========================================================================
    // LAYER (2): Expanded Organic Tri-Lobe Concave-Fillet Steel Island (Point #1)
    //            Fills the frosted silver plate tightly with minimal outer margin!
    // =========================================================================
    const triLobeD = [
      'M 110.2,80.5',
      'Q 128.5,92.0 148.8,69.1',
      'A 62.5,62.5 0 1,1 197.7,178.9',
      'Q 173.0,184.5 177.4,204.7',
      'A 49.5,49.5 0 1,1 80.6,204.7',
      'Q 88.5,173.5 59.0,148.4',
      'A 42.5,42.5 0 1,1 110.2,80.5',
      'Z'
    ].join(' ');

    const islandG = createSvgEl('g', { class: 'n75-tri-island', filter: 'url(#n75MechShadow)' });
    islandG.appendChild(createSvgEl('path', {
      d: triLobeD, fill: 'url(#n75IslandMetal)', stroke: 'rgba(255,255,255,0.84)', 'stroke-width': '1.65', class: 'jump-turret-bezel'
    }));
    islandG.appendChild(createSvgEl('path', {
      d: triLobeD, fill: 'none', stroke: 'rgba(50,57,67,0.44)', 'stroke-width': '0.9'
    }));
    dialInner.appendChild(islandG);

    // =========================================================================
    // LAYER (3): TURRET 1 — Expanded Top-Left Jumping Hour Porthole (84, 114)
    // =========================================================================
    const hFrame = createSvgEl('g', { class: 'jump-turret-hour', filter: 'url(#n75TurretShadow)' });
    hFrame.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '38.5', fill: 'url(#n75TurretRim)', stroke: '#383E48', 'stroke-width': '1.15', class: 'jump-turret-bezel' }));
    hFrame.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '35.0', fill: 'none', stroke: 'rgba(255,255,255,0.70)', 'stroke-width': '0.78' }));
    hFrame.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '29.8', fill: '#282D35', stroke: '#4A515C', 'stroke-width': '1.15' }));
    hFrame.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '26.8', fill: '#12151B', stroke: 'rgba(255,255,255,0.36)', 'stroke-width': '0.68' }));

    const hourClipG = createSvgEl('g', { 'clip-path': 'url(#n75ClipHour)' });
    const hourDiskEl = createSvgEl('g', { id: 'jumpHourDisk', class: 'jump-hour-disk' });
    hourDiskEl.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '25.6', fill: 'url(#n75WhiteDisc)' }));
    const hourNumEl = createSvgEl('text', {
      id: 'jumpHourNum',
      x: HX, y: HY + 12.2,
      'text-anchor': 'middle',
      class: 'n75-hour-num'
    });
    hourNumEl.textContent = '10';
    hourDiskEl.appendChild(hourNumEl);
    hourClipG.appendChild(hourDiskEl);
    hFrame.appendChild(hourClipG);

    // Convex magnifying glass dome reflection
    hFrame.appendChild(createSvgEl('circle', { cx: HX, cy: HY, r: '25.2', fill: 'url(#n75LensOptic)', 'pointer-events': 'none' }));
    hFrame.appendChild(createSvgEl('path', {
      d: 'M 65,101 Q 78,89 99,93 Q 83,97 69,111 Z',
      fill: 'rgba(255,255,255,0.26)', 'pointer-events': 'none'
    }));
    dialInner.appendChild(hFrame);

    // =========================================================================
    // LAYER (4): TURRET 2 — Massive Concentric-Grooved Minute Lens (189, 117)
    //            (Point #2: Top dark movement gap, long bold radial ticks, huge
    //            50·55·00 numerals, sculpted teardrop pointer + left brass tab!)
    // =========================================================================
    const mFrame = createSvgEl('g', { class: 'jump-turret-min', filter: 'url(#n75TurretShadow)' });
    mFrame.appendChild(createSvgEl('circle', { cx: MX, cy: MY, r: '59.5', fill: 'url(#n75TurretRim)', stroke: '#383E48', 'stroke-width': '1.2', class: 'jump-turret-bezel' }));
    // Signature 7 stepped concentric machined lathe grooves on wide turret ring
    [57.2, 54.6, 52.0, 49.4, 46.8, 44.2].forEach(function (rr, idx) {
      mFrame.appendChild(createSvgEl('circle', {
        cx: MX, cy: MY, r: rr.toFixed(1), fill: 'none',
        stroke: idx % 2 === 0 ? 'rgba(26,31,38,0.52)' : 'rgba(255,255,255,0.74)',
        'stroke-width': idx % 2 === 0 ? '1.05' : '0.75'
      }));
    });
    mFrame.appendChild(createSvgEl('circle', { cx: MX, cy: MY, r: '42.4', fill: '#171B22', stroke: '#4A515C', 'stroke-width': '1.15' }));

    const minClipG = createSvgEl('g', { 'clip-path': 'url(#n75ClipMin)' });
    // Deep shadowed mechanical cavity visible along the upper crescent above the white minute wheel!
    minClipG.appendChild(createSvgEl('circle', { cx: MX, cy: MY, r: '41.5', fill: '#1E232B' }));
    // Subtle dark machined bridge/gear texture peeking inside the upper crescent gap above 55
    minClipG.appendChild(createSvgEl('path', {
      d: 'M 156,82 Q 189,75 224,84 L 220,93 Q 189,86 158,92 Z',
      fill: '#383F4B', opacity: '0.78'
    }));
    minClipG.appendChild(createSvgEl('circle', { cx: MX + 8, cy: MY - 35, r: '3.2', fill: '#5C6470', stroke: '#1B2027', 'stroke-width': '0.6' }));

    // Rotating Arched White Minute Wheel centered below lens at (MX, MWY = 171)
    // Outer radius 88.0 -> top edge sits at y = 83.0 (~7.5px below lens top 75.5 = authentic dark top crescent!)
    const minWheelEl = createSvgEl('g', { id: 'jumpMinWheel' });
    minWheelEl.appendChild(createSvgEl('circle', { cx: MX, cy: MWY, r: '88.0', fill: 'url(#n75WhiteDisc)', stroke: '#6E7682', 'stroke-width': '1.05' }));
    // Subtle recessed metallic satin floor inside the tick ring (matches light-grey bottom cavity in Point #2)
    minWheelEl.appendChild(createSvgEl('circle', { cx: MX, cy: MWY, r: '45.5', fill: '#E3E6EB', stroke: 'rgba(120,128,140,0.28)', 'stroke-width': '0.7' }));

    // 60 LONG, BOLD, DENSE radial black ticks + HUGE condensed numerals (00, 05, ..., 50, 55)!
    for (let m = 0; m < 60; m++) {
      const deg = m * 6;
      const isFive = m % 5 === 0;
      const p1 = polar(MX, MWY, isFive ? 46.5 : 50.0, deg);
      const p2 = polar(MX, MWY, isFive ? 66.2 : 64.2, deg);
      minWheelEl.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(1), y1: p1.y.toFixed(1),
        x2: p2.x.toFixed(1), y2: p2.y.toFixed(1),
        stroke: '#0F1218',
        'stroke-width': isFive ? '2.25' : '1.38',
        'stroke-linecap': 'butt'
      }));
      if (isFive) {
        const pt = polar(MX, MWY, 76.5, deg);
        const t = createSvgEl('text', {
          x: pt.x.toFixed(1),
          y: (pt.y + 6.0).toFixed(1),
          'text-anchor': 'middle',
          class: 'n75-min-num',
          transform: 'rotate(' + deg.toFixed(1) + ' ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')'
        });
        t.textContent = String(m).padStart(2, '0');
        minWheelEl.appendChild(t);
      }
    }
    minClipG.appendChild(minWheelEl);

    // Authentic warm copper-gold brass roller/jewel tab peeking from under the LEFT shoulder of the teardrop!
    minClipG.appendChild(createSvgEl('ellipse', {
      cx: MX - 9.2, cy: MY + 22.0, rx: '5.5', ry: '3.2',
      fill: '#D2A256', stroke: '#6E4E1E', 'stroke-width': '0.75',
      transform: 'rotate(-26 ' + (MX - 9.2) + ' ' + (MY + 22.0) + ')'
    }));
    minClipG.appendChild(createSvgEl('circle', {
      cx: MX - 11.4, cy: MY + 23.0, r: '1.1', fill: '#3B2B14'
    }));

    // Fixed Sculpted Brushed-Steel Teardrop Index Pointer + Countersunk Slotted Screw (Point #2 exact!)
    const ptrG = createSvgEl('g', { filter: 'url(#n75MechShadow)' });
    ptrG.appendChild(createSvgEl('path', {
      d: 'M ' + MX + ',' + (MY + 9.5) +
        ' C ' + (MX + 3.6) + ',' + (MY + 10.5) + ' ' + (MX + 9.4) + ',' + (MY + 25.5) + ' ' + (MX + 9.6) + ',' + (MY + 42.5) +
        ' L ' + (MX - 9.6) + ',' + (MY + 42.5) +
        ' C ' + (MX - 9.4) + ',' + (MY + 25.5) + ' ' + (MX - 3.6) + ',' + (MY + 10.5) + ' ' + MX + ',' + (MY + 9.5) + ' Z',
      fill: 'url(#n75IslandMetal)', stroke: '#353C46', 'stroke-width': '1.05', class: 'n75-pointer-body'
    }));
    // Crisp specular edge highlight along left blade bevel of teardrop
    ptrG.appendChild(createSvgEl('path', {
      d: 'M ' + (MX - 0.5) + ',' + (MY + 11.5) + ' C ' + (MX - 3.2) + ',' + (MY + 15.0) + ' ' + (MX - 7.5) + ',' + (MY + 27.0) + ' ' + (MX - 7.8) + ',' + (MY + 40.5),
      fill: 'none', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.85'
    }));
    // Countersunk polished slotted steel screw seated cleanly at teardrop base
    ptrG.appendChild(createSvgEl('circle', { cx: MX, cy: MY + 31.8, r: '5.5', fill: '#69717D', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.55' }));
    ptrG.appendChild(createSvgEl('circle', { cx: MX, cy: MY + 31.8, r: '4.6', fill: '#E8ECF1', stroke: '#383F49', 'stroke-width': '0.78' }));
    ptrG.appendChild(createSvgEl('line', {
      x1: (MX - 1.4).toFixed(1), y1: (MY + 27.6).toFixed(1), x2: (MX + 1.4).toFixed(1), y2: (MY + 36.0).toFixed(1),
      stroke: '#21262E', 'stroke-width': '1.25', class: 'jump-screw-slot'
    }));
    minClipG.appendChild(ptrG);

    // Deep upper-wall cylindrical lens shadow + subtle convex glass dome glint
    minClipG.appendChild(createSvgEl('circle', { cx: MX, cy: MY, r: '41.5', fill: 'url(#n75LensOptic)', 'pointer-events': 'none' }));
    minClipG.appendChild(createSvgEl('path', {
      d: 'M 159,97 Q 182,78 214,86 Q 189,91 165,112 Z',
      fill: 'rgba(255,255,255,0.18)', 'pointer-events': 'none'
    }));
    mFrame.appendChild(minClipG);
    dialInner.appendChild(mFrame);

    // =========================================================================
    // LAYER (5): TURRET 3 — Deep-Well Small Seconds & CNC-Engraved Collar (Point #4)
    // =========================================================================
    const sFrame = createSvgEl('g', { class: 'jump-turret-sec', filter: 'url(#n75TurretShadow)' });
    // Wide flat brushed-steel engraved outer collar (r=46.5, hugging bottom bezel tightly!)
    sFrame.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY, r: '46.5', fill: 'url(#n75CollarSteel)', stroke: '#4A515C', 'stroke-width': '1.1', class: 'jump-turret-bezel'
    }));
    sFrame.appendChild(createSvgEl('circle', {
      cx: SX, cy: SY, r: '45.4', fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.72'
    }));

    // Large CNC-Milled Debossed Steel Collar Engravings ("CASPER" left-top / "NO.2 V1" right-bottom)
    // Dual-layer highlight + recessed shadow creates genuine carved-metal depth matching ŌTSUKA LŌTEC!
    function appendEngravedCollarText(pathId, label) {
      // Lower-right bright machined rim highlight
      const hi = createSvgEl('text', { class: 'n75-collar-eng-hi', transform: 'translate(0.55, 0.55)' });
      const hiTp = createSvgEl('textPath', { href: '#' + pathId, startOffset: '50%', 'text-anchor': 'middle' });
      hiTp.setAttributeNS(XLINK_NS, 'xlink:href', '#' + pathId);
      hiTp.textContent = label;
      hi.appendChild(hiTp);
      sFrame.appendChild(hi);

      // Recessed debossed steel groove body & dark top-left bevel shadow
      const main = createSvgEl('text', { class: 'n75-collar-eng' });
      const mainTp = createSvgEl('textPath', { href: '#' + pathId, startOffset: '50%', 'text-anchor': 'middle' });
      mainTp.setAttributeNS(XLINK_NS, 'xlink:href', '#' + pathId);
      mainTp.textContent = label;
      main.appendChild(mainTp);
      sFrame.appendChild(main);
    }
    appendEngravedCollarText('n75CollarLeftPath', 'CASPER');
    appendEngravedCollarText('n75CollarRightPath', 'NO.2 V1');

    // Deep stepped concentric polished-steel small-seconds turret tube (r=31.5 -> 25.8 -> 20.5 -> 16.4)
    sFrame.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '31.5', fill: 'url(#n75TurretRim)', stroke: '#3B414B', 'stroke-width': '1.05' }));
    sFrame.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '27.8', fill: 'none', stroke: 'rgba(255,255,255,0.62)', 'stroke-width': '0.68' }));
    sFrame.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '23.2', fill: '#C8CED6', stroke: '#4A515C', 'stroke-width': '0.95' }));
    sFrame.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '16.5', fill: '#1A1E26', stroke: '#323842', 'stroke-width': '1.0' }));

    // Deep optical porthole with authentic ECCENTRIC arched silver seconds wheel peeking diagonally!
    const secClipG = createSvgEl('g', { 'clip-path': 'url(#n75ClipSec)' });
    // Deep cylindrical shadow floor
    secClipG.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '15.8', fill: '#2B303A' }));

    // Eccentric rotating brushed-silver seconds disc centered at (SWX, SWY = 142, 201)
    const secDiskEl = createSvgEl('g', { id: 'jumpSecDisk' });
    secDiskEl.appendChild(createSvgEl('circle', { cx: SWX, cy: SWY, r: '26.5', fill: 'url(#n75WhiteDisc)', stroke: '#7B838E', 'stroke-width': '0.8' }));
    secDiskEl.appendChild(createSvgEl('circle', { cx: SWX, cy: SWY, r: '16.5', fill: '#CFD4DC', stroke: '#8C94A0', 'stroke-width': '0.65' }));
    for (let s = 0; s < 60; s++) {
      const deg = s * 6;
      const isFive = s % 5 === 0;
      const p1 = polar(SWX, SWY, isFive ? 17.5 : 19.6, deg);
      const p2 = polar(SWX, SWY, 25.8, deg);
      secDiskEl.appendChild(createSvgEl('line', {
        x1: p1.x.toFixed(1), y1: p1.y.toFixed(1),
        x2: p2.x.toFixed(1), y2: p2.y.toFixed(1),
        stroke: isFive ? '#14181F' : 'rgba(20,24,31,0.58)',
        'stroke-width': isFive ? '1.15' : '0.58'
      }));
    }
    secClipG.appendChild(secDiskEl);

    // Authentic subtle brushed-steel lower-left movement rim & dark micro pin (monochrome industrial look!)
    secClipG.appendChild(createSvgEl('path', {
      d: 'M ' + (SX - 16) + ',' + (SY + 3) + ' Q ' + (SX - 2) + ',' + (SY + 12) + ' ' + (SX + 16) + ',' + (SY + 14) +
         ' L ' + (SX + 16) + ',' + (SY + 18) + ' L ' + (SX - 16) + ',' + (SY + 18) + ' Z',
      fill: '#D8DDE4', stroke: '#4A515C', 'stroke-width': '0.65', opacity: '0.92'
    }));
    secClipG.appendChild(createSvgEl('circle', { cx: SX - 7.8, cy: SY + 3.2, r: '1.6', fill: '#1A1F27', stroke: '#9BA3AE', 'stroke-width': '0.45' }));
    // Subtle dark cylindrical index notch at upper-right wall
    secClipG.appendChild(createSvgEl('polygon', {
      points: (SX + 2.0) + ',' + (SY - 2.0) + ' ' + (SX + 5.8) + ',' + (SY - 5.2) + ' ' + (SX + 3.8) + ',' + (SY - 6.6),
      fill: '#232933', stroke: 'rgba(255,255,255,0.45)', 'stroke-width': '0.35'
    }));
    secClipG.appendChild(createSvgEl('circle', { cx: SX, cy: SY, r: '15.8', fill: 'url(#n75LensOptic)', 'pointer-events': 'none' }));
    sFrame.appendChild(secClipG);
    dialInner.appendChild(sFrame);

    dialClickableEl.appendChild(dialInner);

    // Subtle overall bezel crystal highlight lip
    dialClickableEl.appendChild(createSvgEl('circle', { cx: CX, cy: CY, r: '123.5', fill: 'none', stroke: 'rgba(255,255,255,0.46)', 'stroke-width': '1.2', 'pointer-events': 'none' }));
    svg.appendChild(dialClickableEl);

    return {
      svg: svg,
      dialClickableEl: dialClickableEl,
      crownEl: crownBuilt.crownEl,
      crownSlideEl: crownBuilt.crownSlideEl,
      crownKnurlsEl: crownBuilt.crownKnurlsEl,
      hourNumEl: hourNumEl,
      hourDiskEl: hourDiskEl,
      minWheelEl: minWheelEl,
      secDiskEl: secDiskEl,
      visualAlarmRingEl: visualAlarmRingEl
    };
  }

  function mount(containerEl, callbacks) {
    const cb = callbacks || {};
    containerEl.innerHTML = '';
    const parts = buildJumpSvg();
    containerEl.appendChild(parts.svg);

    const crownOverlayEl = document.createElement('div');
    crownOverlayEl.id = 'no5CrownTouchOverlay';
    crownOverlayEl.className = 'crown-touch-overlay';
    crownOverlayEl.setAttribute('tabindex', '0');
    crownOverlayEl.setAttribute('role', 'slider');
    crownOverlayEl.setAttribute('aria-label', '4시 용두 (0단 잠금) — 1회 클릭 1단(±1분), 2회 클릭 2단(±5분), 3회 클릭 잠금 복귀');
    containerEl.appendChild(crownOverlayEl);

    let crownPosition = 0;
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let downClientX = 0, downClientY = 0, lastClientX = 0, lastClientY = 0;
    let dragAccum = 0, gestureStepsEmitted = 0, lockedHintEmitted = false;
    let turnTimerId = null;
    let lastHourShown = null;
    const COS39 = Math.cos((39 * Math.PI) / 180);
    const SIN39 = Math.sin((39 * Math.PI) / 180);

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
      if (typeof pulled === 'number') setCrownPosition(pulled, silent);
      else setCrownPosition(pulled ? 1 : 0, silent);
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
      dragAccum += (-dy * COS39) + (-dx * SIN39 * 0.65);
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

    function update(snapshot) {
      if (!snapshot) return;
      const isTimerMode = snapshot.mode === 'pomodoro' || snapshot.mode === 'countdown' || snapshot.mode === 'stopwatch';
      const tHours = Number(snapshot.tHours) || 0;
      let displayHour;
      let fracMin;
      if (isTimerMode) {
        const rawH = typeof snapshot.rawHours === 'number'
          ? Math.max(0, Math.min(12, snapshot.rawHours))
          : Math.max(0, tHours);
        const wholeH = Math.min(12, Math.floor(rawH + 1e-6));
        displayHour = wholeH;
        fracMin = wholeH >= 12 ? 0 : Math.max(0, (rawH - wholeH) * 60);
      } else {
        const rawHour = Math.floor(tHours) % 12;
        displayHour = rawHour === 0 ? 12 : rawHour;
        fracMin = (tHours - Math.floor(tHours)) * 60;
      }
      const secSweep = Number(snapshot.secondsSweep) || 0;

      // Discrete mechanical Jumping Hour (shows 0..12h in timer modes, 1..12 in clock/demo)
      if (displayHour !== lastHourShown) {
        lastHourShown = displayHour;
        parts.hourNumEl.textContent = String(displayHour);
        parts.hourDiskEl.classList.remove('is-jumping');
        void parts.hourDiskEl.offsetWidth;
        parts.hourDiskEl.classList.add('is-jumping');
      }

      // Rotating Arched Minute Wheel — unwinds backward in countdown modes!
      parts.minWheelEl.setAttribute('transform', 'rotate(' + (-fracMin * 6).toFixed(2) + ' ' + MX + ' ' + MWY + ')');

      // Eccentric Deep-Well Small Seconds Disc — rotates smoothly around offset center (SWX, SWY)!
      parts.secDiskEl.setAttribute('transform', 'rotate(' + (-secSweep * 6).toFixed(2) + ' ' + SWX + ' ' + SWY + ')');

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
      svg: parts.svg,
      render: update,
      update: update,
      triggerVisualAlarm: triggerVisualAlarm,
      setCrownPosition: setCrownPosition,
      getCrownPosition: function () { return crownPosition; },
      setCrownPulled: setCrownPulled,
      isCrownPulled: function () { return crownPosition > 0; },
      setFinish: setFinish
    };
  }

  global.JumpWatchEngine = {
    mount: mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
