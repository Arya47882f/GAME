// Particle System for Muzzle Flash, Bullets, Energy Rifts, Sakura Petals & Dynamic Rain drops
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.particles = [];
        this.petals = [];
        this.rainDrops = [];

        this.initSakuraPetals();
        this.initRainSystem();
    }

    // --- BRIGHT WEAPON MUZZLE FLASH ---
    spawnMuzzleFlash(pos, colorHex = 0x00f0ff) {
        const flashGeo = new THREE.SphereGeometry(0.45, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const mesh = new THREE.Mesh(flashGeo, flashMat);
        mesh.position.copy(pos);
        this.scene.add(mesh);

        const flashLight = new THREE.PointLight(colorHex, 6.5, 15);
        flashLight.position.copy(pos);
        this.scene.add(flashLight);

        this.particles.push({
            mesh: mesh, light: flashLight, isFlash: true, life: 0.08, maxLife: 0.08
        });
    }

    // --- BULLET PROJECTILE SYSTEM ---
    spawnBullet(startPos, direction, isEnemy = false, colorHex = 0x00f0ff, speed = 65, damage = 20) {
        const bulletMat = new THREE.MeshBasicMaterial({ color: isEnemy ? 0xef4444 : colorHex });
        const bulletGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
        const mesh = new THREE.Mesh(bulletGeo, bulletMat);

        mesh.position.copy(startPos);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        this.scene.add(mesh);

        // Spawn Muzzle Flash on firing!
        this.spawnMuzzleFlash(startPos, isEnemy ? 0xef4444 : colorHex);

        this.bullets.push({
            mesh: mesh, dir: direction.clone().normalize(),
            speed: isEnemy ? 22 : speed, life: 1.8, isEnemy: isEnemy, damage: damage
        });
    }

    // --- SPARK & SHADOW IMPACT PARTICLES ---
    spawnSparks(pos, color = 0x00f0ff, count = 12) {
        for (let i = 0; i < count; i++) {
            const pMat = new THREE.MeshBasicMaterial({ color: color });
            const pGeo = new THREE.SphereGeometry(0.1, 4, 4);
            const mesh = new THREE.Mesh(pGeo, pMat);
            mesh.position.copy(pos);
            this.scene.add(mesh);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 7 + 2,
                (Math.random() - 0.5) * 10
            );

            this.particles.push({ mesh: mesh, vel: vel, life: 0.35, maxLife: 0.35 });
        }
    }

    // --- SHADOW RIFT BLAST ENERGY NOVA ---
    spawnRiftNova(pos) {
        const ringGeo = new THREE.RingGeometry(0.5, 1.5, 20);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xd946ef, side: THREE.DoubleSide, transparent: true, opacity: 0.95
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(pos); ring.position.y += 0.2;
        this.scene.add(ring);

        // High Intensity Skill Light Flash
        const skillLight = new THREE.PointLight(0xd946ef, 8.5, 30);
        skillLight.position.copy(pos); skillLight.position.y += 1.0;
        this.scene.add(skillLight);

        this.particles.push({
            mesh: ring, light: skillLight, isRing: true, scaleSpeed: 28, life: 0.5, maxLife: 0.5
        });

        this.spawnSparks(pos, 0xd946ef, 35);
    }

    // --- SAKURA PETALS ATMOSPHERE ---
    initSakuraPetals() {
        const petalMat = new THREE.MeshBasicMaterial({
            color: 0xec4899, side: THREE.DoubleSide, transparent: true, opacity: 0.75
        });
        const petalGeo = new THREE.PlaneGeometry(0.25, 0.25);

        for (let i = 0; i < 70; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.set(
                (Math.random() - 0.5) * 140,
                Math.random() * 22 + 2,
                (Math.random() - 0.5) * 140
            );
            petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            this.scene.add(petal);

            this.petals.push({
                mesh: petal, rotSpeed: Math.random() * 2 + 1, fallSpeed: Math.random() * 1.5 + 0.8
            });
        }
    }

    // --- DYNAMIC RAIN DROPLETS ATMOSPHERE ---
    initRainSystem() {
        const rainMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8, transparent: true, opacity: 0.5
        });
        const rainGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 3);

        for (let i = 0; i < 180; i++) {
            const drop = new THREE.Mesh(rainGeo, rainMat);
            drop.position.set(
                (Math.random() - 0.5) * 160,
                Math.random() * 30 + 5,
                (Math.random() - 0.5) * 160
            );
            this.scene.add(drop);

            this.rainDrops.push({
                mesh: drop, speed: 38 + Math.random() * 15
            });
        }
    }

    update(deltaTime) {
        // 1. Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.life -= deltaTime;
            b.mesh.position.addScaledVector(b.dir, b.speed * deltaTime);

            if (b.life <= 0) {
                this.scene.remove(b.mesh);
                b.mesh.geometry.dispose();
                this.bullets.splice(i, 1);
            }
        }

        // 2. Sparks & Rings
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;

            if (p.isRing) {
                p.mesh.scale.addScalar(p.scaleSpeed * deltaTime);
                p.mesh.material.opacity = p.life / p.maxLife;
            } else {
                p.vel.y -= 9.8 * deltaTime;
                p.mesh.position.addScaledVector(p.vel, deltaTime);
                p.mesh.scale.setScalar(p.life / p.maxLife);
            }

            if (p.life <= 0) {
                if (p.light) this.scene.remove(p.light);
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                this.particles.splice(i, 1);
            }
        }

        // 3. Petals Drift
        this.petals.forEach(p => {
            p.mesh.position.y -= p.fallSpeed * deltaTime;
            p.mesh.position.x += Math.sin(p.mesh.position.y) * 0.5 * deltaTime;
            p.mesh.rotation.y += p.rotSpeed * deltaTime;

            if (p.mesh.position.y < 0) {
                p.mesh.position.y = 22;
                p.mesh.position.x = (Math.random() - 0.5) * 140;
                p.mesh.position.z = (Math.random() - 0.5) * 140;
            }
        });

        // 4. Dynamic Rain Falling
        this.rainDrops.forEach(r => {
            r.mesh.position.y -= r.speed * deltaTime;
            if (r.mesh.position.y < 0) {
                r.mesh.position.y = 35;
                r.mesh.position.x = (Math.random() - 0.5) * 160;
                r.mesh.position.z = (Math.random() - 0.5) * 160;
            }
        });
    }
}

window.ParticleSystem = ParticleSystem;
