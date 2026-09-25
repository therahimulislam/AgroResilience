import pandas as pd
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


DATA_PATH = "data/crop_yield.csv"
MODEL_PATH = "models/yield_model.joblib"


# Load data
df = pd.read_csv(DATA_PATH)

# Clean names and categorical values
df.columns = df.columns.str.strip()

for column in ["Crop", "Season", "State"]:
    df[column] = df[column].astype(str).str.strip()

# Remove invalid area
df = df[df["Area"] > 0]

features = [
    "Crop",
    "Crop_Year",
    "Season",
    "State",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide"
]

target = "Yield"

# Same temporal split
train_df = df[df["Crop_Year"] <= 2016]
test_df = df[df["Crop_Year"] > 2016]

X_test = test_df[features]
y_test = test_df[target]

# Load trained model
model = joblib.load(MODEL_PATH)

# Predict
predictions = model.predict(X_test)

# Add predictions to test data
results = test_df[
    ["Crop", "Crop_Year", "Season", "State", "Yield"]
].copy()

results["Predicted_Yield"] = predictions

results["Absolute_Error"] = (
    results["Yield"] - results["Predicted_Yield"]
).abs()

# Overall metrics
mae = mean_absolute_error(y_test, predictions)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(y_test, predictions)

print("=" * 60)
print("OVERALL PERFORMANCE")
print("=" * 60)

print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R²   : {r2:.4f}")


# Largest errors
print("\n" + "=" * 60)
print("10 LARGEST PREDICTION ERRORS")
print("=" * 60)

print(
    results
    .sort_values("Absolute_Error", ascending=False)
    .head(10)
    .to_string(index=False)
)


# Assam performance
assam = results[
    results["State"].str.lower() == "assam"
]

if len(assam) > 0:

    print("\n" + "=" * 60)
    print("ASSAM PERFORMANCE")
    print("=" * 60)

    print(f"Rows: {len(assam)}")

    print(
        f"MAE: {mean_absolute_error(assam['Yield'], assam['Predicted_Yield']):.4f}"
    )

    print(
        f"RMSE: {mean_squared_error(assam['Yield'], assam['Predicted_Yield']) ** 0.5:.4f}"
    )

    print(
        f"R²: {r2_score(assam['Yield'], assam['Predicted_Yield']):.4f}"
    )


# Assam Rice performance
assam_rice = results[
    (results["State"].str.lower() == "assam")
    & (results["Crop"].str.lower() == "rice")
]

if len(assam_rice) > 0:

    print("\n" + "=" * 60)
    print("ASSAM RICE PERFORMANCE")
    print("=" * 60)

    print(f"Rows: {len(assam_rice)}")

    print(
        f"MAE: {mean_absolute_error(assam_rice['Yield'], assam_rice['Predicted_Yield']):.4f}"
    )

    print(
        f"RMSE: {mean_squared_error(assam_rice['Yield'], assam_rice['Predicted_Yield']) ** 0.5:.4f}"
    )

    print(
        f"R²: {r2_score(assam_rice['Yield'], assam_rice['Predicted_Yield']):.4f}"
    )