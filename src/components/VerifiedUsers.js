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
            return res.data;
        })
        .then(users => {
            users = users.map((user,key)=>{
                console.log(user)
                return(
                    {
                        ...user,
                        data : JSON.parse(user.data)
                    }
                    
                )
            })
            this.setState({
            users : users,
            loaded : true
            },x=>{console.log(this.state)})
        })
    
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
                                        this.state.users.map((user,key)=>{
                                            return(
                                                <div className="user" key={key}>
                                                    <h4>{user.data.name}</h4>
                                                    <h4>{user.data.phoneNumber}</h4>
                                                    <h4>{user.data.email}</h4>
                                                    <h4>{user.userId}</h4>
                                                </div>
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