// import React, { Component } from 'react'
// import PhoneIcon from '@material-ui/icons/Phone';
// import EmailIcon from '@material-ui/icons/Email';
// import HomeIcon from '@material-ui/icons/Home';
// import PermIdentityIcon from '@material-ui/icons/PermIdentity';
// import ContactsIcon from '@material-ui/icons/Contacts';
// import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
// import DescriptionIcon from '@material-ui/icons/Description';
// import Card from '@material-ui/core/Card';
// import CardContent from '@material-ui/core/CardContent';
// import Typography from '@material-ui/core/Typography';


// import { serverUrl } from '../config/config'

// class VerifiedUsers extends Component {

//     constructor(props){
//         super(props)
//         console.log(props.kycContract);
//         console.log(props.account);
//         this.state={
//             loaded : false,
//             users : []
//         }
//     }

//     componentDidMount(){
//         this.loadUsers();
//     }

//     loadUsers(){
//         console.log(this.props.account[0])
//         this.props.kycContract.methods.getCustomersList(this.props.account[0]).call({}, (err, customersList) => {
//             console.log(customersList)
//             // var customerArray = customersList.split("#")
//             // console.log(customerArray)
//             const options= {
//                 method: 'POST',
//                 body: JSON.stringify({
//                   customerList: customersList,
//                 }),
//                 headers: {
//                   'Accept': 'application/json',
//                   'Content-Type': 'application/json'
//               }};
//             fetch(serverUrl+"kycData2",options).then(res => {
//                 return res.json()
//             }).then(res=>{
//                 console.log(res); 
//                 return res.data;
//             })
//             .then(users => {
//                 users = users.map((user,key)=>{
//                     return(
//                         {
//                             ...user,
//                             data : JSON.parse(user.data)
//                         }
                        
//                     )
//                 })
//                 this.setState({
//                 users : users,
//                 loaded : true
//                 },x=>{console.log(this.state)})
//                 this.props.loadComponent(true)
//             })
//         });       
//     }

//     render(){
//         return(
//             <div style={{align:"center"}}>
//             <br/>
//             <h2 style={{textAlign:"center"}}>Fully Verified Users</h2>
//             <br/>
//             {
//                 this.state.loaded === true ? (
//                     this.props.uploaded === true ? (
//                         <div>
//                             {
//                                 this.state.users.length > 0 ? (
                                    
//                                             this.state.users.map((user,key)=>{
//                                                 return(
//                                                     <Card style={{marginBottom:"22px"}} key={key}>
//                                                         <CardContent>
//                                                             <Typography style={{fontSize:"1.1rem"}}><ContactsIcon style={{marginRight:"15px"}}/>{user.data.name}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><PhoneIcon style={{marginRight:"15px"}}/>{user.data.phoneNumber}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><EmailIcon style={{marginRight:"15px"}}/>{user.data.email}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><HomeIcon style={{marginRight:"15px"}}/>{user.data.address}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><AssignmentIndIcon style={{marginRight:"15px"}}/>{user.data.docId}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><DescriptionIcon style={{marginRight:"15px"}}/>{user.data.docType}</Typography>
//                                                             <Typography style={{fontSize:"1.1rem"}}><PermIdentityIcon style={{marginRight:"15px"}}/>{user.userId}</Typography>
//                                                         </CardContent>
//                                                     </Card>
//                                                 )
//                                             })
                                        
//                                 ) : (
//                                     <div style={{textAlign:'center'}}>No User :)</div>
//                                 )
//                             }
//                         </div>
//                     ) : (<div style={{textAlign:'center'}}>Login to view the users</div>)
//                 ) : (
//                     <div>Not loaded</div>
//                 )
//             }
//             </div>
//         );
//     }
// }

// export default VerifiedUsers;
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
const forge = require('node-forge');

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
            var customerArray = customersList.split("#")
            console.log(customerArray)
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
                this.decryptCId()
            })
        });      
    }

    async decryptCId(){
        // event.preventDefault();
        let privateKey = localStorage.getItem('privateKey'+this.props.account[0]);
        console.log(privateKey)
        privateKey = forge.pki.privateKeyFromPem(privateKey);
        console.log(privateKey)
        var decryptedCId = ''
        var cId = "g8a36kTFHhY0nQzdM1JuEAMJWNPB1/6LeS3oQT1G6TNeHlPKcrwFKt2CFpGcdW7MWlGkk7xankTD3Zm874mRL90G3tEZeP/ms/affKCcCa/x2p65rmEOkcy2F0h4Pt09WjBzZ+buEKPZzUjrVwWm6tajm6GjKFdrV8cw+j3z4jJCa2JG4zR0U31z70VTRpjHJb0HrOBlR3eOzvGkhExPfjGHtMaTmxc/C3Ieaw6tvuNCHAQWNsEsx2JkGYd//EXp88rNo2kEK7/LznCL7CEVXCH2mpgyQ/OSLq3xKrCo2toVYZml2A6Syvjfl0Lr3oIz6Ct26XyrgxC87jkRD8k3aQ=="
        try{
            cId= forge.util.decode64(cId)
            decryptedCId = privateKey.decrypt(cId);
            console.log(decryptedCId)
        }catch(e){
            console.log(e)
            this.setState({
                snackbarMessage: 'error decrypting Content identifier',
                snackbarOpen: true
            })
            console.log("error decrypting content identifier");
            return
        }
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