const buttons = document.querySelectorAll(".learning-item button");

buttons.forEach(function(button) {
    button.addEventListener("click", function(){
        const learningItem = this.parentElement;
        const status = learningItem.querySelector(".learning-status");
        
        status.textContent = "Completed";
        status.classList.add("completed");
        this.textContent = "Completed";
    });
});

const params = new URLSearchParams(window.location.search);

const skill = params.get("skill");
const topic = params.get("topic");

const topics = {
    variables: {
        name: "Variables",
        content: "Learn how variables are used to store data in Python.",
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
    }
};

const selectedTopic = topics[topic];

if (selectedTopic) {
    document.querySelector("#topic-title").textContent = selectedTopic.name;
    document.querySelector("#skill-name").textContent = "Python";
    document.querySelector("#topic-content").textContent = selectedTopic.content;

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