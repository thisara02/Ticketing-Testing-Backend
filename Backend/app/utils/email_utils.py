# Create a new file: app/utils/email_utils.py
from flask_mail import Message
from flask import current_app
from app import mail  # Import your mail instance
import threading

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
    
    
def send_assignment_notification_email(user_email, user_name, ticket_id, subject, engineer_name, engineer_contact):
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
                    <strong>Contact:</strong> {engineer_contact}</p>
                    <p>They will be in touch shortly. You can contact them directly for urgent matters.</p>
                    <p>Thank you for your continued patience.</p>
                    <p>Best regards,<br><strong>Cyber Security Operations Team</strong></p>
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
        Contact: {engineer_contact}

        They will contact you soon. Feel free to reach out for urgent support.

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
    
def notify_new_pending_ft_to_engineer(ticket_id, subject, priority, description, requester_name, requester_company):
    """Send notification to fixed engineer email when a new pending ticket is created"""
    try:
        engineer_email = "shammid@lankacom.net"
        engineer_name = "Engineer Team"

        msg = Message(
            subject='New Faulty Ticket Request Available',
            recipients=[engineer_email],
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

        A new faulty ticket has been submitted and is currently pending assignment.

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
    
def notify_new_pending_sr_to_engineer(ticket_id, subject, priority, description, requester_name, requester_company):
    """Send notification to fixed engineer email when a new pending ticket is created"""
    try:
        engineer_email = "shammid@lankacom.net"
        engineer_name = "Engineer Team"

        msg = Message(
            subject='New Pending Service Request Available',
            recipients=[engineer_email],
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


# Import datetime at the top of the file
from datetime import datetime