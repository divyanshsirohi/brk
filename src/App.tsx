"use client"


import './App.css'



export default function App() {
    return (
        <div className="valentine-background">
            <p>id rather be hated by everyone and loved by you than loved by everyone and hated by you </p>
        </div>
    )
}



#include <lpc17xx.h>
#include <stdio.h>

// ## Pin Definitions ##
// P0.22 for the Buzzer
#define BUZZER_PIN (1 << 22) 
// P0.8 for LCD Register Select (RS)
#define RS_CTRL (1 << 8)    
// P0.9 for LCD Enable (EN)
#define EN_CTRL (1 << 9)     
// P0.4 to P0.7 for LCD Data Lines (D4-D7)
#define DT_CTRL (0xF << 4)   

// ## Constants ##
#define refVtg 3.3 // Reference voltage for ADC is typically 3.3V on LPC1768
#define digitalMax 4095.0 // 12-bit ADC resolution (2^12 - 1)
#define AQI_THRESHOLD 100 // Example threshold for buzzer alert

// ## LCD Messages ##
char msg[] = "CO PPM: ";
char msg2[] = "AQI: ";

// ## LCD Initialization Commands (for 4-bit mode) ##
unsigned long int init_command[] = {0x30, 0x30, 0x30, 0x20, 0x28, 0x0C, 0x06, 0x01, 0x80};

// ## Global Variables ##
unsigned int temp1, temp2, i;
// flag1: 0 for command, 1 for data
// flag2: Special handling for initial commands
int flag1, flag2;

// ## Function Prototypes ##
void lcd_init(void);
void lcd_write(void);
void port_write(void);
void delay(unsigned int);
void lcd_print_msg(const char *msg_ptr, unsigned char line);
int map_adc_to_ppm(int adc_val);

// ## Main Program ##
int main(void) {
    unsigned int mqReading;
    int ppm, aqi;
    char ppmStr[16], aqiStr[16];

    SystemInit();
    SystemCoreClockUpdate();

    // --- ADC Initialization for MQ-7 Sensor on P0.23 ---
    // 1. Configure Pin P0.23 as AD0.0
    LPC_PINCON->PINSEL1 &= ~(3 << 14); // Clear bits 15:14
    LPC_PINCON->PINSEL1 |= (1 << 14);  // Set to 01 for AD0.0 function
    // 2. Enable ADC Power
    LPC_SC->PCONP |= (1 << 12);
    // 3. Configure ADC Control Register
    // Select AD0.0, set clock divider, and enable the ADC
    LPC_ADC->ADCR = (1 << 0) | (4 << 8) | (1 << 21);

    // --- GPIO Initialization for LCD & Buzzer ---
    LPC_GPIO0->FIODIR |= RS_CTRL | EN_CTRL | DT_CTRL | BUZZER_PIN;

    // --- System Setup ---
    lcd_init();
    lcd_print_msg("CO PPM: ", 0x80); // Line 1
    lcd_print_msg("AQI: ", 0xC0);    // Line 2

    while (1) {
        // --- Read Sensor Data ---
        LPC_ADC->ADCR |= (1 << 24); // Start ADC conversion now
        while (!(LPC_ADC->ADGDR & (1U << 31))); // Wait for conversion to complete
        mqReading = (LPC_ADC->ADGDR >> 4) & 0xFFF; // Extract 12-bit result

        // --- Process Data ---
        ppm = map_adc_to_ppm(mqReading);
        aqi = ppm / 2; // Simplified AQI calculation logic

        // --- Display Data on LCD ---
        // Convert integer values to strings
        sprintf(ppmStr, "%-4d", ppm); // Format to 4 chars to overwrite old data
        sprintf(aqiStr, "%-4d", aqi);

        // Display PPM value
        lcd_print_msg(ppmStr, 0x88); // Position after "CO PPM: "
        
        // Display AQI value
        lcd_print_msg(aqiStr, 0xC5); // Position after "AQI: "

        // --- Control Buzzer ---
        if (aqi >= AQI_THRESHOLD) {
            LPC_GPIO0->FIOSET = BUZZER_PIN; // Turn Buzzer ON
        } else {
            LPC_GPIO0->FIOCLR = BUZZER_PIN; // Turn Buzzer OFF
        }
        
        delay(500000); // Wait before next reading
    }
}

/**
 * @brief Maps the 12-bit ADC value to an estimated PPM value.
 * @note This is a placeholder linear mapping. A real sensor requires a logarithmic
 * calculation based on its datasheet (using RL and Rs/R0).
 */
int map_adc_to_ppm(int adc_val) {
    // Simple linear scaling from 0-4095 to 0-1000 PPM as an example
    return (int)(((float)adc_val / 4095.0f) * 1000.0f);
}

/**
 * @brief Initializes the 16x2 LCD in 4-bit mode.
 */
void lcd_init(void) {
    flag1 = 0; // Set to command mode
    for (i = 0; i < 9; i++) {
        temp1 = init_command[i];
        lcd_write();
        delay(30000);
    }
    flag1 = 1; // Set back to data mode
}

/**
 * @brief Writes a command or data to the LCD.
 * Splits the byte into two nibbles for 4-bit mode.
 */
void lcd_write(void) {
    // Special handling for initial 0x30, 0x30, 0x30, 0x20 commands
    flag2 = (flag1 == 0) && ((temp1 == 0x30) || (temp1 == 0x20));
    
    // Send upper nibble
    temp2 = (temp1 >> 4) & 0x0F;
    port_write();

    // Send lower nibble if not a special initial command
    if (!flag2) {
        temp2 = temp1 & 0x0F;
        port_write();
    }
}

/**
 * @brief Sends a 4-bit nibble to the LCD data pins.
 */
void port_write(void) {
    LPC_GPIO0->FIOCLR = DT_CTRL; // Clear data pins P0.4-P0.7
    LPC_GPIO0->FIOSET = (temp2 << 4); // Set new nibble value

    if (flag1 == 0)
        LPC_GPIO0->FIOCLR = RS_CTRL; // RS=0 for command
    else
        LPC_GPIO0->FIOSET = RS_CTRL; // RS=1 for data

    LPC_GPIO0->FIOSET = EN_CTRL; // EN=1 (High)
    delay(25);
    LPC_GPIO0->FIOCLR = EN_CTRL; // EN=0 (High-to-Low pulse)
    delay(30000);
}

/**
 * @brief Prints a string to the LCD at a specific line.
 * @param msg_ptr Pointer to the string to be printed.
 * @param line The starting address (e.g., 0x80 for line 1, 0xC0 for line 2).
 */
void lcd_print_msg(const char *msg_ptr, unsigned char line) {
    // Set cursor position
    temp1 = line;
    flag1 = 0; // Command mode
    lcd_write();

    // Print characters
    flag1 = 1; // Data mode
    while (*msg_ptr != '\0') {
        temp1 = *msg_ptr;
        lcd_write();
        msg_ptr++;
    }
}

/**
 * @brief Creates a simple software-based delay.
 */
void delay(unsigned int r1) {
    volatile unsigned int r;
    for (r = 0; r < r1; r++);
}

