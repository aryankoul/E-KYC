var QRCode = require('qrcode')

QRCode.toFile('./qr.png','xyz',{type:''},function(err){
  if (err) throw err
  console.log('done');
})