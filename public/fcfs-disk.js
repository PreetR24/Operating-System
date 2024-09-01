function simulateFCFS() {
    var queueInput = document.getElementById("queue").value;
    var headInput = parseInt(document.getElementById("head").value);
    
    // Parse input queue string to array
    var arr = queueInput.split(",").map(function(item) {
        return parseInt(item.trim());
    });

    // Validate input
    if (isNaN(headInput) || arr.some(isNaN)) {
        alert("Please enter valid numbers for the queue and head position.");
        return;
    }

    // Call FCFS function
    FCFS(arr, headInput);
}

function FCFS(arr, head) {
    var seek_count = 0;
    var distance, cur_track;
    var output = "";
    var seekSequence = []; // Array to hold seek sequence

    for (var i = 0; i < arr.length; i++) {
        cur_track = arr[i];
        distance = Math.abs(cur_track - head);
        seek_count += distance;
        head = cur_track;
        output += cur_track + " ";
        seekSequence.push(cur_track); // Add track to seek sequence array
    }

    document.getElementById("output").innerHTML = "Total number of seek operations = " + seek_count + "<br>Seek Sequence is: " + output;

    // Generate chart
    generateChart(seekSequence);
}

let chart = null; // Declare chart variable in the global scope

function generateChart(seekSequence) {
    var ctx = document.getElementById('fcfsChart').getContext('2d');
    // If a chart already exists, destroy it before creating a new one
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: seekSequence.map((_, index) => index + 1), // X-axis labels (1, 2, 3, ...)
            datasets: [{
                label: 'Disk Seek Sequence',
                data: seekSequence,
                borderColor: '#0080ff',
                backgroundColor: 'rgba(0, 128, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#0080ff',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Request Number'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Disk Position'
                    }
                }
            }
        }
    });
}

function clearAll() {
    // Clear input fields
    document.getElementById('queue').value = '';
    document.getElementById('head').value = '';

    // Clear the chart
    if (chart) {
        chart.destroy(); // Destroy the existing chart instance
        chart = null; // Reset the chart variable
    }

    // Optionally, clear the output div
    document.getElementById('output').innerHTML = '';
}

// Add event listener to the clear button
document.getElementById('clearBtn').addEventListener('click', clearAll);
