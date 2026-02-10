-- Test MySQL connection and create database
-- Run this to verify MySQL is working

-- Show current databases
SHOW DATABASES;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS quanlybanhang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show databases again to confirm
SHOW DATABASES;

-- Use the database
USE quanlybanhang;

-- Show current tables (should be empty initially)
SHOW TABLES;
