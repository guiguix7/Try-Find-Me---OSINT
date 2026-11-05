# Domain ownership verification schemas

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class DomainChallengeRequest(BaseModel):
    domain: str = Field(min_length=4, max_length=253)

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, value: str) -> str:
        value = value.strip().lower()

        if value.endswith("."):
            value = value[:-1]

        if "://" in value or "/" in value:
            raise ValueError("Provide only the domain, not a full URL.")

        if " " in value:
            raise ValueError("The domain cannot contain spaces.")

        if "." not in value:
            raise ValueError("Provide a valid domain with at least one dot.")

        import ipaddress

        try:
            ipaddress.ip_address(value)
            raise ValueError("IP addresses are not accepted as valid domains.")
        except ValueError as e:
            if "IP addresses are not accepted" in str(e):
                raise e
            pass

        labels = value.split(".")
        label_regex = __import__("re").compile(r"^(?!-)[a-z0-9-]{1,63}(?<!-)$")

        for label in labels:
            if not label_regex.match(label):
                raise ValueError(
                    f"Invalid label '{label}'. Each part of the domain must "
                    f"be between 1 and 63 characters long, containing only "
                    f"letters, numbers, or hyphens, and cannot start/end "
                    f"with a hyphen."
                )

        return value


class DomainChallengeResponse(BaseModel):
    domain: str
    token: str
    txt_record_name: str
    txt_record_value: str
    expires_at: str
    ttl_seconds: int


class DomainVerifyRequest(BaseModel):
    domain: str
    token: str


class DomainVerifyResponse(BaseModel):
    domain: str
    verified: bool
    proof_id: UUID | None = None
    expires_at: str | None = None
    message: str


class OwnershipProof(BaseModel):
    domain: str
    token: str
    proof_id: UUID
    created_at: datetime
    expires_at: datetime
    verified: bool = False
