import React, { Component } from 'react'
const forge = require('node-forge');

class ExistingUSer extends Component{

    constructor(props){
        super(props)
        this.state = {
          verifiedVerifiers : [],
          verifierAddress : '',
          loaded : false,
          selectedFile: null
        }
    }

    componentDidMount() {
      this.getVerifiers()
    }

    getVerifiers(){
      // console.log("hi");
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
      // console.log(this.state.selectedFile)
      // let h = new Headers();
	    //h.append("Access-Control-Allow-Origin", "*");
      //create any headers we want
	    var formdata = new FormData();
      var files = this.state.selectedFile;
      console.log(files)
      formdata.append('doc', files);
      formdata.append('verifierAddress',this.state.verifierAddress);
      formdata.append('type',2);
      formdata.append('userId', this.state.userId);
      var requestOptions = {
          method: 'POST',
          // headers: h,
          body: formdata,
      };
      fetch('http://localhost:8000/uploadDocument', requestOptions)
      .then(res => console.log(res.json()));
    };

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
  handleChangeAddress(event,address){
    if (this.state.verifierAddress === address)
    this.setState({
      verifierAddress : ''
    })
    else
      this.setState({
        verifierAddress : address
      })
  }

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
    let privateKey = localStorage.getItem('privateKey');
    privateKey = forge.pki.privateKeyFromPem(privateKey);
    const finalOtp = privateKey.decrypt(decodedOtp)

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
    // handleUpload(event){
    //   event.preventDefault();
    //   this.setState({
    //     file : event.target.files[0]
    //   })
    // }


    render(){
        return(
            <div>
              <h1>for existing users</h1>
                {
                    this.state.loaded === true ? (
                    <form>
                    {
                        this.state.verifiedVerifiers.map((verifier,key) => {
                        return(
                            <div className="verifier" id = {verifier.address}>
                            <input 
                            type="radio" 
                            name="bankName"
                            value = {verifier.address}
                            onChange={(event)=>{this.handleChangeAddress(event,verifier.address)}}/>
                            <label for = {verifier.address}>{verifier.bankName}</label>
                            </div>
                        )
                        })
                    }
                    
                    <input type="text" name="userId" placeholder="Enter your kyc ID" onChange={(event)=>this.handleChange(event)}/>
                    <input type="file" name="upload QR code" onChange={this.onFileChange} placeholder="QR code"/>
                    <br/>
                    <input type="button" value="Submit" onClick = {(event)=>{this.handleSubmit(event)}} />
                    </form>
                    ) : (<div></div>)
                }
                <h1>Otp verification</h1>
                
                <form>
                  <input type="text" name="requestId" placeholder="request Id" onChange={(event) => this.handleChange(event)} />
                  <input type="text" name="otp" placeholder="OTP" onChange={(event) => this.handleChange(event)} />
                  <input type="text" name="userData" placeholder="Data of user" onChange={(event) => this.handleChange(event)} />
                  <input type="button" value="Verify" onClick = {(event) => this.verifyOtp(event)} />
                </form>
                
            </div>
        )
    }
}

export default ExistingUSer;