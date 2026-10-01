if (typeof crypto === "undefined") { global.crypto = require("crypto"); }
const mongoose = require("mongoose");

const connectDB = async () => {
  const dns = require("dns");
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
    tls: true,
  };

  let retries = 3;
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI, options);
      console.log("MongoDB connected successfully ✅");
      return;
    } catch (error) {
      retries--;
      console.error(`MongoDB connection failed ❌ (${3 - retries}/3): ${error.message}`);
      if (retries === 0) {
        console.error("All MongoDB connection attempts exhausted. Exiting.");
        process.exit(1);
      }
      console.log(`Retrying in 3 seconds...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;