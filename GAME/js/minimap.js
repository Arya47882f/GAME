// 2D Top-Down Radar / Minimap Overlay for Shadow Rift
class MinimapController {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.size = this.canvas.width;
        this.center = this.size / 2;
        this.scale = 0.8; // World meters to radar pixels scale
    }

    render(player, enemies) {
        if (!this.ctx || !player) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.size, this.size);

        // 1. Radar Grid & Background
        ctx.fillStyle = '#050713';
        ctx.beginPath();
        ctx.arc(this.center, this.center, this.center - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.center, this.center, this.center * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.center, 0); ctx.lineTo(this.center, this.size);
        ctx.moveTo(0, this.center); ctx.lineTo(this.size, this.center);
        ctx.stroke();

        // Player position reference
        const pPos = player.mesh.position;

        // 2. Render Enemies
        enemies.forEach(enemy => {
            const relX = (enemy.position.x - pPos.x) * this.scale;
            const relZ = (enemy.position.z - pPos.z) * this.scale;

            const mapX = this.center + relX;
            const mapY = this.center + relZ;

            // Only draw if inside circular radar range
            const distSq = (mapX - this.center) ** 2 + (mapY - this.center) ** 2;
            if (distSq < (this.center - 6) ** 2) {
                ctx.beginPath();
                if (enemy.userData.type === 'boss') {
                    // Boss icon: pulsing large red circle
                    ctx.fillStyle = '#ef4444';
                    ctx.arc(mapX, mapY, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (enemy.userData.type === 'archer') {
                    ctx.fillStyle = '#a855f7';
                    ctx.arc(mapX, mapY, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = '#ef4444';
                    ctx.arc(mapX, mapY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // 3. Render Player Icon & Facing Direction Cone
        ctx.save();
        ctx.translate(this.center, this.center);

        // Player facing angle from mesh rotation
        const facingAngle = player.mesh.rotation.y;

        // Draw facing cone
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 20, facingAngle - Math.PI / 4 + Math.PI / 2, facingAngle + Math.PI / 4 + Math.PI / 2);
        ctx.fill();

        // Player Dot (Cyan)
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

window.MinimapController = MinimapController;
