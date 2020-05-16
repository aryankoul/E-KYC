import React, { Component } from 'react'

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
    // handleUpload(event){
    //   event.preventDefault();
    //   this.setState({
    //     file : event.target.files[0]
    //   })
    // }


    render(){
        console.log(this.state)
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
            </div>
        )
    }
}

export default ExistingUSer;