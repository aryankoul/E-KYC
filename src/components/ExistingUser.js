import React, { Component } from 'react'
import { TextField, Button, Icon } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import SnackBarNotification from './SnackBarNotification';
import Loader from './Loader.js'

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
          userData: ''
        }
    }

    componentDidMount() {
      this.getVerifiers()
    }

    getVerifiers(){
      this.props.kycContract.methods.getVerifiedVerifiers().call({}, (err, verifiedVerifiers) => {
          console.log(verifiedVerifiers);
          if (verifiedVerifiers !== null){
          verifiedVerifiers.map((verifiedVerifier, key) => {
          this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
              const verifier = {bankName: verifierDetails, address: verifiedVerifier}
              this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
              this.setState({loaded:true})
              this.props.loadComponent(true)
          });
          })
      }}) 
  }

    handleSubmit(event) {
      event.preventDefault()
      console.log(this.state.verifierAddress);
      console.log(this.state);
      
	    var formdata = new FormData();
      var files = this.doc;
      console.log(files.files[0])
      formdata.append('verifierAddress',this.state.verifierAddress);
      formdata.append('type',2);
      formdata.append('userId', this.state.userId);
      formdata.append('doc', files.files[0]);
      var requestOptions = {
          method: 'POST',
          body: formdata,
      };
      fetch('http://localhost:8000/uploadDocument', requestOptions)
      .then(res => res.json())
            .then(data => {
          this.setState({
              snackbarMessage: data.message,
              snackbarOpen: true
          })
      });
      this.setState({userId: '', verifierAddress: ''})
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
    var { requestId, otp, userData } = this.state;
    const decodedOtp = forge.util.decode64(otp);
    userData = forge.util.decode64(userData);
    let privateKey = localStorage.getItem('privateKeyUser');
    privateKey = forge.pki.privateKeyFromPem(privateKey);
    var finalOtp =''
    try{
      finalOtp = privateKey.decrypt(decodedOtp)
    }catch(e){
      this.setState({
          snackbarMessage: 'error decrypting otp',
          snackabarOpen: true
      })
      console.log(e)
      console.log("error decrypting otp")
      return
    }
    try{
      userData = privateKey.decrypt(userData)
    }catch(e){
        this.setState({
            snackbarMessage: 'error decrypting user data',
            snackbarOpen: true
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
    fetch("http://localhost:8000/verifyOtp",requestOptions)
    .then(res=> res.json()).then(
      data => {
          this.setState({
              snackbarMessage: data.message, 
              snackbarOpen: true
          
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
                    <FormControl variant="outlined" style={{ margin: "2%",  width: "80%"}}>
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
                  
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" value={this.state.userId} variant="outlined" type="text" name="userId" label="Kyc ID" onChange={(event)=>this.handleChange(event)}/>
                    <input style={{display: 'none', margin: "2%"}} type="file" name="upload QR code" ref = {(doc) => this.doc = doc} onChange={this.onFileChange} placeholder="QR code" id="contained-button-qr"/>
                    <label htmlFor="contained-button-qr" style={{ margin: "2%", width: "80%"}}>
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />} style={{ width: "100%"}}>
                      Upload
                    </Button>
                    </label>
                    <br/>
                    <Button
                    style={{ margin: "2%", width: "80%"}}
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick= {(event) => this.handleSubmit(event)}
                    >
                    Submit
                    </Button>
                  
                  </form>
                </Grid>

                <Grid item xs = {6}>
                  <h3 style={{margin: "2%"}}>OTP Verification</h3><br/>
                  
                  <form>
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.requestId} name="requestId" label="request Id" onChange={(event) => this.handleChange(event)} />
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.otp} name="otp" label="OTP" onChange={(event) => this.handleChange(event)} />
                    <TextField style={{ margin: "2%",  width: "80%"}} required id="outlined-required" variant="outlined" value = {this.state.userData} name="userData" label="Data of user" onChange={(event) => this.handleChange(event)} />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Icon>send</Icon>}
                      onClick= {(event) => this.verifyOtp(event)}
                      style={{margin: "2%", width: "80%"}}
                    >
                      Verify
                    </Button>
                    
                  </form>
                  <SnackBarNotification message={this.state.snackbarMessage} open={this.state.snackbarOpen} toggle = {(val) => this.setState({snackbarOpen: val})} />
                </Grid>
              </Grid>

                ) : (
                  <div style={{position:"fixed",top:"40%",left:"50%"}}>
                    <Loader />
                  </div>
                )
            }    
            </div>
        )
    }
}

export default ExistingUSer;
