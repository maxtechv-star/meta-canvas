const path = require('path');
const Canvas = require('../../utils/canvas');
const { formatVariable, applyText } = require('../../utils/functions');

module.exports = class Greeting {

    constructor() {
        this.username = "Clyde";
        this.guildName = "ServerName";
        this.colorTitleBorder = "#000000";
        this.colorMemberCount = "#ffffff";
        this.textMemberCount = "- {count}th member !";
        this.memberCount = "0";
        this.backgroundImage = path.join(__dirname, '../../assets/img/1px.png');
        this.avatar = path.join(__dirname, '../../assets/img/default-avatar.png');
        this.icon = path.join(__dirname, '../../assets/img/default-avatar.png');
        this.assent = path.join(__dirname, '../../assets/img/1px.png'); // overlay image
        this.opacityBorder = "0.4";
        this.colorBorder = "#000000";
        this.colorUsername = "#ffffff";
        this.colorUsernameBox = "#000000";
        this.opacityUsernameBox = "0.4";
        this.discriminator = "XXXX";
        this.colorDiscriminator = "#ffffff";
        this.opacityDiscriminatorBox = "0.4";
        this.colorDiscriminatorBox = "#000000";
        this.colorMessage = "#ffffff";
        this.colorHashtag = "#ffffff";
        this.colorBackground = "#000000";
        this.colorAvatar = "#ffffff";
        this.textMessage = "{server}";
        this.textUrl = ""; // NEW: domain / URL text shown bottom-right
    }

    setAvatar(value) {
        this.avatar = value;
        return this;
    }
    
    setGuildIcon(value) {
        this.icon = value;
        return this;
    }
    
    setDiscriminator(value) {
        this.discriminator = value;
        return this;
    }
    
    setUsername(value) {
        this.username = value;
        return this;
    }
    
    setGuildName(value) {
        this.guildName = value;
        return this;
    }
    
    setMemberCount(value) {
        this.memberCount = value;
        return this;
    }
    
    setBackground(value) {
        this.backgroundImage = value;
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

    // Internal helper to load image from various sources (http, local path, data:)
    async _loadImage(src) {
        if (!src) throw new Error('Empty image source');
        // If it's a buffer already, use Canvas.loadImage
        if (Buffer.isBuffer(src)) return await Canvas.loadImage(src);
        const s = src.toString();
        if (/^https?:\/\//i.test(s)) {
            // fetch remote image
            let fetchFn = global.fetch;
            if (!fetchFn) {
                // node environment fallback
                fetchFn = require('node-fetch');
            }
            const res = await fetchFn(s);
            if (!res.ok) throw new Error('Failed to fetch remote image: ' + res.status);
            const buf = await res.arrayBuffer();
            return await Canvas.loadImage(Buffer.from(buf));
        } else if (/^data:/i.test(s)) {
            return await Canvas.loadImage(s);
        } else {
            // local file path
            return await Canvas.loadImage(s);
        }
    }

    async toAttachment() {
        // Create canvas
        const canvas = Canvas.createCanvas(1024, 450);
        const ctx = canvas.getContext("2d");

        const guildName = (this.textMessage || "{server}").replace(/{server}/g, this.guildName);
        const memberCount = (this.textMemberCount || "- {count}th member !").replace(/{count}/g, this.memberCount);

        // Draw background fill
        ctx.fillStyle = this.colorBackground || "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background image (if available)
        try {
            const background = await this._loadImage(this.backgroundImage);
            if (background) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            // ignore missing background
        }

        // Draw overlay (assent)
        try {
            const overlay = await this._loadImage(this.assent);
            if (overlay) ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        } catch (e) {}

        // Draw membercount (left area)
        ctx.fillStyle = this.colorMemberCount || "#ffffff";
        ctx.font = "22px Bold";
        ctx.textAlign = 'left';
        ctx.fillText(memberCount, 90, canvas.height - 15);

        // Draw guild name (right side area)
        ctx.globalAlpha = 1;
        ctx.font = "45px Bold";
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colorMessage || "#ffffff";
        let name = guildName.length > 13 ? guildName.substring(0, 10) + "..." : guildName;
        ctx.fillText(name, canvas.width - 225, canvas.height - 44);

        // Draw username near avatar: use applyText to fit inside a box
        try {
            const usernameMaxWidth = 260; // width reserved near avatar
            ctx.textAlign = 'center';
            ctx.fillStyle = this.colorUsername || "#ffffff";
            ctx.font = applyText(canvas, this.username, 45, usernameMaxWidth, 'Bold');
            // position above bottom-left area near avatar
            const userX = 180;
            const userY = canvas.height - 60;
            ctx.fillText(this.username, userX, userY);
        } catch (e) {
            // fallback plain draw
            try {
                ctx.font = "30px Bold";
                ctx.fillText(this.username, 180, canvas.height - 60);
            } catch (er) {}
        }

        // Draw avatar circle (with stroke)
        try {
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = this.colorAvatar || "#ffffff";
            ctx.arc(180, 160, 110, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();

            // Clip to avatar circle and draw
            ctx.beginPath();
            ctx.arc(180, 160, 100, 0, Math.PI * 2, true);
            ctx.clip();
            const avatarImg = await this._loadImage(this.avatar);
            ctx.drawImage(avatarImg, 45, 40, 270, 270);
            ctx.restore();
        } catch (e) {
            try { ctx.restore(); } catch (er) {}
        }
         
        // Draw guild icon circle
        try {
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = this.colorAvatar || "#ffffff";
            ctx.arc(canvas.width - 150, canvas.height - 200, 80, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(canvas.width - 150, canvas.height - 200, 70, 0, Math.PI * 2, true);
            ctx.clip();

            const guildIco = await this._loadImage(this.icon);
            ctx.drawImage(guildIco, canvas.width - 230, canvas.height - 280, 160, 160);
            ctx.restore();
        } catch (e) {
            try { ctx.restore(); } catch (er) {}
        }

        // Draw optional URL / domain bottom-right
        try {
            const urlText = (this.textUrl || "").toString().trim();
            if (urlText.length > 0) {
                const maxWidth = 360;
                ctx.textAlign = 'right';
                ctx.fillStyle = this.colorHashtag || "#ffffff";
                ctx.font = applyText(canvas, urlText, 18, maxWidth, 'KeepCalm');
                ctx.fillText(urlText, canvas.width - 20, canvas.height - 12);
            }
        } catch (e) {
            // ignore
        }
        
        return canvas;
    }
};