from django.db import models
import uuid, random, string, datetime


def generate_ref():
    ts = datetime.datetime.now().strftime('%y%m%d')
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'RFQ-{ts}-{suffix}'


class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('New',      'New'),
        ('Quoted',   'Quoted'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ref_number   = models.CharField(max_length=30, unique=True, editable=False)

    # Customer
    company_name   = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=150)
    phone          = models.CharField(max_length=30)
    email          = models.EmailField()

    # Product
    product         = models.CharField(max_length=200)
    quantity        = models.PositiveIntegerField()
    material        = models.CharField(max_length=100, blank=True)
    target_delivery = models.DateField(null=True, blank=True)
    message         = models.TextField(blank=True)

    # Workflow
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'inquiries'
        ordering  = ['-created_at']
        indexes   = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['company_name']),
        ]

    def save(self, *args, **kwargs):
        if not self.ref_number:
            self.ref_number = generate_ref()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.ref_number} – {self.company_name}'


class InquiryFile(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inquiry       = models.ForeignKey(Inquiry, on_delete=models.CASCADE, related_name='files')
    file          = models.FileField(upload_to='inquiry_files/%Y/%m/')
    original_name = models.CharField(max_length=255)
    file_size     = models.PositiveBigIntegerField()
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inquiry_files'

    def __str__(self):
        return self.original_name


class Quotation(models.Model):
    TERMS_CHOICES = [
        ('50% Advance, 50% on Dispatch', '50% Advance, 50% on Dispatch'),
        ('100% Advance',                 '100% Advance'),
        ('30 Days Credit',               '30 Days Credit'),
        ('60 Days Credit',               '60 Days Credit'),
        ('LC at Sight',                  'LC at Sight'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inquiry       = models.OneToOneField(Inquiry, on_delete=models.CASCADE, related_name='quotation')
    unit_price    = models.DecimalField(max_digits=12, decimal_places=2)
    total_value   = models.DecimalField(max_digits=16, decimal_places=2, editable=False)
    delivery_time = models.CharField(max_length=100, blank=True)
    payment_terms = models.CharField(max_length=60, choices=TERMS_CHOICES,
                                     default='50% Advance, 50% on Dispatch')
    notes         = models.TextField(blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quotations'

    def save(self, *args, **kwargs):
        self.total_value = self.unit_price * self.inquiry.quantity
        super().save(*args, **kwargs)
        # Auto-advance status New → Quoted
        if self.inquiry.status == 'New':
            Inquiry.objects.filter(pk=self.inquiry.pk).update(status='Quoted')
            self.inquiry.status = 'Quoted'

    def __str__(self):
        return f'Quote for {self.inquiry.ref_number} — ₹{self.total_value}'
