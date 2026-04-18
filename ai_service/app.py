from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load models and scaler
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
diet_model = joblib.load(os.path.join(MODEL_DIR, 'final_diet_fixed_model.pkl'))
exercise_model = joblib.load(os.path.join(MODEL_DIR, 'final_exercise_model.pkl'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))

# Mapping dictionaries
GENDER_MAP = {'Male': 0, 'Female': 1}
BINARY_MAP = {'No': 0, 'Yes': 1}
DIET_TYPE_MAP = {'Non-Veg': 0, 'Veg': 1, 'NON_VEG': 0, 'VEGETARIAN': 1, 'VEGAN': 1}
GOAL_MAP = {'Weight Loss': 0, 'Weight Gain': 1, 'Muscle Building': 1, 'Endurance Training': 1, 'Flexibility': 1, 'Body Transformation': 1}

DIET_OUTPUT_MAP = {
    0: 'Boiled eggs, chicken fried rice, beef curry with roti, smoothie',
    1: 'Fruit smoothie, brown rice with mixed vegetables, lentil stew, salad',
    2: 'Omelette with bread, chicken curry with rice, beef noodles, yogurt',
    3: 'Egg avocado toast, grilled chicken salad, beef stir fry noodles, fruit bowl',
    4: 'Egg sandwich, chicken quinoa bowl, beef steak with veggies, fruit juice',
    5: 'Smoothie bowl, quinoa salad, chickpea curry with rice, fruit salad',
    6: 'Whole grain toast with avocado, vegetable stir fry with noodles, dal with rice',
    7: 'Scrambled eggs with toast, grilled chicken with rice, beef stir fry with vegetables, fruit smoothie',
    8: 'Pancakes with honey, vegetable biryani, paneer curry with roti, nuts',
    9: 'Oatmeal with fruits, rice with vegetable curry, lentil soup, yogurt with nuts'
}

RECOMMENDATION_OUTPUT_MAP = {
    0: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important to approach weight loss in a healthy and balanced way, focusing on exercise and nutrition. Keep in mind that weight loss should be gradual and focused on building lean muscle rather than increasing fat. Additionally, it's always a good idea to consult with a healthcare professional or registered dietitian before making any significant changes to your exercise or diet plan. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your doctor or a professional counselor. Consistency: Establish a consistent eating and exercise routine. Consistency is key when it comes to long-term weight management. NOTICE: Opt for whole grains over refined grains for added fiber.Limit added sugars and opt for natural sources like honey or fruits.",
    1: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important to approach weight gain in a healthy and balanced way, focusing on both exercise and nutrition. Keep in mind that weight gain should be gradual and focused on building lean muscle rather than increasing fat. Additionally, it's always a good idea to consult with a health care professional or registered dietitian before making any significant changes to your exercise or diet plan. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your personal doctor or a professional counselor.",
    2: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important to work with a health care professional to create an individualized plan based on your unique health needs. Always consult a health care professional or dietician for personalized advice based on your specific medical condition, as high blood pressure requires careful management of diet and exercise. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your personal doctor or a professional counselor.",
    3: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important for individuals with diabetes to consult with a health care professional, such as a registered dietitian or health care provider, to create an individualized plan that meets their unique needs. Also, avoid anything that can cause diabetes whether you are doing fitness or not. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your personal doctor or a professional counselor.",
    4: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important for individuals with diabetes and high blood pressure to consult with a health care professional, such as a registered dietitian or health care provider, to find an individualized plan that meets their unique needs. also stop everything that can increase diabetes and blood pressure whether you are doing fitness or not. measure your sugar (diabetes) and blood before starting fitness. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your personal doctor or a professional counselor.",
    5: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important for individuals with diabetes and high blood pressure to consult with a health care professional, such as a registered dietitian or health care provider, to find an individualized plan that meets their unique needs. also, stop everything that can increase diabetes and blood pressure whether you are doing fitness or not. measure your sugar (diabetes) and blood before starting fitness. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your doctor or a professional counselor. Always consult with your healthcare provider before starting any new diet or exercise program, especially if you have underlying health conditions like diabetes. They can provide guidance based on your specific health needs and may recommend additional strategies or medications if necessary. Consistency: Establish a consistent eating and exercise routine. Consistency is key when it comes to long-term weight management. NOTICE: Opt for whole grains over refined grains for added fiber. Limit added sugars and opt for natural sources like honey or fruits.",
    6: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. It is important to approach weight loss in a healthy and balanced way, focusing on exercise and nutrition. Keep in mind that weight lossshould be gradual and focused on building lean muscle rather than increasing fat. Additionally, it's always a good idea to consult with a healthcare professional or registered dietitian before making any significant changes to your exercise or diet plan. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your doctor or a professional counselor. Always consult with your healthcare provider before starting any new diet or exercise program, especially if you have underlying health conditions like hypertension. They can provide guidance based on your specific health needs and may recommend additional strategies or medications if necessary. Consistency: Establish a consistent eating and exercise routine. Consistency is key when it comes to long-term weight management. NOTICE: Opt for whole grains over refined grains for added fiber.Limit added sugars and opt for natural sources like honey or fruits.",
    7: "Follow a regular exercise schedule. Adhere to the exercise and diet plan to get better results. Individuals with diabetes need to consult with a health care professional, such as a registered dietitian or health care provider, to create an individualized plan that meets their unique needs. Also, avoid anything that can cause diabetes whether you are doing fitness or not. Here are some important tips:- Stay hydrated by drinking enough water throughout the day. Monitor your progress and adjust your diet and exercise routine accordingly. Get adequate sleep to support muscle recovery and overall health. Always monitor your situation, and consult your doctor or a professional counselor. Always consult with your healthcare provider before starting any new diet or exercise program, especially if you have underlying health conditions like diabetes. They can provide guidance based on your specific health needs and may recommend additional strategies or medications if necessary. Consistency: Establish a consistent eating and exercise routine. Consistency is key when it comes to long-term weight management. NOTICE: Opt for whole grains over refined grains for added fiber. Limit added sugars and opt for natural sources like honey or fruits.",
    8: "Conclusion Recommendation"
}

