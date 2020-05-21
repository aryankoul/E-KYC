import React, { Component } from 'react'
import { Tab,Tabs,AppBar } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import AddUser from './AddUser.js'
import Type2Requests from './Type2Requests.js'
import VerfiedUsers from './VerifiedUsers.js'

class Verifier extends Component {
  
  constructor(props) {
    super(props)
    console.log(props);
    this.state={
      value : 0
    }
  } 

  handleChange(e,value){
    this.setState({
      value:value
    })
  }

  render() {
    return (
      <div>
        <AppBar position="static" elevation={0}>
          <Tabs value={this.state.value} onChange={(e,value)=>this.handleChange(e,value)} centered>
            <Tab label="Add User" />
            <Tab label="View Verification Requests" />
            <Tab label="Veiw Verified Users"/>
          </Tabs>
        </AppBar>
        <div style={{backgroundColor:"white",display:"flex",justifyContent:"center",height:"100vh",width:"100%"}}>
        <Grid container spacing={3} role="tabpanel" alignContent="center" justify="center"
          hidden={this.state.value !== 0}>
        {/* <div
          role="tabpanel"
          hidden={this.state.value !== 0}
        > */}
        <AddUser kycContract = {this.props.kycContract} account = {this.props.accounts} />
        {/* </div> */}
        </Grid>
        <br/>
        <div
          role="tabpanel"
          hidden={this.state.value !== 1}
        ><div className="type2requets"> Users previously registered with other banks<Type2Requests kycContract = {this.props.kycContract} account = {this.props.accounts}/> </div></div>
        <div
          role="tabpanel"
          hidden={this.state.value !== 2}
        >
        <VerfiedUsers kycContract = {this.props.kycContract} account = {this.props.accounts}/>  </div>
        <br/></div>
      </div>
    );
  }
}

export default Verifier;
