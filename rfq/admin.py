from django.contrib import admin
from .models import Inquiry, InquiryFile, Quotation

class InquiryFileInline(admin.TabularInline):
    model = InquiryFile
    extra = 0
    readonly_fields = ['original_name', 'file_size', 'uploaded_at']

class QuotationInline(admin.StackedInline):
    model = Quotation
    extra = 0
    readonly_fields = ['total_value', 'created_at', 'updated_at']

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display  = ['ref_number', 'company_name', 'product', 'quantity', 'status', 'created_at']
    list_filter   = ['status', 'created_at']
    search_fields = ['company_name', 'product', 'ref_number', 'email']
    readonly_fields = ['ref_number', 'created_at', 'updated_at']
    inlines = [QuotationInline, InquiryFileInline]

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display    = ['inquiry', 'unit_price', 'total_value', 'payment_terms', 'created_at']
    readonly_fields = ['total_value', 'created_at', 'updated_at']

@admin.register(InquiryFile)
class InquiryFileAdmin(admin.ModelAdmin):
    list_display    = ['original_name', 'inquiry', 'file_size', 'uploaded_at']
    readonly_fields = ['uploaded_at']
