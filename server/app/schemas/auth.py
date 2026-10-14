from pydantic import BaseModel, Field, ConfigDict

class LoginRequest(BaseModel):
    login: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=50)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    login: str
    role: str