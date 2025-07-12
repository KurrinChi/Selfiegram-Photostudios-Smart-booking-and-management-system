-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 12, 2025 at 11:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `selfiegram`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `bookingID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `packageID` int(11) NOT NULL,
  `bookingDate` date NOT NULL,
  `bookingStartTime` time NOT NULL,
  `bookingEndTime` time NOT NULL,
  `status` tinyint(4) NOT NULL,
  `customerName` varchar(255) NOT NULL,
  `customerContactNo` varchar(255) NOT NULL,
  `customerEmail` varchar(255) NOT NULL,
  `customerAddress` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `paymentStatus` tinyint(4) NOT NULL,
  `subTotal` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `rem` decimal(10,2) NOT NULL,
  `receivedAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favoriteID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `packageID` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`favoriteID`, `userID`, `packageID`, `createdAt`) VALUES
(27, 2, 1002, '2025-07-12 20:48:17'),
(28, 2, 1000, '2025-07-12 20:48:52'),
(36, 2, 1001, '2025-07-12 21:02:27'),
(37, 3, 1004, '2025-07-12 21:03:03');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int(11) NOT NULL,
  `senderID` int(11) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `type` enum('primary','support','promo') DEFAULT 'primary',
  `sentAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_06_30_121411_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `packageID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`packageID`, `name`, `description`, `price`, `status`) VALUES
