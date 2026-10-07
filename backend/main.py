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

class ProjectCreate(BaseModel):
    skill_id: int
    name: str = Field(min_length=2, max_length=100)
    status: str = Field(min_length=1, max_length=30)

class NoteCreate(BaseModel):
    skill_id: int
    title: str = Field(min_length=2, max_length=100)
    content: str = Field(min_length=1, max_length=5000)

class TopicContentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


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

    connection.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (skill_id) REFERENCES skills(id)
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (skill_id) REFERENCES skills(id)
       )
    """)

    topic_columns = connection.execute(
    "PRAGMA table_info(topics)"
    ).fetchall()

    column_names = [column["name"] for column in topic_columns]

    if "content" not in column_names:
       connection.execute(
        "ALTER TABLE topics ADD COLUMN content TEXT DEFAULT ''"
    )

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
        SELECT id, name, content, completed
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

@app.patch("/topics/{topic_id}/content")
def update_topic_content(
    topic_id: int,
    topic: TopicContentUpdate
):
    connection = get_db_connection()

    existing_topic = connection.execute(
        "SELECT id FROM topics WHERE id = ?",
        (topic_id,)
    ).fetchone()

    if existing_topic is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    connection.execute(
        "UPDATE topics SET content = ? WHERE id = ?",
        (topic.content, topic_id)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Topic content updated"
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

@app.delete("/skills/{skill_id}")
def delete_skill(skill_id: int):
    connection = get_db_connection()

    skill = connection.execute(
        "SELECT id FROM skills WHERE id = ?",
        (skill_id,)
    ).fetchone()

    if skill is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    connection.execute(
        "DELETE FROM topics WHERE skill_id = ?",
        (skill_id,)
    )

    connection.execute(
        "DELETE FROM projects WHERE skill_id = ?",
        (skill_id,)
    )

    connection.execute(
        "DELETE FROM notes WHERE skill_id = ?",
    (skill_id,)
    )

    connection.execute(
        "DELETE FROM skills WHERE id = ?",
        (skill_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Skill deleted"
    }

@app.post("/projects")
def create_project(project: ProjectCreate):
    connection = get_db_connection()

    skill = connection.execute(
        "SELECT id FROM skills WHERE id = ?",
        (project.skill_id,)
    ).fetchone()

    if skill is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    cursor = connection.execute(
        """
        INSERT INTO projects (skill_id, name, status)
        VALUES (?, ?, ?)
        """,
        (
            project.skill_id,
            project.name,
            project.status
        )
    )

    connection.commit()

    project_id = cursor.lastrowid

    connection.close()

    return {
        "id": project_id,
        "skill_id": project.skill_id,
        "name": project.name,
        "status": project.status
    }

@app.post("/notes")
def create_note(note: NoteCreate):
    connection = get_db_connection()

    skill = connection.execute(
        "SELECT id FROM skills WHERE id = ?",
        (note.skill_id,)
    ).fetchone()

    if skill is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    cursor = connection.execute(
        """
        INSERT INTO notes (skill_id, title, content)
        VALUES (?, ?, ?)
        """,
        (
            note.skill_id,
            note.title,
            note.content
        )
    )

    connection.commit()

    note_id = cursor.lastrowid

    connection.close()

    return {
        "id": note_id,
        "skill_id": note.skill_id,
        "title": note.title,
        "content": note.content
    }

@app.get("/notes")
def get_notes():
    connection = get_db_connection()

    notes = connection.execute(
        """
        SELECT
            notes.id,
            notes.title,
            notes.content,
            notes.skill_id,
            skills.name AS skill_name
        FROM notes
        JOIN skills ON notes.skill_id = skills.id
        """
    ).fetchall()

    connection.close()

    return {
        "notes": [dict(note) for note in notes]
    }

@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    connection = get_db_connection()

    note = connection.execute(
        "SELECT id FROM notes WHERE id = ?",
        (note_id,)
    ).fetchone()

    if note is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    connection.execute(
        "DELETE FROM notes WHERE id = ?",
        (note_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Note deleted"
    }

@app.get("/projects")
def get_projects():
    connection = get_db_connection()

    projects = connection.execute(
        """
        SELECT
            projects.id,
            projects.name,
            projects.status,
            projects.skill_id,
            skills.name AS skill_name
        FROM projects
        JOIN skills ON projects.skill_id = skills.id
        """
    ).fetchall()

    connection.close()

    return {
        "projects": [dict(project) for project in projects]
    }

@app.delete("/projects/{project_id}")
def delete_project(project_id: int):
    connection = get_db_connection()

    project = connection.execute(
        "SELECT id FROM projects WHERE id = ?",
        (project_id,)
    ).fetchone()

    if project is None:
        connection.close()
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    connection.execute(
        "DELETE FROM projects WHERE id = ?",
        (project_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Project deleted"
    }

@app.get("/skills/{skill_id}")
def get_skill(skill_id: int):
    return {
        "skill_id": skill_id,
        "message": "Skill requested"
    }