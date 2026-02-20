import logging
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

logger = logging.getLogger("ifrs.database")
settings = get_settings()

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

# Collections
users_collection = db["users"]
companies_collection = db["companies"]
documents_collection = db["documents"]
compliance_collection = db["compliance_analysis"]
climate_collection = db["climate_risk"]
reports_collection = db["generated_reports"]
audit_collection = db["audit_logs"]
embeddings_collection = db["embeddings"]
document_analysis_collection = db["document_analysis"]



async def init_indexes():
    """Create database indexes on startup."""
    logger.info("Creating database indexes...")
    await users_collection.create_index("email", unique=True)
    await documents_collection.create_index("company_id")
    await documents_collection.create_index([("company_id", 1), ("upload_date", -1)])
    await compliance_collection.create_index("document_id", unique=True)
    await climate_collection.create_index("document_id", unique=True)
    await reports_collection.create_index("document_id")
    await reports_collection.create_index([("document_id", 1), ("created_at", -1)])
    await audit_collection.create_index([("timestamp", -1)])
    await document_analysis_collection.create_index("document_id", unique=True)
    logger.info("Database indexes created successfully")


async def close_db():
    """Close database connection."""
    client.close()
