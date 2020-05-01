import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'
import Admin from './Admin'

var forge = require('node-forge');

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    window.ethereum.enable()
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const KycContract = new web3.eth.Contract(kyc.abi, kyc.networks[5777].address)
    //console.log(KycContract)
    this.setState({ KycContract })
    //const val = await KycContract.methods.getUserSignature("aryan").call()
    //this.setState({ val })
    this.setState({loading: false})
  }

  constructor(props) {
    super(props)
    this.state = {loading: true}
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
   // this.loadBlockchainData()
  } 

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  calculateHash(phoneNumber){
    var md = forge.md.sha256.create();
    md.update(phoneNumber);
    return md.digest().toHex();
  }

      

  async handleSubmit(event) {
    var phoneNumberHash = this.calculateHash(this.state.phoneNumber)
    console.log(phoneNumberHash)
    const [userId, signature, hash, vKey] = [this.state.userId, this.state.userSignature, phoneNumberHash, this.state.verifierKey]
    //await this.state.KycContract.methods.addUser(userId, signature, hash, vKey).send({ from: this.state.account, gas: 672195 })
    
    event.preventDefault()
  }

  render() {
    return (
      (this.state.loading == false)?(<div>
        <form>
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
            name="phoneNumber"
            type="text"
            placeholder = "Phone number"
            onChange={this.handleChange} />
            <input
            name="verifierKey"
            type="text"
            placeholder = "verifier key"
            onChange={this.handleChange} />
            <input type="button" value="Submit" onClick={this.handleSubmit} />
            <Admin KycContract = {this.state.KycContract} Account = {this.state.account}></Admin>
        </form>
      </div>):<div></div>
    );
  }
}

export default App;