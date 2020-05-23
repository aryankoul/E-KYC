import React, { Component } from 'react'
import { TextField } from '@material-ui/core';
import { Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';

import SnackBarNotification from './SnackBarNotification';
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
      displayDownload : false
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
    element.download = "Kyc-Keys.txt"

    document.body.append(element)
    element.click()
    element.parentNode.removeChild(element)

    this.setState({
      displayDownload:false
    })
    window.location.reload();
  }


  handleSubmit(event) {
    event.preventDefault()
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
        displayDownload:true
    })
    event.preventDefault()

    this.setState({bankName: ''})
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
          style = {{margin: '10px'}}
          value = {this.state.bankName}
          style={{ margin: "5%", width: "100%"}}
          />
          <br/>
          <Button variant="contained" color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} disabled={this.state.displayDownload} style={{ margin: "5%", width: "100%"}}>Submit</Button>
          <br/><div hidden={!this.state.displayDownload}>
            <Tooltip title="Download Kyc-Keys.txt" placement="bottom" interactive>
              <Fab color="secondary" aria-label="add" onClick={e=>{this.handleDownload(e)}}>
                <GetAppIcon />
              </Fab>
            </Tooltip>
          </div>
         <SnackBarNotification open={this.state.snackbarOpen} message={this.state.snackbarMessage} toggle={(val) => this.setState({snackbarOpen: val})} />
      </form>
      </div>
    );
  }
}

export default VerifierOnBoard;
