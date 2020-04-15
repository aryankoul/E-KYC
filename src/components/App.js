import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const KycContract = new web3.eth.Contract(kyc.abi,"0x5C47ee98dbBEf9CbDC11392D1EdE62d768a298E5")
    this.setState({ KycContract })
    const val = await this.state.KycContract.methods.getUserSignature("aryanz").call()
    this.setState({ val })
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  } 

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  async handleSubmit(event) {
    const [userId, signature, hash, vKey] = [this.state.userId, this.state.userSignature, this.state.userPhoneHash, this.state.verifierKey]
    await this.state.KycContract.methods.addUser(userId, signature, hash, vKey).send({ from: "0x0aFa784aD96F813906BBCc8B0f00a1C22577Ff7e", gas: 672195 })
    
    event.preventDefault()
  }

  render() {
    return (
      <form>
        { this.state.val }
        <input
          name="userId"
          type="text"
          placeholder = "user id"
          onChange={this.handleChange} />
        <input
          name="userSignature"
          type="text"
          placeholder = "signature"
          onChange={this.handleChange} />
        <input
          name="userPhoneHash"
          type="text"
          placeholder = "phone hash"
          onChange={this.handleChange} />
          <input
          name="verifierKey"
          type="text"
          placeholder = "verifier key"
          onChange={this.handleChange} />
          <input type="button" value="Submit" onClick={this.handleSubmit} />
        
      </form>
    );
  }
}

export default App;