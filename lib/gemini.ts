import { buildSystemPrompt } from './prompts';
import {
  DURATION_PRESETS,
  RESOLUTION_PRESETS,
  VIDEO_FPS,
  type DurationPreset,
  type ResolutionPreset,
  type StylePreset,
} from './config';

// ─── Direct Google Gemini Endpoint API Call ─────────────────────────────────

async function callGeminiDirect(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  temperature = 0.7
): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Gemini Direct API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Invalid response structure from direct Google Gemini API');
  }

  return responseText;
}

// ─── OpenRouter Endpoint API Call ───────────────────────────────────────────

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  temperature = 0.7
): Promise<string> {
  const modelPreset = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/kamililyas/motionify-app',
      'X-Title': 'Motionify',
    },
    body: JSON.stringify({
      model: modelPreset,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const responseText = choice?.message?.content;

  if (!responseText) {
    throw new Error('Invalid response structure from OpenRouter');
  }

  return responseText;
}

// ─── Groq Endpoint API Call ──────────────────────────────────────────────────

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  temperature = 0.7
): Promise<string> {
  const modelPreset = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelPreset,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_completion_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const responseText = choice?.message?.content;

  if (!responseText) {
    throw new Error('Invalid response structure from Groq');
  }

  return responseText;
}

// ─── Main Generation API Entrypoint ──────────────────────────────────────────

async function executeAIWithFallback(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  const errors: string[] = [];

  // Try Groq
  if (groqKey) {
    try {
      console.log('[AI Client] Attempting Groq API...');
      return await callGroq(systemPrompt, userPrompt, groqKey, temperature);
    } catch (err) {
      console.warn('[AI Client] Groq API failed, attempting fallback...', err);
      errors.push(`Groq: ${(err as Error).message}`);
    }
  }

  // Fallback to Google Gemini Direct
  if (geminiKey) {
    try {
      console.log('[AI Client] Attempting Google Gemini Direct (gemini-3.6-flash)...');
      return await callGeminiDirect(systemPrompt, userPrompt, geminiKey, temperature);
    } catch (err) {
      console.warn('[AI Client] Gemini Direct failed, attempting fallback...', err);
      errors.push(`Gemini: ${(err as Error).message}`);
    }
  }

  // Fallback to OpenRouter
  if (openrouterKey) {
    try {
      console.log('[AI Client] Attempting OpenRouter API...');
      return await callOpenRouter(systemPrompt, userPrompt, openrouterKey, temperature);
    } catch (err) {
      console.warn('[AI Client] OpenRouter failed...', err);
      errors.push(`OpenRouter: ${(err as Error).message}`);
    }
  }

  throw new Error(`All configured AI providers failed:\n${errors.join('\n')}`);
}

export async function generateRemotionCode(
  prompt: string,
  options: {
    duration: DurationPreset;
    resolution: ResolutionPreset;
    style: StylePreset;
  }
): Promise<string> {
  const { frames: durationFrames, seconds: durationSeconds } =
    DURATION_PRESETS[options.duration];
  const { width, height } = RESOLUTION_PRESETS[options.resolution];

  const systemPrompt = buildSystemPrompt({
    width,
    height,
    fps: VIDEO_FPS,
    durationFrames,
    durationSeconds,
  });

  const userPrompt = buildUserPrompt(prompt, options.style);

  let responseJson = await executeAIWithFallback(systemPrompt, userPrompt, 0.7);

  // Clean raw AI response
  responseJson = stripCodeFences(responseJson);

  // Validate output JSON structure
  try {
    validateTimelineJson(responseJson);
  } catch (validationError) {
    throw new Error(`JSON validation failed: ${(validationError as Error).message}.\n\nRaw AI Response:\n${responseJson}`);
  }

  // Ensure high-contrast dark theme so text is never washed out
  responseJson = sanitizeThemeContrast(responseJson);

  return responseJson;
}

// ─── Repair Remotion Code (Auto-Healing) ─────────────────────────────────────

