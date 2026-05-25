from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "diabetes_binary_5050split_health_indicators_BRFSS2015.csv"
MODEL_PATH = ROOT / "app" / "data" / "model.js"
COHORT_PATH = ROOT / "app" / "data" / "cohort.js"

TARGET = "Diabetes_binary"
FEATURES = [
    "HighBP",
    "HighChol",
    "CholCheck",
    "BMI",
    "Smoker",
    "Stroke",
    "HeartDiseaseorAttack",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "AnyHealthcare",
    "NoDocbcCost",
    "GenHlth",
    "MentHlth",
    "PhysHlth",
    "DiffWalk",
    "Sex",
    "Age",
    "Education",
    "Income",
]

FEATURE_META = {
    "HighBP": {
        "label": "High blood pressure",
        "type": "boolean",
        "help": "Has a clinician ever said this person has high blood pressure?",
        "recommendation": "Prioritize a blood pressure check and follow-up plan.",
    },
    "HighChol": {
        "label": "High cholesterol",
        "type": "boolean",
        "help": "Has a clinician ever said this person has high cholesterol?",
        "recommendation": "Review cholesterol screening and heart-health counseling.",
    },
    "CholCheck": {
        "label": "Cholesterol checked",
        "type": "boolean",
        "help": "Was cholesterol checked within the last five years?",
        "recommendation": "Confirm screening is current before interpreting risk.",
    },
    "BMI": {
        "label": "BMI",
        "type": "number",
        "min": 12,
        "max": 65,
        "step": 1,
        "help": "Body mass index.",
        "recommendation": "Discuss weight, nutrition, activity, and screening options.",
    },
    "Smoker": {
        "label": "Smoker",
        "type": "boolean",
        "help": "Has smoked at least 100 cigarettes in lifetime.",
        "recommendation": "Offer smoking cessation resources if currently relevant.",
    },
    "Stroke": {
        "label": "History of stroke",
        "type": "boolean",
        "help": "Ever told they had a stroke.",
        "recommendation": "Flag for clinician review because vascular history changes risk context.",
    },
    "HeartDiseaseorAttack": {
        "label": "Heart disease/attack",
        "type": "boolean",
        "help": "History of coronary heart disease or myocardial infarction.",
        "recommendation": "Coordinate risk review with cardiovascular care.",
    },
    "PhysActivity": {
        "label": "Physically active",
        "type": "boolean",
        "help": "Physical activity outside of work in the past 30 days.",
        "recommendation": "Consider a realistic activity plan if activity is low.",
    },
    "Fruits": {
        "label": "Daily fruit",
        "type": "boolean",
        "help": "Consumes fruit one or more times per day.",
        "recommendation": "Support small nutrition changes that are easy to maintain.",
    },
    "Veggies": {
        "label": "Daily vegetables",
        "type": "boolean",
        "help": "Consumes vegetables one or more times per day.",
        "recommendation": "Support small nutrition changes that are easy to maintain.",
    },
    "HvyAlcoholConsump": {
        "label": "Heavy alcohol use",
        "type": "boolean",
        "help": "BRFSS heavy-drinking indicator.",
        "recommendation": "Review alcohol intake if it is clinically relevant.",
    },
    "AnyHealthcare": {
        "label": "Has healthcare access",
        "type": "boolean",
        "help": "Has any kind of healthcare coverage.",
        "recommendation": "Connect to affordable screening resources when access is limited.",
    },
    "NoDocbcCost": {
        "label": "Skipped doctor due to cost",
        "type": "boolean",
        "help": "Could not see a doctor in the past year because of cost.",
        "recommendation": "Prioritize low-cost or community screening options.",
    },
    "GenHlth": {
        "label": "General health",
        "type": "select",
        "options": [
            {"value": 1, "label": "Excellent"},
            {"value": 2, "label": "Very good"},
            {"value": 3, "label": "Good"},
            {"value": 4, "label": "Fair"},
            {"value": 5, "label": "Poor"},
        ],
        "help": "Self-rated overall health.",
        "recommendation": "Use self-rated health as a cue for a broader check-in.",
    },
    "MentHlth": {
        "label": "Poor mental-health days",
        "type": "number",
        "min": 0,
        "max": 30,
        "step": 1,
        "help": "Number of poor mental-health days in the past 30 days.",
        "recommendation": "Consider whole-person support when stress or mood burden is high.",
    },
    "PhysHlth": {
        "label": "Poor physical-health days",
        "type": "number",
        "min": 0,
        "max": 30,
        "step": 1,
        "help": "Number of poor physical-health days in the past 30 days.",
        "recommendation": "Follow up on persistent physical-health limitations.",
    },
    "DiffWalk": {
        "label": "Difficulty walking",
        "type": "boolean",
        "help": "Serious difficulty walking or climbing stairs.",
        "recommendation": "Adapt activity advice to mobility and accessibility needs.",
    },
    "Sex": {
        "label": "Sex",
        "type": "select",
        "options": [
            {"value": 0, "label": "Female"},
            {"value": 1, "label": "Male"},
        ],
        "help": "BRFSS binary sex variable.",
        "recommendation": "Interpret alongside the full risk profile, not in isolation.",
    },
    "Age": {
        "label": "Age group",
        "type": "select",
        "options": [
            {"value": 1, "label": "18-24"},
            {"value": 2, "label": "25-29"},
            {"value": 3, "label": "30-34"},
            {"value": 4, "label": "35-39"},
            {"value": 5, "label": "40-44"},
            {"value": 6, "label": "45-49"},
            {"value": 7, "label": "50-54"},
            {"value": 8, "label": "55-59"},
            {"value": 9, "label": "60-64"},
            {"value": 10, "label": "65-69"},
            {"value": 11, "label": "70-74"},
            {"value": 12, "label": "75-79"},
            {"value": 13, "label": "80+"},
        ],
        "help": "CDC BRFSS age category.",
        "recommendation": "Increase screening attention as age-related risk rises.",
    },
    "Education": {
        "label": "Education",
        "type": "select",
        "options": [
            {"value": 1, "label": "No school/kindergarten"},
            {"value": 2, "label": "Grades 1-8"},
            {"value": 3, "label": "Grades 9-11"},
            {"value": 4, "label": "High school graduate"},
            {"value": 5, "label": "Some college/technical school"},
            {"value": 6, "label": "College graduate"},
        ],
        "help": "Highest education category.",
        "recommendation": "Tailor explanation and resource guidance to the user.",
    },
    "Income": {
        "label": "Income",
        "type": "select",
        "options": [
            {"value": 1, "label": "Less than $10k"},
            {"value": 2, "label": "$10k-$15k"},
            {"value": 3, "label": "$15k-$20k"},
            {"value": 4, "label": "$20k-$25k"},
            {"value": 5, "label": "$25k-$35k"},
            {"value": 6, "label": "$35k-$50k"},
            {"value": 7, "label": "$50k-$75k"},
            {"value": 8, "label": "$75k+"},
        ],
        "help": "Household income category.",
        "recommendation": "Recommend realistic resources based on access and affordability.",
    },
}


