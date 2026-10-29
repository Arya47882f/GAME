// Procedural 3D Asset Generator for Shadow Rift (Cinematic Japanese Village, Boss Arena, Ruins & Forest)
class ProceduralModels {
    constructor() {
        this.textures = {
            eye: this.createEyeTexture(),
            wood: this.createWoodTexture(),
            roof: this.createRoofTexture(),
            stone: this.createStoneTexture(),
            glowPetal: this.createPetalTexture(),
            water: this.createWaterTexture()
        };
    }

    createEyeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0b0d19'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath(); ctx.ellipse(40, 64, 16, 28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(88, 64, 16, 28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(44, 54, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(92, 54, 6, 0, Math.PI * 2); ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }

    createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2a1810'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#1c100a';
        for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 13, 256, 4);
        return new THREE.CanvasTexture(canvas);
    }

    createRoofTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 6;
        for (let i = 0; i < 256; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
    }

    createStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#1f2937';
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 256, y = Math.random() * 256, r = Math.random() * 12 + 6;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }

    createWaterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#0284c7';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(0, i * 14, 128, 2);
        }
        return new THREE.CanvasTexture(canvas);
    }

    createPetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(236, 72, 153, 0.9)';
        ctx.beginPath(); ctx.ellipse(32, 32, 12, 24, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }

    // --- PLAYER & 5 WEAPONS ---
    createPlayer() {
        const group = new THREE.Group();
        group.name = "PlayerCharacter";

        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.2, metalness: 0.8,
            emissive: 0x0284c7, emissiveIntensity: 0.35 // Character glow highlight
        });
        const clothMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.4 });
        const glowCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7, roughness: 0.3, emissive: 0x0284c7, emissiveIntensity: 0.5
        });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), armorMat);
        torso.position.y = 1.25; group.add(torso);

        const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), glowCyanMat);
        chestCore.position.set(0, 0.1, 0.22); torso.add(chestCore);

        // Dedicated Player Hero Rim Light (Ensures player is ALWAYS clearly visible)
        const playerRimLight = new THREE.PointLight(0x00f0ff, 3.5, 14);
        playerRimLight.position.set(0, 1.8, 0);
        group.add(playerRimLight);

        // Glowing Ground Aura Ring under Player
        const groundRingGeo = new THREE.RingGeometry(0.5, 0.85, 16);
        const groundRingMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.65
        });
        const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
        groundRing.rotation.x = -Math.PI / 2; groundRing.position.y = 0.02;
        group.add(groundRing);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.65, 0); torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), skinMat);
        headGroup.add(head);

        const hairGroup = new THREE.Group();
        for (let i = 0; i < 7; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 4), hairMat);
            spike.rotation.z = (Math.random() - 0.5) * 0.8;
            spike.rotation.x = -0.3 + (Math.random() - 0.5) * 0.4;
            spike.position.set((i - 3) * 0.08, 0.28, (Math.random() - 0.5) * 0.1);
            hairGroup.add(spike);
        }
        headGroup.add(hairGroup);

        const mask = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshBasicMaterial({ map: this.textures.eye, transparent: true }));
        mask.position.set(0, 0.02, 0.25); headGroup.add(mask);

        const scarfMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
        const scarf = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.2), scarfMat);
        scarf.position.set(0, -0.1, -0.25); scarf.rotation.x = Math.PI / 3;
        headGroup.add(scarf);

        const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
        const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.24);

        const armLPivot = new THREE.Group(); armLPivot.position.set(-0.48, 0.35, 0);
        const armL = new THREE.Mesh(armGeo, armorMat); armL.position.y = -0.35; armLPivot.add(armL); torso.add(armLPivot);

        const armRPivot = new THREE.Group(); armRPivot.position.set(0.48, 0.35, 0);
        const armR = new THREE.Mesh(armGeo, armorMat); armR.position.y = -0.35; armRPivot.add(armR); torso.add(armRPivot);

        const legLPivot = new THREE.Group(); legLPivot.position.set(-0.2, -0.45, 0);
        const legL = new THREE.Mesh(legGeo, clothMat); legL.position.y = -0.4; legLPivot.add(legL); torso.add(legLPivot);

        const legRPivot = new THREE.Group(); legRPivot.position.set(0.2, -0.45, 0);
        const legR = new THREE.Mesh(legGeo, clothMat); legR.position.y = -0.4; legRPivot.add(legR); torso.add(legRPivot);

        const wingsGroup = new THREE.Group();
        wingsGroup.name = "FlightWings";
        const wingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const wingL = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), wingMat);
        wingL.position.set(-0.9, 0.2, -0.2); wingL.rotation.y = 0.4;
        const wingR = wingL.clone(); wingR.position.x = 0.9; wingR.rotation.y = -0.3;
        wingsGroup.add(wingL); wingsGroup.add(wingR); wingsGroup.visible = false;
        torso.add(wingsGroup);

        const auraGeo = new THREE.SphereGeometry(1.4, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        const flightAura = new THREE.Mesh(auraGeo, auraMat);
        flightAura.position.y = 0.1; flightAura.visible = false;
        torso.add(flightAura);

        const katana = this.createEnergyKatana();
        katana.position.set(-0.1, -0.4, 0.3); katana.rotation.x = Math.PI / 2; katana.rotation.y = 0.2;
        armLPivot.add(katana);

        const weapons = [
            this.createAKRifle(), this.createPulsePistol(), this.createVoidShotgun(),
            this.createRiftSniper(), this.createPlasmaLance()
        ];

        weapons.forEach((w, idx) => {
            w.position.set(0.1, -0.4, 0.3); w.rotation.x = Math.PI / 2; w.rotation.y = -0.2;
            w.visible = (idx === 0); armRPivot.add(w);
        });

        return {
            mesh: group, torso: torso, head: headGroup, armL: armLPivot, armR: armRPivot,
            legL: legLPivot, legR: legRPivot, scarf: scarf, wings: wingsGroup,
            aura: flightAura, weapons: weapons, katana: katana
        };
    }

    createAKRifle() {
        const rifle = new THREE.Group();
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x331a00, roughness: 0.6 });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.7), darkMetal); rifle.add(body);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), woodMat); stock.position.set(0, -0.04, -0.45); stock.rotation.x = -0.2; rifle.add(stock);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), darkMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.04, 0.65); rifle.add(barrel);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.14), darkMetal); mag.position.set(0, -0.2, 0.1); mag.rotation.x = 0.4; rifle.add(mag);
        const magStrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.25, 0.02), neonMat); magStrip.position.set(0, -0.2, 0.18); magStrip.rotation.x = 0.4; rifle.add(magStrip);
        return rifle;
    }

    createPulsePistol() {
        const pistol = new THREE.Group();
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 });
        const yellowGlow = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.35), darkMetal); pistol.add(body);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.1), darkMetal); grip.position.set(0, -0.15, -0.08); grip.rotation.x = -0.25; pistol.add(grip);
        const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), yellowGlow); cell.position.set(0, 0.02, 0.05); cell.rotation.x = Math.PI / 2; pistol.add(cell);
        return pistol;
    }

    createVoidShotgun() {
        const shotgun = new THREE.Group();
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
        const magentaGlow = new THREE.MeshBasicMaterial({ color: 0xec4899 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.65), darkMetal); shotgun.add(body);
        for (let side of [-0.04, 0.04]) {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), darkMetal); barrel.rotation.x = Math.PI / 2; barrel.position.set(side, 0.03, 0.5); shotgun.add(barrel);
        }
        const magCell = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.2), magentaGlow); magCell.position.set(0, -0.12, 0.1); shotgun.add(magCell);
        return shotgun;
    }

    createRiftSniper() {
        const sniper = new THREE.Group();
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.95 });
        const violetGlow = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.9), darkMetal); sniper.add(body);
        const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), darkMetal); longBarrel.rotation.x = Math.PI / 2; longBarrel.position.set(0, 0.04, 0.9); sniper.add(longBarrel);
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), darkMetal); scope.rotation.x = Math.PI / 2; scope.position.set(0, 0.18, 0.1); sniper.add(scope);
        return sniper;
    }

    createPlasmaLance() {
        const plasma = new THREE.Group();
        const whiteMetal = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2 });
        const emeraldGlow = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.75), whiteMetal); plasma.add(body);
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), emeraldGlow); ring.position.set(0, 0.02, 0.2 + i * 0.15); plasma.add(ring);
        }
        return plasma;
    }

    createEnergyKatana() {
        const katana = new THREE.Group();
        const hiltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), hiltMat); handle.position.set(0, 0, -0.15); katana.add(handle);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.1), hiltMat); guard.position.set(0, 0, 0.02); katana.add(guard);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.3, 0.08), bladeMat); blade.position.set(0, 0, 0.7); katana.add(blade);
        return katana;
    }

    createShadowDemon() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.7, metalness: 0.2,
            emissive: 0x7f1d1d, emissiveIntensity: 0.4
        });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const torso = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 6), mat); torso.position.y = 1.0; torso.rotation.x = Math.PI; group.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), mat); head.position.y = 1.6; group.add(head);
        for (let side of [-0.12, 0.12]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat); eye.position.set(side, 1.64, 0.25); group.add(eye);
        }
        const clawMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        for (let side of [-0.5, 0.5]) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), mat); arm.position.set(side, 1.1, 0.2); arm.rotation.x = 0.5; group.add(arm);
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 4), clawMat); claw.position.set(side, 0.6, 0.45); claw.rotation.x = 1.2; group.add(claw);
        }
        group.userData = { name: 'Shadow Demon', type: 'demon', hp: 80, maxHp: 80, speed: 4.2, detectRadius: 22, attackRadius: 1.5, damage: 16 };
        return group;
    }

    createGhostEnemy() {
        const group = new THREE.Group();
        const ghostMat = new THREE.MeshStandardMaterial({
            color: 0x3b82f6, transparent: true, opacity: 0.85, roughness: 0.1,
            emissive: 0x3b82f6, emissiveIntensity: 0.8
        });
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.45, 1.6, 8), ghostMat); body.position.y = 1.2; group.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), ghostMat); head.position.y = 1.9; group.add(head);
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.24), coreMat); core.position.y = 1.3; group.add(core);
        const bowMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 6, 12, Math.PI), bowMat); bow.position.set(0, 1.3, 0.4); bow.rotation.y = Math.PI / 2; group.add(bow);
        group.userData = { name: 'Phantom Ghost', type: 'ghost', hp: 45, maxHp: 45, speed: 2.5, detectRadius: 25, attackRadius: 12, damage: 10 };
        return group;
    }

    createFastAssassin() {
        const group = new THREE.Group();
        const ninjaMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.3, emissive: 0x0284c7, emissiveIntensity: 0.4
        });
        const daggerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.3), ninjaMat); torso.position.y = 1.0; group.add(torso);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), ninjaMat); head.position.y = 1.5; group.add(head);
        const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.1), eyeMat); visor.position.set(0, 1.5, 0.18); group.add(visor);
        for (let side of [-0.35, 0.35]) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), ninjaMat); arm.position.set(side, 0.9, 0.1); arm.rotation.x = 0.6; group.add(arm);
            const dagger = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 4), daggerMat); dagger.position.set(side, 0.6, 0.35); dagger.rotation.x = 1.4; group.add(dagger);
        }
        group.userData = { name: 'Kage Assassin', type: 'assassin', hp: 50, maxHp: 50, speed: 7.5, detectRadius: 28, attackRadius: 1.2, damage: 8 };
        return group;
    }

    createFlyingEnemy() {
        const group = new THREE.Group();
        const tenguMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
        const wingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 5), tenguMat); body.position.y = 1.0; body.rotation.x = Math.PI; group.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), tenguMat); head.position.y = 1.4; group.add(head);
        const wingL = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), wingMat); wingL.position.set(-0.9, 1.2, 0); wingL.rotation.y = 0.3;
        const wingR = wingL.clone(); wingR.position.x = 0.9; wingR.rotation.y = -0.3; group.add(wingL); group.add(wingR);
        group.userData = { name: 'Shadow Tengu', type: 'flying', hp: 60, maxHp: 60, speed: 5.0, detectRadius: 30, attackRadius: 14, damage: 14, isFlying: true };
        return group;
    }

    createSamuraiEnemy() {
        const group = new THREE.Group();
        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x991b1b, roughness: 0.3, metalness: 0.7, emissive: 0x991b1b, emissiveIntensity: 0.5
        });
        const kabutoMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.5), armorMat); torso.position.y = 1.3; group.add(torso);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), kabutoMat); head.position.y = 2.0; group.add(head);
        const crest = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 4), bladeMat); crest.position.set(0, 2.4, 0.2); crest.rotation.x = -0.4; group.add(crest);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.12), bladeMat); blade.position.set(0.6, 1.2, 0.4); blade.rotation.x = 0.5; group.add(blade);
        group.userData = { name: 'Corrupted Ronin', type: 'samurai', hp: 140, maxHp: 140, speed: 3.5, detectRadius: 20, attackRadius: 2.2, damage: 24 };
        return group;
    }

    createBossEnemy() {
        const group = new THREE.Group(); group.name = "BossEnemy";
        const obsidianMat = new THREE.MeshStandardMaterial({
            color: 0x090d16, roughness: 0.2, metalness: 0.9, emissive: 0x7f1d1d, emissiveIntensity: 0.6
        });
        const lavaRiftMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        group.scale.set(2.5, 2.5, 2.5);

        // Dedicated Boss Crimson Point Light
        const bossLight = new THREE.PointLight(0xef4444, 5.0, 20);
        bossLight.position.set(0, 2.0, 0); group.add(bossLight);
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.6), obsidianMat); torso.position.y = 1.6; group.add(torso);
        const symbol = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), lavaRiftMat); symbol.position.set(0, 1.7, 0.32); group.add(symbol);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), obsidianMat); head.position.y = 2.5; group.add(head);
        const hornMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        for (let side of [-0.3, 0.3]) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 5), hornMat); horn.position.set(side, 2.9, 0); horn.rotation.z = -side * 0.8; group.add(horn);
        }
        const bladeGroup = new THREE.Group();
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.4), obsidianMat); blade.position.y = 1.2;
        const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.08), lavaRiftMat); bladeEdge.position.set(0, 1.2, 0.22);
        bladeGroup.add(blade); bladeGroup.add(bladeEdge); bladeGroup.position.set(0.9, 1.2, 0.3); bladeGroup.rotation.x = 0.4; group.add(bladeGroup);
        group.userData = { name: 'Kage-No-Akuma', type: 'boss', hp: 700, maxHp: 700, speed: 3.2, detectRadius: 35, attackRadius: 3.5, damage: 35, phase: 1 };
        return group;
    }

    // =========================================================================
    // --- RICH CINEMATIC 3D JAPANESE ENVIRONMENT ---
    // =========================================================================
    createVillageEnvironment(scene) {
        // 1. Wet Reflective Cobblestone Ground
        const groundGeo = new THREE.PlaneGeometry(260, 260);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.4, metalness: 0.3, map: this.textures.stone
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
        scene.add(ground);

        // 2. Central Stone Road
        const pathGeo = new THREE.PlaneGeometry(18, 220);
        const pathMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.4 });
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.rotation.x = -Math.PI / 2; path.position.y = 0.03;
        scene.add(path);

        // 3. Misty River & Curved Red Wooden Bridges
        this.createMistyRiver(scene);

        // 4. Grand Torii Entrance Gate
        this.createGrandToriiGate(scene, 0, -85);

        // 5. Dedicated Ritual Boss Arena with Flaming Braziers & Glowing Runes
        this.createBossArena(scene, 0, -40);

        // 6. Main Dojo Temple Complex
        this.createMainTemple(scene, 0, 75);

        // 7. Traditional Houses & Abandoned Ruins
        this.createVillageHousesAndRuins(scene);

        // 8. Surrounding Bamboo & Sakura Forest
        this.createForestAndSakura(scene);

        // 9. Distant Mountain Backdrops
        this.createMountainBackdrop(scene);

        // 10. Night Atmosphere, Moon Rays & Cyan Highlights
        this.createNightSkyAndLighting(scene);
    }

    createMistyRiver(scene) {
        const riverGeo = new THREE.PlaneGeometry(260, 24);
        const riverMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7, roughness: 0.1, metalness: 0.8, map: this.textures.water, transparent: true, opacity: 0.85
        });
        const river = new THREE.Mesh(riverGeo, riverMat);
        river.rotation.x = -Math.PI / 2; river.position.set(0, 0.05, 10);
        scene.add(river);

        // Red Wooden Bridge over River
        const bridgeGroup = new THREE.Group();
        const redWood = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
        const arch = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 26), redWood);
        arch.position.set(0, 0.8, 10);
        bridgeGroup.add(arch);

        for (let side of [-8, 8]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 26), redWood);
            rail.position.set(side, 1.6, 10); bridgeGroup.add(rail);
        }
        scene.add(bridgeGroup);
    }

    createGrandToriiGate(scene, x, z) {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 });
        const blackCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
        const goldTrim = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 10, 10), woodMat); postL.position.set(-7, 5, 0);
        const postR = postL.clone(); postR.position.x = 7; group.add(postL); group.add(postR);

        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 1.0), woodMat); topBeam.position.set(0, 10, 0); group.add(topBeam);
        const topCap = new THREE.Mesh(new THREE.BoxGeometry(18.8, 0.4, 1.2), blackCapMat); topCap.position.set(0, 10.5, 0); group.add(topCap);
        const crestGold = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), goldTrim); crestGold.position.set(0, 8.8, 0.5); group.add(crestGold);

        // Hanging Amber Lanterns
        for (let side of [-5, 5]) {
            const lChamber = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), goldTrim);
            lChamber.position.set(side, 7.8, 0); group.add(lChamber);
            const light = new THREE.PointLight(0xf59e0b, 1.8, 15); light.position.set(side, 7.8, 0); group.add(light);
        }

        group.position.set(x, 0, z); scene.add(group);
    }

    createBossArena(scene, x, z) {
        const group = new THREE.Group();
        // Central Ritual Circle
        const ringGeo = new THREE.RingGeometry(1, 14, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ritualCircle = new THREE.Mesh(ringGeo, ringMat);
        ritualCircle.rotation.x = -Math.PI / 2; ritualCircle.position.y = 0.04; group.add(ritualCircle);

        // Surrounding Flaming Braziers
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const bx = Math.cos(angle) * 16;
            const bz = Math.sin(angle) * 16;
            this.createBrazierWithFire(group, bx, bz);
        }

        group.position.set(x, 0, z); scene.add(group);
    }

    createBrazierWithFire(parentGroup, x, z) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.2, 8), stoneMat);
        pillar.position.set(x, 1.1, z); parentGroup.add(pillar);

        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.4, 0.5, 8), stoneMat);
        bowl.position.set(x, 2.3, z); parentGroup.add(bowl);

        const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), fireMat);
        flame.position.set(x, 2.8, z); parentGroup.add(flame);

        const fireLight = new THREE.PointLight(0xf97316, 2.2, 16);
        fireLight.position.set(x, 2.8, z); parentGroup.add(fireLight);
    }

    createMainTemple(scene, x, z) {
        const group = new THREE.Group();
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, map: this.textures.wood });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, map: this.textures.roof });
        const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

        for (let tier = 0; tier < 4; tier++) {
            const size = 18 - tier * 3.5; const height = 5.5; const posY = tier * 6 + height / 2;
            const building = new THREE.Mesh(new THREE.BoxGeometry(size, height, size), wallMat); building.position.y = posY; group.add(building);

            const windowFrame = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.6, 2.2), windowGlowMat);
            windowFrame.position.set(0, posY, size / 2 + 0.05); group.add(windowFrame);

            const roof = new THREE.Mesh(new THREE.ConeGeometry(size + 4.5, 2.8, 4), roofMat);
            roof.position.y = posY + height / 2 + 1.2; roof.rotation.y = Math.PI / 4; group.add(roof);
        }
        group.position.set(x, 0, z); scene.add(group);
    }

    createVillageHousesAndRuins(scene) {
        // Traditional Houses along streets
        const housePositions = [
            [-35, -70], [35, -70], [-35, -20], [35, -20],
            [-40, 25], [40, 25], [-40, 65], [40, 65]
        ];

        housePositions.forEach(([x, z]) => {
            this.createTraditionalHouse(scene, x, z);
        });

        // Abandoned Collapsed Ruins
        this.createRuinedBuilding(scene, -55, -45);
        this.createRuinedBuilding(scene, 55, -45);
    }

    createTraditionalHouse(scene, x, z) {
        const group = new THREE.Group();
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, map: this.textures.wood });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, map: this.textures.roof });
        const paperGlow = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

        const house = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 10), wallMat);
        house.position.y = 2.25; group.add(house);

        const windowPaper = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.8), paperGlow);
        windowPaper.position.set(0, 2.25, 5.05); group.add(windowPaper);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 2.4, 4), roofMat);
        roof.position.y = 5.5; roof.rotation.y = Math.PI / 4; group.add(roof);

        group.position.set(x, 0, z); scene.add(group);
    }

    createRuinedBuilding(scene, x, z) {
        const group = new THREE.Group();
        const darkTimber = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
        const brokenRoof = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8 });

        const wall1 = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 0.4), darkTimber);
        wall1.position.set(0, 1.75, -3); group.add(wall1);

        const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 6), darkTimber);
        wall2.position.set(-4, 1.1, 0); wall2.rotation.z = -0.2; group.add(wall2);

        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 7), brokenRoof);
        beam.position.set(1, 2.5, 0); beam.rotation.set(0.4, 0.3, 0.2); group.add(beam);

        group.position.set(x, 0, z); scene.add(group);
    }

    createForestAndSakura(scene) {
        // Bamboo Groves & Sakura Trees
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const radius = 65 + Math.random() * 45;
            const bx = Math.cos(angle) * radius;
            const bz = Math.sin(angle) * radius;

            const bamboo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 12, 6), bambooMat);
            bamboo.position.set(bx, 6, bz); scene.add(bamboo);
        }
    }

    createMountainBackdrop(scene) {
        const mountainMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 180 + Math.random() * 20;
            const mx = Math.cos(angle) * radius;
            const mz = Math.sin(angle) * radius;

            const mountain = new THREE.Mesh(new THREE.ConeGeometry(45 + Math.random() * 25, 90 + Math.random() * 30, 5), mountainMat);
            mountain.position.set(mx, 35, mz); scene.add(mountain);
        }
    }

    // --- HIGH-CONTRAST MOONLIGHT & NIGHT LIGHTING ---
    createNightSkyAndLighting(scene) {
        const skyGeo = new THREE.SphereGeometry(320, 16, 16);
        const skyMat = new THREE.MeshBasicMaterial({ color: 0x030712, side: THREE.BackSide });
        scene.add(new THREE.Mesh(skyGeo, skyMat));

        // Moon Sphere + Glowing Sky Aura
        const moonGeo = new THREE.SphereGeometry(16, 16, 16);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(90, 150, -180); scene.add(moon);

        const moonAuraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
        const moonAura = new THREE.Mesh(new THREE.SphereGeometry(24, 16, 16), moonAuraMat);
        moonAura.position.set(90, 150, -180); scene.add(moonAura);

        // Strong Celestial Directional Moonlight (Increased Intensity)
        const moonlight = new THREE.DirectionalLight(0x7dd3fc, 3.2);
        moonlight.position.set(90, 150, -180); moonlight.castShadow = true; scene.add(moonlight);

        // Ambient Cyan Sky & Dark Indigo Ground Lighting (Boosted for High Contrast & Readability)
        const ambient = new THREE.AmbientLight(0x38bdf8, 1.8); scene.add(ambient);
        const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.6); scene.add(hemiLight);
    }
}

window.proceduralModels = new ProceduralModels();
