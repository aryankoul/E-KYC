import React, { Component } from 'react'
import { Button } from '@material-ui/core';
import AccountBalance from '@material-ui/icons/AccountBalance';
import BusinessIcon from '@material-ui/icons/Business';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import SnackBarNotification from './SnackBarNotification';


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
    this.state = { 
        unverifiedVerifiers: [],
        snackbarMessage: '',
        snackbarOpen: false
    }
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
      this.setState({
        snackbarMessage: 'Verifier verified successfully',
        snackbarOpen: true
      })
      this.setState({unverifiedVerifiers: []})
      this.loadAdminData();
    })
  }


  render() {
    return (
      <div style={{align:"center"}}>
        <br/>
        <h2 style={{textAlign:"center"}}>Unverified Verifiers</h2>
        <br/><br/>
          {
          this.state.unverifiedVerifiers.map((verifier,key) => {
              return(
                <Card style={{marginBottom:"22px"}} key={key}>
                  <CardContent>
                    <h5><AccountBalance style={{marginRight:"7px"}}/>{verifier.bankName}</h5>
                    <h5><BusinessIcon style={{marginRight:"7px"}}/>{verifier.address}</h5>
                    <Button variant="contained" color="primary" component="span" id={key} onClick={(event)=>{this.handleAdd(event, key)}} style={{marginTop:"5px"}}>Verify</Button>
                  </CardContent>
                </Card>
              )
          })
        }

      <SnackBarNotification message={this.state.snackbarMessage} open={this.state.snackbarOpen} toggle = {(val) => this.setState({snackbarOpen: val})} />
      </div>
    );
  }
} 


export default Admin;
