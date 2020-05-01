import React, { Component } from 'react'

class NewUser extends Component{

  constructor(props){
    super(props)
    this.state = {
      verifiedVerifiers : [],
      verifierAddress : '',
      loaded : false
    }
  }

  componentDidMount() {
    this.getVerfiers()
  }

  handleSubmit(event) {
    console.log(this.state.verifierAddress);
    
  }

  handleChange(event,address){
    if (this.state.verifierAddress === address)
      this.setState.verifierAddress = ''
    else
      this.setState({
        verifierAddress : address
      })
  }

  getVerfiers(){
    this.props.kycContract.methods.getVerifiedVerifiers().call({}, (err, verifiedVerifiers) => {
      verifiedVerifiers.map((verifiedVerifier, key) => {
        this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
          const verifier = {bankName: verifierDetails, address: verifiedVerifier}
          this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
          this.setState({loaded:true})
        });
      })
    })
  }

  render() {
    return (
      <div>
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
                  onChange={this.handleChange(verifier.address)}/>
                  <label for = {verifier.address}>{verifier.bankName}</label>
                </div>
              )
            })
          }
          <input type="button" value="Submit" onClick={this.handleSubmit} />
        </form>
        ) : (<div></div>)
      }
      </div>
      
    );
  }
}

export default NewUser;
