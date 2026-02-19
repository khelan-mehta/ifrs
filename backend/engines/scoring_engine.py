"""Utility functions for scoring and aggregation."""


def weighted_average(scores: dict, weights: dict) -> float:
    """Calculate weighted average of scores."""
    total_weight = sum(weights.values())
    if total_weight == 0:
        return 0.0

    weighted_sum = sum(scores.get(k, 0) * weights.get(k, 0) for k in weights)
    return round(weighted_sum / total_weight, 2)


def compliance_grade(score: float) -> str:
    """Convert numeric score to letter grade."""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def risk_level(score: float) -> str:
    """Convert risk score to risk level."""
    if score >= 80:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    elif score >= 20:
        return "Low"
    else:
        return "Minimal"


IFRS_S1_WEIGHTS = {
    "governance_score": 0.25,
    "strategy_score": 0.25,
    "risk_score": 0.25,
    "metrics_score": 0.25,
}

IFRS_S2_WEIGHTS = {
    "physical_risk_score": 0.30,
    "transition_risk_score": 0.30,
    "scenario_alignment_score": 0.20,
    "emissions_completeness": 0.20,
}
