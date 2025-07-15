# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import analyze_habit
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# ✅ ML prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = analyze_habit(data)
    return jsonify(result)

# ✅ Updated habit recommendation endpoint
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    user_habits = data.get("habits", [])
    print("User sent habits:", user_habits)

    categorized_habits = {
        "Fitness": [
            "Workout for 30 minutes",
            "Walk 10,000 steps",
            "Do 10 push-ups",
            "Stretch for 5 minutes",
            "Yoga session for 20 minutes"
        ],
        "Learning": [
            "Read a book for 20 minutes",
            "Learn a new programming concept",
            "Watch an educational video",
            "Learn 10 new words"
        ],
        "Wellness": [
            "Meditate for 10 minutes",
            "Practice deep breathing",
            "Practice gratitude",
            "Sleep before 11 PM",
            "Limit screen time before bed"
        ],
        "Productivity": [
            "Plan your next day in advance",
            "Write a journal entry",
            "Organize your workspace",
            "Eat a healthy breakfast"
        ],
        "Social": [
            "Call a friend or relative",
            "Avoid sugar for a day",
            "Drink 8 glasses of water"
        ]
    }

    all_habits = [habit for group in categorized_habits.values() for habit in group]

    # Clean user habits
    clean_user_habits = [h for h in user_habits if len(h) > 3 and any(v in h.lower() for v in 'aeiou')]
    if not clean_user_habits:
        suggestion = random.choice(all_habits)
        return jsonify({"suggestion": suggestion})

    # Step 1: Determine user's dominant category
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    vectorizer = TfidfVectorizer()
    similarity_scores = {}

    for category, habits in categorized_habits.items():
        vectors = vectorizer.fit_transform(clean_user_habits + habits)
        user_vecs = vectors[:len(clean_user_habits)]
        candidate_vecs = vectors[len(clean_user_habits):]

        sim_matrix = cosine_similarity(user_vecs, candidate_vecs)
        avg_sim = sim_matrix.mean()
        similarity_scores[category] = avg_sim

    sorted_cats = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)
    user_category = sorted_cats[0][0]
    print(f"User's dominant category: {user_category}")

    # Pick a different category to suggest from
    other_cats = [cat for cat in categorized_habits if cat != user_category]
    next_category = random.choice(other_cats)
    print(f"Suggesting from category: {next_category}")

    # Step 2: Filter out too-similar suggestions
    suggestions_pool = []
    for candidate in categorized_habits[next_category]:
        # Skip if it's already added verbatim
        if candidate in user_habits:
            continue

        # Check semantic similarity
        vectors = vectorizer.fit_transform(clean_user_habits + [candidate])
        user_vecs = vectors[:len(clean_user_habits)]
        candidate_vec = vectors[-1]

        sim_scores = cosine_similarity(user_vecs, candidate_vec)
        avg_sim = sim_scores.mean()

        # Only add if not too similar (below threshold)
        if avg_sim < 0.5:
            suggestions_pool.append(candidate)

    print(f"Filtered suggestions: {suggestions_pool}")

    if suggestions_pool:
        suggestion = random.choice(suggestions_pool)
    else:
        # All were too similar — fallback
        fallback = [h for h in all_habits if h not in user_habits]
        suggestion = random.choice(fallback if fallback else all_habits)

    return jsonify({"suggestion": suggestion})




if __name__ == '__main__':
    app.run(port=5001, debug=True)
