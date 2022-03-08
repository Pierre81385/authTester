//get all posts by username and display here
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { updateCurrentUser } from "firebase/auth";

function OnePost() {
  const { createdAt: userParam } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [profileImage, setProfileImage] = useState("");
  //post states
  const [posts, setPosts] = useState([
    {
      username: "",
      image: "",
      title: "",
      description: "",
      createdAt: userParam,
      email: "",
    },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [details, showDetails] = useState("none");
  const [email, setEmail] = useState("");
  //comment states
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [displayComment, setDisplayComment] = useState("none");
  const [commentButtonDisplay, setCommentButtonDisplay] = useState("inline");
  //reply states
  const [replyCharacterCount, setReplyCharacterCount] = useState(0);
  const [name, setName] = useState("");
  const [commentInfo, setCommentInfo] = useState({
    postCreatedAt: "",
    comment: "",
    firebaseUserId: "",
  });
  const [replysLoaded, setReplysLoaded] = useState(false);
  const [replysSubmitted, setReplysSubmitted] = useState(false);
  const [displayReply, setDisplayReply] = useState("none");
  const [buttonDisplay, setButtonDisplay] = useState("inline");
  const [replyComment, setReplyComment] = useState("");
  const [replys, setReplys] = useState([]);
  const [replyInfo, setReplyInfo] = useState({
    commentCreatedAt: "",
    reply: "",
  });
  const [replyPressed, setReplyPressed] = useState(false);
  //like states
  const [liked, setLiked] = useState({
    postCreatedAt: "",
    like: false,
  });
  const [likePressed, setLikePressed] = useState(false);
  const [numberOfLikes, setNumberOfLikes] = useState(0);

  const history = useHistory();

  var postId = "";

  const style = {
    img: {
      marginTop: "30px",
      width: "50vw",
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
    card: {
      width: `350px`,
      heigh: "500px",
      marginRight: "auto",
      marginLeft: "auto",
      padding: "10px",
      borderRadius: "2%",
      borderColor: "rgba(0,0,0,0)",
    },
    postCard: {
      width: "75vw",
      marginTop: "15px",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: "15px",
    },
    button: {
      marginTop: "5px",
      marginBottom: "5px",
    },
    container: {
      textAlign: "center",
    },
    replyForm: {
      display: `${displayReply}`,
      marginTop: "5px",
      marginBottom: "5px",
    },
    replyButton: {
      display: `${buttonDisplay}`,
    },
    showCommentForm: {
      display: `${displayComment}`,
      marginTop: "5px",
      marginBottom: "5px",
    },
    commentButton: {
      display: `${commentButtonDisplay}`,
      marginLeft: "2.5px",
      marginRight: "2.5px",
    },
    postDetaails: {
      display: `${details}`,
    },
    link: {
      color: "black",
    },
    commentCard: {
      width: "50%",
      padding: "10px",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: "15px",
    },
    replyCard: {
      padding: "10px",
      width: "75%",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: "15px",
    },
    textArea: {
      width: "100%",
    },
  };

  const fetchUser = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
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
  }, [userParam]);

  useEffect(() => {
    fetchUser();
  });

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

  const fieldRef = useRef(null);

  useEffect(() => {
    if (replyPressed) {
      fieldRef.current.scrollIntoView();
    }
  });

  useEffect(() => {
    // SET NUMBER OF LIKES
    console.log("like button pressed " + likePressed);

    const fetchPostLikes = async () => {
      try {
        const res = await fetch(`/api/likes/${postId}`);
        const data = await res.json();
        setNumberOfLikes(data); // number of likes isn't immediately accessible.  How do I fix this!
      } catch (error) {
        console.log(error);
      }
    };
    fetchPostLikes();
  }, [likePressed]);

  //////////////////////////////////////
  ////////// - RENDER POSTS - //////////
  //////////////////////////////////////

  const renderPosts = (post) => {
    //////////////////////////////////////
    ////////// - RENDER COMMENTS - ///////
    //////////////////////////////////////

    postId = post.createdAt;

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
      //////////////////////////////////////
      ////////// - RENDER REPLYS - //////////
      //////////////////////////////////////

      const showReply = (event) => {
        event.preventDefault();
        setReplyComment(comment.createdAt);
        setReplyPressed(true);

        if (displayReply === "none") {
          setDisplayReply("inline");
          setButtonDisplay("none");
        } else {
          setDisplayReply("none");
          setButtonDisplay("inline");
        }
      };

      const renderReplys = (reply) => {
        //REPLY HTML
        return (
          <div className="text-center">
            {reply.commentCreatedAt === comment.createdAt.toString() ? (
              <>
                <Card style={style.replyCard}>
                  <Card.Title>
                    Reply made on {new Date(reply.createdAt).toString()} by{" "}
                    {reply.username}
                  </Card.Title>
                  <Card.Body>{reply.reply}</Card.Body>
                </Card>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      };

      //COMMENT HTML
      return (
        <Container>
          <div>
            {comment.postCreatedAt === post.createdAt.toString() ? (
              <>
                <Card style={style.commentCard}>
                  <Card.Title>
                    {" "}
                    Comment made on {new Date(
                      comment.createdAt
                    ).toString()} by {comment.username}
                  </Card.Title>
                  <Card.Body>{comment.comment}</Card.Body>
                  <div className="text-center">{replys.map(renderReplys)}</div>
                  <form onSubmit={showReply} style={style.replyButton}>
                    <Button variant="dark" type="submit" style={style.button}>
                      Reply
                    </Button>
                  </form>
                </Card>
              </>
            ) : (
              <></>
            )}
          </div>
        </Container>
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

    //like a post funtions //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const likePost = () => {
      setLiked({
        postCreatedAt: post.createdAt.toString(),
        username: name,
        liked: true,
      });

      liked.postCreatedAt = post.createdAt.toString();
      liked.username = name;
      liked.like = true;

      console.log(liked);

      const recordLike = async () => {
        const res = await fetch(`/api/likes/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(liked),
        });
        const data = await res.json();
        console.log(data);
      };
      recordLike(); // recordLike() posts like to DB ///////////////////////////////////////////////////////////////////////////////////////
      setLikePressed(true);
    };

    const fetchPostLikes = async () => {
      try {
        const res = await fetch(`/api/likes/${postId}`);
        const data = await res.json();
        setNumberOfLikes(data); // number of likes isn't immediately accessible.  How do I fix this!
      } catch (error) {
        console.log(error);
      }
    };

    //POST HTML
    return (
      <Container>
        {post.createdAt === Number(userParam) ? (
          <>
            <div class="card text-center" style={style.postCard}>
              <div class="card-header">{post.title}</div>
              <div class="card-body">
                <img src={post.image} style={style.img}></img>
                <h5 class="card-title">
                  <Link to={`/profile/${post.username}`} style={style.link}>
                    By {post.username}
                  </Link>
                </h5>
                <p class="card-text">{post.description}</p>
              </div>
              <div>
                <p id="likesDisplay">Likes: {numberOfLikes.length}</p>
              </div>
              <div class="card-footer">
                <form>
                  <Button
                    variant="dark"
                    type="submit"
                    onClick={showComment}
                    style={style.commentButton}
                  >
                    Comment
                  </Button>
                  <Button
                    variant="dark"
                    type="button"
                    style={style.commentButton}
                    onClick={() => {
                      likePost(); //likePost() Called //////////////////////////////////////////////////////////////////////////////////////
                      history.push(`/singlepost/${userParam}`);
                    }}
                  >
                    Like
                  </Button>
                </form>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={style.showCommentForm}>
              <Card style={style.card}>
                <Card.Title>
                  <p
                    className={`m-0 text-center ${
                      characterCount === 280 ? "text-error" : ""
                    }`}
                  >
                    Character Count: {characterCount}/280
                  </p>
                </Card.Title>
                <Card.Body>
                  <textarea
                    placeholder="Comment..."
                    name="comment"
                    value={commentInfo.comment}
                    className="form-input col-12 "
                    onChange={handleChange}
                  ></textarea>
                </Card.Body>
                <Button
                  className="btn col-12 "
                  variant="dark"
                  type="submit"
                  style={style.button}
                >
                  Submit
                </Button>
                <Button
                  className="btn col-12 "
                  type="submit"
                  variant="dark"
                  style={style.showCommentForm}
                  onClick={() => {
                    setCommentButtonDisplay("inline");
                    setDisplayComment("none");
                  }}
                >
                  Cancel
                </Button>
              </Card>
            </form>
            {/* <div style={style.postDetaails}> */}
            <div>
              <div className="text-center col-12">
                {comments.map(renderComments)}
              </div>

              <form onSubmit={handleReplyFormSubmit} style={style.replyForm}>
                <Card style={style.card} id="replyForm">
                  <Card.Title>
                    <p
                      className={`m-0 text-center ${
                        replyCharacterCount === 280 ? "text-error" : ""
                      }`}
                    >
                      Character Count: {replyCharacterCount}/280
                    </p>
                  </Card.Title>
                  <Card.Body>
                    <textarea
                      placeholder="Reply..."
                      className="form-input col-12 "
                      name="reply"
                      ref={fieldRef}
                      value={replyInfo.reply}
                      onChange={handleReplyChange}
                    ></textarea>
                  </Card.Body>
                  <Button variant="dark" type="submit" style={style.button}>
                    Submit
                  </Button>
                  <Button
                    type="submit"
                    variant="dark"
                    style={(style.replyForm, style.button)}
                    onClick={() => {
                      setButtonDisplay("inline");
                      setDisplayReply("none");
                    }}
                  >
                    Cancel
                  </Button>

                  <Card.Footer> </Card.Footer>
                </Card>
              </form>
            </div>
          </>
        ) : (
          <></>
        )}
      </Container>
    );
  };

  //Single post page html
  return (
    <div>
      <Container>
        <Card style={style.card} >
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

      <div className="text-center ">{posts.map(renderPosts)}</div>
    </div>
  );
}

export default OnePost;
