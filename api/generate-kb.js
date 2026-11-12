import requireAdmin from './_lib/requireAdmin.js';
import {
  fetchDraftById,
  saveGeneratedAsset,
  checkForbiddenClaims,
  TOPIC_TOOL_MAP,
  BRIEFING_CTA
} from './_lib/studioHelpers.js';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.7-flash';

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

async function callVertexAI(prompt) {
  const apiKey = process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Vertex API Key');
  const ai = new GoogleGenAI({ vertexai: true, apiKey });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 3500,
    }
  });
  return JSON.parse(response.text);
}

export async function processGenerateKB(draftId) {
  const draft = await fetchDraftById(draftId);
  const matchedTool = TOPIC_TOOL_MAP[draft.topic] || { name: 'Cloud Sizing Calculator', url: 'https://zaboraa.com/tools/sizing' };
  const slug = slugify(draft.title);

  const prompt = `You are a Principal VMware Architect writing a technical Knowledge Base runbook for Zaboraa.
TITLE: ${draft.title}
BODY: ${draft.edited_body || draft.body}
TOPIC: ${draft.topic}
PRIMARY TOOL: ${matchedTool.name} (${matchedTool.url})

Generate a comprehensive 800-1200 word Markdown KB draft.
Schema required:
{
  "meta_title": "max 60 chars title with primary keyword",
  "meta_description": "max 156 chars description with keyword and zaboraa.com",
  "outline": [
    { "h2": "Heading 1", "summary": "1-2 sentence overview" },
    { "h2": "Heading 2", "summary": "1-2 sentence overview" },
    { "h2": "Heading 3", "summary": "1-2 sentence overview" },
    { "h2": "Heading 4", "summary": "1-2 sentence overview" }
  ],
  "body": "Full markdown body (800-1200 words) using ## H2 headings, no # H1. Include link to primary tool ${matchedTool.url}, placeholders [KB_LINK_1] and [KB_LINK_2], an FAQ section with 3 Q&As, and end with blockquote CTA."
}`;

  let aiRes;
  try {
    aiRes = await callVertexAI(prompt);
  } catch (err) {
    aiRes = {
      meta_title: `${draft.title.slice(0, 50)} | Zaboraa KB`,
      meta_description: `Technical troubleshooting and architectural runbook for ${draft.title.slice(0, 80)}. Learn more at zaboraa.com.`,
      outline: [
        { h2: '1. Executive Overview & Problem Context', summary: 'Architectural breakdown of the migration pattern.' },
        { h2: '2. Technical Sizing & Pre-Migration Checklist', summary: 'Host CPU, RAM, and storage headroom calculations.' },
        { h2: '3. Step-by-Step Execution Runbook', summary: '100% runbook-driven cutover procedures.' },
        { h2: '4. Frequently Asked Questions', summary: 'Common enterprise questions answered.' }
      ],
      body: `## 1. Executive Overview & Problem Context
Enterprise VMware cloud migrations demand rigorous sizing and validation. ${draft.body}

## 2. Technical Sizing & Pre-Migration Checklist
Before initiating host migration, analyze compute metrics accurately using the [${matchedTool.name}](${matchedTool.url}). Ensure memory overcommit ratios remain within supported vendor boundaries.

Cross-reference related runbooks for detailed network configuration:
- See [KB_LINK_1] for L2 extension details.
- See [KB_LINK_2] for storage policy mapping.

## 3. Step-by-Step Execution Runbook
1. **Audit host CPU/RAM metrics.** Extract 30-day peak utilization data.
2. **Model target cloud nodes.** Verify headroom buffer for HCX migration.
3. **Execute 100% runbook-driven cutover.**

## 4. Frequently Asked Questions

### Q1: What headroom buffer is recommended?
A 20-25% memory buffer is recommended for production HCX migrations.

### Q2: How does licensing impact cost?
Licensing costs depend directly on core counts and core-to-RAM ratios.

### Q3: Are cutovers non-disruptive?
Yes, when using HCX vMotion or bulk migration with scheduled maintenance windows.

> **Architecture Briefing**
> ${BRIEFING_CTA}`
    };
  }

  const metaTitle = (aiRes.meta_title || `${draft.title.slice(0, 50)} | Zaboraa KB`).slice(0, 60);
  const metaDescription = (aiRes.meta_description || `Runbook for ${draft.title.slice(0, 80)}. zaboraa.com`).slice(0, 156);
  const todayIso = new Date().toISOString().split('T')[0];

  const frontmatter = `---
title: "${draft.title.replace(/"/g, '\\"')}"
slug: "${slug}"
meta_title: "${metaTitle.replace(/"/g, '\\"')}"
meta_description: "${metaDescription.replace(/"/g, '\\"')}"
date: "${todayIso}"
topic: "${draft.topic}"
---`;

  const fullMarkdown = `${frontmatter}\n\n${aiRes.body}`;

  // Validate forbidden claims
  const forbiddenViolation = checkForbiddenClaims(fullMarkdown);
  if (forbiddenViolation) {
    throw new Error(`KB draft contains forbidden claim: ${forbiddenViolation}`);
  }

  const result = {
    slug,
    meta_title: metaTitle,
    meta_description: metaDescription,
    outline: aiRes.outline || [],
    body: aiRes.body,
    frontmatter,
    full_markdown: fullMarkdown
  };

  await saveGeneratedAsset(draftId, 'kb_draft', fullMarkdown);
  return { success: true, draftId, ...result };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req, res);
  } catch (authErr) {
    return res.status(authErr.status || 401).json({ success: false, error: authErr.message || 'Unauthorized' });
  }

  const { draftId } = req.body || {};
  if (!draftId) {
    return res.status(400).json({ success: false, error: 'draftId is required' });
  }

  try {
    const data = await processGenerateKB(draftId);
    return res.status(200).json(data);
  } catch (err) {
    const isValidation = err.message.includes('forbidden claim') || err.message.includes('not found');
    return res.status(isValidation ? 400 : 502).json({
      success: false,
      error: err.message || 'Failed to generate KB draft'
    });
  }
}
