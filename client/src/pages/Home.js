import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Form, Card, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

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
      borderColor: "rgba(0,0,0,0)",
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
    <div>
      <Container>
        <Card style={style.card}>
          <Card.Img variant="top" src={profileImage} style={style.profile} />
          <Card.Body>
            <Card.Title>{name}</Card.Title>
            <Card.Text>{user?.email}</Card.Text>
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
            to={`/profile/${name}`}
          >
            My Profile
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
export default Home;
