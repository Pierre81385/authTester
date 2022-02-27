import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";
import { auth, db, logout } from "../firebase/firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import PostsList from "../components/PostsList";

function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const history = useHistory();

  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

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

  useEffect(() => {
    console.log("checking login status");
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUserName();
  }, [user, loading]);

  const renderPosts = (post) => {
    return (
      <div>
        <img src={post.image} style={style.img}></img>
        <h1>{post.title}</h1>
        <h3>By {post.username}</h3>
        <h4>{post.description}</h4>
      </div>
    );
  };

  const style = {
    img: {
      marginTop: "30px",
      width: "300px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        Logged in as
        <div>{name}</div>
        <div>{user?.email}</div>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="flex-row justify-space-between">
        <div className={`col-12 mb-3 `}>{posts.map(renderPosts)}</div>
      </div>
    </div>
  );
}
export default Home;
