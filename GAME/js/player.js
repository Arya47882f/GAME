// Player Physics, State Machine, 5 Weapon System, Melee Slash, Cinematic 3D Flight System
class Player {
    constructor(scene, cameraController, particleSystem) {
        this.scene = scene;
        this.cameraController = cameraController;
        this.particleSystem = particleSystem;

        // Build 3D Player Mesh & Accessories
        this.modelData = window.proceduralModels.createPlayer();
        this.mesh = this.modelData.mesh;
        this.scene.add(this.mesh);

        // Physics State
        this.velocity = new THREE.Vector3();
        this.gravity = -24.0;
        this.isGrounded = true;

        // 3D Flight System States
        this.isFlying = false;
        this.flightSpeed = 16.0;
        this.flightBoostSpeed = 22.5;
        this.ascendSpeed = 8.5;
        this.descendSpeed = 8.5;

        // Jump & Air Dodge States
        this.jumpCount = 0;
        this.maxJumps = 2;

        this.isDodging = false;
        this.dodgeTimer = 0;
        this.dodgeCooldown = 0;

        this.isMeleeAttacking = false;
        this.meleeTimer = 0;
        this.meleeCooldown = 0;

        this.isCrouching = false;

        // 5 Original Weapons
        this.weapons = [
            { name: "1. RIFT-AK ASSAULT RIFLE", magSize: 30, ammo: 30, fireRate: 0.12, recoil: 0.12, damage: 20, speed: 65, color: 0x00f0ff, sound: 'playAKShot' },
            { name: "2. PULSE-PISTOL", magSize: 12, ammo: 12, fireRate: 0.22, recoil: 0.18, damage: 35, speed: 55, color: 0xfacc15, sound: 'playPistolShot' },
            { name: "3. VOID-SHOTGUN", magSize: 8, ammo: 8, fireRate: 0.75, recoil: 0.45, damage: 18, speed: 50, color: 0xec4899, sound: 'playShotgunShot', isShotgun: true },
            { name: "4. RIFT-SNIPER", magSize: 5, ammo: 5, fireRate: 1.1, recoil: 0.60, damage: 150, speed: 110, color: 0xa855f7, sound: 'playSniperShot' },
            { name: "5. PLASMA-LANCE", magSize: 50, ammo: 50, fireRate: 0.07, recoil: 0.06, damage: 14, speed: 75, color: 0x10b981, sound: 'playPlasmaShot' }
        ];

        this.currentWeaponIdx = 0;
        this.fireCooldown = 0;
        this.isReloading = false;
        this.reloadTimer = 0;

        // Health & Stamina
        this.hp = 100;
        this.maxHp = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.specialCooldown = 0;
        this.maxSpecialCooldown = 8.0;

        this.walkSpeed = 3.5;
        this.runSpeed = 6.8;
        this.sprintSpeed = 11.5;
        this.crouchSpeed = 2.8;
        this.damageMultiplier = 1.0;

        this.animTime = 0;
        this.applyCharacterProfile();
    }

    applyCharacterProfile() {
        if (!window.progressionManager) return;
        const hero = window.progressionManager.getSelectedCharacter();
        if (!hero) return;

        this.maxHp = 100 + (hero.hpBonus || 0);
        this.hp = this.maxHp;
        this.maxStamina = 100 + (hero.staminaBonus || 0);
        this.stamina = this.maxStamina;
        this.sprintSpeed = 11.5 * (hero.speedMult || 1.0);
        this.runSpeed = 6.8 * (hero.speedMult || 1.0);
        this.damageMultiplier = hero.damageMult || 1.0;

        const avatarElem = document.getElementById('char-avatar-display');
        if (avatarElem) avatarElem.innerText = hero.avatar;

        if (this.modelData && this.modelData.scarf) {
            this.modelData.scarf.material.color.setHex(hero.color || 0x00f0ff);
        }

        this.updateHUD();
    }

