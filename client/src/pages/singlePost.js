//get all posts by username and display here
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Card, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { updateCurrentUser } from "firebase/auth";
import {
  BsPlusSquare,
  BsCollection,
  BsBoxArrowRight,
  BsEnvelope,
  BsHandThumbsUp,
} from "react-icons/bs";

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
  const [commentFormDisplay, setCommentFormDisplay] = useState("inline");
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
      marginTop: "15px",
      height: "50vh",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
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
    profileCard: {
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
    cCard: {
      marginTop: "50px",
      marginBottom: "15px",
      padding: "10px",
      borderRadius: "2%",
      // borderColor: "rgba(0,0,0,0)",
    },
    postCard: {
      width: "75vw",
      marginTop: "15px",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: "15px",
    },
    button: {
      marginLeft: "5px",
      marginRight: "5px",
      width: "30px",
    },
    submitButton: {
      //marginLeft: "5px",
      marginRight: "5px",
      width: "100%",
    },
    container: {
      textAlign: "center",
    },
    replyForm: {
      width: "100%",
      display: `${displayReply}`,
      marginTop: "5px",
      // marginLeft: "5px",
      marginRight: "5px",
      marginBottom: "5px",
    },
    replyButton: {
      display: `${buttonDisplay}`,
    },
    showCommentForm: {
      display: `${commentFormDisplay}`,
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
      color: "white",
    },
    commentCard: {
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
      backgroundColor: "black",
      color: "white",
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
    //console.log("like button pressed " + likePressed);

    const fetchPostLikes = async () => {
      try {
        const res = await fetch(`/api/likes/${postId}`);
        const data = await res.json();
        setNumberOfLikes(data); // number of likes isn't immediately accessible.  How do I fix this!
        document.getElementById("likesP").innerHTML = data.length;
      } catch (error) {
        console.log(error);
      }
    };

    fetchPostLikes();

    if (likePressed) {
      fetchPostLikes();
    }
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
        setCommentFormDisplay("none");

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
                <Card style={style.replyCard} data-aos="flip-down">
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
                <Row>
                  <Card style={style.commentCard} data-aos="flip-down">
                    <Card.Title>
                      {" "}
                      Comment made on {new Date(
                        comment.createdAt
                      ).toString()}{" "}
                      by {comment.username}
                    </Card.Title>
                    <Card.Body>{comment.comment}</Card.Body>
                    <div className="text-center">
                      {replys.map(renderReplys)}
                    </div>
                    <form onSubmit={showReply} style={style.replyButton}>
                      <Button
                        variant="dark"
                        type="submit"
                        style={style.submitButton}
                      >
                        Reply
                      </Button>
                    </form>
                  </Card>
                </Row>
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
      setCommentFormDisplay("inline");
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
      // setLiked({
      //   postCreatedAt: post.createdAt.toString(),
      //   username: name,
      //   liked: true,
      // });

      // liked.postCreatedAt = post.createdAt.toString();
      // liked.username = name;
      // liked.like = true;

      // console.log(liked);

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

    //POST HTML
    return (
      <Container style={{ margin: 0, padding: 0, width: "100vw" }}>
        {post.createdAt === Number(userParam) ? (
          <>
            <Row>
              <div className="col-7 text-center">
                <div style={{ marginTop: "15px", color: "white" }}>
                  {post.title}
                </div>
                <img
                  src={post.image}
                  style={style.img}
                  data-aos="zoom-in"
                ></img>
                <div>
                  <h5 style={{ color: "white" }}>
                    <Link to={`/profile/${post.username}`} style={style.link}>
                      By {post.username}
                    </Link>
                  </h5>
                  <p style={{ color: "white" }}>{post.description}</p>
                </div>
                <div>
                  <p style={{ color: "white" }} id="likesP">
                    Likes: {numberOfLikes.length}
                  </p>
                </div>
                <div class="card-footer">
                  <form>
                    {/* <Button
                      variant="light"
                      type="submit"
                      onClick={showComment}
                      style={style.commentButton}
                    >
                      Comment
                    </Button> */}
                    {/* <BsHandThumbsUp
                      style={style.button}
                      onClick={() => {
                        liked.postCreatedAt = post.createdAt.toString();
                        liked.username = name;
                        liked.like = true;
                        likePost(); //likePost() Called //////////////////////////////////////////////////////////////////////////////////////
                        history.push(`/singlepost/${userParam}`);
                      }}
                    /> */}
                    <Button
                      variant="light"
                      type="button"
                      style={style.commentButton}
                      onClick={() => {
                        liked.postCreatedAt = post.createdAt.toString();
                        liked.username = name;
                        liked.like = true;
                        likePost(); //likePost() Called //////////////////////////////////////////////////////////////////////////////////////
                        history.push(`/singlepost/${userParam}`);
                      }}
                    >
                      Like
                    </Button>
                  </form>
                </div>
              </div>
              <div className="col-4 text-center">
                <Row>
                  <form
                    onSubmit={handleFormSubmit}
                    style={style.showCommentForm}
                    data-aos="fade-left"
                  >
                    <Card style={style.cCard}>
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
                        style={style.submitButton}
                      >
                        Submit
                      </Button>
                      {/* <Button
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
                      </Button> */}
                    </Card>
                  </form>
                  <form
                    onSubmit={handleReplyFormSubmit}
                    style={style.replyForm}
                    data-aos="fade-left"
                  >
                    <Card style={style.cCard} id="replyForm">
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
                      <Button
                        variant="dark"
                        type="submit"
                        style={style.submitButton}
                      >
                        Submit
                      </Button>
                      <Button
                        type="submit"
                        variant="dark"
                        style={style.replyForm}
                        onClick={() => {
                          setButtonDisplay("inline");
                          setDisplayReply("none");
                          setCommentFormDisplay("inline");
                        }}
                      >
                        Cancel
                      </Button>
                    </Card>
                  </form>
                </Row>
                {/* <div style={style.postDetaails}> */}
                <Row>
                  <div>
                    <div className="text-center col-12">
                      {comments.map(renderComments)}
                    </div>
                  </div>
                </Row>
              </div>
            </Row>
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
      <Row style={{ height: "10vh", width: "100vw", margin: 0 }}>
        <Container
          fluid
          className="col-2 text-center"
          style={{ backgroundColor: "black", height: "100vh" }}
        >
          <Card style={style.profileCard} data-aos="fade-right">
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
          style={{ float: "right", backgroundColor: "black", height: "1000vh" }}
        >
          <div className="text-center ">{posts.map(renderPosts)}</div>
        </Container>
      </Row>
    </div>
  );
}

export default OnePost;
