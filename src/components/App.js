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
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import Fab from '@material-ui/core/Fab';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import { serverUrl } from '../config/config'

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
        accounts:[],
        verifierLoaded:false,
        open:false,
        showPassword:false,
        password:"",
        fileUploaded:false
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
      accounts:[],
      verifierLoaded:false,
      open:false,
      showPassword:false,
      password:"",
      fileUploaded:false
    }
  }
    this.handleLogin.bind(this);
    this.handleFile.bind(this);
  }

  componentDidMount() {
    this.loadBlockchainData();
  }

  async handleBalances(account,kycContract){
    console.log(account)
     console.log(kycContract)
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        verifierAddress: account
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     }
    };
    let response = await fetch(serverUrl+'completedKyc', requestOptions)
      let res = await response.json();
      // console.log(res.data[0])
      var array = res.data;
      let j = 0;
      let len=0;
      if(array===undefined || array===null || array==="") len=0
      else
        len = array.length;
      if(len===0)
        this.setState({verifierLoaded:true})
      for(var i=0;i<len;i++){
        var element = array[0];
        kycContract.methods.calculateShare(element.userId).call({},(err, res) => {
          var share = parseInt(res.toString());
          console.log(share)
          console.log(element)
          kycContract.methods.costShare(element.userId,element.encryptedCid,account, element.mode).send({from: this.state.accounts[0], gas: 6721975, value: share},(err)=>{
            console.log(err)
            if(!err){
              console.log("delete")
              const requestOptions = {
                method: 'POST',
                body: JSON.stringify({
                  _id: element._id
                }),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              };
              fetch(serverUrl+'completedKyc/delete', requestOptions).then(()=>{
                j=j+1;
                if(j===len)
                {
                  this.setState({verifierLoaded:true})
                }
              });
            }
          });
        })
      }   
  }
  async loadBlockchainData() {
    const web3 = new Web3(providerUrl)
    const kycContract = new web3.eth.Contract(kyc.abi,kyc.networks[contractNetworkPort].address);
      this.setState({ kycContract })
      console.log(kycContract)
    var flag=false;
    if (typeof window.ethereum !== 'undefined'|| (typeof window.web3 !== 'undefined')) {
      window.ethereum.enable().catch((error)=>{
        console.log(error);
      });
      const web32 = new Web3(window.ethereum)
      await web32.eth.getAccounts().then((acc)=>{
        console.log(acc);
        this.setState({ accounts: acc })
        console.log(acc[0])
        console.log(kycContract)
        this.handleBalances(acc[0],kycContract);
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
      


      if(flag===false){
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
  
  decrypt(input, password) {
    var forge = require('node-forge');
    input = forge.util.createBuffer(input, 'binary');
    input.getBytes('Salted__'.length);
    var salt = input.getBytes(8);
    var keySize = 24;
    var ivSize = 8;
   
    var derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keySize);
    var iv = buffer.getBytes(ivSize);
   
    var decipher = forge.cipher.createDecipher('3DES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(input);
    var result = decipher.finish();
    var k = decipher.output.getBytes();
    console.log(k)
    return k;
  }

  handleFile = async (e) => {
    const content = e.target.result;
    var keys= JSON.parse(content);
    var i=0;
    var password = this.state.password;
    console.log(password)
    for(var key in keys){
      i+=1;
      var k = await this.decrypt(keys[key], password);
      console.log(k)
      localStorage.setItem(key, k);
      localStorage.setItem("lastStoredKey"+i, k);
    }
    this.setState({fileUploaded:true})
  }
  
  handleLogin = (file) => {
    console.log("hi")
    let fileData = new FileReader();
    fileData.readAsText(file);
    fileData.onloadend = this.handleFile;
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
        <div style={{position:"fixed",top:"40%",left:"45%"}} hidden={this.state.loadedAdmin}>
          <Loader />
        </div>
        </>)
      case 2:
        return (
          this.state.verifierLoaded ? (
            <div>
              <Verifier kycContract = {this.state.kycContract} accounts = {this.state.accounts} uploaded={this.state.uploaded}/>
            </div>
          ) : (
            <div style={{position:"fixed",top:"40%",left:"45%"}}>
              <Loader />
            </div>
          )
        )
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
          
            <div style={{position:"fixed",top:"40%",left:"45%"}} hidden={this.state.loadedExistingUser === true && this.state.loadedNewUser === true}>
              <Loader />
            </div>
          </>
        )
    }
  }
  
  render() {
    return (
      <div className='app' style={{backgroundColor:"#2c387e",height:"100%",position:"fixed",width:"100%",overflow:"auto"}}>
        <Container style={{maxWidth:"90%"}}>
        {
          this.state.loaded ?
          (
            <>
              <Modal
              disableBackdropClick
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              style={{display:"flex",alignItems:"center",justifyContent:"center"}}
              open={this.state.open}
              onClose={()=>{this.setState({open:false})}}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={this.state.open}>
                <Paper style={{border:"3px solid #3f51b5",padding:"5%",borderRadius:"10px",textAlign:"center"}}>
                  <FormControl variant="outlined" style={{marginBottom:"5%",width:"100%"}}>
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                      required
                      id="outlined-adornment-password"
                      type={this.state.showPassword ? 'text' : 'password'}
                      value={this.state.password}
                      onChange={(e)=>{this.setState({password:e.target.value})}}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={(e)=>{this.setState({showPassword:!this.state.showPassword})}}
                            onMouseDown={(e)=>{e.preventDefault()}}
                            edge="end"
                          >
                            {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      labelWidth={70}
                    />
                  </FormControl>
                  <br/>
                  <input style={{display:'none'}} type="file" id="file" name="inputFile" accept='.txt' onChange={e=>{console.log("hello");this.handleLogin(e.target.files[0])}}/>
                  <label htmlFor="file" style={{width:"100%"}}>
                    <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}  disabled={this.state.password === ""} style={{width:"100%",marginBottom:"2%"}}>
                      Upload
                    </Button>
                  </label>
                  <br/>
                  <Button variant="contained" startIcon={<VpnKeyIcon />} color="primary" component="span"
                  onClick={(e)=>{this.setState({open:false,uploaded:true},()=>{window.location.reload()})}}
                  disabled={!this.state.fileUploaded} style={{width:"100%"}}>Login</Button>
                </Paper>
              </Fade>
            </Modal>
            <div style={{position:"fixed",bottom:"4%",right:"5%"}} hidden={this.state.type===0 || this.state.type===1 || this.state.type===3}>
              {
                this.state.uploaded === false ? (
                  <Tooltip title="Login by uploading Kyc Key text File and password" placement="top" interactive>
                    <Fab color="secondary" aria-label="add" component="span" onClick={(e)=>this.setState({open:true})}>
                      <VpnKeyIcon />
                    </Fab>
                  </Tooltip>
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
            <div style={{position:"fixed",top:"40%",left:"45%"}}>
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