EXERCISE_OUTPUT_MAP = {
    0: 'Leg press 10 3; Barbell squat 8 3; Calf raises seated 15 3; Barbell bench press 8 3; Cable row 10 3; Front press 8 3; EZ bar curl 8 3; Tricep extension 8 3',
    1: 'Treadmill walking 15min 1; Bodyweight squat 12 3; Leg press 12 3; Lat pulldown 10 3; Push ups 10 3; Plank 30s 3',
    2: 'Leg press 10 3; Barbell bench press 8 3; Lat pulldown 10 3; Shoulder press 8 3; EZ bar curl 8 3; Tricep pushdown 8 3'
}

@app.route('/predict/diet', methods=['POST'])
def predict_diet():
    try:
        data = request.json
        # Diet Input Features: ['Gender', 'Age', 'Weight', 'High Blood Pressure', 'Diabetes', 'Fitness Goal', 'DietType']
        gender = GENDER_MAP.get(data.get('gender'), 0)
        age = data.get('age', 25)
        weight = data.get('weight', 70.0)
        hbp = BINARY_MAP.get(data.get('highBloodPressure'), 0)
        diabetes = BINARY_MAP.get(data.get('diabetes'), 0)
        goal = GOAL_MAP.get(data.get('fitnessGoal'), 0)
        diet_type = DIET_TYPE_MAP.get(data.get('dietType'), 0)
        
        # Scaling Age and Weight (along with Height and BMI as dummy since scaler was fit on 4 cols)
        height = data.get('height', 170.0)
        bmi = weight / ((height/100)**2)
        scaled_features = scaler.transform([[age, height, weight, bmi]])[0]
        
        scaled_age = scaled_features[0]
        scaled_weight = scaled_features[2]
        
        # Prepare final feature vector
        features = np.array([[gender, scaled_age, scaled_weight, hbp, diabetes, goal, diet_type]])
        
        prediction = diet_model.predict(features)[0]
        
        # Return Diet (Assuming the model might return a list or we pick one)
        # Looking at user code, diet_model predict might be returning the class index for Diet and Recommendation
        # Or maybe they are separate outputs? If it's one model, it usually returns one target.
        # User's code showed replacing labels for 'Exercises', 'Diet', 'Recommendation' etc.
        # Let's assume prediction is an index.
        
        return jsonify({
            'dietPlan': DIET_OUTPUT_MAP.get(prediction, "Custom Healthy Diet"),
            'recommendation': RECOMMENDATION_OUTPUT_MAP.get(prediction, "Stay consistent!")
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/exercise', methods=['POST'])
def predict_exercise():
    try:
        data = request.json
        # Exercise input Features: ['Age', 'Gender', 'Fitness Goal', 'Weight', 'High Blood Pressure']
        gender = GENDER_MAP.get(data.get('gender'), 0)
        age = data.get('age', 25)
        weight = data.get('weight', 70.0)
        hbp = BINARY_MAP.get(data.get('highBloodPressure'), 0)
        goal = GOAL_MAP.get(data.get('fitnessGoal'), 0)
        
        # Scaling
        height = data.get('height', 170.0)
        bmi = weight / ((height/100)**2)
        scaled_features = scaler.transform([[age, height, weight, bmi]])[0]
        
        scaled_age = scaled_features[0]
        scaled_weight = scaled_features[2]
        
        features = np.array([[scaled_age, gender, goal, scaled_weight, hbp]])
        prediction = exercise_model.predict(features)[0]
        
        return jsonify({
            'workoutPlan': EXERCISE_OUTPUT_MAP.get(prediction, "General Fitness Routine")
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
