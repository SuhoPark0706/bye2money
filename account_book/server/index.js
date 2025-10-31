// ESM version
import express from "express";
import cors from "cors";
import bodyParser from "body-parser"; // (or just use express.json())

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
// app.use(express.json()); // this also works; then you can remove body-parser
app.use(bodyParser.json());

const DATA_PATH = path.join(__dirname, "../src/data/tx.sample.json");

app.get("/tx", (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/tx", (req, res) => {
  try {
    const { amount, content, method, category } = req.body;

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const list = JSON.parse(raw);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const weekday = now.toLocaleDateString("ko-KR", { weekday: "long" });

    const amt = Number(amount);
    const signedAmount = isNaN(amt) ? 0 : (amt > 0 ? -amt : amt);

    const tx = {
      id: "t" + Date.now(),
      date: dateStr,
      weekday,
      category: category || "식비",
      content: content || "",
      method: method || "현금",
      amount: signedAmount,
      type: "expense",
    };

    list.push(tx);
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
    res.json(tx);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
