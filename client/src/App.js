import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Register from "./pages/Register";
import Reset from "./pages/Reset";

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
        </Switch>
      </div>
    </Router>
  );
}

export default App;
