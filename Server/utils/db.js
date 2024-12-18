import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config';

// MongoDB connection string
const mongoUri = `mongodb+srv://${process.env.VITE_MONGOUSER}:${process.env.VITE_MONGOPASSWORD}@${process.env.VITE_MONGOHOST}/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let con; // Database instance

async function connectDB() {
    if (!con) {
        try {
            // Connect to the MongoDB server
            await client.connect();
            console.log("Pinged your deployment. You successfully connected to MongoDB!");

            // Select the database (replace `mydatabase` with your actual database name)
            con = client.db(process.env.VITE_MONGODATABASE);
        } catch (err) {
            console.error("Connection error: ", err);
            throw err;
        }
    }
    return con;
}

// Export the database connection as 'con'
export default connectDB();
