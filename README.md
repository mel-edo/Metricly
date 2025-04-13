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

- Fix sidebar collapse/expand lag - somehow fixed??
- Make the background of the login page more dynamic and cool - tricky
- Fix light mode theme and styling (proper light mode integration) - tricky (currently disabled)

### Data Integration

- the uptime should be refreshed after the container has restarted
- figure out the actual logic behind container's healthy status
- The program currently can't fetch system metrics for remote servers (only works on localhost) - files like container.ts are hardcoded to use 127.0.0.1 as the default server ip

### Backend Integration

- Complete reconnection of redesigned frontend to backend (check what is left to do in here)

### Alerting

- Implement alerts system with configurable thresholds (check on how to alert the user)
- implement system cpu usage, disk usage, mem usage high alerts (just diplay this as a toast)
- implement container cpu usage, mem usage high alerts (but how would you decide how much usage is high enough?)

## Planned Features

### Advanced Analytics

- Predictive resource usage analysis
- Anomaly detection using AI/ML
- Performance trend forecasting
- Resource optimization recommendations
- Automated scaling suggestions

### Docker Integration

- Docker Compose support
- Create container button in containers page
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
- add more things to settings page like email notifications, theme settings

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
