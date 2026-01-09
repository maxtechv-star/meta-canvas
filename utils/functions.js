module.exports = {

    /**
     * Format variable names like "username-box" -> "prefixUsernameBox"
     * @param {string} prefix Prefix to use (e.g., "color" or "text" or "opacity")
     * @param {string} variable Variable name with dashes
     * @returns formatted variable name
     */
    formatVariable(prefix, variable){
        if (!variable) return prefix;
        const formattedVariable = variable.toString().toLowerCase()
        .split("-").map((word) => word.charAt(0).toUpperCase()+word.substr(1).toLowerCase()).join("");
        return prefix + formattedVariable;
    },
    
    /**
     * Reduce font size until text fits inside width
     * @param {Canvas} canvas Canvas instance
     * @param {string} text Text to measure
     * @param {number} defaultFontSize Starting font size in px
     * @param {number} width Max width in px
     * @param {string} font Font family
     * @returns final font setting string
     */
    applyText(canvas, text, defaultFontSize = 40, width = 300, font = 'Sans'){
        const ctx = canvas.getContext("2d");
        let size = defaultFontSize;
        do {
            ctx.font = `${size}px ${font}`;
            size -= 1;
        } while (size > 6 && ctx.measureText(text).width > width);
        return ctx.font;
    }

};