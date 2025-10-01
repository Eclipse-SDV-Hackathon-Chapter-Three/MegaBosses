# FleetSync OTA - Demo Application

**Policy-Driven OTA Updates for Municipal Fleets**  
Eclipse SDV Hackathon Chapter Three | Team MegaBosses

---

## 🎯 Overview

This is the **FleetSync OTA** web application - a production-ready dashboard for managing Over-The-Air (OTA) software updates across municipal vehicle fleets with intelligent policy-driven update orchestration.

### Key Features

- 🚛 **Fleet Management**: Real-time vehicle monitoring and software component tracking
- 📦 **Campaign Management**: Orchestrate OTA update campaigns across multiple vehicles
- 🎯 **Policy Engine**: Schedule-aware, battery-aware, location-aware update policies
- 🔒 **UN R155/R156 Compliant**: Full audit trail and regulatory compliance
- 🐳 **Dockerized**: Production-ready containerization with nginx
- ⚡ **Modern Stack**: React 18 + TypeScript + Vite + Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm (for development)
- **Docker** and Docker Compose (for production deployment)

### Option 1: Docker (Recommended)

```bash
# Build and start the application
./docker.sh build
./docker.sh start

# Open in browser
open http://localhost:3000
```

### Option 2: Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

---

## 📋 Available Commands

### Docker Commands

```bash
./docker.sh build      # Build Docker image
./docker.sh start      # Start containers
./docker.sh stop       # Stop containers
./docker.sh restart    # Restart containers
./docker.sh logs       # View logs
./docker.sh status     # Check status
./docker.sh health     # Health check
./docker.sh open       # Open in browser
./docker.sh clean      # Remove all containers/images
```

### Development Commands

```bash
npm run dev           # Start dev server (port 5173)
npm run build         # Production build
npm run preview       # Preview production build
npm run type-check    # TypeScript type checking
```

---

## 📁 Project Structure

```
Demo/
├── src/                      # Source code
│   ├── components/          # React components
│   │   ├── FleetView.tsx
│   │   ├── CampaignsView.tsx
│   │   ├── PoliciesView.tsx
│   │   └── VehicleModal.tsx
│   ├── data/               # Mock data (modular)
│   │   ├── fleetData.ts
│   │   ├── campaignsData.ts
│   │   └── softwareCatalog.ts
│   ├── services/           # Business logic
│   │   ├── api.ts
│   │   └── policyEngine.ts
│   └── types/              # TypeScript types
│       └── index.ts
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Container orchestration
├── nginx.conf              # Production web server
├── QUICKSTART.md           # Quick start guide
├── DOCKER_TEST_RESULTS.md  # Docker test results
└── README.md               # This file
```

---

## 🎨 Application Features

### Fleet View
- **Vehicle Grid**: 5 municipal fleet vehicles (FL-PT-4701 to FL-PT-4705)
- **Status Indicators**: Active, Maintenance, Charging, Parked
- **Software Components**: 5 ECU components per vehicle
  - ABS
  - Instrument Cluster
  - Emergency Braking
  - Hydraulic Control
  - Engine Management
- **Real-time Filtering**: By status, software component, location
- **Update Eligibility**: Policy-based eligibility checking

### Campaign Management
- **Active Campaigns**: 3 update campaigns
  - Security Patch
  - Performance Optimization
  - Feature Rollout
- **Progress Tracking**: Target vs Completed vehicles
- **Batch Updates**: Trigger updates for all eligible vehicles
- **Policy Enforcement**: Automatic policy checking

### Policy Engine
- **Operational Schedule**: Updates only 22:00-04:00
- **Battery Level**: Minimum 60% charge
- **Depot Location**: Only update at depot
- **Network Conditions**: WiFi/4G/5G fallback
- **Fleet Availability**: Minimum 85% operational

### Vehicle Details Modal
- **Component Status**: Latest version vs Available version
- **Update Indicators**:
  - ✅ "Latest version installed" (green badge)
  - 🔄 "Trigger Update" button (for outdated components)
- **Update History**: Last update timestamp
- **Vehicle Telemetry**: Battery, location, network strength

---

## 🐳 Docker Deployment

### Production Build

The application uses a **multi-stage Docker build**:

1. **Stage 1 (Builder)**: `node:20-alpine`
   - Install dependencies
   - Build production assets
   
