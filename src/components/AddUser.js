import React, { Component } from 'react'
import { TextField } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';

import SnackBarNotification from './SnackBarNotification';

var forge = require('node-forge');
const url = "http://localhost:8000/";



class AddUser extends Component {

  constructor(props) {
    console.log(props.account)
    console.log(props.kycContract)
    super(props)
    this.state = {
      requests : [],
      name : "",
      phoneNumber: "",
      email:"",
      docType:"",
      publicKey:"",
      id:"",
      loaded : false,
      snackbarMessage: '',
      snackbarOpen: false,
      kycId: ""
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.textInput = React.createRef();
  } 

  componentDidMount() {
    this.loadRequests();
  }

  loadRequests(){
    const currentAddress = this.props.account[0]
    fetch(url+"getPendingRequest?verifierAddress="+currentAddress+"&type=13", {mode: 'cors'}).then(res => {
      return res.json()
    }).then(res=>{
      // console.log(res.requests);
      return res.requests;
    }).then(requests => {
      this.setState({
        requests : requests,
        loaded : true
      },x=>{console.log(this.state)})
      this.props.loadComponent(true)
    })

  }

  removeUser(){
    // var formBody = new FormData();
    // formBody.set("_id",this.state.id)
    console.log(this.state.id);

    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        _id: this.state.id
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     }
    };
    fetch(url+"request/delete",requestOptions)
    .then(res=>{return res.json()}).then(
      data => {
        console.log(data);
        this.setState({
          requests : [],
          name : "",
          phoneNumber: "",
          email:"",
          documentType:"",
          publicKey:"",
          id:"",
          docId : "",
          loaded : false,
          kycId: ""
        })
        this.loadRequests();
      }
    )
  }


  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  calculateHash(phoneNumber){
    var md = forge.md.sha256.create();
    md.update(phoneNumber);
    return md.digest();
  }

  signUserData(address, rawData){ 
    console.log(rawData)
      // var foo = localStorage.getItem('foo');
      // foo=JSON.parse(foo);
      // const pkeyPem = localStorage.getItem('privateKey');
      // var privateKey = forge.pki.privateKeyFromPem(foo.privateKeyPem);
      var priKey = localStorage.getItem('privateKey' + address[0]);
      var privateKey = forge.pki.privateKeyFromPem(priKey);
      console.log(privateKey)
      var md = forge.md.sha1.create();
      md.update(rawData, 'utf8');
      var signature = privateKey.sign(md);
      signature = forge.util.encode64(signature)
      console.log(signature)
      return signature;
  } 
  
  makeUserId(rawData){
    var date = new Date();
    var timestamp =  date.getTime();
    const userId = this.calculateHash(rawData+timestamp).toHex();
    return userId;
  }

  init(){

    var rsa = forge.pki.rsa;
    var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
    var foo = JSON.stringify({
      publicKeyPem: forge.pki.publicKeyToPem(keypair.publicKey),
      privateKeyPem: forge.pki.privateKeyToPem(keypair.privateKey)
    });
    localStorage.setItem('foo',foo)
  }

  handleDownload(event,fileName){
    event.preventDefault();
    console.log(fileName);
    window.open(url+'download/'+fileName, '_blank');
  }

  handleVerify(event,name,phoneNumber,email,publicKey,id,docType, kycId){
    event.preventDefault();
    this.setState({
      name:name,
      phoneNumber:phoneNumber,
      email:email,
      id:id,
      publicKey:publicKey,
      docType:docType,
      kycId: kycId
    })
  }

  handleSubmit(event) {

    event.preventDefault();

    var emailHash = this.calculateHash(this.state.email).toHex();
    console.log(emailHash)
   
    const data = {
      "name": this.state.name,
      "phoneNumber": this.state.phoneNumber,
      "email": this.state.email,
      "docType": this.state.docType,
      "docId" : this.state.docId
    }



    const rawData = JSON.stringify(data); 
    console.log(rawData)
    
    var userId="",flag=false

    if(this.state.kycId!=="" && this.state.kycId!=null){
      userId=this.state.kycId
      flag=true
    }
    else{
      userId = this.makeUserId(rawData)
      console.log("hi")
    }
    console.log(userId)
    const hash = emailHash
    console.log(hash)
    
    const signature = this.signUserData(this.props.account,rawData);
    console.log(signature)
    console.log(this.props.account[0])
    console.log(this.textInput.current)
    this.textInput.current.value = ""

    this.props.kycContract.methods.getPublicKey(this.props.account[0]).call()
    .then((key)=>{
      console.log(this.state.publicKey);
      this.props.kycContract.methods.addUser(userId, signature, hash, this.props.account[0]).send({ from: this.props.account[0], gas: 972195 })
      var pkey = forge.pki.publicKeyFromPem(this.state.publicKey)
      var plaintextBytes = forge.util.encodeUtf8(rawData);
      var encrypted = pkey.encrypt(plaintextBytes)
      encrypted = forge.util.encode64(encrypted)
      var qrData={
        encryptedData:encrypted,
        publicKey:this.state.publicKey,
        userId:userId,
        email:this.state.email
      }
      qrData=JSON.stringify(qrData);
      console.log(qrData)
      console.log(this.state)
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
          email: this.state.email,
          data:qrData,
          userId:userId
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
       }
      };
      fetch(url+"mailQR",requestOptions)
    .then(res => console.log(res.text()));
    }).then(x=>{
      const reqOptions= {
        method: 'POST',
        body: JSON.stringify({
          originalData: rawData,
          verifierAddress:this.props.account[0],
          userId:userId,
          userPublicKey:this.state.publicKey
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }};
      console.log(reqOptions)

      fetch(url+"verify",reqOptions)
      .then(res => res.json())
      .then(data => {
        this.setState({
          snackbarMessage: data.message,
          snackbarOpen: true
        })
        // this.props.loadComponent(false)
        this.removeUser();
        this.setState({name:'', phoneNumber:'', email:'', docType:'', docId:''})
      })

      if(flag==true){
        const options= {
          method: 'POST',
          body: JSON.stringify({
            newData: rawData,
            userId:userId,
          }),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }};
        fetch(url+"updateKyc",options)
              .then(res => res.json())
              .then(data => {
               this.setState({
                  snackbarMessage: data.message,
                  snackbarOpen: true
               })
               this.props.loadComponent(false)
              })
        console.log(x);
      }
      
        console.log(x);
    });
  }

  render() {
    return (
     [
        <Grid item xs={6} style={{textAlign:"center"}}>
          <div className='requests'>
            {
              this.state.loaded === true ? (
                this.props.uploaded === true ? (
                  <div>
                  {
                    this.state.requests.length > 0 ? (
                      <div style={{textAlign:"-webkit-center"}}>
                        {
                          this.state.requests.map((request,key)=>{
                            return(
                              <Card style={{maxWidth:"70%",marginBottom:"18px"}} key={request._id}>
                                <CardContent>
                                  <h2  style={{marginBottom:"10px"}}>{request.name}</h2>
                                  <h5><PhoneIcon style={{marginRight:"7px"}}/>{request.phoneNumber}</h5>
                                  <h5><EmailIcon style={{marginRight:"7px",marginBottom:"12px"}}/>{request.email}</h5>
                                  <Button variant="contained" color="primary" component="span" onClick={(event)=>{this.handleDownload(event,request.fileName)}}  style={{marginRight:"12px"}}>Download File</Button>
                                  <Button variant="contained" color="primary" component="span" onClick={(event)=>{this.handleVerify(event,request.name,request.phoneNumber,request.email,request.publicKey,request._id, request.docType, request.userId)}}>Verify</Button>
                                </CardContent>
                              </Card>
                            )
                          })
                        }
                      </div>) : (<div style={{textAlign:'center'}}>No pending first time user requets :)</div>)
                  }
                </div>
                ) : (<div style={{textAlign:'center'}}>Login to view pending requests</div>)
              ) : (<div>Not loaded</div>)
            }
          </div>
        </Grid>,
        <Grid item xs={6} style={{textAlign:"center"}} >
          <FormControl style={{width:"60%"}}>
            <TextField
            required
            id="outlined-required"
            variant="outlined"
            name="name"
            type="text"
            label="Name"
            placeholder = "name"
            value = {this.state.name}
            style={{marginBottom:"15px"}}
            />
            <TextField
            required
            id="outlined-required"
            variant="outlined"
            label="Phone Number"
            name="phoneNumber"
            type="text"
            placeholder = "Phone number"
            value = {this.state.phoneNumber}
            style={{marginBottom:"15px"}}
            />
            <TextField
            required
            id="outlined-required"
            variant="outlined"
            label="Email Address"
            name="email"
            type="text"
            placeholder = "email"
            value = {this.state.email}
            style={{marginBottom:"15px"}}
            />
            <TextField
            required
            id="outlined-required"
            variant="outlined"
            label="Document Type"
            name="docType"
            type="text"
            placeholder = "document Type"
            value = {this.state.docType}
            style={{marginBottom:"15px"}}
            />
            <TextField
            required
            id="outlined-required"
            variant="outlined"
            label="Document IDs"
            name="docId"
            type="text"
            placeholder = "document ID"
            onChange={this.handleChange}
            ref = {this.textInput} 
            value = {this.state.docId}
            style={{marginBottom:"15px"}}
            />
            <Button variant="contained" color="primary" component="span" onClick = {(event)=>{this.handleSubmit(event)}} disabled={!this.props.uploaded}>Submit</Button>
          </FormControl>
  
          <SnackBarNotification message={this.state.snackbarMessage} open={this.state.snackbarOpen} toggle = {(val) => this.setState({snackbarOpen: val})} />
        </Grid>
      ]
    );
  }
}

export default AddUser;
