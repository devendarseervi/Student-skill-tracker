from fastapi import FastAPI
import sqlite3

app = FastAPI()

def get_db_connection():
    connection = sqlite3.connect("database.db")
    connection.row_factory = sqlite3.Row
    return connection 

def create_tables():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            is_default INTEGER NOT NULL DEFAULT 0
        )
    """)

    connection.commit()
    connection.close()

def seed_default_skills():
    connection = get_db_connection()

    default_skills = [
        "Python",
        "C",
        "C++",
        "Java",
        "JavaScript",
        "HTML & CSS",
        "SQL",
        "Git & GitHub",
        "DSA",
        "Networks",
        "DBMS",
        "OS"
    ]

    for skill_name in default_skills:
        existing_skill = connection.execute(
            "SELECT id FROM skills WHERE name = ?",
            (skill_name,)
        ).fetchone()

        if existing_skill is None:
            connection.execute(
                "INSERT INTO skills (name, is_default) VALUES (?, ?)",
                (skill_name, 1)
            )

    connection.commit()
    connection.close()

create_tables()
seed_default_skills()


@app.get("/")
def home():
    return {"message": "Student Skill Tracker API is running"}


@app.get("/skills")
def get_skills():
    connection = get_db_connection()

    skills = connection.execute(
        "SELECT id, name, description, is_default FROM skills"
    ).fetchall()

    connection.close()

    return {"skills": [dict(skill) for skill in skills]}

@app.get("/skills/{skill_id}")
def get_skill(skill_id: int):
    return {
        "skill_id": skill_id,
        "message": "Skill requested"
    }