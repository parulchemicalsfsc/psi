from django.db import models

class BlogPost(models.Model):
    CATEGORY_CHOICES = [
        ('Technical', 'Technical'),
        ('Industry', 'Industry'),
        ('Design Guide', 'Design Guide'),
        ('Quality', 'Quality'),
        ('Materials', 'Materials'),
        ('Sustainability', 'Sustainability'),
    ]
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.CharField(max_length=100, default="PSI Team")
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    read_time = models.CharField(max_length=50, default="5 min read")
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class GalleryItem(models.Model):
    CATEGORY_CHOICES = [
        ('company-components', 'Company Components'),
        ('kirloskar', 'Kirloskar Projects'),
        ('machine', 'Machines'),
    ]
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='gallery/')
    is_wide = models.BooleanField(default=False)
    is_tall = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.category})"

class ContactSubmission(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    company = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.subject}"

class QuoteRequest(models.Model):
    full_name = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    industry = models.CharField(max_length=100, blank=True)
    project_description = models.TextField()
    estimated_volume = models.CharField(max_length=100, blank=True)
    blueprints = models.FileField(upload_to='quotes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quote for {self.company} - {self.full_name}"

class JobApplication(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    position = models.CharField(max_length=100)
    message = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.position}"

class MeetingBooking(models.Model):
    full_name = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    purpose = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    date = models.DateField()
    time_slot = models.CharField(max_length=50)
    timezone = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meeting with {self.full_name} on {self.date}"
