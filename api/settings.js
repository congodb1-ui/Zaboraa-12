import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'app_settings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStoredSettings() {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored settings:', e);
  }
  return {};
}

function writeStoredSettings(settings) {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing stored settings:', e);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const isPublic = req.query.forPublic === 'true';
    const settings = readStoredSettings();

    if (isPublic) {
      const sanitized = { ...settings };
      delete sanitized['ai_configuration'];
      if (sanitized['organization']) {
        const { executiveContact, ...safeOrg } = sanitized['organization'];
        sanitized['organization'] = safeOrg;
      }
      return res.status(200).json({ success: true, settings: sanitized });
    }

    return res.status(200).json({ success: true, settings });
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

    const current = readStoredSettings();

    // Check if body is a single setting or multiple settings
    if (body.key && body.value !== undefined) {
      current[body.key] = body.value;
    } else if (body.settings && typeof body.settings === 'object') {
      Object.assign(current, body.settings);
    } else if (typeof body === 'object') {
      Object.assign(current, body);
    }

    const saved = writeStoredSettings(current);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to write settings to disk' });
    }

    return res.status(200).json({ success: true, persisted: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
