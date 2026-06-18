from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

import sys
if getattr(sys, 'frozen', False):
    basedir = os.path.dirname(sys.executable)
else:
    basedir = os.path.dirname(__file__)
load_dotenv(os.path.join(basedir, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# If using a relative sqlite path, convert it to an absolute path under the backend folder
if DATABASE_URL.startswith("sqlite:///"):
    _path = DATABASE_URL.replace("sqlite:///", "", 1)
    if _path.startswith("."):
        # remove leading ./ or .\
        _path = _path.lstrip("./\\")
        _abs = os.path.abspath(os.path.join(basedir, _path))
    else:
        _abs = os.path.abspath(_path)
    # ensure forward slashes for sqlite URL
    _abs_url_path = _abs.replace("\\", "/")
    DATABASE_URL = f"sqlite:///{_abs_url_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
