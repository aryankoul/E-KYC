import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'
// import { generateKeyPair } from './new.js'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const KycContract = new web3.eth.Contract(kyc.abi,"0x1D663730ED7B10176665a18fdfeE730ed47A1346")
    this.setState({ KycContract })
    const val = await this.state.KycContract.methods.getUserSignature("sushanttttt").call()
    console.log(val);
    
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

  handleSubmit(event) {
    const [userId, signature, number] = [this.state.userId, this.state.userSignature, this.state.userPhoneNumber]

    const forge = require('node-forge');
    const md = forge.md.sha256.create();
    md.update(number);
    let hash = md.digest().toHex();
    console.log(hash);

    const mycontract = this.state.KycContract;
    
    forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
      // keypair.privateKey, keypair.publicKey
      console.log(keypair.publicKey.n.toString());
      mycontract.methods.addUser(userId, signature,hash, keypair.publicKey.n.toString()).send({ from: "0xCcFB443f211F592B5cEa2233Be6d2256AF87c825", gas: 672195 })
    });

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
          name="userPhoneNumber"
          type="text"
          placeholder = "phone number"
          onChange={this.handleChange} />
          <input type="button" value="Submit" onClick={this.handleSubmit} />
        
      </form>
    );
  }
}

export default App;