    update(deltaTime, controls) {
        this.animTime += deltaTime * 8;

        // 1. Weapon Switch Check
        if (controls.actions.switchWeapon >= 0 && controls.actions.switchWeapon < 5) {
            this.switchWeapon(controls.actions.switchWeapon);
            controls.actions.switchWeapon = -1;
        }

        // Update Cooldowns
        if (this.fireCooldown > 0) this.fireCooldown -= deltaTime;
        if (this.dodgeCooldown > 0) this.dodgeCooldown -= deltaTime;
        if (this.meleeCooldown > 0) this.meleeCooldown -= deltaTime;
        if (this.specialCooldown > 0) this.specialCooldown -= deltaTime;

        // Reload Logic
        if (this.isReloading) {
            this.reloadTimer -= deltaTime;
            if (this.reloadTimer <= 0) {
                const w = this.weapons[this.currentWeaponIdx];
                w.ammo = w.magSize;
                this.isReloading = false;
                document.getElementById('reload-indicator').classList.add('hidden');
            }
        }

        // Stamina Regeneration (When not flying or sprinting)
        if (!controls.actions.sprint && !this.isFlying && this.stamina < this.maxStamina) {
            this.stamina = Math.min(this.maxStamina, this.stamina + 22 * deltaTime);
        }

        // =====================================================================
        // --- 3D FLIGHT SYSTEM CONTROLS & PHYSICS ---
        // =====================================================================
        this.isFlying = controls.actions.flight && this.stamina > 2;

        // Show Wings & Glowing Energy Aura during Flight
        this.modelData.wings.visible = this.isFlying;
        this.modelData.aura.visible = this.isFlying;

        if (this.isFlying) {
            // Drain Stamina while flying
            this.stamina = Math.max(0, this.stamina - 12 * deltaTime);

            // Automatic Landing when stamina depleted
            if (this.stamina <= 0) {
                controls.actions.flight = false;
                this.isFlying = false;
                this.modelData.wings.visible = false;
                this.modelData.aura.visible = false;
            }
        }

        // 2. Handle Dodge Roll & Aerial Barrel Roll
        if (this.isDodging) {
            this.dodgeTimer -= deltaTime;
            if (this.dodgeTimer <= 0) this.isDodging = false;
            this.updateMeshAnimation(deltaTime, true);
            return;
        }

        // 3. Handle Melee Katana Attack State
        if (this.isMeleeAttacking) {
            this.meleeTimer -= deltaTime;
            if (this.meleeTimer <= 0) this.isMeleeAttacking = false;
        }

        // 4. Crouch Toggle State
        this.isCrouching = controls.actions.crouch && !this.isFlying;
        const targetTorsoY = this.isCrouching ? 0.85 : 1.25;
        this.modelData.torso.position.y = THREE.MathUtils.lerp(this.modelData.torso.position.y, targetTorsoY, deltaTime * 12);

        // 5. Movement Vectors
        const forward = this.cameraController.getForwardVector();
        const right = this.cameraController.getRightVector();

        const moveDir = new THREE.Vector3()
            .addScaledVector(right, controls.moveVector.x)
            .addScaledVector(forward, -controls.moveVector.z);

        const inputMagnitude = moveDir.length();
        if (inputMagnitude > 0.01) moveDir.normalize();

        if (this.isFlying) {
            // --- FLIGHT PHYSICS ---
            this.isGrounded = false;
            let flySpeed = controls.actions.sprint ? this.flightBoostSpeed : this.flightSpeed;
            
            this.velocity.x = moveDir.x * flySpeed;
            this.velocity.z = moveDir.z * flySpeed;

            // Altitude Increase (Ascend) & Decrease (Descend)
            let vertVel = 0;
            if (controls.actions.ascend) vertVel += this.ascendSpeed;
            if (controls.actions.descend) vertVel -= this.descendSpeed;
            
            this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, vertVel, deltaTime * 10);

            // Energy Trail Particle Stream
            if (Math.random() < 0.4) {
                this.particleSystem.spawnSparks(this.mesh.position, 0x00f0ff, 2);
            }
        } else {
            // --- GROUND & JUMP PHYSICS ---
            let currentSpeed = this.runSpeed;
            if (this.isCrouching) {
                currentSpeed = this.crouchSpeed;
            } else if (controls.actions.sprint && this.stamina > 5 && inputMagnitude > 0.1) {
                currentSpeed = this.sprintSpeed;
                this.stamina = Math.max(0, this.stamina - 18 * deltaTime);
            } else if (inputMagnitude > 0.01 && inputMagnitude < 0.5) {
                currentSpeed = this.walkSpeed;
            }

            this.velocity.x = moveDir.x * currentSpeed;
            this.velocity.z = moveDir.z * currentSpeed;

            if (!this.isGrounded) {
                this.velocity.y += this.gravity * deltaTime;
            }
        }

        // Smooth Rotation facing direction
        if (controls.actions.fire || controls.actions.aim || this.isMeleeAttacking || inputMagnitude > 0.05) {
            const targetAngle = (controls.actions.fire || controls.actions.aim || this.isMeleeAttacking) ? this.cameraController.yaw + Math.PI : Math.atan2(moveDir.x, moveDir.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetAngle, deltaTime * 14);
        }

