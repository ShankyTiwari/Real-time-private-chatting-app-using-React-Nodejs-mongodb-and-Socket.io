/*
 * Real time private chatting app using React, Nodejs, mongodb and Socket.io
 * @author Shashank Tiwari
 */

import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";

import Authentication from './pages/authentication/Authentication';
import Home from './pages/home/Home';
import NotFound from './pages/not-found/NotFound';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={Authentication} />
          <Route path="/home/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

export default App;
