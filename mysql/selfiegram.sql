-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2025 at 09:30 PM
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
(1002, 'Squad Groupie', 'Suitable for 3 to 4 people, including a free baby or fur baby\r\n20 minutes of self-shoot on one chosen backdrop from six aesthetic backdrop options\r\n7 digital copies\r\n2 printed copies (4R - 1 portrait and 1 grid)\'', 699.00, 1),
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
(1017, 1),
(1017, 4),
(1018, 1),
(1018, 4);

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
  `archive` tinyint(4) NOT NULL
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
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`packageID`);

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
  MODIFY `bookingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `packageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1019;

--
-- AUTO_INCREMENT for table `package_types`
--
ALTER TABLE `package_types`
  MODIFY `typeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `package_type_mapping`
--
ALTER TABLE `package_type_mapping`
  ADD CONSTRAINT `package_type_mapping_ibfk_1` FOREIGN KEY (`packageID`) REFERENCES `packages` (`packageID`),
  ADD CONSTRAINT `package_type_mapping_ibfk_2` FOREIGN KEY (`typeID`) REFERENCES `package_types` (`typeID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
