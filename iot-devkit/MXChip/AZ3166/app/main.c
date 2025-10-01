/* 
 * Copyright (c) Microsoft
 * Copyright (c) 2024 Eclipse Foundation
 * 
 *  This program and the accompanying materials are made available 
 *  under the terms of the MIT license which is available at
 *  https://opensource.org/license/mit.
 * 
 *  SPDX-License-Identifier: MIT
 * 
 *  Contributors: 
 *     Microsoft         - Initial version
 *     Frédéric Desbiens - 2024 version.
 */

#include <stdio.h>

#include "tx_api.h"

#include "board_init.h"
#include "cmsis_utils.h"
#include "screen.h"
#include "sntp_client.h"
#include "wwd_networking.h"
#include "sensor.h"

#include "cloud_config.h"

#define ECLIPSETX_THREAD_STACK_SIZE 4096
#define ECLIPSETX_THREAD_PRIORITY   4
#define UI_THREAD_STACK_SIZE        2048
#define UI_THREAD_PRIORITY          3

TX_THREAD eclipsetx_thread;
TX_THREAD ui_thread;
ULONG eclipsetx_thread_stack[ECLIPSETX_THREAD_STACK_SIZE / sizeof(ULONG)];
ULONG ui_thread_stack[UI_THREAD_STACK_SIZE / sizeof(ULONG)];

// Global variables for state tracking
static int wifi_connected = 0;
static int button_a_pressed = 0;
static int button_b_pressed = 0;

static void displayMegaBosses(void)
{
        screen_print("MegaBosses!", L1);
}

    
static void ui_thread_entry(ULONG parameter)
{
    char display_buffer[64];
    int last_button_a_state = 0;
    int last_button_b_state = 0;
    int sensor_init_success = 0;
    
    printf("UI_THREAD: Starting UI thread\r\n");
    
    // Initialize sensors with error checking
    printf("UI_THREAD: Initializing sensors...\r\n");
    if (hts221_config() == SENSOR_OK) {
        printf("UI_THREAD: HTS221 temperature sensor initialized\r\n");
        sensor_init_success++;
    } else {
        printf("UI_THREAD: ERROR - HTS221 sensor initialization failed\r\n");
    }
    
    if (lps22hb_config() == SENSOR_OK) {
        printf("UI_THREAD: LPS22HB pressure sensor initialized\r\n");
        sensor_init_success++;
    } else {
        printf("UI_THREAD: ERROR - LPS22HB sensor initialization failed\r\n");
    }
    
    printf("UI_THREAD: Sensors initialized (%d/2 successful)\r\n", sensor_init_success);
    
    // Display default message
    displayMegaBosses();
    printf("UI_THREAD: Default display set to 'MegaBosses!'\r\n");
    printf("UI_THREAD: Button monitoring active - Press A for temp, B for WiFi\r\n");
 
    while (1)
    {
        // Check button A (temperature)
        int current_button_a = BUTTON_A_IS_PRESSED;
        if (current_button_a && !last_button_a_state) 
        {
            button_a_pressed = !button_a_pressed;
            button_b_pressed = 0; // Clear other button state
            
            printf("UI_THREAD: Button A pressed\r\n");
            
            if (button_a_pressed) 
            {
                // Read temperature from HTS221 sensor
                hts221_data_t temp_data = hts221_data_read();
                snprintf(display_buffer, sizeof(display_buffer), "Temp: %.1f C", (double)temp_data.temperature_degC);
                screen_print(display_buffer, L1);
                printf("UI_THREAD: Temperature reading: %.1f°C\r\n", (double)temp_data.temperature_degC);
            }
            else 
            {
                displayMegaBosses();
                printf("UI_THREAD: Display reset to default\r\n");
            }
        }
        
        // button B (WiFi status)
        int current_button_b = BUTTON_B_IS_PRESSED;
        if (current_button_b && !last_button_b_state) 
        {
            button_b_pressed = !button_b_pressed;
            button_a_pressed = 0; // Clear other button state
            
            printf("UI_THREAD: Button B pressed\r\n");
    
            if (button_b_pressed) 
            {
                if (wifi_connected) 
                {
                    screen_print("WiFi: Connected", L1);
                    WIFI_LED_ON();
                    printf("UI_THREAD: WiFi status displayed - Connected\r\n");
                }
                else 
                {
                    screen_print("WiFi: Disconnected", L1);
                    WIFI_LED_OFF();
                    printf("UI_THREAD: WiFi status displayed - Disconnected\r\n");
                }
            }
            else 
            {
                displayMegaBosses();
                WIFI_LED_OFF();
                printf("UI_THREAD: Display reset to default\r\n");
            }
        }
        
        last_button_a_state = current_button_a;
        last_button_b_state = current_button_b;
        
        // Small delay to prevent button bouncing
        tx_thread_sleep(TX_TIMER_TICKS_PER_SECOND / 20);
    }
}

