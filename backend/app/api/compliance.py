import logging
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.models.schemas import ObligationItem, PolicyMappingItem, RuleProposalDraft

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory store for interactive dashboard actions
INITIAL_OBLIGATIONS: List[ObligationItem] = [
    ObligationItem(
        id="OBL-2024-001",
        circular_id="CB-2024-09",
        circular_title="Prudential Liquidity & Operational Resilience Framework",
        clause="Section 3.2 - Daily Liquidity Coverage Ratio (LCR)",
        category="Liquidity & Prudential Standards",
        requirement_summary="All Tier-1 licensed banks must maintain a minimum Liquidity Coverage Ratio (LCR) of 105% in normal conditions, with daily stress testing submitted bi-weekly.",
        impacted_functions=["Treasury", "Market Risk", "Regulatory Reporting"],
        compliance_status="Pending Policy Revision",
        risk_rating="High",
        effective_date="2024-12-31"
    ),
    ObligationItem(
        id="OBL-2024-002",
        circular_id="CB-2024-09",
        circular_title="Prudential Liquidity & Operational Resilience Framework",
        clause="Section 5.1 - Third-Party Cloud Critical Services",
        category="Operational Resilience & Technology Risk",
        requirement_summary="Institutions must maintain an exit strategy and multi-cloud fallback redundancy for core transactional cloud workloads with RTO < 4 hours.",
        impacted_functions=["Information Technology", "Enterprise Architecture", "Vendor Risk"],
        compliance_status="Action Required",
        risk_rating="High",
        effective_date="2025-03-31"
    ),
    ObligationItem(
        id="OBL-2024-003",
        circular_id="AML-2024-04",
        circular_title="Anti-Money Laundering & Beneficial Ownership Verification",
        clause="Section 2.4 - Ultimate Beneficial Ownership (UBO) Threshold",
        category="Financial Crime & AML",
        requirement_summary="Mandatory verification of natural persons holding 10% or greater equity or voting control for high-risk corporate jurisdictions.",
        impacted_functions=["Financial Crime Compliance", "Client Onboarding", "KYC Operations"],
        compliance_status="Compliant",
        risk_rating="Medium",
        effective_date="2024-10-01"
    ),
    ObligationItem(
        id="OBL-2024-004",
        circular_id="CB-2024-09",
        circular_title="Prudential Liquidity & Operational Resilience Framework",
        clause="Section 7.3 - Board Risk Reporting Cadence",
        category="Corporate Governance & Oversight",
        requirement_summary="Chief Risk Officer must submit monthly liquidity stress variance dashboards directly to the Board Risk Committee.",
        impacted_functions=["Risk Management", "Board Secretariat"],
        compliance_status="Compliant",
        risk_rating="Low",
        effective_date="2024-11-15"
    )
]

INITIAL_MAPPINGS: List[PolicyMappingItem] = [
    PolicyMappingItem(
        id="MAP-01",
        circular_clause="CB-2024-09 §3.2 (LCR Minimum 105%)",
        circular_title="Prudential Liquidity Framework",
        policy_code="POL-TREAS-04",
        policy_title="Wholesale Liquidity & Asset-Liability Management Policy",
        policy_section="Section 4.1 (Liquidity Buffer Targets)",
        alignment_status="Gap Identified",
        gap_analysis="Internal bank policy currently mandates 100% LCR buffer. Circular mandates 105% minimum with daily reporting trigger.",
        recommended_action="Draft Rule Amendment: Elevate policy minimum from 100% to 105% and configure automated Treasury alerts at 108%."
    ),
    PolicyMappingItem(
        id="MAP-02",
        circular_clause="CB-2024-09 §5.1 (Cloud Critical Vendor RTO < 4h)",
        circular_title="Operational Resilience Framework",
        policy_code="POL-IT-09",
        policy_title="Third-Party Technology Vendor Risk & Business Continuity",
        policy_section="Section 8.2 (Disaster Recovery RTO/RPO SLA)",
        alignment_status="Update Required",
        gap_analysis="Current policy allows 8-hour RTO for tier-2 systems; circular classifies all core transaction processing as critical requiring RTO < 4h.",
        recommended_action="Update Business Impact Analysis classification matrix and renegotiate critical vendor SLA covenants."
    ),
    PolicyMappingItem(
        id="MAP-03",
        circular_clause="AML-2024-04 §2.4 (UBO Threshold 10%)",
        circular_title="Beneficial Ownership Verification",
        policy_code="POL-AML-01",
        policy_title="Global Anti-Money Laundering & KYC Standards",
        policy_section="Section 3.5 (Beneficial Ownership Identification)",
        alignment_status="Fully Aligned",
        gap_analysis="Bank policy already implemented a stringent 10% UBO screening threshold across all international corporate accounts in Q2.",
        recommended_action="Maintain current operational controls and confirm annual audit sampling confirms adherence."
    )
]

