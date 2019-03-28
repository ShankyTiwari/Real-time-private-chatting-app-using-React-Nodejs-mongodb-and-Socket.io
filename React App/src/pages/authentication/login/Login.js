import React, { Component } from 'react';
import { Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import ChatHttpServer from '../../../utils/ChatHttpServer';
import './Login.css';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  handleLogin = async (event) => {
    event.preventDefault();
    this.props.loadingState(true);
    try {
      const response = await ChatHttpServer.login(this.state);
      this.props.loadingState(false);
      if(response.error) {
        alert('Invalid login details')
      } else {
        ChatHttpServer.setLS('userid', response.userId);
        this.props.history.push(`/home`)
      }
    } catch (error) {
      this.props.loadingState(false);
      alert('Invalid login details')
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
        <Form.Group controlId="loginUsername">
          <Form.Control 
            type = "text"
            name = "username"
            placeholder = "Enter username"
            onChange = {
              this.handleInputChange
            }
          />
        </Form.Group>

        <Form.Group controlId="loginPassword">
          <Form.Control 
          type = "password"
          name = "password"
          placeholder = "Password"
          onChange = {
            this.handleInputChange
          }
          />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={this.handleLogin}>
          Login
        </Button>
      </Form>
    );
  }
}

export default withRouter(Login)
