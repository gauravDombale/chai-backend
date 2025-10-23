import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      console.error(
        "Missing MONGODB_URI environment variable. Please set it in your .env file."
      );
      process.exit(1);
    }

    const credentialPartMatch = rawUri.match(/mongodb(?:\+srv)?:\/\/([^@]+)@/);

    if (credentialPartMatch) {
      const creds = credentialPartMatch[1];
      if (creds.includes("@") && !creds.includes("%40")) {
        console.error(
          "It looks like your MongoDB password contains an '@' character. URL-encode special characters in the password (e.g. '@' -> '%40') in MONGODB_URI."
        );
        process.exit(1);
      }
    }
    
    // Connect without concatenating DB name into the URI to avoid issues with
    // trailing slashes or duplicate DB names. Pass dbName via options.
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log(
      "Connected to MongoDB successfully to host:",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
