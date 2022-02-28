# authTester

A basic framework for user login and profile creation.

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