import type { CardDeckPathMap } from "./common";
import { createShardLoaders } from "./common";

const webThreeDecks = createShardLoaders(
    "web_three",
    [
        "web_three_blockchain_fundamentals_blockchain_architecture",
        "web_three_blockchain_fundamentals_consensus_algorithms",
        "web_three_blockchain_fundamentals_cryptographic_primitives",
        "web_three_decentralized_applications_dapp_architecture",
        "web_three_decentralized_applications_oracle_and_data_feeds",
        "web_three_decentralized_applications_web_three_frontend_development",
        "web_three_decentralized_identity_and_privacy_confidential_transactions",
        "web_three_decentralized_identity_and_privacy_identity_on_blockchain",
        "web_three_decentralized_identity_and_privacy_zk_proofs_and_snarks",
        "web_three_smart_contract_development_gas_efficiency_optimization",
        "web_three_smart_contract_development_smart_contract_audits",
        "web_three_smart_contract_development_solidity_basics",
        "web_three_tokenomics_and_defi_defi_protocol_mechanics",
        "web_three_tokenomics_and_defi_governance_and_daos",
        "web_three_tokenomics_and_defi_token_design_and_distribution",
        "web_three_web_three_security_and_auditing_blockchain_pen_testing",
        "web_three_web_three_security_and_auditing_common_smart_contract_vulnerabilities",
        "web_three_web_three_security_and_auditing_web_three_security_frameworks"
    ] as const
);

export default webThreeDecks as CardDeckPathMap;
