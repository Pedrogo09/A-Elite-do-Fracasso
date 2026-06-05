from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..auth.dependencies import get_current_admin_user

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=list[schemas.ServiceOut])
def list_services(db: Session = Depends(database.get_db)):
    services = db.query(models.Service).filter(models.Service.is_active == True).order_by(models.Service.name).all()
    return services


@router.post("/", response_model=schemas.ServiceOut, dependencies=[Depends(get_current_admin_user)])
def create_service(data: schemas.ServiceCreate, db: Session = Depends(database.get_db)):
    service = models.Service(**data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=schemas.ServiceOut, dependencies=[Depends(get_current_admin_user)])
def update_service(service_id: int, data: schemas.ServiceUpdate, db: Session = Depends(database.get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", dependencies=[Depends(get_current_admin_user)])
def delete_service(service_id: int, db: Session = Depends(database.get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    db.delete(service)
    db.commit()
    return {"detail": "Serviço eliminado"}
