// Enhanced Input Manager for Shadow Rift (Dual Virtual Joysticks + 3D Flight Controls)
class ControlsManager {
    constructor() {
        // Movement Vector (-1.0 to 1.0)
        this.moveVector = { x: 0, z: 0 };

        // Camera Rotation Accumulator (yaw, pitch)
        this.cameraDelta = { x: 0, y: 0 };

        // Action States
        this.actions = {
            fire: false,
            melee: false,   // Energy Katana Slash
            crouch: false,  // Crouch Stance
            aim: false,     // Aim Down Sights (ADS)
            jump: false,
            flight: false,  // Dedicated Flight Toggle
            ascend: false,  // Increase Altitude
            descend: false, // Decrease Altitude
            sprint: false,
            dodge: false,
            reload: false,
            special: false,
            switchWeapon: -1
        };

        // Dual Joystick Touch Tracking IDs
        this.leftJoyTouchId = null;
        this.rightJoyTouchId = null;
        this.aimDragTouchId = null;

        this.leftJoyCenter = { x: 0, y: 0 };
        this.rightJoyCenter = { x: 0, y: 0 };
        this.joyRadius = 45;

        this.aimLastPos = { x: 0, y: 0 };
        this.keys = {};

        this.initKeyboardMouse();
        this.initTouchControls();
    }

    // --- PC KEYBOARD & MOUSE CONTROLS ---
    initKeyboardMouse() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.updateKeyboardState();

            if (e.code === 'KeyR') this.triggerActionOnce('reload');
            if (e.code === 'KeyE' && !this.actions.flight) this.triggerActionOnce('special');
            if (e.code === 'KeyV') this.triggerActionOnce('melee');
            if (e.code === 'ControlLeft' || e.code === 'KeyC') this.toggleAction('crouch');
            if (e.code === 'Space') {
                if (this.actions.flight) this.actions.ascend = true;
                else this.triggerActionOnce('jump');
            }
            if (e.code === 'KeyF') this.toggleAction('flight');
            if (e.code === 'KeyQ') this.actions.descend = true;
            if (e.code === 'KeyZ') this.toggleAction('aim');
            if (e.code === 'AltLeft') this.triggerActionOnce('dodge');

            if (e.code === 'Digit1') this.actions.switchWeapon = 0;
            if (e.code === 'Digit2') this.actions.switchWeapon = 1;
            if (e.code === 'Digit3') this.actions.switchWeapon = 2;
            if (e.code === 'Digit4') this.actions.switchWeapon = 3;
            if (e.code === 'Digit5') this.actions.switchWeapon = 4;

