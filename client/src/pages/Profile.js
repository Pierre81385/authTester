//get all posts by username and display here
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Profile() {
  const { username: userParam } = useParams();
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

  const renderPosts = (post) => {

    var d = Date(post.createdAt).toString()    

    return (
      <div>
        <img src={post.image} style={style.img}></img>
        <h1>{post.title}</h1>
        <h4>{d}</h4>
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
    container: {
      textAlign: "center",
    },
  };

  //add image upload option where submit button creates the user profile document

  return (
    <div style={style.container}>
      <h1>Viewing {userParam ? `${userParam}'s` : "your"} posts.</h1>
      <div>{posts.map(renderPosts)}</div>
    </div>
  );
}

export default Profile;
