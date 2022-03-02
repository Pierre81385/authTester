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
const table = "Posts";

//create route to get all posts
router.get("/posts", (req, res) => {
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

// get all posts by username
router.get("/posts/:username", (req, res) => {
  console.log(`Querying for user information from ${req.params.username}.`);
  const params = {
    TableName: table,
    ProjectionExpression: "#un, #em, #ca, #img, #fuid, #desc, #tl",
    KeyConditionExpression: "#un = :user",
    ExpressionAttributeNames: {
      "#un": "username",
      "#img": "image",
      "#em": "email",
      "#ca": "createdAt",
      "#fuid": "firebaseUid",
      "#tl": "title",
      "#desc": "description",
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


// Create new post
router.post("/posts", (req, res) => {
  const params = {
    TableName: table,
    Item: {
      image: req.body.image,
      username: req.body.username,
      email: req.body.email,
      firebaseUid: req.body.userId,
      createdAt: Date.now(),
      title: req.body.title,
      description: req.body.description,
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
