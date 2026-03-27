const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(req.headers.authorization);
  if (!token) {
    return res.status(401).json({
      message: "Not authorized"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};

exports.isDoctor = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({
      message: "Doctor access only"
    });
  }
  next();
};

exports.isPatient = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      message: "Patient access only"
    });
  }
  next();
};