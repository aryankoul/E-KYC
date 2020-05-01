import React, { Component } from 'react'
import Web3 from 'web3'
import { onboardUrl } from '../config/config'
import kyc from '../abis/Kyc'
// import './verifierOnboard.css'

class verifierOnboard extends Component{

    constructor(props){
      super(props);
      this.state = {
        publicKey : '',
        privateKey : ''
      }
    }

    componentDidMount() {
      this.loadBlockchainData()
    }

    async loadBlockchainData() {
      const web3 = new Web3(providerUrl)
      const accounts = await web3.eth.getAccounts()
      this.setState({ account: accounts[0] })
      const KycContract = new web3.eth.Contract(kyc.abi,"0xe4da1069cA5A029fC8082aa0Cb8d00153ae19715")
      this.setState({ KycContract })
      const val = await this.state.KycContract.methods.getUserSignature("fdsnf").call()
      this.setState({ val })
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
        const [bankName] = [this.state.bankName]
        console.log(bankName);
        
        const contract = this.state.KycContract;

        const forge = require('node-forge');

        forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
          // keypair.privateKey, keypair.publicKey
          const publicKey = keypair.publicKey.n.toString();
          const privateKey = keypair.publicKey.n.toString();
          console.log(publicKey);
          console.log(privateKey);
          this.setState({
            publicKey,privateKey
          })
          // verifierAddress = "0x0aFa784aD96F813906BBCc8B0f00a1C22577Ff7e";
          // contract.methods.addVerifier(bankName, verifierAddress, publicKey).send({ from: verifierAddress, gas: 672195 })
        });

        event.preventDefault()
    }




    render() {
        return (
          <form>
            { this.state.val }
            <input
              name="bankName"
              type="text"
              placeholder = "Bank Name"
              onChange={this.handleChange} />
            <input
              name="publicKey"
              type="text"
              value={this.state.publicKey}
              readOnly />
            <input
              name="privateKey"
              type="text"
              value={this.state.privateKey}
              readOnly />  
            <input type="button" value="Submit" onClick={this.handleSubmit} />
            
          </form>
    );
}