def sigmoid(values: np.ndarray) -> np.ndarray:
    values = np.clip(values, -40, 40)
    return 1.0 / (1.0 + np.exp(-values))


def auc_score(y_true: np.ndarray, scores: np.ndarray) -> float:
    order = np.argsort(scores)
    ranks = np.empty_like(order, dtype=float)
    ranks[order] = np.arange(1, len(scores) + 1)
    pos = y_true == 1
    pos_count = float(pos.sum())
    neg_count = float((~pos).sum())
    rank_sum = ranks[pos].sum()
    return float((rank_sum - pos_count * (pos_count + 1) / 2) / (pos_count * neg_count))


def metrics_for(y_true: np.ndarray, probabilities: np.ndarray) -> dict[str, float | int]:
    predicted = (probabilities >= 0.5).astype(int)
    tp = int(((predicted == 1) & (y_true == 1)).sum())
    tn = int(((predicted == 0) & (y_true == 0)).sum())
    fp = int(((predicted == 1) & (y_true == 0)).sum())
    fn = int(((predicted == 0) & (y_true == 1)).sum())
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-12)
    return {
        "accuracy": float((tp + tn) / len(y_true)),
        "auc": auc_score(y_true, probabilities),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "true_positive": tp,
        "true_negative": tn,
        "false_positive": fp,
        "false_negative": fn,
    }


