#!/bin/bash
export SSHPASS="Mahim@9898@@"
sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no  root@187.124.113.85 'mysql -u root_ai4u -pMahim@9898@@ root_ai4u -e "DESCRIBE registrations;" 2>&1'
