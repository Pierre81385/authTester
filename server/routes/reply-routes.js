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
const table = "Replys";

//create route to get all comments
router.get("/replys", (req, res) => {
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
router.get("/replys/:commentCreatedAt", (req, res) => {
  console.log(
    `Querying for comment information from ${req.params.commentCreatedAt}.`
  );
  const params = {
    TableName: table,
    ProjectionExpression: "#pca, #un, #rp, #ca",
    KeyConditionExpression: "#pca = :commentCreatedAt",
    ExpressionAttributeNames: {
      "#pca": "commentCreatedAt",
      "#un": "username",
      "#rp": "reply",
      "#ca": "createdAt",
    },
    ExpressionAttributeValues: {
      ":commentCreatedAt": req.params.commentCreatedAt,
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
router.post("/replys", (req, res) => {
  const params = {
    TableName: table,
    Item: {
      commentCreatedAt: req.body.commentCreatedAt,
      username: req.body.username,
      reply: req.body.reply,
      //firebaseUid: req.body.firebaseUid,
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
