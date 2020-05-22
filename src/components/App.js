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
import Loader from './Loader.js'

import { Tab,Tabs,AppBar } from '@material-ui/core';
import { Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loaded : false,
      value : 0,
      loadedExistingUser : false,
      loadedNewUser : false,
      loadedAdmin : false
    }
    this.handleLogin.bind(this);
    this.handleFile.bind(this);
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
  
  handleFile = (e) => {
    const content = e.target.result;
    var keys= JSON.parse(content)
    for(var key in keys){
      localStorage.setItem(key,keys[key]);
    }

  }
  
  handleLogin = (file) => {
    let fileData = new FileReader();
    fileData.onloadend = this.handleFile;
    fileData.readAsText(file);
  }

  handleLogout(){
    localStorage.clear()
  }


  handleChange(e,value){
    this.setState({
      value:value
    })
  }

  getComponent = () => {
    switch(this.state.type) {
      case 1:
        return (<>
        <div hidden={!this.state.loadedAdmin}>
          <AppBar position="static" elevation={0}>
            <Tabs value={this.state.value} centered>
              <Tab label="Admin" />
            </Tabs>
          </AppBar>
          <div style={{backgroundColor:"white",display:"flex",justifyContent:"center",height:"-webkit-fill-available",width:"100%"}}>
          <div role="tabpanel">
            <Admin kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>{this.setState({loadedAdmin:val})}}/></div>
          </div>
        </div>
        <div style={{position:"fixed",top:"40%",left:"50%"}} hidden={this.state.loadedAdmin}>
          <Loader />
        </div>
        </>)
      case 2:
        return (
        <div>
          <Verifier kycContract = {this.state.kycContract} accounts = {this.state.accounts} />
        </div>)
      case 3:
        return (
          <h1 style={{textAlign:"center",color:"white",marginTop:"10%"}}>Please wait while the Admin verifies you :)</h1>
        )
      default:
        return (<>
          <div hidden={!(this.state.loadedExistingUser === true && this.state.loadedNewUser === true)}> 
            <AppBar position="static" elevation={0}>
              <Tabs value={this.state.value} onChange={(e,value)=>this.handleChange(e,value)} centered>
                <Tab label="User" />
                <Tab label="Verifier" />
              </Tabs>
            </AppBar>
            <div style={{backgroundColor:"white",display:"flex",justifyContent:"center", minHeight: "100vh", width:"100%"}}>
            <div
              role="tabpanel"
              hidden={this.state.value !== 0}
            >
              <Grid container spacing={3} style={{margin: 4}}>
                <Grid item xs = {4}>
                  <NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>{this.setState({loadedNewUser:val})}}/>
                </Grid>
                <Grid item xs = {8}>
                  <ExistingUser kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>this.setState({loadedExistingUser:val})}/>
                </Grid>
              </Grid>
            </div>
            <div
              role="tabpanel"
              hidden={this.state.value !== 1}
            >
              <br/><div><VerifierOnBoard kycContract = {this.state.kycContract} account = {this.state.accounts}/></div>
            </div>
            </div>
          </div>
          
            <div style={{position:"fixed",top:"40%",left:"50%"}} hidden={this.state.loadedExistingUser === true && this.state.loadedNewUser === true}>
              <Loader />
            </div>
          </>
       
        )
        
    }
  }

  render() {
    
    return (
      <div className='app' style={{backgroundColor:"#2c387e",height:"100%",position:"fixed",width:"100%",overflow:"auto"}}>
        <Container style={{maxWidth:"190vh"}}>
        {
          this.state.loaded ? this.getComponent() : (
            <div style={{position:"fixed",top:"40%",left:"50%"}}>
              <Loader />
            </div>
          )
        }
        </Container>
      </div>
    );
  }
}

export default App;
