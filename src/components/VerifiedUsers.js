import React, { Component } from 'react'
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import ContactsIcon from '@material-ui/icons/Contacts';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import DescriptionIcon from '@material-ui/icons/Description';
import Card from '@material-ui/core/Card';

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
                                                <div>
                                                <br/>
                                                <Card style={{width: '40%', height: '20%', align: 'center'}}>
                                                <List component="div" style={{width: '90%', height: '20%'}}>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <ContactsIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.data.name} />
                                                </ListItem>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <PhoneIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.data.phoneNumber} />
                                                </ListItem>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <EmailIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.data.email} />
                                                </ListItem>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <AssignmentIndIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.data.docId} />
                                                </ListItem>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <DescriptionIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.data.docType} />
                                                </ListItem>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                    <PermIdentityIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={user.userId} />
                                                </ListItem>
                                                </List>
                                                </Card>
                                                <br/><br/>
                                                </div>
                                                // <div className="user" key={key}>
                                                //     <h4>{user.data.name}</h4>
                                                //     <h4>{user.data.phoneNumber}</h4>
                                                //     <h4>{user.data.email}</h4>
                                                //     <h4>{user.userId}</h4>
                                                // </div>
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