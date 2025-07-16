# import pandas as pd
# from sklearn.linear_model import LogisticRegression

# # Sample training data
# train_data = pd.DataFrame({
#     'streak': [1, 2, 3, 0, 5, 6, 1, 0],
#     'completed_yesterday': [1, 1, 1, 0, 1, 1, 0, 0],
#     'success': [1, 1, 1, 0, 1, 1, 0, 0]
# })

# X = train_data[['streak', 'completed_yesterday']]
# y = train_data['success']

# model = LogisticRegression()
# model.fit(X, y)

# def predict_success(streak, completed_yesterday):
#     features = pd.DataFrame([[streak, completed_yesterday]], columns=['streak', 'completed_yesterday'])
#     prediction = model.predict_proba(features)[0][1]  # Probability of success
#     return round(prediction * 100, 2)

# def analyze_habit(habit_data):
#     streak = habit_data.get("streak", 0)
#     target = habit_data.get("targetDays", 0)
#     completions = habit_data.get("completions", [])

#     tips = []

#     if streak < 3 and target > 5:
#         tips.append("Try breaking your habit goal into smaller chunks.")
#     if len(completions) > 5 and sum(completions[-3:]) == 0:
#         tips.append("You missed a few days. Set reminders to stay consistent!")
#     if streak >= target:
#         tips.append("Great job! Consider increasing your goal or starting a new habit.")
#     if len(completions) >= 3 and completions[-3:] == [0, 0, 0]:
#         tips.append("You've missed 3 days in a row! Try setting a recovery challenge.")


#     return {
#         "success_chance": predict_success(streak, 1 if streak > 0 else 0),
#         "suggestions": tips
#     }
import pandas as pd
import joblib
import os

# Load the trained logistic regression model from .pkl
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'habit_success_model.pkl')

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    raise Exception(f"Model file not found at {MODEL_PATH}. Train the model first.")

# Function to return success percentage from model
def predict_success(streak, targetDays):
    # Prepare input as DataFrame
    features = pd.DataFrame([[streak, targetDays]], columns=['streak', 'targetDays'])
    
    # Predict probability for class 1 (success)
    prediction = model.predict_proba(features)[0][1]
    
    # Return as percentage (rounded)
    return round(prediction * 100, 2)

# Main analysis function: returns both prediction and improvement tips
def analyze_habit(habit_data):
    streak = habit_data.get("streak", 0)
    target = habit_data.get("targetDays", 0)
    completions = habit_data.get("completions", [])  # optional: recent completion logs

    tips = []

    # Simple rules to generate habit improvement suggestions
    if streak < 3 and target > 5:
        tips.append("Try breaking your habit goal into smaller chunks.")
    if len(completions) > 5 and sum(completions[-3:]) == 0:
        tips.append("You missed a few days. Set reminders to stay consistent!")
    if streak >= target:
        tips.append("Great job! Consider increasing your goal or starting a new habit.")
    if len(completions) >= 3 and completions[-3:] == [0, 0, 0]:
        tips.append("You've missed 3 days in a row! Try setting a recovery challenge.")

    return {
        "success_chance": predict_success(streak, target),
        "suggestions": tips
    }