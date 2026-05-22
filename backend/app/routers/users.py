from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut
from app.middleware.auth import verify_clerk_token

router = APIRouter(prefix="/users", tags=["users"])
settings = get_settings()


async def _get_clerk_user_profile(clerk_user_id: str) -> dict:
    """Fetch profile fields that are not always present in Clerk JWTs."""
    if not settings.CLERK_SECRET_KEY:
        return {}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
        )

    if response.status_code >= 400:
        return {}

    data = response.json()
    email_addresses = data.get("email_addresses") or []
    primary_email_id = data.get("primary_email_address_id")

    primary_email = next(
        (
            item.get("email_address")
            for item in email_addresses
            if item.get("id") == primary_email_id
        ),
        None,
    )
    email = primary_email or (
        email_addresses[0].get("email_address") if email_addresses else None
    )

    full_name = " ".join(
        part
        for part in [data.get("first_name"), data.get("last_name")]
        if part
    ) or data.get("username")

    return {
        "email": email,
        "full_name": full_name,
        "avatar_url": data.get("image_url") or data.get("profile_image_url"),
    }


async def _get_existing_user(db: AsyncSession, clerk_user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    return result.scalar_one_or_none()


@router.post("/sync", response_model=UserOut, status_code=status.HTTP_200_OK)
async def sync_user(
    payload: dict = Depends(verify_clerk_token),
    db: AsyncSession = Depends(get_db),
):
    """Called after Clerk sign-in to upsert user in our DB."""
    clerk_user_id = payload.get("sub", "")
    email = payload.get("email", "") or ""
    full_name = payload.get("name") or payload.get("full_name")
    avatar = payload.get("image_url") or payload.get("profile_image_url")

    # Try email from nested claims
    if not email:
        emails = payload.get("email_addresses", [])
        if emails:
            email = emails[0].get("email_address", "")

    # Clerk's default session token often only contains "sub".
    # Fetch the profile from Clerk when the JWT is missing user fields.
    if not email or not full_name or not avatar:
        profile = await _get_clerk_user_profile(clerk_user_id)
        email = email or profile.get("email") or ""
        full_name = full_name or profile.get("full_name")
        avatar = avatar or profile.get("avatar_url")

    user = await _get_existing_user(db, clerk_user_id)

    if user:
        # Update fields if changed
        if email and user.email != email:
            user.email = email
        if full_name:
            user.full_name = full_name
        if avatar:
            user.avatar_url = avatar
        await db.flush()
        return user

    # Create new user
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in token")

    user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar,
    )
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        # The dashboard can call sync more than once in quick succession.
        # If another request inserted the user first, return that row.
        await db.rollback()
        user = await _get_existing_user(db, clerk_user_id)
        if not user:
            raise
        return user

    await db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
async def get_me(
    payload: dict = Depends(verify_clerk_token),
    db: AsyncSession = Depends(get_db),
):
    clerk_user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
