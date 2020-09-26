import datetime
import os
import shutil


def backup_db(path, backup_dir, date_format="%d-%b-%y"):
    if not os.path.exists(backup_dir):
        os.mkdir(backup_dir)
    all_backups = os.listdir(backup_dir)
    today = datetime.date.today()
    daily_backup_exists = False
    for backup in all_backups:
        if backup.split(".")[0] == datetime.date.strftime(today, date_format):
            daily_backup_exists = True
            break

    if not daily_backup_exists:
        backup_dest = os.path.join(
            backup_dir,
            "{}.{}".format(
                datetime.date.strftime(today, date_format), os.path.basename(path)
            ),
        )
        try:
            shutil.copy(path, backup_dest)
        except IOError:
            pass