static void eclipsetx_thread_entry(ULONG parameter)
{
    UINT status;
    int connection_attempts = 0;
    const int max_attempts = 3;

    printf("NETWORK_THREAD: Starting Eclipse ThreadX networking thread\r\n");
    printf("NETWORK_THREAD: Initializing WiFi subsystem...\r\n");

    // Initialize the network with retry logic
    for (connection_attempts = 1; connection_attempts <= max_attempts; connection_attempts++) {
        printf("NETWORK_THREAD: WiFi initialization attempt %d/%d\r\n", connection_attempts, max_attempts);
        
        status = wwd_network_init(WIFI_SSID, WIFI_PASSWORD, WIFI_MODE);
        if (status == 0) {
            printf("NETWORK_THREAD: WiFi network initialization successful\r\n");
            break;
        } else {
            printf("NETWORK_THREAD: WiFi initialization failed (0x%08x), attempt %d/%d\r\n", status, connection_attempts, max_attempts);
            if (connection_attempts < max_attempts) {
                printf("NETWORK_THREAD: Retrying in 2 seconds...\r\n");
                tx_thread_sleep(TX_TIMER_TICKS_PER_SECOND * 2);
            }
        }
    }
    
    if (status != 0) {
        printf("NETWORK_THREAD: ERROR - All WiFi initialization attempts failed\r\n");
        wifi_connected = 0;
        CLOUD_LED_OFF();
    } else {
        printf("NETWORK_THREAD: Attempting WiFi connection...\r\n");
        
        // Attempt to connect
        if (wwd_network_connect() == 0) {
            wifi_connected = 1;
            printf("NETWORK_THREAD: WiFi connected successfully\r\n");
            printf("NETWORK_THREAD: Network ready for communication\r\n");
            CLOUD_LED_ON();
        } else {
            wifi_connected = 0;
            printf("NETWORK_THREAD: WiFi connection failed\r\n");
            CLOUD_LED_OFF();
        }
    }
    
    printf("NETWORK_THREAD: Network initialization complete, status: %s\r\n", 
           wifi_connected ? "Connected" : "Disconnected");
    
    // Keep the thread alive with periodic status updates
    int status_counter = 0;
    while (1) {
        tx_thread_sleep(TX_TIMER_TICKS_PER_SECOND * 10); // Sleep for 10 seconds
        
        status_counter++;
        if (status_counter % 6 == 0) { // Every 60 seconds
            printf("NETWORK_THREAD: Periodic status - WiFi: %s, Uptime: %d minutes\r\n", 
                   wifi_connected ? "Connected" : "Disconnected", status_counter);
        }
    }
}

void tx_application_define(void* first_unused_memory)
{
    printf("SYSTEM: ThreadX application initialization starting\r\n");
    
    systick_interval_set(TX_TIMER_TICKS_PER_SECOND);
    printf("SYSTEM: System tick configured\r\n");

    // Create main ThreadX thread
    printf("SYSTEM: Creating network thread...\r\n");
    UINT status = tx_thread_create(&eclipsetx_thread,
        "Eclipse ThreadX Thread",
        eclipsetx_thread_entry,
        0,
        eclipsetx_thread_stack,
        ECLIPSETX_THREAD_STACK_SIZE,
        ECLIPSETX_THREAD_PRIORITY,
        ECLIPSETX_THREAD_PRIORITY,
        TX_NO_TIME_SLICE,
        TX_AUTO_START);

    if (status != TX_SUCCESS) {
        printf("SYSTEM: ERROR - Network thread creation failed (0x%08x)\r\n", status);
    } else {
        printf("SYSTEM: Network thread created successfully\r\n");
    }

    // Create UI thread for button handling and display
    printf("SYSTEM: Creating UI thread...\r\n");
    status = tx_thread_create(&ui_thread,
        "UI Thread",
        ui_thread_entry,
        0,
        ui_thread_stack,
        UI_THREAD_STACK_SIZE,
        UI_THREAD_PRIORITY,
        UI_THREAD_PRIORITY,
        TX_NO_TIME_SLICE,
        TX_AUTO_START);

    if (status != TX_SUCCESS) {
        printf("SYSTEM: ERROR - UI thread creation failed (0x%08x)\r\n", status);
    } else {
        printf("SYSTEM: UI thread created successfully\r\n");
    }
    
    printf("SYSTEM: ThreadX application initialization complete\r\n");
}

int main(void)
{
    // Initialize the board
    printf("=== MXChip AZ3166 Starting ===\r\n");
    printf("MAIN: Initializing board hardware...\r\n");
    
    board_init();
    
    printf("MAIN: Board initialization complete\r\n");
    printf("MAIN: Firmware: MegaBosses Custom v1.0\r\n");
    printf("MAIN: Features: Temperature sensor, WiFi connectivity, Button interface\r\n");
    printf("MAIN: ThreadX RTOS starting...\r\n");
    printf("MAIN: Press A for temperature, B for WiFi status\r\n");
    printf("===============================\r\n");

    // Enter the ThreadX kernel
    tx_kernel_enter();

    // This should never be reached
    printf("MAIN: ERROR - ThreadX kernel exited unexpectedly\r\n");
    return 1;
}
