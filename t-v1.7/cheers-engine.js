/**
 * CASPER — Finisher One-Line Cheers Engine (cheers-engine.js)
 * Pure validation, external pre-filled form URL builder, and daily rotation rules.
 * Zero-Build, file:// safe, DOM-independent & unit-testable.
 */
(function (global) {
  'use strict';

  // Google Forms pre-filled link prefix (leave empty '' until form is created).
  // Example: 'https://docs.google.com/forms/d/e/<FORM_ID>/viewform?usp=pp_url&entry.<ENTRY_ID>='
  const CHEERS_SUBMIT_URL = '';

  const MAX_CHEER_LENGTH = 60;

  // Patterns blocked to protect user privacy and prevent spam/links
  const URL_PATTERN = /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|kr|co|io|me|gg|ly|app|dev|site|xyz|info|biz|tv|be)\b)/i;
  const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const PHONE_PATTERN = /(?:\+?\d{1,3}[\s.-]?)?(?:01[016789]|02|0[3-6]\d)[\s.-]?\d{3,4}[\s.-]?\d{4}|\b\d{9,12}\b/;

  /**
   * Finisher cheer composer is visible ONLY after NO.1 ALGEBRA is completed,
   * or when developer mode preview is active.
   */
  function canComposeCheer(atelierSnapshot, devMode) {
    if (devMode === true) return true;
    if (!atelierSnapshot || !atelierSnapshot.projects || !atelierSnapshot.projects['cal-a']) {
      return false;
    }
    return Boolean(atelierSnapshot.projects['cal-a'].isComplete);
  }

  /**
   * Validates a one-line cheer before local save or external form handoff.
   */
  function validateCheerText(raw) {
    const normalized = String(raw == null ? '' : raw).replace(/\r?\n/g, ' ').trim();
    if (!normalized) {
      return {
        ok: false,
        reason: 'empty',
        message: '이 부분은 빼고 남겨 주세요'
      };
    }
    if (normalized.length > MAX_CHEER_LENGTH) {
      return {
        ok: false,
        reason: 'length',
        message: `최대 ${MAX_CHEER_LENGTH}자까지 남길 수 있어요`
      };
    }
    if (URL_PATTERN.test(normalized) || EMAIL_PATTERN.test(normalized) || PHONE_PATTERN.test(normalized)) {
      return {
        ok: false,
        reason: 'restricted',
        message: '이 부분은 빼고 남겨 주세요'
      };
    }
    return {
      ok: true,
      text: normalized,
      reason: '',
      message: ''
    };
  }

  /**
   * Builds the external Google Forms pre-fill URL containing ONLY the encoded cheer text.
   * Returns null if submitUrl is empty or text fails validation.
   */
  function buildSubmitUrl(rawText, submitUrlOpt) {
    const base = String(submitUrlOpt !== undefined ? submitUrlOpt : CHEERS_SUBMIT_URL).trim();
    if (!base) return null;
    const check = validateCheerText(rawText);
    if (!check.ok) return null;
    return base + encodeURIComponent(check.text);
  }

  /**
   * Safely parses cheers.json payload into a clean array of { id, text, sample }.
   */
  function parseCheersPayload(payload) {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.messages)) {
      return [];
    }
    const out = [];
    const seen = new Set();
    for (let i = 0; i < payload.messages.length; i++) {
      const item = payload.messages[i];
      if (!item || typeof item !== 'object') continue;
      const id = String(item.id || '').trim();
      const text = String(item.text || '').replace(/\r?\n/g, ' ').trim();
      if (!id || !text || seen.has(id)) continue;
      seen.add(id);
      out.push({
        id: id,
        text: text,
        sample: Boolean(item.sample)
      });
    }
    return out;
  }

  /**
   * Returns the appropriate heading for a cheer message:
   * sample messages written by the workshop keeper vs real finisher messages.
   */
  function getCheerTitle(message) {
    return (message && message.sample) ? '공방지기의 한 줄' : '먼저 완주한 누군가의 한 줄';
  }

  /**
   * Picks at most one cheer per calendar day, without repeating until all messages have been seen.
   * Prioritizes real finisher messages (sample !== true); falls back to samples only when no real messages exist.
   */
  function pickDailyCheer(messages, cheerState, todayKey, enabled) {
    const cur = (cheerState && typeof cheerState === 'object')
      ? {
          lastShownDateKey: String(cheerState.lastShownDateKey || ''),
          lastShownId: String(cheerState.lastShownId || ''),
          seenIds: Array.isArray(cheerState.seenIds) ? cheerState.seenIds.slice() : []
        }
      : { lastShownDateKey: '', lastShownId: '', seenIds: [] };

    if (enabled === false) {
      return { message: null, title: '', nextState: cur };
    }
    const list = Array.isArray(messages) ? messages : [];
    if (list.length === 0) {
      return { message: null, title: '', nextState: cur };
    }
    const today = String(todayKey || '');
    if (today && cur.lastShownDateKey === today) {
      return { message: null, title: '', nextState: cur };
    }

    const realMessages = list.filter(function (m) { return m && !m.sample; });
    const pool = realMessages.length > 0 ? realMessages : list;

    const validIds = new Set(pool.map(function (m) { return m.id; }));
    let seenIds = cur.seenIds.filter(function (id) { return validIds.has(id); });
    let unseen = pool.filter(function (m) { return !seenIds.includes(m.id); });

    if (unseen.length === 0) {
      // Every message in the active pool has been shown once; start a fresh cycle
      seenIds = [];
      unseen = pool.length > 1
        ? pool.filter(function (m) { return m.id !== cur.lastShownId; })
        : pool.slice();
    }

    const picked = unseen[0] || pool[0];
    const nextSeen = seenIds.concat([picked.id]);

    return {
      message: picked,
      title: getCheerTitle(picked),
      nextState: {
        lastShownDateKey: today,
        lastShownId: picked.id,
        seenIds: nextSeen
      }
    };
  }

  /**
   * Checks whether the user is returning after at least `minDays` (default 2) since their last recorded session.
   */
  function isReturningAfterDays(logs, nowMs, minDays) {
    const arr = Array.isArray(logs) ? logs : [];
    if (arr.length === 0) return false;
    let latestMs = 0;
    for (let i = 0; i < arr.length; i++) {
      const ts = Number(arr[i] && arr[i].endedAt) || 0;
      if (ts > latestMs) latestMs = ts;
    }
    if (latestMs <= 0) return false;
    const now = typeof nowMs === 'number' ? nowMs : Date.now();
    const threshold = Math.max(1, Number(minDays) || 2) * 86400000;
    return (now - latestMs) >= threshold;
  }

  const CasperCheers = {
    CHEERS_SUBMIT_URL: CHEERS_SUBMIT_URL,
    MAX_CHEER_LENGTH: MAX_CHEER_LENGTH,
    canComposeCheer: canComposeCheer,
    validateCheerText: validateCheerText,
    buildSubmitUrl: buildSubmitUrl,
    parseCheersPayload: parseCheersPayload,
    getCheerTitle: getCheerTitle,
    pickDailyCheer: pickDailyCheer,
    isReturningAfterDays: isReturningAfterDays
  };

  global.CasperCheers = CasperCheers;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasperCheers;
  }
})(typeof window !== 'undefined' ? window : globalThis);
