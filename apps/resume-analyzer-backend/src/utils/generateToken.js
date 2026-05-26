const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    const id = user._id || user.id;
    return jwt.sign(
        { id: id, _id: id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

const generateRefreshToken = (user) => {
    const id = user._id || user.id;
    return jwt.sign(
        { id: id, _id: id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

module.exports = {
    generateAccessToken, generateRefreshToken
};