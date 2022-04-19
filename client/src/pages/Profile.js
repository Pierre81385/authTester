//get all posts by username and display here
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Form, Card, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {
  BsPlusSquare,
  BsCollection,
  BsBoxArrowRight,
  BsEnvelope,
} from "react-icons/bs";

function Profile() {
  const { username: userParam } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [posts, setPosts] = useState([
    {
      username: userParam,
      image: "",
      title: "",
      description: "",
      createdAt: "",
      email: "",
    },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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

  const fetchUser = async () => {
    try {
      const q = query(collection(db, "users"), where("name", "==", userParam));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
      setEmail(data.email);
      setProfileImage(data.image);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  useEffect(() => {
    console.log("getting posts");
    const fetchData = async () => {
      try {
        console.log(userParam);
        const res = await fetch(`/api/posts/${userParam}`);
        const data = await res.json();
        setPosts([...data]);
        setIsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [userParam]);

  useEffect(() => {
    console.log("checking login status");
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUser();
  }, [user, loading]);

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
        <Card style={style.card} data-aos="fade-down">
          <BsEnvelope
            as="Link"
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={() => {
              window.location.href = `mailto:${email}`;
            }}
          />
          <Card.Img
            variant="top"
            src={profileImage}
            style={style.profile}
            className="text-center"
          />
          <Card.Title
            style={{
              textAlign: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            {name}
          </Card.Title>
          {/* <Card.Text>{email}</Card.Text> */}

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
            <BsCollection
              size={25}
              style={style.button}
              onClick={() => {
                history.replace(`/`);
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

export default Profile;
