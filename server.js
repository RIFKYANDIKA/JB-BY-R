require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const PUBLIC_URL = process.env.PUBLIC_URL;

let orders = [];

app.post("/api/create-payment", async (req, res) => {
  try {
    if (!XENDIT_SECRET_KEY || !PUBLIC_URL) {
      return res.status(500).json({
        error: "Konfigurasi server belum lengkap."
      });
    }

    const {
      accountId,
      accountName,
      amount,
      customerName,
      customerEmail,
      customerPhone
    } = req.body;

    if (!accountName || !amount) {
      return res.status(400).json({
        error: "Data pembayaran tidak lengkap."
      });
    }

    const externalId =
      "JBR-" +
      Date.now() +
      "-" +
      crypto.randomBytes(4).toString("hex");

    const payload = {
      external_id: externalId,
      amount: Number(amount),
      description: "Pembelian akun FF - " + accountName,
      invoice_duration: 3600,

      success_redirect_url:
        `${PUBLIC_URL}/?payment=success&order=${externalId}`,

      failure_redirect_url:
        `${PUBLIC_URL}/?payment=failed&order=${externalId}`,

      customer: {
        given_names: customerName || "Pembeli",
        email: customerEmail || "customer@example.com",
        mobile_number: customerPhone || ""
      },

      items: [
        {
          name: accountName,
          price: Number(amount),
          quantity: 1
        }
      ]
    };

    const auth = Buffer
      .from(XENDIT_SECRET_KEY + ":")
      .toString("base64");

    const response = await fetch(
      "https://api.xendit.co/v2/invoices",
      {
        method: "POST",

        headers: {
          "Authorization": "Basic " + auth,
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.message ||
          "Gagal membuat pembayaran."
      });
    }

    orders.push({
      external_id: externalId,
      account_id: accountId,
      account_name: accountName,
      amount: Number(amount),
      status: "PENDING",
      invoice_id: data.id,
      payment_url: data.invoice_url,
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      orderId: externalId,
      paymentUrl: data.invoice_url
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server pembayaran mengalami error."
    });
  }
});


/* WEBHOOK PEMBAYARAN */

app.post("/api/xendit/webhook", (req, res) => {

  const callbackToken =
    req.headers["x-callback-token"];

  if (
    process.env.XENDIT_CALLBACK_TOKEN &&
    callbackToken !==
      process.env.XENDIT_CALLBACK_TOKEN
  ) {
    return res.status(401).send("Unauthorized");
  }

  const data = req.body;

  const order = orders.find(
    item =>
      item.external_id ===
      data.external_id
  );

  if (order) {

    if (
      data.status === "PAID" ||
      data.status === "SETTLED"
    ) {
      order.status = "PAID";
      order.paid_at =
        new Date().toISOString();
    }

    if (data.status === "EXPIRED") {
      order.status = "EXPIRED";
    }
  }

  res.sendStatus(200);
});


/* CEK PESANAN */

app.get("/api/order/:id", (req, res) => {

  const order = orders.find(
    item =>
      item.external_id === req.params.id
  );

  if (!order) {
    return res.status(404).json({
      error: "Pesanan tidak ditemukan."
    });
  }

  res.json(order);
});


/* SEMUA PESANAN */

app.get("/api/orders", (req, res) => {
  res.json(orders);
});


app.listen(PORT, () => {
  console.log(
    `JB BY R berjalan di port ${PORT}`
  );
});