from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User

class DeviceTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Serializer que exige y embebe un 'device_id' en el payload
    del token para prevenir robo de credenciales y spoofing.
    """
    device_id = serializers.CharField(
        required=True,
        write_only=True,
        help_text="Identificador único del dispositivo móvil (IMEI, UUID, etc.)",
    )

    def validate(self, attrs):
        device_id = attrs.get("device_id")
        
        # Validación base de Django (usuario y contraseña)
        data = super().validate(attrs)

        # self.user es inyectado por super().validate()
        # Inyectamos el device_id en el payload del token (Access y Refresh)
        refresh = self.get_token(self.user)
        refresh["device_id"] = device_id
        
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        # Opcional: devolvemos el device_id en la respuesta para confirmación del cliente
        data["device_id"] = device_id
        
        # Validación de roles para el Frontend
        data["is_staff"] = self.user.is_staff
        data["is_superuser"] = self.user.is_superuser
        # El script init_db.py guarda el rol ('Supervisor', 'Reponedor') en el campo last_name
        data["role"] = self.user.last_name
        data["username"] = self.user.username
        data["first_name"] = self.user.first_name

        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[("Supervisor", "Supervisor"), ("Reponedor", "Reponedor")],
        write_only=True,
        required=True
    )
    first_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ("username", "password", "first_name", "role")

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=role  # Convention: use last_name to store role
        )
        return user
