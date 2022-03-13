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
const table = "Friends";

//create route to get all likes
router.get("/friends", (req, res) => {
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

// get all likes by uid
router.get("/friends/:firebaseUserId", (req, res) => {
  console.log(`Querying for friends information from ${req.params.firebaseUserId}.`);
  const params = {
    TableName: table,
    ProjectionExpression: "#uid, #un, #ca",
    KeyConditionExpression: "#uid = :firebaseUserId",
    ExpressionAttributeNames: {
      "#uid": "firebaseUserID",
      "#un": "username",
      "#ca": "createdAt",
    },
    ExpressionAttributeValues: {
      ":uid": req.params.firebaseUserId,
    },
    ScanIndexForward: false, // false makes the order descending(true is default)
  };
  dynamodb.query(params, (err, data) => {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Trolliing for friends succeeded.");
      res.json(data.Items);
    }
  });
});

// add new friend
router.post("/friends", (req, res) => {
  const params = {
    TableName: table,
    Item: {
      firebaseUserId: req.body.firebaseUserId,
      username: req.body.username,
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
      console.log("Added like status:", JSON.stringify(data, null, 2));
      res.json({ Added: JSON.stringify(data, null, 2) });
    }
  });
});

module.exports = router;
