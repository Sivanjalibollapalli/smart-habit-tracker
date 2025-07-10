from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.linear_model import LogisticRegression
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = LogisticRegression()
model.classes_ = np.array([0, 1])
model.coef_ = np.array([[0.5, 1.2]])
model.intercept_ = np.array([-2])

class HabitInput(BaseModel):
    streak: int
    targetDays: int

@app.post("/predict")
def predict_success(habit: HabitInput):
    X = np.array([[habit.streak, habit.targetDays]])
    prob = model.predict_proba(X)[0][1]
    return { "success_probability": round(prob * 100, 2) }
