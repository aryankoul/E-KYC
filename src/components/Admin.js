import React, { Component } from 'react'
import { Button } from '@material-ui/core';
import AccountBalance from '@material-ui/icons/AccountBalance';
import BusinessIcon from '@material-ui/icons/Business';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';

import SnackBarNotification from './SnackBarNotification';


class Admin extends Component {

  constructor(props) {
    super(props)
    this.state = { 
        unverifiedVerifiers: [],
        verifiedVerifiers:[],
        snackbarMessage: '',
        snackbarOpen: false,
        loaded : false
    }
    this.handleAdd = this.handleAdd.bind(this)
    console.log(this.props.kycContract)
  } 

  componentDidMount() {
    this.getVerfiers();
  }

  async loadAdminData() {
    this.props.kycContract.methods.getUnverifiedVerifiers().call({}, (err, unverifiedVerifiers) => {
      console.log(unverifiedVerifiers)
      if(unverifiedVerifiers.length === 0){
        this.props.loadComponent(true)
      }
        unverifiedVerifiers.map((unverifiedVerifier, key) => {
          this.props.kycContract.methods.getVerifier(unverifiedVerifier).call({}, (err,verifierDetails) => {
            const verifier = {bankName: verifierDetails, address: unverifiedVerifier}
            this.setState({unverifiedVerifiers:[...this.state.unverifiedVerifiers,verifier]})
            console.log(unverifiedVerifier)
            this.props.loadComponent(true)
          });
        })
    })
  }

  getVerfiers(){
    this.props.kycContract.methods.getVerifiedVerifiers().call({}, (err, verifiedVerifiers) => {
      console.log(verifiedVerifiers)
      if (verifiedVerifiers !== null && verifiedVerifiers.length !== 0){
      this.loadAdminData();
      verifiedVerifiers.map((verifiedVerifier, key) => {
        this.props.kycContract.methods.getVerifier(verifiedVerifier).call({}, (err,verifierDetails) => {
          const verifier = {bankName: verifierDetails, address: verifiedVerifier}
          this.setState({verifiedVerifiers:[...this.state.verifiedVerifiers,verifier]})
        });
      })
    }
    else{
      this.loadAdminData();
    }
  }) 
  }

  handleAdd(event, key) {
    console.log(this.state.unverifiedVerifier)
    const target = event.target
    console.log(target)
    console.log(key)
    const address = this.state.unverifiedVerifiers[key].address
    console.log(this.props.kycContract);
    this.props.kycContract.methods.verifyVerifier(address).send({from: this.props.account[0], gas: 672195}, (err, result) => {
      if(err){
        this.setState({
            snackbarMessage: 'Could not verify user',
            snackbarOpen: true,
        })
      }
      else{
        console.log(result)
        this.setState({
            snackbarMessage: 'Verifier verified successfully',
            snackbarOpen: true
        })
      }
      this.setState({unverifiedVerifiers: [],verifiedVerifiers:[]},x=>{this.getVerfiers()})
      this.props.loadComponent(false)
    })
  }


  render() {
    return (
      <div >
        <Grid container>
          <Grid item xs={6} style={{textAlign:"center"}}>
          <br/><br/>
          <h2 style={{textAlign:"center"}}>Unverified Verifiers</h2>
          <br/><br/>
          {
              this.state.unverifiedVerifiers.length === 0 ? (
              <div style={{textAlign:"center"}}>No pending requests :)</div>
              ) : (
                this.state.unverifiedVerifiers.map((verifier,key) => {
                  return(
                    <Card style={{marginBottom:"28px",minWidth:"70%",marginLeft:"4%",marginRight:"2%"}} key={key}>
                      <CardContent>
                        <h5><AccountBalance style={{marginRight:"7px"}}/>{verifier.bankName}</h5>
                        <h5><BusinessIcon style={{marginRight:"7px"}}/>{verifier.address}</h5>
                        <Button variant="contained" color="primary" component="span" id={key} onClick={(event)=>{this.handleAdd(event, key)}} style={{marginTop:"5px"}}>Verify</Button>
                      </CardContent>
                    </Card>
                  )
                })
              )
            }
          </Grid>
          <Grid item xs={6} style={{textAlign:"center"}}>
          <br/><br/>
          <h2 style={{textAlign:"center"}}>Verified Verifiers</h2>
          <br/><br/>
          {
              this.state.verifiedVerifiers.length === 0 ? (
              <div style={{textAlign:"center"}}>No Verifiers to display</div>
              ) : (
                this.state.verifiedVerifiers.map((verifier,key) => {
                  return(
                    <Card style={{marginBottom:"35px",minWidth:"70%",marginRight:"4%",marginLeft:"2%"}} key={key}>
                      <CardContent>
                        <h5><AccountBalance style={{marginRight:"7px"}}/>{verifier.bankName}</h5>
                        <h5><BusinessIcon style={{marginRight:"7px"}}/>{verifier.address}</h5>
                      </CardContent>
                    </Card>
                  )
                })
              )
            }
          </Grid>
            
            <SnackBarNotification message={this.state.snackbarMessage} open={this.state.snackbarOpen} toggle = {(val) => this.setState({snackbarOpen: val})} />
        </Grid>
      </div>
    );
  }
} 


export default Admin;
