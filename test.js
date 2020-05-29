const Web3 = require('web3');
const kyc = require('./src/abis/Kyc');
const async = require('async');

const rpcUrl = "http://127.0.0.1:7545";

const web3 = new Web3(rpcUrl);

const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[5777].address);

async.waterfall([
    function(cb){
        kycContract.methods.pushVerifiers("0x150495cF7Aae53567E54d1e3A370BAbc52F114F1","aa","aa").send({from: "0xCe9732F09cF2EEf0Bcc75561D3dcB7e0FE0168EE", gas: 672195},(err, res) => {
            if(err) cb(err,null)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.pushVerifiers("0x523A3E0fed88CF7B8819e4C878094318648Ef6D9","aa","aa").send({from: "0xCe9732F09cF2EEf0Bcc75561D3dcB7e0FE0168EE", gas: 672195}, (err, res) => {
            if(err) cb(err,null)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.pushVerifiers("0xd3D349A00cA58A76dc4A564a0321cF2d84c4A299","aa","aa").send({from: "0xCe9732F09cF2EEf0Bcc75561D3dcB7e0FE0168EE", gas: 672195}, (err, res) => {
            if(err) cb(err,null)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.addUser("aa", "aa", "aa","ecid","0x150495cF7Aae53567E54d1e3A370BAbc52F114F1","0x150495cF7Aae53567E54d1e3A370BAbc52F114F1").send({from: "0x150495cF7Aae53567E54d1e3A370BAbc52F114F1", gas: 672195}, (err, res) => {
            if(err) cb(err,null)
            else cb(null);
        })
    },
    function(cb) {
        kycContract.methods.costShare("aa","ecid2","0x523A3E0fed88CF7B8819e4C878094318648Ef6D9").send({from: "0x523A3E0fed88CF7B8819e4C878094318648Ef6D9", gas: 672195, value: 6000000000000000000}, (err, res) => {
            if(err) cb(err,null);
            else cb(null);
    }) 
    },
    function(cb) {
        kycContract.methods.costShare("aa","ecid2","0xd3D349A00cA58A76dc4A564a0321cF2d84c4A299").send({from: "0xd3D349A00cA58A76dc4A564a0321cF2d84c4A299", gas: 672195}, (err, res) => {
            if(err) cb(err, null)
            else cb(null);
        })
    }, 
    function(cb) {
        kycContract.methods.getCustomerList("aa","0x150495cF7Aae53567E54d1e3A370BAbc52F114F1").call({}, (err, res) => {
            if(err) cb(err);
            else cb(null,res);
    }) 
    }

],function(err, res){
    if(err) console.log(err);
    else console.log(res);
});