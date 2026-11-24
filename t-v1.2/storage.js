/**
 * NO.5 CHRONO — Local Study Archive & Preferences Storage (storage.js)
 * Persists study sessions, subjects, theme, and JSON backup/restore.
 */
(function (global) {
  'use strict';

  const LOGS_KEY = 'no5_chrono_logs_v1';
  const PREFS_KEY = 'no5_chrono_prefs_v1';

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
    musicAutoSync: true,
    musicVolume: 75,
    musicBookmarks: []
  };

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
      const raw = localStorage.getItem(PREFS_KEY);
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
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  function loadLogs() {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveLogs(logs) {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 1000)));
    } catch (e) {}
  }

  function addLog(entry) {
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
    return clean;
  }

  function deleteLog(logId) {
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
      const mins = Number(item.minutes) || 0;
      const dk = item.dateKey || getLocalDateKey(item.endedAt);
      byDay[dk] = (byDay[dk] || 0) + mins;
      if (dk === todayKey) {
        todayMinutes += mins;
        todaySessions += 1;
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

  function exportBackupJson() {
    return JSON.stringify({
      app: 'NO.5 CHRONO',
      schema: 1,
      exportedAt: new Date().toISOString(),
      prefs: loadPrefs(),
      logs: loadLogs()
    }, null, 2);
  }

  function importBackupJson(rawText) {
    const parsed = JSON.parse(rawText);
    if (!parsed || !Array.isArray(parsed.logs)) {
      throw new Error('올바른 NO.5 CHRONO 백업 파일이 아닙니다.');
    }
    const existing = loadLogs();
    const seen = new Set(existing.map(l => l.id));
    const merged = existing.slice();
    let added = 0;
    parsed.logs.forEach(item => {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        merged.push({
          id: String(item.id),
          subject: String(item.subject || '전공').slice(0, 24),
          mode: String(item.mode || 'pomodoro'),
          minutes: Math.max(1, Math.round(Number(item.minutes) || 1)),
          memo: String(item.memo || '').slice(0, 140),
          endedAt: Number(item.endedAt) || Date.now(),
          dateKey: String(item.dateKey || getLocalDateKey(item.endedAt))
        });
        added++;
      }
    });
    merged.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
    saveLogs(merged);
    return { total: merged.length, added };
  }

  global.ChronoStorage = {
    loadPrefs,
    savePrefs,
    loadLogs,
    addLog,
    deleteLog,
    updateLogMemo,
    clearAllLogs,
    getStatsSummary,
    exportBackupJson,
    importBackupJson
  };
})(typeof window !== 'undefined' ? window : globalThis);
