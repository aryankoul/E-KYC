// var jimp = require("jimp");
// var fs = require("fs")
// var QrCode = require('qrcode-reader');
var QrcodeDecoder = require('qrcode-decoder');

var qr = new QrcodeDecoder();
qr.decodeFromImage("C:\Users\Prakhar Maheshwari\Desktop\major\E-KYC\qrcode.png").then((res) => {
    console.log(res);
});
// qr = new QrCode()
// qr.decode("http://localhost:8000/download/1-1589638055265.jpg")
// console.log(qr)