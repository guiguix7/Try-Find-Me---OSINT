from pydantic import BaseModel


class User(BaseModel):
    name: str
    age: int


user = User(
    name="Guilherme",
    age=20
)

print(user.name)
print(user.age)