import app, { connectDatabase } from "./app.js";

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log(`Admin API running on http://127.0.0.1:${port}`);
  await connectDatabase();
});
