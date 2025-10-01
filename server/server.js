// =====================================================
// SHOOTING RANGE DASHBOARD - EXPRESS SERVER
// Main server file with API endpoints
// =====================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { db, testConnection, initializeDatabase } = require('./database_config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
}));

// CORS configuration (must be before any routes or rate limiting)
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting (after CORS so preflights get headers)
// Relaxed in development to avoid blocking local testing
const isDev = process.env.NODE_ENV !== 'production';
if (!isDev) {
    const limiter = rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        message: 'Too many requests from this IP, please try again later.'
    });
    app.use('/api/', limiter);
}

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// =====================================================
// API ROUTES
// =====================================================

// Database initialization flag
let dbInitialized = false;

// Initialize database on first request (for serverless environments)
async function ensureDatabase() {
    if (!dbInitialized) {
        try {
            console.log('🔧 Initializing database schema...');
            await initializeDatabase();
            dbInitialized = true;
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();

        // Try to initialize database if not already done
        if (dbConnected && !dbInitialized) {
            try {
                await ensureDatabase();
            } catch (initError) {
                console.error('Database init error:', initError.message);
            }
        }

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbConnected ? 'connected' : 'disconnected',
            initialized: dbInitialized,
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Initialize database endpoint
app.post('/api/init-database', async (req, res) => {
    try {
        await initializeDatabase();
        res.json({
            success: true,
            message: 'Database initialized successfully'
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization failed',
            error: error.message
        });
    }
});

// =====================================================
// SHOOTER MANAGEMENT ENDPOINTS
// =====================================================

// Get all shooters
app.get('/api/shooters', async (req, res) => {
    try {
        const shooters = await db.query(`
            SELECT s.*,
                   COUNT(ss.id) AS total_sessions,
                   MAX(ss.started_at) AS last_session_date,
                   (
                     SELECT sp.session_type
                     FROM shooting_parameters sp
                     JOIN shooting_sessions ss2 ON sp.session_id = ss2.id
                     WHERE ss2.shooter_id = s.id
                     ORDER BY ss2.started_at DESC
                     LIMIT 1
                   ) AS last_session_type
            FROM shooters s
            LEFT JOIN shooting_sessions ss ON s.id = ss.shooter_id
            GROUP BY s.id
            ORDER BY s.shooter_name ASC
        `);
        res.json(shooters);
    } catch (error) {
        console.error('Error fetching shooters:', error);
        res.status(500).json({ error: 'Failed to fetch shooters' });
    }
});

// Get shooter by ID with complete history
app.get('/api/shooters/:id', async (req, res) => {
    try {
        const shooterId = req.params.id;

        // Get shooter details
        const shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [shooterId]);
        if (!shooter) {
            return res.status(404).json({ error: 'Shooter not found' });
        }

        // Get all sessions for this shooter with complete parameter details
        console.log('🔍 Fetching sessions with complete parameters for shooter:', shooterId);
        const sessions = await db.query(`
            SELECT ss.*,
                   sp.firing_mode, sp.target_distance, sp.template_name, sp.session_type, sp.weapon_type,
                   sp.target_type, sp.shooting_position, sp.shot_type, sp.number_of_rounds, sp.esa,
                   sp.time_limit, sp.rounds, sp.zeroing_distance, sp.template_id, sp.template_diameter,
                   sp.wind_direction, sp.wind_speed, sp.moving_direction, sp.moving_speed,
                   sp.snap_display_time, sp.snap_disappear_time, sp.snap_cycles, sp.snap_start_behavior, sp.notes as param_notes,
                   pa_ranked.accuracy_percentage, pa_ranked.mpi_distance, pa_ranked.shots_analyzed, pa_ranked.group_size, pa_ranked.max_distance,
                   fr_ranked.total_score, fr_ranked.performance_rating
            FROM shooting_sessions ss
            LEFT JOIN (
                SELECT session_id, firing_mode, target_distance, template_name, session_type, weapon_type,
                       target_type, shooting_position, shot_type, number_of_rounds, esa,
                       time_limit, rounds, zeroing_distance, template_id, template_diameter,
                       wind_direction, wind_speed, moving_direction, moving_speed,
                       snap_display_time, snap_disappear_time, snap_cycles, snap_start_behavior, notes,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) as rn
                FROM shooting_parameters
            ) sp ON ss.id = sp.session_id AND sp.rn = 1
            LEFT JOIN (
                SELECT session_id, accuracy_percentage, mpi_distance, shots_analyzed, group_size, max_distance,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY id DESC) as rn
                FROM performance_analytics
            ) pa_ranked ON ss.id = pa_ranked.session_id AND pa_ranked.rn = 1
            LEFT JOIN (
                SELECT session_id, total_score, performance_rating,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY generated_at DESC) as rn
                FROM final_reports
            ) fr_ranked ON ss.id = fr_ranked.session_id AND fr_ranked.rn = 1
            WHERE ss.shooter_id = ?
            ORDER BY ss.started_at DESC
        `, [shooterId]);

        console.log('📊 Sessions returned:', sessions.length, 'sessions');
        if (sessions.length > 0) {
            console.log('🎯 First session group_size:', sessions[0].group_size, 'max_distance:', sessions[0].max_distance);
        }

        res.json({
            shooter,
            sessions,
            totalSessions: sessions.length
        });
    } catch (error) {
        console.error('Error fetching shooter details:', error);
        res.status(500).json({ error: 'Failed to fetch shooter details' });
    }
});

// Get shooter details by ID (alternative endpoint for profile page)
app.get('/api/shooters/id/:id', async (req, res) => {
    try {
        const shooterId = parseInt(req.params.id);
        console.log(`📊 Fetching profile for shooter ID: ${shooterId}`);

        // Get shooter info
        const shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [shooterId]);
        if (!shooter) {
            return res.status(404).json({ error: 'Shooter not found' });
        }

        // Get all sessions for this shooter with complete parameter details
        const sessions = await db.query(`
            SELECT ss.id, ss.session_name, ss.started_at, ss.completed_at, ss.lane_id, ss.shooter_id,
                   sp.firing_mode, sp.target_distance, sp.template_name, sp.session_type, sp.weapon_type,
                   sp.target_type, sp.shooting_position, sp.shot_type, sp.number_of_rounds, sp.esa,
                   sp.time_limit, sp.rounds, sp.zeroing_distance, sp.template_id, sp.template_diameter,
                   sp.wind_direction, sp.wind_speed, sp.moving_direction, sp.moving_speed,
                   sp.snap_display_time, sp.snap_disappear_time, sp.snap_cycles, sp.snap_start_behavior, sp.notes as param_notes,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed,
                   fr.total_score, fr.performance_rating, fr.performance_emoji
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN final_reports fr ON ss.id = fr.session_id
            WHERE ss.shooter_id = ?
            ORDER BY ss.started_at DESC
        `, [shooterId]);

        console.log(`📊 Found ${sessions.length} sessions for shooter ID: ${shooterId} (${shooter.shooter_name})`);
        if (sessions.length > 0) {
            console.log(`📊 Latest session for "${shooter.shooter_name}":`, {
                id: sessions[0].id,
                session_name: sessions[0].session_name,
                started_at: sessions[0].started_at,
                accuracy: sessions[0].accuracy_percentage
            });
        }

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching shooter profile:', error);
        res.status(500).json({ error: 'Failed to fetch shooter profile' });
    }
});

// Create new shooter
app.post('/api/shooters', async (req, res) => {
    try {
        const { shooter_name, skill_level, email, phone, notes } = req.body;

        if (!shooter_name || shooter_name.trim() === '') {
            return res.status(400).json({ error: 'Shooter name is required' });
        }

        const shooterId = await db.insert('shooters', {
            shooter_name: shooter_name.trim(),
            skill_level: skill_level || 'beginner',
            email: email || null,
            phone: phone || null,
            notes: notes || null
        });

        const newShooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [shooterId]);
        res.status(201).json(newShooter);
    } catch (error) {
        console.error('Error creating shooter:', error);
        res.status(500).json({ error: 'Failed to create shooter' });
    }
});

