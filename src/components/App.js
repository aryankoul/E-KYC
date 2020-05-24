import React, { Component } from 'react'
import Web3 from 'web3'
import { providerUrl } from '../config/config'
import { contractNetworkPort } from '../config/config'
import kyc from '../abis/Kyc'
import './App.css'

import Verifier from './Verifier.js'
import VerifierOnBoard from './VerifierOnBoard.js'
import Admin from './Admin.js'
import NewUser from './NewUser.js'
import ExistingUser from './ExistingUser.js'
import Loader from './Loader.js'
import UpdateUser from './updateUser.js'

import { Tab,Tabs,AppBar } from '@material-ui/core';
import { Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import Fab from '@material-ui/core/Fab';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';

class App extends Component {

  constructor(props) {
    super(props)
    if(localStorage.getItem('lastStoredKey1')!==null && localStorage.getItem('lastStoredKey2')!==null)
    {
      this.state = {
        loaded : false,
        value : 0,
        loadedExistingUser : false,
        loadedNewUser : false,
        loadedAdmin : false,
        uploaded : true,
        accounts:[]
      }
    }
    else{
    this.state = {
      loaded : false,
      value : 0,
      loadedExistingUser : false,
      loadedNewUser : false,
      loadedAdmin : false,
      uploaded : false,
      accounts:[]
    }
  }
    this.handleLogin.bind(this);
    this.handleFile.bind(this);
  }

  componentDidMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    var flag=false;
    if (typeof window.ethereum !== 'undefined'|| (typeof window.web3 !== 'undefined')) {
      window.ethereum.enable().catch((error)=>{
        console.log(error);
      });
      const web32 = new Web3(window.ethereum)
      await web32.eth.getAccounts().then((acc)=>{
        console.log(acc);
        this.setState({ accounts: acc })
        if(acc.length !== 0) flag=true
        localStorage.setItem("accounts", acc[0])
        window.ethereum.on('accountsChanged', function(accounts){
          if(localStorage.getItem("accounts") !== accounts[0]){
              localStorage.clear();
              localStorage.setItem("accounts", accounts[0])
              window.location.reload()
              console.log(accounts)
          }
        })
      })
    }
      const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[contractNetworkPort].address);
      this.setState({ kycContract })
      console.log(kycContract)

      if(flag==false){
        console.log("hi")
        this.setState({ type: 4 })
        localStorage.setItem("accounts","user")
      }  
      else this.state.kycContract.methods.identifyAddress(this.state.accounts[0]).call({}, (err, type) => {
        console.log(type);
        this.setState({ type: type.toNumber() })
      })
      
      this.setState({ loaded:true })
  }
  
  handleFile = (e) => {
    const content = e.target.result;
    var keys= JSON.parse(content)
    var i=0;
    for(var key in keys){
      i+=1
      localStorage.setItem(key,keys[key]);
      localStorage.setItem("lastStoredKey"+i,keys[key])
    }
    this.setState({uploaded:true})
  }
  
  handleLogin = (file) => {
    console.log("hi")
    let fileData = new FileReader();
    fileData.onloadend = this.handleFile;
    fileData.readAsText(file);
  }

  handleLogout(){
    localStorage.clear()
    this.setState({uploaded:false})
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
          <div style={{backgroundColor:"white", display:"flex", justifyContent:"center", height:"100%",minHeight:"100vh", width:"100%"}}>
          <div role="tabpanel" style={{width:"inherit"}}>
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
          <Verifier kycContract = {this.state.kycContract} accounts = {this.state.accounts} uploaded={this.state.uploaded}/>
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
                <Tab label="Verifier" disabled={this.state.accounts.length === 0}/>
              </Tabs>
            </AppBar>
            <div style={{backgroundColor:"white",display:"flex",justifyContent:"center", height: "100%", minHeight:"100vh", width:"100%"}}>
            <div
              role="tabpanel"
              hidden={this.state.value !== 0}
            >
              <Grid container spacing={3} style={{margin: 4}}>
                <Grid item xs = {4}>
                  {
                  this.state.uploaded === false?(
                  <NewUser kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>{this.setState({loadedNewUser:val})}} uploaded={this.state.uploaded}/>
                  ):(
                    <UpdateUser kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>{this.setState({loadedNewUser:val})}} uploaded={this.state.uploaded}/>
                  )
                  }
                </Grid>
                <Grid item xs = {8}>
                  <ExistingUser kycContract = {this.state.kycContract} account = {this.state.accounts} loadComponent={(val)=>this.setState({loadedExistingUser:val})} uploaded={this.state.uploaded}/>
                </Grid>
              </Grid>
            </div>
            <div
              role="tabpanel"
              hidden={this.state.value !== 1}
            >
              <br/><div><VerifierOnBoard kycContract = {this.state.kycContract} account = {this.state.accounts} uploaded={this.state.uploaded}/></div>
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
          this.state.loaded ? 
          (
            <>
              <div style={{position:"fixed",bottom:"3%",right:"4%"}} hidden={this.state.type===0 || this.state.type==1 || this.state.type==3}>
              {
                this.state.uploaded === false ? (<>
                  <input style={{display:'none'}} type="file" name="inputFile" accept='.txt' id="fab-button" onChange={e=>this.handleLogin(e.target.files[0])}/>
                  <label htmlFor="fab-button">
                    <Tooltip title="Login by uploading Kyc Key text File" placement="top" interactive>
                      <Fab color="secondary" aria-label="add" component="span">
                        <VpnKeyIcon />
                      </Fab>
                    </Tooltip>
                  </label>
                  </>
                ) : (
                  <Tooltip title="Logout" placement="top" interactive>
                    <Fab color="secondary" aria-label="add" onClick={(e)=>this.handleLogout(e)}>
                      <LockIcon />
                    </Fab>
                  </Tooltip>
                )
              }  
              </div>
            {
              this.getComponent()
            }
            </>
          ) : 
          (
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
