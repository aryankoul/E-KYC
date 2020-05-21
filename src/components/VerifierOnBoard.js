import React, { Component } from 'react'
import { TextField } from '@material-ui/core';
import { Button } from '@material-ui/core';

import SnackBarNotification from './SnackBarNotification';
const forge = require('node-forge');


class VerifierOnBoard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      publicKey : '',
      privateKey : '',
<<<<<<< Updated upstream
      snackbarOpen: false,
      snackbarMessage: ''
=======
      bankName: ''
>>>>>>> Stashed changes
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

        // this.setState({
        //   publicKey: keypair.publicKey.n.toString(),
        //   privateKey : keypair.privateKey.n.toString()
        // })
    });
    }
    

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
        snackbarOpen: true
    })
    event.preventDefault()

    this.setState({bankName: ''})
  }

  render() {
    return (
      <form style={{ display:'flex', justifyContent:'center' }}>
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
          />
          <br/>
          <Button variant="contained" color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} style = {{margin: '10px'}}>Submit</Button>
         <SnackBarNotification open={this.state.snackbarOpen} message={this.state.snackbarMessage} toggle={(val) => this.setState({snackbarOpen: val})} />
      </form>
    );
  }
}

export default VerifierOnBoard;
