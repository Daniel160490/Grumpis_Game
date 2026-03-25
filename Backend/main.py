from sqlalchemy.orm import Session
import schemas 
from database import engine, get_db, Base
from services import userServices
from models.user import User
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://grumpis-game.vercel.app",
    "https://grumpis-game-backend.vercel.app",
    "https://grumpis-game-76es3h3co-danigd71-8388s-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# ENDPOINT DE LOGIN
@app.post("/login")
def login(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = userServices.authenticate_user(db, user_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="ID de Entrenador o contraseña incorrectos"
        )
    
    return user

# ENDPOINT REGISTRO
@app.post("/register", response_model=schemas.UserOut) 
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = userServices.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El ID de Entrenador ya está en uso")
    return userServices.create_user(db, user)

# ENDPOINT OBTENER COLECCIÓN
@app.get("/user/collection/{username}", response_model=schemas.UserOut)
def get_collection(username: str, db: Session = Depends(get_db)):
    user = userServices.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# ENDPOINT AÑADIR FAVORITO
@app.post("/user/favorite")
def set_favorite(data: dict, db: Session = Depends(get_db)):
    success = userServices.update_favorite(db, data['username'], data['grumpi_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"status": "updated", "favorite_id": data['grumpi_id']}


# ENDPOINT AÑADIR CARTA GRUMPI 
@app.post("/user/add-grumpi")
def add_grumpi_to_user(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    grumpi_id = data.get("grumpi_id")
    
    user = userServices.open_pack(db, username, grumpi_id)
    
    if user == "wait":
        raise HTTPException(status_code=400, detail="Debes esperar 24h para abrir otro sobre")
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return user 


# ENDPOINT PARA OBTENER PASOS DEL USUARIO
@app.patch("/user/update-steps")
def update_steps(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    steps_to_add = data.get("steps")
    
    if not username or steps_to_add is None:
        raise HTTPException(status_code=400, detail="Faltan datos de sincronización")
        
    user = userServices.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Sumamos los pasos al total actual
    user.total_steps += steps_to_add
    
    # LÓGICA DE XP: Podríamos dar 1 XP por cada 100 pasos
    xp_gained = steps_to_add // 100
    user.xp += xp_gained
    
    db.commit()
    db.refresh(user)
    return {"status": "updated", "total_steps": user.total_steps, "xp": user.xp}

# ENDPOINT DE ESTADÍSTICAS DE COMBATE
@app.post("/update-battle-stats/{username}")
async def update_battle_stats(username: str, result: str, db: Session = Depends(get_db)):
    # Usamos User directamente porque ya está importado arriba
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if result == "win":
        user.battles_won += 1
        user.xp += 100 
    else:
        user.battles_lost += 1
        user.xp += 20 
        
    # Lógica de nivel
    xp_target = user.level * 1000
    if user.xp >= xp_target:
        user.level += 1
        user.xp -= xp_target

    db.commit()
    return {"status": "updated", "new_level": user.level}