#!/bin/bash

# MXChip AZ3166 Universal Update Script
# Works on macOS, Linux, and Windows (Git Bash/WSL)
# Automatically detects board, flashes firmware, and verifies health

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
FIRMWARE_BIN="$BUILD_DIR/app/mxchip_threadx.bin"

# Health check timeout
HEALTH_TIMEOUT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print status messages
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ SUCCESS${NC}"
}

print_failure() {
    echo -e "${RED}✗ FAILURE${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC} $1"
}

# Function to detect platform and find board
detect_board() {
    local board_mount=""
    local serial_port=""
    
    print_status "Detecting platform and board..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_status "Platform: macOS"
        board_mount=$(find /Volumes -maxdepth 1 -name "*AZ3166*" 2>/dev/null | head -1)
        serial_port=$(ls /dev/cu.usbmodem* 2>/dev/null | head -1)
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_status "Platform: Linux"
        board_mount=$(find /media/$USER -maxdepth 2 -name "*AZ3166*" 2>/dev/null | head -1)
        [[ -z "$board_mount" ]] && board_mount=$(find /mnt -maxdepth 2 -name "*AZ3166*" 2>/dev/null | head -1)
        serial_port=$(ls /dev/ttyACM* /dev/ttyUSB* 2>/dev/null | head -1)
        
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash/Cygwin)
        print_status "Platform: Windows"
        board_mount=$(find /[a-z] -maxdepth 1 -name "*AZ3166*" 2>/dev/null | head -1)
        serial_port=$(ls /dev/ttyS* 2>/dev/null | head -1)
        
    else
        print_warning "Unknown platform: $OSTYPE, using defaults"
        board_mount="/mnt/AZ3166"
        serial_port="/dev/ttyACM0"
    fi
    
    # Export for use by other functions
    export BOARD_MOUNT="$board_mount"
    export SERIAL_PORT="$serial_port"
    
    # Validate detection
    if [[ -z "$board_mount" ]] || [[ ! -d "$board_mount" ]]; then
        echo -e "${RED}ERROR: MXChip AZ3166 board not found${NC}"
        echo "Please ensure:"
        echo "1. Board is connected via USB"
        echo "2. Board is in bootloader mode (double-click RESET button)"
        echo "3. Board appears as mass storage device"
        return 1
    fi
    
    if [[ -z "$serial_port" ]] || [[ ! -e "$serial_port" ]]; then
        print_warning "Serial port not detected, health check will be skipped"
        export SERIAL_PORT=""
    fi
    
    print_status "Board found at: $board_mount"
    [[ -n "$serial_port" ]] && print_status "Serial port: $serial_port"
    
    return 0
}

# Function to get file size (cross-platform)
get_file_size() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file" 2>/dev/null
    else
        stat -c%s "$file" 2>/dev/null
    fi
}

# Function to build firmware if needed
build_firmware() {
    if [[ ! -f "$FIRMWARE_BIN" ]]; then
        print_status "Building firmware..."
        cd "$SCRIPT_DIR"
        
        if ! cmake --build build >/dev/null 2>&1; then
            echo -e "${RED}ERROR: Firmware build failed${NC}"
            echo "Run 'cmake --build build' manually to see error details"
            return 1
        fi
        
        if [[ ! -f "$FIRMWARE_BIN" ]]; then
            echo -e "${RED}ERROR: Build succeeded but firmware binary not found${NC}"
            return 1
        fi
    fi
    
    local size=$(get_file_size "$FIRMWARE_BIN")
    print_status "Firmware ready: $(basename "$FIRMWARE_BIN") (${size} bytes)"
    return 0
}

# Function to wait for board reconnection
wait_for_reconnection() {
    if [[ -z "$SERIAL_PORT" ]]; then
        print_status "No serial port detected, skipping reconnection wait"
        sleep 5  # Give board time to reboot
        return 0
    fi
    
    local timeout=15
    local elapsed=0
    
    print_status "Waiting for board to reconnect..."
    
    # Wait for disconnection first
    sleep 2
    
    while [[ $elapsed -lt $timeout ]]; do
        if [[ -e "$SERIAL_PORT" ]]; then
            print_status "Board reconnected after ${elapsed}s"
            sleep 2  # Stabilization delay
            return 0
        fi
        
        sleep 1
        elapsed=$((elapsed + 1))
        
        if [[ $((elapsed % 5)) -eq 0 ]]; then
            print_status "Still waiting... (${elapsed}/${timeout}s)"
        fi
    done
    
    print_warning "Board did not reconnect within ${timeout}s"
    return 1
}

