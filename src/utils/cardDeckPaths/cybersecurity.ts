import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const cybersecurityDecks = createShardLoaders(
    "cybersecurity",
    [
        "cybersecurity_digital_forensics_forensic_image_analysis",
        "cybersecurity_digital_forensics_log_analysis_and_correlation",
        "cybersecurity_digital_forensics_malware_reversing",
        "cybersecurity_history_of_cybersecurity_early_network_security_policies",
        "cybersecurity_history_of_cybersecurity_evolution_of_browser_security",
        "cybersecurity_history_of_cybersecurity_future_trends_in_web_security",
        "cybersecurity_history_of_cybersecurity_history_of_cors_and_same_origin_policy",
        "cybersecurity_history_of_cybersecurity_major_cyber_attacks",
        "cybersecurity_malware_analysis_binary_disassembly_methods",
        "cybersecurity_malware_analysis_malware_detection_and_removal",
        "cybersecurity_malware_analysis_sandbox_analysis",
        "cybersecurity_network_security_firewall_configuration",
        "cybersecurity_network_security_intrusion_detection_methods",
        "cybersecurity_network_security_network_monitoring_tools",
        "cybersecurity_penetration_testing_network_penetration_tests",
        "cybersecurity_penetration_testing_physical_security_exploitation",
        "cybersecurity_penetration_testing_web_application_hacking",
        "cybersecurity_social_engineering_defense_corporate_security_training",
        "cybersecurity_social_engineering_defense_phishing_attack_simulation",
        "cybersecurity_social_engineering_defense_social_manipulation_tactics",
        "cybersecurity_threat_intelligence_dark_web_monitoring",
        "cybersecurity_threat_intelligence_incident_response_intelligence",
        "cybersecurity_threat_intelligence_osint_for_cyber_threats"
    ] as const
);

export default cybersecurityDecks as CardDeckPathMap;
