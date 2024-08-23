## Seahub Schema

This folder contains database schema for seahub.

## Maintainence

The sql files in this folder should always correspond to the latest schema, which means it would give you the same database whether you run the django "syncdb" command or directly import the sqls here.

So each time you change some model, you should update each sql file here.

## Get the initial database sqls

### MySQL

To get the MySQL sqls:

```
cd seahub
mysqldump -u root -proot --skip-add-lock --skip-add-drop-table --skip-comments seahub  > sql/mysql.sql
```
