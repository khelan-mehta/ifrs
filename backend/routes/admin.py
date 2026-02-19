from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from database import users_collection, companies_collection, audit_collection
from models.schemas import UserResponse, CompanyCreate, CompanyResponse
from utils.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter()


async def admin_only(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/users", response_model=List[UserResponse])
async def list_users(user=Depends(admin_only)):
    users = []
    async for u in users_collection.find():
        users.append(
            UserResponse(
                id=str(u["_id"]),
                email=u["email"],
                role=u["role"],
                company_id=u["company_id"],
                created_at=u["created_at"],
            )
        )
    return users


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user=Depends(admin_only)):
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    await audit_collection.insert_one({
        "action": "delete_user",
        "target_id": user_id,
        "performed_by": str(user["_id"]),
        "timestamp": datetime.now(timezone.utc),
    })
    return {"message": "User deleted"}


@router.post("/companies", response_model=CompanyResponse)
async def create_company(company: CompanyCreate, user=Depends(admin_only)):
    doc = {
        "name": company.name,
        "industry": company.industry,
        "region": company.region,
        "created_at": datetime.now(timezone.utc),
    }
    result = await companies_collection.insert_one(doc)
    return CompanyResponse(
        id=str(result.inserted_id),
        name=doc["name"],
        industry=doc["industry"],
        region=doc["region"],
        created_at=doc["created_at"],
    )


@router.get("/audit")
async def get_audit_logs(user=Depends(admin_only)):
    logs = []
    async for log in audit_collection.find().sort("timestamp", -1).limit(100):
        log["_id"] = str(log["_id"])
        logs.append(log)
    return logs
