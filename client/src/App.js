import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Submit";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";
import OnePost from "./pages/singlePost";

import Aos from "aos";
import "aos/dist/aos.css";

function App() {
  const style = {
    main: {
      backgroundColor: "black",
    },
  };
  useEffect(() => {
    Aos.init({});
  }, []);
  return (
    <Router style={style.main}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/reset" component={Reset} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/post" component={Post} />
        <Route exact path="/profile/:username" component={Profile} />
        <Route exact path="/singlepost/:createdAt" component={OnePost} />
      </Switch>
    </Router>
  );
}

export default App;
