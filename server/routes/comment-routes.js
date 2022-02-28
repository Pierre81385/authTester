const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

//setup AWS connection
const awsConfig = {
  region: "us-east-2",
};
AWS.config.update(awsConfig);

//create a dynamodb object
const dynamodb = new AWS.DynamoDB.DocumentClient();

//define table to be working on
const table = "Comments";

//create route to get all comments
router.get("/comments", (req, res) => {
  const params = {
    TableName: table,
  };
  // Scan returns all items in the table that meet the params
  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.status(500).json(err); // an error occurred
    } else {
      res.json(data.Items);
    }
  });
});

// get all posts by postCreatedAt
router.get("/comments/:postCreatedAt", (req, res) => {
  console.log(
    `Querying for comment information from ${req.params.postCreatedAt}.`
  );
  const params = {
    TableName: table,
    ProjectionExpression: "#pca, #un, #cm, #ca",
    KeyConditionExpression: "#pca = :postCreatedAt",
    ExpressionAttributeNames: {
      "#pca": "postCreatedAt",
      "#un": "username",
      "#cm": "comment",
      "#ca": "createdAt",
    },
    ExpressionAttributeValues: {
      ":postCreatedAt": req.params.postCreatedAt,
    },
    ScanIndexForward: false, // false makes the order descending(true is default)
  };
  dynamodb.query(params, (err, data) => {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Query succeeded.");
      res.json(data.Items);
    }
  });
});

// Create new comment
router.post("/comments", (req, res) => {
  const params = {
    TableName: table,
    Item: {
      postCreatedAt: req.body.postCreatedAt,
      username: req.body.username,
      comment: req.body.comment,
      firebaseUid: req.body.userId,
      createdAt: Date.now(),
    },
  };
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.json({ Added: JSON.stringify(data, null, 2) });
    }
  });
});

module.exports = router;
