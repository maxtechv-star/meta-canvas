# meta-canvas

Canvas generators with a Vercel endpoint.

Usage
- Deploy this repository to Vercel.
- The endpoint is available at `/api/image`.
- A demo UI is at `/`.

Query parameters
- type: welcome|goodbye|burn|lick|demote (default welcome)
- username, guild, memberCount, avatar, guildIcon, background, textMessage

Notes
- This project prefers `@napi-rs/canvas` (prebuilt) but will fall back to `canvas`.
- Keep `assets/fonts` and `assets/img` in place.
- For local testing run `node test/render-test.js`.