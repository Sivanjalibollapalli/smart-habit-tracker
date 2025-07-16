import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

# Load data (must contain: streak, targetDays, success)
import os
csv_path = os.path.join(os.path.dirname(__file__), "habit_success_data_extended.csv")
df = pd.read_csv(csv_path)

# Features and label
X = df[['streak', 'targetDays']]
y = df['success']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train logistic regression model
model = LogisticRegression()
model.fit(X_train, y_train)

# Predict success probabilities
probabilities = model.predict_proba(X_test)[:, 1]  # Probability of success (label = 1)

# Show results with percentage
results = X_test.copy()
results['SuccessProbability(%)'] = (probabilities * 100).round(2)
# Save trained model
joblib.dump(model, "habit_success_model.pkl")