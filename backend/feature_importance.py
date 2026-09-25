import pandas as pd
import joblib

MODEL_PATH = "models/yield_model.joblib"

model = joblib.load(MODEL_PATH)

pipeline = model

preprocessor = pipeline.named_steps["preprocessor"]
rf = pipeline.named_steps["model"]

feature_names = preprocessor.get_feature_names_out()

importances = rf.feature_importances_

importance_df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
})

importance_df = importance_df.sort_values(
    "Importance",
    ascending=False
)

print("=" * 60)
print("TOP 20 FEATURE IMPORTANCES")
print("=" * 60)

print(
    importance_df.head(20).to_string(index=False)
)