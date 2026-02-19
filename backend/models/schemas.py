from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# --- Enums ---

class UserRole(str, Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class DocumentStatus(str, Enum):
    processing = "processing"
    completed = "completed"
    failed = "failed"


# --- Auth ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole = UserRole.analyst
    company_id: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    company_id: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Company ---

class CompanyCreate(BaseModel):
    name: str
    industry: str
    region: str


class CompanyResponse(BaseModel):
    id: str
    name: str
    industry: str
    region: str
    created_at: datetime


# --- Document ---

class DocumentResponse(BaseModel):
    id: str
    company_id: str
    uploaded_by: str
    file_name: str
    file_url: str
    status: DocumentStatus
    upload_date: datetime


# --- Compliance ---

class ComplianceResult(BaseModel):
    id: str
    document_id: str
    s1_score: float
    s2_score: float
    governance_score: float
    strategy_score: float
    risk_score: float
    metrics_score: float
    gap_summary: str
    created_at: datetime


# --- Climate Risk ---

class ClimateRiskResult(BaseModel):
    id: str
    document_id: str
    physical_risk_score: float
    transition_risk_score: float
    scenario_alignment_score: float
    emissions_scope1: Optional[float] = None
    emissions_scope2: Optional[float] = None
    emissions_scope3: Optional[float] = None
    risk_heatmap_data: dict
    created_at: datetime


# --- Report Generation ---

class ReportType(str, Enum):
    governance_disclosure = "governance_disclosure"
    climate_strategy = "climate_strategy"
    risk_management = "risk_management"
    board_summary = "board_summary"
    integrated_sustainability = "integrated_sustainability"


class ReportGenerateRequest(BaseModel):
    document_id: str
    report_type: ReportType


class ReportResponse(BaseModel):
    id: str
    document_id: str
    report_type: ReportType
    generated_text: str
    created_at: datetime


# --- Dashboard ---

class DashboardSummary(BaseModel):
    company_name: str
    overall_compliance_score: float
    climate_risk_score: float
    emissions_summary: dict
    risk_heatmap: dict
    recent_reports: List[dict]
    document_count: int
