import { randomUUID } from "node:crypto";

export function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        type: "http_request",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      }),
    );
  });

  next();
}