//get all posts by username and display here
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Container, Card, Row, Image } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {
  BsPlusSquare,
  BsCollection,
  BsBoxArrowRight,
  BsEnvelope,
  BsFillPersonPlusFill,
  BsFillPersonDashFill,
} from "react-icons/bs";
import addLove from "../assets/addLove.png";

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
  const [likedBy, setLikedBy] = useState([]);
  const [displayLike, setDisplayLike] = useState("inline");
  //friend states
  const [allFriends, setAllFriends] = useState([]);
  const [allFriendsFirbase, setAllFriendsFirebase] = useState([]);
  const [friend, setFriend] = useState({
    uid: "",
    username: "",
  });
  const [friendsPressed, setFriendsPressed] = useState(false);
  const [userFriends, setUserFriends] = useState("");

  const history = useHistory();

  const style = {
    img: {
      marginTop: "15px",
      maxWidth: "90vw",
      maxHeight: "90vh",
      display: "block",
      marginLeft: "5px",
      marginRight: "5px",
      display: "float",
    },
    profile: {
      marginTop: "5px",
      width: "50px",
      height: "50px",
      display: "block",
      marginLeft: "10px",
      marginRight: "10px",
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
      width: `100vw`,
      heigh: "100%",
      padding: "5px",
      position: "fixed",
      marginLeft: "0",
      marginRight: "0",
      textAlign: "center",
      display: "flex",
      flexDirection: "row",
      zIndex: 1,
      borderRadius: "0%",
    },
    cCard: {
      padding: "10px",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: "15px",
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
    loveButton: {
      display: `${displayLike}`,
      marginLeft: "2.5px",
      marginRight: "2.5px",
    },
  };

  // get current user from Firestore
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

  // for scrolling user back to reply form
  useEffect(() => {
    if (replyPressed) {
      fieldRef.current.scrollIntoView();
    }
  });

  // Query DynamoDB for all likes for post createdAt ID.  Recheck if like button pressed.
  useEffect(() => {
    console.log("setting number of likes");

    const fetchPostLikes = async () => {
      try {
        console.log("lookinh for likes on post: " + userParam);
        const res = await fetch(`//likes/${userParam}`);
        const data = await res.json();

        setNumberOfLikes(data.length);
        setLikedBy([...data]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPostLikes();

    if (likePressed) {
      fetchPostLikes();
    }
  }, [userParam, likePressed]);

  useEffect(() => {
    //get alllllll friends
    const requestFreinds = async () => {
      const res = await fetch("//friends/");
      const data = await res.json();
      console.log("set allFriends with " + data);
      setAllFriendsFirebase(data.uid);
      setAllFriends(JSON.stringify(data));
      console.log("allFriends set: " + allFriends);
    };

    requestFreinds();

    if (friendsPressed) {
      requestFreinds();
    }
  }, [friendsPressed]);

  useEffect(() => {
    //get alllllll friends by user
    const requestFreinds = async () => {
      const res = await fetch(`//friends/${name}`);
      const data = await res.json();
      setUserFriends(data);
    };

    requestFreinds();

    if (friendsPressed) {
      requestFreinds();
    }
  }, [friendsPressed]);

  // Query DynamoDB for all freinds by firebaseUserId as user.uid

  //////////////////////////////////////
  ////////// - RENDER POSTS - //////////
  //////////////////////////////////////

  const renderPosts = (post) => {
    //////////////////////////////////////
    ////////// - RENDER COMMENTS - ///////
    //////////////////////////////////////

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
        const res = await fetch("//comments", {
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
        const res = await fetch("//replys", {
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

    //like a post funtions //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const likePost = () => {
      console.log("recording like to database");
      const recordLike = async () => {
        const res = await fetch(`//likes/`, {
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
    };

    const updateLikeCount = () => {
      console.log("updating like count");
      const fetchPostLikes = async () => {
        try {
          const res = await fetch(`//likes/${userParam}`);
          const data = await res.json();
          setNumberOfLikes(data.length); // number of likes isn't immediately accessible.  How do I fix this!
        } catch (error) {
          console.log(error);
        }
      };
      fetchPostLikes();
    };

    //make a friend functions
    const friendUser = () => {
      const recordFriend = async () => {
        const res = await fetch(`//friends/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(friend),
        });
      };

      if (friend.uid === user.uid) {
        console.log("you can't friend yourself!");
      } else if (allFriends.length === 0) {
        recordFriend();
      } else if (allFriends.includes(post.firebaseUid)) {
        console.log("you're already friends");
      } else {
        recordFriend();
      }
    };

    //POST HTML
    return (
      <Container style={{ margin: 0, padding: 0, width: "100vw" }}>
        {post.createdAt === Number(userParam) ? (
          <>
            <Row
              style={{
                width: "100vw",
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                padding: 0,
              }}
              className="justify-content-center"
            >
              <div
                className="col-12 text-center"
                style={{
                  padding: "25px",
                  marginLeft: 0,
                  marginRight: 0,
                  width: "100vw",
                }}
              >
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
                    <BsFillPersonPlusFill
                      as="Link"
                      style={{ marginTop: "auto", marginBottom: "auto" }}
                      onClick={() => {
                        console.log("friend pressed");
                        setFriendsPressed(true);

                        friend.uid = post.firebaseUid;
                        friend.username = name;
                        setFriend({
                          uid: post.firebaseUid,
                          username: name,
                        });
                        friendUser();
                      }}
                    />
                  </h5>
                  <p style={{ color: "white" }}>{post.description}</p>
                </div>
                <div style={{ color: "white" }}>
                  Loved by {numberOfLikes} users.
                </div>

                <div className="card-footer" ref={fieldRef}>
                  {name === post.username || likedBy.length > 0 ? (
                    <></>
                  ) : (
                    <>
                      <form>
                        <Button
                          variant="black"
                          type="button"
                          style={style.loveButton}
                          onClick={() => {
                            liked.postCreatedAt = post.createdAt.toString();
                            liked.username = name;
                            liked.like = true;
                            likePost();
                            updateLikeCount();
                            setLikePressed(true);
                          }}
                        >
                          <Image src={addLove} style={{ width: "25px" }} />
                        </Button>
                      </form>
                    </>
                  )}
                </div>
                {/* testing */}
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
                        // ref={fieldRef}
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
                <div>
                  <div className="text-center col-12">
                    {comments.map(renderComments)}
                  </div>
                </div>
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
    <div
      style={{ display: "inline-block", width: "100%", margin: 0, padding: 0 }}
    >
      <Row
        style={{
          height: "10vh",
          width: "100vw",
          marginLeft: 0,
          marginRight: 0,
        }}
        className="justify-content-center"
      >
        <Card style={style.profileCard} data-aos="fade-down" id="profileCard">
          <BsEnvelope
            as="Link"
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={() => {
              window.location.href = `mailto:${email}`;
            }}
          />
          <Card.Img
            variant="top"
            src={profileImage}
            style={style.profile}
            className="text-center"
          />
          <h1
            style={{
              textAlign: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            INSTA
          </h1>
          <h5
            style={{
              textAlign: "left",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            petey
          </h5>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginLeft: "auto",
            }}
          >
            <Card.Title
              style={{
                marginTop: "auto",
                marginBottom: "auto",
              }}
            >
              <h5>Friends: {userFriends.length}</h5>
            </Card.Title>
            <BsPlusSquare
              size={25}
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                marginTop: "auto",
                marginBottom: "auto",
                width: "30px",
              }}
              onClick={() => {
                history.replace("/post");
              }}
            />
            <BsCollection
              size={25}
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                marginTop: "auto",
                marginBottom: "auto",
                width: "30px",
              }}
              onClick={() => {
                history.replace(`/`);
              }}
            />
            <BsBoxArrowRight
              size={25}
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                marginTop: "auto",
                marginBottom: "auto",
                width: "30px",
              }}
              onClick={logout}
            />
          </div>
        </Card>
      </Row>
      <Row
        style={{
          width: "100vw",
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          padding: 0,
        }}
        className="justify-content-center"
      >
        <Container
          className="col-12 justify-content-center"
          style={{ backgroundColor: "black", padding: 0 }}
        >
          <div
            className="text-center"
            style={{
              margin: 0,
              padding: 0,
            }}
          >
            {posts.map(renderPosts)}
          </div>
        </Container>
      </Row>
    </div>
  );
}

export default OnePost;
