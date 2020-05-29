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
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';
import SnackBarNotification from './SnackBarNotification';

import { serverUrl } from '../config/config'
import { ipfsGet } from '../config/config'
const forge = require('node-forge');


class VerifiedUsers extends Component {

    constructor(props){
        super(props)
        console.log(props.kycContract);
        console.log(props.account);
        this.state={
            loaded : false,
            users : [],
            showLoader:true,
            snackbarOpen:false,
            panelNum : -1,
            mail:""
        }
    }
    
    componentDidMount(){
        this.loadUsers();
    }

    componentDidUpdate(prevProps){
        if(this.props.loadedAddUser !== prevProps.loadedAddUser)
            this.loadUsers();
    }
    
    
    loadUsers(){
        console.log(this.props.account[0])
        this.props.kycContract.methods.getCustomersList(this.props.account[0]).call({}, (err, customersList) => {
            // console.log(customersList)
            if(customersList!=="")
            {
                const customerArray = customersList.split("#")
                const users = customerArray.map((user,key)=>{
                    return(
                        {
                            id : user,
                            loaded : false
                        }
                        )
                    });
                    this.setState({
                        users : users,
                        loaded : true
                    },x=>{console.log(this.state)})
                    this.props.loadComponent(true)
            }
            else{
                this.setState({loaded:true})
                this.props.loadComponent(true)
            }
        });      
    }
    

    handlePanelChange(event,expanded,userId,key){
        console.log(key)
        if(expanded===true)
        {
            this.setState({panelNum:key})
            const user = this.state.users[key]
            console.log(user);
            if(this.state.users[key].loaded===true)
            {
                this.setState({showLoader:false})
            }
            else
            {
                this.setState({showLoader:true})
                this.getUserDetails(userId,key);
            }
        }
        else{
            this.setState({
                panelNum:-1,
                showLoader:true
            })
        }
    }

    sendMail(email){

        const address = this.props.account[0];
        this.props.kycContract.methods.getVerifier(address).call({}, (err,bankName) => {
            const time = new Date().toLocaleString();
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({
                  email: email,
                  data:`Your data was accessed by ${bankName} at ${time}`
                }),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
               }
            };
            fetch(serverUrl+"sendMail",requestOptions)
            .then(res => {
                console.log(res.text())
                this.setState({showLoader:false,snackbarOpen:true})
            });
        });
    }


    getUserDetails(userId,Key){
        this.props.kycContract.methods.getCidForUser(userId,this.props.account[0]).call({},(err,cid)=>{
            if(!err)
            {
                console.log(cid)
                let privateKey = localStorage.getItem('privateKey'+this.props.account[0]);
                privateKey = forge.pki.privateKeyFromPem(privateKey);
                let decryptedCid = "";
                try{
                    cid= forge.util.decode64(cid)
                    decryptedCid = privateKey.decrypt(cid);
                    console.log(decryptedCid)
                    this.getDataFromIpfs(decryptedCid).then(data=>{
                        console.log(data);
                        const updatedUsers = this.state.users.map((user,key)=>{
                            if(key===Key)
                            {
                                return{
                                    loaded:true,
                                    id:user.id,
                                    name:data.name,
                                    phoneNumber:data.phoneNumber,
                                    email:data.email,
                                    address:data.address,
                                    docId:data.docId,
                                    docType:data.docType
                                }
                            }
                            else
                            return user
                        })
                        console.log(updatedUsers);
                        
                        this.setState({
                            users:updatedUsers,
                            mail:data.email
                        },this.sendMail(data.email))
                    })
                }catch(e){
                console.log(e)
                }
            }
            else
                console.log(err)
        })
    }


    getDataFromIpfs(cid){
        return fetch(ipfsGet+cid).then((res)=>res.json())
    }

    
    render(){
        return(
            <div style={{width:"100%",textAlign:"center"}}>
            <br/>
            <h2>Fully Verified Users</h2>
            <br/><br/>
            {
                this.state.loaded === true ? (
                    this.props.uploaded === true ? (
                        <div style={{textAlign:"-webkit-center",width:"100%"}}>
                            {
                                this.state.users.length > 0 ? (
                                   
                                            this.state.users.map((user,key)=>{
                                                return(
                                                    <ExpansionPanel key={key} expanded={this.state.panelNum===key} onChange={(event,expanded)=>this.handlePanelChange(event,expanded,user.id,key)} style={{marginBottom:"30px",backgroundColor:"#3f51b5",paddingBottom:"2%",minHeight:"60px",maxWidth:"80%",paddingTop:"1%"}}>
                                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon style={{color:"white"}}/>} aria-controls="panel1a-content" id="panel1a-header">
                                                            <Typography style={{color:"white"}}><PermIdentityIcon style={{marginRight:"15px"}}/>{user.id}</Typography>
                                                        </ExpansionPanelSummary>
                                                        {
                                                            this.state.showLoader ? (
                                                                <ExpansionPanelDetails style={{justifyContent:"center"}}>
                                                                    <CircularProgress color="secondary"/>
                                                                </ExpansionPanelDetails>
                                                            ) : (
                                                                <ExpansionPanelDetails style={{textAlign:"left"}}>
                                                                    <Card style={{width:"100%"}}>
                                                                        <CardContent>
                                                                            <Typography style={{fontSize:"1.1rem"}}><ContactsIcon style={{marginRight:"15px"}}/>{user.name}</Typography>
                                                                            <Typography style={{fontSize:"1.1rem"}}><PhoneIcon style={{marginRight:"15px"}}/>{user.phoneNumber}</Typography>
                                                                            <Typography style={{fontSize:"1.1rem"}}><EmailIcon style={{marginRight:"15px"}}/>{user.email}</Typography>
                                                                            <Typography style={{fontSize:"1.1rem"}}><HomeIcon style={{marginRight:"15px"}}/>{user.address}</Typography>
                                                                            <Typography style={{fontSize:"1.1rem"}}><AssignmentIndIcon style={{marginRight:"15px"}}/>{user.docId}</Typography>
                                                                            <Typography style={{fontSize:"1.1rem"}}><DescriptionIcon style={{marginRight:"15px"}}/>{user.docType}</Typography>
                                                                        </CardContent>
                                                                    </Card>
                                                                </ExpansionPanelDetails>
                                                            )
                                                        }
                                                    </ExpansionPanel>
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
                <SnackBarNotification open={this.state.snackbarOpen} message={"email has been sent to "+this.state.mail} toggle={(val) => this.setState({snackbarOpen: val})} />
            </div>
        );
    }
}

export default VerifiedUsers;