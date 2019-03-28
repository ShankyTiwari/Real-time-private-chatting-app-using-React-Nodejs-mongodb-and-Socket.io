import React, { Component } from 'react';

import ChatSocketServer from '../../../utils/ChatSocketServer';
import "./ChatList.css";

class ChatList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedUserId: null,
      chatListUsers: []
    }
  }

  componentDidMount() {
    const userId = this.props.userId;
    ChatSocketServer.getChatList(userId);
    ChatSocketServer.eventEmitter.on('chat-list-response', this.createChatListUsers);
  }

  componentWillUnmount() {
    ChatSocketServer.eventEmitter.removeListener('chat-list-response', this.createChatListUsers);
  }

  createChatListUsers = (chatListResponse) => {    
    if (!chatListResponse.error) {
      let chatListUsers = this.state.chatListUsers;
      if (chatListResponse.singleUser) {
        if (chatListUsers.length > 0) {
          chatListUsers = chatListUsers.filter(function (obj) {
            return obj.id !== chatListResponse.chatList[0].id;
          });
        }
        /* Adding new online user into chat list array */
        chatListUsers = [...chatListUsers, ...chatListResponse.chatList];
      } else if (chatListResponse.userDisconnected) {
        const loggedOutUser = chatListUsers.findIndex((obj) => obj.id === chatListResponse.userid);
        if (loggedOutUser >= 0) {
          chatListUsers[loggedOutUser].online = 'N';
        }
      } else {
        /* Updating entire chat list if user logs in. */
        chatListUsers = chatListResponse.chatList;
      }
      this.setState({
        chatListUsers: chatListUsers
      });
    } else {
      alert(`Unable to load Chat list, Redirecting to Login.`);
    }
    this.setState({
      loading: false
    });
  }

  selectedUser = (user) => {
    this.setState({
      selectedUserId: user.id
    });
    this.props.updateSelectedUser(user)
  }

  render() {
    return (
      <>
        <ul className={`user-list ${this.state.chatListUsers.length === 0 ? 'visibility-hidden' : ''}`} >
          {
            this.state.chatListUsers.map( (user, index) => 
              <li 
                key={index} 
                className={this.state.selectedUserId === user.id ? 'active' : ''}
                onClick={() => this.selectedUser(user)}
              >
                {user.username}
                <span className={user.online === 'Y' ? 'online' : 'offline'}></span>
              </li>
            )
          }
        </ul>
        <div className={`alert 
          ${this.state.loading ? 'alert-info' : ''} 
          ${this.state.chatListUsers.length > 0 ? 'visibility-hidden' : ''}`
        }>
          { this.state.loading|| this.state.chatListUsers.length.length === 0 ? 'Loading your chat list.' : 'No User Available to chat.'}
        </div>
      </>
    );
  }
}

export default ChatList;
