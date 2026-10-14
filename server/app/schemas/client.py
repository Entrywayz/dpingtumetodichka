from pydantic import BaseModel, Field, ConfigDict

class ClientBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, examples=["Иванов Иван Иванович"])
    address: str | None = Field(None, examples=["ул. Гайдара, 43, 84"])
    phone: str | None = Field(None, max_length=11, examples=["89263708473"])


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    address: str | None = None
    phone: str | None = Field(None, max_length=9)


class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)  
    id: int