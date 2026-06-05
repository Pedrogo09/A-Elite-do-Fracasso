from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import schemas, models, database
from ..auth.dependencies import get_current_admin_user

router = APIRouter(prefix="/stats", tags=["stats"], dependencies=[Depends(get_current_admin_user)])


@router.get("/overview", response_model=schemas.StatsOverview)
def get_overview(db: Session = Depends(database.get_db)):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_appointments = db.query(func.count(models.Appointment.id)).scalar() or 0
    total_revenue = (
        db.query(func.sum(models.Service.price))
        .join(models.Appointment, models.Appointment.service_id == models.Service.id)
        .scalar()
        or 0.0
    )
    today = date.today()
    appointments_today = (
        db.query(func.count(models.Appointment.id))
        .filter(models.Appointment.date == today)
        .scalar()
        or 0
    )
    return {
        "total_users": total_users,
        "total_appointments": total_appointments,
        "total_revenue": float(total_revenue),
        "appointments_today": appointments_today,
    }


@router.get("/appointments-per-day", response_model=List[schemas.DailyCount])
def get_appointments_per_day(days: int = Query(30, ge=1, le=365), db: Session = Depends(database.get_db)):
    cutoff = date.today() - timedelta(days=days - 1)
    results = (
        db.query(models.Appointment.date, func.count(models.Appointment.id).label("count"))
        .filter(models.Appointment.date >= cutoff)
        .group_by(models.Appointment.date)
        .order_by(models.Appointment.date)
        .all()
    )
    return [{"date": r[0], "count": r[1]} for r in results]


@router.get("/service-popularity", response_model=List[schemas.ServicePopularity])
def get_service_popularity(db: Session = Depends(database.get_db)):
    results = (
        db.query(models.Service.name.label("service_name"), func.count(models.Appointment.id).label("count"))
        .join(models.Appointment, models.Appointment.service_id == models.Service.id)
        .group_by(models.Service.name)
        .order_by(func.count(models.Appointment.id).desc())
        .all()
    )
    return [{"service_name": r[0], "count": r[1]} for r in results]


@router.get("/revenue-per-month", response_model=List[schemas.MonthlyRevenue])
def get_revenue_per_month(months: int = Query(6, ge=1, le=24), db: Session = Depends(database.get_db)):
    today = date.today()
    cutoff = today - timedelta(days=(months * 30))
    results = (
        db.query(
            func.strftime("%Y-%m", models.Appointment.date).label("month"),
            func.coalesce(func.sum(models.Service.price), 0).label("revenue"),
        )
        .join(models.Service, models.Appointment.service_id == models.Service.id)
        .filter(models.Appointment.date >= cutoff)
        .group_by(func.strftime("%Y-%m", models.Appointment.date))
        .order_by(func.strftime("%Y-%m", models.Appointment.date))
        .all()
    )
    return [{"month": r[0], "revenue": float(r[1])} for r in results]


@router.get("/appointments-by-status", response_model=schemas.AppointmentsByStatus)
def get_appointments_by_status(db: Session = Depends(database.get_db)):
    counts = {s.value: 0 for s in models.StatusEnum}
    results = (
        db.query(models.Appointment.status, func.count(models.Appointment.id))
        .group_by(models.Appointment.status)
        .all()
    )
    for status_value, count in results:
        counts[status_value.value] = count
    return counts
