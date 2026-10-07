const continueButtons = document.querySelectorAll(".learning-item button");

continueButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const topicUrl = this.dataset.topicUrl;
        window.location.href = topicUrl;
    });
});

const params = new URLSearchParams(window.location.search);

const skill = params.get("skill") || "python";
const topic = params.get("topic");

const topics = {
    variables: {
    name: "Variables",
    content: `
        <h3>What is a Variable?</h3>

        <p>
            A variable is a name used to store a value in a program.
            The stored value can be used later in the program.
        </p>

        <h3>Example</h3>

        <pre><code>name = "Alice"
        age = 20</code></pre>

        <p>
            Here, <strong>name</strong> stores text and
            <strong>age</strong> stores a number.
        </p>

        <h3>Key Points</h3>

        <ul>
            <li>A variable has a name and a value.</li>
            <li>The value stored in a variable can be changed.</li>
            <li>Python determines the data type automatically.</li>
        </ul>
    `,
    completed: false
},

    "data-types": {
        name: "Data Types",
        content: "Learn about the different data types available in Python.",
        completed: false
    },

    operators: {
        name: "Operators",
        content: "Learn how operators are used to perform operations in Python.",
        completed: false
    },

    "conditional-statements": {
        name: "Conditional Statements",
        content: "Learn how conditional statements control the flow of a Python program.",
        completed: false
    },

    loops: {
        name: "Loops",
        content: "Learn how loops are used to repeat a block of code in Python.",
        completed: false
    },

    "exception-handling": {
    name: "Exception Handling",
    content: `
        <h3>What is Exception Handling?</h3>

        <p>
            Exception handling is a mechanism used to handle errors
            that occur during the execution of a program.
        </p>

        <h3>Example</h3>

        <pre><code>try:
    number = int(input("Enter a number: "))
    print(10 / number)
except ZeroDivisionError:
    print("Cannot divide by zero.")</code></pre>

        <p>
            The <strong>try</strong> block contains code that may cause
            an error, while the <strong>except</strong> block handles
            the error.
        </p>
    `,
    completed: false
},
};

const skillNames = {
    python: "Python",
    "web-development": "Web Development",
    "git-github": "Git & GitHub",
    sql: "SQL"
};

const selectedTopic = {
    name: "",
    content: "",
    completed: false
};

const skillNameElement =
    document.querySelector("#skill-name");

if (skillNameElement) {
    skillNameElement.textContent =
        skillNames[skill] || skill;
}

if (topic) {
    fetch(
        "http://127.0.0.1:8000/skills/name/" +
        encodeURIComponent(skillNames[skill])
    )
.then(function(response) {
    if (!response.ok) {
        throw new Error("Skill not found");
    }

    return response.json();
})
.then(function(skillData) {
    return fetch(
        "http://127.0.0.1:8000/skills/" +
        skillData.id +
        "/topics"
    );
})
.then(function(response) {
    if (!response.ok) {
        throw new Error("Could not load topics");
    }

    return response.json();
})
.then(function(data) {
    const currentTopic = data.topics.find(function(item) {
        const topicKey = item.name
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-");

        return topicKey === topic;
    });

    if (!currentTopic) {
        throw new Error("Topic not found");
    }

    selectedTopic.name = currentTopic.name;
    selectedTopic.content = currentTopic.content;
    selectedTopic.completed = currentTopic.completed === 1;

    document.querySelector("#topic-title").textContent =
        currentTopic.name;

    document.querySelector("#topic-content").innerHTML =
        currentTopic.content;

    if (selectedTopic.completed) {
        document.querySelector("#topic-status").textContent =
            "Completed";
    }
})
.catch(function(error) {
    console.error(error);
    document.querySelector("#topic-content").textContent =
        "Could not load topic content.";
});
}

const completeButton = document.querySelector("#complete-button");

if (completeButton && selectedTopic) {
    completeButton.addEventListener("click", function() {
        fetch(
            "http://127.0.0.1:8000/skills/name/" +
            encodeURIComponent(skillNames[skill])
        )
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Skill not found");
            }

            return response.json();
        })
        .then(function(skillData) {
            return fetch(
                "http://127.0.0.1:8000/skills/" +
                skillData.id +
                "/topics"
            );
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not load topics");
            }

            return response.json();
        })
        .then(function(data) {
            const currentTopic = data.topics.find(function(item) {
                const topicKey = item.name
                    .toLowerCase()
                    .replace(/&/g, "and")
                    .replace(/\s+/g, "-");

                return topicKey === topic;
            });

            if (!currentTopic) {
                throw new Error("Topic not found");
            }

            return fetch(
                "http://127.0.0.1:8000/topics/" +
                currentTopic.id +
                "/complete",
                {
                    method: "PATCH"
                }
            );
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not complete topic");
            }

            return response.json();
        })
        .then(function(data) {
            selectedTopic.completed = true;

            document.querySelector("#topic-status").textContent = "Completed";

            console.log(data.message);
        })
        .catch(function(error) {
            console.error(error);
            alert(error.message);
        });
    });
}

