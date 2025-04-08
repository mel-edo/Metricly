# Metricly - Docker & System Monitoring Dashboard

Metricly is a modern, real-time monitoring dashboard for Docker containers and system resources. It provides a clean, intuitive interface for monitoring your servers and containers with advanced metrics visualization and alerting capabilities.

## Features

### System Monitoring

- Real-time CPU, Memory, and Disk usage tracking
- Historical data visualization with customizable time ranges
- Interactive line charts for resource usage trends
- Support for multiple servers (including remote monitoring)

### Container Management

- Real-time container metrics (CPU, Memory usage)
- Container status tracking (Running, Stopped, Error states)
- Color-coded status chips

### User Interface

- Modern, responsive Shadcn UI design
- Dark/Light theme support
- Real-time data updates
- Interactive charts and graphs
- Mobile-friendly interface

### Security

- JWT-based authentication
- Role-based access control
- Secure password management
- Rate limiting for API endpoints
- Protected API routes

### Alerting System

- not started

## Current Development Tasks

### UI Improvements

- Fix sidebar collapse/expand lag - tricky
- Make the background of the login page more dynamic and cool - tricky
- Fix light mode theme and styling (proper light mode integration) - tricky

### Data Integration

- Fix the add server popup functionality
- Make container actions work properly
- Fetch actual metrics for the network tab
- figure out the actual logic behind container's healthy status
- Add detailed container view when clicking from dashboard, maybe route to container tab in sidebar
- Define and implement the connections tab functionality
- make the options work for each server in the servers section

### Backend Integration

- Create settings page with username and password change functionality
- Implement proper error handling for API requests (to which end is this required)
- Implement alerts system with configurable thresholds (check on how to alert the user)
- Add real-time updates for metrics (should be done)
- Complete reconnection of redesigned frontend to backend (check what is left to do in here)

## Planned Features

### Advanced Analytics

- Predictive resource usage analysis
- Anomaly detection using AI/ML
- Performance trend forecasting
- Resource optimization recommendations
- Automated scaling suggestions

### Docker Integration

- Docker Compose support
- Container orchestration features
- Multi-cluster management
- Container networking visualization
- Automated container health checks

### Testing & Deployment

- Multi-server testing environment
- Load testing capabilities
- Performance benchmarking
- Automated deployment pipelines
- Container image vulnerability scanning

### Additional Features

- Advanced log analysis and filtering (what does adv log analysis even mean)
- Automated backup and restore
- Custom alert rules and notifications (alerts on email, discord etc)
- check on all API for external integrations that could be used to make this even better


## Technical Stack

- Frontend: React + Vite + TypeScript
- UI Framework: Shadcn UI + Tailwind CSS
- Backend: Flask
- Database: SQLite
- Authentication: JWT
- Charts: Recharts
- Container Management: Docker SDK
- State Management: React Context + React Query

## Getting Started

[Installation and setup instructions to be added]

## Contributing

[Contribution guidelines to be added]

## License

See [LICENSE](../LICENSE) file for details.
