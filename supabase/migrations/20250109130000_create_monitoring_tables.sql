-- Create monitoring tables for AES CRM
-- Error logs, analytics events, and performance metrics

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('javascript', 'network', 'api', 'authentication', 'validation', 'performance', 'security', 'user_interaction')),
    message TEXT NOT NULL,
    stack TEXT,
    filename TEXT,
    lineno INTEGER,
    colno INTEGER,
    component_stack TEXT,
    additional_data JSONB DEFAULT '{}',
    user_context JSONB DEFAULT '{}',
    performance JSONB DEFAULT '{}',
    url TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'user_action', 'form_submit', 'button_click', 'link_click', 'search', 'conversion', 'error', 'performance', 'feature_usage')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT NOT NULL,
    viewport JSONB DEFAULT '{}',
    screen JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    user_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    url TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health table
CREATE TABLE IF NOT EXISTS system_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    check_type TEXT NOT NULL CHECK (check_type IN ('database', 'api', 'storage', 'memory', 'cpu', 'network')),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
    message TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_url ON analytics_events(url);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_system_health_check_type ON system_health(check_type);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_created_at ON system_health(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON user_sessions(ended_at);

-- Create RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow system owners to view all monitoring data
CREATE POLICY "System owners can view all monitoring data" ON error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

CREATE POLICY "System owners can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

CREATE POLICY "System owners can view all performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

CREATE POLICY "System owners can view all system health" ON system_health
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

CREATE POLICY "System owners can view all user sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

-- Allow users to view their own data
CREATE POLICY "Users can view their own error logs" ON error_logs
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid()::text);

-- Allow anonymous users to insert monitoring data
CREATE POLICY "Allow anonymous error log insertion" ON error_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous analytics event insertion" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous performance metric insertion" ON performance_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous session creation" ON user_sessions
    FOR INSERT WITH CHECK (true);

-- Create functions for monitoring data aggregation
CREATE OR REPLACE FUNCTION get_error_statistics(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    total_errors BIGINT,
    critical_errors BIGINT,
    high_errors BIGINT,
    medium_errors BIGINT,
    low_errors BIGINT,
    errors_by_category JSONB,
    errors_by_severity JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_errors,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_errors,
        COUNT(*) FILTER (WHERE severity = 'high') as high_errors,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium_errors,
        COUNT(*) FILTER (WHERE severity = 'low') as low_errors,
        jsonb_object_agg(category, category_count) as errors_by_category,
        jsonb_object_agg(severity, severity_count) as errors_by_severity
    FROM (
        SELECT 
            category,
            severity,
            COUNT(*) as category_count,
            COUNT(*) as severity_count
        FROM error_logs 
        WHERE created_at >= NOW() - INTERVAL '1 hour' * hours_back
        GROUP BY category, severity
    ) t;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_analytics_summary(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    total_events BIGINT,
    unique_sessions BIGINT,
    page_views BIGINT,
    conversions BIGINT,
    top_pages JSONB,
    top_actions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
        COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
        (
            SELECT jsonb_agg(jsonb_build_object('page', page, 'count', page_count))
            FROM (
                SELECT 
                    data->>'page' as page,
                    COUNT(*) as page_count
                FROM analytics_events 
                WHERE event_type = 'page_view' 
                AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
                GROUP BY data->>'page'
                ORDER BY page_count DESC
                LIMIT 10
            ) top_pages
        ) as top_pages,
        (
            SELECT jsonb_agg(jsonb_build_object('action', action, 'count', action_count))
            FROM (
                SELECT 
                    data->>'action' as action,
                    COUNT(*) as action_count
                FROM analytics_events 
                WHERE event_type = 'user_action' 
                AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
                GROUP BY data->>'action'
                ORDER BY action_count DESC
                LIMIT 10
            ) top_actions
        ) as top_actions
    FROM analytics_events 
    WHERE created_at >= NOW() - INTERVAL '1 hour' * hours_back;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_performance_summary(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    avg_lcp NUMERIC,
    avg_fcp NUMERIC,
    avg_cls NUMERIC,
    avg_ttfb NUMERIC,
    slow_resources BIGINT,
    large_resources BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(metric_value) FILTER (WHERE metric_name = 'LCP') as avg_lcp,
        AVG(metric_value) FILTER (WHERE metric_name = 'FCP') as avg_fcp,
        AVG(metric_value) FILTER (WHERE metric_name = 'CLS') as avg_cls,
        AVG(metric_value) FILTER (WHERE metric_name = 'TTFB') as avg_ttfb,
        COUNT(*) FILTER (WHERE metric_name = 'slow_resource') as slow_resources,
        COUNT(*) FILTER (WHERE metric_name = 'large_resource') as large_resources
    FROM performance_metrics 
    WHERE created_at >= NOW() - INTERVAL '1 hour' * hours_back;
END;
$$ LANGUAGE plpgsql;

-- Create views for easy monitoring dashboard queries
CREATE OR REPLACE VIEW monitoring_dashboard AS
SELECT 
    'errors' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24_hours
FROM error_logs
UNION ALL
SELECT 
    'analytics' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24_hours
FROM analytics_events
UNION ALL
SELECT 
    'performance' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24_hours
FROM performance_metrics;

-- Create cleanup function for old monitoring data
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void AS $$
BEGIN
    -- Delete error logs older than 30 days
    DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete analytics events older than 90 days
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete performance metrics older than 30 days
    DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete system health records older than 7 days
    DELETE FROM system_health WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old user sessions
    DELETE FROM user_sessions WHERE started_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-monitoring-data', '0 2 * * *', 'SELECT cleanup_old_monitoring_data();');
