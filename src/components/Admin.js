import React, { Component } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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

  handleAdd(event) {
    const target = event.target
    const key = target.id
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
        <h3>Unverified Verifiers</h3>
        <List component="nav"
        aria-labelledby="Unverified Verifiersr"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Nested List Items
          </ListSubheader>
        }
        className={classes.root}> 

        </List>
        <ol>
          {
            this.state.unverifiedVerifiers.map((verifier,key) => {
              return(
                <ui>
                  <li>{verifier.bankName}</li> 
                  <li>{verifier.address}</li> 
                  <input type = "button" value = "Verify" id = {key} onClick = {this.handleAdd} />
                </ui>
              )
            })
          }
        </ol>
        <li></li>
      </div>
    );
  }
}

export default Admin;