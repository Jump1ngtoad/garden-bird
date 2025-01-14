class Abilities {
    constructor() {
        this.canUse = true;
        this.isUsing = false;
        this.rechargeTime = 10;
        this.currentCooldown = 0;
        this.timer = null;
    }

    startPhasing() {
        if (this.canUse) {
            this.isUsing = true;
            this.canUse = false;
            this.currentCooldown = this.rechargeTime;
            
            this.timer = setTimeout(() => {
                this.canUse = true;
            }, this.rechargeTime * 1000);

            setTimeout(() => {
                this.isUsing = false;
            }, 3000);
        }
    }

    startSlowdown(baseSpeed, callback) {
        if (this.canUse) {
            this.isUsing = true;
            this.canUse = false;
            this.currentCooldown = this.rechargeTime;
            callback(baseSpeed * 0.5);

            setTimeout(() => {
                callback(baseSpeed);
                this.isUsing = false;
            }, 3000);

            this.timer = setTimeout(() => {
                this.canUse = true;
            }, this.rechargeTime * 1000);
        }
    }

    update() {
        if (this.currentCooldown > 0) {
            this.currentCooldown = Math.max(0, this.currentCooldown - (1/60));
        }
    }
} 