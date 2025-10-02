#!/bin/bash

# FleetSync OTA - Docker Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Build the Docker image
build() {
    print_info "Building Docker image..."
    docker-compose build --no-cache
    print_success "Build completed!"
}

# Start containers
start() {
    print_info "Starting containers..."
    docker-compose up -d
    print_success "Containers started!"
    print_info "Application available at: http://localhost:3000"
}

# Stop containers
stop() {
    print_info "Stopping containers..."
    docker-compose down
    print_success "Containers stopped!"
}

# Restart containers
restart() {
    print_info "Restarting containers..."
    docker-compose restart
    print_success "Containers restarted!"
}

# View logs
logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Check status
status() {
    print_info "Container status:"
    docker-compose ps
}

# Clean up
clean() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        docker image prune -a -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Open in browser
open_browser() {
    print_info "Opening application in browser..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000
    else
        print_warning "Please open http://localhost:3000 in your browser"
    fi
}

# Health check
health() {
    print_info "Checking container health..."
    if docker ps | grep -q fleetsync-ota; then
        print_success "Container is running"
        docker inspect fleetsync-ota --format='{{.State.Health.Status}}' 2>/dev/null || print_warning "Health check not available"
    else
        print_error "Container is not running"
        exit 1
    fi
}

# Show help
show_help() {
    echo ""
    echo "FleetSync OTA - Docker Helper Script"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build       Build the Docker image"
    echo "  start       Start the containers"
    echo "  stop        Stop the containers"
    echo "  restart     Restart the containers"
    echo "  logs        View container logs"
    echo "  status      Check container status"
    echo "  clean       Remove all containers and images"
    echo "  open        Open application in browser"
    echo "  health      Check container health"
    echo "  help        Show this help message"
    echo ""
}

# Main script
main() {
    check_docker
    check_docker_compose

    case "${1:-help}" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        open)
            open_browser
            ;;
        health)
            health
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
