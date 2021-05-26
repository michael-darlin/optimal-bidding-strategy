-- MariaDB dump 10.17  Distrib 10.5.6-MariaDB, for Win64 (AMD64)
--
-- Host: [HOSTNAME]    Database: test
-- ------------------------------------------------------
-- Server version	8.0.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bids` (
  `eventType` varchar(100) DEFAULT NULL,
  `blockTime` datetime DEFAULT NULL,
  `blockNumber` bigint(20) unsigned DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `trxHash` varchar(100) DEFAULT NULL,
  `gasPrice` bigint(20) unsigned DEFAULT NULL,
  `gasUsed` bigint(20) unsigned DEFAULT NULL,
  `auctionID` bigint(20) unsigned DEFAULT NULL,
  `osmPrice` decimal(10,3) DEFAULT NULL,
  `lot` decimal(10,3) DEFAULT NULL,
  `lotType` varchar(100) DEFAULT NULL,
  `tab` decimal(10,3) DEFAULT NULL,
  `tabType` varchar(100) DEFAULT NULL,
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  KEY `auctionID1_idx` (`auctionID`),
  KEY `index4` (`auctionID`,`lot`,`tab`,`trxHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `bidsByAuctionTime`
--

DROP TABLE IF EXISTS `bidsByAuctionTime`;
/*!50001 DROP VIEW IF EXISTS `bidsByAuctionTime`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `bidsByAuctionTime` (
  `auctionID` tinyint NOT NULL,
  `kickEvent` tinyint NOT NULL,
  `kickTime` tinyint NOT NULL,
  `bidEvent` tinyint NOT NULL,
  `bidTime` tinyint NOT NULL,
  `blockNumber` tinyint NOT NULL,
  `address` tinyint NOT NULL,
  `trxHash` tinyint NOT NULL,
  `auctionTimeSec` tinyint NOT NULL,
  `pctTimeUsed` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `bidsWithTrxFee`
--

DROP TABLE IF EXISTS `bidsWithTrxFee`;
/*!50001 DROP VIEW IF EXISTS `bidsWithTrxFee`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `bidsWithTrxFee` (
  `eventType` tinyint NOT NULL,
  `blockTime` tinyint NOT NULL,
  `blockNumber` tinyint NOT NULL,
  `address` tinyint NOT NULL,
  `trxHash` tinyint NOT NULL,
  `gasPrice` tinyint NOT NULL,
  `gasUsed` tinyint NOT NULL,
  `trxFee` tinyint NOT NULL,
  `auctionID` tinyint NOT NULL,
  `osmPrice` tinyint NOT NULL,
  `lot` tinyint NOT NULL,
  `lotType` tinyint NOT NULL,
  `tab` tinyint NOT NULL,
  `tabType` tinyint NOT NULL,
  `ID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `competitiveAuctions`
--

DROP TABLE IF EXISTS `competitiveAuctions`;
/*!50001 DROP VIEW IF EXISTS `competitiveAuctions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `competitiveAuctions` (
  `auctionID` tinyint NOT NULL,
  `auctionCount` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `currentFileParam`
--

DROP TABLE IF EXISTS `currentFileParam`;
/*!50001 DROP VIEW IF EXISTS `currentFileParam`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `currentFileParam` (
  `eventType` tinyint NOT NULL,
  `blockTime` tinyint NOT NULL,
  `configType` tinyint NOT NULL,
  `Value` tinyint NOT NULL,
  `unit` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deals` (
  `eventType` varchar(100) DEFAULT NULL,
  `blockTime` datetime DEFAULT NULL,
  `blockNumber` bigint(20) unsigned DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `trxHash` varchar(100) DEFAULT NULL,
  `gasPrice` bigint(20) unsigned DEFAULT NULL,
  `gasUsed` bigint(20) unsigned DEFAULT NULL,
  `auctionID` bigint(20) unsigned NOT NULL,
  `osmPrice` decimal(10,3) DEFAULT NULL,
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`auctionID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  UNIQUE KEY `auctionID_UNIQUE` (`auctionID`),
  KEY `auctionID2_idx` (`auctionID`) /*!80000 INVISIBLE */,
  KEY `index5` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kicks`
--

DROP TABLE IF EXISTS `kicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kicks` (
  `eventType` varchar(100) DEFAULT NULL,
  `blockTime` datetime DEFAULT NULL,
  `blockNumber` bigint(2) unsigned DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `trxHash` varchar(100) DEFAULT NULL,
  `gasPrice` bigint(20) unsigned DEFAULT NULL,
  `gasUsed` bigint(20) unsigned DEFAULT NULL,
  `auctionID` bigint(20) unsigned NOT NULL,
  `osmPrice` decimal(10,3) DEFAULT NULL,
  `lot` decimal(10,3) DEFAULT NULL,
  `lotType` varchar(100) DEFAULT NULL,
  `tab` decimal(10,3) DEFAULT NULL,
  `tabType` varchar(100) DEFAULT NULL,
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`auctionID`),
  UNIQUE KEY `auctionID_UNIQUE` (`auctionID`),
  UNIQUE KEY `id_UNIQUE` (`ID`) /*!80000 INVISIBLE */,
  KEY `index4` (`ID`) /*!80000 INVISIBLE */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kicks`
