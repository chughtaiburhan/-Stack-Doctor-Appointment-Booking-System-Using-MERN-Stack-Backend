import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.body = req.body || {};
    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
