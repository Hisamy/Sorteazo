# 📬 Scalable Email Notification System (Node.js + BullMQ + Gmail SMTP)

This project provides a simple, scalable, and reliable **email notification system** leveraging **BullMQ** for background job processing, **Redis** as a queue backend, Node.js, and **Gmail SMTP** via Nodemailer for delivery.

Notifications are enqueued via a REST API endpoint and processed asynchronously by a dedicated background worker, which sends templated HTML emails.

---

## 🚀 Features

* **📡 REST API** to effortlessly enqueue email notifications.
* **📨 Email Worker** using **BullMQ** for reliable background processing (automatically started with the server).
* **🧩 HTML Templates** with support for dynamic variables.
* **⚡ Redis-based Queue** for robustness and horizontal scalability. 
* **🔐 Gmail SMTP** support via `nodemailer`.
* **📄 Four Ready-to-Use Templates**: `generic.html`, `winner.html`, `non-winner.html`, and `reminder.html`.

---

## 📁 Project Structure

* `/`
    * `server.js` (API server, starts worker)
    * `queues/`
        * `notifications.queue.js` (Queue definition)
        * `notifications.worker.js` (BullMQ worker)
    * `utils/`
        * `render-template.js` (Template renderer)
    * `services/`
        * `email.service.js` (Email Service)
    * `factory/`
        * `email-transporter.factory.js` (Email Transporter Factory)
    * `templates/`
        * `generic.html`
        * `winner.html`
        * `non-winner.html`
        * `reminder.html`
    * `README.md`


---

## 🔧 Requirements

