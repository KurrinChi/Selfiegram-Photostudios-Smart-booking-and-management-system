-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2025 at 02:55 PM
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
  `receivedAmount` decimal(10,2) NOT NULL,
  `feedback` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`bookingID`, `userID`, `packageID`, `bookingDate`, `bookingStartTime`, `bookingEndTime`, `status`, `customerName`, `customerContactNo`, `customerEmail`, `customerAddress`, `date`, `paymentMethod`, `paymentStatus`, `subTotal`, `total`, `rem`, `receivedAmount`, `feedback`, `rating`) VALUES
(3, 2, 1004, '2025-07-22', '16:00:00', '17:00:00', 1, 'Mary Hannah Reyes', '09155467893', 'reyesmaryhannahcaryl@gmail.com', 'Malinis St', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, NULL, 0),
(5, 3, 1001, '2025-08-02', '11:30:00', '12:30:00', 1, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 479.00, 675.00, 475.00, 200.00, 'dwddwdwadwa', 5),
(6, 3, 1014, '2025-07-31', '18:30:00', '19:30:00', 2, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 0, 2999.00, 3598.00, 3398.00, 200.00, 'Nice service. Would recommend!', 5),
(7, 3, 1013, '2025-08-02', '13:30:00', '14:30:00', 1, 'Nicole Varga', '091554', 'nicolevarga19@icloud.com', 'Guiguinto Bulacan', '2025-07-15', 'GCash', 1, 749.00, 749.00, 0.00, 749.00, 'Nice service. Would recommend! walang add on hahaha', 4),
(10, 3, 1001, '2025-09-06', '09:30:00', '10:30:00', 2, 'Mary Hannah Caryl Reyes', '09155467893', '2022100573@gmail.com', 'Malinis St', '2025-09-06', 'GCash', 1, 479.00, 548.00, 0.00, 548.00, NULL, NULL),
(11, 3, 1000, '2025-09-10', '09:30:00', '10:30:00', 2, 'Mary Hannah Caryl Reyes', '09155467893', 'reyesmary@gmail.com', 'Malinis St', '2025-09-09', 'GCash', 1, 379.00, 508.00, 0.00, 508.00, NULL, NULL);

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
(2, 5, 104),
(3, 6, 102),
(4, 6, 105),
(5, 7, 100),
(8, 10, 108),
(9, 11, 109),
(10, 11, 100),
(11, 3, 101);

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
(1, 3, 2, 'reschedule', '2025-07-25', '15:00:00', '16:00:00', 'Conflict with schedule', 'pending', '2025-09-15 11:19:00'),
(2, 5, 3, 'cancel', NULL, NULL, NULL, 'Not available on that date', 'pending', '2025-09-15 11:19:00'),
(3, 11, 3, 'cancel', NULL, NULL, NULL, 'dawda', 'pending', '2025-09-16 12:02:11'),
(11, 11, 3, 'cancel', NULL, NULL, NULL, 'Conflict Schedule', 'pending', '2025-09-16 12:42:29'),
(12, 10, 3, 'cancel', NULL, NULL, NULL, 'awdaw', 'pending', '2025-09-16 12:48:27'),
(13, 11, 3, 'cancel', NULL, NULL, NULL, 'dwa', 'pending', '2025-09-16 12:51:25'),
(14, 11, 3, 'cancel', NULL, NULL, NULL, 'dawdwa', 'pending', '2025-09-16 12:52:33'),
(15, 10, 3, 'cancel', NULL, NULL, NULL, 'nice one', 'pending', '2025-09-16 12:52:39'),
(16, 6, 3, 'cancel', NULL, NULL, NULL, 'ayoko po', 'pending', '2025-09-16 12:54:08');

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
(57, 2, 1000, '2025-07-22 12:50:53'),
(65, 3, 1000, '2025-07-25 10:19:01'),
(69, 3, 1005, '2025-08-12 12:56:16'),
(70, 3, 1002, '2025-09-11 19:03:10'),
(71, 3, 1001, '2025-09-11 19:03:10'),
(73, 3, 1004, '2025-09-16 08:56:42'),
(74, 3, 1003, '2025-09-16 08:56:43'),
(75, 3, 1006, '2025-09-16 08:56:45');

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
  `messageID` bigint(20) UNSIGNED NOT NULL,
  `chatsID` bigint(20) UNSIGNED NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `senderType` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`messageID`, `chatsID`, `senderID`, `receiverID`, `senderType`, `message`, `created_at`, `updated_at`) VALUES
