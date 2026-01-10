-- Migration: Seed sample applicant data
-- This migration adds sample applicant data across different pipeline stages
-- Note: This requires at least one business user with a business_id to exist

-- Insert sample applicants only if the table is empty (to avoid duplicates)
DO $$
DECLARE
    sample_business_id INTEGER;
    applicant_count INTEGER;
BEGIN
    -- Get the first business_id from a user with role 'business', or from the first business
    SELECT COALESCE(
        (SELECT business_id FROM users WHERE role = 'business' AND business_id IS NOT NULL LIMIT 1),
        (SELECT id FROM businesses LIMIT 1)
    ) INTO sample_business_id;

    -- Check if any applicants already exist
    SELECT COUNT(*) INTO applicant_count FROM applicants;

    -- Only insert if no applicants exist and we have a business
    IF applicant_count = 0 AND sample_business_id IS NOT NULL THEN
        -- Insert applicants across different pipeline stages
        
        -- New Applicants (Stage 1)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 123-4567', 'Software Engineer', 'new_applicant', 1, 'Strong background in React and TypeScript', NOW() - INTERVAL '2 days'),
        (sample_business_id, 'Michael', 'Chen', 'michael.chen@email.com', '(555) 234-5678', 'Product Manager', 'new_applicant', 2, 'Previous experience at tech startups', NOW() - INTERVAL '1 day'),
        (sample_business_id, 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789', 'UX Designer', 'new_applicant', 3, 'Portfolio shows excellent design skills', NOW() - INTERVAL '3 days');

        -- Screening (Stage 2)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'David', 'Kim', 'david.kim@email.com', '(555) 456-7890', 'Data Analyst', 'screening', 1, 'Passed initial resume screening. Strong SQL skills.', NOW() - INTERVAL '5 days'),
        (sample_business_id, 'Jessica', 'Williams', 'jessica.williams@email.com', '(555) 567-8901', 'Marketing Specialist', 'screening', 2, 'Phone screening scheduled for next week', NOW() - INTERVAL '4 days');

        -- Interview Scheduled (Stage 3)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'James', 'Anderson', 'james.anderson@email.com', '(555) 678-9012', 'Sales Representative', 'interview_scheduled', 1, 'Technical interview scheduled for tomorrow at 2 PM', NOW() - INTERVAL '7 days'),
        (sample_business_id, 'Maria', 'Garcia', 'maria.garcia@email.com', '(555) 789-0123', 'Customer Success Manager', 'interview_scheduled', 2, 'Panel interview scheduled for Friday', NOW() - INTERVAL '6 days'),
        (sample_business_id, 'Robert', 'Taylor', 'robert.taylor@email.com', '(555) 890-1234', 'DevOps Engineer', 'interview_scheduled', 3, 'Final round interview next Monday', NOW() - INTERVAL '8 days');

        -- Interview Complete (Stage 4)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Lisa', 'Brown', 'lisa.brown@email.com', '(555) 901-2345', 'HR Coordinator', 'interview_complete', 1, 'Interview completed. Awaiting feedback from hiring manager.', NOW() - INTERVAL '10 days'),
        (sample_business_id, 'Christopher', 'Lee', 'christopher.lee@email.com', '(555) 012-3456', 'Full Stack Developer', 'interview_complete', 2, 'Technical assessment passed. Strong coding skills demonstrated.', NOW() - INTERVAL '9 days');

        -- Offer Extended (Stage 5)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Amanda', 'Martinez', 'amanda.martinez@email.com', '(555) 111-2222', 'Operations Manager', 'offer_extended', 1, 'Offer extended. Awaiting candidate response. Salary: $85,000', NOW() - INTERVAL '12 days'),
        (sample_business_id, 'Kevin', 'Thomas', 'kevin.thomas@email.com', '(555) 222-3333', 'Content Writer', 'offer_extended', 2, 'Written offer sent via email. Response deadline: End of week', NOW() - INTERVAL '11 days');

        -- Offer Accepted (Stage 6)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Nicole', 'White', 'nicole.white@email.com', '(555) 333-4444', 'Account Executive', 'offer_accepted', 1, 'Offer accepted! Start date: First Monday of next month', NOW() - INTERVAL '14 days'),
        (sample_business_id, 'Daniel', 'Harris', 'daniel.harris@email.com', '(555) 444-5555', 'Business Analyst', 'offer_accepted', 2, 'Candidate accepted offer. Onboarding process initiated.', NOW() - INTERVAL '13 days');

        -- Onboarding (Stage 7)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Rachel', 'Clark', 'rachel.clark@email.com', '(555) 555-6666', 'Graphic Designer', 'onboarding', 1, 'Currently completing onboarding paperwork and background check', NOW() - INTERVAL '16 days'),
        (sample_business_id, 'Thomas', 'Lewis', 'thomas.lewis@email.com', '(555) 666-7777', 'Project Manager', 'onboarding', 2, 'Orientation scheduled. IT setup in progress.', NOW() - INTERVAL '15 days'),
        (sample_business_id, 'Patricia', 'Walker', 'patricia.walker@email.com', '(555) 777-8888', 'Quality Assurance Engineer', 'onboarding', 3, 'All documents submitted. Waiting for equipment delivery.', NOW() - INTERVAL '17 days');

        -- Active Employee (Stage 8)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Matthew', 'Hall', 'matthew.hall@email.com', '(555) 888-9999', 'Senior Developer', 'active_employee', 1, 'Started 2 months ago. Performing well in the role.', NOW() - INTERVAL '60 days'),
        (sample_business_id, 'Jennifer', 'Young', 'jennifer.young@email.com', '(555) 999-0000', 'Sales Manager', 'active_employee', 2, 'Active employee. Team lead for west coast region.', NOW() - INTERVAL '45 days'),
        (sample_business_id, 'Mark', 'King', 'mark.king@email.com', '(555) 000-1111', 'Customer Support Specialist', 'active_employee', 3, 'Recently promoted to senior support specialist.', NOW() - INTERVAL '90 days'),
        (sample_business_id, 'Laura', 'Wright', 'laura.wright@email.com', '(555) 111-0000', 'Marketing Director', 'active_employee', 4, 'Leading marketing campaigns. Strong performance metrics.', NOW() - INTERVAL '120 days');

        -- Offboarding (Stage 9)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Steven', 'Lopez', 'steven.lopez@email.com', '(555) 222-1111', 'Software Engineer', 'offboarding', 1, 'Two weeks notice given. Exit interview scheduled.', NOW() - INTERVAL '730 days');

        -- Archived (Stage 10)
        INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date) VALUES
        (sample_business_id, 'Michelle', 'Hill', 'michelle.hill@email.com', '(555) 333-2222', 'Accountant', 'archived', 1, 'Candidate declined offer. Archived for future reference.', NOW() - INTERVAL '20 days'),
        (sample_business_id, 'Andrew', 'Scott', 'andrew.scott@email.com', '(555) 444-3333', 'IT Support', 'archived', 2, 'Position filled by another candidate. Archived.', NOW() - INTERVAL '25 days');

        RAISE NOTICE 'Sample applicant data inserted successfully. Total: 21 applicants across all pipeline stages.';
    ELSIF applicant_count > 0 THEN
        RAISE NOTICE 'Applicants table already contains data. Skipping seed to avoid duplicates.';
    ELSIF sample_business_id IS NULL THEN
        RAISE NOTICE 'No business found. Please create a business and link a user with role "business" to it before seeding applicant data.';
    END IF;
END $$;

