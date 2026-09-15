// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require('mongoose');

// Database Connection URL
const uri = "mongodb://suos089_db_user:halGKLntaFTuvFH6@ac-dmwozsn-shard-00-00.iteou5n.mongodb.net:27017,ac-dmwozsn-shard-00-01.iteou5n.mongodb.net:27017,ac-dmwozsn-shard-00-02.iteou5n.mongodb.net:27017/cloudnativedev?ssl=true&replicaSet=atlas-11kb2h-shard-0&authSource=admin&appName=suos-cluster-67";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    // STEP-2 : ESTABLISH CONNECTION WITH MONGODB DATABASE THROUGH MONGOOSE
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await mongoose.disconnect();
  }
}
run().catch(console.dir);

// STEP-3 : EXPORT MODULE mongoose because we need it in other JS file
module.exports = mongoose;