function loadSkillProgress(skillName) {
    fetch(
        "http://127.0.0.1:8000/skills/name/" +
        encodeURIComponent(skillName)
    )
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Skill not found");
        }

        return response.json();
    })
    .then(function(skillData) {
        return fetch(
            "http://127.0.0.1:8000/skills/" +
            skillData.id +
            "/progress"
        );
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Could not load skill progress");
        }

        return response.json();
    })
    .then(function(progressData) {
        const completedTopics = progressData.completed_topics;
        const totalTopics = progressData.total_topics;
        const progress = progressData.percentage;

        const progressElement =
            document.querySelector("#python-progress");

        if (progressElement) {
            progressElement.textContent =
                "Progress: " + progress + "%";
        }

        const pythonSkillProgress =
            document.querySelector("#python-skill-progress");

        const pythonSkillProgressFill =
            document.querySelector("#python-skill-progress-fill");

        const pythonTopicCount =
            document.querySelector("#python-topic-count");

        if (
            pythonSkillProgress &&
            pythonSkillProgressFill &&
            pythonTopicCount
        ) {
            pythonSkillProgress.textContent =
                progress + "%";

            pythonSkillProgressFill.style.width =
                progress + "%";

            pythonTopicCount.textContent =
                completedTopics +
                " of " +
                totalTopics +
                " topics completed";
        }

        const overallProgress =
            document.querySelector("#overall-progress");

        const overallProgressFill =
            document.querySelector("#overall-progress-fill");

        if (overallProgress && overallProgressFill) {
            overallProgress.textContent =
                progress + "%";

            overallProgressFill.style.width =
                progress + "%";
        }

        const pythonSkillPageProgress =
            document.querySelector("#python-skill-page-progress");

        const pythonSkillPageProgressFill =
            document.querySelector("#python-skill-page-progress-fill");

        const pythonSkillPageTopicCount =
            document.querySelector("#python-skill-page-topic-count");

        if (
            pythonSkillPageProgress &&
            pythonSkillPageProgressFill &&
            pythonSkillPageTopicCount
        ) {
            pythonSkillPageProgress.textContent =
                progress + "%";

            pythonSkillPageProgressFill.style.width =
                progress + "%";

            pythonSkillPageTopicCount.textContent =
                completedTopics +
                " of " +
                totalTopics +
                " topics completed";
        }
    })
    .catch(function(error) {
        console.error(error);
    });
}

const currentSkill = skill || "python";

const progressSkillNames = {
    python: "Python",
    "web-development": "Web Development",
    "git-github": "Git & GitHub",
    sql: "SQL"
};

if (progressSkillNames[currentSkill]) {
    loadSkillProgress(progressSkillNames[currentSkill]);
}

const skillGrid = document.querySelector("#skill-grid");

if (skillGrid) {
    fetch("http://127.0.0.1:8000/skills")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            data.skills.forEach(function(skill) {
                fetch("http://127.0.0.1:8000/skills/" + skill.id + "/progress")
                .then(function(response) {
                    return response.json();
                })
                .then(function(progressData) {
                    const skillCard = document.createElement("article");
                    skillCard.dataset.skillId = skill.id;
                    
                    
                    
                    const nameElement = document.createElement("h3");
                    nameElement.textContent = skill.name;
                    
                    const progressElement = document.createElement("p");
                    progressElement.textContent = progressData.percentage + "%";
                    
                    const progressContainer = document.createElement("div");
                    progressContainer.classList.add("skill-progress");
                    
                    const progressFill = document.createElement("div");
                    progressFill.classList.add("skill-progress-fill");
                    progressFill.style.width = progressData.percentage + "%";
                    
                    const topicCount = document.createElement("p");
                    topicCount.textContent = progressData.completed_topics + " of " + 
                        progressData.total_topics +
                        " topics completed";
                    
                    const topicsLink = document.createElement("a");
                    topicsLink.textContent = "View Topics";
                    topicsLink.href =
                        "topics.html?skill=" +
                        skill.name.toLowerCase();
                    
                    const deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add("delete-skill-button");
                    
                    skillCard.appendChild(nameElement);
                    skillCard.appendChild(progressElement);
                    skillCard.appendChild(progressContainer);
                    progressContainer.appendChild(progressFill);
                    skillCard.appendChild(topicCount);
                    skillCard.appendChild(topicsLink);
                    skillCard.appendChild(deleteButton);

                    deleteButton.addEventListener("click", function() {
                        fetch(
                            "http://127.0.0.1:8000/skills/" +
                            skillCard.dataset.skillId,
                            {
                                method: "DELETE"
                            }
                        )
                            .then(function(response) {
                                if (!response.ok) {
                                    throw new Error("Could not delete skill");
                                }
                    
                                return response.json();
                            })
                            .then(function(data) {
                                console.log(data.message);
                                skillCard.remove();
                            })
                            .catch(function(error) {
                                alert(error.message);
                            });
                        });                    
                                        
                    skillGrid.appendChild(skillCard);
                });
            });
        });
}

