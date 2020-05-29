import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';

class Loader extends Component {

    constructor(props){
        super(props);
        this.state={
            progress : 0
        }
        this.tick = this.tick.bind(this)
    }

    timer;

    tick(){
        this.state.progress >=100 ? (this.setState({progress:0})) : (this.setState({progress:this.state.progress+1}))
    }

    componentDidMount(){
        this.timer = setInterval(this.tick,20);
    }

    componentWillUnmount(){
        clearInterval(this.timer);
    }

    render(){
        return(
            <div>
                <CircularProgress variant="determinate" value={this.state.progress} color="secondary" size={100}/>
            </div>
        )
    }

}

export default Loader;