(1000, 'Selfie for ONE', 'Suitable for 1 person\r\n10 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options. 7 digital copies', 379.00, 1),
(1001, 'Selfie for TWO', 'Suitable for up to 2 people, including a free baby or fur baby\r\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\r\n7 digital copies\r\n2 printed copies (4R - 1 portrait and 1 grid)', 479.00, 1),
(1002, 'Squad Groupie', 'Suitable for 3 to 4 people, including a free baby or fur baby\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\n7 digital copies\n2 printed copies (4R - 1 portrait and 1 grid)\'', 699.00, 1),
(1003, 'Barkada Groupie', 'Good for 8 persons\n20 mins unlimited self shoot\n1 backdrop of your choice\n10 digital copies\n2 printed copies (4R)', 899.00, 1),
(1004, 'Concept Studio', 'Good for 2 persons\r\n20 mins unlimited self shoot\r\n1 chosen plain backdrop\r\n1 chosen concept backdrop\r\nBohemian Dream\r\nChingu Pink\r\n', 749.00, 1),
(1005, 'Graduation PREMIUM', '• 15 minutes UNLIMITED Photoshoot with a photographer\n• Use of Graduation Backdrop\n• 4 ENHANCED photos\n• FREE Ecobag\n\nPRINTS:\n• 1 x A4 Photo\n• 1 x A4 Glass to Glass Frame\n• 1 x 5R Photo\n• 4 x Wallet Size Photos (2.5\" x 3.5\")\n', 1199.00, 1),
(1006, 'Graduation ELITE', '• 30 minutes UNLIMITED Photoshoot with a photographer\n• Use of Graduation Backdrop\n• Use of 1 Chosen Plain Backdrop\n• 8 ENHANCED photos\n• FREE Ecobag\n\nPRINTS:\n• 1 x A4 Photo\n• 1 x A4 Glass to Glass Frame\n• 1 x 5R Photo\n• 4 x Wallet Size Photos (Toga)\n• 4 x Wallet Size Photos (Formal)\n\nNOTES:\n• Packages are good for 1 pax only\n• Additional P200 for Toga with accent color (White/Black) — only 1 set per color provided\n• Free use of Barong/Filipiniana (Different colors available depending on size)\n• Kindly bring your measurement for the Barong/Filipiniana\n• HMUA available upon request', 1499.00, 1),
(1007, 'Studio Rental', 'Suitable for 1 to 4 people\n1-hour unlimited self-shoot\nAccess to all plain backdrops\nFree access to one chosen concept from the aesthetic backdrop options (Bohemian Dream, Chingu Pink, etc.)\nAll digital copies included\nFree use of all equipment\nIdeal For: Barkada, Family, Maternity, and Pre-nup self-photoshoots\nAdd-ons Available: Additional pax with an extra fee', 1499.00, 1),
(1008, 'Vogue Photoshoot', 'For 1 model\n1-hour photoshoot with a senior female photographer\nIncludes all soft copies (edited and enhanced)\nAccess to 6 backdrop colors and 3 unique concepts (Spotlight, Bohemian Dream, Chingu Pink)\nIncludes 1 printed copy (4R size) and 1 printed copy (A4 size)', 3999.00, 1),
(1009, 'Kiddie Photoshoot', '• 30 mins photoshoot of the celebrant + 2 parents & 1 sibling\r\n• 30 mins photoshoot w/ photographer\r\n• Creative directions by photographer included\r\n• 1 chosen theme backdrop\r\n• Access to 1 plain backdrop\r\n• 10 digital copies\r\n• All raw copies will be shared\r\n• 2 free prints\r\n• Free use of costume theme\r\n• Free use of props\r\n• Birthday cake smash is allowed (bring outfit for cake smash)\r\n\r\nAVAILABLE THEMES\r\n• Princess\r\n• Safari\r\n• Unicorn\r\n• Race Car\r\n• Boho\r\n• Outer Space\r\n', 2499.00, 1),
(1010, 'Maternity Photoshoot', '• 1 hr photoshoot w/ photographer\n• Creative directions by photographer included\n• All plain backdrops & access to all concepts\n• All enhanced digital copies\n• Free maternity costumes & props\n• Family photoshoot included\n• Printed copy included', 3999.00, 1),
(1011, 'Newborn Baby Photoshoot', '• Good for 1 newborn + 2 family members\n• 1 hr photoshoot w/ photographer\n• Creative directions by photographer included\n• 2 homy sets + costumes & props\n• All enhanced digital copies\n• Family photoshoot included\n• Printed copy included\n\nBest time for newborn photoshoot is between 6 to 14 days old, however, this package is also applicable for baby monthly milestone photoshoot.', 3999.00, 1),
(1012, 'Initimate Gender Reveal', '• 1 hour Photoshoot with Photographer\n• Creative directions by photographer included\n• With Static Video Coverage and 1 minute Edited Video\n• Props included (Paint, Balloons & Poppers)\n• All enhanced Digital copies\n• Printed Copy included', 4499.00, 1),
(1013, 'Birthday', '• Good for 1 pax\n• 20 mins unlimited self shoot on chosen plain backdrop\n• PLUS 5 mins photoshoot with Photographer (choose 1 concept)\n• 7 Digital copies\n• Free 2 printed copies (4R)\n• Free Birthday sash & headband\n• 2 free number balloons\n\nNote: Free headband with sash sample\nNote: Additional pax is applicable here', 749.00, 1),
(1014, 'Family Photoshoot', '• Good for 5 family members\n• Can add family members\n• 1 hr photoshoot w/ photographer\n• Creative directions by photographer included\n• All plain backdrops & access to 1 chosen concept\n• All enhanced digital copies\n• Props included\n• Printed copies included\n', 2999.00, 1),
(1015, 'Pre Nup Photoshoot', '• Good for 1 couple\r\n• Can add family members\r\n• 1 hr photoshoot w/ photographer\r\n• Creative directions by photographer included\r\n• All plain backdrops & access to 1 chosen concept\r\n• All enhanced digital copies\r\n• Printed copies included\r\n', 2999.00, 1),
(1016, 'Student Groupie', '• Good for 10 pax\r\n• 50 mins unlimited self shoot\r\n• 1 backdrop of your choice (7 choices of backdrop)\r\n• 10 digital copies\r\n• 4 printed copies (4R) [3 portrait & 1 band*]\r\n• For students only (present ID with current school year)\r\n', 1499.00, 1),
(1017, 'Solo Graduation', '• Good for 1 pax\r\n• 20 mins unlimited self shoot & poses on Graduation backdrop & 1 plain backdrop\r\n• Free use of full Toga set w/ academic hood & cap or Barong / Filipiniana\r\n• 7 Digital copies\r\n• Free 2 printed copies\r\n', 1749.00, 1),
(1018, 'Barkada Graduation', '• Good for 4 pax\r\n• 30 mins unlimited self shoot & poses on Graduation backdrop w/ 1 plain backdrop\r\n• Free use of full Toga set w/ academic hood cap & Barong or Filipiniana\r\n• 7 digital copies\r\n• Free 4 printed copies\r\n\r\nAcademic hood\r\nCollege (Black Toga)\r\nSenior High (Blue & Pink Toga)\r\nKindergarten (Blue & Pink Toga)\r\n\r\nNow available\r\n\r\nNote: Kindly bring your measurement for the Barong/Filipiniana\r\n', 1999.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `package_images`
--

CREATE TABLE `package_images` (
  `imageID` int(11) NOT NULL,
  `packageID` int(11) NOT NULL,
  `imagePath` varchar(255) NOT NULL
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
-- Table structure for table `package_types`
--

CREATE TABLE `package_types` (
  `typeID` int(11) NOT NULL,
  `typeName` varchar(100) NOT NULL
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
  `packageID` int(11) NOT NULL,
  `typeID` int(11) NOT NULL
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
(1018, 4);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('9h0qCZbsAfilC1i4MznxUW0Fn6SohBsB7kxRfsVX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNkJldlVYTjRmOU5hNHdleHo2VjBsVmpVYndLOUdvUDZDVDRXRVNjQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYi10ZXN0Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1751819365),
('Xp4BBOWaiSGM0XEE1kU9iiVYWLGpLJwJLNDq4c0E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialRBR3l1RWJ0OGVUOE5qZTR1OFphdnlKN2NEcDVPcG1YN1NUb2JhdCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYi10ZXN0Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1751655960);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `transId` int(11) NOT NULL,
  `bookingId` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentStatus` tinyint(4) NOT NULL,
  `date` date NOT NULL,
  `receivedAmount` double(10,2) NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `rem` double(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `contactNo` varchar(255) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `profilePicture` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `archive` tinyint(4) NOT NULL,
  `userType` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `fname`, `lname`, `email`, `password`, `contactNo`, `status`, `profilePicture`, `address`, `archive`, `userType`) VALUES
(1, 'okim', 'Miko', 'Santos', 'santosmikoallen@gmail.com', '$2y$12$5fiTMf0S/7ll.UcIeQYhIuLKKsuObtkuv4iWZT3ahxXaokqIR6ybm', '09292902337', 0, '', 'San Juan', 1, 'Admin'),
(2, 'bibingka20', 'Mary', 'Hannah', 'reyesmaryhannahcaryl@gmail.com', '$2y$12$7aAuFyzyNrWoggmlULLs.uNvq.eDC/xdE5d47cWSVEMelo9yfx9J6', '09155467893', 0, '', 'Malinis St', 1, 'Customer'),
(3, 'reyesmaryhannahcaryl@gmail.com', 'Nicole', 'Varga', 'nicolevarga19@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '091554', 0, '', 'Guiguinto Bulacan', 1, 'Customer');

-- --------------------------------------------------------

--
-- Table structure for table `user_images`
--

CREATE TABLE `user_images` (
  `imageID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `packageID` int(11) DEFAULT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `uploadDate` datetime DEFAULT current_timestamp(),
  `isPrivate` tinyint(1) DEFAULT 1,
  `tag` enum('normal','edited') DEFAULT 'normal',
  `isFavorite` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_messages`
--

CREATE TABLE `user_messages` (
  `userMessageID` int(11) NOT NULL,
  `messageID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `isStarred` tinyint(1) DEFAULT 0,
  `isDeleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD UNIQUE KEY `unique_favorite` (`userID`,`packageID`),
  ADD KEY `fk_fav_package` (`packageID`);

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
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`packageID`);

--
-- Indexes for table `package_images`
--
ALTER TABLE `package_images`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `packageID` (`packageID`);

--
-- Indexes for table `package_types`
--
ALTER TABLE `package_types`
  ADD PRIMARY KEY (`typeID`);

--
-- Indexes for table `package_type_mapping`
--
ALTER TABLE `package_type_mapping`
  ADD PRIMARY KEY (`packageID`,`typeID`),
  ADD KEY `typeID` (`typeID`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

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
  ADD KEY `booking id` (`bookingId`);

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
  ADD KEY `user_images_ibfk_1` (`userID`),
  ADD KEY `user_images_ibfk_2` (`packageID`);

--
-- Indexes for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD PRIMARY KEY (`userMessageID`),
  ADD KEY `messageID` (`messageID`),
  ADD KEY `userID` (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `transId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_images`
--
ALTER TABLE `user_images`
  MODIFY `imageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_messages`
--
ALTER TABLE `user_messages`
  MODIFY `userMessageID` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_fav_package` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `booking id` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`bookingID`);

--
-- Constraints for table `user_images`
--
ALTER TABLE `user_images`
  ADD CONSTRAINT `user_images_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `user_images_ibfk_2` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`);

--
-- Constraints for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD CONSTRAINT `user_messages_ibfk_1` FOREIGN KEY (`messageID`) REFERENCES `messages` (`messageID`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_messages_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
