import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

interface PriceHistory {
  [symbol: string]: number[];
}

const priceHistory: PriceHistory = {
  bitcoin: [],
  ethereum: [],
  dogecoin: [],
};

const fetchPrices = async () => {
  const symbols = ["bitcoin", "ethereum", "dogecoin"];
  for (const symbol of symbols) {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=eur`,
    );
    const price = response.data[symbol].eur;
    priceHistory[symbol].push(price);
  }
};

setInterval(fetchPrices, 60000);

app.get("/price/:symbol", (req, res) => {
  const symbol = req.params.symbol;
  const minutes = req.query.minutes
    ? parseInt(req.query.minutes as string)
    : 60;
  const prices = priceHistory[symbol] || [];
  const latest = prices.length > 0 ? prices[prices.length - 1] : null;
  const average =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  console.log("symbol", symbol);
  console.log("minutes", minutes);
  console.log("prices", prices);
  console.log("latest", latest);
  console.log("average", average);

  res.json({
    latest,
    average,
    history: prices,
    count: prices.length,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
