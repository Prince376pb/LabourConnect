-- Labour Connect: V2 Reference Data Seed
-- Insert default roles, skills, and service categories

-- 1. Insert Master Roles
INSERT INTO roles (name) VALUES 
    ('ROLE_ADMIN'),
    ('ROLE_EMPLOYER'),
    ('ROLE_WORKER'),
    ('ROLE_CUSTOMER'),
    ('ROLE_PROVIDER')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Standard Skills
INSERT INTO skills (name, category, description) VALUES
    ('Masonry', 'Construction', 'Bricklaying, stone work, concrete mixing, and plastering'),
    ('Carpentry', 'Woodwork', 'Furniture making, doors/windows fixing, and structural woodwork'),
    ('Plumbing', 'Maintenance', 'Pipe installation, sanitary fixtures, and drainage maintenance'),
    ('Electrical Wiring', 'Electrical', 'House wiring, electrical fixture installations, and fault diagnosis'),
    ('House Painting', 'Finishing', 'Interior and exterior wall painting, primer, and waterproofing'),
    ('Tile Laying', 'Flooring', 'Floor and wall ceramic/granite tile installation'),
    ('Welding & Fabrication', 'Metalwork', 'Arc welding, gate fabrication, and metal repairs'),
    ('Loading & Unloading', 'Logistics', 'Heavy cargo loading, warehouse material shifting, and logistics'),
    ('General Construction Labour', 'Construction', 'Site clearing, excavation, earth moving, and material helper'),
    ('Bar Bending / Steel Fixing', 'Construction', 'Reinforcement steel bar bending and tying for RCC structures')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Service Categories (For On-Demand Service Connect)
INSERT INTO service_categories (name, slug, icon_name, description, is_active) VALUES
    ('Plumbing Services', 'plumbing', 'Wrench', 'Pipe leaks, tap repair, bathroom fittings, water tank and drainage solutions', TRUE),
    ('Electrical Repair', 'electrical', 'Zap', 'Short circuit fix, switchboard installation, ceiling fans, lighting, and wiring', TRUE),
    ('Carpentry & Woodwork', 'carpentry', 'Hammer', 'Door lock fixing, furniture repair, wooden partitioning, and custom fittings', TRUE),
    ('House Painting & Polishing', 'painting', 'Paintbrush', 'Wall repainting, putty work, waterproof coatings, and wood varnish', TRUE),
    ('Appliance Repair', 'appliance-repair', 'Tv', 'Air conditioner servicing, washing machines, refrigerators, and microwave repairs', TRUE),
    ('Automobile & Mechanics', 'mechanical', 'Car', 'Emergency roadside puncture, two-wheeler servicing, and mechanical checks', TRUE)
ON CONFLICT (name) DO NOTHING;
