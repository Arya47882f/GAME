// Main Game Loop, Scene Manager, Wave Controller for Shadow Rift
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.gameState = 'MENU';

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Managers
        this.cameraController = null;
        this.particleSystem = null;
        this.player = null;
        this.enemyManager = null;
        this.minimap = null;

        // Wave & Score Tracking
        this.currentWave = 1;
        this.killsCount = 0;
        this.score = 0;

        // Clock
        this.clock = new THREE.Clock();

        this.initThree();
        this.initGameWorld();
        this.initUI();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050713);
        this.scene.fog = new THREE.FogExp2(0x050713, 0.007); // Low fog density so all buildings & enemies remain clearly visible

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initGameWorld() {
        window.proceduralModels.createVillageEnvironment(this.scene);
        this.cameraController = new window.CameraController(this.camera);
        this.particleSystem = new window.ParticleSystem(this.scene);
        this.player = new window.Player(this.scene, this.cameraController, this.particleSystem);
        this.enemyManager = new window.EnemyManager(this.scene, this.particleSystem);
        this.environmentManager = new window.EnvironmentManager(this.scene, this.particleSystem);
        this.minimap = new window.MinimapController('minimap-canvas');
    }

    initUI() {
        document.getElementById('btn-start').addEventListener('click', () => {
            window.soundManager.startBGM();
            this.startGame();
        });

        const modal = document.getElementById('controls-modal');
        document.getElementById('btn-controls').addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
        document.getElementById('btn-close-controls').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        const soundBtn = document.getElementById('btn-sound-toggle');
        const pauseSoundBtn = document.getElementById('btn-pause-sound');
        const toggleAudio = () => {
            const muted = window.soundManager.toggleMute();
            const text = `AUDIO: ${muted ? 'OFF' : 'ON'}`;
            soundBtn.innerText = text;
            pauseSoundBtn.innerText = text;
        };
        soundBtn.addEventListener('click', toggleAudio);
        pauseSoundBtn.addEventListener('click', toggleAudio);

        document.getElementById('btn-pause-hud').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());
        document.getElementById('btn-quit').addEventListener('click', () => location.reload());

        document.getElementById('btn-retry').addEventListener('click', () => this.restartGame());
        document.getElementById('btn-vic-restart').addEventListener('click', () => this.restartGame());

        // Character Selection Cards
        const cards = document.querySelectorAll('.char-card');
        cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
                if (window.progressionManager) window.progressionManager.selectCharacter(idx);
            });
        });

        // Upgrade Modal Button
        const btnUpgrades = document.getElementById('btn-open-upgrades');
        const upgradeModal = document.getElementById('upgrades-modal');
        if (btnUpgrades && upgradeModal) {
            btnUpgrades.addEventListener('click', () => {
                upgradeModal.classList.remove('hidden');
                if (window.progressionManager) window.progressionManager.updateUpgradeModalUI();
            });
            document.getElementById('btn-close-upgrades').addEventListener('click', () => {
                upgradeModal.classList.add('hidden');
            });
        }
    }

    startGame() {
        this.gameState = 'PLAYING';
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud-screen').classList.remove('hidden');

        this.currentWave = 1;
        this.killsCount = 0;
        this.score = 0;
        this.updateStatsHUD();

        if (window.progressionManager) window.progressionManager.updateProgressionHUD();
        if (window.questSystem) window.questSystem.updateQuestHUD();

        this.startWave(1);
    }

    // --- WAVE PROGRESSION SYSTEM (SPAWNS ALL 6 ENEMY TYPES) ---
    startWave(waveNum) {
        this.currentWave = waveNum;
        const banner = document.getElementById('wave-banner');

        if (waveNum === 1) {
            banner.innerText = "WAVE 1: SHADOW DEMONS & KAGE ASSASSINS";
            for (let i = 0; i < 3; i++) this.enemyManager.spawnDemon(this.getRandomSpawnPos());
            for (let i = 0; i < 2; i++) this.enemyManager.spawnAssassin(this.getRandomSpawnPos());
        } else if (waveNum === 2) {
            banner.innerText = "WAVE 2: PHANTOM GHOSTS, TENGUS & RONIN SAMURAI";
            for (let i = 0; i < 3; i++) this.enemyManager.spawnGhost(this.getRandomSpawnPos());
            for (let i = 0; i < 3; i++) this.enemyManager.spawnFlying(this.getRandomSpawnPos());
            for (let i = 0; i < 2; i++) this.enemyManager.spawnSamurai(this.getRandomSpawnPos());
        } else if (waveNum === 3) {
            banner.innerText = "FINAL WAVE: BOSS BATTLE - KAGE-NO-AKUMA";
            this.enemyManager.spawnBoss(new THREE.Vector3(0, 0, -40));
            this.enemyManager.spawnDemon(new THREE.Vector3(-15, 0, -35));
            this.enemyManager.spawnAssassin(new THREE.Vector3(15, 0, -35));
        }
    }

    getRandomSpawnPos() {
        const pPos = this.player.mesh.position;
        let spawnPos;
        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = 25 + Math.random() * 35;
            spawnPos = new THREE.Vector3(
                pPos.x + Math.cos(angle) * dist,
                0,
                pPos.z + Math.sin(angle) * dist
            );
        } while (Math.abs(spawnPos.x) > 100 || Math.abs(spawnPos.z) > 100);

        return spawnPos;
    }

    onEnemyKilled(type) {
        this.killsCount++;
        const pts = type === 'boss' ? 2000 : (type === 'samurai' ? 400 : (type === 'flying' ? 300 : 180));
        this.score += pts;
        this.updateStatsHUD();

        // Award XP and update Quests
        if (window.progressionManager) window.progressionManager.addXP(pts / 2);
        if (window.questSystem) {
            window.questSystem.onKill();
            if (type === 'boss') window.questSystem.onBossDefeated();
        }

        if (this.enemyManager.enemies.length === 0) {
            if (this.currentWave < 3) {
                setTimeout(() => {
                    this.startWave(this.currentWave + 1);
                }, 2000);
            }
        }
    }

    triggerRiftBlastDamage(pos, radius, damage) {
        this.enemyManager.applyRiftBlastAreaDamage(pos, radius, damage);
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            document.getElementById('pause-screen').classList.remove('hidden');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            document.getElementById('pause-screen').classList.add('hidden');
        }
    }

    triggerGameOver() {
        this.gameState = 'GAME_OVER';
        document.getElementById('hud-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-kills').innerText = this.killsCount;
        document.getElementById('final-score').innerText = this.score;
    }

    triggerVictory() {
        this.gameState = 'VICTORY';
        document.getElementById('hud-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.remove('hidden');
        document.getElementById('vic-kills').innerText = this.killsCount;
        document.getElementById('vic-score').innerText = this.score;
    }

    restartGame() {
        this.enemyManager.enemies.forEach(e => {
            if (e.userData && e.userData.hpElem && e.userData.hpElem.parentNode) {
                e.userData.hpElem.parentNode.removeChild(e.userData.hpElem);
            }
            this.scene.remove(e);
        });
        this.enemyManager.enemies = [];
        this.enemyManager.boss = null;

        this.player.mesh.position.set(0, 0, 0);
        this.player.hp = this.player.maxHp;
        this.player.stamina = this.player.maxStamina;

        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('boss-hud').classList.add('hidden');

        this.startGame();
    }

    updateStatsHUD() {
        document.getElementById('stat-kills').innerText = this.killsCount;
        document.getElementById('stat-score').innerText = this.score;
    }

    animate() {
        requestAnimationFrame(this.animate);

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        if (this.gameState === 'MENU') {
            const time = this.clock.getElapsedTime() * 0.25;
            this.camera.position.x = Math.cos(time) * 35;
            this.camera.position.z = Math.sin(time) * 35;
            this.camera.position.y = 12;
            this.camera.lookAt(0, 3, 0);
        } else if (this.gameState === 'PLAYING') {
            const cameraDelta = window.controlsManager.consumeCameraDelta();
            const isAiming = window.controlsManager.actions.aim;
            const isCrouching = window.controlsManager.actions.crouch;

            this.player.update(deltaTime, window.controlsManager);
            this.cameraController.update(this.player.mesh, cameraDelta, deltaTime, isAiming, isCrouching);

            this.enemyManager.update(deltaTime, this.player, this.camera);
            if (this.environmentManager) this.environmentManager.update(deltaTime, this.player);
            this.particleSystem.update(deltaTime);

            this.minimap.render(this.player, this.enemyManager.enemies);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
