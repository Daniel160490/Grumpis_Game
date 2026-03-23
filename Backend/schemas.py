from pydantic import BaseModel, Field
from typing import List, Optional

# Lo que el usuario ENVÍA para registrarse o loguearse
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Lo que el servidor DEVUELVE al Frontend (Nunca devolvemos la contraseña)
class UserOut(UserBase):
    id: int
    level: int
    xp: int
    unlocked_grumpis: List[int]
    favorite_grumpi_id: Optional[int] = None
    last_pack_date: Optional[str] = None
    total_steps: int
    battles_won: int
    battles_lost: int

    class Config:
        from_attributes = True # Permite a Pydantic leer modelos de SQLAlchemy