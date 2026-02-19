import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
SENDER_EMAIL = os.getenv("CONTACT_EMAIL", "support@tronix365.com") 

def send_email_via_brevo(to_email: str, subject: str, html_content: str, sender_name: str = "Tronix365", sender_email: str = None, reply_to: dict = None):
    """
    Sends an email using the Brevo API.
    """
    if not sender_email:
        sender_email = SENDER_EMAIL
    
    if not BREVO_API_KEY:
        logger.warning("BREVO_API_KEY not set. Skipping email.")
        return False

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }

    if reply_to:
        payload["replyTo"] = reply_to

    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        logger.info(f"Email sent successfully to {to_email}. Message ID: {response.json().get('messageId')}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send email via Brevo: {e}")
        if e.response:
            logger.error(f"Brevo Response: {e.response.text}")
        return False

def send_contact_form_notification(name: str, email: str, message: str):
    """
    Sends a notification to the admin/support email when a contact form is submitted.
    """
    # Send to the configured generic contact email
    to_email = os.getenv("CONTACT_EMAIL")
    if not to_email:
        logger.warning("CONTACT_EMAIL not set. Cannot send notification.")
        return False

    subject = f"New Contact Message from {name}"
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
            <h2 style="color: #6d28d9; border-bottom: 2px solid #6d28d9; padding-bottom: 10px;">New Contact Message</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">{message}</p>
            </div>
            <p style="font-size: 12px; color: #888;">This email was sent from the Tronix365 Contact Form.</p>
        </div>
    </body>
    </html>
    """
    
    # We send FROM the system address (SENDER_EMAIL) TO the admin address (to_email)
    # We set 'reply-to' as the user's email so the admin can reply directly.
    return send_email_via_brevo(
        to_email, 
        subject, 
        html_body, 
        sender_name="Tronix365 Contact Form",
        reply_to={"name": name, "email": email}
    )
