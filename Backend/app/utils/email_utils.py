# Create a new file: app/utils/email_utils.py
from flask_mail import Message
from flask import current_app
from app import mail  # Import your mail instance
import threading
from datetime import datetime

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        mail.send(msg)

def send_sr_confirmation_email(user_email, user_name, ticket_id, subject, priority,description):
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
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #C70039; font-size: 12px; }}
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
                    <strong>Cyber Security Operations Team</strong></p>
                    <strong>Lanka Communication Services (Pvt.) Ltd</strong></p>
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
        - Ticket ID: Ticket #-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Status: Pending
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Our technical team will review your request and get back to you shortly.

        Thank you for your patience.

        Best regards,
        Cyber Security Operations Team
        Lanka Communication Services (Pvt.) Ltd
        
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
    
    
def send_ft_confirmation_email(user_email, user_name, ticket_id, subject, priority,description):
    """Send ticket creation confirmation email"""
    try:
        msg = Message(
            subject='Faulty Ticket Created Successfully',
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
                .header {{ background-color: #1486b8; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }}
                .content {{ line-height: 1.6; color: #333; }}
                .ticket-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #C70039; font-size: 12px; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Faulty Ticket Created Successfully</h1>
                </div>
                
                <div class="content">
                    <p>Dear {user_name},</p>
                    
                    <p>Your Faulty Ticket has been created successfully and is now being processed by our technical team.</p>
                    
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
                    <strong>Cyber Security Operations Team</strong></p>
                    <strong>Lanka Communication Services (Pvt.) Ltd</strong></p>
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

        Your Faulty Ticket has been created successfully and is now being processed by our technical team.

        Ticket Details:
        - Ticket ID: Ticket #-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Status: Pending
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Our technical team will review your request and get back to you shortly.

        Thank you for your patience.

        Best regards,
        Cyber Security Operations Team
        Lanka Communication Services (Pvt.) Ltd
        
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
    
    
def send_assignment_notification_email(user_email, user_name, ticket_id, subject, engineer_name, engineer_email):
    """Notify user about assigned engineer"""
    try:
        msg = Message(
            subject='Your Ticket Has Been Assigned',
            recipients=[user_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; }}
                .header {{ background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px; }}
                .content {{ color: #333; line-height: 1.6; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #C70039; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Ticket Assigned</h2>
                </div>
                <div class="content">
                    <p>Dear {user_name},</p>
                    <p>Your ticket <strong> #{ticket_id:06d} -  {subject}</strong> has been assigned to one of our engineers.</p>
                    <p><strong>Assigned Engineer:</strong> {engineer_name}<br>
                    <strong>Email:</strong> {engineer_email}</p>
                    <p>They will be in touch shortly. You can contact them directly for urgent matters.</p>
                    <p>Thank you for your continued patience.</p>
                    <p>Best regards,<br><strong>Cyber Security Operations Team</strong></p><br><strong>Lanka Communication Services (Pvt.) Ltd</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {user_name},

        Your ticket #{ticket_id:06d} - {subject} has been assigned to:

        Engineer: {engineer_name}
        Email: {engineer_email}

        They will contact you soon. Feel free to reach out for urgent support.

        Best regards,
        Cyber Security Operations Team
        Lanka Communication Services (Pvt.) Ltd
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send assignment email: {str(e)}")
        return False
    
def send_otp_email(user_email, otp_code):
    """Send OTP email for password reset verification"""
    try:
        msg = Message(
            subject="Your OTP for Password Reset",
            recipients=[user_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        # HTML content
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }}
                .container {{ background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }}
                .otp {{ font-size: 28px; font-weight: bold; color: #10b981; margin: 20px 0; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Password Reset OTP</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Use the OTP below to proceed. This OTP is valid for <strong>5 minutes</strong>.</p>
                <div class="otp">{otp_code}</div>
                <p>If you did not request this, please ignore this message.</p>
                <div class="footer">
                    This is an automated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        msg.body = f"""
        Hello,

        Your OTP for password reset is: {otp_code}

        It is valid for 5 minutes. If you didn't request this, please ignore this email.

        - Cyber Security Operations
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
        return False

def send_admin_otp_email(user_email, otp_code):
    """Send OTP email for password reset verification"""
    try:
        msg = Message(
            subject="Your OTP for Admin Login Verification",
            recipients=[user_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        # HTML content
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }}
                .container {{ background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }}
                .otp {{ font-size: 28px; font-weight: bold; color: #10b981; margin: 20px 0; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Admin Login Verification OTP</h2>
                <p>Hello,</p>
                <p>You requested to login as an admin. Use the OTP below to proceed. This OTP is valid for <strong>5 minutes</strong>.</p>
                <div class="otp">{otp_code}</div>
                <p>If you did not request this, please ignore this message.</p>
                <div class="footer">
                    This is an automated email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        msg.body = f"""
        Hello,

        Your OTP for password reset is: {otp_code}

        It is valid for 5 minutes. If you didn't request this, please ignore this email.

        - Cyber Security Operations
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
        return False
    
def notify_new_pending_ft_to_engineer(ticket_id, subject, priority, description, requester_name, requester_company, recipient_emails):
    """Send notification to fixed engineer email when a new pending ticket is created"""
    try:
        engineer_email = recipient_emails
        engineer_name = "Engineer Team"

        msg = Message(
            subject='New Faulty Ticket Request Available',
            recipients=engineer_email,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }}
                .container {{ max-width: 600px; margin: auto; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }}
                .header {{ background-color: #1d4ed8; color: white; padding: 15px; text-align: center; border-radius: 6px; }}
                .ticket-box {{ background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin-top: 20px; }}
                .footer {{ font-size: 12px; margin-top: 30px; color: #6b7280; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Pending Ticket Available</h2>
                </div>
                <div class="content">
                    <p>Dear {engineer_name},</p>
                    <p>A new faulty ticket has been submitted and is currently pending assignment.</p>
                    <div class="ticket-box">
                        <p><strong>Ticket ID:</strong> FT-{ticket_id:06d}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <p><strong>Priority:</strong> <span class="priority-{priority.lower()}">{priority}</span></p>
                        <p><strong>Status:</strong> Pending</p>
                        <p><strong>Requested By:</strong> {requester_name} ({requester_company})</p>
                        <p><strong>Created:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    <p>Please log in to the system to view and assign this request if applicable.</p>
                    <p>Best regards,<br><strong>LankaCom Support Portal</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated alert. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {engineer_name},

        A new faulty ticket has been submitted and is currently pending assignment.

        Ticket Details:
        - Ticket ID: FT-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Status: Pending
        - Requested By: {requester_name} ({requester_company})
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Please log in to the system and assign it if applicable.

        Regards,
        LankaCom Support Portal

        ---
        This is an automated message. Do not reply.
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send engineer notification email: {str(e)}")
        return False
    
def notify_new_pending_sr_to_engineer(ticket_id, subject, priority, description, requester_name, requester_company,recipient_emails):
    """Send notification to fixed engineer email when a new pending ticket is created"""
    try:
        engineer_email = recipient_emails
        engineer_name = "Engineer Team"

        msg = Message(
            subject='New Pending Service Request Available',
            recipients=engineer_email,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }}
                .container {{ max-width: 600px; margin: auto; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }}
                .header {{ background-color: #55b42c; color: white; padding: 15px; text-align: center; border-radius: 6px; }}
                .ticket-box {{ background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin-top: 20px; }}
                .footer {{ font-size: 12px; margin-top: 30px; color: #6b7280; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Pending Ticket Available</h2>
                </div>
                <div class="content">
                    <p>Dear {engineer_name},</p>
                    <p>A new service request has been submitted and is currently pending assignment.</p>
                    <div class="ticket-box">
                        <p><strong>Ticket ID:</strong> SR-{ticket_id:06d}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <p><strong>Priority:</strong> <span class="priority-{priority.lower()}">{priority}</span></p>
                        <p><strong>Status:</strong> Pending</p>
                        <p><strong>Requested By:</strong> {requester_name} ({requester_company})</p>
                        <p><strong>Created:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    <p>Please log in to the system to view and assign this request if applicable.</p>
                    <p>Best regards,<br><strong>LankaCom Support Portal</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated alert. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {engineer_name},

        A new service request has been submitted and is currently pending assignment.

        Ticket Details:
        - Ticket ID: SR-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Status: Pending
        - Requested By: {requester_name} ({requester_company})
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Please log in to the system and assign it if applicable.

        Regards,
        LankaCom Support Portal

        ---
        This is an automated message. Do not reply.
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send engineer notification email: {str(e)}")
        return False


def send_comment_notification_to_requester(requester_email, requester_name, ticket_id, subject, comment_content,cc_email=None):
    """Notify customer when an engineer comments on their ticket"""
    try:
        msg = Message(
            subject=f"New Comment on Your Ticket #{ticket_id:06d}",
            recipients=[requester_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            cc=[cc_email] if cc_email else []
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }}
                .container {{ background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
                .header {{ background-color: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 5px; }}
                .comment-box {{ background-color: #f1f5f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }}
                .footer {{ font-size: 12px; color: #888; text-align: center; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Comment on Your Ticket</h2>
                </div>
                <p>Dear {requester_name},</p>
                <p>An engineer has posted a new comment on your ticket:</p>
                <p><strong>Ticket ID:</strong>{ticket_id:06d}<br>
                   <strong>Subject:</strong> {subject}</p>

                <div class="comment-box">
                    <p>{comment_content}</p>
                </div>

                <p>Please log in to your support portal to reply or view further updates.</p>
                <p>Best regards,<br><strong>Cyber Security Operations Team</strong></p>
                <div class="footer">
                    *This is an automated message. Do not reply.
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {requester_name},

        An engineer has posted a new comment on your ticket:

        Ticket ID: {ticket_id:06d}
        Subject: {subject}

        Comment:
        {comment_content}

        Please log in to your support portal to view and respond.

        Best regards,
        Cyber Security Operations Team
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send comment notification email: {e}")
        return False

def notify_engineer_about_customer_comment(engineer_email, ticket_id, subject, comment_content, customer_name,cc_email=None):
    """Notify assigned engineer when a customer comments on a ticket"""
    try:
        msg = Message(
            subject=f"Customer Comment on Ticket #{ticket_id:06d}",
            recipients=[engineer_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            cc=[cc_email] if cc_email else []
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f9fafb;
                    padding: 20px;
                }}
                .container {{
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: auto;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background-color: #2563eb;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    border-radius: 6px 6px 0 0;
                }}
                .content {{
                    color: #333333;
                    padding: 20px 0;
                }}
                .comment-box {{
                    background-color: #f1f5f9;
                    padding: 15px;
                    border-left: 4px solid #2563eb;
                    margin-top: 10px;
                    font-style: italic;
                }}
                .footer {{
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Comment on #{ticket_id:06d}</h2>
                </div>
                <div class="content">
                    <p><strong>Customer:</strong> {customer_name}</p>
                    <p><strong>Ticket ID:</strong>#{ticket_id:06d}</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Comment:</strong></p>
                    <div class="comment-box">
                        {comment_content}
                    </div>
                    <p>Please log in to the support portal to respond to this comment.</p>
                </div>
                <div class="footer">
                    This is an automated message. Please do not reply.
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        New Comment on #{ticket_id:06d}
        Customer: {customer_name}
        Ticket ID:#{ticket_id:06d}
        Subject: {subject}

        Comment:
        {comment_content}

        Please log in to the support portal to reply.

        ---
        This is an automated message. Please do not reply.
        """

        thread = threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg))
        thread.start()

        return True
    except Exception as e:
        print(f"Failed to send engineer comment notification: {e}")
        return False


def send_ticket_closed_email(to_email, customer_name, ticket_id, subject, closed_by, rectification_date, work_done_comment):
    """Notify customer that their ticket has been successfully closed"""
    try:
        msg = Message(
            subject=f"Your Ticket #{ticket_id:06d} Has Been Closed",
            recipients=[to_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        # HTML version
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f9fafb;
                    padding: 20px;
                }}
                .container {{
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: auto;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    background-color: #960532;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    border-radius: 6px 6px 0 0;
                }}
                .details {{
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #f1f5f9;
                    border-radius: 5px;
                }}
                .footer {{
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Ticket #{ticket_id:06d} Closed</h2>
                </div>
                <p>Dear {customer_name},</p>
                <p>Your support ticket has been successfully resolved and marked as <strong>Closed</strong>.</p>
                
                <div class="details">
                    <p><strong>Ticket ID:</strong> {ticket_id:06d}</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Closed By:</strong> {closed_by}</p>
                    <p><strong>Rectification Date:</strong> {rectification_date.strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p><strong>Work Done Comment by Engineer:</strong><br>{work_done_comment}</p>
                </div>

                <p>Thank you for bringing this to our attention. If you have any further issues, feel free to open a new ticket.</p>
                <p>Best regards,<br><strong>Cyber Security Operations Team</strong></p>

                <div class="footer">
                    This is an automated message. Please do not reply to this email.
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version
        msg.body = f"""
        Dear {customer_name},

        Your support ticket #{ticket_id:06d} has been successfully closed.

        Ticket Details:
        - Ticket ID: {ticket_id:06d}
        - Subject: {subject}
        - Closed By: {closed_by}
        - Rectification Date: {rectification_date.strftime('%Y-%m-%d %H:%M:%S')}
        - Work Done Comment by Engineer: {work_done_comment}

        Thank you for bringing this issue to our attention. If you have any more concerns, please open a new ticket.

        Best regards,
        Cyber Security Operations Team

        ---
        This is an automated message. Please do not reply.
        """

        # Send asynchronously
        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send ticket closed email: {e}")
        return False


def send_reassignment_email_to_engineer(engineer_email, engineer_name, ticket_id, subject, description, assigned_by):
    """Notify the new engineer that they’ve been assigned a ticket"""
    try:
        msg = Message(
            subject=f"You have been assigned to Ticket #{ticket_id:06d}",
            recipients=[engineer_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        msg.html = f"""
        <html>
        <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 30px;">
                <h2 style="color: #0F766E;">🚨 Ticket Assignment Notification</h2>
                <p>Hello <strong>{engineer_name}</strong>,</p>
                <p>You have been assigned a new support ticket by <strong>{assigned_by}</strong>. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr><td><strong>🎫 Ticket ID:</strong></td><td>#{ticket_id:06d}</td></tr>
                    <tr><td><strong>📌 Subject:</strong></td><td>{subject}</td></tr>
                    <tr><td><strong>📝 Description:</strong></td><td>{description}</td></tr>
                </table>
                <p style="margin-top: 20px;">Please log into the system to start working on this ticket.</p>
                <p style="margin-top: 30px;">Best regards,<br><strong>Cyber Security Operations Team</strong></p>
            </div>
        </body>
        </html>
        """

        msg.body = f"""Dear {engineer_name},

You have been assigned a new support ticket by {assigned_by}.

Ticket Details:
- Ticket ID: #{ticket_id:06d}
- Subject: {subject}
- Description: {description}

Please log in to the system to begin working on this ticket.

Best regards,
Cyber Security Operations Team
"""

        thread = threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg))
        thread.start()

        return True
    except Exception as e:
        print("Error sending reassignment email to engineer:", str(e))
        return False



def notify_requester_about_reassignment(user_email, user_name, ticket_id, subject, new_engineer_name, new_engineer_email):
    """Notify requester that the assigned engineer has changed"""
    try:
        msg = Message(
            subject=f"Update on Ticket #{ticket_id:06d}: New Engineer Assigned",
            recipients=[user_email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        msg.html = f"""
        <html>
        <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 30px;">
                <h2 style="color: #DC2626;">🔄 Engineer Reassignment Notice</h2>
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>We would like to inform you that your support ticket has been reassigned. Please see the updated ticket information below:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr><td><strong>🎫 Ticket ID:</strong></td><td>#{ticket_id:06d}</td></tr>
                    <tr><td><strong>📌 Subject:</strong></td><td>{subject}</td></tr>
                    <tr><td><strong>👨‍💻 New Engineer:</strong></td><td>{new_engineer_name}</td></tr>
                    <tr><td><strong>✉️ Contact Email:</strong></td><td><a href="mailto:{new_engineer_email}">{new_engineer_email}</a></td></tr>
                </table>
                <p style="margin-top: 20px;">The new engineer will reach out to you shortly. If you have questions, feel free to reply to this email.</p>
                <p style="margin-top: 30px;">Thank you for your cooperation,<br><strong>Cyber Security Operations Team</strong></p>
            </div>
        </body>
        </html>
        """

        msg.body = f"""Dear {user_name},

Your ticket has been reassigned to a new engineer.

Ticket Details:
- Ticket ID: #{ticket_id:06d}
- Subject: {subject}
- New Engineer: {new_engineer_name}
- Contact Email: {new_engineer_email}

The engineer will follow up with you shortly.

Thank you,
Cyber Security Operations Team
"""

        thread = threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg))
        thread.start()

        return True
    except Exception as e:
        print("Error sending reassignment email to requester:", str(e))
        return False
    
def send_ft_customer_notification_email(
    customer_email,
    customer_name,
    ticket_id,
    subject,
    priority,
    description,
    status,
    engineer_name,
    engineer_contact,
):
    """Send Faulty Ticket creation notification email to customer (engineer-created)"""

    try:
        msg = Message(
            subject="Faulty Ticket Created and Assigned",
            recipients=[customer_email],
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
        )

        # HTML email template (matching your style)
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background-color: #1486b8; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }}
                .content {{ line-height: 1.6; color: #333; }}
                .ticket-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #C70039; font-size: 12px; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Faulty Ticket Created</h1>
                </div>
                
                <div class="content">
                    <p>Dear {customer_name},</p>
                    
                    <p>Your Faulty Ticket has been created by our engineer and is now <strong>{status}</strong>.</p>
                    
                    <div class="ticket-details">
                        <h3>Ticket Details:</h3>
                        <p><strong>Ticket ID:</strong> FT-{ticket_id:06d}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <p><strong>Priority:</strong> <span class="priority-{priority.lower()}">{priority}</span></p>
                        <p><strong>Created:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>

                    <div class="ticket-details">
                        <h3>Assigned Engineer:</h3>
                        <p><strong>Name:</strong> {engineer_name}</p>
                        <p><strong>Contact:</strong> {engineer_contact}</p>
                    </div>
                    
                    <p>Our engineer will work on resolving your issue and keep you updated on progress.</p>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Thank you for your cooperation.</p>
                    
                    <p>Best regards,<br>
                    <strong>Cyber Security Operations Team</strong></p>
                    <strong>Lanka Communication Services (Pvt.) Ltd</strong>
                </div>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>If you need immediate assistance, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        msg.body = f"""
        Dear {customer_name},

        Your Faulty Ticket has been created by our engineer and is now {status}.

        Ticket Details:
        - Ticket ID: FT-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Assigned Engineer:
        - Name: {engineer_name}
        - Contact: {engineer_contact}

        Our engineer will work on resolving your issue and keep you updated on progress.

        Thank you for your cooperation.

        Best regards,
        Cyber Security Operations Team
        Lanka Communication Services (Pvt.) Ltd

        ---
        This is an automated message. Please do not reply to this email.
        """

        # Send async (assuming you have send_async_email defined like in your example)
        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg),
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send engineer-created FT email: {str(e)}")
        return False
    
def send_sr_customer_notification_email(
    customer_email,
    customer_name,
    ticket_id,
    subject,
    priority,
    description,
    status,
    engineer_name,
    engineer_contact,
):
    """Send Service Request creation notification email to customer (engineer-created)"""

    try:
        msg = Message(
            subject="Service Request Created & Assigned",
            recipients=[customer_email],
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background-color: #008080; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }}
                .content {{ line-height: 1.6; color: #333; }}
                .ticket-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #C70039; font-size: 12px; }}
                .priority-critical {{ color: #dc2626; font-weight: bold; }}
                .priority-high {{ color: #ea580c; font-weight: bold; }}
                .priority-medium {{ color: #ca8a04; font-weight: bold; }}
                .priority-low {{ color: #16a34a; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Service Request Created</h1>
                </div>
                
                <div class="content">
                    <p>Dear {customer_name},</p>
                    
                    <p>Your Service Request has been created by our engineer and is now <strong>{status}</strong>.</p>
                    
                    <div class="ticket-details">
                        <h3>Request Details:</h3>
                        <p><strong>Request ID:</strong> SR-{ticket_id:06d}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <p><strong>Priority:</strong> <span class="priority-{priority.lower()}">{priority}</span></p>
                        <p><strong>Created:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>

                    <div class="ticket-details">
                        <h3>Assigned Engineer:</h3>
                        <p><strong>Name:</strong> {engineer_name}</p>
                        <p><strong>Contact:</strong> {engineer_contact}</p>
                    </div>
                    
                    <p>Our engineer will work on your request and keep you updated on progress.</p>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Thank you for your cooperation.</p>
                    
                    <p>Best regards,<br>
                    <strong>Cyber Security Operations Team</strong></p>
                    <strong>Lanka Communication Services (Pvt.) Ltd</strong>
                </div>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>If you need immediate assistance, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {customer_name},

        Your Service Request has been created by our engineer and is now {status}.

        Request Details:
        - Request ID: SR-{ticket_id:06d}
        - Subject: {subject}
        - Description: {description}
        - Priority: {priority}
        - Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Assigned Engineer:
        - Name: {engineer_name}
        - Contact: {engineer_contact}

        Our engineer will work on your request and keep you updated on progress.

        Thank you for your cooperation.

        Best regards,
        Cyber Security Operations Team
        Lanka Communication Services (Pvt.) Ltd

        ---
        This is an automated message. Please do not reply to this email.
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg),
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to send engineer-created SR email: {str(e)}")
        return False

def send_bundle_notification_to_am(am_email, am_name, company, month, tickets):
    """Send an email to the Account Manager when a bundle is added for their company."""

    try:
        msg = Message(
            subject=f"New Ticket Bundle Added - {company}",
            recipients=[am_email],
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
        )

        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        msg.html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
                .container {{ max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
                .header {{ background: #0a5275; color: white; padding: 15px; border-radius: 5px; text-align: center; }}
                .details {{ margin-top: 20px; }}
                .details p {{ margin: 5px 0; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Ticket Bundle Added</h2>
                </div>
                <p>Dear {am_name},</p>
                <p>This is to notify you that an additional ticket bundle has been added for <strong>{company}</strong>.</p>
                
                <div class="details">
                    <p><strong>Company:</strong> {company}</p>
                    <p><strong>Month:</strong> {month}</p>
                    <p><strong>Bundle:</strong> {tickets} tickets</p>
                    <p><strong>Added On:</strong> {current_time}</p>
                </div>

                <p>If you have any concerns, please contact your support lead or the admin team.</p>

                <p>Best regards,<br>
                <strong>{company} Support Team</strong></p>

                <div class="footer">
                    <p>This is an automated message. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {am_name},

        This is to notify you that an additional ticket bundle has been added for {company}.

        Company: {company}
        Month: {month}
        Bundle: {tickets} tickets
        Added On: {current_time}

        If you have any concerns, please contact your support lead or the admin team.

        Best regards,
        {company} Support Team

        ---
        This is an automated message. Please do not reply.
        """

        # Send asynchronously
        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg),
        )
        thread.start()
        return True

    except Exception as e:
        print(f"Failed to send bundle notification email: {e}")
        return False
    

def send_bundle_purchase_notification_email_to_manager(email, company, month, added_by, ticket_count, name):
    try:
        msg = Message(
            subject=f"[Bundle Added] {company} purchased {ticket_count} extra SRs for {month}",
            recipients=[email],
            sender=current_app.config["MAIL_DEFAULT_SENDER"]
        )

        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }}
                .header {{
                    background-color: #00695c;
                    color: white;
                    padding: 20px;
                    border-radius: 8px 8px 0 0;
                    text-align: center;
                }}
                .content {{
                    color: #333;
                    padding: 20px 0;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                }}
                .highlight {{
                    font-weight: bold;
                    color: #00897b;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Extra SR Bundle Purchased</h2>
                </div>
                <div class="content">
                    <p>Dear <strong>{name}</strong>,</p>
                    
                    <p>
                        Your customer company <span class="highlight">{company}</span> has successfully purchased
                        <span class="highlight">{ticket_count}</span> additional Service Requests for the month of
                        <span class="highlight">{month}</span>.
                    </p>

                    <p>
                        <strong>Added by:</strong> {added_by}
                    </p>

                    <p>
                        Please take note of this activity and follow up if necessary.
                    </p>

                    <p>Thank you,<br><strong>LankaCom Ticketing System</strong></p>
                </div>
                <div class="footer">
                    This is an automated message. Please do not reply directly to this email.
                </div>
            </div>
        </body>
        </html>
        """

        msg.body = f"""
        Dear {name},

        Your customer company "{company}" has purchased {ticket_count} additional Service Requests for the month of {month}.

        Added by: {added_by}

        Please review or follow up if necessary.

        Regards,
        LankaCom Ticketing System
        """

        thread = threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg))
        thread.start()

        return True
    except Exception as e:
        print(f"Failed to send manager email: {e}")
        return False

def notify_customers_of_bundle(company, customers, additional_tickets, added_by, month):
    """Notify all customers from a company that a ticket bundle was purchased."""
    try:
        emails = [c.email for c in customers if c.email]

        if not emails:
            print(f"No valid customer emails found for company: {company}")
            return False

        msg = Message(
            subject="New Ticket Bundle Added for Your Company",
            recipients=emails,
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
        )

        msg.body = f"""
        Dear {company} Customer,

        A new ticket bundle of {additional_tickets} tickets has been added for {month}.

        This bundle was added by: {added_by}

        You may now use the additional quota for your service requests.

        Regards,
        Lankacom Support Team
        """

        msg.html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background-color: #1E90FF; padding: 20px; color: white; text-align: center; border-radius: 5px; }}
                .content {{ margin-top: 20px; color: #333; line-height: 1.6; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #888; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Ticket Bundle Added</h2>
                </div>
                <div class="content">
                    <p>Dear Customer,</p>
                    <p>A new bundle of <strong>{additional_tickets} tickets</strong> has been added to your company’s quota for the month of <strong>{month}</strong>.</p>
                    <p>This was added by: <strong>{added_by}</strong></p>
                    <p>You may now raise additional service requests using the updated quota.</p>
                    <p>Thank you for your continued use of our services.</p>
                    <p>Regards,<br><strong>Lankacom Support Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        thread = threading.Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg),
        )
        thread.start()

        return True

    except Exception as e:
        print(f"Failed to notify customers: {str(e)}")
        return False
