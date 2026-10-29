// Web Audio API Synthesizer for Shadow Rift (All 5 Weapon Sounds)
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmOsc1 = null;
        this.bgmOsc2 = null;
        this.bgmGain = null;
        this.isPlayingBGM = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.bgmGain) {
            this.bgmGain.gain.setValueAtTime(this.muted ? 0 : 0.08, this.ctx.currentTime);
        }
        return this.muted;
    }

    // WEAPON 1: Rift-AK Shot
    playAKShot() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
    }

    // WEAPON 2: Pulse-Pistol Shot
    playPistolShot() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.12);
    }

    // WEAPON 3: Void-Shotgun Booming Shot
    playShotgunShot() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const sub = this.ctx.createOscillator();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(120, now);
        sub.frequency.exponentialRampToValueAtTime(20, now + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        sub.connect(gain); gain.connect(this.ctx.destination);
        sub.start(now); sub.stop(now + 0.3);
    }

    // WEAPON 4: Rift-Sniper Railgun Crack
    playSniperShot() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.35);
    }

    // WEAPON 5: Plasma-Lance Continuous Stream
    playPlasmaShot() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.08);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
    }

    // Katana Sword Slash Sound
    playKatanaSlash() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.18);
    }

    // Reload Sound
    playReload() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        [0, 0.25, 0.5, 0.8].forEach((delay, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600 + idx * 200, now + delay);
            osc.frequency.exponentialRampToValueAtTime(150, now + delay + 0.05);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.05);

            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now + delay); osc.stop(now + delay + 0.05);
        });
    }

    playDash() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.18);
    }

    playJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.2);
    }

    playSpecialBlast() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.7);
    }

    playEnemyHit() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
    }

    playEnemyDeath() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.4);
    }

    playBossRoar() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.9);
    }

    startBGM() {
        if (this.isPlayingBGM || this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(this.muted ? 0 : 0.06, now);

            this.bgmOsc1 = this.ctx.createOscillator();
            this.bgmOsc1.type = 'sine';
            this.bgmOsc1.frequency.setValueAtTime(55, now);

            this.bgmOsc2 = this.ctx.createOscillator();
            this.bgmOsc2.type = 'triangle';
            this.bgmOsc2.frequency.setValueAtTime(110, now);

            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.2, now);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(300, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);

            lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
            this.bgmOsc1.connect(filter); this.bgmOsc2.connect(filter);
            filter.connect(this.bgmGain); this.bgmGain.connect(this.ctx.destination);

            this.bgmOsc1.start(now); this.bgmOsc2.start(now); lfo.start(now);
            this.isPlayingBGM = true;
        } catch (e) {
            console.warn("BGM initialization error", e);
        }
    }
}

window.soundManager = new SoundManager();
