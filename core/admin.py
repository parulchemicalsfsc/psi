from django.contrib import admin
from .models import BlogPost, GalleryItem, ContactSubmission, QuoteRequest, JobApplication, MeetingBooking

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at', 'author', 'is_published')
    list_filter = ('category', 'created_at', 'is_published')
    search_fields = ('title', 'content')

@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category')
    list_filter = ('category',)

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'company', 'subject', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ('company', 'full_name', 'project_description', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'position', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(MeetingBooking)
class MeetingBookingAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company', 'date', 'time_slot', 'created_at')
    readonly_fields = ('created_at',)
