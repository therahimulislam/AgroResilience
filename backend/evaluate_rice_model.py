import pandas as pd
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


df = pd.read_csv("data/crop_yield.csv")

df.columns = df.columns.str.strip()

for column in ["Crop", "Season", "State"]:
    df[column] = df[column].astype(str).str.strip()

df = df[df["Area"] > 0]

# Focus only on Rice
rice = df[df["Crop"].str.lower() == "rice"].copy()

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

train = rice[rice["Crop_Year"] <= 2016]
test = rice[rice["Crop_Year"] > 2016]

model = joblib.load("models/yield_model.joblib")

predictions = model.predict(test[features])

print("=" * 60)
print("RICE-ONLY TEST PERFORMANCE")
print("=" * 60)

print(f"Test rows: {len(test)}")

print(
    f"MAE  : {mean_absolute_error(test['Yield'], predictions):.4f}"
)

print(
    f"RMSE : {mean_squared_error(test['Yield'], predictions) ** 0.5:.4f}"
)

print(
    f"R²   : {r2_score(test['Yield'], predictions):.4f}"
)


# Assam Rice
assam_rice = test[
    test["State"].str.lower() == "assam"
]

if len(assam_rice) > 0:

    assam_predictions = model.predict(
        assam_rice[features]
    )

    print("\n" + "=" * 60)
    print("ASSAM RICE")
    print("=" * 60)

    print(f"Test rows: {len(assam_rice)}")

    print(
        f"MAE  : {mean_absolute_error(assam_rice['Yield'], assam_predictions):.4f}"
    )

    print(
        f"RMSE : {mean_squared_error(assam_rice['Yield'], assam_predictions) ** 0.5:.4f}"
    )

    print(
        f"R²   : {r2_score(assam_rice['Yield'], assam_predictions):.4f}"
    )