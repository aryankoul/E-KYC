import React, { Component } from 'react'
import { TextField } from '@material-ui/core';
import { Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import SnackBarNotification from './SnackBarNotification';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import {serverUrl} from '../config/config'

const forge = require('node-forge');

class VerifierOnBoard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      publicKey : '',
      privateKey : '',
      snackbarOpen: false,
      snackbarMessage: '',
      bankName: '',
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

  componentDidMount(){
    this.generateKeys();
  }

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    console.log(name, value)

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

    });
    }

  }

  handleDownload(event){
    event.preventDefault();

    const address = this.props.account[0];
    const privateKey = localStorage.getItem("privateKey"+address)
    const publicKey = localStorage.getItem("publicKey"+address)

    const pri = "privateKey"+address;
    const pub = "publicKey"+address;
    const data = {
        [pri]: privateKey,
        [pub]: publicKey
    }

    const rawData = JSON.stringify(data)
    console.log(rawData)
    const element = document.createElement('a')
    const file = new Blob([rawData], {type: 'text/plain;charset=utf-8'})

    element.href =  URL.createObjectURL(file)
    const name = this.state.name.replace(/ /g, "")
    element.download = `KycKeys-${name}.txt`
    document.body.append(element)
    element.click()
    element.parentNode.removeChild(element)

    this.setState({
      displayDownload:false,
      buttonLoaded:false,
      open:false
    },()=>{window.location.reload();})

  }


  handleSubmit(event) {
    event.preventDefault()
    this.setState({loading:true})
    const [bankName] = [this.state.bankName]
    const account = this.props.account[0];
    const publicKey = localStorage.getItem('publicKey'+account)
    const kycContract = this.props.kycContract
    console.log(bankName);
    console.log(this.props.kycContract);
    kycContract.methods.addVerifier(bankName,account,publicKey).send({ from: account, gas: 672195 })
    this.setState({
        snackbarMessage: 'Verifier request Initiated',
        snackbarOpen: true,
        displayDownload:true,
        loading:false,
        buttonLoaded:true,
        bankName: ''
    })
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        verifierAddress: account,
        publicKey:publicKey
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     }
    };
    fetch(serverUrl+'publicKey', requestOptions);
    event.preventDefault()
    this.setState({name:this.state.bankName})
  }

  render() {
    return (
      <div style={{textAlign:"center",minWidth:"80%"}}>
      <h3  style={{margin: "5%"}}>VerifierOnBoard</h3>
      <form>
        <TextField
          required
          id="bankName"
          name = "bankName"
          type = "text"
          label="Bank Name"
          onChange={(event)=>{this.handleChange(event)}}  
          variant="outlined"
          value = {this.state.bankName}
          style={{ margin: "5%", width: "100%"}}
          disabled={this.state.loading}
          onClick={(event)=>{this.state.buttonLoaded ? (this.setState({buttonLoaded:false})) : (console.log("click"))}}
          />
          <br/>
          <Tooltip title="Please download the Kyc Key file after submitting this form" placement="bottom" interactive>
          {
            this.state.buttonLoaded ? (
              <Button variant="contained" startIcon={<CheckIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} disabled={this.state.displayDownload || this.state.loading} style={{ margin: "5%", width: "100%",backgroundColor:"#02b205"}}>{this.state.snackbarMessage}</Button>
            ) : (
              <Button variant="contained" startIcon={<SaveIcon />} color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} disabled={this.state.displayDownload || this.state.loading} style={{ margin: "5%", width: "100%"}}>Submit</Button>
            )
          }
          </Tooltip>
          {this.state.loading && <CircularProgress size={24} style={{color:"#02b205",position: 'absolute',left: '50%',top:"33%"}} />}
          <br/><div hidden={!this.state.displayDownload}>
            <Tooltip title="Set up password and download KycKeys file" placement="bottom" interactive>
              <Fab color="secondary" aria-label="add" onClick={e=>{this.setState({open:true})}}>
                <GetAppIcon />
              </Fab>
            </Tooltip>
          </div>
         <SnackBarNotification open={this.state.snackbarOpen} message={"Please download the Kyc Key File"} toggle={(val) => this.setState({snackbarOpen: val})} />
      </form>
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
    );
  }
}

export default VerifierOnBoard;
