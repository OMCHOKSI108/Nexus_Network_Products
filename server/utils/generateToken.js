const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  return jwt.sign(
    { 
      userId,
      id: userId // For compatibility
    }, 
    JWT_SECRET, 
    { 
      expiresIn: "30d"
    }
  );
};

const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateToken,
  verifyToken
};
