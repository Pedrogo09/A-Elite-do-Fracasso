import random
import sys
import os
from datetime import date, datetime, time, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load backend .env explicitly
basedir = os.path.dirname(__file__)
load_dotenv(os.path.join(basedir, ".env"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Flexible imports: support running as a module (python -m backend.seed)
try:
    # when executed as package module
    from .database import engine, SessionLocal
    from .models import Base, User, Service, Appointment, RoleEnum, StatusEnum
except Exception:
    # when executed as a script (python seed.py)
    from database import engine, SessionLocal
    from models import Base, User, Service, Appointment, RoleEnum, StatusEnum


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@app.com").first()
        if not admin:
            admin = User(
                name="Administrador",
                email="admin@app.com",
                hashed_password=get_password_hash("admin123"),
                role=RoleEnum.admin,
                phone="+351912345678",
            )
            db.add(admin)

        clients = []
        client_data = [
            ("Miguel Costa", "miguel@app.com", "+351911111111"),
            ("Ana Silva", "ana@app.com", "+351922222222"),
            ("João Pereira", "joao@app.com", "+351933333333"),
            ("Clara Sousa", "clara@app.com", "+351944444444"),
            ("Rita Gomes", "rita@app.com", "+351955555555"),
        ]
        for name, email, phone in client_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    hashed_password=get_password_hash("senha123"),
                    role=RoleEnum.client,
                    phone=phone,
                )
                db.add(user)
            clients.append(user)

        services = []
        service_data = [
            ("Corte de Cabelo", "Corte feminino ou masculino com finalização.", 45, 25.0),
            ("Barba", "Barbearia completa com modelagem.", 30, 18.0),
            ("Massagem", "Massagem relaxante de 45 minutos.", 45, 40.0),
            ("Tratamento Facial", "Limpeza e hidratação de pele.", 60, 50.0),
        ]
        for name, desc, duration, price in service_data:
            service = db.query(Service).filter(Service.name == name).first()
            if not service:
                service = Service(
                    name=name,
                    description=desc,
                    duration_minutes=duration,
                    price=price,
                    is_active=True,
                )
                db.add(service)
            services.append(service)

        db.commit()

        clients = db.query(User).filter(User.role == RoleEnum.client).all()
        services = db.query(Service).all()
        if not db.query(Appointment).first():
            start_date = date.today() - timedelta(days=30)
            statuses = [StatusEnum.pending, StatusEnum.confirmed, StatusEnum.cancelled, StatusEnum.completed]
            for i in range(20):
                created = datetime.combine(start_date + timedelta(days=i % 30), time(hour=9 + (i % 8)))
                appointment = Appointment(
                    user_id=random.choice(clients).id,
                    service_id=random.choice(services).id,
                    date=(start_date + timedelta(days=i % 30)),
                    time=time(hour=9 + (i % 8), minute=0),
                    status=random.choices(statuses, weights=[3, 4, 1, 2], k=1)[0],
                    notes="Consulta de rotina" if i % 3 == 0 else None,
                    created_at=created,
                )
                db.add(appointment)
            db.commit()
        print("Seed data inserida com sucesso")
    finally:
        db.close()


if __name__ == "__main__":
    create_data()