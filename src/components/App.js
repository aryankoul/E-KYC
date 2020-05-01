import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'
import AddUser from './AddUser.js'

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    // const accounts = await web3.eth.getAccounts()
    
    const KycContract = new web3.eth.Contract(kyc.abi,"0xAb07eEE9a808D12444DcA55CE62eF4cf31bb5b6d")
    this.setState({ KycContract })
    // const val = await this.state.KycContract.methods.getUserSignature("fbdjsabf").call()
    // this.setState({ val })
    
    window.ethereum.enable().catch((error)=>{
      console.log(error);
    });  
    const web32 = new Web3(window.ethereum)
    const acc= await web32.eth.getAccounts()
    this.setState({ account: acc,loaded:true})
    console.log("logged in account:"+acc)
  }

  constructor(props) {
    super(props)
    this.state = {
      loaded : false
    }
    // this.handleChange = this.handleChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
  } 

  // handleChange(event) {
  //   const target = event.target
  //   const value = target.value
  //   const name = target.name

  //   this.setState({
  //     [name]: value
  //   })
  // }

  render() {
    return (
      <div className="addUser">
      {
        this.state.loaded === true ? (<AddUser kycContract = {this.state.KycContract} account = {this.state.account} />) : (<div></div>)
      }
      </div>
    );
  }
}

export default App;