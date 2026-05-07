const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper function to read tasks from JSON file
function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
}

// Helper function to write tasks to JSON file
function writeTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing tasks:", error);
    return false;
  }
}

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

// Helper function to serve static files
function serveStaticFile(res, filePath) {
  const extname = path.extname(filePath);
  const contentTypeMap = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
  };

  const contentType = contentTypeMap[extname] || "text/plain";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Disable keep-alive to prevent hanging connections
  res.setHeader("Connection", "close");

  // Enable CORS for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve static files
  if (method === "GET" && url === "/") {
    serveStaticFile(res, path.join(__dirname, "index.html"));
    return;
  }

  if (method === "GET" && url === "/styles.css") {
    serveStaticFile(res, path.join(__dirname, "styles.css"));
    return;
  }

  // API Routes
  try {
    // GET /tasks - Get all tasks
    if (method === "GET" && url === "/tasks") {
      const tasks = readTasks();
      sendJSON(res, 200, tasks);
      return;
    }

    // POST /tasks - Create new task
    if (method === "POST" && url === "/tasks") {
      const body = await parseBody(req);
      const tasks = readTasks();

      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        text: body.text,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      tasks.push(newTask);

      if (writeTasks(tasks)) {
        sendJSON(res, 201, newTask);
      } else {
        sendJSON(res, 500, { error: "Failed to save task" });
      }
      return;
    }

    // PUT /tasks/:id/toggle - Toggle task completion
    const toggleMatch = url.match(/^\/tasks\/(\d+)\/toggle$/);
    if (method === "PUT" && toggleMatch) {
      const id = Number.parseInt(toggleMatch[1]);
      const tasks = readTasks();
      const task = tasks.find((t) => t.id === id);

      if (!task) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
      }

      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();

      if (writeTasks(tasks)) {
        sendJSON(res, 200, task);
      } else {
        sendJSON(res, 500, { error: "Failed to update task" });
      }
      return;
    }

    // DELETE /tasks/:id - Delete task
    const deleteMatch = url.match(/^\/tasks\/(\d+)$/);
    if (method === "DELETE" && deleteMatch) {
      const id = Number.parseInt(deleteMatch[1]);
      let tasks = readTasks();
      const initialLength = tasks.length;

      tasks = tasks.filter((t) => t.id !== id);

      if (tasks.length === initialLength) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
      }

      if (writeTasks(tasks)) {
        sendJSON(res, 200, { message: "Task deleted successfully" });
      } else {
        sendJSON(res, 500, { error: "Failed to delete task" });
      }
      return;
    }

    // 404 - Not found
    sendJSON(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("Request error:", error);
    sendJSON(res, 500, { error: "Internal server error" });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Data stored in: ${DATA_FILE}`);
  console.log("\nPress Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
