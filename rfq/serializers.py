from rest_framework import serializers
from .models import Inquiry, InquiryFile, Quotation


class InquiryFileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InquiryFile
        fields = ['id', 'original_name', 'file_size', 'file', 'uploaded_at']


class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model        = Quotation
        fields       = ['id', 'unit_price', 'total_value', 'delivery_time',
                        'payment_terms', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_value', 'created_at', 'updated_at']


class InquiryListSerializer(serializers.ModelSerializer):
    has_quote = serializers.SerializerMethodField()

    class Meta:
        model  = Inquiry
        fields = ['id', 'ref_number', 'company_name', 'contact_person', 'email',
                  'product', 'quantity', 'status', 'created_at', 'has_quote']

    def get_has_quote(self, obj):
        return hasattr(obj, 'quotation')


class InquiryDetailSerializer(serializers.ModelSerializer):
    files     = InquiryFileSerializer(many=True, read_only=True)
    quotation = QuotationSerializer(read_only=True)

    class Meta:
        model  = Inquiry
        fields = ['id', 'ref_number', 'company_name', 'contact_person', 'phone', 'email',
                  'product', 'quantity', 'material', 'target_delivery', 'message',
                  'status', 'created_at', 'updated_at', 'files', 'quotation']


class InquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inquiry
        fields = ['company_name', 'contact_person', 'phone', 'email',
                  'product', 'quantity', 'material', 'target_delivery', 'message']
