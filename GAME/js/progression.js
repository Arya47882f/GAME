// Progression System for Shadow Rift: Character Selection, XP/Leveling, Weapon Upgrades
class ProgressionManager {
    constructor() {
        // Player Level & XP
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.statPoints = 0;

        // Collected Currency
        this.riftCrystals = 5; // Start with 5 bonus crystals

        // Selected Character Hero Profile
        this.characters = [
            {
                id: 'kage_ryu',
                name: 'KAGE-RYU',
                title: 'Shadow Shinobi',
                desc: 'Balanced agility, fast stamina recovery, and extended flight time.',
                avatar: '🥷',
                color: 0x00f0ff,
                hpBonus: 0,
                staminaBonus: 20,
                damageMult: 1.0,
                speedMult: 1.1,
                flightDrainMult: 0.8
            },
            {
                id: 'phantom_kira',
                name: 'PHANTOM-KIRA',
                title: 'Void Spellblade',
                desc: 'Special energy specialist with 30% faster skill cooldowns and higher elemental damage.',
                avatar: '🔮',
                color: 0xa855f7,
                hpBonus: -10,
                staminaBonus: 10,
                damageMult: 1.25,
                speedMult: 1.0,
                flightDrainMult: 1.0
            },
            {
                id: 'apex_zero',
                name: 'APEX-ZERO',
                title: 'Mecha Ronin',
                desc: 'Heavy cyber-armor with +40 HP bonus and recoil reduction.',
                avatar: '🛡️',
                color: 0x10b981,
                hpBonus: 40,
                staminaBonus: -10,
                damageMult: 1.1,
                speedMult: 0.92,
                flightDrainMult: 1.2
            }
        ];

        this.selectedCharacterIdx = 0;

        // Weapon Upgrade Levels (+0 to +5)
        this.weaponUpgrades = [0, 0, 0, 0, 0];
    }

    getSelectedCharacter() {
        return this.characters[this.selectedCharacterIdx];
    }

    selectCharacter(index) {
        if (index >= 0 && index < this.characters.length) {
            this.selectedCharacterIdx = index;
            this.updateCharacterUI();
        }
    }

    addXP(amount) {
        this.xp += amount;
        let leveledUp = false;

        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.35);
            this.statPoints += 2;
            leveledUp = true;
        }

        if (leveledUp) {
            this.showLevelUpNotification();
            if (window.soundManager && window.soundManager.playVictory) {
                window.soundManager.playVictory();
            }
            if (window.gameInstance && window.gameInstance.player) {
                // Heal on level up
                window.gameInstance.player.hp = window.gameInstance.player.maxHp;
            }
        }

        this.updateProgressionHUD();
    }

    addCrystals(count) {
        this.riftCrystals += count;
        this.updateProgressionHUD();
    }

    canUpgradeWeapon(weaponIdx) {
        const curLvl = this.weaponUpgrades[weaponIdx];
        if (curLvl >= 5) return false;
        const cost = (curLvl + 1) * 3;
        return this.riftCrystals >= cost;
    }

    upgradeWeapon(weaponIdx) {
        if (this.canUpgradeWeapon(weaponIdx)) {
            const curLvl = this.weaponUpgrades[weaponIdx];
            const cost = (curLvl + 1) * 3;
            this.riftCrystals -= cost;
            this.weaponUpgrades[weaponIdx]++;

            // Apply weapon stat boost
            if (window.gameInstance && window.gameInstance.player) {
                const w = window.gameInstance.player.weapons[weaponIdx];
                w.damage = Math.round(w.damage * 1.2);
                w.magSize = Math.round(w.magSize * 1.15);
            }

            if (window.soundManager) window.soundManager.playReload();
            this.updateProgressionHUD();
            this.updateUpgradeModalUI();
            return true;
        }
        return false;
    }

    showLevelUpNotification() {
        const toast = document.createElement('div');
        toast.className = 'level-up-toast';
        toast.innerHTML = `🌟 LEVEL UP! LEVEL ${this.level} UNLOCKED 🌟`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    updateProgressionHUD() {
        const lvlElem = document.getElementById('hud-player-level');
        const xpBar = document.getElementById('hud-xp-bar');
        const crystalElem = document.getElementById('hud-crystals-count');

        if (lvlElem) lvlElem.innerText = `LVL ${this.level}`;
        if (xpBar) xpBar.style.width = `${(this.xp / this.xpToNextLevel) * 100}%`;
        if (crystalElem) crystalElem.innerText = this.riftCrystals;
    }

    updateCharacterUI() {
        const hero = this.getSelectedCharacter();
        const charName = document.getElementById('char-name-display');
        const charDesc = document.getElementById('char-desc-display');
        const charAvatar = document.getElementById('char-avatar-display');

        if (charName) charName.innerText = hero.name;
        if (charDesc) charDesc.innerText = hero.desc;
        if (charAvatar) charAvatar.innerText = hero.avatar;

        const cards = document.querySelectorAll('.char-card');
        cards.forEach((card, idx) => {
            card.classList.toggle('selected', idx === this.selectedCharacterIdx);
        });
    }

    updateUpgradeModalUI() {
        const list = document.getElementById('upgrade-weapons-list');
        if (!list || !window.gameInstance || !window.gameInstance.player) return;

        list.innerHTML = '';
        window.gameInstance.player.weapons.forEach((w, i) => {
            const curLvl = this.weaponUpgrades[i];
            const cost = (curLvl + 1) * 3;
            const canAfford = this.riftCrystals >= cost && curLvl < 5;

            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${w.name} <span class="upgrade-lvl">+${curLvl}</span></div>
                    <div class="upgrade-stats">DMG: ${w.damage} | MAG: ${w.magSize}</div>
                </div>
                <button class="btn-upgrade-action ${canAfford ? '' : 'disabled'}" data-weapon-idx="${i}">
                    ${curLvl >= 5 ? 'MAX LEVEL' : `UPGRADE (${cost} 💎)`}
                </button>
            `;

            const btn = item.querySelector('.btn-upgrade-action');
            if (btn && curLvl < 5) {
                btn.addEventListener('click', () => {
                    this.upgradeWeapon(i);
                });
            }
            list.appendChild(item);
        });
    }
}

window.progressionManager = new ProgressionManager();
