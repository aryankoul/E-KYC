import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Loader from './Loader.js'
import SaveIcon from '@material-ui/icons/Save';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';


import SnackBarNotification from './SnackBarNotification';
import { serverUrl } from '../config/config'
const forge = require('node-forge');

class UpdateUser extends Component{

  constructor(props){
    console.log("hi")
    super(props)
    this.state = {
      verifiedVerifiers : [],
      verifierAddress : '',
      loaded : false,
      snackbarMessage: '',
      snackbarOpen: false,
      loading:false,
      buttonLoaded:false
    }
  }

  componentDidMount() {
    this.getVerfiers();
    // this.generateKeys();
  }


  handleSubmit(event) {
    event.preventDefault()
    this.setState({loading:true})
    console.log(this.state.verifierAddress);
    console.log(this.doc.files[0])
    let data = new FormData();
    data.append('phoneNumber', this.phoneNo.value);
    data.append('address', this.address.value);
    data.append('email', this.email.value);
    data.append('name', this.name.value);
    data.append('docType', this.docType.value);
    data.append('verifierAddress', this.state.verifierAddress);
    data.append('publicKey', localStorage.getItem("publicKeyUser"));
    data.append('type',"3");
    data.append('userId', this.kycId.value)
    data.append('doc', this.doc.files[0]);
    const requestOptions = {
      method: 'POST',
      body: data
    }
    fetch(serverUrl+'uploadDocument', requestOptions)
    .then(res => res.json())
          .then(data  => {
        this.setState({
            snackbarMessage: data.message, 
            snackbarOpen: true,
            loading:false,
            buttonLoaded:true
        })
    });
    this.phoneNo.value='';
    this.email.value='';
    this.name.value='';
    this.docType.value='';
    this.setState({verifierAddress:''});
    this.doc.files=null;
    this.kycId.value='';
    this.address.value=''
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
      console.log(verifiedVerifiers)
      if (verifiedVerifiers !== null && verifiedVerifiers.length !== 0){
      verifiedVerifiers.map((verifiedVerifier, key) => {
        this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
          const verifier = {bankName: verifierDetails, address: verifiedVerifier}
          this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
          
        });
      })
    }
    this.props.loadComponent(true)
    this.setState({loaded:true})
  }) 
  }

  render() {
    return (
      <div>
      {
        this.state.loaded === true ? (
        <div>
        <h3  style={{margin: "2%"}}>Update Deatils</h3>
        <br/>
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
          </div>
          <div>
          <TextField
          required
          id="outlined-required"
          name = "kycId"
          type = "text"
          label="KYC ID"
          inputRef = {(kycId) => this.kycId = kycId}   
          variant="outlined"
          style={{ margin: "2%",  width: "80%"}}
          />
          </div>
          <div>
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
          name = "address"
          type = "text"
          label="Address"
          inputRef = {(address) => this.address = address}  
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
          
          <input style={{display: 'none'}} type="file" name="doc" ref = {(doc) => this.doc = doc} placeholder="KYC DOCUMENT" id="contained-button-file"/>
          <label htmlFor="contained-button-file" style={{ margin: "2%", width: "80%"}}>
          <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />} style={{width: "100%"}}>
              Upload New Doc
            </Button>
          </label>
          <br/>
          {
            this.state.buttonLoaded ? (
              <Button variant="contained" startIcon={<CheckIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style={{ margin: "2%", width:"80%",backgroundColor:"#02b205"}} disabled={this.state.loading}>{this.state.snackbarMessage}</Button>
            ) : (
              <Button variant="contained" startIcon={<SaveIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style={{ margin: "2%", width:"80%"}} disabled={this.state.loading}>Submit</Button>
            )
          }
          {this.state.loading && <CircularProgress size={24} style={{color:"#02b205",position: 'absolute',left: '40%',marginTop:"3.5%"}} />}
          </div>
        </FormControl>
        </div>
        ) : (
          <div style={{position:"fixed",top:"40%",left:"50%"}}>
            <Loader />
          </div>
          )
      }
          {/* <SnackBarNotification open={this.state.snackbarOpen} message={this.state.snackbarMessage} toggle={(val) => this.setState({snackbarOpen: val})} /> */}
      </div>
      
    );
  }
}

export default UpdateUser;
