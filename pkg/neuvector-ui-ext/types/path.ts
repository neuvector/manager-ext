export const PATH = {
    // TOKEN_AUTH: 'assets/mockdata/token_auth_server.json',
    VERSION_URL: 'app/metadata/js-version.json',
    // Load from remote server, replace with remote API once server is ready
    KEEP_ALIVE_URL: 'heartbeat', //auth
    CONFIG_URL: 'config', //config
    CONFIG_V2_URL: 'config-v2', //config
    CONFIG_IMPORT_URL: 'file/config', //config
    DASHBOARD_SUMMARY_URL: 'summary', //common
    NETWORK_INFO_URL: 'network/graph', //graph
    NETWORK_LAYOUT_URL: 'network/graph/layout', //graph
    NETWORK_BLACKLIST_URL: '/network/graph/blacklist', //graph
    POLICY_GRAPH_URL: 'policy/graph', //graph
    NODES_URL: 'host', //assets
    NODE_WORKLOADS_URL: 'host/workload', //assets
    ENFORCER_URL: 'enforcer', //assets
    CONTROLLER_URL: 'controller', //assets
    SCANNER_URL: 'scanner', //assets
    PLAIN_CONTAINER_URL: 'container', //assets
    CONTAINER_URL: 'workload', //assets
    SCANNED_CONTAINER_URL: 'workload/scanned', //assets
    CONTAINER_COMPLIANCE_URL: 'workload/compliance', //risks
    NODE_COMPLIANCE_URL: 'host/compliance', //risks
    CONTAINER_BY_ID: 'workload/workload-by-id', //assets
    CONTAINER_PROCESS_URL: 'container/process', //assets
    CONTAINER_PROCESS_HISTORY_URL: 'container/processHistory', //assets
    EVENT_URL: 'event', //events
    USERS_URL: 'user', //auth
    LICENSE_URL: 'license', //auth
    LDAP_URL: 'server', //auth
    LOGIN_URL: 'auth', //auth
    EULA_URL: 'eula', //auth
    TOKEN_AUTH: 'token_auth_server', //auth
    SAML_SLO_URL: 'token_auth_server_slo', //auth
    OIDC_AUTH: 'openId_auth', //auth
    LICENSE_LOAD_URL: 'license/update', //auth
    GROUP_URL: 'group', //poilcy
    SERVICE_URL: 'service', //poilcy
    PROCESS_PROFILE_URL: 'processProfile', //poilcy
    FILE_PROFILE_URL: 'fileProfile', //poilcy
    FILE_PREDEFINED_PROFILE_URL: 'filePreProfile', //poilcy
    POLICY_URL: 'policy', //poilcy
    POLICY_APP_URL: 'policy/application', //poilcy
    POLICY_RULE_URL: 'policy/rule', //poilcy
    VUL_ASSET_URL: 'vulasset', //risks
    RISK_CVE_URL: 'risk/cve', //risks
    RISK_COMPLIANCE_URL: 'risk/compliance', //risks
    RISK_COMPLIANCE_NIST_URL: 'risk/complianceNIST', //risks
    COMPLIANCE_PROFILE_URL: 'risk/compliance/profile', //risks
    EXPORT_COMPLIANCE_PROFILE: 'risk/compliance/profile/export', //risks
    IMPORT_COMPLIANCE_PROFILE: 'risk/compliance/profile/import', //risks
    COMPLIANCE_TEMPLATE_URL: 'risk/compliance/template', //risks
    COMPLIANCE_FILTER_URL: 'risk/compliance/available_filter', //risks
    SCAN_URL: 'scan/workload', //assets
    SCAN_HOST_URL: 'scan/host', //assets
    SCAN_PLATFORM_URL: 'scan/platform', //assets
    DOMAIN_URL: 'domain', //assets
    SCAN_CONFIG_URL: 'scan/config', //assets
    SCAN_CONTAINER_URL: 'scan/workload', //assets
    REGISTRY_SCAN_URL: 'scan/registry', //assets
    REGISTRY_SCAN_REPO_URL: 'scan/registry/repo', //assets
    REGISTRY_SCAN_IMAGE_URL: 'scan/registry/image', //assets
    REGISTRY_TYPE_URL: 'scan/registry/type', //assets
    REGISTRY_TEST: 'scan/registry/test', //assets
    SESSION_URL: 'network/session', //graph
    CONVERSATION_HISTORY_URL: 'network/history', //graph
    CONVERSATION_SNAPSHOT_URL: 'network/conversation', //graph
    CONVERSATION_ENDPOINT_URL: 'network/endpoint', //graph
    SYSTEM_CONFIG_URL: 'file/config', //config
    SYSTEM_DEBUG_URL: 'file/debug', //config
    DEBUG_CHECK_URL: 'file/debug/check', //config
    SNIFF_URL: 'sniffer', //graph
    SNIFF_PCAP_URL: 'sniffer/pcap', //graph
    RESPONSE_POLICY_URL: 'responsePolicy', //policy
    UNQUARANTINE_URL: 'unquarantine', //policy
    CONDITION_OPTION_URL: 'conditionOption', //policy
    RESPONSE_RULE_URL: 'responseRule', //policy
    GROUP_LIST_URL: 'group-list', //policy
    AUDIT_URL: 'audit', //events
    DASHBOARD_SCORES_URL: 'dashboard/scores', //dashboard
    DASHBOARD_DETAILS_URL: 'dashboard/details', //dashboard
    DASHBOARD_NOTIFICATIONS_URL: 'dashboard/notifications', //dashboard
    SECURITY_EVENTS_URL_2: 'security-events2', //events
    ADMISSION_URL: 'admission/rules', //policy
    ADMISSION_SINGLE_URL: 'admission/rule', //policy
    ADMCTL_CONDITION_OPTION_URL: 'admission/options', //policy
    ADMCTL_STATE_URL: 'admission/state', //policy
    ADM_CTRL_K8S_TEST: 'admission/test', //policy
    LAYER_URL: 'scan/registry/layer', //assets
    FED_MEMBER_URL: 'fed/member', //multi-cluster
    FED_DEPLOY: 'fed/deploy', //multi-cluster
    FED_SUMMARY: 'fed/summary', //multi-cluster
    FED_PROMOTE_URL: 'fed/promote', //multi-cluster
    FED_DEMOTE_URL: 'fed/demote', //multi-cluster
    FED_JOIN_TOKEN: 'fed/join_token', //multi-cluster
    FED_JOIN_URL: 'fed/join', //multi-cluster
    FED_LEAVE_URL: 'fed/leave', //multi-cluster
    FED_REMOVE_URL: 'fed', //multi-cluster
    FED_CFG_URL: 'fed/config', //multi-cluster
    FED_REDIRECT_URL: 'fed/switch', //multi-cluster
    DLP_SENSORS_URL: 'dlp/sensor', //policy
    DLP_SENSORS_EXPORT_URL: 'dlp/sensor/export', //policy
    DLP_SENSORS_IMPORT_URL: 'dlp/sensor/import', //policy
    DLP_GROUPS_URL: 'dlp/group', //policy
    WAF_SENSORS_URL: 'waf/sensor', //policy
    WAF_SENSORS_EXPORT_URL: 'waf/sensor/export', //policy
    WAF_SENSORS_IMPORT_URL: 'waf/sensor/import', //policy
    WAF_GROUPS_URL: 'waf/group', //policy
    GROUP_EXPORT_URL: 'group/export', //policy
    GROUP_SCRIPT_URL: 'group/custom_check', //policy
    IP_GEO_URL: 'ip-geo', //common
    IBM_SETUP_URL: 'ibmsa_setup', //config
    PERMISSION_OPTIONS: 'role2/permission-options', //auth
    ROLES: 'role2', //auth
    APIKEY_URL: 'api_key', //auth
    SINGLE_ENFORCER: 'single-enforcer', //assets
    USAGE_REPORT_URL: 'usage', //config
    MULTI_CLUSTER_SUMMARY: 'multi-cluster-summary', //multi-cluster
    PASSWORD_PROFILE: 'password-profile', //auth
    PUBLIC_PASSWORD_PROFILE: 'password-profile/public', //auth
    USER_BLOCK_URL: 'password-profile/user', //auth
    SELF_URL: 'self', //auth
    WEBHOOK: 'webhook', //config
    IMPORT_GROUP_URL: 'group/import', //policy
    ADMISSION_TEST_URL: 'admission/matching-test', //policy
    MGR_VERSION: 'version', //common
    GRAVATAR: 'gravatar', //common
    EXPORT_ADM_CTRL: 'admission/export', //policy
    IMPORT_ADM_CTRL: 'admission/import', //policy
    PROMOTE_NETWORK_RULE: 'policy/promote', //policy
    PROMOTE_ADMISSION_RULE: 'admission/promote', //policy
    CVE_PROFILE: 'risk/cve/profile', //risks
    CVE_PROFILE_ENTRY: 'risk/cve/profile/entry', //risks
    EXPORT_CVE_PROFILE: 'risk/cve/profile/export', //risks
    IMPORT_CVE_PROFILE: 'risk/cve/profile/import', //risks
    ASSETS_VULS_URL: 'risk/cve/assets-view',
    SYSTEM_RBAC_URL: 'dashboard/rbac', //dashboard
    SERVICE_ALL: 'service/all', //policy
    DEBUG_URL: 'debug', //config
    THREAT_URL: 'threat',
    HEART_BEAT_URL: 'heartbeat',
    SIGNATURE_URL: 'sigstore',
    VERIFIER_URL: 'verifier',
    SIGNATURE_IMPORT_URL: 'signature/import',
    SIGNATURE_EXPORT_URL: 'signature/export',
    CSP_SUPPORT_URL: 'csp-support',
    REBRAND: 'rebrand',
    NOTIFICATION_PERSIST_URL: 'notification/accept',
    REMOTE_REPO_URL: 'remote_repository',
  }
  