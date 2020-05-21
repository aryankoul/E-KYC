import React, { Component } from 'react'
import { Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';

class SnackBarNotification extends Component {

    constructor(props){
        super(props)

        this.state = {
            open: false
        }
    }

 

    render() {
    return(
        <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.props.open}
        autoHideDuration={6000}
        onClose={() => this.props.toggle(false)}
        message={this.props.message}
        action={
          <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={() => this.props.toggle(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    )



    }


}

export default SnackBarNotification;
