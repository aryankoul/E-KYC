import React, { Component } from 'react'
const url = "http://localhost:8000/";

class VerifiedUsers extends Component {

    constructor(props){
        super(props)
        console.log(props.kycContract);
        console.log(props.account);
        this.state={
            loaded : false,
            users : []
        }
    }

    componentDidMount(){
        this.loadUsers();
    }

    loadUsers(){
        const currentAddress = this.props.account[0]
        fetch(url+"kycData?verifierAddress="+currentAddress, {mode: 'cors'}).then(res => {
            return res.json()
        }).then(res=>{
            console.log(res);
            this.setState({
                loaded : true
            }) 
            // return res.requests;
        })
        // .then(requests => {
        //     this.setState({
        //     requests : requests,
        //     loaded : true
        //     },x=>{console.log(this.state)})
        // })
    
    }

    render(){
        return(
            <div>
            Viewing fully verified Users
            {
                this.state.loaded === true ? (
                    <div>
                        {
                            this.state.users.length > 0 ? (
                                <ul>
                                    {
                                        this.state.users.map((request,key)=>{
                                            return(
                                                <div>users</div>
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

export default VerifiedUsers;