import React, { Component } from 'react'

class Admin extends Component {
  componentWillMount() {
    this.loadAdminData()
  }

  async loadAdminData() {
    this.props.kycContract.methods.getUnverifiedVerifiers().call({}, (err, unverifiedVerifiers) => {
        unverifiedVerifiers.map((unverifiedVerifier, key) => {
          this.props.kycContract.methods.getVerifier(unverifiedVerifier).call({}, (err,verifierDetails) => {
            const verifier = {bankName: verifierDetails, address: unverifiedVerifier}
            this.setState({unverifiedVerifiers:[...this.state.unverifiedVerifiers,verifier]})
          });
        })
    })

  }

  constructor(props) {
    super(props)
    this.state = { unverifiedVerifiers: [] }
    this.handleAdd = this.handleAdd.bind(this)
    console.log(this.props.kycContract)
  } 

  handleAdd(event) {
    const target = event.target
    const key = target.id
    const address = this.state.unverifiedVerifiers[key].address
    console.log(this.props.kycContract);
    this.props.kycContract.methods.verifyVerifier(address).send({from: this.props.account[0], gas: 672195}, (err, result) => {
      if(err) console.log(err);
      console.log(result)
      this.setState({unverifiedVerifiers: []})
      this.loadAdminData();
    })
  }


  render() {
    return (
      <div>
        <h1>Unverified Verifiers</h1>
        <ul>
          {
            this.state.unverifiedVerifiers.map((verifier,key) => {
              return(
                <li>
                  {verifier.bankName} {verifier.address} <input type = "button" value = "Verify" id = {key} onClick = {this.handleAdd} />
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