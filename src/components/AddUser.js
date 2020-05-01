import React, { Component } from 'react'

var forge = require('node-forge');

class AddUser extends Component {
  componentDidMount() {
  }

  constructor(props) {
    console.log(props.account)
    console.log(props.kycContract)
    super(props)
    this.state = {}
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  } 

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  calculateHash(phoneNumber){
    var md = forge.md.sha256.create();
    md.update(phoneNumber);
    return md.digest();
  }

  signUserData(address, rawData){ 
      var foo = localStorage.getItem('foo');
      foo=JSON.parse(foo);
      // const pkeyPem = localStorage.getItem('privateKey');
      var privateKey = forge.pki.privateKeyFromPem(foo.privateKeyPem);
      console.log(privateKey)
      var md = forge.md.sha1.create();
      md.update(rawData, 'utf8');
      var signature = privateKey.sign(md);
      console.log(signature)
      return signature;
  } 
  
  makeUserId(rawData){
    const hash = this.calculateHash(rawData).toHex();
    var date = new Date();
    var timestamp =  date.getTime();
    var userId = hash+timestamp;
    return userId;
  }

  init(){
    var rsa = forge.pki.rsa;

// generate an RSA key pair synchronously
// *NOT RECOMMENDED*: Can be significantly slower than async and may block
// JavaScript execution. Will use native Node.js 10.12.0+ API if possible.
    var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
    var foo = JSON.stringify({
      publicKeyPem: forge.pki.publicKeyToPem(keypair.publicKey),
      privateKeyPem: forge.pki.privateKeyToPem(keypair.privateKey)
    });
    localStorage.setItem('foo',foo)
  }

  async handleSubmit(event) {
    // this.init()
    var phoneNumberHash = this.calculateHash(this.state.phoneNumber).toHex();
    console.log(phoneNumberHash)
   
    const [rawData, hash] = [this.state.userData, phoneNumberHash]
    const userId = this.makeUserId(rawData)
    console.log(userId)
    console.log(hash)
    

    
    const signature = this.signUserData(this.props.account,rawData);
    console.log(signature)
    console.log(this.props.account[0])
    var key =await this.props.kycContract.methods.getPublicKey(this.props.account[0]).call()
    console.log(key)
    await this.props.kycContract.methods.addUser(userId, signature, hash, this.props.account[0]).send({ from: this.props.account[0], gas: 672195 })
    event.preventDefault()
  }

  render() {
    return (
      <form>
        { this.state.val }
        <input
          name="userData"
          type="text"
          placeholder = "data"
          onChange={this.handleChange} />
        <input
          name="phoneNumber"
          type="text"
          placeholder = "Phone number"
          onChange={this.handleChange} />
          <input type="button" value="Submit" onClick={this.handleSubmit} />
        
      </form>
    );
  }
}

export default AddUser;