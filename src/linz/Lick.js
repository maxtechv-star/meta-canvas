const path = require('path');
const Canvas = require('../../utils/canvas');
const { formatVariable, applyText } = require('../../utils/functions');

module.exports = class Lickanime {

    constructor() {
        this.username = "Clyde";
        this.guildName = "ServerName";
        this.colorTitleBorder = "#000000";
        this.colorMemberCount = "#ffffff";
        this.textMemberCount = "- {count}th member !";
        this.memberCount = "0";
        this.backgroundImage = path.join(__dirname, '../../assets/img/putih.png');
        this.avatar = path.join(__dirname, '../../assets/img/default-avatar.png');
        this.lickimg = path.join(__dirname, '../../assets/img/girl-lick.png');
    }

    setAvatar(value) {
        this.avatar = value;
        return this;
    }
    
    setColor(variable, value) {
        const formattedVariable = formatVariable("color", variable);
        if (this[formattedVariable] !== undefined) this[formattedVariable] = value;
        return this;
    }
      
    setText(variable, value) {
        const formattedVariable = formatVariable("text", variable);
        if (this[formattedVariable] !== undefined) this[formattedVariable] = value;
        return this;
    }
    
    setOpacity(variable, value) {
        const formattedVariable = formatVariable("opacity", variable);
        if (this[formattedVariable] !== undefined) this[formattedVariable] = value;
        return this;
    }

    async _loadImage(src) {
        if (!src) throw new Error('Empty image source');
        if (Buffer.isBuffer(src)) return await Canvas.loadImage(src);
        const s = src.toString();
        if (/^https?:\/\//i.test(s)) {
            let fetchFn = global.fetch;
            if (!fetchFn) fetchFn = require('node-fetch');
            const res = await fetchFn(s);
            const buf = await res.arrayBuffer();
            return await Canvas.loadImage(Buffer.from(buf));
        } else {
            return await Canvas.loadImage(s);
        }
    }

    async toAttachment() {
        // Create canvas
        const canvas = Canvas.createCanvas(545, 562);
        const ctx = canvas.getContext("2d");

        // Draw background
        try {
            const background = await this._loadImage(this.backgroundImage);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw avatar (if available)
        try {
            const avatarImg = await this._loadImage(this.avatar);
            ctx.drawImage(avatarImg, 5, 200, 100, 100);
        } catch (e) {
            // ignore
        }

        // lick overlay image
        try {
            const b = await this._loadImage(this.lickimg);
            ctx.drawImage(b, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            // ignore
        }
        
        return canvas;
    }
};