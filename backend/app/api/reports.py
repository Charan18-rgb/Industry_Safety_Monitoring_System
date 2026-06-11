"""Reports API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.reports.service import ReportService
from app.schemas.report import ReportCreate, ReportResponse, ReportListResponse
from app.models.report import ReportType, ReportStatus
from fastapi.responses import FileResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new report.
    """
    service = ReportService(db)
    report = await service.create_report(report_data)
    return report


@router.get("", response_model=ReportListResponse)
async def list_reports(
    report_type: Optional[ReportType] = Query(None, description="Filter by report type"),
    status: Optional[ReportStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db)
):
    """
    List reports with optional filters.
    """
    service = ReportService(db)
    skip = (page - 1) * page_size
    
    reports, total = await service.list_reports(
        report_type=report_type,
        status=status,
        skip=skip,
        limit=page_size
    )
    
    return ReportListResponse(
        total=total,
        reports=reports,
        page=page,
        page_size=page_size
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific report by ID.
    """
    service = ReportService(db)
    report = await service.get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download a generated report file.
    """
    service = ReportService(db)
    report = await service.get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report.file_path:
        raise HTTPException(status_code=400, detail="Report file not available")
    
    if report.status != ReportStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Report is not ready for download")
    
    return FileResponse(
        report.file_path,
        media_type="application/pdf",
        filename=f"{report.report_id}.pdf"
    )
