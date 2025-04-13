"""
Migration script to add name column to server table
"""
import sqlite3
import os

def run_migration():
    # Get the database path
    db_path = os.path.join('instance', 'metricly.db')
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(server)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        if 'name' not in column_names:
            # Add the name column to the server table
            cursor.execute("ALTER TABLE server ADD COLUMN name TEXT")
            print("Added 'name' column to server table")
        else:
            print("Column 'name' already exists in server table")
        
        # Commit the changes
        conn.commit()
        print("Migration completed successfully")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        # Close the connection
        conn.close()

if __name__ == "__main__":
    run_migration()
