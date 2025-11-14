-- Data Migration: Move existing JSONB tasks to new tasks table
-- This script migrates existing tasks from the goals.tasks JSONB column to the new tasks table

DO $$
DECLARE
    goal_record RECORD;
    task_json JSONB;
    task_obj JSON;
BEGIN
    -- Loop through all goals that have tasks
    FOR goal_record IN 
        SELECT id, user_id, tasks 
        FROM goals 
        WHERE tasks IS NOT NULL AND jsonb_array_length(tasks) > 0
    LOOP
        -- Loop through each task in the JSONB array
        FOR task_json IN 
            SELECT * FROM jsonb_array_elements(goal_record.tasks)
        LOOP
            -- Insert task into new tasks table
            INSERT INTO tasks (
                goal_id,
                user_id,
                text,
                due_date,
                is_complete,
                priority,
                order_index,
                created_at
            ) VALUES (
                goal_record.id,
                goal_record.user_id,
                task_json->>'text',
                (task_json->>'dueDate')::DATE,
                COALESCE((task_json->>'isComplete')::BOOLEAN, FALSE),
                'medium', -- Default priority
                COALESCE((task_json->>'id')::INTEGER, 0), -- Use old id as order_index
                NOW()
            )
            ON CONFLICT DO NOTHING; -- Skip if already exists
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Task migration completed';
END $$;
