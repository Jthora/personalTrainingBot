import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const agenciesDecks = createShardLoaders(
    "agencies",
    [
        "agencies_cia_training_counterintelligence_tactics",
        "agencies_cia_training_spy_tradecraft",
        "agencies_cia_training_undercover_surveillance",
        "agencies_fbi_training_criminal_profiling_methods",
        "agencies_fbi_training_cyber_fraud_detection",
        "agencies_fbi_training_forensic_analysis",
        "agencies_homeland_security_border_control_tactics",
        "agencies_homeland_security_emergency_response_drills",
        "agencies_homeland_security_terrorist_threat_analysis",
        "agencies_interpol_training_criminal_network_tracking",
        "agencies_interpol_training_cross_border_smuggling_cases",
        "agencies_interpol_training_international_law_basics",
        "agencies_secret_service_emergency_evasion_maneuvers",
        "agencies_secret_service_financial_fraud_detection",
        "agencies_secret_service_protective_service_tactics"
    ] as const
);

export default agenciesDecks as CardDeckPathMap;
