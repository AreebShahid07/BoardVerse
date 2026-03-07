// Board sounds via Tone.js — synthesized retro chip-tune style
import * as Tone from 'tone';

let moveSynth = null;
let captureSynth = null;
let toneStarted = false;

const ensureToneStarted = async () => {
    if (!toneStarted) {
        await Tone.start();
        toneStarted = true;
    }
};

const getMovesynth = () => {
    if (!moveSynth) {
        // Low wooden knock — quick transient, pitched membrane
        moveSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 },
        }).toDestination();
        moveSynth.volume.value = -6;
    }
    return moveSynth;
};

const getCaptureSynth = () => {
    if (!captureSynth) {
        // Sharp metallic crack — ping/strike sound
        captureSynth = new Tone.MetalSynth({
            frequency: 300,
            envelope: { attack: 0.001, decay: 0.2, release: 0.05 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).toDestination();
        captureSynth.volume.value = -10;
    }
    return captureSynth;
};

export const playMoveSound = async () => {
    try {
        await ensureToneStarted();
        getMovesynth().triggerAttackRelease('C2', '8n', Tone.now());
    } catch (e) {
        // Silently fail — audio context may be blocked
    }
};

export const playCaptureSound = async () => {
    try {
        await ensureToneStarted();
        getCaptureSynth().triggerAttackRelease('16n', Tone.now());
    } catch (e) {
        // Silently fail
    }
};
