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
      objectFit: "cover",
      verticalAlign: "bottom",
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
        const res = await fetch(`http://18.191.203.77/api/posts/${userParam}`);
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
    <div>
      <Row style={{ height: "100vh", width: "100vw", margin: 0 }}>
        <Container
          fluid
          className="col-2 text-center"
          style={{ backgroundColor: "black" }}
        >
          <Card style={style.card} data-aos="fade-right">
            <Card.Img variant="top" src={profileImage} style={style.profile} />
            <Card.Body>
              <Card.Title>{name}</Card.Title>
              {/* <Card.Text>{email}</Card.Text> */}
              <BsEnvelope
                as="Link"
                onClick={() => {
                  window.location.href = `mailto:${email}`;
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
              <BsCollection
                size={25}
                style={style.button}
                onClick={() => {
                  history.replace(`/`);
                }}
              />
              <BsBoxArrowRight
                size={25}
                style={style.button}
                onClick={logout}
              />
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

export default Profile;
