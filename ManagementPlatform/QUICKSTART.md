# FleetSync OTA - Quick Start Guide 🚀

Get your Fleet Management and OTA Update system running in minutes!

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)

## 🎯 Quick Start (3 steps)

### 1️⃣ Build the Application
```bash
./docker.sh build
```

### 2️⃣ Start the Application
```bash
./docker.sh start
```

### 3️⃣ Open in Browser
```bash
./docker.sh open
```

Or manually visit: **http://localhost:3000**

---

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `./docker.sh build` | Build the Docker image |
| `./docker.sh start` | Start the application |
| `./docker.sh stop` | Stop the application |
| `./docker.sh restart` | Restart the application |
| `./docker.sh logs` | View application logs |
| `./docker.sh status` | Check if containers are running |
| `./docker.sh health` | Check container health |
| `./docker.sh open` | Open app in browser |
| `./docker.sh clean` | Remove all containers and images |

---

## 🔄 Development Workflow

### Making Changes
1. Edit your code
2. Rebuild and restart:
```bash
./docker.sh build
./docker.sh restart
```

### Viewing Logs
```bash
./docker.sh logs
```
Press `Ctrl+C` to exit log viewing

### Checking Status
```bash
./docker.sh status
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs for errors
./docker.sh logs

# Check status
./docker.sh status

# Try cleaning and rebuilding
./docker.sh clean
./docker.sh build
./docker.sh start
```

### Port 3000 already in use
Edit `docker-compose.yml` and change the port:
```yaml
ports:
  - "8080:80"  # Change 3000 to any available port
```

### Can't access localhost:3000
1. Check if container is running: `./docker.sh status`
2. Check health: `./docker.sh health`
3. Try restarting: `./docker.sh restart`

---

## 🎨 Application Features

### Fleet Management
- View all vehicles in your fleet
- Check vehicle status (Active/Maintenance/Charging)
- Monitor software component versions across 5 ECUs:
  - Infotainment System
  - Emergency Braking
  - Battery Management
  - Fleet Telemetry
  - Interior Controls

### OTA Update Campaigns
- **Security Updates**: Critical security patches
- **Performance Optimization**: Improve vehicle performance
- **Feature Rollout**: New features deployment

### Vehicle Details
- Click any vehicle card to see detailed information
- View all software components and versions
- See which components need updates
- Trigger OTA updates for specific components
- ✅ Components with latest version show "Latest version installed"
- 🔄 Outdated components show "Trigger Update" button

---

## 🌟 Demo Data

The application includes realistic demo data:

- **Fleet Size**: 5 vehicles (FL-PT-4701 to FL-PT-4705)
- **Campaigns**: 3 active update campaigns
- **Components**: 5 software components per vehicle
- **Versions**: Mix of up-to-date and outdated software

### Sample Vehicles:
- **FL-PT-4701**: ✅ All components fully updated
- **FL-PT-4702**: Mixed versions (some outdated)
- **FL-PT-4703**: Several components need updates
- **FL-PT-4704**: Emergency Braking updated recently
- **FL-PT-4705**: Multiple updates needed

---

## 📦 Project Structure

```
MegaBosses/
├── docker.sh              # Helper script for Docker commands
├── docker-compose.yml     # Docker orchestration
├── Dockerfile            # Multi-stage build configuration
├── nginx.conf            # Production web server config
├── src/
│   ├── components/       # React components
│   ├── data/            # Mock data (modular structure)
│   ├── services/        # API and policy logic
│   └── types/           # TypeScript types
└── Docs/
    ├── Docker.md        # Detailed Docker documentation
    └── QUICKSTART.md    # This file
```

---

## 🚀 Deployment to Production

### Docker Hub
```bash
# Tag your image
docker tag fleetsync-ota:latest your-username/fleetsync-ota:latest

# Push to Docker Hub
docker push your-username/fleetsync-ota:latest

# Pull and run on any server
docker pull your-username/fleetsync-ota:latest
docker run -d -p 80:80 your-username/fleetsync-ota:latest
```

### AWS ECS
See detailed instructions in `Docs/Docker.md`

### Azure Container Instances
See detailed instructions in `Docs/Docker.md`

---

## 🆘 Need More Help?

- **Detailed Docker Documentation**: See `Docs/Docker.md`
- **Project Overview**: See `README.md`
- **Complete Project Summary**: See `Docs/ProjectSummary.md`
- **Team Structure**: See `Docs/SolutionPlan.md`

---

## ✅ Verification Checklist

After starting the application, verify:

- [ ] Application loads at http://localhost:3000
- [ ] Navigation works (Fleet, Campaigns, Policies)
- [ ] Vehicle cards display correctly
- [ ] Clicking a vehicle opens the modal
- [ ] Modal shows all 5 software components
- [ ] Updated components show ✅ "Latest version installed"
- [ ] Outdated components show "Trigger Update" button
- [ ] Campaign statistics match fleet status
- [ ] No console errors in browser developer tools

---

## 🎉 Success!

You're now running FleetSync OTA!

**Next Steps**:
- Explore the fleet view
- Click on vehicles to see details
- Check campaign progress
- Try triggering OTA updates

**Happy Fleet Managing! 🚛✨**