export async function repairRemotionCode(
  brokenCode: string,
  compileError: string
): Promise<string> {
  const systemPrompt =
    'You are an elite layout engineer. Your task is to fix syntax errors or broken JSON formats. Return ONLY raw corrected JSON code, with no markdown fences, no backticks, and no explanation.';

  const userPrompt = `The following Timeline JSON has an error (could not be parsed or has invalid attributes). 
Please fix the JSON and return only the corrected, self-contained JSON text. Do NOT wrap it in markdown code blocks. Do NOT include any explanations outside the JSON.

=== ERROR MESSAGE ===
${compileError}

=== BROKEN TIMELINE JSON ===
${brokenCode}`;

  let repairedJson = await executeAIWithFallback(systemPrompt, userPrompt, 0.2);

  // Clean raw AI response
  repairedJson = stripCodeFences(repairedJson);

  // Validate repaired JSON
  try {
    validateTimelineJson(repairedJson);
  } catch (validationError) {
    throw new Error(`Repaired JSON validation failed: ${(validationError as Error).message}.\n\nRaw AI Repair Response:\n${repairedJson}`);
  }

  repairedJson = sanitizeThemeContrast(repairedJson);

  return repairedJson;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUserPrompt(prompt: string, style: StylePreset): string {
  const styleGuide = {
    cinematic:
      'Use an agency cinematic launch style: deep dark backdrop (#06040d), luminous electric violet (#6366f1) and magenta highlights, ambient volumetric glow, film grain, and bold high-contrast pure white typography (#ffffff). NEVER use light backgrounds.',
    minimal:
      'Use a sleek minimal tech style: obsidian dark backdrop (#09090b), crisp modern indigo (#818cf8) or violet highlights, subtle micro-grid, and high-contrast pure white typography (#ffffff). NEVER use light backgrounds.',
    corporate:
      'Use an elite enterprise tech style: deep midnight navy backdrop (#030712), electric cyan (#38bdf8) and emerald (#10b981) telemetry metrics, and high-contrast pure white typography (#ffffff). NEVER use light backgrounds.',
  };

  return `${prompt}\n\nStyle direction: ${styleGuide[style]}`;
}

function stripCodeFences(code: string): string {
  code = code.trim();
  // Strip starting ```json or ``` and trailing ```
  const fencePattern = /^```(?:json)?\s*\n?([\s\S]*?)```\s*$/i;
  const match = code.match(fencePattern);
  if (match) {
    return match[1].trim();
  }
  return code;
}

function validateTimelineJson(jsonText: string): void {
  if (!jsonText || jsonText.length < 20) {
    throw new Error('Generated timeline response is too short to be valid JSON');
  }

  let data: any;
  try {
    data = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`Response is not valid JSON: ${(e as Error).message}`);
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Timeline JSON root must be an object');
  }

  // Support both SaaS Launch Storyboard schema and classic elements array schema
  const isSaaSStoryboard = data.brand && data.act1_hook && data.act2_product;
  const hasElements = Array.isArray(data.elements);

  if (!isSaaSStoryboard && !hasElements) {
    throw new Error('Timeline JSON must contain either a SaaS Storyboard (brand, act1_hook, act2_product) or an "elements" array');
  }

  if (hasElements) {
    for (const el of data.elements) {
      if (!el.id) throw new Error('Every element in the elements array must have an "id"');
      if (!el.type) throw new Error(`Element ${el.id} is missing a "type"`);
      if (typeof el.startFrame !== 'number') throw new Error(`Element ${el.id} has an invalid "startFrame"`);
      if (typeof el.endFrame !== 'number') throw new Error(`Element ${el.id} has an invalid "endFrame"`);
    }
  }
}

export function sanitizeThemeContrast(jsonText: string): string {
  try {
    const data = JSON.parse(jsonText);
    if (!data.theme) data.theme = {};

    const getHexLuminance = (hex: string | undefined): number => {
      if (!hex || typeof hex !== 'string') return 0;
      const clean = hex.replace('#', '').trim();
      if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      } else if (clean.length === 6) {
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
      return 0;
    };

    // Deep dark backdrop enforcement (never white, off-white, or light gray)
    const bg = (data.theme.bgGradient || '').trim();
    const isLightBg =
      !bg ||
      getHexLuminance(bg) > 0.25 ||
      bg.toLowerCase().includes('fff') ||
      bg.toLowerCase().includes('white') ||
      bg.toLowerCase().includes('rgb(255');

    if (isLightBg) {
      data.theme.bgGradient = '#06040d';
    }

    // High-contrast readable typography
    data.theme.text = '#ffffff';
    data.theme.textMuted = 'rgba(255, 255, 255, 0.65)';

    // Ensure primary color has sufficient saturation and contrast
    const primLum = getHexLuminance(data.theme.primary);
    if (!data.theme.primary || primLum > 0.82 || primLum < 0.15) {
      data.theme.primary = '#6366f1';
    }

    // Ensure accent color has contrast
    const accLum = getHexLuminance(data.theme.accent);
    if (!data.theme.accent || accLum > 0.85 || accLum < 0.15) {
      data.theme.accent = '#a855f7';
    }

    data.theme.glowColor = data.theme.primary;

    return JSON.stringify(data, null, 2);
  } catch {
    return jsonText;
  }
}

