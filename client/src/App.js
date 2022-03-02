import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="container">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/reset" component={Reset} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/post" component={Post} />
          <Route exact path="/profile/:username" component={Profile} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