INITIAL_RULE_DRAFTS: List[RuleProposalDraft] = [
    RuleProposalDraft(
        id="DRAFT-RULE-001",
        title="Amendment to Wholesale Liquidity Threshold (LCR Target Elevation)",
        target_policy="POL-TREAS-04: Wholesale Liquidity & ALM Policy",
        clause_reference="POL-TREAS-04 §4.1 (Operating Liquidity Buffer)",
        current_rule_summary="The Bank shall maintain an ongoing Liquidity Coverage Ratio of at least 100% of net cash outflows over a 30-day stress horizon.",
        proposed_text="The Bank shall maintain an ongoing Liquidity Coverage Ratio of at least 105% of net cash outflows over a 30-day stress horizon. Any drawdown below 108% requires immediate escalation to the CRO and Head of Treasury.",
        regulatory_rationale="Mandated by Central Bank Circular CB-2024-09 Section 3.2. Evidence cited in regulatory gazette notice.",
        status="DRAFT - Requires Human Approval",
        evidence_sources=["CB-2024-09 Section 3.2 (Page 4)", "Basel III Liquidity Monitoring Metric v3"],
        impact_level="High",
        created_at="2024-10-25 14:30"
    ),
    RuleProposalDraft(
        id="DRAFT-RULE-002",
        title="Critical Cloud Vendor Disaster Recovery SLA Standard",
        target_policy="POL-IT-09: Technology Vendor Risk Management",
        clause_reference="POL-IT-09 §8.2 (Cloud Outage Recovery Standards)",
        current_rule_summary="Outage recovery time objectives (RTO) for core banking vendors must not exceed 8 hours.",
        proposed_text="Recovery time objective (RTO) for all Tier-1 core transaction processing cloud infrastructure shall not exceed 4 hours, verified through annual live failover simulation.",
        regulatory_rationale="Required by Operational Resilience Circular CB-2024-09 Section 5.1.",
        status="DRAFT - Requires Human Approval",
        evidence_sources=["CB-2024-09 Section 5.1 (Page 8)"],
        impact_level="High",
        created_at="2024-10-26 11:15"
    )
]

stored_drafts = list(INITIAL_RULE_DRAFTS)

@router.get("/compliance/obligations", response_model=List[ObligationItem])
def get_obligations():
    return INITIAL_OBLIGATIONS

@router.get("/compliance/policy-mappings", response_model=List[PolicyMappingItem])
def get_policy_mappings():
    return INITIAL_MAPPINGS

@router.get("/compliance/rule-drafts", response_model=List[RuleProposalDraft])
def get_rule_drafts():
    return stored_drafts

class DraftActionRequest(BaseModel):
    action: str  # "APPROVE_FOR_COMMITTEE_REVIEW", "REJECT", "REQUEST_LEGAL_AMENDMENT"
    reviewed_by: str
    comments: str

@router.post("/compliance/rule-drafts/{draft_id}/action")
def update_draft_action(draft_id: str, req: DraftActionRequest):
    for draft in stored_drafts:
        if draft.id == draft_id:
            if req.action == "APPROVE_FOR_COMMITTEE_REVIEW":
                draft.status = "APPROVED FOR RISK COMMITTEE REVIEW"
            elif req.action == "REJECT":
                draft.status = "REJECTED BY COMPLIANCE OFFICER"
            elif req.action == "REQUEST_LEGAL_AMENDMENT":
                draft.status = "LEGAL REVIEW REQUESTED"
            return {
                "success": True,
                "message": f"Rule proposal '{draft.title}' updated with action: {req.action}",
                "draft": draft
            }
    raise HTTPException(status_code=404, detail=f"Draft {draft_id} not found.")
