import React, { Component } from 'react'
import Web3 from 'web3'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'
import VerifierOnBoard from './VerifierOnBoard.js'
import AddUser from './AddUser.js'
import Admin from './Admin.js'
import NewUser from './NewUser.js'
import Verifier from './Verifier.js'
import ExistingUser from './ExistingUser.js'
import VerfiedUsers from './VerifiedUsers.js'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loaded : false,
      tabIndex: 0
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
      else this.state.kycContract.methods.identifyAddress(this.state.accounts[0]).call({}, (err, type) => {
        console.log(type);
        this.setState({ type: type.toNumber() })} )
      
      this.setState({ loaded:true })
    })
  }
  

  getComponent = () => {
    switch(this.state.type) {
      case 1:
        return (<div><div>Admin</div><br/><Admin kycContract = {this.state.kycContract} account = {this.state.accounts}></Admin></div>)
      case 2:
        return (<div>Verified verifier<div>Add user(Verifier)</div><br/>
        <AddUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
        <br/>
        <VerfiedUsers kycContract = {this.state.kycContract} account = {this.state.accounts}/>  
        <br/></div>)
      case 3:
        return (<p>Please wait while admin verifies your request</p>)
      default:
        return (<div>
           <Tabs
        value={this.state.tabIndex}
        onChange={(event, newValue) => this.setState({ tabIndex: newValue})}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="User" />
        <Tab label="Verifier" />
      </Tabs>
      <div hidden = {this.state.tabIndex !==0}>
      <div>Existing user</div><ExistingUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
        <div>New user</div><br/><NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} /> 
      </div>
        <br/>
        <div hidden = {this.state.tabIndex !==1}><VerifierOnBoard kycContract = {this.state.kycContract} account = {this.state.accounts}/></div> 
        </div>
        )
        
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
