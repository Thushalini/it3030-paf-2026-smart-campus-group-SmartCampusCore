-- Insert sample resources
INSERT INTO resources (name, description, location, capacity, start_time, end_time, status, created_at, updated_at) VALUES
('Conference Room A', 'Large conference room with projector and whiteboard', 'Building A, Floor 2', 20, '09:00:00', '18:00:00', 'ACTIVE', NOW(), NOW()),
('Computer Lab 1', 'Computer lab with 30 workstations', 'Building B, Floor 1', 30, '08:00:00', '22:00:00', 'ACTIVE', NOW(), NOW()),
('Study Room 101', 'Small study room for group discussions', 'Library, Floor 1', 6, '09:00:00', '21:00:00', 'ACTIVE', NOW(), NOW()),
('Auditorium', 'Main auditorium for large events', 'Building C, Ground Floor', 200, '08:00:00', '22:00:00', 'ACTIVE', NOW(), NOW()),
('Meeting Room B', 'Small meeting room for team discussions', 'Building A, Floor 3', 8, '09:00:00', '18:00:00', 'ACTIVE', NOW(), NOW()),
('Physics Lab', 'Physics laboratory with equipment', 'Science Building, Floor 2', 25, '08:00:00', '17:00:00', 'ACTIVE', NOW(), NOW()),
('Library Study Area', 'Open study area in the library', 'Library, Floor 2', 50, '08:00:00', '22:00:00', 'ACTIVE', NOW(), NOW()),
('Sports Hall', 'Indoor sports facility', 'Sports Complex', 100, '06:00:00', '22:00:00', 'ACTIVE', NOW(), NOW());

-- Insert sample users (these will be created automatically when they log in)
-- The system will auto-create users on first login, so no need to pre-insert users

-- Note: Bookings are created through the application interface
-- This script sets up the basic resources needed for the system to function