def simple_rule_probabilities(x_values: np.ndarray) -> np.ndarray:
    frame = pd.DataFrame(x_values, columns=FEATURES)
    score = (
        0.38 * frame["HighBP"]
        + 0.24 * frame["HighChol"]
        + 0.16 * frame["HeartDiseaseorAttack"]
        + 0.12 * frame["DiffWalk"]
        + 0.12 * np.clip((frame["BMI"] - 25) / 15, -1, 2)
        + 0.18 * ((frame["GenHlth"] - 1) / 4)
        + 0.14 * ((frame["Age"] - 1) / 12)
        - 0.08 * frame["PhysActivity"]
    )
    return sigmoid(score.to_numpy(dtype=float) - 0.45)


def train_logistic_regression(
    x_train: np.ndarray,
    y_train: np.ndarray,
    regularization: float = 0.002,
    max_iter: int = 40,
    tolerance: float = 1e-7,
) -> np.ndarray:
    x_with_intercept = np.column_stack([np.ones(len(x_train)), x_train])
    weights = np.zeros(x_with_intercept.shape[1], dtype=float)
    positive_rate = float(np.clip(y_train.mean(), 1e-6, 1 - 1e-6))
    weights[0] = np.log(positive_rate / (1 - positive_rate))

    reg = np.eye(x_with_intercept.shape[1]) * regularization
    reg[0, 0] = 0.0

    for _ in range(max_iter):
        probabilities = sigmoid(x_with_intercept @ weights)
        error = probabilities - y_train
        gradient = (x_with_intercept.T @ error) / len(x_train)
        gradient[1:] += regularization * weights[1:]

        scale = probabilities * (1 - probabilities)
        hessian = (x_with_intercept.T @ (x_with_intercept * scale[:, None])) / len(x_train)
        hessian += reg

        step = np.linalg.solve(hessian, gradient)
        weights -= step
        if np.linalg.norm(step) < tolerance:
            break

    return weights


def rounded_list(values: np.ndarray, digits: int = 8) -> list[float]:
    return [round(float(value), digits) for value in values]


def option_label(feature: str, value: float) -> str:
    meta = FEATURE_META[feature]
    if meta["type"] == "boolean":
        return "Yes" if value else "No"
    if meta["type"] == "select":
        for option in meta["options"]:
            if float(option["value"]) == float(value):
                return str(option["label"])
    return str(int(value) if float(value).is_integer() else value)


def risk_band(probability: float) -> str:
    if probability >= 0.75:
        return "High"
    if probability >= 0.55:
        return "Elevated"
    if probability >= 0.35:
        return "Moderate"
    return "Low"


def barrier_tags(row: pd.Series) -> list[str]:
    tags = []
    if int(row["AnyHealthcare"]) == 0:
        tags.append("No coverage")
    if int(row["NoDocbcCost"]) == 1:
        tags.append("Cost barrier")
    if int(row["CholCheck"]) == 0:
        tags.append("Screening gap")
    if int(row["Income"]) <= 3:
        tags.append("Low income")
    if int(row["PhysActivity"]) == 0:
        tags.append("Inactive")
    if int(row["DiffWalk"]) == 1:
        tags.append("Mobility need")
    return tags


def recommended_action(row: pd.Series, probability: float, top_driver: str) -> str:
    if int(row["AnyHealthcare"]) == 0 or int(row["NoDocbcCost"]) == 1:
        return "Route to low-cost A1C screening and coverage support."
    if int(row["CholCheck"]) == 0:
        return "Start with overdue cholesterol and glucose screening."
    if probability >= 0.75:
        return "Schedule clinician review and A1C or fasting-glucose test."
    if top_driver in {"BMI", "PhysActivity", "Fruits", "Veggies"}:
        return "Pair screening with a realistic nutrition and activity plan."
    if top_driver in {"HighBP", "HighChol", "HeartDiseaseorAttack", "Stroke"}:
        return "Coordinate diabetes screening with cardiovascular risk review."
    return "Confirm preventive screening and monitor risk trend."


