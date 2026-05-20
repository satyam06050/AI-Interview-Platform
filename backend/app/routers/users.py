from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut
from app.middleware.auth import verify_clerk_token

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/sync", response_model=UserOut, status_code=status.HTTP_200_OK)
async def sync_user(
    payload: dict = Depends(verify_clerk_token),
    db: AsyncSession = Depends(get_db),
):
    """Called after Clerk sign-in to upsert user in our DB."""
    clerk_user_id = payload.get("sub", "")
    email = payload.get("email", "") or ""

    # Try email from nested claims
    if not email:
        emails = payload.get("email_addresses", [])
        if emails:
            email = emails[0].get("email_address", "")

    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    user = result.scalar_one_or_none()

    if user:
        # Update fields if changed
        if email and user.email != email:
            user.email = email
        full_name = payload.get("name") or payload.get("full_name")
        if full_name:
            user.full_name = full_name
        avatar = payload.get("image_url") or payload.get("profile_image_url")
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
        full_name=payload.get("name") or payload.get("full_name"),
        avatar_url=payload.get("image_url") or payload.get("profile_image_url"),
    )
    db.add(user)
    await db.flush()
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
