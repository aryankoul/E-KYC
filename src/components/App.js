import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'
import VerifierOnBoard from './VerifierOnBoard.js'
import AddUser from './AddUser.js'
import Admin from './Admin.js'
import NewUser from './NewUser.js'
import Verifier from './Verifier.js'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loaded : false
    }
  } 

  componentDidMount() {
    this.loadBlockchainData();
  }

  loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    window.ethereum.enable().catch((error)=>{
      console.log(error);
    });
    const web32 = new Web3(window.ethereum)
    return web32.eth.getAccounts().then((acc)=>{
      console.log(acc);
      this.setState({ accounts: acc })
      const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[5777].address)
      this.setState({ kycContract })
      this.setState({loaded:true})
    })
  }


  render() {
    
    return (
      <div className='app'>
        {
          this.state.loaded ? 
          (
          <div className="views">
            <div>Add new Verifier</div><br/><VerifierOnBoard kycContract={this.state.kycContract} account={this.state.accounts} />
            <br/><br/>
            <div>Add user(Verifier)</div><br/><AddUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
            <br/><br/>
            <div>New user</div><br/><NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
            <br/><br/>
            <div>Admin</div><br/><Admin kycContract = {this.state.kycContract} account = {this.state.accounts}></Admin>
          </div>
          ) : (<div></div>)
          
        }
        
      </div>
    );
  }
}

export default App;
