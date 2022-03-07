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
      marginTop: "30px",
      width: "100px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      borderRadius: "50%",
    },
    container: {
      display: "flex",
      justifyContent: "center",
    },
    card: {
      width: `auto`,
      heigh: "500px",
      marginRight: "auto",
      marginLeft: "25px",
      marginTop: "50px",
      padding: "10px",
      borderRadius: "2%",
      // borderColor: "rgba(0,0,0,0)",
      position: "fixed",
    },
    button: {
      marginLeft: "5px",
      marginRight: "5px",
      width: "30px",
      //backgroundColor: "rgba(0,0,0,0)"
    },
    ul: {
      display: "flex",
      flexWrap: "wrap",
      listStyle: "none",
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
      <Row style={{ height: "100vh", width: "100vw", margin: 0 }}>
        <Container
          fluid
          className="col-2 text-center"
          style={{ backgroundColor: "black" }}
        >
          <Card style={style.card}>
            <Card.Img variant="top" src={profileImage} style={style.profile} />
            <Card.Body>
              <Card.Title>{name}</Card.Title>
              {/* <Card.Text>{user?.email}</Card.Text> */}
              <BsEnvelope
                as="Link"
                onClick={() => {
                  window.location.href = `mailto:${user?.email}`;
                }}
              />
            </Card.Body>
            <div style={{ display: "inline-block" }}>
              <BsPlusSquare
                size={25}
                style={style.button}
                onClick={() => {
                  history.replace("/post");
                }}
              />
              {/* <Button
            variant="dark"
            style={style.button}
            onClick={() => {
              history.replace("/post");
            }}
          >
            New Post
          </Button> */}
              <BsPersonSquare
                size={25}
                style={style.button}
                onClick={() => {
                  history.replace(`/profile/${name}`);
                }}
              />

              {/* <Link
            //variant="dark"
            class="btn btn-dark"
            style={style.button}
            to={`/profile/${name}`}
          >
            My Profile
          </Link> */}
              <BsBoxArrowRight
                size={25}
                style={style.button}
                onClick={logout}
              />
              {/* <Button variant="dark" style={style.button} onClick={logout}>
            Logout
          </Button> */}
            </div>
          </Card>
        </Container>
        <Container
          className="col-10"
          style={{ float: "right", backgroundColor: "black" }}
        >
          <ul style={style.ul}>{posts.map(renderPosts)}</ul>
        </Container>
      </Row>
    </div>
  );
}
export default Home;
