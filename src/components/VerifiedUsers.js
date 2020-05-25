import React, { Component } from 'react'
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import HomeIcon from '@material-ui/icons/Home';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import ContactsIcon from '@material-ui/icons/Contacts';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import DescriptionIcon from '@material-ui/icons/Description';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


import { serverUrl } from '../config/config'

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
        console.log(this.props.account[0])
        this.props.kycContract.methods.getCustomersList(this.props.account[0]).call({}, (err, customersList) => {
            console.log(customersList)
            // var customerArray = customersList.split("#")
            // console.log(customerArray)
            const options= {
                method: 'POST',
                body: JSON.stringify({
                  customerList: customersList,
                }),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }};
            fetch(serverUrl+"kycData2",options).then(res => {
                return res.json()
            }).then(res=>{
                console.log(res); 
                return res.data;
            })
            .then(users => {
                users = users.map((user,key)=>{
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
                this.props.loadComponent(true)
            })
        });       
    }

    render(){
        return(
            <div style={{align:"center"}}>
            <br/>
            <h2 style={{textAlign:"center"}}>Fully Verified Users</h2>
            <br/>
            {
                this.state.loaded === true ? (
                    this.props.uploaded === true ? (
                        <div>
                            {
                                this.state.users.length > 0 ? (
                                    
                                            this.state.users.map((user,key)=>{
                                                return(
                                                    <Card style={{marginBottom:"22px"}} key={key}>
                                                        <CardContent>
                                                            <Typography style={{fontSize:"1.1rem"}}><ContactsIcon style={{marginRight:"15px"}}/>{user.data.name}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><PhoneIcon style={{marginRight:"15px"}}/>{user.data.phoneNumber}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><EmailIcon style={{marginRight:"15px"}}/>{user.data.email}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><HomeIcon style={{marginRight:"15px"}}/>{user.data.address}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><AssignmentIndIcon style={{marginRight:"15px"}}/>{user.data.docId}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><DescriptionIcon style={{marginRight:"15px"}}/>{user.data.docType}</Typography>
                                                            <Typography style={{fontSize:"1.1rem"}}><PermIdentityIcon style={{marginRight:"15px"}}/>{user.userId}</Typography>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })
                                        
                                ) : (
                                    <div style={{textAlign:'center'}}>No User :)</div>
                                )
                            }
                        </div>
                    ) : (<div style={{textAlign:'center'}}>Login to view the users</div>)
                ) : (
                    <div>Not loaded</div>
                )
            }
            </div>
        );
    }
}

export default VerifiedUsers;