--

LOCK TABLES `kicks` WRITE;
/*!40000 ALTER TABLE `kicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `kicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `other`
--

DROP TABLE IF EXISTS `other`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `other` (
  `eventType` varchar(100) DEFAULT NULL,
  `blockTime` datetime DEFAULT NULL,
  `blockNumber` bigint(20) unsigned DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `trxHash` varchar(100) DEFAULT NULL,
  `gasPrice` bigint(20) unsigned DEFAULT NULL,
  `gasUsed` bigint(20) unsigned DEFAULT NULL,
  `configType` varchar(100) DEFAULT NULL,
  `value` decimal(10,0) unsigned DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  KEY `index3` (`eventType`,`blockTime`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `other`
--

LOCK TABLES `other` WRITE;
/*!40000 ALTER TABLE `other` DISABLE KEYS */;
/*!40000 ALTER TABLE `other` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `topAddrByAvgDiscount`
--

DROP TABLE IF EXISTS `topAddrByAvgDiscount`;
/*!50001 DROP VIEW IF EXISTS `topAddrByAvgDiscount`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByAvgDiscount` (
  `address` tinyint NOT NULL,
  `avgDiscount` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByBidsPerAuction`
--

DROP TABLE IF EXISTS `topAddrByBidsPerAuction`;
/*!50001 DROP VIEW IF EXISTS `topAddrByBidsPerAuction`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByBidsPerAuction` (
  `address` tinyint NOT NULL,
  `totalBids` tinyint NOT NULL,
  `numAuctionsBid` tinyint NOT NULL,
  `bidsPerAuction` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByGrossProfit`
--

DROP TABLE IF EXISTS `topAddrByGrossProfit`;
/*!50001 DROP VIEW IF EXISTS `topAddrByGrossProfit`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByGrossProfit` (
  `address` tinyint NOT NULL,
  `lotWonETH` tinyint NOT NULL,
  `lotWonUSD` tinyint NOT NULL,
  `tabPaidUSD` tinyint NOT NULL,
  `grossProfitUSD` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByLotWon`
--

DROP TABLE IF EXISTS `topAddrByLotWon`;
/*!50001 DROP VIEW IF EXISTS `topAddrByLotWon`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByLotWon` (
  `address` tinyint NOT NULL,
  `lotWon` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByNetProfit`
--

DROP TABLE IF EXISTS `topAddrByNetProfit`;
/*!50001 DROP VIEW IF EXISTS `topAddrByNetProfit`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByNetProfit` (
  `address` tinyint NOT NULL,
  `lotWonETH` tinyint NOT NULL,
  `lotWonUSD` tinyint NOT NULL,
  `tabPaidUSD` tinyint NOT NULL,
  `grossProfitUSD` tinyint NOT NULL,
  `grossProfitPct` tinyint NOT NULL,
  `trxFeesUSD` tinyint NOT NULL,
  `netProfitUSD` tinyint NOT NULL,
  `netProfitPct` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByNumAuctionsBid`
--

DROP TABLE IF EXISTS `topAddrByNumAuctionsBid`;
/*!50001 DROP VIEW IF EXISTS `topAddrByNumAuctionsBid`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByNumAuctionsBid` (
  `address` tinyint NOT NULL,
  `NumAuctionsBid` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByNumAuctionsWon`
--

DROP TABLE IF EXISTS `topAddrByNumAuctionsWon`;
/*!50001 DROP VIEW IF EXISTS `topAddrByNumAuctionsWon`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByNumAuctionsWon` (
  `address` tinyint NOT NULL,
  `NumAuctionsWon` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByTotalBids`
--

DROP TABLE IF EXISTS `topAddrByTotalBids`;
/*!50001 DROP VIEW IF EXISTS `topAddrByTotalBids`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByTotalBids` (
  `address` tinyint NOT NULL,
  `totalBids` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByTrxFees`
--

DROP TABLE IF EXISTS `topAddrByTrxFees`;
/*!50001 DROP VIEW IF EXISTS `topAddrByTrxFees`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByTrxFees` (
  `address` tinyint NOT NULL,
  `trxFeesETH` tinyint NOT NULL,
  `trxFeesUSD` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrByWinRate`
--

DROP TABLE IF EXISTS `topAddrByWinRate`;
/*!50001 DROP VIEW IF EXISTS `topAddrByWinRate`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrByWinRate` (
  `address` tinyint NOT NULL,
  `NumAuctionsWon` tinyint NOT NULL,
  `NumAuctionsBid` tinyint NOT NULL,
  `winRate` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `topAddrLeaderBoard`
--

DROP TABLE IF EXISTS `topAddrLeaderBoard`;
/*!50001 DROP VIEW IF EXISTS `topAddrLeaderBoard`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `topAddrLeaderBoard` (
  `alias` tinyint NOT NULL,
  `address` tinyint NOT NULL,
  `totalBids` tinyint NOT NULL,
  `numAuctionsBid` tinyint NOT NULL,
  `numAuctionsWon` tinyint NOT NULL,
  `winRate` tinyint NOT NULL,
  `lotWonETH` tinyint NOT NULL,
  `lotWonUSD` tinyint NOT NULL,
  `tabPaidUSD` tinyint NOT NULL,
  `grossProfitUSD` tinyint NOT NULL,
  `grossProfitPct` tinyint NOT NULL,
  `trxFeesUSD` tinyint NOT NULL,
  `netProfitUSD` tinyint NOT NULL,
  `netProfitPct` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `winBids`
--

DROP TABLE IF EXISTS `winBids`;
/*!50001 DROP VIEW IF EXISTS `winBids`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `winBids` (
  `eventType` tinyint NOT NULL,
  `blockTime` tinyint NOT NULL,
  `blockNumber` tinyint NOT NULL,
  `address` tinyint NOT NULL,
  `trxHash` tinyint NOT NULL,
  `gasPrice` tinyint NOT NULL,
  `gasUsed` tinyint NOT NULL,
  `auctionID` tinyint NOT NULL,
  `osmPrice` tinyint NOT NULL,
  `lot` tinyint NOT NULL,
  `lotType` tinyint NOT NULL,
  `tab` tinyint NOT NULL,
  `tabType` tinyint NOT NULL,
  `ID` tinyint NOT NULL,
  `trxfeeusd` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `winBidsWithProfit`
--

DROP TABLE IF EXISTS `winBidsWithProfit`;
/*!50001 DROP VIEW IF EXISTS `winBidsWithProfit`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `winBidsWithProfit` (
  `bidTime` tinyint NOT NULL,
  `dealTime` tinyint NOT NULL,
  `blockNumber` tinyint NOT NULL,
  `address` tinyint NOT NULL,
  `trxHash` tinyint NOT NULL,
  `auctionID` tinyint NOT NULL,
  `lot` tinyint NOT NULL,
  `lotType` tinyint NOT NULL,
  `tab` tinyint NOT NULL,
  `tabType` tinyint NOT NULL,
  `pricePerETH` tinyint NOT NULL,
  `finalOsmPrice` tinyint NOT NULL,
  `discount` tinyint NOT NULL,
  `trxFee` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'test'
--

--
-- Final view structure for view `bidsByAuctionTime`
--

/*!50001 DROP TABLE IF EXISTS `bidsByAuctionTime`*/;
/*!50001 DROP VIEW IF EXISTS `bidsByAuctionTime`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `bidsByAuctionTime` AS select `bids`.`auctionID` AS `auctionID`,`kicks`.`eventType` AS `kickEvent`,`kicks`.`blockTime` AS `kickTime`,`bids`.`eventType` AS `bidEvent`,`bids`.`blockTime` AS `bidTime`,`bids`.`blockNumber` AS `blockNumber`,`bids`.`address` AS `address`,`bids`.`trxHash` AS `trxHash`,timestampdiff(SECOND,`kicks`.`blockTime`,`bids`.`blockTime`) AS `auctionTimeSec`,(timestampdiff(SECOND,`kicks`.`blockTime`,`bids`.`blockTime`) / ((select `currentFileParam`.`Value` from `currentFileParam` where (`currentFileParam`.`configType` = 'TAU')) * 60)) AS `pctTimeUsed` from (`bids` join `kicks` on((`bids`.`auctionID` = `kicks`.`auctionID`))) order by timestampdiff(SECOND,`kicks`.`blockTime`,`bids`.`blockTime`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `bidsWithTrxFee`
--

/*!50001 DROP TABLE IF EXISTS `bidsWithTrxFee`*/;
/*!50001 DROP VIEW IF EXISTS `bidsWithTrxFee`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `bidsWithTrxFee` AS select `bids`.`eventType` AS `eventType`,`bids`.`blockTime` AS `blockTime`,`bids`.`blockNumber` AS `blockNumber`,`bids`.`address` AS `address`,`bids`.`trxHash` AS `trxHash`,`bids`.`gasPrice` AS `gasPrice`,`bids`.`gasUsed` AS `gasUsed`,((`bids`.`gasPrice` * `bids`.`gasUsed`) / 1E18) AS `trxFee`,`bids`.`auctionID` AS `auctionID`,`bids`.`osmPrice` AS `osmPrice`,`bids`.`lot` AS `lot`,`bids`.`lotType` AS `lotType`,`bids`.`tab` AS `tab`,`bids`.`tabType` AS `tabType`,`bids`.`ID` AS `ID` from `bids` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `competitiveAuctions`
--

/*!50001 DROP TABLE IF EXISTS `competitiveAuctions`*/;
/*!50001 DROP VIEW IF EXISTS `competitiveAuctions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `competitiveAuctions` AS select `bids`.`auctionID` AS `auctionID`,count(0) AS `auctionCount` from `bids` group by `bids`.`auctionID` order by `auctionCount` desc limit 0,100000 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `currentFileParam`
--

/*!50001 DROP TABLE IF EXISTS `currentFileParam`*/;
/*!50001 DROP VIEW IF EXISTS `currentFileParam`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `currentFileParam` AS select `o1`.`eventType` AS `eventType`,`o1`.`blockTime` AS `blockTime`,`o1`.`configType` AS `configType`,`o1`.`value` AS `Value`,`o1`.`unit` AS `unit` from (`other` `o1` join (select max(`other`.`blockTime`) AS `MaxTime` from `other` group by `other`.`configType`) `o2` on(((`o1`.`blockTime` = `o2`.`MaxTime`) and (`o1`.`configType` is not null)))) group by `o1`.`configType` order by `o1`.`configType` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByAvgDiscount`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByAvgDiscount`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByAvgDiscount`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByAvgDiscount` AS select `winBidsWithProfit`.`address` AS `address`,avg(`winBidsWithProfit`.`discount`) AS `avgDiscount` from `winBidsWithProfit` group by `winBidsWithProfit`.`address` order by `avgDiscount` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByBidsPerAuction`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByBidsPerAuction`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByBidsPerAuction`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByBidsPerAuction` AS select `topTotalBids`.`address` AS `address`,`topTotalBids`.`totalBids` AS `totalBids`,`topNumBid`.`NumAuctionsBid` AS `numAuctionsBid`,(`topTotalBids`.`totalBids` / `topNumBid`.`NumAuctionsBid`) AS `bidsPerAuction` from (`topAddrByTotalBids` `topTotalBids` left join `topAddrByNumAuctionsBid` `topNumBid` on((`topTotalBids`.`address` = `topNumBid`.`address`))) order by (`topTotalBids`.`totalBids` / `topNumBid`.`NumAuctionsBid`),`topNumBid`.`NumAuctionsBid` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByGrossProfit`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByGrossProfit`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByGrossProfit`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByGrossProfit` AS select `winBids`.`address` AS `address`,sum(`winBids`.`lot`) AS `lotWonETH`,sum((`deals`.`osmPrice` * `winBids`.`lot`)) AS `lotWonUSD`,sum(`winBids`.`tab`) AS `tabPaidUSD`,sum(((`deals`.`osmPrice` * `winBids`.`lot`) - `winBids`.`tab`)) AS `grossProfitUSD` from (`winBids` join `deals` on((`winBids`.`auctionID` = `deals`.`auctionID`))) group by `winBids`.`address` order by `grossProfitUSD` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByLotWon`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByLotWon`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByLotWon`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByLotWon` AS select `winBids`.`address` AS `address`,sum(`winBids`.`lot`) AS `lotWon` from `winBids` group by `winBids`.`address` order by `lotWon` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByNetProfit`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByNetProfit`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByNetProfit`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByNetProfit` AS select `topAddrByTrxFees`.`address` AS `address`,ifnull(`topAddrByGrossProfit`.`lotWonETH`,0) AS `lotWonETH`,ifnull(`topAddrByGrossProfit`.`lotWonUSD`,0) AS `lotWonUSD`,ifnull(`topAddrByGrossProfit`.`tabPaidUSD`,0) AS `tabPaidUSD`,ifnull(`topAddrByGrossProfit`.`grossProfitUSD`,0) AS `grossProfitUSD`,ifnull((`topAddrByGrossProfit`.`grossProfitUSD` / `topAddrByGrossProfit`.`lotWonUSD`),0) AS `grossProfitPct`,ifnull(`topAddrByTrxFees`.`trxFeesUSD`,0) AS `trxFeesUSD`,(ifnull(`topAddrByGrossProfit`.`grossProfitUSD`,0) - ifnull(`topAddrByTrxFees`.`trxFeesUSD`,0)) AS `netProfitUSD`,ifnull(((ifnull(`topAddrByGrossProfit`.`grossProfitUSD`,0) - ifnull(`topAddrByTrxFees`.`trxFeesUSD`,0)) / ifnull(`topAddrByGrossProfit`.`lotWonUSD`,0)),0) AS `netProfitPct` from (`topAddrByTrxFees` left join `topAddrByGrossProfit` on((`topAddrByGrossProfit`.`address` = `topAddrByTrxFees`.`address`))) group by `topAddrByTrxFees`.`address` order by `netProfitPct` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByNumAuctionsBid`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByNumAuctionsBid`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByNumAuctionsBid`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByNumAuctionsBid` AS select `bids`.`address` AS `address`,count(distinct `bids`.`auctionID`) AS `NumAuctionsBid` from `bids` group by `bids`.`address` order by `NumAuctionsBid` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByNumAuctionsWon`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByNumAuctionsWon`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByNumAuctionsWon`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByNumAuctionsWon` AS select `winBids`.`address` AS `address`,count(`winBids`.`address`) AS `NumAuctionsWon` from `winBids` group by `winBids`.`address` order by `NumAuctionsWon` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByTotalBids`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByTotalBids`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByTotalBids`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByTotalBids` AS select `bids`.`address` AS `address`,count(`bids`.`address`) AS `totalBids` from `bids` group by `bids`.`address` order by `totalBids` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByTrxFees`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByTrxFees`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByTrxFees`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByTrxFees` AS select `bids`.`address` AS `address`,sum(((`bids`.`gasPrice` * `bids`.`gasUsed`) / 1E18)) AS `trxFeesETH`,sum((((`bids`.`gasPrice` * `bids`.`gasUsed`) / 1E18) * `bids`.`osmPrice`)) AS `trxFeesUSD` from `bids` group by `bids`.`address` order by `trxFeesUSD` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrByWinRate`
--

/*!50001 DROP TABLE IF EXISTS `topAddrByWinRate`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrByWinRate`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrByWinRate` AS select `topNumBid`.`address` AS `address`,ifnull(`topNumWon`.`NumAuctionsWon`,0) AS `NumAuctionsWon`,ifnull(`topNumBid`.`NumAuctionsBid`,0) AS `NumAuctionsBid`,ifnull((`topNumWon`.`NumAuctionsWon` / `topNumBid`.`NumAuctionsBid`),0) AS `winRate` from (`topAddrByNumAuctionsBid` `topNumBid` left join `topAddrByNumAuctionsWon` `topNumWon` on((`topNumBid`.`address` = `topNumWon`.`address`))) order by (`topNumWon`.`NumAuctionsWon` / `topNumBid`.`NumAuctionsBid`) desc,`topNumWon`.`NumAuctionsWon` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `topAddrLeaderBoard`
--

/*!50001 DROP TABLE IF EXISTS `topAddrLeaderBoard`*/;
/*!50001 DROP VIEW IF EXISTS `topAddrLeaderBoard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `topAddrLeaderBoard` AS select `other`.`cityNames`.`city` AS `alias`,`topAddrByTotalBids`.`address` AS `address`,`topAddrByTotalBids`.`totalBids` AS `totalBids`,`topAddrByWinRate`.`NumAuctionsBid` AS `numAuctionsBid`,`topAddrByWinRate`.`NumAuctionsWon` AS `numAuctionsWon`,`topAddrByWinRate`.`winRate` AS `winRate`,`topAddrByNetProfit`.`lotWonETH` AS `lotWonETH`,`topAddrByNetProfit`.`lotWonUSD` AS `lotWonUSD`,`topAddrByNetProfit`.`tabPaidUSD` AS `tabPaidUSD`,`topAddrByNetProfit`.`grossProfitUSD` AS `grossProfitUSD`,`topAddrByNetProfit`.`grossProfitPct` AS `grossProfitPct`,`topAddrByNetProfit`.`trxFeesUSD` AS `trxFeesUSD`,`topAddrByNetProfit`.`netProfitUSD` AS `netProfitUSD`,`topAddrByNetProfit`.`netProfitPct` AS `netProfitPct` from (((`topAddrByTotalBids` left join `topAddrByWinRate` on((`topAddrByWinRate`.`address` = `topAddrByTotalBids`.`address`))) left join `topAddrByNetProfit` on((`topAddrByWinRate`.`address` = `topAddrByNetProfit`.`address`))) left join `other`.`cityNames` on((`other`.`cityNames`.`address` = `topAddrByTotalBids`.`address`))) order by `topAddrByNetProfit`.`netProfitPct` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `winBids`
--

/*!50001 DROP TABLE IF EXISTS `winBids`*/;
/*!50001 DROP VIEW IF EXISTS `winBids`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `winBids` AS select `t`.`eventType` AS `eventType`,`t`.`blockTime` AS `blockTime`,`t`.`blockNumber` AS `blockNumber`,`t`.`address` AS `address`,`t`.`trxHash` AS `trxHash`,`t`.`gasPrice` AS `gasPrice`,`t`.`gasUsed` AS `gasUsed`,`t`.`auctionID` AS `auctionID`,`t`.`osmPrice` AS `osmPrice`,`t`.`lot` AS `lot`,`t`.`lotType` AS `lotType`,`t`.`tab` AS `tab`,`t`.`tabType` AS `tabType`,`t`.`ID` AS `ID`,(((`t`.`gasPrice` * `t`.`gasUsed`) / 1E18) * `t`.`osmPrice`) AS `trxfeeusd` from (select `bids`.`eventType` AS `eventType`,`bids`.`blockTime` AS `blockTime`,`bids`.`blockNumber` AS `blockNumber`,`bids`.`address` AS `address`,`bids`.`trxHash` AS `trxHash`,`bids`.`gasPrice` AS `gasPrice`,`bids`.`gasUsed` AS `gasUsed`,`bids`.`auctionID` AS `auctionID`,`bids`.`osmPrice` AS `osmPrice`,`bids`.`lot` AS `lot`,`bids`.`lotType` AS `lotType`,`bids`.`tab` AS `tab`,`bids`.`tabType` AS `tabType`,`bids`.`ID` AS `ID`,row_number() OVER (PARTITION BY `bids`.`auctionID` ORDER BY `bids`.`auctionID` desc,`bids`.`blockTime` desc,`bids`.`lot`,`bids`.`tab` desc )  AS `row_num` from `bids`) `t` where (`t`.`row_num` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `winBidsWithProfit`
--

/*!50001 DROP TABLE IF EXISTS `winBidsWithProfit`*/;
/*!50001 DROP VIEW IF EXISTS `winBidsWithProfit`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `winBidsWithProfit` AS select `winBids`.`blockTime` AS `bidTime`,`deals`.`blockTime` AS `dealTime`,`winBids`.`blockNumber` AS `blockNumber`,`winBids`.`address` AS `address`,`winBids`.`trxHash` AS `trxHash`,`winBids`.`auctionID` AS `auctionID`,`winBids`.`lot` AS `lot`,`winBids`.`lotType` AS `lotType`,`winBids`.`tab` AS `tab`,`winBids`.`tabType` AS `tabType`,(`winBids`.`tab` / `winBids`.`lot`) AS `pricePerETH`,`deals`.`osmPrice` AS `finalOsmPrice`,(((`winBids`.`tab` / `winBids`.`lot`) - `deals`.`osmPrice`) / `deals`.`osmPrice`) AS `discount`,`winBids`.`trxfeeusd` AS `trxFee` from (`deals` join `winBids` on((`deals`.`auctionID` = `winBids`.`auctionID`))) order by `deals`.`blockTime` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-03 20:55:14
