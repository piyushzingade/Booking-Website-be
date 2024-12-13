import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const connectionToDb = async () => {
    try {
        const dbconnection = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travelBookingDB");
        if (dbconnection) {
            console.log("database connected successfully", dbconnection.connection.host);
        }
    }
    catch (error) {
        console.log("Error in connecting database");
        process.exit(1);
    }
};
export default connectionToDb;
