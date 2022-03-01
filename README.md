# authTester

A basic framework for user login and profile creation.  Or that was the original intent, but after getting comfortable with DynamoDB, it's becoming more of an Instagram clone :-)

# OUTINE

- Authorization through Firebase (Email & Google) for Login, Register, Reset, & Home pages.
- User information is stored on FirebaseFirestore database.
- Image uploading and storage is handled by AWS S3
- AWS DynamoDB stores user posts, retrieving user data from Firebase Firestore, and image location data from AWS S3.
- Express for backend routes
- React Router for frontend routing

# REMINDER

- hide firebase API keys with .env
- Integrate Stripe payment
- Integrate Facebook login via Firebase
- Try out AWS Rekognition!
- Implement "likes"

# REPLY

- A table called REPLYS in DynamoDB will store replys, with key value being the createdAt number of the comment, called commentCreatedAt, it replys to...
- A button called REPLY will unhide a comment/reply input form
- ALL reply's will be retrieved and displayed on each comment by matching the commentCreatedAt number in the reply document with the comment createdAt number.