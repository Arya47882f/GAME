// Environment Manager for Shadow Rift: Day/Night Cycle, Weather System, Hidden Locations & Collectibles
class EnvironmentManager {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;

        // Day/Night Cycle Parameters
        this.timeOfDay = 0; // 0.0 to 1.0 (0.0 = Midnight, 0.25 = Dawn, 0.5 = Noon, 0.75 = Dusk)
        this.cycleSpeed = 0.005; // Full day/night cycle every ~3.3 minutes

        // Dynamic Weather Parameters
        this.weatherState = 'RAIN'; // 'RAIN', 'SAKURA', 'FOG'
        this.weatherTimer = 0;
        this.weatherDuration = 45.0; // Change weather state every 45s

        // 3D Collectible Items List
        this.collectibles = [];

        // 3 Hidden Locations in Village
        this.hiddenLocations = [
            {
                id: 'waterfall_shrine',
                name: '🌊 Hidden Waterfall Shrine',
                pos: new THREE.Vector3(-65, 0, 75),
                radius: 10,
                discovered: false,
                rewardCrystals: 5
            },
            {
                id: 'pagoda_vault',
                name: '⛩️ Secret Pagoda Cavern',
                pos: new THREE.Vector3(0, 15, -60),
                radius: 12,
                discovered: false,
                rewardCrystals: 8
            },
            {
                id: 'torii_altar',
                name: '🌸 Ancestral Torii Altar',
                pos: new THREE.Vector3(65, 0, -65),
                radius: 10,
                discovered: false,
                rewardCrystals: 5
            }
        ];

