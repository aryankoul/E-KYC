import React, { Component } from 'react'

class Admin extends Component {
  componentWillMount() {
    this.loadAdminData()
  }

  generateOtp() {
    letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let otp = ''
    const len = letters.length
    for(let i = 0; i < 10; i++) {
        otp += letters[Math.floor(Math.random() * len)]
    }
    return otp
  }

  async loadAdminData() {
    this.props.KycContract.methods.getUnverifiedVerifiers().call({}, (err, unverifiedVerifiers) => {
        unverifiedVerifiers.map((unverifiedVerifier, key) => {
          this.props.KycContract.methods.getVerifier(unverifiedVerifier).call({}, (err,verifierDetails) => {
            const verifier = {bankName: verifierDetails, address: unverifiedVerifier}
            this.setState({unverifiedVerifiers:[...this.state.unverifiedVerifiers,verifier]})
          });
        })
    })
    
  }

  constructor(props) {
    super(props)
    this.state = { kycRequests: [] }
    this.handleAdd = this.handleAdd.bind(this)
    console.log(this.props.KycContract)
  } 

  handleAdd(event) {
    const target = event.target
    const key = target.id
    const address = this.state.unverifiedVerifiers[key].address
    
    this.props.KycContract.methods.verifyVerifier(address).send({from: this.props.Account, gas: 672195}, (err, result) => {
      console.log(result)
      this.setState({unverifiedVerifiers: []})
      this.loadAdminData();
    })
  }


  render() {
    return (
      <div>
        <h1>Requests</h1>
        <ul>
          {
            this.state.kycRequests.map((request,key) => {
              return(
                <li>
                  {request.id} {request.name} <input type = "button" value = "Verify" id = {key} onClick = {this.handleAdd} />
                </li>
              )
            })
          }
        </ul>
        <li></li>
      </div>
    );
  }
}

export default Admin;
