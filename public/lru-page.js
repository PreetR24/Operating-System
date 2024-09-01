let stackContainer = document.getElementById('stackContainer');
let stackDiagram = [];

// Function to simulate LRU and update stack diagram
function simulateLRU() {
    let pagesInput = document.getElementById("pages").value;
    let capacityInput = parseInt(document.getElementById("capacity").value);
    
    // Parse input page references string to array
    let pages = pagesInput.split(",").map(item => parseInt(item.trim()));

    // Validate input
    if (isNaN(capacityInput) || pages.some(isNaN) || capacityInput <= 0) {
        alert("Please enter valid numbers for the page references and capacity.");
        return;
    }

    // Call pageFaults function
    let pageFaults = pageFaultsLRU(pages, capacityInput);
    
    // Display output
    document.getElementById("output").innerHTML = "Total number of page faults: " + pageFaults;

    // Clear previous stack diagrams
    stackContainer.innerHTML = '';

    // Show the updated stack diagrams
    displayStackDiagram(stackDiagram);
}

function pageFaultsLRU(pages, capacity) {
    let s = new Set();
    let indexes = new Map();
    let pageFaults = 0;
    stackDiagram = []; // Clear previous stack diagrams

    pages.forEach((page, i) => {
        if (!s.has(page)) {
            if (s.size >= capacity) {
                // Remove the LRU page
                let lru = Array.from(s).reduce((lru, curr) => 
                    (indexes.get(curr) < indexes.get(lru) ? curr : lru)
                );
                s.delete(lru);
                indexes.delete(lru);
            }
            s.add(page);
            pageFaults++;
        }
        indexes.set(page, i);
        stackDiagram.push([...s]); // Save stack state
    });

    return pageFaults;
}

// Function to display stack diagram
function displayStackDiagram(stack) {
    stack.forEach((state, index) => {
        let stackDiv = document.createElement('div');
        stackDiv.className = 'stack';

        state.forEach(page => {
            let pageDiv = document.createElement('div');
            pageDiv.className = 'stack-item';
            pageDiv.innerText = page;
            stackDiv.appendChild(pageDiv);
        });

        if (index === stack.length - 1) {
            stackDiv.classList.add('pageFault'); // Mark the final state with page faults
        }

        stackContainer.appendChild(stackDiv);
    });
}

// Add event listener to the show stack button
document.getElementById('showStackBtn').addEventListener('click', () => {
    displayStackDiagram(stackDiagram);
});
