const Web3 = require('web3');
const kyc = require('./src/abis/Kyc');
const async = require('async');

const rpcUrl = "http://127.0.0.1:7545";

const web3 = new Web3(rpcUrl);

const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[5777].address);

async.waterfall([
    function(cb){
        kycContract.methods.pushVerifiers("0x2c59Ed0e25653d92D08F1E638fa98173FD46E95f","aa","aa").send({from: "0x0aFa784aD96F813906BBCc8B0f00a1C22577Ff7e", gas: 672195},(err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.pushVerifiers("0x91c6641a0800331f797B034F50378C048bE9EDf0","aa","aa").send({from: "0x0aFa784aD96F813906BBCc8B0f00a1C22577Ff7e", gas: 672195}, (err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.pushVerifiers("0x5c4c852F8F65F9C7c6E677790EE4e4Ff0bfccD82","aa","aa").send({from: "0x0aFa784aD96F813906BBCc8B0f00a1C22577Ff7e", gas: 672195}, (err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    },
    function(cb){
        kycContract.methods.addUser("aa", "aa", "aa","0x2c59Ed0e25653d92D08F1E638fa98173FD46E95f").send({from: "0x2c59Ed0e25653d92D08F1E638fa98173FD46E95f", gas: 672195}, (err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    },
    function(cb) {
        kycContract.methods.verifierAdd("aa", "0x91c6641a0800331f797B034F50378C048bE9EDf0").send({from: "0x91c6641a0800331f797B034F50378C048bE9EDf0", gas: 672195}, (err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    }, 
    function(cb) {
        kycContract.methods.concensusAlgorithm("aa").send({from: "0x91c6641a0800331f797B034F50378C048bE9EDf0", gas: 672195, value: 6000000000000000000}, (err, res) => {
            if(err) cb(err);
            cb(null);
    }) 
    },
    function(cb) {
        kycContract.methods.verifierAdd("aa", "0x5c4c852F8F65F9C7c6E677790EE4e4Ff0bfccD82").send({from: "0x5c4c852F8F65F9C7c6E677790EE4e4Ff0bfccD82", gas: 672195}, (err, res) => {
            if(err) cb(err)
            else cb(null);
        })
    }, 
    function(cb) {
        kycContract.methods.concensusAlgorithm("aa").send({from: "0x5c4c852F8F65F9C7c6E677790EE4e4Ff0bfccD82", gas: 672195, value: 6000000000000000000}, (err, res) => {
            if(err) cb(err);
            cb(null);
    }) 
    }

],function(err, res){
    if(err) console.log(err);
    else console.log("success");
});


