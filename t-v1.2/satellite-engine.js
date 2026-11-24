/**
 * NO.5 CHRONO — Forensic Ōtsuka Lōtec No. 5 Kai (5号 改) Pure SVG Engine
 * Meticulously modeled after the real watch macro footage (시계_디자인2.mp4):
 *   - Compact flared conical knurled pinion crown at 4:18 (+39°) + mobile scroll-locked touch handle
 *   - Custom Katayama technical square-geometric vector path hour numerals (1..12)
 *   - Large 4-tab CNC Maltese satellite wheels with semicircular 8 o'clock roller notches & fine index dashes
 *   - Unified continuous Y-shaped 3-Arm CNC carousel bridge (concave fillets, continuous 45° chamfer, pill slots, brass bore)
 *   - Curved steel detent/jumper wire spring (7:00~9:30) + sculpted 9h skeleton bridge with kidney cutouts
 *   - 1 o'clock open-skeleton balance cavity (brass 3-spoke wheel, 3.5-turn spiral hairspring, balance cock, ruby)
 *   - 5:30 sunburst small-seconds subdial tucked under minute plate + curved support arm + large central cap (▼ & 1.5mm bearing)
 *   - Right 120° minute plate with inner & outer dual precision tick rails + upright 0..60 numerals + study timer arc
 *   - Flush satin-silver arch chapter plates: "CASPER™ · V1 ENGINE" (top-left) & "NO.1 PRO" (bottom-left)
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const ORBIT_R = 53.2;
  const ARC_R = 97.8;
  const HOUR_ARC_R = 107.2;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  const TECH_FONT = "'Eurostile', 'DIN Alternate', 'Bahnschrift', 'Pretendard', -apple-system, sans-serif";

  // Custom Katayama technical square-geometric vector numeral glyphs (box: [-4.4..4.4] x [-6.9..6.9])
  // Modeled directly after Ōtsuka Lōtec No. 5 Kai macro frames (00:03, 00:14, 00:21, 00:35)
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

  function createSpiralPath(cx, cy, rStart, rEnd, turns, steps) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const angle = f * turns * Math.PI * 2 - Math.PI / 2;
      const r = rStart + (rEnd - rStart) * f;
      pts.push((i === 0 ? 'M' : 'L') + (cx + r * Math.cos(angle)).toFixed(2) + ',' + (cy + r * Math.sin(angle)).toFixed(2));
    }
    return pts.join(' ');
  }

  /**
   * Builds a single unified continuous Y-shaped 3-Arm CNC Carousel Bridge path
   * with smooth concave fillets between all 3 arms (matching 00:32–00:33 macro).
   */
  function buildContinuousYBridgePath(cx, cy, tipCenterR, halfW, shoulderR, crotchR) {
    const armAngles = [-90, 30, 150];
    const segs = [];
    for (let i = 0; i < 3; i++) {
      const a = (armAngles[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux; // right perpendicular

      const lx0 = cx + shoulderR * ux - halfW * vx;
      const ly0 = cy + shoulderR * uy - halfW * vy;
      const lx1 = cx + tipCenterR * ux - halfW * vx;
      const ly1 = cy + tipCenterR * uy - halfW * vy;
      const rx1 = cx + tipCenterR * ux + halfW * vx;
      const ry1 = cy + tipCenterR * uy + halfW * vy;
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
      segs.push('A ' + halfW.toFixed(2) + ',' + halfW.toFixed(2) + ' 0 0,1 ' + rx1.toFixed(2) + ',' + ry1.toFixed(2));
      segs.push('L ' + rx0.toFixed(2) + ',' + ry0.toFixed(2));
      segs.push('Q ' + qx.toFixed(2) + ',' + qy.toFixed(2) + ' ' + nlx0.toFixed(2) + ',' + nly0.toFixed(2));
    }
    segs.push('Z');
    return segs.join(' ');
  }

  /**
   * Builds authentic massive 4-pad CNC Maltese satellite wheel path (wide flat-flanked
   * hour pads with crisp semicircular 8 o'clock roller indexing notches & arched outer faces).
   */
  function buildSatelliteWheelPath(rOuter, tabHalfW, shoulder, notchInset) {
    const rCorner = Math.sqrt(rOuter * rOuter - tabHalfW * tabHalfW);
    const dirs = [0, 90, 180, 270];
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const a = (dirs[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux;
      const pL0 = [shoulder * ux - tabHalfW * vx, shoulder * uy - tabHalfW * vy];
      const pL1 = [rCorner * ux - tabHalfW * vx, rCorner * uy - tabHalfW * vy];
      const pR1 = [rCorner * ux + tabHalfW * vx, rCorner * uy + tabHalfW * vy];
      const pR0 = [shoulder * ux + tabHalfW * vx, shoulder * uy + tabHalfW * vy];

      const na = (dirs[(i + 1) % 4] * Math.PI) / 180;
      const nux = Math.cos(na), nuy = Math.sin(na);
      const nvx = -nuy, nvy = nux;
      const npL0 = [shoulder * nux - tabHalfW * nvx, shoulder * nuy - tabHalfW * nvy];

      const ma = ((dirs[i] + 45) * Math.PI) / 180;
      const q = [notchInset * Math.cos(ma), notchInset * Math.sin(ma)];

      if (i === 0) parts.push('M ' + pL0[0].toFixed(2) + ',' + pL0[1].toFixed(2));
      parts.push('L ' + pL1[0].toFixed(2) + ',' + pL1[1].toFixed(2));
      parts.push('A ' + rOuter.toFixed(1) + ',' + rOuter.toFixed(1) + ' 0 0,1 ' + pR1[0].toFixed(2) + ',' + pR1[1].toFixed(2));
      parts.push('L ' + pR0[0].toFixed(2) + ',' + pR0[1].toFixed(2));
      // Crisp semicircular concave notch for 8 o'clock roller engagement
      parts.push('Q ' + q[0].toFixed(2) + ',' + q[1].toFixed(2) + ' ' + npL0[0].toFixed(2) + ',' + npL0[1].toFixed(2));
    }
    parts.push('Z');
    return parts.join(' ');
  }

  /**
   * Builds the authentic 3-connected tri-symmetric polished steel wire spring assembly
   * linking all 3 satellite wheel valleys in 120° symmetry (rotates with carousel bridge).
   * Strictly tracks the 3 open valleys (-30°, 90°, 210°) so all 3 linked spring loops
   * gleam cleanly between the satellite discs with zero overlap against hour numerals.
   */
  function buildTriConnectedWireSpring() {
    const g = createSvgEl('g', { id: 'no5TriWireSpring', class: 'satclk-tri-wire' });
    const valleys = [-30, 90, 210];
    const mainLoopParts = [];
    const stemPaths = [];
    const eyelets = [];

    for (let i = 0; i < 3; i++) {
      const a = valleys[i];
      const hubIn = polar(150, 150, 22.8, a - 15);
      const ctrlOut = polar(150, 150, 34.5, a - 6);
      const eye = polar(150, 150, 44.5, a);
      const ctrlBack = polar(150, 150, 34.5, a + 6);
      const hubOut = polar(150, 150, 22.8, a + 15);

      if (i === 0) {
        mainLoopParts.push('M ' + hubIn[0].toFixed(2) + ',' + hubIn[1].toFixed(2));
      } else {
        // Continuous curved connecting bridge along central ring joining all 3 wire loops into one!
        mainLoopParts.push('A 22.8,22.8 0 0,1 ' + hubIn[0].toFixed(2) + ',' + hubIn[1].toFixed(2));
      }
      mainLoopParts.push('Q ' + ctrlOut[0].toFixed(2) + ',' + ctrlOut[1].toFixed(2) + ' ' + eye[0].toFixed(2) + ',' + eye[1].toFixed(2));
      mainLoopParts.push('Q ' + ctrlBack[0].toFixed(2) + ',' + ctrlBack[1].toFixed(2) + ' ' + hubOut[0].toFixed(2) + ',' + hubOut[1].toFixed(2));

      // Crisp straight-to-gently-curved radial tension tip extending strictly down the open valley centerline
      const tipMid = polar(150, 150, 51.0, a - 1.5);
      const tipEnd = polar(150, 150, 56.5, a + 1.5);
      stemPaths.push(
        'M ' + eye[0].toFixed(2) + ',' + eye[1].toFixed(2) +
        ' Q ' + tipMid[0].toFixed(2) + ',' + tipMid[1].toFixed(2) +
        ' ' + tipEnd[0].toFixed(2) + ',' + tipEnd[1].toFixed(2)
      );
      eyelets.push({ eye: eye, tip: tipEnd });
    }
    const firstHubIn = polar(150, 150, 22.8, valleys[0] - 15);
    mainLoopParts.push('A 22.8,22.8 0 0,1 ' + firstHubIn[0].toFixed(2) + ',' + firstHubIn[1].toFixed(2) + ' Z');
    const triLoopD = mainLoopParts.join(' ');
    const allWiresD = triLoopD + ' ' + stemPaths.join(' ');

    // 3D floating drop shadow under the 3-connected steel wire spring
    g.appendChild(createSvgEl('path', {
      d: allWiresD, fill: 'none', stroke: 'rgba(12,15,20,0.52)',
      'stroke-width': '3.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      transform: 'translate(1.1, 1.5)'
    }));
    // Machined dark steel edge contour
    g.appendChild(createSvgEl('path', {
      d: allWiresD, fill: 'none', stroke: '#404752',
      'stroke-width': '2.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }));
    // Gleaming polished spring-steel wire body
    g.appendChild(createSvgEl('path', {
      d: allWiresD, fill: 'none', stroke: '#E8EDF4',
      'stroke-width': '1.85', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      class: 'steel-wire'
    }));
    // Specular white highlight along steel rod crown
    g.appendChild(createSvgEl('path', {
      d: allWiresD, fill: 'none', stroke: 'rgba(255,255,255,0.95)',
      'stroke-width': '0.68', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }));

    // 3 polished eyelet tension pins + tiny detent balls at each spring tip
    for (let j = 0; j < eyelets.length; j++) {
      const ep = eyelets[j].eye;
      const tp = eyelets[j].tip;
      g.appendChild(createSvgEl('circle', {
        cx: ep[0].toFixed(2), cy: ep[1].toFixed(2), r: '2.9',
        fill: 'url(#no5ScrewHead)', stroke: '#3F4650', 'stroke-width': '0.8'
      }));
      g.appendChild(createSvgEl('circle', {
        cx: ep[0].toFixed(2), cy: ep[1].toFixed(2), r: '1.1',
        fill: '#262B33'
      }));
      g.appendChild(createSvgEl('circle', {
        cx: tp[0].toFixed(2), cy: tp[1].toFixed(2), r: '1.5',
        fill: '#F2F5FA', stroke: '#454C56', 'stroke-width': '0.55'
      }));
    }
    return g;
  }

  /**
   * Appends HUGE, bold, authentic Katayama technical vector numerals (1..12)
   * matching the dramatic ~2.3x hour-to-minute scale ratio in 00:03, 00:14, 00:21, 00:35.
   */
  function appendVectorHourNumeral(parent, num, cx, cy, deg) {
    const str = String(num);
    const g = createSvgEl('g', {
      transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ') rotate(' + deg + ')'
    });
    if (str.length === 1) {
      const p = createSvgEl('path', {
        d: DIGIT_PATHS[str],
        fill: 'none',
        stroke: '#111419',
        'stroke-width': '1.72',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        transform: 'scale(1.48)',
        class: 'sat-numeral-stroke'
      });
      g.appendChild(p);
    } else {
      // Bold tall 2-digit lockup (10, 11, 12) centered cleanly with balanced margins
      const offsets = str === '11' ? [-4.0, 3.8] : [-5.1, 3.9];
      for (let i = 0; i < 2; i++) {
        const ch = str[i];
        const p = createSvgEl('path', {
          d: DIGIT_PATHS[ch],
          fill: 'none',
          stroke: '#111419',
          'stroke-width': '1.82',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          transform: 'translate(' + offsets[i] + ', 0) scale(1.12, 1.40)',
          class: 'sat-numeral-stroke'
        });
        g.appendChild(p);
      }
    }
    parent.appendChild(g);
  }

  function appendSlottedScrew(parent, cx, cy, r, slotAngleDeg, withCountersink) {
    const g = createSvgEl('g', { transform: 'translate(' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ')' });
    if (withCountersink) {
      g.appendChild(createSvgEl('circle', {
        cx: '0', cy: '0', r: (r + 1.05).toFixed(2),
        fill: '#4A515B', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.55'
      }));
    }
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: r.toFixed(2),
      fill: 'url(#no5ScrewHead)',
      stroke: '#525A65',
      'stroke-width': Math.max(0.55, r * 0.14).toFixed(2)
    }));
    g.appendChild(createSvgEl('circle', {
      cx: '0', cy: '0', r: (r * 0.84).toFixed(2),
      fill: 'none', stroke: 'rgba(255,255,255,0.66)', 'stroke-width': '0.48'
    }));
    const sl = r * 0.84;
    g.appendChild(createSvgEl('line', {
      x1: (-sl).toFixed(2), y1: '0', x2: sl.toFixed(2), y2: '0',
      stroke: '#2C3139',
      'stroke-width': Math.max(0.68, r * 0.20).toFixed(2),
      'stroke-linecap': 'butt',
      transform: 'rotate(' + slotAngleDeg + ')'
    }));
    parent.appendChild(g);
  }

  /**
   * Builds the authentic compact flared conical knurled pinion crown at +39° (4:18)
   * matching macro frames 00:03, 00:21–00:23, 00:35–00:37 of 시계_디자인2.mp4:
   *   - Visible recessed cylindrical stem collar emerging from case wall
   *   - Bold truncated-cone flared knurled head with fanned metallic flutes & sawtooth rim teeth
   *   - Crisp beveled flat crown end cap
   */
  function buildFlaredPinionCrown() {
    const CROWN_FLARE_D =
      'M 290.6,138.6 L 304.8,131.6 L 307.8,134.4 L 307.8,165.6 L 304.8,168.4 L 290.6,161.4 Z';

    const crownEl = createSvgEl('g', {
      id: 'no5CrownControl',
      class: 'crown-control',
      transform: 'rotate(39 150 150)',
      filter: 'url(#no5MechShadow)'
    });

    // Generous transparent hit box (covers both pushed-in & pulled-out positions)
    crownEl.appendChild(createSvgEl('rect', {
      class: 'crown-hit', x: '280', y: '116', width: '42', height: '68', rx: '8', fill: 'transparent'
    }));

    // Fixed inner winding stem shaft (revealed cleanly when crown is pulled out 1 step!)
    crownEl.appendChild(createSvgEl('rect', {
      id: 'no5CrownStem',
      x: '284.2', y: '146.2', width: '13.5', height: '7.6',
      fill: 'url(#no5CrownNeck)', stroke: '#252A32', 'stroke-width': '0.8'
    }));
    crownEl.appendChild(createSvgEl('line', {
      x1: '285.0', y1: '148.6', x2: '297.2', y2: '148.6',
      stroke: 'rgba(255,255,255,0.62)', 'stroke-width': '0.75'
    }));

    // Sliding 2-position crown head (Position 0: pushed = minutes | Position 1: pulled +5.5px = hours)
    const crownSlideEl = createSvgEl('g', { id: 'no5CrownSlide', class: 'crown-slide' });

    // Recessed stepped cylindrical stem collar between 316L case flank and flared crown
    crownSlideEl.appendChild(createSvgEl('rect', {
      x: '285.2', y: '142.8', width: '6.2', height: '14.4',
      fill: 'url(#no5CrownNeck)', stroke: '#2F343C', 'stroke-width': '0.85'
    }));
    crownSlideEl.appendChild(createSvgEl('line', {
      x1: '290.2', y1: '143.0', x2: '290.2', y2: '157.0',
      stroke: '#1B1F25', 'stroke-width': '1.0'
    }));

    // Crisp protruding machined gear/pinion teeth along top & bottom flared frustum silhouettes
    const rimTeeth = [
      'M 291.6,138.1 L 292.6,135.4 L 294.8,134.4 L 295.4,136.3',
      'M 295.6,136.1 L 296.8,133.2 L 299.1,132.1 L 299.7,134.1',
      'M 299.9,134.0 L 301.2,131.0 L 303.6,129.9 L 304.4,132.0',
      'M 304.2,131.8 L 305.5,129.8 L 307.4,131.2 L 307.4,134.4',
      'M 291.6,161.9 L 292.6,164.6 L 294.8,165.6 L 295.4,163.7',
      'M 295.6,163.9 L 296.8,166.8 L 299.1,167.9 L 299.7,165.9',
      'M 299.9,166.0 L 301.2,169.0 L 303.6,170.1 L 304.4,168.0',
      'M 304.2,168.2 L 305.5,170.2 L 307.4,168.8 L 307.4,165.6'
    ];
    rimTeeth.forEach(function (d) {
      crownSlideEl.appendChild(createSvgEl('path', {
        d: d, fill: 'url(#no5SteelCase)', stroke: '#343A43', 'stroke-width': '0.78', 'stroke-linejoin': 'miter'
      }));
    });

    // Flared conical crown head body
    crownSlideEl.appendChild(createSvgEl('path', {
      class: 'crown-body',
      d: CROWN_FLARE_D,
      fill: 'url(#no5CrownCyl)',
      stroke: '#353B44',
      'stroke-width': '1.2',
      'stroke-linejoin': 'miter'
    }));

    // Clipped fanned conical pinion flutes (radiating cleanly along the flare cone + animated on turn)
    const clipG = createSvgEl('g', { 'clip-path': 'url(#no5CrownClip)' });
    const crownKnurlsEl = createSvgEl('g', { id: 'no5CrownKnurls' });
    const fluteCount = 13;
    for (let i = -1; i <= fluteCount + 1; i++) {
      const f = i / fluteCount; // 0..1 top to bottom
      const yInner = 138.2 + f * 23.6;
      const yOuter = 131.2 + f * 37.6;
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '290.4', y1: yInner.toFixed(2), x2: '305.2', y2: yOuter.toFixed(2),
        stroke: '#21262D', 'stroke-width': '1.25'
      }));
      crownKnurlsEl.appendChild(createSvgEl('line', {
        x1: '290.6', y1: (yInner + 1.05).toFixed(2), x2: '305.0', y2: (yOuter + 1.15).toFixed(2),
        stroke: 'rgba(255,255,255,0.82)', 'stroke-width': '0.8'
      }));
    }
    clipG.appendChild(crownKnurlsEl);
    crownSlideEl.appendChild(clipG);

    // Crisp beveled outer crown cap rim & brushed flat facet
    crownSlideEl.appendChild(createSvgEl('polygon', {
      points: '304.8,131.6 307.8,134.4 307.8,165.6 304.8,168.4',
      fill: 'url(#no5SteelCase)', opacity: '0.78', 'pointer-events': 'none'
    }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '304.8', y1: '132.0', x2: '304.8', y2: '168.0', stroke: '#323841', 'stroke-width': '1.0' }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '305.9', y1: '133.4', x2: '305.9', y2: '166.6', stroke: 'rgba(255,255,255,0.75)', 'stroke-width': '0.8' }));
    crownSlideEl.appendChild(createSvgEl('line', { x1: '290.8', y1: '139.0', x2: '290.8', y2: '161.0', stroke: 'rgba(255,255,255,0.45)', 'stroke-width': '0.65' }));

    crownEl.appendChild(crownSlideEl);

    return { crownEl: crownEl, crownSlideEl: crownSlideEl, crownKnurlsEl: crownKnurlsEl, crownClipD: CROWN_FLARE_D };
  }

  function buildClockSvg() {
    const svg = createSvgEl('svg', {
      viewBox: '-16 -16 332 332',
      class: 'no5-svg',
      role: 'img',
      'aria-label': 'NO.5 CHRONO — CASPER V1 ENGINE 기계식 공부 타이머'
    });

    const defs = createSvgEl('defs');
    const crownBuilt = buildFlaredPinionCrown();

    // Recessed dark cylindrical crown stem neck gradient
    const gCrownNeck = createSvgEl('linearGradient', { id: 'no5CrownNeck', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [
      ['0%', '#2A2F37'],
      ['32%', '#7E8792'],
      ['68%', '#4B525C'],
      ['100%', '#232830']
    ].forEach(function (s) {
      gCrownNeck.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gCrownNeck);

    // Flared crown cylindrical metallic shading (high-contrast 3D machined steel)
    const gCrownCyl = createSvgEl('linearGradient', { id: 'no5CrownCyl', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    [
      ['0%', '#323841', 'grad-case-4'],
      ['18%', '#CFD6DF', 'grad-case-1'],
      ['36%', '#FFFFFF', 'grad-case-0'],
      ['58%', '#AEB7C2', 'grad-case-2'],
      ['82%', '#58606B', 'grad-case-3'],
      ['100%', '#262B33', 'grad-case-4']
    ].forEach(function (s) {
      gCrownCyl.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gCrownCyl);

    // Authentic satin-brushed stainless steel chapter plaque gradient (matches case & minute track)
    const gPlaqueSteel = createSvgEl('linearGradient', { id: 'no5PlaqueSteel', x1: '10%', y1: '6%', x2: '90%', y2: '94%' });
    [
      ['0%', '#E7EBF0', 'grad-satin-0'],
      ['42%', '#D6DCE3', 'grad-satin-1'],
      ['76%', '#C3CAD3', 'grad-satin-2'],
      ['100%', '#ADB5C0', 'grad-satin-3']
    ].forEach(function (s) {
      gPlaqueSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gPlaqueSteel);

    // 316L straight-brushed steel bezel gradient
    const gSteelCase = createSvgEl('linearGradient', { id: 'no5SteelCase', x1: '10%', y1: '4%', x2: '90%', y2: '96%' });
    [
      ['0%', '#F5F7FA', 'grad-case-0'],
      ['24%', '#CED4DC', 'grad-case-1'],
      ['50%', '#EAEEF2', 'grad-case-2'],
      ['76%', '#AFB8C2', 'grad-case-3'],
      ['100%', '#87909B', 'grad-case-4']
    ].forEach(function (s) {
      gSteelCase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gSteelCase);

    // Vertical straight-brushed 316L hairline grain (matching 00:03, 00:23, 00:35)
    const pBrushed = createSvgEl('pattern', { id: 'no5Brushed316L', width: '2.8', height: '18', patternUnits: 'userSpaceOnUse' });
    pBrushed.appendChild(createSvgEl('line', { x1: '0.6', y1: '0', x2: '0.6', y2: '18', stroke: 'rgba(255,255,255,0.32)', 'stroke-width': '0.5' }));
    pBrushed.appendChild(createSvgEl('line', { x1: '1.9', y1: '0', x2: '1.9', y2: '18', stroke: 'rgba(38,43,50,0.12)', 'stroke-width': '0.45' }));
    defs.appendChild(pBrushed);

    // Bright raw CNC aluminum/steel mainplate
    const gMainplate = createSvgEl('radialGradient', { id: 'no5Mainplate', cx: '44%', cy: '38%', r: '68%' });
    [
      ['0%', '#DCE1E7', 'grad-plate-0'],
      ['54%', '#C0C7D0', 'grad-plate-1'],
      ['86%', '#A2AAB5', 'grad-plate-2'],
      ['100%', '#8B939F', 'grad-plate-2']
    ].forEach(function (s) {
      gMainplate.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gMainplate);

    // Satin silver plate gradient (minute track, chapter plaques, skeleton bridge)
    const gSatinSilver = createSvgEl('linearGradient', { id: 'no5SatinSilver', x1: '12%', y1: '8%', x2: '88%', y2: '92%' });
    [
      ['0%', '#F5F7FA', 'grad-satin-0'],
      ['38%', '#E4E8ED', 'grad-satin-1'],
      ['72%', '#CFD5DD', 'grad-satin-2'],
      ['100%', '#B4BCC6', 'grad-satin-3']
    ].forEach(function (s) {
      gSatinSilver.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gSatinSilver);

    // Satellite wheel CNC radial metal sheen
    const gPaddleMetal = createSvgEl('radialGradient', { id: 'no5PaddleMetal', cx: '35%', cy: '28%', r: '75%' });
    [
      ['0%', '#F8FAFC', 'grad-satin-0'],
      ['56%', '#E3E7ED', 'grad-satin-1'],
      ['86%', '#C5CCD5', 'grad-satin-2'],
      ['100%', '#A9B2BD', 'grad-satin-3']
    ].forEach(function (s) {
      gPaddleMetal.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gPaddleMetal);

    // Heavy unified CNC Y-bridge steel sheen
    const gBridgeSteel = createSvgEl('linearGradient', { id: 'no5BridgeSteel', x1: '8%', y1: '6%', x2: '92%', y2: '94%' });
    [
      ['0%', '#FAFBFD', 'grad-bridge-0'],
      ['34%', '#E2E6EC', 'grad-bridge-1'],
      ['68%', '#C3CAD3', 'grad-bridge-2'],
      ['100%', '#9AA3AE', 'grad-bridge-3']
    ].forEach(function (s) {
      gBridgeSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gBridgeSteel);

    // Milled capsule slot shadow
    const gSlotRecess = createSvgEl('linearGradient', { id: 'no5SlotRecess', x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [
      ['0%', '#383E46'],
      ['30%', '#68707B'],
      ['74%', '#9BA3AE'],
      ['100%', '#C1C8D1']
    ].forEach(function (s) {
      gSlotRecess.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSlotRecess);

    // Screw head specular gradient
    const gScrewHead = createSvgEl('radialGradient', { id: 'no5ScrewHead', cx: '35%', cy: '30%', r: '70%' });
    [
      ['0%', '#FFFFFF', 'grad-bridge-0'],
      ['60%', '#D4DAE2', 'grad-bridge-1'],
      ['100%', '#98A1AC', 'grad-bridge-3']
    ].forEach(function (s) {
      gScrewHead.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gScrewHead);

    // 5:30 Sunburst subdial silver base
    const gSunburstBase = createSvgEl('radialGradient', { id: 'no5SunburstBase', cx: '46%', cy: '42%', r: '62%' });
    [
      ['0%', '#F4F6F9', 'grad-sub-0'],
      ['58%', '#DBE0E7', 'grad-sub-1'],
      ['100%', '#BEC6D0', 'grad-sub-2']
    ].forEach(function (s) {
      gSunburstBase.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1], class: s[2] }));
    });
    defs.appendChild(gSunburstBase);

    // Chromatic Accent #1: Brass balance wheel & sunken hub bushing
    const gBrass = createSvgEl('linearGradient', { id: 'no5Brass', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [
      ['0%', '#F6DA89'],
      ['48%', '#CC983C'],
      ['100%', '#825B18']
    ].forEach(function (s) {
      gBrass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBrass);

    // 4.6mm Box sapphire crystal reflection
    const gGlass = createSvgEl('linearGradient', { id: 'no5GlassShine', x1: '6%', y1: '4%', x2: '94%', y2: '96%' });
    [
      ['0%', 'rgba(255,255,255,0.24)'],
      ['18%', 'rgba(255,255,255,0.08)'],
      ['32%', 'rgba(255,255,255,0)'],
      ['48%', 'rgba(255,255,255,0.07)'],
      ['56%', 'rgba(255,255,255,0)'],
      ['88%', 'rgba(24,27,32,0.02)'],
      ['100%', 'rgba(24,27,32,0.08)']
    ].forEach(function (s) {
      gGlass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gGlass);

    // 1 o'clock recessed balance well
    const gBalWell = createSvgEl('radialGradient', { id: 'no5BalWell', cx: '45%', cy: '40%', r: '66%' });
    [
      ['0%', '#333842'],
      ['65%', '#20242B'],
      ['100%', '#15181D']
    ].forEach(function (s) {
      gBalWell.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBalWell);

    // Shadows & LumiNova filter
    const fMechShadow = createSvgEl('filter', { id: 'no5MechShadow', x: '-22%', y: '-22%', width: '144%', height: '144%' });
    fMechShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.1', dy: '2.0', stdDeviation: '2.0', 'flood-color': '#15181E', 'flood-opacity': '0.36' }));
    defs.appendChild(fMechShadow);

    const fBridgeShadow = createSvgEl('filter', { id: 'no5BridgeShadow', x: '-24%', y: '-24%', width: '148%', height: '148%' });
    fBridgeShadow.appendChild(createSvgEl('feDropShadow', { dx: '1.6', dy: '2.9', stdDeviation: '2.6', 'flood-color': '#101318', 'flood-opacity': '0.46' }));
    defs.appendChild(fBridgeShadow);

    const fLumeGlow = createSvgEl('filter', { id: 'no5LumeGlow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    fLumeGlow.appendChild(createSvgEl('feGaussianBlur', { stdDeviation: '2.0', result: 'blur' }));
    const fMerge = createSvgEl('feMerge');
    fMerge.appendChild(createSvgEl('feMergeNode', { in: 'blur' }));
    fMerge.appendChild(createSvgEl('feMergeNode', { in: 'SourceGraphic' }));
    fLumeGlow.appendChild(fMerge);
    defs.appendChild(fLumeGlow);

    // Clips
    const clipDial = createSvgEl('clipPath', { id: 'no5DialClip' });
    clipDial.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '129.0' }));
    defs.appendChild(clipDial);

    const clipBalWin = createSvgEl('clipPath', { id: 'no5BalWinClip' });
    clipBalWin.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '22.0' }));
    defs.appendChild(clipBalWin);

    const clipCrown = createSvgEl('clipPath', { id: 'no5CrownClip' });
    clipCrown.appendChild(createSvgEl('path', { d: crownBuilt.crownClipD }));
    defs.appendChild(clipCrown);

    // Top-left ("CASPER™ · V1 ENGINE") & Bottom-left ("NO.1 PRO") curved flush chapter paths (slim outer flange!)
    defs.appendChild(createSvgEl('path', { id: 'no5TopPlaquePath', d: arcLinePath(150, 150, 117.6, 194, 274, true) }));
    defs.appendChild(createSvgEl('path', { id: 'no5BotPlaquePath', d: arcLinePath(150, 150, 122.0, 154, 108, false) }));

    svg.appendChild(defs);

    // Visual Alarm Ring for Library Manner Mode
    const visualRingEl = createSvgEl('circle', {
      id: 'no5VisualAlarmRing', class: 'visual-alarm-ring',
      cx: '150', cy: '150', r: '144.2', fill: 'none', 'stroke-width': '4'
    });
    svg.appendChild(visualRingEl);

    // LAYER (1): Flared Conical Knurled Pinion Crown at 4:18 (+39°)
    svg.appendChild(crownBuilt.crownEl);

    // Clickable Dial Group
    const dialClickableEl = createSvgEl('g', { id: 'no5DialClickable', class: 'dial-clickable' });

    // Razor-thin 316L straight-brushed steel bezel (r=138.5 -> 129.0)
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '138.5', fill: 'url(#no5SteelCase)', stroke: '#626A75', 'stroke-width': '1.4', class: 'case-bezel' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '138.0', fill: 'url(#no5Brushed316L)', opacity: '0.82' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '134.8', fill: 'none', stroke: 'rgba(255,255,255,0.56)', 'stroke-width': '0.8' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '130.8', fill: '#69717C', stroke: '#454C55', 'stroke-width': '0.85', class: 'case-rehaut' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '129.0', fill: 'url(#no5Mainplate)', class: 'dial-base' }));

    const dialInner = createSvgEl('g', { 'clip-path': 'url(#no5DialClip)' });

    // =========================================================================
    // LAYER (A): Bright Multi-Layer Machined Steel Mainplate + Openwork Cavities
    // =========================================================================
    const mainplateG = createSvgEl('g', { class: 'satclk-mainplate' });
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '128.5', fill: 'url(#no5Brushed316L)', opacity: '0.48' }));
    [117, 103, 91].forEach(function (rRing) {
      mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: String(rRing), fill: 'none', stroke: 'rgba(255,255,255,0.26)', 'stroke-width': '0.7' }));
    });
    // Authentic deep machined gunmetal skeleton recess (lets the gleaming 3-connected steel wire spring pop!)
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '83', fill: '#353B45', stroke: '#68707B', 'stroke-width': '1.05', class: 'skeleton-recess' }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '82.0', fill: 'url(#no5Brushed316L)', opacity: '0.20' }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '67', fill: 'none', stroke: 'rgba(255,255,255,0.14)', 'stroke-width': '0.75' }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '54', fill: '#282D35', stroke: '#5D6570', 'stroke-width': '0.9', class: 'skeleton-deep' }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '31', fill: '#3E4550', stroke: '#656D78', 'stroke-width': '0.8' }));

    // =========================================================================
    // LAYER (B): 1 o'clock Open-Heart Balance Wheel, 3.5-Turn Spiral Hairspring,
    //            Balance Cock, Regulator Wire & Ruby Jewel
    // =========================================================================
    mainplateG.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '24.0', fill: 'url(#no5SatinSilver)', stroke: '#666E79', 'stroke-width': '0.95', class: 'sat-disc-face' }));
    mainplateG.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '22.0', fill: 'url(#no5BalWell)', stroke: '#454C55', 'stroke-width': '1.0' }));

    const balWindowClipG = createSvgEl('g', { 'clip-path': 'url(#no5BalWinClip)' });
    const balEl = createSvgEl('g', { id: 'no5BalanceWheel', transform: 'translate(165, 82)' });
    balEl.appendChild(createSvgEl('path', {
      d: createSpiralPath(0, 0, 4.0, 12.6, 3.5, 96),
      fill: 'none', stroke: '#C8D5E3', 'stroke-width': '0.78', 'stroke-linecap': 'round', opacity: '0.94'
    }));
    balEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '18.6', fill: 'none', stroke: 'url(#no5Brass)', 'stroke-width': '3.1' }));
    balEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '19.9', fill: 'none', stroke: 'rgba(255,244,204,0.52)', 'stroke-width': '0.55' }));
    for (let bs = 0; bs < 3; bs++) {
      balEl.appendChild(createSvgEl('path', {
        d: 'M -1.1,-4.2 L 1.1,-4.2 L 0.75,-17.8 L -0.75,-17.8 Z',
        fill: 'url(#no5Brass)', transform: 'rotate(' + (bs * 120) + ')'
      }));
    }
    balWindowClipG.appendChild(balEl);

    // Sculpted satin-silver Balance Cock & regulator wire pin
    const balCockG = createSvgEl('g', { class: 'satclk-balance-cock' });
    balCockG.appendChild(createSvgEl('path', {
      d: 'M 181.5,61.5 L 188,68 L 171.5,85.5 A 6.0,6.0 0 1,1 161.5,76.5 Z',
      fill: 'url(#no5BridgeSteel)', stroke: '#525A64', 'stroke-width': '0.85'
    }));
    balCockG.appendChild(createSvgEl('path', {
      d: 'M 182.8,63.8 L 186.2,67.4 L 170.5,84.0',
      fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.6'
    }));
    balCockG.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '4.5', fill: 'url(#no5Brass)', stroke: '#694A16', 'stroke-width': '0.7' }));
    balCockG.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '2.7', fill: '#C9332B', stroke: '#F5D98E', 'stroke-width': '0.55' }));
    balCockG.appendChild(createSvgEl('circle', { cx: '164.1', cy: '81.1', r: '0.88', fill: 'rgba(255,255,255,0.78)' }));
    balCockG.appendChild(createSvgEl('line', { x1: '169.2', y1: '78.2', x2: '177.2', y2: '70.8', stroke: '#454C55', 'stroke-width': '0.8', 'stroke-linecap': 'round' }));
    balWindowClipG.appendChild(balCockG);
    mainplateG.appendChild(balWindowClipG);

    mainplateG.appendChild(createSvgEl('circle', { cx: '165', cy: '82', r: '22.2', fill: 'none', stroke: 'rgba(255,255,255,0.74)', 'stroke-width': '0.85' }));
    appendSlottedScrew(mainplateG, 181.6, 63.5, 2.2, -38);

    // =========================================================================
    // LAYER (C): 9:00~10:30 Double-Layer Anti-Backlash Reduction Gear Wheel
    //            (3 wide spoke cutouts + internal curved anti-backlash wire springs,
    //            matching 00:11, 00:12, 00:24, 00:35) + Brass Pinion
    // =========================================================================
    const gearPrimaryG = createSvgEl('g', { transform: 'translate(92, 134)' });
    const subGearEl = createSvgEl('g', { id: 'no5SubGear' });
    // Recessed brass under-gear glimpsed through the 3 wide cutouts (00:11–00:12)
    subGearEl.appendChild(createSvgEl('path', { d: createGearPath(0, 0, 28, 31.0, 27.6), fill: 'url(#no5Brass)', stroke: '#7A591B', 'stroke-width': '0.6', opacity: '0.86' }));
    // Main upper 3-spoke brushed steel double-reduction wheel
    subGearEl.appendChild(createSvgEl('path', { d: createGearPath(0, 0, 30, 34.5, 31.2), fill: 'url(#no5SatinSilver)', stroke: '#565E69', 'stroke-width': '0.85' }));
    subGearEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '26.2', fill: '#3A404A', stroke: '#87909B', 'stroke-width': '0.9' }));
    // 3 internal curved anti-backlash wire springs visible inside the 3 spoke windows
    for (let sp = 0; sp < 3; sp++) {
      const a0 = sp * 120 + 18;
      const a1 = sp * 120 + 96;
      subGearEl.appendChild(createSvgEl('path', {
        d: arcLinePath(0, 0, 19.2, a0, a1, true),
        fill: 'none', stroke: '#DCE2EA', 'stroke-width': '1.25', 'stroke-linecap': 'round', class: 'steel-wire'
      }));
    }
    // 3 sculptural radial spokes matching 00:24 at 9:30
    for (let s = 0; s < 3; s++) {
      subGearEl.appendChild(createSvgEl('path', {
        d: 'M -3.2,-26.5 L 3.2,-26.5 L 2.2,-7.5 L -2.2,-7.5 Z',
        fill: 'url(#no5BridgeSteel)', stroke: '#5A626D', 'stroke-width': '0.65', transform: 'rotate(' + (s * 120) + ')'
      }));
    }
    subGearEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '8.6', fill: 'url(#no5BridgeSteel)', stroke: '#555D68', 'stroke-width': '0.85' }));
    appendSlottedScrew(subGearEl, 0, 0, 3.6, 20);
    gearPrimaryG.appendChild(subGearEl);
    mainplateG.appendChild(gearPrimaryG);

    const gearSecondaryG = createSvgEl('g', { transform: 'translate(112, 102)' });
    const subGear2El = createSvgEl('g', { id: 'no5SubGear2' });
    subGear2El.appendChild(createSvgEl('path', { d: createGearPath(0, 0, 18, 19.0, 16.0), fill: 'url(#no5SatinSilver)', stroke: '#5A626D', 'stroke-width': '0.8' }));
    subGear2El.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '12.2', fill: '#373D46', stroke: '#87909B', 'stroke-width': '0.8' }));
    for (let s2 = 0; s2 < 4; s2++) {
      subGear2El.appendChild(createSvgEl('line', { x1: '0', y1: '-11.5', x2: '0', y2: '11.5', stroke: '#E0E4EA', 'stroke-width': '2.0', transform: 'rotate(' + (s2 * 45) + ')' }));
    }
    subGear2El.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '4.4', fill: '#EAEEF3', stroke: '#555D68', 'stroke-width': '0.7' }));
    gearSecondaryG.appendChild(subGear2El);
    mainplateG.appendChild(gearSecondaryG);

    // Sleek sculpted 8 o'clock roller mounting bracket tucked cleanly into the left skeleton cavity
    mainplateG.appendChild(createSvgEl('path', {
      d: 'M 48,184 Q 56,192 67,198 L 62,205 Q 50,198 42,189 Z',
      fill: 'url(#no5BridgeSteel)', stroke: '#555D68', 'stroke-width': '0.8', class: 'sat-disc-face'
    }));
    appendSlottedScrew(mainplateG, 50.5, 191.5, 2.2, -32);

    dialInner.appendChild(mainplateG);

    // =========================================================================
    // LAYER (D): 8 o'clock Custom MinebeaMitsumi 2.5mm Ball-Bearing Roller
    //            (sleek precision roller engaging the massive satellite notches!)
    // =========================================================================
    const rollerOuterG = createSvgEl('g', { id: 'no5RollerBearing', transform: 'translate(66.5, 196.5)', filter: 'url(#no5MechShadow)' });
    const rollerBallsEl = createSvgEl('g', { id: 'no5RollerBalls' });
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '7.6', fill: 'url(#no5SteelCase)', stroke: '#4A525C', 'stroke-width': '1.0' }));
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '6.6', fill: 'none', stroke: 'rgba(255,255,255,0.76)', 'stroke-width': '0.55' }));
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '4.6', fill: '#272C34', stroke: '#B6BEC7', 'stroke-width': '0.68' }));
    for (let rb = 0; rb < 8; rb++) {
      const rba = (rb * Math.PI * 2) / 8;
      rollerBallsEl.appendChild(createSvgEl('circle', {
        cx: (3.25 * Math.cos(rba)).toFixed(2), cy: (3.25 * Math.sin(rba)).toFixed(2),
        r: '0.82', fill: '#F4F7FA', stroke: '#4E555F', 'stroke-width': '0.22'
      }));
    }
    rollerBallsEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '2.1', fill: '#EEF1F5', stroke: '#505863', 'stroke-width': '0.55' }));
    rollerBallsEl.appendChild(createSvgEl('line', { x1: '-1.2', y1: '-0.6', x2: '1.2', y2: '0.6', stroke: '#434A53', 'stroke-width': '0.58' }));
    rollerOuterG.appendChild(rollerBallsEl);
    dialInner.appendChild(rollerOuterG);

    // =========================================================================
    // LAYER (E): 5:30 Radial Sunburst Small-Seconds Subdial (tucked under right
    //            minute plate!) + Curved Support Bridge Arm + Large Brushed Cap
    //            + 6 o'clock Red Triangle Pointer (▼) + 1.5mm Micro Ball Bearing
    // =========================================================================
    const secOuterG = createSvgEl('g', { transform: 'translate(178, 223)' });
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '44.8', fill: '#353B44', stroke: '#68707B', 'stroke-width': '1.1', class: 'subdial-well' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '43.9', fill: 'none', stroke: 'rgba(255,255,255,0.56)', 'stroke-width': '0.65' }));

    const secDiscEl = createSvgEl('g', { id: 'no5SecondsDisc' });
    secDiscEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '42.6', fill: 'url(#no5SunburstBase)', stroke: '#7B838E', 'stroke-width': '0.85', class: 'sat-disc-face' }));

    // High-contrast metallic radial bow-tie sunburst wedges (matching 00:32–00:33 macro!)
    [
      [0, 38, 'rgba(255,255,255,0.56)'],
      [46, 92, 'rgba(42,48,58,0.24)'],
      [110, 148, 'rgba(255,255,255,0.46)'],
      [172, 218, 'rgba(42,48,58,0.26)'],
      [234, 274, 'rgba(255,255,255,0.54)'],
      [296, 338, 'rgba(42,48,58,0.22)']
    ].forEach(function (w) {
      const q1 = polar(0, 0, 42.2, w[0]);
      const q2 = polar(0, 0, 42.2, w[1]);
      secDiscEl.appendChild(createSvgEl('path', {
        d: 'M 0,0 L ' + q1[0].toFixed(2) + ',' + q1[1].toFixed(2) + ' A 42.2,42.2 0 0,1 ' + q2[0].toFixed(2) + ',' + q2[1].toFixed(2) + ' Z',
        fill: w[2]
      }));
    });
    secDiscEl.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '35.6', fill: 'none', stroke: 'rgba(24,28,34,0.22)', 'stroke-width': '0.65' }));

    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 35.8 : 38.2;
      const r2 = 41.8;
      secDiscEl.appendChild(createSvgEl('line', {
        x1: (r1 * Math.cos(rad)).toFixed(2), y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2), y2: (r2 * Math.sin(rad)).toFixed(2),
        class: s === 0 ? 'sec-tick-zero' : 'sec-tick',
        stroke: '#12151A', 'stroke-width': major ? '1.45' : '0.68', 'stroke-linecap': 'butt'
      }));
      if (major) {
        const rt = 29.2;
        const tx = rt * Math.cos(rad);
        const ty = rt * Math.sin(rad);
        const txt = createSvgEl('text', {
          x: tx.toFixed(1), y: ty.toFixed(1),
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-family': TECH_FONT, 'font-size': '6.8', 'font-weight': '800',
          class: s === 0 ? 'sec-label-zero' : 'sec-label',
          fill: '#12151A',
          transform: 'rotate(' + (s * 6 + 180) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')'
        });
        txt.textContent = s === 0 ? '60' : String(s).padStart(2, '0');
        secDiscEl.appendChild(txt);
      }
    }
    secOuterG.appendChild(secDiscEl);

    // Fixed curved support bridge arm anchoring the central 5:30 cap from 7 o'clock (00:32–00:33)
    secOuterG.appendChild(createSvgEl('path', {
      d: 'M -45,13 Q -29,9.5 -17.5,3 L -15.5,-5.5 Q -28,-1.5 -44,2.5 Z',
      fill: 'url(#no5BridgeSteel)', stroke: '#505863', 'stroke-width': '0.9', class: 'bridge-arm'
    }));
    secOuterG.appendChild(createSvgEl('path', {
      d: 'M -42,4.2 Q -28,0.6 -17,-3.6',
      fill: 'none', stroke: 'rgba(255,255,255,0.70)', 'stroke-width': '0.6'
    }));
    appendSlottedScrew(secOuterG, -35.0, 6.2, 2.5, -18);

    // Large brushed silver central cap (r=18.2, matching 00:32–00:33 macro!) + 6h crimson red triangle + 1.5mm bearing
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '18.2', fill: 'url(#no5BridgeSteel)', stroke: '#525A65', 'stroke-width': '1.05', class: 'subdial-cap' }));
    secOuterG.appendChild(createSvgEl('path', { d: 'M 0,0 L -9,-17 L 9,-17 Z M 0,0 L -9,17 L 9,17 Z', fill: 'rgba(255,255,255,0.34)' }));
    secOuterG.appendChild(createSvgEl('path', { d: 'M 0,0 L -17,-7 L -17,7 Z M 0,0 L 17,-7 L 17,7 Z', fill: 'rgba(36,42,50,0.14)' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '17.1', fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.65' }));
    secOuterG.appendChild(createSvgEl('polygon', { points: '-3.8,8.0 3.8,8.0 0,15.6', class: 'sec-pointer', fill: '#D42E26', stroke: '#7B1813', 'stroke-width': '0.45' }));
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '4.8', fill: '#252A31', stroke: '#AEB6C1', 'stroke-width': '0.8' }));
    for (let b = 0; b < 7; b++) {
      const ba = (b * Math.PI * 2) / 7;
      secOuterG.appendChild(createSvgEl('circle', {
        cx: (3.15 * Math.cos(ba)).toFixed(2), cy: (3.15 * Math.sin(ba)).toFixed(2),
        r: '0.86', fill: '#F6F9FC', stroke: '#444B55', 'stroke-width': '0.24'
      }));
    }
    secOuterG.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '1.85', fill: '#F1F4F8', stroke: '#4C545F', 'stroke-width': '0.52' }));
    dialInner.appendChild(secOuterG);

    // =========================================================================
    // LAYER (F): 3 MASSIVE 4-Pad CNC Maltese Satellite Hour Wheels (HUGE ~21.5px
    //            Katayama Numerals 1..12) + 3-Connected Tri-Symmetric Steel Wire
    //            Spring + Unified Continuous Y-Shaped 3-Arm CNC Carousel Bridge
    // =========================================================================
    const satAssemblyG = createSvgEl('g', { id: 'no5SatelliteAssembly', filter: 'url(#no5MechShadow)' });
    const satWheelD = buildSatelliteWheelPath(43.8, 16.4, 25.0, 15.8);
    const satGroups = [];

    for (let k = 0; k < 3; k++) {
      const outer = createSvgEl('g', { id: 'no5SatDisc' + k, 'data-sat-disc': String(k) });
      const inner = createSvgEl('g');

      inner.appendChild(createSvgEl('path', {
        d: satWheelD, fill: 'url(#no5PaddleMetal)', stroke: '#5B636E', 'stroke-width': '0.95', class: 'sat-disc-face'
      }));
      inner.appendChild(createSvgEl('path', { d: satWheelD, fill: 'url(#no5Brushed316L)', opacity: '0.46' }));
      inner.appendChild(createSvgEl('path', {
        d: satWheelD, fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.62',
        transform: 'scale(0.962)', class: 'sat-chamfer'
      }));

      for (let j = 0; j < 4; j++) {
        const num = DISC_NUMS[k][j];
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 27.9;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);

        // Authentic fine precision black index dash right at the outer tab rim (00:14, 00:21, 00:23)
        inner.appendChild(createSvgEl('line', {
          x1: '39.6', y1: '0', x2: '43.5', y2: '0',
          class: 'sat-pointer-line', stroke: '#111419', 'stroke-width': '1.65', 'stroke-linecap': 'butt',
          transform: 'rotate(' + deg + ')'
        }));

        // HUGE authentic Katayama technical square-geometric vector numeral (1..12)
        appendVectorHourNumeral(inner, num, tx, ty, deg);
      }

      inner.appendChild(createSvgEl('circle', { cx: '0', cy: '0', r: '9.2', fill: 'url(#no5SatinSilver)', stroke: '#626A75', 'stroke-width': '0.85' }));
      appendSlottedScrew(inner, 0, 0, 5.2, 28 + k * 40);

      outer.appendChild(inner);
      satAssemblyG.appendChild(outer);
      satGroups.push({ outer: outer, inner: inner });
    }

    // 3-Connected Tri-Symmetric Steel Wire Spring linking all 3 satellite valleys (rotates with carousel!)
    const triWireEl = buildTriConnectedWireSpring();
    satAssemblyG.appendChild(triWireEl);

    // Unified Continuous Y-Shaped 3-Arm CNC Carousel Bridge (seamless concave fillets, 00:32–00:33)
    const bridgeEl = createSvgEl('g', { id: 'no5CarouselBridge', filter: 'url(#no5BridgeShadow)' });
    const yOuterD = buildContinuousYBridgePath(150, 150, ORBIT_R, 14.2, 24.4, 21.4);
    const yChamferD = buildContinuousYBridgePath(150, 150, ORBIT_R, 12.4, 23.8, 22.8);

    bridgeEl.appendChild(createSvgEl('path', {
      d: yOuterD, fill: 'url(#no5BridgeSteel)', stroke: '#4E5661', 'stroke-width': '1.15', class: 'bridge-arm'
    }));
    bridgeEl.appendChild(createSvgEl('path', { d: yOuterD, fill: 'url(#no5Brushed316L)', opacity: '0.42' }));
    bridgeEl.appendChild(createSvgEl('path', {
      d: yChamferD, fill: 'none', stroke: 'rgba(255,255,255,0.84)', 'stroke-width': '0.9', class: 'bridge-chamfer'
    }));

    // 3 sleek beveled capsule milling slots + 3 iconic oversized countersunk tip pivot screws (r=8.8) + 3 inner hub screws
    for (let arm = 0; arm < 3; arm++) {
      const armG = createSvgEl('g', { transform: 'rotate(' + (arm * 120) + ' 150 150)' });
      armG.appendChild(createSvgEl('rect', {
        x: '147.1', y: '109.2', width: '5.8', height: '18.6', rx: '2.9',
        fill: 'url(#no5SlotRecess)', stroke: '#434A53', 'stroke-width': '0.8'
      }));
      armG.appendChild(createSvgEl('rect', {
        x: '147.9', y: '110.0', width: '4.2', height: '17.0', rx: '2.1',
        fill: 'none', stroke: 'rgba(255,255,255,0.48)', 'stroke-width': '0.52'
      }));
      appendSlottedScrew(armG, 150, 150 - ORBIT_R, 8.8, 24 + arm * 35, true);
      appendSlottedScrew(armG, 150, 133.2, 3.3, -32 + arm * 25, false);
      bridgeEl.appendChild(armG);
    }

    // Deep conical recessed central hub -> sunken matte-gold brass bushing & hollow bore (00:32–00:33)
    bridgeEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '15.2', fill: 'none', stroke: 'rgba(255,255,255,0.72)', 'stroke-width': '0.78', class: 'bridge-chamfer' }));
    bridgeEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '12.2', fill: '#31363E', stroke: '#555D68', 'stroke-width': '0.95' }));
    bridgeEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '9.6', fill: 'url(#no5Brass)', stroke: '#5E4213', 'stroke-width': '0.9' }));
    bridgeEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '5.2', fill: 'url(#no5SteelCase)', stroke: '#464D56', 'stroke-width': '0.75' }));
    bridgeEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '2.3', fill: '#1F2329' }));

    satAssemblyG.appendChild(bridgeEl);
    dialInner.appendChild(satAssemblyG);

    // =========================================================================
    // LAYER (G): Sleek Right Fixed 120° Minute Scale Plate (r=98.5..129.0,
    //            Inner & Outer Dual Tick Rails · Upright 0~60 Numerals · Study Arc)
    //            + Clean Slim Flush Brushed-Steel Arch Chapter Plates:
    //              Top-Left: "CASPER™ · V1 ENGINE" | Bottom-Left: "NO.1 PRO"
    // =========================================================================
    const minutePlateG = createSvgEl('g', { id: 'no5MinutePlate', filter: 'url(#no5MechShadow)' });
    const minPlateD = arcSectorPath(150, 150, 98.5, 129.0, -64.0, 64.5);
    minutePlateG.appendChild(createSvgEl('path', { d: minPlateD, fill: 'url(#no5PlaqueSteel)', stroke: '#565E69', 'stroke-width': '1.1', class: 'minute-plate-face' }));
    minutePlateG.appendChild(createSvgEl('path', { d: minPlateD, fill: 'url(#no5Brushed316L)', opacity: '0.38', 'pointer-events': 'none' }));

    // Inner & outer concentric instrument guide rails (matching 00:21–00:22)
    minutePlateG.appendChild(createSvgEl('path', { d: arcLinePath(150, 150, 99.4, -60, 60, true), fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.6' }));
    minutePlateG.appendChild(createSvgEl('path', { d: arcLinePath(150, 150, 105.4, -60, 60, true), fill: 'none', stroke: '#23272E', 'stroke-width': '0.7', class: 'minute-rail' }));
    minutePlateG.appendChild(createSvgEl('path', { d: arcLinePath(150, 150, 122.4, -60, 60, true), fill: 'none', stroke: '#23272E', 'stroke-width': '0.7', class: 'minute-rail' }));

    // Study Timer Target & Elapsed Arcs (sleek inner rim indicator r=97.6)
    const targetArcEl = createSvgEl('path', { id: 'no5TargetArc', class: 'study-target-arc', d: '', fill: 'none', 'stroke-width': '2.6', 'stroke-linecap': 'round' });
    const elapsedArcEl = createSvgEl('path', { id: 'no5ElapsedArc', class: 'study-elapsed-arc', d: '', fill: 'none', 'stroke-width': '2.6', 'stroke-linecap': 'round' });
    const targetDotEl = createSvgEl('circle', { id: 'no5TargetDot', class: 'study-target-dot', cx: '0', cy: '0', r: '2.1', opacity: '0' });
    minutePlateG.appendChild(targetArcEl);
    minutePlateG.appendChild(elapsedArcEl);
    minutePlateG.appendChild(targetDotEl);

    // Dual inner + outer precision minute ticks (0..60) & bold crisp upright numerals (0, 5, 10, ..., 60)
    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const isQuarter = m % 15 === 0;

      // Inner scale ticks (r = 99.2 .. 105.0)
      const rIn1 = 99.2;
      const rOut1 = isMajor ? 105.0 : 103.0;
      minutePlateG.appendChild(createSvgEl('line', {
        x1: (150 + rIn1 * Math.cos(rad)).toFixed(2), y1: (150 + rIn1 * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut1 * Math.cos(rad)).toFixed(2), y2: (150 + rOut1 * Math.sin(rad)).toFixed(2),
        class: isQuarter ? 'min-tick-quarter' : (isMajor ? 'min-tick-major' : 'min-tick-minor'),
        stroke: '#12151A', 'stroke-width': isMajor ? '1.6' : '0.76', 'stroke-linecap': 'butt'
      }));

      // Outer precision scale ticks (r = 122.8 .. 127.4, authentic 00:21–00:22 outer rail!)
      const rIn2 = 122.8;
      const rOut2 = isMajor ? 127.4 : 125.4;
      minutePlateG.appendChild(createSvgEl('line', {
        x1: (150 + rIn2 * Math.cos(rad)).toFixed(2), y1: (150 + rIn2 * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut2 * Math.cos(rad)).toFixed(2), y2: (150 + rOut2 * Math.sin(rad)).toFixed(2),
        class: isMajor ? 'min-tick-major' : 'min-tick-minor',
        stroke: '#1C2026', 'stroke-width': isMajor ? '1.25' : '0.66', 'stroke-linecap': 'butt'
      }));

      if (isMajor) {
        const rTxt = 114.0;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const mTxt = createSvgEl('text', {
          x: tx.toFixed(1), y: ty.toFixed(1),
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-family': TECH_FONT,
          'font-size': isQuarter ? '9.8' : '8.9',
          'font-weight': '800',
          'letter-spacing': '-0.2',
          class: isQuarter ? 'min-label-quarter' : 'min-label',
          fill: '#111419'
        });
        mTxt.textContent = String(m);
        minutePlateG.appendChild(mTxt);
      }
    }
    dialInner.appendChild(minutePlateG);

    // =========================================================================
    // LAYER (G2): Opposite-Side (Left 120°) Hour Gauge Rail (0..12H)
    //             Climbs upward from +120° (7h = 0H) to +240° (11h = 12H)
    // =========================================================================
    const hourGaugeG = createSvgEl('g', { id: 'no5HourGauge', class: 'hour-gauge-group' });
    // Subtle recessed instrument base track (r = 107.2)
    hourGaugeG.appendChild(createSvgEl('path', {
      d: arcLinePath(150, 150, HOUR_ARC_R, 120, 240, true),
      fill: 'none', class: 'study-hour-track', 'stroke-width': '2.6', 'stroke-linecap': 'round'
    }));
    // Fine 0..12H precision ticks (10° per hour; major at 0, 3, 6, 9, 12H)
    for (let h = 0; h <= 12; h++) {
      const hDeg = 120 + h * 10;
      const hRad = (hDeg * Math.PI) / 180;
      const isMajorH = h % 3 === 0;
      const rInH = isMajorH ? 104.2 : 105.6;
      const rOutH = isMajorH ? 109.5 : 108.7;
      hourGaugeG.appendChild(createSvgEl('line', {
        x1: (150 + rInH * Math.cos(hRad)).toFixed(2), y1: (150 + rInH * Math.sin(hRad)).toFixed(2),
        x2: (150 + rOutH * Math.cos(hRad)).toFixed(2), y2: (150 + rOutH * Math.sin(hRad)).toFixed(2),
        class: isMajorH ? 'hour-tick-major' : 'hour-tick-minor',
        'stroke-width': isMajorH ? '1.15' : '0.65', 'stroke-linecap': 'butt'
      }));
    }
    const targetHourArcEl = createSvgEl('path', { id: 'no5TargetHourArc', class: 'study-hour-target-arc', d: '', fill: 'none', 'stroke-width': '3.0', 'stroke-linecap': 'round' });
    const elapsedHourArcEl = createSvgEl('path', { id: 'no5ElapsedHourArc', class: 'study-hour-elapsed-arc', d: '', fill: 'none', 'stroke-width': '3.0', 'stroke-linecap': 'round' });
    const targetHourDotEl = createSvgEl('circle', { id: 'no5TargetHourDot', class: 'study-hour-target-dot', cx: '0', cy: '0', r: '2.3', opacity: '0' });
    hourGaugeG.appendChild(targetHourArcEl);
    hourGaugeG.appendChild(elapsedHourArcEl);
    hourGaugeG.appendChild(targetHourDotEl);
    dialInner.appendChild(hourGaugeG);

    // Clean Slim Flush Brushed-Steel Arch Chapter Plates (r=110.5..128.8 — generous arena for huge satellite discs!)
    const plaquesG = createSvgEl('g', { class: 'homage-plaques' });

    // Top-Left Flush Chapter Arch (9:25 ~ 12:15): "CASPER™ · V1 ENGINE"
    const topPlaqueD = arcSectorPath(150, 150, 110.5, 128.8, 193, 275);
    plaquesG.appendChild(createSvgEl('path', { d: topPlaqueD, fill: 'url(#no5PlaqueSteel)', stroke: '#565E69', 'stroke-width': '0.95', class: 'plaque-arch' }));
    plaquesG.appendChild(createSvgEl('path', { d: topPlaqueD, fill: 'url(#no5Brushed316L)', opacity: '0.40' }));
    plaquesG.appendChild(createSvgEl('path', { d: arcLinePath(150, 150, 111.7, 194, 274, true), fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.6' }));

    const topEngraving = createSvgEl('text', {
      'font-family': TECH_FONT, 'font-size': '8.2', 'font-weight': '900',
      fill: '#13161B', 'letter-spacing': '0.9', class: 'plaque-title'
    });
    const topEngravingPath = createSvgEl('textPath', { href: '#no5TopPlaquePath', startOffset: '50%', 'text-anchor': 'middle' });
    topEngravingPath.setAttributeNS(XLINK_NS, 'xlink:href', '#no5TopPlaquePath');
    topEngravingPath.textContent = 'CASPER™ · V1 ENGINE';
    topEngraving.appendChild(topEngravingPath);
    plaquesG.appendChild(topEngraving);

    // Bottom-Left Flush Chapter Arch (6:30 ~ 8:10): "NO.1 PRO"
    const botPlaqueD = arcSectorPath(150, 150, 110.5, 128.8, 107, 156);
    plaquesG.appendChild(createSvgEl('path', { d: botPlaqueD, fill: 'url(#no5PlaqueSteel)', stroke: '#565E69', 'stroke-width': '0.95', class: 'plaque-arch' }));
    plaquesG.appendChild(createSvgEl('path', { d: botPlaqueD, fill: 'url(#no5Brushed316L)', opacity: '0.40' }));
    plaquesG.appendChild(createSvgEl('path', { d: arcLinePath(150, 150, 111.7, 108, 155, true), fill: 'none', stroke: 'rgba(255,255,255,0.68)', 'stroke-width': '0.6' }));

    const botEngraving = createSvgEl('text', {
      'font-family': TECH_FONT, 'font-size': '8.5', 'font-weight': '900',
      fill: '#13161B', 'letter-spacing': '1.0', class: 'plaque-sub'
    });
    const botEngravingPath = createSvgEl('textPath', { href: '#no5BotPlaquePath', startOffset: '50%', 'text-anchor': 'middle' });
    botEngravingPath.setAttributeNS(XLINK_NS, 'xlink:href', '#no5BotPlaquePath');
    botEngravingPath.textContent = 'NO.1 PRO';
    botEngraving.appendChild(botEngravingPath);
    plaquesG.appendChild(botEngraving);
    dialInner.appendChild(plaquesG);

    // =========================================================================
    // LAYER (H): 4.6mm High-Profile Box Sapphire Crystal Optical Refraction Rim
    // =========================================================================
    dialInner.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '129.0', fill: 'url(#no5GlassShine)', 'pointer-events': 'none' }));
    dialInner.appendChild(createSvgEl('path', { d: 'M 48,76 Q 112,30 192,38 Q 128,60 66,112 Z', fill: 'rgba(255,255,255,0.11)', 'pointer-events': 'none' }));
    dialClickableEl.appendChild(dialInner);

    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '129.0', fill: 'none', stroke: 'rgba(255,255,255,0.54)', 'stroke-width': '1.6', 'pointer-events': 'none' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '126.8', fill: 'none', stroke: 'rgba(255,255,255,0.22)', 'stroke-width': '1.1', 'pointer-events': 'none' }));
    dialClickableEl.appendChild(createSvgEl('circle', { cx: '150', cy: '150', r: '125.2', fill: 'none', stroke: 'rgba(32,36,42,0.11)', 'stroke-width': '0.6', 'pointer-events': 'none' }));
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
      targetArcEl: targetArcEl,
      elapsedArcEl: elapsedArcEl,
      targetDotEl: targetDotEl,
      targetHourArcEl: targetHourArcEl,
      elapsedHourArcEl: elapsedHourArcEl,
      targetHourDotEl: targetHourDotEl,
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

    // Dedicated HTML touch handle over 4:18 (+39°) crown (blocks iOS Safari / Android Chrome scroll hijack)
    const crownOverlayEl = document.createElement('div');
    crownOverlayEl.id = 'no5CrownTouchOverlay';
    crownOverlayEl.className = 'crown-touch-overlay';
    crownOverlayEl.setAttribute('tabindex', '0');
    crownOverlayEl.setAttribute('role', 'slider');
    crownOverlayEl.setAttribute('aria-label', '4시 용두 — 클릭해 1단 인출(시간 설정) / 복귀(분 설정), 휠·드래그로 조절');
    containerEl.appendChild(crownOverlayEl);

    let crownPulled = false;
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let downClientX = 0;
    let downClientY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let dragAccum = 0;
    let gestureStepsEmitted = 0;
    let turnTimerId = null;

    const COS39 = Math.cos((39 * Math.PI) / 180);
    const SIN39 = Math.sin((39 * Math.PI) / 180);

    function setCrownPulled(pulled, silent) {
      const next = Boolean(pulled);
      if (next === crownPulled) return;
      crownPulled = next;
      parts.crownEl.classList.toggle('is-pulled', crownPulled);
      parts.svg.classList.toggle('is-crown-pulled', crownPulled);
      crownOverlayEl.classList.toggle('is-pulled', crownPulled);
      crownOverlayEl.setAttribute(
        'aria-label',
        crownPulled
          ? '4시 용두 1단 인출됨 (시간 설정 모드) — 휠·드래그로 ±1시간 조절, 클릭 시 분 설정 복귀'
          : '4시 용두 (분 설정 모드) — 휠·드래그로 ±1분 조절, 클릭 시 1단 인출해 시간 설정'
      );
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(crownPulled ? [10, 18, 8] : 10); } catch (err) {}
      }
      if (!silent && typeof cb.onCrownPullChange === 'function') {
        cb.onCrownPullChange(crownPulled);
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

    function emitCrownStep(delta, unitOverride) {
      const unit = unitOverride || (crownPulled ? 'hour' : 'minute');
      animateCrown(delta > 0 ? 1 : -1);
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(6); } catch (err) {}
      }
      if (typeof cb.onCrownStep === 'function') {
        cb.onCrownStep(delta, unit);
      }
    }

    function applyCrownDelta(dx, dy, shiftKey, baseThresholdPx) {
      const thresholdPx = crownPulled ? Math.max(13, baseThresholdPx + 4) : baseThresholdPx;
      const proj = (-dy * COS39) + (-dx * SIN39 * 0.65);
      dragAccum += proj;
      while (Math.abs(dragAccum) >= thresholdPx) {
        const dir = dragAccum > 0 ? 1 : -1;
        dragAccum -= dir * thresholdPx;
        gestureStepsEmitted += 1;
        const mult = crownPulled ? (shiftKey ? 3 : 1) : (shiftKey ? 5 : 1);
        emitCrownStep(dir * mult, crownPulled ? 'hour' : 'minute');
      }
    }

    function bindCrownTarget(targetEl) {
      if (!targetEl) return;

      targetEl.addEventListener('mouseenter', function () { parts.crownEl.classList.add('is-hover'); });
      targetEl.addEventListener('mouseleave', function () { parts.crownEl.classList.remove('is-hover'); });

      targetEl.addEventListener('wheel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dir = e.deltaY < 0 ? 1 : -1;
        const mult = crownPulled ? (e.shiftKey ? 3 : 1) : (e.shiftKey ? 5 : 1);
        emitCrownStep(dir * mult, crownPulled ? 'hour' : 'minute');
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
        applyCrownDelta(dx, dy, false, 9);
      }, { passive: false });

      function endTouch(e) {
        if (!touchDragging) return;
        if (e && e.cancelable) e.preventDefault();
        const travel = Math.hypot(lastClientX - downClientX, lastClientY - downClientY);
        const wasTap = e && e.type === 'touchend' && gestureStepsEmitted === 0 && travel < 8;
        touchDragging = false;
        parts.crownEl.classList.remove('is-dragging');
        crownOverlayEl.classList.remove('is-dragging');
        if (wasTap) {
          setCrownPulled(!crownPulled, false);
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
        applyCrownDelta(dx, dy, e.shiftKey, 10);
      });

      function endPointer(e) {
        if (!pointerDragging) return;
        const travel = Math.hypot(lastClientX - downClientX, lastClientY - downClientY);
        const wasClick = e && e.type === 'pointerup' && gestureStepsEmitted === 0 && travel < 6;
        pointerDragging = false;
        parts.crownEl.classList.remove('is-dragging');
        crownOverlayEl.classList.remove('is-dragging');
        if (e && targetEl.releasePointerCapture) {
          try { targetEl.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        if (wasClick) {
          setCrownPulled(!crownPulled, false);
        }
      }
      targetEl.addEventListener('pointerup', endPointer);
      targetEl.addEventListener('pointercancel', endPointer);

      targetEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          emitCrownStep(crownPulled ? (e.shiftKey ? 3 : 1) : (e.shiftKey ? 5 : 1));
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          emitCrownStep(crownPulled ? (e.shiftKey ? -3 : -1) : (e.shiftKey ? -5 : -1));
        } else if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          setCrownPulled(!crownPulled, false);
        }
      });
    }

    bindCrownTarget(crownOverlayEl);
    bindCrownTarget(parts.crownEl);

    // Single-click = 5270P gong | Double-click (or double-tap) = 600x demo toggle
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

      const balAngle = snapshot.running ? Math.sin((nowPerf || 0) * 0.02513274) * 18 : 0;
      parts.balEl.setAttribute('transform', 'translate(165, 82) rotate(' + balAngle.toFixed(1) + ')');
      const gearDeg = (snapshot.tHours * 360) % 360;
      parts.subGearEl.setAttribute('transform', 'rotate(' + gearDeg.toFixed(2) + ')');
      parts.subGear2El.setAttribute('transform', 'rotate(' + (-gearDeg * 1.333).toFixed(2) + ')');

      const targetMin = snapshot.targetArcMinutes || 0;
      const elapsedMin = snapshot.elapsedArcMinutes || 0;
      const targetHours = snapshot.targetArcHours || 0;
      const elapsedHours = snapshot.elapsedArcHours || 0;
      const isBreak = snapshot.phase === 'break';

      parts.svg.classList.toggle('is-break-phase', isBreak);
      parts.svg.classList.toggle('is-warning-phase', Boolean(snapshot.isWarning));
      parts.svg.classList.toggle('is-running', Boolean(snapshot.running));
      parts.svg.classList.toggle('has-hour-gauge', targetHours > 0 || elapsedHours > 0.02);

      // Right 120° Minute Gauge (0..60m)
      if (targetMin > 0) {
        parts.targetArcEl.setAttribute('d', describeMinuteArc(ARC_R, 0, targetMin));
        parts.targetArcEl.setAttribute('opacity', '1');

        const dotDeg = -60 + Math.min(60, targetMin) * 2;
        const dotPt = polar(150, 150, ARC_R, dotDeg);
        parts.targetDotEl.setAttribute('cx', dotPt[0].toFixed(2));
        parts.targetDotEl.setAttribute('cy', dotPt[1].toFixed(2));
        parts.targetDotEl.setAttribute('opacity', '1');
      } else {
        parts.targetArcEl.setAttribute('d', '');
        parts.targetArcEl.setAttribute('opacity', '0');
        parts.targetDotEl.setAttribute('opacity', '0');
      }

      if (elapsedMin > 0.08) {
        parts.elapsedArcEl.setAttribute('d', describeMinuteArc(ARC_R, 0, elapsedMin));
        parts.elapsedArcEl.setAttribute('opacity', '1');
      } else {
        parts.elapsedArcEl.setAttribute('d', '');
        parts.elapsedArcEl.setAttribute('opacity', '0');
      }

      // Left Opposite-Side 120° Hour Gauge (0..12H, climbs bottom-left -> top-left)
      if (targetHours > 0) {
        parts.targetHourArcEl.setAttribute('d', describeHourArc(HOUR_ARC_R, 0, targetHours));
        parts.targetHourArcEl.setAttribute('opacity', '1');

        const hDotDeg = 120 + Math.min(12, targetHours) * 10;
        const hDotPt = polar(150, 150, HOUR_ARC_R, hDotDeg);
        parts.targetHourDotEl.setAttribute('cx', hDotPt[0].toFixed(2));
        parts.targetHourDotEl.setAttribute('cy', hDotPt[1].toFixed(2));
        parts.targetHourDotEl.setAttribute('opacity', '1');
      } else {
        parts.targetHourArcEl.setAttribute('d', '');
        parts.targetHourArcEl.setAttribute('opacity', '0');
        parts.targetHourDotEl.setAttribute('opacity', '0');
      }

      if (elapsedHours > 0.02) {
        parts.elapsedHourArcEl.setAttribute('d', describeHourArc(HOUR_ARC_R, 0, elapsedHours));
        parts.elapsedHourArcEl.setAttribute('opacity', '1');
      } else {
        parts.elapsedHourArcEl.setAttribute('d', '');
        parts.elapsedHourArcEl.setAttribute('opacity', '0');
      }
    }

    return {
      svgRoot: parts.svg,
      render: render,
      triggerVisualAlarm: triggerVisualAlarm,
      setCrownPulled: setCrownPulled,
      isCrownPulled: function () { return crownPulled; }
    };
  }

  global.SatelliteEngine = {
    mount: mount,
    describeMinuteArc: describeMinuteArc,
    describeHourArc: describeHourArc
  };
})(typeof window !== 'undefined' ? window : globalThis);