const skillNameInput = document.querySelector("#skill-name-input");
const addSkillButton = document.querySelector("#add-skill-button");

if (skillNameInput && addSkillButton) {
    addSkillButton.addEventListener("click", function() {
        const skillName = skillNameInput.value.trim();

        if (skillName === "") {
            return;
        }

        fetch("http://127.0.0.1:8000/skills", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: skillName
            })
        })
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) {
                        throw new Error(data.detail || "Failed to create skill");
                    }

                    return data;
                });
            })
            .then(function(data) {
                const skillCard = document.createElement("article");
            
   

const nameElement = document.createElement("h3");
nameElement.textContent = data.name;

const progressElement = document.createElement("p");
progressElement.textContent = "0%";

const progressContainer = document.createElement("div");
progressContainer.classList.add("skill-progress");

const progressFill = document.createElement("div");
progressFill.classList.add("skill-progress-fill");
progressFill.style.width = "0%";

const topicCount = document.createElement("p");
topicCount.textContent = "0 topics completed";

const topicsLink = document.createElement("a");
topicsLink.textContent = "View Topics";
topicsLink.href = "#";

skillCard.appendChild(nameElement);
skillCard.appendChild(progressElement);
skillCard.appendChild(progressContainer);
progressContainer.appendChild(progressFill);
skillCard.appendChild(topicCount);
skillCard.appendChild(topicsLink);

document.querySelector(".skill-grid").appendChild(skillCard);

   skillNameInput.value = "";
 })
  .catch(function(error) {
    alert(error.message);
  })
});  
}

const topicSkillName = document.querySelector("#topic-skill-name");

if (topicSkillName && skillNames[skill]) {
    topicSkillName.textContent = skillNames[skill];
}

const topicList = document.querySelector("#topic-list");

if (topicList && skill && skillNames[skill]) {
    fetch(
        "http://127.0.0.1:8000/skills/name/" +
        encodeURIComponent(skillNames[skill])
    )
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Skill not found");
        }

        return response.json();
    })
    .then(function(skillData) {
        return fetch(
            "http://127.0.0.1:8000/skills/" +
            skillData.id +
            "/topics"
        );
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Could not load topics");
        }

        return response.json();
    })
    .then(function(data) {
        topicList.innerHTML = "";

        data.topics.forEach(function(topic) {
            const topicItem = document.createElement("div");
            topicItem.classList.add("topic-item");

            const topicName = document.createElement("span");
            topicName.textContent = topic.name;

            const openLink = document.createElement("a");

            const topicKey = topic.name
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/\s+/g, "-");

            openLink.href =
                "topic.html?skill=" +
                skill +
                "&topic=" +
                topicKey;

            openLink.textContent = "Open";

            topicItem.appendChild(topicName);
            topicItem.appendChild(openLink);

            topicList.appendChild(topicItem);
        });
    })
    .catch(function(error) {
        console.error(error);
        topicList.textContent = "Could not load topics.";
    });
}

const projectForm = document.querySelector("#project-form");
const projectList = document.querySelector("#project-list");

if (projectForm && projectList) {
    projectForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const projectName = document.querySelector("#project-name").value.trim();
        const projectSkill = document.querySelector("#project-skill").value;
        const projectStatus = document.querySelector("#project-status").value;

        fetch(
            "http://127.0.0.1:8000/skills/name/" +
            encodeURIComponent(projectSkill)
        )
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) {
                        throw new Error(data.detail || "Failed to find skill");
                    }

                    return data;
                });
            })
            .then(function(skillData) {
                console.log("Skill data:", skillData);
console.log("Project data:", {
    skill_id: skillData.id,
    name: projectName,
    status: projectStatus
});
                return fetch("http://127.0.0.1:8000/projects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        skill_id: skillData.id,
                        name: projectName,
                        status: projectStatus
                    })
                });
            })
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) {
                        throw new Error(data.detail || "Failed to create project");
                    }

                    return data;
                });
            })
            .then(function(data) {
                const projectCard = document.createElement("article");
                projectCard.classList.add("project-card");

                const nameElement = document.createElement("h3");
                nameElement.textContent = data.name;

                const skillElement = document.createElement("p");
                skillElement.textContent = "Skill: " + projectSkill;

                const statusElement = document.createElement("p");
                statusElement.textContent = "Status: " + data.status;
                
                projectCard.dataset.projectId = data.id;
                
                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("delete-project-button");
                
                projectCard.appendChild(nameElement);
                projectCard.appendChild(skillElement);
                projectCard.appendChild(statusElement);
                projectCard.appendChild(deleteButton);
                
                projectList.appendChild(projectCard);
                
                deleteButton.addEventListener("click", function() {
    fetch(
        "http://127.0.0.1:8000/projects/" +
        projectCard.dataset.projectId,
        {
            method: "DELETE"
        }
    )
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not delete project");
            }

            return response.json();
        })
        .then(function(data) {
            console.log(data.message);
            projectCard.remove();
        })
        .catch(function(error) {
            alert(error.message);
        });
});

                projectForm.reset();
            })
            .catch(function(error) {
                if (error instanceof Error) {
                    alert(error.message);
                } else {
                    alert(JSON.stringify(error));
                }
            });
    });
}

