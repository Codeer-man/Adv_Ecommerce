import mongoose from "mongoose";

const URI = process.env.MONGO_URI;

if (!URI) {
  console.error("URI not found");
}
let configMongo: typeof mongoose;

export async function ConnectToDB() {
  try {
    if (configMongo) return configMongo;

    configMongo = await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to db");
  } catch (error: any) {
    console.error(error);
    process.exit(1);
  }
}
