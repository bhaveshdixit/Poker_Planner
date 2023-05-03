import base64

from cryptography.fernet import Fernet
from django.conf import settings


def get_encoded_basic_auth_token(username, token):
    """
    Encoded the text to the base64 and the text will be in the form of
    {username of the jira: and the username token}
    """

    text = f"{username}:{token}"
    base64Token = base64.b64encode(text.encode()).decode()
    return base64Token


def get_jira_auth_header(username, token):
    """
    Accepts the username and token of user's jira account and return the
    corresponding header to thse credentials for JIRA Basic Auth
    """
    encode_token = get_encoded_basic_auth_token(username, token)

    return {"Authorization": f"Basic {encode_token}"}


def encrypt(txt):
    txt = str(txt)
    cipher_suite = Fernet(settings.FERNET_SECRET_KEY)
    encrypted_text = cipher_suite.encrypt(txt.encode("ascii"))
    encrypted_text = base64.urlsafe_b64encode(encrypted_text).decode("ascii")
    return encrypted_text


def decrypt(txt):
    txt = base64.urlsafe_b64decode(txt)
    cipher_suite = Fernet(settings.FERNET_SECRET_KEY)
    decoded_text = cipher_suite.decrypt(txt).decode("ascii")
    return decoded_text
