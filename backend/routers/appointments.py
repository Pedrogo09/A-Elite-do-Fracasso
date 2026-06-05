from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import schemas, models, database
from ..auth.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/my", response_model=List[schemas.AppointmentOut])
def get_my_appointments(current_user: models.User = Depends(get_current_active_user), db: Session = Depends(database.get_db)):
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.user_id == current_user.id)
        .order_by(models.Appointment.date.desc(), models.Appointment.time.desc())
        .all()
    )


@router.post("", response_model=schemas.AppointmentOut)
def create_appointment(data: schemas.AppointmentCreate, current_user: models.User = Depends(get_current_active_user), db: Session = Depends(database.get_db)):
    service = db.query(models.Service).filter(models.Service.id == data.service_id, models.Service.is_active == True).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serviço inválido ou inativo")
    appointment = models.Appointment(
        user_id=current_user.id,
        service_id=data.service_id,
        date=data.date,
        time=data.time,
        notes=data.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}/cancel")
def cancel_appointment(appointment_id: int, current_user: models.User = Depends(get_current_active_user), db: Session = Depends(database.get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marcaçao não encontrada")
    if appointment.user_id != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
    appointment.status = models.StatusEnum.cancelled
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("", response_model=List[schemas.AppointmentOut], dependencies=[Depends(get_current_admin_user)])
def list_appointments(
    date_filter: Optional[date] = Query(None),
    status: Optional[models.StatusEnum] = Query(None),
    user_id: Optional[int] = Query(None),
    service_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(database.get_db),
):
    query = db.query(models.Appointment)
    if date_filter:
        query = query.filter(models.Appointment.date == date_filter)
    if status:
        query = query.filter(models.Appointment.status == status)
    if user_id:
        query = query.filter(models.Appointment.user_id == user_id)
    if service_id:
        query = query.filter(models.Appointment.service_id == service_id)
    return query.order_by(models.Appointment.date.desc(), models.Appointment.time.desc()).offset(skip).limit(limit).all()


@router.patch("/{appointment_id}/status", response_model=schemas.AppointmentOut, dependencies=[Depends(get_current_admin_user)])
def update_appointment_status(appointment_id: int, data: schemas.AppointmentStatusUpdate, db: Session = Depends(database.get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marcaçao não encontrada")
    appointment.status = data.status
    db.commit()
    db.refresh(appointment)
    return appointment
