from django.urls import path
from webs import views

urlpatterns = [
    path('asset/', views.AssetView.as_view()),
    path('asset-json/', views.AssetJsonView.as_view()),
    #
    # path('disk/', views.DiskView.as_view()),
    # path('disk-json/', views.DiskJsonView.as_view()),

    # path('asset-delete/', views.delete, name='delete'),

    path('asset-delete/', views.DeleteView.as_view()),

]
