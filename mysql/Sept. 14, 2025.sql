-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 14, 2025 at 01:59 PM
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
-- Database: `selfiegram4`
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
  `paymentMethod` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `paymentStatus` tinyint NOT NULL,
  `subTotal` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `rem` decimal(10,2) NOT NULL,
  `receivedAmount` decimal(10,2) NOT NULL,
  `feedback` text COLLATE utf8mb4_general_ci,
  `rating` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`bookingID`, `userID`, `packageID`, `bookingDate`, `bookingStartTime`, `bookingEndTime`, `status`, `customerName`, `customerContactNo`, `customerEmail`, `customerAddress`, `date`, `paymentMethod`, `paymentStatus`, `subTotal`, `total`, `rem`, `receivedAmount`, `feedback`, `rating`) VALUES
(3, 2, 1004, '2025-07-22', '16:00:00', '17:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'reyesmaryhannahcaryl@gmail.com', 'Malinis St', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, NULL, 0),
(5, 3, 1001, '2025-08-05', '13:00:00', '14:00:00', 0, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 479.00, 479.00, 279.00, 200.00, 'dwddw', 1),
(6, 3, 1014, '2025-09-13', '13:00:00', '14:00:00', 2, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 2999.00, 2999.00, 2799.00, 200.00, '', NULL),
(7, 3, 1013, '2025-08-05', '15:00:00', '16:00:00', 1, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, 'Nice service. Would recommend!', 5),
(8, 4, 1000, '2025-09-12', '10:00:00', '11:00:00', 2, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-07', 'GCash', 1, 379.00, 379.00, 0.00, 379.00, NULL, NULL),
(9, 4, 1010, '2025-09-11', '09:00:00', '10:00:00', 2, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-07', 'GCash', 0, 3999.00, 3999.00, 3799.00, 200.00, NULL, NULL);

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
(57, 2, 1000, '2025-07-22 20:50:53'),
(65, 3, 1000, '2025-07-25 18:19:01'),
(66, 3, 1001, '2025-07-25 18:19:07'),
(91, 4, 1000, '2025-09-07 14:27:24');

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
  `senderID` int DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('primary','support','promo') COLLATE utf8mb4_general_ci DEFAULT 'primary',
  `sentAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(4, '2025_06_30_121411_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `packageID` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`packageID`, `name`, `description`, `price`, `status`) VALUES
(1000, 'Selfie for ONE', 'Suitable for 1 person\r\n10 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options. 7 digital copies', 379.00, 1),
(1001, 'Selfie for TWO', 'Suitable for up to 2 people, including a free baby or fur baby\r\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\r\n7 digital copies\r\n2 printed copies (4R - 1 portrait and 1 grid)', 479.00, 1),
(1002, 'Squad Groupie', 'Suitable for 3 to 4 people, including a free baby or fur baby\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\n7 digital copies\n2 printed copies (4R - 1 portrait and 1 grid)\'', 699.00, 1),
(1003, 'Barkada Groupie', 'Good for 8 persons\n20 mins unlimited self shoot\n1 backdrop of your choice\n10 digital copies\n2 printed copies (4R)', 899.00, 1),
(1004, 'Concept Studio', 'Good for 2 persons\n20 mins unlimited self shoot\n1 chosen plain backdrop\n1 chosen concept backdrop\nBohemian Dream and Chingu Pink', 749.00, 1),
(1005, 'Graduation PREMIUM', '15 minutes UNLIMITED Photoshoot with a photographer\nUse of Graduation Backdrop\n4 ENHANCED photos\nFREE Ecobag\n1 x A4 Photo\n1 x A4 Glass to Glass Frame\n1 x 5R Photo\n4 x Wallet Size Photos (2.5\" x 3.5\")', 1199.00, 1),
(1006, 'Graduation ELITE', '30 minutes UNLIMITED Photoshoot with a photographer\nUse of Graduation Backdrop\nUse of 1 Chosen Plain Backdrop\n8 ENHANCED photos\nFREE Ecobag\n1 x A4 Photo\n1 x A4 Glass to Glass Frame\n1 x 5R Photo\n4 x Wallet Size Photos (Toga)\n4 x Wallet Size Photos (Formal)\nPackages are good for 1 pax only\nAdditional P200 for Toga with accent color (White/Black) — only 1 set per color provided\nFree use of Barong/Filipiniana (Different colors available depending on size)\nKindly bring your measurement for the Barong/Filipiniana\nHMUA available upon request', 1499.00, 1),
(1007, 'Studio Rental', 'Suitable for 1 to 4 people\n1-hour unlimited self-shoot\nAccess to all plain backdrops\nFree access to one chosen concept from the aesthetic backdrop options (Bohemian Dream, Chingu Pink, etc.)\nAll digital copies included\nFree use of all equipment\nIdeal For: Barkada, Family, Maternity, and Pre-nup self-photoshoots\nAdd-ons Available: Additional pax with an extra fee', 1499.00, 1),
(1008, 'Vogue Photoshoot', 'For 1 model\n1-hour photoshoot with a senior female photographer\nIncludes all soft copies (edited and enhanced)\nAccess to 6 backdrop colors and 3 unique concepts (Spotlight, Bohemian Dream, Chingu Pink)\nIncludes 1 printed copy (4R size) and 1 printed copy (A4 size)', 3999.00, 1),
(1009, 'Kiddie Photoshoot', '30 mins photoshoot of the celebrant + 2 parents & 1 sibling\n30 mins photoshoot with photographer\nCreative directions by photographer included\n1 chosen theme backdrop\nAccess to 1 plain backdrop\n10 digital copies\nAll raw copies will be shared\n2 free prints\nFree use of costume theme\nFree use of props\nBirthday cake smash is allowed (bring outfit for cake smash)\nAvailable Themes: Princess, Safari, Unicorn, Race Car, Boho, Outer Space', 2499.00, 1),
(1010, 'Maternity Photoshoot', '1 hr photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to all concepts\nAll enhanced digital copies\nFree maternity costumes and props\nFamily photoshoot included\nPrinted copy included', 3999.00, 1),
(1011, 'Newborn Baby Photoshoot', 'Good for 1 newborn and 2 family members\n1 hr photoshoot with photographer\nCreative directions by photographer included\n2 homy sets with costumes and props\nAll enhanced digital copies\nFamily photoshoot included\nPrinted copy included\nBest time for newborn photoshoot is between 6 to 14 days old; however, this package is also applicable for baby monthly milestone photoshoots.', 3999.00, 1),
(1012, 'Initimate Gender Reveal', '1 hour photoshoot with photographer\nCreative directions by photographer included\nIncludes static video coverage and a 1-minute edited video\nProps included (paint, balloons, and poppers)\nAll enhanced digital copies\nPrinted copy included', 4499.00, 1),
(1013, 'Birthday', 'Good for 1 pax\n20 minutes unlimited self-shoot on chosen plain backdrop\nPlus 5 minutes photoshoot with photographer (choose 1 concept)\n7 digital copies\nFree 2 printed copies (4R)\nFree birthday sash and headband\n2 free number balloons\nNote: Free headband comes with sash sample\nNote: Additional pax is applicable for this package', 749.00, 1),
(1014, 'Family Photoshoot', 'Good for 5 family members\nCan add additional family members\n1 hour photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to 1 chosen concept\nAll enhanced digital copies\nProps included\nPrinted copies included', 2999.00, 1),
(1015, 'Pre Nup Photoshoot', 'Good for 1 couple\nCan add family members\n1 hour photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to 1 chosen concept\nAll enhanced digital copies\nPrinted copies included', 2999.00, 1),
(1016, 'Student Groupie', 'Good for 10 pax\n50 minutes unlimited self-shoot\n1 backdrop of your choice (7 available backdrop options)\n10 digital copies\n4 printed copies (4R) – 3 portrait and 1 band*\nFor students only (present ID with current school year)', 1499.00, 1),
(1017, 'Solo Graduation', 'Good for 1 pax\n20 minutes unlimited self-shoot and poses on graduation backdrop and 1 plain backdrop\nFree use of full toga set with academic hood and cap, or Barong / Filipiniana\n7 digital copies\nFree 2 printed copies', 1749.00, 1),
(1018, 'Barkada Graduation', 'Good for 4 pax\n30 minutes unlimited self-shoot and poses on graduation backdrop with 1 plain backdrop\nFree use of full toga set with academic hood, cap, and Barong or Filipiniana\n7 digital copies\nFree 4 printed copies\nCollege – Black Toga\nSenior High – Blue & Pink Toga\nKindergarten – Blue & Pink Toga\nNote: Kindly bring your measurement for the Barong or Filipiniana', 1999.00, 1);

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
(1013, 1),
(1016, 1),
(1018, 1),
(1004, 2),
(1007, 2),
(1013, 2),
(1005, 3),
(1006, 3),
(1008, 3),
(1009, 3),
(1010, 3),
(1011, 3),
(1012, 3),
(1014, 3),
(1015, 3),
(1017, 3),
(1018, 3),
(1005, 4),
(1006, 4),
(1017, 4),
(1018, 4);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expired_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `expired_at`, `created_at`) VALUES
('nicolevarga19@icloud.com', '', NULL, NULL),
('reyesmaryhannahcaryl@gmail.com', '', NULL, NULL),
('santosmikoallen@gmail.com', '', NULL, NULL);

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
('74AK60uBOH89i2ytUdNDS6ZlOuGV6Lk0lGyffH8e', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZE4xNXc3dU1leENUandGTkRxdjJMemJ6UkdLM3VaVXdCVWZpSVNXcyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206258),
('9EXrbn4OYq1JTXfLq86E0x4bOOZYK0OYijF6iw7a', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMm5jd1Jlb2dLMFNQa21vZFQ5b1BmRjBBUFFiNHRpTndPYzV0cWdUUyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206338),
('bUoXAToRzTZgt3lLFLtdS6td2H42p79npIixFdeJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWWdBVVhqaEN5M0lrdEljM0M2Q2tXWE53TkMyNGZLWHhNZ2k2Q3JpVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206563),
('ey8vzns0s5SgcT8lQYg2ZQJe3uPTGDhaTVMkzo5k', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWGJqZ3huS29CUUNnUUhtMWJkNWFQaElvOXlsdnZ5MmE4WUh0cHZ4dSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXVwbG9hZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1752776237),
('jaRRPOtpoDDBqhhBgFVguggpZtiqS72TOh2a1G0F', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS2o0VEpuNEw5bGNXNW5VblNLOFpFb1JpeVRqZmtlSElvTXRhUkdZRyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206153),
('KcZt2PovRUihynRdTusjsmKDtAWOj059OtlJvwAf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYnl0TDB2WGowazJxNXBXbVp6dGZoM1NEV2VVMFhCZmxXODBwZVJZaCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756202191),
('KDR40m2A5Wel6LFmY153Y625zZpUw518E1XG773v', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic1kwVW41cFJaUzVCdmlTdzE2RG5xTHJMWHhwT004allKVGdsN2tpVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756202282),
('mhJRGZgBod063HxNX9VpUFzsL9RhooHSp3cncUDx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieUlKN1N2cDBBNlVKdkNoMVZ3bDA4MVJ0S29xR2ZObWpETDVxbTZaUyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206396),
('PNWT0m6pWglXDoyyrBqg3bHYlKSbTZctCCkVSHU7', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibE5jM0g1NUpLR1Q5b21HS09tUGVBQmw0bTB1MEdsMUY5R0tzZmVIVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756202100);

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
(5, 8, 379.00, 1, '2025-09-07', 379.00, 'GCash', 0.00),
(6, 9, 3999.00, 0, '2025-09-07', 200.00, 'GCash', 3799.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `lname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `fname`, `lname`, `email`, `password`, `contactNo`, `birthday`, `gender`, `status`, `profilePicture`, `address`, `archive`, `userType`, `reset_otp`, `otp_expires_at`, `email_verification`, `created_at`, `updated_at`) VALUES
(1, 'okim', 'Miko Allen', 'Santos', 'santosmikoallen@gmail.com', '$2y$12$5fiTMf0S/7ll.UcIeQYhIuLKKsuObtkuv4iWZT3ahxXaokqIR6ybm', '09292902337', '2003-03-26', 'Male', 0, 'http://192.168.1.198:8000/storage/profile_photos/1754898438_IMG_2646.jpeg', 'San Juan', 1, 'Admin', NULL, NULL, NULL, '2025-09-14 11:58:51', '2025-09-14 11:58:51'),
(2, 'bibingka20', 'Mary Hannah', 'Reyes', 'reyesmaryhannahcaryl@gmail.com', '$2y$12$7aAuFyzyNrWoggmlULLs.uNvq.eDC/xdE5d47cWSVEMelo9yfx9J6', '09155467893', '2003-09-20', 'Female', 0, 'http://192.168.1.198:8000/storage/profile_photos/1754250971_ph-11134207-7ra0p-mchwszm552lqa1@resize_w450_nl.png', 'Malinis St', 1, 'Admin', NULL, NULL, NULL, '2025-09-14 11:58:51', '2025-09-14 11:58:51'),
(3, 'nicolevarga', 'Nicole', 'Varga', 'nicolevarga19@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.198:8000/storage/profile_photos/1753979174_cn-11134207-7r98o-lqiyxv5mt6hkd2.webp', 'Guiguinto Bulacan', 1, 'Customer', NULL, NULL, NULL, '2025-09-14 11:58:51', '2025-09-14 11:58:51'),
(4, 'mabu', 'Mabu', 'Dela Saint', 'itsmabu26@gmail.com', '$2y$12$iISS5zy1IcWR/fAN/MoArePI7z.CdGSc7X67N7Fz.e9hcoprwYzv.', '09292902337', '2003-03-26', 'Male', 0, 'http://192.168.1.198:8000/storage/profile_photos/1757255227_Screenshot 2024-02-28 214556.png', 'Taguig City', 1, 'Customer', NULL, NULL, NULL, '2025-09-14 11:58:51', '2025-09-14 11:58:51');

-- --------------------------------------------------------

--
-- Table structure for table `user_activity`
--

CREATE TABLE `user_activity` (
  `id` int NOT NULL,
  `userID` int NOT NULL,
  `activity_type` enum('login','booking','profile_update','favorite_add') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `user_messages`
--

CREATE TABLE `user_messages` (
  `userMessageID` int NOT NULL,
  `messageID` int NOT NULL,
  `userID` int NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `isStarred` tinyint(1) DEFAULT '0',
  `isDeleted` tinyint(1) DEFAULT '0'
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
  ADD KEY `packageID` (`packageID`),
  ADD KEY `idx_date_status` (`date`,`status`),
  ADD KEY `idx_booking_date` (`bookingDate`);

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
  ADD KEY `booking id` (`bookingId`),
  ADD KEY `idx_date_payment` (`date`,`paymentStatus`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- Indexes for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userID` (`userID`);

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
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `bookingID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `transId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_images`
--
ALTER TABLE `user_images`
  MODIFY `imageID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_messages`
--
ALTER TABLE `user_messages`
  MODIFY `userMessageID` int NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `booking id` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`bookingID`);

--
-- Constraints for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `user_activity_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

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
