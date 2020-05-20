import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
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
    const pubKey = localStorage.getItem("publicKeyUser");
    const priKey = localStorage.getItem("privateKeyUser");
    if((pubKey === null || pubKey === "") && (priKey === null || priKey === "")){
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
        <FormControl>
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
          <div>
          <TextField
          required
          id="outlined-required"
          name = "name"
          type = "text"
          label="Name"
          inputRef = {(name) => this.name = name} 
          variant="outlined"
          />
          {/* <br/> */}
          <TextField
          required
          id="outlined-required"
          name = "email"
          type = "text"
          label="Email"
          inputRef = {(email) => this.email = email} 
          variant="outlined"
          />
          </div>
          {/* <br/> */}
          <div>
          <TextField
          required
          id="outlined-required"
          name = "phoneNo"
          type = "text"
          label="Phone Number"
          inputRef = {(phoneNo) => this.phoneNo = phoneNo}  
          variant="outlined"
          />
          {/* <br/> */}
          <TextField
          required
          id="outlined-required"
          name = "docType"
          type = "text"
          label="Document Type"
          inputRef = {(docType) => this.docType = docType}   
          variant="outlined"
          />
          </div>
          {/* <br/> */}
          <div>
          <input style={{display: 'none'}} type="file" name="doc" ref = {(doc) => this.doc = doc} onChange={this.onFileChange} placeholder="KYC DOCUMENT" id="contained-button-file"/>
                    <label htmlFor="contained-button-file">
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}>
                       Upload
                     </Button>
                    </label>
          <br/>
          
          <Button variant="contained" color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}}>Submit</Button>
          </div>
        </FormControl>
        
        ) : (<div></div>)
      }
      </div>
      
    );
  }
}

export default NewUser;
