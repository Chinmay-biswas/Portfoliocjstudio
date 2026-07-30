import app from "../server/app.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function restoreApiPath(req) {
  const requestUrl = new URL(req.url || "/", "https://portfolio.local");
  const routePath = requestUrl.searchParams.get("path");

  if (!routePath) return;

  requestUrl.searchParams.delete("path");
  const safePath = routePath
    .split("/")
    .filter(Boolean)
    .join("/");
  const query = requestUrl.searchParams.toString();

  req.url = `/api/${safePath}${query ? `?${query}` : ""}`;
}

export default function handler(req, res) {
  restoreApiPath(req);
  return app(req, res);
}
