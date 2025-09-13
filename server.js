// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";

// Load environment variables
dotenv.config();

// ✅ Check required env variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  process.exit(1);
}
console.log("✅ Environment variables loaded successfully");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Import routes
import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Import models
import User from "./models/User.js";

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://organic-food-frontend-two.vercel.app",
];

// ✅ Single clean CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman, curl
      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ✅ Google Authentication endpoint
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.avatar) {
        user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        avatar: picture,
        authMethod: "google",
        isVerified: true,
      });
    }

    res.json({
      success: true,
      message: "Google login successful",
      user,
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message);
    res.status(500).json({ message: "Google login failed" });
  }
});

// ✅ API routes
app.use("/api/users", userRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: "Connected to MongoDB",
  });
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Organic Food Delivery API is running...");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API Health: http://localhost:${PORT}/api/health`);
      console.log(
        `✅ Google Auth configured with Client ID: ${process.env.GOOGLE_CLIENT_ID}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
