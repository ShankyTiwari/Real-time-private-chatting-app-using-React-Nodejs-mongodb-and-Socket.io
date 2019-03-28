import React, { Component } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';

import ChatHttpServer from '../../../utils/ChatHttpServer';
import './Registration.css';

class Registration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameAvailable: true
    };
  }

  handleRegistration = async (event) => {
    event.preventDefault();
    this.props.loadingState(true);
    try {
      const response = await ChatHttpServer.register(this.state);
      this.props.loadingState(false);
      if (response.error) {
        alert('Unable to register, try after some time.')
      } else {
        ChatHttpServer.setLS('userid', response.userId);
        this.props.history.push(`/home`);
      }
    } catch (error) {
      this.props.loadingState(false);
      alert('Unable to register, try after some time.')
    }
  }

  checkUsernameAvailability = async (event)  => {
    if(event.target.value !== '' && event.target.value !== undefined) {
      this.setState({
        username: event.target.value
      });
      this.props.loadingState(true);
      try {
        const response = await ChatHttpServer.checkUsernameAvailability(this.state.username);
        this.props.loadingState(false);
        if(response.error) {
          this.setState({
            usernameAvailable: false
          });
        } else {
          this.setState({
            usernameAvailable: true
          });
        }
      } catch (error) {
        this.props.loadingState(false);
        this.setState({
          usernameAvailable: false
        });
      }
    } else if (event.target.value === '') {
      this.setState({
        usernameAvailable: true
      });
    }  
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  render() {
    return (
      <Form className="auth-form">
        <Form.Group controlId="formUsername">
          <DebounceInput
            className="form-control"
            placeholder = "Enter username"
            minLength={2}
            debounceTimeout={300}
            onChange={this.checkUsernameAvailability} />
          <Alert className={{
            'username-availability-warning' : true,
            'visibility-hidden': this.state.usernameAvailable
          }}  variant="danger">
            <strong>{this.state.username}</strong> is already taken, try another username.
          </Alert>
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Control 
            type = "password"
            name = "password"
            placeholder = "Password"
            onChange = {
              this.handleInputChange
            }
          />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={this.handleRegistration}>
          Registration
        </Button>
      </Form>
    );
  }
}

export default withRouter(Registration)
