#!/bin/bash
set -e

# Create the oops_user if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'oops_user') THEN
            CREATE USER oops_user WITH PASSWORD 'oops_password';
        END IF;
    END
    \$\$;
    
    -- Grant ownership of the existing database to oops_user
    ALTER DATABASE oops_platform OWNER TO oops_user;
    GRANT ALL PRIVILEGES ON DATABASE oops_platform TO oops_user;
    ALTER USER oops_user CREATEDB;
EOSQL

# Connect to the oops_platform database and grant schema permissions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "oops_platform" <<-EOSQL
    GRANT ALL ON SCHEMA public TO oops_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oops_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oops_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO oops_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO oops_user;
EOSQL