* **Node.js 18+**
* **Redis server** running (locally or remote).
* **Gmail account** with a [**Google App Password**](https://support.google.com/mail/answer/185833?hl=en) enabled for security.

### ⚙️ Environment Variables

Create a `.env` file or set the following environment variables:

| Variable | Description |
| :--- | :--- |
| `EMAIL_USER` | Your full Gmail address (e.g., `your_gmail@gmail.com`) |
| `EMAIL_PASS` | The **App Password** generated from your Google account |

---

## ▶️ How to Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the system** (server + worker):
    ```bash
    npm run start
    ```
    This command automatically starts the **Express server** and the **BullMQ notification worker**.

---

## 📤 Sending Notifications

Send a **POST** request to the endpoint to enqueue a new notification job:

POST http://localhost:3000/notify


The request **Body** must be a JSON object containing the required fields for the chosen template, including the **`template`** name, **`destinatarios`**, and **`fechaEnvio`**.

### 📄 Template Payload Examples

All templates accept any dynamic variables. Variables in the payload will replace corresponding placeholders (e.g., `{{variableName}}`) in the HTML template.

| Template | Required Custom Fields | Example Payload |
| :--- | :--- | :--- |
| **`generic.html`** | `titulo`, `descripcion` | **1. generic.html**<br>```json{ "template": "generic", "destinatarios": "example@gmail.com", "titulo": "Generic Notification", "descripcion": "This is a general-purpose message.", "extraNote": "Optional field example", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`winner.html`** | `sorteo`, `premio` | **2. winner.html**<br>```json{ "template": "winner", "destinatarios": "example@gmail.com", "titulo": "Congratulations, You Won!", "sorteo": "Sorteo Vacacional 2025", "premio": "MacBook Pro 16”", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`non-winner.html`** | `sorteo` | **3. non-winner.html**<br>```json{ "template": "non-winner", "destinatarios": "example@gmail.com", "titulo": "Contest Result", "sorteo": "Sorteo Navideño 2024", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`reminder.html`** | `nombre`, `sorteo`, `fecha_limite`, `URL_PAGO` | **4. reminder.html**<br>```json{ "template": "reminder", "destinatarios": "example@gmail.com", "titulo": "Reminder", "nombre": "John Doe", "sorteo": "Sorteo Express", "fecha_limite": "2025-02-10", "URL_PAGO": "[https://example.com/pay](https://example.com/pay)", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |

### 🎯 Example cURL Commands

These examples send a job that is scheduled to be processed **10 seconds** from the current time (using the `fechaEnvio` field).

**Generic**

````bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "generic",
    "destinatarios": "you@example.com",
    "titulo": "Generic Test",
    "descripcion": "Testing generic template",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

**Winner**

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "winner",
    "destinatarios": "you@example.com",
    "sorteo": "Christmas Raffle",
    "premio": "PS5",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

**Non-Winner**

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "non-winner",
    "destinatarios": "you@example.com",
    "sorteo": "Big Giveaway",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

Reminder

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "reminder",
    "destinatarios": "you@example.com",
    "nombre": "Tester",
    "sorteo": "Submit your report",
    "fecha_limite": "2025-12-05",
    "URL_PAGO": "[https://example.com/pay/pending](https://example.com/pay/pending)",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

⏳ How the Queue Works (Redis Explained)

BullMQ uses Redis as a powerful and lightweight message broker to manage jobs.

It tracks various job states: waiting, active, completed, failed, and delayed.

Jobs only exist in the queue while they are being processed or are scheduled for a future time.

Automatic Cleanup: By default, successfully completed jobs are removed immediately from Redis. This keeps the queue system efficient and prevents data from accumulating unnecessarily.

📬 Worker Console Output
The worker provides real-time feedback in the console as it processes jobs.

✅ Success
When a notification is sent successfully, you will see a confirmation message:

❌ Failure
If an error occurs (e.g., an invalid template name or an SMTP issue), the job's status is updated, and a descriptive error is logged.# 📬 Scalable Email Notification System (Node.js + BullMQ + Gmail SMTP)

This project provides a simple, scalable, and reliable **email notification system** leveraging **BullMQ** for background job processing, **Redis** as a queue backend, Node.js, and **Gmail SMTP** via Nodemailer for delivery.

Notifications are enqueued via a REST API endpoint and processed asynchronously by a dedicated background worker, which sends templated HTML emails.

---

## 🚀 Features

* **📡 REST API** to effortlessly enqueue email notifications.
* **📨 Email Worker** using **BullMQ** for reliable background processing (automatically started with the server).
* **🧩 HTML Templates** with support for dynamic variables.
* **⚡ Redis-based Queue** for robustness and horizontal scalability. 
* **🔐 Gmail SMTP** support via `nodemailer`.
* **📄 Four Ready-to-Use Templates**: `generic.html`, `winner.html`, `non-winner.html`, and `reminder.html`.

---

## 📁 Project Structure

* `/`
    * `server.js` (API server, starts worker)
    * `queues/`
        * `notifications.queue.js` (Queue definition)
        * `notifications.worker.js` (BullMQ worker)
    * `utils/`
        * `render-template.js` (Template renderer)
    * `services/`
        * `email.service.js` (Email Service)
    * `factory/`
        * `email-transporter.factory.js` (Email Transporter Factory)
    * `templates/`
        * `generic.html`
        * `winner.html`
        * `non-winner.html`
        * `reminder.html`
    * `README.md`


---

## 🔧 Requirements

* **Node.js 18+**
* **Redis server** running (locally or remote).
* **Gmail account** with a [**Google App Password**](https://support.google.com/mail/answer/185833?hl=en) enabled for security.

### ⚙️ Environment Variables

Create a `.env` file or set the following environment variables:

| Variable | Description |
| :--- | :--- |
| `EMAIL_USER` | Your full Gmail address (e.g., `your_gmail@gmail.com`) |
| `EMAIL_PASS` | The **App Password** generated from your Google account |

---

## ▶️ How to Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the system** (server + worker):
    ```bash
    npm run start
    ```
    This command automatically starts the **Express server** and the **BullMQ notification worker**.

---

## 📤 Sending Notifications

Send a **POST** request to the endpoint to enqueue a new notification job:

POST http://localhost:3000/notify


The request **Body** must be a JSON object containing the required fields for the chosen template, including the **`template`** name, **`destinatarios`**, and **`fechaEnvio`**.

### 📄 Template Payload Examples

All templates accept any dynamic variables. Variables in the payload will replace corresponding placeholders (e.g., `{{variableName}}`) in the HTML template.

| Template | Required Custom Fields | Example Payload |
| :--- | :--- | :--- |
| **`generic.html`** | `titulo`, `descripcion` | **1. generic.html**<br>```json{ "template": "generic", "destinatarios": "example@gmail.com", "titulo": "Generic Notification", "descripcion": "This is a general-purpose message.", "extraNote": "Optional field example", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`winner.html`** | `sorteo`, `premio` | **2. winner.html**<br>```json{ "template": "winner", "destinatarios": "example@gmail.com", "titulo": "Congratulations, You Won!", "sorteo": "Sorteo Vacacional 2025", "premio": "MacBook Pro 16”", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`non-winner.html`** | `sorteo` | **3. non-winner.html**<br>```json{ "template": "non-winner", "destinatarios": "example@gmail.com", "titulo": "Contest Result", "sorteo": "Sorteo Navideño 2024", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`reminder.html`** | `nombre`, `sorteo`, `fecha_limite`, `URL_PAGO` | **4. reminder.html**<br>```json{ "template": "reminder", "destinatarios": "example@gmail.com", "titulo": "Reminder", "nombre": "John Doe", "sorteo": "Sorteo Express", "fecha_limite": "2025-02-10", "URL_PAGO": "[https://example.com/pay](https://example.com/pay)", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |

### 🎯 Example cURL Commands

These examples send a job that is scheduled to be processed **10 seconds** from the current time (using the `fechaEnvio` field).

**Generic**

````bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "generic",
    "destinatarios": "you@example.com",
    "titulo": "Generic Test",
    "descripcion": "Testing generic template",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

**Winner**

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "winner",
    "destinatarios": "you@example.com",
    "sorteo": "Christmas Raffle",
    "premio": "PS5",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

**Non-Winner**

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "non-winner",
    "destinatarios": "you@example.com",
    "sorteo": "Big Giveaway",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

Reminder

````bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "reminder",
    "destinatarios": "you@example.com",
    "nombre": "Tester",
    "sorteo": "Submit your report",
    "fecha_limite": "2025-12-05",
    "URL_PAGO": "[https://example.com/pay/pending](https://example.com/pay/pending)",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
`````

⏳ How the Queue Works (Redis Explained)

BullMQ uses Redis as a powerful and lightweight message broker to manage jobs.

It tracks various job states: waiting, active, completed, failed, and delayed.

Jobs only exist in the queue while they are being processed or are scheduled for a future time.

Automatic Cleanup: By default, successfully completed jobs are removed immediately from Redis. This keeps the queue system efficient and prevents data from accumulating unnecessarily.

📬 Worker Console Output
The worker provides real-time feedback in the console as it processes jobs.

✅ Success
When a notification is sent successfully, you will see a confirmation message:

❌ Failure
If an error occurs (e.g., an invalid template name or an SMTP issue), the job's status is updated, and a descriptive error is logged.