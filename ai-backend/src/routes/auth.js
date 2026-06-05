import jwt from "jsonwebtoken";

export default async function authRoutes(app) {

  // -------------------------------
  // LOGIN ROUTE
  // -------------------------------
  app.post("/login", async (req, reply) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return reply.status(400).send({ error: "Email & password required" });
    }

    // TODO: Add DB later (now simple login)
    const accessToken = jwt.sign(
      { email },
      process.env.ACCESS_SECRET,
      { expiresIn: "10m" }
    );

    const refreshToken = jwt.sign(
      { email },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  });

  // -------------------------------
  // REFRESH TOKEN ROUTE
  // -------------------------------
  app.post("/refresh", async (req, reply) => {
    const { token } = req.body;

    if (!token) {
      return reply.status(400).send({ error: "Refresh token required" });
    }

    try {
      const user = jwt.verify(token, process.env.REFRESH_SECRET);

      const newAccess = jwt.sign(
        { email: user.email },
        process.env.ACCESS_SECRET,
        { expiresIn: "10m" }
      );

      return { accessToken: newAccess };

    } catch (err) {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

}
