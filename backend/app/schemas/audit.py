import ipaddress
import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AuditCreate(BaseModel):
    target: str = Field(min_length=4, max_length=253)
    asset_type: Literal["domain"]
    authorization_confirmed: bool

    @field_validator("target")
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

        try:
            ipaddress.ip_address(value)
            raise ValueError("IP addresses are not accepted as valid domains.")
        except ValueError as e:
            # Se disparar o erro customizado acima, repassa ele
            if "IP addresses are not accepted" in str(e):
                raise e
            pass

        labels = value.split(".")

        label_regex = re.compile(r"^(?!-)[a-z0-9-]{1,63}(?<!-)$")

        for label in labels:
            if not label_regex.match(label):
                raise ValueError(
                    f"Invalid label '{label}'. Each part of the domain must "
                    f"be between 1 and 63 characters long, containing only letters, "
                    f"numbers, or hyphens, and cannot start/end with a hyphen."
                )

        return value

    @field_validator("authorization_confirmed")
    @classmethod
    def validate_authorization(cls, value: bool) -> bool:
        if not value:
            raise ValueError("The authorization is required.")
        return value