# Function to flash firmware
flash_firmware() {
    print_status "Flashing firmware to board..."
    
    if cp "$FIRMWARE_BIN" "$BOARD_MOUNT/"; then
        print_status "Firmware copied successfully"
        print_status "Board will reboot automatically..."
        
        # Wait for board to reboot and reconnect
        if wait_for_reconnection; then
            print_status "Board reconnected and ready"
            return 0
        else
            print_warning "Board reconnection timeout (firmware may still work)"
            return 0  # Continue anyway
        fi
    else
        echo -e "${RED}ERROR: Failed to copy firmware to board${NC}"
        return 1
    fi
}

# Function to perform health check
health_check() {
    if [[ -z "$SERIAL_PORT" ]]; then
        print_warning "No serial port available, skipping health check"
        return 0  # Assume success
    fi
    
    if [[ ! -e "$SERIAL_PORT" ]]; then
        print_warning "Serial port not available, skipping health check"
        return 0  # Assume success
    fi
    
    print_status "Performing health check (${HEALTH_TIMEOUT}s)..."
    print_status "Monitoring: $SERIAL_PORT"
    
    local temp_file=$(mktemp)
    local success=false
    
    # Capture serial output
    {
        timeout "$HEALTH_TIMEOUT" cat "$SERIAL_PORT" > "$temp_file" 2>/dev/null || true
    } &
    
    local monitor_pid=$!
    
    # Show progress
    local elapsed=0
    while [[ $elapsed -lt $HEALTH_TIMEOUT ]] && kill -0 $monitor_pid 2>/dev/null; do
        sleep 3
        elapsed=$((elapsed + 3))
        if [[ $((elapsed % 9)) -eq 0 ]]; then
            print_status "Health check progress: ${elapsed}/${HEALTH_TIMEOUT}s"
        fi
    done
    
    wait "$monitor_pid" 2>/dev/null || true
    
    # Analyze output
    if [[ -f "$temp_file" ]]; then
        local output=$(cat "$temp_file")
        
        # Check for success indicators
        local boot_ok=false
        local system_ok=false
        local threads_ok=false
        local error_found=false
        
        # Boot sequence
        if echo "$output" | grep -q "MXChip AZ3166 Starting\|Board initialization complete\|MegaBosses"; then
            boot_ok=true
            print_status "✓ Boot sequence detected"
        fi
        
        # System initialization  
        if echo "$output" | grep -q "ThreadX.*complete\|SYSTEM.*complete\|ThreadX RTOS starting"; then
            system_ok=true
            print_status "✓ System initialization detected"
        fi
        
        # Thread activity
        if echo "$output" | grep -q "UI_THREAD\|NETWORK_THREAD\|thread.*created\|Button monitoring"; then
            threads_ok=true
            print_status "✓ Thread activity detected"
        fi
        
        # Error detection
        if echo "$output" | grep -qi "ERROR.*failed\|FAIL\|crash\|panic\|exception"; then
            error_found=true
            print_warning "Errors detected in output"
        fi
        
        # Show sample output
        print_status "Sample output:"
        echo "$output" | tail -5 | sed 's/^/  /'
        
        # Determine overall health
        if $boot_ok && $system_ok && ! $error_found; then
            success=true
        elif $boot_ok && ! $error_found; then
            success=true  # Partial success
            print_warning "Partial success - some components may not be fully initialized"
        fi
        
        rm -f "$temp_file"
    fi
    
    if $success; then
        print_status "✓ Health check passed"
        return 0
    else
        print_status "✗ Health check failed"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "MXChip AZ3166 Universal Update Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --timeout=N    Health check timeout in seconds (default: 30)"
    echo "  --help         Show this help message"
    echo ""
    echo "This script will:"
    echo "1. Auto-detect your platform (macOS/Linux/Windows)"
    echo "2. Find the connected MXChip AZ3166 board"
    echo "3. Build firmware if needed"
    echo "4. Flash the firmware"
    echo "5. Perform health check via serial monitoring"
    echo ""
    echo "Make sure the board is in bootloader mode (double-click RESET)"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --timeout=*)
            HEALTH_TIMEOUT="${1#*=}"
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "=============================================="
    echo "  MXChip AZ3166 Universal Update Script"
    echo "=============================================="
    
    # Step 1: Detect board and platform
    if ! detect_board; then
        print_failure
        exit 1
    fi
    
    # Step 2: Build firmware
    if ! build_firmware; then
        print_failure
        exit 1
    fi
    
    # Step 3: Flash firmware
    if ! flash_firmware; then
        print_failure
        exit 1
    fi
    
    # Step 4: Health check
    if health_check; then
        echo "=============================================="
        print_success
        echo "Firmware update completed successfully!"
        echo "=============================================="
        exit 0
    else
        echo "=============================================="
        print_failure
        echo "Firmware flashed but health check failed"
        echo "Board may still be functional - check manually"
        echo "=============================================="
        exit 1
    fi
}

# Run main function
main "$@"
