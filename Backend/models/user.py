from sqlalchemy import Column, Integer, String, JSON
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    unlocked_grumpis = Column(JSON, default=[]) # IDs de los Grumpis
    favorite_grumpi_id = Column(Integer, nullable=True)
    last_pack_date = Column(String, nullable=True)
    total_steps = Column(Integer, default=0)
    battles_won = Column(Integer, default=0)
    battles_lost = Column(Integer, default=0)