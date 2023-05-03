from celery import shared_task
from django.core.mail import send_mail


@shared_task(name="send mail to user")
def send_mail_to_user(subject, message, recipient_list):
    """
    Shared Task for send mail to users with email configuration as params
    """
    send_mail(subject=subject, message=message, from_email=None, recipient_list=recipient_list, fail_silently=False)
