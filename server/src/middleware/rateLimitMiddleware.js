import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * AI endpoint rate limiter — 10 requests per minute per authenticated user.
 *
 * Uses req.user._id (set by authMiddleware) as the key so each user
 * gets their own bucket regardless of IP address.
 */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? String(req.user._id) : ipKeyGenerator(req.ip)),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: {
    message: "Too many AI requests. Please wait a moment before trying again."
  }
});
