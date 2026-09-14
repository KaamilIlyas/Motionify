import fs from 'fs';
import path from 'path';

// ─── RIFF / WAVE Header Writer ───────────────────────────────────────────────

function createWavBuffer(
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number,
  samples: Float32Array[]
): Buffer {
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = samples[0].length;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const buffer = Buffer.alloc(totalSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM samples (interleaved stereo or mono)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, samples[ch][i]));
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      buffer.writeInt16LE(Math.round(intSample), offset);
      offset += 2;
    }
  }

  return buffer;
}

// ─── Audio Synthesis Generators ──────────────────────────────────────────────

const SAMPLE_RATE = 44100;

/**
 * 1. Cinematic Ambient (30s)
 * Deep sub-bass swell, ethereal minor 9th harmonic chord pads, subtle slow chorusing.
 */
function generateCinematicAmbient(durationSec = 30): Buffer {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Chord frequencies: C2 (65.4Hz sub), G2 (98Hz), Eb3 (155.6Hz), Bb3 (233.1Hz), D4 (293.7Hz)
  const freqs = [65.41, 97.99, 155.56, 233.08, 293.66, 392.0];
  const chord2 = [58.27, 87.31, 146.83, 220.0, 261.63, 349.23]; // Bb2 maj9

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / durationSec;

    // Slow chord shift midway
    const blend = Math.sin(progress * Math.PI);
    const activeFreqs = blend > 0.5 ? chord2 : freqs;

    let sampleL = 0;
    let sampleR = 0;

    // Sub-bass pulse
    const subLfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.15 * t);
    const sub = Math.sin(2 * Math.PI * 48 * t) * 0.35 * subLfo;
    sampleL += sub;
    sampleR += sub;

    // Harmonic pads with stereo chorus
    for (let fIdx = 0; fIdx < activeFreqs.length; fIdx++) {
      const f = activeFreqs[fIdx];
      const detuneL = 1.002;
      const detuneR = 0.998;
      const weight = 0.12 / (1 + fIdx * 0.4);

      const oscL = Math.sin(2 * Math.PI * f * detuneL * t + Math.sin(t * 0.5));
      const oscR = Math.sin(2 * Math.PI * f * detuneR * t + Math.cos(t * 0.4));

      sampleL += oscL * weight;
      sampleR += oscR * weight;
    }

    // Gentle overall envelope
    const envIn = Math.min(1, t / 3);
    const envOut = Math.min(1, (durationSec - t) / 4);
    const env = envIn * envOut * 0.65;

    left[i] = sampleL * env;
    right[i] = sampleR * env;
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

/**
 * 2. Tech Pulse (30s)
 * 120 BPM modern electronic tech pulse, crisp percussive hi-hat clicks, punchy low-end groove.
 */
