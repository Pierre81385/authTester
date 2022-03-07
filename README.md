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

# TO-DO

- need to add condition so that a post cannot be liked multiple times by the same user
- need to fix issue where number of likes displayed does not re-render on user press of like button

- update and delete POST
- delete COMMENT
- delete REPLY