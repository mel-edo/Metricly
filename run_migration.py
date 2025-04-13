from migrations.add_name_to_server import run_migration

if __name__ == "__main__":
    print("Running migration to add name column to server table...")
    run_migration()
    print("Migration completed.")
