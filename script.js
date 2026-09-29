const continueButtons = document.querySelectorAll(".learning-item button");

continueButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const topicUrl = this.dataset.topicUrl;
        window.location.href = topicUrl;
    });
});

const params = new URLSearchParams(window.location.search);

const skill = params.get("skill");
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

const selectedTopic = topics[topic];

if (selectedTopic) {
    document.querySelector("#topic-title").textContent = selectedTopic.name;
    const skillNames = {
    python: "Python",
    "web-development": "Web Development",
    "git-github": "Git & GitHub",
    sql: "SQL"
};

document.querySelector("#skill-name").textContent = skillNames[skill] || skill;
    document.querySelector("#topic-content").innerHTML = selectedTopic.content;

    const savedStatus = localStorage.getItem(topic);

    if (savedStatus === "completed") {
        selectedTopic.completed = true;
        document.querySelector("#topic-status").textContent = "Completed";
    }
}

const completeButton = document.querySelector("#complete-button");

if (completeButton && selectedTopic) {
    completeButton.addEventListener("click", function() {
        selectedTopic.completed = true;

        localStorage.setItem(topic, "completed");
        console.log("Completed topic key:", topic);

        document.querySelector("#topic-status").textContent = "Completed";
    });
}

const skillTopics = {
    python: [
        "Variables",
        "Data Types",
        "Operators",
        "Conditional Statements",
        "Loops"
    ],

    "web-development": [
        "HTML Basics",
        "CSS Basics",
        "JavaScript Basics"
    ],

    "git-github": [
        "Git Basics",
        "Repositories",
        "Commits",
        "Branches"
    ],

    sql: [
        "SQL Basics",
        "SELECT Statement",
        "WHERE Clause",
        "JOINs"
    ]
};

function getSkillProgress(skillName) {
    const topicNames = skillTopics[skillName];

    if (!topicNames || topicNames.length === 0) {
        return {
            completed: 0,
            total: 0,
            percentage: 0
        };
    }

    let completed = 0;

    topicNames.forEach(function(topicName) {
        const topicKey = topicName
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-");

        if (localStorage.getItem(topicKey) === "completed") {
            completed++;
        }
    });

    const percentage = (completed / topicNames.length) * 100;

    return {
        completed: completed,
        total: topicNames.length,
        percentage: percentage
    };
}

const currentSkill = skill || "python";
const currentSkillProgress = getSkillProgress(currentSkill);

const completedTopics = currentSkillProgress.completed;
const totalTopics = currentSkillProgress.total;
const currentProgress = currentSkillProgress.percentage;

const pythonProgressData = getSkillProgress("python");
const pythonProgress = pythonProgressData.percentage;
const pythonCompletedTopics = pythonProgressData.completed;
const pythonTotalTopics = pythonProgressData.total;

const progressElement = document.querySelector("#python-progress");

if (progressElement) {
    progressElement.textContent = "Progress: " + currentProgress + "%";
}

const pythonSkillProgress = document.querySelector("#python-skill-progress");
const pythonSkillProgressFill = document.querySelector("#python-skill-progress-fill");
const pythonTopicCount = document.querySelector("#python-topic-count");

if (pythonSkillProgress && pythonSkillProgressFill && pythonTopicCount) {
    pythonSkillProgress.textContent = pythonProgress + "%";
    pythonSkillProgressFill.style.width = pythonProgress + "%";
    pythonTopicCount.textContent =
        pythonCompletedTopics + " of " + pythonTotalTopics + " topics completed";
}

const overallProgress = document.querySelector("#overall-progress");
const overallProgressFill = document.querySelector("#overall-progress-fill");

if (overallProgress && overallProgressFill) {
    overallProgress.textContent = pythonProgress + "%";
    overallProgressFill.style.width = pythonProgress + "%";
}

