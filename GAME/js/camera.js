// Third-Person 3D Camera System with Aim Down Sights (ADS) Zoom & Crouch Stance Height
class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.baseDistance = 5.5;  // Standard orbit distance
        this.aimDistance = 3.6;   // Zoomed ADS distance
        this.distance = 5.5;

        this.baseHeightOffset = 1.6;
        this.crouchHeightOffset = 1.0;

        this.yaw = 0;
        this.pitch = 0.2;

        // Pitch Constraints
        this.minPitch = -0.4;
        this.maxPitch = 1.1;

        this.targetPos = new THREE.Vector3();
        this.currentPos = new THREE.Vector3();

        // Shake offset
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // FOV states for ADS zoom
        this.baseFOV = 65;
        this.aimFOV = 42;
    }

    update(targetMesh, cameraDelta, deltaTime, isAiming = false, isCrouching = false) {
        if (!targetMesh) return;

        // Apply camera delta inputs
        this.yaw += cameraDelta.x;
        this.pitch = THREE.MathUtils.clamp(this.pitch - cameraDelta.y, this.minPitch, this.maxPitch);

        // Smoothly interpolate FOV & distance for Aim Down Sights (ADS)
        const targetFOV = isAiming ? this.aimFOV : this.baseFOV;
        const targetDist = isAiming ? this.aimDistance : this.baseDistance;
        const heightOffset = isCrouching ? this.crouchHeightOffset : this.baseHeightOffset;

        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, deltaTime * 12);
        this.camera.updateProjectionMatrix();

        this.distance = THREE.MathUtils.lerp(this.distance, targetDist, deltaTime * 12);

        // Crosshair UI feedback for ADS
        const ch = document.getElementById('crosshair');
        if (ch) {
            ch.classList.toggle('ads-aim', isAiming);
        }

        // Target position (Lower height when crouching)
        const shoulderOffset = isAiming ? 0.4 : 0;
        const idealTargetPos = new THREE.Vector3()
            .copy(targetMesh.position)
            .add(new THREE.Vector3(0, heightOffset, 0));

        this.targetPos.lerp(idealTargetPos, deltaTime * 14);

        // Calculate spherical orbital position
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const sinYaw = Math.sin(this.yaw);
        const cosYaw = Math.cos(this.yaw);

        const rightVec = this.getRightVector();

        const offsetX = this.distance * cosPitch * sinYaw + rightVec.x * shoulderOffset;
        const offsetY = this.distance * sinPitch;
        const offsetZ = this.distance * cosPitch * cosYaw + rightVec.z * shoulderOffset;

        const desiredCameraPos = new THREE.Vector3(
            this.targetPos.x + offsetX,
            this.targetPos.y + offsetY,
            this.targetPos.z + offsetZ
        );

        // Camera Shake effect
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            desiredCameraPos.x += shakeX;
            desiredCameraPos.y += shakeY;
        }

        this.camera.position.copy(desiredCameraPos);
        this.camera.lookAt(this.targetPos);
    }

    shake(intensity = 0.25, duration = 0.15) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    getForwardVector() {
        return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    }

    getRightVector() {
        return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
    }
}

window.CameraController = CameraController;