function generateTechPulse(durationSec = 30): Buffer {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const bpm = 120;
  const beatSec = 60 / bpm; // 0.5s per beat

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beatPos = (t % beatSec) / beatSec;
    const sixteenPos = (t % (beatSec / 4)) / (beatSec / 4);

    let sampleL = 0;
    let sampleR = 0;

    // Four-on-the-floor subtle electronic kick/thump
    if (beatPos < 0.25) {
      const kickEnv = Math.exp(-beatPos * 25);
      const kickPitch = 55 + 90 * Math.exp(-beatPos * 40);
      const kick = Math.sin(2 * Math.PI * kickPitch * t) * kickEnv * 0.55;
      sampleL += kick;
      sampleR += kick;
    }

    // Crisp 16th-note hi-hat tick
    if (sixteenPos < 0.12) {
      const hatEnv = Math.exp(-sixteenPos * 60);
      const noise = (Math.random() * 2 - 1) * hatEnv * 0.12;
      sampleL += noise;
      sampleR += noise * 0.8;
    }

    // Arpeggiated tech synth pluck (F minor: F, Ab, C, Eb)
    const arpNotes = [174.61, 207.65, 261.63, 311.13];
    const arpIdx = Math.floor(t / (beatSec / 4)) % arpNotes.length;
    const arpFreq = arpNotes[arpIdx];
    const arpTime = (t % (beatSec / 4)) / (beatSec / 4);
    const arpEnv = Math.exp(-arpTime * 12);
    const synthPluck = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.18;

    sampleL += synthPluck * (arpIdx % 2 === 0 ? 1.2 : 0.8);
    sampleR += synthPluck * (arpIdx % 2 !== 0 ? 1.2 : 0.8);

    // Warm deep bassline
    const bass = Math.sin(2 * Math.PI * 43.65 * t) * 0.25;
    sampleL += bass;
    sampleR += bass;

    const envIn = Math.min(1, t / 1.5);
    const envOut = Math.min(1, (durationSec - t) / 3);
    const env = envIn * envOut * 0.6;

    left[i] = sampleL * env;
    right[i] = sampleR * env;
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

/**
 * 3. Minimal Warmth (30s)
 * Gentle warm organic acoustic chords with smooth breathy presence.
 */
function generateMinimalWarmth(durationSec = 30): Buffer {
  const numSamples = SAMPLE_RATE * durationSec;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const freqs = [130.81, 164.81, 196.0, 246.94]; // C major 7th

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sampleL = 0;
    let sampleR = 0;

    for (let fIdx = 0; fIdx < freqs.length; fIdx++) {
      const f = freqs[fIdx];
      const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 4.5 * t);
      const osc = Math.sin(2 * Math.PI * f * vibrato * t);
      const weight = 0.16 / (1 + fIdx * 0.5);
      sampleL += osc * weight;
      sampleR += osc * weight * (fIdx % 2 === 0 ? 1.1 : 0.9);
    }

    const envIn = Math.min(1, t / 2);
    const envOut = Math.min(1, (durationSec - t) / 3);
    const env = envIn * envOut * 0.55;

    left[i] = sampleL * env;
    right[i] = sampleR * env;
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

/**
 * 4. SFX: Whoosh / Swish (0.75s)
 * Frequency-swept white noise riser with smooth stereo sweep.
 */
function generateSfxWhoosh(): Buffer {
  const durationSec = 0.75;
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / durationSec;

    // Smooth bell-shaped envelope peaking at 60%
    const env = Math.pow(Math.sin(progress * Math.PI), 2.5);
    const noise = (Math.random() * 2 - 1) * 0.4;
    const tone = Math.sin(2 * Math.PI * (180 + Math.pow(progress, 3) * 1200) * t) * 0.25;

    const sample = (noise + tone) * env;
    left[i] = sample * (1 - progress * 0.5);
    right[i] = sample * (0.5 + progress * 0.5);
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

/**
 * 5. SFX: Impact / Sub-Drop (1.2s)
 * Deep cinematic sub thud with quick transient and smooth acoustic tail.
 */
function generateSfxImpact(): Buffer {
  const durationSec = 1.2;
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4.5);

    // Exponential sub drop from 120Hz to 38Hz
    const pitch = 38 + 90 * Math.exp(-t * 22);
    const sub = Math.sin(2 * Math.PI * pitch * t) * 0.65;

    // Transient click at the beginning
    const click = t < 0.02 ? (Math.random() * 2 - 1) * Math.exp(-t * 150) * 0.4 : 0;

    const sample = (sub + click) * env;
    left[i] = sample;
    right[i] = sample;
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

/**
 * 6. SFX: Mechanical Haptic Click (0.12s)
 * Clean crisp click for counter increments or telemetry frames.
 */
function generateSfxClick(): Buffer {
  const durationSec = 0.12;
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);
    const click = Math.sin(2 * Math.PI * 1800 * t) * 0.35 + (Math.random() * 2 - 1) * 0.2;
    const sample = click * env;
    left[i] = sample;
    right[i] = sample;
  }

  return createWavBuffer(SAMPLE_RATE, 2, 16, [left, right]);
}

// ─── Main Generator Execution ────────────────────────────────────────────────

async function main() {
  const outputDir = path.join(process.cwd(), 'public', 'audio');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('[Audio Synthesis] Generating studio audio stems into:', outputDir);

  const files = [
    { name: 'cinematic-ambient.wav', gen: () => generateCinematicAmbient(30) },
    { name: 'tech-pulse.wav', gen: () => generateTechPulse(30) },
    { name: 'minimal-warmth.wav', gen: () => generateMinimalWarmth(30) },
    { name: 'sfx-whoosh.wav', gen: () => generateSfxWhoosh() },
    { name: 'sfx-impact.wav', gen: () => generateSfxImpact() },
    { name: 'sfx-click.wav', gen: () => generateSfxClick() },
  ];

  for (const item of files) {
    const filePath = path.join(outputDir, item.name);
    const buffer = item.gen();
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✓ Generated ${item.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log('[Audio Synthesis] All stems generated successfully!');
}

main().catch((err) => {
  console.error('[Audio Synthesis] Failed:', err);
  process.exit(1);
});
