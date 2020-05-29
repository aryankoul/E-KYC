import React, { Component } from 'react'
import { Tab,Tabs,AppBar } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import AddUser from './AddUser.js'
import Type2Requests from './Type2Requests.js'
import VerfiedUsers from './VerifiedUsers.js'
import Loader from './Loader.js'

class Verifier extends Component {
  
  constructor(props) {
    super(props)
    console.log(props);
    this.state={
      value : 0,
      loadedAddUser:false,
      loadedType2User:false,
      loadedVerifiedUser:false
    }
  } 

  handleChange(e,value){
    this.setState({
      value:value
    })
  }

  show(){
    return (this.state.loadedAddUser && this.state.loadedType2User && this.state.loadedVerifiedUser)
  }

  render() {
    return (
      <>
      <div hidden={!this.show()}>
        <AppBar position="static" elevation={0}>
          <Tabs value={this.state.value} onChange={(e,value)=>this.handleChange(e,value)} centered>
            <Tab label="Add User" />
            <Tab label="View Verification Requests" />
            <Tab label="Veiw Verified Users"/>
          </Tabs>
        </AppBar>
        <div style={{backgroundColor:"white",display:"flex",justifyContent:"center",minHeight:"100vh",width:"100%"}}>
        <Grid container spacing={3} role="tabpanel" alignContent="center" justify="center" hidden={this.state.value !== 0}>
        <AddUser kycContract = {this.props.kycContract} account = {this.props.accounts} uploaded={this.props.uploaded} loadComponent={(val)=>this.setState({loadedAddUser:val})}/>
        </Grid>
        <br/>
        <div
          role="tabpanel"
          hidden={this.state.value !== 1}
        ><div className="type2requets"><Type2Requests kycContract = {this.props.kycContract} account = {this.props.accounts} uploaded={this.props.uploaded} loadComponent={(val)=>this.setState({loadedType2User:val})}/> </div></div>
        <div
          role="tabpanel"
          hidden={this.state.value !== 2}
          style={{width:"100%"}}
        >
        <VerfiedUsers kycContract = {this.props.kycContract} account = {this.props.accounts} loadedAddUser={this.state.loadedAddUser} uploaded={this.props.uploaded} loadComponent={(val)=>this.setState({loadedVerifiedUser:val})}/>  </div>
        <br/></div>
      </div>
      <div style={{position:"fixed",top:"40%",left:"45%"}} hidden={this.show()}>
        <Loader />
      </div>
      </>
    );
  }
}

export default Verifier;
