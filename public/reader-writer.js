class Semaphore {
    constructor(initialCount) {
        this.count = initialCount;
        this.waitingList = [];
    }

    async acquire() {
        return new Promise(resolve => {
            const attempt = () => {
                if (this.count > 0) {
                    this.count--;
                    resolve();
                } else {
                    this.waitingList.push(attempt);
                }
            };
            attempt();
        });
    }

    release() {
        if (this.waitingList.length > 0) {
            const next = this.waitingList.shift();
            next();
        } else {
            this.count++;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const log = document.getElementById('log');
    const clearLogBtn = document.getElementById('clearLogBtn');

    clearLogBtn.addEventListener('click', () => {
        log.textContent = ''; // Clears the log
    });
});


class ReadersWriters {
    constructor() {
        this.mutex = new Semaphore(1); // Controls access to readCount and writerPresent
        this.roomEmpty = new Semaphore(1); // Controls access to the writing room
        this.readCount = 0; // Number of active readers
        this.writerPresent = false; // Flag to indicate if a writer is currently writing
    }

    async startRead() {
        await this.mutex.acquire(); // Acquire mutex to modify readCount and writerPresent
        while (this.writerPresent) {
            this.mutex.release(); // Release mutex if a writer is currently active
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait and retry
            await this.mutex.acquire(); // Re-acquire mutex to check conditions again
        }

        this.readCount++; // Increment the number of readers
        if (this.readCount === 1) {
            await this.roomEmpty.acquire(); // Acquire the writing room if the first reader
        }
        this.mutex.release(); // Release mutex to allow other readers or writers

        // Simulate reading process
        this.logMessage(`Reader ${this.readCount} started reading...`);

        // Simulate reading time
        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.mutex.acquire(); // Acquire mutex to modify readCount
        this.readCount--; // Decrement the number of readers
        if (this.readCount === 0) {
            this.roomEmpty.release(); // Release the writing room if no more readers
        }
        this.mutex.release(); // Release mutex
        this.logMessage(`Reader ${this.readCount + 1} finished reading.`);
    }

    async startWrite() {
        await this.mutex.acquire(); // Acquire mutex to modify readCount and writerPresent
        while (this.readCount > 0 || this.writerPresent) {
            this.mutex.release(); // Release mutex if there are active readers or another writer
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait and retry
            await this.mutex.acquire(); // Re-acquire mutex to check conditions again
        }
        
        this.writerPresent = true; // Mark that a writer is now present
        this.mutex.release(); // Release mutex to allow other readers or writers

        // Acquire the writing room
        await this.roomEmpty.acquire();

        // Simulate writing process
        this.logMessage("Writer started writing...");

        // Simulate writing time
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Release the writing room and reset writerPresent flag
        this.roomEmpty.release();
        await this.mutex.acquire(); // Acquire mutex to modify writerPresent
        this.writerPresent = false; // Reset writerPresent flag
        this.mutex.release(); // Release mutex
        this.logMessage("Writer finished writing.");
    }

    logMessage(message) {
        const logElement = document.getElementById('log');
        logElement.innerHTML += `<p>${message}</p>`;
        logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to bottom of log
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const readersWriters = new ReadersWriters();

    document.getElementById('startReaderBtn').addEventListener('click', async () => {
        await readersWriters.startRead();
    });

    document.getElementById('startWriterBtn').addEventListener('click', async () => {
        await readersWriters.startWrite();
    });
});