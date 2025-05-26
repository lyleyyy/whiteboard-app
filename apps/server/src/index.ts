import express from "express";
import cors from "cors";

const PORT = 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/waya", (req, res) => {
  let data = req.body;
  console.log(data, "qwdqwdqdwqd");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}/ ...`);
});
