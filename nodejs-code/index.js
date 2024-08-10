const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const apiKey = process.env.ZOOM_MEETING_CLIENT_ID;
const apiSecret = process.env.ZOOM_MEETING_CLIENT_SECRET;
const redirect_uri = "http://localhost:3000/api/callback";

app.get("/api/zoom-auth", (req, res) => {
  const authorizationUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${apiKey}&redirect_uri=${redirect_uri}`;
  return res.redirect(encodeURI(authorizationUrl));
});

app.get("/api/callback", async (req, res) => {
  console.log(req);
  const authorizationCode = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://zoom.us/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: authorizationCode,
          redirect_uri: redirect_uri,
        },
        auth: {
          username: apiKey,
          password: apiSecret,
        },
      }
    );

    console.log("tokenResponse: ", tokenResponse);

    const accessToken = tokenResponse.data.access_token;

    res.json(accessToken);
  } catch (e) {
    console.error("Error getting tokens:", e.response.data);
    res.status(500).send("Error getting tokens");
  }
});

app.get("/api/meetings", async (req, res) => {
  const accessToken = process.env.ACCESS_TOKEN;
  try {
    const meetingsResponse = await axios.get(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("meetingsResponse: ", meetingsResponse);
    res.json(meetingsResponse?.data);
  } catch (error) {
    console.error(
      "Error fetching meetings:",
      error.response?.data || error?.message
    );
    res.status(500).send("Error fetching meetings");
  }
});

app.post("/api/create-meeting", async (req, res) => {
  const accessToken = process.env.ACCESS_TOKEN;
  const meetingData = req.body;

  if (!accessToken) {
    throw "Unauthorised";
  }
  try {
    const meetingsResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        ...meetingData,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("create-meetingsResponse: ", meetingsResponse);

    res.json(meetingsResponse?.data);
  } catch (error) {
    console.error(
      "Error fetching meetings:",
      error.response?.data || error?.message
    );
    res.status(500).send("Error creating meeting");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
