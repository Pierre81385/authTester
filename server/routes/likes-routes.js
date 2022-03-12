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
const table = "Likes";

//create route to get all likes
router.get("/likes", (req, res) => {
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

  // get all likes by postCreatedAt
router.get("/likes/:postCreatedAt", (req, res) => {
    console.log(
      `Querying for likes information from ${req.params.postCreatedAt}.`
    );
    const params = {
      TableName: table,
      ProjectionExpression: "#pca, #lk, #un, #ca",
      KeyConditionExpression: "#pca = :postCreatedAt",
      ExpressionAttributeNames: {
        "#pca": "postCreatedAt",
        "#lk": "like",
        "#un": "username",
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
        console.log("Trolliing for likes succeeded.");
        res.json(data.Items);
      }
    });
  });

  

  // Create new like
router.post("/likes", (req, res) => {
    const params = {
      TableName: table,
      Item: {
        postCreatedAt: req.body.postCreatedAt,
        like: req.body.like,
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
  