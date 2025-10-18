/*
 * ESP32 IR Grid Test Sketch
 * This sketch simulates an IR Grid system for testing the shooting application
 * 
 * Upload this to your ESP32 to test communication with the shooting app
 */

// Configuration
const int BAUD_RATE = 9600;
const int LED_PIN = 2;  // Built-in LED on most ESP32 boards

// Simulation variables
unsigned long lastShotTime = 0;
const unsigned long SHOT_INTERVAL = 5000; // Send test shot every 5 seconds
bool autoMode = true;

void setup() {
  // Initialize serial communication
  Serial.begin(BAUD_RATE);
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Wait for serial connection
  delay(2000);
  
  // Send startup message
  Serial.println("ESP32 IR Grid Simulator Ready");
  Serial.println("Commands:");
  Serial.println("  SHOT - Send random shot coordinates");
  Serial.println("  STATUS - Show system status");
  Serial.println("  AUTO_ON - Enable automatic shot simulation");
  Serial.println("  AUTO_OFF - Disable automatic shot simulation");
  Serial.println("  RESET - Reset system");
  Serial.println("Ready for commands...");
  
  // Blink LED to show ready
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

void loop() {
  // Check for incoming serial commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();
    
    handleCommand(command);
  }
  
  // Auto-generate test shots if enabled
  if (autoMode && (millis() - lastShotTime > SHOT_INTERVAL)) {
    sendRandomShot();
    lastShotTime = millis();
  }
  
  delay(100);
}

void handleCommand(String command) {
  // Blink LED when receiving command
  digitalWrite(LED_PIN, HIGH);
  delay(50);
  digitalWrite(LED_PIN, LOW);
  
  if (command == "SHOT") {
    sendRandomShot();
    Serial.println("Manual shot sent");
    
  } else if (command == "STATUS") {
    Serial.println("=== ESP32 IR Grid Status ===");
    Serial.print("Auto Mode: ");
    Serial.println(autoMode ? "ON" : "OFF");
    Serial.print("Uptime: ");
    Serial.print(millis() / 1000);
    Serial.println(" seconds");
    Serial.print("Free Heap: ");
    Serial.print(ESP.getFreeHeap());
    Serial.println(" bytes");
    Serial.println("System: OK");
    
  } else if (command == "AUTO_ON") {
    autoMode = true;
    Serial.println("Auto shot mode enabled");
    
  } else if (command == "AUTO_OFF") {
    autoMode = false;
    Serial.println("Auto shot mode disabled");
    
  } else if (command == "RESET") {
    Serial.println("Resetting ESP32...");
    delay(1000);
    ESP.restart();
    
  } else if (command == "TEST") {
    Serial.println("ESP32 test response - communication OK");
    
  } else if (command.indexOf(',') > 0) {
    // Handle coordinate input (e.g., "150,200")
    int commaIndex = command.indexOf(',');
    if (commaIndex > 0) {
      int x = command.substring(0, commaIndex).toInt();
      int y = command.substring(commaIndex + 1).toInt();
      
      if (x >= 0 && x <= 400 && y >= 0 && y <= 400) {
        Serial.print(x);
        Serial.print(",");
        Serial.println(y);
        Serial.println("Custom coordinates sent");
      } else {
        Serial.println("Error: Coordinates must be 0-400");
      }
    }
    
  } else if (command.length() > 0) {
    Serial.print("Unknown command: ");
    Serial.println(command);
    Serial.println("Type STATUS for available commands");
  }
}

void sendRandomShot() {
  // Generate random coordinates (0-400 range for target display)
  int x = random(50, 350);  // Keep shots within reasonable target area
  int y = random(50, 350);
  
  // Send coordinates in comma-separated format
  Serial.print(x);
  Serial.print(",");
  Serial.println(y);
  
  // Blink LED to indicate shot sent
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);
}

// Function to simulate IR Grid detection patterns
void sendTestPattern() {
  // Send a pattern of shots for testing
  int shots[][2] = {
    {200, 200}, // Center shot
    {150, 150}, // Upper left
    {250, 150}, // Upper right
    {150, 250}, // Lower left
    {250, 250}, // Lower right
    {200, 100}, // Top center
    {200, 300}, // Bottom center
    {100, 200}, // Left center
    {300, 200}  // Right center
  };
  
  Serial.println("Sending test pattern...");
  
  for (int i = 0; i < 9; i++) {
    Serial.print(shots[i][0]);
    Serial.print(",");
    Serial.println(shots[i][1]);
    
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(500);
  }
  
  Serial.println("Test pattern complete");
}
