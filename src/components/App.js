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
      const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[5777].address);
      this.setState({ kycContract })

      if(acc.length === 0) this.setState({ type: 4 }) 
      else this.state.kycContract.methods.identifyAddress(this.state.accounts[0]).call({}, (err, type) => this.setState({ type: type.toNumber() }) )
      
      this.setState({ loaded:true })
    })
  }

  getComponent = () => {
    switch(this.state.type) {
      case 1:
        return (<div><div>Admin</div><br/><Admin kycContract = {this.state.kycContract} account = {this.state.accounts}></Admin></div>)
      case 2:
        return (<div>Verified verifier</div>)
      case 3:
        return (<p>Please wait while admin verifies your request</p>)
      default:
        return (<div><div>Add user(Verifier)</div><br/><AddUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
        <br/><br/>
        <div>New user</div><br/><NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} /> </div>)
    }
  }

  render() {
    
    return (
      <div className='app'>

        {
          this.state.loaded ? this.getComponent() : (<div></div>)
          
        }
        
      </div>
    );
  }
}

export default App;
