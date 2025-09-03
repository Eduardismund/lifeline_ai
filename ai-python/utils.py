"""Utility functions for the LifelineAI application"""

import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)


def setup_logging(log_level: str = "INFO"):
    """Configure logging for the application"""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def generate_report_filename(partner_name: str, prefix: str = "LifelineAI_Report") -> str:
    """Generate a unique filename for PDF reports"""
    safe_name = partner_name.replace(' ', '_').replace('/', '_').replace('\\', '_')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{prefix}_{safe_name}_{timestamp}.pdf"


def get_user_display_name(user_profile: Dict[str, Any]) -> str:
    """Get formatted display name from user profile"""
    first_name = user_profile.get('firstName', '').strip()
    last_name = user_profile.get('lastName', '').strip()
    return f"{first_name} {last_name}".strip() or "Unknown User"


def sanitize_html_content(content: str) -> str:
    """Clean up HTML content for PDF generation"""
    # Remove any remaining markdown formatting
    content = content.replace('**', '').replace('*', '')
    
    # Ensure proper HTML structure
    content = content.strip()
    
    return content


def format_relationship_type(relationship_type: str) -> str:
    """Format relationship type for display"""
    if not relationship_type:
        return "Unknown"
    
    return relationship_type.replace('_', ' ').title()


def format_relationship_status(status: str) -> str:
    """Format relationship status for display"""
    if not status:
        return "Unknown"
    
    return status.replace('_', ' ').title()