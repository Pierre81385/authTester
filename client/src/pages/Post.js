//Notes: 
//This page is for creating user posts and accepts input for an IMAGE, post TITLE, and post DESCRIPTION.
//Every post records username, createdAt, description, user email, user's firebase uid, image location (images are stored in an S3 bucket), and title.

import React, { useState, useRef, useEffect } from "react";
import { query, collection, getDocs, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

const Post = () => {

  const history = useHistory();

  const [user, loading, error] = useAuthState(auth);

  const [characterCount, setCharacterCount] = useState(0);
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    userId: "",
    title: "",
    description: "",
  });

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      console.log(data.uid);
      setUserInfo({
        username: data.name,
        email: data.email,
        userId: data.uid,
      });
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUserName();
  }, [user, loading]);

  const fileInput = useRef(null);

  const handleImageUpload = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("image", fileInput.current.files[0]);
    // send image file to endpoint with the postImage function
    const postImage = async () => {
      try {
        const res = await fetch("/api/image-upload", {
          mode: "cors",
          method: "POST",
          body: data,
        });
        if (!res.ok) throw new Error(res.statusText);
        const postResponse = await res.json();
        setUserInfo({ ...userInfo, image: postResponse.Location });

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
      setUserInfo({ ...userInfo, [event.target.name]: event.target.value });
      console.log(userInfo.description);
      console.log(userInfo.title);
      setCharacterCount(event.target.value.length);
    }
  };

  // submit form
  const handleFormSubmit = (event) => {
    event.preventDefault();

    const postData = async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
      const data = await res.json();
      console.log(data);
    };
    postData();

    // clear form value
    setUserInfo({
      username: "",
      email: "",
      userId: "",
      title: "",
      description: "",
    });
    setCharacterCount(0);
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
    <main>
      <div style={style.container}>
        <img src={userInfo.image} style={style.img}></img>
        <h4>{userInfo.comment}</h4>
        <div className="col-12 mb-3" style={{ backgroundColor: "grey" }}>
          <label className="form-input col-12  p-1">
            Add an image to your profile:
          </label>
          <input type="file" ref={fileInput} className="form-input p-2" />

          <button className="btn" onClick={handleImageUpload} type="submit">
            UPLOAD
          </button>

          <form onSubmit={handleFormSubmit}>
            <input
              placeholder="Title"
              name="title"
              value={userInfo.title}
              className="form-input col-12 "
              onChange={handleChange}
            ></input>

            <p className={`m-0 ${characterCount === 280 ? "text-error" : ""}`}>
              Character Count: {characterCount}/280
            </p>
            <textarea
              placeholder="Description..."
              name="description"
              value={userInfo.description}
              className="form-input col-12 "
              onChange={handleChange}
            ></textarea>
            <button className="btn col-12 " type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Post;
