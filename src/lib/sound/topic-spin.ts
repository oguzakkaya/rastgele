/** How long the reel spins before the topic is allowed to land. */
export const TOPIC_SPIN_MS = 3000;

let ctx: AudioContext | null = null;
let bed: AudioBuffer | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

/** Call from a click so the browser allows sound on the next screen. */
export function primeTopicSpin(): void {
  const audio = audioContext();
  if (!audio) return;
  void audio.resume();
}

/** One long noise bed. Each tooth takes a different slice, so no two clicks match. */
function noiseBed(audio: AudioContext): AudioBuffer {
  if (bed && bed.sampleRate === audio.sampleRate) return bed;
  const length = Math.floor(audio.sampleRate * 2);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  bed = buffer;
  return buffer;
}

/** Gap between gear teeth: rapid, then a clear slowdown into the stop. */
function tickGap(elapsed: number): number {
  const t = Math.min(1, Math.max(0, (elapsed - TOPIC_SPIN_MS * 0.42) / (TOPIC_SPIN_MS * 0.58)));
  const wobble = 0.9 + Math.random() * 0.2;
  return (36 + t ** 1.9 * 380) * wobble;
}

function strike(
  audio: AudioContext,
  buffer: AudioBuffer,
  when: number,
  out: AudioNode,
  options: { type: BiquadFilterType; freq: number; q: number; peak: number; decay: number },
): void {
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = options.type;
  filter.frequency.value = options.freq;
  filter.Q.value = options.q;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(options.peak, when + 0.0012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + options.decay);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  const offset = Math.random() * (buffer.duration - 0.08);
  source.start(when, offset, options.decay + 0.02);
}

/** A plastic pawl catching one tooth: bright snap, hollow body, soft knock. */
function playGearTooth(audio: AudioContext, heavy: number): void {
  const now = audio.currentTime;
  const buffer = noiseBed(audio);
  const loud = (0.8 + Math.random() * 0.3) * heavy;
  const out = audio.createGain();
  out.gain.value = 0.8;
  out.connect(audio.destination);

  strike(audio, buffer, now, out, {
    type: "highpass",
    freq: 1500 + Math.random() * 1100,
    q: 0.7,
    peak: 0.42 * loud,
    decay: 0.005 + Math.random() * 0.004,
  });
  strike(audio, buffer, now, out, {
    type: "bandpass",
    freq: 480 + Math.random() * 360,
    q: 3.2 + Math.random() * 2.2,
    peak: 0.3 * loud,
    decay: 0.016 + Math.random() * 0.014 + heavy * 0.012,
  });
  strike(audio, buffer, now, out, {
    type: "lowpass",
    freq: 220 + Math.random() * 90,
    q: 0.6,
    peak: 0.2 * loud,
    decay: 0.02 + Math.random() * 0.012,
  });

  if (heavy > 0.95 && Math.random() < 0.6) {
    strike(audio, buffer, now + 0.007 + Math.random() * 0.012, out, {
      type: "bandpass",
      freq: 640 + Math.random() * 420,
      q: 2.4,
      peak: 0.14 * loud,
      decay: 0.01 + Math.random() * 0.008,
    });
  }
}

function chime(audio: AudioContext, when: number, freq: number, peak: number, dur: number): void {
  const fundamental = audio.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.value = freq;
  const body = audio.createGain();
  body.gain.setValueAtTime(0.0001, when);
  body.gain.exponentialRampToValueAtTime(peak, when + 0.01);
  body.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  fundamental.connect(body);
  body.connect(audio.destination);
  fundamental.start(when);
  fundamental.stop(when + dur + 0.02);

  const sparkle = audio.createOscillator();
  sparkle.type = "sine";
  sparkle.frequency.value = freq * 2.76;
  const air = audio.createGain();
  air.gain.setValueAtTime(0.0001, when);
  air.gain.exponentialRampToValueAtTime(peak * 0.16, when + 0.004);
  air.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.4);
  sparkle.connect(air);
  air.connect(audio.destination);
  sparkle.start(when);
  sparkle.stop(when + dur * 0.45);
}

/** A short rising bell when the wheel stops on a topic. */
export function playTopicFound(): void {
  const audio = audioContext();
  if (!audio || audio.state !== "running") return;
  const now = audio.currentTime;
  chime(audio, now, 659.25, 0.16, 0.22);
  chime(audio, now + 0.1, 987.77, 0.2, 0.42);
}

/** Five rising tones when a countdown reaches zero. The last one rings. */
export function playTimeUp(): void {
  const audio = audioContext();
  if (!audio) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  const start = () => {
    if (audio.state !== "running") return;
    const now = audio.currentTime;
    notes.forEach((freq, i) => {
      const last = i === notes.length - 1;
      chime(audio, now + i * 0.09, freq, last ? 0.28 : 0.18, last ? 0.55 : 0.14);
    });
  };
  if (audio.state === "running") start();
  else void audio.resume().then(start);
}

/**
 * A mechanical wheel: fast teeth, then a slowing ratchet.
 * `onTick` fires with each tooth so the titles can move in time.
 * Returns a function that silences the wheel.
 */
export function startTopicSpin(onTick: () => void): () => void {
  const audio = audioContext();
  if (audio) void audio.resume();
  let stopped = false;
  let timer = 0;
  const started = performance.now();

  const step = () => {
    if (stopped) return;
    const elapsed = performance.now() - started;
    const heavy = 0.72 + Math.min(1, elapsed / TOPIC_SPIN_MS) * 0.55;
    if (audio && audio.state === "running") playGearTooth(audio, heavy);
    onTick();
    timer = window.setTimeout(step, tickGap(elapsed));
  };

  step();
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}
