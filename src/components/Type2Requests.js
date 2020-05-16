import React, { Component } from 'react'
const url = "http://localhost:8000/";


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

    handleDownload(event,fileName){
        event.preventDefault();
        console.log(fileName);
        // fetch(url+'download/'+fileName);
        window.open(url+'download/'+fileName, '_blank');
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
                                                    UserId : {request.userId} filename : {request.fileName}
                                                    <input type="button" value="Download File" onClick={(event)=>{this.handleDownload(event,request.fileName)}}/>
                                                    <input type="button" value="send OTP" />
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