2. **Stage 2 (Production)**: `nginx:alpine`
   - Copy built assets
   - Configure nginx
   - Optimize for production

**Final Image Size**: ~82 MB (optimized)

### Nginx Configuration

- ✅ SPA routing (`try_files` for React Router)
- ✅ Gzip compression (70% payload reduction)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ Static caching (1-year expiry for immutable assets)
- ✅ Health checks (automated monitoring)

---

## 📊 Demo Data

The application includes realistic demo data:

### Fleet Vehicles
1. **FL-PT-4701**: Heavy Duty - All components updated ✅
2. **FL-PT-4702**: Medium Duty - Mixed versions
3. **FL-PT-4703**: Heavy Duty - Several updates needed
4. **FL-PT-4704**: Light Duty - Emergency Braking updated
5. **FL-PT-4705**: Specialized - Multiple updates needed

### Vehicle Types
- **Heavy Duty**: Scania P 320 DB4x2
- **Medium Duty**: Volvo FE 280
- **Light Duty**: Mercedes Econic 2630
- **Specialized**: Volvo FL 280

### Software Components
- **ABS**: v2.4.1 (latest)
- **Instrument Cluster**: v3.1.2 (latest)
- **Emergency Braking**: v1.8.4 (latest)
- **Hydraulic Control**: v4.2.2-euro6 (latest)
- **Engine Management**: v5.0.3 (latest)

---

## 🔧 Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Production
- **Docker**: Containerization
- **Nginx**: High-performance web server
- **Alpine Linux**: Minimal, secure base image

### Development
- **ESLint**: Code quality
- **PostCSS**: CSS processing
- **Hot Module Replacement**: Fast development

---

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)**: Get started in 3 steps
- **[DOCKER_TEST_RESULTS.md](./DOCKER_TEST_RESULTS.md)**: Complete Docker test results
- **[../Docs/Docker.md](../Docs/Docker.md)**: Detailed Docker deployment guide
- **[../Docs/ProjectSummary.md](../Docs/ProjectSummary.md)**: Complete project documentation
- **[../Docs/STRUCTURE.md](../Docs/STRUCTURE.md)**: Project structure guide

---

## 🚀 Deployment

### Local Deployment
```bash
./docker.sh build && ./docker.sh start
# Access at http://localhost:3000
```

### Cloud Deployment

#### Docker Hub
```bash
docker tag demo:latest your-username/fleetsync-ota:latest
docker push your-username/fleetsync-ota:latest
```

#### AWS ECS/Fargate
See [Docs/Docker.md](../Docs/Docker.md) for detailed instructions

#### Azure Container Instances
See [Docs/Docker.md](../Docs/Docker.md) for detailed instructions

#### Google Cloud Run
```bash
gcloud run deploy fleetsync-ota --image your-username/fleetsync-ota:latest
```

---

## ✅ Quality Assurance

### Tests Passed
- ✅ Docker build: SUCCESS (14.3s)
- ✅ Container start: SUCCESS (< 1s)
- ✅ Health checks: PASSING
- ✅ HTTP responses: 200 OK
- ✅ TypeScript compilation: No errors
- ✅ Image size: 81.7 MB (optimized)

### Performance
- **Build time**: ~14 seconds (cold), < 5 seconds (cached)
- **Startup time**: < 1 second
- **Memory usage**: ~10-20 MB
- **Image size**: 81.7 MB

---

## 👥 Team MegaBosses

- **Jorge Cruz**: Ankaios Integration
- **Luis Filipe Carvalho**: Backend Logic
- **Melanie Reis**: Frontend & UX
- **Rui Pires**: Infrastructure
- **Teresa Chow**: Coordination

---

## 📄 License

This project was created for the Eclipse SDV Hackathon Chapter Three.

---

## 🔗 Links

- **Main Repository**: [Eclipse-SDV-Hackathon-Chapter-Three/MegaBosses](https://github.com/Eclipse-SDV-Hackathon-Chapter-Three/MegaBosses)
- **Eclipse SDV**: [sdv.eclipse.org](https://sdv.eclipse.org/)
- **UN R155/R156**: [UNECE Regulations](https://unece.org/transport/vehicle-regulations)

---

**Built with ❤️ by Team MegaBosses**  
**Eclipse SDV Hackathon Chapter Three | Porto & Berlin 2025**