            if (e.code === 'Escape') {
                if (window.gameInstance) window.gameInstance.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'Space') this.actions.ascend = false;
            if (e.code === 'KeyQ') this.actions.descend = false;
            this.updateKeyboardState();
        });

        window.addEventListener('wheel', (e) => {
            if (window.gameInstance && window.gameInstance.player) {
                const cur = window.gameInstance.player.currentWeaponIdx;
                const next = e.deltaY > 0 ? (cur + 1) % 5 : (cur + 4) % 5;
                this.actions.switchWeapon = next;
            }
        });

        let isMouseDown = false;
        let lastMousePos = { x: 0, y: 0 };

        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', () => {
            if (window.gameInstance && window.gameInstance.gameState === 'PLAYING') {
                if (!document.pointerLockElement && window.innerWidth > 768) {
                    canvas.requestPointerLock();
                }
            }
        });

        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            lastMousePos = { x: e.clientX, y: e.clientY };
            if (e.button === 0) this.actions.fire = true;
            if (e.button === 1) this.triggerActionOnce('melee');
            if (e.button === 2) {
                e.preventDefault();
                this.actions.aim = !this.actions.aim;
            }
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('mousemove', (e) => {
            let dx = 0, dy = 0;
            if (document.pointerLockElement) {
                dx = e.movementX;
                dy = e.movementY;
            } else if (isMouseDown) {
                dx = e.clientX - lastMousePos.x;
                dy = e.clientY - lastMousePos.y;
                lastMousePos = { x: e.clientX, y: e.clientY };
            }

            if (dx !== 0 || dy !== 0) {
                const sensitivity = this.actions.aim ? 0.002 : 0.0035;
                this.cameraDelta.x += dx * sensitivity;
                this.cameraDelta.y += dy * sensitivity;
            }
        });

        window.addEventListener('mouseup', (e) => {
            isMouseDown = false;
            if (e.button === 0) this.actions.fire = false;
        });
    }

    updateKeyboardState() {
        let x = 0, z = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;

        const len = Math.hypot(x, z);
        if (len > 0) { x /= len; z /= len; }

        if (len > 0 || Object.values(this.keys).some(v => v)) {
            this.moveVector.x = x;
            this.moveVector.z = z;
        }

        this.actions.sprint = !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'];
    }

    // --- MOBILE TOUCH CONTROLS ---
    initTouchControls() {
        const leftZone = document.getElementById('joystick-left-zone');
        const leftThumb = document.getElementById('joystick-left-thumb');
        const rightZone = document.getElementById('joystick-right-zone');
        const rightThumb = document.getElementById('joystick-right-thumb');

        if (leftZone) {
            leftZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                this.leftJoyTouchId = touch.identifier;
                const rect = leftZone.getBoundingClientRect();
                this.leftJoyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                this.updateLeftJoystick(touch, leftThumb);
            }, { passive: false });

            leftZone.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.leftJoyTouchId) {
                        this.updateLeftJoystick(e.changedTouches[i], leftThumb);
                    }
                }
            }, { passive: false });

            const resetLeft = (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.leftJoyTouchId) {
                        this.leftJoyTouchId = null;
                        this.moveVector = { x: 0, z: 0 };
                        if (leftThumb) leftThumb.style.transform = `translate(-50%, -50%)`;
                    }
                }
            };
            leftZone.addEventListener('touchend', resetLeft);
            leftZone.addEventListener('touchcancel', resetLeft);
        }

        if (rightZone) {
            rightZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                this.rightJoyTouchId = touch.identifier;
                const rect = rightZone.getBoundingClientRect();
                this.rightJoyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                this.updateRightJoystick(touch, rightThumb);
            }, { passive: false });

            rightZone.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.rightJoyTouchId) {
                        this.updateRightJoystick(e.changedTouches[i], rightThumb);
                    }
                }
            }, { passive: false });

            const resetRight = (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === this.rightJoyTouchId) {
                        this.rightJoyTouchId = null;
                        if (rightThumb) rightThumb.style.transform = `translate(-50%, -50%)`;
                    }
                }
            };
            rightZone.addEventListener('touchend', resetRight);
            rightZone.addEventListener('touchcancel', resetRight);
        }

        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.clientX > window.innerWidth * 0.4 && this.rightJoyTouchId === null && this.aimDragTouchId === null) {
                    if (!touch.target.closest('.touch-btn') && !touch.target.closest('.joystick-container') && !touch.target.closest('.btn-secondary')) {
                        this.aimDragTouchId = touch.identifier;
                        this.aimLastPos = { x: touch.clientX, y: touch.clientY };
                    }
                }
            }
        });

        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.aimDragTouchId) {
                    const dx = touch.clientX - this.aimLastPos.x;
                    const dy = touch.clientY - this.aimLastPos.y;
                    const sensitivity = this.actions.aim ? 0.003 : 0.005;
                    this.cameraDelta.x += dx * sensitivity;
                    this.cameraDelta.y += dy * sensitivity;
                    this.aimLastPos = { x: touch.clientX, y: touch.clientY };
                }
            }
        });

        const resetDrag = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.aimDragTouchId) {
                    this.aimDragTouchId = null;
                }
            }
        };
        window.addEventListener('touchend', resetDrag);
        window.addEventListener('touchcancel', resetDrag);

        // Bind Action Buttons
        this.bindTouchButton('touch-btn-fire', 'fire', true);
        this.bindTouchButton('touch-btn-melee', 'melee', false);
        this.bindTouchButton('touch-btn-crouch', 'crouch', false, true);
        this.bindTouchButton('touch-btn-aim', 'aim', false, true);
        this.bindTouchButton('touch-btn-jump', 'jump', false);
        this.bindTouchButton('touch-btn-flight', 'flight', false, true);
        this.bindTouchButton('touch-btn-ascend', 'ascend', true);
        this.bindTouchButton('touch-btn-descend', 'descend', true);
        this.bindTouchButton('touch-btn-sprint', 'sprint', true);
        this.bindTouchButton('touch-btn-dodge', 'dodge', false);
        this.bindTouchButton('touch-btn-reload', 'reload', false);
        this.bindTouchButton('touch-btn-special', 'special', false);

        const weaponBtn = document.getElementById('touch-btn-weapon');
        if (weaponBtn) {
            weaponBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (window.gameInstance && window.gameInstance.player) {
                    const cur = window.gameInstance.player.currentWeaponIdx;
                    this.actions.switchWeapon = (cur + 1) % 5;
                }
            }, { passive: false });
        }
    }

    updateLeftJoystick(touch, thumb) {
        const dx = touch.clientX - this.leftJoyCenter.x;
        const dy = touch.clientY - this.leftJoyCenter.y;
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist, this.joyRadius);
        const angle = Math.atan2(dy, dx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;

        if (thumb) thumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

        this.moveVector.x = thumbX / this.joyRadius;
        this.moveVector.z = thumbY / this.joyRadius;
    }

    updateRightJoystick(touch, thumb) {
        const dx = touch.clientX - this.rightJoyCenter.x;
        const dy = touch.clientY - this.rightJoyCenter.y;
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist, this.joyRadius);
        const angle = Math.atan2(dy, dx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;

        if (thumb) thumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

        const sensitivity = this.actions.aim ? 0.03 : 0.05;
        this.cameraDelta.x += (thumbX / this.joyRadius) * sensitivity;
        this.cameraDelta.y += (thumbY / this.joyRadius) * sensitivity;
    }

    bindTouchButton(btnId, actionName, isContinuous, isToggle = false) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isToggle) {
                this.toggleAction(actionName);
                btn.classList.toggle('active', this.actions[actionName]);
            } else if (isContinuous) {
                this.actions[actionName] = true;
                btn.classList.add('active');
            } else {
                this.triggerActionOnce(actionName);
                btn.classList.add('active');
            }
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (isContinuous && !isToggle) {
                this.actions[actionName] = false;
                btn.classList.remove('active');
            } else if (!isToggle) {
                setTimeout(() => btn.classList.remove('active'), 120);
            }
        }, { passive: false });
    }

    toggleAction(actionName) {
        this.actions[actionName] = !this.actions[actionName];
    }

    triggerActionOnce(actionName) {
        this.actions[actionName] = true;
        setTimeout(() => {
            this.actions[actionName] = false;
        }, 80);
    }

    consumeCameraDelta() {
        const delta = { x: this.cameraDelta.x, y: this.cameraDelta.y };
        this.cameraDelta.x = 0;
        this.cameraDelta.y = 0;
        return delta;
    }
}

window.controlsManager = new ControlsManager();
