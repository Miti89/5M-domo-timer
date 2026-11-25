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

  const BUILD_ORDER = [
    'cal-b', 'cal-d', 'cal-c', 'cal-e', 'cal-f',
    'cal-g', 'cal-h', 'cal-i', 'cal-j', 'cal-a'
  ];
  const PLAYABLE_IDS = BUILD_ORDER.slice();

  // Stage 1: B · BINARY (0 -> 30m) — fast onboarding (5, 10, 15, 20, 25, 30m)
  const CAL_B_PARTS = [
    {
      id: 'mainplate',
      code: '01',
      name: '옵시디언 기판',
      en: 'Obsidian Baseplate',
      cumMinutes: 5,
      stepMinutes: 5,
      desc: '0과 1의 대비를 이루는 매트 블랙 무브먼트 기판'
    },
    {
      id: 'barrel',
      code: '02',
      name: '배럴 & 태엽',
      en: 'Mainspring Barrel',
      cumMinutes: 10,
      stepMinutes: 5,
      desc: '42시간 파워리저브 합금 메인스프링'
    },
    {
      id: 'geartrain',
      code: '03',
      name: '기어 트레인',
      en: 'Gear Train',
      cumMinutes: 15,
      stepMinutes: 5,
      desc: '고정밀 황동·스틸 4단 치차열'
    },
    {
      id: 'escapement',
      code: '04',
      name: '밸런스 & 탈진기',
      en: '4Hz Escapement',
      cumMinutes: 20,
      stepMinutes: 5,
      desc: '28,800 vph 기계식 심장부 어셈블리'
    },
    {
      id: 'jumpcam',
      code: '05',
      name: '점핑 캠 & 6-Bit LED',
      en: 'Jump Cam & Binary LED',
      cumMinutes: 25,
      stepMinutes: 5,
      desc: '정각 순간 도약 스타 휠 · 6비트 이진 초 표시 모듈'
    },
    {
      id: 'turretcase',
      code: '06',
      name: '3창 터렛 케이스',
      en: '3-Porthole Case',
      cumMinutes: 30,
      stepMinutes: 5,
      desc: '사파이어 렌즈 3창 브러시드 스틸 최종 마감'
    }
  ];

  // Stage 2: D · DELTA (30 -> 120m / 2h) — Slide Rule Chronograph (15m/part)
  const CAL_D_PARTS = [
    {
      id: 'del_plate',
      code: '01',
      name: '크로노그래프 기판',
      en: 'Chronograph Baseplate',
      cumMinutes: 45,
      stepMinutes: 15,
      desc: '어제와 오늘의 차이를 새기는 브러시드 스틸 크로노 기판'
    },
    {
      id: 'del_column',
      code: '02',
      name: '칼럼 휠 제어 모듈',
      en: 'Column Wheel Control',
      cumMinutes: 60,
      stepMinutes: 15,
      desc: '시작·정지·리셋을 절도 있게 전환하는 8치 칼럼 휠'
    },
    {
      id: 'del_clutch',
      code: '03',
      name: '수직 클러치 어셈블리',
      en: 'Vertical Clutch',
      cumMinutes: 75,
      stepMinutes: 15,
      desc: '초침 떨림 없이 즉각 구동되는 무마찰 수직 클러치'
    },
    {
      id: 'del_ruler',
      code: '04',
      name: '슬라이드 룰 회전 베젤',
      en: 'Slide Rule Bezel',
      cumMinutes: 90,
      stepMinutes: 15,
      desc: '변화량(Δ)과 비율을 직관적으로 계산하는 로그 눈금 베젤'
    },
    {
      id: 'del_counters',
      code: '05',
      name: '30분·12시간 적산계',
      en: 'Twin Chrono Counters',
      cumMinutes: 105,
      stepMinutes: 15,
      desc: '구간 집중 시간을 독립적으로 계측하는 듀얼 서브 다이얼'
    },
    {
      id: 'del_case',
      code: '06',
      name: '트윈 푸셔 케이스',
      en: 'Twin-Pusher Case',
      cumMinutes: 120,
      stepMinutes: 15,
      desc: '2시·4시 펌프 푸셔와 사파이어 글라스 최종 마감'
    }
  ];

  // Stage 3: C · CYCLOID (120 -> 300m / 5h, 30m/part)
  const CAL_C_PARTS = [
    {
      id: 'cyc_plate',
      code: '01',
      name: '사이클로이드 브릿지',
      en: 'Cycloid Bridge',
      cumMinutes: 150,
      stepMinutes: 30,
      desc: '호이겐스 등시성 곡선이 각인된 하단 스틸 브릿지'
    },
    {
      id: 'cyc_snail',
      code: '02',
      name: '스네일 캠 모듈',
      en: 'Snail Cam Module',
      cumMinutes: 180,
      stepMinutes: 30,
      desc: '220° 레트로그레이드 귀환 각도를 제어하는 달팽이 캠'
    },
    {
      id: 'cyc_rack',
      code: '03',
      name: '더블 랙 & 피니언',
      en: 'Dual Rack & Pinion',
      cumMinutes: 210,
      stepMinutes: 30,
      desc: '시·분 동축 부채꼴 기어 연동 치차 모듈'
    },
    {
      id: 'cyc_spring',
      code: '04',
      name: '플라이백 리셋 스프링',
      en: 'Flyback Return Spring',
      cumMinutes: 240,
      stepMinutes: 30,
      desc: '60분 도달 시 0으로 즉시 복귀시키는 탄성 판스프링'
    },
    {
      id: 'cyc_fan',
      code: '05',
      name: '220° 팬 계기판',
      en: '220° Fan Scale Dial',
      cumMinutes: 270,
      stepMinutes: 30,
      desc: '외곽 220° 분 게이지 · 내곽 200° 시 게이지 스케일'
    },
    {
      id: 'cyc_case',
      code: '06',
      name: '동축 바늘 & 케이스',
      en: 'Coaxial Hands & Case',
      cumMinutes: 300,
      stepMinutes: 30,
      desc: '테라코타 팁 분침·스몰 세컨즈·316L 케이스 최종 마감'
    }
  ];

  // Stage 4: E · ELLIPSE (300 -> 600m / 10h, 50m/part) — Starter watch + buildable completion stage
  const CAL_E_PARTS = [
    {
      id: 'ell_plate',
      code: '01',
      name: '타원 궤도 기판',
      en: 'Orbital Baseplate',
      cumMinutes: 350,
      stepMinutes: 50,
      desc: '두 초점을 중심으로 유성 기어를 지지하는 새틴 기판'
    },
    {
      id: 'ell_carousel',
      code: '02',
      name: '3암 유성 캐러셀',
      en: 'Tri-Arm Carousel',
      cumMinutes: 400,
      stepMinutes: 50,
      desc: '세 개의 시간 위성을 120° 간격으로 공전시키는 브릿지'
    },
    {
      id: 'ell_discs',
      code: '03',
      name: '새틀라이트 아워 디스크',
      en: 'Satellite Hour Discs',
      cumMinutes: 450,
      stepMinutes: 50,
      desc: '1~12시를 3개 회전 원판에 분배한 자전형 시간 디스크'
    },
    {
      id: 'ell_roller',
      code: '04',
      name: '8시 인덱스 롤러',
      en: '8h Indexing Roller',
      cumMinutes: 500,
      stepMinutes: 50,
      desc: '위성 디스크를 90° 정밀 전환하는 커스텀 볼베어링 롤러'
    },
    {
      id: 'ell_track',
      code: '05',
      name: '120° 아크 분 트랙',
      en: '120° Minute Arc Track',
      cumMinutes: 550,
      stepMinutes: 50,
      desc: '우측 1시~5시 궤도를 따라 분을 지시하는 브러시드 섹터'
    },
    {
      id: 'ell_case',
      code: '06',
      name: '러그리스 원형 케이스',
      en: 'Lugless Round Case',
      cumMinutes: 600,
      stepMinutes: 50,
      desc: '돔 사파이어 크리스털과 4시 2단 용두 최종 마감'
    }
  ];

  // Stage 5: F · FRACTAL (600 -> 1200m / 20h, 100m/part) — Skeleton Recursive Structure
  const CAL_F_PARTS = [
    {
      id: 'fra_plate',
      code: '01',
      name: '오픈워크 스켈레톤 기판',
      en: 'Openwork Skeleton Plate',
      cumMinutes: 700,
      stepMinutes: 100,
      desc: '작은 5분 속 구조를 그대로 드러내는 정밀 투각 메인플레이트'
    },
    {
      id: 'fra_bridge',
      code: '02',
      name: '자기유사 기하 브릿지',
      en: 'Self-Similar Bridges',
      cumMinutes: 800,
      stepMinutes: 100,
      desc: '반복 패턴의 대칭 트러스로 하중을 분산하는 스켈레톤 브릿지'
    },
    {
      id: 'fra_gear',
      code: '03',
      name: '동심 반복 치차열',
      en: 'Recursive Gear Train',
      cumMinutes: 900,
      stepMinutes: 100,
      desc: '크고 작은 톱니가 겹쳐 맞물리는 프랙탈 비례 치차열'
    },
    {
      id: 'fra_barrel',
      code: '04',
      name: '투각 오픈 배럴',
      en: 'Skeletonized Barrel',
      cumMinutes: 1000,
      stepMinutes: 100,
      desc: '태엽의 감김과 풀림이 그대로 보이는 개방형 배럴 드럼'
    },
    {
      id: 'fra_dial',
      code: '05',
      name: '다층 인덱스 링',
      en: 'Layered Index Ring',
      cumMinutes: 1100,
      stepMinutes: 100,
      desc: '공중에 떠 있는 듯한 플로팅 미닛 트랙과 루미노바 바늘'
    },
    {
      id: 'fra_case',
      code: '06',
      name: '시스루 사파이어 케이스',
      en: 'Exhibition Case',
      cumMinutes: 1200,
      stepMinutes: 100,
      desc: '전·후면 양면 사파이어 글라스와 스틸 베젤 최종 마감'
    }
  ];

  // Stage 6: G · GEOMETRY (1200 -> 1920m / 32h, 120m/part)
  const CAL_G_PARTS = [
    {
      id: 'geo_plate',
      code: '01',
      name: '울트라 슬림 기판',
      en: 'Ultra-Slim 3/4 Plate',
      cumMinutes: 1320,
      stepMinutes: 120,
      desc: '글라슈테 3/4 플레이트 구조 초박형 무브먼트 기판'
    },
    {
      id: 'geo_barrel',
      code: '02',
      name: '수동 와인딩 배럴',
      en: 'Manual Wind Barrel',
      cumMinutes: 1440,
      stepMinutes: 120,
      desc: '부드러운 손감기 저항감을 갖춘 선버스트 라쳇 휠'
    },
    {
      id: 'geo_dial',
      code: '03',
      name: '실버 도금 다이얼',
      en: 'Galvanized Silver Dial',
      cumMinutes: 1560,
      stepMinutes: 120,
      desc: '바우하우스 교차 타이포(12·2·4·8·10)와 헤어라인 인덱스'
    },
    {
      id: 'geo_subdial',
      code: '04',
      name: '6시 기요셰 초침판',
      en: 'Sunken Guilloché Sec',
      cumMinutes: 1680,
      stepMinutes: 120,
      desc: '동심원 선반 가공이 들어간 단차 6시 스몰 세컨즈'
    },
    {
      id: 'geo_hands',
      code: '05',
      name: '열처리 블루드 핸즈',
      en: 'Tempered Blued Hands',
      cumMinutes: 1800,
      stepMinutes: 120,
      desc: '290°C 열처리로 구워낸 슬림 바톤 블루 스틸 시·분침'
    },
    {
      id: 'geo_case',
      code: '06',
      name: '직각 러그 케이스',
      en: 'Tangente Straight Lugs',
      cumMinutes: 1920,
      stepMinutes: 120,
      desc: '초슬림 원통 베젤 · 각진 탕겐테 러그 · 3시 용두 최종 마감'
    }
  ];

  // Stage 7: H · HARMONIC (1920 -> 2820m / 47h, 150m/part) — Open-Heart Balance Wheel
  const CAL_H_PARTS = [
    {
      id: 'har_plate',
      code: '01',
      name: '공진 안정화 기판',
      en: 'Resonance Baseplate',
      cumMinutes: 2070,
      stepMinutes: 150,
      desc: '흔들림을 일정한 박자로 정돈하는 진동 흡수 메인플레이트'
    },
    {
      id: 'har_balance',
      code: '02',
      name: '프리 스프렁 진동추',
      en: 'Free-Sprung Balance',
      cumMinutes: 2220,
      stepMinutes: 150,
      desc: '관성 조절 추를 갖춘 고정밀 오픈하트 밸런스 휠'
    },
    {
      id: 'har_hairspring',
      code: '03',
      name: '등시성 헤어스프링',
      en: 'Isochronous Hairspring',
      cumMinutes: 2370,
      stepMinutes: 150,
      desc: '호흡처럼 고르게 수축·팽창하는 브레게 오버코일 스프링'
    },
    {
      id: 'har_openheart',
      code: '04',
      name: '6시 오픈하트 창',
      en: 'Open-Heart Aperture',
      cumMinutes: 2520,
      stepMinutes: 150,
      desc: '진동추의 박동을 정면에서 감상하는 다이아몬드 베벨 창'
    },
    {
      id: 'har_dial',
      code: '05',
      name: '파동 기요셰 다이얼',
      en: 'Harmonic Wave Dial',
      cumMinutes: 2670,
      stepMinutes: 150,
      desc: '사인파 결이 은은하게 퍼지는 실버 기요셰 다이얼'
    },
    {
      id: 'har_case',
      code: '06',
      name: '공명 스틸 케이스',
      en: 'Acoustic Steel Case',
      cumMinutes: 2820,
      stepMinutes: 150,
      desc: '부드러운 곡면 베젤과 저반사 사파이어 최종 마감'
    }
  ];

  // Stage 8: I · INTEGRAL (2820 -> 3900m / 65h, 180m/part) — Linear Cumulative Gauge
  const CAL_I_PARTS = [
    {
      id: 'int_plate',
      code: '01',
      name: '리니어 레일 기판',
      en: 'Linear Rail Plate',
      cumMinutes: 3000,
      stepMinutes: 180,
      desc: '사라지지 않고 쌓이는 직선 궤도를 지지하는 정밀 레일 기판'
    },
    {
      id: 'int_rack',
      code: '02',
      name: '직선 누적 기어 랙',
      en: 'Linear Gear Rack',
      cumMinutes: 3180,
      stepMinutes: 180,
      desc: '회전 동력을 미세한 직선 전진으로 변환하는 적분 치차 랙'
    },
    {
      id: 'int_slider',
      code: '03',
      name: '슬라이더 인디케이터',
      en: 'Linear Slider Bar',
      cumMinutes: 3360,
      stepMinutes: 180,
      desc: '누적된 찰나를 직선 게이지 위로 밀어 올리는 스틸 슬라이더'
    },
    {
      id: 'int_cam',
      code: '04',
      name: '적분 면적 보정 캠',
      en: 'Integral Calibration Cam',
      cumMinutes: 3540,
      stepMinutes: 180,
      desc: '전 구간 등속 이동을 보정하는 비대칭 정밀 캠'
    },
    {
      id: 'int_scale',
      code: '05',
      name: '리니어 누적 눈금판',
      en: 'Linear Cumulative Scale',
      cumMinutes: 3720,
      stepMinutes: 180,
      desc: '깊이감 있는 수평 눈금과 미세 버니어 스케일 다이얼'
    },
    {
      id: 'int_case',
      code: '06',
      name: '직선 베벨 케이스',
      en: 'Linear Bevel Case',
      cumMinutes: 3900,
      stepMinutes: 180,
      desc: '헤어라인 수직 브러싱과 직선 챔퍼 베젤 최종 마감'
    }
  ];

  // Stage 9: J · JOULE (3900 -> 4800m / 80h, 150m/part) — Power Reserve Dynamometer
  const CAL_J_PARTS = [
    {
      id: 'jou_plate',
      code: '01',
      name: '동력계 베이스 기판',
      en: 'Dynamometer Plate',
      cumMinutes: 4050,
      stepMinutes: 150,
      desc: '축적된 에너지를 온기로 전환하는 고강성 스틸 메인플레이트'
    },
    {
      id: 'jou_spring',
      code: '02',
      name: '고밀도 동력 태엽',
      en: 'High-Torque Mainspring',
      cumMinutes: 4200,
      stepMinutes: 150,
      desc: '장시간 균일한 토크를 유지하는 이중 합금 태엽 모듈'
    },
    {
      id: 'jou_diff',
      code: '03',
      name: '유성 차동 기어',
      en: 'Planetary Differential',
      cumMinutes: 4350,
      stepMinutes: 150,
      desc: '와인딩과 방출의 차이를 실시간 계측하는 차동 기어열'
    },
    {
      id: 'jou_gauge',
      code: '04',
      name: '파워리저브 동력계',
      en: 'Power Reserve Gauge',
      cumMinutes: 4500,
      stepMinutes: 150,
      desc: '남은 에너지와 축적된 열량을 직관적으로 비추는 아크 게이지'
    },
    {
      id: 'jou_hands',
      code: '05',
      name: '웜 브라스 바늘 세트',
      en: 'Warm Brass Hands',
      cumMinutes: 4650,
      stepMinutes: 150,
      desc: '차가운 계기 위에 온기를 더하는 황동 팁 인디케이터'
    },
    {
      id: 'jou_case',
      code: '06',
      name: '인스트루먼트 케이스',
      en: 'Instrument Steel Case',
      cumMinutes: 4800,
      stepMinutes: 150,
      desc: '정밀 계측기 감성의 새틴 316L 스틸 케이스 최종 마감'
    }
  ];

  // Stage 10: A · ALGEBRA (4800 -> 6000m / 100h, 200m/part — Lange 1 Moon Phase Homage)
  const CAL_A_PARTS = [
    {
      id: 'alg_plate',
      code: '01',
      name: '3/4 저먼실버 기판',
      en: '3/4 German Silver Plate',
      cumMinutes: 5000,
      stepMinutes: 200,
      desc: '글라슈테 리빙 마감의 무도금 저먼실버 3/4 무브먼트 플레이트'
    },
    {
      id: 'alg_barrel',
      code: '02',
      name: '트윈 배럴 (AUF/AB)',
      en: 'Twin Mainspring Barrel',
      cumMinutes: 5200,
      stepMinutes: 200,
      desc: '72시간 동력을 공급하고 우측 AUF/AB 바늘을 구동하는 이중 태엽통'
    },
    {
      id: 'alg_date',
      code: '03',
      name: '아웃사이즈 데이트',
      en: 'Patented Outsize Date',
      cumMinutes: 5400,
      stepMinutes: 200,
      desc: '십의 자리·일의 자리 독립 디스크가 순간 전환되는 대형 트윈 날짜창'
    },
    {
      id: 'alg_dial',
      code: '04',
      name: '황금비 로마 다이얼',
      en: 'Golden Ratio Silver Dial',
      cumMinutes: 5600,
      stepMinutes: 200,
      desc: '좌측 오프센터 로마숫자(XII·III·VI·IX)와 8개 다이아몬드 아플리케'
    },
    {
      id: 'alg_moon',
      code: '05',
      name: '문페이즈 천체 디스크',
      en: 'Celestial Moon Phase',
      cumMinutes: 5800,
      stepMinutes: 200,
      desc: '딥 블루 밤하늘과 별자리·실버 문 디스크가 결합된 5시 스몰세컨즈'
    },
    {
      id: 'alg_case',
      code: '06',
      name: '플라티넘 원형 케이스',
      en: 'Platinum Round Case',
      cumMinutes: 6000,
      stepMinutes: 200,
      desc: '이중 단차 미러 베젤 · 10시 푸셔 · 3시 플루티드 용두 최종 마감'
    }
  ];

  const PARTS_BY_CALIBER = {
    'cal-b': CAL_B_PARTS,
    'cal-d': CAL_D_PARTS,
    'cal-c': CAL_C_PARTS,
    'cal-e': CAL_E_PARTS,
    'cal-f': CAL_F_PARTS,
    'cal-g': CAL_G_PARTS,
    'cal-h': CAL_H_PARTS,
    'cal-i': CAL_I_PARTS,
    'cal-j': CAL_J_PARTS,
    'cal-a': CAL_A_PARTS
  };

  // Complete CASPER™ NO.1–NO.10 Mathematical Horology Registry (A=NO.1 .. J=NO.10)
  const CALIBERS = [
    {
      id: 'cal-a',
      num: '01',
      letter: 'A',
      name: 'NO.1 ALGEBRA',
      korean: '대수학',
      engine: 'CASPER',
      subtitle: '마침내 풀어낸 미지수 x · 황금비 오프센터 & 빅데이트',
      lockedSubtitle: '아직 풀리지 않은 미지수 · 9개 모델 완성 시 해금',
      startMinutes: 4800,
      totalMinutes: 6000,
      playable: true,
      requiresAllOthers: true,
      parts: CAL_A_PARTS
    },
    {
      id: 'cal-b',
      num: '02',
      letter: 'B',
      name: 'NO.2 BINARY',
      korean: '이진법',
      engine: 'CASPER',
      subtitle: '0과 1의 경계를 넘다 · 점핑 아워 & 6-Bit LED',
      startMinutes: 0,
      totalMinutes: 30,
      playable: true,
      starter: true,
      parts: CAL_B_PARTS
    },
    {
      id: 'cal-c',
      num: '03',
      letter: 'C',
      name: 'NO.3 CYCLOID',
      korean: '사이클로이드',
      engine: 'CASPER',
      subtitle: '가장 빠른 길은 곡선이다 · 220° 더블 레트로그레이드',
      startMinutes: 120,
      totalMinutes: 300,
      playable: true,
      parts: CAL_C_PARTS
    },
    {
      id: 'cal-d',
      num: '04',
      letter: 'D',
      name: 'NO.4 DELTA',
      korean: '변화량(Δ)',
      engine: 'CASPER · 설계 중',
      subtitle: '어제와 오늘 사이의 틈 · 슬라이드 룰 크로노그래프',
      startMinutes: 30,
      totalMinutes: 120,
      playable: true,
      inDesign: true,
      parts: CAL_D_PARTS
    },
    {
      id: 'cal-e',
      num: '05',
      letter: 'E',
      name: 'NO.5 ELLIPSE',
      korean: '타원',
      engine: 'CASPER',
      subtitle: '두 초점을 품은 나의 궤도 · 새틀라이트 아워',
      startMinutes: 300,
      totalMinutes: 600,
      playable: true,
      starter: true,
      parts: CAL_E_PARTS
    },
    {
      id: 'cal-f',
      num: '06',
      letter: 'F',
      name: 'NO.6 FRACTAL',
      korean: '프랙탈',
      engine: 'CASPER · 설계 중',
      subtitle: '작은 5분 속에 담긴 일생 · 스켈레톤 반복 구조',
      startMinutes: 600,
      totalMinutes: 1200,
      playable: true,
      inDesign: true,
      parts: CAL_F_PARTS
    },
    {
      id: 'cal-g',
      num: '07',
      letter: 'G',
      name: 'NO.7 GEOMETRY',
      korean: '기하학',
      engine: 'CASPER',
      subtitle: '소음을 덜어낸 순수한 비례 · 바우하우스 탕겐테',
      startMinutes: 1200,
      totalMinutes: 1920,
      playable: true,
      parts: CAL_G_PARTS
    },
    {
      id: 'cal-h',
      num: '08',
      letter: 'H',
      name: 'NO.8 HARMONIC',
      korean: '조화진동',
      engine: 'CASPER · 설계 중',
      subtitle: '흔들리되 무너지지 않는 박자 · 오픈하트 진동추',
      startMinutes: 1920,
      totalMinutes: 2820,
      playable: true,
      inDesign: true,
      parts: CAL_H_PARTS
    },
    {
      id: 'cal-i',
      num: '09',
      letter: 'I',
      name: 'NO.9 INTEGRAL',
      korean: '적분',
      engine: 'CASPER · 설계 중',
      subtitle: '사라지지 않고 쌓이는 찰나 · 리니어 누적 게이지',
      startMinutes: 2820,
      totalMinutes: 3900,
      playable: true,
      inDesign: true,
      parts: CAL_I_PARTS
    },
    {
      id: 'cal-j',
      num: '10',
      letter: 'J',
      name: 'NO.10 JOULE',
      korean: '에너지 단위',
      engine: 'CASPER · 설계 중',
      subtitle: '차가운 숫자가 온기가 될 때 · 파워리저브 동력계',
      startMinutes: 3900,
      totalMinutes: 4800,
      playable: true,
      inDesign: true,
      parts: CAL_J_PARTS
    }
  ];

  const FINISHES = [];

  function getCaliberDef(calId) {
    for (let i = 0; i < CALIBERS.length; i++) {
      if (CALIBERS[i].id === calId) return CALIBERS[i];
    }
    return null;
  }

  function createEmptyAssembledParts() {
    const map = {};
    for (let i = 0; i < BUILD_ORDER.length; i++) {
      map[BUILD_ORDER[i]] = [];
    }
    return map;
  }

  function createDefaultAtelierState() {
    return {
      activeWatch: 'cal-b',
      activeFinish: 'steel',
      devMode: DEFAULT_DEV_MODE,
      assembledParts: createEmptyAssembledParts()
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
    const assembledParts = {};
    for (let i = 0; i < BUILD_ORDER.length; i++) {
      const cid = BUILD_ORDER[i];
      // Seamless migration from legacy 'no2-jump' -> 'cal-b'
      const src = (cid === 'cal-b' && !Array.isArray(rawParts['cal-b']))
        ? rawParts['no2-jump']
        : rawParts[cid];
      assembledParts[cid] = sanitizeSequentialParts(src, PARTS_BY_CALIBER[cid] || []);
    }

    const devMode = typeof raw.devMode === 'boolean' ? raw.devMode : DEFAULT_DEV_MODE;
    const mappedWatch = LEGACY_CALIBER_MAP[raw.activeWatch] || raw.activeWatch;
    const calDef = getCaliberDef(mappedWatch);
    let activeWatch = 'cal-b';
    if (calDef && PLAYABLE_IDS.includes(mappedWatch)) {
      if (calDef.starter || devMode) {
        activeWatch = mappedWatch;
      } else {
        const reqParts = PARTS_BY_CALIBER[mappedWatch] || [];
        const isComplete = reqParts.length > 0 && assembledParts[mappedWatch].length === reqParts.length;
        if (calDef.requiresAllOthers) {
          const othersDone = BUILD_ORDER.every(function (oid) {
            if (oid === mappedWatch) return true;
            const oParts = PARTS_BY_CALIBER[oid] || [];
            return oParts.length > 0 && assembledParts[oid].length === oParts.length;
          });
          if (isComplete && othersDone) activeWatch = mappedWatch;
        } else if (isComplete) {
          activeWatch = mappedWatch;
        }
      }
    }

    const activeFinish = 'steel';

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

  function computeStudyMetrics(logs, lifetimeMinutesOpt) {
    const arr = Array.isArray(logs) ? logs : [];
    let logTotalMinutes = 0;
    let maxSessionMinutes = 0;
    let sessionCount = 0;
    const daySet = new Set();

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item) continue;
      const mins = Math.max(0, Number(item.minutes) || 0);
      logTotalMinutes += mins;
      sessionCount += item.isSummary ? Math.max(1, Number(item.sessionCount) || 1) : 1;
      if (!item.isSummary && mins > maxSessionMinutes) maxSessionMinutes = mins;
      if (item.dateKey) {
        const dNum = parseDateKeyToDayNumber(item.dateKey);
        if (dNum !== null) daySet.add(dNum);
      }
    }

    const totalMinutes = (typeof lifetimeMinutesOpt === 'number' && Number.isFinite(lifetimeMinutesOpt))
      ? Math.max(0, Math.round(lifetimeMinutesOpt))
      : logTotalMinutes;

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
      logTotalMinutes: logTotalMinutes,
      maxSessionMinutes: maxSessionMinutes,
      bestStreakDays: bestStreakDays,
      sessionCount: sessionCount
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

  function computeAtelierSnapshot(logs, atelierState, lifetimeMinutesOpt) {
    const state = sanitizeAtelierState(atelierState);
    const devMode = Boolean(state.devMode);
    const metrics = computeStudyMetrics(logs, lifetimeMinutesOpt);

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

    const finishesStatus = [];
    const resolvedFinish = 'steel';

    const allNineBeforeAlgebraComplete = BUILD_ORDER.every(function (cid) {
      if (cid === 'cal-a') return true;
      return Boolean(projects[cid] && projects[cid].isComplete);
    });

    const calibersStatus = CALIBERS.map(function (c) {
      const proj = projects[c.id] || null;
      const completed = Boolean(proj && proj.isComplete);
      let unlocked = false;
      if (c.requiresAllOthers) {
        unlocked = Boolean(devMode || (allNineBeforeAlgebraComplete && completed));
      } else {
        unlocked = Boolean(c.starter || (c.playable && (completed || devMode)));
      }
      const buildPct = proj ? proj.overallPct : (c.starter ? 100 : 0);
      const resolvedSubtitle = (!unlocked && c.lockedSubtitle) ? c.lockedSubtitle : c.subtitle;
      return {
        id: c.id,
        num: c.num,
        letter: c.letter,
        name: c.name,
        korean: c.korean,
        engine: c.engine,
        subtitle: resolvedSubtitle,
        unlockedSubtitle: c.subtitle,
        lockedSubtitle: c.lockedSubtitle || '',
        startMinutes: c.startMinutes,
        totalMinutes: c.totalMinutes,
        playable: c.playable,
        inDesign: Boolean(c.inDesign),
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
      : 'cal-b';

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

  function assembleNextPart(logs, atelierState, lifetimeMinutesOpt) {
    const state = sanitizeAtelierState(atelierState);
    const snap = computeAtelierSnapshot(logs, state, lifetimeMinutesOpt);
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

    const nextMap = {};
    for (let i = 0; i < BUILD_ORDER.length; i++) {
      const cid = BUILD_ORDER[i];
      nextMap[cid] = (state.assembledParts[cid] || []).slice();
    }
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

    function layerClass(id, fallbackIndex) {
      let st = byId[id];
      if (!st && typeof fallbackIndex === 'number' && snapshot.parts[fallbackIndex]) {
        st = snapshot.parts[fallbackIndex].status;
      }
      return 'bp-layer is-' + (st || 'locked');
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

    if (projectId === 'cal-a') {
      // A · ALGEBRA (Lange 1 Moon Phase Golden-Ratio Asymmetric CAD Blueprint)
      const g01 = createSvgEl('g', { class: layerClass('alg_plate') });
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '51', class: 'bp-steel-fill' }));
      svg.appendChild(g01);

      const g02 = createSvgEl('g', { class: layerClass('alg_barrel') });
      g02.appendChild(createSvgEl('path', { d: describeBpArc(130, 77, 45, 58, 118), fill: 'none', class: 'bp-turret-rim' }));
      g02.appendChild(createSvgEl('line', { x1: '147', y1: '80', x2: '170', y2: '72', class: 'bp-spring-line' }));
      g02.appendChild(createSvgEl('circle', { cx: '147', cy: '80', r: '2.4', class: 'bp-ruby-dot' }));
      svg.appendChild(g02);

      const g03 = createSvgEl('g', { class: layerClass('alg_date') });
      g03.appendChild(createSvgEl('rect', { x: '138', y: '50', width: '22', height: '14', rx: '1.2', class: 'bp-disk-fill' }));
      g03.appendChild(createSvgEl('line', { x1: '149', y1: '50', x2: '149', y2: '64', class: 'bp-inner-line' }));
      const dtTxt = createSvgEl('text', { x: '149', y: '60', 'text-anchor': 'middle', class: 'bp-num-txt' });
      dtTxt.textContent = '25';
      g03.appendChild(dtTxt);
      svg.appendChild(g03);

      const g04 = createSvgEl('g', { class: layerClass('alg_dial') });
      g04.appendChild(createSvgEl('circle', { cx: '110', cy: '78', r: '27', class: 'bp-turret-rim' }));
      g04.appendChild(createSvgEl('circle', { cx: '110', cy: '78', r: '16', class: 'bp-inner-line', fill: 'none' }));
      g04.appendChild(createSvgEl('line', { x1: '110', y1: '78', x2: '94', y2: '62', class: 'bp-spring-line' }));
      g04.appendChild(createSvgEl('line', { x1: '110', y1: '78', x2: '124', y2: '69', class: 'bp-inner-line' }));
      svg.appendChild(g04);

      const g05 = createSvgEl('g', { class: layerClass('alg_moon') });
      g05.appendChild(createSvgEl('circle', { cx: '148', cy: '99', r: '14.5', class: 'bp-turret-rim' }));
      g05.appendChild(createSvgEl('path', { d: 'M 136,99 A 12,12 0 0,1 160,99 Z', class: 'bp-brass-fill' }));
      g05.appendChild(createSvgEl('circle', { cx: '148', cy: '99', r: '2.0', class: 'bp-ruby-dot' }));
      svg.appendChild(g05);

      const g06 = createSvgEl('g', { class: layerClass('alg_case') });
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '56', class: 'bp-case-ring' }));
      g06.appendChild(createSvgEl('rect', { x: '186', y: '69', width: '7', height: '16', rx: '1.5', class: 'bp-steel-fill' }));
      g06.appendChild(createSvgEl('rect', { x: '77', y: '41', width: '5', height: '13', rx: '1', transform: 'rotate(-60 80 47)', class: 'bp-steel-fill' }));
      svg.appendChild(g06);

      notes = [
        { x: 16, y: 34, label: '01 3/4 PLATE', id: 'alg_plate' },
        { x: 16, y: 74, label: '04 OFF-CENTER', id: 'alg_dial' },
        { x: 16, y: 118, label: '06 PLATINUM', id: 'alg_case' },
        { x: 244, y: 34, label: '03 BIG DATE', id: 'alg_date', right: true },
        { x: 244, y: 74, label: '02 AUF / AB', id: 'alg_barrel', right: true },
        { x: 244, y: 118, label: '05 MOONPHASE', id: 'alg_moon', right: true }
      ];
    } else if (projectId === 'cal-c') {
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
      const g01 = createSvgEl('g', { class: layerClass('mainplate', 0), 'data-part': 'mainplate' });
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '52', class: 'bp-steel-fill' }));
      g01.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '46', class: 'bp-inner-line' }));
      svg.appendChild(g01);

      const g02 = createSvgEl('g', { class: layerClass('barrel', 1), 'data-part': 'barrel' });
      g02.appendChild(createSvgEl('circle', { cx: '107', cy: '63', r: '18', class: 'bp-brass-fill' }));
      g02.appendChild(createSvgEl('path', {
        d: 'M 107,63 m -2,0 a 2,2 0 1,1 4,0 a 5,5 0 1,1 -10,0 a 9,9 0 1,1 18,0 a 13,13 0 1,1 -25,2',
        fill: 'none', class: 'bp-spring-line'
      }));
      svg.appendChild(g02);

      const g03 = createSvgEl('g', { class: layerClass('geartrain', 2), 'data-part': 'geartrain' });
      g03.appendChild(createSvgEl('circle', { cx: '143', cy: '73', r: '15', class: 'bp-brass-fill' }));
      g03.appendChild(createSvgEl('circle', { cx: '143', cy: '73', r: '5', class: 'bp-inner-line' }));
      g03.appendChild(createSvgEl('circle', { cx: '126', cy: '94', r: '11', class: 'bp-brass-fill' }));
      g03.appendChild(createSvgEl('circle', { cx: '126', cy: '94', r: '3.5', class: 'bp-inner-line' }));
      svg.appendChild(g03);

      const g04 = createSvgEl('g', { class: layerClass('escapement', 3), 'data-part': 'escapement' });
      g04.appendChild(createSvgEl('circle', { cx: '153', cy: '98', r: '13', class: 'bp-balance-ring' }));
      g04.appendChild(createSvgEl('line', { x1: '141', y1: '98', x2: '165', y2: '98', class: 'bp-inner-line' }));
      g04.appendChild(createSvgEl('line', { x1: '153', y1: '86', x2: '153', y2: '110', class: 'bp-inner-line' }));
      g04.appendChild(createSvgEl('circle', { cx: '153', cy: '98', r: '2.6', class: 'bp-ruby-dot' }));
      svg.appendChild(g04);

      const g05 = createSvgEl('g', { class: layerClass('jumpcam', 4), 'data-part': 'jumpcam' });
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

      const g06 = createSvgEl('g', { class: layerClass('turretcase', 5), 'data-part': 'turretcase' });
      g06.appendChild(createSvgEl('circle', { cx: '130', cy: '77', r: '57', class: 'bp-case-ring' }));
      g06.appendChild(createSvgEl('circle', { cx: '112', cy: '57', r: '16.5', class: 'bp-turret-rim' }));
      g06.appendChild(createSvgEl('circle', { cx: '112', cy: '101', r: '12.5', class: 'bp-turret-rim' }));
      g06.appendChild(createSvgEl('rect', { x: '185', y: '92', width: '9', height: '14', rx: '2', transform: 'rotate(24 189 99)', class: 'bp-steel-fill' }));
      svg.appendChild(g06);

      const p0 = snapshot.parts[0] ? snapshot.parts[0].id : 'mainplate';
      const p1 = snapshot.parts[1] ? snapshot.parts[1].id : 'barrel';
      const p2 = snapshot.parts[2] ? snapshot.parts[2].id : 'geartrain';
      const p3 = snapshot.parts[3] ? snapshot.parts[3].id : 'escapement';
      const p4 = snapshot.parts[4] ? snapshot.parts[4].id : 'jumpcam';
      const p5 = snapshot.parts[5] ? snapshot.parts[5].id : 'turretcase';
      notes = [
        { x: 16, y: 34, label: '01 BASE', id: p0 },
        { x: 16, y: 74, label: '02 CORE', id: p1 },
        { x: 16, y: 118, label: '05 MODULE', id: p4 },
        { x: 244, y: 34, label: '03 TRAIN', id: p2, right: true },
        { x: 244, y: 74, label: '04 ESCAPE', id: p3, right: true },
        { x: 244, y: 118, label: '06 CASE', id: p5, right: true }
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
    createEmptyAssembledParts: createEmptyAssembledParts,
    createDefaultAtelierState: createDefaultAtelierState,
    sanitizeAtelierState: sanitizeAtelierState,
    computeStudyMetrics: computeStudyMetrics,
    computeAtelierSnapshot: computeAtelierSnapshot,
    assembleNextPart: assembleNextPart,
    formatMinutesShortKo: formatMinutesShortKo,
    renderBlueprintSvg: renderBlueprintSvg
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.CasperAtelier;
  }
})(typeof window !== 'undefined' ? window : globalThis);