// Delete shooter by ID (cascades via FK constraints)
app.delete('/api/shooters/:id', async (req, res) => {
    try {
        const shooterId = req.params.id;
        const shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [shooterId]);
        if (!shooter) {
            return res.status(404).json({ error: 'Shooter not found' });
        }
        await db.delete('shooters', 'id = ?', [shooterId]);
        res.json({ success: true, deletedId: Number(shooterId) });
    } catch (error) {
        console.error('Error deleting shooter:', error);
        res.status(500).json({ error: 'Failed to delete shooter' });
    }
});

// =====================================================
// SESSION MANAGEMENT ENDPOINTS
// =====================================================

// Create new shooting session
app.post('/api/sessions', async (req, res) => {
    try {
        const { shooter_name, shooter_id, force_new_shooter, lane_id, session_name } = req.body;

        console.log(`🔍 Session creation request:`, { shooter_name, shooter_id, force_new_shooter, lane_id });

        if (!shooter_name || !lane_id) {
            return res.status(400).json({ error: 'Shooter name and lane ID are required' });
        }

        let shooter;

        // If force_new_shooter is true, always create a new shooter
        if (force_new_shooter) {
            // Check if there are existing shooters with this name
            const existingShooters = await db.query('SELECT * FROM shooters WHERE shooter_name = ?', [shooter_name]);

            const newShooterId = await db.insert('shooters', {
                shooter_name: shooter_name.trim(),
                skill_level: 'beginner',
                notes: existingShooters.length > 0 ? `Shooter #${existingShooters.length + 1} with name "${shooter_name}"` : null
            });
            shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [newShooterId]);

            console.log(`👤 Created NEW shooter: "${shooter_name}" (ID: ${newShooterId}) - ${existingShooters.length > 0 ? `Duplicate name #${existingShooters.length + 1}` : 'First with this name'}`);
        }
        // If a specific shooter ID is provided, use that shooter
        else if (shooter_id) {
            shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [shooter_id]);
            if (!shooter) {
                return res.status(400).json({ error: 'Specified shooter ID not found' });
            }
            console.log(`👤 Using specific shooter: "${shooter.shooter_name}" (ID: ${shooter.id})`);
        } else {
            // Find or create shooter using the existing logic
            // Use the most recent shooter with this name
            shooter = await db.findOne(`
                SELECT * FROM shooters
                WHERE shooter_name = ?
                ORDER BY created_at DESC
                LIMIT 1
            `, [shooter_name]);

            if (!shooter) {
                // Check if there are existing shooters with this name
                const existingShooters = await db.query('SELECT * FROM shooters WHERE shooter_name = ?', [shooter_name]);

                const newShooterId = await db.insert('shooters', {
                    shooter_name: shooter_name.trim(),
                    skill_level: 'beginner',
                    notes: existingShooters.length > 0 ? `Shooter #${existingShooters.length + 1} with name "${shooter_name}"` : null
                });
                shooter = await db.findOne('SELECT * FROM shooters WHERE id = ?', [newShooterId]);

                console.log(`👤 Created new shooter: "${shooter_name}" (ID: ${newShooterId}) - ${existingShooters.length > 0 ? `Duplicate name #${existingShooters.length + 1}` : 'First with this name'}`);
            } else {
                console.log(`👤 Using existing shooter: "${shooter_name}" (ID: ${shooter.id})`);
            }
        }

        // Check for an existing active session very recently created to avoid duplicates
        // Only prevent duplicates within a very short window (30 seconds) to allow legitimate consecutive sessions
        const guardSeconds = parseInt(process.env.SESSION_DUP_GUARD_SECONDS) || 30; // Reduced to 30 seconds
        const existingSession = await db.findOne(`
            SELECT ss.*, s.shooter_name
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            WHERE ss.shooter_id = ?
              AND ss.lane_id = ?
              AND ss.session_status = 'active'
              AND TIMESTAMPDIFF(SECOND, ss.started_at, NOW()) < ?
            ORDER BY ss.started_at DESC
            LIMIT 1
        `, [shooter.id, lane_id, guardSeconds]);

        if (existingSession) {
            console.log(`🔄 Returning existing session within ${guardSeconds}s guard window:`, existingSession.id);
            // Return the existing session instead of creating a duplicate
            return res.status(200).json(existingSession);
        }

        // Create session
        const sessionId = await db.insert('shooting_sessions', {
            shooter_id: shooter.id,
            lane_id: lane_id,
            session_name: session_name || `${shooter_name} - ${new Date().toLocaleDateString()}`
        });

        const newSession = await db.findOne(`
            SELECT ss.*, s.shooter_name
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            WHERE ss.id = ?
        `, [sessionId]);

        res.status(201).json(newSession);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Get session details
app.get('/api/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;

        const session = await db.findOne(`
            SELECT ss.*, s.shooter_name, s.skill_level
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            WHERE ss.id = ?
        `, [sessionId]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get session parameters (latest only if multiple exist)
        const parameters = await db.findOne(`
            SELECT * FROM shooting_parameters
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [sessionId]);

        // Get bullseye position
        const bullseye = await db.findOne('SELECT * FROM bullseye_positions WHERE session_id = ?', [sessionId]);

        // Get shot coordinates
        const shots = await db.query('SELECT * FROM shot_coordinates WHERE session_id = ? ORDER BY shot_number ASC', [sessionId]);

        // Get performance analytics (latest only if multiple exist)
        const analytics = await db.findOne(`
            SELECT * FROM performance_analytics
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT 1
        `, [sessionId]);

        // Get final report (latest only if multiple exist)
        const finalReport = await db.findOne(`
            SELECT * FROM final_reports
            WHERE session_id = ?
            ORDER BY generated_at DESC
            LIMIT 1
        `, [sessionId]);

        console.log(`📊 Session ${sessionId} details:`, {
            hasParameters: !!parameters,
            hasAnalytics: !!analytics,
            hasFinalReport: !!finalReport,
            shotsCount: shots.length
        });

        res.json({
            session,
            parameters,
            bullseye,
            shots,
            analytics,
            finalReport
        });
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// =====================================================
// SHOOTING PARAMETERS ENDPOINTS
// =====================================================

// Save shooting parameters
app.post('/api/sessions/:id/parameters', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const parameters = req.body;

        // Check if session exists
        const session = await db.findOne('SELECT * FROM shooting_sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Delete existing parameters for this session
        await db.delete('shooting_parameters', 'session_id = ?', [sessionId]);

        // Extract target distance from template ID if not explicitly provided
        let targetDistance = parameters.targetDistance;
        if (!targetDistance && parameters.templateId) {
            // Extract distance from template ID (e.g., "air-pistol-10m" -> 10)
            const distanceMatch = parameters.templateId.match(/(\d+)m/);
            if (distanceMatch) {
                targetDistance = parseInt(distanceMatch[1]);
                console.log(`🎯 Extracted target distance ${targetDistance}m from template: ${parameters.templateId}`);
            }
        }

        // Insert new parameters
        const paramId = await db.insert('shooting_parameters', {
            session_id: sessionId,
            firing_mode: parameters.firingMode || 'untimed',
            time_limit: parameters.timeLimit || null,
            rounds: parameters.rounds || null,
            target_distance: targetDistance || 25,
            zeroing_distance: parameters.zeroingDistance || targetDistance || 25,
            template_id: parameters.templateId || null,
            template_name: parameters.templateName || null,
            template_diameter: parameters.templateDiameter || null,
            wind_direction: parameters.windDirection || 0,
            wind_speed: parameters.windSpeed || 0.0,
            session_type: parameters.sessionType || 'practice',
            weapon_type: parameters.weaponType || null,
            target_type: parameters.targetType || null,
            shooting_position: parameters.shootingPosition || null,
            shot_type: parameters.shotType || 'single',
            number_of_rounds: parameters.numberOfRounds || null,
            esa: parameters.esa || null,
            moving_direction: parameters.movingDirection || null,
            moving_speed: parameters.movingSpeed || null,
            snap_display_time: parameters.snapDisplayTime || null,
            snap_disappear_time: parameters.snapDisappearTime || null,
            snap_cycles: parameters.snapCycles || null,
            snap_start_behavior: parameters.snapStartBehavior || null,
            notes: parameters.notes || null
        });

        const savedParameters = await db.findOne('SELECT * FROM shooting_parameters WHERE id = ?', [paramId]);
        res.json(savedParameters);
    } catch (error) {
        console.error('Error saving parameters:', error);
        res.status(500).json({ error: 'Failed to save parameters' });
    }
});

// =====================================================
// BULLSEYE AND SHOT COORDINATES ENDPOINTS
// =====================================================

// Save bullseye position
app.post('/api/sessions/:id/bullseye', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { x, y } = req.body;

        if (x === undefined || y === undefined) {
            return res.status(400).json({ error: 'X and Y coordinates are required' });
        }

        // Delete existing bullseye for this session
        await db.delete('bullseye_positions', 'session_id = ?', [sessionId]);

        // Insert new bullseye position
        const bullseyeId = await db.insert('bullseye_positions', {
            session_id: sessionId,
            x_coordinate: x,
            y_coordinate: y
        });

        const savedBullseye = await db.findOne('SELECT * FROM bullseye_positions WHERE id = ?', [bullseyeId]);
        res.json(savedBullseye);
    } catch (error) {
        console.error('Error saving bullseye:', error);
        res.status(500).json({ error: 'Failed to save bullseye position' });
    }
});

// Save shot coordinates
app.post('/api/sessions/:id/shots', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const shots = Array.isArray(req.body) ? req.body : [req.body];

        console.log('💾 Saving shots for session', sessionId);
        console.log('📊 Shot data received:', JSON.stringify(shots, null, 2));

        const savedShots = [];
        for (const shot of shots) {
            console.log('Processing shot:', shot);

            const shotData = {
                session_id: sessionId,
                shot_number: shot.shotNumber || 1,
                x_coordinate: shot.x,
                y_coordinate: shot.y,
                timestamp_fired: shot.timestamp || Date.now(),
                distance_from_center: shot.distanceFromCenter || null,
                score_points: shot.score || 0,
                is_bullseye: shot.isBullseye || false,
                time_phase: shot.timePhase || null,
                notes: shot.notes || null
            };

            console.log('Inserting shot data:', shotData);

            const shotId = await db.insert('shot_coordinates', shotData);
            console.log('Shot inserted with ID:', shotId);

            const savedShot = await db.findOne('SELECT * FROM shot_coordinates WHERE id = ?', [shotId]);
            savedShots.push(savedShot);
        }

        console.log('✅ All shots saved successfully:', savedShots.length);
        res.json(savedShots);
    } catch (error) {
        console.error('❌ Error saving shots:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ error: 'Failed to save shot coordinates', details: error.message });
    }
});

// =====================================================
// PERFORMANCE ANALYTICS ENDPOINTS
// =====================================================

// Save performance analytics
app.post('/api/sessions/:id/analytics', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const analytics = req.body;

        console.log(`📊 Saving analytics for session ${sessionId}`);

        // Check for existing analytics
        const existing = await db.query('SELECT id FROM performance_analytics WHERE session_id = ?', [sessionId]);
        console.log(`Found ${existing.length} existing analytics records`);

        // Delete existing analytics for this session to prevent duplicates
        if (existing.length > 0) {
            console.log(`Deleting ${existing.length} existing analytics records...`);
            await db.delete('performance_analytics', 'session_id = ?', [sessionId]);
        }

        // Insert new analytics
        const analyticsId = await db.insert('performance_analytics', {
            session_id: sessionId,
            mpi_distance: analytics.mpiDistance || 0,
            mpi_x_coordinate: analytics.mpiXCoordinate || 0,
            mpi_y_coordinate: analytics.mpiYCoordinate || 0,
            mpi_coords_x: analytics.mpiCoordsX || 0,
            mpi_coords_y: analytics.mpiCoordsY || 0,
            accuracy_percentage: analytics.accuracyPercentage || 0,
            avg_distance: analytics.avgDistance || 0,
            max_distance: analytics.maxDistance || 0,
            group_size: analytics.groupSize || 0,
            reference_point_type: analytics.referencePointType || 'center',
            reference_x_coordinate: analytics.referenceXCoordinate || 200,
            reference_y_coordinate: analytics.referenceYCoordinate || 200,
            shots_analyzed: analytics.shotsAnalyzed || 0,
            bullets_count: analytics.bulletsCount || 0,
            show_results: analytics.showResults || false,
            shooting_phase: analytics.shootingPhase || 'DONE'
        });

        console.log(`✅ Analytics saved with ID ${analyticsId}`);

        const savedAnalytics = await db.findOne('SELECT * FROM performance_analytics WHERE id = ?', [analyticsId]);
        res.json(savedAnalytics);
    } catch (error) {
        console.error('❌ Error saving analytics:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Failed to save performance analytics', details: error.message });
    }
});

// =====================================================
// FINAL REPORT ENDPOINTS
// =====================================================

// Save final report
app.post('/api/sessions/:id/final-report', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const report = req.body;

        // Get session and shooter info
        const session = await db.findOne(`
            SELECT ss.*, s.shooter_name
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            WHERE ss.id = ?
        `, [sessionId]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Delete existing report for this session
        await db.delete('final_reports', 'session_id = ?', [sessionId]);

        // Insert new final report
        const reportId = await db.insert('final_reports', {
            session_id: sessionId,
            shooter_id: session.shooter_id,
            shooter_name: session.shooter_name,
            total_score: report.totalScore || 0,
            accuracy_percentage: report.accuracyPercentage || 0,
            mpi_distance: report.mpiDistance || 0,
            group_size: report.groupSize || 0,
            max_distance: report.maxDistance || 0,
            avg_distance: report.avgDistance || 0,
            true_mpi_x: report.trueMpiX || 0,
            true_mpi_y: report.trueMpiY || 0,
            reference_point: report.referencePoint || 'center',
            shots_analyzed: report.shotsAnalyzed || 0,
            shots_fired: report.shotsFired || 0,
            performance_rating: report.performanceRating || null,
            performance_emoji: report.performanceEmoji || null,
            template_name: report.templateName || null,
            template_diameter: report.templateDiameter || null,
            firing_mode: report.firingMode || null,
            target_distance: report.targetDistance || null,
            zeroing_distance: report.zeroingDistance || null,
            lane_id: session.lane_id
        });

        const savedReport = await db.findOne('SELECT * FROM final_reports WHERE id = ?', [reportId]);

        // Mark session as completed when final report is saved
        await db.query('UPDATE shooting_sessions SET session_status = ?, completed_at = NOW() WHERE id = ?',
                      ['completed', sessionId]);

        console.log(`✅ Session ${sessionId} marked as completed with final report`);

        res.json(savedReport);
    } catch (error) {
        console.error('Error saving final report:', error);
        res.status(500).json({ error: 'Failed to save final report' });
    }
});

// Complete a session (mark as completed)
app.post('/api/sessions/:id/complete', async (req, res) => {
    try {
        const sessionId = req.params.id;

        // Check if session exists
        const session = await db.findOne('SELECT * FROM shooting_sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Update session status to completed
        await db.query('UPDATE shooting_sessions SET session_status = ?, completed_at = NOW() WHERE id = ?',
                      ['completed', sessionId]);

        const updatedSession = await db.findOne('SELECT * FROM shooting_sessions WHERE id = ?', [sessionId]);
        console.log(`✅ Session ${sessionId} manually marked as completed`);

        res.json(updatedSession);
    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({ error: 'Failed to complete session' });
    }
});

// Get shooter history with all data
app.get('/api/shooters/:name/history', async (req, res) => {
    try {
        const shooterName = decodeURIComponent(req.params.name);
        console.log(`📊 Fetching history for shooter: "${shooterName}"`);

        const sessions = await db.query(`
            SELECT ss.id, ss.session_name, ss.started_at, ss.completed_at, ss.lane_id, ss.shooter_id,
                   sp.firing_mode, sp.target_distance, sp.template_name, sp.session_type, sp.weapon_type,
                   sp.target_type, sp.shooting_position, sp.shot_type, sp.number_of_rounds, sp.esa,
                   sp.time_limit, sp.rounds, sp.zeroing_distance, sp.template_id, sp.template_diameter,
                   sp.wind_direction, sp.wind_speed, sp.moving_direction, sp.moving_speed,
                   sp.snap_display_time, sp.snap_disappear_time, sp.snap_cycles, sp.snap_start_behavior, sp.notes as param_notes,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed,
                   fr.total_score, fr.performance_rating, fr.performance_emoji
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN final_reports fr ON ss.id = fr.session_id
            WHERE s.shooter_name = ?
            ORDER BY ss.started_at DESC
        `, [shooterName]);

        console.log(`📊 Found ${sessions.length} sessions for shooter: "${shooterName}"`);
        if (sessions.length > 0) {
            console.log(`📊 Latest session for "${shooterName}":`, {
                id: sessions[0].id,
                session_name: sessions[0].session_name,
                started_at: sessions[0].started_at,
                accuracy: sessions[0].accuracy_percentage
            });
        }
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching shooter history:', error);
        res.status(500).json({ error: 'Failed to fetch shooter history' });
    }
});

// Get shooter statistics summary
app.get('/api/shooters/:name/stats', async (req, res) => {
    try {
        const shooterName = decodeURIComponent(req.params.name);

        // Get shooter info and session count
        const shooterInfo = await db.findOne(`
            SELECT s.*, COUNT(ss.id) as total_sessions
            FROM shooters s
            LEFT JOIN shooting_sessions ss ON s.id = ss.shooter_id
            WHERE s.shooter_name = ?
            GROUP BY s.id
        `, [shooterName]);

        if (!shooterInfo) {
            return res.status(404).json({ error: 'Shooter not found' });
        }

        // Get accuracy statistics
        const accuracyStats = await db.findOne(`
            SELECT
                AVG(fr.accuracy_percentage) as avg_accuracy,
                MAX(fr.accuracy_percentage) as best_accuracy,
                MIN(fr.accuracy_percentage) as worst_accuracy,
                COUNT(CASE WHEN fr.accuracy_percentage >= 80 THEN 1 END) as high_accuracy_sessions,
                AVG(fr.total_score) as avg_score,
                MAX(fr.total_score) as best_score
            FROM final_reports fr
            JOIN shooting_sessions ss ON fr.session_id = ss.id
            WHERE ss.shooter_id = ?
        `, [shooterInfo.id]);

        // Get recent session trend (last 5 sessions)
        const recentSessions = await db.query(`
            SELECT fr.accuracy_percentage, ss.started_at
            FROM final_reports fr
            JOIN shooting_sessions ss ON fr.session_id = ss.id
            WHERE ss.shooter_id = ?
            ORDER BY ss.started_at DESC
            LIMIT 5
        `, [shooterInfo.id]);

        const stats = {
            shooter_id: shooterInfo.id,
            shooter_name: shooterInfo.shooter_name,
            skill_level: shooterInfo.skill_level,
            total_sessions: shooterInfo.total_sessions,
            avg_accuracy: accuracyStats?.avg_accuracy || 0,
            best_accuracy: accuracyStats?.best_accuracy || 0,
            worst_accuracy: accuracyStats?.worst_accuracy || 0,
            high_accuracy_sessions: accuracyStats?.high_accuracy_sessions || 0,
            avg_score: accuracyStats?.avg_score || 0,
            best_score: accuracyStats?.best_score || 0,
            recent_sessions: recentSessions,
            created_at: shooterInfo.created_at
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching shooter stats:', error);
        res.status(500).json({ error: 'Failed to fetch shooter statistics' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// =====================================================
// SERVER STARTUP
// =====================================================

async function startServer() {
    try {
        // Test database connection
        console.log('🔌 Testing database connection...');
        const connected = await testConnection();

        if (!connected) {
            console.error('❌ Database connection failed. Please check your configuration.');
            process.exit(1);
        }

        // Initialize database schema
        console.log('🔧 Initializing database schema...');
        await initializeDatabase();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Shooting Range Dashboard Server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;
