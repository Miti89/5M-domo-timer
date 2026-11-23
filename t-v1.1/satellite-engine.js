/**
 * NO.5 CHRONO — Photorealistic Ōtsuka Lōtec No. 5 Kai (5号 改) Pure SVG Engine
 * Razor-sharp CNC raw silver-steel timepiece:
 *   - Thin 316L straight-brushed steel bezel + 4.6mm box sapphire rim refraction
 *   - Razor-sharp serrated 4 o'clock (+33°) CNC gear crown + mobile scroll-locked HTML touch handle
 *   - Bright satin silver multi-layer skeleton mainplate + subtle 1 o'clock brass balance wheel
 *   - 3 sharp 45°-chamfered 4-blade CNC cross satellite hour wheels (bold industrial numerals)
 *   - Chunky 45°-chamfered Y-shaped 3-Arm CNC carousel bridge + pill slots + deep brass hub
 *   - Right fixed 120° silver minute track with double guide rails & upright black numerals (5..60)
 *   - 5:30 radial sunburst small-seconds disc + central 6 o'clock red pointer & 1.5mm ball bearing
 *   - Matching top-left & bottom-left satin silver arch homage plaques
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const ORBIT_R = 55;
  const ARC_R = 94.8;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  // Razor-sharp CNC 4-blade Maltese/Cross satellite paddle (1.4px 45° chamfer corners + circular roller cutouts)
  const CROSS_PADDLE_PATH = [
    'M 18.2,-10.8 L 34.4,-10.8 L 36.0,-9.2 L 36.0,9.2 L 34.4,10.8 L 18.2,10.8',
    'A 8.8,8.8 0 0,0 10.8,18.2',
    'L 10.8,34.4 L 9.2,36.0 L -9.2,36.0 L -10.8,34.4 L -10.8,18.2',
    'A 8.8,8.8 0 0,0 -18.2,10.8',
    'L -34.4,10.8 L -36.0,9.2 L -36.0,-9.2 L -34.4,-10.8 L -18.2,-10.8',
    'A 8.8,8.8 0 0,0 -10.8,-18.2',
    'L -10.8,-34.4 L -9.2,-36.0 L 9.2,-36.0 L 10.8,-34.4 L 10.8,-18.2',
    'A 8.8,8.8 0 0,0 18.2,-10.8 Z'
  ].join(' ');

  // Sharp faceted CNC gear-crown outer silhouette (crisp 45° chamfers + stepped flange, zero soft bubbles)
  const CROWN_BODY_PATH = [
    'M 289.2,130.0 L 291.6,127.0 L 306.8,127.0 L 310.2,130.4 L 312.6,133.2',
    'L 312.6,166.8 L 310.2,169.6 L 306.8,173.0 L 291.6,173.0 L 289.2,170.0 Z'
  ].join(' ');

  function svgEl(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, String(attrs[k]));
      });
    }
    return node;
  }

  function createGearPath(cx, cy, teeth, rOuter, rInner) {
    const pts = [];
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.48;
      const a3 = a0 + step * 0.70;
      const seg = [
        [cx + rInner * Math.cos(a0), cy + rInner * Math.sin(a0)],
        [cx + rOuter * Math.cos(a1), cy + rOuter * Math.sin(a1)],
        [cx + rOuter * Math.cos(a2), cy + rOuter * Math.sin(a2)],
        [cx + rInner * Math.cos(a3), cy + rInner * Math.sin(a3)]
      ];
      for (let j = 0; j < seg.length; j++) {
        pts.push((i === 0 && j === 0 ? 'M' : 'L') + seg[j][0].toFixed(2) + ',' + seg[j][1].toFixed(2));
      }
    }
    pts.push('Z');
    return pts.join(' ');
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

  function buildCrownTeethMarkup() {
    // 13 razor-sharp CNC knurling flutes + protruding sawtooth profile tips
    const lines = [];
    for (let y = 126.2; y <= 173.8; y += 3.6) {
      const yDark = y.toFixed(1);
      const yPeak = (y + 1.2).toFixed(1);
      const yHigh = (y + 2.1).toFixed(1);
      // Deep V-groove shadow
      lines.push(`      <line x1="289.2" y1="${yDark}" x2="309.5" y2="${yDark}" stroke="#272C33" stroke-width="1.35" />`);
      // Sharp bright metallic tooth crest
      lines.push(`      <line x1="289.4" y1="${yPeak}" x2="309.2" y2="${yPeak}" stroke="#FFFFFF" stroke-opacity="0.72" stroke-width="0.95" />`);
      // Secondary bevel edge
      lines.push(`      <line x1="289.6" y1="${yHigh}" x2="309.0" y2="${yHigh}" stroke="#59616C" stroke-width="0.6" />`);
    }
    // Protruding serrated gear teeth on top/bottom profile corners for razor-sharp silhouette
    const topNotches = [
      'M 291.0,127.4 L 292.4,125.0 L 294.6,125.0 L 295.6,127.4',
      'M 296.4,127.4 L 297.6,125.0 L 300.0,125.0 L 301.0,127.4',
      'M 301.8,127.4 L 303.0,125.0 L 305.4,125.0 L 306.6,127.4'
    ];
    const botNotches = [
      'M 291.0,172.6 L 292.4,175.0 L 294.6,175.0 L 295.6,172.6',
      'M 296.4,172.6 L 297.6,175.0 L 300.0,175.0 L 301.0,172.6',
      'M 301.8,172.6 L 303.0,175.0 L 305.4,175.0 L 306.6,172.6'
    ];
    return {
      flutes: lines.join('\n'),
      serrations: topNotches.concat(botNotches).map(function (d) {
        return `    <path d="${d}" fill="url(#no5SteelCase)" stroke="#383E46" stroke-width="0.85" stroke-linejoin="miter" />`;
      }).join('\n')
    };
  }

  function buildSvgMarkup() {
    const primaryGearPath = createGearPath(0, 0, 22, 29, 25.2);
    const secondaryGearPath = createGearPath(0, 0, 16, 19, 16.0);
    const crownTeeth = buildCrownTeethMarkup();

    return [
      '<svg class="no5-svg" viewBox="-18 -18 336 336" role="img" aria-label="NO.5 CHRONO Ōtsuka Lōtec No. 5 Kai 오마주 기계식 공부 타이머">',
      '  <defs>',
      '    <!-- 4시 날카로운 CNC 톱니 용두 입체 그라데이션 -->',
      '    <linearGradient id="no5CrownCyl" x1="0%" y1="0%" x2="0%" y2="100%">',
      '      <stop offset="0%" class="grad-case-4" stop-color="#484F59" />',
      '      <stop offset="16%" class="grad-case-1" stop-color="#D2D8E0" />',
      '      <stop offset="36%" class="grad-case-0" stop-color="#FFFFFF" />',
      '      <stop offset="56%" class="grad-case-2" stop-color="#BAC2CC" />',
      '      <stop offset="82%" class="grad-case-3" stop-color="#6B737E" />',
      '      <stop offset="100%" class="grad-case-4" stop-color="#373D45" />',
      '    </linearGradient>',
      '    <!-- 316L 직선 브러시드 스틸 케이스 그라데이션 -->',
      '    <linearGradient id="no5SteelCase" x1="8%" y1="0%" x2="92%" y2="100%">',
      '      <stop offset="0%" class="grad-case-0" stop-color="#F6F8FA" />',
      '      <stop offset="28%" class="grad-case-1" stop-color="#C5CCD5" />',
      '      <stop offset="56%" class="grad-case-2" stop-color="#E8ECF0" />',
      '      <stop offset="82%" class="grad-case-3" stop-color="#9EA7B2" />',
      '      <stop offset="100%" class="grad-case-4" stop-color="#707883" />',
      '    </linearGradient>',
      '    <!-- 직선 브러싱 헤어라인 패턴 -->',
      '    <pattern id="no5BrushedV" width="3.0" height="18" patternUnits="userSpaceOnUse">',
      '      <line x1="0.7" y1="0" x2="0.7" y2="18" stroke="rgba(255,255,255,0.32)" stroke-width="0.55" />',
      '      <line x1="2.1" y1="0" x2="2.1" y2="18" stroke="rgba(30,35,42,0.14)" stroke-width="0.45" />',
      '    </pattern>',
      '    <!-- CNC 절삭 Y자 브릿지 실버 그라데이션 -->',
      '    <linearGradient id="no5SteelBridge" x1="12%" y1="6%" x2="88%" y2="94%">',
      '      <stop offset="0%" class="grad-bridge-0" stop-color="#FAFBFC" />',
      '      <stop offset="44%" class="grad-bridge-1" stop-color="#D7DCE3" />',
      '      <stop offset="76%" class="grad-bridge-2" stop-color="#B5BDC8" />',
      '      <stop offset="100%" class="grad-bridge-3" stop-color="#8B94A0" />',
      '    </linearGradient>',
      '    <!-- 밝은 생(Raw) 실버 메인플레이트 그라데이션 -->',
      '    <radialGradient id="no5Mainplate" cx="44%" cy="38%" r="68%">',
      '      <stop offset="0%" class="grad-plate-0" stop-color="#D1D7DF" />',
      '      <stop offset="58%" class="grad-plate-1" stop-color="#A6AFB9" />',
      '      <stop offset="100%" class="grad-plate-2" stop-color="#78808B" />',
      '    </radialGradient>',
      '    <!-- 새틴 실버 위성 패들 / 분 플레이트 / 명판 그라데이션 -->',
      '    <linearGradient id="no5SatinSilver" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" class="grad-satin-0" stop-color="#FFFFFF" />',
      '      <stop offset="48%" class="grad-satin-1" stop-color="#E2E6EC" />',
      '      <stop offset="82%" class="grad-satin-2" stop-color="#C4CBD4" />',
      '      <stop offset="100%" class="grad-satin-3" stop-color="#A7B0BB" />',
      '    </linearGradient>',
      '    <!-- 스몰 세컨드 방사형 실버 메탈 -->',
      '    <radialGradient id="no5SubdialSilver" cx="38%" cy="32%" r="72%">',
      '      <stop offset="0%" class="grad-sub-0" stop-color="#F8FAFC" />',
      '      <stop offset="56%" class="grad-sub-1" stop-color="#D3D9E1" />',
      '      <stop offset="100%" class="grad-sub-2" stop-color="#A4ACB7" />',
      '    </radialGradient>',
      '    <!-- 깊은 캡슐 밀링 슬롯 내부 음영 -->',
      '    <linearGradient id="no5SlotRecess" x1="0%" y1="0%" x2="100%" y2="0%">',
      '      <stop offset="0%" stop-color="#4B525B" />',
      '      <stop offset="45%" stop-color="#858E98" />',
      '      <stop offset="100%" stop-color="#C5CCD4" />',
      '    </linearGradient>',
      '    <!-- 황동 밸런스 휠 & 중앙 부싱 -->',
      '    <linearGradient id="no5BrassGear" x1="0%" y1="0%" x2="100%" y2="100%">',
      '      <stop offset="0%" stop-color="#F6DC8D" />',
      '      <stop offset="52%" stop-color="#CC9A3B" />',
      '      <stop offset="100%" stop-color="#845C19" />',
      '    </linearGradient>',
      '    <!-- 4.6mm 박스 사파이어 글래스 대각선 반사광 -->',
      '    <linearGradient id="no5GlassShine" x1="6%" y1="4%" x2="94%" y2="96%">',
      '      <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />',
      '      <stop offset="22%" stop-color="rgba(255,255,255,0.08)" />',
      '      <stop offset="38%" stop-color="rgba(255,255,255,0)" />',
      '      <stop offset="54%" stop-color="rgba(255,255,255,0.07)" />',
      '      <stop offset="62%" stop-color="rgba(255,255,255,0)" />',
      '      <stop offset="100%" stop-color="rgba(16,20,26,0.10)" />',
      '    </linearGradient>',
      '    <filter id="no5MechShadow" x="-22%" y="-22%" width="144%" height="144%">',
      '      <feDropShadow dx="1.2" dy="2.1" stdDeviation="2.0" flood-color="#0D1117" flood-opacity="0.48" />',
      '    </filter>',
      '    <filter id="no5BridgeShadow" x="-24%" y="-24%" width="148%" height="148%">',
      '      <feDropShadow dx="1.5" dy="2.7" stdDeviation="2.4" flood-color="#0B0F14" flood-opacity="0.54" />',
      '    </filter>',
      '    <filter id="no5LumeGlow" x="-30%" y="-30%" width="160%" height="160%">',
      '      <feGaussianBlur stdDeviation="2.0" result="blur" />',
      '      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>',
      '    </filter>',
      '    <clipPath id="no5DialClip">',
      '      <circle cx="150" cy="150" r="129.5" />',
      '    </clipPath>',
      '    <clipPath id="no5CrownClip">',
      `      <path d="${CROWN_BODY_PATH}" />`,
      '    </clipPath>',
      '    <!-- 좌상단 & 좌하단 실버 아치 명판 곡선 텍스트 경로 -->',
      '    <path id="no5TopPlaquePath" d="M 42,102 A 118,118 0 0,1 169,34" fill="none" />',
      '    <path id="no5BotPlaquePath" d="M 55,221 A 118.5,118.5 0 0,0 132,267" fill="none" />',
      '  </defs>',
      '',
      '  <!-- 독서실 매너 모드 / 세션 종료 시각 발광 링 -->',
      '  <circle id="no5VisualAlarmRing" class="visual-alarm-ring" cx="150" cy="150" r="144.5" fill="none" stroke-width="4" />',
      '',
      '  <!-- 4시 방향 (+33°) 날카로운 CNC 각진 톱니 기어 용두 (원본 정밀 비례) -->',
      '  <g id="no5CrownControl" class="crown-control" transform="rotate(33 150 150)" filter="url(#no5MechShadow)">',
      '    <rect class="crown-hit" x="280" y="114" width="44" height="72" rx="8" fill="transparent" />',
      '    <!-- 날렵한 스텝 크라운 튜브 칼라 -->',
      '    <polygon points="282,140.5 290,140.5 290,159.5 282,159.5" fill="#646C77" stroke="#393F48" stroke-width="1" />',
      '    <line x1="285.5" y1="141.5" x2="285.5" y2="158.5" stroke="rgba(255,255,255,0.42)" stroke-width="0.9" />',
      '    <!-- 외곽 돌출 톱니 기어 치형 (상·하단 날카로운 톱니 실루엣) -->',
      crownTeeth.serrations,
      '    <!-- 45° 각진 CNC 챔퍼 기어 크라운 본체 -->',
      `    <path class="crown-body" d="${CROWN_BODY_PATH}" fill="url(#no5CrownCyl)" stroke="#383E47" stroke-width="1.35" stroke-linejoin="miter" />`,
      '    <!-- 내부 클립된 날카로운 V-홈 기어 플루트 (스크롤/드래그 시 실시간 회전 연동) -->',
      '    <g clip-path="url(#no5CrownClip)">',
      '      <g id="no5CrownKnurls">',
      crownTeeth.flutes,
      '      </g>',
      '    </g>',
      '    <!-- 각진 45° 외측 면취(Facet) 엔드 캡 경계 -->',
      '    <polygon points="306.8,127.0 310.2,130.4 312.6,133.2 312.6,166.8 310.2,169.6 306.8,173.0" fill="url(#no5SteelCase)" opacity="0.52" pointer-events="none" />',
      '    <line x1="306.8" y1="127.4" x2="306.8" y2="172.6" stroke="#393F48" stroke-width="1.05" />',
      '    <line x1="308.0" y1="128.8" x2="308.0" y2="171.2" stroke="rgba(255,255,255,0.68)" stroke-width="0.85" />',
      '    <line x1="291.6" y1="127.4" x2="291.6" y2="172.6" stroke="rgba(255,255,255,0.42)" stroke-width="0.7" />',
      '  </g>',
      '',
      '  <!-- 316L 날렵한 직선 브러시드 베젤 (넓은 개방감 r=129.5 / 138.5) -->',
      '  <g id="no5DialClickable" class="dial-clickable">',
      '    <circle cx="150" cy="150" r="138.5" fill="url(#no5SteelCase)" stroke="#4C535D" stroke-width="1.4" class="case-bezel" />',
      '    <circle cx="150" cy="150" r="138" fill="url(#no5BrushedV)" opacity="0.76" />',
      '    <circle cx="150" cy="150" r="133.5" fill="none" stroke="rgba(255,255,255,0.62)" stroke-width="0.95" />',
      '    <circle cx="150" cy="150" r="131.2" fill="#5A626C" stroke="#393F47" stroke-width="0.85" class="case-rehaut" />',
      '    <circle cx="150" cy="150" r="129.5" fill="url(#no5Mainplate)" class="dial-base" />',
      '',
      '    <!-- 다이얼 내부 클립 그룹 -->',
      '    <g clip-path="url(#no5DialClip)">',
      '      <!-- 밝은 Raw 실버 스켈레톤 메인플레이트 & 기계식 절삭 포켓 -->',
      '      <circle cx="150" cy="150" r="118" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="0.9" />',
      '      <circle cx="150" cy="150" r="93" fill="none" stroke="rgba(35,40,48,0.28)" stroke-width="1.1" />',
      '      <circle cx="150" cy="150" r="76" fill="#565D67" stroke="#3D434C" stroke-width="1.15" class="skeleton-recess" />',
      '      <circle cx="150" cy="150" r="67" fill="#353A42" opacity="0.68" class="skeleton-deep" />',
      '',
      '      <!-- 1시 방향 절제된 오픈워크 창 & 4Hz 황동 밸런스 휠 (원본 유일 유채색 #1) -->',
      '      <g class="balance-aperture">',
      '        <circle cx="176" cy="86" r="24" fill="#262A31" stroke="#757D87" stroke-width="1.2" />',
      '        <g id="no5BalanceWheel" transform="translate(176, 86)">',
      '          <circle r="19.5" fill="none" stroke="url(#no5BrassGear)" stroke-width="3.6" />',
      '          <circle r="11.5" fill="none" stroke="#9BB4D4" stroke-width="0.7" stroke-dasharray="3.2 1.4" opacity="0.75" />',
      '          <line x1="-18" y1="0" x2="18" y2="0" stroke="url(#no5BrassGear)" stroke-width="1.7" />',
      '          <line x1="0" y1="-18" x2="0" y2="18" stroke="url(#no5BrassGear)" stroke-width="1.7" />',
      '          <circle r="4.4" fill="#D43B32" stroke="#F4D788" stroke-width="1.1" />',
      '          <circle cx="-1" cy="-1" r="1.1" fill="rgba(255,255,255,0.65)" />',
      '        </g>',
      '        <path d="M 150,74 C 164,62 184,61 196,72 L 190,82 C 179,74 166,76 157,84 Z" fill="url(#no5SteelBridge)" stroke="#4C535D" stroke-width="0.95" class="steel-subbridge" />',
      '      </g>',
      '',
      '      <!-- 9~10시 방향 밝은 메탈릭 스켈레톤 기어 트레인 -->',
      '      <g transform="translate(88, 148)">',
      '        <circle r="31.5" fill="#2B3038" stroke="#7A828D" stroke-width="1" class="skeleton-recess" />',
      '        <g id="no5SubGear">',
      `          <path d="${primaryGearPath}" fill="url(#no5SatinSilver)" stroke="#4D545E" stroke-width="0.95" class="gear-metal" />`,
      '          <circle r="21.5" fill="#373D46" stroke="#8F97A2" stroke-width="1" />',
      '          <line x1="-21" y1="0" x2="21" y2="0" stroke="#D7DCE3" stroke-width="2.4" />',
      '          <line x1="0" y1="-21" x2="0" y2="21" stroke="#D7DCE3" stroke-width="2.4" />',
      '          <circle r="7.5" fill="url(#no5SteelBridge)" stroke="#4D545E" stroke-width="0.95" />',
      '          <circle r="2.6" fill="#3D434C" />',
      '        </g>',
      '      </g>',
      '      <g transform="translate(115, 111)" opacity="0.94">',
      '        <g id="no5SubGear2">',
      `          <path d="${secondaryGearPath}" fill="url(#no5SteelBridge)" stroke="#4D545E" stroke-width="0.85" class="gear-metal" />`,
      '          <circle r="11" fill="#414750" stroke="#9CA4AF" stroke-width="0.85" />',
      '          <circle r="4" fill="#E0E4EA" stroke="#4D545E" stroke-width="0.7" />',
      '        </g>',
      '      </g>',
      '',
      '      <!-- 5시 30분 방사형 선버스트 독립 스몰 세컨드 디스크 + 중앙 6시 붉은 포인터 & 1.5mm 볼베어링 -->',
      '      <g transform="translate(175, 223)">',
      '        <circle r="44" fill="#3E444D" stroke="#626A75" stroke-width="1.2" class="subdial-well" />',
      '        <g id="no5SecondsDisc">',
      '          <circle r="41.8" fill="url(#no5SubdialSilver)" stroke="#7F8792" stroke-width="0.95" class="sat-disc-face" />',
      '          <g class="sunburst-sheen" opacity="0.18">',
      '            <path d="M0,0 L-16,-39 L16,-39 Z" fill="#FFFFFF" />',
      '            <path d="M0,0 L-16,39 L16,39 Z" fill="#FFFFFF" />',
      '            <path d="M0,0 L39,-14 L39,14 Z" fill="#252B33" />',
      '            <path d="M0,0 L-39,-14 L-39,14 Z" fill="#252B33" />',
      '          </g>',
      '          <circle r="33.8" fill="none" stroke="rgba(26,29,34,0.24)" stroke-width="0.7" />',
      '          <g id="no5SecTicks"></g>',
      '        </g>',
      '        <circle r="17.2" fill="url(#no5SteelBridge)" stroke="#4C535D" stroke-width="1.15" class="subdial-cap" />',
      '        <circle r="15.4" fill="none" stroke="rgba(255,255,255,0.60)" stroke-width="0.75" />',
      '        <polygon points="0,14.8 -3.5,8.0 3.5,8.0" class="sec-pointer" fill="#C9332B" stroke="#7E1B16" stroke-width="0.45" />',
      '        <circle r="5.0" fill="#3D434C" stroke="#C5CCD4" stroke-width="0.9" />',
      '        <circle r="2.6" fill="#F0F3F7" stroke="#4A5059" stroke-width="0.55" />',
      '      </g>',
      '',
      '      <!-- 8시 방향 날렵한 커스텀 실린더 롤러 베어링 -->',
      '      <g id="no5RollerBearing" transform="translate(73, 192)" filter="url(#no5MechShadow)">',
      '        <circle r="10.6" fill="url(#no5SteelCase)" stroke="#414750" stroke-width="1.25" class="roller-ring" />',
      '        <g id="no5RollerBalls">',
      '          <circle r="7.2" fill="#353A42" stroke="#CBD2DA" stroke-width="1.35" stroke-dasharray="2.1 1.6" />',
      '        </g>',
      '        <circle r="3.9" fill="#EEF1F5" stroke="#495059" stroke-width="0.8" />',
      '        <circle r="1.4" fill="#5A616B" />',
      '      </g>',
      '',
      '      <!-- 3개 날카로운 45° 면취 4갈래 십자 스켈레톤 위성 패들 + CNC Y자 3-Arm 캐러셀 브릿지 -->',
      '      <g id="no5SatelliteAssembly" filter="url(#no5MechShadow)">',
      '        <g id="no5SatDisc0"></g>',
      '        <g id="no5SatDisc1"></g>',
      '        <g id="no5SatDisc2"></g>',
      '',
      '        <g id="no5CarouselBridge" filter="url(#no5BridgeShadow)">',
      '          <g transform="rotate(0 150 150)">',
      '            <path d="M 134.5,148 L 138.8,95 A 11.2,11.2 0 1,1 161.2,95 L 165.5,148 Z" fill="url(#no5SteelBridge)" stroke="#40464F" stroke-width="1.3" class="bridge-arm" />',
      '            <path d="M 136.6,145 L 140.5,95.5 A 9.5,9.5 0 1,1 159.5,95.5 L 163.4,145" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="0.95" class="bridge-chamfer" />',
      '            <rect x="146.2" y="108.5" width="7.6" height="20.5" rx="3.8" fill="url(#no5SlotRecess)" stroke="#40464F" stroke-width="0.85" class="bridge-slot" />',
      '            <circle cx="150" cy="95" r="5.8" fill="url(#no5SatinSilver)" stroke="#434952" stroke-width="1" />',
      '            <line x1="145.6" y1="93.8" x2="154.4" y2="96.2" stroke="#3D434B" stroke-width="1.2" />',
      '            <circle cx="150" cy="134.8" r="2.9" fill="#E3E7EC" stroke="#434952" stroke-width="0.8" />',
      '            <line x1="147.8" y1="135.4" x2="152.2" y2="134.2" stroke="#3D434B" stroke-width="0.85" />',
      '          </g>',
      '          <g transform="rotate(120 150 150)">',
      '            <path d="M 134.5,148 L 138.8,95 A 11.2,11.2 0 1,1 161.2,95 L 165.5,148 Z" fill="url(#no5SteelBridge)" stroke="#40464F" stroke-width="1.3" class="bridge-arm" />',
      '            <path d="M 136.6,145 L 140.5,95.5 A 9.5,9.5 0 1,1 159.5,95.5 L 163.4,145" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="0.95" class="bridge-chamfer" />',
      '            <rect x="146.2" y="108.5" width="7.6" height="20.5" rx="3.8" fill="url(#no5SlotRecess)" stroke="#40464F" stroke-width="0.85" class="bridge-slot" />',
      '            <circle cx="150" cy="95" r="5.8" fill="url(#no5SatinSilver)" stroke="#434952" stroke-width="1" />',
      '            <line x1="145.6" y1="93.8" x2="154.4" y2="96.2" stroke="#3D434B" stroke-width="1.2" />',
      '            <circle cx="150" cy="134.8" r="2.9" fill="#E3E7EC" stroke="#434952" stroke-width="0.8" />',
      '            <line x1="147.8" y1="135.4" x2="152.2" y2="134.2" stroke="#3D434B" stroke-width="0.85" />',
      '          </g>',
      '          <g transform="rotate(240 150 150)">',
      '            <path d="M 134.5,148 L 138.8,95 A 11.2,11.2 0 1,1 161.2,95 L 165.5,148 Z" fill="url(#no5SteelBridge)" stroke="#40464F" stroke-width="1.3" class="bridge-arm" />',
      '            <path d="M 136.6,145 L 140.5,95.5 A 9.5,9.5 0 1,1 159.5,95.5 L 163.4,145" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="0.95" class="bridge-chamfer" />',
      '            <rect x="146.2" y="108.5" width="7.6" height="20.5" rx="3.8" fill="url(#no5SlotRecess)" stroke="#40464F" stroke-width="0.85" class="bridge-slot" />',
      '            <circle cx="150" cy="95" r="5.8" fill="url(#no5SatinSilver)" stroke="#434952" stroke-width="1" />',
      '            <line x1="145.6" y1="93.8" x2="154.4" y2="96.2" stroke="#3D434B" stroke-width="1.2" />',
      '            <circle cx="150" cy="134.8" r="2.9" fill="#E3E7EC" stroke="#434952" stroke-width="0.8" />',
      '            <line x1="147.8" y1="135.4" x2="152.2" y2="134.2" stroke="#3D434B" stroke-width="0.85" />',
      '          </g>',
      '          <circle cx="150" cy="150" r="17.2" fill="url(#no5SteelBridge)" stroke="#40464F" stroke-width="1.25" class="bridge-hub" />',
      '          <circle cx="150" cy="150" r="15.0" fill="none" stroke="rgba(255,255,255,0.66)" stroke-width="0.85" />',
      '          <circle cx="150" cy="150" r="10.4" fill="#373C44" stroke="#525963" stroke-width="0.9" />',
      '          <circle cx="150" cy="150" r="7.5" fill="url(#no5BrassGear)" stroke="#6D4D16" stroke-width="0.95" />',
      '          <circle cx="150" cy="150" r="3.2" fill="#1F2329" stroke="#9AA2AC" stroke-width="0.6" />',
      '        </g>',
      '      </g>',
      '',
      '      <!-- 우측 고정 120° 실버 분 트랙 플레이트 -->',
      '      <g id="no5MinutePlate">',
      '        <path class="minute-plate-face" d="M 191.0,66.0 A 93.5,93.5 0 0,1 191.0,234.0 L 206.8,266.2 A 129.2,129.2 0 0,0 206.8,33.8 Z" fill="url(#no5SatinSilver)" stroke="#484F58" stroke-width="1.3" />',
      '        <path d="M 191.0,66.0 A 93.5,93.5 0 0,1 191.0,234.0 L 206.8,266.2 A 129.2,129.2 0 0,0 206.8,33.8 Z" fill="url(#no5BrushedV)" opacity="0.34" pointer-events="none" />',
      '        <path class="minute-rail" d="M 202.2,59.5 A 104.5,104.5 0 0,1 202.2,240.5" fill="none" stroke="#363C44" stroke-width="0.72" />',
      '        <path class="minute-rail" d="M 212.1,42.4 A 124.2,124.2 0 0,1 212.1,257.6" fill="none" stroke="#363C44" stroke-width="0.72" />',
      '        <path id="no5TargetArc" class="study-target-arc" d="" fill="none" stroke-width="3.6" stroke-linecap="round" />',
      '        <path id="no5ElapsedArc" class="study-elapsed-arc" d="" fill="none" stroke-width="3.6" stroke-linecap="round" />',
      '        <circle id="no5TargetDot" class="study-target-dot" cx="0" cy="0" r="2.5" opacity="0" />',
      '        <g id="no5MinuteTicks"></g>',
      '        <circle cx="199" cy="48.5" r="2.2" fill="#DCE1E7" stroke="#444A53" stroke-width="0.65" />',
      '        <line x1="197.4" y1="48.5" x2="200.6" y2="48.5" stroke="#444A53" stroke-width="0.65" />',
      '        <circle cx="199" cy="251.5" r="2.2" fill="#DCE1E7" stroke="#444A53" stroke-width="0.65" />',
      '        <line x1="197.4" y1="251.5" x2="200.6" y2="251.5" stroke="#444A53" stroke-width="0.65" />',
      '      </g>',
      '',
      '      <!-- 좌상단 & 좌하단 대칭 실버 아치 오마주 명판 -->',
      '      <g class="homage-plaques">',
      '        <path class="plaque-arch" d="M 52,105 A 108,108 0 0,1 171,44 L 175,23.5 A 128.5,128.5 0 0,0 34,95 Z" fill="url(#no5SatinSilver)" stroke="#4F5660" stroke-width="1.05" />',
      '        <circle cx="48" cy="95" r="2.0" fill="#B5BDC7" stroke="#434952" stroke-width="0.6" />',
      '        <circle cx="168" cy="34" r="2.0" fill="#B5BDC7" stroke="#434952" stroke-width="0.6" />',
      '        <text class="plaque-title" font-size="8.0" font-weight="900" fill="#171A1F" letter-spacing="1.0">',
      '          <textPath href="#no5TopPlaquePath" startOffset="50%" text-anchor="middle">NO.5 CHRONO · STUDY</textPath>',
      '        </text>',
      '        <path class="plaque-arch" d="M 65,216 A 108,108 0 0,0 135,257 L 133,277.5 A 128.5,128.5 0 0,1 48,227 Z" fill="url(#no5SatinSilver)" stroke="#4F5660" stroke-width="1.05" />',
      '        <text class="plaque-sub" font-size="6.4" font-weight="900" fill="#171A1F" letter-spacing="0.85">',
      '          <textPath href="#no5BotPlaquePath" startOffset="50%" text-anchor="middle">NO.5 KAI HOMAGE</textPath>',
      '        </text>',
      '      </g>',
      '',
      '      <!-- 4.6mm 박스 사파이어 글래스 대각선 반사 & 최외곽 굴절 림 -->',
      '      <circle cx="150" cy="150" r="129.5" fill="url(#no5GlassShine)" pointer-events="none" />',
      '      <circle cx="150" cy="150" r="127.6" fill="none" stroke="rgba(255,255,255,0.46)" stroke-width="2.1" pointer-events="none" />',
      '      <circle cx="150" cy="150" r="125.2" fill="none" stroke="rgba(18,22,28,0.20)" stroke-width="1.1" pointer-events="none" />',
      '    </g>',
      '    <circle cx="150" cy="150" r="129.5" fill="none" stroke="rgba(255,255,255,0.36)" stroke-width="1.2" pointer-events="none" />',
      '  </g>',
      '</svg>',
      '<!-- 모바일/터치 스크롤 충돌 완전 차단용 전용 HTML 용두 터치 핸들 (iOS Safari/Android Chrome 대응) -->',
      '<div id="no5CrownTouchOverlay" class="crown-touch-overlay" tabindex="0" role="slider" aria-label="4시 용두 — 위아래로 드래그하거나 스크롤하여 타이머 시간 조절"></div>'
    ].join('\n');
  }

  function mount(containerEl, handlers) {
    if (!containerEl) return null;
    const cb = handlers || {};
    containerEl.innerHTML = buildSvgMarkup();

    const svgRoot = containerEl.querySelector('svg');
    const crownOverlayEl = containerEl.querySelector('#no5CrownTouchOverlay');
    const minTicksG = svgRoot.querySelector('#no5MinuteTicks');
    const secTicksG = svgRoot.querySelector('#no5SecTicks');
    const bridgeEl = svgRoot.querySelector('#no5CarouselBridge');
    const secDiscEl = svgRoot.querySelector('#no5SecondsDisc');
    const balEl = svgRoot.querySelector('#no5BalanceWheel');
    const subGearEl = svgRoot.querySelector('#no5SubGear');
    const subGear2El = svgRoot.querySelector('#no5SubGear2');
    const rollerBallsEl = svgRoot.querySelector('#no5RollerBalls');
    const targetArcEl = svgRoot.querySelector('#no5TargetArc');
    const elapsedArcEl = svgRoot.querySelector('#no5ElapsedArc');
    const targetDotEl = svgRoot.querySelector('#no5TargetDot');
    const visualRingEl = svgRoot.querySelector('#no5VisualAlarmRing');
    const crownEl = svgRoot.querySelector('#no5CrownControl');
    const crownKnurlsEl = svgRoot.querySelector('#no5CrownKnurls');
    const dialClickableEl = svgRoot.querySelector('#no5DialClickable');

    // 1. Right 120° minute track ticks (-60°=00m .. +60°=60m, 2°/min) — 100% black & upright 5..60 numerals
    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const isQuarter = m % 15 === 0;
      const rIn = isMajor ? 96.4 : 98.8;
      const rOut = isMajor ? 104.2 : 103.0;
      minTicksG.appendChild(svgEl('line', {
        x1: (150 + rIn * Math.cos(rad)).toFixed(2),
        y1: (150 + rIn * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut * Math.cos(rad)).toFixed(2),
        y2: (150 + rOut * Math.sin(rad)).toFixed(2),
        class: isQuarter ? 'min-tick-quarter' : (isMajor ? 'min-tick-major' : 'min-tick-minor'),
        stroke: '#171A1F',
        'stroke-width': isQuarter ? 2.0 : (isMajor ? 1.55 : 0.8),
        'stroke-linecap': 'butt'
      }));
      if (isMajor && m > 0) {
        const rTxt = 114.6;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const t = svgEl('text', {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': isQuarter ? '9.8' : '8.8',
          'font-weight': '900',
          'letter-spacing': '-0.3',
          class: isQuarter ? 'min-label-quarter' : 'min-label',
          fill: '#15181D'
        });
        t.textContent = String(m);
        minTicksG.appendChild(t);
      }
    }

    // 2. 5:30 small-seconds disc ticks (00..59) & 05..60 black numerals
    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 34.4 : 36.8;
      const r2 = 40.5;
      secTicksG.appendChild(svgEl('line', {
        x1: (r1 * Math.cos(rad)).toFixed(2),
        y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2),
        y2: (r2 * Math.sin(rad)).toFixed(2),
        class: s === 0 ? 'sec-tick-zero' : 'sec-tick',
        stroke: '#181B20',
        'stroke-width': major ? 1.45 : 0.65
      }));
      if (s % 10 === 0) {
        const rt = 27.2;
        const x = rt * Math.cos(rad);
        const y = rt * Math.sin(rad);
        const txt = svgEl('text', {
          x: x.toFixed(1),
          y: y.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '7.2',
          'font-weight': '900',
          class: s === 0 ? 'sec-label-zero' : 'sec-label',
          fill: '#16191E',
          transform: `rotate(${s * 6} ${x.toFixed(1)} ${y.toFixed(1)})`
        });
        txt.textContent = s === 0 ? '60' : String(s).padStart(2, '0');
        secTicksG.appendChild(txt);
      }
    }

    // 3. Build 3 Razor-Sharp 45°-Chamfered 4-Blade CNC Cross Satellite Hour Wheels
    const satGroups = [0, 1, 2].map(function (k) {
      const outer = svgRoot.querySelector(`#no5SatDisc${k}`);
      const plate = svgEl('g');

      plate.appendChild(svgEl('path', {
        d: CROSS_PADDLE_PATH,
        fill: 'url(#no5SatinSilver)',
        stroke: '#414750',
        'stroke-width': 1.25,
        'stroke-linejoin': 'miter',
        class: 'sat-disc-face'
      }));
      plate.appendChild(svgEl('path', {
        d: CROSS_PADDLE_PATH,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.72)',
        'stroke-width': 0.85,
        'stroke-linejoin': 'miter',
        transform: 'scale(0.935)',
        class: 'sat-chamfer'
      }));
      plate.appendChild(svgEl('circle', {
        cx: 0, cy: 0, r: 10.5,
        fill: 'none',
        stroke: 'rgba(35,40,48,0.24)',
        'stroke-width': 0.8
      }));

      DISC_NUMS[k].forEach(function (num, j) {
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 23.0;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);

        plate.appendChild(svgEl('polygon', {
          points: '33.4,-2.1 38.2,0 33.4,2.1',
          class: 'sat-pointer',
          fill: '#171A1F',
          transform: `rotate(${deg})`
        }));

        const t = svgEl('text', {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': num >= 10 ? '13.2' : '14.4',
          'font-weight': '900',
          'letter-spacing': '-0.5',
          class: 'sat-numeral',
          fill: '#121519',
          transform: `rotate(${deg} ${tx.toFixed(1)} ${ty.toFixed(1)})`
        });
        t.textContent = String(num);
        plate.appendChild(t);
      });

      outer.appendChild(plate);
      return { outer: outer, inner: plate };
    });

    // 4. Interactive 4 o'clock crown — Mobile Scroll-Locked Touch + Mouse Drag + Wheel + Keys
    // Bound to BOTH the dedicated HTML overlay (guarantees iOS Safari / Android Chrome never scroll)
    // and the underlying SVG #no5CrownControl (for direct SVG hit/accessibility parity).
    let crownVisualShift = 0;
    let pointerDragging = false;
    let touchDragging = false;
    let lastClientX = 0;
    let lastClientY = 0;
    let dragAccum = 0;
    let turnTimerId = null;

    // Crown sits at +33° (4 o'clock): dragging straight up (-dy) or along crown tangent (-dx*sin33 - dy*cos33) turns smoothly
    const COS33 = Math.cos((33 * Math.PI) / 180);
    const SIN33 = Math.sin((33 * Math.PI) / 180);

    function animateCrown(delta) {
      crownVisualShift = ((crownVisualShift + delta) % 4 + 4) % 4;
      crownKnurlsEl.setAttribute('transform', `translate(0, ${((crownVisualShift - 1.5) * 0.9).toFixed(2)})`);
      crownEl.classList.add('is-turning');
      if (turnTimerId) clearTimeout(turnTimerId);
      turnTimerId = setTimeout(function () {
        crownEl.classList.remove('is-turning');
      }, 150);
    }

    function emitCrownStep(delta) {
      animateCrown(delta > 0 ? 1 : -1);
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(6); } catch (err) {}
      }
      if (typeof cb.onCrownStep === 'function') {
        cb.onCrownStep(delta);
      }
    }

    function applyCrownDelta(dx, dy, shiftKey, thresholdPx) {
      // Combine vertical drag and crown-aligned tangent drag so thumb swipes feel natural at any angle
      const proj = (-dy * COS33) + (-dx * SIN33 * 0.65);
      dragAccum += proj;
      while (Math.abs(dragAccum) >= thresholdPx) {
        const dir = dragAccum > 0 ? 1 : -1;
        dragAccum -= dir * thresholdPx;
        emitCrownStep(dir * (shiftKey ? 5 : 1));
      }
    }

    function bindCrownTarget(targetEl) {
      if (!targetEl) return;

      // Hover visual sync for HTML overlay -> SVG crown stroke highlight
      targetEl.addEventListener('mouseenter', function () {
        crownEl.classList.add('is-hover');
      });
      targetEl.addEventListener('mouseleave', function () {
        crownEl.classList.remove('is-hover');
      });

      // Mouse wheel
      targetEl.addEventListener('wheel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const step = e.shiftKey ? 5 : 1;
        const dir = e.deltaY < 0 ? 1 : -1;
        emitCrownStep(dir * step);
      }, { passive: false });

      // Dedicated non-passive Touch events: unconditionally prevents mobile page scrolling!
      targetEl.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length === 0) return;
        e.preventDefault();
        e.stopPropagation();
        touchDragging = true;
        lastClientX = e.touches[0].clientX;
        lastClientY = e.touches[0].clientY;
        dragAccum = 0;
        crownEl.classList.add('is-dragging');
        if (crownOverlayEl) crownOverlayEl.classList.add('is-dragging');
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
        touchDragging = false;
        crownEl.classList.remove('is-dragging');
        if (crownOverlayEl) crownOverlayEl.classList.remove('is-dragging');
      }
      targetEl.addEventListener('touchend', endTouch, { passive: false });
      targetEl.addEventListener('touchcancel', endTouch, { passive: false });

      // Pointer events for Mouse & Pen only (touch handled above to avoid double-triggering)
      targetEl.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        e.preventDefault();
        e.stopPropagation();
        pointerDragging = true;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        dragAccum = 0;
        crownEl.classList.add('is-dragging');
        if (crownOverlayEl) crownOverlayEl.classList.add('is-dragging');
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
        pointerDragging = false;
        crownEl.classList.remove('is-dragging');
        if (crownOverlayEl) crownOverlayEl.classList.remove('is-dragging');
        if (e && targetEl.releasePointerCapture) {
          try { targetEl.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      }
      targetEl.addEventListener('pointerup', endPointer);
      targetEl.addEventListener('pointercancel', endPointer);

      targetEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          emitCrownStep(e.shiftKey ? 5 : 1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          emitCrownStep(e.shiftKey ? -5 : -1);
        }
      });
    }

    bindCrownTarget(crownOverlayEl);
    bindCrownTarget(crownEl);

    dialClickableEl.addEventListener('click', function () {
      if (typeof cb.onDialClick === 'function') {
        cb.onDialClick();
      }
    });

    let rollerSpinDeg = 0;
    let alarmTimerId = null;

    function triggerVisualAlarm() {
      visualRingEl.classList.remove('is-pulsing');
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

      // 2. 3 Satellite 4-Blade Cross Wheels + 8 o'clock indexing roller rotation
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

      // 3. 5:30 Small-Seconds Disc — aligned to central 6 o'clock red triangle pointer (180° offset)
      const secRot = 180 + angles.secondsDiscDeg;
      secDiscEl.setAttribute('transform', `rotate(${secRot.toFixed(2)})`);

      // 4. 1 o'clock 4Hz Brass Balance Wheel & 9~10 o'clock meshed silver gears
      const balAngle = snapshot.running ? Math.sin((nowPerf || 0) * 0.025) * 14 : 0;
      balEl.setAttribute('transform', `translate(176, 86) rotate(${balAngle.toFixed(1)})`);
      const gearAngle = (snapshot.tHours * 60) % 360;
      subGearEl.setAttribute('transform', `rotate(${gearAngle.toFixed(2)})`);
      subGear2El.setAttribute('transform', `rotate(${(-gearAngle * 1.375).toFixed(2)})`);

      // 5. Right 120° Study Target & Elapsed Arcs
      const targetMin = snapshot.targetArcMinutes || 0;
      const elapsedMin = snapshot.elapsedArcMinutes || 0;
      const isBreak = snapshot.phase === 'break';

      svgRoot.classList.toggle('is-break-phase', isBreak);
      svgRoot.classList.toggle('is-warning-phase', Boolean(snapshot.isWarning));
      svgRoot.classList.toggle('is-running', Boolean(snapshot.running));

      if (targetMin > 0) {
        targetArcEl.setAttribute('d', describeMinuteArc(ARC_R, 0, targetMin));
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