const pythonSkillPageProgress = document.querySelector("#python-skill-page-progress");
const pythonSkillPageProgressFill = document.querySelector("#python-skill-page-progress-fill");
const pythonSkillPageTopicCount = document.querySelector("#python-skill-page-topic-count");

if (
    pythonSkillPageProgress &&
    pythonSkillPageProgressFill &&
    pythonSkillPageTopicCount
) {
    pythonSkillPageProgress.textContent = pythonProgress + "%";
    pythonSkillPageProgressFill.style.width = pythonProgress + "%";
    pythonSkillPageTopicCount.textContent =
        pythonCompletedTopics + " of " + pythonTotalTopics + " topics completed";
}

const skillNameInput = document.querySelector("#skill-name-input");
const addSkillButton = document.querySelector("#add-skill-button");

if (skillNameInput && addSkillButton) {
    addSkillButton.addEventListener("click", function() {
        const skillName = skillNameInput.value.trim();

        if (skillName === "") {
            return;
        }

        const skillCard = document.createElement("article");

        skillCard.innerHTML = `
            <h3>${skillName}</h3>
            <p>0%</p>

            <div class="skill-progress">
                <div class="skill-progress-fill" style="width: 0%;"></div>
            </div>

            <p>0 topics completed</p>

            <a href="#">View Topics</a>
        `;

        document.querySelector(".skill-grid").appendChild(skillCard);

        skillNameInput.value = "";
    });
}

const topicSkillName = document.querySelector("#topic-skill-name");

const skillNames = {
    python: "Python",
    "web-development": "Web Development",
    "git-github": "Git & GitHub",
    sql: "SQL"
};

if (topicSkillName && skillNames[skill]) {
    topicSkillName.textContent = skillNames[skill];
}

const topicList = document.querySelector("#topic-list");

if (topicList && skill && skillTopics[skill]) {
    topicList.innerHTML = "";

    skillTopics[skill].forEach(function(topicName) {
    const topicItem = document.createElement("div");
    topicItem.classList.add("topic-item");

    const topicKey = topicName
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-");

    topicItem.innerHTML = `
        <span>${topicName}</span>
        <a href="topic.html?skill=${skill}&topic=${topicKey}">Open</a>
    `;

    topicList.appendChild(topicItem);
});
}

const projectForm = document.querySelector("#project-form");
const projectList = document.querySelector("#project-list");

if (projectForm && projectList) {
    projectForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const projectName = document.querySelector("#project-name").value;
        const projectSkill = document.querySelector("#project-skill").value;
        const projectStatus = document.querySelector("#project-status").value;

        const projectCard = document.createElement("article");
        projectCard.classList.add("project-card");

        const nameElement = document.createElement("h3");
        nameElement.textContent = projectName;

        const skillElement = document.createElement("p");
        skillElement.textContent = "Skill: " + projectSkill;

        const statusElement = document.createElement("p");
        statusElement.textContent = "Status: " + projectStatus;

        projectCard.appendChild(nameElement);
        projectCard.appendChild(skillElement);
        projectCard.appendChild(statusElement);

        projectList.appendChild(projectCard);

        projectForm.reset();
    });
}

const noteForm = document.querySelector("#note-form");
const noteList = document.querySelector("#note-list");

if (noteForm && noteList) {
    noteForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const noteTitle = document.querySelector("#note-title").value.trim();
        const noteSkill = document.querySelector("#note-skill").value;
        const noteContent = document.querySelector("#note-content").value.trim();

        const noteCard = document.createElement("article");
        noteCard.classList.add("note-card");

        const titleElement = document.createElement("h3");
        titleElement.textContent = noteTitle;

        const skillElement = document.createElement("p");
        skillElement.textContent = "Skill: " + noteSkill;

        const contentElement = document.createElement("p");
        contentElement.textContent = noteContent;

        noteCard.appendChild(titleElement);
        noteCard.appendChild(skillElement);
        noteCard.appendChild(contentElement);

        noteList.appendChild(noteCard);

        noteForm.reset();
    });
}

