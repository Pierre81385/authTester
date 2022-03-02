//Notes:
//Authorization is handled by Firebase, and currently accepts users created on firebase with email OR a users GMAIL account.
//Other accounts to be accepted include Facebook, Instagram, and Apple.

import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { auth, logInWithEmailAndPassword, signInWithGoogle } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Container, Form, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) history.replace("/");
  }, [user, loading]);

  const style = {
    container: {
      display: "flex",
      justifyContent: "center",
    },
    card: {
      width: `350px`,
      marginRight: "auto",
      marginLeft: "auto",
      padding: "10px",
      borderRadius: "2%",
    },
    button: {
      marginTop: "5px",
      marginBottom: "2px",
    },
  };

  return (
    <Container style={style.container}>
      <Card style={style.card}>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              className="login__textBox"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail Address"
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>

            <Form.Control
              type="password"
              className="login__textBox"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </Form.Group>
        </Form>

        <Button
          variant="dark"
          style={style.button}
          onClick={() => logInWithEmailAndPassword(email, password)}
        >
          Login
        </Button>
        <Button variant="dark" style={style.button} onClick={signInWithGoogle}>
          Login with Google
        </Button>
        <div>
          <Link to="/reset">Forgot Password</Link>
        </div>
        <div>
          Don't have an account? <Link to="/register">Register</Link> now.
        </div>
      </Card>
    </Container>
  );
}
export default Login;
