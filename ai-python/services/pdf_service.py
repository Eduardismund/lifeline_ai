"""Service for PDF generation using Foxit API"""

import requests
import time
import logging
from typing import Dict, Any
from datetime import datetime
from fastapi import HTTPException
from config import (
    FOXIT_BASE_URL, FOXIT_CLIENT_ID, FOXIT_CLIENT_SECRET,
    PDF_TIMEOUT, PDF_CHECK_INTERVAL, PDF_MAX_ATTEMPTS
)

logger = logging.getLogger(__name__)


def get_foxit_headers() -> dict:
    """Get headers for Foxit API"""
    return {
        "client_id": FOXIT_CLIENT_ID,
        "client_secret": FOXIT_CLIENT_SECRET,
        "Content-Type": "application/json"
    }


def get_upload_headers() -> dict:
    """Get headers for Foxit upload (no Content-Type)"""
    return {
        "client_id": FOXIT_CLIENT_ID,
        "client_secret": FOXIT_CLIENT_SECRET
    }


async def create_html_document(
    narrative_content: str,
    user_profile: Dict[str, Any],
    relationship_bond: Dict[str, Any]
) -> str:
    """Create HTML document with styling and narrative content"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>LifelineAI Relationship Analysis Report</title>
        <style>
            @page {{
                margin: 0.5in 0.75in;
                size: letter;
            }}
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: 'Segoe UI', 'Arial', sans-serif;
                font-size: 13px;
                line-height: 1.7;
                color: #2c3e50;
                max-width: 100%;
                margin: 0;
                padding: 20px;
                background: white;
            }}
            .report-header {{
                background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
                color: white;
                padding: 40px 30px;
                border-radius: 0;
                margin: -20px -20px 50px -20px;
                text-align: center;
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                position: relative;
            }}
            .report-header::after {{
                content: '';
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 20px solid transparent;
                border-right: 20px solid transparent;
                border-top: 10px solid #283593;
            }}
            .report-header h1 {{
                margin: 0 0 15px 0;
                font-size: 32px;
                font-weight: 400;
                font-family: 'Arial', sans-serif;
                letter-spacing: 0.5px;
            }}
            .report-info {{
                font-size: 14px;
                opacity: 0.95;
                line-height: 1.4;
                font-weight: 300;
            }}
            h2 {{
                margin: 40px 0 20px 0;
                font-size: 20px;
                font-weight: 700;
                color: #1a237e;
                border-bottom: 3px solid #3f51b5;
                padding-bottom: 10px;
            }}
            h3 {{
                margin: 30px 0 15px 0;
                font-size: 17px;
                font-weight: 600;
                color: #283593;
            }}
            p {{
                margin: 0 0 20px 0;
                text-align: left;
                font-size: 14px;
                line-height: 1.8;
                text-indent: 0 !important;
                padding-left: 0 !important;
            }}
            ul {{
                margin: 20px 0;
                padding-left: 30px;
            }}
            li {{
                margin-bottom: 10px;
                line-height: 1.7;
            }}
            .highlight-box {{
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-left: 4px solid #1976d2;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .warning-box {{
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border-left: 4px solid #f57c00;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .success-box {{
                background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                border-left: 4px solid #388e3c;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .footer {{
                margin-top: 60px;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 8px;
                font-size: 12px;
                color: #6c757d;
                text-align: center;
                border: 1px solid #dee2e6;
            }}
            .important-notice {{
                background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
                border: 1px solid #ff8f00;
                border-left: 5px solid #ff6f00;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 2px 8px rgba(255, 143, 0, 0.1);
            }}
            .important-notice h3 {{
                color: #e65100;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: 600;
                font-family: 'Arial', sans-serif;
            }}
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1>Relationship Analysis Report</h1>
            <div class="report-info">
                Generated: {datetime.now().strftime("%B %d, %Y")}<br>
                Prepared for: {user_profile.get('firstName', '')} {user_profile.get('lastName', '')}<br>
                About your relationship with: {relationship_bond.get('partnerName', 'N/A')}
            </div>
        </div>
        
        {narrative_content}
        
        <div class="important-notice">
            <h3>Important Notice</h3>
            <p>This analysis is generated by artificial intelligence based on the information you provided. While we strive for accuracy, this should not replace professional counseling or therapy. If you are in immediate danger, please contact emergency services immediately.</p>
        </div>
        
        <div class="footer">
            <p style="font-weight: bold;">Generated by LifelineAI</p>
            <p>Report ID: LA-{datetime.now().strftime('%Y%m%d-%H%M%S')} | Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            <p style="margin-top: 15px; font-size: 11px; font-style: italic;">This report is confidential and intended solely for personal use. Please keep it secure.</p>
        </div>
    </body>
    </html>
    """
    
    return html_content


