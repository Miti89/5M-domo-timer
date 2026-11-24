/**
 * NO.5 CHRONO — YouTube Music & YouTube Mini-Player Module (music-player.js)
 * Zero-Build, DOM-independent URL parser + safe YouTube Embed & postMessage controller.
 * Supports music.youtube.com tracks/playlists, youtube.com, youtu.be, and popup fallback.
 */
(function (global) {
  'use strict';

  const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  const LIST_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

  const CURATED_PRESETS = [
    {
      id: 'preset-lofi',
      title: 'Lo-Fi Study Radio',
      url: 'https://music.youtube.com/watch?v=jfKfPfyJRdk',
      curated: true
    },
    {
      id: 'preset-classical',
      title: 'Classical Reading',
      url: 'https://music.youtube.com/watch?v=mIYzp5rcTvU',
      curated: true
    },
    {
      id: 'preset-synthwave',
      title: 'Synthwave Focus',
      url: 'https://music.youtube.com/watch?v=4xDzrJKXOOY',
      curated: true
    }
  ];

  function extractQueryParam(queryStr, key) {
    if (!queryStr) return null;
    const clean = queryStr.replace(/^\?/, '');
    const pairs = clean.split('&');
    for (let i = 0; i < pairs.length; i++) {
      const idx = pairs[i].indexOf('=');
      if (idx === -1) continue;
      const k = pairs[i].slice(0, idx);
      if (k === key) {
        try {
          return decodeURIComponent(pairs[i].slice(idx + 1));
        } catch (e) {
          return pairs[i].slice(idx + 1);
        }
      }
    }
    return null;
  }

  /**
   * Parses any YouTube Music / YouTube URL or raw 11-char Video ID safely.
   * Rejects non-YouTube domains and malformed IDs to guarantee zero XSS / URL injection.
   */
  function parseYouTubeUrl(rawInput) {
    const trimmed = String(rawInput || '').trim();
    if (!trimmed) return null;

    // Allow direct 11-char video ID
    if (VIDEO_ID_RE.test(trimmed)) {
      return { kind: 'video', videoId: trimmed, listId: null };
    }

    // Require http(s) or recognizable youtube host without protocol
    let candidate = trimmed;
    if (/^(music\.youtube\.com|www\.youtube\.com|m\.youtube\.com|youtube\.com|youtu\.be)\//i.test(candidate)) {
      candidate = 'https://' + candidate;
    }
    if (!/^https?:\/\//i.test(candidate)) {
      return null;
    }

    // Parse host, path, and query cleanly (works identically in browser & macOS jsc)
    const m = candidate.match(/^https?:\/\/([^/?#]+)([^?#]*)(\?[^#]*)?/i);
    if (!m) return null;
    const host = m[1].toLowerCase().replace(/:\d+$/, '');
    const path = m[2] || '';
    const query = m[3] || '';

    const allowedHosts = [
      'music.youtube.com',
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtube-nocookie.com'
    ];
    if (allowedHosts.indexOf(host) === -1) return null;

    let videoId = null;
    let listId = null;

    const qV = extractQueryParam(query, 'v');
    const qList = extractQueryParam(query, 'list');
    if (qV && VIDEO_ID_RE.test(qV)) videoId = qV;
    if (qList && LIST_ID_RE.test(qList)) listId = qList;

    if (host === 'youtu.be') {
      const seg = path.replace(/^\/+/, '').split('/')[0];
      if (seg && VIDEO_ID_RE.test(seg)) videoId = seg;
    } else if (!videoId) {
      const pathMatch = path.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:[/?]|$)/);
      if (pathMatch && VIDEO_ID_RE.test(pathMatch[1])) {
        videoId = pathMatch[1];
      }
    }

    if (!videoId && !listId) return null;

    // Treat auto-generated single-track radio lists (RDAMVM...) as single video embed for stability
    const embeddableList = listId && !/^RDAMVM/i.test(listId) ? listId : null;

    return {
      kind: videoId ? 'video' : 'playlist',
      videoId: videoId,
      listId: listId,
      embeddableList: embeddableList
    };
  }

  function buildEmbedUrl(parsed, options) {
    if (!parsed) return '';
    const opts = options || {};
    const params = [
      'enablejsapi=1',
      'rel=0',
      'modestbranding=1',
      'playsinline=1'
    ];
    if (opts.autoplay) params.push('autoplay=1');
    if (opts.origin && /^https?:\/\//i.test(opts.origin)) {
      params.push('origin=' + encodeURIComponent(opts.origin));
    }

    if (parsed.videoId) {
      if (parsed.embeddableList) {
        params.push('list=' + encodeURIComponent(parsed.embeddableList));
      }
      return 'https://www.youtube.com/embed/' + encodeURIComponent(parsed.videoId) + '?' + params.join('&');
    }

    if (parsed.listId) {
      params.push('list=' + encodeURIComponent(parsed.listId));
      return 'https://www.youtube.com/embed/videoseries?' + params.join('&');
    }
    return '';
  }

  function buildYouTubeMusicUrl(parsed) {
    if (!parsed) return 'https://music.youtube.com/';
    if (parsed.videoId && parsed.listId) {
      return 'https://music.youtube.com/watch?v=' + encodeURIComponent(parsed.videoId) + '&list=' + encodeURIComponent(parsed.listId);
    }
    if (parsed.videoId) {
      return 'https://music.youtube.com/watch?v=' + encodeURIComponent(parsed.videoId);
    }
    if (parsed.listId) {
      return 'https://music.youtube.com/playlist?list=' + encodeURIComponent(parsed.listId);
    }
    return 'https://music.youtube.com/';
  }

  function sendPlayerCommand(iframeEl, func, args) {
    if (!iframeEl || !iframeEl.contentWindow) return false;
    try {
      iframeEl.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: Array.isArray(args) ? args : []
      }), '*');
      return true;
    } catch (e) {
      return false;
    }
  }

  function openYouTubeMusicPopup(parsed) {
    const url = buildYouTubeMusicUrl(parsed);
    if (typeof global.open !== 'function') return false;
    const features = 'width=440,height=740,resizable=yes,scrollbars=yes';
    const win = global.open(url, 'no5_chrono_ytm', features);
    if (win && typeof win.focus === 'function') {
      try { win.focus(); } catch (e) {}
    }
    return Boolean(win);
  }

  const ChronoMusic = {
    version: '1.0.0',
    CURATED_PRESETS: CURATED_PRESETS,
    parseYouTubeUrl: parseYouTubeUrl,
    buildEmbedUrl: buildEmbedUrl,
    buildYouTubeMusicUrl: buildYouTubeMusicUrl,
    sendPlayerCommand: sendPlayerCommand,
    openYouTubeMusicPopup: openYouTubeMusicPopup
  };

  global.ChronoMusic = ChronoMusic;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChronoMusic;
  }
})(typeof window !== 'undefined' ? window : globalThis);
