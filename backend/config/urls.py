from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('upload/', views.upload_certificate),
    path('preview-render/', views.preview_render),
    path('delete/<int:pk>/<str:user>/', views.delete_certificate),
    path('list/<str:user>/', views.user_certificate_list),
    path('certificate/', views.certificate_list),
    path('certificate/<int:pk>/preview/', views.certificate_preview),
    path('certificate/<int:pk>/info/', views.certificate_info),
    path('certificate/<int:pk>/details/<str:roll_no>/', views.certificate_details),
    path('certificate/<int:pk>/generate/<str:roll_no>/', views.generate_certificate),
    path('certificate/<int:pk>/generate/<str:roll_no>/<str:mode>/', views.generate_certificate),
    path('certificate/<int:pk>/csv/<str:user>/', views.download_csv),
    path('templates/<str:user>/', views.user_templates),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
