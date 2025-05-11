import jwt from "jsonwebtoken";

export const autUser = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];  // Extract token after 'Bearer'

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.body = req.body || {};
    req.body.userId = token_decode.id;  // Assign userId to the request body

    next(); // Proceed to route
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: error.message });
  }
};
