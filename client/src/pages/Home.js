import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Form, Card, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";

function Home() {
  //user states
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  //comment states
  const [characterCount, setCharacterCount] = useState(0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comments, setComments] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [displayComment, setDisplayComment] = useState("none");
  const [commentButtonDisplay, setCommentButtonDisplay] = useState("inline");
  const [commentInfo, setCommentInfo] = useState({
    postCreatedAt: "",
    comment: "",
    //firebaseUserId: "",
  });

  //reply states
  const [replys, setReplys] = useState([]);
  const [replyCharacterCount, setReplyCharacterCount] = useState(0);
  const [replysLoaded, setReplysLoaded] = useState(false);
  const [replysSubmitted, setReplysSubmitted] = useState(false);
  const [displayReply, setDisplayReply] = useState("none");
  const [replyComment, setReplyComment] = useState("");
  const [replyInfo, setReplyInfo] = useState({
    commentCreatedAt: "",
    reply: "",
  });

  //post states
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [buttonDisplay, setButtonDisplay] = useState("inline");
  const [details, showDetails] = useState("none");

  const history = useHistory();

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
    row: {
      height: "25vh",
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
    postDetaails: {
      display: `${details}`,
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
        console.log("the comments loaded" + comments);
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
          //firebaseUserId: post.firebaseUid,
        });
        //console.log("firebase user id is: " + commentInfo.firebaseUserId);
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
        //firebaseUserId: "",
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
        <div key={comment.createdAt}>
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

    var s = post.createdAt.toString()

    return (
      <Card style={style.card}>
        <Card.Img
          src={post.image}
          style={style.img}
          onClick={() => {
            history.push(`/singlepost/${s}`);
            // if (details === "none") {
            //   showDetails("inline");
            // } else {
            //   showDetails("none");
            // }
          }}
        ></Card.Img>
        {/* <div style={style.postDetaails}>
          <Card.Title>{post.title}</Card.Title>
          <Link
            variant="dark"
            class="btn btn-dark"
            style={style.button}
            to={`/profile/${post.username}`}
          >
            By {post.username}
          </Link>
          <Card.Text>{post.description}</Card.Text>
          <Card.Footer>
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
              <p
                className={`m-0 ${characterCount === 280 ? "text-error" : ""}`}
              >
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
                className={`m-0 ${
                  replyCharacterCount === 280 ? "text-error" : ""
                }`}
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
          </Card.Footer>
        </div> */}
      </Card>
    );
  };

  return (
    <Container style={style.container}>
      <Row style={style.row}>
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
      </Row>
      <Row>
        <div>{posts.map(renderPosts)}</div>
      </Row>
    </Container>
  );
}
export default Home;
