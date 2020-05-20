import React, { Component } from 'react'
import { TextField, Button, Icon } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';

const forge = require('node-forge');

class ExistingUSer extends Component{

    constructor(props){
        super(props)
        this.state = {
          verifiedVerifiers : [],
          verifierAddress : '',
          loaded : false,
          selectedFile: null,
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
          });
          })
      }}) 
  }

    handleSubmit(event) {
      event.preventDefault()
      console.log(this.state.verifierAddress);
      console.log(this.state);
      
	    var formdata = new FormData();
      var files = this.state.selectedFile;
      console.log(files)
      formdata.append('doc', files);
      formdata.append('verifierAddress',this.state.verifierAddress);
      formdata.append('type',2);
      formdata.append('userId', this.state.userId);
      var requestOptions = {
          method: 'POST',
          body: formdata,
      };
      fetch('http://localhost:8000/uploadDocument', requestOptions)
      .then(res => console.log(res.json()));
    }

    onFileChange = event => { 
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
    const { requestId, otp, userData } = this.state;
    const decodedOtp = forge.util.decode64(otp);
    let privateKey = localStorage.getItem('privateKeyUser');
    privateKey = forge.pki.privateKeyFromPem(privateKey);
    var finalOtp ='' 
    try{
      finalOtp = privateKey.decrypt(decodedOtp)
    }catch(e){
      console.log(e)
      console.log("error decrypring otp")
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
        console.log(data);
      }
    )
  }


    render(){
        return(
            <div>
              <h3>for existing users</h3>
                {
                    this.state.loaded === true ? (
                    <form>

                      <FormControl variant="outlined" style={{minWidth:"150px"}}>
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
                    
                    <TextField required id="outlined-required" variant="outlined" type="text" name="userId" label="Kyc ID" onChange={(event)=>this.handleChange(event)}/>
                    <input style={{display: 'none'}} type="file" name="upload QR code" onChange={this.onFileChange} placeholder="QR code" id="contained-button-file"/>
                    <label htmlFor="contained-button-file">
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}>
                       Upload
                    </Button>
                    </label>
                    <br/>
                    <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick= {(event) => this.handleSubmit(event)}
                  >
                    Submit
                  </Button>
                    
                    </form>

                    ) : (<div></div>)
                }
                <h3>Otp verification</h3>
                
                <form>
                  <TextField required id="outlined-required" variant="outlined" name="requestId" label="request Id" onChange={(event) => this.handleChange(event)} />
                  <TextField required id="outlined-required" variant="outlined" name="otp" label="OTP" onChange={(event) => this.handleChange(event)} />
                  <TextField required id="outlined-required" variant="outlined" name="userData" label="Data of user" onChange={(event) => this.handleChange(event)} />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Icon>send</Icon>}
                    onClick= {(event) => this.verifyOtp(event)}
                  >
                    Verify
                  </Button>
                  
                </form>
            </div>
        )
    }
}

export default ExistingUSer;