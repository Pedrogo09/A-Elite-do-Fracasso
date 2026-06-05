from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas, database
from ..auth.dependencies import get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(get_current_admin_user)])


@router.get("/", response_model=list[schemas.UserOut])
def list_users(
    db: Session = Depends(database.get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    role: Optional[models.RoleEnum] = Query(None),
):
    query = db.query(models.User)
    if search:
        query = query.filter(
            models.User.name.ilike(f"%{search}%") |
            models.User.email.ilike(f"%{search}%")
        )
    if role:
        query = query.filter(models.User.role == role)
    users = query.order_by(models.User.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return users


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    return user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    db.delete(user)
    db.commit()
    return {"detail": "Utilizador eliminado"}


@router.patch("/{user_id}/toggle-active", response_model=schemas.UserOut)
def toggle_active(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
