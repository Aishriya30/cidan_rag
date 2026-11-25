import logging
from pathlib import Path
from datetime import datetime
import docx
from app.config import settings
from app.models.schemas import DocumentItem
from app.services.extractor import extract_text_from_file
from app.services.chunker import chunk_document_pages
from app.services.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.services.doc_registry import doc_registry

logger = logging.getLogger(__name__)

FIXTURES_DIR = settings.BASE_DIR / "fixtures"
FIXTURES_DIR.mkdir(parents=True, exist_ok=True)

CIRCULAR_DOCX = FIXTURES_DIR / "SYNTHETIC_CIRCULAR_CB_2024_09.docx"
POLICY_DOCX = FIXTURES_DIR / "SYNTHETIC_BANK_POLICY_POL_TREAS_04.docx"
RBI_IT_DOCX = FIXTURES_DIR / "CIDAN_RBI_IT_CYBERSECURITY_FRAMEWORK.docx"
INTERNAL_RULES_DOCX = FIXTURES_DIR / "CIDAN_BANK_INTERNAL_RULES_CATALOG.docx"

def generate_synthetic_fixtures():
    """
    Creates clearly labeled synthetic test fixtures to demonstrate the RAG pipeline.
    Synthetic fixtures are never presented as genuine circulars or bank policies.
    """
    # 1. Synthetic Circular
    if not CIRCULAR_DOCX.exists():
        doc = docx.Document()
        doc.add_heading("[SYNTHETIC TEST FIXTURE - NOT A REAL REGULATORY CIRCULAR]", level=1)
        doc.add_paragraph("NOTICE: This document is a synthetic test fixture created strictly for software testing and demonstration purposes. It does not represent actual regulatory or legal advice.")
        
        doc.add_heading("Central Bank Circular No. CB-2024-09", level=2)
        doc.add_paragraph("Subject: Prudential Liquidity Standards and Operational Resilience Guidelines for Commercial Banks.")
        doc.add_paragraph("Issuance Date: October 15, 2024 | Effective Compliance Date: December 31, 2024")

        doc.add_heading("Section 1: Legislative Scope & Applicability", level=3)
        doc.add_paragraph("This circular applies to all licensed Tier-1 and Tier-2 Commercial Banks operating within the jurisdiction. The purpose is to enhance systemic resilience against wholesale liquidity shocks and digital operational disruptions.")

        doc.add_heading("Section 2: Minimum Liquidity Coverage Ratio (LCR) Mandate", level=3)
        doc.add_paragraph("Commercial banks shall maintain an ongoing Liquidity Coverage Ratio (LCR) of not less than 105% under standard market conditions, elevating the previous 100% threshold. The High-Quality Liquid Assets (HQLA) portfolio must comprise at least 70% Level 1 unencumbered sovereign securities.")
        doc.add_paragraph("Daily monitoring is required. In the event of a variance where the LCR dips below 108%, immediate written notice must be submitted to the Banking Supervision Department within 24 hours.")

        doc.add_heading("Section 3: Net Stable Funding Ratio (NSFR)", level=3)
        doc.add_paragraph("All covered institutions must maintain a Net Stable Funding Ratio (NSFR) of at least 100% on an ongoing basis. Available Stable Funding (ASF) must be appropriately weighted against long-term asset commitments.")

        doc.add_heading("Section 4: Operational Resilience & Third-Party Cloud Standards", level=3)
        doc.add_paragraph("Covered banks utilizing public or hybrid cloud infrastructure for critical transaction processing must guarantee a Recovery Time Objective (RTO) of less than 4 hours and a Recovery Point Objective (RPO) of zero for core ledger entries.")
        doc.add_paragraph("Banks must execute live failover testing at least annually and maintain an auditable multi-cloud exit strategy.")

        doc.add_heading("Section 5: Supervisory Reporting & Board Governance", level=3)
        doc.add_paragraph("The Chief Risk Officer (CRO) shall submit a monthly liquidity and operational risk dashboard directly to the Board Risk Committee. Bi-weekly stress test disclosures must be transmitted through the Central Regulatory Reporting Gateway.")
        doc.add_paragraph("Failure to meet reporting timelines shall incur supervisory enforcement actions and financial penalties as stipulated in Banking Law Article 44.")

        doc.save(CIRCULAR_DOCX)
        logger.info(f"Created synthetic fixture: {CIRCULAR_DOCX.name}")

    # 2. Synthetic Internal Bank Policy
    if not POLICY_DOCX.exists():
        doc = docx.Document()
        doc.add_heading("[SYNTHETIC TEST FIXTURE - INTERNAL BANK POLICY]", level=1)
        doc.add_paragraph("CONFIDENTIAL - FOR INTERNAL COMPLIANCE TESTING ONLY. Synthetic document created for CIDAN testing.")

        doc.add_heading("Policy Document: POL-TREAS-04", level=2)
        doc.add_paragraph("Title: Wholesale Liquidity Management & Balance Sheet Strategy Policy (Version 3.8)")
        doc.add_paragraph("Department Owner: Treasury & Balance Sheet Management | Approved by: Board Risk Committee")

        doc.add_heading("Section 1: Policy Objectives & Asset-Liability Committee (ALCO) Oversight", level=3)
        doc.add_paragraph("This policy defines the bank's appetite for short-term liquidity risk, intraday liquidity buffers, and emergency contingency funding. The Asset-Liability Committee (ALCO) convenes monthly to review key ratios and market trends.")

        doc.add_heading("Section 2: Liquidity Buffer Targets & Baseline Standards", level=3)
        doc.add_paragraph("Under current bank guidelines (v3.8), the Treasury Department is mandated to hold a minimum Liquidity Coverage Ratio of 100% of net cash outflows over a 30-day liquidity stress horizon. Surplus liquidity is held in central bank reserves and eligible government treasury bills.")

        doc.add_heading("Section 3: Escalation Thresholds & Internal Alerts", level=3)
        doc.add_paragraph("If the bank's projected LCR falls below 102%, the Treasurer must notify the Chief Financial Officer and convene an extraordinary ALCO review session within three business days.")

        doc.add_heading("Section 4: Stress Testing & Contingency Funding Plan (CFP)", level=3)
        doc.add_paragraph("The bank conducts quarterly liquidity stress simulations evaluating combined institution-specific and market-wide liquidity crunches. The Contingency Funding Plan defines available committed credit lines and secondary liquidity sources.")

        doc.save(POLICY_DOCX)
        logger.info(f"Created synthetic fixture: {POLICY_DOCX.name}")

    # 3. CIDAN RBI Master Direction on IT & Cyber Security
    if not RBI_IT_DOCX.exists():
        doc = docx.Document()
        doc.add_heading("[CIDAN REGULATORY MANDATE - RBI IT & CYBER SECURITY CONTROLS]", level=1)
        doc.add_paragraph("Reserve Bank of India Master Direction on Information Technology Governance, Risk, Security and Controls (Updated 2024).")

        doc.add_heading("Section 1: Data Localization & Sovereignty", level=2)
        doc.add_paragraph("All customer Personal Identifiable Information (PII), account ledgers, biometric hashes, and transaction trails originating within domestic borders must reside solely on domestic cloud servers. Cross-border exfiltration without prior written regulatory exemption is prohibited.")

        doc.add_heading("Section 2: Cryptographic Controls & Access Governance", level=2)
        doc.add_paragraph("All customer PII and sensitive data at rest must be encrypted using AES-256 GCM or higher. Multi-Factor Authentication (MFA) is strictly mandatory for all administrative and core banking database access sessions.")

        doc.add_heading("Section 3: Audit Trail & Retention Requirements", level=2)
        doc.add_paragraph("Banks must maintain tamper-evident, cryptographically signed audit logs for all administrative sessions and financial transactions. Logs must be archived for a minimum period of 5 years.")

        doc.add_heading("Section 4: Statutory Penalties under Banking Regulation Act", level=2)
        doc.add_paragraph("Non-compliance or failure to implement mandated security controls triggers enforcement actions under Section 46 and Section 47A(1)(c) of the Banking Regulation Act, 1949, with statutory penalties up to INR 1 Crore (INR 10 Million) per default plus recurring fines of INR 100,000 per day of persisting failure.")

        doc.save(RBI_IT_DOCX)
        logger.info(f"Created CIDAN fixture: {RBI_IT_DOCX.name}")

    # 4. CIDAN Bank Internal Rules Catalog
    if not INTERNAL_RULES_DOCX.exists():
        doc = docx.Document()
        doc.add_heading("[CIDAN BANK INTERNAL COMPLIANCE RULES CATALOG]", level=1)
        doc.add_paragraph("Active enterprise banking compliance rules deployed across MongoDB Atlas, PostgreSQL, and Core Banking Gateways.")

        doc.add_heading("RULE-DATA-001: Cross-Border Customer PII Data Sovereignty & GDPR Shield", level=2)
        doc.add_paragraph("Mandatory requirement: All customer PII and transaction records originating from domestic jurisdictions must remain encrypted at rest using AES-256 and cannot be transferred across foreign borders without formal supervisory clearance. Deployed on MongoDB Atlas collection cidan_bank.compliance_rules.")

        doc.add_heading("RULE-AML-001: Currency Transaction Reporting (CTR) Threshold", level=2)
        doc.add_paragraph("Any single cash transaction or aggregated transactions exceeding INR 1,000,000 ($10,000) within 24 hours must trigger an automatic CTR filing within 7 banking days.")

        doc.add_heading("RULE-KYC-002: Customer Identification & Beneficial Ownership", level=2)
        doc.add_paragraph("Mandatory identity verification prior to onboarding. Beneficial owners holding 25% or greater equity must be screened against PEP and international watchlists with re-KYC every 24 months.")

        doc.add_heading("RULE-SANCTION-003: Real-Time Wire Sanctions Screening", level=2)
        doc.add_paragraph("All inbound and outbound wire messages (SWIFT MT/MX, ISO 20022) must undergo real-time screening against UN, OFAC, and local FIU negative lists prior to final ledger settlement.")

        doc.add_heading("RULE-LEND-004: Commercial Real Estate LTV Ceiling", level=2)
        doc.add_paragraph("Commercial real estate loans must adhere to a statutory 75% LTV ceiling. Any portfolio deviation requires unanimous Board Risk Committee approval.")

        doc.save(INTERNAL_RULES_DOCX)
        logger.info(f"Created CIDAN fixture: {INTERNAL_RULES_DOCX.name}")

