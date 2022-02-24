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
const table = "Users";

//create route to get all users
router.get("/users", (req, res) => {
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

// get user account information
router.get("/users/:username", (req, res) => {
  console.log(`Querying for thought(s) from ${req.params.username}.`);
  const params = {
    TableName: table,
    ProjectionExpression: "#un, #em, #ca, #img",
    KeyConditionExpression: "#un = :user",
    ExpressionAttributeNames: {
      "#img": "image", 
      "#un": "username",
      "#em": "email",
      "#ca": "createdAt",
    },
    ExpressionAttributeValues: {
      ":user": req.params.username,
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

// Create new user
router.post("/users", (req, res) => {
  const params = {
    TableName: table,
    Item: {
      image: req.body.image, 
      username: req.body.username,
      email: req.body.email,
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
