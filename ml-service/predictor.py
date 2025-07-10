import pandas as pd
from sklearn.linear_model import LogisticRegression

# Sample training data (can later be replaced with real logs from MongoDB)
data = pd.DataFrame({
    'streak': [1, 2, 3, 0, 5, 6, 1, 0],
    'completed_yesterday': [1, 1, 1, 0, 1, 1, 0, 0],
    'success': [1, 1, 1, 0, 1, 1, 0, 0]
})

X = data[['streak', 'completed_yesterday']]
y = data['success']

model = LogisticRegression()
model.fit(X, y)

def predict_success(streak, completed_yesterday):
    features = pd.DataFrame([[streak, completed_yesterday]], columns=['streak', 'completed_yesterday'])
    prediction = model.predict_proba(features)[0][1]  # Probability of success
    return round(prediction * 100, 2)
