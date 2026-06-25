import random
import sys
import os
from datetime import date, datetime, time, timedelta
import bcrypt
from dotenv import load_dotenv

# Load backend .env explicitly
basedir = os.path.dirname(__file__)
load_dotenv(os.path.join(basedir, ".env"))

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
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


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
            )
            db.add(admin)

        clients = []
        client_data = [
            ("Miguel Costa", "miguel@app.com"),
            ("Ana Silva", "ana@app.com"),
            ("João Pereira", "joao@app.com"),
            ("Clara Sousa", "clara@app.com"),
            ("Rita Gomes", "rita@app.com"),
        ]
        for name, email in client_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    hashed_password=get_password_hash("senha123"),
                    role=RoleEnum.client,
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