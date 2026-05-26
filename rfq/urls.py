from django.urls import path
from . import views

urlpatterns = [
    path('csrf/',                               views.get_csrf,         name='csrf'),
    path('auth/login/',                         views.admin_login,      name='login'),
    path('auth/logout/',                        views.admin_logout,     name='logout'),
    path('auth/status/',                        views.auth_status,      name='auth-status'),
    path('inquiries/submit/',                   views.submit_inquiry,   name='submit'),
    path('leads/forward/',                      views.forward_lead,     name='forward-lead'),
    path('inquiries/',                          views.inquiry_list,     name='list'),
    path('inquiries/<uuid:pk>/',                views.inquiry_detail,   name='detail'),
    path('inquiries/<uuid:pk>/status/',         views.update_status,    name='status'),
    path('inquiries/<uuid:pk>/quotation/',      views.manage_quotation, name='quotation'),
    path('dashboard/',                          views.dashboard_stats,  name='dashboard'),
    path('export/csv/',                         views.export_csv,       name='export'),
]
