from flask import Flask, render_template, request, jsonify
import sqlite3

from dotenv import load_dotenv

import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()

app = Flask(__name__)
from flask import send_from_directory

@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory("static", "sitemap.xml")


# =========================================================
# DATABASE CREATE
# =========================================================

def init_db():

    conn = sqlite3.connect("kalkriti.db")

    cursor = conn.cursor()

    # =====================================================
    # POPUP FORM TABLE
    # =====================================================

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS popup_leads (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT,
            email TEXT,
            phone TEXT,
            city TEXT,
            kitchen_type TEXT,
            budget TEXT,
            duration TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )

    """)

    # =====================================================
    # CONTACT FORM TABLE
    # =====================================================

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS contact_leads (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT,
            phone TEXT,
            email TEXT,
            city TEXT,
            budget TEXT,
            kitchen_type TEXT,
            message TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )

    """)

    conn.commit()

    conn.close()


init_db()


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():

    return render_template("index.html")


# =========================================================
# POPUP FORM SUBMIT
# =========================================================

@app.route("/submit-popup", methods=["POST"])
def submit_popup():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    city = data.get("city")
    kitchen_type = data.get("kitchenType")
    budget = data.get("budget")
    duration = data.get("duration")

    # =====================================================
    # SAVE TO DATABASE
    # =====================================================

    conn = sqlite3.connect("kalkriti.db")

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO popup_leads
        (
            name,
            email,
            phone,
            city,
            kitchen_type,
            budget,
            duration
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

    """, (

        name,
        email,
        phone,
        city,
        kitchen_type,
        budget,
        duration

    ))

    conn.commit()

    conn.close()

    # =====================================================
    # EMAIL CONFIG
    # =====================================================

    sender_email = os.getenv("EMAIL_USER")

    sender_password = os.getenv("EMAIL_PASS")

    receiver_email = os.getenv("EMAIL_USER")

    # =====================================================
    # EMAIL CONTENT
    # =====================================================

    subject = "New Kitchen Consultation Enquiry"

    body = f"""

New Customer Enquiry

----------------------------------

Name: {name}

Email: {email}

Phone: {phone}

City: {city}

Kitchen Type: {kitchen_type}

Budget: {budget}

Project Duration: {duration}

----------------------------------

Please contact customer soon.

"""

    try:

        msg = MIMEMultipart()

        msg["From"] = sender_email

        msg["To"] = receiver_email

        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)

        server.starttls()

        server.login(sender_email, sender_password)

        server.send_message(msg)

        server.quit()

        return jsonify({

            "status": "success",
            "message": "Popup form submitted"

        })

    except Exception as e:

        print(e)

        return jsonify({

            "status": "error",
            "message": "Email failed"

        }), 500


# =========================================================
# CONTACT FORM SUBMIT
# =========================================================

@app.route("/submit-contact", methods=["POST"])
def submit_contact():

    data = request.get_json()

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    city = data.get("city", "").strip()
    email = data.get("email", "").strip()
    budget = data.get("budget", "").strip()
    kitchen_type = data.get("type", "").strip()
    message = data.get("message", "").strip()

    # =====================================================
    # SAVE TO DATABASE
    # =====================================================

    conn = sqlite3.connect("kalkriti.db")

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO contact_leads
        (
            name,
            phone,
            email,
            city,
            budget,
            kitchen_type,
            message
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

    """, (

        name,
        phone,
        email,
        city,
        budget,
        kitchen_type,
        message

    ))

    conn.commit()

    conn.close()

    # =====================================================
    # EMAIL CONFIG
    # =====================================================

    sender_email = os.getenv("EMAIL_USER")

    sender_password = os.getenv("EMAIL_PASS")

    receiver_email = os.getenv("EMAIL_USER")

    # =====================================================
    # BUSINESS EMAIL CONTENT
    # =====================================================

    business_subject = "New Contact Inquiry - Kalkriti"

    business_body = f"""

New Customer Inquiry

----------------------------------

Name: {name}

Phone: {phone}

Email: {email}

City: {city}

Budget: {budget}

Kitchen Type: {kitchen_type}

Message: {message}

----------------------------------

Please contact customer soon.

"""

    try:

        # =================================================
        # SMTP LOGIN
        # =================================================

        server = smtplib.SMTP("smtp.gmail.com", 587)

        server.starttls()

        server.login(sender_email, sender_password)

        # =================================================
        # SEND BUSINESS EMAIL
        # =================================================

        business_msg = MIMEMultipart()

        business_msg["From"] = sender_email

        business_msg["To"] = receiver_email

        business_msg["Subject"] = business_subject

        business_msg.attach(
            MIMEText(business_body, "plain")
        )

        server.send_message(business_msg)

        server.quit()

        return jsonify({

            "status": "success",

            "message": "Contact form submitted successfully"

        })

    except Exception as e:

        print(e)

        return jsonify({

            "status": "error",

            "message": "Email sending failed"

        }), 500


# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":

    app.run(debug=True)