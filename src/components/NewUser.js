import React, { Component } from 'react';
const forge = require('node-forge');

class NewUser extends Component{

  constructor(props){
    super(props)
    this.state = {
      verifiedVerifiers : [],
      verifierAddress : '',
      loaded : false
    }
  }

  componentDidMount() {
    this.getVerfiers();
    this.generateKeys();
  }

  generateKeys(){
    const publicKey = localStorage.getItem("publicKeyUser");
    const privateKey = localStorage.getItem("privateKeyUser");
    if((publicKey == null || publicKey == "") && (privateKey == null || privateKey == "")){
      forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
        // keypair.privateKey, keypair.publicKey
        const publicKey = keypair.publicKey;
        const privateKey = keypair.privateKey;
        console.log(publicKey);
        console.log(privateKey);

        const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

        localStorage.setItem("publicKeyUser",publicKeyPem);
        localStorage.setItem("privateKeyUser",privateKeyPem);

        // this.setState({
        //   publicKey: keypair.publicKey.n.toString(),
        //   privateKey : keypair.privateKey.n.toString()
        // })
    });
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    console.log(this.state.verifierAddress);
    let data = new FormData();
    data.append('phoneNumber', this.phoneNo.value);
    data.append('doc', this.doc.files[0]);
    data.append('email', this.email.value);
    data.append('name', this.name.value);
    data.append('docType', this.docType.value);
    data.append('verifierAddress', this.state.verifierAddress);
    data.append('publicKey', localStorage.getItem("publicKeyUser"));
    data.append('type',"1");
    const requestOptions = {
      method: 'POST',
      body: data
    }
    fetch('http://localhost:8000/uploadDocument', requestOptions)
    .then(res => console.log(res.text()));
  }

  handleChange(event,address){
    if (this.state.verifierAddress === address)
    this.setState({
      verifierAddress : ''
    })
    else
      this.setState({
        verifierAddress : address
      })
  }

  getVerfiers(){
    this.props.kycContract.methods.getVerifiedVerifiers().call({}, (err, verifiedVerifiers) => {
      if (verifiedVerifiers !== null){
      verifiedVerifiers.map((verifiedVerifier, key) => {
        this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
          const verifier = {bankName: verifierDetails, address: verifiedVerifier}
          this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
          
        });
      })
    }
    this.setState({loaded:true})
  }) 
  }

  render() {
    return (
      <div>
      {
        this.state.loaded === true ? (
        <form>
          {
            this.state.verifiedVerifiers.map((verifier,key) => {
              return(
                <div className="verifier" id = {verifier.address}>
                  <input 
                  type="radio" 
                  name="bankName"
                  value = {verifier.address}
                  onChange={(event)=>{this.handleChange(event,verifier.address)}}/>
                  <label for = {verifier.address}>{verifier.bankName}</label>
                </div>
              )
            })
          }
          <input type = "text" name = "name" placeholder = "name" ref = {(name) => this.name = name} />
          <input type = "text" name = "email" placeholder = "email" ref = {(email) => this.email = email}/>
          <input type = "text" name = "phoneNo" placeholder = "phone number" ref = {(phoneNo) => this.phoneNo = phoneNo} />
          <input type = "text" name = "docType" placeholder = "document type" ref = {(docType) => this.docType = docType} />
          <input type = "file" name = "doc" ref = {(doc) => this.doc = doc}/>
          <input type="button" value="Submit" onClick = {(event)=>{this.handleSubmit(event)}} />
        </form>
        ) : (<div></div>)
      }
      </div>
      
    );
  }
}

export default NewUser;
