// Mission & Quest System for Shadow Rift
class QuestSystem {
    constructor() {
        this.missions = [
            {
                id: 'm1',
                title: 'PURGE THE SHADOWS',
                desc: 'Defeat 5 Shadow Stalkers',
                targetType: 'kill',
                targetCount: 5,
                currentCount: 0,
                completed: false,
                rewardXP: 250,
                rewardCrystals: 5
            },
            {
                id: 'm2',
                title: 'SECRET SANCTUARY',
                desc: 'Discover a Hidden Shrine in the village',
                targetType: 'explore',
                targetCount: 1,
                currentCount: 0,
                completed: false,
                rewardXP: 300,
                rewardCrystals: 8
            },
            {
                id: 'm3',
                title: 'SLAY THE OVERLORD',
                desc: 'Vanquish Kage-No-Akuma (Boss Phase 3)',
                targetType: 'boss',
                targetCount: 1,
                currentCount: 0,
                completed: false,
                rewardXP: 800,
                rewardCrystals: 15
            }
        ];

        this.currentMissionIdx = 0;
    }

    getCurrentMission() {
        return this.missions[this.currentMissionIdx];
    }

    onKill() {
        const m = this.getCurrentMission();
        if (m && !m.completed && (m.targetType === 'kill' || m.targetType === 'boss')) {
            m.currentCount++;
            if (m.currentCount >= m.targetCount) {
                this.completeMission(m);
            }
            this.updateQuestHUD();
        }
    }

    onExplore() {
        const m = this.getCurrentMission();
        if (m && !m.completed && m.targetType === 'explore') {
            m.currentCount = 1;
            this.completeMission(m);
            this.updateQuestHUD();
        }
    }

    onBossDefeated() {
        const m = this.missions.find(x => x.id === 'm3');
        if (m && !m.completed) {
            m.currentCount = 1;
            this.completeMission(m);
            this.updateQuestHUD();
        }
    }

    completeMission(mission) {
        mission.completed = true;
        if (window.progressionManager) {
            window.progressionManager.addXP(mission.rewardXP);
            window.progressionManager.addCrystals(mission.rewardCrystals);
        }

        // Show Toast
        this.showQuestToast(mission.title);

        // Advance to next mission
        if (this.currentMissionIdx < this.missions.length - 1) {
            this.currentMissionIdx++;
        }
    }

    showQuestToast(title) {
        const toast = document.createElement('div');
        toast.className = 'quest-toast';
        toast.innerHTML = `📜 MISSION COMPLETE! <br><strong>${title}</strong>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    updateQuestHUD() {
        const titleElem = document.getElementById('hud-quest-title');
        const countElem = document.getElementById('hud-quest-count');

        const m = this.getCurrentMission();
        if (m) {
            if (titleElem) titleElem.innerText = m.completed ? "ALL MISSIONS CLEARED!" : m.desc;
            if (countElem) countElem.innerText = m.completed ? "✓ DONE" : `[${m.currentCount}/${m.targetCount}]`;
        }
    }
}

window.questSystem = new QuestSystem();
