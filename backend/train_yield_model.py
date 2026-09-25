import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# 1. LOAD DATA
# ============================================================

DATA_PATH = "data/crop_yield.csv"

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")


# ============================================================
# 2. CLEAN COLUMN VALUES
# ============================================================

# Remove accidental whitespace from column names
df.columns = df.columns.str.strip()

# Remove accidental whitespace from categorical values
for column in ["Crop", "Season", "State"]:
    df[column] = df[column].astype(str).str.strip()


# ============================================================
# 3. REMOVE INVALID ROWS
# ============================================================

# Area cannot be zero when predicting yield
df = df[df["Area"] > 0]

# Remove rows where target is missing
df = df.dropna(subset=["Yield"])


print(f"Rows after cleaning: {len(df)}")


# ============================================================
# 4. DEFINE FEATURES AND TARGET
# ============================================================

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

X = df[features]
y = df[target]


# ============================================================
# 5. TEMPORAL TRAIN/TEST SPLIT
# ============================================================

# We want to test the model on later years,
# rather than randomly mixing future data into training.

TRAIN_END_YEAR = 2016

train_df = df[df["Crop_Year"] <= TRAIN_END_YEAR]
test_df = df[df["Crop_Year"] > TRAIN_END_YEAR]

X_train = train_df[features]
y_train = train_df[target]

X_test = test_df[features]
y_test = test_df[target]

print("\nTraining rows:", len(X_train))
print("Testing rows :", len(X_test))

print(
    f"Training years: {train_df['Crop_Year'].min()} "
    f"to {train_df['Crop_Year'].max()}"
)

print(
    f"Testing years : {test_df['Crop_Year'].min()} "
    f"to {test_df['Crop_Year'].max()}"
)


# ============================================================
# 6. PREPROCESSING
# ============================================================

categorical_features = [
    "Crop",
    "Season",
    "State"
]

numeric_features = [
    "Crop_Year",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide"
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numeric",
            "passthrough",
            numeric_features
        )
    ]
)


# ============================================================
# 7. RANDOM FOREST MODEL
# ============================================================

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=20,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1
)


# ============================================================
# 8. COMPLETE ML PIPELINE
# ============================================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ============================================================
# 9. TRAIN
# ============================================================

print("\nTraining Random Forest...")

pipeline.fit(X_train, y_train)

print("Training complete.")


# ============================================================
# 10. PREDICTIONS
# ============================================================

predictions = pipeline.predict(X_test)


# ============================================================
# 11. EVALUATION
# ============================================================

mae = mean_absolute_error(y_test, predictions)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(y_test, predictions)


print("\n" + "=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R²   : {r2:.4f}")


# ============================================================
# 12. SAVE MODEL
# ============================================================

os.makedirs("models", exist_ok=True)

model_path = "models/yield_model.joblib"

joblib.dump(pipeline, model_path)

print("\nModel saved to:")
print(model_path)