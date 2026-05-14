// Procedural dice-in-tray sounds via Web Audio API.
// All audio routes through a master gain -> compressor -> destination chain.
// The compressor acts as a limiter so layered settle bursts can't clip.

let ctx: AudioContext | null = null
let masterOut: AudioNode | null = null

// Single dial for overall volume — raise this if sounds are too quiet.
const MASTER_VOLUME = 5

function getOut(): AudioNode | null {
  try {
    if (!ctx) {
      ctx = new AudioContext()
      const gain = ctx.createGain()
      gain.gain.value = MASTER_VOLUME
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -6
      compressor.knee.value = 3
      compressor.ratio.value = 4
      compressor.attack.value = 0.001
      compressor.release.value = 0.1
      gain.connect(compressor)
      compressor.connect(ctx.destination)
      masterOut = gain
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return masterOut
  } catch {
    return null
  }
}

function noiseSource(ac: BaseAudioContext, duration: number): AudioBufferSourceNode {
  const samples = Math.ceil(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, samples, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1
  const source = ac.createBufferSource()
  source.buffer = buffer
  return source
}

function playBurst(
  out: AudioNode,
  filterType: BiquadFilterType,
  frequency: number,
  q: number,
  gain: number,
  duration: number
): void {
  const ac = out.context
  const now = ac.currentTime
  const source = noiseSource(ac, duration)
  const filter = ac.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency
  filter.Q.value = q
  const gainNode = ac.createGain()
  gainNode.gain.setValueAtTime(gain, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)
  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(out)
  source.start(now)
  source.stop(now + duration)
}

// Light click during tumbling — lower frequency + high Q gives that hollow resonant knock.
export function playTick(): void {
  const out = getOut()
  if (!out) return
  const freq = 700 + Math.random() * 500 // 700–1200 Hz
  playBurst(out, 'bandpass', freq, 14, 0.18, 0.07)
}

// Heavier impact when dice settle — three layers: transient click, hollow mid resonance, deep thud.
export function playSettle(): void {
  const out = getOut()
  if (!out) return
  playBurst(out, 'bandpass', 1100, 8, 0.28, 0.1) // transient click
  playBurst(out, 'bandpass', 500, 18, 0.32, 0.22) // hollow resonance — high Q rings out
  playBurst(out, 'lowpass', 220, 2, 0.38, 0.28) // deep thud
}
