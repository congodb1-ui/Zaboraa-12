import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), '.data');
const CONTENT_FILE = path.join(DATA_DIR, 'site_content.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStoredContent() {
  try {
    ensureDataDir();
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored site content:', e);
  }
  return {};
}

function writeStoredContent(content) {
  try {
    ensureDataDir();
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing stored site content:', e);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const sectionKey = req.query.sectionKey;
    const content = readStoredContent();

    if (sectionKey) {
      return res.status(200).json({
        success: true,
        content: content[sectionKey] ? { [sectionKey]: content[sectionKey] } : {}
      });
    }

    return res.status(200).json({ success: true, content });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid JSON body' });
      }
    }

    const current = readStoredContent();

    if (body.sectionKey && body.contentJson !== undefined) {
      current[body.sectionKey] = body.contentJson;
    } else if (body.siteContent && typeof body.siteContent === 'object') {
      Object.assign(current, body.siteContent);
    } else if (typeof body === 'object') {
      Object.assign(current, body);
    }

    const saved = writeStoredContent(current);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to write site content to disk' });
    }

    return res.status(200).json({ success: true, persisted: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