        // 6. Ground Jump & Double Jump
        if (controls.actions.jump && !this.isFlying) {
            controls.actions.jump = false;
            if (this.isGrounded) {
                this.velocity.y = 10.5;
                this.isGrounded = false;
                this.jumpCount = 1;
                window.soundManager.playJump();
            } else if (this.jumpCount < this.maxJumps) {
                this.velocity.y = 9.5;
                this.jumpCount++;
                window.soundManager.playJump();
                this.particleSystem.spawnSparks(this.mesh.position, 0x00f0ff, 12);
            }
        }

        // Apply Position
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;

        // Ground Collision & Automatic Landing
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.jumpCount = 0;
            if (this.isFlying) {
                controls.actions.flight = false;
                this.isFlying = false;
                this.modelData.wings.visible = false;
                this.modelData.aura.visible = false;
            }
        }

        // Ceiling Clamp for Flight (Y = 35m max altitude)
        this.mesh.position.y = Math.min(this.mesh.position.y, 35.0);

        // Village Boundary Clamp
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -105, 105);
        this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -105, 105);

        // 7. Dodge & Air Barrel Roll
        if (controls.actions.dodge && this.dodgeCooldown <= 0 && this.stamina >= 20) {
            this.isDodging = true;
            this.dodgeTimer = 0.35;
            this.dodgeCooldown = 0.8;
            this.stamina -= 20;
            window.soundManager.playDash();

            const dashDir = inputMagnitude > 0.05 ? moveDir : forward;
            const dashSpeed = this.isFlying ? 28.0 : 22.0; // Faster Barrel Roll in air!
            this.velocity.x = dashDir.x * dashSpeed;
            this.velocity.z = dashDir.z * dashSpeed;
            this.particleSystem.spawnSparks(this.mesh.position, 0x00f0ff, 20);
        }

        // 8. Melee Katana Attack (Ground or Air!)
        if (controls.actions.melee && this.meleeCooldown <= 0) {
            this.performMeleeAttack();
        }

        // 9. Shooting & Reload
        if (controls.actions.reload && !this.isReloading) {
            const w = this.weapons[this.currentWeaponIdx];
            if (w.ammo < w.magSize) this.startReload();
        }

        if (controls.actions.fire) {
            this.shoot();
        }

        if (controls.actions.special && this.specialCooldown <= 0) {
            this.useSpecialRiftBlast();
        }

        this.updateMeshAnimation(deltaTime, false);
        this.updateHUD();
    }

    switchWeapon(idx) {
        if (this.isReloading || idx === this.currentWeaponIdx) return;
        this.currentWeaponIdx = idx;

        this.modelData.weapons.forEach((w, i) => { w.visible = (i === idx); });
        window.soundManager.playReload();
        this.updateHUD();
    }

    shoot() {
        const w = this.weapons[this.currentWeaponIdx];
        if (this.isReloading || this.fireCooldown > 0) return;

        if (w.ammo <= 0) {
            this.startReload();
            return;
        }

        w.ammo--;
        this.fireCooldown = w.fireRate;

        const forward = this.cameraController.getForwardVector();
        const startPos = new THREE.Vector3().copy(this.mesh.position).add(new THREE.Vector3(0, 1.3, 0));
        const finalDamage = Math.round(w.damage * (this.damageMultiplier || 1.0));

        if (w.isShotgun) {
            for (let i = 0; i < 7; i++) {
                const spreadDir = forward.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.25,
                    (Math.random() - 0.5) * 0.25,
                    (Math.random() - 0.5) * 0.25
                )).normalize();

                this.particleSystem.spawnBullet(startPos, spreadDir, false, w.color, w.speed, finalDamage);
            }
        } else {
            const aimDir = forward.clone();
            this.particleSystem.spawnBullet(startPos, aimDir, false, w.color, w.speed, finalDamage);
        }

        this.particleSystem.spawnSparks(startPos, w.color, 6);
        this.cameraController.shake(w.recoil, 0.08);

        if (window.soundManager[w.sound]) {
            window.soundManager[w.sound]();
        }
    }

    startReload() {
        this.isReloading = true;
        this.reloadTimer = 1.2;
        document.getElementById('reload-indicator').classList.remove('hidden');
        window.soundManager.playReload();
    }

    performMeleeAttack() {
        this.isMeleeAttacking = true;
        this.meleeTimer = 0.3;
        this.meleeCooldown = 0.45;
        window.soundManager.playKatanaSlash();

        const forward = this.cameraController.getForwardVector();
        const slashPos = this.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forward, 1.5);
        this.particleSystem.spawnSparks(slashPos, 0x00f0ff, 15);

        if (window.gameInstance) {
            window.gameInstance.triggerRiftBlastDamage(slashPos, 3.8, 55);
        }
    }

    useSpecialRiftBlast() {
        this.specialCooldown = this.maxSpecialCooldown;
        this.particleSystem.spawnRiftNova(this.mesh.position);
        this.cameraController.shake(0.4, 0.3);
        window.soundManager.playSpecialBlast();

        if (window.gameInstance) {
            window.gameInstance.triggerRiftBlastDamage(this.mesh.position, 14, 85);
        }
    }

    takeDamage(amount) {
        if (this.isDodging) return;

        this.hp = Math.max(0, this.hp - amount);
        this.cameraController.shake(0.35, 0.2);
        window.soundManager.playEnemyHit();

        if (this.hp <= 0 && window.gameInstance) {
            window.gameInstance.triggerGameOver();
        }
    }

    updateMeshAnimation(deltaTime, isDodging) {
        const speed = Math.hypot(this.velocity.x, this.velocity.z);

        if (isDodging) {
            // Spin barrel roll mesh in direction of dodge
            this.mesh.rotation.z += deltaTime * 25;
            return;
        } else {
            this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, deltaTime * 10);
        }

        if (this.isFlying) {
            // Cinematic Flight Pose (Wing flapping & forward banking tilt)
            const wingFlap = Math.sin(this.animTime * 2.5) * 0.2;
            if (this.modelData.wings.children.length >= 2) {
                this.modelData.wings.children[0].rotation.z = wingFlap;
                this.modelData.wings.children[1].rotation.z = -wingFlap;
            }

            // Pulse glowing flight aura
            this.modelData.aura.scale.setScalar(1.0 + Math.sin(this.animTime * 3) * 0.08);
            return;
        }

        if (this.isMeleeAttacking) {
            this.modelData.armL.rotation.x = -Math.PI / 2;
            this.modelData.armL.rotation.y = Math.sin(this.animTime * 4) * 1.5;
            return;
        }

        if (speed > 0.2 && this.isGrounded) {
            const swingFreq = speed > 8 ? 2.2 : (speed < 4 ? 1.0 : 1.5);
            const swing = Math.sin(this.animTime * swingFreq);

            this.modelData.legL.rotation.x = swing * 0.7;
            this.modelData.legR.rotation.x = -swing * 0.7;
            this.modelData.armL.rotation.x = -swing * 0.5;
            this.modelData.armR.rotation.x = swing * 0.5;
        } else {
            const breath = Math.sin(this.animTime * 0.4) * 0.05;
            this.modelData.torso.position.y += breath * 0.1;
            this.modelData.legL.rotation.x = THREE.MathUtils.lerp(this.modelData.legL.rotation.x, 0, deltaTime * 10);
            this.modelData.legR.rotation.x = THREE.MathUtils.lerp(this.modelData.legR.rotation.x, 0, deltaTime * 10);
            this.modelData.armL.rotation.x = THREE.MathUtils.lerp(this.modelData.armL.rotation.x, 0, deltaTime * 10);
        }

        this.modelData.scarf.rotation.z = Math.sin(this.animTime) * 0.15;
    }

    updateHUD() {
        const hpVal = document.getElementById('hp-value');
        const hpBar = document.getElementById('hp-bar');
        if (hpVal) hpVal.innerText = Math.round(this.hp);
        if (hpBar) hpBar.style.width = `${(this.hp / this.maxHp) * 100}%`;

        const staminaVal = document.getElementById('stamina-value');
        const staminaBar = document.getElementById('stamina-bar');
        if (staminaVal) staminaVal.innerText = Math.round(this.stamina);
        if (staminaBar) staminaBar.style.width = `${(this.stamina / this.maxStamina) * 100}%`;

        const specialBar = document.getElementById('special-bar');
        const specialStatus = document.getElementById('special-status');
        if (specialBar && specialStatus) {
            const specialPct = Math.min(100, Math.max(0, ((this.maxSpecialCooldown - this.specialCooldown) / this.maxSpecialCooldown) * 100));
            specialBar.style.width = `${specialPct}%`;
            specialStatus.innerText = this.specialCooldown <= 0 ? "READY" : `${Math.ceil(this.specialCooldown)}s`;
        }

        const w = this.weapons[this.currentWeaponIdx];
        const weaponName = document.getElementById('weapon-name');
        const ammoClip = document.getElementById('ammo-clip');
        if (weaponName) weaponName.innerText = w.name;
        if (ammoClip) ammoClip.innerText = w.ammo;

        const weaponIcon = document.querySelector('.weapon-icon');
        if (weaponIcon) {
            const icons = ["🔫", "⚡", "💥", "🎯", "🌀"];
            weaponIcon.innerText = icons[this.currentWeaponIdx] || "🔫";
        }
    }
}

window.Player = Player;
