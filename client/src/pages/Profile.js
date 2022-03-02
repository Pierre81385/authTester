//get all posts by username and display here
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";

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
  const [profileImage, setProfileImage] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [replyCharacterCount, setReplyCharacterCount] = useState(0);
  const [name, setName] = useState("");
  const [commentInfo, setCommentInfo] = useState({
    postCreatedAt: "",
    comment: "",
    firebaseUserId: "",
  });
  const [replysLoaded, setReplysLoaded] = useState(false);
  const [replysSubmitted, setReplysSubmitted] = useState(false);
  const [displayComment, setDisplayComment] = useState("none");
  const [commentButtonDisplay, setCommentButtonDisplay] = useState("inline");
  const [displayReply, setDisplayReply] = useState("none");
  const [buttonDisplay, setButtonDisplay] = useState("inline");
  const [replyComment, setReplyComment] = useState("");
  const [replys, setReplys] = useState([]);
  const [replyInfo, setReplyInfo] = useState({
    commentCreatedAt: "",
    reply: "",
  });


  const history = useHistory();

  const fetchUser = async () => {
    try {
      const q = query(collection(db, "users"), where("name", "==", userParam));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
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
    
    fetchUser();
  }) 
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

    //query DynamoDB REPLYS table for all replys.  Update replys state with data.  Reupdate if replySubmitted state is true.
    useEffect(() => {
      console.log("getting replys");
      const fetchData = async () => {
        try {
          const res = await fetch("/api/replys");
          const jsonData = await res.json();
          // sort the array by createdAt property ordered by descending values
          const data = jsonData.sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : -1
          );
          setReplys([...data]);
          setReplysLoaded(true);
          console.log("the replys loaded " + replys);
        } catch (error) {
          console.log(error);
        }
      };
  
      fetchData();
  
      if (replysSubmitted) {
        console.log("new replys submitted");
        fetchData();
      }
    }, [replysSubmitted]);

    ////////////

  const renderPosts = (post) => {
    var d = Date(post.createdAt).toString();

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

      const showReply = (event) => {
        event.preventDefault();
        setReplyComment(comment.createdAt);

        if (displayReply === "none") {
          setDisplayReply("inline");
          setButtonDisplay("none");
        } else {
          setDisplayReply("none");
          setButtonDisplay("inline");
        }
      };

      const renderReplys = (reply) => {
        return (
          <div>
            {reply.commentCreatedAt === comment.createdAt.toString() ? (
              <>
                <h2>{reply.reply}</h2>
                <h5>
                  Reply made on {Date(reply.createdAt).toString()} by{" "}
                  {reply.username}
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
          {comment.postCreatedAt === post.createdAt.toString() ? (
            <>
              <h2>{comment.comment}</h2>
              <h5>
                Comment made on {Date(comment.createdAt).toString()} by{" "}
                {comment.username}
              </h5>
              <div>{replys.map(renderReplys)}</div>
              <form onSubmit={showReply} style={style.replyButton}>
                <button className="btn col-12 " type="submit">
                  Reply
                </button>
              </form>{" "}
            </>
          ) : (
            <></>
          )}
        </div>
      );
    };

     //set replyInfo state in preparation for submit
     const handleReplyChange = (event) => {
      // console.log(replyComment)
      if (event.target.value.length <= 280) {
        setReplyInfo({
          username: name,
          commentCreatedAt: replyComment.toString(),
          reply: event.target.value,
        });
        //console.log("firebase user id is: " + commentInfo.firebaseUserId);
        setReplyCharacterCount(event.target.value.length);
      }
    };

    //submit reply
    const handleReplyFormSubmit = (event) => {
      event.preventDefault();

      const replyData = async () => {
        const res = await fetch("/api/replys", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(replyInfo),
        });
        const data = await res.json();
        console.log(data);
      };
      replyData();

      // clear form value
      setReplyInfo({
        commentCreatedAt: "",
        reply: "",
        //firebaseUserId: "",
      });
      setReplyCharacterCount(0);
      setReplysSubmitted(true);
      setDisplayReply("none");
      setButtonDisplay("inline");
    };
    const showComment = (event) => {
      event.preventDefault();

      if (displayReply === "none") {
        setDisplayComment("inline");
        setCommentButtonDisplay("none");
      } else {
        setDisplayComment("none");
        setCommentButtonDisplay("inline");
      }
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
        <form>
          <button
            className="btn col-12 "
            type="submit"
            onClick={showComment}
            style={style.commentButton}
          >
            Comment
          </button>
        </form>
        <form onSubmit={handleFormSubmit} style={style.showCommentForm}>
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
          <button
            className="btn col-12 "
            type="submit"
            style={style.showCommentForm}
            onClick={() => {
              setCommentButtonDisplay("inline");
              setDisplayComment("none");
            }}
          >
            Cancel
          </button>
        </form>
        <form onSubmit={handleReplyFormSubmit} style={style.replyForm}>
          <p
            className={`m-0 ${replyCharacterCount === 280 ? "text-error" : ""}`}
          >
            Character Count: {replyCharacterCount}/280
          </p>
          <textarea
            placeholder="Reply..."
            name="reply"
            value={replyInfo.reply}
            className="form-input col-12 "
            onChange={handleReplyChange}
          ></textarea>
          <button className="btn col-12 " type="submit">
            Submit
          </button>
          <button
            className="btn col-12 "
            type="submit"
            style={style.replyForm}
            onClick={() => {
              setButtonDisplay("inline");
              setDisplayReply("none");
            }}
          >
            Cancel
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
    replyForm: {
      display: `${displayReply}`,
    },
    replyButton: {
      display: `${buttonDisplay}`,
    },
    showCommentForm: {
      display: `${displayComment}`,
    },
    commentButton: {
      display: `${commentButtonDisplay}`,
    },
  };

  //add image upload option where submit button creates the user profile document

  return (
    <div style={style.container}>
      <img src={profileImage} style={style.profile} />
      <h1>Viewing {userParam ? `${userParam}'s` : "your"} posts.</h1>
      <Link to="/post">New Post</Link>
        <Link to={`/profile/${name}`}>My Profile</Link>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      <div>{posts.map(renderPosts)}</div>
    </div>
  );
}

export default Profile;
