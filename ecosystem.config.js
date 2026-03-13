module.exports = {
    apps: [
        {
            name: 'mindsetai-api',
            cwd: './server',
            script: 'server.js',
            instances: 'max',
            exec_mode: 'cluster',

            // ── Environment ──
            env: {
                NODE_ENV: 'development',
                PORT: 5001,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5001,
            },

            // ── Crash Recovery ──
            autorestart: true,
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 5000,

            // ── Memory Guard ──
            max_memory_restart: '500M',

            // ── Logging ──
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: '../logs/pm2-error.log',
            out_file: '../logs/pm2-out.log',
            merge_logs: true,
            log_type: 'json',

            // ── Misc ──
            watch: false,
            kill_timeout: 5000,
        },
    ],
}
