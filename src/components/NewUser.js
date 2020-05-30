import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Loader from './Loader.js'
import SaveIcon from '@material-ui/icons/Save';
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import SnackBarNotification from './SnackBarNotification';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { serverUrl } from '../config/config'

const forge = require('node-forge');

class NewUser extends Component{

  constructor(props){
    console.log("hi")
    super(props)
    this.state = {
      verifiedVerifiers : [],
      verifierAddress : '',
      loaded : false,
      snackbarMessage: '',
      snackbarOpen: false,
      displayDownload : false,
      loading:false,
      buttonLoaded:false,
      password:"",
      confirmPassword:"",
      open:false,
      showPassword:false,
      showConfirmPassword:false
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
    this.setState({loading:true})
    console.log(this.state.verifierAddress);
    console.log(this.doc.files[0])
    let data = new FormData();
    data.append('phoneNumber', this.phoneNo.value);
    data.append('address',this.address.value)
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
    fetch(serverUrl+'uploadDocument', requestOptions)
    .then(res => res.json())
          .then(data  => {
        this.setState({
            snackbarMessage: data.message, 
            snackbarOpen: true,
            displayDownload:true,
            loading:false,
            buttonLoaded:true
        })
        this.phoneNo.value='';
        this.email.value='';
        this.docType.value='';
        this.setState({verifierAddress:'',userName:this.name.value});
        this.doc.files=null;
        this.name.value='';
        this.address.value=''
    });
    
  }

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  handleDownload(event){
    event.preventDefault();

    const privateKey = localStorage.getItem("privateKeyUser")
    const publicKey = localStorage.getItem("publicKeyUser")
    const data = {
        'privateKeyUser': privateKey,
        'publicKeyUser': publicKey
    }

    const rawData = JSON.stringify(data)
    console.log(rawData)
    const element = document.createElement('a')
    const file = new Blob([rawData], {type: 'text/plain;charset=utf-8'})

    element.href =  URL.createObjectURL(file)
    const name = this.state.userName.replace(/ /g, "")
    element.download = `KycKeys-${name}.txt`
    document.body.append(element)
    element.click()
    element.parentNode.removeChild(element)

    this.setState({
      displayDownload:false,
      buttonLoaded:false,
      open:false
    })
    localStorage.clear()

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
        <h3  style={{margin: "2%"}}>New User</h3>
        <br/>
        <FormControl>
          <FormControl variant="outlined" style={{ margin: "2%", width: "80%"}}
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
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
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
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
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
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
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
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
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
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
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
          />
          </div>

          <div>
          
          <input style={{display: 'none'}} type="file" name="doc" ref = {(doc) => this.doc = doc} placeholder="KYC DOCUMENT" id="contained-button-file"/>
          <label htmlFor="contained-button-file" style={{ margin: "2%", width: "80%"}}>
          <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />} style={{width: "100%"}} disabled={this.props.uploaded || this.state.displayDownload || this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
          >
            Upload Doccument
          </Button>
          </label>
          <br/>
          <Tooltip title="Please download the Kyc Key file after submitting this form" placement="bottom" interactive>
          {
            this.state.buttonLoaded ? (
            <Button variant="contained" startIcon={<CheckIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style={{ margin: "2%", width:"80%",backgroundColor:"#02b205"}} disabled={this.props.uploaded || this.state.displayDownload || this.state.loading}>{this.state.snackbarMessage}</Button>
            ) :  (
            <Button variant="contained" startIcon={<SaveIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style={{ margin: "2%", width:"80%"}} disabled={this.props.uploaded || this.state.displayDownload || this.state.loading}>Submit</Button>
            )
          }
          </Tooltip>
          {this.state.loading && <CircularProgress size={24} style={{color:"#02b205",position: 'absolute',left: '40%',marginTop:"3.5%"}} />}
          <div hidden={!this.state.displayDownload} style={{position:"fixed",bottom:"4%",right:"10%"}}>
            <Tooltip title="Set up password and download KycKeys file" placement="top" interactive>
              <Fab color="secondary" aria-label="add" onClick={e=>{this.setState({open:true})}}>
                <GetAppIcon />
              </Fab>
            </Tooltip>
          </div>
          </div>
        </FormControl>
        <Modal
          disableBackdropClick
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          style={{display:"flex",alignItems:"center",justifyContent:"center"}}
          open={this.state.open}
          onClose={()=>{this.setState({open:false})}}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.open}>
            <Paper style={{border:"3px solid #3f51b5",padding:"5%",borderRadius:"10px",textAlign:"center"}}>
              <h2  style={{marginBottom: "5%"}}>Please setup a password for the file</h2>
              <FormControl variant="outlined" style={{marginBottom:"5%",width:"100%"}}>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <Tooltip title="password must be atleast 8 characters" placement="bottom" interactive>
                <OutlinedInput
                  required
                  id="outlined-adornment-password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={this.state.password}
                  onChange={(e)=>{this.setState({password:e.target.value})}}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={(e)=>{this.setState({showPassword:!this.state.showPassword})}}
                        onMouseDown={(e)=>{e.preventDefault()}}
                        edge="end"
                      >
                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={70}
                />
                </Tooltip>
              </FormControl>
              <FormControl variant="outlined" style={{marginBottom:"5%",width:"100%"}}>
                <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                <Tooltip title="Must be same as above" placement="bottom" interactive>
                <OutlinedInput
                  required
                  id="outlined-adornment-password"
                  type={this.state.showConfirmPassword ? 'text' : 'password'}
                  value={this.state.confirmPassword}
                  onChange={(e)=>{this.setState({confirmPassword:e.target.value})}}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={(e)=>{this.setState({showConfirmPassword:!this.state.showConfirmPassword})}}
                        onMouseDown={(e)=>{e.preventDefault()}}
                        edge="end"
                      >
                        {this.state.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={70}
                />
                </Tooltip>
              </FormControl>
              <br/>
              <Tooltip title="password must be atleast 8 characters long and same in both input boxes" placement="bottom" interactive>
                <Button variant="contained" startIcon={<GetAppIcon />} color="primary" component="span"
                onClick={(e)=>{this.handleDownload(e)}}
                disabled={this.state.password === "" || this.state.confirmPassword === "" || this.state.password !== this.state.confirmPassword || this.state.password.length<=7} 
                style={{width:"100%"}}>Download File</Button>
              </Tooltip>
            </Paper>
          </Fade>
        </Modal>
        </div>
        ) : (
          <div style={{position:"fixed",top:"40%",left:"45%"}}>
            <Loader />
          </div>
          )
      }
          <SnackBarNotification open={this.state.snackbarOpen} message={"Please download the kyc key file"} toggle={(val) => this.setState({snackbarOpen: val})} />
      </div>
      
    );
  }
}

export default NewUser;
