/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

import ChatSocketServer from '../../utils/ChatSocketServer';
import ChatHttpServer from '../../utils/ChatHttpServer';

import ChatList from './chat-list/ChatList';
import Conversation from './conversation/Conversation';

import './Home.css';

class Home extends Component {
  userId = null;
  state = {
    isOverlayVisible: true,
    username: '______',
    selectedUser: null
  }

  logout = async () => {
    try {
      await ChatHttpServer.removeLS();
      ChatSocketServer.logout({
        userId: this.userId
      });
      ChatSocketServer.eventEmitter.on('logout-response', (loggedOut) => {
        this.props.history.push(`/`);
      });
    } catch (error) {
      console.log(error);
      alert(' This App is Broken, we are working on it. try after some time.');
      throw error;
    }
  }

  setRenderLoadingState = (loadingState) => {
    this.setState({
      isOverlayVisible: loadingState
    });
  }

  async componentDidMount() {
    try {
      this.setRenderLoadingState(true);
      this.userId = await ChatHttpServer.getUserId();
      const response = await ChatHttpServer.userSessionCheck(this.userId);
      if (response.error) {
        this.props.history.push(`/`)
      } else {
        this.setState({
          username: response.username
        });
        ChatHttpServer.setLS('username', response.username);
        ChatSocketServer.establishSocketConnection(this.userId);
      }
      this.setRenderLoadingState(false);
    } catch (error) {
      this.setRenderLoadingState(false);
      this.props.history.push(`/`)
    }
  }

  updateSelectedUser = (user) => {
    this.setState({
      selectedUser: user
    });
  }

  getChatListComponent() {
    return this.state.isOverlayVisible ? null : <ChatList userId={this.userId} updateSelectedUser={this.updateSelectedUser}/>
  }

  getChatBoxComponent = () => {
    return this.state.isOverlayVisible ? null : <Conversation userId={this.userId} newSelectedUser={this.state.selectedUser}/>
  }

  render() {
    return (
      <div className="App">
        <div className = {`${this.state.isOverlayVisible ? 'overlay': 'visibility-hidden' } `}>
          <h1>Loading</h1>
        </div>
        <header className="app-header">
          <nav className="navbar navbar-expand-md">
            <h4>Hello {this.state.username} </h4>
          </nav>
          <ul className="nav justify-content-end">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={this.logout}>Logout</a>
            </li>
          </ul>
        </header>

        <main role="main" className="container content" >
          <div className="row chat-content">
            <div className="col-3 chat-list-container">
              {this.getChatListComponent()}
            </div>
            <div className="col-8 message-container">
              {this.getChatBoxComponent()}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(Home)
