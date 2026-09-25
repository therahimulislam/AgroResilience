from app.services.ml_predictor import predict_yield


prediction = predict_yield(
    crop="Rice",
    crop_year=2020,
    season="Kharif",
    state="Assam",
    area=5000,
    annual_rainfall=1800,
    fertilizer=500000,
    pesticide=1000,
)

print(f"Predicted yield: {prediction:.4f}")