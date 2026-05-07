# Daily TODO List Application

A simple, persistent TODO list application built with vanilla JavaScript, HTML, CSS, and Node.js. No external dependencies required.

## Features

- Add new tasks to your daily TODO list
- Mark tasks as completed
- Delete tasks from the list
- Persistent storage using JSON file
- State is preserved across application restarts
- Clean, modern UI with statistics
- Responsive design

## Technical Implementation

### Architecture

- **Frontend**: Pure HTML, CSS, and vanilla JavaScript (no frameworks)
- **Backend**: Node.js HTTP server (no Express or external libraries)
- **Storage**: JSON file (`tasks.json`) for persistent data storage
- **API**: RESTful endpoints for CRUD operations

### File Structure

```
crowdcollective/
├── index.html      # Frontend UI
├── styles.css      # Styling
├── index.js        # Node.js server
├── tasks.json      # Data storage (created automatically)
└── README.md       # This file
```

## Installation & Running

### Prerequisites

- Node.js (version 12 or higher)

### Steps

1. **Navigate to the project directory**:

2. **Start the server**:

   ```bash
   node index.js
   ```

3. **Open your browser**:
   Navigate to: `http://localhost:3000`

4. **Stop the server**:
   Press `Ctrl+C` in the terminal

## How It Works

### Persistent Storage

- All tasks are stored in `tasks.json` in the project directory
- The file is automatically created on first run
- Data persists across server restarts
- Each task contains:
  - `id`: Unique identifier
  - `text`: Task description
  - `completed`: Boolean status
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp (when modified)

### API Endpoints

| Method | Endpoint            | Description                   |
| ------ | ------------------- | ----------------------------- |
| GET    | `/tasks`            | Retrieve all tasks            |
| POST   | `/tasks`            | Create a new task             |
| PUT    | `/tasks/:id/toggle` | Toggle task completion status |
| DELETE | `/tasks/:id`        | Delete a task                 |

### Example API Usage

**Get all tasks:**

```bash
curl http://localhost:3000/tasks
```

**Create a task:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Complete interview task"}'
```

**Toggle task completion:**

```bash
curl -X PUT http://localhost:3000/tasks/1/toggle
```

**Delete a task:**

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Design Decisions

### Minimal Dependencies

- **No external npm packages**: Uses only Node.js built-in modules (`http`, `fs`, `path`)
- **No frontend frameworks**: Pure vanilla JavaScript for better understanding and control
- **No database**: Simple JSON file storage is sufficient for the use case

### Why These Choices?

1. **Simplicity**: Easy to understand, maintain, and demonstrate
2. **Transparency**: All logic is visible and straightforward
3. **Performance**: Minimal overhead, fast startup
4. **Portability**: Can run anywhere Node.js is installed

### Code Organization

- **Separation of concerns**: HTML (structure), CSS (presentation), JS (logic)
- **RESTful API**: Standard HTTP methods and status codes
- **Error handling**: Comprehensive error handling throughout
- **Code comments**: Clear documentation of functionality

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- Fetch API for HTTP requests

## Testing the Persistence

To verify that data persists:

1. Start the server: `node index.js`
2. Open `http://localhost:3000` in your browser
3. Add several tasks
4. Stop the server (Ctrl+C)
5. Start the server again: `node index.js`
6. Refresh the browser - your tasks should still be there
7. Check `tasks.json` to see the raw data
