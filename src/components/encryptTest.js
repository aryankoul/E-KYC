var forge = require('node-forge');
var fs = require('fs');

function generatePassword() {
    var letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let password = ''
    const len = letters.length
    for(let i = 0; i < 8; i++) {
    password += letters[Math.floor(Math.random() * len)]
    }
    return password
}
 
// openssl enc -des3 -in input.txt -out input.enc
function encrypt(input, password) {
//   var input = fs.readFileSync(input, {encoding: 'binary'});
  
//   console.log(password)
  // 3DES key and IV sizes
  var keySize = 24;
  var ivSize = 8;
 
  // get derived bytes
  // Notes:
  // 1. If using an alternative hash (eg: "-md sha1") pass
  //   "forge.md.sha1.create()" as the final parameter.
  // 2. If using "-nosalt", set salt to null.
  var salt = forge.random.getBytesSync(8);
  // var md = forge.md.sha1.create(); // "-md sha1"
  var derivedBytes = forge.pbe.opensslDeriveBytes(
    password, salt, keySize + ivSize/*, md*/);
  var buffer = forge.util.createBuffer(derivedBytes);
  var key = buffer.getBytes(keySize);
  var iv = buffer.getBytes(ivSize);
 
  var cipher = forge.cipher.createCipher('3DES-CBC', key);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(input, 'binary'));
  cipher.finish();
 
  var output = forge.util.createBuffer();
 
  // if using a salt, prepend this to the output:
  if(salt !== null) {
    output.putBytes('Salted__'); // (add to match openssl tool output)
    output.putBytes(salt);
  }
  output.putBuffer(cipher.output);
 
//   fs.writeFileSync('input.enc', output.getBytes(), {encoding: 'binary'});
    return output; 
}
 
// openssl enc -d -des3 -in input.enc -out input.dec.txt
function decrypt(input, password) {
  
 
  // parse salt from input
  input = forge.util.createBuffer(input, 'binary');
  // skip "Salted__" (if known to be present)
  input.getBytes('Salted__'.length);
  // read 8-byte salt
  var salt = input.getBytes(8);
 
  // Note: if using "-nosalt", skip above parsing and use
  // var salt = null;
 
  // 3DES key and IV sizes
  var keySize = 24;
  var ivSize = 8;
 
  var derivedBytes = forge.pbe.opensslDeriveBytes(
    password, salt, keySize + ivSize);
  var buffer = forge.util.createBuffer(derivedBytes);
  var key = buffer.getBytes(keySize);
  var iv = buffer.getBytes(ivSize);
 
  var decipher = forge.cipher.createDecipher('3DES-CBC', key);
  decipher.start({iv: iv});
  decipher.update(input);
  var result = decipher.finish(); // check 'result' for true/false
  console.log(result)
 
//   fs.writeFileSync(
//     'input.dec.txt', decipher.output.getBytes(), {encoding: 'binary'});
return decipher.output.getBytes();
}

// var password = generatePassword()
var password = "abcdABCD"
console.log("password:    ")
console.log(password)
var input = "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEA28eFezybR7HhwZieaqY0157dbzauEpkmp/oXltPwtcN3J9+k\r\nqgCR4oUczO46XM9rajBLmaR0OsuG3TGY0ULvpTf2url84mB7Zlbe20kt/6pc0HWn\r\ny+hAYZenm6GORrgPCAz58DQYA2hilWfsCvKmLaqhCCT1APu1Jc+jM1zGqJOYYHXJ\r\nci56cKun3eRCsbvbKJ9k7UZOv5LIhDKd4MKvLzmXZKJRNuLAuxR99bxJFVulE/QI\r\nuS21dgD4SUA6gxNnar7Rpvf36SdaRb5YHwGqiTarFOg4B+JcWj9CVHAHxdRx6CF+\r\nwvRgcxyjtqjoer239rlAxcgmTY40cCl+1GhAxQIDAQABAoIBAAEF17AwIwTdZhCR\r\nlkMmzN4oBh3LYloBznU/q7Zu/BLMexR7bPfBkuw79FtbzHe8G2LeIKvxYP0ZD2Ke\r\nJXjr19OsBADwdg1Tp59dTiI1H/qtn0r1ETfYt9v8abJGuTPJDYDbFpqwk2AIr1TE\r\nrAuM/4r83Uz9Zwp/IWOwqLDHgMEuFHQaC7SjK13dutJtuaNBZ2fYBqV4vRLXHPpo\r\ntWlT9tYCOXVuVMWVs2FJ4SNmOAW8NASSlPolA4RtRYOZVrAdzINTF1Yq3ypY2Rsj\r\n0/N4lM0hWQuUgEt6Q6YDoJ9a+7Q9w5OWpLSeTamMqTA3zvxfKx0N7VvamEFoLsGg\r\nio3bpmECgYEA/OMuLbhyERXMxBM8RSvGQa/mlQmnx+gQLAwYSnNd7p9qO7SUlPWR\r\n+fjodRod5xc4Z9+guRiuX07aKxZjgTrTOsbA+ieRhRCtmgLiBlTThJfT5gVjsCtg\r\nbWisUVM/scGeprrsOl+q+XU3xiNH3RZ7ET5L/WJk37Yd21sIglf0hH0CgYEA3nwF\r\ndjiU9X7hq2wwv22VW/3QvdhiecQMaoJwFva7ESlb+cYNkK4In1F7afzkiKQjckVy\r\nvqZhZ2jMM7UVju7fHxuCvhmqJ/XXYJYC2loZxn/y/Vtwfc6b2OMS06RaQNgr391J\r\nKiYB0o0mjfCMhPH65lLU/r7qUYBoqCP8vgohR+kCgYBbmgLxJr2SuL3KTFlpiNiw\r\nlIHGfI/c1o99FQh7d1yQAgieBeRILMeqr2GsgUBRo9SXs6ZpRapr9YkLUHnMpr06\r\nriHauxh4BbmMbvzmZDWV8tUbndolRyEPoHnCn5AT2FmadVz6LAsnfzErwT3XtLvx\r\nXAp0hv6ZFkOsYEYtyKRWlQKBgQC6QHkSDywkmKOzLk9g8gwnhsRJKezGoykBwVC0\r\n6LiSFV26K+MPS6JMPZpjkCKBgWdrMlhs4jyIpWLNprr1fWOsVwuMuU+JRHWZlfut\r\nb+BEHLj/AJ2btGsjlnUcWGp1/oI8VrP5ZPgBm8i66rW4VhsE1jMZUBo5QJZcrEPZ\r\nlAFogQKBgGjBcLuvF9SCkWPMKZmnet87UAY7OsdHaNlec1T0xWbudgHSyU4sRZkK\r\n6igsOQxY4K1SuY7ifcyZN1VkrbfOrxvFgh/5RHtWcOlhVDh+hokmR5pZggF2PkKJ\r\n7yeYQJCIVorD964y7DW9MkGxUtBvUtcNoW5gky7VDUeZpNss7KLC\r\n-----END RSA PRIVATE KEY-----\r\n"
var encr = encrypt(input, password)
console.log(encr)
console.log("abcd\n")
var decr = decrypt(encr, "")
console.log(decr)

