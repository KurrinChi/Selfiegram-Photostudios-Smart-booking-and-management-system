-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 07:03 AM
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
-- Database: `test2`
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
  `receivedAmount` decimal(10,2) NOT NULL,
  `feedback` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`bookingID`, `userID`, `packageID`, `bookingDate`, `bookingStartTime`, `bookingEndTime`, `status`, `customerName`, `customerContactNo`, `customerEmail`, `customerAddress`, `date`, `paymentMethod`, `paymentStatus`, `subTotal`, `total`, `rem`, `receivedAmount`, `feedback`, `rating`) VALUES
(3, 2, 1004, '2025-07-22', '16:00:00', '17:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'reyesmaryhannahcaryl@gmail.com', 'Malinis St', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, NULL, 0),
(5, 3, 1001, '2025-08-05', '13:00:00', '14:00:00', 0, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 479.00, 479.00, 279.00, 200.00, 'dwddw', 1),
(6, 3, 1014, '2025-09-19', '15:00:00', '16:00:00', 2, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 2999.00, 2999.00, 2799.00, 200.00, '', NULL),
(7, 3, 1013, '2025-08-05', '15:00:00', '16:00:00', 1, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, 'Nice service. Would recommend!', 5),
(8, 4, 1000, '2025-09-20', '11:00:00', '12:00:00', 2, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-07', 'GCash', 1, 379.00, 379.00, 0.00, 379.00, NULL, NULL),
(9, 4, 1010, '2025-09-20', '16:00:00', '17:00:00', 2, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-07', 'GCash', 0, 3999.00, 3999.00, 3799.00, 200.00, NULL, NULL),
(10, 4, 1009, '2025-09-19', '13:00:00', '14:00:00', 2, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-08', 'GCash', 1, 2499.00, 2499.00, 0.00, 2499.00, NULL, NULL),
(11, 4, 1018, '2025-09-08', '13:00:00', '14:00:00', 1, 'Mabu Dela Saint', '09292902337', 'itsmabu26@gmail.com', 'Taguig City', '2025-09-08', 'GCash', 1, 1999.00, 1999.00, 0.00, 1999.00, 'gandaaa, recommend ko to sa iba!!', 5);

-- --------------------------------------------------------

--
-- Table structure for table `booking_add_ons`
--

CREATE TABLE `booking_add_ons` (
  `bookingAddOnID` int(11) NOT NULL,
  `bookingID` int(11) NOT NULL,
  `addOnID` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
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
(7, 10, 30, 1, 69.00),
(8, 11, 40, 1, 129.00),
(9, 3, 70, 1, 129.00),
(10, 5, 30, 2, 49.00);

-- --------------------------------------------------------

--
-- Table structure for table `booking_concepts`
--

CREATE TABLE `booking_concepts` (
  `bookingConceptID` int(11) NOT NULL,
  `bookingID` int(11) NOT NULL,
  `conceptID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_concepts`
--

INSERT INTO `booking_concepts` (`bookingConceptID`, `bookingID`, `conceptID`) VALUES
(1, 3, 101),
(2, 5, 104),
(3, 6, 102),
(4, 6, 105),
(5, 7, 100),
(8, 10, 108),
(9, 11, 109),
(10, 11, 100);

-- --------------------------------------------------------

--
-- Table structure for table `booking_request`
--

CREATE TABLE `booking_request` (
  `requestID` int(11) NOT NULL,
  `bookingID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `requestType` enum('reschedule','cancel') NOT NULL,
  `requestedDate` date DEFAULT NULL,
  `requestedStartTime` time DEFAULT NULL,
  `requestedEndTime` time DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','declined') DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_request`
--

INSERT INTO `booking_request` (`requestID`, `bookingID`, `userID`, `requestType`, `requestedDate`, `requestedStartTime`, `requestedEndTime`, `reason`, `status`, `requestDate`) VALUES
(1, 3, 2, 'reschedule', '2025-07-25', '15:00:00', '16:00:00', 'Conflict with schedule', 'pending', '2025-09-16 14:16:07'),
(2, 5, 3, 'cancel', NULL, NULL, NULL, 'Not available on that date', 'pending', '2025-09-16 14:16:07');

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
(57, 2, 1000, '2025-07-22 20:50:53'),
(65, 3, 1000, '2025-07-25 18:19:01'),
(66, 3, 1001, '2025-07-25 18:19:07'),
(99, 4, 1000, '2025-09-09 10:42:05'),
(100, 4, 1001, '2025-09-10 09:45:35');

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
  `setID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `duration` tinyint(4) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`packageID`, `setID`, `name`, `description`, `duration`, `price`, `status`) VALUES
(1000, 1, 'Selfie for ONE', 'Suitable for 1 person\r\n10 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options. 7 digital copies', 30, 379.00, 1),
(1001, 1, 'Selfie for TWO', 'Suitable for up to 2 people, including a free baby or fur baby\r\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\r\n7 digital copies\r\n2 printed copies (4R - 1 portrait and 1 grid)', 30, 479.00, 1),
(1002, 1, 'Squad Groupie', 'Suitable for 3 to 4 people, including a free baby or fur baby\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\n7 digital copies\n2 printed copies (4R - 1 portrait and 1 grid)\'', 30, 699.00, 1),
(1003, 1, 'Barkada Groupie', 'Good for 8 persons\n20 mins unlimited self shoot\n1 backdrop of your choice\n10 digital copies\n2 printed copies (4R)', 30, 899.00, 1),
(1004, 2, 'Concept Studio', 'Good for 2 persons\n20 mins unlimited self shoot\n1 chosen plain backdrop\n1 chosen concept backdrop\nBohemian Dream and Chingu Pink', 30, 749.00, 1),
(1005, 5, 'Graduation PREMIUM', '15 minutes UNLIMITED Photoshoot with a photographer\nUse of Graduation Backdrop\n4 ENHANCED photos\nFREE Ecobag\n1 x A4 Photo\n1 x A4 Glass to Glass Frame\n1 x 5R Photo\n4 x Wallet Size Photos (2.5\" x 3.5\")', 30, 1199.00, 1),
(1006, 3, 'Graduation ELITE', '30 minutes UNLIMITED Photoshoot with a photographer\nUse of Graduation Backdrop\nUse of 1 Chosen Plain Backdrop\n8 ENHANCED photos\nFREE Ecobag\n1 x A4 Photo\n1 x A4 Glass to Glass Frame\n1 x 5R Photo\n4 x Wallet Size Photos (Toga)\n4 x Wallet Size Photos (Formal)\nPackages are good for 1 pax only\nAdditional P200 for Toga with accent color (White/Black) — only 1 set per color provided\nFree use of Barong/Filipiniana (Different colors available depending on size)\nKindly bring your measurement for the Barong/Filipiniana\nHMUA available upon request', 30, 1499.00, 1),
(1007, 4, 'Studio Rental', 'Suitable for 1 to 4 people\n1-hour unlimited self-shoot\nAccess to all plain backdrops\nFree access to one chosen concept from the aesthetic backdrop options (Bohemian Dream, Chingu Pink, etc.)\nAll digital copies included\nFree use of all equipment\nIdeal For: Barkada, Family, Maternity, and Pre-nup self-photoshoots\nAdd-ons Available: Additional pax with an extra fee', 60, 1499.00, 1),
(1008, 4, 'Vogue Photoshoot', 'For 1 model\n1-hour photoshoot with a senior female photographer\nIncludes all soft copies (edited and enhanced)\nAccess to 6 backdrop colors and 3 unique concepts (Spotlight, Bohemian Dream, Chingu Pink)\nIncludes 1 printed copy (4R size) and 1 printed copy (A4 size)', 60, 3999.00, 1),
(1009, 4, 'Kiddie Photoshoot', '30 mins photoshoot of the celebrant + 2 parents & 1 sibling\n30 mins photoshoot with photographer\nCreative directions by photographer included\n1 chosen theme backdrop\nAccess to 1 plain backdrop\n10 digital copies\nAll raw copies will be shared\n2 free prints\nFree use of costume theme\nFree use of props\nBirthday cake smash is allowed (bring outfit for cake smash)\nAvailable Themes: Princess, Safari, Unicorn, Race Car, Boho, Outer Space', 30, 2499.00, 1),
(1010, 4, 'Maternity Photoshoot', '1 hr photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to all concepts\nAll enhanced digital copies\nFree maternity costumes and props\nFamily photoshoot included\nPrinted copy included', 60, 3999.00, 1),
(1011, 5, 'Newborn Baby Photoshoot', 'Good for 1 newborn and 2 family members\n1 hr photoshoot with photographer\nCreative directions by photographer included\n2 homy sets with costumes and props\nAll enhanced digital copies\nFamily photoshoot included\nPrinted copy included\nBest time for newborn photoshoot is between 6 to 14 days old; however, this package is also applicable for baby monthly milestone photoshoots.', 60, 3999.00, 1),
(1012, 4, 'Initimate Gender Reveal', '1 hour photoshoot with photographer\nCreative directions by photographer included\nIncludes static video coverage and a 1-minute edited video\nProps included (paint, balloons, and poppers)\nAll enhanced digital copies\nPrinted copy included', 60, 4499.00, 1),
(1013, 3, 'Birthday', 'Good for 1 pax\n20 minutes unlimited self-shoot on chosen plain backdrop\nPlus 5 minutes photoshoot with photographer (choose 1 concept)\n7 digital copies\nFree 2 printed copies (4R)\nFree birthday sash and headband\n2 free number balloons\nNote: Free headband comes with sash sample\nNote: Additional pax is applicable for this package', 30, 749.00, 1),
(1014, 4, 'Family Photoshoot', 'Good for 5 family members\nCan add additional family members\n1 hour photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to 1 chosen concept\nAll enhanced digital copies\nProps included\nPrinted copies included', 60, 2999.00, 1),
(1015, 4, 'Pre Nup Photoshoot', 'Good for 1 couple\nCan add family members\n1 hour photoshoot with photographer\nCreative directions by photographer included\nAll plain backdrops and access to 1 chosen concept\nAll enhanced digital copies\nPrinted copies included', 60, 2999.00, 1),
(1016, 1, 'Student Groupie', 'Good for 10 pax\n50 minutes unlimited self-shoot\n1 backdrop of your choice (7 available backdrop options)\n10 digital copies\n4 printed copies (4R) – 3 portrait and 1 band*\nFor students only (present ID with current school year)', 60, 1499.00, 1),
(1017, 3, 'Solo Graduation', 'Good for 1 pax\n20 minutes unlimited self-shoot and poses on graduation backdrop and 1 plain backdrop\nFree use of full toga set with academic hood and cap, or Barong / Filipiniana\n7 digital copies\nFree 2 printed copies', 30, 1749.00, 1),
(1018, 3, 'Barkada Graduation', 'Good for 4 pax\n30 minutes unlimited self-shoot and poses on graduation backdrop with 1 plain backdrop\nFree use of full toga set with academic hood, cap, and Barong or Filipiniana\n7 digital copies\nFree 4 printed copies\nCollege – Black Toga\nSenior High – Blue & Pink Toga\nKindergarten – Blue & Pink Toga\nNote: Kindly bring your measurement for the Barong or Filipiniana', 30, 1999.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `package_add_ons`
--

CREATE TABLE `package_add_ons` (
  `addOnID` int(11) NOT NULL,
  `addOn` varchar(255) NOT NULL,
  `addOnPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_add_ons`
--

INSERT INTO `package_add_ons` (`addOnID`, `addOn`, `addOnPrice`) VALUES
(10, 'Addl Portrait Picture', 49.00),
(20, 'Addl Pax', 129.00),
(30, 'Addl Grid Picture', 69.00),
(40, 'Addl A4 Picture', 129.00),
(50, 'Addl Backdrop', 129.00),
(60, 'All digital copies', 199.00),
(70, 'Addl 5 mins ', 129.00),
(80, 'Photographer service for 20 mins', 599.00),
(90, 'Photographer service for 1 hr', 1699.00),
(100, 'Professional Hair & Make up', 1699.00);

-- --------------------------------------------------------

--
-- Table structure for table `package_add_on_mapping`
--

CREATE TABLE `package_add_on_mapping` (
  `packageID` int(11) NOT NULL,
  `addOnID` int(11) NOT NULL
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
  `conceptID` int(11) NOT NULL,
  `backdrop` varchar(255) NOT NULL,
  `conceptType` varchar(255) NOT NULL
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
  `imageID` int(11) NOT NULL,
  `packageID` int(11) NOT NULL,
  `imagePath` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_images`
--

INSERT INTO `package_images` (`imageID`, `packageID`, `imagePath`) VALUES
(1, 1000, 'storage/packages/Selfie for ONE/sone1.png'),
(2, 1000, 'storage/packages/Selfie for ONE/sone2.png'),
(3, 1000, 'storage/packages/Selfie for ONE/sone3.png'),
(4, 1000, 'storage/packages/Selfie for ONE/sone4.png'),
(5, 1000, 'storage/packages/Selfie for ONE/sone5.png'),
(6, 1001, 'storage/packages/Selfie for TWO/stwo1.png'),
(7, 1001, 'storage/packages/Selfie for TWO/stwo2.png'),
(8, 1001, 'storage/packages/Selfie for TWO/stwo3.png'),
(9, 1001, 'storage/packages/Selfie for TWO/stwo4.png'),
(10, 1001, 'storage/packages/Selfie for TWO/stwo5.png'),
(11, 1002, 'storage/packages/Squad Groupie/squad1.jpg'),
(12, 1002, 'storage/packages/Squad Groupie/squad2.jpg'),
(13, 1002, 'storage/packages/Squad Groupie/squad3.jpg'),
(14, 1002, 'storage/packages/Squad Groupie/squad4.jpg'),
(15, 1003, 'storage/packages/Barkada Groupie/barkada1.jpg'),
(16, 1003, 'storage/packages/Barkada Groupie/barkada2.jpg'),
(17, 1003, 'storage/packages/Barkada Groupie/barkada3.jpg'),
(18, 1004, 'storage/packages/Concept Studio/cstudio1.jpg'),
(19, 1004, 'storage/packages/Concept Studio/cstudio2.jpg'),
(20, 1004, 'storage/packages/Concept Studio/cstudio3.jpg'),
(21, 1004, 'storage/packages/Concept Studio/cstudio4.jpg'),
(22, 1005, 'storage/packages/Graduation PREMIUM/premium1.jpg'),
(23, 1005, 'storage/packages/Graduation PREMIUM/premium2.jpg'),
(24, 1005, 'storage/packages/Graduation PREMIUM/premium3.jpg'),
(25, 1006, 'storage/packages/Graduation ELITE/elite1.jpg'),
(26, 1006, 'storage/packages/Graduation ELITE/elite2.jpg'),
(27, 1006, 'storage/packages/Graduation ELITE/elite3.jpg'),
(28, 1006, 'storage/packages/Graduation ELITE/elite4.jpg'),
(29, 1006, 'storage/packages/Graduation ELITE/elite5.jpg'),
(30, 1007, 'storage/packages/Studio Rental/studio1.jpg'),
(31, 1007, 'storage/packages/Studio Rental/studio2.jpg'),
(32, 1007, 'storage/packages/Studio Rental/studio3.jpg'),
(33, 1007, 'storage/packages/Studio Rental/studio4.jpg'),
(34, 1007, 'storage/packages/Studio Rental/studio5.jpg'),
(35, 1008, 'storage/packages/Vogue Photoshoot/vogue1.jpg'),
(36, 1008, 'storage/packages/Vogue Photoshoot/vogue2.jpg'),
(37, 1008, 'storage/packages/Vogue Photoshoot/vogue3.jpg'),
(38, 1008, 'storage/packages/Vogue Photoshoot/vogue4.jpg'),
(39, 1008, 'storage/packages/Vogue Photoshoot/vogue5.jpg'),
(40, 1008, 'storage/packages/Vogue Photoshoot/vogue6.jpg'),
(41, 1009, 'storage/packages/Kiddie Photoshoot/kiddie1.jpg'),
(42, 1009, 'storage/packages/Kiddie Photoshoot/kiddie2.jpg'),
(43, 1009, 'storage/packages/Kiddie Photoshoot/kiddie3.jpg'),
(44, 1009, 'storage/packages/Kiddie Photoshoot/kiddie4.jpg'),
(45, 1009, 'storage/packages/Kiddie Photoshoot/kiddie5.jpg'),
(46, 1009, 'storage/packages/Kiddie Photoshoot/kiddie6.jpg'),
(47, 1010, 'storage/packages/Maternity Photoshoot/maternity1.png'),
(48, 1010, 'storage/packages/Maternity Photoshoot/maternity2.png'),
(49, 1010, 'storage/packages/Maternity Photoshoot/maternity3.png'),
(50, 1010, 'storage/packages/Maternity Photoshoot/maternity4.png'),
(51, 1010, 'storage/packages/Maternity Photoshoot/maternity5.png'),
(52, 1011, 'storage/packages/Newborn Baby Photoshoot/newborn1.jpg'),
(53, 1011, 'storage/packages/Newborn Baby Photoshoot/newborn2.jpg'),
(54, 1011, 'storage/packages/Newborn Baby Photoshoot/newborn3.jpg'),
(55, 1011, 'storage/packages/Newborn Baby Photoshoot/newborn4.jpg'),
(56, 1011, 'storage/packages/Newborn Baby Photoshoot/newborn5.jpg'),
(57, 1012, 'storage/packages/Intimate Gender Reveal/gender1.jpg'),
(58, 1012, 'storage/packages/Intimate Gender Reveal/gender2.jpg'),
(59, 1013, 'storage/packages/Birthday/birthday1.jpg'),
(60, 1013, 'storage/packages/Birthday/birthday2.jpg'),
(61, 1013, 'storage/packages/Birthday/birthday3.jpg'),
(62, 1013, 'storage/packages/Birthday/birthday4.jpg'),
(63, 1013, 'storage/packages/Birthday/birthday5.jpg'),
(64, 1013, 'storage/packages/Birthday/birthday6.jpg'),
(65, 1014, 'storage/packages/Family Photoshoot/fam1.jpg'),
(66, 1014, 'storage/packages/Family Photoshoot/fam2.jpg'),
(68, 1014, 'storage/packages/Family Photoshoot/fam4.jpg'),
(69, 1014, 'storage/packages/Family Photoshoot/fam5.jpg'),
(70, 1014, 'storage/packages/Family Photoshoot/fam6.jpg'),
(71, 1014, 'storage/packages/Family Photoshoot/fam7.jpg'),
(72, 1014, 'storage/packages/Family Photoshoot/fam8.jpg'),
(73, 1014, 'storage/packages/Family Photoshoot/fam9.png'),
(74, 1014, 'storage/packages/Family Photoshoot/fam10.jpg'),
(75, 1015, 'storage/packages/Pre Nup Photoshoot/prenup1.jpg'),
(76, 1015, 'storage/packages/Pre Nup Photoshoot/prenup2.jpg'),
(77, 1016, 'storage/packages/Student Groupie/studentgroupie1.png'),
(78, 1016, 'storage/packages/Student Groupie/studentgroupie2.png'),
(79, 1016, 'storage/packages/Student Groupie/studentgroupie3.png'),
(80, 1016, 'storage/packages/Student Groupie/studentgroupie4.png'),
(81, 1017, 'storage/packages/Solo Graduation/solo1.jpg'),
(82, 1017, 'storage/packages/Solo Graduation/solo2.jpg'),
(83, 1018, 'storage/packages/Barkada Graduation/barkadagrad1.png'),
(84, 1018, 'storage/packages/Barkada Graduation/barkadagrad2.png'),
(85, 1018, 'storage/packages/Barkada Graduation/barkadagrad3.png'),
(86, 1018, 'storage/packages/Barkada Graduation/barkadagrad4.png'),
(87, 1018, 'storage/packages/Barkada Graduation/barkadagrad5.png');

-- --------------------------------------------------------

--
-- Table structure for table `package_sets`
--

CREATE TABLE `package_sets` (
  `setID` int(11) NOT NULL,
  `setName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package_sets`
--

INSERT INTO `package_sets` (`setID`, `setName`) VALUES
(1, 'None'),
(2, 'Only One'),
(3, 'Fixed'),
(4, 'All'),
(5, 'Assigned');

-- --------------------------------------------------------

--
-- Table structure for table `package_sets_mapping`
--

CREATE TABLE `package_sets_mapping` (
  `setID` int(11) NOT NULL,
  `conceptID` int(11) NOT NULL
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
(3, 109);

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

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(182, 'App\\Models\\User', 1, 'auth_token', '927b95c225f028665add85e5ec4bd4b1b2043ce99cd3698c0131700fe94adf3a', '[\"*\"]', NULL, NULL, '2025-09-18 03:55:44', '2025-09-18 03:55:44');

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
('74AK60uBOH89i2ytUdNDS6ZlOuGV6Lk0lGyffH8e', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZE4xNXc3dU1leENUandGTkRxdjJMemJ6UkdLM3VaVXdCVWZpSVNXcyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206258),
('8YFNVieyC90rcZTHzWGTlN2UJ8mJtnHwd7Gi74mM', NULL, '192.168.1.198', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFZxeUIxcFI0SHphR2RqVkFzb0ZreXN5QXFqUHpBS0xxOGk1VkZQeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHA6Ly8xOTIuMTY4LjEuMTk4OjgwMDAiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1758169748),
('9EXrbn4OYq1JTXfLq86E0x4bOOZYK0OYijF6iw7a', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMm5jd1Jlb2dLMFNQa21vZFQ5b1BmRjBBUFFiNHRpTndPYzV0cWdUUyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206338),
('bUoXAToRzTZgt3lLFLtdS6td2H42p79npIixFdeJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWWdBVVhqaEN5M0lrdEljM0M2Q2tXWE53TkMyNGZLWHhNZ2k2Q3JpVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90ZXN0LW1haWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1756206563),
('c0US70liCJTYG7kNYCgf1gHXj28JPZKrUfj84tVI', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU2htRk5pejVOTzVWNElYR29waGdQcGZTdElZZEFmVEFYWmxETTl4UiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1758169532),
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
  `transId` int(11) NOT NULL,
  `bookingId` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentStatus` tinyint(4) NOT NULL,
  `date` date NOT NULL,
  `receivedAmount` double(10,2) NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
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
(6, 9, 3999.00, 0, '2025-09-07', 200.00, 'GCash', 3799.00),
(7, 10, 2499.00, 1, '2025-09-08', 2499.00, 'GCash', 0.00),
(8, 11, 1999.00, 1, '2025-09-08', 1999.00, 'GCash', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `contactNo` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(30) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `profilePicture` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `archive` tinyint(4) NOT NULL,
  `userType` varchar(255) NOT NULL,
  `reset_otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `email_verification` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `fname`, `lname`, `email`, `password`, `contactNo`, `birthday`, `gender`, `status`, `profilePicture`, `address`, `archive`, `userType`, `reset_otp`, `otp_expires_at`, `email_verification`, `created_at`, `updated_at`) VALUES
(1, 'okim', 'Miko Allen', 'Santos', 'santosmikoallen@gmail.com', '$2y$12$5fiTMf0S/7ll.UcIeQYhIuLKKsuObtkuv4iWZT3ahxXaokqIR6ybm', '09292902337', '2003-03-26', 'Male', 0, 'http://192.168.1.198:8000/storage/profile_photos/1754898438_IMG_2646.jpeg', 'San Juan', 1, 'Admin', NULL, NULL, NULL, '2025-09-15 11:04:10', '2025-09-15 11:04:10'),
(2, 'bibingka20', 'Mary Hannah', 'Reyes', 'reyesmaryhannahcaryl@gmail.com', '$2y$12$7aAuFyzyNrWoggmlULLs.uNvq.eDC/xdE5d47cWSVEMelo9yfx9J6', '09155467893', '2003-09-20', 'Female', 0, 'http://192.168.1.198:8000/storage/profile_photos/1754250971_ph-11134207-7ra0p-mchwszm552lqa1@resize_w450_nl.png', 'Malinis St', 1, 'Admin', NULL, NULL, NULL, '2025-09-15 11:04:10', '2025-09-15 11:04:10'),
(3, 'nicolevarga', 'Nicole', 'Varga', 'nicolevarga19@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.198:8000/storage/profile_photos/1753979174_cn-11134207-7r98o-lqiyxv5mt6hkd2.webp', 'Guiguinto Bulacan', 1, 'Customer', NULL, NULL, NULL, '2025-09-15 11:04:10', '2025-09-15 11:04:10'),
(4, 'mabu', 'Mabu', 'Dela Saint', 'itsmabu26@gmail.com', '$2y$12$1QYmEELkP7j620trV89dBe0r6dqAQORy5nR4C7I7rvCr/gCUDnQrm', '09292902337', '2003-03-26', 'Male', 0, 'http://192.168.1.198:8000/storage/profile_photos/1757255227_Screenshot 2024-02-28 214556.png', 'Taguig City', 1, 'Customer', NULL, '2025-09-17 11:39:18', NULL, '2025-09-15 11:04:10', '2025-09-17 11:34:46'),
(5, 'KurrinChi', 'Ethan Gabriel', 'Fernandez', 'ethangabrielfernandez@gmail.com', '$2y$12$ZjQre96MDPJyMJAUae6nJut7d/SP5qv.Ah.YiJicpcINNEFTE9KOa', '09391179123', '2003-12-18', 'Male', 0, 'http://192.168.1.244:8000/storage/profile_photos/1758031154_pfp.jpg', 'Maronquillo', 1, 'Customer', NULL, NULL, NULL, '2025-09-16 13:53:55', '2025-09-16 13:59:15'),
(6, 'KurrinChi', 'Ethan Gabriel', 'Fernandez', 'ethangabrielfernandezadmin@gmail.com', '$2y$12$ZjQre96MDPJyMJAUae6nJut7d/SP5qv.Ah.YiJicpcINNEFTE9KOa', '09391179123', '2003-12-18', 'Male', 0, '', 'Maronquillo', 1, 'Admin', NULL, NULL, NULL, '2025-09-16 13:53:55', '2025-09-16 13:58:21');-- --------------------------------------------------------

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
-- Indexes for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  ADD KEY `bookingID` (`bookingID`),
  ADD KEY `addOnID` (`addOnID`);

--
-- Indexes for table `booking_concepts`
--
ALTER TABLE `booking_concepts`
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
  ADD KEY `packageID` (`packageID`),
  ADD KEY `addOnID` (`addOnID`);

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
  ADD KEY `setID` (`setID`),
  ADD KEY `conceptID` (`conceptID`);

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
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `unique_email` (`email`);

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
  MODIFY `bookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `booking_request`
--
ALTER TABLE `booking_request`
  MODIFY `requestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

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
-- AUTO_INCREMENT for table `package_add_ons`
--
ALTER TABLE `package_add_ons`
  MODIFY `addOnID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `package_concept`
--
ALTER TABLE `package_concept`
  MODIFY `conceptID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `package_images`
--
ALTER TABLE `package_images`
  MODIFY `imageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `package_sets`
--
ALTER TABLE `package_sets`
  MODIFY `setID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `transId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  ADD CONSTRAINT `fk_fav_package` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`setID`) REFERENCES `package_sets` (`setID`);

--
-- Constraints for table `package_add_on_mapping`
--
ALTER TABLE `package_add_on_mapping`
  ADD CONSTRAINT `package_add_on_mapping_ibfk_1` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`),
  ADD CONSTRAINT `package_add_on_mapping_ibfk_2` FOREIGN KEY (`addOnID`) REFERENCES `package_add_ons` (`addOnID`);

--
-- Constraints for table `package_sets_mapping`
--
ALTER TABLE `package_sets_mapping`
  ADD CONSTRAINT `package_sets_mapping_ibfk_1` FOREIGN KEY (`setID`) REFERENCES `package_sets` (`setID`),
  ADD CONSTRAINT `package_sets_mapping_ibfk_2` FOREIGN KEY (`conceptID`) REFERENCES `package_concept` (`conceptID`);

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
