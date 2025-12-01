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

/ ├── server.js # Express API server (starts worker automatically) ├── worker/ │ └── notifications.worker.js # BullMQ worker process (handles sending email) ├── queues/ │ └── notifications.queue.js # BullMQ queue instance definition ├── utils/ │ └── render-template.js # Utility to load and replace variables in HTML templates ├── templates/ │ ├── generic.html # Standard template for general messages │ ├── winner.html # Template for prize winners │ ├── non-winner.html # Template for non-winners/participants │ └── reminder.html # Template for deadline reminders └── README.md


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
| `REDIS_HOST` | Redis server address (e.g., `localhost`) |
| `REDIS_PORT` | Redis port (e.g., `6379`) |

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
| **`winner.html`** | `titulo`, `username`, `prize`, `claimLimit` | **2. winner.html**<br>```json{ "template": "winner", "destinatarios": "example@gmail.com", "titulo": "Congratulations!", "username": "John Doe", "prize": "MacBook Pro 16”", "claimLimit": "48 hours", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`non-winner.html`** | `titulo`, `username`, `eventName` | **3. non-winner.html**<br>```json{ "template": "non-winner", "destinatarios": "example@gmail.com", "titulo": "Thank You for Participating", "username": "John Doe", "eventName": "Holiday Giveaway", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |
| **`reminder.html`** | `titulo`, `task`, `deadline` | **4. reminder.html**<br>```json{ "template": "reminder", "destinatarios": "example@gmail.com", "titulo": "Reminder", "task": "Complete your profile", "deadline": "2025-02-10", "fechaEnvio": "2025-01-01T00:00:10Z"}``` |

### 🎯 Example cURL Commands

These examples send a job that is scheduled to be processed **10 seconds** from the current time (using the `fechaEnvio` field).

**Generic**

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "generic",
    "destinatarios": "you@example.com",
    "titulo": "Generic Test",
    "descripcion": "Testing generic template",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
Winner

Bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "winner",
    "destinatarios": "you@example.com",
    "titulo": "You Won!",
    "username": "Tester",
    "prize": "PS5",
    "claimLimit": "24 hours",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
Non-Winner

Bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "non-winner",
    "destinatarios": "you@example.com",
    "titulo": "Not This Time",
    "username": "Tester",
    "eventName": "Big Giveaway",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
Reminder

Bash

curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "template": "reminder",
    "destinatarios": "you@example.com",
    "titulo": "Reminder",
    "task": "Submit your report",
    "deadline": "Tomorrow",
    "fechaEnvio": "'"$(date -u -d '+10 seconds' --iso-8601=seconds)"'"
  }'
⏳ Queue Behavior (Redis Explained)
BullMQ utilizes Redis as a lightweight message broker to manage job states (waiting, active, completed, failed, delayed).

Jobs exist only while they are queued, being processed, or delayed.

By default, once a job is completed successfully, it is removed from Redis immediately (unless a specific retention period is configured).

Redis will not accumulate unnecessary data from completed jobs, keeping the queue system clean and efficient.

📬 Worker Output
When the notification worker processes a job, you will see output like this in the console:

Job 1 completed
Notification sent to: example@gmail.com
If a failure occurs (e.g., template not found, SMTP error), the job status is updated, and an error message is logged:

Job 1 failed Error: Template not found
📘 Notes
The worker automatically processes only the variables that exist in the template file.

If a variable is present in the JSON payload but missing in the template, it is ignored.

If a variable placeholder ({{variableName}}) is in the template but missing in the JSON payload, the placeholder will simply remain unreplaced in the final email body. Ensure all required variables have correct names and are provided in the payload.

You are free to add custom fields to your templates and JSON payloads as needed.