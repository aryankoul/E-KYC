import React, { Component } from 'react'
import { TextField, Button, Icon } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import SnackBarNotification from './SnackBarNotification';
import Loader from './Loader.js'
import ClearIcon from '@material-ui/icons/Clear';

import { serverUrl } from '../config/config'
const forge = require('node-forge');

class ExistingUSer extends Component{

  constructor(props){
      super(props)
      console.log(props);
      this.state = {
        verifiedVerifiers : [],
        verifierAddress : '',
        loaded : false,
        selectedFile: null,
        snackbarMeassage: '',
        snackbarOpen: false,
        userId: '',
        requestId: '',
        otp: '',
        userData: '',
        loading:false,
        buttonLoaded:false,
        loadingOtp:false,
        buttonLoadedOtp:false,
        verified:false
      }
  }

  componentDidMount() {
    this.getVerifiers()
  }

  getVerifiers(){
    this.props.kycContract.methods.getVerifiedVerifiers().call({}, (err, verifiedVerifiers) => {
        console.log(verifiedVerifiers);
        if (verifiedVerifiers !== null && verifiedVerifiers.length !== 0){
        verifiedVerifiers.map((verifiedVerifier, key) => {
        this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
            const verifier = {bankName: verifierDetails, address: verifiedVerifier}
            this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
            this.setState({loaded:true})
            this.props.loadComponent(true)
        });
        })
        }else{
          this.props.loadComponent(true)
          this.setState({loaded:true})
        }
  }) 
  }

  handleSubmit(event) {
    event.preventDefault()
    this.setState({loading:true})
    console.log(this.state.verifierAddress);
    console.log(this.state);
    
    var formdata = new FormData();
    var files = this.doc;
    console.log(files.files[0])
    formdata.append('verifierAddress',this.state.verifierAddress);
    formdata.append('type',2);
    // formdata.append('userId', this.state.userId);
    formdata.append('doc', files.files[0]);
    var requestOptions = {
        method: 'POST',
        body: formdata,
    };
    console.log(formdata)
    fetch(serverUrl+'uploadDocument', requestOptions)
    .then(res => res.json())
          .then(data => {
        this.setState({
            snackbarMessage: data.message,
            snackbarOpen: true,
            loading:false,
            buttonLoaded:true,
            uploadMessage : data.message,
            userId: '', 
            verifierAddress: '',
        })
    });
    this.setState({})
  }

  onFileChange = event => {
      console.log(event.target.files[0])
      this.setState({ selectedFile: event.target.files[0] }); 
  }; 

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }


  verifyOtp(event){
    event.preventDefault();
    this.setState({loadingOtp:true})
    var { requestId, otp, userData } = this.state;
    const decodedOtp = forge.util.decode64(otp);
    userData = forge.util.decode64(userData);
    let privateKey = localStorage.getItem('privateKeyUser');
    console.log(privateKey)
    privateKey = forge.pki.privateKeyFromPem(privateKey);
    var finalOtp =''
    try{
      finalOtp = privateKey.decrypt(decodedOtp)
    }catch(e){
      this.setState({
          snackbarMessage: 'error decrypting otp',
          snackbarOpen: true,
          loadingOtp:false,
          buttonLoadedOtp:true,
          otpMessage : 'error decrypting otp'
      })
      console.log("error decrypting otp")
      return
    }

    try{
      userData = privateKey.decrypt(userData)
      console.log(userData)
      // const email = userData.JSON().email;
      // console.log(email);
    }catch(e){
        this.setState({
            snackbarMessage: 'error decrypting user data',
            snackbarOpen: true,
            loadingOtp:false,
            buttonLoadedOtp:true,
            otpMessage: 'error decrypting user data'
        })
      console.log("error decrypting user data")
      return
    }
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        _id: requestId,
        otp: finalOtp,
        originalData: userData,
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     }
    };
    fetch(serverUrl+"verifyOtp",requestOptions)
    .then(res=> res.json()).then(
      data => {
          this.setState({
              snackbarMessage: data.message, 
              snackbarOpen: true,
              loadingOtp:false,
              buttonLoadedOtp:true,
              otpMessage:data.message,
              verified:true
          })
        console.log(data);
        this.setState({
          requestId: '',
          otp: '',
          userData: '',
          userId: '',
          verifierAddress: ''
        })
      }
    )
  }


    render(){
        return(
            <div>
            {
              this.state.loaded === true ? (
                <Grid container spacing={3}>
                  <Grid item xs = {6}>
                  <h3 style={{margin: "2%"}}>Existing User</h3>
                  <br/>
                  <form>
                    <FormControl variant="outlined" style={{ margin: "2%",  width: "80%"}}
                    disabled={this.state.loading} onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
                    >
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

                    <br/>
  
                    <input style={{display: 'none', margin: "2%"}} type="file" name="upload QR code" ref = {(doc) => this.doc = doc} onChange={this.onFileChange} placeholder="QR code" id="contained-button-qr"/>
                    <label htmlFor="contained-button-qr" style={{ margin: "2%", width: "80%"}}>
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />} style={{ width: "100%"}} disabled={!this.props.uploaded || this.state.loading}
                    onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
                    >
                      Upload QR Code
                    </Button>
                    </label>
                    <br/>
                    {
                      this.state.buttonLoaded ? (
                        <Button
                      style={{ margin: "2%", width: "80%",backgroundColor:"#02b205"}}
                      variant="contained"
                      color="primary"
                      startIcon={<CheckIcon />}
                      onClick= {(event) => this.handleSubmit(event)}
                      disabled={!this.props.uploaded || this.state.loading}>
                      {this.state.uploadMessage}
                      </Button>
                      ) : (
                      <Button
                      style={{ margin: "2%", width: "80%"}}
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick= {(event) => this.handleSubmit(event)}
                      disabled={!this.props.uploaded || this.state.loading}>
                      Submit
                      </Button>
                      )
                    }
                    {this.state.loading && <CircularProgress size={24} style={{color:"#02b205",position: 'absolute',left: '48%',marginTop:"1%"}} />}
                  
                  </form>
                </Grid>

                <Grid item xs = {6}>
                  <h3 style={{margin: "2%"}}>OTP Verification</h3><br/>
                  
                  <form>
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.requestId} name="requestId" label="Request Id" onChange={(event) => this.handleChange(event)} 
                    disabled={this.state.loadingOtp} onClick={(event)=>{this.state.buttonLoadedOtp ? (this.setState({buttonLoadedOtp:false})) : (console.log("click"))}}/>
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.otp} name="otp" label="OTP" onChange={(event) => this.handleChange(event)} 
                    disabled={this.state.loadingOtp} onClick={(event)=>{this.state.buttonLoadedOtp ? (this.setState({buttonLoadedOtp:false})) : (console.log("click"))}}/>
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.userData} name="userData" label="Data of user" onChange={(event) => this.handleChange(event)} 
                    disabled={this.state.loadingOtp} onClick={(event)=>{this.state.buttonLoadedOtp ? (this.setState({buttonLoadedOtp:false})) : (console.log("click"))}}/>
                    {
                      this.state.buttonLoadedOtp ? (
                        this.state.verified ? (
                          <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CheckIcon/>}
                          onClick= {(event) => this.verifyOtp(event)}
                          style={{margin: "2%", width: "80%",backgroundColor:"#02b205"}}
                          disabled={!this.props.uploaded || this.state.loadingOtp}>
                            {this.state.otpMessage}
                          </Button>
                        ) : (
                          <Button
                          variant="contained"
                          color="primary"
                          startIcon={<ClearIcon/>}
                          onClick= {(event) => this.verifyOtp(event)}
                          style={{margin: "2%", width: "80%",backgroundColor:"#d50000"}}
                          disabled={!this.props.uploaded || this.state.loadingOtp}>
                            {this.state.otpMessage}
                          </Button>
                        )
                        
                      ) : (
                        <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Icon>send</Icon>}
                        onClick= {(event) => this.verifyOtp(event)}
                        style={{margin: "2%", width: "80%"}}
                        disabled={!this.props.uploaded || this.state.loadingOtp}>
                          Verify
                        </Button>
                      )
                    }
                    {this.state.loadingOtp && <CircularProgress size={24} style={{color:"#02b205",position: 'absolute',left: '78%',marginTop:"1%"}} />}
                    
                  </form>
                  <SnackBarNotification message={this.state.snackbarMessage} open={this.state.snackbarOpen} toggle = {(val) => this.setState({snackbarOpen: val})} />
                </Grid>
              </Grid>

                ) : (
                  <div style={{position:"fixed",top:"40%",left:"45%"}}>
                    <Loader />
                  </div>
                )
            }    
            </div>
        )
    }
}

export default ExistingUSer;
