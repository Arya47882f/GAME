// Advanced Enemy AI System with State Machine & Overhead Health Bars
class EnemyManager {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.enemies = [];
        this.boss = null;
        this.uiContainer = document.getElementById('hud-screen');
    }

    // --- ENEMY SPAWN FACTORIES ---
    spawnDemon(pos) {
        const mesh = window.proceduralModels.createShadowDemon();
        this.initEnemy(mesh, pos);
    }

    spawnGhost(pos) {
        const mesh = window.proceduralModels.createGhostEnemy();
        this.initEnemy(mesh, pos);
    }

    spawnAssassin(pos) {
        const mesh = window.proceduralModels.createFastAssassin();
        this.initEnemy(mesh, pos);
    }

    spawnFlying(pos) {
        const mesh = window.proceduralModels.createFlyingEnemy();
        mesh.position.y = 4.0; // Hover height
        this.initEnemy(mesh, pos);
    }

    spawnSamurai(pos) {
        const mesh = window.proceduralModels.createSamuraiEnemy();
        this.initEnemy(mesh, pos);
    }

    spawnBoss(pos) {
        if (this.boss) return;
        const mesh = window.proceduralModels.createBossEnemy();
        this.boss = mesh;
        this.initEnemy(mesh, pos);

        document.getElementById('boss-hud').classList.remove('hidden');
        window.soundManager.playBossRoar();
    }

    initEnemy(mesh, pos) {
        mesh.position.x = pos.x;
        mesh.position.z = pos.z;
        if (!mesh.userData.isFlying) mesh.position.y = 0;

        const data = mesh.userData;
        data.state = 'PATROL'; // PATROL, DETECT, CHASE, ATTACK, TAKE_DAMAGE, DIE
        data.patrolTarget = this.getRandomWaypoint(pos);
        data.patrolTimer = 0;
        data.attackTimer = 0;
        data.blockStance = false;
        data.bossPhase = 1; // 1, 2, or 3 for Boss Enemy

        // Create Overhead HTML Health Bar Element
        const hpElem = document.createElement('div');
        hpElem.className = 'enemy-hp-floating';
        hpElem.innerHTML = `
            <div class="hp-name">${data.name}</div>
            <div class="hp-track"><div class="hp-fill" style="width: 100%;"></div></div>
        `;
        this.uiContainer.appendChild(hpElem);
        data.hpElem = hpElem;

        this.scene.add(mesh);
        this.enemies.push(mesh);
    }

    getRandomWaypoint(currentPos) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        return new THREE.Vector3(
            THREE.MathUtils.clamp(currentPos.x + Math.cos(angle) * dist, -90, 90),
            currentPos.y || 0,
            THREE.MathUtils.clamp(currentPos.z + Math.sin(angle) * dist, -90, 90)
        );
    }

    update(deltaTime, player, camera) {
        let isPlayerTargeted = false;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const data = enemy.userData;

            const distToPlayer = enemy.position.distanceTo(player.mesh.position);
            const dirToPlayer = new THREE.Vector3().subVectors(player.mesh.position, enemy.position);
            if (!data.isFlying) dirToPlayer.y = 0;
            dirToPlayer.normalize();

            if (data.state === 'CHASE' || data.state === 'ATTACK') {
                isPlayerTargeted = true;
            }

            // Face direction of movement or player
            if (data.state === 'CHASE' || data.state === 'ATTACK') {
                enemy.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z);
            }

            // =================================================================
            // --- BOSS PHASE TRANSITIONS (PHASE 1 -> PHASE 2 -> PHASE 3) ---
            // =================================================================
            if (data.type === 'boss') {
                const hpPct = data.hp / data.maxHp;
                if (data.bossPhase === 1 && hpPct <= 0.66) {
                    data.bossPhase = 2;
                    data.speed = 10.0; // Enraged Speed Boost
                    window.soundManager.playBossRoar();
                    this.particleSystem.spawnRiftNova(enemy.position);
                    document.querySelector('.boss-title').innerText = "[PHASE 2: FLAME ENRAGED]";
                } else if (data.bossPhase === 2 && hpPct <= 0.33) {
                    data.bossPhase = 3;
                    data.speed = 12.0;
                    window.soundManager.playBossRoar();
                    this.particleSystem.spawnRiftNova(enemy.position);
                    document.querySelector('.boss-title').innerText = "[PHASE 3: RIFT OVERLORD]";
                    // Summon 2 Ghost Minions
                    this.spawnGhost(new THREE.Vector3(enemy.position.x - 6, 0, enemy.position.z));
                    this.spawnGhost(new THREE.Vector3(enemy.position.x + 6, 0, enemy.position.z));
                }

                // Update Boss HP bar
                const bossBar = document.getElementById('boss-hp-bar');
                if (bossBar) bossBar.style.width = `${Math.max(0, hpPct * 100)}%`;
            }

            // =================================================================
            // --- AI STATE MACHINE (PATROL -> DETECT -> CHASE -> ATTACK) ---
            // =================================================================
            switch (data.state) {
                case 'PATROL':
                    const distToPatrol = enemy.position.distanceTo(data.patrolTarget);
                    if (distToPatrol > 1.5) {
                        const patrolDir = new THREE.Vector3().subVectors(data.patrolTarget, enemy.position).normalize();
                        if (!data.isFlying) patrolDir.y = 0;
                        enemy.position.addScaledVector(patrolDir, (data.speed * 0.5) * deltaTime);
                        enemy.rotation.y = Math.atan2(patrolDir.x, patrolDir.z);
                    } else {
                        data.patrolTimer += deltaTime;
                        if (data.patrolTimer > 2.0) {
                            data.patrolTarget = this.getRandomWaypoint(enemy.position);
                            data.patrolTimer = 0;
                        }
                    }

                    if (distToPlayer <= data.detectRadius) {
                        data.state = 'DETECT';
                        this.particleSystem.spawnSparks(enemy.position, 0xef4444, 8);
                    }
                    break;

                case 'DETECT':
                    data.state = 'CHASE';
                    break;

                case 'CHASE':
                    if (distToPlayer > data.attackRadius) {
                        enemy.position.addScaledVector(dirToPlayer, data.speed * deltaTime);
                    } else {
                        data.state = 'ATTACK';
                    }
                    break;

                case 'ATTACK':
                    if (data.attackTimer <= 0) {
                        data.attackTimer = data.bossPhase === 2 ? 0.9 : 1.4;

                        if (data.type === 'ghost' || data.type === 'flying') {
                            const startPos = enemy.position.clone().add(new THREE.Vector3(0, 1.2, 0));
                            this.particleSystem.spawnBullet(startPos, dirToPlayer, true, 0xa855f7, 26, data.damage);
                        } else if (data.type === 'samurai') {
                            data.blockStance = true;
                            player.takeDamage(data.damage);
                            this.particleSystem.spawnSparks(player.mesh.position, 0xef4444, 12);
                            setTimeout(() => { data.blockStance = false; }, 800);
                        } else if (data.type === 'boss') {
                            // Boss Phase Specific Attacks
                            if (data.bossPhase === 2) {
                                // Phase 2: Flame Nova Burst
                                this.particleSystem.spawnSparks(enemy.position, 0xef4444, 30);
                                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                                    const fireDir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
                                    this.particleSystem.spawnBullet(enemy.position.clone().add(new THREE.Vector3(0, 1.5, 0)), fireDir, true, 0xef4444, 20, 18);
                                }
                            } else {
                                player.takeDamage(data.damage);
                                this.particleSystem.spawnRiftNova(enemy.position);
                                window.soundManager.playBossRoar();
                            }
                        } else {
                            player.takeDamage(data.damage);
                            this.particleSystem.spawnSparks(player.mesh.position, 0xef4444, 10);
                        }
                    } else {
                        data.attackTimer -= deltaTime;
                    }

                    if (distToPlayer > data.attackRadius + 2.0) {
                        data.state = 'CHASE';
                    }
                    break;
            }

            this.updateFloatingHPBar(enemy, camera);
        }

        // Update Threat Warning Badge on HUD
        const threatElem = document.getElementById('hud-threat-warning');
        if (threatElem) {
            threatElem.classList.toggle('active', isPlayerTargeted);
        }
    }

            // =================================================================
            // --- PLAYER BULLET HIT COLLISION DETECTION ---
            // =================================================================
            for (let j = this.particleSystem.bullets.length - 1; j >= 0; j--) {
                const b = this.particleSystem.bullets[j];
                if (b.isEnemy) continue;

                const bulletDist = b.mesh.position.distanceTo(enemy.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
                const hitRadius = data.type === 'boss' ? 2.5 : 1.2;

                if (bulletDist < hitRadius) {
                    let dmg = b.damage || 20;
                    if (data.blockStance) dmg *= 0.4; // Samurai blocks 60% damage!

                    data.hp -= dmg;
                    data.state = 'CHASE'; // Instantly aggro on hit
                    this.particleSystem.spawnSparks(b.mesh.position, 0x00f0ff, 8);
                    window.soundManager.playEnemyHit();

                    // Remove bullet
                    this.scene.remove(b.mesh);
                    b.mesh.geometry.dispose();
                    this.particleSystem.bullets.splice(j, 1);

                    // Update Health Bar UI
                    if (data.hpElem) {
                        const pct = Math.max(0, (data.hp / data.maxHp) * 100);
                        const fill = data.hpElem.querySelector('.hp-fill');
                        if (fill) fill.style.width = `${pct}%`;
                    }

                    // Check Enemy Death
                    if (data.hp <= 0) {
                        this.particleSystem.spawnSparks(enemy.position, 0xa855f7, 30);
                        window.soundManager.playEnemyDeath();

                        if (data.hpElem && data.hpElem.parentNode) {
                            data.hpElem.parentNode.removeChild(data.hpElem);
                        }

                        if (data.type === 'boss') {
                            this.boss = null;
                            document.getElementById('boss-hud').classList.add('hidden');
                            if (window.gameInstance) window.gameInstance.triggerVictory();
                        }

                        this.scene.remove(enemy);
                        this.enemies.splice(i, 1);

                        if (window.gameInstance) window.gameInstance.onEnemyKilled(data.type);
                        break;
                    }
                }
            }

            // Check Enemy Projectile Collision with Player
            for (let j = this.particleSystem.bullets.length - 1; j >= 0; j--) {
                const b = this.particleSystem.bullets[j];
                if (!b.isEnemy) continue;

                const playerDist = b.mesh.position.distanceTo(player.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
                if (playerDist < 1.0) {
                    player.takeDamage(b.damage || 12);
                    this.particleSystem.spawnSparks(b.mesh.position, 0xef4444, 8);

                    this.scene.remove(b.mesh);
                    b.mesh.geometry.dispose();
                    this.particleSystem.bullets.splice(j, 1);
                }
            }
        }
    }

    updateFloatingHPBar(enemy, camera) {
        const data = enemy.userData;
        if (!data.hpElem || !camera) return;

        // Project 3D position above enemy head to 2D screen coordinates
        const headPos = enemy.position.clone().add(new THREE.Vector3(0, data.type === 'boss' ? 5.5 : 2.2, 0));
        headPos.project(camera);

        // Check if behind camera
        if (headPos.z > 1.0) {
            data.hpElem.style.display = 'none';
            return;
        }

        const x = (headPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(headPos.y * 0.5) + 0.5) * window.innerHeight;

        data.hpElem.style.display = 'block';
        data.hpElem.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    }

    applyRiftBlastAreaDamage(centerPos, radius, damage) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dist = enemy.position.distanceTo(centerPos);
            if (dist <= radius) {
                enemy.userData.hp -= damage;
                enemy.userData.state = 'CHASE';

                const pushDir = new THREE.Vector3().subVectors(enemy.position, centerPos).normalize();
                enemy.position.addScaledVector(pushDir, 5.0);

                if (enemy.userData.hpElem) {
                    const pct = Math.max(0, (enemy.userData.hp / enemy.userData.maxHp) * 100);
                    const fill = enemy.userData.hpElem.querySelector('.hp-fill');
                    if (fill) fill.style.width = `${pct}%`;
                }

                if (enemy.userData.hp <= 0) {
                    this.particleSystem.spawnSparks(enemy.position, 0xa855f7, 30);
                    if (enemy.userData.hpElem && enemy.userData.hpElem.parentNode) {
                        enemy.userData.hpElem.parentNode.removeChild(enemy.userData.hpElem);
                    }
                    if (enemy.userData.type === 'boss') {
                        this.boss = null;
                        document.getElementById('boss-hud').classList.add('hidden');
                        if (window.gameInstance) window.gameInstance.triggerVictory();
                    }
                    this.scene.remove(enemy);
                    this.enemies.splice(i, 1);
                    if (window.gameInstance) window.gameInstance.onEnemyKilled(enemy.userData.type);
                }
            }
        }
    }
}

window.EnemyManager = EnemyManager;
