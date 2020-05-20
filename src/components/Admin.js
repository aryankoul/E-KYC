import React, { Component } from 'react'
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Button } from '@material-ui/core';
import AccountBalance from '@material-ui/icons/AccountBalance';
import BusinessIcon from '@material-ui/icons/Business';
import Card from '@material-ui/core/Card';


class Admin extends Component {
  componentWillMount() {
    this.loadAdminData()
  }

  async loadAdminData() {
    this.props.kycContract.methods.getUnverifiedVerifiers().call({}, (err, unverifiedVerifiers) => {
        unverifiedVerifiers.map((unverifiedVerifier, key) => {
          this.props.kycContract.methods.getVerifier(unverifiedVerifier).call({}, (err,verifierDetails) => {
            const verifier = {bankName: verifierDetails, address: unverifiedVerifier}
            this.setState({unverifiedVerifiers:[...this.state.unverifiedVerifiers,verifier]})
            console.log(unverifiedVerifier)
          });
        })
    })
  }

  constructor(props) {
    super(props)
    this.state = { unverifiedVerifiers: [] }
    this.handleAdd = this.handleAdd.bind(this)
    console.log(this.props.kycContract)
  } 

  handleAdd(event, key) {
    console.log(this.state.unverifiedVerifier)
    const target = event.target
    console.log(target)
    console.log(key)
    const address = this.state.unverifiedVerifiers[key].address
    console.log(this.props.kycContract);
    this.props.kycContract.methods.verifyVerifier(address).send({from: this.props.account[0], gas: 672195}, (err, result) => {
      if(err) console.log(err);
      console.log(result)
      this.setState({unverifiedVerifiers: []})
      this.loadAdminData();
    })
  }


  render() {
    return (
      <div>
        <h5 style={{ display:'flex', justifyContent:'center' }}>Unverified Verifiers</h5>
          {
          this.state.unverifiedVerifiers.map((verifier,key) => {
              return([<br/>,
                <div style={{ display:'flex', justifyContent:'center' }}>
                <Card style={{width: '30%', height: '20%', align: 'center'}}>
                <List component="div" style={{width: '90%', height: '20%'}}>
                  <ListItem button>
                    <ListItemIcon>
                      <AccountBalance />
                    </ListItemIcon>
                    <ListItemText primary={verifier.bankName} />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText primary={verifier.address} />
                  </ListItem>
                  <Button variant="contained" color="primary" component="span" id={key} onClick={(event)=>{this.handleAdd(event, key)}}>Verify</Button>

                  {/* <input type="button" id = {key} onClick = {this.handleAdd}/> */}
                  {/* <input style={{display: 'none'}} type="button" id = {key} onClick = {(event)=>{this.handleAdd(event)}}/>
                  <label htmlFor={key}>
                    <Button variant="contained" color="primary" component="span">
                       Submit
                     </Button>
                    </label> */}
                  {/* <Button component="span" name = {key} onClick = {(event)=>{this.handleAdd(event)}}>Submit</Button> */}
                </List>
                </Card>
                <br/><br/>
                </div>
              ])
          })
        }
      </div>
    );
  }
} 


export default Admin;