def outreach_priority(row: pd.Series, probability: float) -> float:
    access_boost = 0.0
    access_boost += 0.09 if int(row["AnyHealthcare"]) == 0 else 0.0
    access_boost += 0.09 if int(row["NoDocbcCost"]) == 1 else 0.0
    access_boost += 0.05 if int(row["CholCheck"]) == 0 else 0.0
    access_boost += 0.04 if int(row["Income"]) <= 3 else 0.0
    access_boost += 0.03 if int(row["DiffWalk"]) == 1 else 0.0
    return min(float(probability + access_boost), 0.99)


def build_demo_cohort(
    clean: pd.DataFrame,
    probabilities: np.ndarray,
    contributions: np.ndarray,
) -> list[dict[str, object]]:
    priority = np.array(
        [outreach_priority(clean.iloc[index], probabilities[index]) for index in range(len(clean))]
    )
    selected: list[int] = []

    def add_indices(candidates: np.ndarray, limit: int) -> None:
        for index in candidates:
            as_int = int(index)
            if as_int not in selected:
                selected.append(as_int)
            if len(selected) >= limit:
                break

    add_indices(np.argsort(priority)[::-1], 24)
    access_mask = (
        (clean["AnyHealthcare"].to_numpy() == 0)
        | (clean["NoDocbcCost"].to_numpy() == 1)
        | (clean["CholCheck"].to_numpy() == 0)
    )
    access_sorted = np.argsort(np.where(access_mask, priority, -1))[::-1]
    add_indices(access_sorted, 30)
    moderate_mask = (probabilities >= 0.4) & (probabilities < 0.7)
    moderate_sorted = np.argsort(np.where(moderate_mask, priority, -1))[::-1]
    add_indices(moderate_sorted, 34)
    low_mask = probabilities < 0.35
    low_sorted = np.argsort(np.where(low_mask, 1 - probabilities, -1))[::-1]
    add_indices(low_sorted, 38)

    names = [
        "Amina R.",
        "Julian T.",
        "Priya S.",
        "Mateo C.",
        "Nora K.",
        "Evan L.",
        "Samira H.",
        "Dante M.",
        "Elena V.",
        "Chris P.",
        "Mei W.",
        "Andre B.",
        "Leah G.",
        "Omar N.",
        "Talia F.",
        "Isaac J.",
        "Rina D.",
        "Marcus E.",
        "Hana Y.",
        "Sofia Q.",
        "Noah A.",
        "Iris M.",
        "Camila Z.",
        "Theo R.",
        "Lena C.",
        "Jonah V.",
        "Mina P.",
        "Rafael H.",
        "Ari L.",
        "Maya D.",
        "Kai S.",
        "Nadia B.",
        "Zoe W.",
        "Luis A.",
        "Anika J.",
        "Reed K.",
        "Sara T.",
        "Ben O.",
    ]

    cohort = []
    for number, index in enumerate(selected[:38], start=1):
        row = clean.iloc[index]
        top_driver_index = int(np.argmax(np.abs(contributions[index])))
        top_driver = FEATURES[top_driver_index]
        probability = float(probabilities[index])
        profile = {
            feature: int(row[feature]) if float(row[feature]).is_integer() else float(row[feature])
            for feature in FEATURES
        }
        tags = barrier_tags(row)
        cohort.append(
            {
                "id": f"CC-{1000 + number}",
                "name": names[number - 1],
                "ageGroup": option_label("Age", row["Age"]),
                "sex": option_label("Sex", row["Sex"]),
                "risk": round(probability, 4),
                "riskBand": risk_band(probability),
                "priority": round(outreach_priority(row, probability), 4),
                "barriers": tags,
                "topDriver": top_driver,
                "topDriverLabel": FEATURE_META[top_driver]["label"],
                "topDriverValue": option_label(top_driver, row[top_driver]),
                "recommendedAction": recommended_action(row, probability, top_driver),
                "profile": profile,
            }
        )

    return sorted(cohort, key=lambda item: item["priority"], reverse=True)


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Missing dataset: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    clean = df[[TARGET, *FEATURES]].dropna().astype(float)

    rng = np.random.default_rng(42)
    indices = rng.permutation(len(clean))
    split = int(len(indices) * 0.8)
    train_idx = indices[:split]
    test_idx = indices[split:]

    x = clean[FEATURES].to_numpy(dtype=float)
    y = clean[TARGET].to_numpy(dtype=int)

    x_train = x[train_idx]
    y_train = y[train_idx]
    x_test = x[test_idx]
    y_test = y[test_idx]

    means = x_train.mean(axis=0)
    stds = x_train.std(axis=0)
    stds[stds == 0] = 1

    x_train_scaled = (x_train - means) / stds
    x_test_scaled = (x_test - means) / stds

    weights = train_logistic_regression(x_train_scaled, y_train)
    train_probabilities = sigmoid(np.column_stack([np.ones(len(x_train_scaled)), x_train_scaled]) @ weights)
    test_probabilities = sigmoid(np.column_stack([np.ones(len(x_test_scaled)), x_test_scaled]) @ weights)
    rule_probabilities = simple_rule_probabilities(x_test)

    coefficients = weights[1:]
    all_scaled = (x - means) / stds
    all_probabilities = sigmoid(np.column_stack([np.ones(len(all_scaled)), all_scaled]) @ weights)
    all_contributions = all_scaled * coefficients
    feature_importance = sorted(
        [
            {
                "name": feature,
                "label": FEATURE_META[feature]["label"],
                "coefficient": round(float(coef), 8),
                "impact": round(abs(float(coef)), 8),
                "direction": "increases" if coef >= 0 else "decreases",
            }
            for feature, coef in zip(FEATURES, coefficients)
        ],
        key=lambda item: item["impact"],
        reverse=True,
    )

    model = {
        "project": "CareCompass",
        "modelType": "Logistic regression trained from scratch with NumPy",
        "dataset": {
            "name": "CDC BRFSS 2015 Diabetes Health Indicators, balanced 50/50 split",
            "source": "Kaggle mirror of CDC BRFSS health indicators",
            "rows": int(len(clean)),
            "target": TARGET,
            "positiveLabel": "diabetes or prediabetes risk indicator",
            "note": "This is a public survey dataset for demonstration and decision support, not a diagnostic medical device.",
        },
        "features": FEATURES,
        "featureMeta": FEATURE_META,
        "intercept": round(float(weights[0]), 8),
        "coefficients": rounded_list(coefficients),
        "means": rounded_list(means),
        "stds": rounded_list(stds),
        "baselineRisk": round(float(y_train.mean()), 6),
        "metrics": {
            "train": metrics_for(y_train, train_probabilities),
            "test": metrics_for(y_test, test_probabilities),
        },
        "modelComparison": [
            {
                "name": "Majority baseline",
                "accuracy": round(float(max(y_train.mean(), 1 - y_train.mean())), 6),
                "auc": 0.5,
                "note": "Sanity check: always predicts the most common class.",
            },
            {
                "name": "Risk-factor rules",
                "accuracy": round(float(metrics_for(y_test, rule_probabilities)["accuracy"]), 6),
                "auc": round(float(metrics_for(y_test, rule_probabilities)["auc"]), 6),
                "note": "Hand-built transparent rule score from BMI, BP, cholesterol, age, and health status.",
            },
            {
                "name": "CareCompass logistic model",
                "accuracy": round(float(metrics_for(y_test, test_probabilities)["accuracy"]), 6),
                "auc": round(float(metrics_for(y_test, test_probabilities)["auc"]), 6),
                "note": "Current model: explainable, fast, and strong enough for a live dashboard.",
            },
        ],
        "featureImportance": feature_importance,
        "trainedAt": "2026-05-22",
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.write_text(
        "window.CARECOMPASS_MODEL = "
        + json.dumps(model, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    cohort = build_demo_cohort(clean, all_probabilities, all_contributions)
    COHORT_PATH.write_text(
        "window.CARECOMPASS_COHORT = "
        + json.dumps(cohort, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    test = model["metrics"]["test"]
    print(f"Wrote {MODEL_PATH}")
    print(f"Wrote {COHORT_PATH}")
    print(
        "Test metrics: "
        f"accuracy={test['accuracy']:.3f}, auc={test['auc']:.3f}, "
        f"precision={test['precision']:.3f}, recall={test['recall']:.3f}"
    )


if __name__ == "__main__":
    main()
