import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useHistory } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "../firebase";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [user, loading, error] = useAuthState(auth);

  const history = useHistory();

  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(image, name, email, password);
  };

  useEffect(() => {
    if (loading) return;
    if (user) history.replace("/");
  }, [user, loading]);

  const fileInput = useRef(null);

  const handleImageUpload = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("image", fileInput.current.files[0]);
    // send image file to endpoint with the postImage function
    const postImage = async () => {
      try {
        const res = await fetch("http://18.188.18.22/api/image-upload", {
          mode: "cors",
          method: "POST",
          body: data,
        });
        if (!res.ok) throw new Error(res.statusText);
        const postResponse = await res.json();
        setImage(postResponse.Location);

        return postResponse.Location;
      } catch (error) {
        console.log(error);
      }
    };
    postImage();
    // ...
  };

  const style = {
    img: {
      marginTop: "30px",
      width: "300px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
    container: {
      textAlign: "center",
    },
  };

  return (
    <div className="register">
      <div className="register__container">
        <img src={image} style={style.img}></img>
        <div className="col-12 mb-3">
          <label className="form-input col-12  p-1">
            Add an image to your profile:
          </label>
          <input type="file" ref={fileInput} className="form-input p-2" />

          <button className="btn" onClick={handleImageUpload} type="submit">
            UPLOAD
          </button>
        </div>
        <input
          type="text"
          className="register__textBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="register__btn" onClick={register}>
          Register
        </button>
        <button
          className="register__btn register__google"
          onClick={signInWithGoogle}
        >
          Register with Google
        </button>
        <div>
          Already have an account? <Link to="/login">Login</Link> now.
        </div>
      </div>
    </div>
  );
}
export default Register;
