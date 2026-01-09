// Canvas wrapper that prefers @napi-rs/canvas, falls back to node-canvas.
// Export the Canvas namespace used across the project.

let Canvas;
try {
  // prefer @napi-rs/canvas (prebuilt native)
  Canvas = require('@napi-rs/canvas');
} catch (e) {
  // fallback to node-canvas
  Canvas = require('canvas');
}

module.exports = Canvas;