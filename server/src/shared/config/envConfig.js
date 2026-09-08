import "dotenv/config";

export const PORT = process.env.PORT || 8080;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
