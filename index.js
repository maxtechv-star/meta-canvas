// index.js - library entry point
// Registers fonts and exports the generator classes

const path = require('path');
const Canvas = require('./utils/canvas'); // shared canvas wrapper

// Register fonts (if present). Missing fonts won't throw (try/catch).
try {
  Canvas.registerFont(path.join(__dirname, 'assets', 'fonts', 'theboldfont.ttf'), { family: 'Bold' });
} catch (e) {}
try {
  Canvas.registerFont(path.join(__dirname, 'assets', 'fonts', 'SketchMatch.ttf'), { family: 'SketchMatch' });
} catch (e) {}
try {
  Canvas.registerFont(path.join(__dirname, 'assets', 'fonts', 'LuckiestGuy-Regular.ttf'), { family: 'luckiest guy' });
} catch (e) {}
try {
  Canvas.registerFont(path.join(__dirname, 'assets', 'fonts', 'KeepCalm-Medium.ttf'), { family: 'KeepCalm' });
} catch (e) {}

// Exports - ensure these match the class names in src/*
module.exports.Base = require('./src/greetings/Base');
module.exports.Lickanime = require('./src/linz/Lick');
module.exports.Burnsp = require('./src/linz/Burn');
module.exports.Welcome = require('./src/greetings/Welcome');
module.exports.Goodbye = require('./src/greetings/Goodbye');
module.exports.Demote = require('./src/greetings/Demote');