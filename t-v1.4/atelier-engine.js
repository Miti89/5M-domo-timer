/**
 * CASPER™ — A–J Mathematical Horology Atelier Engine (atelier-engine.js)
 * Pure state/progression rules, legacy state migration, & 6-layer CAD Blueprint renderer
 * for multi-stage caliber assembly: E · ELLIPSE (starter) -> B · BINARY -> C · CYCLOID -> G · GEOMETRY.
 * Zero-Build, file:// safe, deterministic & unit-testable.
 */
(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // 출시 시 false로 변경 (개발·검수 기간 기본 개발자 모드 ON)
  const DEFAULT_DEV_MODE = true;

  const LEGACY_CALIBER_MAP = {
    'no1-pro': 'cal-e',
    'no2-jump': 'cal-b'
  };

  const BUILD_ORDER = ['cal-b', 'cal-c', 'cal-g'];
  const PLAYABLE_IDS = ['cal-e', 'cal-b', 'cal-c', 'cal-g'];

  // Stage 1: B · BINARY (0 -> 720m / 12h)
  const CAL_B_PARTS = [
    {
      id: 'mainplate',
      code: '01',
      name: '옵시디언 기판',
      en: 'Obsidian Baseplate',
      cumMinutes: 90,
      stepMinutes: 90,
      desc: '0과 1의 대비를 이루는 매트 블랙 무브먼트 기판'
    },
    {
      id: 'barrel',
      code: '02',
      name: '배럴 & 태엽',
      en: 'Mainspring Barrel',
      cumMinutes: 180,
      stepMinutes: 90,
      desc: '42시간 파워리저브 합금 메인스프링'
    },
    {
      id: 'geartrain',
      code: '03',
      name: '기어 트레인',
      en: 'Gear Train',
      cumMinutes: 300,
      stepMinutes: 120,
      desc: '고정밀 황동·스틸 4단 치차열'
    },
    {
      id: 'escapement',
      code: '04',
      name: '밸런스 & 탈진기',
      en: '4Hz Escapement',
      cumMinutes: 420,
      stepMinutes: 120,
      desc: '28,800 vph 기계식 심장부 어셈블리'
    },
    {
      id: 'jumpcam',
      code: '05',
      name: '점핑 캠 & 6-Bit LED',
      en: 'Jump Cam & Binary LED',
      cumMinutes: 570,
      stepMinutes: 150,
      desc: '정각 순간 도약 스타 휠 · 6비트 이진 초 표시 모듈'
    },
    {
      id: 'turretcase',
      code: '06',
      name: '3창 터렛 케이스',
      en: '3-Porthole Case',
      cumMinutes: 720,
      stepMinutes: 150,
      desc: '사파이어 렌즈 3창 브러시드 스틸 최종 마감'
    }
  ];

  // Stage 2: C · CYCLOID (720 -> 1440m / 24h)
  const CAL_C_PARTS = [
    {
      id: 'cyc_plate',
      code: '01',
      name: '사이클로이드 브릿지',
      en: 'Cycloid Bridge',
      cumMinutes: 840,
      stepMinutes: 120,
      desc: '호이겐스 등시성 곡선이 각인된 하단 스틸 브릿지'
    },
    {
      id: 'cyc_snail',
      code: '02',
      name: '스네일 캠 모듈',
      en: 'Snail Cam Module',
      cumMinutes: 960,
      stepMinutes: 120,
      desc: '220° 레트로그레이드 귀환 각도를 제어하는 달팽이 캠'
    },
    {
      id: 'cyc_rack',
      code: '03',
      name: '더블 랙 & 피니언',
      en: 'Dual Rack & Pinion',
      cumMinutes: 1080,
      stepMinutes: 120,
      desc: '시·분 동축 부채꼴 기어 연동 치차 모듈'
    },
    {
      id: 'cyc_spring',
      code: '04',
      name: '플라이백 리셋 스프링',
      en: 'Flyback Return Spring',
      cumMinutes: 1200,
      stepMinutes: 120,
      desc: '60분 도달 시 0으로 즉시 복귀시키는 탄성 판스프링'
    },
    {
      id: 'cyc_fan',
      code: '05',
      name: '220° 팬 계기판',
      en: '220° Fan Scale Dial',
      cumMinutes: 1320,
      stepMinutes: 120,
      desc: '외곽 220° 분 게이지 · 내곽 200° 시 게이지 스케일'
    },
    {
      id: 'cyc_case',
      code: '06',
      name: '동축 바늘 & 케이스',
      en: 'Coaxial Hands & Case',
      cumMinutes: 1440,
      stepMinutes: 120,
      desc: '테라코타 팁 분침·스몰 세컨즈·316L 케이스 최종 마감'
    }
  ];

  // Stage 3: G · GEOMETRY (1440 -> 2160m / 36h)
  const CAL_G_PARTS = [
    {
      id: 'geo_plate',
      code: '01',
      name: '울트라 슬림 기판',
      en: 'Ultra-Slim 3/4 Plate',
      cumMinutes: 1560,
      stepMinutes: 120,
      desc: '글라슈테 3/4 플레이트 구조 초박형 무브먼트 기판'
    },
    {
      id: 'geo_barrel',
      code: '02',
      name: '수동 와인딩 배럴',
      en: 'Manual Wind Barrel',
      cumMinutes: 1680,
      stepMinutes: 120,
      desc: '부드러운 손감기 저항감을 갖춘 선버스트 라쳇 휠'
    },
    {
      id: 'geo_dial',
      code: '03',
      name: '실버 도금 다이얼',
      en: 'Galvanized Silver Dial',
      cumMinutes: 1800,
      stepMinutes: 120,
      desc: '바우하우스 교차 타이포(12·2·4·8·10)와 헤어라인 인덱스'
    },
    {
      id: 'geo_subdial',
      code: '04',
      name: '6시 기요셰 초침판',
      en: 'Sunken Guilloché Sec',
      cumMinutes: 1920,
      stepMinutes: 120,
      desc: '동심원 선반 가공이 들어간 단차 6시 스몰 세컨즈'
    },
    {
      id: 'geo_hands',
      code: '05',
      name: '열처리 블루드 핸즈',
      en: 'Tempered Blued Hands',
      cumMinutes: 2040,
      stepMinutes: 120,
      desc: '290°C 열처리로 구워낸 슬림 바톤 블루 스틸 시·분침'
    },
    {
      id: 'geo_case',
      code: '06',
      name: '직각 러그 케이스',
      en: 'Tangente Straight Lugs',
      cumMinutes: 2160,
      stepMinutes: 120,
      desc: '초슬림 원통 베젤 · 각진 탕겐테 러그 · 3시 용두 최종 마감'
    }
  ];

  const PARTS_BY_CALIBER = {
    'cal-b': CAL_B_PARTS,
    'cal-c': CAL_C_PARTS,
    'cal-g': CAL_G_PARTS
  };

  // Complete CASPER™ NO.1–NO.10 Mathematical Horology Registry (A=NO.1 .. J=NO.10)
  const CALIBERS = [
    {
      id: 'cal-a',
      num: '01',
      letter: 'A',
      name: 'NO.1 ALGEBRA',
      korean: '대수학',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '미지수를 풀어내는 명쾌한 구조와 질서',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    },
    {
      id: 'cal-b',
      num: '02',
      letter: 'B',
      name: 'NO.2 BINARY',
      korean: '이진법',
      engine: 'CASPER™ · V1',
      subtitle: '0과 1의 명확한 대비 · 점핑 아워 & 6-Bit LED',
      startMinutes: 0,
      totalMinutes: 720,
      playable: true,
      parts: CAL_B_PARTS
    },
    {
      id: 'cal-c',
      num: '03',
      letter: 'C',
      name: 'NO.3 CYCLOID',
      korean: '사이클로이드',
      engine: 'CASPER™ · V1',
      subtitle: '호이겐스 등시성 곡선 · 220° 더블 레트로그레이드',
      startMinutes: 720,
      totalMinutes: 1440,
      playable: true,
      parts: CAL_C_PARTS
    },
    {
      id: 'cal-d',
      num: '04',
      letter: 'D',
      name: 'NO.4 DELTA',
      korean: '변화량(Δ)',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '찰나의 시간 차이를 측정하는 크로노그래프·정밀 감각',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    },
    {
      id: 'cal-e',
      num: '05',
      letter: 'E',
      name: 'NO.5 ELLIPSE',
      korean: '타원',
      engine: 'CASPER™ · V1',
      subtitle: '행성의 공전 궤도 · 새틀라이트 아워 (기본 지급)',
      startMinutes: 0,
      totalMinutes: 0,
      playable: true,
      starter: true,
      parts: []
    },
    {
      id: 'cal-f',
      num: '06',
      letter: 'F',
      name: 'NO.6 FRACTAL',
      korean: '프랙탈',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '톱니바퀴와 기어처럼 정교하게 맞물리는 반복 구조',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    },
    {
      id: 'cal-g',
      num: '07',
      letter: 'G',
      name: 'NO.7 GEOMETRY',
      korean: '기하학',
      engine: 'CASPER™ · V1',
      subtitle: '케이스·러그·인덱스의 완벽한 비례 · 바우하우스 탕겐테',
      startMinutes: 1440,
      totalMinutes: 2160,
      playable: true,
      parts: CAL_G_PARTS
    },
    {
      id: 'cal-h',
      num: '08',
      letter: 'H',
      name: 'NO.8 HARMONIC',
      korean: '조화진동',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '무브먼트가 일정한 리듬으로 진동하는 안정감',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    },
    {
      id: 'cal-i',
      num: '09',
      letter: 'I',
      name: 'NO.9 INTEGRAL',
      korean: '적분',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '수많은 찰나가 모여 하나의 시간을 완성하는 개념',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    },
    {
      id: 'cal-j',
      num: '10',
      letter: 'J',
      name: 'NO.10 JOULE',
      korean: '에너지 단위',
      engine: 'CASPER™ · CONCEPT',
      subtitle: '태엽이 감기고 풀리며 동력을 전달하는 에너지',
      startMinutes: 0,
      totalMinutes: 0,
      playable: false,
      parts: []
    }
  ];

  const FINISHES = [
    {
      id: 'steel',
      name: '브러시드 스틸',
      en: 'Standard 316L',
      conditionLabel: '기본 마감',
      checkUnlocked: function () { return true; }
    },
    {
      id: 'blued',
      name: '블루드 스틸',
      en: 'Heat-Blued Accent',
      conditionLabel: '50분+ 딥워크 1회 달성',
      checkUnlocked: function (metrics) { return metrics.maxSessionMinutes >= 50; }
    },
    {
      id: 'gold',
      name: '사틴 골드',
      en: '24K Champagne Bridge',
      conditionLabel: '3일 연속 공부 스트릭',
      checkUnlocked: function (metrics) { return metrics.bestStreakDays >= 3; }
    },
    {
      id: 'lume',
      name: '야광 루미노바',
      en: 'Super-LumiNova Night',
      conditionLabel: '누적 순공 5시간(300분)',
      checkUnlocked: function (metrics) { return metrics.totalMinutes >= 300; }
    }
  ];

  function getCaliberDef(calId) {
    for (let i = 0; i < CALIBERS.length; i++) {
      if (CALIBERS[i].id === calId) return CALIBERS[i];
    }
    return null;
  }

  function createDefaultAtelierState() {
    return {
      activeWatch: 'cal-e',
      activeFinish: 'steel',
      devMode: DEFAULT_DEV_MODE,
      assembledParts: {
        'cal-b': [],
        'cal-c': [],
        'cal-g': []
      }
    };
  }

  function sanitizeSequentialParts(rawList, defParts) {
    const arr = Array.isArray(rawList) ? rawList : [];
    const out = [];
    for (let i = 0; i < defParts.length; i++) {
      if (arr.includes(defParts[i].id)) {
        out.push(defParts[i].id);
      } else {
        break; // Enforce strict sequential assembly
      }
    }
    return out;
  }

  function sanitizeAtelierState(raw) {
    const def = createDefaultAtelierState();
    if (!raw || typeof raw !== 'object') return def;

    const rawParts = (raw.assembledParts && typeof raw.assembledParts === 'object') ? raw.assembledParts : {};
    // Seamless migration from legacy 'no2-jump' -> 'cal-b'
    const rawCalB = Array.isArray(rawParts['cal-b']) ? rawParts['cal-b'] : rawParts['no2-jump'];
    const assembledParts = {
      'cal-b': sanitizeSequentialParts(rawCalB, CAL_B_PARTS),
      'cal-c': sanitizeSequentialParts(rawParts['cal-c'], CAL_C_PARTS),
      'cal-g': sanitizeSequentialParts(rawParts['cal-g'], CAL_G_PARTS)
    };

    const devMode = typeof raw.devMode === 'boolean' ? raw.devMode : DEFAULT_DEV_MODE;
    const mappedWatch = LEGACY_CALIBER_MAP[raw.activeWatch] || raw.activeWatch;
    let activeWatch = 'cal-e';
    if (PLAYABLE_IDS.includes(mappedWatch)) {
      if (mappedWatch === 'cal-e' || devMode) {
        activeWatch = mappedWatch;
      } else {
        const reqParts = PARTS_BY_CALIBER[mappedWatch] || [];
        if (reqParts.length > 0 && assembledParts[mappedWatch].length === reqParts.length) {
          activeWatch = mappedWatch;
        }
      }
    }

    const validFinishes = FINISHES.map(function (f) { return f.id; });
    const activeFinish = validFinishes.includes(raw.activeFinish) ? raw.activeFinish : 'steel';

    return {
      activeWatch: activeWatch,
      activeFinish: activeFinish,
      devMode: devMode,
      assembledParts: assembledParts
    };
  }

  function parseDateKeyToDayNumber(dateKey) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
    if (!m) return null;
    const utcMs = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Math.floor(utcMs / 86400000);
  }

  function computeStudyMetrics(logs) {
    const arr = Array.isArray(logs) ? logs : [];
    let totalMinutes = 0;
    let maxSessionMinutes = 0;
    const daySet = new Set();

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item) continue;
      const mins = Math.max(0, Number(item.minutes) || 0);
      totalMinutes += mins;
      if (mins > maxSessionMinutes) maxSessionMinutes = mins;
      if (item.dateKey) {
        const dNum = parseDateKeyToDayNumber(item.dateKey);
        if (dNum !== null) daySet.add(dNum);
      }
    }

    const sortedDays = Array.from(daySet).sort(function (a, b) { return a - b; });
    let bestStreakDays = 0;
    let run = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0 || sortedDays[i] === sortedDays[i - 1] + 1) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > bestStreakDays) bestStreakDays = run;
    }

    return {
      totalMinutes: totalMinutes,
      maxSessionMinutes: maxSessionMinutes,
      bestStreakDays: bestStreakDays,
      sessionCount: arr.length
    };
  }

  function computeCaliberBuildProgress(calId, metrics, assembledIds, devMode) {
    const def = getCaliberDef(calId);
    const partsDef = PARTS_BY_CALIBER[calId] || [];
    const assembledCount = assembledIds.length;
    const totalParts = partsDef.length;
    const isComplete = totalParts > 0 && assembledCount >= totalParts;
    const startMin = def ? def.startMinutes : 0;
    const endMin = def ? def.totalMinutes : 720;
    const spanMin = Math.max(1, endMin - startMin);

    let readyPart = null;
    let machiningPart = null;

    const partsStatus = partsDef.map(function (part, idx) {
      const prevCum = idx === 0 ? startMin : partsDef[idx - 1].cumMinutes;
      const isAssembled = idx < assembledCount;
      const isNextInOrder = idx === assembledCount;
      const earnedInStep = Math.max(0, Math.min(part.stepMinutes, metrics.totalMinutes - prevCum));
      const pct = isAssembled
        ? 100
        : (devMode ? 100 : Math.max(0, Math.min(100, Math.round((earnedInStep / part.stepMinutes) * 100))));
      const remainingMinutes = devMode ? 0 : Math.max(0, part.cumMinutes - metrics.totalMinutes);
      const isReady = !isAssembled && isNextInOrder && (devMode || metrics.totalMinutes >= part.cumMinutes);
      const isUnlockedByTime = devMode || metrics.totalMinutes >= part.cumMinutes;

      const status = isAssembled
        ? 'assembled'
        : (isReady ? 'ready' : (isNextInOrder ? 'machining' : 'locked'));

      const entry = {
        id: part.id,
        code: part.code,
        name: part.name,
        en: part.en,
        desc: part.desc,
        cumMinutes: part.cumMinutes,
        stepMinutes: part.stepMinutes,
        remainingMinutes: remainingMinutes,
        pct: pct,
        status: status,
        isUnlockedByTime: isUnlockedByTime
      };

      if (isReady && !readyPart) readyPart = entry;
      if (isNextInOrder && !isReady && !machiningPart) machiningPart = entry;
      return entry;
    });

    const earnedInStage = Math.max(0, Math.min(spanMin, metrics.totalMinutes - startMin));
    const overallPct = isComplete
      ? 100
      : Math.max(0, Math.min(100, Math.round((earnedInStage / spanMin) * 100)));

    return {
      id: calId,
      name: def ? def.name : calId,
      korean: def ? def.korean : '',
      engine: def ? def.engine : '',
      subtitle: def ? def.subtitle : '',
      startMinutes: startMin,
      totalMinutes: endMin,
      assembledCount: assembledCount,
      totalParts: totalParts,
      isComplete: isComplete,
      overallPct: overallPct,
      parts: partsStatus,
      readyPart: readyPart,
      machiningPart: machiningPart
    };
  }

  function computeAtelierSnapshot(logs, atelierState) {
    const state = sanitizeAtelierState(atelierState);
    const devMode = Boolean(state.devMode);
    const metrics = computeStudyMetrics(logs);

    const projects = {};
    BUILD_ORDER.forEach(function (cid) {
      projects[cid] = computeCaliberBuildProgress(cid, metrics, state.assembledParts[cid], devMode);
    });

    // Pick first incomplete build project in BUILD_ORDER; if all complete, showcase final 'cal-g'
    let activeProjectId = BUILD_ORDER[BUILD_ORDER.length - 1];
    let allProjectsComplete = true;
    for (let i = 0; i < BUILD_ORDER.length; i++) {
      if (!projects[BUILD_ORDER[i]].isComplete) {
        activeProjectId = BUILD_ORDER[i];
        allProjectsComplete = false;
        break;
      }
    }
    const activeProject = projects[activeProjectId];

    const finishesStatus = FINISHES.map(function (f) {
      const unlocked = devMode || f.checkUnlocked(metrics);
      return {
        id: f.id,
        name: f.name,
        en: f.en,
        conditionLabel: f.conditionLabel,
        unlocked: unlocked,
        active: unlocked && state.activeFinish === f.id
      };
    });

    const resolvedFinish = finishesStatus.some(function (f) { return f.id === state.activeFinish && f.unlocked; })
      ? state.activeFinish
      : 'steel';

    const calibersStatus = CALIBERS.map(function (c) {
      const proj = projects[c.id] || null;
      const completed = Boolean(c.starter || (proj && proj.isComplete));
      const unlocked = Boolean(c.starter || (c.playable && (completed || devMode)));
      const buildPct = c.starter ? 100 : (proj ? proj.overallPct : 0);
      return {
        id: c.id,
        num: c.num,
        letter: c.letter,
        name: c.name,
        korean: c.korean,
        engine: c.engine,
        subtitle: c.subtitle,
        totalMinutes: c.totalMinutes,
        playable: c.playable,
        starter: Boolean(c.starter),
        completed: completed,
        unlocked: unlocked,
        buildPct: buildPct,
        isCurrentProject: c.id === activeProjectId && !allProjectsComplete,
        active: false // populated below
      };
    });

    const resolvedWatch = calibersStatus.some(function (c) { return c.id === state.activeWatch && c.unlocked; })
      ? state.activeWatch
      : 'cal-e';

    calibersStatus.forEach(function (c) {
      c.active = c.unlocked && resolvedWatch === c.id;
    });

    const isBinaryComplete = projects['cal-b'].isComplete;
    const isBinaryUnlocked = isBinaryComplete || devMode;

    return {
      devMode: devMode,
      metrics: metrics,
      activeWatch: resolvedWatch,
      activeFinish: resolvedFinish,
      activeProject: activeProject,
      projects: projects,
      allProjectsComplete: allProjectsComplete,
      assembledCount: activeProject.assembledCount,
      totalParts: activeProject.totalParts,
      isBinaryComplete: isBinaryComplete,
      isBinaryUnlocked: isBinaryUnlocked,
      isNo2Complete: isBinaryComplete,
      isNo2Unlocked: isBinaryUnlocked,
      overallPct: activeProject.overallPct,
      parts: activeProject.parts,
      readyPart: activeProject.readyPart,
      machiningPart: activeProject.machiningPart,
      hasActionablePart: Boolean(activeProject.readyPart),
      finishes: finishesStatus,
      calibers: calibersStatus
    };
  }

  function assembleNextPart(logs, atelierState) {
    const state = sanitizeAtelierState(atelierState);
    const snap = computeAtelierSnapshot(logs, state);
    if (!snap.readyPart) {
      return {
        ok: false,
        state: state,
        assembledPart: null,
        completedCaliber: false,
        completedCaliberId: null,
        completedCaliberName: ''
      };
    }

    const projId = snap.activeProject.id;
    const nextAssembled = state.assembledParts[projId].concat([snap.readyPart.id]);
    const partsDef = PARTS_BY_CALIBER[projId] || [];
    const completed = nextAssembled.length === partsDef.length;

    const nextMap = {
      'cal-b': state.assembledParts['cal-b'].slice(),
      'cal-c': state.assembledParts['cal-c'].slice(),
      'cal-g': state.assembledParts['cal-g'].slice()
    };
    nextMap[projId] = nextAssembled;

    const nextState = {
      activeWatch: state.activeWatch,
      activeFinish: state.activeFinish,
      devMode: state.devMode,
      assembledParts: nextMap
    };

    return {
      ok: true,
      state: nextState,
      assembledPart: snap.readyPart,
      completedCaliber: completed,
      completedCaliberId: completed ? projId : null,
      completedCaliberName: completed ? snap.activeProject.name : ''
    };
  }

  function formatMinutesShortKo(mins) {
    const m = Math.max(0, Math.round(Number(mins) || 0));
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h > 0 && rem > 0) return `${h}시간 ${rem}분`;
    if (h > 0) return `${h}시간`;
    return `${rem}분`;
  }

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, String(attrs[k]));
      });
    }
    return el;
  }

  function polarBp(cx, cy, r, deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeBpArc(cx, cy, r, startDeg, endDeg) {
    const s = polarBp(cx, cy, r, startDeg);
    const e = polarBp(cx, cy, r, endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg >= startDeg ? 1 : 0;
    return 'M ' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) +
      ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + largeArc + ' ' + sweep + ' ' +
      e.x.toFixed(1) + ' ' + e.y.toFixed(1);
  }

  /**
   * Renders the tailored 6-layer CAD/Metal Exploded Blueprint SVG for the active build project:
   *   - cal-b: B · BINARY (3-Porthole Jumping Hour + 6-Bit Binary LED Matrix)
   *   - cal-c: C · CYCLOID (220°/200° Double Retrograde Fan & Huygens Cycloid Curve)
   *   - cal-g: G · GEOMETRY (NOMOS Tangente Straight Lugs, Bauhaus Indices & 6h Guilloché)
   */
  function renderBlueprintSvg(containerEl, snapshot) {
    if (!containerEl || !snapshot) return;
    const projectId = (snapshot.activeProject && snapshot.activeProject.id) || 'cal-b';
    const byId = {};
    snapshot.parts.forEach(function (p) { byId[p.id] = p.status; });

    function layerClass(id) {
      return 'bp-layer is-' + (byId[id] || 'locked');
    }

    const svg = createSvgEl('svg', {
      viewBox: '0 0 260 154',
      class: 'atelier-blueprint-svg',
      role: 'img',
      'aria-label': ((snapshot.activeProject && snapshot.activeProject.name) || 'NO.2 BINARY') + ' 6단계 무브먼트 설계도'
    });

    const defs = createSvgEl('defs');
    const gSteel = createSvgEl('linearGradient', { id: 'bpSteelGrad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#ECEFF4'], ['48%', '#CFD6E0'], ['100%', '#AEB7C5']].forEach(function (s) {
      gSteel.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gSteel);

    const gBrass = createSvgEl('linearGradient', { id: 'bpBrassGrad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    [['0%', '#E9D29A'], ['55%', '#C8A55C'], ['100%', '#9E7D38']].forEach(function (s) {
      gBrass.appendChild(createSvgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(gBrass);
    svg.appendChild(defs);

    // CAD technical crosshair & scale circle
    const grid = createSvgEl('g', { class: 'bp-grid', opacity: '0.45' });
    grid.appendChild(createSvgEl('line', { x1: '14', y1: '77', x2: '246', y2: '77', stroke: '#8A95A5', 'stroke-width': '0.6', 'stroke-dasharray': '3 3' }));
    grid.appendChild(createSvgEl('line', { x1: '130', y1: '10', x2: '130', y2: '144', stroke: '#8A95A5', 'stroke-width': '0.6', 'stroke-dasharray': '3 3' }));
    grid.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '62', fill: 'none', stroke: '#8A95A5', 'stroke-width': '0.6', 'stroke-dasharray': '2 4' }));
    svg.appendChild(grid);

    let notes = [];

    if (projectId === 'cal-c') {
      // C · CYCLOID Double Retrograde CAD Blueprint
      const g01 = createSvgEl('g', { class: layerClass('cyc_plate') });
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '52', class: 'bp-steel-fill' }));
      g01.appendChild(createSvgEl('path', { d: 'M 86,96 Q 130,86 174,96 A 50,50 0 0 1 86,96 Z', class: 'bp-inner-line', fill: 'none' }));
      svg.appendChild(g01);

      const g02 = createSvgEl('g', { class: layerClass('cyc_snail') });
      g02.appendChild(createSvgEl('circle', { cx: '130', cy: '86', r: '18', class: 'bp-brass-fill' }));
      g02.appendChild(createSvgEl('path', { d: 'M 130,86 m -4,0 a 4,4 0 1,1 8,0 a 9,9 0 1,1 -18,0', fill: 'none', class: 'bp-spring-line' }));
      svg.appendChild(g02);

      const g03 = createSvgEl('g', { class: layerClass('cyc_rack') });
      g03.appendChild(createSvgEl('path', { d: describeBpArc(130, 86, 30, -90, 90), fill: 'none', class: 'bp-balance-ring' }));
      g03.appendChild(createSvgEl('circle', { cx: '108', cy: '74', r: '9', class: 'bp-brass-fill' }));
      g03.appendChild(createSvgEl('circle', { cx: '152', cy: '74', r: '9', class: 'bp-brass-fill' }));
      svg.appendChild(g03);

      const g04 = createSvgEl('g', { class: layerClass('cyc_spring') });
      g04.appendChild(createSvgEl('path', { d: 'M 94,104 Q 130,92 166,104', fill: 'none', class: 'bp-spring-line' }));
      g04.appendChild(createSvgEl('circle', { cx: '130', cy: '112', r: '10.5', class: 'bp-disk-fill' }));
      svg.appendChild(g04);

      const g05 = createSvgEl('g', { class: layerClass('cyc_fan') });
      g05.appendChild(createSvgEl('path', { d: describeBpArc(130, 86, 44, -110, 110), fill: 'none', class: 'bp-turret-rim' }));
      g05.appendChild(createSvgEl('path', { d: describeBpArc(130, 86, 26, -100, 100), fill: 'none', class: 'bp-inner-line' }));
      svg.appendChild(g05);

      const g06 = createSvgEl('g', { class: layerClass('cyc_case') });
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '57', class: 'bp-case-ring' }));
      g06.appendChild(createSvgEl('line', { x1: '130', y1: '86', x2: '158', y2: '52', class: 'bp-spring-line' }));
      g06.appendChild(createSvgEl('line', { x1: '130', y1: '86', x2: '109', y2: '66', class: 'bp-inner-line' }));
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '86', r: '3.2', class: 'bp-ruby-dot' }));
      svg.appendChild(g06);

      notes = [
        { x: 16, y: 34, label: '01 BRIDGE', id: 'cyc_plate' },
        { x: 16, y: 74, label: '02 SNAIL', id: 'cyc_snail' },
        { x: 16, y: 118, label: '05 220° FAN', id: 'cyc_fan' },
        { x: 244, y: 34, label: '03 RACK', id: 'cyc_rack', right: true },
        { x: 244, y: 74, label: '04 FLYBACK', id: 'cyc_spring', right: true },
        { x: 244, y: 118, label: '06 HANDS', id: 'cyc_case', right: true }
      ];
    } else if (projectId === 'cal-g') {
      // G · GEOMETRY (NOMOS Tangente Bauhaus) CAD Blueprint
      const g01 = createSvgEl('g', { class: layerClass('geo_plate') });
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '49', class: 'bp-steel-fill' }));
      svg.appendChild(g01);

      const g02 = createSvgEl('g', { class: layerClass('geo_barrel') });
      g02.appendChild(createSvgEl('circle', { cx: '115', cy: '63', r: '15', class: 'bp-brass-fill' }));
      g02.appendChild(createSvgEl('circle', { cx: '146', cy: '68', r: '10', class: 'bp-brass-fill' }));
      svg.appendChild(g02);

      const g03 = createSvgEl('g', { class: layerClass('geo_dial') });
      [12, 2, 4, 8, 10].forEach(function (h) {
        const pt = polarBp(130, 77, 38, (h % 12) * 30);
        const t = createSvgEl('text', { x: pt.x.toFixed(1), y: (pt.y + 3.5).toFixed(1), 'text-anchor': 'middle', class: 'bp-num-txt' });
        t.textContent = String(h);
        g03.appendChild(t);
      });
      [1, 3, 5, 7, 9, 11].forEach(function (h) {
        const p1 = polarBp(130, 77, 34, h * 30);
        const p2 = polarBp(130, 77, 44, h * 30);
        g03.appendChild(createSvgEl('line', { x1: p1.x.toFixed(1), y1: p1.y.toFixed(1), x2: p2.x.toFixed(1), y2: p2.y.toFixed(1), class: 'bp-inner-line' }));
      });
      svg.appendChild(g03);

      const g04 = createSvgEl('g', { class: layerClass('geo_subdial') });
      g04.appendChild(createSvgEl('circle', { cx: '130', cy: '102', r: '12', class: 'bp-turret-rim' }));
      g04.appendChild(createSvgEl('circle', { cx: '130', cy: '102', r: '7', class: 'bp-inner-line', fill: 'none' }));
      svg.appendChild(g04);

      const g05 = createSvgEl('g', { class: layerClass('geo_hands') });
      g05.appendChild(createSvgEl('line', { x1: '130', y1: '84', x2: '130', y2: '39', class: 'bp-spring-line' }));
      g05.appendChild(createSvgEl('line', { x1: '126', y1: '81', x2: '154', y2: '56', class: 'bp-spring-line' }));
      g05.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '2.6', class: 'bp-ruby-dot' }));
      svg.appendChild(g05);

      const g06 = createSvgEl('g', { class: layerClass('geo_case') });
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '53', class: 'bp-case-ring' }));
      ['M 101,32 L 99,11 L 107,11 L 109,28 Z', 'M 159,32 L 161,11 L 153,11 L 151,28 Z',
        'M 101,122 L 99,143 L 107,143 L 109,126 Z', 'M 159,122 L 161,143 L 153,143 L 151,126 Z'].forEach(function (d) {
        g06.appendChild(createSvgEl('path', { d: d, class: 'bp-steel-fill' }));
      });
      g06.appendChild(createSvgEl('rect', { x: '183', y: '69', width: '7', height: '16', rx: '1.5', class: 'bp-steel-fill' }));
      svg.appendChild(g06);

      notes = [
        { x: 16, y: 34, label: '01 3/4 PLATE', id: 'geo_plate' },
        { x: 16, y: 74, label: '02 BARREL', id: 'geo_barrel' },
        { x: 16, y: 118, label: '05 HANDS', id: 'geo_hands' },
        { x: 244, y: 34, label: '03 DIAL', id: 'geo_dial', right: true },
        { x: 244, y: 74, label: '04 6H SEC', id: 'geo_subdial', right: true },
        { x: 244, y: 118, label: '06 LUGS', id: 'geo_case', right: true }
      ];
    } else {
      // B · BINARY 3-Porthole + 6-Bit Binary LED Matrix CAD Blueprint
      const g01 = createSvgEl('g', { class: layerClass('mainplate'), 'data-part': 'mainplate' });
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '52', class: 'bp-steel-fill' }));
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '46', class: 'bp-inner-line' }));
      svg.appendChild(g01);

      const g02 = createSvgEl('g', { class: layerClass('barrel'), 'data-part': 'barrel' });
      g02.appendChild(createSvgEl('circle', { cx: '107', cy: '63', r: '18', class: 'bp-brass-fill' }));
      g02.appendChild(createSvgEl('path', {
        d: 'M 107,63 m -2,0 a 2,2 0 1,1 4,0 a 5,5 0 1,1 -10,0 a 9,9 0 1,1 18,0 a 13,13 0 1,1 -25,2',
        fill: 'none', class: 'bp-spring-line'
      }));
      svg.appendChild(g02);

      const g03 = createSvgEl('g', { class: layerClass('geartrain'), 'data-part': 'geartrain' });
      g03.appendChild(createSvgEl('circle', { cx: '143', cy: '73', r: '15', class: 'bp-brass-fill' }));
      g03.appendChild(createSvgEl('circle', { cx: '143', cy: '73', r: '5', class: 'bp-inner-line' }));
      g03.appendChild(createSvgEl('circle', { cx: '126', cy: '94', r: '11', class: 'bp-brass-fill' }));
      g03.appendChild(createSvgEl('circle', { cx: '126', cy: '94', r: '3.5', class: 'bp-inner-line' }));
      svg.appendChild(g03);

      const g04 = createSvgEl('g', { class: layerClass('escapement'), 'data-part': 'escapement' });
      g04.appendChild(createSvgEl('circle', { cx: '153', cy: '98', r: '13', class: 'bp-balance-ring' }));
      g04.appendChild(createSvgEl('line', { x1: '141', y1: '98', x2: '165', y2: '98', class: 'bp-inner-line' }));
      g04.appendChild(createSvgEl('line', { x1: '153', y1: '86', x2: '153', y2: '110', class: 'bp-inner-line' }));
      g04.appendChild(createSvgEl('circle', { cx: '153', cy: '98', r: '2.6', class: 'bp-ruby-dot' }));
      svg.appendChild(g04);

      const g05 = createSvgEl('g', { class: layerClass('jumpcam'), 'data-part': 'jumpcam' });
      g05.appendChild(createSvgEl('circle', { cx: '112', cy: '57', r: '15.5', class: 'bp-disk-fill' }));
      const txt12 = createSvgEl('text', { x: '112', y: '61.5', 'text-anchor': 'middle', class: 'bp-num-txt' });
      txt12.textContent = '01';
      g05.appendChild(txt12);
      g05.appendChild(createSvgEl('path', {
        d: 'M 149,54 A 24,24 0 0 1 149,100 L 138,93 A 13,13 0 0 0 138,61 Z',
        class: 'bp-disk-fill'
      }));
      const txtMin = createSvgEl('text', { x: '151', y: '80', 'text-anchor': 'middle', class: 'bp-min-txt' });
      txtMin.textContent = '25';
      g05.appendChild(txtMin);
      for (let b = 0; b < 6; b++) {
        g05.appendChild(createSvgEl('circle', { cx: (98 + b * 5.6).toFixed(1), cy: '79', r: '1.6', class: 'bp-ruby-dot' }));
      }
      svg.appendChild(g05);

      const g06 = createSvgEl('g', { class: layerClass('turretcase'), 'data-part': 'turretcase' });
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '57', class: 'bp-case-ring' }));
      g06.appendChild(createSvgEl('circle', { cx: '112', cy: '57', r: '16.5', class: 'bp-turret-rim' }));
      g06.appendChild(createSvgEl('circle', { cx: '112', cy: '101', r: '12.5', class: 'bp-turret-rim' }));
      g06.appendChild(createSvgEl('rect', { x: '185', y: '92', width: '9', height: '14', rx: '2', transform: 'rotate(24 189 99)', class: 'bp-steel-fill' }));
      svg.appendChild(g06);

      notes = [
        { x: 16, y: 34, label: '01 BASE', id: 'mainplate' },
        { x: 16, y: 74, label: '02 SPRING', id: 'barrel' },
        { x: 16, y: 118, label: '05 6-BIT', id: 'jumpcam' },
        { x: 244, y: 34, label: '03 TRAIN', id: 'geartrain', right: true },
        { x: 244, y: 74, label: '04 4HZ', id: 'escapement', right: true },
        { x: 244, y: 118, label: '06 CASE', id: 'turretcase', right: true }
      ];
    }

    notes.forEach(function (n) {
      const t = createSvgEl('text', {
        x: n.x,
        y: n.y,
        'text-anchor': n.right ? 'end' : 'start',
        class: 'bp-callout is-' + (byId[n.id] || 'locked')
      });
      t.textContent = n.label;
      svg.appendChild(t);
    });

    containerEl.innerHTML = '';
    containerEl.appendChild(svg);
  }

  global.CasperAtelier = {
    DEFAULT_DEV_MODE: DEFAULT_DEV_MODE,
    BUILD_ORDER: BUILD_ORDER,
    PLAYABLE_IDS: PLAYABLE_IDS,
    NO2_PARTS: CAL_B_PARTS,
    PARTS_BY_CALIBER: PARTS_BY_CALIBER,
    CALIBERS: CALIBERS,
    FINISHES: FINISHES,
    createDefaultAtelierState: createDefaultAtelierState,
    sanitizeAtelierState: sanitizeAtelierState,
    computeStudyMetrics: computeStudyMetrics,
    computeAtelierSnapshot: computeAtelierSnapshot,
    assembleNextPart: assembleNextPart,
    formatMinutesShortKo: formatMinutesShortKo,
    renderBlueprintSvg: renderBlueprintSvg
  };
})(typeof window !== 'undefined' ? window : globalThis);
