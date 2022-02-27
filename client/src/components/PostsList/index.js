import React from "react";
import { Link } from "react-router-dom";

// Renders the list of thoughts
const PostsList = ({ posts, title }) => {
  if (!posts.length) {
    return <h3>No Posts Yet</h3>;
  }
  return (
    <div>
      <h3>{title}</h3>
      {posts &&
        posts.map((post) => (
          <div key={post.createdAt} className="card mb-3">
            <p className="card-header">
              <Link
                to={`/profile/${post.username}`}
                style={{ fontWeight: 700 }}
                className="text-light"
              >
                {post.username}'s post on{" "}
                {new Date(parseInt(post.createdAt)).toString()}
              </Link>{" "}
            </p>
            {post.description && (
              <p className="px-2 mt-2">{post.description}</p>
            )}
            {/* add the thought image */}
            {post.image && (
              <p className="px-2">
                <img
                  className="mt-3 ml-4 thought-image"
                  src={post.image}
                  alt="S3 bucket response"
                />
              </p>
            )}
          </div>
        ))}
    </div>
  );
};

export default PostsList;
