const fs = require('fs');
const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
fs.writeFileSync('backend/test_upload.png', Buffer.from(b64,'base64'));
console.log('wrote backend/test_upload.png');
