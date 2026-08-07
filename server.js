require("dotenv").config();
const cors = require("cors");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server");
  }
};

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

startServer();