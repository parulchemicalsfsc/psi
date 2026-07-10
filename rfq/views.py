import csv
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.db.models import Q, Count
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination

from .models import Inquiry, InquiryFile, Quotation
from .serializers import (
    InquiryListSerializer, InquiryDetailSerializer,
    InquiryCreateSerializer, QuotationSerializer,
)

_executor = ThreadPoolExecutor(max_workers=2)

class SmallPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


# ── CSRF TOKEN ENDPOINT ───────────────────────────────────────────────────────
@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf(request):
    return Response({'csrfToken': get_token(request)})


# ── AUTH ──────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    user = authenticate(request, username=username, password=password)
    if user and user.is_staff:
        login(request, user)
        return Response({'message': 'Login successful', 'username': user.username})
    return Response({'error': 'Invalid credentials or insufficient permissions.'},
                    status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def admin_logout(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status(request):
    return Response({
        'authenticated': request.user.is_authenticated and request.user.is_staff,
        'username': request.user.username if request.user.is_authenticated else None,
    })


_executor = ThreadPoolExecutor(max_workers=2)


# ── CUSTOMER: SUBMIT INQUIRY ──────────────────────────────────────────────────
import urllib.request
import json

def post_lead_to_pipeline(inquiry):
    import os
    url = "https://pc-sales-8phu.onrender.com/api/leads/intake"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": os.environ.get("LEAD_API_KEY", "PCSALES")
    }
    payload = {
        "source_website": "press_stamping_industries",
        "full_name": inquiry.contact_person,
        "email": inquiry.email,
        "phone": inquiry.phone,
        "company_name": inquiry.company_name,
        "product_interest": inquiry.product,
        "message": inquiry.message
    }
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = response.read().decode('utf-8')
            print("Lead Ingestion Success:", res_data)
    except Exception as e:
        print("Lead Ingestion Error:", e)

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def submit_inquiry(request):
    try:
        serializer = InquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        inquiry = serializer.save()

        for f in request.FILES.getlist('files'):
            InquiryFile.objects.create(
                inquiry=inquiry,
                file=f,
                original_name=f.name,
                file_size=f.size,
            )

        # Forward lead to Parul Chemicals pipeline - FIRE AND FORGET
        _executor.submit(post_lead_to_pipeline, inquiry)

        return Response({
            'message': 'Your inquiry has been submitted successfully.',
            'ref_number': inquiry.ref_number,
            'id': str(inquiry.id),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        import traceback
        print("=== RFQ SUBMISSION ERROR ===")
        traceback.print_exc()
        return Response({
            'errors': {'server': [str(e)]}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── ADMIN: INQUIRY LIST ───────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inquiry_list(request):
    qs = Inquiry.objects.select_related('quotation').all()

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(
            Q(company_name__icontains=search) |
            Q(product__icontains=search)      |
            Q(contact_person__icontains=search)|
            Q(ref_number__icontains=search)
        )

    fs = request.query_params.get('status', '')
    if fs:
        qs = qs.filter(status=fs)

    sort = request.query_params.get('sort', '-created_at')
    if sort in ['created_at', '-created_at', 'company_name', '-company_name']:
        qs = qs.order_by(sort)

    paginator = SmallPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(InquiryListSerializer(page, many=True).data)


# ── ADMIN: INQUIRY DETAIL ─────────────────────────────────────────────────────
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def inquiry_detail(request, pk):
    try:
        inq = Inquiry.objects.prefetch_related('files').select_related('quotation').get(pk=pk)
    except Inquiry.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(InquiryDetailSerializer(inq).data)
    inq.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── ADMIN: UPDATE STATUS ──────────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_status(request, pk):
    try:
        inq = Inquiry.objects.get(pk=pk)
    except Inquiry.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in dict(Inquiry.STATUS_CHOICES):
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

    inq.status = new_status
    inq.save(update_fields=['status', 'updated_at'])
    return Response({'message': f'Status updated to {new_status}', 'status': new_status})


# ── ADMIN: QUOTATION CREATE / UPDATE ─────────────────────────────────────────
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_quotation(request, pk):
    try:
        inq = Inquiry.objects.get(pk=pk)
    except Inquiry.DoesNotExist:
        return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        quote = inq.quotation
        serializer = QuotationSerializer(quote, data=request.data, partial=True)
    except Quotation.DoesNotExist:
        serializer = QuotationSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    quote = serializer.save(inquiry=inq)
    return Response(QuotationSerializer(quote).data, status=status.HTTP_200_OK)


# ── ADMIN: DASHBOARD ──────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    by_status = dict(
        Inquiry.objects.values_list('status').annotate(c=Count('id')).values_list('status', 'c')
    )
    recent = Inquiry.objects.select_related('quotation').order_by('-created_at')[:5]
    return Response({
        'total_inquiries': Inquiry.objects.count(),
        'total_quoted':    by_status.get('Quoted',   0),
        'total_approved':  by_status.get('Approved', 0),
        'total_new':       by_status.get('New',      0),
        'total_rejected':  by_status.get('Rejected', 0),
        'by_status':       by_status,
        'recent_inquiries': InquiryListSerializer(recent, many=True).data,
    })


# ── ADMIN: EXPORT CSV ─────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_csv(request):
    qs = Inquiry.objects.select_related('quotation').order_by('-created_at')

    search = request.query_params.get('search', '')
    if search:
        qs = qs.filter(Q(company_name__icontains=search) | Q(product__icontains=search))
    fs = request.query_params.get('status', '')
    if fs:
        qs = qs.filter(status=fs)

    fname = f"PressForge_RFQ_{timezone.now().strftime('%Y%m%d_%H%M')}.csv"
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{fname}"'
    response.write('\ufeff')

    w = csv.writer(response)
    w.writerow([
        'Ref Number', 'Company', 'Contact', 'Phone', 'Email',
        'Product', 'Quantity', 'Material', 'Target Delivery', 'Status', 'Submitted At',
        'Unit Price (INR)', 'Total Value (INR)', 'Delivery Time', 'Payment Terms', 'Notes',
    ])
    for i in qs:
        q = getattr(i, 'quotation', None)
        w.writerow([
            i.ref_number, i.company_name, i.contact_person, i.phone, i.email,
            i.product, i.quantity, i.material, i.target_delivery or '',
            i.status, i.created_at.strftime('%d %b %Y %H:%M'),
            q.unit_price if q else '', q.total_value if q else '',
            q.delivery_time if q else '', q.payment_terms if q else '', q.notes if q else '',
        ])
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def forward_lead(request):
    import urllib.request
    import json
    import os
    
    url = "https://pc-sales-8phu.onrender.com/api/leads/intake"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": os.environ.get("LEAD_API_KEY", "PCSALES")
    }
    
    try:
        payload = request.data
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = response.read().decode('utf-8')
            return JsonResponse(json.loads(res_data), status=200)
    except Exception as e:
        print("LMS Forwarding Proxy Error:", e)
        return JsonResponse({"error": str(e)}, status=500)
