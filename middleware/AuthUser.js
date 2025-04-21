import jwt from "jsonwebtoken";

export const autUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.body = req.body || {};
    req.body.userId = token_decode.id;

    next(); // ✅ Proceed to route
  } catch (error) {
    console.error("Auth Error:", error);
    res.json({ success: false, message: error.message });
  }
};
