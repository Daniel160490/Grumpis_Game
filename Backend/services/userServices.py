from sqlalchemy.orm import Session
from models.user import User
from passlib.context import CryptContext
import random
import schemas
from datetime import datetime, timedelta


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FUNCIÓN PARA VERIFICAR CREDENCIALES (LOGIN)
def authenticate_user(db: Session, user_data: schemas.UserCreate):
    # Buscamos al usuario
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user:
        return False
    
    # Verificamos la contraseña (compara el texto plano con el hash de la DB)
    if not pwd_context.verify(user_data.password, user.hashed_password):
        return False
        
    return user
    
#FUNCIÓN PARA OBTENER USUARIO POR NOMBRE
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# FUNCIÓN PARA CREAR UN NUEVO USUARIO
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    
    starter_ids = random.sample(range(1, 161), 3)
    
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        unlocked_grumpis=starter_ids
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# FUNCIÓN PARA OBTENER LA COLECCIÓN DE CARTAS DEL USUARIO
def get_user_collection(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user.unlocked_grumpis # Devuelve la lista de IDs [12, 45, 89]
    return []

# FUNCIÓN PARA ACTUALIZAR CARTA FAVORITA
def update_favorite(db: Session, username: str, grumpi_id: int):
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.favorite_grumpi_id = grumpi_id
        db.commit()
        return True
    return False

# FUNCIÓN PARA COMPROBAR TIEMPO PARA ABRIR SOBRES NUEVOS
def open_pack(db: Session, username: str, grumpi_id: int):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
        
    current_list = list(user.unlocked_grumpis)
    if grumpi_id not in current_list:
        current_list.append(grumpi_id)
        user.unlocked_grumpis = current_list
    
    user.last_pack_date = datetime.now().isoformat()
    
    db.commit()
    db.refresh(user)
    return user

# 
def add_steps_and_xp(db: Session, username: str, steps: int):
    user = db.query(User).filter(User.username == username).first()
    if not user: return None

    # 1. Sumar pasos
    user.total_steps += steps

    # 2. Ganar XP (Ejemplo: 1 paso = 1 XP)
    user.xp += steps

    # 3. Lógica de Level Up
    # Si XP actual >= Nivel * 1000, sube de nivel
    xp_needed = user.level * 1000
    
    while user.xp >= xp_needed:
        user.level += 1
        user.xp -= xp_needed 
        xp_needed = user.level * 1000
        print(f"¡{username} ha subido al nivel {user.level}!")

    db.commit()
    db.refresh(user)
    return user