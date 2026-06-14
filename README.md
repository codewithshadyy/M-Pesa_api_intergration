# M-Pesa STK Push — Express + MongoDB

A Node.js REST API that integrates **Lipa na M-Pesa Online (STK Push)** using the Safaricom Daraja API. Built with Express and MongoDB. Supports user-linked transactions, payment callbacks, and status polling.

---

## Tech Stack

- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — database & ODM
- **Axios** — Daraja API HTTP calls
- **dotenv** — environment variable management
- **ngrok** — expose localhost to the internet (dev only)

---

## Project Structure

```
mpesa-app/
├── app.js                  
├── .env                                
├── package.json
├── routes/
│   └── mpesa.js 
    └── accounts.js
|    --       
├── services/
│   └── mpesa.js            # Daraja API helpers (token, STK push, query)
└── models/
    └── Transaction.js 
    └── Account.js
──    middlewares
        └── protect
└── controllers
       └── accountControllers.js
       └── mpesaControllers        


        
```

---

## Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI
- A free account at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- ngrok (for receiving callbacks in development)

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd mpesa-app
npm install
```

### 2. Create your `.env` file



Fill in the values:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/mpesa_dev

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
```

> The shortcode and passkey above are Safaricom's **sandbox** defaults — use them as-is for development.

### 3. Get your Daraja credentials

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke) and create an account
2. Click **My Apps → Create App**
3. Tick **Lipa Na M-Pesa Sandbox**
4. Copy your **Consumer Key** and **Consumer Secret** into `.env`

### 4. Expose your callback URL with ngrok

Safaricom needs a public HTTPS URL to POST the payment result to. In development, use ngrok:

```bash
npx ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL, append `/api/mpesa/callback`, and paste it into `MPESA_CALLBACK_URL` in your `.env`.

> **Note:** Every time you restart ngrok you get a new URL — update `.env` and restart the server.

### 5. Start the server

```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

---

## API Endpoints

### `POST /api/mpesa/pay`

Initiates an STK Push — sends a payment prompt to the customer's phone.

**Request body:**

```json
{
  "phone": "254708663597",
  "amount": 1,
  "userId": "665f1a2b3c4d5e6f7a8b9c0d",
  "accountReference": "ORDER001",
  "description": "Payment"
}
```

| Field              | Required | Notes                                          |
|--------------------|----------|------------------------------------------------|
| `phone`            | Yes      | Accepts `07XX`, `+2547XX`, or `2547XX` formats |
| `amount`           | Yes      | Whole number in KES, minimum 1                 |
| `userId`           | Yes      | MongoDB ObjectId of the logged-in user         |
| `accountReference` | No       | Max 12 characters. Defaults to `ORDER001`      |
| `description`      | No       | Max 13 characters. Defaults to `Payment`       |

**Success response `200`:**

```json
{
  "message": "STK Push sent. Ask customer to enter PIN.",
  "checkoutRequestID": "ws_CO_191220191020363925",
  "transactionId": "665f1a2b3c4d5e6f7a8b9c0d",
  "initiatedBy": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "username": "codewithshadyy",
    "email": "kipkoechshadrack10@gmail.com"
  }
}
```

> A `200` response means the prompt was **sent to the phone** — not that the user has paid. Payment confirmation arrives via the callback.

---

### `POST /api/mpesa/callback`

**Called automatically by Safaricom** — do not call this yourself.

Safaricom POSTs the payment result here after the customer enters their PIN (or cancels). The transaction status in MongoDB is updated to `SUCCESS`, `FAILED`, or `CANCELLED`.

Always returns HTTP `200` to prevent Safaricom from retrying.

---

### `GET /api/mpesa/status/:checkoutRequestID`

Check the status of a transaction. First checks MongoDB; if still `PENDING`, queries Daraja directly.

**Example:**

```
GET /api/mpesa/status/ws_CO_191220191020363925
```

**Response:**

```json
{
  "status": "SUCCESS",
  "mpesaReceiptNumber": "RGH87GH43B",
  "amount": 10,
  "phone": "254708663597",
  "resultDesc": "The service request is processed successfully.",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "username": "codewithshadyy",
    "email": "kipkoechhadrack10@gmail.com"
  }
}
```

---

### `GET /api/mpesa/transactions`

Returns the 20 most recent transactions with linked user details. Useful for admin/debugging.

---

### `GET /api/mpesa/transactions/user/:userId`

Returns all transactions made by a specific user.

**Example:**

```
GET /api/mpesa/transactions/user/665f1a2b3c4d5e6f7a8b9c0d
```

**Response:**

```json
{
  "total": 3,
  "transactions": [ ... ]
}
```

---

## Transaction Status Values

| Status      | Meaning                                      |
|-------------|----------------------------------------------|
| `PENDING`   | STK prompt sent, waiting for customer action |
| `SUCCESS`   | Customer entered PIN and payment went through |
| `CANCELLED` | Customer dismissed the prompt (code 1032)    |
| `FAILED`    | Wrong PIN, insufficient funds, or other error |
| `TIMEOUT`   | Customer did not respond within ~30 seconds  |

---

## Sandbox Test Credentials

Use these when testing — real phones do **not** receive prompts in sandbox mode.

| Field         | Value              |
|---------------|--------------------|
| Test phone    | `25470863597`     |
| Shortcode     | `174379`           |
| PIN (sandbox) | Any 4-digit number |

---

## Common Errors

**502 — "Failed to initiate payment"**
Daraja rejected the STK push request. Check the `details` field in the response and your terminal logs for the full Daraja error.

**400 — "A valid userId is required"**
The `userId` in the request body is missing or not a valid MongoDB ObjectId.

**400 — "Invalid phone"**
Phone number failed validation. Use `07XXXXXXXX`, `+2547XXXXXXXX`, or `2547XXXXXXXX`.

**Callback not firing**
Your ngrok URL has changed — restart ngrok, update `MPESA_CALLBACK_URL` in `.env`, and restart the server.

---

## Moving to Production

1. Swap the Daraja base URL in `services/mpesa.js`:
   ```
   https://sandbox.safaricom.co.ke  →  https://api.safaricom.co.ke
   ```
2. Replace sandbox shortcode and passkey with your live Go-Live credentials
3. Replace the body `userId` with `req.user._id` from your JWT auth middleware
4. Cache the OAuth token (valid 1 hour) to avoid unnecessary Daraja calls
5. Use a proper HTTPS domain for `MPESA_CALLBACK_URL` — not ngrok

---

