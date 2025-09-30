// =====================================================
// DATABASE CONFIGURATION
// MySQL database setup for shooting range dashboard
// =====================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shooting_range_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database wrapper class
class Database {
    constructor() {
        this.pool = pool;
    }

    // Test database connection
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ Database connection successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    // Execute query
    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    // Find one record
    async findOne(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows[0] || null;
        } catch (error) {
            console.error('Database findOne error:', error.message);
            throw error;
        }
    }

    // Insert record
    async insert(table, data) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map(() => '?').join(', ');

            const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
            const [result] = await this.pool.execute(sql, values);
            return result.insertId;
        } catch (error) {
            console.error(`Database insert error for table ${table}:`, error.message);
            throw error;
        }
    }

    // Update record
    async update(table, data, whereClause, whereParams = []) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const setClause = fields.map(field => `${field} = ?`).join(', ');

            const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
            const [result] = await this.pool.execute(sql, [...values, ...whereParams]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Database update error for table ${table}:`, error.message);
            throw error;
        }
    }

    // Delete record
    async delete(table, whereClause, whereParams = []) {
        try {
            const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
            const [result] = await this.pool.execute(sql, whereParams);
            return result.affectedRows;
        } catch (error) {
            console.error(`Database delete error for table ${table}:`, error.message);
            throw error;
        }
    }

    // Close connection pool
    async close() {
        try {
            await this.pool.end();
            console.log('Database connection pool closed');
        } catch (error) {
            console.error('Error closing database pool:', error.message);
        }
    }
}

// Initialize database schema
async function initializeDatabase() {
    // Separate connection without specifying database to create DB if missing
    let rootConn;
    const db = new Database();

    try {
        console.log('🔧 Initializing database schema...');

        // Connect without database first
        rootConn = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            multipleStatements: true
        });

        // Create database if it doesn't exist
        const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
        await rootConn.query(createDbSql);
        console.log(`✅ Database '${dbConfig.database}' ready`);

        // Now use pool (which is configured with the database) to create tables
        // Create tables
        await createTables(db);
        await insertDefaultData(db);

        console.log('✅ Database schema initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    } finally {
        if (rootConn) {
            try { await rootConn.end(); } catch (e) {}
        }
    }
}

// Create all tables
async function createTables(db) {
    // 1. Shooters table
    await db.query(`
        CREATE TABLE IF NOT EXISTS shooters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shooter_name VARCHAR(255) NOT NULL,
            skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
            email VARCHAR(255) NULL,
            phone VARCHAR(50) NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_shooter_name (shooter_name),
            INDEX idx_skill_level (skill_level)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Shooting sessions table
    await db.query(`
        CREATE TABLE IF NOT EXISTS shooting_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shooter_id INT NOT NULL,
            lane_id VARCHAR(50) NOT NULL,
            session_name VARCHAR(255) NULL,
            session_status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            notes TEXT NULL,
            FOREIGN KEY (shooter_id) REFERENCES shooters(id) ON DELETE CASCADE,
            INDEX idx_shooter_id (shooter_id),
            INDEX idx_lane_id (lane_id),
            INDEX idx_session_status (session_status),
            INDEX idx_started_at (started_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Target templates table
    await db.query(`
        CREATE TABLE IF NOT EXISTS target_templates (
            id VARCHAR(100) PRIMARY KEY,
            template_name VARCHAR(255) NOT NULL,
            diameter DECIMAL(10,2) NOT NULL,
            distance VARCHAR(50) NOT NULL,
            caliber VARCHAR(100) NULL,
            description TEXT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_template_name (template_name),
            INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Shooting parameters table
    await db.query(`
        CREATE TABLE IF NOT EXISTS shooting_parameters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            firing_mode ENUM('untimed', 'timed', 'snap', 'moving') NOT NULL DEFAULT 'untimed',
            time_limit INT NULL COMMENT 'Time limit in seconds for timed mode',
            rounds INT NULL COMMENT 'Number of rounds',
            target_distance INT NOT NULL DEFAULT 25,
            zeroing_distance INT NOT NULL DEFAULT 25,
            template_id VARCHAR(100) NULL,
            template_name VARCHAR(255) NULL,
            template_diameter DECIMAL(10,2) NULL,
            wind_direction INT DEFAULT 0 COMMENT 'Wind direction in degrees',
            wind_speed DECIMAL(5,2) DEFAULT 0.0 COMMENT 'Wind speed in m/s',
            session_type ENUM('grouping','zeroing','practice','test') DEFAULT 'practice',
            weapon_type ENUM('7.62mm-rifle-slr','7.62mm-lmg','9mm-pistol','9mm-carbine','5.56mm-slr','5.56mm-lmg') NULL,
            target_type ENUM('fig11-combat','combat-120cm','grouping-30cm') NULL,
            shooting_position ENUM('ls','lu','lb','bc','sfts','sftu','ku','su','sftb') NULL,
            shot_type ENUM('single','burst') DEFAULT 'single',
            number_of_rounds INT NULL COMMENT 'Number of rounds to be fired',
            esa INT NULL COMMENT 'ESA (Effective Scoring Area) parameter',
            moving_direction ENUM('LTR','RTL') NULL,
            moving_speed INT NULL,
            snap_display_time INT NULL,
            snap_disappear_time INT NULL,
            snap_cycles INT NULL,
            snap_start_behavior ENUM('appear','disappear') NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES shooting_sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (template_id) REFERENCES target_templates(id) ON DELETE SET NULL,
            INDEX idx_session_id (session_id),
            INDEX idx_firing_mode (firing_mode),
            INDEX idx_template_id (template_id),
            INDEX idx_session_type (session_type),
            INDEX idx_weapon_type (weapon_type),
            INDEX idx_target_type (target_type),
            INDEX idx_shooting_position (shooting_position)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Ensure 'jumper' and 'moving' modes exist in firing_mode enum (migration-safe)
    try {
        await db.query("ALTER TABLE shooting_parameters MODIFY firing_mode ENUM('snap','timed','jumper','moving','rapid','precision') NOT NULL");
        console.log("✅ shooting_parameters.firing_mode enum updated to include 'jumper' and 'moving'");
    } catch (e) {
        // Ignore if already set or DB vendor doesn’t support this exact syntax
        console.log("ℹ️ firing_mode enum update check: ", e.message);
    }

    // Ensure additional parameter columns exist (migration-safe)
    const addColumnIfMissing = async (sql) => {
        try {
            await db.query(sql);
            console.log('✅ Column ensured with:', sql);
        } catch (e) {
            if (e && /Duplicate column name|check that column.*exists/i.test(e.message)) {
                // Column already exists; ignore
                console.log('ℹ️ Column already exists, skipping:', sql);
            } else {
                console.log('ℹ️ Column alter error (may be harmless on some MySQL versions):', e.message);
            }
        }
    };

    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN rounds INT NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN session_type ENUM('practice','test') DEFAULT 'practice'");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN weapon_type VARCHAR(50) NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN moving_direction ENUM('LTR','RTL') NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN moving_speed INT NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN snap_display_time INT NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN snap_disappear_time INT NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN snap_cycles INT NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN snap_start_behavior ENUM('appear','disappear') NULL");

    // Add new military shooting parameters
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN target_type ENUM('fig11-combat','combat-120cm','grouping-30cm') NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN shooting_position ENUM('ls','lu','lb','bc','sfts','sftu','ku','su','sftb') NULL");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN shot_type ENUM('single','burst') DEFAULT 'single'");
    await addColumnIfMissing("ALTER TABLE shooting_parameters ADD COLUMN number_of_rounds INT NULL COMMENT 'Number of rounds to be fired'");

    // Update existing ENUMs to new values (migration-safe)
    try {
        await db.query("ALTER TABLE shooting_parameters MODIFY firing_mode ENUM('untimed','timed','snap','moving') NOT NULL DEFAULT 'untimed'");
        console.log("✅ shooting_parameters.firing_mode enum updated to new values");

        await db.query("ALTER TABLE shooting_parameters MODIFY session_type ENUM('grouping','zeroing','practice','test') DEFAULT 'practice'");
        console.log("✅ shooting_parameters.session_type enum updated to include grouping and zeroing");

        await db.query("ALTER TABLE shooting_parameters MODIFY weapon_type ENUM('7.62mm-rifle-slr','7.62mm-lmg','9mm-pistol','9mm-carbine','5.56mm-slr','5.56mm-lmg') NULL");
        console.log("✅ shooting_parameters.weapon_type converted to ENUM with military weapons");

    } catch (e) {
        console.log("ℹ️ ENUM update check: ", e.message);
    }


    // 5. Bullseye positions table
    await db.query(`
        CREATE TABLE IF NOT EXISTS bullseye_positions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            x_coordinate DECIMAL(10,3) NOT NULL,
            y_coordinate DECIMAL(10,3) NOT NULL,
            set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES shooting_sessions(id) ON DELETE CASCADE,
            INDEX idx_session_id (session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Shot coordinates table
    await db.query(`
        CREATE TABLE IF NOT EXISTS shot_coordinates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            shot_number INT NOT NULL,
            x_coordinate DECIMAL(10,3) NOT NULL,
            y_coordinate DECIMAL(10,3) NOT NULL,
            timestamp_fired BIGINT NOT NULL COMMENT 'Unix timestamp in milliseconds',
            distance_from_center DECIMAL(10,3) NULL COMMENT 'Distance from target center in mm',
            score_points INT DEFAULT 0,
            is_bullseye BOOLEAN DEFAULT FALSE,
            time_phase ENUM('COUNTDOWN', 'WINDOW', 'OVERTIME') NULL COMMENT 'Phase when shot was fired',
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES shooting_sessions(id) ON DELETE CASCADE,
            INDEX idx_session_id (session_id),
            INDEX idx_shot_number (shot_number),
            INDEX idx_timestamp_fired (timestamp_fired),
            INDEX idx_is_bullseye (is_bullseye)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. Performance analytics table
    await db.query(`
        CREATE TABLE IF NOT EXISTS performance_analytics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            mpi_distance DECIMAL(10,3) NOT NULL COMMENT 'Mean Point of Impact distance in mm',
            mpi_x_coordinate DECIMAL(10,3) NOT NULL COMMENT 'MPI X coordinate in pixels',
            mpi_y_coordinate DECIMAL(10,3) NOT NULL COMMENT 'MPI Y coordinate in pixels',
            mpi_coords_x DECIMAL(10,3) NOT NULL COMMENT 'MPI X in target coordinate system',
            mpi_coords_y DECIMAL(10,3) NOT NULL COMMENT 'MPI Y in target coordinate system',
            accuracy_percentage DECIMAL(5,2) NOT NULL,
            avg_distance DECIMAL(10,3) NOT NULL COMMENT 'Average distance from reference point in mm',
            max_distance DECIMAL(10,3) NOT NULL COMMENT 'Maximum distance from reference point in mm',
            group_size DECIMAL(10,3) NOT NULL COMMENT 'Group size in mm',
            reference_point_type VARCHAR(100) NOT NULL COMMENT 'Type of reference point used',
            reference_x_coordinate DECIMAL(10,3) NOT NULL COMMENT 'Reference point X coordinate',
            reference_y_coordinate DECIMAL(10,3) NOT NULL COMMENT 'Reference point Y coordinate',
            shots_analyzed INT NOT NULL,
            bullets_count INT NOT NULL,
            show_results BOOLEAN DEFAULT FALSE,
            shooting_phase ENUM('SELECT_BULLSEYE', 'SHOOTING', 'DONE') DEFAULT 'DONE',
            calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES shooting_sessions(id) ON DELETE CASCADE,
            INDEX idx_session_id (session_id),
            INDEX idx_accuracy (accuracy_percentage),
            INDEX idx_mpi_distance (mpi_distance)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. Final reports table
    await db.query(`
        CREATE TABLE IF NOT EXISTS final_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            shooter_id INT NOT NULL,
            shooter_name VARCHAR(255) NOT NULL,
            total_score INT NOT NULL DEFAULT 0,
            accuracy_percentage DECIMAL(5,2) NOT NULL,
            mpi_distance DECIMAL(10,3) NOT NULL COMMENT 'MPI distance in mm',
            group_size DECIMAL(10,3) NOT NULL COMMENT 'Group size in mm',
            max_distance DECIMAL(10,3) NOT NULL COMMENT 'Max distance in mm',
            avg_distance DECIMAL(10,3) NOT NULL COMMENT 'Average distance in mm',
            true_mpi_x DECIMAL(10,3) NOT NULL COMMENT 'True MPI X coordinate',
            true_mpi_y DECIMAL(10,3) NOT NULL COMMENT 'True MPI Y coordinate',
            reference_point VARCHAR(100) NOT NULL COMMENT 'Reference point description',
            shots_analyzed INT NOT NULL,
            shots_fired INT NOT NULL,
            performance_rating VARCHAR(100) NULL COMMENT 'Performance rating text',
            performance_emoji VARCHAR(10) NULL COMMENT 'Performance emoji',
            template_name VARCHAR(255) NULL,
            template_diameter DECIMAL(10,2) NULL,
            firing_mode VARCHAR(50) NULL,
            target_distance INT NULL,
            zeroing_distance INT NULL,
            lane_id VARCHAR(50) NULL,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES shooting_sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (shooter_id) REFERENCES shooters(id) ON DELETE CASCADE,
            INDEX idx_session_id (session_id),
            INDEX idx_shooter_id (shooter_id),
            INDEX idx_shooter_name (shooter_name),
            INDEX idx_total_score (total_score),
            INDEX idx_accuracy (accuracy_percentage),
            INDEX idx_generated_at (generated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ All tables created successfully');
}

// Insert default data
async function insertDefaultData(db) {
    // Insert default target templates
    const templates = [
        {
            id: 'air-pistol-10m',
            template_name: '10m Air Pistol (Individual)',
            diameter: 11.5,
            distance: '10m',
            caliber: '4.5mm air pistol',
            description: 'Standard 10-ring target for air pistol competition'
        },
        {
            id: 'pistol-25m-precision',
            template_name: '25m Pistol Precision',
            diameter: 50.0,
            distance: '25m',
            caliber: '.22 LR rimfire',
            description: 'Precision pistol target for 25m competition'
        },
        {
            id: 'pistol-25m-rapid',
            template_name: '25m Rapid Fire Pistol',
            diameter: 50.0,
            distance: '25m',
            caliber: '.22 Short',
            description: 'Rapid fire pistol target'
        },
        {
            id: 'rifle-50m',
            template_name: '50m Rifle Prone',
            diameter: 10.4,
            distance: '50m',
            caliber: '.22 LR',
            description: 'Small bore rifle target'
        }
    ];

    for (const template of templates) {
        try {
            await db.query(
                'INSERT IGNORE INTO target_templates (id, template_name, diameter, distance, caliber, description) VALUES (?, ?, ?, ?, ?, ?)',
                [template.id, template.template_name, template.diameter, template.distance, template.caliber, template.description]
            );
        } catch (error) {
            // Ignore duplicate key errors
            if (!error.message.includes('Duplicate entry')) {
                throw error;
            }
        }
    }

    console.log('✅ Default data inserted successfully');
}

// Test database connection
async function testConnection() {
    const db = new Database();
    return await db.testConnection();
}

// Create database instance
const db = new Database();

module.exports = {
    db,
    Database,
    testConnection,
    initializeDatabase,
    dbConfig
};