if (projectList) {
    fetch("http://127.0.0.1:8000/projects")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not load projects");
            }

            return response.json();
        })
        .then(function(data) {
            data.projects.forEach(function(project) {
                const projectCard = document.createElement("article");
                projectCard.classList.add("project-card");

                projectCard.dataset.projectId = project.id;

                const nameElement = document.createElement("h3");
                nameElement.textContent = project.name;

                const skillElement = document.createElement("p");
                skillElement.textContent = "Skill: " + project.skill_name;

                const statusElement = document.createElement("p");
                statusElement.textContent = "Status: " + project.status;

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("delete-project-button");

                projectCard.appendChild(nameElement);
                projectCard.appendChild(skillElement);
                projectCard.appendChild(statusElement);
                projectCard.appendChild(deleteButton);

                projectList.appendChild(projectCard);

                deleteButton.addEventListener("click", function() {
                    fetch(
                        "http://127.0.0.1:8000/projects/" +
                        projectCard.dataset.projectId,
                        {
                            method: "DELETE"
                        }
                      )
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not delete project");
            }

            return response.json();
        })
        .then(function(data) {
            console.log(data.message);
            projectCard.remove();
        })
        .catch(function(error) {
            alert(error.message);
        });
});
            });
        })
        .catch(function(error) {
            console.error(error);
        });
}

const noteForm = document.querySelector("#note-form");
const noteList = document.querySelector("#note-list");

if (noteList) {
    fetch("http://127.0.0.1:8000/notes")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Could not load notes");
            }

            return response.json();
        })
        .then(function(data) {
            data.notes.forEach(function(note) {
                const noteCard = document.createElement("article");
                noteCard.classList.add("note-card");

                const titleElement = document.createElement("h3");
                titleElement.textContent = note.title;

                const skillElement = document.createElement("p");
                skillElement.textContent =
                    "Skill: " + note.skill_name;

                const contentElement = document.createElement("p");
                contentElement.textContent = note.content;

                noteCard.appendChild(titleElement);
                noteCard.appendChild(skillElement);
                noteCard.appendChild(contentElement);

                noteList.appendChild(noteCard);
            });
        })
        .catch(function(error) {
            console.error(error);
        });
}

        if (noteForm && noteList) {
        noteForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const noteTitle =
            document.querySelector("#note-title").value.trim();

        const noteSkill =
            document.querySelector("#note-skill").value;

        const noteContent =
            document.querySelector("#note-content").value.trim();

        fetch(
            "http://127.0.0.1:8000/skills/name/" +
            encodeURIComponent(noteSkill)
        )
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) {
                        throw new Error(
                            data.detail || "Failed to find skill"
                        );
                    }

                    return data;
                });
            })
            .then(function(skillData) {
                return fetch("http://127.0.0.1:8000/notes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        skill_id: skillData.id,
                        title: noteTitle,
                        content: noteContent
                    })
                });
            })
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) {
                        throw new Error(
                            data.detail || "Failed to create note"
                        );
                    }

                    return data;
                });
            })
            .then(function(data) {
    console.log("Note created:", data);

    const noteCard = document.createElement("article");
    noteCard.classList.add("note-card");

    const titleElement = document.createElement("h3");
    titleElement.textContent = data.title;

    const skillElement = document.createElement("p");
    skillElement.textContent =
        "Skill: " + noteSkill;

    const contentElement = document.createElement("p");
    contentElement.textContent = data.content;

    noteCard.appendChild(titleElement);
    noteCard.appendChild(skillElement);
    noteCard.appendChild(contentElement);

    noteList.appendChild(noteCard);

    noteForm.reset();
})
            .catch(function(error) {
                alert(error.message);
            });
    });
}
