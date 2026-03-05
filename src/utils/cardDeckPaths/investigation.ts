import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const investigationDecks = createShardLoaders(
    "investigation",
    [
        "investigation_criminal_profiling_behavioral_profiling_methods",
        "investigation_criminal_profiling_offender_typologies",
        "investigation_criminal_profiling_threat_assessment",
        "investigation_cybercrime_analysis_cyber_fraud_detection",
        "investigation_cybercrime_analysis_dark_web_investigations",
        "investigation_cybercrime_analysis_malware_analysis",
        "investigation_digital_forensics_computer_forensic_methods",
        "investigation_digital_forensics_mobile_device_exploitation",
        "investigation_digital_forensics_network_packet_analysis",
        "investigation_financial_crimes_financial_statement_analysis",
        "investigation_financial_crimes_fraud_detection_techniques",
        "investigation_financial_crimes_money_laundering_patterns",
        "investigation_forensic_investigation_crime_scene_processing",
        "investigation_forensic_investigation_dna_and_fingerprint_analysis",
        "investigation_forensic_investigation_forensic_lab_procedures",
        "investigation_homicide_investigation_cause_of_death_forensics",
        "investigation_homicide_investigation_homicide_case_studies",
        "investigation_homicide_investigation_suspect_interview_methods"
    ] as const
);

export default investigationDecks as CardDeckPathMap;
