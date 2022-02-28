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
    console.log(post.username);
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
    <div className="flex-row justify-space-between">
      <div className={`col-12 mb-3 `}>{posts.map(renderPosts)}</div>
    </div>
  );
}

export default Profile;
