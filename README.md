# Metricly - Docker & System Monitoring Dashboard

Metricly is a modern, real-time monitoring dashboard for Docker containers and system resources. It provides a clean, intuitive interface for monitoring your servers and containers with advanced metrics visualization and alerting capabilities.

## Features

### System Monitoring

- Real-time CPU, Memory, and Disk usage tracking
- Historical data visualization with customizable time ranges
- Interactive line charts for resource usage trends
- Customizable alert thresholds for system resources
- Support for multiple servers (including remote monitoring)

### Container Management

- Comprehensive container health monitoring
- Real-time container metrics (CPU, Memory usage)
- Container status tracking (Running, Stopped, Error states)
- Health indicators based on multiple factors:
  - Resource usage
  - Container status
  - Restart count
  - Exit codes
- Visual progress bars for resource utilization

### User Interface

- Modern, responsive Material-UI design
- Dark/Light theme support
- Real-time data updates
- Interactive charts and graphs
- Customizable dashboard layout
- Mobile-friendly interface

### Security

- JWT-based authentication
- Role-based access control
- Secure password management
- Rate limiting for API endpoints
- Protected API routes

### Alerting System

- Configurable alert thresholds
- Visual alerts for resource usage
- Container health status indicators
- Color-coded status chips
- Real-time alert updates

## Current Development Tasks

### UI Improvements

- Fix light mode theme and styling
- Fix sidebar collapse/expand lag
- Add tooltips to disk mounts in system tab to show full path
- Improve container card layout for better visibility

### Data Integration

- Remove bogus data from servers section
- Fix the add server popup functionality
- Make container actions work properly
- Fetch actual metrics for the network tab
- Define and implement the connections tab functionality

### Backend Integration

- Complete reconnection of redesigned frontend to backend
- Implement proper error handling for API requests
- Add real-time updates for metrics

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

- Advanced log analysis and filtering
- Automated backup and restore
- Custom alert rules and notifications
- API for external integrations

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
