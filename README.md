# Metricly - A server monitoring tool that provides real-time data on the performance of your servers

## Current

- adding ip's of server using nmap or manually having them entered in and stored in (file or database)
- make sidebar with all added servers and then look into charts and stuff
- fix docker container buttons
- beautify dashboard

- put a better example in the ppt
- can you add ai in any way
- add diagrams in the ppt
- write outcomes in the ppt
- how would the serer admin handle the issue
- write a script and choose words carefully
- Am I using any algorithms in this project

### TODO

#### Frontend

- Sidebar with all added servers
- Charts using mui
- notifications for when a server goes down
- Alerts and notifications for threshold breaches.
- when traffic peaks make a alert at the area of the page where it says no active alerts
- Historical metrics storage and retrieval for trend analysis.

#### Backend

- Adding servers and getting their metrics over local network
- Making Docker Compose file
- implement notifications
- adding ip's of local servers and having them display at the bottom left of the sidebar instead of having it highlighted
- network scanning with customizable IP ranges.
- Authentication and authorization for server management.

#### Miscellaneous

- Update .env and requirements
- check package.json and package-lock.json
- Future: Real-time metrics streaming using WebSockets or Server-Sent Events (SSE).

#### Bugs

- adding bogus servers still gives metrics
- can't remove servers once I've used them once
- fix docker container grabbing the 2nd port in dockercontainers.jsx
- docker containers disappear once they've been stopped
- don't display green checkmark if server is down
- error when adding server which requires a page reload to fix

- more testing

#### Documentation

- Write documentation
