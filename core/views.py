from django.shortcuts import render, redirect
from django.contrib import messages
from .models import BlogPost, GalleryItem, ContactSubmission, MeetingBooking, QuoteRequest, JobApplication

import os
import pandas as pd
from django.conf import settings

def home(request):
    posts = BlogPost.objects.filter(is_published=True)[:3]
    
    # Read clients from Excel
    clients = []
    excel_path = getattr(settings, 'EXCEL_PATH', os.path.join(settings.BASE_DIR, 'static', 'images', 'updated client list.xlsx'))
    try:
        if os.path.exists(excel_path):
            df = pd.read_excel(excel_path)
            # Find columns
            client_col = next((col for col in df.columns if 'client' in col.lower()), df.columns[1])
            since_col = next((col for col in df.columns if 'since' in col.lower()), df.columns[3])
            ind_col = next((col for col in df.columns if 'ind' in col.lower()), df.columns[4])
            
            # Create list of dicts
            for _, row in df.iterrows():
                name = str(row[client_col])
                clients.append({
                    'name': name,
                    'short': "".join([w[0] for w in name.split() if w[0].isupper()]) or name[:2].upper(),
                    'industry': row[ind_col],
                    'since': row[since_col]
                })
    except Exception as e:
        print(f"Error reading excel: {e}")
        
    return render(request, 'index.html', {
        'posts': posts,
        'clients': clients # Pass all clients
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
        
        JobApplication.objects.create(
            full_name=full_name,
            email=email,
            phone=phone,
            position=position,
            resume=resume,
            message=message
        )
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
        
        ContactSubmission.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            company=company,
            subject=subject,
            message=message
        )
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
        messages.success(request, "Quote request submitted! Our engineering team will review and contact you.")
        return redirect('quote')
        
    return render(request, 'quote.html')

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
        messages.success(request, f"Meeting confirmed for {date_str} at {time_str} ({timezone}). Check your email for details.")
        return redirect('contact')
    return redirect('contact')
