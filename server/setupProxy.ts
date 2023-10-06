import express from "express";
import cors from "cors";
import "dotenv/config";

const setupServer = async () => {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(cors());

  const response = await fetch(`https://carapi.app/api/auth/login`, {
    method: "POST",
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_token: process.env.CARAPI_TOKEN,
      api_secret: process.env.CARAPI_SECRET,
    }),
  });

  const data = await response.text();
  console.log("before", data);

  app.use((req, res) => {
    fetch(`https://carapi.app/api${req.path}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${data}`,
      },
    })
      .then((response) => response.json())
      .then((data) => res.json(data))
      .catch((error) => console.error("Error:", error));
  });
  console.log("after", data);

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
};

setupServer();
