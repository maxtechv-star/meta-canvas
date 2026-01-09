// Local test script: writes test.png using Welcome generator
const fs = require('fs');
const path = require('path');
const lib = require(path.join(__dirname, '..', 'index.js'));

(async () => {
  try {
    const w = new lib.Welcome();
    w.setUsername('LocalTester');
    w.setGuildName('LocalServer');
    w.setMemberCount('42');
    // if you have local images, set the paths, otherwise default assets will be used
    // w.setAvatar('./assets/img/default-avatar.png');

    const canvas = await w.toAttachment();
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'test.png'), buffer);
    console.log('test/test.png created');
  } catch (e) {
    console.error('render-test error', e);
  }
})();