(141, 200003, 3, 2, 'Client', 'wag kang bastos', '2025-09-08 08:56:32', '2025-09-08 08:56:32'),
(142, 200003, 3, 2, 'Client', 'wqeqwe', '2025-09-08 09:02:11', '2025-09-08 09:02:11'),
(143, 1, 3, 3, 'Customer', 'nonoonon', '2025-09-08 10:54:56', '2025-09-08 10:54:56'),
(144, 1, 3, 3, 'Customer', 'gumana po', '2025-09-08 10:55:21', '2025-09-08 10:55:21'),
(145, 1, 3, 3, 'Customer', 'ewqewq', '2025-09-08 10:57:42', '2025-09-08 10:57:42'),
(146, 1, 3, 3, 'Customer', 'yawa', '2025-09-08 11:01:59', '2025-09-08 11:01:59'),
(147, 1, 3, 3, 'Customer', 'ewqeqw', '2025-09-08 11:03:08', '2025-09-08 11:03:08'),
(148, 1, 3, 3, 'Customer', 'dwqdqw', '2025-09-08 11:03:55', '2025-09-08 11:03:55'),
(149, 1, 3, 3, 'Customer', 'ewq', '2025-09-08 11:05:39', '2025-09-08 11:05:39'),
(150, 1, 3, 3, 'Customer', 'dwqdwq', '2025-09-08 11:09:38', '2025-09-08 11:09:38'),
(151, 1, 3, 3, 'Customer', 'wqeqwe', '2025-09-08 11:11:06', '2025-09-08 11:11:06'),
(152, 1, 3, 3, 'Customer', 'what', '2025-09-08 11:12:01', '2025-09-08 11:12:01'),
(153, 1, 3, 3, 'Customer', 'ewqeqw', '2025-09-08 11:12:25', '2025-09-08 11:12:25'),
(154, 1, 3, 3, 'Customer', 'kuta please', '2025-09-08 11:13:38', '2025-09-08 11:13:38'),
(155, 1, 3, 3, 'Customer', 'yehey', '2025-09-08 11:13:47', '2025-09-08 11:13:47'),
(156, 1, 3, 3, 'Customer', 'ewqeqw', '2025-09-08 11:19:48', '2025-09-08 11:19:48'),
(157, 1, 3, 3, 'Customer', 'please po', '2025-09-08 11:23:47', '2025-09-08 11:23:47'),
(158, 1, 3, 3, 'Customer', 'gago bat umulit', '2025-09-08 11:23:57', '2025-09-08 11:23:57'),
(159, 1, 3, 3, 'Customer', 'sir tapos napo', '2025-09-08 11:26:39', '2025-09-08 11:26:39'),
(160, 1, 3, 3, 'Customer', 'noo ahhaha', '2025-09-08 11:27:07', '2025-09-08 11:27:07'),
(161, 1, 3, 3, 'Customer', 'umuulit tangina', '2025-09-08 11:27:24', '2025-09-08 11:27:24'),
(162, 1, 2, 3, 'Admin', 'what', '2025-09-08 11:29:48', '2025-09-08 19:41:52'),
(163, 1, 3, 3, 'Customer', 'party anthem', '2025-09-08 11:32:38', '2025-09-08 11:32:38'),
(164, 2, 2, 4, 'Customer', 'party anthem', '2025-09-08 11:32:38', '2025-09-08 20:22:17'),
(165, 1, 3, 3, 'Customer', 'hello', '2025-09-09 02:47:57', '2025-09-09 02:47:57');

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
(4, '2025_06_30_121411_create_personal_access_tokens_table', 1),
(5, '2025_08_03_184406_create_messages_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `packageID` int(11) NOT NULL,
  `setID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint(4) NOT NULL
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
(1011, 5, 'Newborn Baby Photoshoot', 'Perfect for capturing your baby’s earliest and sweetest moments. It is good for one newborn and two family members and includes a 1-hour photoshoot with a professional photographer, complete with creative direction to guide natural and heartfelt poses. The session features two cozy, homy-themed sets with costumes and props, ensuring timeless and adorable results. You’ll receive all enhanced digital copies, plus a printed copy as a keepsake.', 3999.00, 1),
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
(1018, 4),
(1007, 1);

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

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 3, 'auth_token', 'edb33ad71f3dbc9049079b3635fbc94a2286bfedebc215f9444a1bb4e15d9e81', '[\"*\"]', NULL, NULL, '2025-09-05 18:23:28', '2025-09-05 18:23:28'),
(3, 'App\\Models\\User', 3, 'auth_token', '7fe240dcd99c855a596cb294b7107ad18cd31410e70341b177e26f2919feccd8', '[\"*\"]', '2025-09-07 09:38:53', NULL, '2025-09-05 18:23:29', '2025-09-07 09:38:53'),
(4, 'App\\Models\\User', 3, 'auth_token', '5d971627d8c0fdcfeec493d943b7b26f76b56dfa2fa8126e8aea468aff9bf3d1', '[\"*\"]', NULL, NULL, '2025-09-05 18:23:29', '2025-09-05 18:23:29'),
(5, 'App\\Models\\User', 3, 'auth_token', '37053c28ac8b17f29a7c47a4628ab5bf285ae728b490e4a3fafe9f322ffe085d', '[\"*\"]', NULL, NULL, '2025-09-05 18:23:30', '2025-09-05 18:23:30'),
(6, 'App\\Models\\User', 3, 'postman-test', '00e9f4ed0fb56b3cf70b9ea1e3b3e8e28799411cfe8cce2c8bc2b4bb71dada2c', '[\"*\"]', NULL, NULL, '2025-09-07 01:15:18', '2025-09-07 01:15:18'),
(7, 'App\\Models\\User', 3, 'postman-test', '1762b4380f82dace09c783edafef1fcec71bb3532a258dc9e3d5bb254420cb28', '[\"*\"]', NULL, NULL, '2025-09-07 01:26:40', '2025-09-07 01:26:40'),
(8, 'App\\Models\\User', 3, 'postman-test', '739f9ba291930ede78d6b655506e91060f3a6e2a26c065b9ff4dbb328f67a80b', '[\"*\"]', NULL, NULL, '2025-09-07 01:26:46', '2025-09-07 01:26:46'),
(9, 'App\\Models\\User', 3, 'postman-test', '37539a9994d342bac64f0dfb7f707041d0e07be1d1b2c1a0285012a7226b00ec', '[\"*\"]', NULL, NULL, '2025-09-07 01:26:48', '2025-09-07 01:26:48'),
(10, 'App\\Models\\User', 3, 'postman-test', 'e831cf9a5bcd74c37fc4ba1dfaf5e88d57547ef6179e7b6a92c50a985bb13ba6', '[\"*\"]', '2025-09-07 06:44:28', NULL, '2025-09-07 01:26:49', '2025-09-07 06:44:28'),
(11, 'App\\Models\\User', 2, 'TestToken', '21b5dec392156f8a91fca14225d665dc5b6f3bf9fd065b21ded810f086af189f', '[\"*\"]', '2025-09-07 09:35:11', NULL, '2025-09-07 09:34:46', '2025-09-07 09:35:11'),
(12, 'App\\Models\\User', 3, 'TestToken', 'd53cdee4821580b736857f886583a4de9641600fa138ad3491414892f0d38427', '[\"*\"]', '2025-09-07 09:41:57', NULL, '2025-09-07 09:40:06', '2025-09-07 09:41:57'),
(13, 'App\\Models\\User', 3, 'postman-test', '23bacea89cac6089651263ac54e78291d67d5f756e9f07e842d3486d52059550', '[\"*\"]', '2025-09-14 17:33:48', NULL, '2025-09-07 09:43:47', '2025-09-14 17:33:48'),
(14, 'App\\Models\\User', 3, 'TestToken', '7e67f46da0b49669df1dff6eb5413128e73642c20b6ab3ceff7a37478e6b9127', '[\"*\"]', NULL, NULL, '2025-09-07 09:49:01', '2025-09-07 09:49:01'),
(15, 'App\\Models\\User', 3, 'API Token', 'c88f84b629cec1fe2ec8818b7151b087ef559eea20c65b56190b57f56b7ea991', '[\"*\"]', NULL, NULL, '2025-09-07 09:56:03', '2025-09-07 09:56:03'),
(16, 'App\\Models\\User', 2, 'TestToken', 'e51d66bc1432e5194de23a65526ad41a901ec3403b9cb318cc1b3ac5ecd7907e', '[\"*\"]', '2025-09-07 09:59:59', NULL, '2025-09-07 09:58:29', '2025-09-07 09:59:59'),
(17, 'App\\Models\\User', 2, 'API Token', '5f6abd95ea688fd4090ee24240128561747b1bec9bd02472575b2b6cfd93d84b', '[\"*\"]', NULL, NULL, '2025-09-07 09:59:37', '2025-09-07 09:59:37'),
(18, 'App\\Models\\User', 3, 'API Token', '202b06406a0c6fba0bf28879ea5108cae2752d4581817c2f7947060190b31fb0', '[\"*\"]', NULL, NULL, '2025-09-08 05:09:52', '2025-09-08 05:09:52'),
(19, 'App\\Models\\User', 2, 'API Token', '2d29726999827dada8e882eea442ebd27a966b7b2127386f6891793f84e94ccb', '[\"*\"]', NULL, NULL, '2025-09-08 05:11:00', '2025-09-08 05:11:00'),
(20, 'App\\Models\\User', 2, 'API Token', 'e905b0b74df3a9f8898fadc6fb786d2bdf9ea29753734b529eba10af7ff45365', '[\"*\"]', NULL, NULL, '2025-09-08 05:11:01', '2025-09-08 05:11:01'),
(21, 'App\\Models\\User', 3, 'API Token', 'ab7b4b68aeffe768423652783ad45aeb79d1f333aed0ffd091e2055b09e4a1a2', '[\"*\"]', NULL, NULL, '2025-09-08 05:20:03', '2025-09-08 05:20:03'),
(22, 'App\\Models\\User', 2, 'API Token', '8f0c260b52a619ab618dcc5275f8d21af4fa16ba40e048a1bf94bdd6de22d15f', '[\"*\"]', NULL, NULL, '2025-09-08 11:18:31', '2025-09-08 11:18:31'),
(23, 'App\\Models\\User', 2, 'API Token', '937d3cc494071e502349661b325bd750fc5acea3fb535bc35ee21006c260b471', '[\"*\"]', NULL, NULL, '2025-09-08 11:19:35', '2025-09-08 11:19:35'),
(24, 'App\\Models\\User', 3, 'auth_token', 'ce3dde333e2b1f922f04f2cef573d5251c724e27d34e9eb9381c16a24953f91e', '[\"*\"]', '2025-09-09 09:01:14', NULL, '2025-09-09 09:01:08', '2025-09-09 09:01:14'),
(27, 'App\\Models\\User', 3, 'API Token', 'c8c7410c47928880d8ab66608e398991fd6c16b2a15220cda7c6d530318631b7', '[\"*\"]', NULL, NULL, '2025-09-09 02:45:11', '2025-09-09 02:45:11'),
(28, 'App\\Models\\User', 2, 'API Token', 'c94ddbf8895a70a50b409751c083fa99f6b9fb065870f300e1d897d9796cc639', '[\"*\"]', NULL, NULL, '2025-09-09 02:45:49', '2025-09-09 02:45:49'),
(29, 'App\\Models\\User', 2, 'API Token', '4b704c91767ae168c002e960050b9e62c737053f89158e70878e34b82df0abad', '[\"*\"]', NULL, NULL, '2025-09-09 02:47:15', '2025-09-09 02:47:15'),
(44, 'App\\Models\\User', 3, 'auth_token', 'fb7e8f4b72ed3173821d10982daad7971d97a01d58e3bdfa6c037756c2c6d8cc', '[\"*\"]', '2025-09-15 14:28:41', NULL, '2025-09-15 14:28:39', '2025-09-15 14:28:41'),
(46, 'App\\Models\\User', 2, 'auth_token', '316ced80abc1d45e73cf1fe5015c596ea99756fe05f57e759ed330101711ce0a', '[\"*\"]', '2025-09-15 14:46:13', NULL, '2025-09-15 14:44:05', '2025-09-15 14:46:13'),
(47, 'App\\Models\\User', 3, 'auth_token', '01d9733ae7f50ad8d6634565bff8c65d546ed13f1e710368e55452514490038c', '[\"*\"]', '2025-09-15 15:05:19', NULL, '2025-09-15 15:05:15', '2025-09-15 15:05:19'),
(48, 'App\\Models\\User', 3, 'auth_token', '951bd2c42a80abc45d97e28a7bfd4ff5b15f89eb7a0a5ace771678c4d8aeaed8', '[\"*\"]', '2025-09-16 12:54:08', NULL, '2025-09-15 15:05:16', '2025-09-16 12:54:08');

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
('0MF3XsTfLSky1R99Hp1AiNhYNUOKOFqqcWIf9GA4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoieWFrTm1ZT3h1bDBUTnlJeXBJbW5OSEZvV2hDQ0VCMXFOUDFWS0p0eiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358716),
('2agOzaS24AgUTVsuMxrNmMJYrlFyAqxOOduzS5Xw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSVBDWnlQU2Zka1pkaFpCR3d5WENDTnFEZ0hmeklTVmJXTmxxWER0USI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358811),
('2eehnd4BiDj6y6U2oV40ucApJ9EIzwkFxLPUZn14', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWE1JTEM3clZ5ZUxmWkNBOFo0TE1nTTBqNjRSTGtKSnEwckVnRUx0dCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757361875),
('2jxuomMMIFRgaKmpnHt1rvTLTa2Ta5Mhc3cFWIZB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ1ptRjlLTXF1M1lpRENBU2tWZ0pNcHB0Q2FkR2x6dUZPTEkzaTFmTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358040),
('4lmgNKMkFg3dpyurK2lBi9UwHIFfAwArMMLdf48E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoicVFzMHdwUGRqaEZlN25jcjBNNnU3QlRuMEliMllEVnM3YjhDMktSYSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357692),
('4np7MnZ5WjBcx4q3vSVwIawxqKmtBj1SkYw75DfU', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSVRQYjJ2MW5uUzlNV2xMOEJvUDdXNWlTWWxNOFFxN1lrTlc5R3FNNSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353805),
('615DZx3GUmm9LYAVioUOE3mTvDVA4h4pRjKMyXHo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYTllSzI3MHNLVXAxTmFiRWdNc0ZXQno1Y3RLd0NUa2FpWmx1d0xhbSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757362559),
('6Kupkv3Np84gGMBcnF55zvyMzXpiCQqIS7zGaoPK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVVZrRThGUFE5WUoxYmNiYjdIdU5JVWVkWFhETGMwUXExRVkzOVJiWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757351576),
('7k55iG4lMQuPms2WR1bbVfwBu3zcyI4cUi6CktyX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidHdvYXloMWIzNlJUb0RyVHQybkxrRmVyeTdNbHQzWXAxR0I2bEpHTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357165),
('81HoLwW8EzVAHb7PqIMyZiAPcpwOGoPmf94gGcH2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYUt0bngxNDI3NFhRN3FNU09mMlMwQnBWYnRnWEpsQVlxMlkxU3ZObyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353259),
('848CKCVdD4lHzy4bBR7Fdr6tBjEu9AZibwFsasYS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiak1kdE50ZVZxV2trN3NQVkdwV0l0Nk1EMkdRWDdsWGxzUlhpMEVNSiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357860),
('8v4GWSRF4vBaQV4JFyZTeYhlAREs76XIlTmUI0uC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWnZrZ2w4NGhpTk9iMndlUkNHak1rbEFHdG0xOEdaT1FnbEV4aThSVCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352474),
('9uKVEbPuvHFLgKKiVBHDZdtXsw1E0p1MX3a9zco5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZXlSQWtBMjc0RGZkTThkbVpJR25jSGJYemRla0lQbjJxcUNxMEVZSyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357480),
('9WY5yq4sKkRbVY2GIVTyTQJydHoODHI7dozSCnyw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSVBsOTVvd3JuV1lxckp4S2dDY2VaUm9hWUxjWlJ4SUJEcE1zUFNYWCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357510),
('A3ZyIooC2BKdQ4EaYZlOfyZcMK5XAyhjYEb9pnVD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiT3ZyYkRwbFpiRlFzNk5jTVY0QmZLS0Qxb2lnUG5RVGY1MkdIQTQ2RCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353865),
('aqxO6u63aPNgkGnsDL0mFMJJo4jXUcGfJfiwrAy8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQUJOWWFSOERpb05WZ3JLRnpRUW0zN1NpOGxpZFpzdm5ad1dRTVJCWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352077),
('auxq00xHF5fz7VdEkSuKgPC0i8C64cjbLrBrin3E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiOGFUMTJta2l4YzNGd1FMcVE3MnBjUDU1SzU4WXBBMjRVQlEyS2NlSCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350587),
('bCTBNryXZ6XltCF8pAzMGy7Gp32KChizcMyaxqoC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNXhxZk51a0pVNGZaa09WMXV6OE9GTE5QUXZubkdyMlFiMUNIMUNNSSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359179),
('bNCZVKA7bBWS7iSlbbBwJwfdGYV6mBTv5flCMMzm', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaGJvR1I0V28zaU9hcEw0NzYxa3I4aDRES2Y5R0tFNnA5UnlFRmVlbCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350929),
('bRyOTwHvxGt1pisiPBQFrv2Nb8qugCtMg1AE8xj9', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWGFTWmFGeHFhRkJIRmJVcDdRYXJiV0gzQVBzaXViQ1BsaDlMcmJ1aCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357229),
('bXjGA6KgtmNhmheKiLduWv1rELuhuwCi6PC0YNjs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibDJ0NFBIZ2xVaDBaZm43aHFWRUpHczAzRHI0Y0xsWGpXdzNyb2JZOCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357208),
('c9fZNoGmaBhmeQvWq2HQRFCWgOO8YrKCCmjPxP0a', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibW1pUkFWZ0paazlydk1aRlRUanVFbk5JdUdSbEFLOUt1V3FxRWs3YiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357654),
('Ch598fKdYfnRvvxd8occCvyaCHFMgXMSss5ItngQ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVmFIMVJ3WVJZa1B1ZEU1b2NhR3NtMTZJUDdHVGxWYkg1WnB2bE9NTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353570),
('cQibBRRTBbguBnj4z9LkHmI48R8zuHIDQWTY1HJS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWndXVEJoTDlKZHN0MHlMTjlVNE1mVHZBOTUyZG5qQklmdThuZGFINiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353470),
('dkvEEagx0yyfwQcYq7PR86nEK3O9vQjFLzp6umbw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNFo2NENsS0MzeTJQeUtnc214UEVaT0pSMDhTbXdzbnV2bGRqOXNpeiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357381),
('DoL5cXP8cuMWdebBZ0hhcZU32d2a220m8GghOZZa', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSDdDZFNTV3haR0R6NjVrUFpZSFJKUzRsMldiSW1RbVg5dE1mS1dCNyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359421),
('eGBVNVQSt4oMyhpFGrglxBVQC3cwaEnJDYMtYBo7', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ3JNaWhmRUdtTmFMT2h4SVRkMnJyTU1ueFNTdEM0ZFYyQWg5ZjFiVCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353758),
('f4bRHAhweRE4BFD2wS7KKjqNHV9dbsmktmN0y5ec', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiV04xQ2dYMVdmY0dSUzQ1TVQwdG5oZzBLN1Z4NkZWeHZVTTRZNzczRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352307),
('f8TWm7zL7UCNB7rj9hgvRm4oub5T7BvqrDfAsvMg', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiOHJqT2w5NHRzelBJNFBKdE1HRnFSRTlpS1d3N0JxZDhWUmdTcFJiTyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358743),
('fp2nywYYtayCwjKWj18RFCbOgvDY4ElihUmrQlet', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMGJ6dTc2bUtCNTFzUFU2YUt4Q3JpRnlnb09uNjF5Q2FtMU5kSmtHeCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359785),
('HgL6AP6Ay0Yz47HnVYCWIYfwemzShLj2NMJazl2n', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMndyeXkzU3AydHJDRXRrZzczbkk1Vno0ZDNTaTdpQ3lWMDFIUFVPaCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757351574),
('hgZfFBGltTT6TZy6jMUir9RMBBy42psRdcXPJxAb', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWkN2SFZrRU54TjlJVGI1aXBVZmxpa3owbTlzS3dib3FTUDI3NkNXaSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352023),
('hOcsJmWV3pYwSEOex1P3RlvQt7qMnE6WLy1GRYew', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQVlrYk9MNGZiOE9BM1BFNVRSQXIxamZsak5GbTN2UHlIaXk4SFo3eSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757414763),
('IKD8nhgL6JVuskJEhFfxS0ly5jIWT9MugO0qv04v', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiV1FIQlBiREJBa2ltcm8zOXoyV1EyNGtwMk9wTUh4ZzNBR1VySUJPWCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353666),
('iucS9CyKfORVaZeUXLKRfKcJ2HEg2ie56oN6CvtK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNlRERGNMRGNHcXkxTHBYdG1KRGxaOUIzeXhqMVd4WGk0dUliOWZmYSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358718),
('J5Jr2FoX3bh2be4QRQudmPbuc0aWxpBEsZz9Xh4S', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZzlCVnppWVNmNEVab1hVdzFvZGlxUWVhd0pMeUgybDh6Qml2cE80NCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358185),
('JHfE9y6xlni4uLDDdAmTraOZqy8aRNlJcsZ0nXrS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiN0FDR3JuTUtyQ1JVOEdGMFRjc3Y5V0lsUENjNkFza213SnQxUWhQMyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353345),
('k2E7buT82KwrPp3006lTjJjHAXzTl3Eq0icWqLzY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVlJNb0RzYUF5NFhVb1lvbklTRENMUUVza1c2THQyQ3daV2JCSHBzRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357339),
('kR2Jro9gVf6C7GvNyPFI9NfEiWhgS43hwvu4qi7T', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidkFuNUY3YmU2RXJacktkNWQyVHRsbVJodFVja0l6enVuanNvUG1jbyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757414916),
('KXl0lRBpD9TjqlScOhGyCLSNz7XhIFnuufNMclBI', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTXliRXlkWXh4TUMzRkZVODRMWXdZb2hMcUljRFR4R2JnSUYyVnY4NCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358116),
('lCZv1YQIW1RLYI5GRevkDGVmXp7WogZkiG5khkhS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQVdNczhwV25aZk1IaEk0b1lEbHl5OVIyOWF5NDBRaXVzOW8zTTJIMCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357467),
('lgaQCiuTMQyb2bwfKa7SZsmD2oN1voIU1un1qkUP', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZFpBcVdIVkU3cldTeHQzbml1SzBCUzdoU255aXhLajV1U3psNm9RYyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358171),
('LSZxAU4J2lclt34iHAtfbWWg9PmrpnAiPm0Y1Ctz', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZWZpSDdhWDh0QW9Kc3M4V2ROY3J0WXhlNVN4VHhkbzR4cE1NMzFiZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357717),
('n26e0q0Bqxtczm18Njw9D6gxgosa0paWafqo04Rt', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTXBrNlQzbFNLVEtPZWNlQVBWeWhtQWhCaEs2Z1QyOXg1b3JFalBRNSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359951),
('nW7ADk7aCO9PlC00Gr7ZmNVyMOuZGNMGGEJDqnEo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSXdUeXY3NmxSMVJqcTRIVlNvWGZXUkZsTk1qUlA4aWU4Z1Q5M3ZpZCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358233),
('OgbbnF1Jk4h3v1AEWzNStYuhJ68A2LZxiSqyeYO2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidmpZeFlvVFNyU3NHd01nRHloRkhHRzNDbjlRRUFKeERyRmdSRkpOViI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358814),
('OOPzPgAIZxQM7g6Qzwl0ekoRkEJAohYuF6969SkF', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTjhQVHp4c0R2UXMwUHZOVHNWcW1kdUlsa0pSU2ZjWE9DN3RZOGphdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352497),
('PaIWScxoFghm05T9bPs5ZlIXjKnIPNqckOXeGt30', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNzd5NzNpVGp6WlZpdEpHeDJrb2MzUEZvdUJtU1h6MHJWR3hKNTh2NSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358357),
('PjspH0nNT3JmbKAEaCsMVIkRQCBA84TwZsfcn1we', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNVlsZGFuWUJDWlFyaERENEE3UEFmdXc4Q0NQaGRiR2ZKVnl4TnFoOSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757360837),
('Pl76Hbulb9jMh9pRB08E7mMnfAEYT0zGQAr0hPQ6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNUF1cVBhalE4eTdFUHExQjg5dHVHbkVmQ1c2N0Z3dnBwbnhHUlhKRiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357272),
('PTQdkzRmbBuTgBRGrCOczMYP85iWFUchWcXizigS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoicUlxenpOVHF2WVAxY0lQeDVrNDAxNE1ubTRpTVZjOXpyTEh3VHFLYiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353702),
('raUzJHZ3OO4I56WJyenT6rsDdPJNTJQRxAJ79Yyt', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiS0llTUQ2eGY3WmpIUkpqbFQ4ZWJuS0ZiaEx0cHVudlA4aFExS0xSUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358576),
('RILNeKK0Ixn3zkm2GWQNwkBB4FJh3va7KCWqXQ62', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidWVCb202cUlLdVJhUGZsaUdqSUcwdmJsUkVCSkh4ZVNvbDFmNlBqdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757352057),
('rmSTsZRQTUu0zisON6YnlOe4UGybc4GPQLBlHX32', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiY3lZSm1xaDlyTVlVaGhKSHV1cUYzbTRxbENnSkMyenhYOTNKVUg4UyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353908),
('ShRqXJohFncBCAxnu9F0s3oxQfP65JNgU78TzoNl', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVzZEUURlbmtHcnRDM1dlVG5hbk1jOFVpWUp2UW5NVVBCRW9vRHlHdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350578),
('smoAOfEkQMbPKLywLZ8PdYzDZlKrWSXCqB2j9Hsc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiRko3VjFVS3lyNzliRXFtWTVON2FiRUF5Tmx5Z0FEbzJxd3FhWDBPWiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357503),
('smpJE1ApWonyWUnjQPeFrbDOlHA7ZJIKYWa1KOeN', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoialdKWTV5Y1pFaHBXdU9HVExYbVFuYW1IbDhlZVV3Z1RXT0wzODU0ZiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757415003),
('StDu9HsdzJZc1EJqO3ybz7WfJpsV8OyEodv40CBQ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZEkwbjBvZ2FjU0JpazVpREtGeUtkaWFjTllrZTRmcU05aTRlRkxxUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358249),
('u0E6C5Ds3ZKxXaCPtcpEi2YsNLC5NAIWTZpMCS3L', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVk12NWc2TXhualdYWU0xRjRWcXg1b3RVTjhEUDViazVSRGRyMmFRdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357635),
('UgKQYgQkdWSPk8m9Nronb4DiWKvVLzBjMUfVIcJg', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZndGdTFHVEM1N28xWGNXRnRzeDNVVEJ0V2ZNMkNROWtqQ3o5T3AzZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357169),
('UlVgRAHQmP7ucsEW0iETXzC1fWtKppYyzESUMLGy', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTVAwbERxQzd6RGhPZ3R3czQxNzFnVWVmQnNxOUVTWkNiOUhaYkpLTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757351498),
('um5KV93BjBuUI7uA2qvAnVGdnj6b6SWZfMP4ROfv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidGQ2dWVkVnkxV2JkcVllSlZBV1NBTTdWMW9lZlNyT2ZPNDZmSHp1byI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359595),
('VHnuqGOs2eS0Gw7jvw1MbDUvwgqhad2bIZrqSNnb', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMlRXTUd6RWpJWjg5eDA0MXcza1I3YmtkckRVODdJR2x3MzNQZUxSZiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353301),
('vYcOmXjMNPXFgQn2sZiDFiHQs8qiwG897DCS1LuL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoieTROblZwemRqMk9BcDl0a0lDZW9ER0lsRXJaZTBTQkh1MjIwdFRlMCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757358639),
('W19oKQJTqNADUjvQ1ACOIHAE0xn408KIdmm2kySm', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiajN0NXJOTWdpSnJYUkNZbjRtN1I2OWJSSnM1d2RoeG9ZNkV5T0EwYSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350739),
('WOdFcnKJRJrBalvuQIo0k86tbgsRf73lkOgGYXO7', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiRUZnZ2ZvYTZKSWhxUVdpVnpsQXdXbjdLekRHWnA2UHFVSE55MFJGNyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359637),
('x338Hkb9ftJ3XgkRFmiUq9HaMEv26Y3hYKcBBE56', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoicnNUNzBNR01kNVNtT01Zb3NlejJibXowTTdwVXFWR0VQdVNyQjZzaCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357649),
('xdc0veSEU9h8zEyq3OLAXRaNxCJyrIbBdLUNfS0k', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaUVybDlOSHZVS1B3V1FDNWtyWVgxZksxU1JhS2JZVWdOU3I1TEtnbyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353931),
('xlDpLFIOjKmo2KgFSRr2j7UoFdTrY0wEddgAkBJE', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTzIyMGdCck5nQVZoelpmUWdETXc5VGFYdktTaFljYll5NGJjTndvdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757351339),
('xONvaNTcKUnYiTG1CqUXe8w1JhUiazvncsfwgj7e', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoib0xzdXJNNHFFYmgya0F2R1R5TFFLdFdXWW9xMUpENVhYcEU2Yld4cCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350742),
('Xt2tk3UrYBwK8GztsL1ShXK5yLld75jYOfu2hWmA', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQVdnVmR4YUlqcE5IN3lKWTNjMHJ4a3pxdFFqOUlkcU5raTZlVzFxRCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757360805),
('ZAq1WY6kMqW65kNHcr1a79Er0YBn2CwrgpRMh986', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNmZac2hFTEZ4RmEyOEFaSUxlalVoSkRDc0FvZW9LNWdBVEJtVkZWUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757357042),
('zkFU2yABWDLwkfCg6ug0KDknJK0S7ENaW3E0bJIY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoidHM5SHBoQW5WdktyOFgxaFBaeXU0bXJhNTRHVnZGRDQzbnU5Z1RicCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359633),
('ZmiPNFy0Tn36sS06t1ZLbl79fpwrveB3YRyjPUDZ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZ0lKcFdDMTBRRE1LTjdmbFJwN2VKem4xN0dFUjEyRm5ST0UxOVN1QSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757359623),
('ZTtu06Rk3ueV3wXMH3qRr7G1ZNdHURk2WMMl3Nzc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiZ0FmamtBb0FiQ000NnhWT2FacnVnZkNXbGExQmw2WklDUVdSSm9uayI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757353240),
('Zy6UX4R2uUBYYWs6qbd8NLcp23vAfrqJz14v429G', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ0p1V3dIY1l2ZmZ3Q3FoRVJCVjhvcjlJdkJhQnVuUW02QWtSYVFhQSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1757350817);

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
(7, 10, 479.00, 1, '2025-09-06', 479.00, 'GCash', 0.00),
(8, 11, 379.00, 1, '2025-09-09', 379.00, 'GCash', 0.00);

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
  `birthday` date DEFAULT NULL,
  `gender` varchar(30) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `profilePicture` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `archive` tinyint(4) NOT NULL,
  `userType` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `fname`, `lname`, `email`, `password`, `contactNo`, `birthday`, `gender`, `status`, `profilePicture`, `address`, `archive`, `userType`) VALUES
(1, 'okim', 'Miko', 'Santos', 'santosmikoallen@gmail.com', '$2y$12$5fiTMf0S/7ll.UcIeQYhIuLKKsuObtkuv4iWZT3ahxXaokqIR6ybm', '09292902337', '2003-03-26', 'Male', 0, 'http://localhost:8000/storage/profile_photos/1753946270_okim.jpeg', 'San Juan', 1, 'Admin'),
(2, 'bibingka20', 'Mary Hannah', 'Reyes', 'reyesmaryhannahcaryl@gmail.com', '$2y$12$7aAuFyzyNrWoggmlULLs.uNvq.eDC/xdE5d47cWSVEMelo9yfx9J6', '09155467893', '2003-09-20', 'Female', 0, 'http://localhost:8000/storage/profile_photos/1754251090_ph-11134207-7ra0p-mchwszm552lqa1@resize_w450_nl.png', 'Malinis St', 1, 'Admin'),
(3, 'nicolevarga', 'Nicole', 'Varga', 'nicolevarga19@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1757440340_46f9ed697599fb2a1990aa37c02561f4.jpg', 'Guiguinto Bulacan', 1, 'Customer'),
(4, 'bibingkinitan', 'Jose', 'Rizal', 'joserizal@icloud.com', '$2y$12$O5dvQVpUA64PqaGq5vTwiuNtkH4/tAGMPmn6mcXDhjSCqolXigfNK', '09155467893', '2003-08-20', 'Female', 0, 'http://192.168.1.214:8000/storage/profile_photos/1757233807_land.png', 'Guiguinto Bulacan', 1, 'Customer'),
(5, 'KurrinChi', 'Ethan Gabriel', 'Fernandez', 'ethangabrielfernandez@gmail.com', '$2y$12$ZjQre96MDPJyMJAUae6nJut7d/SP5qv.Ah.YiJicpcINNEFTE9KOa', '09391179123', '2003-12-18', 'Male', 0, 'http://192.168.1.244:8000/storage/profile_photos/1758031154_pfp.jpg', 'Maronquillo', 1, 'Customer', NULL, NULL, NULL, '2025-09-16 13:53:55', '2025-09-16 13:59:15'),
(6, 'KurrinChi', 'Ethan Gabriel', 'Fernandez', 'ethangabrielfernandezadmin@gmail.com', '$2y$12$ZjQre96MDPJyMJAUae6nJut7d/SP5qv.Ah.YiJicpcINNEFTE9KOa', '09391179123', '2003-12-18', 'Male', 0, '', 'Maronquillo', 1, 'Admin', NULL, NULL, NULL, '2025-09-16 13:53:55', '2025-09-16 13:58:21');
;

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `bookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  MODIFY `bookingAddOnID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `booking_concepts`
--
ALTER TABLE `booking_concepts`
  MODIFY `bookingConceptID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `booking_request`
--
ALTER TABLE `booking_request`
  MODIFY `requestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `packageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1019;

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
-- AUTO_INCREMENT for table `package_types`
--
ALTER TABLE `package_types`
  MODIFY `typeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
