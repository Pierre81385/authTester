//Notes:
//This page is for creating user posts and accepts input for an IMAGE, post TITLE, and post DESCRIPTION.
//Every post records username, createdAt, description, user email, user's firebase uid, image location (images are stored in an S3 bucket), and title.

import React, { useState, useRef, useEffect } from "react";
import { query, collection, getDocs, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, Form, Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";

const Post = () => {
  const history = useHistory();

  const [user, loading, error] = useAuthState(auth);

  const [characterCount, setCharacterCount] = useState(0);
  const [postInfo, setPostInfo] = useState({
    username: "",
    email: "",
    userId: "",
    title: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState("none");
  const [submit, setSubmit] = useState("none");

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      console.log(data.uid);
      setPostInfo({
        username: data.name,
        email: data.email,
        userId: data.uid,
      });
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  const style = {
    img: {
      marginTop: "30px",
      height: "33vh",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
    card: {
      width: `350px`,
      marginRight: "auto",
      marginLeft: "auto",
      marginTop: "50px",
      padding: "10px",
      borderRadius: "2%",
    },
    postCard: {
      margin: "10px",
      width: "50vw",
      marginLeft: "auto",
      marginRight: "auto",
    },
    button: {
      width: "100%",
      marginTop: "5px",
      marginBottom: "5px",
    },
    link: {
      color: "black",
    },
    imagePreviewForm: {
      textAlign: "center",
      display: `${imagePreview}`,
    },
    submitButton: {
      display: `${submit}`,
      width: "100%",
      marginTop: "5px",
      marginBottom: "5px",
    },
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUserName();
  }, [user, loading]);

  const fileInput = useRef(null);

  const handleImageUpload = (event) => {
    event.preventDefault();
    setImagePreview("inline");
    setSubmit("inline");
    const data = new FormData();
    data.append("image", fileInput.current.files[0]);
    // send image file to endpoint with the postImage function
    const postImage = async () => {
      try {
        const res = await fetch("http://18.191.203.77/api/image-upload", {
          mode: "cors",
          method: "POST",
          body: data,
        });
        if (!res.ok) throw new Error(res.statusText);
        const postResponse = await res.json();
        setPostInfo({ ...postInfo, image: postResponse.Location });

        return postResponse.Location;
      } catch (error) {
        console.log(error);
      }
    };
    postImage();
    // ...
  };

  // update state based on form input changes
  const handleChange = (event) => {
    if (event.target.value.length <= 280) {
      setPostInfo({ ...postInfo, [event.target.name]: event.target.value });
      console.log(postInfo.description);
      console.log(postInfo.title);
      setCharacterCount(event.target.value.length);
    }
  };

  // submit form
  const handleFormSubmit = (event) => {
    event.preventDefault();

    const postData = async () => {
      const res = await fetch("http://18.191.203.77/api/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postInfo),
      });
      const data = await res.json();
      console.log(data);
    };
    postData();

    // clear form value
    setPostInfo({
      username: "",
      email: "",
      userId: "",
      title: "",
      description: "",
    });
    setCharacterCount(0);
    history.replace("/");
  };

  return (
    <main>
      <div style={style.imagePreviewForm}>
        <div class="card text-center" style={style.postCard}>
          <div class="card-header">{postInfo.title}</div>
          <div class="card-body">
            <img src={postInfo.image} style={style.img}></img>
            <Link to={`#`} style={style.link}>
              By {postInfo.username}
            </Link>
            <p class="card-text">{postInfo.description}</p>
          </div>
        </div>
      </div>
      <Container style={style.container}>
        <Card style={style.card} data-aos="flip-up">
          <form onSubmit={handleFormSubmit}>
            <label className="form-input col-12  p-1">
              Add an image to your profile:
            </label>

            <input type="file" ref={fileInput} className="form-input p-2" />

            <Button
              variant="dark"
              onClick={handleImageUpload}
              type="submit"
              style={style.button}
            >
              UPLOAD
            </Button>

            <input
              placeholder="Title"
              name="title"
              value={postInfo.title}
              className="form-input col-12 "
              onChange={handleChange}
            ></input>

            <p className={`m-0 ${characterCount === 280 ? "text-error" : ""}`}>
              Character Count: {characterCount}/280
            </p>
            <textarea
              placeholder="Description..."
              name="description"
              value={postInfo.description}
              className="form-input col-12 "
              onChange={handleChange}
            ></textarea>
            <Button variant="dark" type="submit" style={style.submitButton}>
              Submit
            </Button>
            <Link
              variant="dark"
              class="btn btn-dark"
              style={style.button}
              to={`/`}
            >
              Cancel
            </Link>
          </form>
        </Card>
      </Container>
    </main>
  );
};

export default Post;
