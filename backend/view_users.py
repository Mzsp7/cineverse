from database import User, engine
from sqlmodel import Session, select

session = Session(engine)
users = session.exec(select(User)).all()

print(f"\n{'='*60}")
print(f"  REGISTERED USERS ({len(users)} total)")
print(f"{'='*60}\n")

for i, user in enumerate(users, 1):
    print(f"User {i}:")
    print(f"  Email:    {user.email}")
    print(f"  Name:     {user.full_name}")
    print(f"  Country:  {user.country or 'Not set'}")
    print(f"  State:    {user.state or 'Not set'}")
    print(f"  City:     {user.city or 'Not set'}")
    print(f"  ID:       {user.id}")
    print("-" * 60)

session.close()
