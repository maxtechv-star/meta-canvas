// api/image.js
// Vercel serverless endpoint: /api/image
// Accepts query params: type (welcome|goodbye|burn|lick|demote), username, guild, memberCount, avatar, guildIcon, background, textMessage, domain (preferred) or url

const path = require('path');
const fs = require('fs');
const lib = require(path.join(process.cwd(), 'index.js'));
const Canvas = require('../utils/canvas'); // same canvas wrapper
let fetchFn = global.fetch;
if (!fetchFn) fetchFn = require('node-fetch');

function normalizeQueryValue(raw) {
  if (raw === undefined || raw === null) return undefined;
  // If array, take first element (common with repeated query param)
  if (Array.isArray(raw)) raw = raw[0];
  // If it's an object (e.g. a window object accidentally serialized), ignore it
  if (typeof raw === 'object') return undefined;
  let s = String(raw).trim();
  if (!s) return undefined;
  // catch obviously-bad values that come from misuse (e.g. "window" or "[object Window]")
  if (s.toLowerCase() === 'window') return undefined;
  if (s.toLowerCase().includes('[object')) return undefined;
  return s;
}

async function loadImageFromSource(src) {
  if (!src) throw new Error('Empty source');
  if (Buffer.isBuffer(src)) return await Canvas.loadImage(src);
  const s = src.toString();
  if (/^https?:\/\//i.test(s)) {
    const res = await fetchFn(s);
    if (!res.ok) throw new Error('Failed to fetch remote image: ' + res.status);
    const buf = await res.arrayBuffer();
    return await Canvas.loadImage(Buffer.from(buf));
  } else if (/^data:/i.test(s)) {
    return await Canvas.loadImage(s);
  } else {
    // treat as local path relative to project root
    const p = path.isAbsolute(s) ? s : path.join(process.cwd(), s);
    if (!fs.existsSync(p)) throw new Error('Local file not found: ' + p);
    return await Canvas.loadImage(p);
  }
}

module.exports = async (req, res) => {
  try {
    const q = req.method === 'GET' ? req.query || {} : req.body || {};
    const type = (normalizeQueryValue(q.type) || 'welcome').toLowerCase();

    const typeMap = {
      welcome: 'Welcome',
      goodbye: 'Goodbye',
      burn: 'Burnsp',
      lick: 'Lickanime',
      demote: 'Demote'
    };

    const className = typeMap[type] || 'Welcome';
    const ClassCtor = lib[className] || lib.Welcome;
    if (!ClassCtor) throw new Error(`No generator found for type="${type}"`);

    const inst = new ClassCtor();

    // Set simple fields (normalize values first)
    const username = normalizeQueryValue(q.username);
    const guild = normalizeQueryValue(q.guild);
    const memberCount = normalizeQueryValue(q.memberCount);
    const textMessage = normalizeQueryValue(q.textMessage);
    const background = normalizeQueryValue(q.background);

    if (username) inst.setUsername(username);
    if (guild) inst.setGuildName(guild);
    if (memberCount) inst.setMemberCount(memberCount);
    if (textMessage) inst.setText('message', textMessage);
    if (background) inst.setBackground(background);

    // Accept domain (preferred) or url (legacy). Normalize and sanitize.
    let domainValue = normalizeQueryValue(q.domain) || normalizeQueryValue(q.url);
    if (domainValue) {
      // shorten to safe length to avoid UI issues
      if (domainValue.length > 128) domainValue = domainValue.substring(0, 128) + '…';
      inst.setText('url', domainValue);
    }

    // Load avatar/guildIcon if provided, convert to Buffer when possible
    const avatarParam = normalizeQueryValue(q.avatar);
    if (avatarParam) {
      try {
        const avatarImg = await loadImageFromSource(avatarParam);
        const avatarBuf = avatarImg.toBuffer ? avatarImg.toBuffer() : null;
        if (avatarBuf) inst.setAvatar(avatarBuf);
        else inst.setAvatar(avatarParam);
      } catch (e) {
        // fall back to provided string (may be local path)
        inst.setAvatar(avatarParam);
      }
    }

    const guildIconParam = normalizeQueryValue(q.guildIcon);
    if (guildIconParam) {
      try {
        const gImg = await loadImageFromSource(guildIconParam);
        const gBuf = gImg.toBuffer ? gImg.toBuffer() : null;
        if (gBuf) inst.setGuildIcon(gBuf);
        else inst.setGuildIcon(guildIconParam);
      } catch (e) {
        inst.setGuildIcon(guildIconParam);
      }
    }

    // Colors (passthrough)
    const colorUsername = normalizeQueryValue(q.colorUsername);
    const colorMessage = normalizeQueryValue(q.colorMessage);
    const colorHashtag = normalizeQueryValue(q.colorHashtag);
    if (colorUsername) inst.setColor('Username', colorUsername);
    if (colorMessage) inst.setColor('Message', colorMessage);
    if (colorHashtag) inst.setColor('Hashtag', colorHashtag);

    // Generate canvas
    const canvas = await inst.toAttachment();

    // Convert canvas -> PNG buffer
    let buffer;
    try {
      buffer = canvas.toBuffer('image/png');
    } catch (e) {
      buffer = canvas.toBuffer();
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.statusCode = 200;
    res.end(buffer);
  } catch (err) {
    console.error('api/image error:', err && (err.stack || err.message || err));
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Unknown error' }));
  }
};