def ensure_seed_fixtures_present() -> bool:
    """Returns True when the required synthetic fixtures are present in the live collection."""
    if vector_store.get_count() == 0:
        return False

    try:
        existing = vector_store.collection.get(include=["metadatas"])
    except Exception:
        return False

    filenames = set()
    metadatas = existing.get("metadatas", []) if isinstance(existing, dict) else []
    for meta in metadatas:
        if isinstance(meta, dict):
            filename = meta.get("filename")
            if filename:
                filenames.add(filename)

    needed = {CIRCULAR_DOCX.name, POLICY_DOCX.name, RBI_IT_DOCX.name, INTERNAL_RULES_DOCX.name}
    return needed.issubset(filenames)


def seed_database_if_empty():
    """
    Seeds ChromaDB with synthetic test fixtures if the vector store is empty or stale.
    """
    generate_synthetic_fixtures()

    current_count = vector_store.get_count()
    if current_count > 0 and ensure_seed_fixtures_present():
        logger.info(f"Vector store already contains the required seeded fixtures ({current_count} chunks). Skipping auto-seed.")
        return

    if current_count > 0:
        logger.warning("Vector store contains stale or missing synthetic fixture data. Resetting collection before reseeding.")
        try:
            existing = vector_store.collection.get(include=["ids"])
            ids = existing.get("ids", [])
            if ids:
                vector_store.collection.delete(ids=ids)
        except Exception as exc:
            logger.warning(f"Could not clear stale collection: {exc}")

    logger.info("Seeding initial synthetic test fixtures...")

    fixtures_to_index = [
        (CIRCULAR_DOCX, "Regulatory Circular", "SYNTHETIC_CIRCULAR_CB_2024_09.docx"),
        (POLICY_DOCX, "Internal Bank Policy", "SYNTHETIC_BANK_POLICY_POL_TREAS_04.docx"),
        (RBI_IT_DOCX, "Regulatory Circular", "CIDAN_RBI_IT_CYBERSECURITY_FRAMEWORK.docx"),
        (INTERNAL_RULES_DOCX, "Internal Bank Policy", "CIDAN_BANK_INTERNAL_RULES_CATALOG.docx")
    ]

    for file_path, doc_type, filename in fixtures_to_index:
        try:
            doc_id = f"doc_{file_path.stem.lower()[:12]}"
            pages_text = extract_text_from_file(file_path, filename)
            chunks = chunk_document_pages(
                pages_text=pages_text,
                doc_id=doc_id,
                filename=filename,
                doc_type=doc_type,
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP
            )
            chunk_texts = [c["content"] for c in chunks]
            embeddings = embedding_service.embed_texts(chunk_texts)
            indexed_count = vector_store.add_chunks(chunks, embeddings)

            item = DocumentItem(
                doc_id=doc_id,
                filename=filename,
                doc_type=doc_type,
                file_size_bytes=file_path.stat().st_size,
                page_count=len(pages_text),
                chunk_count=indexed_count,
                upload_timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                indexing_status="indexed",
                is_synthetic_fixture=True,
                summary="Synthetic test fixture automatically indexed for testing and demonstration."
            )
            doc_registry.upsert_document(item)
            logger.info(f"Successfully seeded {filename} ({indexed_count} chunks)")
        except Exception as e:
            logger.error(f"Error seeding {filename}: {e}")
