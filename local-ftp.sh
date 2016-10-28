#!/bin/sh

apt-get install -y vsftpd

echo "listen=YES" > /etc/vsftpd.conf
echo "dirmessage_enable=YES" >> /etc/vsftpd.conf
echo "xferlog_enable=YES" >> /etc/vsftpd.conf
echo "secure_chroot_dir=/var/run/vsftpd/empty" >> /etc/vsftpd.conf
echo "anonymous_enable=YES" >> /etc/vsftpd.conf
echo "write_enable=YES" >> /etc/vsftpd.conf
echo "anon_upload_enable=YES" >> /etc/vsftpd.conf
echo "anon_mkdir_write_enable=YES" >> /etc/vsftpd.conf
echo "anon_other_write_enable=YES" >> /etc/vsftpd.conf
# I think you have to be logged in as a user for this to function correctly
# https://groups.google.com/forum/#!topic/alt-f/kfvcx_OP9jI
echo "allow_writeable_chroot=YES" >> /etc/vsftpd.conf
echo "ls_recurse_enable=YES" >> /etc/vsftpd.conf

chmod 777 /srv/ftp

service vsftpd restart
