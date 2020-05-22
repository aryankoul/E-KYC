import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import SaveIcon from '@material-ui/icons/Save';


import SnackBarNotification from './SnackBarNotification';
const forge = require('node-forge');

class NewUser extends Component{

  constructor(props){
    super(props)
    this.state = {
      verifiedVerifiers : [],
      verifierAddress : '',
      loaded : false,
      snackbarMessage: '',
      snackbarOpen: false
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
    console.log(this.doc.files[0])
    let data = new FormData();
    data.append('phoneNumber', this.phoneNo.value);
    data.append('email', this.email.value);
    data.append('name', this.name.value);
    data.append('docType', this.docType.value);
    data.append('verifierAddress', this.state.verifierAddress);
    data.append('publicKey', localStorage.getItem("publicKeyUser"));
    data.append('type',"1");
    data.append('doc', this.doc.files[0]);
    const requestOptions = {
      method: 'POST',
      body: data
    }
    fetch('http://localhost:8000/uploadDocument', requestOptions)
    .then(res => res.json())
          .then(data  => {
        this.setState({
            snackbarMessage: data.message, 
            snackbarOpen: true
        })
    });
    this.phoneNo.value='';
    this.email.value='';
    this.name.value='';
    this.docType.value='';
    this.setState({verifierAddress:''});
    this.doc.files=null;
  }

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
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
          <FormControl variant="outlined" style={{ margin: "2%", width: "80%"}}>
            <InputLabel htmlFor="filled-age-native-simple">Select Bank</InputLabel>
            <Select
            native
            value={this.state.verifierAddress}
            onChange={(event)=>this.handleChange(event)}
            label="Select Bank"
            inputProps={{
              name: 'verifierAddress',
              id: 'filled-age-native-simple',
            }}
            >
            <option aria-label="None" value="" />
            {
              this.state.verifiedVerifiers.map((verifier,key) => {
              return(
                  <option value={verifier.address} key={key}>{verifier.bankName}</option>
              )
              })
            }
            </Select>
          </FormControl>
          <div>
          <TextField
          required
          id="outlined-required"
          name = "name"
          type = "text"
          label="Name"
          inputRef = {(name) => this.name = name} 
          variant="outlined"
          style={{ margin: "2%", width: "80%" }}
          />
          <TextField
          required
          id="outlined-required"
          name = "email"
          type = "text"
          label="Email"
          inputRef = {(email) => this.email = email} 
          variant="outlined"
          style={{ margin: "2%",  width: "80%"}}
          />
          </div>

          <div>
          <TextField
          required
          id="outlined-required"
          name = "phoneNo"
          type = "text"
          label="Phone Number"
          inputRef = {(phoneNo) => this.phoneNo = phoneNo}  
          variant="outlined"
          style={{ margin: "2%",  width: "80%"}}
          />
          <TextField
          required
          id="outlined-required"
          name = "docType"
          type = "text"
          label="Document Type"
          inputRef = {(docType) => this.docType = docType}   
          variant="outlined"
          style={{ margin: "2%",  width: "80%"}}
          />
          </div>

          <div>
          <input style={{display: 'none'}} type="file" name="doc" ref = {(doc) => this.doc = doc} onChange={this.onFileChange} placeholder="KYC DOCUMENT" id="contained-button-file"/>
                    <label htmlFor="contained-button-file" style={{ margin: "2%", width: "80%"}}>
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />} style={{width: "100%"}}>
                       Upload
                     </Button>
                    </label>
          <br/>
          <Button variant="contained" startIcon={<SaveIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style={{ margin: "2%", width:"80%"}}>Submit</Button>
          </div>
        </FormControl>
        
        ) : (<div></div>)
      }
          <SnackBarNotification open={this.state.snackbarOpen} message={this.state.snackbarMessage} toggle={(val) => this.setState({snackbarOpen: val})} />
      </div>
      
    );
  }
}

export default NewUser;
