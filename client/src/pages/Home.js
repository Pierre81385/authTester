import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import { auth, db, logout } from "../firebase";
import {
  query,
  collection,
  getDocs,
  where,
  waitForPendingWrites,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Form, Card, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { BoxArrowUp } from "react-bootstrap-icons";
import {
  BsPlusSquare,
  BsPersonSquare,
  BsBoxArrowRight,
  BsEnvelope,
} from "react-icons/bs";

function Home() {
  //user states
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  //post states
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const history = useHistory();

  const style = {
    profile: {
      marginTop: "5px",
      width: "50px",
      height: "50px",
      display: "block",
      marginLeft: "10px",
      marginRight: "10px",
      borderRadius: "50%",
    },
    container: {
      display: "flex",
      justifyContent: "center",
    },
    card: {
      width: `100vw`,
      heigh: "100%",
      padding: "5px",
      position: "fixed",
      marginLeft: "0",
      marginRight: "0",
      textAlign: "center",
      display: "flex",
      flexDirection: "row",
      zIndex: 1,
      borderRadius: "0%",
    },
    button: {
      marginLeft: "5px",
      marginRight: "5px",
      marginTop: "auto",
      marginBottom: "auto",
      width: "30px",
      //backgroundColor: "rgba(0,0,0,0)"
    },
    ul: {
      display: "flex",
      flexWrap: "wrap",
      listStyle: "none",
      margin: 0,
      padding: 0,
      zIndex: 0,
    },

    li: {
      height: "40vh",
      flexGrow: 1,
    },
    img: {
      maxHeight: "100%",
      minWidth: "100%",
      // height: "20vh",
      // width: "20vw",
      objectFit: "cover",
      verticalAlign: "top",
    },
  };

  //query Firebase Firestore USERS table for user name and image data.  Update name and profileImage state with data.
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
      setProfileImage(data.image);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  //query DynamoDB POSTS table for all posts.  Update posts state with data.
  useEffect(() => {
    console.log("getting posts");
    const fetchData = async () => {
      try {
        const res = await fetch("/api/posts");
        const jsonData = await res.json();
        // sort the array by createdAt property ordered by descending values
        const data = jsonData.sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        );
        setPosts([...data]);
        setIsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  //on render, check login status and redirect if not logged in, or load user information via fetchUserName()
  useEffect(() => {
    console.log("checking login status");
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUserName();
  }, [user, loading]);

  //render posts mapped from posts state array
  const renderPosts = (post) => {
    var s = post.createdAt.toString();

    return (
      <li style={style.li}>
        <img
          src={post.image}
          style={style.img}
          data-aos="zoom-in"
          onClick={() => {
            history.push(`/singlepost/${s}`);
          }}
        ></img>
      </li>
    );
  };

  return (
    <div
      style={{ display: "inline-block", width: "100%", margin: 0, padding: 0 }}
    >
      <Row
        style={{
          height: "10vh",
          width: "100vw",
          marginLeft: 0,
          marginRight: 0,
        }}
        className="justify-content-center"
      >
        <Card style={style.card} data-aos="fade-down" id="profileCard">
          <BsEnvelope
            as="Link"
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={() => {
              window.location.href = `mailto:${user?.email}`;
            }}
          />
          <Card.Img
            variant="top"
            src={profileImage}
            style={style.profile}
            className="text-center"
          />
          <h1
            style={{
              textAlign: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            INSTA
          </h1>
          <h5
            style={{
              textAlign: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            petey
          </h5>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginLeft: "auto",
            }}
          >
            <BsPlusSquare
              size={25}
              style={style.button}
              onClick={() => {
                history.replace("/post");
              }}
            />

            <BsPersonSquare
              size={25}
              style={style.button}
              onClick={() => {
                history.replace(`/profile/${name}`);
              }}
            />

            <BsBoxArrowRight size={25} style={style.button} onClick={logout} />
          </div>
        </Card>
      </Row>
      <Row
        style={{
          width: "100vw",
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          padding: 0,
        }}
        className="justify-content-center"
      >
        <Container
          className="col-12 justify-content-center"
          style={{ backgroundColor: "black", padding: 0 }}
        >
          <ul style={style.ul}>{posts.map(renderPosts)}</ul>
        </Container>
      </Row>
    </div>
  );
}
export default Home;
