import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'

import Verifier from './Verifier.js'
import VerifierOnBoard from './VerifierOnBoard.js'
import Admin from './Admin.js'
import NewUser from './NewUser.js'
import ExistingUser from './ExistingUser.js'

import { Tab,Tabs,AppBar } from '@material-ui/core';
import { Container } from '@material-ui/core';


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loaded : false,
      value : 0
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
  

  handleChange(e,value){
    this.setState({
      value:value
    })
  }

  getComponent = () => {
    switch(this.state.type) {
      case 1:
        return (
        <div>
          <AppBar position="static" elevation={0}>
            <Tabs value={this.state.value} centered>
              <Tab label="Admin" />
            </Tabs>
          </AppBar>
          <div style={{backgroundColor:"white",display:"flex",justifyContent:"center",height:"-webkit-fill-available",width:"100%"}}>
          <div role="tabpanel">
            <Admin kycContract = {this.state.kycContract} account = {this.state.accounts}></Admin></div>
          </div>
        </div>)
      case 2:
        return (
        <div>
          <Verifier kycContract = {this.state.kycContract} accounts = {this.state.accounts} />
        </div>)
      case 3:
        return (<p>Please wait while admin verifies your request</p>)
      default:
        return (
        <div> 
          <AppBar position="static" elevation={0}>
            <Tabs value={this.state.value} onChange={(e,value)=>this.handleChange(e,value)} centered>
              <Tab label="User" />
              <Tab label="Verifier" />
            </Tabs>
          </AppBar>
          <div style={{backgroundColor:"white",display:"flex",justifyContent:"center", height: "100vh", width:"100%"}}>
          <div
            role="tabpanel"
            hidden={this.state.value !== 0}
          >
            <h3>New user</h3><NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
            <br/><ExistingUser kycContract = {this.state.kycContract} account = {this.state.accounts} />
          </div>
          <div
            role="tabpanel"
            hidden={this.state.value !== 1}
          >
            <br/><div><VerifierOnBoard kycContract = {this.state.kycContract} account = {this.state.accounts}/></div>
          </div>
          </div>
        </div>
        )
        
    }
  }

  render() {
    
    return (
      <div className='app' style={{backgroundColor:"#2c387e",height:"100%",position:"fixed",width:"100%"}}>
        <Container maxWidth="lg">
        {
          this.state.loaded ? this.getComponent() : (<div></div>)
        }
        </Container>
      </div>
    );
  }
}

export default App;
