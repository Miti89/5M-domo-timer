/**
 * CASPER™ V1 — NO.5 ELLIPSE Pure SVG Engine (satellite-engine.js)
 * Forensic Tribute to Ōtsuka Lōtec No. 5 Kai (5号 改) — v5.4.0 High-Density Thick-Case Edition:
 *   - Substantial, thick brushed 316L stainless steel monolithic case (r=139 -> dial r=113)
 *     with broad horizontal-brushed lug shoulders, solid forehead/chin, stepped bezel & thick box sapphire dome
 *   - 4:15 (+39°) flared cross-hatched diamond-knurled pinion crown (0단 잠금 · 1단 ±1분 · 2단 ±5분)
 *   - Tightly packed ("오밀조밀") frosted bead-blasted silver-grey mechanical interior:
 *     2:00 & 9:00 gold-brass gears, 1:45 & 6:30 purple-magenta ruby jewels, sculpted left bridge + 10:00/7:30 screws
 *   - 3 chunky, broad, blunted ("뭉툭한") 4-lobe CNC Maltese satellite hour discs (rOuter=44.5, shallow roller notches)
 *     closely interlocking around ORBIT_R=46.5 with bold Katayama technical square numerals (1..12)
 *   - Flush, non-protruding 120°-symmetric 3-chord straight spring-steel detent wires tucked cleanly
 *     beneath the wide terrace wings and rotating in lockstep with the 3-arm carousel bridge
 *   - Sculptural chunky shield-terrace 3-Arm CNC Y-Bridge with broad chamfered hexagonal carrier wings,
 *     6 flank screws, blunt-tipped raised Y-spine, milled slots, 3 polished steel cap posts & solid steel center hub
 *   - Compact right 120° minute plate (r=89.5..113) with single inner tick rail, 2-tier 00..60 numerals & crimson → arrow
 *   - Tightly nestled 5:45 sunburst small-seconds subdial with large brushed cap & crimson ▼ pointer
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const ORBIT_R = 46.2;
  const ARC_R = 89.2;
  const HOUR_ARC_R = 96.5;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  const TECH_FONT = "'Eurostile', 'DIN Alternate', 'Bahnschrift', 'Pretendard', -apple-system, sans-serif";

  // Authentic Katayama square-rounded technical vector numerals (box: [-4.4..4.4] x [-6.9..6.9])
  const DIGIT_PATHS = {
    '0': 'M -3.9,-4.9 Q -3.9,-6.9 -1.9,-6.9 L 1.9,-6.9 Q 3.9,-6.9 3.9,-4.9 L 3.9,4.9 Q 3.9,6.9 1.9,6.9 L -1.9,6.9 Q -3.9,6.9 -3.9,4.9 Z',
    '1': 'M -2.3,-4.5 L 0.6,-6.9 L 0.6,6.9',
    '2': 'M -4.1,-4.1 Q -4.1,-6.9 -1.4,-6.9 L 1.6,-6.9 Q 4.1,-6.9 4.1,-4.4 L 4.1,-1.8 Q 4.1,0.1 1.7,0.5 L -2.1,1.2 Q -4.1,1.7 -4.1,3.9 L -4.1,6.9 L 4.4,6.9',
    '3': 'M -4.1,-6.9 L 1.9,-6.9 Q 4.1,-6.9 4.1,-4.7 L 4.1,-2.2 Q 4.1,-0.2 1.8,-0.2 L -1.2,-0.2 M 1.8,-0.2 Q 4.3,-0.2 4.3,2.2 L 4.3,4.7 Q 4.3,6.9 1.9,6.9 L -4.1,6.9',
    '4': 'M 2.2,6.9 L 2.2,-6.9 L -4.3,2.1 L 4.6,2.1',
    '5': 'M 4.1,-6.9 L -3.7,-6.9 L -3.9,-0.8 L 1.7,-0.8 Q 4.2,-0.8 4.2,1.6 L 4.2,4.7 Q 4.2,6.9 1.9,6.9 L -4.1,6.9',
    '6': 'M 3.9,-5.2 Q 3.9,-6.9 1.9,-6.9 L -1.9,-6.9 Q -4.1,-6.9 -4.1,-4.5 L -4.1,4.7 Q -4.1,6.9 -1.9,6.9 L 1.9,6.9 Q 4.1,6.9 4.1,4.7 L 4.1,1.6 Q 4.1,-0.7 1.9,-0.7 L -4.1,-0.7',
    '7': 'M -4.3,-5.0 L -4.3,-6.9 L 4.3,-6.9 L 4.3,-4.9 L -1.2,6.9',
    '8': 'M -1.8,-6.9 L 1.8,-6.9 Q 3.9,-6.9 3.9,-4.7 L 3.9,-2.1 Q 3.9,-0.2 1.8,-0.2 L -1.8,-0.2 Q -3.9,-0.2 -3.9,-2.1 L -3.9,-4.7 Q -3.9,-6.9 -1.8,-6.9 Z M -2.0,-0.2 L 2.0,-0.2 Q 4.2,-0.2 4.2,2.1 L 4.2,4.7 Q 4.2,6.9 2.0,6.9 L -2.0,6.9 Q -4.2,6.9 -4.2,4.7 L -4.2,2.1 Q -4.2,-0.2 -2.0,-0.2 Z',
    '9': 'M -3.9,5.2 Q -3.9,6.9 -1.9,6.9 L 1.9,6.9 Q 4.1,6.9 4.1,4.5 L 4.1,-4.7 Q 4.1,-6.9 1.9,-6.9 L -1.9,-6.9 Q -4.1,-6.9 -4.1,-4.7 L -4.1,-1.6 Q -4.1,0.7 -1.9,0.7 L 4.1,0.7'
  };

  function createSvgEl(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        node.setAttribute(keys[i], String(attrs[keys[i]]));
      }
    }
    return node;
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcSectorPath(cx, cy, rIn, rOut, startDeg, endDeg) {
    const p1 = polar(cx, cy, rIn, startDeg);
    const p2 = polar(cx, cy, rIn, endDeg);
    const p3 = polar(cx, cy, rOut, endDeg);
    const p4 = polar(cx, cy, rOut, startDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      'M', p1[0].toFixed(2), p1[1].toFixed(2),
      'A', rIn, rIn, 0, largeArc, 1, p2[0].toFixed(2), p2[1].toFixed(2),
      'L', p3[0].toFixed(2), p3[1].toFixed(2),
      'A', rOut, rOut, 0, largeArc, 0, p4[0].toFixed(2), p4[1].toFixed(2),
      'Z'
    ].join(' ');
  }

  function arcLinePath(cx, cy, r, startDeg, endDeg, sweep) {
    const p1 = polar(cx, cy, r, startDeg);
    const p2 = polar(cx, cy, r, endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      'M', p1[0].toFixed(2), p1[1].toFixed(2),
      'A', r, r, 0, largeArc, sweep ? 1 : 0, p2[0].toFixed(2), p2[1].toFixed(2)
    ].join(' ');
  }

  function describeMinuteArc(radius, startMin, endMin) {
    const clampedStart = Math.max(0, Math.min(60, startMin));
    const clampedEnd = Math.max(0, Math.min(60, endMin));
    if (clampedEnd - clampedStart < 0.08) return '';
    return arcLinePath(150, 150, radius, -60 + clampedStart * 2, -60 + clampedEnd * 2, true);
  }

  // Opposite-side (Left 120°) Hour Gauge Arc: climbs clockwise upward from +120° (7h = 0h) to +240° (11h = 12h)
  function describeHourArc(radius, startHours, endHours) {
    const clampedStart = Math.max(0, Math.min(12, startHours));
    const clampedEnd = Math.max(0, Math.min(12, endHours));
    if (clampedEnd - clampedStart < 0.02) return '';
    return arcLinePath(150, 150, radius, 120 + clampedStart * 10, 120 + clampedEnd * 10, true);
  }

  function createGearPath(cx, cy, teeth, rOuter, rInner) {
    const parts = [];
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.48;
      const a3 = a0 + step * 0.70;
      const pts = [
        [cx + rInner * Math.cos(a0), cy + rInner * Math.sin(a0)],
        [cx + rOuter * Math.cos(a1), cy + rOuter * Math.sin(a1)],
        [cx + rOuter * Math.cos(a2), cy + rOuter * Math.sin(a2)],
        [cx + rInner * Math.cos(a3), cy + rInner * Math.sin(a3)]
      ];
      for (let j = 0; j < pts.length; j++) {
        parts.push((i === 0 && j === 0 ? 'M' : 'L') + pts[j][0].toFixed(2) + ',' + pts[j][1].toFixed(2));
      }
    }
    parts.push('Z');
    return parts.join(' ');
  }

  /**
   * Builds the authentic chunky, broad, blunted ("뭉툭한") 4-lobe CNC Maltese satellite wheel
   * directly modeled after the annotated Ōtsuka Lōtec No. 5 Kai macro photograph:
   * wide curved clover-disc lobes (48° broad rounded outer crowns) separated only by smooth
   * shallow concave 45° roller notches — NOT skinny rectangular cross tabs!
   */
  function buildBluntSatelliteWheelPath(rOuter, rShoulder, rNotch) {
    const dirs = [0, 90, 180, 270];
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const d = dirs[i];
      const pL0 = polar(0, 0, rShoulder, d - 33);
      const pL1 = polar(0, 0, rOuter, d - 23);
      const pR1 = polar(0, 0, rOuter, d + 23);
      const pR0 = polar(0, 0, rShoulder, d + 33);
      const nL0 = polar(0, 0, rShoulder, dirs[(i + 1) % 4] - 33);
      const qNotch = polar(0, 0, rNotch, d + 45);
      // Slight rounded corner transition from shoulder to broad outer arc
      const cL = polar(0, 0, rOuter + 0.5, d - 28.5);
      const cR = polar(0, 0, rOuter + 0.5, d + 28.5);

      if (i === 0) parts.push('M ' + pL0[0].toFixed(2) + ',' + pL0[1].toFixed(2));
      parts.push('Q ' + cL[0].toFixed(2) + ',' + cL[1].toFixed(2) + ' ' + pL1[0].toFixed(2) + ',' + pL1[1].toFixed(2));
      parts.push('A ' + rOuter.toFixed(1) + ',' + rOuter.toFixed(1) + ' 0 0,1 ' + pR1[0].toFixed(2) + ',' + pR1[1].toFixed(2));
      parts.push('Q ' + cR[0].toFixed(2) + ',' + cR[1].toFixed(2) + ' ' + pR0[0].toFixed(2) + ',' + pR0[1].toFixed(2));
      // Smooth shallow concave 45° roller indexing pocket
      parts.push('Q ' + qNotch[0].toFixed(2) + ',' + qNotch[1].toFixed(2) + ' ' + nL0[0].toFixed(2) + ',' + nL0[1].toFixed(2));
    }
    parts.push('Z');
    return parts.join(' ');
  }

  /**
   * Builds the chunky, broad, bluntly-chamfered hexagonal shield terrace under the 3-Arm Y-Bridge
   * (matching the wide flat-chamfered wings that closely frame the 6 & 5 pads in the macro photo!).
   */
  function buildBluntYBridgeTerracePath(cx, cy) {
    const armAngles = [-90, 30, 150];
    const segs = [];
    for (let i = 0; i < 3; i++) {
      const a = (armAngles[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux;

      // Broad blunt hexagonal shield wing around each satellite carrier arm
      const p0 = [cx + 21.5 * ux - 23.0 * vx, cy + 21.5 * uy - 23.0 * vy];
      const p1 = [cx + 42.5 * ux - 25.5 * vx, cy + 42.5 * uy - 25.5 * vy];
      const p2 = [cx + 55.5 * ux - 19.5 * vx, cy + 55.5 * uy - 19.5 * vy];
      const p3 = [cx + 62.0 * ux - 9.5 * vx, cy + 62.0 * uy - 9.5 * vy];
      const p4 = [cx + 62.0 * ux + 9.5 * vx, cy + 62.0 * uy + 9.5 * vy];
      const p5 = [cx + 55.5 * ux + 19.5 * vx, cy + 55.5 * uy + 19.5 * vy];
      const p6 = [cx + 42.5 * ux + 25.5 * vx, cy + 42.5 * uy + 25.5 * vy];
      const p7 = [cx + 21.5 * ux + 23.0 * vx, cy + 21.5 * uy + 23.0 * vy];

      const na = (armAngles[(i + 1) % 3] * Math.PI) / 180;
      const nux = Math.cos(na), nuy = Math.sin(na);
      const nvx = -nuy, nvy = nux;
      const np0 = [cx + 21.5 * nux - 23.0 * nvx, cy + 21.5 * nuy - 23.0 * nvy];
      const ma = ((armAngles[i] + 60) * Math.PI) / 180;
      const q = [cx + 19.5 * Math.cos(ma), cy + 19.5 * Math.sin(ma)];

      if (i === 0) segs.push('M ' + p0[0].toFixed(2) + ',' + p0[1].toFixed(2));
      segs.push('L ' + p1[0].toFixed(2) + ',' + p1[1].toFixed(2));
      segs.push('L ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2));
      segs.push('L ' + p3[0].toFixed(2) + ',' + p3[1].toFixed(2));
      segs.push('Q ' + (cx + 63.4 * ux).toFixed(2) + ',' + (cy + 63.4 * uy).toFixed(2) + ' ' + p4[0].toFixed(2) + ',' + p4[1].toFixed(2));
      segs.push('L ' + p5[0].toFixed(2) + ',' + p5[1].toFixed(2));
      segs.push('L ' + p6[0].toFixed(2) + ',' + p6[1].toFixed(2));
      segs.push('L ' + p7[0].toFixed(2) + ',' + p7[1].toFixed(2));
      segs.push('Q ' + q[0].toFixed(2) + ',' + q[1].toFixed(2) + ' ' + np0[0].toFixed(2) + ',' + np0[1].toFixed(2));
    }
    segs.push('Z');
    return segs.join(' ');
  }

  /**
   * Builds the substantial, blunt-crowned raised upper 3-Arm CNC Y-Bridge spine
   * (wider parallel flanks + gently flattened blunt machined crown matching the red-circled arms!).
   */
  function buildBluntYBridgeSpinePath(cx, cy, tipR, halfW, shoulderR, crotchR) {
    const armAngles = [-90, 30, 150];
    const segs = [];
    for (let i = 0; i < 3; i++) {
      const a = (armAngles[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux;

      const lx0 = cx + shoulderR * ux - halfW * vx;
      const ly0 = cy + shoulderR * uy - halfW * vy;
      const lx1 = cx + (tipR + 5.5) * ux - halfW * vx;
      const ly1 = cy + (tipR + 5.5) * uy - halfW * vy;
      const lt = cx + (tipR + 11.2) * ux - (halfW * 0.56) * vx;
      const lty = cy + (tipR + 11.2) * uy - (halfW * 0.56) * vy;
      const rt = cx + (tipR + 11.2) * ux + (halfW * 0.56) * vx;
      const rty = cy + (tipR + 11.2) * uy + (halfW * 0.56) * vy;
      const rx1 = cx + (tipR + 5.5) * ux + halfW * vx;
      const ry1 = cy + (tipR + 5.5) * uy + halfW * vy;
      const rx0 = cx + shoulderR * ux + halfW * vx;
      const ry0 = cy + shoulderR * uy + halfW * vy;

      const nextA = (armAngles[(i + 1) % 3] * Math.PI) / 180;
      const nux = Math.cos(nextA), nuy = Math.sin(nextA);
      const nvx = -nuy, nvy = nux;
      const nlx0 = cx + shoulderR * nux - halfW * nvx;
      const nly0 = cy + shoulderR * nuy - halfW * nvy;

      const midA = ((armAngles[i] + 60) * Math.PI) / 180;
      const qx = cx + crotchR * Math.cos(midA);
      const qy = cy + crotchR * Math.sin(midA);

      if (i === 0) segs.push('M ' + lx0.toFixed(2) + ',' + ly0.toFixed(2));
      segs.push('L ' + lx1.toFixed(2) + ',' + ly1.toFixed(2));
      segs.push('Q ' + (cx + (tipR + 10.6) * ux - halfW * vx).toFixed(2) + ',' + (cy + (tipR + 10.6) * uy - halfW * vy).toFixed(2) + ' ' + lt.toFixed(2) + ',' + lty.toFixed(2));
      segs.push('Q ' + (cx + (tipR + 12.6) * ux).toFixed(2) + ',' + (cy + (tipR + 12.6) * uy).toFixed(2) + ' ' + rt.toFixed(2) + ',' + rty.toFixed(2));
      segs.push('Q ' + (cx + (tipR + 10.6) * ux + halfW * vx).toFixed(2) + ',' + (cy + (tipR + 10.6) * uy + halfW * vy).toFixed(2) + ' ' + rx1.toFixed(2) + ',' + ry1.toFixed(2));
      segs.push('L ' + rx0.toFixed(2) + ',' + ry0.toFixed(2));
      segs.push('Q ' + qx.toFixed(2) + ',' + qy.toFixed(2) + ' ' + nlx0.toFixed(2) + ',' + nly0.toFixed(2));
    }
    segs.push('Z');
    return segs.join(' ');
  }

  function appendVectorHourNumeral(parent, num, cx, cy, deg) {
    const str = String(num);
    const g = createSvgEl('g', {
      transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ') rotate(' + deg + ')'
    });
    if (str.length === 1) {
      g.appendChild(createSvgEl('path', {
        d: DIGIT_PATHS[str],
        fill: 'none',
        stroke: '#111419',
        'stroke-width': '1.85',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        transform: 'scale(1.32)',
        class: 'sat-numeral-stroke'
      }));
    } else {
      const offsets = str === '11' ? [-3.7, 3.5] : [-4.7, 3.6];
      for (let i = 0; i < 2; i++) {
        g.appendChild(createSvgEl('path', {
          d: DIGIT_PATHS[str[i]],
          fill: 'none',
          stroke: '#111419',
          'stroke-width': '1.92',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          transform: 'translate(' + offsets[i] + ', 0) scale(1.02, 1.28)',
          class: 'sat-numeral-stroke'
        }));
      }
    }
    parent.appendChild(g);
  }

  function appendSlottedScrew(parent, cx, cy, r, slotAngleDeg, withCountersink) {
    const g = createSvgEl('g', { transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ')' });
    if (withCountersink) {
      g.appendChild(createSvgEl('circle', {
        cx: '0', cy: '0', r: (r + 1.0).toFixed(2),
        fill: '#5D6570', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.52'
      }));
    }
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: r.toFixed(2),
      fill: 'url(#no5ScrewHead)',
      stroke: '#58606B',
      'stroke-width': Math.max(0.5, r * 0.14).toFixed(2)
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.82).toFixed(2),
      fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.45'
    }));
    const sl = r * 0.84;
    g.appendChild(createSvgEl('line', {
      x1: (-sl).toFixed(2), y1: '0', x2: sl.toFixed(2), y2: '0',
      stroke: '#2E343D',
      'stroke-width': Math.max(0.65, r * 0.20).toFixed(2),
      'stroke-linecap': 'butt',
      transform: 'rotate(' + slotAngleDeg + ')'
    }));
    parent.appendChild(g);
  }

  function appendPolishedCapPost(parent, cx, cy, r) {
    const g = createSvgEl('g', { transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ')' });
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r + 1.1).toFixed(2),
      fill: '#5E6672', stroke: 'rgba(255,255,255,0.76)', 'stroke-width': '0.55'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: r.toFixed(2),
      fill: 'url(#no5CapPost)', stroke: '#4E5662', 'stroke-width': '0.85'
    }));
    g.appendChild(createSvgEl('path', {
      d: 'M 0,0 L -3.8,-6.6 L 3.8,-6.6 Z M 0,0 L -3.8,6.6 L 3.8,6.6 Z',
      fill: 'rgba(255,255,255,0.44)'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.78).toFixed(2),
      fill: 'none', stroke: 'rgba(255,255,255,0.82)', 'stroke-width': '0.62'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.34).toFixed(2),
      fill: 'none', stroke: 'rgba(65,73,84,0.28)', 'stroke-width': '0.45'
    }));
    parent.appendChild(g);
  }

  function appendRubyJewel(parent, cx, cy, r) {
    const g = createSvgEl('g', { transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ')' });
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r + 1.8).toFixed(2),
      fill: 'url(#no5ScrewHead)', stroke: '#5C6470', 'stroke-width': '0.65'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: r.toFixed(2),
      fill: 'url(#no5RubyJewel)', stroke: '#5E1148', 'stroke-width': '0.55'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.36).toFixed(2),
      fill: '#D8DEE6', stroke: '#4A1238', 'stroke-width': '0.35'
    }));
    g.appendChild(createSvgEl('circle', {
      cx: (-r * 0.42).toFixed(2), cy: (-r * 0.42).toFixed(2), r: (r * 0.24).toFixed(2),
      fill: 'rgba(255,220,248,0.88)'
    }));
    parent.appendChild(g);
  }

  /**
   * Builds the authentic Ōtsuka Lōtec flared cross-hatched diamond-knurled pinion crown
   * emerging cleanly from the thick r=139 steel case wall at 4:15 (+39°).
   */
  function buildDiamondKnurledCrown() {
    const CROWN_FLARE_D =
      'M 294.2,139.0 L 309.5,131.6 L 312.6,134.5 L 312.6,165.5 L 309.5,168.4 L 294.2,161.0 Z';

    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(39 150 150)',
      filter: 'url(#no5MechShadow)'
    });

    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '282', y: '116', width: '46', height: '68', rx: '8', fill: 'transparent'
    }));

    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '285.5', y: '146.0', width: '18.0', height: '8.0',
      fill: 'url(#no5CrownNeck)', stroke: '#252A32', 'stroke-width': '0.8'
    }));
    crownEl.appendChild(createSvgEl('line', {
      x1: '286.4', y1: '148.5', x2: '302.5', y2: '148.5',
      stroke: 'rgba(255,255,255,0.62)', 'stroke-width': '0.75'
    }));

    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });

    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '288.0', y: '143.0', width: '7.0', height: '14.0',
      fill: 'url(#no5CrownNeck)', stroke: '#2E343D', 'stroke-width': '0.8'
    }));
    crownSlideEl.appendChild(createSvgEl('line', {
      x1: '288.6', y1: '146.8', x2: '294.4', y2: '146.8',
      stroke: 'rgba(255,255,255,0.64)', 'stroke-width': '0.75'
    }));

    const rimTeeth = [
      'M 295.4,138.4 L 296.6,135.8 L 298.8,134.7 L 299.5,136.6',
      'M 299.7,136.4 L 301.1,133.6 L 303.4,132.5 L 304.1,134.4',
      'M 304.3,134.2 L 305.7,131.4 L 308.1,130.3 L 309.0,132.3',
      'M 295.4,161.6 L 296.6,164.2 L 298.8,165.3 L 299.5,163.4',
      'M 299.7,163.6 L 301.1,166.4 L 303.4,167.5 L 304.1,165.6',
      'M 304.3,165.8 L 305.7,168.6 L 308.1,169.7 L 309.0,167.7'
    ];
    rimTeeth.forEach(function (d) {
      crownSlideEl.appendChild(createSvgEl('path', {
        d: d, fill: 'url(#no5CrownCyl)', stroke: '#343A43', 'stroke-width': '0.72'
      }));
    });

    crownSlideEl.appendChild(createSvgEl('path', {
      class: 'crown-body',
      d: CROWN_FLARE_D,
      fill: 'url(#no5CrownCyl)',
      stroke: '#323842',
      'stroke-width': '1.12'
    }));

    const clipG = createSvgEl('g', { 'clip-path': 'url(#no5CrownClip)' });
    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls' });
    for (let i = -8; i <= 14; i++) {
      const y0 = 128 + i * 3.5;
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '293.5', y1: y0.toFixed(1), x2: '313.5', y2: (y0 + 18.0).toFixed(1),
        stroke: 'rgba(26,31,38,0.68)', 'stroke-width': '0.95'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '293.5', y1: (y0 + 1.1).toFixed(1), x2: '313.5', y2: (y0 + 19.1).toFixed(1),
        stroke: 'rgba(255,255,255,0.58)', 'stroke-width': '0.55'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '293.5', y1: (y0 + 18.0).toFixed(1), x2: '313.5', y2: y0.toFixed(1),
        stroke: 'rgba(26,31,38,0.62)', 'stroke-width': '0.9'
      }));
    }
    clipG.appendChild(crownKnurlsEl);
    crownSlideEl.appendChild(clipG);

    crownSlideEl.appendChild(createSvgEl('polygon', {
      points: '309.5,131.6 312.6,134.5 312.6,165.5 309.5,168.4',
      fill: 'url(#no5SteelCase)', opacity: '0.72', 'pointer-events': 'none'
    }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '309.5', y1: '132.0', x2: '309.5', y2: '168.0', stroke: '#323841', 'stroke-width': '0.95' }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '310.7', y1: '133.5', x2: '310.7', y2: '166.5', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.75' }));

    crownEl.appendChild(crownSlideEl);
    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl, crownClipD: CROWN_FLARE_D };
  }

  function buildClockSvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-22 -22 344 344',
      width: '100%',
      height: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'no5-svg is-no5kai-macro',
      role: 'img',
      'aria-label': 'NO.5 ELLIPSE — CASPER V1 새틀라이트 아워 시계'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildDiamondKnurledCrown();

    const gCrownNeck = createSvgEl('linearGradient', { id: 'no5CrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [['0%', '#282D35'], ['32%', '#848D98'], ['68%', '#4B525C'], ['100%', '#232830']].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    const gCrownCyl = createSvgEl('linearGradient', { id: 'no5CrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [
      ['0%', '#323841'],
      ['18%', '#CFD6DF'],
      ['36%', '#FFFFFF'],
      ['58%', '#AEB7C2'],
      ['82%', '#58606B'],
      ['100%', '#262B33']
    ].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownCyl);

    // Thick Monolithic Brushed 316L Stainless Steel Case & Lug Shoulder Gradient
    const gCaseBody = createSvgEl('linearGradient', { id: 'no5CaseBody', x1: '0%', y1: '10%', x2: '100%', y2: '90%' });
    [
      ['0%', '#D2D8E0'],
      ['15%', '#ECEFF4'],
      ['32%', '#9DA6B2'],
      ['52%', '#DCE1E8'],
      ['74%', '#8B94A0'],
      ['90%', '#C4CCD6'],
      ['100%', '#7D8692']
    ].forEach(function (s) {
      gCaseBody.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCaseBody);

    // Raised Circular Bezel Wall Metallic Sheen (high-contrast real 316L steel ring!)
    const gSteelCase = createSvgEl('linearGradient', { id: 'no5SteelCase', x1: '12%', y1: '4%', x2: '88%', y2: '96%' });
    [
      ['0%', '#F5F7FA'],
      ['22%', '#C4CCD6'],
      ['46%', '#EFF2F6'],
      ['72%', '#9BA4B0'],
      ['90%', '#D6DCE4'],
      ['100%', '#7A8390']
    ].forEach(function (s) {
      gSteelCase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSteelCase);

    // Thick Box-Sapphire Crystal Rim Wall Gradient (glassy silver-white double halo!)
    const gSapphireRim = createSvgEl('linearGradient', { id: 'no5SapphireRim', x1: '10%', y1: '8%', x2: '90%', y2: '92%' });
    [
      ['0%', '#FFFFFF'],
      ['26%', '#B8C1CC'],
      ['50%', '#F0F4F8'],
      ['76%', '#8E97A4'],
      ['100%', '#E4E9F0']
    ].forEach(function (s) {
      gSapphireRim.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSapphireRim);

    // Horizontal straight-brushed grain (signature No. 5 Kai monolithic forehead & lugs!)
    const pBrushedH = createSvgEl('pattern', { id: 'no5BrushedH', width: '28', height: '2.5', patternUnits: 'userSpaceOnUse' });
    pBrushedH.appendChild(createSvgEl('line', { x1: '0', y1: '0.6', x2: '28', y2: '0.6', stroke: 'rgba(255,255,255,0.38)', 'stroke-width': '0.55' }));
    pBrushedH.appendChild(createSvgEl('line', { x1: '0', y1: '1.7', x2: '28', y2: '1.7', stroke: 'rgba(34,40,50,0.16)', 'stroke-width': '0.48' }));
    defs.appendChild(pBrushedH);

    // Vertical straight-brushed hairline grain (bridges & satellite discs)
    const pBrushed = createSvgEl('pattern', { id: 'no5Brushed316L', width: '2.8', height: '20', patternUnits: 'userSpaceOnUse' });
    pBrushed.appendChild(createSvgEl('line', { x1: '0.6', y1: '0', x2: '0.6', y2: '20', stroke: 'rgba(255,255,255,0.34)', 'stroke-width': '0.5' }));
    pBrushed.appendChild(createSvgEl('line', { x1: '1.9', y1: '0', x2: '1.9', y2: '20', stroke: 'rgba(38,43,50,0.12)', 'stroke-width': '0.45' }));
    defs.appendChild(pBrushed);

    // Frosted micro bead-blasted silver grain
    const pFrosted = createSvgEl('pattern', { id: 'no5FrostedGrain', width: '4', height: '4', patternUnits: 'userSpaceOnUse' });
    pFrosted.appendChild(createSvgEl('circle', { cx: '1.0', cy: '1.2', r: '0.46', fill: 'rgba(255,255,255,0.28)' }));
    pFrosted.appendChild(createSvgEl('circle', { cx: '3.0', cy: '2.8', r: '0.42', fill: 'rgba(40,46,56,0.10)' }));
    defs.appendChild(pFrosted);

    // Luminous Frosted Bead-Blasted Silver-Grey Mainplate
    const gMainplate = createSvgEl('radialGradient', { id: 'no5Mainplate', cx: '46%', cy: '40%', r: '68%' });
    [['0%', '#E0E4EA'], ['48%', '#CDD3DC'], ['80%', '#B5BDC8'], ['100%', '#9AA3AF']].forEach(function (s) {
      gMainplate.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gMainplate);

    const gRecessSilver = createSvgEl('radialGradient', { id: 'no5RecessSilver', cx: '48%', cy: '44%', r: '64%' });
    [['0%', '#C4CBD4'], ['62%', '#A7B0BC'], ['100%', '#87919E']].forEach(function (s) {
      gRecessSilver.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gRecessSilver);

    const gPlaqueSteel = createSvgEl('linearGradient', { id: 'no5PlaqueSteel', x1: '12%', y1: '8%', x2: '88%', y2: '92%' });
    [['0%', '#ECEFF3'], ['42%', '#DCE1E8'], ['76%', '#C8CFD8'], ['100%', '#B2BAC5']].forEach(function (s) {
      gPlaqueSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPlaqueSteel);

    const gPaddleMetal = createSvgEl('radialGradient', { id: 'no5PaddleMetal', cx: '36%', cy: '30%', r: '74%' });
    [['0%', '#F5F7FA'], ['56%', '#DFE4EB'], ['86%', '#C2C9D3'], ['100%', '#A6AFBB']].forEach(function (s) {
      gPaddleMetal.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gPaddleMetal);

    const gBridgeSteel = createSvgEl('linearGradient', { id: 'no5BridgeSteel', x1: '10%', y1: '6%', x2: '90%', y2: '94%' });
    [['0%', '#F6F8FB'], ['32%', '#DCE1E8'], ['66%', '#BCC4CE'], ['100%', '#98A1AD']].forEach(function (s) {
      gBridgeSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBridgeSteel);

    const gTerraceSteel = createSvgEl('linearGradient', { id: 'no5TerraceSteel', x1: '8%', y1: '8%', x2: '92%', y2: '92%' });
    [['0%', '#DEE3EA'], ['48%', '#BCC4CE'], ['100%', '#8D96A3']].forEach(function (s) {
      gTerraceSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gTerraceSteel);

    const gSlotRecess = createSvgEl('linearGradient', { id: 'no5SlotRecess', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [['0%', '#505863'], ['32%', '#7E8793'], ['76%', '#B3BCC6'], ['100%', '#D6DCE3']].forEach(function (s) {
      gSlotRecess.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSlotRecess);

    const gScrewHead = createSvgEl('radialGradient', { id: 'no5ScrewHead', cx: '35%', cy: '30%', r: '70%' });
    [['0%', '#FFFFFF'], ['58%', '#D5DBE3'], ['100%', '#949DA9']].forEach(function (s) {
      gScrewHead.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gScrewHead);

    const gCapPost = createSvgEl('radialGradient', { id: 'no5CapPost', cx: '38%', cy: '32%', r: '68%' });
    [['0%', '#FFFFFF'], ['45%', '#E0E5EC'], ['82%', '#AEB7C3'], ['100%', '#7D8693']].forEach(function (s) {
      gCapPost.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCapPost);

    const gSunburstBase = createSvgEl('radialGradient', { id: 'no5SunburstBase', cx: '46%', cy: '42%', r: '62%' });
    [['0%', '#F4F6F9'], ['58%', '#DCE1E8'], ['100%', '#BFC7D1']].forEach(function (s) {
      gSunburstBase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSunburstBase);

    const gBrass = createSvgEl('linearGradient', { id: 'no5Brass', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#F5DC8A'], ['46%', '#D3A13E'], ['100%', '#91681B']].forEach(function (s) {
      gBrass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBrass);

    const gRuby = createSvgEl('radialGradient', { id: 'no5RubyJewel', cx: '35%', cy: '32%', r: '68%' });
    [['0%', '#E86CC7'], ['48%', '#A82A86'], ['100%', '#61104C']].forEach(function (s) {
      gRuby.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gRuby);

    const gGlass = createSvgEl('linearGradient', { id: 'no5GlassShine', x1: '6%', y1: '4%', x2: '94%', y2: '96%' });
    [
      ['0%', 'rgba(255,255,255,0.22)'],
      ['16%', 'rgba(255,255,255,0.07)'],
      ['30%', 'rgba(255,255,255,0)'],
      ['48%', 'rgba(255,255,255,0.06)'],
      ['56%', 'rgba(255,255,255,0)'],
      ['88%', 'rgba(24,27,32,0.02)'],
      ['100%', 'rgba(24,27,32,0.09)']
    ].forEach(function (s) {
      gGlass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGlass);

    const fMechShadow = createSvgEl('filter', {
      id: 'no5MechShadow', filterUnits: 'userSpaceOnUse', x: '-30', y: '-30', width: '360', height: '360'
    });
    fMechShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.0', dy: '1.9', stdDeviation: '1.8', 'flood-color': '#181E28', 'flood-opacity': '0.32' }));
    defs.appendChild(fMechShadow);

    const fBridgeShadow = createSvgEl('filter', {
      id: 'no5BridgeShadow', filterUnits: 'userSpaceOnUse', x: '-30', y: '-30', width: '360', height: '360'
    });
    fBridgeShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.5', dy: '2.8', stdDeviation: '2.3', 'flood-color': '#141922', 'flood-opacity': '0.40' }));
    defs.appendChild(fBridgeShadow);

    // Compact, tightly framed dial opening (r = 113.0 inside the beefy r = 139.0 steel case!)
    const clipDial = createSvgEl('clipPath', { id: 'no5DialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '113.0' }));
    defs.appendChild(clipDial);

    // Thick, beefy monolithic Ōtsuka Lōtec No. 5 Kai 316L steel case with broad integrated shoulders & lugs
    const clipCase = createSvgEl('clipPath', { id: 'no5CaseClip' });
    const CASE_SILHOUETTE_D =
      'M 70,-14 L 83,-14 L 85,-2 Q 150,-6 215,-2 L 217,-14 L 230,-14 ' +
      'Q 236,-14 237,-4 L 241,28 Q 246,44 256,58 ' +
      'A 139.0,139.0 0 0,1 256,242 Q 246,256 241,272 L 237,304 Q 236,314 230,314 ' +
      'L 217,314 L 215,302 Q 150,306 85,302 L 83,314 L 70,314 ' +
      'Q 64,314 63,304 L 59,272 Q 54,256 44,242 ' +
      'A 139.0,139.0 0 0,1 44,58 Q 54,44 59,28 L 63,-4 Q 64,-14 70,-14 Z';
    clipCase.appendChild(createSvgEl('path', { d: CASE_SILHOUETTE_D }));
    defs.appendChild(clipCase);

    const clipCrown = createSvgEl('clipPath', { id: 'no5CrownClip' });
    clipCrown.appendChild(createSvgEl('path', { d: crownBuilt.crownClipD }));
    defs.appendChild(clipCrown);

    // Tightly framed flush perimeter engravings hugging the r=113 glass rim (clear of 7:30 screw!)
    defs.appendChild(createSvgEl('path', { id: 'no5TopPlaquePath', d: arcLinePath(150, 150, 102.2, 200, 274, true) }));
    defs.appendChild(createSvgEl('path', { id: 'no5BotPlaquePath', d: arcLinePath(150, 150, 104.8, 145, 105, false) }));

    svg.appendChild(defs);

    const visualRingEl = createSvgEl('circle', {
      id: 'no5VisualAlarmRing', class: 'visual-alarm-ring',
      cx: '150', cy: '150', r: '146.5', fill: 'none', 'stroke-width': '4'
    });
    svg.appendChild(visualRingEl);

    // LAYER (1): Flared Diamond-Knurled Pinion Crown at 4:15 (+39°)
    svg.appendChild(crownBuilt.crownEl);

    const dialClickableEl = createSvgEl('g', { id: 'no5DialClickable', class: 'dial-clickable' });

    // =========================================================================
    // LAYER (2): Thick Substantial Brushed 316L Stainless Steel Case, Broad Lugs,
    //            Stepped Circular Bezel (r=127.5) & Thick Box-Sapphire Dome Wall!
    // =========================================================================
    const caseG = createSvgEl('g', { class: 'no5-case-body', filter: 'url(#no5MechShadow)' });
    // Outer monolithic brushed 316L steel case body (r=139 + broad horizontal-brushed lug decks!)
    caseG.appendChild(createSvgEl('path', {
      d: CASE_SILHOUETTE_D,
      fill: 'url(#no5CaseBody)', stroke: '#626A76', 'stroke-width': '1.35'
    }));
    caseG.appendChild(createSvgEl('path', {
      d: CASE_SILHOUETTE_D,
      fill: 'url(#no5BrushedH)', opacity: '0.84', 'clip-path': 'url(#no5CaseClip)', 'pointer-events': 'none'
    }));
    // Subtle outer sculpted chamfer rim around case flank
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '136.5',
      fill: 'none', stroke: 'rgba(255,255,255,0.45)', 'stroke-width': '1.2', 'clip-path': 'url(#no5CaseClip)', 'pointer-events': 'none'
    }));
    // Raised substantial circular 316L bezel ring (r=127.5 -> 118.2)
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '127.5',
      fill: 'url(#no5SteelCase)', stroke: '#5C6470', 'stroke-width': '1.35', class: 'case-bezel'
    }));
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '125.6',
      fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '1.0'
    }));
    // Thick high-profile Box-Sapphire Crystal optical edge wall (r=118.4 -> 113.0!)
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '118.4',
      fill: 'url(#no5SapphireRim)', stroke: '#545C68', 'stroke-width': '1.05', class: 'case-rehaut'
    }));
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '115.6',
      fill: 'none', stroke: 'rgba(255,255,255,0.82)', 'stroke-width': '1.15'
    }));
    caseG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '113.0',
      fill: 'url(#no5Mainplate)', stroke: '#4A525E', 'stroke-width': '0.9', class: 'dial-base'
    }));
    dialClickableEl.appendChild(caseG);

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#no5DialClip)' });

    // =========================================================================
    // LAYER (A): Tightly Packed Frosted Silver Mainplate, Brass Gears & 2 Rubies
    // =========================================================================
    const mainplateG = createSvgEl('g', { class: 'satclk-mainplate' });
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '113.0', fill: 'url(#no5FrostedGrain)', opacity: '0.86' }));

    mainplateG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '89.5',
      fill: 'url(#no5RecessSilver)', stroke: '#7B8490', 'stroke-width': '0.9', class: 'skeleton-recess'
    }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '89.0', fill: 'url(#no5FrostedGrain)', opacity: '0.68' }));
    mainplateG.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '66.0',
      fill: '#8E97A4', stroke: '#6E7784', 'stroke-width': '0.8', opacity: '0.72'
    }));

    // 2 o'clock Open Warm Gold-Brass Wheel & Purple-Magenta Ruby Jewel (clearly sparkling in 2h window!)
    const balEl = createSvgEl('g', { id: 'no5BalanceWheel', transform: 'translate(182, 118)' });
    balEl.appendChild(createSvgEl('path', {
      d: createGearPath(0, 0, 26, 25.5, 22.8),
      fill: 'url(#no5Brass)', stroke: '#87601A', 'stroke-width': '0.68'
    }));
    balEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '18.8', fill: '#D4AC4E', stroke: '#8E681E', 'stroke-width': '0.68' }));
    for (let bs = 0; bs < 4; bs++) {
      balEl.appendChild(createSvgEl('circle', {
        cx: (12.0 * Math.cos(bs * Math.PI / 2)).toFixed(1),
        cy: (12.0 * Math.sin(bs * Math.PI / 2)).toFixed(1),
        r: '4.0', fill: '#7B8491', stroke: '#7A5818', 'stroke-width': '0.52'
      }));
    }
    balEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '6.2', fill: 'url(#no5Brass)', stroke: '#7A5818', 'stroke-width': '0.58' }));
    mainplateG.appendChild(balEl);

    // 1:45 Purple-Magenta Ruby Jewel + 6:30 Purple-Magenta Ruby Jewel (vivid glints peeking through bays!)
    appendRubyJewel(mainplateG, 178.0, 111.5, 4.3);
    mainplateG.appendChild(createSvgEl('circle', { cx: '121.0', cy: '199.5', r: '10.6', fill: '#7C8592', stroke: '#666F7C', 'stroke-width': '0.75' }));
    appendRubyJewel(mainplateG, 121.0, 199.5, 4.1);

    // 9:00 Double-Layer Brass + Silver Toothed Reduction Wheel (clearly visible in 9h bay!)
    const gearPrimaryG = createSvgEl('g', { transform: 'translate(89, 150)' });
    const subGearEl = createSvgEl('g', { id: 'no5SubGear' });
    subGearEl.appendChild(createSvgEl('path', {
      d: createGearPath(0, 0, 32, 36.5, 33.2),
      fill: 'url(#no5Brass)', stroke: '#87601A', 'stroke-width': '0.62'
    }));
    subGearEl.appendChild(createSvgEl('path', {
      d: createGearPath(0, 0, 30, 31.6, 28.4),
      fill: 'url(#no5PlaqueSteel)', stroke: '#5F6773', 'stroke-width': '0.78'
    }));
    subGearEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '22.8', fill: '#A8B1BC', stroke: '#6E7784', 'stroke-width': '0.78' }));
    for (let sp = 0; sp < 3; sp++) {
      subGearEl.appendChild(createSvgEl('path', {
        d: 'M -3.2,-22.8 L 3.2,-22.8 L 2.1,-6.8 L -2.1,-6.8 Z',
        fill: 'url(#no5BridgeSteel)', stroke: '#626A76', 'stroke-width': '0.62', transform: 'rotate(' + (sp * 120) + ')'
      }));
    }
    subGearEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '8.0', fill: 'url(#no5BridgeSteel)', stroke: '#5C6470', 'stroke-width': '0.78' }));
    appendSlottedScrew(subGearEl, 0, 0, 3.2, 24);
    gearPrimaryG.appendChild(subGearEl);
    mainplateG.appendChild(gearPrimaryG);

    const gearSecondaryG = createSvgEl('g', { transform: 'translate(113, 112)' });
    const subGear2El = createSvgEl('g', { id: 'no5SubGear2' });
    subGear2El.appendChild(createSvgEl('path', {
      d: createGearPath(0, 0, 18, 16.5, 14.0),
      fill: 'url(#no5PlaqueSteel)', stroke: '#626A76', 'stroke-width': '0.72'
    }));
    subGear2El.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '10.0', fill: '#929BA8', stroke: '#69727E', 'stroke-width': '0.72' }));
    subGear2El.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '3.8', fill: '#E4E8EE', stroke: '#5E6672', 'stroke-width': '0.62' }));
    gearSecondaryG.appendChild(subGear2El);
    mainplateG.appendChild(gearSecondaryG);

    // Sculpted Left Openwork Steel Bridge Flange tightly hugging the r=113 glass rim + 10:00 & 7:30 screws!
    const leftBridgeD =
      'M 57,120 Q 60,104 72,98 L 87,104 Q 78,115 76,128 ' +
      'A 32,32 0 0,0 78,178 Q 84,193 90,206 L 78,216 Q 63,207 57,191 ' +
      'A 92,92 0 0,1 57,120 Z';
    mainplateG.appendChild(createSvgEl('path', {
      d: leftBridgeD, fill: 'url(#no5BridgeSteel)', stroke: '#5C6470', 'stroke-width': '0.9',
      filter: 'url(#no5MechShadow)'
    }));
    mainplateG.appendChild(createSvgEl('path', {
      d: leftBridgeD, fill: 'url(#no5Brushed316L)', opacity: '0.45', 'pointer-events': 'none'
    }));
    appendSlottedScrew(mainplateG, 67.5, 111.5, 4.9, -40, true);
    appendSlottedScrew(mainplateG, 79.0, 206.5, 4.6, 35, true);

    // Iconic Crimson-Red Curved Motion Arrow (→) tucked tightly inside 05..25 minute track!
    const redArrowG = createSvgEl('g', { class: 'no5-red-motion-arrow' });
    redArrowG.appendChild(createSvgEl('path', {
      d: arcLinePath(150, 150, 84.8, -50, -14, true),
      fill: 'none', stroke: '#B6222C', 'stroke-width': '1.6', 'stroke-linecap': 'round'
    }));
    const ahTip = polar(150, 150, 84.8, -9.5);
    const ahL = polar(150, 150, 87.0, -15.5);
    const ahR = polar(150, 150, 82.5, -15.0);
    redArrowG.appendChild(createSvgEl('polygon', {
      points: ahTip[0].toFixed(1) + ',' + ahTip[1].toFixed(1) + ' ' +
              ahL[0].toFixed(1) + ',' + ahL[1].toFixed(1) + ' ' +
              ahR[0].toFixed(1) + ',' + ahR[1].toFixed(1),
      fill: '#B6222C'
    }));
    mainplateG.appendChild(redArrowG);

    dialInner.appendChild(mainplateG);

    const rollerOuterG = createSvgEl('g', { id: 'no5RollerBearing', transform: 'translate(74, 184)', opacity: '0.88' });
    const rollerBallsEl = createSvgEl('g', { id: 'no5RollerBalls' });
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '5.0', fill: 'url(#no5SteelCase)', stroke: '#555D68', 'stroke-width': '0.78' }));
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '2.2', fill: '#4A525D' }));
    rollerOuterG.appendChild(rollerBallsEl);
    dialInner.appendChild(rollerOuterG);

    // =========================================================================
    // LAYER (E): Tightly Nestled 5:45 Radial Sunburst Small-Seconds Subdial
    // =========================================================================
    const secOuterG = createSvgEl('g', { transform: 'translate(152, 217)' });
    secOuterG.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: '39.2', fill: '#77808C', stroke: '#5E6672', 'stroke-width': '0.9', class: 'subdial-well'
    }));

    const secDiscEl = createSvgEl('g', { id: 'no5SecondsDisc' });
    secDiscEl.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: '38.1', fill: 'url(#no5SunburstBase)', stroke: '#7B838E', 'stroke-width': '0.78', class: 'sat-disc-face'
    }));

    [
      [0, 38, 'rgba(255,255,255,0.48)'],
      [48, 92, 'rgba(42,48,58,0.16)'],
      [112, 150, 'rgba(255,255,255,0.42)'],
      [174, 218, 'rgba(42,48,58,0.18)'],
      [236, 274, 'rgba(255,255,255,0.46)'],
      [298, 338, 'rgba(42,48,58,0.15)']
    ].forEach(function (w) {
      const q1 = polar(0, 0, 37.8, w[0]);
      const q2 = polar(0, 0, 37.8, w[1]);
      secDiscEl.appendChild(createSvgEl('path', {
        d: 'M 0,0 L ' + q1[0].toFixed(2) + ',' + q1[1].toFixed(2) + ' A 37.8,37.8 0 0,1 ' + q2[0].toFixed(2) + ',' + q2[1].toFixed(2) + ' Z',
        fill: w[2]
      }));
    });

    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 24.0 : 27.4;
      const r2 = 31.8;
      secDiscEl.appendChild(createSvgEl('line', {
        x1: (r1 * Math.cos(rad)).toFixed(2), y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2), y2: (r2 * Math.sin(rad)).toFixed(2),
        class: s === 0 ? 'sec-tick-zero' : 'sec-tick',
        stroke: '#181D24', 'stroke-width': major ? '1.1' : '0.58', 'stroke-linecap': 'butt'
      }));
      if (major) {
        const rt = 35.0;
        const tx = rt * Math.cos(rad);
        const ty = rt * Math.sin(rad);
        const txt = createSvgEl('text', {
          x: tx.toFixed(1), y: ty.toFixed(1),
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-family': TECH_FONT, 'font-size': '5.5', 'font-weight': '700',
          class: s === 0 ? 'sec-label-zero' : 'sec-label',
          fill: '#181D24',
          transform: 'rotate(' + (s * 6 + 180) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')'
        });
        txt.textContent = s === 0 ? '60' : String(s).padStart(2, '0');
        secDiscEl.appendChild(txt);
      }
    }
    secOuterG.appendChild(secDiscEl);

    // Large Conical Sunburst Brushed Silver Central Cap + Crimson ▼ Pointer + Micro Steel Hub
    secOuterG.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: '18.2',
      fill: 'url(#no5BridgeSteel)', stroke: '#666E7A', 'stroke-width': '0.9', class: 'subdial-cap',
      filter: 'url(#no5MechShadow)'
    }));
    secOuterG.appendChild(createSvgEl('path', { d: 'M 0,0 L -10,-16 L 10,-16 Z M 0,0 L -10,16 L 10,16 Z', fill: 'rgba(255,255,255,0.44)' }));
    secOuterG.appendChild(createSvgEl('path', { d: 'M 0,0 L -17,-7.5 L -17,7.5 Z M 0,0 L 17,-7.5 L 17,7.5 Z', fill: 'rgba(42,48,58,0.18)' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '17.1', fill: 'none', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.6' }));
    secOuterG.appendChild(createSvgEl('polygon', {
      points: '-3.4,7.6 3.4,7.6 0,14.6',
      class: 'sec-pointer', fill: '#C8252E', stroke: '#7B151B', 'stroke-width': '0.4'
    }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '4.4', fill: 'url(#no5CapPost)', stroke: '#555D68', 'stroke-width': '0.7' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '2.3', fill: '#5B6370', stroke: '#DCE2EA', 'stroke-width': '0.48' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '1.05', fill: '#F1F4F8' }));
    dialInner.appendChild(secOuterG);

    // =========================================================================
    // LAYER (F): 3 Chunky Blunted 4-Lobe Satellite Hour Wheels (1..12)
    //            + Flush Straight Non-Protruding 3-Chord Spring Wires (Rotating!)
    //            + Chunky Shield-Terrace 3-Arm CNC Y-Bridge
    // =========================================================================
    const satAssemblyG = createSvgEl('g', { id: 'no5SatelliteAssembly', filter: 'url(#no5MechShadow)' });
    const satWheelD = buildBluntSatelliteWheelPath(43.8, 37.8, 27.6);
    const satGroups = [];

    for (let k = 0; k < 3; k++) {
      const outer = createSvgEl('g', { id: 'no5SatDisc' + k, 'data-sat-disc': String(k) });
      const inner = createSvgEl('g');

      inner.appendChild(createSvgEl('path', {
        d: satWheelD, fill: 'url(#no5PaddleMetal)', stroke: '#59616D', 'stroke-width': '0.95', class: 'sat-disc-face'
      }));
      inner.appendChild(createSvgEl('path', { d: satWheelD, fill: 'url(#no5Brushed316L)', opacity: '0.42' }));
      inner.appendChild(createSvgEl('path', {
        d: satWheelD, fill: 'none', stroke: 'rgba(255,255,255,0.80)', 'stroke-width': '0.68',
        transform: 'scale(0.958)', class: 'sat-chamfer'
      }));

      for (let j = 0; j < 4; j++) {
        const num = DISC_NUMS[k][j];
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 31.2;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);

        // Bold Katayama numeral positioned cleanly on the broad blunted outer silver pad (NO clumsy tick line!)
        appendVectorHourNumeral(inner, num, tx, ty, deg);
      }

      inner.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '9.0', fill: 'url(#no5PlaqueSteel)', stroke: '#626A75', 'stroke-width': '0.8' }));
      appendSlottedScrew(inner, 0, 0, 4.8, 28 + k * 40);

      outer.appendChild(inner);
      satAssemblyG.appendChild(outer);
      satGroups.push({ outer: outer, inner: inner });
    }

    // Flush, Non-Protruding 120°-Symmetric Straight 3-Chord Spring-Steel Detent Wires:
    // ZERO protruding outward ears — pure straight taut hair-wires tucked completely under the wide terrace shoulders!
    const triWireEl = createSvgEl('g', { id: 'no5TriWireSpring', class: 'satclk-tri-wire' });
    const wireSegs = [];
    const armAnglesWire = [-90, 30, 150];
    for (let wi = 0; wi < 3; wi++) {
      const a0 = armAnglesWire[wi];
      const aNext = armAnglesWire[(wi + 2) % 3];
      // Endpoints at r=59.2, arm ± 18.5° sit cleanly tucked INSIDE/BENEATH the wide hexagonal shield wings!
      const p1 = polar(150, 150, 59.2, a0 - 18.5);
      const p2 = polar(150, 150, 59.2, aNext + 18.5);
      wireSegs.push(
        'M ' + p1[0].toFixed(2) + ',' + p1[1].toFixed(2) +
        ' L ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2)
      );
    }
    const hairWiresD = wireSegs.join(' ');
    triWireEl.appendChild(createSvgEl('path', {
      d: hairWiresD, fill: 'none', stroke: 'rgba(18,24,34,0.22)', 'stroke-width': '0.9',
      'stroke-linecap': 'round', transform: 'translate(0.45, 0.75)'
    }));
    triWireEl.appendChild(createSvgEl('path', {
      d: hairWiresD, fill: 'none', stroke: '#4A5360', 'stroke-width': '0.98', 'stroke-linecap': 'round'
    }));
    triWireEl.appendChild(createSvgEl('path', {
      d: hairWiresD, fill: 'none', stroke: '#FFFFFF', 'stroke-width': '0.48', 'stroke-linecap': 'round', class: 'steel-wire'
    }));
    satAssemblyG.appendChild(triWireEl);

    // Sculptural Chunky Shield-Terrace 3-Arm CNC Y-Bridge (EXACTLY matching the red-circled structures!)
    const bridgeEl = createSvgEl('g', { id: 'no5CarouselBridge', filter: 'url(#no5BridgeShadow)' });
    const yTerraceD = buildBluntYBridgeTerracePath(150, 150);
    const yOuterD = buildBluntYBridgeSpinePath(150, 150, ORBIT_R, 13.6, 21.8, 18.8);
    const yChamferD = buildBluntYBridgeSpinePath(150, 150, ORBIT_R - 0.5, 11.9, 21.2, 20.2);

    // Step 1: Wide blunt chamfered hexagonal shield terrace plate + 6 flanking shoulder screws!
    bridgeEl.appendChild(createSvgEl('path', {
      d: yTerraceD, fill: 'url(#no5TerraceSteel)', stroke: '#4E5662', 'stroke-width': '1.05', class: 'bridge-terrace'
    }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: yTerraceD, fill: 'url(#no5Brushed316L)', opacity: '0.46', 'pointer-events': 'none'
    }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: yTerraceD, fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.72',
      transform: 'translate(150,150) scale(0.968) translate(-150,-150)', 'pointer-events': 'none'
    }));

    for (let fa = 0; fa < 3; fa++) {
      const fArmG = createSvgEl('g', { transform: 'rotate(' + (fa * 120) + ' 150 150)' });
      appendSlottedScrew(fArmG, 132.5, 118.5, 3.1, 18 + fa * 35, true);
      appendSlottedScrew(fArmG, 167.5, 118.5, 3.1, -34 + fa * 22, true);
      bridgeEl.appendChild(fArmG);
    }

    // Step 2: Substantial blunt-crowned raised upper Y-arm spine with continuous bright 45° chamfer!
    bridgeEl.appendChild(createSvgEl('path', {
      d: yOuterD, fill: 'url(#no5BridgeSteel)', stroke: '#4C5460', 'stroke-width': '1.1', class: 'bridge-arm'
    }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: yOuterD, fill: 'url(#no5Brushed316L)', opacity: '0.42', 'pointer-events': 'none'
    }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: yChamferD, fill: 'none', stroke: 'rgba(255,255,255,0.88)', 'stroke-width': '0.9', class: 'bridge-chamfer'
    }));

    // Step 3: Bold milled pill slot + smooth concentric polished steel tip cap post + root screw per arm!
    for (let arm = 0; arm < 3; arm++) {
      const armG = createSvgEl('g', { transform: 'rotate(' + (arm * 120) + ' 150 150)' });
      armG.appendChild(createSvgEl('rect', {
        x: '147.2', y: '113.5', width: '5.6', height: '19.0', rx: '2.8',
        fill: 'url(#no5SlotRecess)', stroke: '#4C5460', 'stroke-width': '0.78'
      }));
      armG.appendChild(createSvgEl('rect', {
        x: '148.0', y: '114.3', width: '4.0', height: '17.4', rx: '2.0',
        fill: 'none', stroke: 'rgba(255,255,255,0.52)', 'stroke-width': '0.48'
      }));
      appendPolishedCapPost(armG, 150, 150 - ORBIT_R, 7.6);
      appendSlottedScrew(armG, 150, 136.2, 2.9, -28 + arm * 30, false);
      bridgeEl.appendChild(armG);
    }

    // Step 4: Solid Polished Steel Domed/Chamfered Center Hub Cap
    bridgeEl.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '11.2',
      fill: '#5D6571', stroke: 'rgba(255,255,255,0.78)', 'stroke-width': '0.7'
    }));
    bridgeEl.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '9.2',
      fill: 'url(#no5CapPost)', stroke: '#4A525E', 'stroke-width': '0.9'
    }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: 'M 150,150 L 145,141.5 L 155,141.5 Z M 150,150 L 145,158.5 L 155,158.5 Z',
      fill: 'rgba(255,255,255,0.50)'
    }));
    bridgeEl.appendChild(createSvgEl('circle', {
      cx: '150', cy: '150', r: '7.4',
      fill: 'none', stroke: 'rgba(255,255,255,0.76)', 'stroke-width': '0.58'
    }));
    bridgeEl.appendChild(createSvgEl('line', {
      x1: '150', y1: '142.2', x2: '150', y2: '157.8',
      stroke: 'rgba(42,48,58,0.22)', 'stroke-width': '0.65'
    }));

    satAssemblyG.appendChild(bridgeEl);
    dialInner.appendChild(satAssemblyG);

    // =========================================================================
    // LAYER (G): Compact Right 120° Minute Scale Plate (r=89.5..113.0, packed tight!)
    // =========================================================================
    const minutePlateG = createSvgEl('g', { id: 'no5MinutePlate', filter: 'url(#no5MechShadow)' });
    const minPlateD = arcSectorPath(150, 150, 89.5, 113.2, -64.0, 64.5);
    minutePlateG.appendChild(createSvgEl('path', {
      d: minPlateD, fill: 'url(#no5PlaqueSteel)', stroke: '#626A76', 'stroke-width': '0.9', class: 'minute-plate-face'
    }));
    minutePlateG.appendChild(createSvgEl('path', {
      d: minPlateD, fill: 'url(#no5Brushed316L)', opacity: '0.35', 'pointer-events': 'none'
    }));
    minutePlateG.appendChild(createSvgEl('path', {
      d: arcLinePath(150, 150, 90.3, -63, 63, true),
      fill: 'none', stroke: 'rgba(255,255,255,0.76)', 'stroke-width': '0.62'
    }));

    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isTen = m % 10 === 0;
      const isFive = m % 5 === 0;

      const rIn = 90.4;
      const rOut = isTen ? 98.2 : (isFive ? 96.0 : 94.0);
      minutePlateG.appendChild(createSvgEl('line', {
        x1: (150 + rIn * Math.cos(rad)).toFixed(2), y1: (150 + rIn * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut * Math.cos(rad)).toFixed(2), y2: (150 + rOut * Math.sin(rad)).toFixed(2),
        class: isTen ? 'min-tick-quarter' : (isFive ? 'min-tick-major' : 'min-tick-minor'),
        stroke: '#14181F', 'stroke-width': isTen ? '1.38' : (isFive ? '0.98' : '0.62'), 'stroke-linecap': 'butt'
      }));

      if (isFive) {
        const rTxt = isTen ? 104.8 : 103.5;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const label = m < 10 ? ('0' + m) : String(m);
        let rotAttr = '';
        if (m === 0) rotAttr = 'rotate(-60 ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')';
        else if (m === 60) rotAttr = 'rotate(60 ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')';
        else if (m === 5 || m === 10 || m === 50 || m === 55) rotAttr = 'rotate(' + (deg * 0.55).toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')';

        const attrs = {
          x: tx.toFixed(1), y: ty.toFixed(1),
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-family': TECH_FONT,
          'font-size': isTen ? '9.6' : '6.0',
          'font-weight': isTen ? '800' : '700',
          'letter-spacing': '-0.25',
          class: isTen ? 'min-label-quarter' : 'min-label',
          fill: '#13171D'
        };
        if (rotAttr) attrs.transform = rotAttr;
        const mTxt = createSvgEl('text', attrs);
        mTxt.textContent = label;
        minutePlateG.appendChild(mTxt);
      }
    }
    dialInner.appendChild(minutePlateG);

    // =========================================================================
    // LAYER (G3): Tightly Framed Flush Perimeter Engravings
    // =========================================================================
    const plaquesG = createSvgEl('g', { class: 'homage-plaques' });
    const topEngraving = createSvgEl('text', {
      'font-family': TECH_FONT, 'font-size': '7.6', 'font-weight': '800',
      fill: '#181D25', 'letter-spacing': '0.95', class: 'plaque-title'
    });
    const topEngravingPath = createSvgEl('textPath', { href: '#no5TopPlaquePath', startOffset: '50%', 'text-anchor': 'middle' });
    topEngravingPath.setAttributeNS(XLINK_NS, 'xlink:href', '#no5TopPlaquePath');
    topEngravingPath.textContent = 'CASPER™ · V1';
    topEngraving.appendChild(topEngravingPath);
    plaquesG.appendChild(topEngraving);

    const botEngraving = createSvgEl('text', {
      'font-family': TECH_FONT, 'font-size': '7.1', 'font-weight': '800',
      fill: '#181D25', 'letter-spacing': '0.78', class: 'plaque-sub'
    });
    const botEngravingPath = createSvgEl('textPath', { href: '#no5BotPlaquePath', startOffset: '50%', 'text-anchor': 'middle' });
    botEngravingPath.setAttributeNS(XLINK_NS, 'xlink:href', '#no5BotPlaquePath');
    botEngravingPath.textContent = 'NO.5 ELLIPSE';
    botEngraving.appendChild(botEngravingPath);
    plaquesG.appendChild(botEngraving);
    dialInner.appendChild(plaquesG);

    // =========================================================================
    // LAYER (H): Box Sapphire Crystal Reflection & Thick Rim Refraction
    // =========================================================================
    dialInner.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '113.0', fill: 'url(#no5GlassShine)', 'pointer-events': 'none' }));
    dialInner.appendChild(createSvgEl('path', {
      d: 'M 58,84 Q 112,46 186,52 Q 128,70 74,114 Z',
      fill: 'rgba(255,255,255,0.12)', 'pointer-events': 'none'
    }));
    dialClickableEl.appendChild(dialInner);

    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '113.0', fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '1.5', 'pointer-events': 'none' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '111.0', fill: 'none', stroke: 'rgba(42,48,58,0.16)', 'stroke-width': '0.7', 'pointer-events': 'none' }));
    svg.appendChild(dialClickableEl);

    return {
      svg: svg,
      satGroups: satGroups,
      triWireEl: triWireEl,
      bridgeEl: bridgeEl,
      secDiscEl: secDiscEl,
      balEl: balEl,
      subGearEl: subGearEl,
      subGear2El: subGear2El,
      rollerBallsEl: rollerBallsEl,
      visualRingEl: visualRingEl,
      crownEl: crownBuilt.crownEl,
      crownSlideEl: crownBuilt.crownSlideEl,
      crownKnurlsEl: crownBuilt.crownKnurlsEl,
      dialClickableEl: dialClickableEl
    };
  }

  function mount(containerEl, handlers) {
    if (!containerEl) return null;
    const cb = handlers || {};
    containerEl.textContent = '';

    const parts = buildClockSvg();
    containerEl.appendChild(parts.svg);

    const crownOverlayEl = document.createElement('div');
    crownOverlayEl.id = 'no5CrownTouchOverlay';
    crownOverlayEl.className = 'crown-touch-overlay';
    crownOverlayEl.setAttribute('tabindex', '0');
    crownOverlayEl.setAttribute('role', 'slider');
    crownOverlayEl.setAttribute('aria-label', '4시 용두 (0단 잠금) — 1회 클릭 1단(±1분), 2회 클릭 2단(±5분), 3회 클릭 잠금 복귀');
    containerEl.appendChild(crownOverlayEl);

    let crownPosition = 0; // 0 = locked, 1 = ±1 min, 2 = ±5 min
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let downClientX = 0;
    let downClientY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let dragAccum = 0;
    let gestureStepsEmitted = 0;
    let lockedHintEmitted = false;
    let turnTimerId = null;

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

      const ariaText = crownPosition === 2
        ? '4시 용두 2단 인출됨 (±5분 설정) — 휠·드래그로 ±5분 조절, 클릭 시 0단 잠금 복귀'
        : (crownPosition === 1
          ? '4시 용두 1단 인출됨 (±1분 설정) — 휠·드래그로 ±1분 조절, 한 번 더 클릭 시 2단(±5분)'
          : '4시 용두 (0단 잠금) — 1회 클릭 1단(±1분), 2회 클릭 2단(±5분)');
      crownOverlayEl.setAttribute('aria-label', ariaText);

      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(crownPosition === 2 ? [10, 14, 10] : (crownPosition === 1 ? [10, 16, 6] : 10));
        } catch (err) {}
      }
      if (!silent && typeof cb.onCrownPullChange === 'function') {
        cb.onCrownPullChange(crownPosition);
      }
    }

    function setCrownPulled(pulled, silent) {
      if (typeof pulled === 'number') {
        setCrownPosition(pulled, silent);
      } else {
        setCrownPosition(pulled ? 1 : 0, silent);
      }
    }

    function cycleCrownPosition() {
      setCrownPosition((crownPosition + 1) % 3, false);
    }

    function notifyLockedAttempt() {
      if (typeof cb.onCrownLockedAttempt === 'function') {
        cb.onCrownLockedAttempt();
      }
    }

    function animateCrown(delta) {
      crownVisualShift = ((crownVisualShift + delta) % 4 + 4) % 4;
      parts.crownKnurlsEl.setAttribute('transform', 'translate(0, ' + ((crownVisualShift - 1.5) * 0.7).toFixed(2) + ')');
      parts.crownEl.classList.add('is-turning');
      if (turnTimerId) clearTimeout(turnTimerId);
      turnTimerId = setTimeout(function () {
        parts.crownEl.classList.remove('is-turning');
      }, 150);
    }

    function emitCrownStep(dir) {
      if (crownPosition === 0) {
        notifyLockedAttempt();
        return;
      }
      const stepMinutes = crownPosition === 2 ? 5 : 1;
      animateCrown(dir > 0 ? 1 : -1);
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(6); } catch (err) {}
      }
      if (typeof cb.onCrownStep === 'function') {
        cb.onCrownStep(dir * stepMinutes, crownPosition);
      }
    }

    function applyCrownDelta(dx, dy, baseThresholdPx) {
      const proj = (-dy * COS39) + (-dx * SIN39 * 0.65);
      dragAccum += proj;
      if (crownPosition === 0) {
        if (!lockedHintEmitted && Math.abs(dragAccum) >= 14) {
          lockedHintEmitted = true;
          notifyLockedAttempt();
        }
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
        e.preventDefault();
        e.stopPropagation();
        if (crownPosition === 0) {
          notifyLockedAttempt();
          return;
        }
        const dir = e.deltaY < 0 ? 1 : -1;
        emitCrownStep(dir);
      }, { passive: false });

      targetEl.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length === 0) return;
        e.preventDefault();
        e.stopPropagation();
        touchDragging = true;
        downClientX = e.touches[0].clientX;
        downClientY = e.touches[0].clientY;
        lastClientX = downClientX;
        lastClientY = downClientY;
        dragAccum = 0;
        gestureStepsEmitted = 0;
        lockedHintEmitted = false;
        parts.crownEl.classList.add('is-dragging');
        crownOverlayEl.classList.add('is-dragging');
      }, { passive: false });

      targetEl.addEventListener('touchmove', function (e) {
        if (!touchDragging || !e.touches || e.touches.length === 0) return;
        e.preventDefault();
        e.stopPropagation();
        const cx = e.touches[0].clientX;
        const cy = e.touches[0].clientY;
        const dx = cx - lastClientX;
        const dy = cy - lastClientY;
        lastClientX = cx;
        lastClientY = cy;
        applyCrownDelta(dx, dy, 9);
      }, { passive: false });

      function endTouch(e) {
        if (!touchDragging) return;
        if (e && e.cancelable) e.preventDefault();
        const travel = Math.hypot(lastClientX - downClientX, lastClientY - downClientY);
        const wasTap = e && e.type === 'touchend' && gestureStepsEmitted === 0 && !lockedHintEmitted && travel < 8;
        touchDragging = false;
        parts.crownEl.classList.remove('is-dragging');
        crownOverlayEl.classList.remove('is-dragging');
        if (wasTap) {
          cycleCrownPosition();
        }
      }
      targetEl.addEventListener('touchend', endTouch, { passive: false });
      targetEl.addEventListener('touchcancel', endTouch, { passive: false });

      targetEl.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        e.preventDefault();
        e.stopPropagation();
        pointerDragging = true;
        downClientX = e.clientX;
        downClientY = e.clientY;
        lastClientX = downClientX;
        lastClientY = downClientY;
        dragAccum = 0;
        gestureStepsEmitted = 0;
        lockedHintEmitted = false;
        parts.crownEl.classList.add('is-dragging');
        crownOverlayEl.classList.add('is-dragging');
        if (targetEl.setPointerCapture) {
          try { targetEl.setPointerCapture(e.pointerId); } catch (err) {}
        }
      });

      targetEl.addEventListener('pointermove', function (e) {
        if (!pointerDragging || e.pointerType === 'touch') return;
        e.preventDefault();
        const dx = e.clientX - lastClientX;
        const dy = e.clientY - lastClientY;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        applyCrownDelta(dx, dy, 10);
      });

      function endPointer(e) {
        if (!pointerDragging) return;
        const travel = Math.hypot(lastClientX - downClientX, lastClientY - downClientY);
        const wasClick = e && e.type === 'pointerup' && gestureStepsEmitted === 0 && !lockedHintEmitted && travel < 6;
        pointerDragging = false;
        parts.crownEl.classList.remove('is-dragging');
        crownOverlayEl.classList.remove('is-dragging');
        if (e && targetEl.releasePointerCapture) {
          try { targetEl.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        if (wasClick) {
          cycleCrownPosition();
        }
      }
      targetEl.addEventListener('pointerup', endPointer);
      targetEl.addEventListener('pointercancel', endPointer);

      targetEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          emitCrownStep(1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          emitCrownStep(-1);
        } else if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          cycleCrownPosition();
        }
      });
    }

    bindCrownTarget(crownOverlayEl);
    bindCrownTarget(parts.crownEl);

    let lastDialClickMs = 0;
    let dialSingleClickTimer = null;
    parts.dialClickableEl.addEventListener('click', function () {
      const now = Date.now();
      if (now - lastDialClickMs <= 300) {
        if (dialSingleClickTimer) {
          clearTimeout(dialSingleClickTimer);
          dialSingleClickTimer = null;
        }
        lastDialClickMs = 0;
        if (typeof cb.onDialDoubleClick === 'function') {
          cb.onDialDoubleClick();
        }
        return;
      }
      lastDialClickMs = now;
      if (dialSingleClickTimer) clearTimeout(dialSingleClickTimer);
      dialSingleClickTimer = setTimeout(function () {
        dialSingleClickTimer = null;
        if (typeof cb.onDialClick === 'function') {
          cb.onDialClick();
        }
      }, 270);
    });

    let rollerSpinDeg = 0;
    let alarmTimerId = null;

    function triggerVisualAlarm() {
      parts.visualRingEl.classList.remove('is-pulsing');
      void parts.visualRingEl.getBoundingClientRect();
      parts.visualRingEl.classList.add('is-pulsing');
      if (alarmTimerId) clearTimeout(alarmTimerId);
      alarmTimerId = setTimeout(function () {
        parts.visualRingEl.classList.remove('is-pulsing');
      }, 4200);
    }

    function render(snapshot, nowPerf) {
      if (!snapshot || !snapshot.angles) return;
      const angles = snapshot.angles;

      const carouselRot = 'rotate(' + angles.carouselDeg.toFixed(3) + ' 150 150)';
      parts.bridgeEl.setAttribute('transform', carouselRot);
      parts.triWireEl.setAttribute('transform', carouselRot);

      let anyIndexing = false;
      for (let k = 0; k < 3; k++) {
        const d = angles.discs[k];
        const rad = (d.orbitDeg * Math.PI) / 180;
        const x = 150 + ORBIT_R * Math.cos(rad);
        const y = 150 + ORBIT_R * Math.sin(rad);
        parts.satGroups[k].outer.setAttribute('transform', 'translate(' + x.toFixed(2) + ', ' + y.toFixed(2) + ') rotate(' + d.orbitDeg.toFixed(3) + ')');
        parts.satGroups[k].inner.setAttribute('transform', 'rotate(' + d.localSpinDeg.toFixed(3) + ')');
        if (d.isIndexing) anyIndexing = true;
      }

      if (anyIndexing && snapshot.running) {
        rollerSpinDeg = (rollerSpinDeg + 3.5) % 360;
        parts.rollerBallsEl.setAttribute('transform', 'rotate(' + rollerSpinDeg.toFixed(1) + ')');
      }

      const secRot = 180 + angles.secondsDiscDeg;
      parts.secDiscEl.setAttribute('transform', 'rotate(' + secRot.toFixed(2) + ')');

      const gearDeg = (snapshot.tHours * 360) % 360;
      const dirSign = snapshot.isCountdown ? -1 : 1;
      const balRot = snapshot.running ? (dirSign * (nowPerf || 0) * 0.015) % 360 : (gearDeg * 0.5);
      parts.balEl.setAttribute('transform', 'translate(182, 118) rotate(' + balRot.toFixed(1) + ')');
      parts.subGearEl.setAttribute('transform', 'rotate(' + gearDeg.toFixed(2) + ')');
      parts.subGear2El.setAttribute('transform', 'rotate(' + (-gearDeg * 1.333).toFixed(2) + ')');

      parts.svg.classList.toggle('is-break-phase', snapshot.phase === 'break');
      parts.svg.classList.toggle('is-warning-phase', Boolean(snapshot.isWarning));
      parts.svg.classList.toggle('is-running', Boolean(snapshot.running));
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

  global.SatelliteEngine = {
    mount: mount,
    describeMinuteArc: describeMinuteArc,
    describeHourArc: describeHourArc
  };
})(typeof window !== 'undefined' ? window : globalThis);
