import { verifyToken } from "../middlewares/verifyToken.js";

export default async function protectedRoutes(app) {
  app.get("/profile", { preHandler: verifyToken }, async (req, reply) => {
    return {
      message: "This is protected data",
      user: req.user
    };
  });
}