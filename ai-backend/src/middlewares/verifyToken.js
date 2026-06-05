import jwt from "jsonwebtoken";

export function verifyToken(req, reply, done) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return reply.status(401).send({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }

    req.user = user; // attach user for next handlers
    done(); // continue route
  });
}