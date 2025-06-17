# Create a new file: app/utils/email_utils.py
from flask_mail import Message
from flask import current_app
from app import mail  # Import your mail instance
import threading

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        mail.send(msg)

def send_ticket_confirmation_email(user_email, user_name, ticket_id, subject, priority,description):
    """Send ticket creation confirmation email"""
    try:
        msg = Message(
            subject='Service Request Created Successfully',
            recipients=[user_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        # HTML email template
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background-color: #14b8a6; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }}
                .content {{ line-height: 1.6; color: #333; }}
                .ticket-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Service Request Created Successfully</h1>
                </div>
                
                <div class="content">
                    <p>Dear {user_name},</p>
                    
                    <p>Your service request has been created successfully and is now being processed by our technical team.</p>
                    
                    <div class="ticket-details">
                        <h3>Ticket Details:</h3>
                        <p><strong>Ticket ID:</strong> SR-{ticket_id:06d}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <p><strong>Priority:</strong> <span class="priority-{priority.lower()}">{priority}</span></p>
                        <p><strong>Status:</strong> Pending</p>
                        <p><strong>Created:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    <p>Our technical team will review your request and get back to you shortly. You will receive updates via email as your ticket progresses.</p>
                    
                    <p>If you have any urgent questions, please contact our support team.</p>
                    
                    <p>Thank you for your patience.</p>
                    
                    <p>Best regards,<br>
                    <strong>Technical Support Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>If you need immediate assistance, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        msg.body = f"""
        Dear {user_name},

        Your service request has been created successfully and is now being processed by our technical team.

        Ticket Details:
        - Ticket ID: SR-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Status: Pending
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Our technical team will review your request and get back to you shortly.

        Thank you for your patience.

        Best regards,
        Technical Support Team
        
        ---
        This is an automated message. Please do not reply to this email.
        """
        
        # Send email asynchronously to avoid blocking the request
        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()
        
        return True
        
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

# Import datetime at the top of the file
from datetime import datetime