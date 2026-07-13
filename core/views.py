from django.shortcuts import render, redirect
from django.contrib import messages
from .models import BlogPost, GalleryItem, ContactSubmission, MeetingBooking, QuoteRequest, JobApplication

import os
import json
import urllib.request
from django.conf import settings
from django.core.mail import send_mail
from django.core.cache import cache

def _post_lead_to_pipeline(payload):
    url = "https://pc-sales-8phu.onrender.com/api/leads/intake"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": os.environ.get("LEAD_API_KEY", "PCSALES")
    }
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error posting lead to pipeline: {e}")
        return None


def _load_clients_json():
    json_path = os.path.join(settings.BASE_DIR, 'static', 'clients.json')
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading clients.json: {e}")
    return []

def home(request):
    posts = BlogPost.objects.filter(is_published=True)[:3]
    clients = cache.get('homepage_clients')
    if clients is None:
        clients = _load_clients_json()
        cache.set('homepage_clients', clients, 3600)
    return render(request, 'index.html', {
        'posts': posts,
        'clients': clients
    })

def about(request):
    return render(request, 'about.html')

def capabilities(request):
    return render(request, 'capabilities.html')

def industries(request):
    return render(request, 'industries.html')

def blog(request):
    posts = BlogPost.objects.filter(is_published=True)
    return render(request, 'blog.html', {'posts': posts})

def gallery(request):
    items = GalleryItem.objects.all()
    return render(request, 'gallery.html', {'items': items})

def careers(request):
    if request.method == 'POST':
        # Simple handling without formal Django forms for speed, but ideally use forms.py
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        position = request.POST.get('position')
        resume = request.FILES.get('resume')
        message = request.POST.get('message')
        
        try:
            JobApplication.objects.create(
                full_name=full_name,
                email=email,
                phone=phone,
                position=position,
                resume=resume,
                message=message
            )
        except Exception as e:
            print(f"Database save failed for job application: {e}")
        
        # Send email notification
        email_subject = f"New Job Application: {position} - {full_name}"
        email_body = (
            f"New job application received on Press Stamping Industries website.\n\n"
            f"Name: {full_name}\n"
            f"Email: {email}\n"
            f"Phone: {phone or 'N/A'}\n"
            f"Position: {position}\n"
            f"Message: {message or 'N/A'}\n"
        )
        try:
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_RECEIVER_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending job application email: {e}")

        messages.success(request, "Your application has been submitted successfully!")
        return redirect('careers')
        
    return render(request, 'careers.html')

def contact(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        company = request.POST.get('company')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        try:
            ContactSubmission.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                company=company,
                subject=subject,
                message=message
            )
        except Exception as e:
            print(f"Database save failed for contact submission: {e}")

        # Send to Lead Management API
        lead_payload = {
            "source_website": "press_stamping_industries",
            "full_name": f"{first_name} {last_name}".strip(),
            "email": email,
            "phone": phone or "",
            "company_name": company or "",
            "product_interest": subject or "",
            "message": message or ""
        }
        _post_lead_to_pipeline(lead_payload)

        
        # Send email notification
        email_subject = f"New Contact Submission: {subject}"
        email_body = (
            f"You have received a new message from the contact form.\n\n"
            f"Name: {first_name} {last_name}\n"
            f"Email: {email}\n"
            f"Phone: {phone or 'N/A'}\n"
            f"Company: {company or 'N/A'}\n"
            f"Subject: {subject}\n"
            f"Message:\n{message}\n"
        )
        try:
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_RECEIVER_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending contact email: {e}")

        messages.success(request, "Thank you! Your message has been sent. We will get back to you soon.")
        return redirect('contact')
        
    return render(request, 'contact.html')

def quote(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        company = request.POST.get('company')
        industry = request.POST.get('industry')
        project_description = request.POST.get('project_description')
        blueprints = request.FILES.get('blueprints')
        estimated_volume = request.POST.get('estimated_volume')
        
        try:
            QuoteRequest.objects.create(
                full_name=full_name,
                email=email,
                phone=phone,
                company=company,
                industry=industry,
                project_description=project_description,
                blueprints=blueprints,
                estimated_volume=estimated_volume
            )
        except Exception as e:
            print(f"Database save failed for quote request: {e}")
            
        messages.success(request, "Quote request submitted! Our engineering team will review and contact you.")
        return redirect('quote')
        
    return render(request, 'quote.html', {
        'SUPABASE_URL': os.environ.get('REACT_APP_SUPABASE_URL') or os.environ.get('SUPABASE_URL', ''),
        'SUPABASE_ANON_KEY': os.environ.get('REACT_APP_SUPABASE_ANON_KEY') or os.environ.get('SUPABASE_ANON_KEY', ''),
    })

def book_meeting(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        company = request.POST.get('company')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        purpose = request.POST.get('purpose')
        notes = request.POST.get('notes')
        date_str = request.POST.get('date')
        time_str = request.POST.get('time')
        timezone = request.POST.get('timezone')
        
        try:
            MeetingBooking.objects.create(
                full_name=full_name,
                company=company,
                email=email,
                phone=phone,
                purpose=purpose,
                notes=notes,
                date=date_str,
                time_slot=time_str,
                timezone=timezone
            )
        except Exception as e:
            print(f"Database save failed for meeting booking: {e}")

        # Send to Lead Management API
        lead_payload = {
            "source_website": "press_stamping_industries",
            "full_name": full_name,
            "email": email,
            "phone": phone or "",
            "company_name": company or "",
            "product_interest": purpose or "",
            "message": f"Meeting scheduled for {date_str} at {time_str} ({timezone}). Notes: {notes or ''}"
        }
        _post_lead_to_pipeline(lead_payload)

        
        # Send email notification
        email_subject = f"New Meeting Booked: {full_name} - {purpose}"
        email_body = (
            f"A virtual meeting has been scheduled via the website.\n\n"
            f"Name: {full_name}\n"
            f"Company: {company}\n"
            f"Email: {email}\n"
            f"Phone: {phone or 'N/A'}\n"
            f"Purpose: {purpose}\n"
            f"Date: {date_str}\n"
            f"Time Slot: {time_str} ({timezone})\n"
            f"Additional Notes: {notes or 'N/A'}\n"
        )
        try:
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_RECEIVER_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending meeting booking email: {e}")

        messages.success(request, f"Meeting confirmed for {date_str} at {time_str} ({timezone}). Check your email for details.")
        return redirect('contact')
    return redirect('contact')

def press_shop(request):
    return render(request, 'shops/press_shop.html')

def tool_shop(request):
    return render(request, 'shops/tool_shop.html')

def fabrication_shop(request):
    return render(request, 'shops/fabrication_shop.html')

def cutting_bending_shop(request):
    return render(request, 'shops/cutting_bending_shop.html')

def cnc_shop(request):
    return render(request, 'shops/cnc_shop.html')

def paint_shop(request):
    return render(request, 'shops/paint_shop.html')

def measuring(request):
    return render(request, 'shops/measuring.html')

from django.http import JsonResponse
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)

def booked_slots(request):
    try:
        bookings = MeetingBooking.objects.filter(
            date__gte=timezone.now().date()
        ).order_by('date').values('date', 'time_slot')[:500]
        booking_dict = {}
        for b in bookings:
            date_str = b['date'].strftime('%Y-%m-%d')
            booking_dict.setdefault(date_str, []).append(b['time_slot'])
        return JsonResponse(booking_dict)
    except Exception as e:
        logger.error(f"booked_slots error: {e}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)

