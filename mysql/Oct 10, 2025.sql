-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 06, 2025 at 09:59 AM
-- Server version: 8.0.37
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `selfiegram6`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `bookingID` int NOT NULL,
  `userID` int NOT NULL,
  `packageID` int NOT NULL,
  `bookingDate` date NOT NULL,
  `bookingStartTime` time NOT NULL,
  `bookingEndTime` time NOT NULL,
  `status` tinyint NOT NULL,
  `customerName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `customerContactNo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `customerEmail` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `customerAddress` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `studio_selection` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `addons_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paymentMethod` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `paymentStatus` tinyint NOT NULL,
  `payment_updated_at` timestamp NULL DEFAULT NULL,
  `payment_notes` text COLLATE utf8mb4_general_ci,
  `subTotal` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `rem` decimal(10,2) NOT NULL,
  `receivedAmount` decimal(10,2) NOT NULL,
  `feedback` text COLLATE utf8mb4_general_ci,
  `rating` int DEFAULT NULL
) ;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`bookingID`, `userID`, `packageID`, `bookingDate`, `bookingStartTime`, `bookingEndTime`, `status`, `customerName`, `customerContactNo`, `customerEmail`, `customerAddress`, `date`, `studio_selection`, `addons_total`, `paymentMethod`, `paymentStatus`, `payment_updated_at`, `payment_notes`, `subTotal`, `total`, `rem`, `receivedAmount`, `feedback`, `rating`) VALUES
(3, 2, 1004, '2025-07-22', '16:00:00', '17:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'reyesmaryhannahcaryl@gmail.com', 'Malinis St', '2025-07-15', NULL, 0.00, 'GCash', 1, NULL, NULL, 749.00, 749.00, 0.00, 749.00, NULL, 0),
(5, 3, 1001, '2025-09-11', '11:30:00', '12:30:00', 1, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', NULL, 0.00, 'GCash', 1, NULL, NULL, 479.00, 675.00, 475.00, 200.00, 'dwddwdwadwa', 5),
(6, 3, 1014, '2025-07-31', '18:30:00', '19:30:00', 4, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', NULL, 0.00, 'GCash', 0, NULL, NULL, 2999.00, 3598.00, 3398.00, 200.00, 'Nice service. Would recommend!', 5),
(7, 3, 1013, '2025-08-02', '13:30:00', '14:30:00', 4, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', NULL, 0.00, 'GCash', 0, NULL, NULL, 749.00, 749.00, 0.00, 749.00, 'Nice service. Would recommend! walang add on hahaha', 4),
(12, 3, 1000, '2025-09-12', '10:00:00', '11:00:00', 1, 'Mary Hannah Caryl Reyes', '09155467893', 'reyesmary@gmail.com', 'Malinis St', '2025-09-09', NULL, 0.00, 'GCash', 1, NULL, NULL, 379.00, 508.00, 0.00, 508.00, 'dwd', 3),
(13, 2, 1002, '2025-09-12', '14:00:00', '15:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'mary.reyes@example.com', 'Malolos City', '2025-09-11', NULL, 0.00, 'GCash', 1, NULL, NULL, 599.00, 599.00, 0.00, 599.00, 'Loved the shoot!', 5),
(15, 4, 1005, '2025-09-14', '15:30:00', '16:30:00', 1, 'Juan Dela Cruz', '09271234567', 'juancruz@gmail.com', 'San Fernando, Pampanga', '2025-09-13', NULL, 0.00, 'GCash', 1, NULL, NULL, 1299.00, 1299.00, 0.00, 1299.00, 'Great photos!', 4),
(16, 5, 1008, '2025-09-15', '17:00:00', '18:00:00', 2, 'Ana Santos', '09381231234', 'ana.santos@yahoo.com', 'Quezon City', '2025-09-14', NULL, 0.00, 'GCash', 1, NULL, NULL, 1599.00, 1899.00, 0.00, 1899.00, 'Had to reschedule.', 3),
(17, 2, 1011, '2025-09-16', '13:00:00', '14:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'mary.reyes@example.com', 'Malolos City', '2025-09-15', NULL, 0.00, 'Cash', 1, NULL, NULL, 499.00, 499.00, 0.00, 499.00, 'Quick and easy.', 5),
(19, 4, 1006, '2025-09-18', '10:30:00', '11:30:00', 2, 'Juan Dela Cruz', '09271234567', 'juancruz@gmail.com', 'San Fernando, Pampanga', '2025-09-17', NULL, 0.00, 'GCash', 1, NULL, NULL, 1299.00, 1499.00, 0.00, 1499.00, 'Cancelled due to conflict.', 2),
(20, 5, 1012, '2025-09-19', '12:30:00', '13:30:00', 1, 'Ana Santos', '09381231234', 'ana.santos@yahoo.com', 'Quezon City', '2025-09-18', NULL, 0.00, 'Cash', 1, NULL, NULL, 899.00, 899.00, 0.00, 899.00, 'Nice studio.', 4),
(21, 2, 1009, '2025-09-20', '16:00:00', '17:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'mary.reyes@example.com', 'Malolos City', '2025-09-19', NULL, 0.00, 'GCash', 1, NULL, NULL, 749.00, 799.00, 0.00, 799.00, 'Great service!', 5),
(23, 4, 1013, '2025-09-22', '14:30:00', '15:30:00', 1, 'Juan Dela Cruz', '09271234567', 'juancruz@gmail.com', 'San Fernando, Pampanga', '2025-09-21', NULL, 0.00, 'Cash', 0, NULL, NULL, 749.00, 949.00, 749.00, 200.00, NULL, NULL),
(24, 5, 1014, '2025-09-23', '18:00:00', '19:00:00', 2, 'Ana Santos', '09381231234', 'ana.santos@yahoo.com', 'Quezon City', '2025-09-22', NULL, 0.00, 'GCash', 1, NULL, NULL, 2999.00, 3599.00, 0.00, 3599.00, 'Big package, worth it!', 5),
(25, 2, 1004, '2025-09-24', '08:30:00', '09:30:00', 2, 'Mary Hannah Reyes', '09155467893', 'mary.reyes@example.com', 'Malolos City', '2025-09-23', NULL, 0.00, 'GCash', 1, NULL, NULL, 749.00, 849.00, 0.00, 849.00, 'Rescheduled shoot.', 3),
(27, 4, 1000, '2025-09-26', '17:30:00', '18:30:00', 1, 'Juan Dela Cruz', '09271234567', 'juancruz@gmail.com', 'San Fernando, Pampanga', '2025-09-25', NULL, 0.00, 'GCash', 1, NULL, NULL, 379.00, 508.00, 0.00, 508.00, 'Affordable!', 4),
(28, 3, 1000, '2025-09-30', '09:00:00', '10:00:00', 2, 'Mary Hannah Caryl Reyes', '09155467893', 'nicolevarga19@icloud.com', 'Malinis St', '2025-09-30', '{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"}', 49.00, 'PayMongo', 1, NULL, NULL, 379.00, 428.00, 0.00, 428.00, NULL, NULL),
(29, 3, 1002, '2025-09-30', '09:30:00', '10:30:00', 2, 'Mary Hannah Caryl Reyes', '09231232132', 'daawdwa@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 49.00, 'PayMongo', 0, NULL, NULL, 699.00, 748.00, 548.00, 200.00, NULL, NULL),
(30, 3, 1000, '2025-09-30', '10:00:00', '11:00:00', 2, 'Mary Hannah Caryl Reyes', '09297319273', 'jdiwoajodw@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 69.00, 'PayMongo', 0, NULL, NULL, 379.00, 448.00, 248.00, 200.00, NULL, NULL),
(31, 3, 1002, '2025-09-30', '13:30:00', '14:30:00', 2, 'Mary Hannah Caryl Reyes', '09231232132', 'dwadwad@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 129.00, 'PayMongo', 1, NULL, NULL, 699.00, 828.00, 0.00, 828.00, NULL, NULL),
(32, 3, 1002, '2025-10-02', '09:00:00', '10:00:00', 2, 'Mary Hannah Caryl Reyes', '09231231231', 'rearedw@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 49.00, 'PayMongo', 1, NULL, NULL, 699.00, 748.00, 0.00, 748.00, NULL, NULL),
(33, 3, 1000, '2025-09-30', '10:30:00', '11:30:00', 2, 'Mary Hannah Caryl Reyes', '09213712837', 'dwadwa@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"black\",\"label\":\"BLACK\",\"type\":\"studioA\",\"hex\":\"#272323\"}', 49.00, 'PayMongo', 1, NULL, NULL, 379.00, 428.00, 0.00, 428.00, NULL, NULL),
(34, 3, 1002, '2025-09-30', '11:00:00', '12:00:00', 2, 'Mary Hannah Caryl Reyes', '09213123123', 'wdkwpdkwp@gmaill.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 129.00, 'PayMongo', 1, NULL, NULL, 699.00, 828.00, 0.00, 828.00, NULL, NULL),
(35, 3, 1000, '2025-09-30', '14:00:00', '15:00:00', 2, 'Mary Hannah Caryl Reyes', '09231231232', 'dwadwa@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 49.00, 'PayMongo', 1, NULL, NULL, 379.00, 428.00, 0.00, 428.00, NULL, NULL),
(36, 3, 1001, '2025-09-30', '15:00:00', '16:00:00', 2, 'Mary Hannah Caryl Reyes', '09231312321', 'wdadwadw@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 198.00, 'PayMongo', 0, NULL, NULL, 479.00, 677.00, 477.00, 200.00, NULL, NULL),
(37, 3, 1000, '2025-09-30', '17:00:00', '18:00:00', 2, 'Mary Hannah Caryl Reyes', '09342432432', 'dwadwadwa@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 268.00, 'PayMongo', 1, NULL, NULL, 379.00, 647.00, 0.00, 647.00, NULL, NULL),
(38, 3, 1003, '2025-09-30', '17:30:00', '18:30:00', 2, 'Mary Hannah Caryl Reyes', '09543543543', 'sfefsefes@gmail.com', 'Malinis St', '2025-09-30', '{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"}', 485.00, 'PayMongo', 1, NULL, NULL, 899.00, 1384.00, 0.00, 1384.00, NULL, NULL),
(39, 3, 1000, '2025-10-09', '12:00:00', '13:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"}', 0.00, 'Credit/Debit Card', 1, NULL, NULL, 379.00, 379.00, 0.00, 379.00, NULL, NULL),
(40, 3, 1000, '2025-10-16', '13:30:00', '14:30:00', 4, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 457.00, 'PayMongo', 0, NULL, NULL, 379.00, 836.00, 636.00, 200.00, NULL, NULL),
(41, 3, 1001, '2025-10-16', '11:00:00', '12:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"black\",\"label\":\"BLACK\",\"type\":\"studioA\",\"hex\":\"#272323\"}', 457.00, 'PayMongo', 0, NULL, NULL, 479.00, 936.00, 936.00, 0.00, NULL, NULL),
(42, 3, 1001, '2025-10-16', '11:00:00', '12:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"black\",\"label\":\"BLACK\",\"type\":\"studioA\",\"hex\":\"#272323\"}', 457.00, 'PayMongo', 0, NULL, NULL, 479.00, 936.00, 936.00, 0.00, NULL, NULL),
(43, 3, 1001, '2025-10-28', '10:00:00', '11:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 328.00, 'PayMongo', 0, NULL, NULL, 479.00, 807.00, 807.00, 0.00, NULL, NULL),
(44, 3, 1001, '2025-10-28', '10:00:00', '11:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 328.00, 'PayMongo', 0, NULL, NULL, 479.00, 807.00, 807.00, 0.00, NULL, NULL),
(45, 3, 1001, '2025-10-28', '10:00:00', '11:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 0.00, 'PayMongo', 0, NULL, NULL, 479.00, 479.00, 479.00, 0.00, NULL, NULL),
(46, 3, 1001, '2025-10-17', '11:00:00', '12:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 457.00, 'PayMongo', 0, NULL, NULL, 479.00, 936.00, 936.00, 0.00, NULL, NULL),
(47, 3, 1001, '2025-10-30', '20:00:00', '21:00:00', 1, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"white\",\"label\":\"WHITE\",\"type\":\"studioA\",\"hex\":\"#f4f6f1\"}', 457.00, 'PayMongo', 0, NULL, NULL, 479.00, 936.00, 936.00, 0.00, NULL, NULL),
(48, 1, 1002, '2025-10-23', '13:00:00', '14:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"white\",\"label\":\"WHITE\",\"type\":\"studioA\",\"hex\":\"#f4f6f1\"}', 457.00, 'GCash', 0, NULL, NULL, 699.00, 1156.00, 199.00, 957.00, NULL, NULL),
(49, 1, 1002, '2025-10-24', '17:00:00', '18:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-09-30', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 258.00, 'GCash', 1, NULL, NULL, 699.00, 957.00, 0.00, 957.00, NULL, NULL),
(50, 3, 1000, '2025-10-24', '16:30:00', '17:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 328.00, 'PayMongo', 1, NULL, NULL, 379.00, 707.00, 0.00, 707.00, NULL, NULL),
(51, 3, 1000, '2025-10-25', '15:00:00', '16:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 328.00, 'Credit/Debit Card', 1, NULL, NULL, 379.00, 707.00, 0.00, 707.00, NULL, NULL),
(52, 3, 1000, '2025-10-18', '15:00:00', '16:00:00', 3, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"}', 129.00, 'PayMongo', 1, NULL, NULL, 379.00, 508.00, 0.00, 508.00, NULL, NULL),
(53, 3, 1000, '2025-10-18', '13:30:00', '14:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 457.00, 'Credit/Debit Card', 1, NULL, NULL, 379.00, 836.00, 0.00, 836.00, NULL, NULL),
(54, 3, 1001, '2025-10-31', '19:30:00', '20:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 129.00, 'PayMongo', 0, NULL, NULL, 479.00, 608.00, 408.00, 200.00, NULL, NULL),
(55, 3, 1001, '2025-10-31', '12:00:00', '13:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 0.00, 'PayMongo', 0, NULL, NULL, 479.00, 479.00, 279.00, 200.00, NULL, NULL),
(56, 3, 1000, '2025-10-30', '19:30:00', '20:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"}', 129.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 508.00, 308.00, 200.00, NULL, NULL),
(57, 3, 1000, '2025-10-26', '16:30:00', '17:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-04', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(58, 3, 1000, '2025-10-23', '12:00:00', '13:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"black\",\"label\":\"BLACK\",\"type\":\"studioA\",\"hex\":\"#272323\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(59, 3, 1000, '2025-10-29', '10:30:00', '11:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(60, 3, 1000, '2025-10-21', '12:30:00', '13:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(61, 3, 1000, '2025-10-21', '18:00:00', '19:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(62, 3, 1000, '2025-10-23', '13:30:00', '14:30:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"}', 0.00, 'Credit/Debit Card', 0, NULL, NULL, 379.00, 379.00, 179.00, 200.00, NULL, NULL),
(63, 3, 1000, '2025-11-01', '09:00:00', '10:00:00', 2, 'Nicole Varga', '09155467893', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-10-05', '{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"}', 0.00, 'Credit/Debit Card', 1, NULL, NULL, 379.00, 379.00, 0.00, 379.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_add_ons`
--

CREATE TABLE `booking_add_ons` (
  `bookingAddOnID` int NOT NULL,
  `bookingID` int NOT NULL,
  `addOnID` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_add_ons`
--

INSERT INTO `booking_add_ons` (`bookingAddOnID`, `bookingID`, `addOnID`, `quantity`, `price`) VALUES
(1, 3, 20, 1, 129.00),
(2, 5, 10, 2, 49.00),
(3, 6, 80, 1, 599.00),
(4, 7, 70, 1, 129.00),
(9, 3, 70, 1, 129.00),
(10, 5, 30, 2, 49.00),
(11, 47, 50, 1, 129.00),
(12, 47, 60, 1, 199.00),
(13, 47, 70, 1, 129.00),
(14, 49, 50, 1, 129.00),
(15, 49, 70, 1, 129.00);

-- --------------------------------------------------------

--
-- Table structure for table `booking_concepts`
--

CREATE TABLE `booking_concepts` (
  `bookingConceptID` int NOT NULL,
  `bookingID` int NOT NULL,
  `conceptID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_concepts`
--

INSERT INTO `booking_concepts` (`bookingConceptID`, `bookingID`, `conceptID`) VALUES
(2, 5, 104),
(3, 6, 102),
(4, 6, 105),
(5, 7, 100),
(11, 3, 101);

-- --------------------------------------------------------

--
-- Table structure for table `booking_request`
--

CREATE TABLE `booking_request` (
  `requestID` int NOT NULL,
  `bookingID` int NOT NULL,
  `userID` int NOT NULL,
  `requestType` enum('reschedule','cancel') COLLATE utf8mb4_general_ci NOT NULL,
  `requestedDate` date DEFAULT NULL,
  `requestedStartTime` time DEFAULT NULL,
  `requestedEndTime` time DEFAULT NULL,
  `reason` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','approved','declined') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_request`
--

INSERT INTO `booking_request` (`requestID`, `bookingID`, `userID`, `requestType`, `requestedDate`, `requestedStartTime`, `requestedEndTime`, `reason`, `status`, `requestDate`) VALUES
(22, 7, 3, 'cancel', NULL, NULL, NULL, 'dwadaw', 'declined', '2025-09-16 15:03:01'),
(27, 12, 3, 'cancel', NULL, NULL, NULL, 'dwadwa', 'pending', '2025-09-17 14:33:50'),
(29, 6, 3, 'cancel', NULL, NULL, NULL, 'daw', 'pending', '2025-09-17 15:40:58'),
(32, 12, 3, 'reschedule', '2025-09-11', '15:00:00', '15:30:00', 'dwadwa', 'pending', '2025-09-17 16:15:41'),
(34, 7, 3, 'reschedule', '2025-09-19', '09:00:00', '09:30:00', 'Copnflicting schedule po', 'pending', '2025-09-17 18:04:39'),
(35, 12, 3, 'reschedule', '2025-09-12', '12:00:00', '12:30:00', 'Conflict schedule', 'declined', '2025-09-18 03:04:37'),
(37, 5, 3, 'reschedule', '2025-09-11', '15:00:00', '15:30:00', 'nonoon', 'approved', '2025-09-18 04:35:38'),
(38, 12, 3, 'reschedule', '2025-09-12', '15:00:00', '15:30:00', 'Wrong selection of date', 'approved', '2025-09-18 13:46:44'),
(40, 7, 3, 'cancel', NULL, NULL, NULL, 'i dont like', 'approved', '2025-09-19 10:28:43'),
(41, 5, 3, 'reschedule', '2025-09-29', '12:00:00', '12:30:00', 'dswad', 'pending', '2025-09-22 19:19:41'),
(42, 6, 3, 'reschedule', '2025-09-29', '20:00:00', '20:30:00', 'fesfesdwa', 'pending', '2025-09-29 15:28:24'),
(43, 7, 3, 'reschedule', '2025-09-30', '12:00:00', '12:30:00', 'dwadwa', 'pending', '2025-09-29 15:28:55'),
(44, 5, 3, 'reschedule', '2025-10-05', '12:00:00', '12:30:00', 'i dont like', 'pending', '2025-09-29 15:38:10'),
(45, 5, 3, 'reschedule', '2025-10-02', '12:00:00', '12:30:00', 'dwadwaweqdwadwa', 'pending', '2025-09-29 15:47:06'),
(46, 6, 3, 'reschedule', '2025-09-30', '15:00:00', '15:30:00', 'dwqdwqdqwdqe', 'pending', '2025-09-29 15:47:43'),
(47, 5, 3, 'reschedule', '2025-09-30', '12:00:00', '12:30:00', 'dwadwadwadwad', 'pending', '2025-09-29 15:50:23'),
(48, 6, 3, 'reschedule', '2025-09-30', '18:00:00', '18:30:00', 'dwawadawdawdwa', 'pending', '2025-09-29 15:53:21'),
(49, 5, 3, 'reschedule', '2025-10-02', '10:00:00', '10:30:00', 'dawdwadwewqew', 'pending', '2025-09-29 16:06:36'),
(50, 6, 3, 'reschedule', '2025-10-03', '12:00:00', '12:30:00', 'dwadwadawdwadw', 'pending', '2025-09-29 16:07:00'),
(51, 5, 3, 'reschedule', '2025-10-17', '18:00:00', '18:30:00', 'dwadawdwawda', 'pending', '2025-09-29 16:31:46'),
(52, 5, 3, 'reschedule', '2025-10-04', '19:00:00', '19:30:00', 'dawdweqewq', 'pending', '2025-09-29 16:32:37'),
(53, 5, 3, 'cancel', NULL, NULL, NULL, 'dwaewqewqewq', 'approved', '2025-09-29 16:33:38'),
(54, 52, 3, 'cancel', NULL, NULL, NULL, 'basta', 'pending', '2025-10-04 10:24:36'),
(55, 52, 3, 'cancel', NULL, NULL, NULL, 'basta', 'pending', '2025-10-04 10:24:39'),
(56, 52, 3, 'cancel', NULL, NULL, NULL, 'basta', 'pending', '2025-10-04 10:24:40'),
(57, 52, 3, 'cancel', NULL, NULL, NULL, 'basta', 'pending', '2025-10-04 10:24:41'),
(58, 40, 3, 'reschedule', '2025-10-22', '15:00:00', '15:30:00', 'bastaaaaaaa', 'pending', '2025-10-04 10:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favoriteID` int NOT NULL,
  `userID` int NOT NULL,
  `packageID` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`favoriteID`, `userID`, `packageID`, `createdAt`) VALUES
(57, 2, 1000, '2025-07-22 12:50:53'),
(77, 3, 1001, '2025-09-17 20:38:09'),
(79, 3, 1000, '2025-09-23 19:13:58');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(1, 'default', '{\"uuid\":\"d668a98e-4763-404d-8476-11ecbcb17895\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:7;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:24;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759166485,\"delay\":null}', 0, NULL, 1759166485, 1759166485),
(2, 'default', '{\"uuid\":\"4bec9781-40e7-4756-9eac-caea5c473b38\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:8;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:25;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759166570,\"delay\":null}', 0, NULL, 1759166570, 1759166570),
(3, 'default', '{\"uuid\":\"79f2391d-42cc-4083-969a-c4471d2fe2bf\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:8;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:26;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759166701,\"delay\":null}', 0, NULL, 1759166701, 1759166701),
(4, 'default', '{\"uuid\":\"02fee3ad-1433-4126-b74f-24ce2f33c92d\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:1;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:27;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759167648,\"delay\":null}', 0, NULL, 1759167648, 1759167648),
(5, 'default', '{\"uuid\":\"65134a10-ff5a-432b-9118-7d400f280f41\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:1;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:28;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759167982,\"delay\":null}', 0, NULL, 1759167982, 1759167982),
(6, 'default', '{\"uuid\":\"966a8558-c452-4f46-90d7-b967ffe9b28b\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:1;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:29;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759168132,\"delay\":null}', 0, NULL, 1759168132, 1759168132),
(7, 'default', '{\"uuid\":\"2ba50665-a3f4-4118-8c0d-996f5521e2d3\",\"displayName\":\"App\\\\Events\\\\GalleryImagesConfirmed\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":14:{s:5:\\\"event\\\";O:33:\\\"App\\\\Events\\\\GalleryImagesConfirmed\\\":4:{s:6:\\\"userID\\\";i:3;s:9:\\\"bookingID\\\";i:12;s:10:\\\"imageCount\\\";i:1;s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:30;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1759168147,\"delay\":null}', 0, NULL, 1759168147, 1759168147);

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int NOT NULL,
  `senderID` int NOT NULL,
  `senderName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `senderEmail` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `inquiryOptions` enum('pricing','promotions','account','payment','other') COLLATE utf8mb4_general_ci NOT NULL,
  `messageStatus` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`messageID`, `senderID`, `senderName`, `senderEmail`, `message`, `createdAt`, `inquiryOptions`, `messageStatus`) VALUES
(17, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dtesting', '2025-10-03 19:39:27', 'payment', 0),
(18, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dtesting', '2025-10-03 19:40:28', 'payment', 0),
(19, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'sawdaweq', '2025-10-03 19:42:39', 'pricing', 0),
(20, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dawdwqeqw', '2025-10-03 19:45:23', 'other', 0),
(21, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'hello po', '2025-10-03 19:52:06', 'other', 0),
(22, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'gagi ahha bakit may debug', '2025-10-03 19:52:36', 'pricing', 0),
(23, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'ewqewqewq', '2025-10-03 19:53:08', 'other', 0),
(24, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'hopelessly devoted to you', '2025-10-03 19:56:07', 'other', 0),
(25, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dwqewqewqewqdwqdwq', '2025-10-03 19:58:01', 'pricing', 0),
(26, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'real time hahaha taenamo', '2025-10-03 19:58:20', 'other', 0),
(27, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dwadwqe', '2025-10-03 19:59:24', 'other', 0),
(28, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'weqqwewq', '2025-10-03 20:00:08', 'account', 0),
(29, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'ewqewqeqwewq', '2025-10-03 20:01:22', 'other', 0),
(30, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'weqeqweqweqw', '2025-10-03 20:01:34', 'pricing', 0),
(31, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'weqeqwewq', '2025-10-03 20:03:04', 'payment', 0),
(32, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'roaaaaaaaaaaaaa', '2025-10-03 20:06:50', 'other', 0),
(33, 3, 'Nicole Varga', 'nicolevarga19@icloud.com', 'dwqewqeqw', '2025-10-03 20:08:26', 'other', 0);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_06_30_121411_create_personal_access_tokens_table', 1),
(5, '2025_08_03_184406_create_messages_table', 1),
(6, '2025_09_23_162701_add_studio_and_addons_to_booking_table', 2),
(7, '2025_09_23_162724_create_booking_addons_table', 2),
(8, '2025_09_29_175223_create_payment_tables', 2),
(9, '2025_09_29_193109_add_payment_method_to_payment_sessions_table', 2),
(10, '2025_09_30_000000_add_gallery_label_to_notifications_table', 2),
(11, '2025_09_30_120000_add_min_max_quantity_to_package_add_ons_table', 3),
(12, '2025_09_30_210000_modify_payment_sessions_for_payment_first_flow', 3);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notificationID` int NOT NULL,
  `userID` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `label` enum('Booking','Payment','Reschedule','Cancellation','Reminder','Promotion','System','Gallery') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `starred` tinyint(1) DEFAULT '0',
  `bookingID` int NOT NULL,
  `transID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notificationID`, `userID`, `title`, `label`, `message`, `time`, `starred`, `bookingID`, `transID`) VALUES
(48, 3, 'Your photos are ready! 📸', 'Gallery', 'Your digital copies from SFO#5 Selfie for TWO (Booking Date: September 11, 2025 at 11:30 AM) have been added to your gallery available for download.', '2025-09-30 15:19:12', 1, 5, 0),
(49, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#37 Selfie for ONE has been confirmed for September 30, 2025 at 5:00 PM.', '2025-09-30 16:43:46', 1, 37, 0),
(50, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#38 Barkada Groupie has been confirmed for September 30, 2025 at 5:30 PM.', '2025-09-30 16:47:54', 1, 38, 0),
(51, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#39 Selfie for ONE has been confirmed for October 9, 2025 at 12:00 PM.', '2025-09-30 19:55:19', 0, 39, 0),
(52, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#40 Selfie for ONE has been confirmed for October 16, 2025 at 1:30 PM.', '2025-09-30 20:02:57', 0, 40, 0),
(53, 1, 'Payment Successful! 💳', 'Payment', 'Your full payment of ₱957.00 for SFO#48 Squad Groupie (Booking Date: October 23, 2025 at 1:00 PM) has been successfully processed via GCash.', '2025-09-30 21:35:15', 0, 48, 0),
(54, 1, 'Payment Successful! 💳', 'Payment', 'Your full payment of ₱957.00 for SFO#49 Squad Groupie (Booking Date: October 24, 2025 at 5:00 PM) has been successfully processed via GCash.', '2025-09-30 21:39:55', 0, 49, 0),
(55, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#50 Selfie for ONE has been confirmed for October 24, 2025 at 4:30 PM.', '2025-10-04 18:05:55', 0, 50, 0),
(56, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#51 Selfie for ONE has been confirmed for October 25, 2025 at 3:00 PM.', '2025-10-04 18:08:46', 0, 51, 0),
(57, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#52 Selfie for ONE has been confirmed for October 18, 2025 at 3:00 PM.', '2025-10-04 18:19:20', 0, 52, 0),
(58, 3, 'Payment Successful! 💳', 'Payment', 'Your remaining balance payment of ₱507.00 for SFO#51 Selfie for ONE (Booking Date: October 25, 2025 at 3:00 PM) has been successfully processed via Credit/Debit Card.', '2025-10-04 19:48:08', 0, 51, 2),
(59, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#53 Selfie for ONE has been confirmed for October 18, 2025 at 1:30 PM.', '2025-10-04 20:09:07', 0, 53, 0),
(60, 3, 'Payment Successful! 💳', 'Payment', 'Your remaining balance payment of ₱636.00 for SFO#53 Selfie for ONE (Booking Date: October 18, 2025 at 1:30 PM) has been successfully processed via Credit/Debit Card.', '2025-10-04 20:17:41', 0, 53, 3),
(61, 3, 'Payment Successful! 💳', 'Payment', 'Your remaining balance payment of ₱179.00 for SFO#39 Selfie for ONE (Booking Date: October 9, 2025 at 12:00 PM) has been successfully processed via Credit/Debit Card.', '2025-10-04 20:32:10', 0, 39, 4),
(62, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#54 Selfie for TWO has been confirmed for October 31, 2025 at 7:30 PM.', '2025-10-04 20:46:42', 0, 54, 0),
(63, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#55 Selfie for TWO has been confirmed for October 31, 2025 at 12:00 PM.', '2025-10-04 20:50:30', 0, 55, 0),
(64, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#56 Selfie for ONE has been confirmed for October 30, 2025', '2025-10-04 21:08:08', 0, 56, 0),
(65, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#56 Selfie for ONE (Booking Date: October 30, 2025 at 7:30 PM) has been successfully processed via Credit/Debit Card.', '2025-10-04 21:08:09', 0, 56, 5),
(66, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#57 Selfie for ONE has been confirmed for October 26, 2025', '2025-10-04 21:16:03', 0, 57, 0),
(67, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#57 Selfie for ONE (Booking Date: October 26, 2025 at 4:30 PM) has been successfully processed via Credit/Debit Card.', '2025-10-04 21:16:03', 0, 57, 6),
(68, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#58 Selfie for ONE has been confirmed for October 23, 2025', '2025-10-05 20:01:32', 0, 58, 0),
(69, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#58 Selfie for ONE (Booking Date: October 23, 2025 at 12:00 PM) has been successfully processed via Credit/Debit Card.', '2025-10-05 20:01:33', 0, 58, 7),
(70, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#59 Selfie for ONE has been confirmed for October 29, 2025', '2025-10-05 20:28:09', 0, 59, 0),
(71, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#59 Selfie for ONE (Booking Date: October 29, 2025 at 10:30 AM) has been successfully processed via Credit/Debit Card.', '2025-10-05 20:28:09', 0, 59, 8),
(72, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#60 Selfie for ONE has been confirmed for October 21, 2025', '2025-10-05 20:37:47', 0, 60, 0),
(73, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#60 Selfie for ONE (Booking Date: October 21, 2025 at 12:30 PM) has been successfully processed via Credit/Debit Card.', '2025-10-05 20:37:47', 0, 60, 9),
(74, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#61 Selfie for ONE has been confirmed for October 21, 2025', '2025-10-05 21:03:04', 0, 61, 0),
(75, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#61 Selfie for ONE (Booking Date: October 21, 2025 at 6:00 PM) has been successfully processed via Credit/Debit Card.', '2025-10-05 21:03:04', 0, 61, 10),
(76, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#62 Selfie for ONE has been confirmed for October 23, 2025', '2025-10-05 21:03:46', 0, 62, 0),
(77, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#62 Selfie for ONE (Booking Date: October 23, 2025 at 1:30 PM) has been successfully processed via Credit/Debit Card.', '2025-10-05 21:03:46', 0, 62, 11),
(78, 3, 'Booking Confirmed', 'Booking', 'Your booking for SFO#63 Selfie for ONE has been confirmed for November 1, 2025', '2025-10-05 21:10:06', 0, 63, 0),
(79, 3, 'Payment Successful! 💳', 'Payment', 'Your deposit payment of ₱200.00 for SFO#63 Selfie for ONE (Booking Date: November 1, 2025 at 9:00 AM) has been successfully processed via Credit/Debit Card.', '2025-10-05 21:10:06', 0, 63, 12),
(80, 3, 'Payment Successful! 💳', 'Payment', 'Your remaining balance payment of ₱179.00 for SFO#63 Selfie for ONE (Booking Date: November 1, 2025 at 9:00 AM) has been successfully processed via Credit/Debit Card.', '2025-10-05 21:11:08', 0, 63, 13);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `packageID` int NOT NULL,
  `setID` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`packageID`, `setID`, `name`, `description`, `price`, `status`) VALUES
(1000, 1, 'Selfie for ONE', 'Perfect for a solo shoot. It includes 10 minutes of unlimited self-shooting with one backdrop of your choice, plus six digital copies and one printed 4R copy to take home.', 379.00, 1),
(1001, 1, 'Selfie for TWO', 'Selfie for TWO is designed for pairs who want to capture memories together. It comes with 10 minutes of unlimited self-shooting against one backdrop of your choice, along with seven digital copies and two printed 4R copies to keep and share.', 479.00, 1),
(1002, 1, 'Squad Groupie', 'Ideal for small groups or families who want to enjoy a fun shoot together. It includes 20 minutes of unlimited self-shooting with one backdrop of your choice, plus eight digital copies and two printed 4R copies as lasting keepsakes.', 699.00, 1),
(1003, 1, 'Barkada Groupie', 'Perfect for bigger groups who want to capture memories together. It offers 20 minutes of unlimited self-shooting with one backdrop of your choice, along with ten digital copies and two printed 4R copies to take home and share.', 899.00, 1),
(1004, 2, 'Concept Studio', 'Designed for pairs who want a stylish and memorable shoot. It includes 20 minutes of unlimited self-shooting with one plain backdrop of your choice and one concept backdrop, where you can choose between Bohemian Dream for a cozy, earthy vibe or Chingu Pink for a soft and playful aesthetic.', 749.00, 1),
(1005, 5, 'Graduation PREMIUM', 'A 15-minute unlimited photoshoot with a professional photographer using our graduation-themed backdrop. You’ll receive four enhanced photos, plus a set of printed keepsakes: one A4 photo with a glass-to-glass frame, one A4 photo, one 5R print, and four wallet-size photos (2.5” x 3.5”). To top it off, you’ll also get a FREE eco-bag as a special gift.', 1199.00, 1),
(1006, 3, 'Graduation ELITE', 'Designed to make your milestone extra memorable. It includes a 30-minute unlimited photoshoot with a professional photographer, featuring both the graduation-themed backdrop and one plain backdrop of your choice. You’ll receive eight enhanced photos, along with a set of prints: one A4 photo, one A4 photo with a glass-to-glass frame, one 5R print, plus four wallet-size photos in toga attire and four wallet-size photos in formal wear. This package is good for one person only and comes with a FREE eco-bag.', 1499.00, 1),
(1007, 4, 'Studio Rental', 'Suitable for 1 to 4 people and gives you 1 hour of unlimited self-shooting. You’ll have full access to all plain backdrops and can also enjoy one chosen concept backdrop from our aesthetic options such as Bohemian Dream or Chingu Pink. The package includes all digital copies of your photos, with free use of all studio equipment to enhance your shoot. It’s ideal for barkada hangouts, family portraits, maternity shoots, and pre-nup self-photoshoots. You can also avail of add-ons for additional participants at an extra fee.', 1499.00, 1),
(1008, 4, 'Vogue Photoshoot', 'Perfect for individuals who want a professional and creative photoshoot experience. It includes a 1-hour session with a senior female photographer, giving you access to six plain backdrop colors and three unique concepts: Spotlight, Bohemian Dream, and Chingu Pink. You’ll receive all edited and enhanced soft copies, plus one printed 4R photo and one printed A4 photo as keepsakes.', 3999.00, 1),
(1009, 4, 'Kiddie Photoshoot', 'Designed to make your child’s celebration extra special. It includes a 30-minute photoshoot for the celebrant with parents and one sibling, plus an additional 30-minute guided session with a professional photographer who will provide creative directions throughout. You’ll enjoy one chosen themed backdrop along with access to one plain backdrop, and you’ll receive 10 digital copies plus all raw shots for keepsakes. The package also comes with two free prints, free use of themed costumes and props, and the option to add a fun cake smash session (just bring an outfit for it!).30 mins photoshoot with photographer\nCreative directions by photographer included\n1 chosen theme backdrop\nAccess to 1 plain backdrop\n10 digital copies\nAll raw copies will be shared\n2 free prints\nFree use of costume theme\nFree use of props\nBirthday cake smash is allowed (bring outfit for cake smash)\nAvailable Themes: Princess, Safari, Unicorn, Race Car, Boho, Outer Space', 2499.00, 1),
(1010, 4, 'Maternity Photoshoot', 'Designed to beautifully capture this special milestone. It includes a 1-hour photoshoot with a professional photographer, complete with creative direction to guide your poses and ensure stunning results. You’ll have full access to all plain backdrops and concept setups, and you’ll receive all enhanced digital copies from the session. The package also comes with free use of maternity costumes and props, as well as the option to include your family in the photoshoot. To make it extra memorable, a printed copy is also included.', 3999.00, 1),
(1011, 6, 'Newborn Baby Photoshoot', 'Perfect for capturing your baby’s earliest and sweetest moments. It is good for one newborn and two family members and includes a 1-hour photoshoot with a professional photographer, complete with creative direction to guide natural and heartfelt poses. The session features two cozy, homy-themed sets with costumes and props, ensuring timeless and adorable results. You’ll receive all enhanced digital copies, plus a printed copy as a keepsake.', 3999.00, 1),
(1012, 4, 'Initimate Gender Reveal', 'For capturing fun, lively, and unforgettable gender reveal moments. It includes a 1-hour photoshoot with a professional photographer, along with creative direction to guide your poses and shots. The package also comes with static video coverage and a 1-minute edited highlight video to relive the experience. To make the shoot more exciting, props such as paint, balloons, and poppers are provided. You’ll receive all enhanced digital copies from the session plus a printed copy as a keepsake.', 4499.00, 1),
(1013, 3, 'Birthday', 'Perfect for celebrating your special day. It comes with 20 minutes of unlimited self-shooting on a plain backdrop of your choice, plus an additional 5-minute photoshoot with a professional photographer where you can pick one concept. You’ll receive seven digital copies, along with two free printed 4R copies, a birthday sash and headband, and two free number balloons to make the celebration extra memorable.', 749.00, 1),
(1014, 4, 'Family Photoshoot', 'Designed to capture warm and timeless memories with your loved ones. It is good for up to five family members, with the option to add more members for a complete family experience. The package includes a 1-hour photoshoot with a professional photographer, along with creative direction to help bring out natural and genuine moments. You’ll have access to all plain backdrops and one chosen concept backdrop, plus props to enhance the shoot. All enhanced digital copies are included, along with printed copies to treasure and share.', 2999.00, 1),
(1015, 4, 'Pre Nup Photoshoot', 'For celebrating love and togetherness. It is good for one couple, with the option to add family members to make the session more special. The package includes a 1-hour photoshoot with a professional photographer, guided by creative direction to capture natural and heartfelt moments. You’ll enjoy access to all plain backdrops and one chosen concept backdrop, plus all enhanced digital copies and printed copies as lasting keepsakes.', 2999.00, 1),
(1016, 1, 'Student Groupie', 'Specially designed for barkadas or schoolmates who want to capture fun memories together. It is good for up to 10 people and includes 50 minutes of unlimited self-shooting with one chosen backdrop from seven available options. You’ll receive 10 digital copies and 4 printed 4R photos—three portrait prints and one band shot—as lasting keepsakes. This package is exclusive to students, so a valid school ID for the current school year must be presented.', 1499.00, 1),
(1017, 3, 'Solo Graduation', 'Perfect for solo graduates who want to capture this milestone in style. It includes 20 minutes of unlimited self-shooting and posing on a graduation-themed backdrop paired with one plain backdrop. You’ll also enjoy free use of a full toga set with academic hood and cap, or a Barong/Filipiniana for a complete graduation look. The package comes with seven digital copies and two free printed copies as timeless keepsakes.', 1749.00, 1),
(1018, 3, 'Barkada Graduation', 'Perfect for celebrating this milestone with friends or family. It includes 30 minutes of unlimited self-shooting and posing on a graduation-themed backdrop paired with one plain backdrop. You’ll also enjoy free use of the full toga set with academic hood, cap, and either a Barong or Filipiniana for an authentic graduation look. The package comes with seven digital copies and four free printed copies as lasting souvenirs.', 1999.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `package_add_ons`
--

CREATE TABLE `package_add_ons` (
  `addOnID` int NOT NULL,
  `addOn` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `addOnPrice` decimal(10,2) NOT NULL,
  `type` enum('single','multiple','dropdown','') COLLATE utf8mb4_general_ci NOT NULL,
  `min_quantity` int NOT NULL,
  `max_quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_add_ons`
--

INSERT INTO `package_add_ons` (`addOnID`, `addOn`, `addOnPrice`, `type`, `min_quantity`, `max_quantity`) VALUES
(10, 'Addl Portrait Picture', 49.00, 'multiple', 1, 10),
(20, 'Addl Pax', 129.00, 'multiple', 1, 5),
(30, 'Addl Grid Picture', 69.00, 'multiple', 1, 5),
(40, 'Addl A4 Picture', 129.00, 'multiple', 1, 5),
(50, 'Addl Backdrop', 129.00, 'dropdown', 1, 1),
(60, 'All digital copies', 199.00, 'single', 1, 1),
(70, 'Addl 5 mins ', 129.00, 'single', 1, 1),
(80, 'Photographer service for 20 mins', 599.00, 'single', 1, 1),
(90, 'Photographer service for 1 hr', 1699.00, 'single', 1, 1),
(100, 'Professional Hair & Make up', 1699.00, 'single', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `package_add_on_mapping`
--

CREATE TABLE `package_add_on_mapping` (
  `packageID` int NOT NULL,
  `addOnID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_add_on_mapping`
--

INSERT INTO `package_add_on_mapping` (`packageID`, `addOnID`) VALUES
(1000, 10),
(1000, 30),
(1000, 40),
(1000, 50),
(1000, 60),
(1000, 70),
(1001, 10),
(1001, 30),
(1001, 40),
(1001, 50),
(1001, 60),
(1001, 70),
(1002, 10),
(1002, 20),
(1002, 30),
(1002, 40),
(1002, 50),
(1002, 60),
(1002, 70),
(1003, 20),
(1003, 10),
(1003, 30),
(1003, 40),
(1003, 50),
(1003, 60),
(1003, 70),
(1016, 20),
(1016, 10),
(1016, 30),
(1016, 40),
(1016, 50),
(1016, 60),
(1016, 70),
(1004, 20),
(1004, 10),
(1004, 30),
(1004, 50),
(1004, 40),
(1004, 70),
(1004, 60),
(1013, 20),
(1013, 10),
(1013, 30),
(1013, 40),
(1013, 50),
(1013, 60),
(1013, 70),
(1018, 10),
(1018, 30),
(1018, 40),
(1018, 50),
(1018, 70),
(1018, 60),
(1007, 10),
(1007, 20),
(1007, 30),
(1007, 40),
(1007, 50),
(1007, 60),
(1007, 70),
(1005, 10),
(1005, 30),
(1005, 40),
(1005, 80),
(1005, 90),
(1005, 60),
(1005, 100),
(1005, 70),
(1006, 10),
(1006, 30),
(1006, 40),
(1006, 50),
(1006, 60),
(1006, 80),
(1006, 90),
(1006, 100),
(1006, 70),
(1008, 10),
(1008, 30),
(1008, 40),
(1008, 50),
(1008, 60),
(1008, 80),
(1008, 90),
(1008, 100),
(1008, 70),
(1009, 10),
(1009, 30),
(1009, 40),
(1009, 50),
(1009, 60),
(1009, 80),
(1009, 90),
(1009, 70),
(1010, 10),
(1010, 20),
(1010, 30),
(1010, 40),
(1010, 50),
(1010, 60),
(1010, 70),
(1010, 80),
(1010, 90),
(1010, 100),
(1011, 10),
(1011, 30),
(1011, 40),
(1011, 80),
(1011, 60),
(1011, 70),
(1011, 90),
(1012, 10),
(1012, 30),
(1012, 40),
(1012, 80),
(1012, 60),
(1012, 70),
(1012, 90),
(1012, 50),
(1014, 20),
(1014, 10),
(1014, 30),
(1014, 40),
(1014, 80),
(1014, 60),
(1014, 70),
(1014, 90),
(1014, 50),
(1015, 10),
(1015, 30),
(1015, 40),
(1015, 80),
(1015, 60),
(1015, 70),
(1015, 90),
(1015, 100),
(1015, 50),
(1017, 10),
(1017, 30),
(1017, 40),
(1017, 80),
(1017, 90),
(1017, 60),
(1017, 70),
(1017, 50),
(1017, 100);

-- --------------------------------------------------------

--
-- Table structure for table `package_concept`
--

CREATE TABLE `package_concept` (
  `conceptID` int NOT NULL,
  `backdrop` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `conceptType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_concept`
--

INSERT INTO `package_concept` (`conceptID`, `backdrop`, `conceptType`) VALUES
(100, 'Chingu Pink', 'Studio'),
(101, 'Bohemian Dream', 'Studio'),
(102, 'Spotlight', 'Studio'),
(103, 'Graduation', 'Graduation'),
(104, 'WHITE', 'Plain'),
(105, 'GRAY', 'Plain'),
(106, 'BLACK', 'Plain'),
(107, 'PINK', 'Plain'),
(108, 'BEIGE', 'Plain'),
(109, 'LAVENDER', 'Plain'),
(110, 'Princess', 'Themed'),
(111, 'Safari', 'Themed'),
(112, 'Unicorn', 'Themed'),
(113, 'Race Car', 'Themed'),
(114, 'Boho', 'Themed'),
(115, 'Outer Space', 'Themed');

-- --------------------------------------------------------

--
-- Table structure for table `package_images`
--

CREATE TABLE `package_images` (
  `imageID` int NOT NULL,
  `packageID` int NOT NULL,
  `imagePath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_images`
--

INSERT INTO `package_images` (`imageID`, `packageID`, `imagePath`) VALUES
(1, 1000, 'storage/packages/selfieforone/sone1.png'),
(2, 1000, 'storage/packages/selfieforone/sone2.png'),
(3, 1000, 'storage/packages/selfieforone/sone3.png'),
(4, 1000, 'storage/packages/selfieforone/sone4.png'),
(5, 1000, 'storage/packages/selfieforone/sone5.png'),
(6, 1001, 'storage/packages/selfiefortwo/stwo1.png'),
(7, 1001, 'storage/packages/selfiefortwo/stwo2.png'),
(8, 1001, 'storage/packages/selfiefortwo/stwo3.png'),
(9, 1001, 'storage/packages/selfiefortwo/stwo4.png'),
(10, 1001, 'storage/packages/selfiefortwo/stwo5.png'),
(11, 1002, 'storage/packages/squadgroupie/squad1.jpg'),
(12, 1002, 'storage/packages/squadgroupie/squad2.jpg'),
(13, 1002, 'storage/packages/squadgroupie/squad3.jpg'),
(14, 1002, 'storage/packages/squadgroupie/squad4.jpg'),
(15, 1003, 'storage/packages/barkadagroupie/barkada1.jpg'),
(16, 1003, 'storage/packages/barkadagroupie/barkada2.jpg'),
(17, 1003, 'storage/packages/barkadagroupie/barkada3.jpg'),
(18, 1004, 'storage/packages/conceptstudio/cstudio1.jpg'),
(19, 1004, 'storage/packages/conceptstudio/cstudio2.jpg'),
(20, 1004, 'storage/packages/conceptstudio/cstudio3.jpg'),
(21, 1004, 'storage/packages/conceptstudio/cstudio4.jpg'),
(22, 1005, 'storage/packages/graduationpremium/premium1.jpg'),
(23, 1005, 'storage/packages/graduationpremium/premium2.jpg'),
(24, 1005, 'storage/packages/graduationpremium/premium3.jpg'),
(25, 1006, 'storage/packages/graduationelite/elite1.jpg'),
(26, 1006, 'storage/packages/graduationelite/elite2.jpg'),
(27, 1006, 'storage/packages/graduationelite/elite3.jpg'),
(28, 1006, 'storage/packages/graduationelite/elite4.jpg'),
(29, 1006, 'storage/packages/graduationelite/elite5.jpg'),
(30, 1007, 'storage/packages/studiorental/studio1.jpg'),
(31, 1007, 'storage/packages/studiorental/studio2.jpg'),
(32, 1007, 'storage/packages/studiorental/studio3.jpg'),
(33, 1007, 'storage/packages/studiorental/studio4.jpg'),
(34, 1007, 'storage/packages/studiorental/studio5.jpg'),
(35, 1008, 'storage/packages/vogue/vogue1.jpg'),
(36, 1008, 'storage/packages/vogue/vogue2.jpg'),
(37, 1008, 'storage/packages/vogue/vogue3.jpg'),
(38, 1008, 'storage/packages/vogue/vogue4.jpg'),
(39, 1008, 'storage/packages/vogue/vogue5.jpg'),
(40, 1008, 'storage/packages/vogue/vogue6.jpg'),
(41, 1009, 'storage/packages/kiddie/kiddie1.jpg'),
(42, 1009, 'storage/packages/kiddie/kiddie2.jpg'),
(43, 1009, 'storage/packages/kiddie/kiddie3.jpg'),
(44, 1009, 'storage/packages/kiddie/kiddie4.jpg'),
(45, 1009, 'storage/packages/kiddie/kiddie5.jpg'),
(46, 1009, 'storage/packages/kiddie/kiddie6.jpg'),
(47, 1010, 'storage/packages/maternity/maternity1.png'),
(48, 1010, 'storage/packages/maternity/maternity2.png'),
(49, 1010, 'storage/packages/maternity/maternity3.png'),
(50, 1010, 'storage/packages/maternity/maternity4.png'),
(51, 1010, 'storage/packages/maternity/maternity5.png'),
(52, 1011, 'storage/packages/newbornbaby/newborn1.jpg'),
(53, 1011, 'storage/packages/newbornbaby/newborn2.jpg'),
(54, 1011, 'storage/packages/newbornbaby/newborn3.jpg'),
(55, 1011, 'storage/packages/newbornbaby/newborn4.jpg'),
(56, 1011, 'storage/packages/newbornbaby/newborn5.jpg'),
(57, 1012, 'storage/packages/intimategenderreveal/gender1.jpg'),
(58, 1012, 'storage/packages/intimategenderreveal/gender2.jpg'),
(59, 1013, 'storage/packages/birthday/birthday1.jpg'),
(60, 1013, 'storage/packages/birthday/birthday2.jpg'),
(61, 1013, 'storage/packages/birthday/birthday3.jpg'),
(62, 1013, 'storage/packages/birthday/birthday4.jpg'),
(63, 1013, 'storage/packages/birthday/birthday5.jpg'),
(64, 1013, 'storage/packages/birthday/birthday6.jpg'),
(65, 1014, 'storage/packages/family/fam1.jpg'),
(66, 1014, 'storage/packages/family/fam2.jpg'),
(68, 1014, 'storage/packages/family/fam4.jpg'),
(69, 1014, 'storage/packages/family/fam5.jpg'),
(70, 1014, 'storage/packages/family/fam6.jpg'),
(71, 1014, 'storage/packages/family/fam7.jpg'),
(72, 1014, 'storage/packages/family/fam8.jpg'),
(73, 1014, 'storage/packages/family/fam9.png'),
(74, 1014, 'storage/packages/family/fam10.jpg'),
(75, 1015, 'storage/packages/prenup/prenup1.jpg'),
(76, 1015, 'storage/packages/prenup/prenup2.jpg'),
(77, 1016, 'storage/packages/studentgroupie/studentgroupie1.png'),
(78, 1016, 'storage/packages/studentgroupie/studentgroupie2.png'),
(79, 1016, 'storage/packages/studentgroupie/studentgroupie3.png'),
(80, 1016, 'storage/packages/studentgroupie/studentgroupie4.png'),
(81, 1017, 'storage/packages/solograduation/solo1.jpg'),
(82, 1017, 'storage/packages/solograduation/solo2.jpg'),
(83, 1018, 'storage/packages/barkadagraduation/barkadagrad1.png'),
(84, 1018, 'storage/packages/barkadagraduation/barkadagrad2.png'),
(85, 1018, 'storage/packages/barkadagraduation/barkadagrad3.png'),
(86, 1018, 'storage/packages/barkadagraduation/barkadagrad4.png'),
(87, 1018, 'storage/packages/barkadagraduation/barkadagrad5.png');

-- --------------------------------------------------------

--
-- Table structure for table `package_sets`
--

CREATE TABLE `package_sets` (
  `setID` int NOT NULL,
  `setName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_sets`
--

INSERT INTO `package_sets` (`setID`, `setName`) VALUES
(1, 'Plain Only'),
(2, 'Only One'),
(3, 'Fixed'),
(4, 'All'),
(5, 'Assigned'),
(6, 'Concept Only');

-- --------------------------------------------------------

--
-- Table structure for table `package_sets_mapping`
--

CREATE TABLE `package_sets_mapping` (
  `setID` int NOT NULL,
  `conceptID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_sets_mapping`
--

INSERT INTO `package_sets_mapping` (`setID`, `conceptID`) VALUES
(1, 104),
(1, 105),
(1, 106),
(1, 107),
(1, 108),
(1, 109),
(2, 100),
(2, 101),
(2, 104),
(2, 105),
(2, 106),
(2, 107),
(2, 108),
(2, 109),
(4, 100),
(4, 101),
(4, 102),
(4, 104),
(4, 105),
(4, 106),
(4, 103),
(4, 107),
(4, 109),
(4, 110),
(4, 111),
(4, 112),
(4, 113),
(4, 114),
(4, 115),
(3, 100),
(3, 101),
(3, 102),
(3, 103),
(3, 104),
(3, 105),
(3, 106),
(3, 107),
(3, 108),
(3, 109),
(6, 100),
(6, 101);

-- --------------------------------------------------------

--
-- Table structure for table `package_types`
--

CREATE TABLE `package_types` (
  `typeID` int NOT NULL,
  `typeName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_types`
--

INSERT INTO `package_types` (`typeID`, `typeName`) VALUES
(1, 'Self Shoot'),
(2, 'Studio'),
(3, 'Photoshoot'),
(4, 'Graduation');

-- --------------------------------------------------------

--
-- Table structure for table `package_type_mapping`
--

CREATE TABLE `package_type_mapping` (
  `packageID` int NOT NULL,
  `typeID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_type_mapping`
--

INSERT INTO `package_type_mapping` (`packageID`, `typeID`) VALUES
(1000, 1),
(1001, 1),
(1002, 1),
(1003, 1),
(1004, 1),
(1004, 2),
(1005, 3),
(1005, 4),
(1006, 3),
(1006, 4),
(1007, 2),
(1008, 3),
(1009, 3),
(1010, 3),
(1011, 3),
(1012, 3),
(1013, 1),
(1013, 2),
(1014, 3),
(1015, 3),
(1016, 1),
(1017, 3),
(1017, 4),
(1018, 1),
(1018, 3),
(1018, 4),
(1007, 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_sessions`
--

CREATE TABLE `payment_sessions` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED DEFAULT NULL,
  `checkout_session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_type` enum('deposit','full','remaining') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method_used` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','failed','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `booking_data` longtext COLLATE utf8mb4_unicode_ci,
  `paymongo_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_sessions`
--

INSERT INTO `payment_sessions` (`id`, `booking_id`, `checkout_session_id`, `payment_type`, `payment_method_used`, `amount`, `status`, `booking_data`, `paymongo_payment_id`, `created_at`, `updated_at`) VALUES
(1, 28, 'cs_eWcev5rko67AhjX854A9fUpC', 'full', NULL, 428.00, 'pending', NULL, NULL, '2025-09-29 18:16:12', '2025-09-29 18:16:12'),
(2, 29, 'cs_UvcDuWivEG2amrqy48MmuJ4b', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-29 18:28:04', '2025-09-29 18:28:04'),
(3, 30, 'cs_6SB22PZhykyDwViTcu6aj8du', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-29 18:56:29', '2025-09-29 18:56:29'),
(4, 31, 'cs_4SL8TNHPmngfJGxYDtXCyYdk', 'full', NULL, 828.00, 'pending', NULL, NULL, '2025-09-29 19:04:37', '2025-09-29 19:04:37'),
(5, 32, 'cs_LmgzFZ8Hv345FTQk89jz4m6s', 'full', NULL, 748.00, 'pending', NULL, NULL, '2025-09-29 19:10:16', '2025-09-29 19:10:16'),
(6, 33, 'cs_GQmmryipdNtMDN7tQ8D3uqwu', 'full', NULL, 428.00, 'pending', NULL, NULL, '2025-09-29 19:15:35', '2025-09-29 19:15:35'),
(7, 34, 'cs_dGtLVkJP52gCnYExoivohr23', 'full', 'PayMongo - PayMongo', 828.00, 'completed', NULL, NULL, '2025-09-29 19:17:08', '2025-09-29 19:22:41'),
(8, 35, 'cs_ngwhqk4NK7LZrTRLADmCSz4P', 'full', NULL, 428.00, 'pending', NULL, NULL, '2025-09-29 19:23:34', '2025-09-29 19:23:34'),
(9, 36, 'cs_DQTUJnUqxszoitBUHjmXLTv3', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 06:51:45', '2025-09-30 06:51:45'),
(10, 37, 'cs_GFW811UmYocv2zsjZJ7UARRS', 'full', NULL, 647.00, 'pending', NULL, NULL, '2025-09-30 08:43:48', '2025-09-30 08:43:48'),
(11, 38, 'cs_dHpEMyz8TaBPHYegnw1ag88W', 'full', NULL, 1384.00, 'pending', NULL, NULL, '2025-09-30 08:47:56', '2025-09-30 08:47:56'),
(12, 39, 'cs_3f7KFeSBAh12VFHiDgUqzxd2', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 11:55:27', '2025-09-30 11:55:27'),
(13, 40, 'cs_MLacDSjpQy8GqfYQLjhqWhAi', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 12:03:08', '2025-09-30 12:03:08'),
(14, 41, 'cs_26Z7u4H8wViRPC1t7Rx53X7m', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 12:45:01', '2025-09-30 12:45:01'),
(15, 42, 'cs_kUsLueuZf3N5zr8Qdy8S9VBM', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 12:47:25', '2025-09-30 12:47:25'),
(16, 43, 'cs_Uf5GP5mSy5Ta7qkuGnASfaZp', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 12:48:36', '2025-09-30 12:48:36'),
(17, 44, 'cs_5yNAxNxMmtYuKZG5q4dtFsyT', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 12:49:04', '2025-09-30 12:49:04'),
(18, 45, 'cs_YxUffaDhZNz7VCVvSWwMj7S4', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-09-30 12:49:50', '2025-09-30 12:49:50'),
(19, 46, 'cs_95zBEqVwAWvdCnzz7gKn3iz9', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 12:56:05', '2025-09-30 12:56:05'),
(20, 46, 'cs_VruM6wbxtab1BRmeEkhwekwx', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 12:56:07', '2025-09-30 12:56:07'),
(21, 47, 'cs_rgvezhxcxbUbJuEtTyPNvSdU', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 13:05:05', '2025-09-30 13:05:05'),
(22, 47, 'cs_wVxoyn1TToQ3tap7LERqyJYZ', 'full', NULL, 936.00, 'pending', NULL, NULL, '2025-09-30 13:05:16', '2025-09-30 13:05:16'),
(23, 48, 'cs_xEV7HJm2mSVy39paAxFpNemu', 'full', 'GCash', 1156.00, 'completed', '{\"package_id\":\"1002\",\"booking_date\":\"2025-10-23\",\"time_slot\":\"01:00 PM\",\"name\":\"Nicole Varga\",\"contact\":\"09155467893\",\"email\":\"nicolevarga19@icloud.com\",\"address\":\"Guiguinto Bulacan\",\"payment_mode\":\"PayMongo\",\"payment_type\":\"full\",\"addons\":[{\"id\":\"70\",\"value\":1,\"type\":\"checkbox\",\"price\":129,\"option\":null},{\"id\":\"60\",\"value\":1,\"type\":\"checkbox\",\"price\":199,\"option\":null},{\"id\":\"50\",\"value\":1,\"type\":\"dropdown\",\"price\":129,\"option\":\"WHITE\"}],\"studio_selection\":{\"id\":\"white\",\"label\":\"WHITE\",\"type\":\"studioA\",\"hex\":\"#f4f6f1\"},\"total_amount\":1156,\"amount_to_pay\":1156}', 'pi_test_68dbdc9373900', '2025-09-30 13:20:37', '2025-09-30 13:35:15'),
(24, 49, 'cs_AyQ7xsh4ShcgLyZqkezFeD8E', 'full', 'GCash', 957.00, 'completed', '{\"package_id\":\"1002\",\"booking_date\":\"2025-10-24\",\"time_slot\":\"05:00 PM\",\"name\":\"Nicole Varga\",\"contact\":\"09155467893\",\"email\":\"nicolevarga19@icloud.com\",\"address\":\"Guiguinto Bulacan\",\"payment_mode\":\"PayMongo\",\"payment_type\":\"full\",\"addons\":[{\"id\":\"50\",\"value\":1,\"type\":\"dropdown\",\"price\":129,\"option\":\"WHITE\"},{\"id\":\"70\",\"value\":1,\"type\":\"checkbox\",\"price\":129,\"option\":null}],\"studio_selection\":{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"},\"total_amount\":957,\"amount_to_pay\":957}', 'pi_test_68dbddab5171b', '2025-09-30 13:21:37', '2025-09-30 13:39:55'),
(25, NULL, 'cs_BBrdDkUhFUQPUoJKXLbTEeRN', 'full', NULL, 1156.00, 'pending', '{\"package_id\":\"1002\",\"booking_date\":\"2025-10-09\",\"time_slot\":\"09:30 AM\",\"name\":\"Nicole Varga\",\"contact\":\"09155467893\",\"email\":\"nicolevarga19@icloud.com\",\"address\":\"Guiguinto Bulacan\",\"payment_mode\":\"PayMongo\",\"payment_type\":\"full\",\"addons\":[{\"id\":\"50\",\"value\":1,\"type\":\"dropdown\",\"price\":129,\"option\":\"WHITE\"},{\"id\":\"60\",\"value\":1,\"type\":\"checkbox\",\"price\":199,\"option\":null},{\"id\":\"70\",\"value\":1,\"type\":\"checkbox\",\"price\":129,\"option\":null}],\"studio_selection\":{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"},\"total_amount\":1156,\"amount_to_pay\":1156}', NULL, '2025-09-30 13:27:29', '2025-09-30 13:27:29'),
(26, 50, 'cs_BCwai8z4vvtKdJV8ybJdvevB', 'full', NULL, 707.00, 'pending', NULL, NULL, '2025-10-04 10:06:04', '2025-10-04 10:06:04'),
(27, 51, 'cs_JcW4UxwD2fsJnJmkbx8kyMqo', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-10-04 10:08:48', '2025-10-04 10:08:48'),
(28, 52, 'cs_PpnVpxJpKwb13a49fBMPHEMQ', 'full', NULL, 508.00, 'pending', NULL, NULL, '2025-10-04 10:19:27', '2025-10-04 10:19:27'),
(29, 39, 'cs_v4PR5X5Ere8DngMcYBiZ8e2x', 'remaining', NULL, 200.00, 'pending', NULL, NULL, '2025-10-04 10:49:44', '2025-10-04 10:49:44'),
(30, 39, 'cs_fxomYgeqnqt5tQV8nZnGJzKd', 'remaining', NULL, 179.00, 'pending', NULL, NULL, '2025-10-04 10:53:41', '2025-10-04 10:53:41'),
(31, 51, 'cs_mkwF9sADqqzBq6nvsHYJJMVQ', 'remaining', NULL, 507.00, 'pending', NULL, NULL, '2025-10-04 10:54:05', '2025-10-04 10:54:05'),
(32, 51, 'cs_v7wEPgp6sdushqS7RzuFWwJs', 'remaining', 'Credit/Debit Card', 507.00, 'completed', NULL, 'pi_test_68e10977d7e06', '2025-10-04 11:13:49', '2025-10-04 11:48:07'),
(33, 39, 'cs_ifwANbj9uaKSyqqx33DCMYxq', 'remaining', NULL, 179.00, 'pending', NULL, NULL, '2025-10-04 11:51:38', '2025-10-04 11:51:38'),
(34, 39, 'cs_RrAjPKKRxPMQ6Pe5udiKTE5H', 'remaining', NULL, 179.00, 'pending', NULL, NULL, '2025-10-04 12:04:48', '2025-10-04 12:04:48'),
(35, 53, 'cs_6nkLi26ghPdU9Ev5vwEH5wBV', 'deposit', NULL, 200.00, 'pending', NULL, NULL, '2025-10-04 12:09:10', '2025-10-04 12:09:10'),
(36, 53, 'cs_yT8EguLZ7zBDhHXsEQKMpWfb', 'remaining', 'Credit/Debit Card', 636.00, 'completed', NULL, 'pi_test_68e110650ee83', '2025-10-04 12:10:05', '2025-10-04 12:17:41'),
(37, 39, 'cs_ztTUSkCXHniu1LZBrwFmLzrb', 'remaining', 'Credit/Debit Card', 179.00, 'completed', '{\"return_url\":\"\\/client\\/appointments\"}', 'pi_test_68e113cad33ed', '2025-10-04 12:26:11', '2025-10-04 12:32:10'),
(38, 55, 'cs_MVoDBLi63Hn46UYw3q5nyvta', 'deposit', NULL, 200.00, 'pending', '{\"return_url\":\"\\/client\\/packages\"}', NULL, '2025-10-04 12:50:34', '2025-10-04 12:50:34'),
(39, 56, 'cs_7WNaxsnyt7FtnKMfRCvLCUvv', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-30\",\"time_slot\":\"07:30 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":129,\"total\":508,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[{\"id\":\"50\",\"value\":1,\"type\":\"dropdown\",\"price\":129,\"option\":\"WHITE\"}],\"studio_selection\":{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_test_68e11c38e5f2c', '2025-10-04 13:02:27', '2025-10-04 13:08:08'),
(40, 57, 'cs_tJPeviCrpV5L6RwJaLWeLT9H', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-26\",\"time_slot\":\"04:30 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_test_68e11e131c1a1', '2025-10-04 13:12:43', '2025-10-04 13:16:03'),
(41, 58, 'cs_x2tuaYe2V6o35hxgPS7WU4Gm', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-23\",\"time_slot\":\"12:00 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"black\",\"label\":\"BLACK\",\"type\":\"studioA\",\"hex\":\"#272323\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_test_68e25e1c07a21', '2025-10-05 11:55:21', '2025-10-05 12:01:32'),
(42, 59, 'cs_vZ7gm3UKnQ1ySLF32dgxBPBB', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-29\",\"time_slot\":\"10:30 AM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"pink\",\"label\":\"PINK\",\"type\":\"studioA\",\"hex\":\"#facfd7\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_auto_68e26459cf6d2', '2025-10-05 12:25:18', '2025-10-05 12:28:09'),
(43, 60, 'cs_rnvRPfKQfADybaEBfJ3wzoDm', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-21\",\"time_slot\":\"12:30 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"lavender\",\"label\":\"LAVENDER\",\"type\":\"studioA\",\"hex\":\"#8d84be\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_auto_68e2669bd6888', '2025-10-05 12:31:14', '2025-10-05 12:37:47'),
(44, 62, 'cs_P9YRJ9JrmvfYXHHRq3Wskfnx', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-23\",\"time_slot\":\"01:30 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"beige\",\"label\":\"BEIGE\",\"type\":\"studioA\",\"hex\":\"#cfb5a4\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_test_68e26cb24e4cd', '2025-10-05 12:45:18', '2025-10-05 13:03:46'),
(45, 61, 'cs_Fu32RCqGafjwYWZ646zqjXR8', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-10-21\",\"time_slot\":\"06:00 PM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_test_68e26c88c1b23', '2025-10-05 12:54:10', '2025-10-05 13:03:04'),
(46, 63, 'cs_q8Tm21549S12swjXuWg7hJKd', 'deposit', 'Credit/Debit Card', 200.00, 'completed', '{\"user_id\":3,\"package_id\":\"1000\",\"package_name\":\"Selfie for ONE\",\"booking_date\":\"2025-11-01\",\"time_slot\":\"09:00 AM\",\"customer_name\":\"Nicole Varga\",\"customer_contact\":\"09155467893\",\"customer_email\":\"nicolevarga19@icloud.com\",\"customer_address\":\"Guiguinto Bulacan\",\"package_price\":379,\"addons_total\":0,\"total\":379,\"payment_type\":\"deposit\",\"payment_amount\":200,\"addons\":[],\"studio_selection\":{\"id\":\"gray\",\"label\":\"GRAY\",\"type\":\"studioA\",\"hex\":\"#cccbcb\"},\"return_url\":\"\\/client\\/packages\"}', 'pi_auto_68e26e2eb69ca', '2025-10-05 13:09:50', '2025-10-05 13:10:06'),
(47, 63, 'cs_QPh5mKLDs7GtQTSpJJHmmMKy', 'remaining', 'Credit/Debit Card', 179.00, 'completed', '{\"return_url\":\"\\/client\\/appointments\"}', 'pi_auto_68e26e6c7f13c', '2025-10-05 13:10:55', '2025-10-05 13:11:08');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `payment_type` enum('deposit','full','remaining') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('completed','failed','pending','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `transaction_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `booking_id`, `payment_type`, `amount`, `payment_method`, `status`, `transaction_date`, `payment_details`, `created_at`, `updated_at`) VALUES
(1, 34, 'full', 0.00, 'PayMongo - PayMongo', 'completed', '2025-09-29 19:22:41', '{\"id\":\"cs_dGtLVkJP52gCnYExoivohr23\",\"type\":\"checkout_session\",\"attributes\":{\"payments\":[{\"id\":\"pi_test_123456789\",\"attributes\":{\"amount\":82800,\"currency\":\"PHP\",\"status\":\"paid\"}}],\"payment_method_used\":\"gcash\"}}', '2025-09-29 19:22:41', '2025-09-29 19:22:41'),
(2, 51, 'remaining', 507.00, 'Credit/Debit Card', 'completed', '2025-10-04 11:48:07', '{\"paymongo_payment_id\":\"pi_test_68e10977d7e06\",\"checkout_session_id\":\"cs_v7wEPgp6sdushqS7RzuFWwJs\",\"payment_session_id\":32,\"webhook_data\":{\"id\":\"cs_v7wEPgp6sdushqS7RzuFWwJs\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e10977d7e06\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":50700}]}}}', '2025-10-04 11:48:07', '2025-10-04 11:48:07'),
(3, 53, 'remaining', 636.00, 'Credit/Debit Card', 'completed', '2025-10-04 12:17:41', '{\"paymongo_payment_id\":\"pi_test_68e110650ee83\",\"checkout_session_id\":\"cs_yT8EguLZ7zBDhHXsEQKMpWfb\",\"payment_session_id\":36,\"webhook_data\":{\"id\":\"cs_yT8EguLZ7zBDhHXsEQKMpWfb\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e110650ee83\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":63600}]}}}', '2025-10-04 12:17:41', '2025-10-04 12:17:41'),
(4, 39, 'remaining', 179.00, 'Credit/Debit Card', 'completed', '2025-10-04 12:32:10', '{\"paymongo_payment_id\":\"pi_test_68e113cad33ed\",\"checkout_session_id\":\"cs_ztTUSkCXHniu1LZBrwFmLzrb\",\"payment_session_id\":37,\"webhook_data\":{\"id\":\"cs_ztTUSkCXHniu1LZBrwFmLzrb\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e113cad33ed\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":17900}]}}}', '2025-10-04 12:32:10', '2025-10-04 12:32:10'),
(5, 56, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-04 13:08:09', '{\"paymongo_payment_id\":\"pi_test_68e11c38e5f2c\",\"checkout_session_id\":\"cs_7WNaxsnyt7FtnKMfRCvLCUvv\",\"payment_session_id\":39,\"webhook_data\":{\"id\":\"cs_7WNaxsnyt7FtnKMfRCvLCUvv\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e11c38e5f2c\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-04 13:08:09', '2025-10-04 13:08:09'),
(6, 57, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-04 13:16:03', '{\"paymongo_payment_id\":\"pi_test_68e11e131c1a1\",\"checkout_session_id\":\"cs_tJPeviCrpV5L6RwJaLWeLT9H\",\"payment_session_id\":40,\"webhook_data\":{\"id\":\"cs_tJPeviCrpV5L6RwJaLWeLT9H\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e11e131c1a1\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-04 13:16:03', '2025-10-04 13:16:03'),
(7, 58, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 12:01:33', '{\"paymongo_payment_id\":\"pi_test_68e25e1c07a21\",\"checkout_session_id\":\"cs_x2tuaYe2V6o35hxgPS7WU4Gm\",\"payment_session_id\":41,\"webhook_data\":{\"id\":\"cs_x2tuaYe2V6o35hxgPS7WU4Gm\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e25e1c07a21\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 12:01:33', '2025-10-05 12:01:33'),
(8, 59, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 12:28:09', '{\"paymongo_payment_id\":\"pi_auto_68e26459cf6d2\",\"checkout_session_id\":\"cs_vZ7gm3UKnQ1ySLF32dgxBPBB\",\"payment_session_id\":42,\"webhook_data\":{\"id\":\"cs_vZ7gm3UKnQ1ySLF32dgxBPBB\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_auto_68e26459cf6d2\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 12:28:09', '2025-10-05 12:28:09'),
(9, 60, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 12:37:47', '{\"paymongo_payment_id\":\"pi_auto_68e2669bd6888\",\"checkout_session_id\":\"cs_rnvRPfKQfADybaEBfJ3wzoDm\",\"payment_session_id\":43,\"webhook_data\":{\"id\":\"cs_rnvRPfKQfADybaEBfJ3wzoDm\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_auto_68e2669bd6888\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 12:37:47', '2025-10-05 12:37:47'),
(10, 61, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 13:03:04', '{\"paymongo_payment_id\":\"pi_test_68e26c88c1b23\",\"checkout_session_id\":\"cs_Fu32RCqGafjwYWZ646zqjXR8\",\"payment_session_id\":45,\"webhook_data\":{\"id\":\"cs_Fu32RCqGafjwYWZ646zqjXR8\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e26c88c1b23\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 13:03:04', '2025-10-05 13:03:04'),
(11, 62, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 13:03:46', '{\"paymongo_payment_id\":\"pi_test_68e26cb24e4cd\",\"checkout_session_id\":\"cs_P9YRJ9JrmvfYXHHRq3Wskfnx\",\"payment_session_id\":44,\"webhook_data\":{\"id\":\"cs_P9YRJ9JrmvfYXHHRq3Wskfnx\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_test_68e26cb24e4cd\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 13:03:46', '2025-10-05 13:03:46'),
(12, 63, 'deposit', 200.00, 'Credit/Debit Card', 'completed', '2025-10-05 13:10:06', '{\"paymongo_payment_id\":\"pi_auto_68e26e2eb69ca\",\"checkout_session_id\":\"cs_q8Tm21549S12swjXuWg7hJKd\",\"payment_session_id\":46,\"webhook_data\":{\"id\":\"cs_q8Tm21549S12swjXuWg7hJKd\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_auto_68e26e2eb69ca\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":20000}]}}}', '2025-10-05 13:10:06', '2025-10-05 13:10:06'),
(13, 63, 'remaining', 179.00, 'Credit/Debit Card', 'completed', '2025-10-05 13:11:08', '{\"paymongo_payment_id\":\"pi_auto_68e26e6c7f13c\",\"checkout_session_id\":\"cs_QPh5mKLDs7GtQTSpJJHmmMKy\",\"payment_session_id\":47,\"webhook_data\":{\"id\":\"cs_QPh5mKLDs7GtQTSpJJHmmMKy\",\"attributes\":{\"payment_intent\":{\"id\":\"pi_auto_68e26e6c7f13c\",\"attributes\":{\"payment_method\":{\"type\":\"card\"}}},\"line_items\":[{\"amount\":17900}]}}}', '2025-10-05 13:11:08', '2025-10-05 13:11:08');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(11, 'App\\Models\\User', 2, 'TestToken', '21b5dec392156f8a91fca14225d665dc5b6f3bf9fd065b21ded810f086af189f', '[\"*\"]', '2025-09-07 09:35:11', NULL, '2025-09-07 09:34:46', '2025-09-07 09:35:11'),
(16, 'App\\Models\\User', 2, 'TestToken', 'e51d66bc1432e5194de23a65526ad41a901ec3403b9cb318cc1b3ac5ecd7907e', '[\"*\"]', '2025-09-07 09:59:59', NULL, '2025-09-07 09:58:29', '2025-09-07 09:59:59'),
(17, 'App\\Models\\User', 2, 'API Token', '5f6abd95ea688fd4090ee24240128561747b1bec9bd02472575b2b6cfd93d84b', '[\"*\"]', NULL, NULL, '2025-09-07 09:59:37', '2025-09-07 09:59:37'),
(19, 'App\\Models\\User', 2, 'API Token', '2d29726999827dada8e882eea442ebd27a966b7b2127386f6891793f84e94ccb', '[\"*\"]', NULL, NULL, '2025-09-08 05:11:00', '2025-09-08 05:11:00'),
(20, 'App\\Models\\User', 2, 'API Token', 'e905b0b74df3a9f8898fadc6fb786d2bdf9ea29753734b529eba10af7ff45365', '[\"*\"]', NULL, NULL, '2025-09-08 05:11:01', '2025-09-08 05:11:01'),
(22, 'App\\Models\\User', 2, 'API Token', '8f0c260b52a619ab618dcc5275f8d21af4fa16ba40e048a1bf94bdd6de22d15f', '[\"*\"]', NULL, NULL, '2025-09-08 11:18:31', '2025-09-08 11:18:31'),
(23, 'App\\Models\\User', 2, 'API Token', '937d3cc494071e502349661b325bd750fc5acea3fb535bc35ee21006c260b471', '[\"*\"]', NULL, NULL, '2025-09-08 11:19:35', '2025-09-08 11:19:35'),
(28, 'App\\Models\\User', 2, 'API Token', 'c94ddbf8895a70a50b409751c083fa99f6b9fb065870f300e1d897d9796cc639', '[\"*\"]', NULL, NULL, '2025-09-09 02:45:49', '2025-09-09 02:45:49'),
(29, 'App\\Models\\User', 2, 'API Token', '4b704c91767ae168c002e960050b9e62c737053f89158e70878e34b82df0abad', '[\"*\"]', NULL, NULL, '2025-09-09 02:47:15', '2025-09-09 02:47:15'),
(46, 'App\\Models\\User', 2, 'auth_token', '316ced80abc1d45e73cf1fe5015c596ea99756fe05f57e759ed330101711ce0a', '[\"*\"]', '2025-09-15 14:46:13', NULL, '2025-09-15 14:44:05', '2025-09-15 14:46:13'),
(51, 'App\\Models\\User', 2, 'auth_token', '7df1a506e132b4bfaf4feb87126617f4ebe0611c9dde457d594a621477ed2861', '[\"*\"]', '2025-09-16 17:50:32', NULL, '2025-09-16 17:50:26', '2025-09-16 17:50:32'),
(74, 'App\\Models\\User', 3, 'auth_token', 'c8d4d754ca86f290d16587329d74c917c41e065d30ad4e8d2d7f73d61b3e46b6', '[\"*\"]', '2025-09-19 08:16:10', NULL, '2025-09-19 08:16:07', '2025-09-19 08:16:10'),
(76, 'App\\Models\\User', 3, 'auth_token', '10b343c1644a22d557663f3dba4adddb51fd8dd5164cc0e42708f9c2fda4f23d', '[\"*\"]', '2025-09-22 16:38:55', NULL, '2025-09-22 11:29:20', '2025-09-22 16:38:55'),
(78, 'App\\Models\\User', 3, 'auth_token', 'ae7eafaccaa4ef314eeb1bb8ff52338e330b32c36e9005f399a40435fb659ce6', '[\"*\"]', '2025-09-22 18:46:01', NULL, '2025-09-22 18:45:58', '2025-09-22 18:46:01'),
(100, 'App\\Models\\User', 3, 'auth_token', '6f43b033993607df86514707fc44758d6be73d130664a852109236c57ade3dff', '[\"*\"]', '2025-09-26 08:18:12', NULL, '2025-09-26 08:18:09', '2025-09-26 08:18:12'),
(103, 'App\\Models\\User', 3, 'auth_token', '51053a938f0e56c243461de28842927f6b3799026d5975b5a62b7a4f948188bd', '[\"*\"]', '2025-09-28 19:19:23', NULL, '2025-09-28 19:17:53', '2025-09-28 19:19:23'),
(104, 'App\\Models\\User', 3, 'auth_token', '9f089a05256d8e14471db6eb6242f6073a581b0ae9d650be5aefeb53b4cc7a47', '[\"*\"]', '2025-09-29 12:52:52', NULL, '2025-09-29 12:52:46', '2025-09-29 12:52:52'),
(106, 'App\\Models\\User', 3, 'auth_token', '1f91e5a7578109e141441aef33031b6f40c07f14347ee3974e1e661b9b85c639', '[\"*\"]', '2025-09-30 11:19:08', NULL, '2025-09-30 06:47:20', '2025-09-30 11:19:08'),
(107, 'App\\Models\\User', 2, 'auth_token', 'fa984fee2253087f460e443ffb72c96c73c623a9e1f8eea77914fc366ed51fd4', '[\"*\"]', '2025-09-30 09:14:58', NULL, '2025-09-30 07:18:51', '2025-09-30 09:14:58'),
(108, 'App\\Models\\User', 3, 'auth_token', 'ac61162a3b73803ed4c519157b822e12633e5d775f1bf9128f2be3005c25b565', '[\"*\"]', '2025-10-06 07:52:14', NULL, '2025-09-30 11:53:12', '2025-10-06 07:52:14'),
(109, 'App\\Models\\User', 3, 'auth_token', '762aa000ddaa3090253e2245c94d831f6f3d1126fc1aed06c6bf6688d722cd29', '[\"*\"]', '2025-10-05 13:11:20', NULL, '2025-09-30 12:01:46', '2025-10-05 13:11:20');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0zCtYtpvHgbbPjnxRJyYLPOa4MEKfewX57JjvkCq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidThORkVtYUNYc2MwbjhYVk1TQkt5ME1raDhNWEx5c05vTkFvREl6RCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXB1c2hlci1wdWJsaWMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759168503),
('15dpBGccz43sQpkM7HkBfVJb6mcmxFqrWaCZPT2x', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibmllTlNCbGZveGljZGFRSmRFdGtDSVFKWFpwZTBmUXdIYXg4YVgxdSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168049),
('23OxVDbmFwpcb8kds3NUliSdPSHCBwTIMLx0ppBs', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid1JPbHhoUmtIMGFZcjZPQjNyeEdzMzNyN0Q3SWlNY2FCZEs3cGM4bCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjIzMDIzMDRmLTYzZGUtNDYxYS1iYjYwLTBlNDMyODk5ZDZiZi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163716),
('2GEVDkjH5Xd5wkSfF6k4V2WTdL3ztMJMzf3Dizjp', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoienU5NlNaamNGbEJZeXBTSGQwYTVrMGthUnQzMmNiSFdWNVVIZmtFeCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168590),
('3uJ6Ev4sp9x63NUAMmNnh0eiqMzpPKOjlOeeCQO7', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSm9IT29jQjVod2ZCV0FqRFhkbGpmaFpuYlJHY1FxTVdocFJxbTcwayI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173725),
('4VVRfrvUbC6foOjpnDkVjMv1LRRVdnrYjyGzb6lV', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiREsyQ2VBa3UxZnl3cGh0dkxaSExFVFJBZUQ5UkVjelhDcG1jdTZaRSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173660),
('51WjufkyDnDwDvVJO27j9l7bgtQGofOePhSE3yH9', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSG1Jc0IyMlFlV29MVmVCTWo4SjI5WEdWdGE2RkhPZlpWU0JvNGtyVyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759169166),
('64I2cWAq8Hc4P83uXSR2BGo6L4tudO9xlaIz384w', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiazJrZWFJZkhNTXBqdEZMYkNzaEJOdks3b1BpZXVCQ3B6U1diQ2RHNiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173636),
('6XeUpDELhH1sCxBiMZkk1EgwyxVsjhkVFhDO3uR5', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUWhCbWZRaWhiYmIzVjdmdmxjd3V4RTFhN0N0T05RQzk5bVdvcWVDYiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjQwZjE0NTU0LTgwZjYtNGE1MC1hNzVmLWU4YjA5OTY5ZTc0NC5naWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163717),
('76URiv4lmmFL7L5CbNrAerwdJ2dgcHEdf0Ag0r4v', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNmN6QWRidlRSRVlzb0dIWHRaTko0aVNtQnpTMTZFT1FkVTRzRkVBTCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjRlZmZiM2RiLWE4Y2UtNDBlYi1iZTg2LTEwNmMwZTlkNTdiMy5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163749),
('7pl8SxhiuOhgiiZ7gV6C7oioHlKI0LFbWBuoU6rj', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOThRUkQ5dTZFWlFiaEUxbElyUG1OMU1wVkFwZ3lXejF2UVpMNWF0QyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjdhMzkxMTI4LTFiMGYtNDJlYy1iZGEzLTVlNjM4MGE1YzI5NC5QTkciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221848),
('8KfXld5Z9UZ5zEfX8OVP1nd8DmO6BjBVDyw6wb1f', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZUNXYlJsZ1dTd2FnQ3pLWkJVdlI4VGg5U3A0ZEkxQ203Z2lKTVdncCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmU5NGQ0ZWE1LTNlNmMtNGEwMy1iYzdlLWI3MDc3MmM3ZDBkNS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221849),
('9qHyn4KguP6m0uGBIvivaGzNSEwGrUYONoaS7Ie3', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVW5MNzFIWmQ1NkNUTjBiSUtvMUdLSElJTXBnWnozSlBFTjZaNnJSeCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjIzMDIzMDRmLTYzZGUtNDYxYS1iYjYwLTBlNDMyODk5ZDZiZi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221846),
('A8Jr9Eo4NvjfWN4LlImATCBVP8kJd3yIVhYlexj0', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaDhiZDVDWWZTSW4yTktUUWxtTVB0ajdhbHpoOFB1TTlZRGJ3OFFaNiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYzk5ZDg1NWYtYzQ3OS00MjE1LWIyNzMtNzU3OTkzYTdmOWE2LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169641),
('aiFBBw8YyT6oq7CY9YSZyrkXI2mRkYVeggshuAEq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSkJselhWVmYxY0Q5aW90dWNXY0piUEV1U1JVa1hyYkZJcGhLV0dibSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA4OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGMGZmZjE3NDEtMGI1OS00NmYyLThjZmYtZGI5Mjg2ZWU4Yzk4LmpmaWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759217588),
('AJzDkyLD1lFyNy3I5heQAVrr3hApmFU6RxwCgRf9', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieUJ2NTdKc1QzcEZReE4xM0h6MFpVcDZEUEQ5QldxczZqaTJGZlg2TiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173763),
('ANz5d92o8bBFZbXCE5dvnxqgPdjkdxY7Nc2L9yD5', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicG8xcldTbk16VnNhaVBlRlV3VGJsbmhBakR0RXBRSzJ2ODU0Y1ZCVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjRlZmZiM2RiLWE4Y2UtNDBlYi1iZTg2LTEwNmMwZTlkNTdiMy5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163716),
('awLF10NQIySCTZ1QzQFdNx86JVbjcMfi9mDgHbjC', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicVVGOEw3YnVnWHR3R1JrR2FPclpKbVNuS1RCcDRzVnJIVnlwNkVDMSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173573),
('bICtJ1LKeKZpZTzlTSaXJgEvVbnpSBmX6QBo4sYj', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ04xWkFJYTF3aGtIZUx6T0VGM2pUaENwakYzdkQ5amc1QXJJTWxvMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTEyOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjBmZmYxNzQxLTBiNTktNDZmMi04Y2ZmLWRiOTI4NmVlOGM5OC5qZmlmIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759167693),
('bxprWUc9ApFDUlHdV6KFgPSQ9fdPeNaaE0U9eXaC', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicWJ3ME52dDdsam8waUFJN25ZVWFKcWFjSWUxaTR2bkplTHR2Yzd0bSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmM5OWQ4NTVmLWM0NzktNDIxNS1iMjczLTc1Nzk5M2E3ZjlhNi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221847),
('CPRn5o3Fjtp82fxVkYsbn9JSL18H2trxnarSYdfG', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWmdoandxeG5yVDRjZWpuVGZCdUZYNzl0cmNUN2ZEQWM0VGhwRWtSQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZDIzOTQ2Y2UtMjQzMi00M2ZmLWJiM2QtNDJkODgwZjM0ODRlLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217590),
('D4ZLyqXN1nR4Udx8wApmDV6g1Bwiz0AiphRq199Q', 3, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNnprTDZlU0V2TThUbUJyZk5zT3JIanA5RzB2eVNCOHN1SDlsbnc2eCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759167991),
('dI7DMnvI3ZB2Z7GhFiYCOxHJ3bywMvql5uT0sBlG', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaTBnY1NRSkNkejE1bkhiODNmeW9MNnpPSmNLN2l0OThaVXczV0ROdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168320),
('DPpSUlSPVLq7IzvqUO2CyibP3gqNPoHMYCGHue0c', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR3o2d3djakU1b2RPZFRtWU82SHdkSEt3Nzh1M0FmYWloV1ZrdG5uTSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZTk0ZDRlYTUtM2U2Yy00YTAzLWJjN2UtYjcwNzcyYzdkMGQ1LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217586),
('dSCLwZr9k29JbcPHdMozDtNqDicLgahaj7UwJxTB', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQkFrc1FGVzU3aGpicU1JcHVMYlBWM0FucEV4d1VFV25nallZTWhPSCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168599),
('Dso5BEByd6q2Sx9UjFD88AmCX9HYJWrLUq1b9ayK', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRHJKZkJDc2tyeWpGMFJUSnNWSEF4NzM2ZFFKT2RZQWJGRm5lZlJaMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjNmYjQzZmVlLWE0ZWYtNDVmMC1hYTk2LTgwMGM1ZTA2ZTE3ZC5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221847),
('dtTFfJphJFJSso2aJ30pVae1QFa9oOlkJjMmoIVf', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM3NqWmdQNWhLVVQwc0tQMlU2WE9QdW5vS09qdGpkSXkzQ2xvaUhxYiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmFiOWYxMThkLTA3ZjgtNDI3OC05NWUyLWIzZDFkZDFmYmQ3MC5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221850),
('DXgZRR84DR2zO1zQrV1lwR0shZV7IK3bhicSSQAy', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYThkaFdzeDFOOHVHNzZnTnlQRjhvR0Q4ajJIYW9YWW9rcVhaeTAwdyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNDBmMTQ1NTQtODBmNi00YTUwLWE3NWYtZThiMDk5NjllNzQ0LmdpZiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169640),
('dxs5stR2SMJXtq7rzIgKdIXZGXPP1tAjyFQhhPNh', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNWxQR09vV2dGQWVjSkNNckFVY1BiVlRySTRISk1nNUJ3aHowT1Q4TiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjQwZjE0NTU0LTgwZjYtNGE1MC1hNzVmLWU4YjA5OTY5ZTc0NC5naWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221849),
('EeZNIVR13e8E3Jke9aySn26hEoe7KFFe4mvkbfsf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieEo3R2NzdXNFa0VpcGhwNWxZdFdzYzJvV1I4MmZYQ1dOdHZpU0R2VSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZDg2MWU3MzEtYjkwOS00ZWZhLTliOTAtMTU1NThlZjliN2Y4LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217588),
('Emj3DZ8dHLdp5QVIMZZYtr1ZmTbGGuYBgkZ4iluq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-PH) WindowsPowerShell/5.1.26100.6584', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZzBFOVdPZWZoNEd3MjFqMHBpZldVanQyWjVwNlZjakpMV2pwSlR0diI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wYXltZW50LXN1Y2Nlc3MiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759668136),
('EPQsR5UPOB9ZK8TJOulffmDbBIgUfbUV49bCtiD0', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2N5WXAxZTNSdFFCNTNzYUNvbEEyYnJyRFdqRVdIUHZYUVFZRm9PdyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjRlZmZiM2RiLWE4Y2UtNDBlYi1iZTg2LTEwNmMwZTlkNTdiMy5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163737),
('eQ9QEGqYo4Ar3sh4vxpPBonDUPeo1focoE2l0T3G', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTmllQXFhT1NsV3hQaHBRYzBGbWZ3ZFh4MXM2SW1lRXVSV1RTMGpNSiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759169299),
('eUzYR92e6erAKliLh5sDyceLoKvSZ7yh4ck44prL', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTUozSnJlYmZjRGZrb0ZnOUtUd2FnQWZDWlNDdkQ5OUFPVzV2Y0JYVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTEyOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjBmZmYxNzQxLTBiNTktNDZmMi04Y2ZmLWRiOTI4NmVlOGM5OC5qZmlmIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759221850),
('f1ZnjOqjiU6bCBdvUY8W5fLwrRDfjspEDcCUKL9O', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYXNUZFY2RVhxUDFQU0RJVXpsdE5XOUpEamFtSG8zYUR6alJFZ1FFQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlhNWYzZTkyLWFiMjEtNGFiMi1hNzA0LWY3OTZmMzUwMTYyMi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163722),
('fapOvvJAF6MDxoJ3fEj0oVqvnFwU9PPzBksj8dEV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOVo3TENNUllqRHFOclJQVjRSd0pUTnhWcGZ1QWtwM2o1NVNidllONiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGN2EzOTExMjgtMWIwZi00MmVjLWJkYTMtNWU2MzgwYTVjMjk0LlBORyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217586),
('fex2iLNrbK1oha2ZS8PSHBwV1nvokhkFUfkfZWnI', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQjBWSkcwRG9rZEROZ0Q5cG81eDdqa3FrUjBTZk0yR3F0TWtJY3hneSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1lbnQtbm90aWZpY2F0aW9uIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759172567),
('fjdTE7vx0DplzCqOb4vV82HCLYRW1uZMpdQPCusG', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVFZtY1pDcWV6Y1d2NTFXWnBnU2NlY05NOGQ5b2k5a0FQM3Z6MW5COSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759169230),
('FKpwLv4bIdmcP5UljzSgQSFTWlMlYt02A1sTCKyV', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoia2tSUHpnY3FuTUVEbExrUEhySVE5RVJ4SXlXM2dSSG1rUURyc3VjUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759169224),
('fWWAACYojtuSczyqUiUHM3R8Q5RtVbBINON3QVRl', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicmJQc2g2SHVPRFdwZG5abUNrbGxkd3hJVXRGa2p0YkUwdTFDSzliOSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGMjMwMjMwNGYtNjNkZS00NjFhLWJiNjAtMGU0MzI4OTlkNmJmLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169639),
('FZIshllSVv1ybdVj3VvKQdjk7m581NpijiS2iXRY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaWdmV01Uc3R0dnhIRGNSWjVBN2dPcFF5SU5UVE9vYmtneDY4V295dCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGOTUwZGZmMzMtYmIyZC00YWVlLTk3YWMtYjM0NWY4ZTA2OTc1LnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217590),
('GBurspw9a45WsGRVC5eAhrZbfoSMPlAjIekABSsh', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNmVjS2RrbUdjYW1WSkxtdzhadnlyQzFIbEx6WjhsYkVzS0ppdVNjZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmQ4NjFlNzMxLWI5MDktNGVmYS05YjkwLTE1NTU4ZWY5YjdmOC5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221850),
('h36jUOo9glg4dHCAw32SoAZP3gxKoL4jjBSqnWTG', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRDI4dXdQcU1aREJVamRNc3UwNEVNMWVUTG9MVzRhcjlNU20yWWNONyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYzk5ZDg1NWYtYzQ3OS00MjE1LWIyNzMtNzU3OTkzYTdmOWE2LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217589),
('h3Zm7ggxS8YLr4Nug7F8qMA9sj20ypHZGHiyixef', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMklKMmxFNVdQekI3cFhJV0wxVW91aEFweVF2a2xPanlyRjNTNkRsbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA4OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZGY0OTMxOTctNjM0Zi00MTIxLWFjZDUtODgzNDk2ODYyNTRiLmpmaWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759217590),
('hEGMR68sdbgnCgJ8iWT33PJs0v8VZvmuyd6bsqe4', 3, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiT3ZBRWdyN1NpRUg5Q0NDODFDaDRrdGV5cWZSUlNjYVdwdXB1VHdoSCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759167906),
('Hiqyou4MtUSlbIbmjm4FfpgThXleQVaLOvqqotyU', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN0xoeGl2YlNNV20zV2ViemFwSG1OQkg5UU85WU54a1NocTVWWVo3MCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGOWZhNThmZTAtYjhhNS00MmNkLTg3ODgtOTBhNjBjYTZlMmI4LnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169640),
('hIR2GhiPmWB1jDwKNLkwpClhBz8FPl9qJ2rCbb2j', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSmlGcVJobzVEZGpiY1F4bUZhaU0zWHBFRUdMbWZoeVp6WEFpRDBjRCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTEyOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmRmNDkzMTk3LTYzNGYtNDEyMS1hY2Q1LTg4MzQ5Njg2MjU0Yi5qZmlmIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759163717),
('IK4YB6uXnMgCGEi7smSYGk7hSL3N0IiNRz7Fk7aL', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ2FLNmJuVlhlbmZkUzZvVHVKY0JOS3hMWkVab0xzU2tBZFJ5MDZIUiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZDg2MWU3MzEtYjkwOS00ZWZhLTliOTAtMTU1NThlZjliN2Y4LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169641),
('jjOf4REWxF6KH1VUYoX9PhLFM2sKaC1cwf5Mt9R4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2duZ2d4SDdZUXFZZWRxQWc2OWJFNHJHMDZPWmRxdWxnUUh5S212MiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYWI5ZjExOGQtMDdmOC00Mjc4LTk1ZTItYjNkMWRkMWZiZDcwLnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217586),
('JxKxy7V9xtDihG6PSeQUgeG1wZyraQgNA8tfET3t', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic0pzUENMdXo4S3FJc0RldkVUWTZQaUZFUWM5aXlMbDlvZVc0OVY2aiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTEyOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjBmZmYxNzQxLTBiNTktNDZmMi04Y2ZmLWRiOTI4NmVlOGM5OC5qZmlmIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759166562),
('K3DAL8XxDxlZwvOvBNskcwfPhHtA7MXy4UFr4et5', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN1d4dlBzajIxYkl1SEUwTkR5MlFxRFMxQXZKa0loYWs3bkYyd3lpNyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNGVmZmIzZGItYThjZS00MGViLWJlODYtMTA2YzBlOWQ1N2IzLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169639),
('KeFVS1R5tkiQFN7g1HwlPWqinOuDFX1ZoK8ksJVM', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoia3RxcjB5OG10ZWNhc2FsdEhkNTNkMnREdjVtSjVyeDJFNkFEZVhsNiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168568),
('KjQBBbnYHMBfCEwq20HEoKZhzjQqZ0OAnZ1Vtny6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieW9PbXJ0VWpYMTdxUkpadGkzYk1oZlZyOFRTR1M4U2oxc0tIOVFxMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNDBmMTQ1NTQtODBmNi00YTUwLWE3NWYtZThiMDk5NjllNzQ0LmdpZiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217588),
('kusGb5U9m53ZUv5Q3ZNlbLCQgMpEv5Jx4XPM695q', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZEJSd2owa3Y2UmxVNG5IY0NzQnBmaFlIcXQ3bmo3QXhPbmN1dTlwZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168508),
('lf3aL0YLxm9dGj2fWekc2xQvBxMniOeNIwYBlf4H', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZlhZSVNLa1NwNXk5MjZ4ZzBScVRvSDc3aWNTTERydzlaMnZLcVlESyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXB1c2hlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759168551),
('LjeyIyZNEUGYGcimhQ6xEv0kkURUnhwmSTVZXR5X', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ0NBckQ0YkZBb1JwMmVwVlBFcEpvNEU3Qk82M1VnVEpLb2pxTXIwdiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlhNWYzZTkyLWFiMjEtNGFiMi1hNzA0LWY3OTZmMzUwMTYyMi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221848),
('lnFih3xECZOkE3DiOMtizxuAYG1MYyVOAmiBQVLV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTlM2MlBTeTVweGhHUzV6Y25IWHpRUWdDUjhERXdPM3FpNTFRUWREcCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYmU3OGExMjEtNDM2OS00YTljLThhNWQtM2I5YjQ2YjBkZWZhLnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217589),
('LPuCzBVEB71AzOlADeCU9r14XCpslJfAuoUDe8Jf', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSXdseDlBTDFHdHV0d1hHd01SM0pwZGQxT0h1WjE2UGZiRXBTZzJsOSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759169349),
('Lyd6V0fIMMV7sOlZqPSbXmVNT9ygjOPfzwk10tns', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWXpQRFJPNXhpTXEzWngydXR4YzFESDdENlBKNVpjcFN2M1Rka0RyWiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA4OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGMGZmZjE3NDEtMGI1OS00NmYyLThjZmYtZGI5Mjg2ZWU4Yzk4LmpmaWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759169640),
('mWev4Z7nFNyZtj4QaJv9TqtryAGjlnOHeV9eujhR', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTk1OajQzSnNIWFU0NnNvclFYT2wxRTdzUlRFTGtRbFJLaEhxWEQ0eiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTEyOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmRmNDkzMTk3LTYzNGYtNDEyMS1hY2Q1LTg4MzQ5Njg2MjU0Yi5qZmlmIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759221848),
('N2K8LOhbA4WAngVDWqVj0ca9fpgIbr2LRGAUJKlW', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicWhQaU9xekFSVnB4Rzgxem9qRE5BOTNwa1hGeFRoQU5iY3k4aDN3WSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlmYTU4ZmUwLWI4YTUtNDJjZC04Nzg4LTkwYTYwY2E2ZTJiOC5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221849),
('O0BGM7nVEbn4dGRTnOta1V18DhtHdDa2q31FByh2', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFluZElWTWpCRm9XNEtDNnZ4YjVMZ0JlUFdiS1pUaHk1aHFEcUFCRCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYjMwMmY3NGUtMjg3ZS00MDM4LWJmNzQtNWUwZGE2MGI5NzJmLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169640),
('O11N0BKmwagbEljAq8cLjY7iaqw1U5PPJIENBOc1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUnhrMTBKTGxyMWJmMmRYcHliTGt3a0R2dkVqeUpIVUFOUlpLMHdsMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYWI5ZjExOGQtMDdmOC00Mjc4LTk1ZTItYjNkMWRkMWZiZDcwLnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169643),
('O3x46KDm9OAGupMKHqPz1SrWw8O07ZuJflIpa6dz', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidVVIcThNMlc1ZnhZQnhhTHRYWVVGbDYwR1B2NUgyTEdkcGphNktHVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYjMwMmY3NGUtMjg3ZS00MDM4LWJmNzQtNWUwZGE2MGI5NzJmLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217585),
('om20qjtHwF1wXCFcU6mqtG4RAjIYxAm2ipo1gb1W', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTG9qUkNyS3BIR2dacnMzUjJIQ0hDc2hZVVZDTjhFaDNGNG9TVWNsdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168154),
('oVesUkV9OjxX3nlZcfk57bdaP10TeMPUFICLtHnl', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaUhVYmQxS3YwaXZybGdyUTZ1OXJTeWZjMTFkdjZaeXdRcTd0ZDBKSyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlhNWYzZTkyLWFiMjEtNGFiMi1hNzA0LWY3OTZmMzUwMTYyMi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163717),
('p2tUQAiHmByuKZmwonyZFxebaEnoNqe43ACekfmH', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialpia2IyblZmQjNKOEY4ZHQxWUZXY0Q0ZXplMldwYnl2a0dlM29mRSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGktc3RhdHVzIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759168690),
('p6YXnWIwPahxwXzbTKyMTqRd1qPoZXhsW1K2Tr8p', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaEtxd0t4cW5CQUNSS0J0bUJKaUJOS2VjaU12TGNqdVN4UjU5V0o0eCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759169098),
('p8KDOpYVFIBk2w356RcMggjUr5olZjRuwwxHFa8r', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNnJuckJxczRtRHkzdnpXNDJoc2VHWVZxYlg5WHZvVmJXeWxiYVJjSCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmQyMzk0NmNlLTI0MzItNDNmZi1iYjNkLTQyZDg4MGYzNDg0ZS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163716),
('Pk4LmgVfeEEAzUZhb1A0Z39HLE3twJ8ZSmQqzLCA', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSWpsR0s2UlFjbUtmNlVnS0JydnVDdW1vcmU3UGRqMTBpNmhnUTdYbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNzU1YTNjYTUtYzliNS00YmMzLWFhNTMtNGZjZmYyY2M1ZjY0LnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169639),
('pKd2ABPeHUmcH0zOvCvvecLykTcRi9BuIOrTcdii', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSzBXdm90bkxrS2U3SnZMU3NPVzFoV3Fad0RnRDg0a1Vqck9uNDViOSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNGVmZmIzZGItYThjZS00MGViLWJlODYtMTA2YzBlOWQ1N2IzLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217591),
('PWpey9LfDDx5Bf05OGbCKPvE5uqfDEyNvFIy3XYX', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicVJBYnVYVzFyU3lRTmNhM1h3MzQySjQ5alpYMWZkdnVpQ3dOM3JhMSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjRlZmZiM2RiLWE4Y2UtNDBlYi1iZTg2LTEwNmMwZTlkNTdiMy5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221847),
('pz8Xq5QG9cxWC1qZbTGti25EW4j7xMUj4b2Ow5rQ', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVjhiYzZmQjd4NnNDangzcU5zNjFFdmc0UVVqa2dsNzVoaW1hYzhCQSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168383),
('pZKCMv3TsSnjHEnXnvBucWWFY6rqhTHOChedBuy5', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT3VybDFBeExyam9aSXNxQ3RoRlZCQXpiakNLR0FaRkJoUGpyYUNNMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1lbnQtbm90aWZpY2F0aW9uIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759173102),
('Q9EkSCGUEchg9Uz57QfKKnGJxRZiITFnhAmeynPh', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUE0WXdzN0tWRlAxb2NySzBVOVdzQm01WkVHSndFRjZYT2dNRmM1WCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGNzU1YTNjYTUtYzliNS00YmMzLWFhNTMtNGZjZmYyY2M1ZjY0LnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217586),
('q9MvfomathfUKTmLrJt7ZnhxYZEQ8t6ctTuWLdhT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid3kyMGlCa3VRSFQ3U21RbWZubWdyME5zMk9halZuUGV5YVRQekg0OCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGOWZhNThmZTAtYjhhNS00MmNkLTg3ODgtOTBhNjBjYTZlMmI4LnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217590),
('QpiQCzkjFA4LpK9Z2Y1uoxBUXq7CoknInl0mUMiU', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidUFLV1pSNWo3bW1sQ2txUXlTbDBNNUlaOHNoOUlUYnVmczJyZGdMbCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168654),
('qukGrh7tGJViCuOvAbCVDYmkG2QFWAXJkzONif3S', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNWZtc3prUkJoVmE2d081TzJQR2ZyenJkR2g4TjY5YVZVZUR5cHFXSSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168685),
('QW68E7M08UbU21spBX41B5mLYxRzAo3psEhtFv3c', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUTJwOW4wVmp4RmJDTlc4ZzBIaXFpellxRE1WVzlsSkUyU3c1Y1BIaSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXB1c2hlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169174),
('qxR9Rlrq6tN0LU0Ex7QnD6WjcwHQthE4zZ4ag6oj', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieWw1dGhoNlRXUkVXWXhLSUFqSDRkWTlxVTcxSmZ0ZUh2SDhJSFY0VCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlhNWYzZTkyLWFiMjEtNGFiMi1hNzA0LWY3OTZmMzUwMTYyMi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163734),
('QYqd2DLfxdddJ6x9rzEXMQnLaQT46HN00JQew8UN', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRjZVbXJMWldlSlZEY1FPTGtYYVlqeUZnaGFuMGFDMWdGcVFCa2JIMSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1vbmdvLXdlYmhvb2siO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759173683),
('RLXvehtmf6SgSyltk6Wdo6LZo06P4alWT9GOmWbz', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoib09kekx4SllkQ3BieHNsVjIweGoyeFlHOWpUdlZkb2JTTnVheGxFZCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168693),
('RmZEcJu5ie5sfg0HP8QFnGcIafrKQvA6W7A4uKkh', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzcza1JpOFhIQnNCcnAyMnJYZmpybVlWNHZ1UXZwU0pRYlRDSnV5MCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXB1c2hlci1wdWJsaWMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759168521),
('rqagSBx2Lhm232jgWm4jPOtxpZZs3z23mGb596IZ', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSzVhdjRGWFIxdW5zUUNkYzFidjE1UlFoMFpRRjgwa05tTHlkbFlCZSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmQyMzk0NmNlLTI0MzItNDNmZi1iYjNkLTQyZDg4MGYzNDg0ZS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221847),
('sQygJ6QMsMzIzzmVAJb3VXLl0b6dE7kPy5uy5MtA', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRkJac1hWMTBjaHlwbEhCcHN3T3AzcWRCYkx6VEJEZ2RGanRRY1dyRyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA4OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZGY0OTMxOTctNjM0Zi00MTIxLWFjZDUtODgzNDk2ODYyNTRiLmpmaWYiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759169639),
('TdnxtydDlfzcaMf7KcbLGGDR4qM0qpidYdkbM0sU', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidlZPYUNTRzNxREFvcDN2dWlxbWMzWDliMHBQazNjNEFWVUZ6bEdKbCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759169176),
('teRd0SZZOCMnD6eKvmHsVyDhf0oPNuBaegh6n0iL', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZkxqckp1cVlHNGhTSzFnUGpUdUk5OUJYOWVsWXNlNXlkc2V3OER4YyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjc1NWEzY2E1LWM5YjUtNGJjMy1hYTUzLTRmY2ZmMmNjNWY2NC5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221851),
('TgDrPT1p7x7e13oq3OJ2bCN54QjDbiaWVQm7abP2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFVkM0VaQlluZG9GQkd0WnpKNUVwTHlyVDg1MnFLTkZOYmt4elRHVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGM2ZiNDNmZWUtYTRlZi00NWYwLWFhOTYtODAwYzVlMDZlMTdkLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217588),
('TgVRqJEDZ7U3p4vF8Vweam7jbKbrZSiw9LfoUWPz', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRUtMQ3B0V3BWSkhKN0VQN3pkSDR5THNzVDZsdG5lQWZqSERuREtMbCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGZDIzOTQ2Y2UtMjQzMi00M2ZmLWJiM2QtNDJkODgwZjM0ODRlLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759169639),
('TM7MSpgsnnlFVygOgrTpm8MUa9ZmkDX3d4htUaCg', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTXdlQnhIVmRVMEtBdnd6NG9TSUJtcHRjYVFjYXpHSEFLazY4TTJkTiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759169305),
('TOkN98wwDJrPQdfiNpNQYRaGZnHOkXvx1cqtH9Wn', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidkpjV1dlbnBSMTlNeHZTU1RCcDhaNVFhcHk2WWY5YmQ2bllnTUljZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjlmYTU4ZmUwLWI4YTUtNDJjZC04Nzg4LTkwYTYwY2E2ZTJiOC5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759163716),
('TRbWLlRDwhU5K7FJCy1ncEYzoNsIjTV3bAMqPJyK', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0NTdWV0OWdLTW5ydlV1ako5ODlyOGc3WGFPWHFRM3lDUlpXV3M0cSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmIzMDJmNzRlLTI4N2UtNDAzOC1iZjc0LTVlMGRhNjBiOTcyZi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221849),
('TXCQ63IXVGYA4CqtadkidF7d9lu40Vl2bQhIBdQC', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibk1EWTg0bE1nNVBXaTBtajA3a2hnTGoya3lWeEVFZXlaaTl4TzM5SSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRjk1MGRmZjMzLWJiMmQtNGFlZS05N2FjLWIzNDVmOGUwNjk3NS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221850),
('U0Zjw0eUPpx6mEYa4HkKwLAup7Z5GGDIgkrgxxOM', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaEJKYk5sY2VTMzIwMnE4UlF2R0hId0I2Z3VndmhUaVdKZ1diajlMeiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759169158),
('U4ZdW2nLAYRFOiCwMwOUwzsXw19jYf36MUX5PmoY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGs2YXpLdWtlYXJQVnlkc1dwdk9pYWNRd0pnMUQ3N3U4TmlsbEZ3VSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Njk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wYXltZW50LXN1Y2Nlc3M/cmV0dXJuPSUyRmNsaWVudCUyRmFwcG9pbnRtZW50cyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759669868),
('uAjQWT0NHuuCskg4EBQStdBEj44a0rWKyUWxFsIv', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFI5M3RveFIzOFdGdFpudGNKbHI5SHRrTXV1NkFGb2FDbjFpQkRnbyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmIzMDJmNzRlLTI4N2UtNDAzOC1iZjc0LTVlMGRhNjBiOTcyZi5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759167693),
('UOvLV0zVPaCjJVGWL5cOPaSHCLderg7tOdcmnZqZ', NULL, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWnlNbGxTS0IzSjM5YlBaZjNUOWhrMG9mUlRNZ1cxSjc5UnV0aThDQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTExOiJodHRwOi8vMTkyLjE2OC4xLjIxNDo4MDAwL2FwaS9wcm94eS1pbWFnZT9wYXRoPXVwbG9hZHMlMkZuaWNvbGV2YXJnYSUyRmJlNzhhMTIxLTQzNjktNGE5Yy04YTVkLTNiOWI0NmIwZGVmYS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759221849),
('ViD9cVI1tMqrIRR6H8dzKOqtIqbIEVAXjESqrQpI', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSDlxOUhEcmhjdXpiTkdvRTNHVEZ6S21zSjU2VXJkVjAzaDlFU2pGcSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759169252),
('vIJnlS5UlADC7msfxOstRNR0cQ7PZSjgk9mFlK1Q', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMFAyYkRYOUVNTEpqRmFjOVpVMmRZdFpaOXgyaEVDQ3FZelJ0c2diUyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGMjMwMjMwNGYtNjNkZS00NjFhLWJiNjAtMGU0MzI4OTlkNmJmLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217590),
('VprUggfHHKyJT3m3silV0pwi8u8t0tKXgdYdCeuL', 3, '192.168.1.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ1VhQXVNYmJPMGxqY1BOdXFweFEwOTVaclBEcDl0WjZreERnVW9pSiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759167931),
('w27Wg2ZJcPu3VW1OIDgwyreZrXFz0qNCn2AbzGHm', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYm5pRjFLTFhhNmV3VkltQ0dGQ25mTlE3VzFvTHJZTWZ6Q3FHdnpOZyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYmU3OGExMjEtNDM2OS00YTljLThhNWQtM2I5YjQ2YjBkZWZhLnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759171215),
('wWH58bC04X3fJ1hl8n74czC4CEWpQLXEkhN5cC8p', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVk1zYjJ4ZlNudGs2RjM3Nm5WZ0xEMjhQTzdRVDBxUjZsN0o5dTZZbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGOWE1ZjNlOTItYWIyMS00YWIyLWE3MDQtZjc5NmYzNTAxNjIyLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759217586),
('xvrjehgtkuJkgVIEacXjXyqLZff0NP1CsLjDcfPG', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ0lHako3SVNpOE5nTGthd0ZsWWlSdW1aYWhicXZnOHh2WDJKMWE4YiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168470),
('YbVRaMx73Eaj0xFRaIbsoup4nWFFik6t5yjxAqJl', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNDA4MjdqU3pkWmNwc1BCVXo1b0VITURVc09EREo3Yk9MMHlKdWJGNCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168534);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('yDaGgH7cMwLYYKBJR9OxmT6F1Wo3l93bez3NsOdg', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNTdmUlllaHlPYWo2UDhqWnNmV0NwNjB5MThpWng5SGtUME1BYUpIZCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTA3OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3Byb3h5LWltYWdlP3BhdGg9dXBsb2FkcyUyRm5pY29sZXZhcmdhJTJGYjMwMmY3NGUtMjg3ZS00MDM4LWJmNzQtNWUwZGE2MGI5NzJmLmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1759173374),
('yHQ0IcaMINwh9afzzRDH5C3Fh8QBsPgZx3BdLOWP', NULL, '::1', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMklsbG5RNkEwOFhkVEtKS3ZQb2VvdHBsNTVmZXF1MkJoV3Rpc3JaeiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBheW1lbnQtbm90aWZpY2F0aW9uIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1759173143),
('Z0RI1xXbxIe1RsHUgDatdV0bzuYapsiMK8ZPXfr2', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZ01yMXBpVXlQbUdqQTJWTWFVUHVnTkFGUnpZbWp1NDVhR2Z4RG1KMyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168517),
('zhSycLOt29CwSTDTu4bUaEFMYp3O0p92kqnq2PAk', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoic0haR25lU2ZZZVE4dXp1OHh5QzdyalowMWVBTUFTSTlGRHNad0E5USI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168123),
('zKDeqkRc08cEGjNJt2psQxEN8n3QTlUyj3mqImT9', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiRHpZcXN1N3lxTzJVUjJTTVVnVlBCZ2ZGUmZHR3poUlRnV1NQRFdtTSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1759168053);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `transId` int NOT NULL,
  `bookingId` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentStatus` tinyint NOT NULL,
  `date` date NOT NULL,
  `receivedAmount` double(10,2) NOT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rem` double(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`transId`, `bookingId`, `total`, `paymentStatus`, `date`, `receivedAmount`, `paymentMethod`, `rem`) VALUES
(1, 3, 749.00, 1, '2025-07-15', 749.00, 'GCash', 0.00),
(2, 5, 479.00, 0, '2025-07-15', 200.00, 'GCash', 279.00),
(3, 6, 2999.00, 0, '2025-07-15', 200.00, 'GCash', 2799.00),
(4, 7, 749.00, 1, '2025-07-15', 749.00, 'GCash', 0.00),
(8, 13, 599.00, 1, '2025-09-11', 599.00, 'GCash', 0.00),
(10, 15, 1299.00, 1, '2025-09-13', 1299.00, 'GCash', 0.00),
(11, 16, 1899.00, 1, '2025-09-14', 1899.00, 'GCash', 0.00),
(12, 17, 499.00, 1, '2025-09-15', 499.00, 'Cash', 0.00),
(14, 19, 1499.00, 1, '2025-09-17', 1499.00, 'GCash', 0.00),
(15, 20, 899.00, 1, '2025-09-18', 899.00, 'Cash', 0.00),
(16, 21, 799.00, 1, '2025-09-19', 799.00, 'GCash', 0.00),
(18, 23, 949.00, 0, '2025-09-21', 200.00, 'Cash', 749.00),
(19, 24, 3599.00, 1, '2025-09-22', 3599.00, 'GCash', 0.00),
(20, 25, 849.00, 1, '2025-09-23', 849.00, 'GCash', 0.00),
(22, 27, 508.00, 1, '2025-09-25', 508.00, 'GCash', 0.00),
(23, 12, 508.00, 1, '2025-09-19', 508.00, 'Gcash', 0.00),
(24, 28, 428.00, 1, '2025-09-30', 428.00, 'PayMongo', 0.00),
(25, 29, 748.00, 0, '2025-09-30', 200.00, 'PayMongo', 548.00),
(26, 30, 448.00, 0, '2025-09-30', 200.00, 'PayMongo', 248.00),
(27, 31, 828.00, 1, '2025-09-30', 828.00, 'PayMongo', 0.00),
(28, 32, 748.00, 1, '2025-09-30', 748.00, 'PayMongo', 0.00),
(29, 33, 428.00, 1, '2025-09-30', 428.00, 'PayMongo', 0.00),
(30, 34, 828.00, 1, '2025-09-30', 828.00, 'PayMongo', 0.00),
(31, 35, 428.00, 1, '2025-09-30', 428.00, 'PayMongo', 0.00),
(32, 36, 677.00, 0, '2025-09-30', 200.00, 'PayMongo', 477.00),
(33, 37, 647.00, 1, '2025-09-30', 647.00, 'PayMongo', 0.00),
(34, 38, 1384.00, 1, '2025-09-30', 1384.00, 'PayMongo', 0.00),
(35, 39, 379.00, 1, '2025-09-30', 379.00, 'Credit/Debit Card', 0.00),
(36, 40, 836.00, 0, '2025-09-30', 200.00, 'PayMongo', 636.00),
(37, 48, 1156.00, 0, '2025-09-30', 957.00, 'GCash', 199.00),
(38, 49, 957.00, 1, '2025-09-30', 957.00, 'GCash', 0.00),
(39, 50, 707.00, 1, '2025-10-04', 707.00, 'PayMongo', 0.00),
(40, 51, 707.00, 1, '2025-10-04', 707.00, 'Credit/Debit Card', 0.00),
(41, 52, 508.00, 1, '2025-10-04', 508.00, 'PayMongo', 0.00),
(42, 53, 836.00, 1, '2025-10-04', 836.00, 'Credit/Debit Card', 0.00),
(43, 54, 608.00, 0, '2025-10-04', 200.00, 'PayMongo', 408.00),
(44, 55, 479.00, 0, '2025-10-04', 200.00, 'PayMongo', 279.00),
(45, 56, 508.00, 0, '2025-10-04', 200.00, 'Credit/Debit Card', 308.00),
(46, 57, 379.00, 0, '2025-10-04', 200.00, 'Credit/Debit Card', 179.00),
(47, 58, 379.00, 0, '2025-10-05', 200.00, 'Credit/Debit Card', 179.00),
(48, 59, 379.00, 0, '2025-10-05', 200.00, 'Credit/Debit Card', 179.00),
(49, 60, 379.00, 0, '2025-10-05', 200.00, 'Credit/Debit Card', 179.00),
(50, 61, 379.00, 0, '2025-10-05', 200.00, 'Credit/Debit Card', 179.00),
(51, 62, 379.00, 0, '2025-10-05', 200.00, 'Credit/Debit Card', 179.00),
(52, 63, 379.00, 1, '2025-10-05', 379.00, 'Credit/Debit Card', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `lname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `contactNo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint NOT NULL,
  `profilePicture` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `archive` tinyint NOT NULL,
  `userType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `reset_otp` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `email_verification` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `fname`, `lname`, `email`, `password`, `contactNo`, `birthday`, `gender`, `status`, `profilePicture`, `address`, `archive`, `userType`, `reset_otp`, `otp_expires_at`, `email_verification`, `created_at`, `updated_at`) VALUES
(1, 'okim', 'Miko', 'Santos', 'santosmikoallen@gmail.com', '$2y$12$5fiTMf0S/7ll.UcIeQYhIuLKKsuObtkuv4iWZT3ahxXaokqIR6ybm', '09292902337', '2003-03-26', 'Male', 0, 'http://localhost:8000/storage/profile_photos/1753946270_okim.jpeg', 'San Juan', 1, 'Admin', NULL, NULL, NULL, '2025-09-17 15:15:25', '2025-09-17 15:15:51'),
(2, 'bibingka20', 'Mary Hannah', 'Reyes', 'reyesmaryhannahcaryl@gmail.com', '$2y$12$7aAuFyzyNrWoggmlULLs.uNvq.eDC/xdE5d47cWSVEMelo9yfx9J6', '09155467893', '2003-09-20', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1758658742_ad1a4e7a75a03e728733f0b57fc630b4.png', 'Malinis St', 1, 'Admin', NULL, NULL, NULL, '2025-09-17 15:15:25', '2025-09-26 05:06:32'),
(3, 'nicolevarga', 'Nicole', 'Varga', 'nicolevarga19@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1758830105_a11ee7755b3162260f143bdd0c673627.png', 'Guiguinto Bulacan', 1, 'Customer', NULL, NULL, NULL, '2025-09-17 15:15:25', '2025-09-25 19:55:05'),
(4, 'bibingkinitan', 'Jose', 'Rizal', 'joserizal@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1758141674_default.png', 'Guiguinto Bulacan', 1, 'Customer', NULL, NULL, NULL, '2025-09-17 15:15:25', '2025-09-17 20:43:22'),
(5, 'nicolevarga19@icloud.com', 'Mary Hannah', 'Caryl Reyes', 'nicolevarga191@icloud.com', '$2y$12$lSmnDUojHNEVP/uHjS0Gw.slqoH4cSN8.bBkiGJljWC3nof2kvMCW', '09155467893', '2025-09-17', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1758141674_default.png', 'Malinis St', 1, 'Customer', NULL, NULL, 'a562UjvBR40CkxGcMGqRckcGUpxivSjhZAIrcx4mi7AnLTjGtbF2VthkfQQlUZq0', '2025-09-17 15:33:00', '2025-09-17 20:42:57'),
(9, 'sypha', 'Mary Hannah', 'Caryl Reyes', 'oriontechnologies2025@gmail.com', '$2y$12$fFgobrI3ru4e/Ea2AenGN.gCgyA.0Si5vVdIew0kr4sWHEkDhHNeW', '09155467893', '2005-09-12', 'Male', 0, '', 'Malinis St', 1, 'Customer', NULL, NULL, 'WIiBwNwTYf1SVHVjzbFP31kehC0nDuwcUxeCu8FMExUUC7jPaiBjC7TwfRDpW39x', '2025-09-22 18:25:17', '2025-09-22 18:25:17'),
(10, 'sypha005', 'Mary Hannah', 'Caryl Reyes', 'reyesmaryhannahcaryl@icloud.com', '$2y$12$ZOZSp01yT9FQ17WqosCDgOESC91lC.Is0yhUwMx/nAq7UZ3HrZ/4a', '09155467893', '2025-09-04', 'Male', 0, '', 'Malinis St', 1, 'Customer', NULL, NULL, 'ACJLOc7zZL9733XXedAqaNv0PBMQB2NIQjMEe1DbP8O7Ssns3bbX0fcqg3h1mwSf', '2025-09-26 05:14:58', '2025-09-26 05:14:58');

-- --------------------------------------------------------

--
-- Table structure for table `user_images`
--

CREATE TABLE `user_images` (
  `imageID` int NOT NULL,
  `userID` int NOT NULL,
  `packageID` int DEFAULT NULL,
  `fileName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `filePath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `uploadDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `isPrivate` tinyint(1) DEFAULT '1',
  `tag` enum('normal','edited') COLLATE utf8mb4_general_ci DEFAULT 'normal',
  `isFavorite` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_images`
--

INSERT INTO `user_images` (`imageID`, `userID`, `packageID`, `fileName`, `filePath`, `uploadDate`, `isPrivate`, `tag`, `isFavorite`) VALUES
(12, 3, 1000, '503159355_687458820815386_350684634934584451_n (1).jpg', '/storage/uploads/nicolevarga/2302304f-63de-461a-bb60-0e432899d6bf.jpg', '2025-09-24 02:19:29', 0, NULL, 0),
(13, 3, 1000, '476492235_437660239368240_1805726521821437900_n.jpg', '/storage/uploads/nicolevarga/d23946ce-2432-43ff-bb3d-42d880f3484e.jpg', '2025-09-24 02:19:29', 0, NULL, 1),
(14, 3, 1000, '542909952_655529057152355_620943285992239300_n.jpg', '/storage/uploads/nicolevarga/4effb3db-a8ce-40eb-be86-106c0e9d57b3.jpg', '2025-09-24 02:19:29', 0, NULL, 1),
(15, 3, 1000, 'bubu-bubu-dudu.gif', '/storage/uploads/nicolevarga/40f14554-80f6-4a50-a75f-e8b09969e744.gif', '2025-09-24 02:19:30', 0, NULL, 1),
(16, 3, 1000, '7eeb4f73-4f6e-4f94-82eb-47620a8c6552.jfif', '/storage/uploads/nicolevarga/df493197-634f-4121-acd5-88349686254b.jfif', '2025-09-24 02:19:30', 0, NULL, 0),
(18, 3, 1000, '486161747_1063002129190529_8410035644612379503_n.jpg', '/storage/uploads/nicolevarga/9a5f3e92-ab21-4ab2-a704-f796f3501622.jpg', '2025-09-26 13:09:17', 0, NULL, 1),
(20, 2, 1002, 'download (2).png', '/storage/uploads/bibingka20/cf9a762c-f373-4118-ae66-0490fa3dc080.png', '2025-09-26 17:21:38', 0, NULL, 0),
(21, 3, 1000, 'download (2).png', '/storage/uploads/nicolevarga/9fa58fe0-b8a5-42cd-8788-90a60ca6e2b8.png', '2025-09-26 17:21:57', 0, NULL, 0),
(22, 3, 1000, 'ce5de68e-ac01-4598-84c2-397ac9876588.jfif', '/storage/uploads/nicolevarga/0fff1741-0b59-46f2-8cff-db9286ee8c98.jfif', '2025-09-30 01:22:34', 0, NULL, 0),
(23, 3, 1000, '555445142_805442515578481_3738512996381729699_n.jpg', '/storage/uploads/nicolevarga/b302f74e-287e-4038-bf74-5e0da60b972f.jpg', '2025-09-30 01:40:48', 0, NULL, 0),
(24, 3, 1000, '555445142_805442515578481_3738512996381729699_n.jpg', '/storage/uploads/nicolevarga/c99d855f-c479-4215-b273-757993a7f9a6.jpg', '2025-09-30 01:46:22', 0, NULL, 0),
(25, 3, 1000, '68c7b1557f46c7c35550388c2fb0eb3c.png', '/storage/uploads/nicolevarga/ab9f118d-07f8-4278-95e2-b3d1dd1fbd70.png', '2025-09-30 01:48:51', 0, NULL, 0),
(26, 3, 1000, '555445142_805442515578481_3738512996381729699_n.jpg', '/storage/uploads/nicolevarga/d861e731-b909-4efa-9b90-15558ef9b7f8.jpg', '2025-09-30 01:49:06', 0, NULL, 0),
(27, 3, 1000, '5ab83915e34bd360296ef170adfb60e7.png', '/storage/uploads/nicolevarga/755a3ca5-c9b5-4bc3-aa53-4fcff2cc5f64.png', '2025-09-30 02:13:42', 0, NULL, 0),
(28, 3, 1000, '68c7b1557f46c7c35550388c2fb0eb3c.png', '/storage/uploads/nicolevarga/950dff33-bb2d-4aee-97ac-b345f8e06975.png', '2025-09-30 02:33:42', 0, NULL, 0),
(29, 3, 1000, '5ab83915e34bd360296ef170adfb60e7.png', '/storage/uploads/nicolevarga/be78a121-4369-4a9c-8a5d-3b9b46b0defa.png', '2025-09-30 02:40:01', 0, NULL, 0),
(30, 3, 1001, '503159355_687458820815386_350684634934584451_n.jpg', '/storage/uploads/nicolevarga/3fb43fee-a4ef-45f0-aa96-800c5e06e17d.jpg', '2025-09-30 02:41:36', 0, NULL, 0),
(31, 3, 1001, '503159355_687458820815386_350684634934584451_n.jpg', '/storage/uploads/nicolevarga/e94d4ea5-3e6c-4a03-bc7e-b70772c7d0d5.jpg', '2025-09-30 02:41:36', 0, NULL, 0),
(32, 3, 1001, 'cors.PNG', '/storage/uploads/nicolevarga/7a391128-1b0f-42ec-bda3-5e6380a5c294.PNG', '2025-09-30 15:19:12', 0, NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`bookingID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `packageID` (`packageID`);

--
-- Indexes for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  ADD PRIMARY KEY (`bookingAddOnID`),
  ADD KEY `bookingID` (`bookingID`),
  ADD KEY `addOnID` (`addOnID`);

--
-- Indexes for table `booking_concepts`
--
ALTER TABLE `booking_concepts`
  ADD PRIMARY KEY (`bookingConceptID`),
  ADD KEY `bookingID` (`bookingID`),
  ADD KEY `conceptID` (`conceptID`);

--
-- Indexes for table `booking_request`
--
ALTER TABLE `booking_request`
  ADD PRIMARY KEY (`requestID`),
  ADD KEY `bookingID` (`bookingID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favoriteID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `packageID` (`packageID`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageID`),
  ADD KEY `senderID` (`senderID`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `bookingID` (`bookingID`),
  ADD KEY `transID` (`transID`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`packageID`),
  ADD KEY `setID` (`setID`);

--
-- Indexes for table `package_add_ons`
--
ALTER TABLE `package_add_ons`
  ADD PRIMARY KEY (`addOnID`);

--
-- Indexes for table `package_add_on_mapping`
--
ALTER TABLE `package_add_on_mapping`
  ADD KEY `addOnID` (`addOnID`),
  ADD KEY `packageID` (`packageID`);

--
-- Indexes for table `package_concept`
--
ALTER TABLE `package_concept`
  ADD PRIMARY KEY (`conceptID`);

--
-- Indexes for table `package_images`
--
ALTER TABLE `package_images`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `packageID` (`packageID`);

--
-- Indexes for table `package_sets`
--
ALTER TABLE `package_sets`
  ADD PRIMARY KEY (`setID`);

--
-- Indexes for table `package_sets_mapping`
--
ALTER TABLE `package_sets_mapping`
  ADD KEY `conceptID` (`conceptID`),
  ADD KEY `setID` (`setID`);

--
-- Indexes for table `package_types`
--
ALTER TABLE `package_types`
  ADD PRIMARY KEY (`typeID`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_sessions`
--
ALTER TABLE `payment_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_sessions_booking_id_payment_type_index` (`booking_id`,`payment_type`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_transactions_booking_id_index` (`booking_id`),
  ADD KEY `payment_transactions_payment_type_index` (`payment_type`),
  ADD KEY `payment_transactions_transaction_date_index` (`transaction_date`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`transId`),
  ADD KEY `bookingId` (`bookingId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `user_images`
--
ALTER TABLE `user_images`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `packageID` (`packageID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `bookingID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  MODIFY `bookingAddOnID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `booking_concepts`
--
ALTER TABLE `booking_concepts`
  MODIFY `bookingConceptID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `booking_request`
--
ALTER TABLE `booking_request`
  MODIFY `requestID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `packageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1019;

--
-- AUTO_INCREMENT for table `package_add_ons`
--
ALTER TABLE `package_add_ons`
  MODIFY `addOnID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `package_concept`
--
ALTER TABLE `package_concept`
  MODIFY `conceptID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `package_images`
--
ALTER TABLE `package_images`
  MODIFY `imageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `package_sets`
--
ALTER TABLE `package_sets`
  MODIFY `setID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `package_types`
--
ALTER TABLE `package_types`
  MODIFY `typeID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_sessions`
--
ALTER TABLE `payment_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `transId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_images`
--
ALTER TABLE `user_images`
  MODIFY `imageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);

--
-- Constraints for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  ADD CONSTRAINT `booking_add_ons_ibfk_1` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`),
  ADD CONSTRAINT `booking_add_ons_ibfk_2` FOREIGN KEY (`addOnID`) REFERENCES `package_add_ons` (`addOnID`);

--
-- Constraints for table `booking_concepts`
--
ALTER TABLE `booking_concepts`
  ADD CONSTRAINT `booking_concepts_ibfk_1` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`),
  ADD CONSTRAINT `booking_concepts_ibfk_2` FOREIGN KEY (`conceptID`) REFERENCES `package_concept` (`conceptID`);

--
-- Constraints for table `booking_request`
--
ALTER TABLE `booking_request`
  ADD CONSTRAINT `booking_request_ibfk_1` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_request_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`setID`) REFERENCES `package_sets` (`setID`);

--
-- Constraints for table `package_add_on_mapping`
--
ALTER TABLE `package_add_on_mapping`
  ADD CONSTRAINT `package_add_on_mapping_ibfk_1` FOREIGN KEY (`addOnID`) REFERENCES `package_add_ons` (`addOnID`),
  ADD CONSTRAINT `package_add_on_mapping_ibfk_2` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);

--
-- Constraints for table `package_images`
--
ALTER TABLE `package_images`
  ADD CONSTRAINT `package_images_ibfk_1` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);

--
-- Constraints for table `package_sets_mapping`
--
ALTER TABLE `package_sets_mapping`
  ADD CONSTRAINT `package_sets_mapping_ibfk_1` FOREIGN KEY (`conceptID`) REFERENCES `package_concept` (`conceptID`),
  ADD CONSTRAINT `package_sets_mapping_ibfk_2` FOREIGN KEY (`setID`) REFERENCES `package_sets` (`setID`);

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`bookingID`);

--
-- Constraints for table `user_images`
--
ALTER TABLE `user_images`
  ADD CONSTRAINT `user_images_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `user_images_ibfk_2` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
