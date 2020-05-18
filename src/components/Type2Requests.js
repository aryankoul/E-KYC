import React, { Component } from 'react'

const url = "http://localhost:8000/";
var forge = require('node-forge');


class Type2Requests extends Component {

    constructor(props){
        super(props)
        console.log(props.kycContract);
        console.log(props.account);
        this.state={
            loaded : false,
            requests : []
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
        fetch(url+"getPendingRequest?verifierAddress="+currentAddress+"&type=2", {mode: 'cors'}).then(res => {
            return res.json()
        }).then(res=>{
            console.log(res.requests);
            return res.requests;
        }).then(requests => {
            this.setState({
            requests : requests,
            loaded : true
            },x=>{console.log(this.state)})
        })
    
    }

    handleClick(e,id,key,email){
        e.preventDefault();
        this.props.kycContract.methods.getUserSignature(id).call().then(signature => {
            var pubKey = localStorage.getItem('publicKey');
            var verifierPublicKey = forge.pki.publicKeyFromPem(pubKey);
            var otp = this.generateOtp();
            var verifierAddress = this.props.account[0];
            var userId = id;
            var userPublicKey = key;
            console.log(otp, verifierAddress, userId, userPublicKey, verifierPublicKey, signature, email);
        })
    }

    render(){
        return(
            <div>
            Viewing Type 2 requests
            {
                this.state.loaded === true ? (
                    <div>
                        {
                            this.state.requests.length > 0 ? (
                                <ul>
                                    {
                                        this.state.requests.map((request,key)=>{
                                            return(
                                                <li>
                                                    <h4>User ID: {request.id} </h4>
                                                    <h4>Email ID: {request.email} </h4>
                                                    <h4>Public Key: {request.publicKey} </h4>
                                                    <input type="button" value="send OTP" onClick={(e)=>this.handleClick(e,request.id,request.publicKey,request.email)}/>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            ) : (
                                <div>No pending requests</div>
                            )
                        }
                    </div>
                ) : (
                    <div>Not loaded</div>
                )
            }
            </div>
        );
    }
}

export default Type2Requests;