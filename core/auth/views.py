from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .serializers import DeviceTokenObtainPairSerializer, UserRegistrationSerializer

class DeviceTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint de Autenticación de Élite.
    Recibe username, password y device_id. Genera el par JWT enlazado.
    """
    serializer_class = DeviceTokenObtainPairSerializer

class UserRegistrationView(CreateAPIView):
    """
    Endpoint for user registration.
    Allows creating a new user with a specified role.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
