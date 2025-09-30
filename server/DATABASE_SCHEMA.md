# Shooting Range Dashboard - Database Schema

## Overview
This document describes the MySQL database schema for the Shooting Range Dashboard system. The database stores all shooting session data, performance analytics, and final reports associated with shooter names.

## Database: `shooting_range_db`

### Tables Overview

1. **shooters** - Shooter information and profiles
2. **shooting_sessions** - Individual shooting sessions
3. **target_templates** - Available target templates
4. **shooting_parameters** - Session parameters (firing mode, distances, etc.)
5. **bullseye_positions** - Bullseye coordinates for each session
6. **shot_coordinates** - Individual shot coordinates and scores
7. **performance_analytics** - Calculated performance metrics
8. **final_reports** - Complete session reports

---

## Table Definitions

### 1. shooters
Stores shooter profiles and basic information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique shooter ID |
| shooter_name | VARCHAR(255) NOT NULL | Shooter's name |
| skill_level | ENUM('beginner', 'intermediate', 'advanced', 'expert') | Skill level |
| email | VARCHAR(255) NULL | Email address |
| phone | VARCHAR(50) NULL | Phone number |
| notes | TEXT NULL | Additional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_shooter_name` on shooter_name
- `idx_skill_level` on skill_level

---

### 2. shooting_sessions
Represents individual shooting sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique session ID |
| shooter_id | INT NOT NULL | Foreign key to shooters table |
| lane_id | VARCHAR(50) NOT NULL | Lane identifier |
| session_name | VARCHAR(255) NULL | Session name/description |
| session_status | ENUM('active', 'completed', 'cancelled') | Session status |
| started_at | TIMESTAMP | Session start time |
| completed_at | TIMESTAMP NULL | Session completion time |
| notes | TEXT NULL | Session notes |

**Foreign Keys:**
- shooter_id → shooters(id) ON DELETE CASCADE

**Indexes:**
- `idx_shooter_id` on shooter_id
- `idx_lane_id` on lane_id
- `idx_session_status` on session_status
- `idx_started_at` on started_at

---

### 3. target_templates
Available target templates for shooting sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) PRIMARY KEY | Template identifier |
| template_name | VARCHAR(255) NOT NULL | Template display name |
| diameter | DECIMAL(10,2) NOT NULL | Target diameter in mm |
| distance | VARCHAR(50) NOT NULL | Shooting distance |
| caliber | VARCHAR(100) NULL | Recommended caliber |
| description | TEXT NULL | Template description |
| is_active | BOOLEAN DEFAULT TRUE | Whether template is active |
| created_at | TIMESTAMP | Record creation time |

**Indexes:**
- `idx_template_name` on template_name
- `idx_is_active` on is_active

---

### 4. shooting_parameters
Session-specific shooting parameters.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique parameter ID |
| session_id | INT NOT NULL | Foreign key to shooting_sessions |
| firing_mode | ENUM('snap', 'timed', 'rapid', 'precision') | Firing mode |
| time_limit | INT NULL | Time limit in seconds (for timed mode) |
| target_distance | INT NOT NULL DEFAULT 25 | Target distance in meters |
| zeroing_distance | INT NOT NULL DEFAULT 25 | Zeroing distance in meters |
| template_id | VARCHAR(100) NULL | Foreign key to target_templates |
| template_name | VARCHAR(255) NULL | Template name snapshot |
| template_diameter | DECIMAL(10,2) NULL | Template diameter snapshot |
| wind_direction | INT DEFAULT 0 | Wind direction in degrees |
| wind_speed | DECIMAL(5,2) DEFAULT 0.0 | Wind speed in m/s |
| notes | TEXT NULL | Parameter notes |
| created_at | TIMESTAMP | Record creation time |

**Foreign Keys:**
- session_id → shooting_sessions(id) ON DELETE CASCADE
- template_id → target_templates(id) ON DELETE SET NULL

**Indexes:**
- `idx_session_id` on session_id
- `idx_firing_mode` on firing_mode
- `idx_template_id` on template_id

---

### 5. bullseye_positions
Bullseye coordinates for each session.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique bullseye ID |
| session_id | INT NOT NULL | Foreign key to shooting_sessions |
| x_coordinate | DECIMAL(10,3) NOT NULL | X coordinate in pixels |
| y_coordinate | DECIMAL(10,3) NOT NULL | Y coordinate in pixels |
| set_at | TIMESTAMP | When bullseye was set |

**Foreign Keys:**
- session_id → shooting_sessions(id) ON DELETE CASCADE

**Indexes:**
- `idx_session_id` on session_id

---

### 6. shot_coordinates
Individual shot coordinates and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique shot ID |
| session_id | INT NOT NULL | Foreign key to shooting_sessions |
| shot_number | INT NOT NULL | Shot sequence number |
| x_coordinate | DECIMAL(10,3) NOT NULL | X coordinate in pixels |
| y_coordinate | DECIMAL(10,3) NOT NULL | Y coordinate in pixels |
| timestamp_fired | BIGINT NOT NULL | Unix timestamp in milliseconds |
| distance_from_center | DECIMAL(10,3) NULL | Distance from center in mm |
| score_points | INT DEFAULT 0 | Points scored for this shot |
| is_bullseye | BOOLEAN DEFAULT FALSE | Whether this is a bullseye shot |
| time_phase | ENUM('COUNTDOWN', 'WINDOW', 'OVERTIME') | Timing phase |
| notes | TEXT NULL | Shot notes |
| created_at | TIMESTAMP | Record creation time |

**Foreign Keys:**
- session_id → shooting_sessions(id) ON DELETE CASCADE

**Indexes:**
- `idx_session_id` on session_id
- `idx_shot_number` on shot_number
- `idx_timestamp_fired` on timestamp_fired
- `idx_is_bullseye` on is_bullseye

---

### 7. performance_analytics
Calculated performance metrics for each session.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique analytics ID |
| session_id | INT NOT NULL | Foreign key to shooting_sessions |
| mpi_distance | DECIMAL(10,3) NOT NULL | Mean Point of Impact distance in mm |
| mpi_x_coordinate | DECIMAL(10,3) NOT NULL | MPI X coordinate in pixels |
| mpi_y_coordinate | DECIMAL(10,3) NOT NULL | MPI Y coordinate in pixels |
| mpi_coords_x | DECIMAL(10,3) NOT NULL | MPI X in target coordinate system |
| mpi_coords_y | DECIMAL(10,3) NOT NULL | MPI Y in target coordinate system |
| accuracy_percentage | DECIMAL(5,2) NOT NULL | Accuracy percentage |
| avg_distance | DECIMAL(10,3) NOT NULL | Average distance from reference in mm |
| max_distance | DECIMAL(10,3) NOT NULL | Maximum distance from reference in mm |
| group_size | DECIMAL(10,3) NOT NULL | Group size in mm |
| reference_point_type | VARCHAR(100) NOT NULL | Type of reference point |
| reference_x_coordinate | DECIMAL(10,3) NOT NULL | Reference point X coordinate |
| reference_y_coordinate | DECIMAL(10,3) NOT NULL | Reference point Y coordinate |
| shots_analyzed | INT NOT NULL | Number of shots analyzed |
| bullets_count | INT NOT NULL | Total number of bullets |
| show_results | BOOLEAN DEFAULT FALSE | Whether to show results |
| shooting_phase | ENUM('SELECT_BULLSEYE', 'SHOOTING', 'DONE') | Current phase |
| calculated_at | TIMESTAMP | When analytics were calculated |

**Foreign Keys:**
- session_id → shooting_sessions(id) ON DELETE CASCADE

**Indexes:**
- `idx_session_id` on session_id
- `idx_accuracy` on accuracy_percentage
- `idx_mpi_distance` on mpi_distance

---

### 8. final_reports
Complete session reports with all metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Unique report ID |
| session_id | INT NOT NULL | Foreign key to shooting_sessions |
| shooter_id | INT NOT NULL | Foreign key to shooters |
| shooter_name | VARCHAR(255) NOT NULL | Shooter name snapshot |
| total_score | INT NOT NULL DEFAULT 0 | Total score achieved |
| accuracy_percentage | DECIMAL(5,2) NOT NULL | Accuracy percentage |
| mpi_distance | DECIMAL(10,3) NOT NULL | MPI distance in mm |
| group_size | DECIMAL(10,3) NOT NULL | Group size in mm |
| max_distance | DECIMAL(10,3) NOT NULL | Max distance in mm |
| avg_distance | DECIMAL(10,3) NOT NULL | Average distance in mm |
| true_mpi_x | DECIMAL(10,3) NOT NULL | True MPI X coordinate |
| true_mpi_y | DECIMAL(10,3) NOT NULL | True MPI Y coordinate |
| reference_point | VARCHAR(100) NOT NULL | Reference point description |
| shots_analyzed | INT NOT NULL | Number of shots analyzed |
| shots_fired | INT NOT NULL | Total shots fired |
| performance_rating | VARCHAR(100) NULL | Performance rating text |
| performance_emoji | VARCHAR(10) NULL | Performance emoji |
| template_name | VARCHAR(255) NULL | Template name used |
| template_diameter | DECIMAL(10,2) NULL | Template diameter |
| firing_mode | VARCHAR(50) NULL | Firing mode used |
| target_distance | INT NULL | Target distance |
| zeroing_distance | INT NULL | Zeroing distance |
| lane_id | VARCHAR(50) NULL | Lane identifier |
| generated_at | TIMESTAMP | Report generation time |

**Foreign Keys:**
- session_id → shooting_sessions(id) ON DELETE CASCADE
- shooter_id → shooters(id) ON DELETE CASCADE

**Indexes:**
- `idx_session_id` on session_id
- `idx_shooter_id` on shooter_id
- `idx_shooter_name` on shooter_name
- `idx_total_score` on total_score
- `idx_accuracy` on accuracy_percentage
- `idx_generated_at` on generated_at

---

## Data Flow

1. **Session Creation**: Admin assigns shooter name → creates/finds shooter → creates session
2. **Parameter Setting**: Admin sets firing mode and parameters → saves to shooting_parameters
3. **Bullseye Setting**: Admin sets bullseye position → saves to bullseye_positions
4. **Shooting**: Shots fired → coordinates saved to shot_coordinates
5. **Analytics**: Performance calculated → saves to performance_analytics
6. **Final Report**: Complete report generated → saves to final_reports

## Queries for Shooter History

```sql
-- Get all sessions for a shooter
SELECT ss.*, sp.firing_mode, pa.accuracy_percentage, fr.total_score
FROM shooting_sessions ss
JOIN shooters s ON ss.shooter_id = s.id
LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
LEFT JOIN final_reports fr ON ss.id = fr.session_id
WHERE s.shooter_name = 'Shooter Name'
ORDER BY ss.started_at DESC;

-- Get complete session details
SELECT * FROM shooting_sessions WHERE id = ?;
SELECT * FROM shooting_parameters WHERE session_id = ?;
SELECT * FROM bullseye_positions WHERE session_id = ?;
SELECT * FROM shot_coordinates WHERE session_id = ? ORDER BY shot_number;
SELECT * FROM performance_analytics WHERE session_id = ?;
SELECT * FROM final_reports WHERE session_id = ?;
```
