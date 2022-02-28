import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";

function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comments, setComments] = useState([]);
  const [state, setState] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commentInfo, setCommentInfo] = useState({
    postCreatedAt: "",
    comment: "",
    firebaseUserId: "",
  });
  const history = useHistory();

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

  //query DynamoDB COMMENTS table for all comments.  Update comments state with data.  Reupdate if submitted state is true.
  useEffect(() => {
    console.log("getting comments");
    const fetchData = async () => {
      try {
        const res = await fetch("/api/comments");
        const jsonData = await res.json();
        // sort the array by createdAt property ordered by descending values
        const data = jsonData.sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        );
        setComments([...data]);
        setCommentsLoaded(true);
        console.log(comments);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();

    if (submitted) {
      console.log("new comments submitted");
      fetchData();
    }
  }, [submitted]);

  //on render, check login status and redirect if not logged in, or load user information via fetchUserName()
  useEffect(() => {
    console.log("checking login status");
    if (loading) return;
    if (!user) return history.replace("/login");
    fetchUserName();
  }, [user, loading]);

  //render posts mapped from posts state array
  const renderPosts = (post) => {
    //set commentInfo state in preparation for submit
    const handleChange = (event) => {
      if (event.target.value.length <= 280) {
        setCommentInfo({
          username: name,
          postCreatedAt: post.createdAt.toString(),
          comment: event.target.value,
          firebaseUserId: post.firebaseUid,
        });
        setCharacterCount(event.target.value.length);
      }
    };

    //submit comment
    const handleFormSubmit = (event) => {
      event.preventDefault();

      const commentData = async () => {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commentInfo),
        });
        const data = await res.json();
        console.log(data);
      };
      commentData();

      // clear form value
      setCommentInfo({
        postCreatedAt: "",
        comment: "",
        firebaseUserId: "",
      });
      setCharacterCount(0);
      setSubmitted(true);
    };

    const renderComments = (comment) => {
      return (
        <div>
          {comment.postCreatedAt === post.createdAt.toString() ? (
            <>
              <h2>{comment.comment}</h2>
              <h5>
                Comment made on {Date(comment.createdAt).toString()} by{" "}
                {comment.username}
              </h5>
            </>
          ) : (
            <></>
          )}
        </div>
      );
    };

    return (
      <div>
        <img src={post.image} style={style.img}></img>
        <h1>{post.title}</h1>
        <Link
          to={`/profile/${post.username}`}
          style={{ fontWeight: 700 }}
          className="text-light"
        >
          By {post.username}
        </Link>
        <h4>{post.description}</h4>
        <div>{comments.map(renderComments)}</div>
        <form onSubmit={handleFormSubmit}>
          <p className={`m-0 ${characterCount === 280 ? "text-error" : ""}`}>
            Character Count: {characterCount}/280
          </p>
          <textarea
            placeholder="Comment..."
            name="comment"
            value={commentInfo.comment}
            className="form-input col-12 "
            onChange={handleChange}
          ></textarea>
          <button className="btn col-12 " type="submit">
            Submit
          </button>
        </form>
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
    profile: {
      marginTop: "30px",
      width: "300px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      borderRadius: "50%",
    },
    container: {
      textAlign: "center",
    },
  };

  return (
    <div className="dashboard">
      <div style={style.container}>
        <img src={profileImage} style={style.profile} />
        <div>{name}</div>
        <div>{user?.email}</div>
        <Link to="/post">New Post</Link>
        <Link to={`/profile/${name}`}>My Profile</Link>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="flex-row justify-space-between" style={style.container}>
        <div className={`col-12 mb-3 `}>{posts.map(renderPosts)}</div>
      </div>
    </div>
  );
}
export default Home;
