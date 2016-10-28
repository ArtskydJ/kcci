# Argument 1 is the local fs path to upload


lftp -e 'mirror -R $1 /' -u joseph,abcd1234 ftp://127.0.0.1

