import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const intelligenceDecks = createShardLoaders(
    "intelligence",
    [
        "intelligence_behavioral_profiling_criminal_behavior_analysis",
        "intelligence_behavioral_profiling_psychological_operations",
        "intelligence_behavioral_profiling_threat_behavior_assessment",
        "intelligence_cyber_intelligence_cyber_threat_detection",
        "intelligence_cyber_intelligence_digital_forensic_methods",
        "intelligence_cyber_intelligence_threat_actor_profiling",
        "intelligence_intelligence_analysis_data_collection_methods",
        "intelligence_intelligence_analysis_predictive_analysis",
        "intelligence_intelligence_analysis_threat_assessment_models",
        "intelligence_linguistic_analysis_deception_detection_techniques",
        "intelligence_linguistic_analysis_language_pattern_recognition",
        "intelligence_linguistic_analysis_sentiment_analysis_methods",
        "intelligence_open_source_intelligence_osint_tools_and_methods",
        "intelligence_open_source_intelligence_public_records_analysis",
        "intelligence_open_source_intelligence_social_media_monitoring",
        "intelligence_strategic_forecasting_future_trend_analysis",
        "intelligence_strategic_forecasting_geopolitical_simulations",
        "intelligence_strategic_forecasting_risk_prediction_fundamentals",
        "intelligence_strategic_forecasting_risk_prediction_models"
    ] as const
);

export default intelligenceDecks as CardDeckPathMap;
