from django.conf import settings

def emailjs_settings(request):
    """
    Exposes EmailJS configuration to all templates.
    """
    return {
        'EMAILJS_SERVICE_ID': settings.EMAILJS_SERVICE_ID,
        'EMAILJS_PUBLIC_KEY': settings.EMAILJS_PUBLIC_KEY,
        'EMAILJS_CONTACT_TEMPLATE_ID': settings.EMAILJS_CONTACT_TEMPLATE_ID,
        'EMAILJS_MEETING_TEMPLATE_ID': settings.EMAILJS_MEETING_TEMPLATE_ID,
    }
