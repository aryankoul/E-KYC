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
      buttonLoaded:false
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
      buttonLoaded:false
    })
    window.location.reload();

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
            <Tooltip title="Download KycKeys file" placement="bottom" interactive>
              <Fab color="secondary" aria-label="add" onClick={e=>{this.handleDownload(e)}}>
                <GetAppIcon />
              </Fab>
            </Tooltip>
          </div>
         <SnackBarNotification open={this.state.snackbarOpen} message={"Please download the Kyc Key File"} toggle={(val) => this.setState({snackbarOpen: val})} />
      </form>
      </div>
    );
  }
}

export default VerifierOnBoard;
