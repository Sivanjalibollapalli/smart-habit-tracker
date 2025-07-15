# recommend.py

import sys
import json
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# A sample database of habits (expand this later or load from MongoDB)
habit_db = [
    "Read a book for 20 minutes",
    "Meditate for 10 minutes",
    "Workout for 30 minutes",
    "Drink 8 glasses of water",
    "Learn a new programming concept",
    "Write a journal entry",
    "Practice gratitude",
    "Sleep before 11 PM"
]

def recommend_habit(user_habits):
    if not user_habits:
        return random.choice(habit_db)
    
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(habit_db + user_habits)

    # Get similarity of each db habit vs user habits
    sim_matrix = cosine_similarity(vectors[-len(user_habits):], vectors[:-len(user_habits)])
    avg_sim = sim_matrix.mean(axis=0)

    # Recommend the habit least similar to existing ones (more novel)
    recommended_index = avg_sim.argmin()
    return habit_db[recommended_index]

if __name__ == "__main__":
    user_habits = json.loads(sys.argv[1])
    suggestion = recommend_habit(user_habits)
    print(suggestion)
