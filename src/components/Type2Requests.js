import React, { Component } from 'react'
import { Button } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import EmailIcon from '@material-ui/icons/Email';

import SnackBarNotification from './SnackBarNotification';


import { serverUrl } from '../config/config'


class Type2Requests extends Component {

    constructor(props){
        super(props)
        console.log(props.kycContract);
        console.log(props.account);
        this.state={
            loaded : false,
            requests : [],
            snackbarOpen: false,
            snackbarMessage: ''
        }
    }

    componentDidMount(){
        this.loadRequests();
    }

    generateOtp() {
        var letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let otp = ''
        const len = letters.length
        for(let i = 0; i < 10; i++) {
            otp += letters[Math.floor(Math.random() * len)]
        }
        return otp
    }

    loadRequests(){
        const currentAddress = this.props.account[0]
        fetch(serverUrl+"getPendingRequest?verifierAddress="+currentAddress+"&type=2", {mode: 'cors'}).then(res => {
            return res.json()
        }).then(res=>{
            console.log(res.requests);
            return res.requests;
        }).then(requests => {
            requests = requests.map((request,key)=>{
                return(
                    {
                        ...request,
                        qrData : JSON.parse(request.qrData)
                    }
                    
                )
            })
            this.setState({
            requests : requests,
            loaded : true
            },x=>{console.log(this.state)})
            this.props.loadComponent(true)
        })
    
    }

    handleClick(e,id,userPubKey,email,_id, encryptedData){
        e.preventDefault();
        this.props.kycContract.methods.getUserSignature(id).call().then(signature => {
            this.setState({signature:signature})
            this.props.kycContract.methods.getVerifierPublicKeyForUser(id).call().then(key=>{
                var verifierPublicKey = key;
                var signature = this.state.signature;
                var otp = this.generateOtp();
                var verifierAddress = this.props.account[0];
                var userId = id;
                var userPublicKey = userPubKey;
                console.log(otp, verifierAddress, userId, userPublicKey, verifierPublicKey, signature, email);
                const reqOptions= {
                    method: 'POST',
                    body: JSON.stringify({
                        otp, verifierAddress, userId, userPublicKey, verifierPublicKey, signature, email, _id, encryptedData
                    }),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  }};
                  fetch(serverUrl+"initiateVerification",reqOptions)
                    .then(req => req.json())
                    .then(data => {
                            this.setState({
                                snackbarMessage: data.message,
                                snackbarOpen: true
                            })
                            this.loadRequests()
                        })
            })
        })
    }

    render(){
        return(
            <div style={{align:"center"}}>
            <br/>
            <h2 style={{textAlign:"center"}}>Users previously registered with other banks</h2>
            <br/>
            {
                this.state.loaded === true ? (
                    this.props.uploaded === true ? (
                        <div>
                        {
                            this.state.requests.length > 0 ? (
                                this.state.requests.map((request,key)=>{
                                    return(
                                    <Card style={{marginBottom:"22px"}} key={key}>
                                        <CardContent>
                                            <h6><AccountBoxIcon style={{marginRight:"7px"}}/>{request.userId}</h6>
                                            <h5><EmailIcon style={{marginRight:"7px"}}/>{request.qrData.email}</h5>
                                            <Button variant="contained" color="primary" component="span" 
                                            onClick={(e)=>this.handleClick(e,request.userId,request.qrData.publicKey,request.qrData.email, request._id, request.qrData.encryptedData)}
                                            style={{marginTop:"5px"}}>Send OTP
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    )
                                })  
                            ) : (
                                <div style={{textAlign:'center'}}>No pending requests :)</div>
                            )
                        }
                            <SnackBarNotification open={this.state.snackbarOpen} message={this.state.snackbarMessage} toggle={(val) => this.setState({snackbarOpen: val})} />
                        </div>
                    ) : (<div style={{textAlign:'center'}}>Login to view the pending requests</div>)
                ) : (
                    <div>Not loaded</div>
                )
            }
            </div>
        );
    }
}

export default Type2Requests;
