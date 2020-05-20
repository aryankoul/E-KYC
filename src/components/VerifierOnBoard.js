import React, { Component } from 'react'
const forge = require('node-forge');

class VerifierOnBoard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      publicKey : '',
      privateKey : ''
    }
    // console.log(props.kycContract);
  } 

  componentDidMount(){
    this.generateKeys();
  }

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  generateKeys(){
    const address = this.props.account[0];
    const pubKey = localStorage.getItem("publicKey"+address), priKey = localStorage.getItem("privateKey"+address);
    if((pubKey === null || pubKey === "") && (priKey === null || priKey === "")){
      forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
        // keypair.privateKey, keypair.publicKey
        const publicKey = keypair.publicKey;
        const privateKey = keypair.privateKey;
        console.log(publicKey);
        console.log(privateKey);

        const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

        localStorage.setItem("publicKey"+address,publicKeyPem);
        localStorage.setItem("privateKey"+address,privateKeyPem);

        // this.setState({
        //   publicKey: keypair.publicKey.n.toString(),
        //   privateKey : keypair.privateKey.n.toString()
        // })
    });
    }
    

  }


  handleSubmit(event) {
    const [bankName] = [this.state.bankName]
    const account = this.props.account[0];
    const publicKey = localStorage.getItem('publicKey'+account)
    const kycContract = this.props.kycContract
    console.log(bankName);
    console.log(this.props.kycContract);

    kycContract.methods.addVerifier(bankName,account,publicKey).send({ from: account, gas: 672195 })

    event.preventDefault()

  }

  render() {
    return (
      <form>
        <input
          name="bankName"
          type="text"
          placeholder = "Bank Name"
          onChange={(event)=>{this.handleChange(event)}} />
          {
            localStorage.getItem('publicKey'+this.props.account[0]) !== null ? ([
              <input
                name="publicKey"
                type="text"
                value={localStorage.getItem('publicKey'+this.props.account[0])}
                readOnly />,
              <input
                name="privateKey"
                type="text"
                value={localStorage.getItem('privateKey'+this.props.account[0])}
                readOnly />]
            ) : (<div></div>) 
          }  
        <input type="button" value="Submit" onClick={(event)=>{this.handleSubmit(event)}} />
        
      </form>
    );
  }
}

export default VerifierOnBoard;
