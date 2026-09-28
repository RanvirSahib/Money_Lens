"""
Database Account Pruning Script.
Safely removes all user accounts and their associated records from AWS RDS PostgreSQL,
PRESERVING ONLY the designated administrative account.
"""

import os
import sys

# Ensure backend root directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import logging
from app.core.database import get_db_connection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("prune_accounts")

KEEP_EMAIL = "ranvir.sahibadv88@gmail.com".strip().lower()


def prune_other_accounts() -> bool:
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # 1. Safety Check: Verify target user exists
                cur.execute(
                    "SELECT id, email, name, username FROM users WHERE LOWER(email) = %s;",
                    (KEEP_EMAIL,)
                )
                keep_user = cur.fetchone()
                if not keep_user:
                    cur.execute("SELECT id, email, username FROM users;")
                    all_users = cur.fetchall()
                    logger.error(
                        f"Target account '{KEEP_EMAIL}' was NOT found in the database! "
                        f"Existing accounts in DB: {[u['email'] for u in all_users]}. "
                        f"Aborting deletion to prevent accidental data loss."
                    )
                    return False

                keep_user_id = keep_user["id"]
                logger.info(
                    f"Verified preserved account: ID='{keep_user_id}', "
                    f"Name='{keep_user.get('name')}', Email='{keep_user.get('email')}'"
                )

                # 2. Count accounts to be deleted
                cur.execute(
                    "SELECT COUNT(*) AS cnt FROM users WHERE LOWER(email) != %s;",
                    (KEEP_EMAIL,)
                )
                res = cur.fetchone()
                delete_count = res["cnt"] if res else 0
                logger.info(f"Found {delete_count} other user accounts to delete.")

                if delete_count == 0:
                    logger.info("No other user accounts exist in the database. Nothing to delete.")
                    return True

                # 3. Clean up child / related records first
                cur.execute("DELETE FROM user_profiles WHERE user_id != %s;", (keep_user_id,))
                cur.execute("DELETE FROM statement_summaries WHERE user_id != %s;", (keep_user_id,))
                cur.execute("DELETE FROM user_emis WHERE user_id != %s;", (keep_user_id,))
                cur.execute("DELETE FROM user_subscriptions WHERE user_id != %s;", (keep_user_id,))
                cur.execute("DELETE FROM user_investments WHERE user_id != %s;", (keep_user_id,))
                cur.execute(
                    "DELETE FROM transactions WHERE user_id IS NOT NULL AND user_id != '' AND user_id != %s;",
                    (keep_user_id,)
                )
                cur.execute(
                    "DELETE FROM goals WHERE user_id IS NOT NULL AND user_id != '' AND user_id != %s;",
                    (keep_user_id,)
                )
                cur.execute("DELETE FROM email_otps WHERE LOWER(email) != %s;", (KEEP_EMAIL,))

                # 4. Delete the other users
                cur.execute("DELETE FROM users WHERE LOWER(email) != %s;", (KEEP_EMAIL,))
                conn.commit()

                logger.info(f"Successfully deleted {delete_count} other accounts and all their related data.")
                logger.info(f"Database sanitized: ONLY account '{KEEP_EMAIL}' remains.")
                return True
    except Exception as e:
        logger.error(f"Error executing account cleanup: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = prune_other_accounts()
    sys.exit(0 if success else 1)
