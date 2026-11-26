/**
 * CASPER — Local Study Archive & Preferences Storage (storage.js)
 * Persists study sessions, lifetimeMinutes, active session, resume vault,
 * subjects, atelier state, safety prompts, and JSON backup/restore.
 */
(function (global) {
  'use strict';

  const LOGS_KEY = 'no5_chrono_logs_v1';
  const PREFS_KEY = 'no5_chrono_prefs_v1';
  const ATELIER_KEY = 'no1_pro_atelier_v1';
  const DEV_DEFAULT_FLAG_KEY = 'no1_pro_devdefault_v1';
  const DEFAULT_NO2_FLAG_KEY = 'no1_pro_default_no2_v585';

  // Phase 1 (v1.7) non-punitive persistence keys (existing keys preserved untouched)
  const LIFETIME_KEY = 'no1_pro_lifetime_v1';
  const ACTIVE_SESSION_KEY = 'no1_pro_active_session_v1';
  const RESUME_VAULT_KEY = 'no1_pro_resume_vault_v1';
  const SAFETY_META_KEY = 'no1_pro_safety_v1';
  // Phase 3 (v1.7) onboarding, narrative & one-time hints persistence key
  const NARRATIVE_META_KEY = 'no1_pro_narrative_v1';

  const MAX_INDIVIDUAL_LOGS = 900;
  const LOG_COMPACT_THRESHOLD = 1000;
  const RESUME_WINDOW_MS = 30 * 60 * 1000;

  const DEFAULT_SUBJECTS = ['전공', '어학', '코딩', '독서', '자격증'];
  const DEFAULT_PREFS = {
    theme: 'steel',          // Brushed Steel single design
    selectedSubject: '전공',
    subjects: DEFAULT_SUBJECTS.slice(),
    mannerMode: false,
    alarmType: 'gong',
    hourlyChime: false,
    focusMinutes: 25,
    breakMinutes: 5,
    countdownMinutes: 25,
    cheersEnabled: true,
    musicAutoSync: true,
    musicVolume: 75,
    musicBookmarks: []
  };

  function getStore() {
    return global.localStorage;
  }

  function getLocalDateKey(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function sanitizeBookmarks(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter(b => b && typeof b.url === 'string' && b.url.trim())
      .slice(0, 16)
      .map((b, idx) => ({
        id: String(b.id || ('bm-' + idx)),
        title: String(b.title || '내 플레이리스트').trim().slice(0, 28),
        url: String(b.url).trim().slice(0, 300)
      }));
  }

  function loadPrefs() {
    try {
      const store = getStore();
      const raw = store ? store.getItem(PREFS_KEY) : null;
      if (!raw) return Object.assign({}, DEFAULT_PREFS, { subjects: DEFAULT_SUBJECTS.slice(), musicBookmarks: [] });
      const parsed = JSON.parse(raw);
      const subjects = Array.isArray(parsed.subjects) && parsed.subjects.length > 0
        ? parsed.subjects.slice(0, 12).map(s => String(s).trim()).filter(Boolean)
        : DEFAULT_SUBJECTS.slice();
      const musicBookmarks = sanitizeBookmarks(parsed.musicBookmarks);
      return Object.assign({}, DEFAULT_PREFS, parsed, { theme: 'steel', subjects, musicBookmarks });
    } catch (e) {
      return Object.assign({}, DEFAULT_PREFS, { subjects: DEFAULT_SUBJECTS.slice(), musicBookmarks: [] });
    }
  }

  function savePrefs(prefs) {
    try {
      const store = getStore();
      if (store) store.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  function loadLogs() {
    try {
      const store = getStore();
      const raw = store ? store.getItem(LOGS_KEY) : null;
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function sumLogMinutes(logs) {
    const arr = Array.isArray(logs) ? logs : [];
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i]) continue;
      total += Math.max(0, Math.round(Number(arr[i].minutes) || 0));
    }
    return total;
  }

  /**
   * Compacts older logs beyond LOG_COMPACT_THRESHOLD into daily summary entries
   * so historical stats remain intact and no minutes are ever dropped.
   */
  function compactLogsIfNeeded(logs) {
    const arr = Array.isArray(logs) ? logs.slice() : [];
    if (arr.length <= LOG_COMPACT_THRESHOLD) {
      return arr;
    }

    // Separate recent individual entries to keep vs older entries (plus existing summaries) to fold by dateKey
    const recentIndividual = [];
    const toCompact = [];

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item) continue;
      if (!item.isSummary && recentIndividual.length < MAX_INDIVIDUAL_LOGS) {
        recentIndividual.push(item);
      } else {
        toCompact.push(item);
      }
    }

    const byDate = {};
    for (let i = 0; i < toCompact.length; i++) {
      const item = toCompact[i];
      const dk = String(item.dateKey || getLocalDateKey(item.endedAt));
      const mins = Math.max(0, Math.round(Number(item.minutes) || 0));
      const cnt = item.isSummary ? Math.max(1, Math.round(Number(item.sessionCount) || 1)) : 1;
      const endedAt = Number(item.endedAt) || 0;
      if (!byDate[dk]) {
        byDate[dk] = {
          id: `summary-${dk}`,
          subject: '일일 요약',
          mode: 'summary',
          minutes: mins,
          sessionCount: cnt,
          memo: '',
          endedAt: endedAt,
          dateKey: dk,
          isSummary: true
        };
      } else {
        byDate[dk].minutes += mins;
        byDate[dk].sessionCount += cnt;
        if (endedAt > byDate[dk].endedAt) {
          byDate[dk].endedAt = endedAt;
        }
      }
    }

    const summaries = Object.keys(byDate).map(function (dk) {
      const s = byDate[dk];
      s.memo = `${s.sessionCount}개 세션 일일 요약`;
      return s;
    }).sort(function (a, b) {
      return (b.endedAt || 0) - (a.endedAt || 0);
    });

    return recentIndividual.concat(summaries);
  }

  function saveLogs(logs) {
    try {
      const store = getStore();
      if (!store) return;
      const compacted = compactLogsIfNeeded(logs);
      store.setItem(LOGS_KEY, JSON.stringify(compacted));
    } catch (e) {}
  }

  /**
   * Non-decreasing lifetime cumulative minutes counter.
   * On first run, migrates cleanly from the sum of existing logs.
   */
  function getLifetimeMinutes() {
    try {
      const store = getStore();
      if (!store) return sumLogMinutes(loadLogs());
      const raw = store.getItem(LIFETIME_KEY);
      if (raw !== null && raw !== undefined && raw !== '') {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'number' && Number.isFinite(parsed)) {
          return Math.max(0, Math.round(parsed));
        }
        if (parsed && typeof parsed.minutes === 'number' && Number.isFinite(parsed.minutes)) {
          return Math.max(0, Math.round(parsed.minutes));
        }
      }
      // First-run migration from existing logs
      const initial = sumLogMinutes(loadLogs());
      store.setItem(LIFETIME_KEY, JSON.stringify({ minutes: initial, migratedAt: Date.now() }));
      return initial;
    } catch (e) {
      return sumLogMinutes(loadLogs());
    }
  }

  function setLifetimeMinutesMonotonic(nextMinutes) {
    const current = getLifetimeMinutes();
    const target = Math.max(current, Math.max(0, Math.round(Number(nextMinutes) || 0)));
    try {
      const store = getStore();
      if (store) {
        store.setItem(LIFETIME_KEY, JSON.stringify({ minutes: target, updatedAt: Date.now() }));
      }
    } catch (e) {}
    return target;
  }

  function incrementLifetimeMinutes(deltaMinutes) {
    const add = Math.max(0, Math.round(Number(deltaMinutes) || 0));
    const current = getLifetimeMinutes();
    if (add <= 0) return current;
    return setLifetimeMinutesMonotonic(current + add);
  }

  function addLog(entry) {
    // Ensure lifetimeMinutes is migrated from existing logs BEFORE adding the new log
    const currentLifetime = getLifetimeMinutes();
    const logs = loadLogs();
    const now = entry.endedAt || Date.now();
    const clean = {
      id: `log-${now}-${Math.random().toString(36).slice(2, 6)}`,
      subject: String(entry.subject || '전공').slice(0, 24),
      mode: String(entry.mode || 'pomodoro'),
      minutes: Math.max(1, Math.round(Number(entry.minutes) || 1)),
      memo: String(entry.memo || '').trim().slice(0, 140),
      endedAt: now,
      dateKey: getLocalDateKey(now)
    };
    logs.unshift(clean);
    saveLogs(logs);
    setLifetimeMinutesMonotonic(currentLifetime + clean.minutes);
    return clean;
  }

  function deleteLog(logId) {
    // Lock in migrated lifetimeMinutes first so deleting logs NEVER reduces progress
    getLifetimeMinutes();
    const logs = loadLogs().filter(l => l.id !== logId);
    saveLogs(logs);
    return logs;
  }

  function updateLogMemo(logId, memo) {
    const logs = loadLogs();
    const cleanMemo = String(memo || '').trim().slice(0, 140);
    for (let i = 0; i < logs.length; i++) {
      if (logs[i].id === logId) {
        logs[i].memo = cleanMemo;
        saveLogs(logs);
        return logs[i];
      }
    }
    return null;
  }

  function clearAllLogs() {
    // Lock in migrated lifetimeMinutes first so clearing logs NEVER reduces progress
    getLifetimeMinutes();
    saveLogs([]);
  }

  function getStatsSummary(logs) {
    const list = Array.isArray(logs) ? logs : loadLogs();
    const todayKey = getLocalDateKey(new Date());
    let todayMinutes = 0;
    let todaySessions = 0;
    const bySubject = {};
    const byDay = {};

    list.forEach(item => {
      if (!item) return;
      const mins = Number(item.minutes) || 0;
      const dk = item.dateKey || getLocalDateKey(item.endedAt);
      byDay[dk] = (byDay[dk] || 0) + mins;
      if (dk === todayKey) {
        todayMinutes += mins;
        todaySessions += item.isSummary ? Math.max(1, Number(item.sessionCount) || 1) : 1;
        const sub = item.subject || '기타';
        bySubject[sub] = (bySubject[sub] || 0) + mins;
      }
    });

    // Build last 7 days heatmap array (oldest -> today)
    const last7 = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(base.getTime() - offset * 86400000);
      const dk = getLocalDateKey(d);
      const mins = byDay[dk] || 0;
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      last7.push({
        dateKey: dk,
        label: dayNames[d.getDay()],
        minutes: mins,
        level: mins === 0 ? 0 : mins < 30 ? 1 : mins < 90 ? 2 : mins < 180 ? 3 : 4
      });
    }

    const subjectShares = Object.keys(bySubject)
      .map(name => ({
        name,
        minutes: bySubject[name],
        pct: todayMinutes > 0 ? Math.round((bySubject[name] / todayMinutes) * 100) : 0
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      todayKey,
      todayMinutes,
      todaySessions,
      subjectShares,
      last7
    };
  }

  function loadAtelier() {
    const defaultDevOn = Boolean(global.CasperAtelier && global.CasperAtelier.DEFAULT_DEV_MODE);
    try {
      const store = getStore();
      const raw = store ? store.getItem(ATELIER_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        let dirty = false;
        if (defaultDevOn && !store.getItem(DEV_DEFAULT_FLAG_KEY)) {
          parsed.devMode = true;
          store.setItem(DEV_DEFAULT_FLAG_KEY, '1');
          dirty = true;
        }
        if (!store.getItem(DEFAULT_NO2_FLAG_KEY)) {
          parsed.activeWatch = 'cal-b';
          store.setItem(DEFAULT_NO2_FLAG_KEY, '1');
          dirty = true;
        }
        const resolved = (global.CasperAtelier && typeof global.CasperAtelier.sanitizeAtelierState === 'function')
          ? global.CasperAtelier.sanitizeAtelierState(parsed)
          : parsed;
        if (dirty) {
          store.setItem(ATELIER_KEY, JSON.stringify(resolved));
        }
        return resolved;
      }
      if (store) {
        if (defaultDevOn) {
          store.setItem(DEV_DEFAULT_FLAG_KEY, '1');
        }
        store.setItem(DEFAULT_NO2_FLAG_KEY, '1');
      }
    } catch (e) {
      // ignore storage errors
    }
    if (global.CasperAtelier && typeof global.CasperAtelier.createDefaultAtelierState === 'function') {
      return global.CasperAtelier.createDefaultAtelierState();
    }
    const fallbackParts = {};
    ['cal-b', 'cal-d', 'cal-c', 'cal-e', 'cal-f', 'cal-g', 'cal-h', 'cal-i', 'cal-j', 'cal-a'].forEach(function (cid) {
      fallbackParts[cid] = [];
    });
    return { activeWatch: 'cal-b', activeFinish: 'steel', devMode: defaultDevOn, assembledParts: fallbackParts };
  }

  function saveAtelier(state) {
    const clean = (global.CasperAtelier && typeof global.CasperAtelier.sanitizeAtelierState === 'function')
      ? global.CasperAtelier.sanitizeAtelierState(state)
      : state;
    try {
      const store = getStore();
      if (store) store.setItem(ATELIER_KEY, JSON.stringify(clean));
    } catch (e) {
      // ignore quota errors
    }
    return clean;
  }

  // Phase 1-3: Active session persistence
  function saveActiveSession(snapshot) {
    try {
      const store = getStore();
      if (!store) return;
      if (!snapshot) {
        store.removeItem(ACTIVE_SESSION_KEY);
        return;
      }
      store.setItem(ACTIVE_SESSION_KEY, JSON.stringify(snapshot));
    } catch (e) {}
  }

  function loadActiveSession() {
    try {
      const store = getStore();
      const raw = store ? store.getItem(ACTIVE_SESSION_KEY) : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function clearActiveSession() {
    try {
      const store = getStore();
      if (store) store.removeItem(ACTIVE_SESSION_KEY);
    } catch (e) {}
  }

  // Phase 1-2: 30-minute resumable partial session vault
  function saveResumeVault(entry) {
    try {
      const store = getStore();
      if (!store) return;
      if (!entry) {
        store.removeItem(RESUME_VAULT_KEY);
        return;
      }
      const now = Number(entry.savedAtMs) || Date.now();
      const payload = Object.assign({}, entry, {
        savedAtMs: now,
        expiresAtMs: Number(entry.expiresAtMs) || (now + RESUME_WINDOW_MS)
      });
      store.setItem(RESUME_VAULT_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function loadResumeVault(nowMs) {
    try {
      const store = getStore();
      const raw = store ? store.getItem(RESUME_VAULT_KEY) : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const now = typeof nowMs === 'number' ? nowMs : Date.now();
      if (!parsed || typeof parsed !== 'object' || !parsed.expiresAtMs || now > parsed.expiresAtMs) {
        store.removeItem(RESUME_VAULT_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function clearResumeVault() {
    try {
      const store = getStore();
      if (store) store.removeItem(RESUME_VAULT_KEY);
    } catch (e) {}
  }

  // Phase 1-4: Storage safety & milestone prompt state
  function loadSafetyMeta() {
    const def = {
      storagePersistRequested: false,
      backupPromptedHours: [],
      iosInstallPrompted: false
    };
    try {
      const store = getStore();
      const raw = store ? store.getItem(SAFETY_META_KEY) : null;
      if (!raw) return def;
      const parsed = JSON.parse(raw);
      return {
        storagePersistRequested: Boolean(parsed.storagePersistRequested),
        backupPromptedHours: Array.isArray(parsed.backupPromptedHours) ? parsed.backupPromptedHours : [],
        iosInstallPrompted: Boolean(parsed.iosInstallPrompted)
      };
    } catch (e) {
      return def;
    }
  }

  function saveSafetyMeta(meta) {
    try {
      const store = getStore();
      if (store) store.setItem(SAFETY_META_KEY, JSON.stringify(meta));
    } catch (e) {}
  }

  // Phase 3: Onboarding, Prologue, Epilogue & One-Time Feature Hints (+ Cheers)
  function loadNarrativeMeta() {
    const def = {
      onboardingSeen: false,
      prologueSeen: false,
      epilogueSeen: false,
      hintsSeen: { deck: false, crown: false, screenOn: false },
      myCheer: '',
      cheerState: { lastShownDateKey: '', lastShownId: '', seenIds: [] }
    };
    try {
      const store = getStore();
      const raw = store ? store.getItem(NARRATIVE_META_KEY) : null;
      if (!raw) return def;
      const parsed = JSON.parse(raw);
      const rawHints = (parsed && parsed.hintsSeen && typeof parsed.hintsSeen === 'object') ? parsed.hintsSeen : {};
      const rawCheerState = (parsed && parsed.cheerState && typeof parsed.cheerState === 'object') ? parsed.cheerState : {};
      return {
        onboardingSeen: Boolean(parsed.onboardingSeen),
        prologueSeen: Boolean(parsed.prologueSeen),
        epilogueSeen: Boolean(parsed.epilogueSeen),
        hintsSeen: {
          deck: Boolean(rawHints.deck),
          crown: Boolean(rawHints.crown),
          screenOn: Boolean(rawHints.screenOn)
        },
        myCheer: typeof parsed.myCheer === 'string' ? parsed.myCheer.slice(0, 60) : '',
        cheerState: {
          lastShownDateKey: String(rawCheerState.lastShownDateKey || ''),
          lastShownId: String(rawCheerState.lastShownId || ''),
          seenIds: Array.isArray(rawCheerState.seenIds) ? rawCheerState.seenIds.map(String) : []
        }
      };
    } catch (e) {
      return def;
    }
  }

  function saveNarrativeMeta(meta) {
    try {
      const store = getStore();
      if (store) store.setItem(NARRATIVE_META_KEY, JSON.stringify(meta));
    } catch (e) {}
  }

  /**
   * Determines whether the current visitor is a brand-new user who should see onboarding:
   * - onboardingSeen flag is false
   * - no saved logs
   * - lifetimeMinutes is 0 (read-only check without mutating LIFETIME_KEY)
   * - no saved atelier state key (ATELIER_KEY)
   */
  function isNewUser() {
    const narrative = loadNarrativeMeta();
    if (narrative.onboardingSeen) return false;
    try {
      const store = getStore();
      if (!store) return false;
      const rawAtelier = store.getItem(ATELIER_KEY);
      if (rawAtelier !== null && rawAtelier !== undefined && rawAtelier !== '') {
        return false;
      }
      const logs = loadLogs();
      if (logs.length > 0) return false;
      const rawLifetime = store.getItem(LIFETIME_KEY);
      if (rawLifetime !== null && rawLifetime !== undefined && rawLifetime !== '') {
        const parsed = JSON.parse(rawLifetime);
        const mins = typeof parsed === 'number'
          ? parsed
          : (parsed && typeof parsed.minutes === 'number' ? parsed.minutes : 0);
        if (mins > 0) return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Dev-mode-only complete progress reset (the sole exception allowed to zero lifetimeMinutes).
   * Strictly refuses to run unless isDevMode === true.
   */
  function devResetAllProgress(isDevMode) {
    if (isDevMode !== true) return false;
    try {
      const store = getStore();
      if (!store) return false;
      store.setItem(LOGS_KEY, JSON.stringify([]));
      store.setItem(LIFETIME_KEY, JSON.stringify({ minutes: 0, updatedAt: Date.now(), devReset: true }));
      store.removeItem(ACTIVE_SESSION_KEY);
      store.removeItem(RESUME_VAULT_KEY);

      const curAtelier = loadAtelier();
      const emptyParts = {};
      const order = (global.CasperAtelier && Array.isArray(global.CasperAtelier.BUILD_ORDER))
        ? global.CasperAtelier.BUILD_ORDER
        : ['cal-b', 'cal-d', 'cal-c', 'cal-e', 'cal-f', 'cal-g', 'cal-h', 'cal-i', 'cal-j', 'cal-a'];
      order.forEach(function (cid) { emptyParts[cid] = []; });
      saveAtelier(Object.assign({}, curAtelier, {
        activeWatch: 'cal-b',
        devMode: true,
        assembledParts: emptyParts
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function mergeAssembledPartsNonDecreasing(currentAtelier, importedAtelier) {
    const cleanCur = (global.CasperAtelier && typeof global.CasperAtelier.sanitizeAtelierState === 'function')
      ? global.CasperAtelier.sanitizeAtelierState(currentAtelier)
      : (currentAtelier || {});
    const cleanImp = (global.CasperAtelier && typeof global.CasperAtelier.sanitizeAtelierState === 'function')
      ? global.CasperAtelier.sanitizeAtelierState(importedAtelier)
      : (importedAtelier || {});
    const cur = (cleanCur && cleanCur.assembledParts) || {};
    const imp = (cleanImp && cleanImp.assembledParts) || {};
    const order = (global.CasperAtelier && Array.isArray(global.CasperAtelier.BUILD_ORDER))
      ? global.CasperAtelier.BUILD_ORDER
      : ['cal-b', 'cal-d', 'cal-c', 'cal-e', 'cal-f', 'cal-g', 'cal-h', 'cal-i', 'cal-j', 'cal-a'];
    const merged = {};
    order.forEach(function (cid) {
      const a = Array.isArray(cur[cid]) ? cur[cid] : [];
      const b = Array.isArray(imp[cid]) ? imp[cid] : [];
      merged[cid] = b.length > a.length ? b.slice() : a.slice();
    });
    return Object.assign({}, cleanCur, cleanImp, { assembledParts: merged });
  }

  function exportBackupJson() {
    const narrative = loadNarrativeMeta();
    return JSON.stringify({
      app: 'CASPER',
      schema: 3,
      exportedAt: new Date().toISOString(),
      lifetimeMinutes: getLifetimeMinutes(),
      myCheer: narrative.myCheer || '',
      prefs: loadPrefs(),
      atelier: loadAtelier(),
      logs: loadLogs()
    }, null, 2);
  }

  function importBackupJson(rawText) {
    const parsed = JSON.parse(rawText);
    if (!parsed || !Array.isArray(parsed.logs)) {
      throw new Error('올바른 CASPER 백업 파일이 아닙니다.');
    }
    const existingLifetime = getLifetimeMinutes();
    const existing = loadLogs();
    const seen = new Set(existing.map(l => l.id));
    const merged = existing.slice();
    let added = 0;
    parsed.logs.forEach(item => {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        const cleanItem = {
          id: String(item.id),
          subject: String(item.subject || '전공').slice(0, 24),
          mode: String(item.mode || 'pomodoro'),
          minutes: Math.max(1, Math.round(Number(item.minutes) || 1)),
          memo: String(item.memo || '').slice(0, 140),
          endedAt: Number(item.endedAt) || Date.now(),
          dateKey: String(item.dateKey || getLocalDateKey(item.endedAt))
        };
        if (item.isSummary) {
          cleanItem.isSummary = true;
          cleanItem.sessionCount = Math.max(1, Math.round(Number(item.sessionCount) || 1));
        }
        merged.push(cleanItem);
        added++;
      }
    });
    merged.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
    saveLogs(merged);

    const importedLifetime = typeof parsed.lifetimeMinutes === 'number' && Number.isFinite(parsed.lifetimeMinutes)
      ? Math.max(0, Math.round(parsed.lifetimeMinutes))
      : 0;
    const mergedLogTotal = sumLogMinutes(merged);
    const nextLifetime = setLifetimeMinutesMonotonic(Math.max(existingLifetime, importedLifetime, mergedLogTotal));

    if (parsed.atelier && typeof parsed.atelier === 'object') {
      const curAtelier = loadAtelier();
      saveAtelier(mergeAssembledPartsNonDecreasing(curAtelier, parsed.atelier));
    }
    if (typeof parsed.myCheer === 'string' && parsed.myCheer.trim()) {
      const narrative = loadNarrativeMeta();
      if (!narrative.myCheer) {
        narrative.myCheer = parsed.myCheer.trim().slice(0, 60);
        saveNarrativeMeta(narrative);
      }
    }
    return { total: merged.length, added, lifetimeMinutes: nextLifetime };
  }

  global.ChronoStorage = {
    loadPrefs,
    savePrefs,
    loadAtelier,
    saveAtelier,
    loadLogs,
    saveLogs,
    addLog,
    deleteLog,
    updateLogMemo,
    clearAllLogs,
    getLifetimeMinutes,
    incrementLifetimeMinutes,
    setLifetimeMinutesMonotonic,
    compactLogsIfNeeded,
    saveActiveSession,
    loadActiveSession,
    clearActiveSession,
    saveResumeVault,
    loadResumeVault,
    clearResumeVault,
    loadSafetyMeta,
    saveSafetyMeta,
    loadNarrativeMeta,
    saveNarrativeMeta,
    isNewUser,
    devResetAllProgress,
    getStatsSummary,
    exportBackupJson,
    importBackupJson
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.ChronoStorage;
  }
})(typeof window !== 'undefined' ? window : globalThis);
