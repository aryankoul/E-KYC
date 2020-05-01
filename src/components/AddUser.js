import React, { Component } from 'react'

class AddUser extends Component {

  constructor(props) {
    super(props)
    this.state = {
    }
    // console.log(props.kycContract);
  } 

  componentDidMount(){
  }

  handleChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }



    handleSubmit(event) {

      event.preventDefault()

    }

  render() {
    return (
      <form>
        <input
          name="userId"
          type="text"
          placeholder = "user id"
          onChange={(event)=>{this.handleChange(event)}} />
        <input
          name="userSignature"
          type="text"
          placeholder = "signature"
          onChange={(event)=>{this.handleChange(event)}} />
        <input
          name="userPhoneNumber"
          type="text"
          placeholder = "phone number"
          onChange={(event)=>{this.handleChange(event)}} />
          <input type="button" value="Submit" onClick={(event)=>{this.handleSubmit(event)}} />
      </form>
    );
  }
}

export default AddUser;