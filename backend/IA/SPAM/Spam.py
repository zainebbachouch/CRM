from flask import Flask, request, jsonify
# Import the function from the script
from spamClassification import predict_with_mlp

app = Flask(__name__)


@app.route('/api/sendMessage', methods=['POST'])
def send_message():
    try:
        data = request.json

        text = data.get('message', '')

        prediction = predict_with_mlp(text)

        return jsonify({'prediction': prediction})
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'An error occurred during prediction'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
