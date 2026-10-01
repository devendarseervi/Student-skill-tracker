from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pydantic import BaseModel, Field


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SkillCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)


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

    connection.execute("""
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (skill_id) REFERENCES skills(id)
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

def seed_default_topics():
    connection = get_db_connection()

    python_skill = connection.execute(
        "SELECT id FROM skills WHERE name = ?",
        ("Python",)
    ).fetchone()

    if python_skill is None:
        connection.close()
        return

    python_skill_id = python_skill["id"]

    default_topics = [
        "Variables",
        "Data Types",
        "Operators",
        "Conditional Statements",
        "Loops",
        "Functions",
        "Lists",
        "Tuples",
        "Dictionaries",
        "Sets",
        "File Handling",
        "Exception Handling",
        "OOP"
    ]

    for topic_name in default_topics:
        existing_topic = connection.execute(
            "SELECT id FROM topics WHERE skill_id = ? AND name = ?",
            (python_skill_id, topic_name)
        ).fetchone()

        if existing_topic is None:
            connection.execute(
                "INSERT INTO topics (skill_id, name) VALUES (?, ?)",
                (python_skill_id, topic_name)
            )

    connection.commit()
    connection.close()

create_tables()
seed_default_skills()
seed_default_topics()


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

@app.get("/skills/{skill_id}/topics")
def get_topics(skill_id: int):
    connection = get_db_connection()

    topics = connection.execute(
        """
        SELECT id, name, completed
        FROM topics
        WHERE skill_id = ?
        """,
        (skill_id,)
    ).fetchall()

    connection.close()

    return {
        "topics": [dict(topic) for topic in topics]
    }

@app.get("/skills/{skill_id}/progress")
def get_skill_progress(skill_id: int):
    connection = get_db_connection()

    skill = connection.execute(
        "SELECT id, name FROM skills WHERE id = ?",
        (skill_id,)
    ).fetchone()

    if skill is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    result = connection.execute(
        """
        SELECT
            COUNT(*) AS total_topics,
            COALESCE(SUM(completed), 0) AS completed_topics
        FROM topics
        WHERE skill_id = ?
        """,
        (skill_id,)
    ).fetchone()

    connection.close()

    total_topics = result["total_topics"]
    completed_topics = result["completed_topics"]

    percentage = 0

    if total_topics > 0:
        percentage = round(
            (completed_topics / total_topics) * 100,
            2
        )

    return {
        "skill_id": skill_id,
        "skill_name": skill["name"],
        "completed_topics": completed_topics,
        "total_topics": total_topics,
        "percentage": percentage
    }

@app.patch("/topics/{topic_id}/complete")
def complete_topic(topic_id: int):
    connection = get_db_connection()

    topic = connection.execute(
        "SELECT id FROM topics WHERE id = ?",
        (topic_id,)
    ).fetchone()

    if topic is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    connection.execute(
        "UPDATE topics SET completed = 1 WHERE id = ?",
        (topic_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Topic completed"
    }

@app.get("/skills/name/{skill_name}")
def get_skill_by_name(skill_name: str):
    connection = get_db_connection()

    skill = connection.execute(
        "SELECT id, name FROM skills WHERE name = ?",
        (skill_name,)
    ).fetchone()

    connection.close()

    if skill is None:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    return dict(skill)

@app.post("/skills")
def create_skill(skill: SkillCreate):
    connection = get_db_connection()

    existing_skill = connection.execute(
    "SELECT id FROM skills WHERE name = ?",
    (skill.name,)
    ).fetchone()

    if existing_skill is not None:
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Skill already exists"
    )

    cursor = connection.execute(
        "INSERT INTO skills (name) VALUES (?)",
        (skill.name,)
    )

    connection.commit()

    skill_id = cursor.lastrowid

    connection.close()

    return {
        "id": skill_id,
        "name": skill.name,
        "is_default": 0
    }

@app.get("/skills/{skill_id}")
def get_skill(skill_id: int):
    return {
        "skill_id": skill_id,
        "message": "Skill requested"
    }