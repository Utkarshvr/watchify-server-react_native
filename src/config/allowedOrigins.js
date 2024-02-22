const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://watchify-client.vercel.app",
  "http://watchify-client.vercel.app",
  "https://uv-watchify.netlify.app",
  "https://watchifyclient.serveo.net",
  process.env.CLIENT_URL,
];
module.exports = allowedOrigins;
