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
    document.querySelector("#skill-name").textContent = "Python";
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

        document.querySelector("#topic-status").textContent = "Completed";
    });
}

const pythonTopics = [
    "variables",
    "data-types",
    "operators",
    "conditional-statements",
    "loops"
];

let completedTopics = 0;

pythonTopics.forEach(function(topic) {
    if (localStorage.getItem(topic) === "completed") {
        completedTopics++;
    }
});

const pythonProgress = (completedTopics / pythonTopics.length) * 100;

const progressElement = document.querySelector("#python-progress");

if (progressElement) {
    progressElement.textContent = "Progress: " + pythonProgress + "%";
}

const pythonSkillProgress = document.querySelector("#python-skill-progress");
const pythonSkillProgressFill = document.querySelector("#python-skill-progress-fill");
const pythonTopicCount = document.querySelector("#python-topic-count");

if (pythonSkillProgress && pythonSkillProgressFill && pythonTopicCount) {
    pythonSkillProgress.textContent = pythonProgress + "%";
    pythonSkillProgressFill.style.width = pythonProgress + "%";
    pythonTopicCount.textContent = completedTopics + " of " + pythonTopics.length + " topics completed";
}

const overallProgress = document.querySelector("#overall-progress");
const overallProgressFill = document.querySelector("#overall-progress-fill");

if (overallProgress && overallProgressFill) {
    overallProgress.textContent = pythonProgress + "%";
    overallProgressFill.style.width = pythonProgress + "%";
}