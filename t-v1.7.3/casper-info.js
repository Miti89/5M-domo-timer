/**
 * CASPER — Service record (version history) + quiet legal footer (casper-info.js)
 * Adds a one-line footer at the bottom of the back control deck and small notice sheets.
 */
(function (global) {
  'use strict';
  var HOLDER = 'Wadakiz!';
  var YEAR = '2026';
  var CHANGELOG = [
    { version: '1.7.3', date: '2026-11-26', title: '큰 화면과 서비스 기록',
      notes: ['세로로 긴 화면과 태블릿에서 시계가 남는 공간을 채우도록 커집니다. 스탠바이 모드도 시계가 가운데에 크게 보입니다.', '설정 화면 맨 아래에 버전 기록과 고지를 작은 한 줄로 넣었습니다.', '시간 옆 빠른 설정 버튼을 차분한 모양으로 바꾸고, 버튼을 누를 때 뜨던 파란 배경을 없앴습니다.', '스탠바이를 켜고 끌 때 오른쪽 위 무음·스탠바이 버튼이 움직이던 문제를 고쳤습니다.', '태블릿 스탠바이에서 가로·세로를 돌려도 시계 크기가 같고, 가로 화면에서는 시간이 시계 옆에 놓입니다.', '스탠바이에서 위쪽 음악 버튼과 겹치던 아래쪽 "YouTube Music 열기" 버튼을 없앴습니다. 음악 창을 열어도 시계와 시간이 가려지지 않습니다.', '스탠바이를 켜고 끌 때 시계와 시간이 툭 튀지 않고 부드럽게 제자리로 옮겨 갑니다.', '타이머를 시작하면 집중 화면(스탠바이 화면)으로 바로 바뀝니다. 웹에서는 전체 화면으로 바꾸지 않습니다.', '시계 아래 안내를 "옵시디언 기판 획득까지 5분"처럼 다음 부품 이름과 남은 시간으로 바꿨습니다.', '안드로이드 앱(APK)으로도 설치할 수 있습니다.'] },
    { version: '1.7.2', date: '2026-11-25', title: '첫 실행 안정화',
      notes: ['처음 열 때 화면이 저절로 새로고침되던 문제를 고쳤습니다.', '온보딩은 버튼을 눌렀을 때만 본 것으로 기록합니다.'] },
    { version: '1.7.1', date: '2026-11-25', title: '업데이트와 표시 정리',
      notes: ['새 버전이 적용되지 않던 캐시 문제를 고치고 "새 버전이 준비됐어요" 안내를 넣었습니다.', '프롤로그 다시 읽기, 설계 중인 시계 표시, 예시 응원 표시를 손봤습니다.'] },
    { version: '1.7.0', date: '2026-11-25', title: '100시간의 공방',
      notes: ['중단해도 집중한 시간이 사라지지 않고 보관됩니다.', '시계 10개를 100시간에 걸쳐 조립하는 구조로 바뀌었습니다.', '온보딩, 프롤로그, 부품마다의 서사, 에필로그가 생겼습니다.', '설치 아이콘, 오프라인 실행, 완료 알림, 완주자의 한 줄 응원을 더했습니다.'] },
    { version: '1.6 이전', date: '', title: '첫 공방',
      notes: ['기계식 시계 타이머의 시작. 뽀모도로, 카운트다운, 데스크 시계와 첫 시계들.'] }
  ];
  var PAGES = {
    terms: ['약관', [
      ['저작권', 'CASPER의 디자인, 시계 그래픽, 서사 문구와 코드는 ' + HOLDER + '에게 저작권이 있습니다. 허락 없이 복제하거나 배포할 수 없습니다.'],
      ['보증의 한계', 'CASPER는 있는 그대로 제공됩니다. 알림이 늦거나 기록이 사라져 생긴 손해에 대해서는 책임지지 않습니다.'],
      ['외부 서비스', '음악 기능은 YouTube 플레이어를 쓰며, 재생할 때 YouTube(Google)의 약관과 개인정보처리방침이 적용됩니다. YouTube와 Google은 Google LLC의 상표입니다.']
    ]],
    privacy: ['개인정보', [
      ['기록은 이 기기에만 보관됩니다', '공부 기록과 설정은 이 기기 안에만 저장되고 개발자에게 전송되지 않습니다. 앱을 지우거나 데이터를 삭제하면 사라질 수 있으니 "백업 내보내기"로 보관하세요.'],
      ['한 줄 응원', '응원 제출은 Google 설문지로 연결되며, 제출한 문장은 검토 후 다른 사용자에게 익명으로 보일 수 있습니다.']
    ]],
    medical: ['의료 고지', [
      ['의료기기가 아닙니다', 'CASPER는 집중을 돕는 타이머입니다. ADHD를 비롯한 어떤 질환의 진단, 치료, 예방을 위한 의료기기나 의료 서비스가 아닙니다. 치료가 필요하면 전문의와 상담하세요.']
    ]]
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function stamp(label, old) {
    return '<div class="cx-stamp' + (old ? ' is-old' : '') + '" aria-hidden="true"><b>SERVICED</b><span>' + esc(label) + '</span></div>';
  }

  var overlay, lastFocus;
  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.innerHTML = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  function open(html, label) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'cx-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || (e.target.closest && e.target.closest('.cx-close'))) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay && !overlay.hidden) { e.stopPropagation(); close(); }
      }, true);
      document.body.appendChild(overlay);
    }
    lastFocus = document.activeElement;
    overlay.setAttribute('aria-label', label);
    overlay.innerHTML = html;
    overlay.hidden = false;
  }
  function sheet(title, eyebrow, body) {
    return '<div class="cx-sheet cx-record"><button type="button" class="cx-close" aria-label="닫기">✕</button>' +
      '<div class="cx-title">' + esc(eyebrow) + '</div><h3 class="cx-h">' + esc(title) + '</h3>' + body + '</div>';
  }

  function openRecord() {
    var rows = CHANGELOG.map(function (c, i) {
      var tag = c.version + (c.build ? ' · ' + c.build : '');
      return '<div class="cx-entry' + (i ? ' is-old' : '') + '"><div>' +
        '<div class="cx-entry-meta"><strong>v' + esc(tag) + '</strong>' + esc(c.date) + '</div>' +
        '<div class="cx-entry-title">' + esc(c.title) + '</div>' +
        '<ul>' + c.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
        '</div>' + stamp(c.version.replace(' 이전', '↓'), i > 0) + '</div>';
    }).join('');
    open(sheet('서비스 기록', 'Service Record · CASPER', rows), '서비스 기록');
  }

  function openPage(key) {
    var pg = PAGES[key];
    if (!pg) return;
    var body = pg[1].map(function (c) {
      return '<div class="cx-entry is-plain"><div><div class="cx-entry-title">' + esc(c[0]) + '</div><p class="cx-p">' + esc(c[1]) + '</p></div></div>';
    }).join('') + '<p class="cx-fine">© ' + YEAR + ' ' + esc(HOLDER) + '. All rights reserved.</p>';
    open(sheet(pg[0], 'CASPER · Notice', body), pg[0]);
  }

  function mount() {
    var host = document.querySelector('.back-deck-scroll');
    if (!host || host.querySelector('.cx-footer')) return;
    var f = document.createElement('footer');
    f.className = 'cx-footer';
    f.innerHTML =
      '<button type="button" data-cx="record">v' + esc(global.CASPER_VERSION || CHANGELOG[0].version) + '</button><i>·</i>' +
      '<button type="button" data-cx="terms">약관</button><i>·</i>' +
      '<button type="button" data-cx="privacy">개인정보</button><i>·</i>' +
      '<button type="button" data-cx="medical">의료 고지</button><i>·</i>' +
      '<span>© ' + YEAR + ' ' + esc(HOLDER) + '</span>';
    host.appendChild(f);
  }

  var api = { CHANGELOG: CHANGELOG, PAGES: PAGES, HOLDER: HOLDER, YEAR: YEAR };
  global.CasperInfo = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-cx]') : null;
    if (!t) return;
    ev.preventDefault();
    ev.stopPropagation();
    var k = t.getAttribute('data-cx');
    if (k === 'record') openRecord(); else openPage(k);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})(typeof window !== 'undefined' ? window : globalThis);
