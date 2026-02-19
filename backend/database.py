from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

# Collections
users_collection = db["users"]
companies_collection = db["companies"]
documents_collection = db["documents"]
embeddings_collection = db["embeddings"]
compliance_collection = db["compliance_analysis"]
climate_collection = db["climate_risk"]
reports_collection = db["generated_reports"]
audit_collection = db["audit_logs"]


async def init_indexes():
    """Create database indexes on startup."""
    await users_collection.create_index("email", unique=True)
    await documents_collection.create_index("company_id")
    await embeddings_collection.create_index("document_id")
    await compliance_collection.create_index("document_id")
    await climate_collection.create_index("document_id")
    await reports_collection.create_index("document_id")


async def close_db():
    """Close database connection."""
    client.close()
