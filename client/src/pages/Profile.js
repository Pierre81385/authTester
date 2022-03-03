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
      width: "300px",
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
      width: `350px`,
      heigh: "500px",
      marginRight: "auto",
      marginLeft: "auto",
      padding: "10px",
      borderRadius: "2%",
    },
    button: {
      marginTop: "5px",
      marginBottom: "2px",
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
          onClick={() => {
            history.push(`/singlepost/${s}`);
          }}
        ></img>
      </li>
    );
  };

  return (
    <div>
      <Container>
        <Card style={style.card}>
          <Card.Img variant="top" src={profileImage} style={style.profile} />
          <Card.Body>
            <Card.Title>{name}</Card.Title>
            <Card.Text>{email}</Card.Text>
          </Card.Body>

          <Button
            variant="dark"
            style={style.button}
            onClick={() => {
              history.replace("/post");
            }}
          >
            New Post
          </Button>
          <Link
            variant="dark"
            class="btn btn-dark"
            style={style.button}
            to={`/`}
          >
            Home
          </Link>
          <Button variant="dark" style={style.button} onClick={logout}>
            Logout
          </Button>
        </Card>
      </Container>
      <ul style={style.ul}>{posts.map(renderPosts)}</ul>
    </div>
  );
}

export default Profile;
