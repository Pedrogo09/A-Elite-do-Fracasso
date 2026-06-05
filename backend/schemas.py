from datetime import date, time, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RoleEnum(str, Enum):
    admin = "admin"
    client = "client"


class StatusEnum(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    is_active: Optional[bool]
    role: Optional[RoleEnum]


class UserOut(UserBase):
    id: int
    role: RoleEnum
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: int
    exp: int
    type: str


class ServiceBase(BaseModel):
    name: str = Field(..., max_length=140)
    description: str = Field(..., max_length=500)
    duration_minutes: int
    price: float
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    duration_minutes: Optional[int]
    price: Optional[float]
    is_active: Optional[bool]


class ServiceOut(ServiceBase):
    id: int

    class Config:
        orm_mode = True


class AppointmentBase(BaseModel):
    service_id: int
    date: date
    time: time
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentStatusUpdate(BaseModel):
    status: StatusEnum


class AppointmentOut(BaseModel):
    id: int
    user: UserOut
    service: ServiceOut
    date: date
    time: time
    status: StatusEnum
    notes: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class StatsOverview(BaseModel):
    total_users: int
    total_appointments: int
    total_revenue: float
    appointments_today: int


class DailyCount(BaseModel):
    date: date
    count: int


class ServicePopularity(BaseModel):
    service_name: str
    count: int


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float


class AppointmentsByStatus(BaseModel):
    pending: int
    confirmed: int
    cancelled: int
    completed: int
