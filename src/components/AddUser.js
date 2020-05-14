import React, { Component } from 'react'

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
      id:"",
      loaded : false
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
    fetch(url+"getPendingRequest?verifierAddress="+currentAddress, {mode: 'cors'}).then(res => {
      return res.json()
    }).then(res=>{
      // console.log(res.requests);
      return res.requests;
    }).then(requests => {
      this.setState({
        requests : requests,
        loaded : true
      },x=>{console.log(this.state)})
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
          id:"",
          loaded : false
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
      // var foo = localStorage.getItem('foo');
      // foo=JSON.parse(foo);
      // const pkeyPem = localStorage.getItem('privateKey');
      // var privateKey = forge.pki.privateKeyFromPem(foo.privateKeyPem);
      var priKey = localStorage.getItem('privateKey');
      var privateKey = forge.pki.privateKeyFromPem(priKey);
      console.log(privateKey)
      var md = forge.md.sha1.create();
      md.update(rawData, 'utf8');
      var signature = privateKey.sign(md);
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
    // generate an RSA key pair synchronously
    // *NOT RECOMMENDED*: Can be significantly slower than async and may block
    // JavaScript execution. Will use native Node.js 10.12.0+ API if possible.
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
    // fetch(url+'download/'+fileName);
    window.open(url+'download/'+fileName, '_blank');
  }

  handleVerify(event,name,phoneNumber,id){
    event.preventDefault();
    this.setState({
      name:name,
      phoneNumber:phoneNumber,
      id:id
    })
  }

  handleSubmit(event) {

    event.preventDefault();
    // this.init()
    var phoneNumberHash = this.calculateHash(this.state.phoneNumber).toHex();
    console.log(phoneNumberHash)
   
    const [rawData, hash] = [this.state.userData, phoneNumberHash]
    const userId = this.makeUserId(rawData)
    console.log(userId)
    console.log(hash)
    
    const signature = this.signUserData(this.props.account,rawData);
    console.log(signature)
    console.log(this.props.account[0])
    console.log(this.textInput.current)
    this.textInput.current.value = ""
    // this.removeUser();

    this.props.kycContract.methods.getPublicKey(this.props.account[0]).call()
    .then((key)=>{
      console.log(key)
      this.props.kycContract.methods.addUser(userId, signature, hash, this.props.account[0]).send({ from: this.props.account[0], gas: 972195 })
    }).then(x=>{
      console.log(x);
      this.removeUser();
    });
  }

  render() {
    return (
      <div>
        <div className='requests'>
          {
            this.state.loaded === true ? (
              <div>
                {
                  this.state.requests.length > 0 ? (
                    <div>
                      {
                        this.state.requests.map((request,key)=>{
                          return(
                            [<div className="request" key={request._id}>
                              <h3>{request.name}</h3>
                              <h4>{request.phoneNumber}</h4>
                              <input type="button" value="Download File" onClick={(event)=>{this.handleDownload(event,request.fileName)}}/>
                              <input type="button" value="verify" onClick={(event)=>{this.handleVerify(event,request.name,request.phoneNumber,request._id)}}/>
                            </div>,
                            <br/>]
                          )
                        })
                      }
                    </div>) : (<h1>No pending requets</h1>)
                }
               </div>
            ) : (<div>Not loaded</div>)
          }
        </div>
          <form>
            <input
              name="name"
              type="text"
              placeholder = "name"
              value = {this.state.name}
              />
            <input
              name="phoneNumber"
              type="text"
              placeholder = "Phone number"
              value = {this.state.phoneNumber}
              />
              <input
              name="userData"
              type="text"
              placeholder = "data"
              ref= {this.textInput}
              onChange={this.handleChange} />
            <input type="button" value="Submit" onClick={this.handleSubmit} />
          </form>
        </div>
    );
  }
}

export default AddUser;
