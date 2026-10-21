import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const MODEL = 'gemini-3.1-flash-image';
const FALLBACK_URL =
  '/assets/images/cloud_3d_blueprint_enterprise_1792147431615.jpg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  // Server-side enforcement of Blueprint Access Mode ('everyone' | 'signed_in' | 'nobody')
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('mock-zaboraa')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      let accessMode = 'everyone';
      const { data: fcData } = await supabase
        .from('admin_feature_controls')
        .select('blueprint_access_mode')
        .eq('id', 'global_feature_controls')
        .maybeSingle();

      if (fcData?.blueprint_access_mode) {
        accessMode = fcData.blueprint_access_mode;
      } else {
        const { data: appData } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'feature_controls')
          .maybeSingle();
        if (appData?.value?.blueprintAccessMode) {
          accessMode = appData.value.blueprintAccessMode;
        }
      }

      if (accessMode === 'nobody') {
        return res.status(403).json({
          success: false,
          error: 'Blueprint generation has been administratively disabled (Access Mode: Nobody).',
          accessMode: 'nobody'
        });
      }

      if (accessMode === 'signed_in') {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : null;

        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Blueprint generation requires a signed-in user account. Please log in to continue.',
            accessMode: 'signed_in'
          });
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication failed or session expired. Please sign in again.',
            accessMode: 'signed_in'
          });
        }
      }
    } catch (e) {
      console.warn('Notice verifying blueprint access mode in handler:', e?.message || e);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Image generation is not configured.',
      fallbackUrl: FALLBACK_URL,
    });
  }

  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      apiKey,
    });

    const prompt = req.body?.prompt;

    if (
      prompt !== undefined &&
      (typeof prompt !== 'string' || prompt.length > 10000)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be a string of at most 10000 characters.',
      });
    }

    const targetPrompt =
      prompt?.trim() ||
      'Create a detailed 3D isometric enterprise cloud architecture blueprint with clearly organized components, precise network connections, readable labels, and a 16:9 landscape composition.';

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: targetPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    const parts =
      response.candidates?.flatMap(
        (candidate) => candidate.content?.parts || []
      ) || [];

    const generatedImage = parts.find(
      (part) => part.inlineData?.data
    )?.inlineData;

    if (!generatedImage?.data) {
      console.error('No image returned by model:', response.text);
      return res.status(502).json({
        success: false,
        error: 'The model did not return an image. Please try again.',
        fallbackUrl: FALLBACK_URL,
      });
    }

    return res.status(200).json({
      success: true,
      imageBase64: generatedImage.data,
      mimeType: generatedImage.mimeType || 'image/png',
      model: MODEL,
      prompt: targetPrompt,
    });
  } catch (err) {
    const isQuotaError =
      err?.status === 429 ||
      err?.message?.includes('429') ||
      err?.message?.includes('quota') ||
      err?.message?.includes('RESOURCE_EXHAUSTED');

    console.warn('Blueprint generation API notice:', err?.message || err);

    return res.status(200).json({
      success: false,
      isFallback: true,
      error: isQuotaError
        ? 'AI generation quota reached on free tier. Loaded high-resolution enterprise 3D architecture blueprint.'
        : 'Blueprint generation unavailable. Loaded high-resolution enterprise 3D architecture blueprint.',
      fallbackUrl: FALLBACK_URL,
      message: 'Rendered using bundled high-resolution 3D isometric architecture blueprint.',
    });
  }
}
