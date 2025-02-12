# Project

## Metricly - A server monitoring tool that provides real-time data on the performance of your servers

### Current

- look into the differences between database.py and config.py and see if they can be combined
- adding ip's of server using nmap or manually having them entered in and stored in (file or database)
- make sidebar with all added servers and then look into charts and stuff
- display added servers in the sidebar and switch between them
- mitigate docker container downtime by having option to restart container if it goes down
- beautify dashboard

### TODO

#### Documentation

- Write documentation

#### Frontend

- Sidebar with all added servers
- add server can be a popup where the background gets blurred
- Metrics displayed in real time and human readable
- Whole frontend (dashboard, etc.) (will try to use Material UI and React)
- Charts using mui
- notifications for when a server goes down

#### Backend

- Add more metrics
- Adding servers and getting their metrics over local network
- Full database stuff (sqlite3)
- Making Docker Compose file
- implement notifications
- adding ip's of local servers and having them display at the bottom of the sidebar

#### Miscellaneous

- Testing
- Update .env and requirements
- Figure out what to do with package.json and package-lock.json
- Real-time metrics streaming using WebSockets or Server-Sent Events (SSE).
- Authentication and authorization for server management.
- Historical metrics storage and retrieval for trend analysis.
- Alerts and notifications for threshold breaches.
- Improved network scanning with customizable IP ranges.
- Error handling and logging for better debugging.
