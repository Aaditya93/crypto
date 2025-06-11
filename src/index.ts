import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook route
app.post("/api/webhook", (req, res) => {
  try {
    console.log("Received webhook request");
    console.log("Webhook received:", req.body);

    const webhookData = req.body;

    res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