async def convert_html_to_pdf(html_content: str, filename: str) -> bytes:
    """Convert HTML to PDF using Foxit API"""
    
    try:
        # Step 1: Upload HTML
        logger.info("Uploading HTML to Foxit API")
        upload_url = f"{FOXIT_BASE_URL}/documents/upload"
        upload_headers = get_upload_headers()
        
        files = {
            'file': ('report.html', html_content.encode('utf-8'), 'text/html')
        }
        
        upload_response = requests.post(
            upload_url,
            headers=upload_headers,
            files=files,
            timeout=30
        )
        
        if upload_response.status_code != 200:
            logger.error(f"Upload failed: {upload_response.status_code} - {upload_response.text}")
            raise HTTPException(status_code=500, detail=f"Failed to upload HTML: {upload_response.text}")
        
        document_id = upload_response.json().get('documentId')
        if not document_id:
            raise HTTPException(status_code=500, detail="Failed to get document ID")
        
        logger.info(f"Document uploaded with ID: {document_id}")
        
        # Step 2: Convert to PDF
        logger.info("Converting HTML to PDF")
        convert_url = f"{FOXIT_BASE_URL}/documents/create/pdf-from-html"
        headers = get_foxit_headers()
        
        convert_response = requests.post(
            convert_url,
            headers=headers,
            json={"documentId": document_id},
            timeout=30
        )
        
        if convert_response.status_code not in [200, 202]:
            logger.error(f"Conversion failed: {convert_response.status_code} - {convert_response.text}")
            raise HTTPException(status_code=500, detail=f"PDF conversion failed: {convert_response.text}")
        
        task_id = convert_response.json().get('taskId')
        if not task_id:
            raise HTTPException(status_code=500, detail="Failed to get task ID")
        
        logger.info(f"Conversion task created with ID: {task_id}")
        
        # Step 3: Check status and download
        status_url = f"{FOXIT_BASE_URL}/tasks/{task_id}"
        
        for attempt in range(PDF_MAX_ATTEMPTS):
            time.sleep(PDF_CHECK_INTERVAL)
            
            status_response = requests.get(
                status_url,
                headers=upload_headers,
                timeout=30
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                status = status_data.get('status')
                progress = status_data.get('progress', 0)
                
                logger.info(f"Task status: {status}, Progress: {progress}%")
                
                if status == 'COMPLETED':
                    result_doc_id = status_data.get('resultDocumentId')
                    
                    if not result_doc_id:
                        raise HTTPException(status_code=500, detail="No result document ID")
                    
                    # Download PDF
                    download_url = f"{FOXIT_BASE_URL}/documents/{result_doc_id}/download"
                    download_response = requests.get(
                        download_url,
                        headers=upload_headers,
                        params={"filename": filename.replace('.pdf', '')},
                        timeout=PDF_TIMEOUT
                    )
                    
                    if download_response.status_code != 200:
                        raise HTTPException(status_code=500, detail="Failed to download PDF")
                    
                    logger.info("PDF downloaded successfully!")
                    return download_response.content
                    
                elif status == 'FAILED':
                    raise HTTPException(status_code=500, detail=f"PDF conversion failed: {status_data}")
        
        # Timeout
        raise HTTPException(status_code=500, detail="PDF conversion timed out")
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")