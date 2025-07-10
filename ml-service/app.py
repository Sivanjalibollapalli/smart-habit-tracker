from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import predict_success

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    streak = data.get('streak', 0)
    completed_yesterday = data.get('completed_yesterday', 0)
    probability = predict_success(streak, completed_yesterday)
    return jsonify({ 'probability': probability })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
