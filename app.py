from flask import Flask, render_template, request, jsonify
import numpy as np
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras.layers import LeakyReLU
import cv2
import base64
from io import BytesIO
from PIL import Image

# Suppress TensorFlow logs
tf.get_logger().setLevel('ERROR')

app = Flask(__name__)

# Load the trained CNN model
model = tf.keras.models.load_model('model/CNN_TF_Tuned.keras', 
                                   custom_objects={'LeakyReLU': LeakyReLU})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        img_data = data['image']  # Get base64 image data
        
        # Decode base64 image
        img_bytes = base64.b64decode(img_data.split(',')[1])
        img = Image.open(BytesIO(img_bytes)).convert('L')  # Convert to grayscale
        
        # Resize to 20x20
        img = img.resize((20, 20), Image.LANCZOS)
        img_array = np.array(img) / 255.0  # Normalize

        # Auto-invert if necessary (ensures white digit on black background)
        if np.mean(img_array) > 0.5:
            img_array = 1 - img_array  

        # Reshape for model input
        img_array = img_array.reshape(1, 20, 20, 1)

        # Make prediction
        prediction = model.predict(img_array)[0]
        top_3_indices = np.argsort(prediction)[-3:][::-1]  # Get top 3 predictions
        top_3_confidences = [float(prediction[i]) for i in top_3_indices]  # Get confidence scores

        return jsonify({
            'predictions': [
                {'digit': int(top_3_indices[i]), 'confidence': round(top_3_confidences[i] * 100, 2)}
                for i in range(3)
            ]
        })

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=8000, debug=True, host='0.0.0.0')