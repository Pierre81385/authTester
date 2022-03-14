# authTester

A basic framework for user login and profile creation. Or that was the original intent, but after getting comfortable with DynamoDB, it's becoming more of an Instagram clone :-)  Basically a test bed for trying out AWS S3, DynamoDB, EC2, and Firebase.

# Screenshot

![Alt Text](client/src/assets/instaclone.gif)

# OUTINE

- Authorization through Firebase (Email & Google) for Login, Register, Reset, & Home pages.
- User information is stored on FirebaseFirestore database.
- Image uploading and storage is handled by AWS S3
- AWS DynamoDB stores user posts, retrieving user data from Firebase Firestore, and image location data from AWS S3.
- Express for backend routes
- React Router for frontend routing
- Deployed to EC2 instance at http://18.188.18.22/ on 3/14/2022

# REMINDER

- hide firebase API keys with .env
- Integrate Stripe payment
- Integrate Facebook login via Firebase
- Try out AWS Rekognition!
- Implement "likes"

# TO-DO

- Build out friending functionality FRONT END
- Reorganize layout to be mobile friendly.
- Add config file for updating deploy address