        this.initCollectibles();
    }

    initCollectibles() {
        // Spawn 15 Collectibles across the Japanese Village
        const types = ['hp', 'stamina', 'crystal'];
        for (let i = 0; i < 18; i++) {
            const type = types[i % 3];
            const angle = (i / 18) * Math.PI * 2;
            const dist = 18 + Math.random() * 65;
            const pos = new THREE.Vector3(
                Math.cos(angle) * dist,
                1.2,
                Math.sin(angle) * dist
            );
            this.spawnCollectible(pos, type);
        }
    }

    spawnCollectible(position, type) {
        let color = 0x22c55e; // HP orb green
        if (type === 'stamina') color = 0x00f0ff; // Stamina crystal cyan
        if (type === 'crystal') color = 0xa855f7; // Rift crystal purple

        const geometry = new THREE.OctahedronGeometry(0.5, 0);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.position.y = 1.2;
        this.scene.add(mesh);

        this.collectibles.push({
            mesh: mesh,
            type: type,
            baseY: mesh.position.y,
            rotSpeed: 1.5 + Math.random()
        });
    }

    update(deltaTime, player) {
        // 1. Day / Night Atmosphere Transition
        this.timeOfDay = (this.timeOfDay + this.cycleSpeed * deltaTime) % 1.0;
        this.updateAtmosphere();

        // 2. Dynamic Weather Transition
        this.weatherTimer += deltaTime;
        if (this.weatherTimer >= this.weatherDuration) {
            this.weatherTimer = 0;
            const states = ['RAIN', 'SAKURA', 'FOG'];
            const nextIdx = (states.indexOf(this.weatherState) + 1) % states.length;
            this.setWeather(states[nextIdx]);
        }

        // 3. Update & Animate Collectibles
        this.updateCollectibles(deltaTime, player);

        // 4. Check Hidden Location Discoveries
        this.checkHiddenLocations(player);
    }

    updateAtmosphere() {
        if (!this.scene.background) return;

        // Smooth color interpolation between Night Cyan, Sunrise Amber, Noon Blue, Dusk Violet
        let bgColor = new THREE.Color(0x050713);
        let fogDensity = 0.007;

        if (this.weatherState === 'FOG') {
            fogDensity = 0.018;
        }

        if (this.timeOfDay < 0.25) {
            // Night -> Dawn
            const t = this.timeOfDay / 0.25;
            bgColor.lerpColors(new THREE.Color(0x050713), new THREE.Color(0x1a1c38), t);
        } else if (this.timeOfDay < 0.5) {
            // Dawn -> Noon
            const t = (this.timeOfDay - 0.25) / 0.25;
            bgColor.lerpColors(new THREE.Color(0x1a1c38), new THREE.Color(0x0f2744), t);
        } else if (this.timeOfDay < 0.75) {
            // Noon -> Dusk
            const t = (this.timeOfDay - 0.5) / 0.25;
            bgColor.lerpColors(new THREE.Color(0x0f2744), new THREE.Color(0x2d103b), t);
        } else {
            // Dusk -> Night
            const t = (this.timeOfDay - 0.75) / 0.25;
            bgColor.lerpColors(new THREE.Color(0x2d103b), new THREE.Color(0x050713), t);
        }

        this.scene.background = bgColor;
        if (this.scene.fog) {
            this.scene.fog.color = bgColor;
            this.scene.fog.density = THREE.MathUtils.lerp(this.scene.fog.density, fogDensity, 0.05);
        }

        const weatherElem = document.getElementById('hud-weather-badge');
        if (weatherElem) {
            const weatherIcons = { RAIN: '🌧️ RAIN STORM', SAKURA: '🌸 SAKURA DRIFT', FOG: '🌫️ HEAVY MIST' };
            weatherElem.innerText = weatherIcons[this.weatherState] || '🌧️ RAIN STORM';
        }
    }

    setWeather(state) {
        this.weatherState = state;
        this.updateAtmosphere();
    }

    updateCollectibles(deltaTime, player) {
        if (!player || !player.mesh) return;

        const playerPos = player.mesh.position;

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.mesh.rotation.y += item.rotSpeed * deltaTime;
            item.mesh.position.y = item.baseY + Math.sin(Date.now() * 0.003 + i) * 0.25;

            // Collision Check with Player
            const dist = playerPos.distanceTo(item.mesh.position);
            if (dist < 2.0) {
                // Collect Item
                if (item.type === 'hp') {
                    player.hp = Math.min(player.maxHp, player.hp + 25);
                } else if (item.type === 'stamina') {
                    player.stamina = Math.min(player.maxStamina, player.stamina + 35);
                } else if (item.type === 'crystal') {
                    if (window.progressionManager) window.progressionManager.addCrystals(1);
                }

                if (window.soundManager && window.soundManager.playPistolShot) {
                    window.soundManager.playPistolShot();
                }

                this.particleSystem.spawnSparks(item.mesh.position, item.mesh.material.color.getHex(), 14);

                this.scene.remove(item.mesh);
                this.collectibles.splice(i, 1);
                player.updateHUD();

                // Respawn collectible after 25s delay
                setTimeout(() => {
                    this.spawnCollectible(item.mesh.position, item.type);
                }, 25000);
            }
        }
    }

    checkHiddenLocations(player) {
        if (!player || !player.mesh) return;

        const pPos = player.mesh.position;

        this.hiddenLocations.forEach(loc => {
            if (!loc.discovered) {
                const dist = pPos.distanceTo(loc.pos);
                if (dist <= loc.radius) {
                    loc.discovered = true;
                    if (window.progressionManager) {
                        window.progressionManager.addCrystals(loc.rewardCrystals);
                        window.progressionManager.addXP(150);
                    }

                    // Show Discovery Banner
                    this.showDiscoveryToast(loc.name);
                    if (window.soundManager && window.soundManager.playVictory) {
                        window.soundManager.playVictory();
                    }
                }
            }
        });
    }

    showDiscoveryToast(locationName) {
        const toast = document.createElement('div');
        toast.className = 'discovery-toast';
        toast.innerHTML = `⛩️ SECRET LOCATION DISCOVERED! <br><strong>${locationName}</strong> (+150 XP & Crystals)`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
}

window.EnvironmentManager = EnvironmentManager;
