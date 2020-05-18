const QRReader = require('qrcode-reader');
const fs = require('fs');
const jimp = require('jimp');

run().catch(error => console.error(error.stack));

async function run() {
  const img = await jimp.read(fs.readFileSync('./qrcode.png'));

  const qr = new QRReader();

  // qrcode-reader's API doesn't support promises, so wrap it
  const value = await new Promise((resolve, reject) => {
    qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
    qr.decode(img.bitmap);
  });

  console.log(value);
  console.log(1);
  // http://asyncawait.net
  console.log(value.result);
}