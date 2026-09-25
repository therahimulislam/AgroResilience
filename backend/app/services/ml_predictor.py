from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "yield_model.joblib"
)


# Load the trained model once when the service is imported.
model = joblib.load(MODEL_PATH)


def predict_yield(
    crop: str,
    crop_year: int,
    season: str,
    state: str,
    area: float,
    annual_rainfall: float,
    fertilizer: float,
    pesticide: float,
) -> float:
    """
    Predict historical crop yield using the trained Random Forest model.

    The model expects the same features used during training.
    """

    input_data = pd.DataFrame([{
        "Crop": crop.strip(),
        "Crop_Year": crop_year,
        "Season": season.strip(),
        "State": state.strip(),
        "Area": area,
        "Annual_Rainfall": annual_rainfall,
        "Fertilizer": fertilizer,
        "Pesticide": pesticide,
    }])

    prediction = model.predict(input_data)[0]

    return float(prediction)