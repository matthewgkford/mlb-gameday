import React, { useState } from 'react';
import { TeamLogo, PlayerPhoto, TrendArrow, rateERA, rateWHIP } from './SharedUI';
import PlayerPage from './PlayerPage';

// Real 2025 pitch usage data from Baseball Savant
// Source: baseballsavant.mlb.com pitch arsenal stats export
// Note: Only pitches above the usage threshold are included per pitcher
// Percentages show actual usage rate for that pitch type
// 2025 pitch arsenal data — Baseball Savant Statcast
// Source: statcast pitch mix export, all pitchers with 1%+ usage on any pitch
// Includes average velocity per pitch type
// Updated: 2025 season to date
const PITCH_ARSENALS = {
  'A.J. Minter': [{type:'FC',name:'Cutter',pct:47.6,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:42.7,vel:94.5},{type:'CH',name:'Changeup',pct:9.7,vel:86.2}],
  'A.J. Puk': [{type:'FF',name:'Four-seam Fastball',pct:62.2,vel:96.4},{type:'SL',name:'Slider',pct:36.5,vel:85.4},{type:'SI',name:'Sinker',pct:1.3,vel:95.8}],
  'AJ Blubaugh': [{type:'FF',name:'Four-seam Fastball',pct:50.2,vel:94.9},{type:'ST',name:'Sweeper',pct:21.4,vel:82.3},{type:'CH',name:'Changeup',pct:21.0,vel:86.3},{type:'FC',name:'Cutter',pct:4.4,vel:88.0},{type:'CU',name:'Curveball',pct:3.1,vel:79.1}],
  'AJ Smith-Shawver': [{type:'FF',name:'Four-seam Fastball',pct:46.7,vel:95.6},{type:'FS',name:'Splitter',pct:33.9,vel:83.2},{type:'CU',name:'Curveball',pct:15.2,vel:77.3},{type:'SL',name:'Slider',pct:4.2,vel:86.9}],
  'Aaron Ashby': [{type:'SI',name:'Sinker',pct:50.8,vel:97.4},{type:'CU',name:'Curveball',pct:24.1,vel:82.3},{type:'CH',name:'Changeup',pct:11.5,vel:91.3},{type:'SL',name:'Slider',pct:9.1,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:4.4,vel:97.3}],
  'Aaron Bummer': [{type:'CU',name:'Curveball',pct:34.2,vel:80.9},{type:'SI',name:'Sinker',pct:34.2,vel:90.8},{type:'ST',name:'Sweeper',pct:17.2,vel:81.1},{type:'FF',name:'Four-seam Fastball',pct:12.4,vel:91.5},{type:'FC',name:'Cutter',pct:2.0,vel:87.2}],
  'Aaron Civale': [{type:'FC',name:'Cutter',pct:34.2,vel:89.0},{type:'CU',name:'Curveball',pct:20.0,vel:77.7},{type:'SI',name:'Sinker',pct:17.1,vel:92.1},{type:'FF',name:'Four-seam Fastball',pct:15.5,vel:92.1},{type:'SL',name:'Slider',pct:7.3,vel:83.2},{type:'FS',name:'Splitter',pct:5.7,vel:85.5},{type:'ST',name:'Sweeper',pct:0.3,vel:80.6}],
  'Aaron Nola': [{type:'FF',name:'Four-seam Fastball',pct:30.4,vel:91.8},{type:'KC',name:'Knuckle Curve',pct:29.1,vel:78.3},{type:'SI',name:'Sinker',pct:18.0,vel:90.8},{type:'CH',name:'Changeup',pct:14.7,vel:84.9},{type:'FC',name:'Cutter',pct:7.8,vel:86.2}],
  'Aaron Sanchez': [{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:94.1},{type:'CU',name:'Curveball',pct:31.5,vel:78.6},{type:'FC',name:'Cutter',pct:14.8,vel:88.2},{type:'SI',name:'Sinker',pct:14.8,vel:93.5},{type:'CH',name:'Changeup',pct:5.6,vel:88.1}],
  'Abner Uribe': [{type:'SI',name:'Sinker',pct:52.3,vel:98.5},{type:'SL',name:'Slider',pct:45.8,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:1.9,vel:99.7}],
  'Adam Mazur': [{type:'SL',name:'Slider',pct:28.6,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:23.9,vel:94.8},{type:'SI',name:'Sinker',pct:16.0,vel:94.3},{type:'ST',name:'Sweeper',pct:12.3,vel:83.5},{type:'CU',name:'Curveball',pct:10.8,vel:82.4},{type:'CH',name:'Changeup',pct:8.4,vel:89.3}],
  'Adrian Houser': [{type:'SI',name:'Sinker',pct:45.7,vel:94.4},{type:'SL',name:'Slider',pct:15.5,vel:88.1},{type:'CH',name:'Changeup',pct:15.4,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:12.0,vel:95.3},{type:'CU',name:'Curveball',pct:11.4,vel:81.8}],
  'Adrian Morejon': [{type:'SI',name:'Sinker',pct:61.1,vel:97.9},{type:'SL',name:'Slider',pct:24.3,vel:87.7},{type:'CH',name:'Changeup',pct:8.5,vel:91.0},{type:'FF',name:'Four-seam Fastball',pct:3.0,vel:96.8},{type:'FC',name:'Cutter',pct:2.7,vel:94.0},{type:'KN',name:'Knuckleball',pct:0.4,vel:86.3}],
  'Alan Rangel': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:92.8},{type:'CH',name:'Changeup',pct:31.0,vel:82.2},{type:'SL',name:'Slider',pct:19.0,vel:85.0},{type:'CU',name:'Curveball',pct:6.3,vel:73.6}],
  'Albert Suárez': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:93.5},{type:'FC',name:'Cutter',pct:19.5,vel:85.5},{type:'CH',name:'Changeup',pct:13.2,vel:85.0},{type:'CU',name:'Curveball',pct:10.6,vel:78.9},{type:'SV',name:'Slurve',pct:6.6,vel:81.0}],
  'Alek Jacob': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:85.2},{type:'CH',name:'Changeup',pct:33.6,vel:73.9},{type:'SI',name:'Sinker',pct:13.5,vel:84.2},{type:'ST',name:'Sweeper',pct:10.1,vel:71.8}],
  'Alek Manoah': [{type:'CH',name:'Changeup',pct:45.9,vel:84.6},{type:'FF',name:'Four-seam Fastball',pct:27.1,vel:90.0},{type:'SI',name:'Sinker',pct:16.5,vel:89.4},{type:'SL',name:'Slider',pct:10.6,vel:78.0}],
  'Alex Carrillo': [{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:97.8},{type:'SL',name:'Slider',pct:32.1,vel:86.9},{type:'FS',name:'Splitter',pct:26.2,vel:90.4}],
  'Alex Lange': [{type:'SL',name:'Slider',pct:32.2,vel:87.7},{type:'CH',name:'Changeup',pct:27.5,vel:90.0},{type:'SI',name:'Sinker',pct:18.0,vel:95.2},{type:'FF',name:'Four-seam Fastball',pct:16.1,vel:95.5},{type:'KC',name:'Knuckle Curve',pct:3.3,vel:85.5},{type:'FC',name:'Cutter',pct:2.8,vel:91.0}],
  'Alex Vesia': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:92.5},{type:'SL',name:'Slider',pct:35.9,vel:84.8},{type:'CH',name:'Changeup',pct:6.7,vel:83.5}],
  'Alexis Díaz': [{type:'FF',name:'Four-seam Fastball',pct:59.6,vel:93.5},{type:'SL',name:'Slider',pct:40.4,vel:87.5}],
  'Allan Winans': [{type:'CH',name:'Changeup',pct:32.7,vel:82.8},{type:'SI',name:'Sinker',pct:31.0,vel:89.9},{type:'ST',name:'Sweeper',pct:18.7,vel:79.8},{type:'FF',name:'Four-seam Fastball',pct:14.6,vel:89.7},{type:'CU',name:'Curveball',pct:2.9,vel:76.0}],
  'Andre Granillo': [{type:'SL',name:'Slider',pct:64.9,vel:83.3},{type:'FF',name:'Four-seam Fastball',pct:26.1,vel:94.6},{type:'SI',name:'Sinker',pct:4.7,vel:94.9},{type:'CH',name:'Changeup',pct:4.3,vel:88.5}],
  'Andre Pallante': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:94.5},{type:'SL',name:'Slider',pct:28.5,vel:87.4},{type:'KC',name:'Knuckle Curve',pct:14.2,vel:78.1},{type:'SI',name:'Sinker',pct:13.8,vel:94.9},{type:'FS',name:'Splitter',pct:0.5,vel:87.4},{type:'ST',name:'Sweeper',pct:0.1,vel:83.0}],
  'Andrew Abbott': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:92.8},{type:'CH',name:'Changeup',pct:19.7,vel:85.0},{type:'CU',name:'Curveball',pct:16.0,vel:80.8},{type:'ST',name:'Sweeper',pct:12.6,vel:82.7},{type:'FC',name:'Cutter',pct:3.9,vel:88.7}],
  'Andrew Alvarez': [{type:'FF',name:'Four-seam Fastball',pct:34.1,vel:91.3},{type:'SL',name:'Slider',pct:29.0,vel:82.4},{type:'CU',name:'Curveball',pct:27.1,vel:82.5},{type:'CH',name:'Changeup',pct:5.3,vel:85.2},{type:'SI',name:'Sinker',pct:4.6,vel:90.9}],
  'Andrew Chafin': [{type:'SI',name:'Sinker',pct:40.9,vel:89.7},{type:'SL',name:'Slider',pct:38.6,vel:80.5},{type:'FF',name:'Four-seam Fastball',pct:19.9,vel:89.5},{type:'CH',name:'Changeup',pct:0.6,vel:84.4}],
  'Andrew Heaney': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:90.1},{type:'CH',name:'Changeup',pct:17.3,vel:82.0},{type:'SL',name:'Slider',pct:16.6,vel:80.5},{type:'SI',name:'Sinker',pct:11.2,vel:89.2},{type:'CU',name:'Curveball',pct:5.8,vel:76.8},{type:'CS',name:'CS',pct:5.4,vel:73.5}],
  'Andrew Hoffmann': [{type:'FF',name:'Four-seam Fastball',pct:45.2,vel:94.5},{type:'CH',name:'Changeup',pct:41.9,vel:88.0},{type:'SL',name:'Slider',pct:11.5,vel:86.8},{type:'CU',name:'Curveball',pct:1.4,vel:84.0}],
  'Andrew Kittredge': [{type:'SL',name:'Slider',pct:52.1,vel:89.3},{type:'SI',name:'Sinker',pct:36.4,vel:95.2},{type:'FF',name:'Four-seam Fastball',pct:10.7,vel:94.7},{type:'FS',name:'Splitter',pct:0.8,vel:88.5}],
  'Andrew Morris': [{type:'FF',name:'Four-seam Fastball',pct:25.4,vel:96.7},{type:'ST',name:'Sweeper',pct:23.9,vel:81.7},{type:'SI',name:'Sinker',pct:22.4,vel:96.2},{type:'FC',name:'Cutter',pct:13.4,vel:89.4},{type:'CU',name:'Curveball',pct:11.9,vel:75.2},{type:'CH',name:'Changeup',pct:3.0,vel:88.6}],
  'Andrew Nardi': [{type:'SL',name:'Slider',pct:45.1,vel:82.8},{type:'FF',name:'Four-seam Fastball',pct:42.2,vel:93.5},{type:'CH',name:'Changeup',pct:11.0,vel:88.2},{type:'FS',name:'Splitter',pct:1.7,vel:84.0}],
  'Andrew Painter': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:96.5},{type:'SL',name:'Slider',pct:19.6,vel:88.6},{type:'SI',name:'Sinker',pct:12.1,vel:95.0},{type:'CU',name:'Curveball',pct:11.8,vel:81.1},{type:'FS',name:'Splitter',pct:9.8,vel:87.6},{type:'ST',name:'Sweeper',pct:9.8,vel:83.3}],
  'Andrew Saalfrank': [{type:'SI',name:'Sinker',pct:45.7,vel:89.3},{type:'CU',name:'Curveball',pct:44.7,vel:79.7},{type:'FF',name:'Four-seam Fastball',pct:9.6,vel:89.2}],
  'Andry Lara': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:94.2},{type:'SL',name:'Slider',pct:32.5,vel:86.0},{type:'SI',name:'Sinker',pct:16.1,vel:94.5},{type:'FS',name:'Splitter',pct:5.9,vel:88.2}],
  'Andrés Muñoz': [{type:'SL',name:'Slider',pct:53.3,vel:86.0},{type:'FF',name:'Four-seam Fastball',pct:32.7,vel:98.4},{type:'SI',name:'Sinker',pct:12.2,vel:97.8},{type:'CH',name:'Changeup',pct:1.8,vel:91.4}],
  'Angel Bastardo': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:96.7},{type:'CH',name:'Changeup',pct:29.0,vel:87.3},{type:'SL',name:'Slider',pct:17.7,vel:84.2},{type:'CU',name:'Curveball',pct:3.2,vel:79.4}],
  'Angel Chivilli': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:97.1},{type:'CH',name:'Changeup',pct:36.8,vel:88.7},{type:'SL',name:'Slider',pct:17.7,vel:90.2}],
  'Angel Perdomo': [{type:'FF',name:'Four-seam Fastball',pct:65.6,vel:92.2},{type:'SL',name:'Slider',pct:30.0,vel:82.3},{type:'CH',name:'Changeup',pct:4.4,vel:89.6}],
  'Angel Zerpa': [{type:'SI',name:'Sinker',pct:46.7,vel:96.5},{type:'SL',name:'Slider',pct:30.6,vel:85.3},{type:'FF',name:'Four-seam Fastball',pct:18.5,vel:96.2},{type:'CH',name:'Changeup',pct:4.2,vel:90.6}],
  'Anthony Banda': [{type:'SL',name:'Slider',pct:49.2,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:23.9,vel:95.4},{type:'SI',name:'Sinker',pct:23.6,vel:95.3},{type:'CH',name:'Changeup',pct:3.3,vel:89.5}],
  'Anthony Bender': [{type:'ST',name:'Sweeper',pct:45.4,vel:83.8},{type:'SI',name:'Sinker',pct:27.1,vel:96.5},{type:'SL',name:'Slider',pct:21.9,vel:87.1},{type:'CH',name:'Changeup',pct:4.1,vel:89.0},{type:'FF',name:'Four-seam Fastball',pct:1.6,vel:95.9}],
  'Anthony DeSclafani': [{type:'SL',name:'Slider',pct:22.1,vel:88.2},{type:'KC',name:'Knuckle Curve',pct:21.5,vel:83.2},{type:'FS',name:'Splitter',pct:20.3,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:93.9},{type:'SI',name:'Sinker',pct:17.8,vel:94.1},{type:'ST',name:'Sweeper',pct:0.3,vel:80.8}],
  'Anthony Kay': [{type:'FF',name:'Four-seam Fastball',pct:30.1,vel:95.6},{type:'SL',name:'Slider',pct:22.4,vel:90.3},{type:'ST',name:'Sweeper',pct:18.8,vel:82.5},{type:'SI',name:'Sinker',pct:15.4,vel:95.0},{type:'CH',name:'Changeup',pct:13.3,vel:85.2}],
  'Anthony Maldonado': [{type:'SL',name:'Slider',pct:51.9,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:48.1,vel:92.5}],
  'Anthony Misiewicz': [{type:'FC',name:'Cutter',pct:55.3,vel:87.5},{type:'CH',name:'Changeup',pct:18.9,vel:86.4},{type:'CU',name:'Curveball',pct:15.2,vel:78.2},{type:'FF',name:'Four-seam Fastball',pct:6.8,vel:92.0},{type:'SI',name:'Sinker',pct:3.8,vel:90.4}],
  'Anthony Molina': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:95.7},{type:'CH',name:'Changeup',pct:18.4,vel:87.1},{type:'SL',name:'Slider',pct:15.2,vel:87.1},{type:'CU',name:'Curveball',pct:14.6,vel:83.5},{type:'SI',name:'Sinker',pct:4.8,vel:95.0},{type:'FC',name:'Cutter',pct:3.3,vel:91.0}],
  'Anthony Nunez': [{type:'ST',name:'Sweeper',pct:31.3,vel:86.0},{type:'CH',name:'Changeup',pct:22.6,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:21.7,vel:96.4},{type:'SI',name:'Sinker',pct:21.7,vel:95.8},{type:'FC',name:'Cutter',pct:2.6,vel:90.6}],
  'Anthony Veneziano': [{type:'FF',name:'Four-seam Fastball',pct:30.4,vel:94.0},{type:'ST',name:'Sweeper',pct:27.0,vel:82.7},{type:'SL',name:'Slider',pct:23.9,vel:87.1},{type:'SI',name:'Sinker',pct:11.6,vel:92.7},{type:'CH',name:'Changeup',pct:7.1,vel:87.0}],
  'Antoine Kelly': [{type:'SL',name:'Slider',pct:46.9,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:42.2,vel:97.4},{type:'CH',name:'Changeup',pct:9.4,vel:89.0},{type:'SI',name:'Sinker',pct:1.6,vel:97.9}],
  'Antonio Senzatela': [{type:'FF',name:'Four-seam Fastball',pct:55.5,vel:95.1},{type:'SL',name:'Slider',pct:16.9,vel:86.8},{type:'CU',name:'Curveball',pct:14.6,vel:80.5},{type:'CH',name:'Changeup',pct:7.7,vel:87.8},{type:'FC',name:'Cutter',pct:3.7,vel:91.4},{type:'SI',name:'Sinker',pct:1.5,vel:94.8}],
  'Aroldis Chapman': [{type:'FF',name:'Four-seam Fastball',pct:40.7,vel:98.2},{type:'SI',name:'Sinker',pct:32.6,vel:99.2},{type:'SL',name:'Slider',pct:15.7,vel:86.5},{type:'FS',name:'Splitter',pct:11.0,vel:91.0}],
  'Austin Cox': [{type:'FF',name:'Four-seam Fastball',pct:35.6,vel:92.7},{type:'SL',name:'Slider',pct:32.6,vel:86.6},{type:'CU',name:'Curveball',pct:17.6,vel:80.4},{type:'FS',name:'Splitter',pct:10.3,vel:82.2},{type:'FC',name:'Cutter',pct:3.5,vel:91.1},{type:'SI',name:'Sinker',pct:0.5,vel:92.6}],
  'Austin Gomber': [{type:'FF',name:'Four-seam Fastball',pct:33.2,vel:89.5},{type:'KC',name:'Knuckle Curve',pct:23.6,vel:76.0},{type:'CH',name:'Changeup',pct:15.8,vel:81.0},{type:'SL',name:'Slider',pct:15.7,vel:82.4},{type:'FC',name:'Cutter',pct:6.4,vel:86.5},{type:'FS',name:'Splitter',pct:4.9,vel:81.0},{type:'SI',name:'Sinker',pct:0.3,vel:89.9}],
  'Austin Hedges': [{type:'FA',name:'FA',pct:86.7,vel:72.9},{type:'EP',name:'EP',pct:11.7,vel:55.3},{type:'CH',name:'Changeup',pct:1.7,vel:70.2}],
  'Austin Warren': [{type:'ST',name:'Sweeper',pct:33.0,vel:84.2},{type:'SI',name:'Sinker',pct:32.4,vel:94.1},{type:'FC',name:'Cutter',pct:15.1,vel:88.4},{type:'FF',name:'Four-seam Fastball',pct:12.8,vel:94.0},{type:'CH',name:'Changeup',pct:4.5,vel:87.9},{type:'CU',name:'Curveball',pct:2.2,vel:83.5}],
  'Bailey Falter': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:92.2},{type:'SL',name:'Slider',pct:18.5,vel:85.1},{type:'CU',name:'Curveball',pct:12.0,vel:77.8},{type:'SI',name:'Sinker',pct:9.5,vel:92.2},{type:'FS',name:'Splitter',pct:8.1,vel:85.3},{type:'SV',name:'Slurve',pct:0.8,vel:80.2}],
  'Bailey Horn': [{type:'FF',name:'Four-seam Fastball',pct:32.6,vel:95.5},{type:'ST',name:'Sweeper',pct:32.6,vel:84.7},{type:'SI',name:'Sinker',pct:19.6,vel:95.2},{type:'FC',name:'Cutter',pct:15.2,vel:88.3}],
  'Bailey Ober': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:90.0},{type:'CH',name:'Changeup',pct:30.0,vel:83.2},{type:'SL',name:'Slider',pct:17.3,vel:83.5},{type:'ST',name:'Sweeper',pct:10.3,vel:78.2},{type:'CU',name:'Curveball',pct:3.6,vel:74.7},{type:'SI',name:'Sinker',pct:3.4,vel:90.1}],
  'Beau Brieske': [{type:'FF',name:'Four-seam Fastball',pct:48.6,vel:95.7},{type:'CH',name:'Changeup',pct:24.7,vel:89.8},{type:'SI',name:'Sinker',pct:16.5,vel:95.7},{type:'SL',name:'Slider',pct:10.1,vel:88.0}],
  'Ben Bowden': [{type:'FF',name:'Four-seam Fastball',pct:58.8,vel:93.4},{type:'SL',name:'Slider',pct:28.3,vel:84.0},{type:'CH',name:'Changeup',pct:11.8,vel:86.3},{type:'CU',name:'Curveball',pct:1.1,vel:82.0}],
  'Ben Brown': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:95.9},{type:'KC',name:'Knuckle Curve',pct:39.5,vel:87.3},{type:'CH',name:'Changeup',pct:4.4,vel:90.5},{type:'SI',name:'Sinker',pct:2.7,vel:96.9}],
  'Ben Casparius': [{type:'ST',name:'Sweeper',pct:32.0,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:31.0,vel:96.1},{type:'FC',name:'Cutter',pct:21.7,vel:92.1},{type:'CU',name:'Curveball',pct:14.0,vel:80.8},{type:'SI',name:'Sinker',pct:1.1,vel:95.2},{type:'CH',name:'Changeup',pct:0.1,vel:90.8}],
  'Ben Joyce': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:101.1},{type:'SI',name:'Sinker',pct:45.7,vel:94.8},{type:'SL',name:'Slider',pct:2.9,vel:83.4},{type:'CH',name:'Changeup',pct:1.4,vel:91.3}],
  'Ben Lively': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:89.8},{type:'SI',name:'Sinker',pct:24.3,vel:90.4},{type:'ST',name:'Sweeper',pct:10.8,vel:78.5},{type:'SL',name:'Slider',pct:8.8,vel:82.7},{type:'FC',name:'Cutter',pct:8.1,vel:84.4},{type:'CH',name:'Changeup',pct:7.8,vel:84.8},{type:'CU',name:'Curveball',pct:7.1,vel:77.3}],
  'Bennett Sousa': [{type:'SL',name:'Slider',pct:58.1,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:95.1},{type:'SI',name:'Sinker',pct:1.4,vel:93.9}],
  'Blade Tidwell': [{type:'FF',name:'Four-seam Fastball',pct:39.9,vel:95.9},{type:'ST',name:'Sweeper',pct:27.1,vel:83.2},{type:'SL',name:'Slider',pct:14.9,vel:88.4},{type:'SI',name:'Sinker',pct:14.6,vel:94.8},{type:'CH',name:'Changeup',pct:2.8,vel:83.1},{type:'FC',name:'Cutter',pct:0.5,vel:92.4},{type:'CU',name:'Curveball',pct:0.2,vel:84.1}],
  'Blake Snell': [{type:'FF',name:'Four-seam Fastball',pct:39.0,vel:95.4},{type:'CH',name:'Changeup',pct:26.0,vel:85.4},{type:'CU',name:'Curveball',pct:21.5,vel:81.0},{type:'SL',name:'Slider',pct:13.5,vel:88.9}],
  'Blake Treinen': [{type:'ST',name:'Sweeper',pct:47.9,vel:84.3},{type:'SI',name:'Sinker',pct:30.5,vel:95.8},{type:'FF',name:'Four-seam Fastball',pct:12.1,vel:95.2},{type:'FC',name:'Cutter',pct:9.5,vel:91.5}],
  'Blake Wehunt': [{type:'SI',name:'Sinker',pct:45.9,vel:96.0},{type:'SL',name:'Slider',pct:19.7,vel:84.4},{type:'CH',name:'Changeup',pct:16.4,vel:86.8},{type:'FC',name:'Cutter',pct:14.8,vel:89.9},{type:'CU',name:'Curveball',pct:3.3,vel:82.0}],
  'Blas Castaño': [{type:'FC',name:'Cutter',pct:40.0,vel:89.8},{type:'CH',name:'Changeup',pct:32.0,vel:88.6},{type:'ST',name:'Sweeper',pct:12.0,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:93.3},{type:'SI',name:'Sinker',pct:6.0,vel:93.9}],
  'Bobby Miller': [{type:'CU',name:'Curveball',pct:27.6,vel:79.0},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:97.6},{type:'SI',name:'Sinker',pct:22.4,vel:97.2},{type:'CH',name:'Changeup',pct:13.8,vel:86.0},{type:'SL',name:'Slider',pct:9.5,vel:88.6}],
  'Bowden Francis': [{type:'FF',name:'Four-seam Fastball',pct:56.0,vel:92.5},{type:'FS',name:'Splitter',pct:22.4,vel:82.2},{type:'CU',name:'Curveball',pct:14.0,vel:73.7},{type:'SL',name:'Slider',pct:5.8,vel:82.7},{type:'SI',name:'Sinker',pct:1.8,vel:91.5}],
  'Brad Keller': [{type:'FF',name:'Four-seam Fastball',pct:41.8,vel:97.1},{type:'SL',name:'Slider',pct:17.3,vel:87.0},{type:'SI',name:'Sinker',pct:15.1,vel:96.6},{type:'ST',name:'Sweeper',pct:13.4,vel:86.1},{type:'CH',name:'Changeup',pct:12.4,vel:92.6}],
  'Brad Lord': [{type:'FF',name:'Four-seam Fastball',pct:46.6,vel:94.7},{type:'SL',name:'Slider',pct:20.7,vel:85.5},{type:'SI',name:'Sinker',pct:18.8,vel:94.4},{type:'CH',name:'Changeup',pct:12.7,vel:85.9},{type:'ST',name:'Sweeper',pct:1.2,vel:82.9},{type:'UN',name:'UN',pct:0.0,vel:76.9}],
  'Bradgley Rodriguez': [{type:'CH',name:'Changeup',pct:33.3,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:29.5,vel:98.3},{type:'SI',name:'Sinker',pct:28.0,vel:98.1},{type:'FC',name:'Cutter',pct:9.2,vel:89.2}],
  'Bradley Blalock': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:94.6},{type:'FS',name:'Splitter',pct:15.5,vel:87.0},{type:'SL',name:'Slider',pct:14.9,vel:85.3},{type:'CU',name:'Curveball',pct:13.0,vel:81.0},{type:'FC',name:'Cutter',pct:11.2,vel:90.0}],
  'Brady Basso': [{type:'FF',name:'Four-seam Fastball',pct:52.4,vel:92.7},{type:'FC',name:'Cutter',pct:18.4,vel:88.3},{type:'CU',name:'Curveball',pct:17.5,vel:77.7},{type:'CH',name:'Changeup',pct:9.7,vel:86.0},{type:'SI',name:'Sinker',pct:1.9,vel:91.9}],
  'Brady Singer': [{type:'SI',name:'Sinker',pct:42.2,vel:92.0},{type:'SL',name:'Slider',pct:28.5,vel:82.5},{type:'ST',name:'Sweeper',pct:10.9,vel:81.5},{type:'FF',name:'Four-seam Fastball',pct:9.8,vel:91.2},{type:'FC',name:'Cutter',pct:8.5,vel:87.4}],
  'Brandon Eisert': [{type:'SL',name:'Slider',pct:34.7,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:31.7,vel:89.6},{type:'CH',name:'Changeup',pct:29.6,vel:83.6},{type:'SI',name:'Sinker',pct:3.7,vel:88.1},{type:'ST',name:'Sweeper',pct:0.2,vel:78.9}],
  'Brandon Pfaadt': [{type:'SI',name:'Sinker',pct:23.6,vel:93.1},{type:'FF',name:'Four-seam Fastball',pct:22.1,vel:93.6},{type:'ST',name:'Sweeper',pct:18.1,vel:84.6},{type:'CH',name:'Changeup',pct:15.3,vel:87.2},{type:'CU',name:'Curveball',pct:10.9,vel:81.9},{type:'FC',name:'Cutter',pct:9.8,vel:89.8},{type:'SL',name:'Slider',pct:0.2,vel:85.2},{type:'PO',name:'PO',pct:0.1,vel:91.0}],
  'Brandon Sproat': [{type:'SI',name:'Sinker',pct:35.3,vel:96.3},{type:'ST',name:'Sweeper',pct:15.5,vel:85.3},{type:'CU',name:'Curveball',pct:14.3,vel:81.3},{type:'CH',name:'Changeup',pct:13.1,vel:90.9},{type:'FC',name:'Cutter',pct:10.5,vel:93.9},{type:'FF',name:'Four-seam Fastball',pct:9.6,vel:96.9},{type:'SL',name:'Slider',pct:1.7,vel:89.5}],
  'Brandon Waddell': [{type:'ST',name:'Sweeper',pct:23.6,vel:78.8},{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:90.7},{type:'SI',name:'Sinker',pct:21.7,vel:91.0},{type:'SL',name:'Slider',pct:17.4,vel:86.4},{type:'CH',name:'Changeup',pct:14.6,vel:83.5}],
  'Brandon Walter': [{type:'FC',name:'Cutter',pct:27.4,vel:88.2},{type:'ST',name:'Sweeper',pct:22.5,vel:79.5},{type:'FF',name:'Four-seam Fastball',pct:19.3,vel:91.8},{type:'CH',name:'Changeup',pct:18.3,vel:80.9},{type:'SI',name:'Sinker',pct:12.5,vel:91.5}],
  'Brandon Williamson': [{type:'FC',name:'Cutter',pct:27.5,vel:89.1},{type:'CH',name:'Changeup',pct:23.0,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:19.4,vel:92.9},{type:'ST',name:'Sweeper',pct:11.2,vel:81.8},{type:'SI',name:'Sinker',pct:9.8,vel:93.7},{type:'CU',name:'Curveball',pct:9.1,vel:75.8}],
  'Brandon Woodruff': [{type:'FF',name:'Four-seam Fastball',pct:32.9,vel:92.9},{type:'SI',name:'Sinker',pct:28.0,vel:92.8},{type:'CH',name:'Changeup',pct:18.3,vel:83.3},{type:'FC',name:'Cutter',pct:15.2,vel:89.2},{type:'CU',name:'Curveball',pct:4.2,vel:77.5},{type:'ST',name:'Sweeper',pct:1.4,vel:80.2}],
  'Brandon Young': [{type:'FF',name:'Four-seam Fastball',pct:43.8,vel:93.8},{type:'FS',name:'Splitter',pct:17.9,vel:87.3},{type:'CU',name:'Curveball',pct:15.0,vel:76.1},{type:'SL',name:'Slider',pct:9.5,vel:83.2},{type:'FC',name:'Cutter',pct:8.5,vel:86.8},{type:'CH',name:'Changeup',pct:4.3,vel:87.1},{type:'SI',name:'Sinker',pct:0.8,vel:93.0},{type:'PO',name:'PO',pct:0.1,vel:91.4}],
  'Brandyn Garcia': [{type:'SI',name:'Sinker',pct:54.2,vel:96.5},{type:'ST',name:'Sweeper',pct:29.2,vel:85.3},{type:'SL',name:'Slider',pct:14.0,vel:89.8},{type:'CH',name:'Changeup',pct:1.7,vel:90.4},{type:'FF',name:'Four-seam Fastball',pct:0.9,vel:94.8}],
  'Brant Hurter': [{type:'SI',name:'Sinker',pct:53.5,vel:92.2},{type:'ST',name:'Sweeper',pct:31.3,vel:82.2},{type:'CH',name:'Changeup',pct:10.0,vel:85.9},{type:'FF',name:'Four-seam Fastball',pct:5.2,vel:92.1}],
  'Braxton Ashcraft': [{type:'FF',name:'Four-seam Fastball',pct:29.3,vel:96.9},{type:'SL',name:'Slider',pct:28.8,vel:91.9},{type:'CU',name:'Curveball',pct:22.5,vel:84.4},{type:'SI',name:'Sinker',pct:16.0,vel:96.5},{type:'CH',name:'Changeup',pct:2.5,vel:91.6},{type:'FS',name:'Splitter',pct:0.8,vel:90.6}],
  'Brayan Bello': [{type:'SI',name:'Sinker',pct:35.7,vel:95.1},{type:'ST',name:'Sweeper',pct:17.8,vel:85.6},{type:'FC',name:'Cutter',pct:16.7,vel:88.0},{type:'CH',name:'Changeup',pct:14.9,vel:88.7},{type:'FF',name:'Four-seam Fastball',pct:13.8,vel:95.0},{type:'CU',name:'Curveball',pct:1.0,vel:83.5}],
  'Braydon Fisher': [{type:'SL',name:'Slider',pct:41.3,vel:88.1},{type:'CU',name:'Curveball',pct:34.4,vel:82.8},{type:'FF',name:'Four-seam Fastball',pct:20.4,vel:95.4},{type:'FC',name:'Cutter',pct:3.8,vel:92.9},{type:'PO',name:'PO',pct:0.1,vel:95.0}],
  'Brenan Hanifee': [{type:'SI',name:'Sinker',pct:62.4,vel:95.2},{type:'SL',name:'Slider',pct:21.1,vel:87.7},{type:'FF',name:'Four-seam Fastball',pct:12.1,vel:96.0},{type:'CH',name:'Changeup',pct:4.3,vel:89.7},{type:'FS',name:'Splitter',pct:0.1,vel:85.3}],
  'Brendon Little': [{type:'SI',name:'Sinker',pct:45.0,vel:93.5},{type:'KC',name:'Knuckle Curve',pct:44.6,vel:87.0},{type:'FC',name:'Cutter',pct:9.2,vel:93.6},{type:'FF',name:'Four-seam Fastball',pct:0.6,vel:96.8},{type:'SL',name:'Slider',pct:0.6,vel:90.0}],
  'Brennan Bernardino': [{type:'SI',name:'Sinker',pct:42.4,vel:90.6},{type:'CU',name:'Curveball',pct:25.7,vel:79.0},{type:'FC',name:'Cutter',pct:13.8,vel:86.7},{type:'CH',name:'Changeup',pct:12.3,vel:79.7},{type:'SL',name:'Slider',pct:3.4,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:90.9}],
  'Brent Headrick': [{type:'FF',name:'Four-seam Fastball',pct:57.6,vel:94.0},{type:'SL',name:'Slider',pct:28.7,vel:82.7},{type:'FS',name:'Splitter',pct:8.3,vel:84.0},{type:'SI',name:'Sinker',pct:5.4,vel:92.8}],
  'Brent Suter': [{type:'FF',name:'Four-seam Fastball',pct:39.7,vel:87.2},{type:'SI',name:'Sinker',pct:24.3,vel:89.0},{type:'CH',name:'Changeup',pct:23.1,vel:76.5},{type:'SL',name:'Slider',pct:13.0,vel:78.2}],
  'Brian Van Belle': [{type:'CH',name:'Changeup',pct:43.4,vel:84.3},{type:'SI',name:'Sinker',pct:25.6,vel:90.9},{type:'ST',name:'Sweeper',pct:14.7,vel:80.8},{type:'SL',name:'Slider',pct:8.5,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:7.8,vel:90.9}],
  'Brock Burke': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:96.1},{type:'SL',name:'Slider',pct:27.0,vel:87.7},{type:'CH',name:'Changeup',pct:21.2,vel:88.7},{type:'SI',name:'Sinker',pct:9.6,vel:93.4}],
  'Brock Stewart': [{type:'FF',name:'Four-seam Fastball',pct:54.4,vel:96.2},{type:'ST',name:'Sweeper',pct:14.3,vel:84.7},{type:'SI',name:'Sinker',pct:11.0,vel:96.2},{type:'CH',name:'Changeup',pct:10.8,vel:90.6},{type:'FC',name:'Cutter',pct:9.5,vel:93.2}],
  'Brooks Kriske': [{type:'FS',name:'Splitter',pct:54.0,vel:82.3},{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:93.4},{type:'FC',name:'Cutter',pct:10.6,vel:86.1},{type:'SL',name:'Slider',pct:0.5,vel:83.3}],
  'Brooks Raley': [{type:'ST',name:'Sweeper',pct:41.4,vel:81.1},{type:'SI',name:'Sinker',pct:24.7,vel:90.4},{type:'FC',name:'Cutter',pct:20.0,vel:86.9},{type:'CH',name:'Changeup',pct:13.9,vel:84.0}],
  'Bruce Zimmermann': [{type:'SI',name:'Sinker',pct:30.8,vel:89.8},{type:'FS',name:'Splitter',pct:20.9,vel:82.7},{type:'SL',name:'Slider',pct:17.6,vel:82.8},{type:'CU',name:'Curveball',pct:13.2,vel:78.9},{type:'FF',name:'Four-seam Fastball',pct:11.0,vel:90.3},{type:'FC',name:'Cutter',pct:6.6,vel:86.1}],
  'Bryan Abreu': [{type:'FF',name:'Four-seam Fastball',pct:49.7,vel:97.0},{type:'SL',name:'Slider',pct:48.8,vel:86.6},{type:'SI',name:'Sinker',pct:1.0,vel:96.0},{type:'CH',name:'Changeup',pct:0.6,vel:90.9}],
  'Bryan Baker': [{type:'FF',name:'Four-seam Fastball',pct:47.2,vel:96.7},{type:'CH',name:'Changeup',pct:28.4,vel:85.0},{type:'SL',name:'Slider',pct:24.4,vel:88.5}],
  'Bryan Hoeing': [{type:'SI',name:'Sinker',pct:46.6,vel:92.5},{type:'FS',name:'Splitter',pct:38.9,vel:86.5},{type:'SL',name:'Slider',pct:9.9,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:4.6,vel:92.6}],
  'Bryan Hudson': [{type:'FF',name:'Four-seam Fastball',pct:58.3,vel:90.8},{type:'ST',name:'Sweeper',pct:23.5,vel:80.6},{type:'SI',name:'Sinker',pct:13.2,vel:89.6},{type:'FC',name:'Cutter',pct:4.7,vel:85.0},{type:'CH',name:'Changeup',pct:0.4,vel:84.6}],
  'Bryan King': [{type:'FF',name:'Four-seam Fastball',pct:62.1,vel:92.0},{type:'ST',name:'Sweeper',pct:30.2,vel:80.1},{type:'SI',name:'Sinker',pct:6.1,vel:91.0},{type:'CH',name:'Changeup',pct:1.4,vel:87.1},{type:'CU',name:'Curveball',pct:0.2,vel:75.6}],
  'Bryan Woo': [{type:'FF',name:'Four-seam Fastball',pct:48.0,vel:95.7},{type:'SI',name:'Sinker',pct:24.9,vel:95.4},{type:'SL',name:'Slider',pct:10.5,vel:88.1},{type:'ST',name:'Sweeper',pct:9.9,vel:84.7},{type:'CH',name:'Changeup',pct:6.8,vel:89.5}],
  'Bryce Elder': [{type:'SI',name:'Sinker',pct:39.7,vel:91.5},{type:'SL',name:'Slider',pct:35.4,vel:84.2},{type:'FF',name:'Four-seam Fastball',pct:13.1,vel:92.8},{type:'CH',name:'Changeup',pct:10.6,vel:86.5},{type:'FC',name:'Cutter',pct:1.3,vel:89.0}],
  'Bryce Jarvis': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:94.0},{type:'CH',name:'Changeup',pct:21.7,vel:82.6},{type:'SL',name:'Slider',pct:21.3,vel:85.1},{type:'SI',name:'Sinker',pct:10.2,vel:93.0},{type:'CU',name:'Curveball',pct:4.5,vel:82.7},{type:'FC',name:'Cutter',pct:4.3,vel:88.2}],
  'Bryce Miller': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:95.0},{type:'FS',name:'Splitter',pct:18.8,vel:83.9},{type:'SI',name:'Sinker',pct:16.6,vel:94.7},{type:'KC',name:'Knuckle Curve',pct:10.1,vel:83.5},{type:'SL',name:'Slider',pct:8.0,vel:86.0},{type:'ST',name:'Sweeper',pct:4.5,vel:83.1},{type:'FC',name:'Cutter',pct:1.0,vel:91.4},{type:'PO',name:'PO',pct:0.1,vel:91.7}],
  'Bryse Wilson': [{type:'FC',name:'Cutter',pct:24.0,vel:88.0},{type:'SI',name:'Sinker',pct:23.8,vel:91.9},{type:'CH',name:'Changeup',pct:17.8,vel:85.9},{type:'FF',name:'Four-seam Fastball',pct:17.7,vel:92.6},{type:'CU',name:'Curveball',pct:16.7,vel:80.8}],
  'Bubba Chandler': [{type:'FF',name:'Four-seam Fastball',pct:56.1,vel:98.9},{type:'CH',name:'Changeup',pct:20.9,vel:92.0},{type:'SL',name:'Slider',pct:16.1,vel:89.4},{type:'CU',name:'Curveball',pct:4.6,vel:85.7},{type:'ST',name:'Sweeper',pct:2.2,vel:87.1}],
  'Cade Cavalli': [{type:'FF',name:'Four-seam Fastball',pct:31.2,vel:96.8},{type:'KC',name:'Knuckle Curve',pct:28.2,vel:85.7},{type:'SI',name:'Sinker',pct:17.3,vel:96.6},{type:'CH',name:'Changeup',pct:11.6,vel:89.7},{type:'FC',name:'Cutter',pct:6.1,vel:93.7},{type:'ST',name:'Sweeper',pct:5.5,vel:84.7}],
  'Cade Gibson': [{type:'CU',name:'Curveball',pct:28.5,vel:78.8},{type:'SI',name:'Sinker',pct:23.4,vel:91.6},{type:'CH',name:'Changeup',pct:14.7,vel:84.9},{type:'ST',name:'Sweeper',pct:14.3,vel:79.6},{type:'SL',name:'Slider',pct:9.7,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:9.4,vel:91.9}],
  'Cade Horton': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:95.7},{type:'ST',name:'Sweeper',pct:20.9,vel:83.4},{type:'CH',name:'Changeup',pct:13.7,vel:88.1},{type:'CU',name:'Curveball',pct:9.7,vel:83.9},{type:'SI',name:'Sinker',pct:5.6,vel:95.1},{type:'SL',name:'Slider',pct:0.1,vel:83.2}],
  'Cade Povich': [{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:92.2},{type:'CU',name:'Curveball',pct:22.1,vel:78.6},{type:'CH',name:'Changeup',pct:15.1,vel:83.7},{type:'SI',name:'Sinker',pct:11.7,vel:91.8},{type:'ST',name:'Sweeper',pct:10.5,vel:82.8},{type:'FC',name:'Cutter',pct:1.5,vel:91.5},{type:'SL',name:'Slider',pct:1.5,vel:86.2}],
  'Cade Smith': [{type:'FF',name:'Four-seam Fastball',pct:68.8,vel:96.4},{type:'FS',name:'Splitter',pct:22.1,vel:87.2},{type:'ST',name:'Sweeper',pct:9.1,vel:85.1}],
  'Cade Winquest': [{type:'FF',name:'Four-seam Fastball',pct:32.2,vel:95.7},{type:'SI',name:'Sinker',pct:32.2,vel:95.2},{type:'CU',name:'Curveball',pct:30.5,vel:78.4},{type:'FC',name:'Cutter',pct:5.1,vel:90.9}],
  'Caden Dana': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:94.9},{type:'SL',name:'Slider',pct:27.6,vel:85.6},{type:'CH',name:'Changeup',pct:19.4,vel:87.0},{type:'CU',name:'Curveball',pct:8.0,vel:79.0}],
  'Cal Quantrill': [{type:'SI',name:'Sinker',pct:21.9,vel:93.7},{type:'FC',name:'Cutter',pct:21.6,vel:88.9},{type:'FS',name:'Splitter',pct:21.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:15.3,vel:93.7},{type:'CU',name:'Curveball',pct:11.7,vel:79.9},{type:'SL',name:'Slider',pct:8.2,vel:84.9},{type:'CH',name:'Changeup',pct:0.1,vel:87.7}],
  'Caleb Boushley': [{type:'SI',name:'Sinker',pct:27.9,vel:92.2},{type:'FF',name:'Four-seam Fastball',pct:19.4,vel:91.9},{type:'FC',name:'Cutter',pct:18.9,vel:89.7},{type:'SL',name:'Slider',pct:13.3,vel:83.8},{type:'CH',name:'Changeup',pct:13.2,vel:85.0},{type:'CU',name:'Curveball',pct:7.3,vel:75.9}],
  'Caleb Ferguson': [{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:93.9},{type:'SI',name:'Sinker',pct:23.5,vel:93.9},{type:'FC',name:'Cutter',pct:23.4,vel:88.6},{type:'SV',name:'Slurve',pct:21.6,vel:80.4}],
  'Caleb Freeman': [{type:'FF',name:'Four-seam Fastball',pct:48.6,vel:95.8},{type:'CU',name:'Curveball',pct:30.0,vel:82.3},{type:'SL',name:'Slider',pct:21.4,vel:88.6}],
  'Caleb Kilian': [{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:97.3},{type:'KC',name:'Knuckle Curve',pct:26.6,vel:80.8},{type:'SL',name:'Slider',pct:20.9,vel:89.2},{type:'SI',name:'Sinker',pct:12.0,vel:96.0}],
  'Caleb Thielbar': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:93.0},{type:'CU',name:'Curveball',pct:26.7,vel:76.2},{type:'SL',name:'Slider',pct:15.9,vel:88.6},{type:'ST',name:'Sweeper',pct:14.2,vel:81.0},{type:'FS',name:'Splitter',pct:0.2,vel:83.2}],
  'Calvin Faucher': [{type:'FC',name:'Cutter',pct:37.1,vel:92.1},{type:'ST',name:'Sweeper',pct:18.4,vel:87.6},{type:'FF',name:'Four-seam Fastball',pct:16.4,vel:96.0},{type:'CU',name:'Curveball',pct:14.9,vel:86.1},{type:'SI',name:'Sinker',pct:12.4,vel:95.9},{type:'SL',name:'Slider',pct:0.8,vel:88.4},{type:'CH',name:'Changeup',pct:0.1,vel:90.9}],
  'Cam Booser': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:95.5},{type:'ST',name:'Sweeper',pct:30.1,vel:81.1},{type:'FC',name:'Cutter',pct:22.3,vel:87.3},{type:'CH',name:'Changeup',pct:3.8,vel:87.4}],
  'Cam Sanders': [{type:'FF',name:'Four-seam Fastball',pct:51.5,vel:95.8},{type:'SL',name:'Slider',pct:24.6,vel:86.7},{type:'CH',name:'Changeup',pct:15.0,vel:91.0},{type:'ST',name:'Sweeper',pct:9.0,vel:83.0}],
  'Cam Schlittler': [{type:'FF',name:'Four-seam Fastball',pct:50.8,vel:98.0},{type:'FC',name:'Cutter',pct:21.6,vel:92.7},{type:'CU',name:'Curveball',pct:13.3,vel:83.4},{type:'SI',name:'Sinker',pct:11.6,vel:97.5},{type:'ST',name:'Sweeper',pct:1.6,vel:87.9},{type:'SL',name:'Slider',pct:1.2,vel:89.4}],
  'Camilo Doval': [{type:'SL',name:'Slider',pct:45.8,vel:89.0},{type:'FC',name:'Cutter',pct:40.3,vel:98.1},{type:'SI',name:'Sinker',pct:13.8,vel:96.3},{type:'UN',name:'UN',pct:0.1,vel:90.9}],
  'Carl Edwards Jr.': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:93.1},{type:'CU',name:'Curveball',pct:34.4,vel:78.9},{type:'CH',name:'Changeup',pct:14.4,vel:88.6}],
  'Carlos Carrasco': [{type:'SL',name:'Slider',pct:24.9,vel:84.4},{type:'SI',name:'Sinker',pct:22.7,vel:90.3},{type:'CH',name:'Changeup',pct:21.3,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:20.8,vel:91.5},{type:'CU',name:'Curveball',pct:10.0,vel:77.8},{type:'ST',name:'Sweeper',pct:0.3,vel:77.7}],
  'Carlos Estévez': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:95.4},{type:'SL',name:'Slider',pct:30.2,vel:87.0},{type:'CH',name:'Changeup',pct:16.3,vel:87.1}],
  'Carlos Hernández': [{type:'FF',name:'Four-seam Fastball',pct:51.9,vel:97.7},{type:'FS',name:'Splitter',pct:19.9,vel:88.8},{type:'SL',name:'Slider',pct:19.4,vel:86.6},{type:'KC',name:'Knuckle Curve',pct:6.9,vel:82.7},{type:'SI',name:'Sinker',pct:1.8,vel:96.9},{type:'ST',name:'Sweeper',pct:0.1,vel:83.3}],
  'Carlos Lagrange': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:99.3},{type:'SL',name:'Slider',pct:31.0,vel:90.7},{type:'ST',name:'Sweeper',pct:16.7,vel:82.2},{type:'CH',name:'Changeup',pct:14.3,vel:92.0}],
  'Carlos Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:93.7},{type:'CH',name:'Changeup',pct:19.7,vel:86.2},{type:'FC',name:'Cutter',pct:19.4,vel:89.0},{type:'SL',name:'Slider',pct:19.0,vel:80.0},{type:'CU',name:'Curveball',pct:6.8,vel:75.9},{type:'SI',name:'Sinker',pct:4.3,vel:94.3}],
  'Carlos Rodón': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:94.1},{type:'SL',name:'Slider',pct:28.2,vel:85.9},{type:'CH',name:'Changeup',pct:16.3,vel:85.0},{type:'SI',name:'Sinker',pct:9.6,vel:92.0},{type:'CU',name:'Curveball',pct:3.6,vel:80.3},{type:'FC',name:'Cutter',pct:0.1,vel:92.4}],
  'Carlos Vargas': [{type:'SI',name:'Sinker',pct:61.4,vel:97.7},{type:'SL',name:'Slider',pct:18.5,vel:90.4},{type:'FC',name:'Cutter',pct:14.3,vel:95.4},{type:'FF',name:'Four-seam Fastball',pct:3.1,vel:97.6},{type:'CH',name:'Changeup',pct:2.7,vel:93.8}],
  'Carmen Mlodzinski': [{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:95.9},{type:'FS',name:'Splitter',pct:17.5,vel:86.9},{type:'SI',name:'Sinker',pct:15.5,vel:95.6},{type:'SL',name:'Slider',pct:12.2,vel:88.8},{type:'CU',name:'Curveball',pct:9.9,vel:84.6},{type:'ST',name:'Sweeper',pct:9.9,vel:83.9},{type:'FC',name:'Cutter',pct:0.1,vel:93.3}],
  'Carson Fulmer': [{type:'CH',name:'Changeup',pct:28.1,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:24.6,vel:92.6},{type:'SI',name:'Sinker',pct:23.3,vel:92.1},{type:'SL',name:'Slider',pct:17.0,vel:86.5},{type:'CU',name:'Curveball',pct:6.9,vel:80.9},{type:'PO',name:'PO',pct:0.2,vel:90.5}],
  'Carson Palmquist': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:90.4},{type:'ST',name:'Sweeper',pct:31.5,vel:73.8},{type:'FC',name:'Cutter',pct:12.5,vel:81.9},{type:'CH',name:'Changeup',pct:3.5,vel:81.3}],
  'Carson Ragsdale': [{type:'CU',name:'Curveball',pct:31.6,vel:81.3},{type:'FF',name:'Four-seam Fastball',pct:28.4,vel:93.9},{type:'SI',name:'Sinker',pct:23.2,vel:92.4},{type:'FS',name:'Splitter',pct:9.5,vel:88.0},{type:'SL',name:'Slider',pct:7.4,vel:89.2}],
  'Carson Seymour': [{type:'SI',name:'Sinker',pct:41.5,vel:96.1},{type:'FF',name:'Four-seam Fastball',pct:22.3,vel:96.9},{type:'SL',name:'Slider',pct:19.7,vel:86.9},{type:'FC',name:'Cutter',pct:11.0,vel:93.4},{type:'CU',name:'Curveball',pct:5.4,vel:85.1},{type:'CH',name:'Changeup',pct:0.2,vel:91.7}],
  'Carson Spiers': [{type:'ST',name:'Sweeper',pct:22.9,vel:81.4},{type:'CH',name:'Changeup',pct:22.4,vel:87.0},{type:'SI',name:'Sinker',pct:21.6,vel:92.0},{type:'FC',name:'Cutter',pct:18.8,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:92.2}],
  'Carson Whisenhunt': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:92.6},{type:'CH',name:'Changeup',pct:37.3,vel:81.1},{type:'SL',name:'Slider',pct:14.0,vel:83.3},{type:'CU',name:'Curveball',pct:1.0,vel:78.3}],
  'Carter Baumler': [{type:'CU',name:'Curveball',pct:48.0,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:95.2},{type:'SL',name:'Slider',pct:10.8,vel:88.3},{type:'SI',name:'Sinker',pct:7.4,vel:94.5}],
  'Casey Lawrence': [{type:'SI',name:'Sinker',pct:35.7,vel:87.6},{type:'ST',name:'Sweeper',pct:26.3,vel:78.0},{type:'CH',name:'Changeup',pct:22.1,vel:80.8},{type:'FF',name:'Four-seam Fastball',pct:7.7,vel:88.2},{type:'FC',name:'Cutter',pct:3.8,vel:83.1},{type:'SL',name:'Slider',pct:3.8,vel:78.4},{type:'CU',name:'Curveball',pct:0.6,vel:75.4}],
  'Casey Legumina': [{type:'FF',name:'Four-seam Fastball',pct:48.6,vel:94.2},{type:'SI',name:'Sinker',pct:22.5,vel:93.8},{type:'ST',name:'Sweeper',pct:18.6,vel:80.7},{type:'CH',name:'Changeup',pct:10.4,vel:87.7}],
  'Casey Mize': [{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:94.4},{type:'FS',name:'Splitter',pct:25.0,vel:88.4},{type:'SL',name:'Slider',pct:16.9,vel:88.1},{type:'SI',name:'Sinker',pct:12.2,vel:94.7},{type:'SV',name:'Slurve',pct:12.1,vel:83.5}],
  'Chad Green': [{type:'FF',name:'Four-seam Fastball',pct:50.1,vel:95.2},{type:'SL',name:'Slider',pct:47.5,vel:88.1},{type:'SI',name:'Sinker',pct:2.3,vel:94.4},{type:'PO',name:'PO',pct:0.1,vel:93.7}],
  'Chad Patrick': [{type:'FC',name:'Cutter',pct:40.7,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:22.4,vel:94.2},{type:'SI',name:'Sinker',pct:22.4,vel:94.2},{type:'CH',name:'Changeup',pct:5.8,vel:88.7},{type:'SV',name:'Slurve',pct:4.5,vel:85.3},{type:'SL',name:'Slider',pct:4.1,vel:84.2}],
  'Charlie Barnes': [{type:'FF',name:'Four-seam Fastball',pct:40.3,vel:89.8},{type:'SI',name:'Sinker',pct:25.8,vel:89.7},{type:'SL',name:'Slider',pct:19.4,vel:83.6},{type:'CH',name:'Changeup',pct:11.3,vel:83.0},{type:'ST',name:'Sweeper',pct:3.2,vel:82.2}],
  'Charlie Morton': [{type:'CU',name:'Curveball',pct:38.3,vel:81.4},{type:'FF',name:'Four-seam Fastball',pct:27.6,vel:94.2},{type:'SI',name:'Sinker',pct:15.1,vel:94.0},{type:'CH',name:'Changeup',pct:9.9,vel:87.5},{type:'FC',name:'Cutter',pct:9.1,vel:88.0}],
  'Chas McCormick': [{type:'FA',name:'FA',pct:92.6,vel:69.0},{type:'EP',name:'EP',pct:7.4,vel:62.0}],
  'Chase Burns': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:98.6},{type:'SL',name:'Slider',pct:34.5,vel:90.9},{type:'CH',name:'Changeup',pct:5.8,vel:91.0},{type:'CU',name:'Curveball',pct:1.5,vel:84.7},{type:'SI',name:'Sinker',pct:0.7,vel:100.1},{type:'PO',name:'PO',pct:0.1,vel:91.5}],
  'Chase Dollander': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:98.1},{type:'CU',name:'Curveball',pct:19.4,vel:79.3},{type:'SI',name:'Sinker',pct:12.8,vel:97.6},{type:'SL',name:'Slider',pct:12.6,vel:89.3},{type:'CH',name:'Changeup',pct:8.8,vel:89.8},{type:'ST',name:'Sweeper',pct:0.6,vel:86.2}],
  'Chase Lee': [{type:'SI',name:'Sinker',pct:38.0,vel:88.9},{type:'ST',name:'Sweeper',pct:35.5,vel:80.0},{type:'FF',name:'Four-seam Fastball',pct:20.7,vel:89.5},{type:'CH',name:'Changeup',pct:5.8,vel:85.8}],
  'Chase Petty': [{type:'SL',name:'Slider',pct:31.4,vel:91.4},{type:'SI',name:'Sinker',pct:23.1,vel:95.3},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:96.5},{type:'CH',name:'Changeup',pct:11.8,vel:88.3},{type:'ST',name:'Sweeper',pct:11.8,vel:86.3}],
  'Chase Shugart': [{type:'ST',name:'Sweeper',pct:29.0,vel:80.9},{type:'FC',name:'Cutter',pct:24.6,vel:89.8},{type:'SI',name:'Sinker',pct:20.1,vel:94.1},{type:'FF',name:'Four-seam Fastball',pct:19.1,vel:95.1},{type:'CH',name:'Changeup',pct:7.3,vel:88.1}],
  'Chase Silseth': [{type:'FF',name:'Four-seam Fastball',pct:36.4,vel:95.7},{type:'FS',name:'Splitter',pct:26.0,vel:87.5},{type:'ST',name:'Sweeper',pct:25.8,vel:86.0},{type:'SI',name:'Sinker',pct:11.6,vel:95.1},{type:'CH',name:'Changeup',pct:0.2,vel:70.6}],
  'Chayce McDermott': [{type:'FF',name:'Four-seam Fastball',pct:53.8,vel:93.5},{type:'SL',name:'Slider',pct:26.7,vel:83.6},{type:'FC',name:'Cutter',pct:10.8,vel:87.2},{type:'FS',name:'Splitter',pct:5.1,vel:83.9},{type:'ST',name:'Sweeper',pct:2.6,vel:80.8},{type:'CU',name:'Curveball',pct:1.0,vel:75.8}],
  'Chris Bassitt': [{type:'SI',name:'Sinker',pct:41.4,vel:91.6},{type:'CU',name:'Curveball',pct:16.6,vel:71.2},{type:'FC',name:'Cutter',pct:16.5,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:9.7,vel:91.5},{type:'ST',name:'Sweeper',pct:6.3,vel:72.7},{type:'CH',name:'Changeup',pct:4.0,vel:84.5},{type:'FS',name:'Splitter',pct:3.1,vel:83.4},{type:'SL',name:'Slider',pct:2.5,vel:83.6}],
  'Chris Devenski': [{type:'CH',name:'Changeup',pct:38.9,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:21.4,vel:92.4},{type:'ST',name:'Sweeper',pct:21.0,vel:78.6},{type:'FC',name:'Cutter',pct:17.2,vel:86.3},{type:'SI',name:'Sinker',pct:1.1,vel:92.1},{type:'SL',name:'Slider',pct:0.4,vel:81.9}],
  'Chris Flexen': [{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:92.4},{type:'FC',name:'Cutter',pct:28.2,vel:89.1},{type:'CU',name:'Curveball',pct:17.1,vel:72.8},{type:'SL',name:'Slider',pct:8.9,vel:81.0},{type:'SV',name:'Slurve',pct:2.5,vel:77.6},{type:'CH',name:'Changeup',pct:2.1,vel:81.1}],
  'Chris Martin': [{type:'FC',name:'Cutter',pct:36.7,vel:91.4},{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:94.7},{type:'FS',name:'Splitter',pct:17.5,vel:88.3},{type:'SI',name:'Sinker',pct:13.7,vel:94.2},{type:'ST',name:'Sweeper',pct:2.7,vel:84.2}],
  'Chris Murphy': [{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:94.5},{type:'CU',name:'Curveball',pct:28.3,vel:76.9},{type:'SL',name:'Slider',pct:22.4,vel:88.2},{type:'SI',name:'Sinker',pct:7.3,vel:92.9},{type:'ST',name:'Sweeper',pct:6.5,vel:79.1},{type:'CH',name:'Changeup',pct:5.3,vel:84.1},{type:'FS',name:'Splitter',pct:0.8,vel:81.6}],
  'Chris Paddack': [{type:'FF',name:'Four-seam Fastball',pct:41.3,vel:93.6},{type:'CH',name:'Changeup',pct:23.5,vel:84.6},{type:'FC',name:'Cutter',pct:14.1,vel:87.2},{type:'CU',name:'Curveball',pct:11.8,vel:78.0},{type:'SI',name:'Sinker',pct:5.8,vel:93.3},{type:'SL',name:'Slider',pct:2.0,vel:84.7},{type:'ST',name:'Sweeper',pct:1.6,vel:79.7}],
  'Chris Roycroft': [{type:'SI',name:'Sinker',pct:45.3,vel:95.2},{type:'FF',name:'Four-seam Fastball',pct:29.1,vel:95.2},{type:'FC',name:'Cutter',pct:25.6,vel:88.6}],
  'Chris Sale': [{type:'SL',name:'Slider',pct:45.7,vel:78.9},{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:94.8},{type:'CH',name:'Changeup',pct:8.4,vel:86.7},{type:'SI',name:'Sinker',pct:4.2,vel:93.9}],
  'Chris Stratton': [{type:'FF',name:'Four-seam Fastball',pct:40.4,vel:91.2},{type:'CU',name:'Curveball',pct:20.9,vel:80.4},{type:'CH',name:'Changeup',pct:18.2,vel:84.7},{type:'SL',name:'Slider',pct:16.5,vel:85.8},{type:'SI',name:'Sinker',pct:2.7,vel:91.4},{type:'ST',name:'Sweeper',pct:1.2,vel:83.9}],
  'Christian Koss': [{type:'EP',name:'EP',pct:90.2,vel:50.5},{type:'FA',name:'FA',pct:5.9,vel:83.6},{type:'KN',name:'Knuckleball',pct:3.9,vel:58.8}],
  'Christian Roa': [{type:'SI',name:'Sinker',pct:32.8,vel:95.8},{type:'SL',name:'Slider',pct:30.6,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:28.9,vel:96.1},{type:'CH',name:'Changeup',pct:7.8,vel:88.2}],
  'Christian Scott': [{type:'FF',name:'Four-seam Fastball',pct:33.9,vel:95.3},{type:'FS',name:'Splitter',pct:33.9,vel:84.7},{type:'SL',name:'Slider',pct:21.4,vel:89.8},{type:'ST',name:'Sweeper',pct:10.7,vel:81.9}],
  'Chuck King': [{type:'FF',name:'Four-seam Fastball',pct:48.4,vel:94.9},{type:'SL',name:'Slider',pct:37.1,vel:89.0},{type:'CH',name:'Changeup',pct:14.5,vel:83.1}],
  'Cionel Pérez': [{type:'SI',name:'Sinker',pct:36.5,vel:95.6},{type:'SV',name:'Slurve',pct:21.7,vel:83.6},{type:'SL',name:'Slider',pct:16.3,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:14.5,vel:95.8},{type:'CU',name:'Curveball',pct:9.9,vel:85.5},{type:'FC',name:'Cutter',pct:1.1,vel:90.9}],
  'Clarke Schmidt': [{type:'FC',name:'Cutter',pct:40.9,vel:92.2},{type:'KC',name:'Knuckle Curve',pct:18.2,vel:85.0},{type:'SL',name:'Slider',pct:12.9,vel:85.3},{type:'ST',name:'Sweeper',pct:12.2,vel:83.1},{type:'SI',name:'Sinker',pct:8.3,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:7.6,vel:94.3}],
  'Clay Holmes': [{type:'SI',name:'Sinker',pct:41.1,vel:93.7},{type:'ST',name:'Sweeper',pct:19.0,vel:81.9},{type:'CH',name:'Changeup',pct:15.7,vel:88.2},{type:'SL',name:'Slider',pct:9.5,vel:85.3},{type:'FC',name:'Cutter',pct:9.0,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:4.9,vel:93.2},{type:'CU',name:'Curveball',pct:0.8,vel:81.4}],
  'Clayton Beeter': [{type:'FF',name:'Four-seam Fastball',pct:53.3,vel:96.5},{type:'SL',name:'Slider',pct:46.7,vel:87.2}],
  'Clayton Kershaw': [{type:'SL',name:'Slider',pct:41.7,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:34.6,vel:89.0},{type:'CU',name:'Curveball',pct:17.7,vel:72.3},{type:'FS',name:'Splitter',pct:5.4,vel:83.1},{type:'SI',name:'Sinker',pct:0.5,vel:89.4},{type:'CS',name:'CS',pct:0.1,vel:58.6},{type:'EP',name:'EP',pct:0.1,vel:46.3},{type:'UN',name:'UN',pct:0.1,vel:58.3}],
  'Codi Heuer': [{type:'SL',name:'Slider',pct:46.6,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:95.3},{type:'CH',name:'Changeup',pct:9.0,vel:87.0}],
  'Cody Bolton': [{type:'SI',name:'Sinker',pct:25.1,vel:94.4},{type:'FC',name:'Cutter',pct:24.1,vel:90.3},{type:'FF',name:'Four-seam Fastball',pct:22.6,vel:94.7},{type:'ST',name:'Sweeper',pct:13.3,vel:82.2},{type:'CH',name:'Changeup',pct:9.7,vel:90.0},{type:'CU',name:'Curveball',pct:5.1,vel:80.2}],
  'Cody Laweryson': [{type:'FF',name:'Four-seam Fastball',pct:63.6,vel:92.8},{type:'FC',name:'Cutter',pct:18.7,vel:85.3},{type:'CH',name:'Changeup',pct:17.8,vel:83.3}],
  'Cody Ponce': [{type:'FF',name:'Four-seam Fastball',pct:39.3,vel:95.0},{type:'CH',name:'Changeup',pct:23.2,vel:87.8},{type:'SL',name:'Slider',pct:22.3,vel:88.5},{type:'CU',name:'Curveball',pct:11.6,vel:83.4},{type:'FC',name:'Cutter',pct:3.6,vel:92.0}],
  'Cody Poteet': [{type:'SL',name:'Slider',pct:35.3,vel:84.3},{type:'SI',name:'Sinker',pct:29.4,vel:92.2},{type:'CH',name:'Changeup',pct:19.1,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:7.4,vel:92.2},{type:'ST',name:'Sweeper',pct:5.9,vel:82.0},{type:'CU',name:'Curveball',pct:2.9,vel:79.2}],
  'Cole Henry': [{type:'FF',name:'Four-seam Fastball',pct:51.0,vel:94.3},{type:'ST',name:'Sweeper',pct:33.3,vel:80.9},{type:'SI',name:'Sinker',pct:8.6,vel:94.5},{type:'FC',name:'Cutter',pct:4.8,vel:88.7},{type:'CH',name:'Changeup',pct:2.4,vel:87.3}],
  'Cole Ragans': [{type:'FF',name:'Four-seam Fastball',pct:50.5,vel:95.1},{type:'CH',name:'Changeup',pct:18.9,vel:84.3},{type:'SL',name:'Slider',pct:14.4,vel:84.9},{type:'KC',name:'Knuckle Curve',pct:11.6,vel:79.6},{type:'FC',name:'Cutter',pct:4.7,vel:89.8}],
  'Cole Sands': [{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:94.8},{type:'FC',name:'Cutter',pct:23.2,vel:89.4},{type:'FS',name:'Splitter',pct:21.0,vel:88.2},{type:'CU',name:'Curveball',pct:18.5,vel:81.6},{type:'SI',name:'Sinker',pct:9.0,vel:93.8},{type:'SL',name:'Slider',pct:0.3,vel:86.2}],
  'Cole Sulser': [{type:'CH',name:'Changeup',pct:39.7,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:39.7,vel:92.4},{type:'FC',name:'Cutter',pct:19.7,vel:87.3},{type:'ST',name:'Sweeper',pct:0.6,vel:78.6},{type:'PO',name:'PO',pct:0.2,vel:89.3}],
  'Cole Wilcox': [{type:'SL',name:'Slider',pct:38.1,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:27.4,vel:96.4},{type:'SI',name:'Sinker',pct:23.8,vel:97.0},{type:'ST',name:'Sweeper',pct:9.5,vel:87.0},{type:'CH',name:'Changeup',pct:1.2,vel:89.6}],
  'Cole Winn': [{type:'FF',name:'Four-seam Fastball',pct:28.3,vel:95.7},{type:'FC',name:'Cutter',pct:20.6,vel:90.7},{type:'SL',name:'Slider',pct:18.9,vel:85.7},{type:'SI',name:'Sinker',pct:17.8,vel:95.2},{type:'FS',name:'Splitter',pct:13.7,vel:87.3},{type:'CU',name:'Curveball',pct:0.7,vel:83.7}],
  'Colin Holderman': [{type:'SI',name:'Sinker',pct:37.2,vel:97.3},{type:'ST',name:'Sweeper',pct:28.1,vel:83.3},{type:'FC',name:'Cutter',pct:21.1,vel:90.6},{type:'FF',name:'Four-seam Fastball',pct:7.5,vel:97.1},{type:'FS',name:'Splitter',pct:3.3,vel:90.1},{type:'CU',name:'Curveball',pct:2.2,vel:82.0},{type:'SL',name:'Slider',pct:0.7,vel:85.6}],
  'Colin Poche': [{type:'FF',name:'Four-seam Fastball',pct:71.7,vel:92.2},{type:'SL',name:'Slider',pct:28.3,vel:82.6}],
  'Colin Rea': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:93.9},{type:'FS',name:'Splitter',pct:12.4,vel:87.4},{type:'SI',name:'Sinker',pct:10.8,vel:93.0},{type:'SL',name:'Slider',pct:10.1,vel:85.4},{type:'CU',name:'Curveball',pct:9.1,vel:80.4},{type:'ST',name:'Sweeper',pct:9.1,vel:82.8},{type:'FC',name:'Cutter',pct:7.6,vel:88.1},{type:'PO',name:'PO',pct:0.0,vel:93.9}],
  'Colin Selby': [{type:'SI',name:'Sinker',pct:42.1,vel:95.5},{type:'KC',name:'Knuckle Curve',pct:26.2,vel:83.2},{type:'SL',name:'Slider',pct:16.8,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:15.0,vel:95.8}],
  'Collin Snider': [{type:'ST',name:'Sweeper',pct:30.6,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:26.0,vel:92.6},{type:'FC',name:'Cutter',pct:20.8,vel:86.9},{type:'SV',name:'Slurve',pct:11.9,vel:84.8},{type:'SI',name:'Sinker',pct:10.7,vel:92.8}],
  'Colton Gordon': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:91.1},{type:'ST',name:'Sweeper',pct:27.6,vel:80.7},{type:'SI',name:'Sinker',pct:11.3,vel:91.5},{type:'CU',name:'Curveball',pct:10.0,vel:75.6},{type:'CH',name:'Changeup',pct:8.0,vel:83.8},{type:'FC',name:'Cutter',pct:2.2,vel:84.6}],
  'Connelly Early': [{type:'FF',name:'Four-seam Fastball',pct:30.4,vel:94.0},{type:'CH',name:'Changeup',pct:19.3,vel:83.8},{type:'CU',name:'Curveball',pct:16.5,vel:80.4},{type:'SI',name:'Sinker',pct:14.8,vel:92.7},{type:'SL',name:'Slider',pct:11.8,vel:86.9},{type:'ST',name:'Sweeper',pct:7.2,vel:82.6}],
  'Connor Brogdon': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:95.2},{type:'CH',name:'Changeup',pct:42.0,vel:83.9},{type:'FC',name:'Cutter',pct:15.1,vel:86.9}],
  'Connor Gillispie': [{type:'ST',name:'Sweeper',pct:29.5,vel:81.1},{type:'FF',name:'Four-seam Fastball',pct:29.1,vel:91.3},{type:'FC',name:'Cutter',pct:24.8,vel:86.7},{type:'CH',name:'Changeup',pct:15.5,vel:87.1},{type:'CU',name:'Curveball',pct:1.1,vel:78.3}],
  'Connor Phillips': [{type:'ST',name:'Sweeper',pct:48.5,vel:86.0},{type:'FF',name:'Four-seam Fastball',pct:47.7,vel:98.2},{type:'CU',name:'Curveball',pct:3.8,vel:86.1}],
  'Connor Seabold': [{type:'FF',name:'Four-seam Fastball',pct:49.0,vel:93.0},{type:'CH',name:'Changeup',pct:26.9,vel:82.1},{type:'FC',name:'Cutter',pct:15.2,vel:86.8},{type:'SL',name:'Slider',pct:8.0,vel:83.2},{type:'ST',name:'Sweeper',pct:0.9,vel:79.8}],
  'Connor Thomas': [{type:'SI',name:'Sinker',pct:37.8,vel:89.6},{type:'FC',name:'Cutter',pct:22.7,vel:86.8},{type:'CH',name:'Changeup',pct:18.5,vel:84.5},{type:'ST',name:'Sweeper',pct:16.8,vel:83.3},{type:'FF',name:'Four-seam Fastball',pct:4.2,vel:90.3}],
  'Cooper Criswell': [{type:'CH',name:'Changeup',pct:31.3,vel:84.7},{type:'FC',name:'Cutter',pct:28.6,vel:87.0},{type:'SI',name:'Sinker',pct:27.0,vel:89.9},{type:'ST',name:'Sweeper',pct:12.8,vel:77.2},{type:'FF',name:'Four-seam Fastball',pct:0.4,vel:90.9}],
  'Corbin Burnes': [{type:'FC',name:'Cutter',pct:55.0,vel:94.1},{type:'CU',name:'Curveball',pct:19.2,vel:80.0},{type:'SI',name:'Sinker',pct:9.6,vel:95.6},{type:'SL',name:'Slider',pct:8.9,vel:87.8},{type:'CH',name:'Changeup',pct:7.2,vel:88.3}],
  'Corbin Martin': [{type:'FF',name:'Four-seam Fastball',pct:46.0,vel:95.7},{type:'SL',name:'Slider',pct:27.8,vel:91.8},{type:'CU',name:'Curveball',pct:18.8,vel:86.6},{type:'CH',name:'Changeup',pct:3.6,vel:90.2},{type:'ST',name:'Sweeper',pct:2.8,vel:86.7},{type:'SI',name:'Sinker',pct:1.0,vel:94.8}],
  'Craig Kimbrel': [{type:'FF',name:'Four-seam Fastball',pct:63.6,vel:93.3},{type:'KC',name:'Knuckle Curve',pct:19.6,vel:83.5},{type:'ST',name:'Sweeper',pct:11.0,vel:84.5},{type:'CH',name:'Changeup',pct:4.1,vel:88.0},{type:'FC',name:'Cutter',pct:1.7,vel:90.2}],
  'Craig Yoho': [{type:'CH',name:'Changeup',pct:46.0,vel:77.1},{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:92.7},{type:'ST',name:'Sweeper',pct:9.1,vel:75.9},{type:'FC',name:'Cutter',pct:6.8,vel:89.0}],
  'Cristian Javier': [{type:'FF',name:'Four-seam Fastball',pct:42.3,vel:92.6},{type:'ST',name:'Sweeper',pct:21.9,vel:78.8},{type:'CH',name:'Changeup',pct:18.0,vel:84.0},{type:'KC',name:'Knuckle Curve',pct:9.2,vel:76.4},{type:'SI',name:'Sinker',pct:8.7,vel:92.6}],
  'Cristian Mena': [{type:'CU',name:'Curveball',pct:33.0,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:29.0,vel:95.3},{type:'CH',name:'Changeup',pct:15.0,vel:91.5},{type:'SI',name:'Sinker',pct:12.0,vel:94.4},{type:'ST',name:'Sweeper',pct:11.0,vel:87.1}],
  'Cristopher Sánchez': [{type:'SI',name:'Sinker',pct:46.3,vel:95.3},{type:'CH',name:'Changeup',pct:37.0,vel:86.3},{type:'SL',name:'Slider',pct:16.8,vel:85.7}],
  'DL Hall': [{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:94.2},{type:'CH',name:'Changeup',pct:19.6,vel:84.6},{type:'FC',name:'Cutter',pct:14.6,vel:92.2},{type:'SI',name:'Sinker',pct:14.6,vel:94.2},{type:'SL',name:'Slider',pct:14.1,vel:85.8},{type:'CU',name:'Curveball',pct:11.8,vel:79.9},{type:'ST',name:'Sweeper',pct:2.4,vel:82.8}],
  'Dan Altavilla': [{type:'FF',name:'Four-seam Fastball',pct:27.2,vel:96.0},{type:'SL',name:'Slider',pct:25.0,vel:90.5},{type:'SI',name:'Sinker',pct:24.6,vel:96.5},{type:'CH',name:'Changeup',pct:23.2,vel:91.7}],
  'Dane Dunning': [{type:'FC',name:'Cutter',pct:38.4,vel:88.5},{type:'SI',name:'Sinker',pct:30.0,vel:90.1},{type:'CH',name:'Changeup',pct:16.8,vel:85.4},{type:'SL',name:'Slider',pct:11.0,vel:80.2},{type:'KC',name:'Knuckle Curve',pct:3.4,vel:75.7},{type:'FF',name:'Four-seam Fastball',pct:0.5,vel:89.6}],
  'Daniel Lynch IV': [{type:'SL',name:'Slider',pct:28.8,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:22.6,vel:94.1},{type:'SI',name:'Sinker',pct:20.3,vel:93.7},{type:'CH',name:'Changeup',pct:18.8,vel:85.9},{type:'KC',name:'Knuckle Curve',pct:9.5,vel:82.4}],
  'Daniel Palencia': [{type:'FF',name:'Four-seam Fastball',pct:70.7,vel:99.5},{type:'SL',name:'Slider',pct:23.3,vel:88.5},{type:'FS',name:'Splitter',pct:5.5,vel:88.5},{type:'CU',name:'Curveball',pct:0.3,vel:82.2},{type:'SI',name:'Sinker',pct:0.3,vel:97.9}],
  'Daniel Robert': [{type:'ST',name:'Sweeper',pct:41.6,vel:84.1},{type:'FC',name:'Cutter',pct:25.9,vel:91.0},{type:'FF',name:'Four-seam Fastball',pct:23.5,vel:96.2},{type:'SI',name:'Sinker',pct:9.0,vel:95.3}],
  'Danny Coulombe': [{type:'FC',name:'Cutter',pct:38.0,vel:85.2},{type:'SI',name:'Sinker',pct:20.5,vel:90.2},{type:'ST',name:'Sweeper',pct:19.5,vel:80.9},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:90.3},{type:'KC',name:'Knuckle Curve',pct:3.9,vel:78.4},{type:'CH',name:'Changeup',pct:0.1,vel:79.7}],
  'Danny Young': [{type:'SI',name:'Sinker',pct:55.1,vel:92.9},{type:'ST',name:'Sweeper',pct:41.8,vel:82.2},{type:'FC',name:'Cutter',pct:3.2,vel:90.1}],
  'Darren McCaughan': [{type:'ST',name:'Sweeper',pct:41.9,vel:82.2},{type:'FF',name:'Four-seam Fastball',pct:23.3,vel:88.9},{type:'SI',name:'Sinker',pct:23.3,vel:90.1},{type:'CH',name:'Changeup',pct:11.6,vel:80.8}],
  'Dauri Moreta': [{type:'SL',name:'Slider',pct:56.8,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:94.6},{type:'CH',name:'Changeup',pct:0.7,vel:86.6}],
  'David Bednar': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:96.9},{type:'CU',name:'Curveball',pct:36.6,vel:77.5},{type:'FS',name:'Splitter',pct:21.3,vel:92.0}],
  'David Festa': [{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:94.1},{type:'CH',name:'Changeup',pct:29.0,vel:87.8},{type:'SL',name:'Slider',pct:26.8,vel:87.6},{type:'SI',name:'Sinker',pct:12.7,vel:93.9}],
  'David Morgan': [{type:'FF',name:'Four-seam Fastball',pct:34.7,vel:97.8},{type:'CU',name:'Curveball',pct:24.3,vel:83.0},{type:'SI',name:'Sinker',pct:23.9,vel:96.8},{type:'SL',name:'Slider',pct:16.9,vel:87.8},{type:'CH',name:'Changeup',pct:0.1,vel:91.9}],
  'David Peterson': [{type:'SI',name:'Sinker',pct:30.3,vel:91.2},{type:'FF',name:'Four-seam Fastball',pct:21.8,vel:92.2},{type:'SL',name:'Slider',pct:19.1,vel:84.7},{type:'CH',name:'Changeup',pct:15.3,vel:84.6},{type:'CU',name:'Curveball',pct:13.4,vel:78.8}],
  'David Robertson': [{type:'FC',name:'Cutter',pct:50.8,vel:91.8},{type:'KC',name:'Knuckle Curve',pct:33.9,vel:84.5},{type:'SL',name:'Slider',pct:9.4,vel:83.7},{type:'SI',name:'Sinker',pct:5.0,vel:91.2},{type:'CH',name:'Changeup',pct:0.9,vel:86.8}],
  'Davis Daniel': [{type:'FF',name:'Four-seam Fastball',pct:50.8,vel:89.8},{type:'FS',name:'Splitter',pct:22.4,vel:84.5},{type:'SL',name:'Slider',pct:16.4,vel:80.0},{type:'ST',name:'Sweeper',pct:10.4,vel:81.0}],
  'Davis Martin': [{type:'FF',name:'Four-seam Fastball',pct:31.8,vel:93.9},{type:'CH',name:'Changeup',pct:23.4,vel:90.1},{type:'SL',name:'Slider',pct:20.2,vel:88.0},{type:'SI',name:'Sinker',pct:11.1,vel:93.0},{type:'CU',name:'Curveball',pct:5.4,vel:79.6},{type:'FC',name:'Cutter',pct:4.1,vel:89.7},{type:'ST',name:'Sweeper',pct:3.9,vel:83.6},{type:'UN',name:'UN',pct:0.1,vel:83.2}],
  'Daysbel Hernández': [{type:'SL',name:'Slider',pct:56.1,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:43.9,vel:97.7}],
  'Dean Kremer': [{type:'FF',name:'Four-seam Fastball',pct:26.5,vel:93.3},{type:'FS',name:'Splitter',pct:21.7,vel:81.9},{type:'FC',name:'Cutter',pct:19.7,vel:86.9},{type:'SI',name:'Sinker',pct:19.0,vel:92.8},{type:'CU',name:'Curveball',pct:12.7,vel:78.3},{type:'SL',name:'Slider',pct:0.4,vel:83.5},{type:'PO',name:'PO',pct:0.0,vel:91.1}],
  'Dedniel Núñez': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:96.2},{type:'SL',name:'Slider',pct:46.4,vel:88.8},{type:'CH',name:'Changeup',pct:1.1,vel:92.0}],
  'Dennis Santana': [{type:'SL',name:'Slider',pct:44.9,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:29.0,vel:94.5},{type:'FC',name:'Cutter',pct:9.0,vel:90.6},{type:'CH',name:'Changeup',pct:8.7,vel:87.9},{type:'SI',name:'Sinker',pct:8.4,vel:94.4}],
  'Devin Williams': [{type:'CH',name:'Changeup',pct:51.4,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:48.1,vel:94.1},{type:'FC',name:'Cutter',pct:0.3,vel:92.0},{type:'SL',name:'Slider',pct:0.2,vel:85.3}],
  'Didier Fuentes': [{type:'FF',name:'Four-seam Fastball',pct:58.8,vel:96.1},{type:'ST',name:'Sweeper',pct:17.2,vel:83.4},{type:'SL',name:'Slider',pct:8.6,vel:86.5},{type:'FS',name:'Splitter',pct:7.8,vel:88.1},{type:'CU',name:'Curveball',pct:7.5,vel:79.5}],
  'Dietrich Enns': [{type:'FF',name:'Four-seam Fastball',pct:46.0,vel:94.0},{type:'CH',name:'Changeup',pct:29.8,vel:84.5},{type:'FC',name:'Cutter',pct:14.4,vel:85.3},{type:'CU',name:'Curveball',pct:4.9,vel:77.3},{type:'SI',name:'Sinker',pct:2.5,vel:93.1},{type:'ST',name:'Sweeper',pct:2.4,vel:80.4}],
  'Dillon Tate': [{type:'ST',name:'Sweeper',pct:43.2,vel:79.3},{type:'SI',name:'Sinker',pct:33.8,vel:92.1},{type:'CH',name:'Changeup',pct:20.9,vel:82.7},{type:'FF',name:'Four-seam Fastball',pct:2.2,vel:90.9}],
  'Doug Nikhazy': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:90.2},{type:'SL',name:'Slider',pct:28.7,vel:86.2},{type:'CU',name:'Curveball',pct:11.1,vel:79.0},{type:'CH',name:'Changeup',pct:7.4,vel:83.2},{type:'ST',name:'Sweeper',pct:5.6,vel:82.4},{type:'FA',name:'FA',pct:0.9,vel:79.5}],
  'Drew Anderson': [{type:'FF',name:'Four-seam Fastball',pct:39.6,vel:94.2},{type:'CH',name:'Changeup',pct:30.7,vel:88.5},{type:'CU',name:'Curveball',pct:21.8,vel:79.1},{type:'SL',name:'Slider',pct:8.0,vel:86.5}],
  'Drew Pomeranz': [{type:'FF',name:'Four-seam Fastball',pct:76.2,vel:92.8},{type:'KC',name:'Knuckle Curve',pct:23.8,vel:84.0}],
  'Drew Rasmussen': [{type:'FF',name:'Four-seam Fastball',pct:34.5,vel:95.8},{type:'FC',name:'Cutter',pct:31.9,vel:90.3},{type:'SI',name:'Sinker',pct:22.8,vel:95.4},{type:'ST',name:'Sweeper',pct:4.6,vel:84.6},{type:'CU',name:'Curveball',pct:4.2,vel:80.4},{type:'CH',name:'Changeup',pct:1.8,vel:89.3},{type:'SL',name:'Slider',pct:0.2,vel:84.6}],
  'Drew Sommers': [{type:'SI',name:'Sinker',pct:43.6,vel:93.5},{type:'SL',name:'Slider',pct:42.3,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:12.8,vel:92.9},{type:'CH',name:'Changeup',pct:1.3,vel:87.2}],
  'Drey Jameson': [{type:'SI',name:'Sinker',pct:30.2,vel:96.5},{type:'SL',name:'Slider',pct:26.4,vel:87.6},{type:'CH',name:'Changeup',pct:24.5,vel:90.2},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:98.3}],
  'Dugan Darnell': [{type:'FF',name:'Four-seam Fastball',pct:52.7,vel:93.7},{type:'FS',name:'Splitter',pct:26.9,vel:84.5},{type:'SL',name:'Slider',pct:20.4,vel:82.0}],
  'Dustin May': [{type:'ST',name:'Sweeper',pct:36.7,vel:85.2},{type:'SI',name:'Sinker',pct:31.4,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:18.2,vel:95.7},{type:'FC',name:'Cutter',pct:10.5,vel:91.8},{type:'CH',name:'Changeup',pct:2.0,vel:90.0},{type:'CU',name:'Curveball',pct:1.3,vel:82.8}],
  'Dylan Cease': [{type:'FF',name:'Four-seam Fastball',pct:41.3,vel:97.2},{type:'SL',name:'Slider',pct:39.2,vel:89.1},{type:'KC',name:'Knuckle Curve',pct:8.4,vel:82.3},{type:'SI',name:'Sinker',pct:4.6,vel:96.1},{type:'ST',name:'Sweeper',pct:4.2,vel:84.4},{type:'CH',name:'Changeup',pct:2.3,vel:82.4}],
  'Dylan Dodd': [{type:'FC',name:'Cutter',pct:52.3,vel:86.9},{type:'SI',name:'Sinker',pct:37.5,vel:93.9},{type:'SL',name:'Slider',pct:8.0,vel:82.6},{type:'CH',name:'Changeup',pct:2.2,vel:87.5}],
  'Dylan Lee': [{type:'SL',name:'Slider',pct:55.2,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:31.3,vel:93.9},{type:'CH',name:'Changeup',pct:13.4,vel:86.4}],
  'Dylan Smith': [{type:'FF',name:'Four-seam Fastball',pct:49.7,vel:94.7},{type:'ST',name:'Sweeper',pct:33.9,vel:85.7},{type:'FS',name:'Splitter',pct:9.1,vel:86.1},{type:'SI',name:'Sinker',pct:7.3,vel:93.9}],
  'Easton Lucas': [{type:'FF',name:'Four-seam Fastball',pct:49.8,vel:93.8},{type:'CH',name:'Changeup',pct:21.0,vel:87.4},{type:'SL',name:'Slider',pct:12.1,vel:86.4},{type:'ST',name:'Sweeper',pct:9.8,vel:81.1},{type:'FC',name:'Cutter',pct:7.3,vel:91.5}],
  'Easton McGee': [{type:'SI',name:'Sinker',pct:31.8,vel:93.3},{type:'CU',name:'Curveball',pct:29.5,vel:79.8},{type:'FF',name:'Four-seam Fastball',pct:19.5,vel:92.8},{type:'FC',name:'Cutter',pct:11.6,vel:87.7},{type:'ST',name:'Sweeper',pct:6.3,vel:81.8},{type:'CH',name:'Changeup',pct:1.3,vel:87.2}],
  'Edgardo Henriquez': [{type:'FF',name:'Four-seam Fastball',pct:33.6,vel:100.6},{type:'SI',name:'Sinker',pct:24.7,vel:100.8},{type:'FC',name:'Cutter',pct:16.6,vel:95.8},{type:'SL',name:'Slider',pct:15.7,vel:89.2},{type:'CU',name:'Curveball',pct:9.4,vel:83.3}],
  'Eduard Bazardo': [{type:'SI',name:'Sinker',pct:45.6,vel:95.4},{type:'ST',name:'Sweeper',pct:40.6,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:11.6,vel:94.9},{type:'FS',name:'Splitter',pct:2.0,vel:90.2},{type:'FC',name:'Cutter',pct:0.2,vel:88.2}],
  'Eduardo Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:45.3,vel:92.0},{type:'CH',name:'Changeup',pct:22.3,vel:85.9},{type:'FC',name:'Cutter',pct:15.4,vel:89.2},{type:'SI',name:'Sinker',pct:8.4,vel:91.5},{type:'CU',name:'Curveball',pct:5.2,vel:79.3},{type:'SL',name:'Slider',pct:3.3,vel:84.6},{type:'PO',name:'PO',pct:0.0,vel:89.0}],
  'Eduardo Salazar': [{type:'SI',name:'Sinker',pct:45.0,vel:94.3},{type:'SL',name:'Slider',pct:31.7,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:21.8,vel:95.3},{type:'CH',name:'Changeup',pct:1.5,vel:86.6}],
  'Eduarniel Núñez': [{type:'FF',name:'Four-seam Fastball',pct:62.2,vel:98.1},{type:'SL',name:'Slider',pct:35.3,vel:88.2},{type:'CU',name:'Curveball',pct:2.4,vel:86.6}],
  'Edward Cabrera': [{type:'CH',name:'Changeup',pct:27.3,vel:93.9},{type:'CU',name:'Curveball',pct:22.2,vel:84.1},{type:'SI',name:'Sinker',pct:19.9,vel:96.8},{type:'SL',name:'Slider',pct:16.1,vel:88.5},{type:'FF',name:'Four-seam Fastball',pct:14.4,vel:96.7}],
  'Edwin Díaz': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:97.1},{type:'SL',name:'Slider',pct:47.4,vel:89.0},{type:'CH',name:'Changeup',pct:0.1,vel:94.5}],
  'Edwin Uceta': [{type:'FF',name:'Four-seam Fastball',pct:40.6,vel:94.0},{type:'CH',name:'Changeup',pct:38.9,vel:88.4},{type:'FC',name:'Cutter',pct:15.9,vel:89.4},{type:'ST',name:'Sweeper',pct:3.0,vel:82.1},{type:'SI',name:'Sinker',pct:1.6,vel:94.0}],
  'Eli Morgan': [{type:'CH',name:'Changeup',pct:39.4,vel:77.8},{type:'FF',name:'Four-seam Fastball',pct:34.3,vel:91.4},{type:'SL',name:'Slider',pct:26.4,vel:85.9}],
  'Elvin Rodríguez': [{type:'FF',name:'Four-seam Fastball',pct:46.0,vel:94.4},{type:'CU',name:'Curveball',pct:20.9,vel:78.7},{type:'FC',name:'Cutter',pct:17.0,vel:87.7},{type:'ST',name:'Sweeper',pct:10.1,vel:82.2},{type:'CH',name:'Changeup',pct:6.0,vel:86.8}],
  'Elvis Alvarado': [{type:'FF',name:'Four-seam Fastball',pct:49.2,vel:98.6},{type:'SL',name:'Slider',pct:27.3,vel:88.9},{type:'SI',name:'Sinker',pct:17.6,vel:98.0},{type:'CH',name:'Changeup',pct:3.4,vel:89.5},{type:'FS',name:'Splitter',pct:2.5,vel:86.1}],
  'Elvis Peguero': [{type:'SI',name:'Sinker',pct:50.3,vel:95.2},{type:'SL',name:'Slider',pct:49.7,vel:88.1}],
  'Emerson Hancock': [{type:'SI',name:'Sinker',pct:34.8,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:94.9},{type:'CH',name:'Changeup',pct:16.4,vel:86.5},{type:'ST',name:'Sweeper',pct:8.9,vel:78.2},{type:'SL',name:'Slider',pct:8.4,vel:81.8},{type:'FC',name:'Cutter',pct:2.8,vel:86.4}],
  'Emilio Pagán': [{type:'FF',name:'Four-seam Fastball',pct:61.8,vel:95.5},{type:'FS',name:'Splitter',pct:19.9,vel:83.7},{type:'FC',name:'Cutter',pct:18.3,vel:86.7}],
  'Emmanuel Clase': [{type:'FC',name:'Cutter',pct:68.9,vel:98.9},{type:'SL',name:'Slider',pct:30.2,vel:88.5},{type:'SI',name:'Sinker',pct:0.9,vel:98.5}],
  'Emmet Sheehan': [{type:'FF',name:'Four-seam Fastball',pct:46.2,vel:95.4},{type:'SL',name:'Slider',pct:30.5,vel:87.6},{type:'CH',name:'Changeup',pct:16.8,vel:85.8},{type:'CU',name:'Curveball',pct:6.4,vel:77.5},{type:'FA',name:'FA',pct:0.1,vel:72.8}],
  'Enmanuel De Jesus': [{type:'FF',name:'Four-seam Fastball',pct:29.2,vel:93.8},{type:'CH',name:'Changeup',pct:25.5,vel:87.3},{type:'FC',name:'Cutter',pct:19.0,vel:85.4},{type:'SI',name:'Sinker',pct:18.2,vel:93.5},{type:'SL',name:'Slider',pct:8.0,vel:79.4}],
  'Enrique Hernández': [{type:'EP',name:'EP',pct:55.2,vel:53.9},{type:'CS',name:'CS',pct:40.8,vel:51.5},{type:'FA',name:'FA',pct:4.0,vel:84.2}],
  'Enyel De Los Santos': [{type:'FF',name:'Four-seam Fastball',pct:48.0,vel:96.0},{type:'SL',name:'Slider',pct:35.4,vel:88.1},{type:'CH',name:'Changeup',pct:16.6,vel:87.3}],
  'Erasmo Ramírez': [{type:'FC',name:'Cutter',pct:44.3,vel:88.9},{type:'SI',name:'Sinker',pct:32.3,vel:90.7},{type:'CH',name:'Changeup',pct:11.4,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:6.3,vel:90.0},{type:'CU',name:'Curveball',pct:5.7,vel:81.5}],
  'Eric Lauer': [{type:'FF',name:'Four-seam Fastball',pct:46.2,vel:91.6},{type:'FC',name:'Cutter',pct:19.7,vel:86.5},{type:'CU',name:'Curveball',pct:14.0,vel:75.0},{type:'SL',name:'Slider',pct:11.1,vel:83.0},{type:'CH',name:'Changeup',pct:9.0,vel:84.5},{type:'SI',name:'Sinker',pct:0.0,vel:91.9}],
  'Eric Orze': [{type:'FS',name:'Splitter',pct:51.9,vel:83.7},{type:'FF',name:'Four-seam Fastball',pct:24.9,vel:93.5},{type:'SL',name:'Slider',pct:23.0,vel:88.7},{type:'CU',name:'Curveball',pct:0.2,vel:81.9}],
  'Erick Fedde': [{type:'SI',name:'Sinker',pct:32.3,vel:93.3},{type:'FC',name:'Cutter',pct:27.7,vel:90.3},{type:'ST',name:'Sweeper',pct:27.1,vel:82.5},{type:'CH',name:'Changeup',pct:12.0,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:0.9,vel:92.8}],
  'Erik Miller': [{type:'FF',name:'Four-seam Fastball',pct:31.1,vel:97.2},{type:'SL',name:'Slider',pct:23.9,vel:86.2},{type:'CH',name:'Changeup',pct:23.4,vel:87.2},{type:'SI',name:'Sinker',pct:21.5,vel:97.1}],
  'Erik Sabrowski': [{type:'FF',name:'Four-seam Fastball',pct:67.3,vel:94.0},{type:'SL',name:'Slider',pct:17.9,vel:86.6},{type:'CU',name:'Curveball',pct:14.8,vel:80.6}],
  'Erik Swanson': [{type:'FF',name:'Four-seam Fastball',pct:46.1,vel:92.9},{type:'FS',name:'Splitter',pct:43.8,vel:83.3},{type:'SL',name:'Slider',pct:10.2,vel:86.4}],
  'Ethan Roberts': [{type:'ST',name:'Sweeper',pct:51.2,vel:82.6},{type:'FC',name:'Cutter',pct:39.4,vel:92.0},{type:'SI',name:'Sinker',pct:9.4,vel:93.7}],
  'Eury Pérez': [{type:'FF',name:'Four-seam Fastball',pct:50.6,vel:97.9},{type:'SL',name:'Slider',pct:20.6,vel:86.2},{type:'CU',name:'Curveball',pct:9.0,vel:80.1},{type:'CH',name:'Changeup',pct:8.9,vel:89.5},{type:'ST',name:'Sweeper',pct:8.8,vel:83.1},{type:'FC',name:'Cutter',pct:1.3,vel:84.4},{type:'SI',name:'Sinker',pct:0.8,vel:96.5}],
  'Evan Phillips': [{type:'ST',name:'Sweeper',pct:53.3,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:95.4},{type:'FC',name:'Cutter',pct:7.6,vel:92.5},{type:'SI',name:'Sinker',pct:7.6,vel:95.4}],
  'Evan Shaw': [{type:'SI',name:'Sinker',pct:75.5,vel:90.7},{type:'ST',name:'Sweeper',pct:24.5,vel:81.6}],
  'Evan Sisk': [{type:'SI',name:'Sinker',pct:30.3,vel:89.9},{type:'ST',name:'Sweeper',pct:25.3,vel:79.9},{type:'FF',name:'Four-seam Fastball',pct:18.6,vel:90.6},{type:'CU',name:'Curveball',pct:14.4,vel:77.4},{type:'FC',name:'Cutter',pct:9.4,vel:87.1},{type:'SL',name:'Slider',pct:1.1,vel:79.2},{type:'CH',name:'Changeup',pct:0.8,vel:82.5}],
  'Fernando Cruz': [{type:'FS',name:'Splitter',pct:58.1,vel:80.6},{type:'FF',name:'Four-seam Fastball',pct:23.1,vel:93.9},{type:'SI',name:'Sinker',pct:11.5,vel:93.0},{type:'SL',name:'Slider',pct:7.4,vel:82.1}],
  'Forrest Whitley': [{type:'FF',name:'Four-seam Fastball',pct:33.6,vel:96.3},{type:'FC',name:'Cutter',pct:26.6,vel:89.4},{type:'SI',name:'Sinker',pct:17.6,vel:96.1},{type:'CU',name:'Curveball',pct:11.7,vel:81.6},{type:'SV',name:'Slurve',pct:9.4,vel:83.6},{type:'CH',name:'Changeup',pct:1.2,vel:87.8}],
  'Foster Griffin': [{type:'FC',name:'Cutter',pct:29.2,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:21.5,vel:91.8},{type:'ST',name:'Sweeper',pct:13.6,vel:80.3},{type:'CH',name:'Changeup',pct:10.9,vel:83.4},{type:'FS',name:'Splitter',pct:9.7,vel:81.4},{type:'CU',name:'Curveball',pct:9.4,vel:78.4},{type:'SI',name:'Sinker',pct:5.6,vel:91.3}],
  'Framber Valdez': [{type:'SI',name:'Sinker',pct:46.2,vel:94.2},{type:'CU',name:'Curveball',pct:32.5,vel:79.3},{type:'CH',name:'Changeup',pct:18.1,vel:89.7},{type:'SL',name:'Slider',pct:3.0,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:0.1,vel:95.5}],
  'Frankie Montas': [{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:95.6},{type:'FS',name:'Splitter',pct:20.6,vel:86.3},{type:'SI',name:'Sinker',pct:17.5,vel:95.1},{type:'SL',name:'Slider',pct:14.0,vel:86.9},{type:'ST',name:'Sweeper',pct:12.6,vel:84.7},{type:'FC',name:'Cutter',pct:10.2,vel:91.4}],
  'Fraser Ellard': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:94.9},{type:'SL',name:'Slider',pct:25.8,vel:85.0},{type:'SI',name:'Sinker',pct:14.9,vel:93.7},{type:'CH',name:'Changeup',pct:7.3,vel:89.9},{type:'FC',name:'Cutter',pct:0.9,vel:89.5}],
  'Freddy Peralta': [{type:'FF',name:'Four-seam Fastball',pct:52.3,vel:94.6},{type:'CH',name:'Changeup',pct:21.4,vel:88.7},{type:'CU',name:'Curveball',pct:13.2,vel:79.4},{type:'SL',name:'Slider',pct:9.8,vel:83.7},{type:'CS',name:'CS',pct:2.4,vel:74.7},{type:'ST',name:'Sweeper',pct:0.9,vel:80.2}],
  'Freddy Tarnok': [{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:95.4},{type:'CH',name:'Changeup',pct:24.6,vel:83.7},{type:'CU',name:'Curveball',pct:17.7,vel:79.8},{type:'SL',name:'Slider',pct:16.9,vel:86.6},{type:'SI',name:'Sinker',pct:6.9,vel:93.7}],
  'Félix Bautista': [{type:'SI',name:'Sinker',pct:61.7,vel:97.2},{type:'FS',name:'Splitter',pct:28.5,vel:88.9},{type:'SL',name:'Slider',pct:9.1,vel:85.4},{type:'FC',name:'Cutter',pct:0.5,vel:91.8},{type:'PO',name:'PO',pct:0.2,vel:94.3}],
  'Gabe Mosser': [{type:'ST',name:'Sweeper',pct:28.0,vel:79.0},{type:'FC',name:'Cutter',pct:25.3,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:17.3,vel:90.0},{type:'SI',name:'Sinker',pct:14.7,vel:90.2},{type:'SL',name:'Slider',pct:8.0,vel:85.0},{type:'KN',name:'Knuckleball',pct:6.7,vel:80.8}],
  'Gabe Speier': [{type:'FF',name:'Four-seam Fastball',pct:43.5,vel:95.0},{type:'SI',name:'Sinker',pct:29.6,vel:94.4},{type:'SL',name:'Slider',pct:26.7,vel:83.3},{type:'CH',name:'Changeup',pct:0.2,vel:89.6}],
  'Garrett Acton': [{type:'FF',name:'Four-seam Fastball',pct:65.3,vel:94.1},{type:'SL',name:'Slider',pct:30.5,vel:85.7},{type:'CH',name:'Changeup',pct:4.2,vel:86.4}],
  'Garrett Cleavinger': [{type:'SL',name:'Slider',pct:38.9,vel:87.1},{type:'SI',name:'Sinker',pct:36.5,vel:96.2},{type:'FF',name:'Four-seam Fastball',pct:11.7,vel:97.0},{type:'ST',name:'Sweeper',pct:11.4,vel:81.0},{type:'FC',name:'Cutter',pct:1.5,vel:90.7}],
  'Garrett Crochet': [{type:'FF',name:'Four-seam Fastball',pct:34.7,vel:96.4},{type:'FC',name:'Cutter',pct:28.1,vel:90.9},{type:'SI',name:'Sinker',pct:16.9,vel:95.9},{type:'ST',name:'Sweeper',pct:15.8,vel:82.9},{type:'CH',name:'Changeup',pct:4.4,vel:87.7},{type:'FS',name:'Splitter',pct:0.1,vel:88.2},{type:'UN',name:'UN',pct:0.0,vel:21.7}],
  'Garrett McDaniels': [{type:'SL',name:'Slider',pct:52.4,vel:85.0},{type:'SI',name:'Sinker',pct:41.4,vel:92.2},{type:'CU',name:'Curveball',pct:4.2,vel:80.0},{type:'FF',name:'Four-seam Fastball',pct:2.1,vel:93.2}],
  'Garrett Whitlock': [{type:'SI',name:'Sinker',pct:47.2,vel:95.6},{type:'SL',name:'Slider',pct:30.6,vel:84.7},{type:'CH',name:'Changeup',pct:21.3,vel:84.2},{type:'ST',name:'Sweeper',pct:0.9,vel:81.8}],
  'Gavin Hollowell': [{type:'FF',name:'Four-seam Fastball',pct:45.7,vel:94.4},{type:'ST',name:'Sweeper',pct:33.2,vel:84.9},{type:'SI',name:'Sinker',pct:21.2,vel:95.2}],
  'Gavin Williams': [{type:'FF',name:'Four-seam Fastball',pct:35.8,vel:96.6},{type:'ST',name:'Sweeper',pct:21.1,vel:86.6},{type:'CU',name:'Curveball',pct:21.0,vel:82.1},{type:'FC',name:'Cutter',pct:14.4,vel:91.8},{type:'SI',name:'Sinker',pct:7.7,vel:95.9},{type:'CH',name:'Changeup',pct:0.1,vel:87.6}],
  'Geoff Hartlieb': [{type:'SL',name:'Slider',pct:58.6,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:24.1,vel:94.9},{type:'SI',name:'Sinker',pct:15.5,vel:94.1},{type:'FC',name:'Cutter',pct:1.7,vel:90.3}],
  'George Kirby': [{type:'FF',name:'Four-seam Fastball',pct:29.0,vel:96.3},{type:'SL',name:'Slider',pct:27.9,vel:87.2},{type:'SI',name:'Sinker',pct:26.4,vel:96.5},{type:'KC',name:'Knuckle Curve',pct:10.8,vel:84.2},{type:'CH',name:'Changeup',pct:3.5,vel:88.2},{type:'FS',name:'Splitter',pct:2.0,vel:86.0},{type:'FC',name:'Cutter',pct:0.5,vel:92.9}],
  'George Klassen': [{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:97.2},{type:'CH',name:'Changeup',pct:27.1,vel:87.4},{type:'SL',name:'Slider',pct:15.1,vel:90.7},{type:'SI',name:'Sinker',pct:12.7,vel:97.2},{type:'CU',name:'Curveball',pct:8.1,vel:85.1}],
  'George Soriano': [{type:'SL',name:'Slider',pct:30.8,vel:86.1},{type:'CH',name:'Changeup',pct:29.0,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:19.9,vel:96.1},{type:'SI',name:'Sinker',pct:17.9,vel:95.5},{type:'ST',name:'Sweeper',pct:2.5,vel:84.7}],
  'Germán Márquez': [{type:'FF',name:'Four-seam Fastball',pct:35.4,vel:94.8},{type:'KC',name:'Knuckle Curve',pct:33.8,vel:85.6},{type:'SI',name:'Sinker',pct:18.9,vel:94.2},{type:'SL',name:'Slider',pct:9.6,vel:88.9},{type:'CH',name:'Changeup',pct:2.3,vel:88.2}],
  'Gerson Garabito': [{type:'CU',name:'Curveball',pct:24.0,vel:82.0},{type:'SL',name:'Slider',pct:22.3,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:20.7,vel:93.2},{type:'SI',name:'Sinker',pct:17.4,vel:92.9},{type:'CH',name:'Changeup',pct:15.7,vel:86.8}],
  'Gordon Graceffo': [{type:'FF',name:'Four-seam Fastball',pct:43.6,vel:95.7},{type:'SL',name:'Slider',pct:25.4,vel:89.2},{type:'CU',name:'Curveball',pct:24.6,vel:83.4},{type:'CH',name:'Changeup',pct:4.2,vel:87.4},{type:'SI',name:'Sinker',pct:2.1,vel:95.4}],
  'Graham Ashcraft': [{type:'FC',name:'Cutter',pct:54.1,vel:97.3},{type:'SL',name:'Slider',pct:45.9,vel:90.1}],
  'Grant Anderson': [{type:'ST',name:'Sweeper',pct:37.3,vel:80.1},{type:'FF',name:'Four-seam Fastball',pct:33.9,vel:93.3},{type:'SI',name:'Sinker',pct:24.7,vel:93.0},{type:'CH',name:'Changeup',pct:4.1,vel:86.7}],
  'Grant Holman': [{type:'FF',name:'Four-seam Fastball',pct:47.6,vel:94.6},{type:'FS',name:'Splitter',pct:38.8,vel:87.1},{type:'SL',name:'Slider',pct:13.3,vel:86.6},{type:'PO',name:'PO',pct:0.3,vel:94.3}],
  'Grant Holmes': [{type:'SL',name:'Slider',pct:36.3,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:94.5},{type:'CU',name:'Curveball',pct:14.3,vel:83.5},{type:'FC',name:'Cutter',pct:13.3,vel:92.1},{type:'CH',name:'Changeup',pct:1.6,vel:89.8},{type:'SI',name:'Sinker',pct:1.4,vel:93.6}],
  'Grant Rogers': [{type:'SI',name:'Sinker',pct:50.0,vel:92.7},{type:'FC',name:'Cutter',pct:32.1,vel:85.4},{type:'SL',name:'Slider',pct:17.9,vel:80.7}],
  'Grant Taylor': [{type:'FF',name:'Four-seam Fastball',pct:54.8,vel:98.7},{type:'CU',name:'Curveball',pct:20.6,vel:85.2},{type:'FC',name:'Cutter',pct:14.4,vel:95.2},{type:'SL',name:'Slider',pct:8.9,vel:90.0},{type:'SI',name:'Sinker',pct:1.3,vel:100.2}],
  'Grant Wolfram': [{type:'SI',name:'Sinker',pct:41.5,vel:95.8},{type:'SL',name:'Slider',pct:21.4,vel:86.8},{type:'CU',name:'Curveball',pct:15.0,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:14.2,vel:95.3},{type:'ST',name:'Sweeper',pct:7.6,vel:85.4},{type:'FS',name:'Splitter',pct:0.1,vel:86.3}],
  'Greg Weissert': [{type:'FF',name:'Four-seam Fastball',pct:32.0,vel:94.1},{type:'SI',name:'Sinker',pct:28.7,vel:93.8},{type:'SL',name:'Slider',pct:15.2,vel:85.5},{type:'CH',name:'Changeup',pct:10.2,vel:85.9},{type:'ST',name:'Sweeper',pct:10.1,vel:81.3},{type:'CU',name:'Curveball',pct:4.0,vel:81.1}],
  'Gregory Santos': [{type:'SL',name:'Slider',pct:53.7,vel:89.1},{type:'SI',name:'Sinker',pct:42.3,vel:97.9},{type:'FF',name:'Four-seam Fastball',pct:4.0,vel:99.6}],
  'Gregory Soto': [{type:'SI',name:'Sinker',pct:50.0,vel:96.8},{type:'SL',name:'Slider',pct:30.7,vel:85.8},{type:'ST',name:'Sweeper',pct:10.0,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:8.2,vel:96.9},{type:'FS',name:'Splitter',pct:1.1,vel:88.2}],
  'Griffin Canning': [{type:'FF',name:'Four-seam Fastball',pct:35.1,vel:94.1},{type:'SL',name:'Slider',pct:30.6,vel:87.7},{type:'CH',name:'Changeup',pct:23.2,vel:89.5},{type:'KC',name:'Knuckle Curve',pct:6.5,vel:81.4},{type:'FC',name:'Cutter',pct:3.7,vel:89.6},{type:'ST',name:'Sweeper',pct:0.9,vel:86.4}],
  'Griffin Green': [{type:'SI',name:'Sinker',pct:50.0,vel:93.4},{type:'FC',name:'Cutter',pct:32.0,vel:89.0},{type:'SL',name:'Slider',pct:18.0,vel:84.7}],
  'Griffin Jax': [{type:'ST',name:'Sweeper',pct:43.1,vel:87.9},{type:'CH',name:'Changeup',pct:22.0,vel:92.3},{type:'FF',name:'Four-seam Fastball',pct:17.5,vel:97.0},{type:'SI',name:'Sinker',pct:12.6,vel:96.5},{type:'FC',name:'Cutter',pct:3.7,vel:93.4},{type:'CU',name:'Curveball',pct:1.1,vel:86.6}],
  'Gunnar Hoglund': [{type:'FF',name:'Four-seam Fastball',pct:35.8,vel:93.6},{type:'CH',name:'Changeup',pct:23.0,vel:86.0},{type:'ST',name:'Sweeper',pct:17.4,vel:81.2},{type:'SI',name:'Sinker',pct:16.6,vel:93.2},{type:'SL',name:'Slider',pct:7.1,vel:90.7}],
  'Gus Varland': [{type:'FF',name:'Four-seam Fastball',pct:46.9,vel:95.3},{type:'SL',name:'Slider',pct:46.3,vel:87.5},{type:'CH',name:'Changeup',pct:6.8,vel:90.9}],
  'Génesis Cabrera': [{type:'SI',name:'Sinker',pct:25.2,vel:95.4},{type:'FF',name:'Four-seam Fastball',pct:22.4,vel:95.7},{type:'FC',name:'Cutter',pct:20.2,vel:89.9},{type:'CU',name:'Curveball',pct:19.2,vel:80.2},{type:'FS',name:'Splitter',pct:12.6,vel:85.0},{type:'CH',name:'Changeup',pct:0.4,vel:88.7}],
  'Hayden Birdsong': [{type:'FF',name:'Four-seam Fastball',pct:44.1,vel:95.5},{type:'SL',name:'Slider',pct:24.4,vel:88.9},{type:'CH',name:'Changeup',pct:16.8,vel:88.7},{type:'CU',name:'Curveball',pct:13.0,vel:80.3},{type:'SV',name:'Slurve',pct:1.7,vel:84.7}],
  'Hayden Harris': [{type:'FF',name:'Four-seam Fastball',pct:84.0,vel:91.9},{type:'ST',name:'Sweeper',pct:12.0,vel:81.8},{type:'FS',name:'Splitter',pct:4.0,vel:87.5}],
  'Hayden Wesneski': [{type:'FF',name:'Four-seam Fastball',pct:36.6,vel:93.9},{type:'ST',name:'Sweeper',pct:24.6,vel:83.3},{type:'FC',name:'Cutter',pct:11.4,vel:88.3},{type:'SI',name:'Sinker',pct:11.0,vel:91.9},{type:'CU',name:'Curveball',pct:9.3,vel:77.1},{type:'CH',name:'Changeup',pct:7.1,vel:85.7}],
  'Hoby Milner': [{type:'SI',name:'Sinker',pct:34.1,vel:87.4},{type:'ST',name:'Sweeper',pct:34.1,vel:78.2},{type:'CH',name:'Changeup',pct:17.5,vel:81.0},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:87.8}],
  'Hogan Harris': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:93.8},{type:'CU',name:'Curveball',pct:23.1,vel:73.8},{type:'CH',name:'Changeup',pct:11.7,vel:82.2},{type:'SL',name:'Slider',pct:2.8,vel:84.8},{type:'ST',name:'Sweeper',pct:2.6,vel:78.2},{type:'FC',name:'Cutter',pct:2.5,vel:89.5}],
  'Huascar Brazobán': [{type:'CH',name:'Changeup',pct:38.4,vel:90.7},{type:'SI',name:'Sinker',pct:37.6,vel:96.3},{type:'FC',name:'Cutter',pct:12.5,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:11.5,vel:96.4}],
  'Hunter Barco': [{type:'FF',name:'Four-seam Fastball',pct:39.9,vel:94.4},{type:'SL',name:'Slider',pct:22.8,vel:82.5},{type:'SI',name:'Sinker',pct:16.4,vel:93.9},{type:'FS',name:'Splitter',pct:10.3,vel:85.1},{type:'CH',name:'Changeup',pct:6.8,vel:86.5},{type:'ST',name:'Sweeper',pct:3.9,vel:83.6}],
  'Hunter Bigge': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:97.2},{type:'SL',name:'Slider',pct:45.2,vel:89.2},{type:'CU',name:'Curveball',pct:3.8,vel:81.4},{type:'FS',name:'Splitter',pct:2.5,vel:88.6},{type:'SI',name:'Sinker',pct:2.5,vel:95.8},{type:'UN',name:'UN',pct:0.3,vel:79.9}],
  'Hunter Brown': [{type:'FF',name:'Four-seam Fastball',pct:37.1,vel:96.6},{type:'SI',name:'Sinker',pct:23.2,vel:95.7},{type:'KC',name:'Knuckle Curve',pct:18.3,vel:83.5},{type:'CH',name:'Changeup',pct:11.6,vel:88.2},{type:'SL',name:'Slider',pct:8.5,vel:91.3},{type:'FC',name:'Cutter',pct:1.3,vel:93.4}],
  'Hunter Dobbins': [{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:95.5},{type:'SL',name:'Slider',pct:27.1,vel:87.7},{type:'CU',name:'Curveball',pct:12.0,vel:78.7},{type:'ST',name:'Sweeper',pct:10.3,vel:81.3},{type:'FS',name:'Splitter',pct:8.7,vel:90.5},{type:'SI',name:'Sinker',pct:1.4,vel:95.0}],
  'Hunter Gaddis': [{type:'SL',name:'Slider',pct:54.0,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:32.6,vel:94.7},{type:'CH',name:'Changeup',pct:13.4,vel:78.8}],
  'Hunter Greene': [{type:'FF',name:'Four-seam Fastball',pct:54.4,vel:99.5},{type:'SL',name:'Slider',pct:34.8,vel:89.7},{type:'FS',name:'Splitter',pct:10.7,vel:88.4},{type:'CU',name:'Curveball',pct:0.1,vel:84.0}],
  'Hunter Harvey': [{type:'FF',name:'Four-seam Fastball',pct:50.9,vel:96.4},{type:'FS',name:'Splitter',pct:24.9,vel:88.4},{type:'SL',name:'Slider',pct:16.7,vel:87.0},{type:'CU',name:'Curveball',pct:7.5,vel:81.5}],
  'Hunter Stratton': [{type:'FF',name:'Four-seam Fastball',pct:46.6,vel:96.0},{type:'SL',name:'Slider',pct:28.9,vel:84.9},{type:'FC',name:'Cutter',pct:21.3,vel:93.4},{type:'SI',name:'Sinker',pct:2.0,vel:95.5},{type:'FS',name:'Splitter',pct:1.2,vel:91.2}],
  'Hunter Strickland': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:93.5},{type:'SL',name:'Slider',pct:32.6,vel:84.8},{type:'ST',name:'Sweeper',pct:12.3,vel:81.5},{type:'SI',name:'Sinker',pct:10.6,vel:92.9},{type:'CH',name:'Changeup',pct:8.9,vel:87.3}],
  'Hurston Waldrep': [{type:'FS',name:'Splitter',pct:32.4,vel:86.8},{type:'FC',name:'Cutter',pct:21.8,vel:93.1},{type:'SI',name:'Sinker',pct:18.8,vel:95.9},{type:'CU',name:'Curveball',pct:13.1,vel:82.7},{type:'SL',name:'Slider',pct:11.6,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:95.5}],
  'Héctor Neris': [{type:'FS',name:'Splitter',pct:42.3,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:39.0,vel:92.3},{type:'SI',name:'Sinker',pct:9.0,vel:92.5},{type:'CH',name:'Changeup',pct:5.4,vel:88.7},{type:'SL',name:'Slider',pct:2.8,vel:86.3},{type:'CU',name:'Curveball',pct:1.6,vel:81.2}],
  'Ian Anderson': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:93.7},{type:'CH',name:'Changeup',pct:35.0,vel:88.2},{type:'CU',name:'Curveball',pct:13.8,vel:80.9}],
  'Ian Gibaut': [{type:'FF',name:'Four-seam Fastball',pct:51.3,vel:94.0},{type:'ST',name:'Sweeper',pct:16.5,vel:83.5},{type:'SL',name:'Slider',pct:14.7,vel:87.3},{type:'FC',name:'Cutter',pct:13.9,vel:90.6},{type:'CH',name:'Changeup',pct:3.4,vel:84.3},{type:'PO',name:'PO',pct:0.3,vel:93.6}],
  'Ian Hamilton': [{type:'SI',name:'Sinker',pct:48.7,vel:94.8},{type:'SL',name:'Slider',pct:38.1,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:13.2,vel:95.3}],
  'Ian Seymour': [{type:'CH',name:'Changeup',pct:31.6,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:30.2,vel:91.6},{type:'FC',name:'Cutter',pct:19.8,vel:88.2},{type:'SI',name:'Sinker',pct:7.2,vel:90.5},{type:'ST',name:'Sweeper',pct:6.8,vel:81.1},{type:'SL',name:'Slider',pct:3.0,vel:82.6},{type:'CU',name:'Curveball',pct:1.3,vel:74.4}],
  'Isaac Mattson': [{type:'FF',name:'Four-seam Fastball',pct:79.0,vel:93.9},{type:'CH',name:'Changeup',pct:11.2,vel:86.0},{type:'SL',name:'Slider',pct:8.2,vel:85.4},{type:'CU',name:'Curveball',pct:1.6,vel:80.4}],
  'Isaiah Campbell': [{type:'SL',name:'Slider',pct:41.3,vel:89.7},{type:'FF',name:'Four-seam Fastball',pct:27.3,vel:95.4},{type:'ST',name:'Sweeper',pct:13.3,vel:84.9},{type:'CU',name:'Curveball',pct:9.1,vel:83.8},{type:'SI',name:'Sinker',pct:9.1,vel:94.5}],
  'J.P. Feyereisen': [{type:'CH',name:'Changeup',pct:44.4,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:34.6,vel:91.2},{type:'SL',name:'Slider',pct:21.0,vel:83.3}],
  'J.P. France': [{type:'FC',name:'Cutter',pct:32.1,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:23.9,vel:92.3},{type:'CU',name:'Curveball',pct:19.6,vel:76.3},{type:'CH',name:'Changeup',pct:10.0,vel:85.4},{type:'SI',name:'Sinker',pct:9.6,vel:91.5},{type:'ST',name:'Sweeper',pct:4.8,vel:80.0}],
  'J.T. Ginn': [{type:'SI',name:'Sinker',pct:50.1,vel:93.5},{type:'SL',name:'Slider',pct:24.2,vel:86.0},{type:'FC',name:'Cutter',pct:14.1,vel:91.8},{type:'CH',name:'Changeup',pct:10.4,vel:88.4},{type:'FF',name:'Four-seam Fastball',pct:1.2,vel:94.3}],
  'JP Sears': [{type:'FF',name:'Four-seam Fastball',pct:40.1,vel:92.2},{type:'ST',name:'Sweeper',pct:27.0,vel:79.2},{type:'CH',name:'Changeup',pct:15.0,vel:83.4},{type:'SI',name:'Sinker',pct:6.8,vel:90.4},{type:'SL',name:'Slider',pct:6.8,vel:80.7},{type:'CU',name:'Curveball',pct:3.6,vel:79.5},{type:'FC',name:'Cutter',pct:0.7,vel:88.0}],
  'JR Ritchie': [{type:'CH',name:'Changeup',pct:25.0,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:23.1,vel:94.1},{type:'SI',name:'Sinker',pct:19.2,vel:93.6},{type:'FC',name:'Cutter',pct:17.3,vel:90.8},{type:'CU',name:'Curveball',pct:11.5,vel:81.4},{type:'ST',name:'Sweeper',pct:3.8,vel:80.6}],
  'JT Brubaker': [{type:'SI',name:'Sinker',pct:49.0,vel:93.5},{type:'SL',name:'Slider',pct:26.2,vel:86.5},{type:'CH',name:'Changeup',pct:13.7,vel:88.0},{type:'CU',name:'Curveball',pct:9.7,vel:81.6},{type:'FF',name:'Four-seam Fastball',pct:1.4,vel:92.8}],
  'Jack Anderson': [{type:'FF',name:'Four-seam Fastball',pct:40.3,vel:91.2},{type:'FS',name:'Splitter',pct:23.9,vel:82.7},{type:'SL',name:'Slider',pct:19.4,vel:84.9},{type:'CU',name:'Curveball',pct:11.9,vel:77.7},{type:'ST',name:'Sweeper',pct:4.5,vel:79.0}],
  'Jack Dreyer': [{type:'FF',name:'Four-seam Fastball',pct:46.1,vel:92.8},{type:'SL',name:'Slider',pct:45.9,vel:88.1},{type:'CU',name:'Curveball',pct:8.0,vel:79.0}],
  'Jack Flaherty': [{type:'FF',name:'Four-seam Fastball',pct:46.2,vel:93.0},{type:'SL',name:'Slider',pct:24.4,vel:85.1},{type:'KC',name:'Knuckle Curve',pct:24.0,vel:77.9},{type:'CH',name:'Changeup',pct:3.2,vel:85.8},{type:'SI',name:'Sinker',pct:2.2,vel:90.9}],
  'Jack Kochanowicz': [{type:'SI',name:'Sinker',pct:44.4,vel:95.6},{type:'FF',name:'Four-seam Fastball',pct:19.0,vel:95.7},{type:'CH',name:'Changeup',pct:16.8,vel:89.9},{type:'SL',name:'Slider',pct:15.4,vel:87.2},{type:'ST',name:'Sweeper',pct:4.3,vel:82.4},{type:'PO',name:'PO',pct:0.0,vel:92.5}],
  'Jack Leiter': [{type:'FF',name:'Four-seam Fastball',pct:37.8,vel:97.3},{type:'SL',name:'Slider',pct:22.7,vel:87.5},{type:'CH',name:'Changeup',pct:17.5,vel:90.7},{type:'SI',name:'Sinker',pct:11.6,vel:96.1},{type:'CU',name:'Curveball',pct:9.5,vel:81.9},{type:'FC',name:'Cutter',pct:0.9,vel:93.1},{type:'PO',name:'PO',pct:0.0,vel:94.7}],
  'Jack Little': [{type:'FF',name:'Four-seam Fastball',pct:54.8,vel:93.9},{type:'SL',name:'Slider',pct:32.3,vel:85.8},{type:'FS',name:'Splitter',pct:12.9,vel:86.8}],
  'Jack Perkins': [{type:'FF',name:'Four-seam Fastball',pct:41.6,vel:96.0},{type:'ST',name:'Sweeper',pct:31.5,vel:86.3},{type:'FC',name:'Cutter',pct:14.7,vel:93.3},{type:'CH',name:'Changeup',pct:11.4,vel:89.5},{type:'CU',name:'Curveball',pct:0.6,vel:84.2},{type:'SI',name:'Sinker',pct:0.1,vel:95.9}],
  'Jackson Jobe': [{type:'FF',name:'Four-seam Fastball',pct:31.0,vel:96.5},{type:'SL',name:'Slider',pct:30.6,vel:88.9},{type:'CH',name:'Changeup',pct:16.9,vel:85.3},{type:'SI',name:'Sinker',pct:13.2,vel:95.2},{type:'CU',name:'Curveball',pct:7.9,vel:81.6},{type:'ST',name:'Sweeper',pct:0.5,vel:81.7}],
  'Jackson Kowar': [{type:'FF',name:'Four-seam Fastball',pct:57.1,vel:97.3},{type:'SL',name:'Slider',pct:34.2,vel:86.0},{type:'CH',name:'Changeup',pct:7.5,vel:87.3},{type:'SI',name:'Sinker',pct:1.3,vel:96.4}],
  'Jackson Rutledge': [{type:'SI',name:'Sinker',pct:32.0,vel:95.2},{type:'SL',name:'Slider',pct:25.5,vel:85.2},{type:'FF',name:'Four-seam Fastball',pct:18.3,vel:95.6},{type:'FC',name:'Cutter',pct:14.0,vel:88.8},{type:'FS',name:'Splitter',pct:10.2,vel:85.3}],
  'Jacob Barnes': [{type:'FC',name:'Cutter',pct:56.2,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:94.1},{type:'FS',name:'Splitter',pct:6.8,vel:86.3}],
  'Jacob Latz': [{type:'FF',name:'Four-seam Fastball',pct:49.1,vel:94.1},{type:'CH',name:'Changeup',pct:22.0,vel:84.6},{type:'SL',name:'Slider',pct:21.9,vel:84.5},{type:'CU',name:'Curveball',pct:7.0,vel:78.4}],
  'Jacob Lopez': [{type:'FF',name:'Four-seam Fastball',pct:34.4,vel:90.7},{type:'SL',name:'Slider',pct:29.4,vel:78.1},{type:'FC',name:'Cutter',pct:15.8,vel:87.4},{type:'CH',name:'Changeup',pct:13.1,vel:82.8},{type:'SI',name:'Sinker',pct:7.2,vel:90.1}],
  'Jacob Misiorowski': [{type:'FF',name:'Four-seam Fastball',pct:55.1,vel:99.2},{type:'SL',name:'Slider',pct:24.5,vel:94.1},{type:'CU',name:'Curveball',pct:15.5,vel:87.1},{type:'CH',name:'Changeup',pct:5.0,vel:92.3}],
  'Jacob Webb': [{type:'FF',name:'Four-seam Fastball',pct:44.6,vel:93.4},{type:'CH',name:'Changeup',pct:35.0,vel:84.9},{type:'ST',name:'Sweeper',pct:20.4,vel:82.1}],
  'Jacob deGrom': [{type:'FF',name:'Four-seam Fastball',pct:46.2,vel:97.5},{type:'SL',name:'Slider',pct:37.3,vel:90.5},{type:'CH',name:'Changeup',pct:11.5,vel:89.8},{type:'CU',name:'Curveball',pct:4.9,vel:80.9},{type:'SI',name:'Sinker',pct:0.1,vel:96.3}],
  'Jaden Hill': [{type:'SI',name:'Sinker',pct:28.8,vel:97.2},{type:'SL',name:'Slider',pct:26.9,vel:88.3},{type:'CH',name:'Changeup',pct:22.6,vel:84.8},{type:'FF',name:'Four-seam Fastball',pct:21.5,vel:96.8},{type:'PO',name:'PO',pct:0.2,vel:96.2}],
  'Jake Bauers': [{type:'FA',name:'FA',pct:79.7,vel:67.4},{type:'EP',name:'EP',pct:16.5,vel:57.2},{type:'FF',name:'Four-seam Fastball',pct:3.8,vel:79.3}],
  'Jake Bird': [{type:'ST',name:'Sweeper',pct:40.1,vel:84.1},{type:'SI',name:'Sinker',pct:33.6,vel:94.5},{type:'CU',name:'Curveball',pct:21.6,vel:80.6},{type:'FC',name:'Cutter',pct:4.7,vel:93.6}],
  'Jake Eder': [{type:'FF',name:'Four-seam Fastball',pct:44.7,vel:93.1},{type:'ST',name:'Sweeper',pct:19.5,vel:83.0},{type:'SL',name:'Slider',pct:18.2,vel:87.8},{type:'CH',name:'Changeup',pct:17.5,vel:84.5}],
  'Jake Irvin': [{type:'FF',name:'Four-seam Fastball',pct:32.0,vel:92.4},{type:'CU',name:'Curveball',pct:28.1,vel:77.8},{type:'SI',name:'Sinker',pct:21.7,vel:91.9},{type:'CH',name:'Changeup',pct:7.7,vel:85.5},{type:'FC',name:'Cutter',pct:5.7,vel:87.6},{type:'SL',name:'Slider',pct:4.9,vel:83.2},{type:'PO',name:'PO',pct:0.0,vel:88.8}],
  'Jake Palisch': [{type:'FF',name:'Four-seam Fastball',pct:31.4,vel:91.4},{type:'CH',name:'Changeup',pct:23.5,vel:84.8},{type:'SL',name:'Slider',pct:23.5,vel:81.9},{type:'FC',name:'Cutter',pct:17.6,vel:85.7},{type:'SI',name:'Sinker',pct:3.9,vel:91.2}],
  'Jake Woodford': [{type:'SI',name:'Sinker',pct:32.0,vel:93.3},{type:'ST',name:'Sweeper',pct:21.2,vel:81.1},{type:'CH',name:'Changeup',pct:18.4,vel:86.3},{type:'FF',name:'Four-seam Fastball',pct:15.1,vel:93.1},{type:'FC',name:'Cutter',pct:13.4,vel:89.5}],
  'Jakob Junis': [{type:'SL',name:'Slider',pct:43.3,vel:82.9},{type:'SI',name:'Sinker',pct:25.7,vel:91.1},{type:'CH',name:'Changeup',pct:21.4,vel:86.3},{type:'FF',name:'Four-seam Fastball',pct:9.6,vel:91.3}],
  'Jalen Beeks': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:94.2},{type:'CH',name:'Changeup',pct:37.3,vel:88.6},{type:'FC',name:'Cutter',pct:10.5,vel:83.8}],
  'James Gonzalez': [{type:'FF',name:'Four-seam Fastball',pct:33.9,vel:93.3},{type:'CH',name:'Changeup',pct:25.4,vel:80.8},{type:'SI',name:'Sinker',pct:25.4,vel:91.5},{type:'SL',name:'Slider',pct:11.9,vel:81.3},{type:'CU',name:'Curveball',pct:3.4,vel:77.5}],
  'Jameson Taillon': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:92.2},{type:'FC',name:'Cutter',pct:16.2,vel:85.8},{type:'ST',name:'Sweeper',pct:15.1,vel:80.2},{type:'CU',name:'Curveball',pct:12.6,vel:79.5},{type:'CH',name:'Changeup',pct:11.8,vel:83.9},{type:'SI',name:'Sinker',pct:7.3,vel:92.1}],
  'Janson Junk': [{type:'FF',name:'Four-seam Fastball',pct:36.6,vel:93.7},{type:'SL',name:'Slider',pct:27.2,vel:86.8},{type:'ST',name:'Sweeper',pct:15.3,vel:81.7},{type:'CU',name:'Curveball',pct:11.0,vel:81.8},{type:'CH',name:'Changeup',pct:9.9,vel:87.7}],
  'Jared Koenig': [{type:'SI',name:'Sinker',pct:55.1,vel:95.7},{type:'FC',name:'Cutter',pct:18.7,vel:90.7},{type:'CU',name:'Curveball',pct:15.4,vel:81.6},{type:'CH',name:'Changeup',pct:8.7,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:2.0,vel:96.6}],
  'Jared Shuster': [{type:'CH',name:'Changeup',pct:33.4,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:32.5,vel:92.7},{type:'SL',name:'Slider',pct:25.1,vel:85.8},{type:'SI',name:'Sinker',pct:5.0,vel:91.9},{type:'FC',name:'Cutter',pct:3.3,vel:88.5},{type:'ST',name:'Sweeper',pct:0.6,vel:80.8}],
  'Jason Adam': [{type:'SL',name:'Slider',pct:35.6,vel:83.9},{type:'CH',name:'Changeup',pct:33.0,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:23.0,vel:94.5},{type:'ST',name:'Sweeper',pct:8.2,vel:77.5},{type:'FC',name:'Cutter',pct:0.3,vel:85.9}],
  'Jason Alexander': [{type:'SI',name:'Sinker',pct:39.9,vel:90.9},{type:'CH',name:'Changeup',pct:32.7,vel:80.3},{type:'ST',name:'Sweeper',pct:16.0,vel:78.5},{type:'FF',name:'Four-seam Fastball',pct:10.1,vel:91.9},{type:'FC',name:'Cutter',pct:1.0,vel:87.2},{type:'SL',name:'Slider',pct:0.2,vel:82.4}],
  'Javier Assad': [{type:'SI',name:'Sinker',pct:40.7,vel:92.4},{type:'FC',name:'Cutter',pct:21.3,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:12.1,vel:92.5},{type:'ST',name:'Sweeper',pct:11.8,vel:80.8},{type:'CU',name:'Curveball',pct:6.7,vel:77.3},{type:'CH',name:'Changeup',pct:6.4,vel:85.8},{type:'SL',name:'Slider',pct:1.0,vel:83.8}],
  'Javier Sanoja': [{type:'FA',name:'FA',pct:98.8,vel:62.6},{type:'CS',name:'CS',pct:0.6,vel:56.7},{type:'EP',name:'EP',pct:0.6,vel:44.7}],
  'Jayden Murray': [{type:'FF',name:'Four-seam Fastball',pct:47.7,vel:96.1},{type:'SI',name:'Sinker',pct:22.4,vel:95.5},{type:'ST',name:'Sweeper',pct:19.6,vel:82.1},{type:'FC',name:'Cutter',pct:5.1,vel:92.8},{type:'CH',name:'Changeup',pct:2.8,vel:90.1},{type:'CU',name:'Curveball',pct:1.9,vel:81.4},{type:'FS',name:'Splitter',pct:0.5,vel:87.8}],
  'Jedixson Paez': [{type:'CH',name:'Changeup',pct:24.3,vel:83.9},{type:'FC',name:'Cutter',pct:19.6,vel:87.9},{type:'CU',name:'Curveball',pct:18.9,vel:79.0},{type:'SI',name:'Sinker',pct:18.9,vel:91.1},{type:'FF',name:'Four-seam Fastball',pct:18.2,vel:91.7}],
  'Jeff Brigham': [{type:'FF',name:'Four-seam Fastball',pct:37.3,vel:94.7},{type:'FC',name:'Cutter',pct:34.7,vel:89.8},{type:'ST',name:'Sweeper',pct:28.0,vel:82.4}],
  'Jeff Hoffman': [{type:'FF',name:'Four-seam Fastball',pct:36.3,vel:96.3},{type:'SL',name:'Slider',pct:30.8,vel:87.2},{type:'FS',name:'Splitter',pct:25.3,vel:89.8},{type:'SI',name:'Sinker',pct:7.5,vel:96.4},{type:'PO',name:'PO',pct:0.1,vel:92.3}],
  'Jeffrey Springs': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:90.8},{type:'CH',name:'Changeup',pct:24.4,vel:79.2},{type:'SL',name:'Slider',pct:20.1,vel:83.5},{type:'ST',name:'Sweeper',pct:6.8,vel:76.2},{type:'FC',name:'Cutter',pct:5.8,vel:87.2}],
  'Jeremiah Estrada': [{type:'FF',name:'Four-seam Fastball',pct:56.1,vel:97.6},{type:'FS',name:'Splitter',pct:24.2,vel:83.3},{type:'SL',name:'Slider',pct:19.7,vel:88.1}],
  'Jesse Chavez': [{type:'FC',name:'Cutter',pct:38.6,vel:87.9},{type:'SI',name:'Sinker',pct:34.5,vel:89.6},{type:'CH',name:'Changeup',pct:17.0,vel:83.9},{type:'CU',name:'Curveball',pct:5.3,vel:73.8},{type:'SL',name:'Slider',pct:4.7,vel:80.4}],
  'Jesse Hahn': [{type:'SI',name:'Sinker',pct:55.6,vel:94.6},{type:'ST',name:'Sweeper',pct:21.3,vel:81.4},{type:'CU',name:'Curveball',pct:10.2,vel:79.2},{type:'FF',name:'Four-seam Fastball',pct:8.3,vel:94.9},{type:'SL',name:'Slider',pct:2.8,vel:84.4},{type:'CH',name:'Changeup',pct:1.9,vel:88.0}],
  'Jesse Scholtens': [{type:'SL',name:'Slider',pct:38.0,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:33.9,vel:94.2},{type:'ST',name:'Sweeper',pct:15.1,vel:81.0},{type:'SI',name:'Sinker',pct:8.2,vel:92.5},{type:'FS',name:'Splitter',pct:4.8,vel:85.1}],
  'Jesus Tinoco': [{type:'SL',name:'Slider',pct:42.8,vel:85.1},{type:'SI',name:'Sinker',pct:31.9,vel:95.2},{type:'CH',name:'Changeup',pct:15.1,vel:89.2},{type:'FF',name:'Four-seam Fastball',pct:10.2,vel:95.2}],
  'Jesús Luzardo': [{type:'ST',name:'Sweeper',pct:31.6,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:96.6},{type:'CH',name:'Changeup',pct:17.8,vel:87.6},{type:'SI',name:'Sinker',pct:12.5,vel:95.8},{type:'SL',name:'Slider',pct:6.6,vel:86.5}],
  'Jhoan Duran': [{type:'SI',name:'Sinker',pct:41.2,vel:97.7},{type:'FF',name:'Four-seam Fastball',pct:34.0,vel:100.5},{type:'KC',name:'Knuckle Curve',pct:17.6,vel:87.6},{type:'ST',name:'Sweeper',pct:6.2,vel:87.3},{type:'FS',name:'Splitter',pct:0.9,vel:88.7}],
  'Jhonny Pereda': [{type:'FA',name:'FA',pct:77.1,vel:67.7},{type:'FF',name:'Four-seam Fastball',pct:12.9,vel:88.0},{type:'EP',name:'EP',pct:10.0,vel:45.1}],
  'Jimmy Herget': [{type:'ST',name:'Sweeper',pct:30.6,vel:77.8},{type:'SL',name:'Slider',pct:28.2,vel:85.5},{type:'SI',name:'Sinker',pct:27.8,vel:91.8},{type:'FF',name:'Four-seam Fastball',pct:7.7,vel:92.9},{type:'CH',name:'Changeup',pct:5.6,vel:86.4},{type:'CU',name:'Curveball',pct:0.1,vel:81.2},{type:'PO',name:'PO',pct:0.1,vel:88.8}],
  'JoJo Romero': [{type:'SL',name:'Slider',pct:38.4,vel:82.9},{type:'SI',name:'Sinker',pct:33.3,vel:93.7},{type:'CH',name:'Changeup',pct:21.5,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:5.5,vel:94.2},{type:'SV',name:'Slurve',pct:1.1,vel:82.5},{type:'FC',name:'Cutter',pct:0.1,vel:90.0}],
  'Joe Boyle': [{type:'FF',name:'Four-seam Fastball',pct:41.9,vel:98.3},{type:'SL',name:'Slider',pct:35.1,vel:90.4},{type:'FS',name:'Splitter',pct:15.8,vel:92.9},{type:'SI',name:'Sinker',pct:4.2,vel:97.1},{type:'ST',name:'Sweeper',pct:2.9,vel:85.0}],
  'Joe La Sorsa': [{type:'SI',name:'Sinker',pct:33.1,vel:91.6},{type:'ST',name:'Sweeper',pct:25.6,vel:78.3},{type:'FF',name:'Four-seam Fastball',pct:22.6,vel:92.6},{type:'CH',name:'Changeup',pct:18.8,vel:84.7}],
  'Joe Mantiply': [{type:'SI',name:'Sinker',pct:38.5,vel:88.3},{type:'CU',name:'Curveball',pct:32.4,vel:79.0},{type:'CH',name:'Changeup',pct:27.7,vel:80.6},{type:'FF',name:'Four-seam Fastball',pct:1.4,vel:88.2}],
  'Joe Rock': [{type:'SI',name:'Sinker',pct:44.1,vel:93.5},{type:'SL',name:'Slider',pct:26.2,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:22.8,vel:94.2},{type:'CH',name:'Changeup',pct:6.9,vel:87.7}],
  'Joe Ross': [{type:'FF',name:'Four-seam Fastball',pct:32.8,vel:94.3},{type:'SI',name:'Sinker',pct:29.7,vel:94.7},{type:'SL',name:'Slider',pct:22.1,vel:87.5},{type:'CH',name:'Changeup',pct:7.3,vel:90.0},{type:'CU',name:'Curveball',pct:5.1,vel:83.6},{type:'FS',name:'Splitter',pct:3.0,vel:90.6}],
  'Joe Ryan': [{type:'FF',name:'Four-seam Fastball',pct:49.5,vel:93.5},{type:'SI',name:'Sinker',pct:12.6,vel:93.1},{type:'ST',name:'Sweeper',pct:12.5,vel:80.5},{type:'FS',name:'Splitter',pct:11.0,vel:87.5},{type:'SL',name:'Slider',pct:9.4,vel:87.6},{type:'KC',name:'Knuckle Curve',pct:5.0,vel:78.8},{type:'UN',name:'UN',pct:0.0,vel:56.5}],
  'Joel Kuhnel': [{type:'SI',name:'Sinker',pct:59.0,vel:95.1},{type:'FC',name:'Cutter',pct:31.4,vel:91.0},{type:'CH',name:'Changeup',pct:3.8,vel:90.5},{type:'FF',name:'Four-seam Fastball',pct:3.8,vel:96.0},{type:'CU',name:'Curveball',pct:1.9,vel:79.0}],
  'Joel Payamps': [{type:'ST',name:'Sweeper',pct:46.8,vel:83.7},{type:'FF',name:'Four-seam Fastball',pct:36.4,vel:94.7},{type:'SI',name:'Sinker',pct:14.2,vel:94.8},{type:'CH',name:'Changeup',pct:1.8,vel:88.6},{type:'FC',name:'Cutter',pct:0.9,vel:90.0}],
  'Joel Peguero': [{type:'SI',name:'Sinker',pct:34.3,vel:99.8},{type:'SL',name:'Slider',pct:33.0,vel:91.6},{type:'FF',name:'Four-seam Fastball',pct:32.7,vel:99.9}],
  'Joey Cantillo': [{type:'FF',name:'Four-seam Fastball',pct:42.6,vel:91.8},{type:'CH',name:'Changeup',pct:29.2,vel:78.6},{type:'CU',name:'Curveball',pct:18.0,vel:77.6},{type:'SL',name:'Slider',pct:10.2,vel:84.4}],
  'Joey Estes': [{type:'FF',name:'Four-seam Fastball',pct:48.9,vel:91.1},{type:'ST',name:'Sweeper',pct:15.6,vel:76.9},{type:'SL',name:'Slider',pct:15.1,vel:82.5},{type:'SI',name:'Sinker',pct:11.3,vel:89.8},{type:'CH',name:'Changeup',pct:9.1,vel:84.0}],
  'Joey Gerber': [{type:'FF',name:'Four-seam Fastball',pct:64.0,vel:93.8},{type:'SL',name:'Slider',pct:35.1,vel:86.3},{type:'CH',name:'Changeup',pct:0.9,vel:87.4}],
  'Joey Lucchesi': [{type:'SI',name:'Sinker',pct:48.4,vel:92.4},{type:'CU',name:'Curveball',pct:26.7,vel:77.8},{type:'FF',name:'Four-seam Fastball',pct:24.5,vel:92.7},{type:'FS',name:'Splitter',pct:0.4,vel:81.7}],
  'Joey Wentz': [{type:'FF',name:'Four-seam Fastball',pct:44.1,vel:93.4},{type:'SL',name:'Slider',pct:25.5,vel:84.9},{type:'CU',name:'Curveball',pct:17.8,vel:79.2},{type:'FC',name:'Cutter',pct:9.2,vel:86.8},{type:'CH',name:'Changeup',pct:3.5,vel:86.0}],
  'Johan Oviedo': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:95.0},{type:'SL',name:'Slider',pct:30.7,vel:86.1},{type:'CU',name:'Curveball',pct:17.1,vel:77.3},{type:'SI',name:'Sinker',pct:10.0,vel:94.3},{type:'CH',name:'Changeup',pct:4.8,vel:88.6},{type:'FC',name:'Cutter',pct:0.6,vel:86.3}],
  'John Brebbia': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:92.6},{type:'SL',name:'Slider',pct:41.0,vel:84.1},{type:'CH',name:'Changeup',pct:6.6,vel:86.6},{type:'FC',name:'Cutter',pct:3.2,vel:83.3},{type:'SI',name:'Sinker',pct:1.3,vel:92.3},{type:'CU',name:'Curveball',pct:0.8,vel:73.9},{type:'ST',name:'Sweeper',pct:0.8,vel:81.0}],
  'John Curtiss': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:94.2},{type:'FC',name:'Cutter',pct:30.9,vel:90.3},{type:'SL',name:'Slider',pct:9.8,vel:85.4},{type:'CH',name:'Changeup',pct:6.9,vel:87.6}],
  'John King': [{type:'SI',name:'Sinker',pct:54.6,vel:92.9},{type:'CH',name:'Changeup',pct:19.6,vel:85.3},{type:'SL',name:'Slider',pct:14.5,vel:84.1},{type:'CU',name:'Curveball',pct:6.2,vel:79.8},{type:'ST',name:'Sweeper',pct:2.8,vel:81.0},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:92.1}],
  'John Schreiber': [{type:'FF',name:'Four-seam Fastball',pct:31.1,vel:93.6},{type:'ST',name:'Sweeper',pct:27.6,vel:82.3},{type:'SI',name:'Sinker',pct:19.3,vel:93.2},{type:'FC',name:'Cutter',pct:18.5,vel:89.3},{type:'CH',name:'Changeup',pct:3.6,vel:85.9}],
  'Jon Berti': [{type:'FA',name:'FA',pct:51.0,vel:62.2},{type:'EP',name:'EP',pct:49.0,vel:49.6}],
  'Jon Gray': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:94.8},{type:'SL',name:'Slider',pct:42.4,vel:87.3},{type:'CH',name:'Changeup',pct:7.6,vel:88.3},{type:'CU',name:'Curveball',pct:2.9,vel:77.3}],
  'Jonah Bride': [{type:'FA',name:'FA',pct:77.2,vel:72.2},{type:'KN',name:'Knuckleball',pct:12.3,vel:61.8},{type:'CS',name:'CS',pct:10.5,vel:68.5}],
  'Jonah Tong': [{type:'FF',name:'Four-seam Fastball',pct:54.2,vel:95.2},{type:'CH',name:'Changeup',pct:27.6,vel:85.7},{type:'CU',name:'Curveball',pct:12.4,vel:77.9},{type:'FC',name:'Cutter',pct:3.6,vel:89.5},{type:'SL',name:'Slider',pct:2.2,vel:87.1}],
  'Jonathan Bowlan': [{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:95.9},{type:'SL',name:'Slider',pct:27.6,vel:85.9},{type:'SI',name:'Sinker',pct:16.6,vel:96.3},{type:'CH',name:'Changeup',pct:9.9,vel:88.9},{type:'CU',name:'Curveball',pct:8.4,vel:81.1},{type:'ST',name:'Sweeper',pct:2.6,vel:85.5}],
  'Jonathan Cannon': [{type:'FC',name:'Cutter',pct:23.1,vel:89.3},{type:'SI',name:'Sinker',pct:21.7,vel:93.0},{type:'CH',name:'Changeup',pct:21.3,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:18.4,vel:93.8},{type:'ST',name:'Sweeper',pct:15.1,vel:81.6},{type:'SL',name:'Slider',pct:0.4,vel:86.3}],
  'Jonathan Hernández': [{type:'SL',name:'Slider',pct:57.9,vel:88.0},{type:'SI',name:'Sinker',pct:40.4,vel:96.4},{type:'CH',name:'Changeup',pct:1.8,vel:91.2}],
  'Jonathan Loáisiga': [{type:'SI',name:'Sinker',pct:49.3,vel:96.9},{type:'CH',name:'Changeup',pct:21.9,vel:90.2},{type:'CU',name:'Curveball',pct:15.4,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:7.0,vel:97.2},{type:'FC',name:'Cutter',pct:6.3,vel:90.9}],
  'Jordan Hicks': [{type:'SI',name:'Sinker',pct:54.6,vel:97.7},{type:'ST',name:'Sweeper',pct:24.4,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:8.6,vel:97.4},{type:'SL',name:'Slider',pct:6.7,vel:84.4},{type:'FS',name:'Splitter',pct:5.6,vel:89.1}],
  'Jordan Leasure': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:96.2},{type:'SL',name:'Slider',pct:42.7,vel:87.2},{type:'FS',name:'Splitter',pct:3.2,vel:87.1},{type:'SI',name:'Sinker',pct:1.6,vel:95.9}],
  'Jordan Romano': [{type:'SL',name:'Slider',pct:61.2,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:38.4,vel:95.3},{type:'FS',name:'Splitter',pct:0.2,vel:86.1},{type:'CH',name:'Changeup',pct:0.1,vel:88.2}],
  'Jordan Weems': [{type:'FF',name:'Four-seam Fastball',pct:58.2,vel:95.7},{type:'SL',name:'Slider',pct:28.6,vel:88.5},{type:'FS',name:'Splitter',pct:11.2,vel:87.5},{type:'CU',name:'Curveball',pct:2.0,vel:79.5}],
  'Jordan Wicks': [{type:'FF',name:'Four-seam Fastball',pct:39.6,vel:94.4},{type:'CH',name:'Changeup',pct:24.4,vel:83.0},{type:'SL',name:'Slider',pct:12.9,vel:86.8},{type:'ST',name:'Sweeper',pct:12.0,vel:82.5},{type:'SI',name:'Sinker',pct:10.1,vel:93.4},{type:'CU',name:'Curveball',pct:0.9,vel:79.8}],
  'Jorge Alcala': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:97.3},{type:'CU',name:'Curveball',pct:22.9,vel:85.4},{type:'SL',name:'Slider',pct:15.8,vel:89.9},{type:'SI',name:'Sinker',pct:13.1,vel:96.8},{type:'CH',name:'Changeup',pct:1.9,vel:90.5}],
  'Jorge López': [{type:'SI',name:'Sinker',pct:27.6,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:94.7},{type:'SL',name:'Slider',pct:20.7,vel:85.8},{type:'KC',name:'Knuckle Curve',pct:16.8,vel:81.3},{type:'CH',name:'Changeup',pct:9.6,vel:87.0},{type:'PO',name:'PO',pct:0.3,vel:95.6}],
  'Jose A. Ferrer': [{type:'SI',name:'Sinker',pct:61.6,vel:97.6},{type:'CH',name:'Changeup',pct:21.1,vel:87.7},{type:'SL',name:'Slider',pct:9.6,vel:89.1},{type:'FF',name:'Four-seam Fastball',pct:7.8,vel:97.8}],
  'Jose Franco': [{type:'FF',name:'Four-seam Fastball',pct:56.9,vel:95.2},{type:'SL',name:'Slider',pct:33.0,vel:85.4},{type:'CH',name:'Changeup',pct:10.1,vel:88.3}],
  'Jose Quintana': [{type:'SI',name:'Sinker',pct:41.8,vel:90.5},{type:'CH',name:'Changeup',pct:21.8,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:14.2,vel:90.4},{type:'CU',name:'Curveball',pct:13.3,vel:78.3},{type:'SV',name:'Slurve',pct:8.9,vel:78.8}],
  'Josh Fleming': [{type:'SI',name:'Sinker',pct:37.5,vel:89.1},{type:'CU',name:'Curveball',pct:31.7,vel:76.7},{type:'CH',name:'Changeup',pct:20.8,vel:81.3},{type:'FC',name:'Cutter',pct:10.0,vel:86.0}],
  'Josh Hader': [{type:'SI',name:'Sinker',pct:54.2,vel:95.5},{type:'SL',name:'Slider',pct:41.4,vel:83.3},{type:'CH',name:'Changeup',pct:4.4,vel:88.7}],
  'Josh Simpson': [{type:'ST',name:'Sweeper',pct:25.8,vel:82.4},{type:'CU',name:'Curveball',pct:23.7,vel:80.6},{type:'SI',name:'Sinker',pct:22.2,vel:94.0},{type:'FF',name:'Four-seam Fastball',pct:11.7,vel:94.3},{type:'CH',name:'Changeup',pct:10.9,vel:89.2},{type:'SL',name:'Slider',pct:5.7,vel:88.0}],
  'Josh Walker': [{type:'CU',name:'Curveball',pct:53.3,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:40.2,vel:93.2},{type:'SI',name:'Sinker',pct:6.5,vel:91.9}],
  'Josh Winckowski': [{type:'FF',name:'Four-seam Fastball',pct:29.5,vel:94.7},{type:'FC',name:'Cutter',pct:26.6,vel:89.4},{type:'CH',name:'Changeup',pct:17.4,vel:91.9},{type:'SI',name:'Sinker',pct:17.4,vel:94.9},{type:'SL',name:'Slider',pct:9.2,vel:85.3}],
  'José Alvarado': [{type:'SI',name:'Sinker',pct:63.3,vel:98.8},{type:'FC',name:'Cutter',pct:31.0,vel:92.6},{type:'CU',name:'Curveball',pct:3.7,vel:85.0},{type:'FF',name:'Four-seam Fastball',pct:2.0,vel:98.7}],
  'José Berríos': [{type:'SI',name:'Sinker',pct:33.6,vel:92.2},{type:'SV',name:'Slurve',pct:25.9,vel:82.6},{type:'FF',name:'Four-seam Fastball',pct:17.9,vel:93.0},{type:'CH',name:'Changeup',pct:16.8,vel:85.2},{type:'FC',name:'Cutter',pct:5.8,vel:89.5},{type:'UN',name:'UN',pct:0.0,vel:63.5}],
  'José Buttó': [{type:'FF',name:'Four-seam Fastball',pct:30.3,vel:95.2},{type:'SL',name:'Slider',pct:29.4,vel:86.5},{type:'SI',name:'Sinker',pct:18.5,vel:94.4},{type:'CH',name:'Changeup',pct:15.0,vel:88.3},{type:'ST',name:'Sweeper',pct:6.6,vel:83.6},{type:'CU',name:'Curveball',pct:0.1,vel:80.4}],
  'José Castillo': [{type:'SL',name:'Slider',pct:43.6,vel:84.2},{type:'SI',name:'Sinker',pct:38.9,vel:93.0},{type:'FF',name:'Four-seam Fastball',pct:14.9,vel:93.3},{type:'CH',name:'Changeup',pct:2.6,vel:87.0}],
  'José De León': [{type:'FF',name:'Four-seam Fastball',pct:47.5,vel:90.6},{type:'SV',name:'Slurve',pct:23.8,vel:74.6},{type:'SL',name:'Slider',pct:15.8,vel:82.4},{type:'CH',name:'Changeup',pct:12.9,vel:83.5}],
  'José Fermin': [{type:'SL',name:'Slider',pct:49.1,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:47.0,vel:96.8},{type:'SI',name:'Sinker',pct:3.6,vel:96.6},{type:'CH',name:'Changeup',pct:0.3,vel:93.1}],
  'José Leclerc': [{type:'FF',name:'Four-seam Fastball',pct:33.6,vel:94.2},{type:'SL',name:'Slider',pct:21.4,vel:80.6},{type:'CH',name:'Changeup',pct:19.7,vel:86.5},{type:'FC',name:'Cutter',pct:14.0,vel:88.8},{type:'SI',name:'Sinker',pct:8.7,vel:93.8},{type:'CU',name:'Curveball',pct:2.6,vel:78.5}],
  'José Ruiz': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:95.7},{type:'CU',name:'Curveball',pct:30.5,vel:85.5},{type:'SI',name:'Sinker',pct:15.6,vel:95.2},{type:'CH',name:'Changeup',pct:15.2,vel:89.0},{type:'SL',name:'Slider',pct:0.7,vel:90.3}],
  'José Soriano': [{type:'SI',name:'Sinker',pct:46.5,vel:97.2},{type:'KC',name:'Knuckle Curve',pct:26.5,vel:85.3},{type:'FF',name:'Four-seam Fastball',pct:10.9,vel:98.0},{type:'FS',name:'Splitter',pct:9.5,vel:92.4},{type:'SL',name:'Slider',pct:6.3,vel:89.4},{type:'CH',name:'Changeup',pct:0.3,vel:86.9}],
  'José Suarez': [{type:'FF',name:'Four-seam Fastball',pct:40.1,vel:93.4},{type:'CH',name:'Changeup',pct:30.4,vel:83.5},{type:'SL',name:'Slider',pct:19.8,vel:82.4},{type:'SI',name:'Sinker',pct:8.5,vel:92.3},{type:'ST',name:'Sweeper',pct:1.0,vel:76.1},{type:'CU',name:'Curveball',pct:0.2,vel:77.7}],
  'José Ureña': [{type:'SI',name:'Sinker',pct:36.3,vel:96.1},{type:'SL',name:'Slider',pct:25.6,vel:87.6},{type:'CH',name:'Changeup',pct:24.6,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:10.1,vel:96.3},{type:'FS',name:'Splitter',pct:3.4,vel:85.0}],
  'José Urquidy': [{type:'CH',name:'Changeup',pct:30.0,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:29.3,vel:92.6},{type:'CU',name:'Curveball',pct:18.3,vel:79.2},{type:'SI',name:'Sinker',pct:12.1,vel:92.4},{type:'ST',name:'Sweeper',pct:5.9,vel:81.2},{type:'FC',name:'Cutter',pct:4.4,vel:86.2}],
  'Jovani Morán': [{type:'FF',name:'Four-seam Fastball',pct:37.4,vel:92.1},{type:'CH',name:'Changeup',pct:33.9,vel:83.0},{type:'FC',name:'Cutter',pct:19.5,vel:84.6},{type:'ST',name:'Sweeper',pct:8.2,vel:79.9},{type:'CU',name:'Curveball',pct:1.2,vel:79.6}],
  'Juan Burgos': [{type:'FC',name:'Cutter',pct:33.2,vel:91.9},{type:'SI',name:'Sinker',pct:32.7,vel:95.8},{type:'ST',name:'Sweeper',pct:31.8,vel:85.2},{type:'CH',name:'Changeup',pct:2.3,vel:92.5}],
  'Juan Mejia': [{type:'FF',name:'Four-seam Fastball',pct:64.8,vel:96.7},{type:'ST',name:'Sweeper',pct:33.4,vel:83.3},{type:'SI',name:'Sinker',pct:1.1,vel:96.9},{type:'SL',name:'Slider',pct:0.6,vel:89.0},{type:'CH',name:'Changeup',pct:0.2,vel:93.0}],
  'Juan Morillo': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:98.8},{type:'SL',name:'Slider',pct:20.2,vel:88.3},{type:'SI',name:'Sinker',pct:16.9,vel:98.8},{type:'CH',name:'Changeup',pct:15.8,vel:92.1}],
  'Julian Fernández': [{type:'FF',name:'Four-seam Fastball',pct:65.9,vel:97.2},{type:'CH',name:'Changeup',pct:34.1,vel:85.8}],
  'Julian Merryweather': [{type:'SL',name:'Slider',pct:49.7,vel:84.6},{type:'FF',name:'Four-seam Fastball',pct:48.2,vel:96.0},{type:'ST',name:'Sweeper',pct:1.5,vel:83.1},{type:'CH',name:'Changeup',pct:0.6,vel:80.1}],
  'Justin Bruihl': [{type:'SI',name:'Sinker',pct:45.8,vel:90.1},{type:'ST',name:'Sweeper',pct:38.1,vel:78.1},{type:'CH',name:'Changeup',pct:5.9,vel:80.6},{type:'FC',name:'Cutter',pct:5.7,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:4.5,vel:91.9}],
  'Justin Garza': [{type:'FC',name:'Cutter',pct:50.0,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:37.2,vel:96.1},{type:'CU',name:'Curveball',pct:9.3,vel:81.8},{type:'FS',name:'Splitter',pct:3.5,vel:83.9}],
  'Justin Hagenman': [{type:'FC',name:'Cutter',pct:32.6,vel:86.7},{type:'SI',name:'Sinker',pct:25.1,vel:93.0},{type:'CH',name:'Changeup',pct:23.0,vel:86.8},{type:'SL',name:'Slider',pct:19.3,vel:84.4}],
  'Justin Lawrence': [{type:'ST',name:'Sweeper',pct:47.3,vel:82.7},{type:'SI',name:'Sinker',pct:39.4,vel:94.9},{type:'FF',name:'Four-seam Fastball',pct:13.3,vel:95.1}],
  'Justin Martinez': [{type:'SI',name:'Sinker',pct:32.3,vel:99.2},{type:'FS',name:'Splitter',pct:32.0,vel:88.0},{type:'FF',name:'Four-seam Fastball',pct:26.8,vel:100.0},{type:'SL',name:'Slider',pct:8.9,vel:91.4}],
  'Justin Slaten': [{type:'FC',name:'Cutter',pct:36.1,vel:92.4},{type:'FF',name:'Four-seam Fastball',pct:34.4,vel:96.6},{type:'CU',name:'Curveball',pct:15.8,vel:84.9},{type:'ST',name:'Sweeper',pct:13.5,vel:85.1},{type:'FS',name:'Splitter',pct:0.2,vel:87.6}],
  'Justin Steele': [{type:'FF',name:'Four-seam Fastball',pct:58.1,vel:90.8},{type:'SL',name:'Slider',pct:27.2,vel:81.3},{type:'SI',name:'Sinker',pct:6.9,vel:90.4},{type:'CU',name:'Curveball',pct:4.9,vel:79.4},{type:'CH',name:'Changeup',pct:2.8,vel:84.8}],
  'Justin Sterner': [{type:'FF',name:'Four-seam Fastball',pct:50.5,vel:93.5},{type:'FC',name:'Cutter',pct:31.5,vel:87.4},{type:'ST',name:'Sweeper',pct:17.9,vel:81.5},{type:'PO',name:'PO',pct:0.1,vel:91.4}],
  'Justin Topa': [{type:'SI',name:'Sinker',pct:37.6,vel:94.1},{type:'ST',name:'Sweeper',pct:27.4,vel:82.6},{type:'FC',name:'Cutter',pct:20.3,vel:91.1},{type:'CH',name:'Changeup',pct:14.6,vel:86.9},{type:'PO',name:'PO',pct:0.1,vel:93.4}],
  'Justin Verlander': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:93.9},{type:'SL',name:'Slider',pct:23.0,vel:87.1},{type:'CU',name:'Curveball',pct:14.5,vel:78.4},{type:'CH',name:'Changeup',pct:8.6,vel:84.6},{type:'ST',name:'Sweeper',pct:7.7,vel:80.7},{type:'SI',name:'Sinker',pct:0.4,vel:93.0}],
  'Justin Wilson': [{type:'FF',name:'Four-seam Fastball',pct:46.4,vel:94.5},{type:'SL',name:'Slider',pct:33.5,vel:88.0},{type:'FC',name:'Cutter',pct:15.1,vel:91.5},{type:'FS',name:'Splitter',pct:5.0,vel:85.2}],
  'Justin Wrobleski': [{type:'FF',name:'Four-seam Fastball',pct:33.2,vel:95.6},{type:'SL',name:'Slider',pct:27.6,vel:87.3},{type:'SI',name:'Sinker',pct:17.5,vel:95.1},{type:'FC',name:'Cutter',pct:11.0,vel:92.1},{type:'CU',name:'Curveball',pct:8.0,vel:81.0},{type:'CH',name:'Changeup',pct:2.6,vel:87.9}],
  'Kade Strowd': [{type:'FC',name:'Cutter',pct:40.2,vel:91.7},{type:'FF',name:'Four-seam Fastball',pct:19.6,vel:95.7},{type:'SI',name:'Sinker',pct:15.2,vel:96.2},{type:'CU',name:'Curveball',pct:13.5,vel:83.1},{type:'ST',name:'Sweeper',pct:11.5,vel:84.6}],
  'Kai-Wei Teng': [{type:'ST',name:'Sweeper',pct:38.4,vel:84.7},{type:'FF',name:'Four-seam Fastball',pct:26.4,vel:93.7},{type:'SI',name:'Sinker',pct:14.6,vel:93.4},{type:'CU',name:'Curveball',pct:11.7,vel:83.1},{type:'CH',name:'Changeup',pct:9.0,vel:87.8}],
  'Kaleb Ort': [{type:'FF',name:'Four-seam Fastball',pct:54.3,vel:96.4},{type:'ST',name:'Sweeper',pct:23.2,vel:83.9},{type:'FC',name:'Cutter',pct:14.2,vel:90.6},{type:'CH',name:'Changeup',pct:8.2,vel:89.6}],
  'Keaton Winn': [{type:'FS',name:'Splitter',pct:50.7,vel:89.3},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:96.2},{type:'SI',name:'Sinker',pct:19.2,vel:95.1},{type:'SL',name:'Slider',pct:3.4,vel:87.7}],
  'Keegan Akin': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:93.7},{type:'SL',name:'Slider',pct:28.7,vel:85.6},{type:'CH',name:'Changeup',pct:20.0,vel:86.6}],
  'Keider Montero': [{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:94.0},{type:'SI',name:'Sinker',pct:20.8,vel:93.8},{type:'SL',name:'Slider',pct:20.5,vel:84.2},{type:'KC',name:'Knuckle Curve',pct:14.9,vel:79.3},{type:'CH',name:'Changeup',pct:13.0,vel:86.9},{type:'ST',name:'Sweeper',pct:0.1,vel:83.7}],
  'Ken Waldichuk': [{type:'CU',name:'Curveball',pct:34.9,vel:81.6},{type:'FF',name:'Four-seam Fastball',pct:32.8,vel:93.3},{type:'FC',name:'Cutter',pct:23.4,vel:87.6},{type:'ST',name:'Sweeper',pct:6.2,vel:84.4},{type:'CH',name:'Changeup',pct:2.6,vel:85.1}],
  'Kendall Graveman': [{type:'SI',name:'Sinker',pct:39.5,vel:94.6},{type:'SL',name:'Slider',pct:21.9,vel:85.2},{type:'CH',name:'Changeup',pct:20.4,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:16.0,vel:94.2},{type:'CU',name:'Curveball',pct:2.2,vel:81.1}],
  'Kenley Jansen': [{type:'FC',name:'Cutter',pct:80.8,vel:92.8},{type:'SI',name:'Sinker',pct:9.3,vel:93.2},{type:'SL',name:'Slider',pct:6.9,vel:83.9},{type:'ST',name:'Sweeper',pct:3.0,vel:82.0}],
  'Kenta Maeda': [{type:'FS',name:'Splitter',pct:36.5,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:18.2,vel:90.2},{type:'SL',name:'Slider',pct:17.6,vel:81.4},{type:'ST',name:'Sweeper',pct:17.6,vel:80.1},{type:'SI',name:'Sinker',pct:8.2,vel:90.0},{type:'SV',name:'Slurve',pct:1.2,vel:81.6},{type:'FC',name:'Cutter',pct:0.6,vel:86.3}],
  'Kevin Gausman': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:94.5},{type:'FS',name:'Splitter',pct:38.9,vel:84.8},{type:'SL',name:'Slider',pct:8.9,vel:83.5},{type:'SI',name:'Sinker',pct:0.1,vel:93.6}],
  'Kevin Ginkel': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:94.8},{type:'SL',name:'Slider',pct:44.4,vel:84.8},{type:'SI',name:'Sinker',pct:6.4,vel:93.9},{type:'FS',name:'Splitter',pct:0.7,vel:85.9}],
  'Kevin Herget': [{type:'FF',name:'Four-seam Fastball',pct:44.0,vel:92.1},{type:'CH',name:'Changeup',pct:36.6,vel:81.4},{type:'FC',name:'Cutter',pct:18.5,vel:86.8},{type:'CU',name:'Curveball',pct:0.9,vel:76.5}],
  'Kevin Kelly': [{type:'SI',name:'Sinker',pct:56.8,vel:91.0},{type:'ST',name:'Sweeper',pct:19.5,vel:78.5},{type:'FC',name:'Cutter',pct:11.3,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:8.1,vel:92.2},{type:'CH',name:'Changeup',pct:4.3,vel:85.4}],
  'Kirby Yates': [{type:'FF',name:'Four-seam Fastball',pct:57.5,vel:92.7},{type:'FS',name:'Splitter',pct:42.2,vel:85.9},{type:'SL',name:'Slider',pct:0.3,vel:74.5}],
  'Kodai Senga': [{type:'FF',name:'Four-seam Fastball',pct:31.8,vel:94.9},{type:'FO',name:'Forkball',pct:27.5,vel:82.6},{type:'FC',name:'Cutter',pct:20.4,vel:89.6},{type:'ST',name:'Sweeper',pct:8.7,vel:80.1},{type:'SI',name:'Sinker',pct:6.0,vel:88.5},{type:'SL',name:'Slider',pct:4.0,vel:83.8},{type:'CU',name:'Curveball',pct:1.6,vel:68.4},{type:'EP',name:'EP',pct:0.0,vel:50.7},{type:'PO',name:'PO',pct:0.0,vel:79.3}],
  'Kody Funderburk': [{type:'SI',name:'Sinker',pct:33.7,vel:93.0},{type:'FC',name:'Cutter',pct:24.6,vel:91.9},{type:'ST',name:'Sweeper',pct:19.1,vel:82.0},{type:'SL',name:'Slider',pct:11.5,vel:86.6},{type:'CH',name:'Changeup',pct:11.1,vel:88.9}],
  'Kolby Allard': [{type:'FF',name:'Four-seam Fastball',pct:38.4,vel:90.0},{type:'CH',name:'Changeup',pct:19.6,vel:81.6},{type:'FC',name:'Cutter',pct:19.5,vel:84.6},{type:'CU',name:'Curveball',pct:13.6,vel:72.0},{type:'SI',name:'Sinker',pct:8.8,vel:90.5}],
  'Konnor Pilkington': [{type:'FF',name:'Four-seam Fastball',pct:57.9,vel:94.4},{type:'CH',name:'Changeup',pct:21.5,vel:85.6},{type:'SL',name:'Slider',pct:20.2,vel:85.1},{type:'SI',name:'Sinker',pct:0.4,vel:89.6}],
  'Kris Bubic': [{type:'FF',name:'Four-seam Fastball',pct:39.1,vel:92.0},{type:'CH',name:'Changeup',pct:20.8,vel:85.5},{type:'ST',name:'Sweeper',pct:20.3,vel:82.9},{type:'SL',name:'Slider',pct:12.8,vel:85.4},{type:'SI',name:'Sinker',pct:7.0,vel:91.4}],
  'Kumar Rocker': [{type:'SI',name:'Sinker',pct:27.9,vel:95.5},{type:'FC',name:'Cutter',pct:21.1,vel:90.2},{type:'SL',name:'Slider',pct:20.9,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:17.9,vel:95.8},{type:'CH',name:'Changeup',pct:7.2,vel:89.5},{type:'CU',name:'Curveball',pct:4.9,vel:77.5},{type:'PO',name:'PO',pct:0.1,vel:90.8}],
  'Kyle Backhus': [{type:'SI',name:'Sinker',pct:62.0,vel:90.9},{type:'ST',name:'Sweeper',pct:28.6,vel:78.2},{type:'CH',name:'Changeup',pct:9.4,vel:78.7}],
  'Kyle Bradish': [{type:'SL',name:'Slider',pct:34.2,vel:86.7},{type:'SI',name:'Sinker',pct:31.0,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:20.0,vel:94.2},{type:'CU',name:'Curveball',pct:14.8,vel:83.7}],
  'Kyle Finnegan': [{type:'FF',name:'Four-seam Fastball',pct:56.1,vel:96.3},{type:'FS',name:'Splitter',pct:38.7,vel:87.4},{type:'SL',name:'Slider',pct:5.3,vel:84.9}],
  'Kyle Freeland': [{type:'FF',name:'Four-seam Fastball',pct:32.4,vel:91.6},{type:'KC',name:'Knuckle Curve',pct:25.8,vel:82.6},{type:'FC',name:'Cutter',pct:15.6,vel:87.4},{type:'ST',name:'Sweeper',pct:13.1,vel:83.6},{type:'CH',name:'Changeup',pct:7.0,vel:86.6},{type:'SI',name:'Sinker',pct:6.0,vel:91.4}],
  'Kyle Gibson': [{type:'SI',name:'Sinker',pct:35.7,vel:90.9},{type:'ST',name:'Sweeper',pct:18.9,vel:81.2},{type:'CH',name:'Changeup',pct:12.9,vel:85.4},{type:'CU',name:'Curveball',pct:11.1,vel:78.8},{type:'FC',name:'Cutter',pct:10.4,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:9.3,vel:91.5},{type:'SL',name:'Slider',pct:1.8,vel:83.3}],
  'Kyle Harrison': [{type:'FF',name:'Four-seam Fastball',pct:57.1,vel:94.6},{type:'SV',name:'Slurve',pct:26.4,vel:82.1},{type:'CH',name:'Changeup',pct:9.9,vel:86.1},{type:'SI',name:'Sinker',pct:4.3,vel:93.8},{type:'FC',name:'Cutter',pct:2.2,vel:86.8},{type:'UN',name:'UN',pct:0.1,vel:60.2}],
  'Kyle Hart': [{type:'ST',name:'Sweeper',pct:32.0,vel:81.5},{type:'SI',name:'Sinker',pct:22.5,vel:91.8},{type:'FF',name:'Four-seam Fastball',pct:13.8,vel:91.6},{type:'SL',name:'Slider',pct:12.1,vel:87.5},{type:'CH',name:'Changeup',pct:10.7,vel:83.2},{type:'FS',name:'Splitter',pct:8.9,vel:85.0}],
  'Kyle Hendricks': [{type:'CH',name:'Changeup',pct:38.4,vel:79.5},{type:'SI',name:'Sinker',pct:38.4,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:15.0,vel:86.5},{type:'CU',name:'Curveball',pct:8.2,vel:72.2},{type:'PO',name:'PO',pct:0.1,vel:84.6}],
  'Kyle Keller': [{type:'FF',name:'Four-seam Fastball',pct:46.4,vel:93.9},{type:'CU',name:'Curveball',pct:23.2,vel:77.2},{type:'FC',name:'Cutter',pct:20.3,vel:89.8},{type:'CH',name:'Changeup',pct:10.1,vel:87.0}],
  'Kyle Leahy': [{type:'FF',name:'Four-seam Fastball',pct:30.5,vel:95.0},{type:'SL',name:'Slider',pct:19.3,vel:90.9},{type:'CU',name:'Curveball',pct:17.2,vel:83.3},{type:'ST',name:'Sweeper',pct:14.0,vel:86.3},{type:'CH',name:'Changeup',pct:9.8,vel:89.7},{type:'SI',name:'Sinker',pct:9.2,vel:94.6}],
  'Kyle Nelson': [{type:'SL',name:'Slider',pct:55.0,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:38.3,vel:89.9},{type:'CU',name:'Curveball',pct:5.0,vel:80.6},{type:'FC',name:'Cutter',pct:1.7,vel:88.5}],
  'Kyle Nicolas': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:97.5},{type:'SL',name:'Slider',pct:27.5,vel:90.4},{type:'CU',name:'Curveball',pct:20.5,vel:83.8},{type:'SI',name:'Sinker',pct:0.7,vel:95.9},{type:'CH',name:'Changeup',pct:0.1,vel:92.6}],
  'Lake Bachar': [{type:'FF',name:'Four-seam Fastball',pct:36.4,vel:94.8},{type:'ST',name:'Sweeper',pct:27.0,vel:86.4},{type:'SL',name:'Slider',pct:24.0,vel:89.4},{type:'FS',name:'Splitter',pct:11.8,vel:83.8},{type:'CU',name:'Curveball',pct:0.8,vel:85.1}],
  'Lance McCullers Jr.': [{type:'ST',name:'Sweeper',pct:27.6,vel:82.8},{type:'SI',name:'Sinker',pct:25.3,vel:91.5},{type:'CH',name:'Changeup',pct:16.2,vel:86.6},{type:'KC',name:'Knuckle Curve',pct:15.4,vel:82.1},{type:'FC',name:'Cutter',pct:10.2,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:5.4,vel:92.0}],
  'Landen Roupp': [{type:'SI',name:'Sinker',pct:40.1,vel:92.9},{type:'CU',name:'Curveball',pct:33.9,vel:76.7},{type:'CH',name:'Changeup',pct:17.1,vel:86.7},{type:'FC',name:'Cutter',pct:8.1,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:0.8,vel:93.1}],
  'Landon Knack': [{type:'FF',name:'Four-seam Fastball',pct:48.6,vel:93.0},{type:'CH',name:'Changeup',pct:26.1,vel:84.5},{type:'KC',name:'Knuckle Curve',pct:13.1,vel:80.1},{type:'SL',name:'Slider',pct:12.2,vel:85.3}],
  'Lazaro Estrada': [{type:'FF',name:'Four-seam Fastball',pct:49.0,vel:93.1},{type:'SL',name:'Slider',pct:32.7,vel:86.0},{type:'CU',name:'Curveball',pct:9.2,vel:75.1},{type:'FS',name:'Splitter',pct:9.2,vel:84.7}],
  'Levi Wells': [{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:96.1},{type:'SL',name:'Slider',pct:23.4,vel:83.6},{type:'FC',name:'Cutter',pct:18.2,vel:91.8},{type:'CU',name:'Curveball',pct:16.9,vel:81.1},{type:'SI',name:'Sinker',pct:7.8,vel:93.9}],
  'Liam Hendriks': [{type:'FF',name:'Four-seam Fastball',pct:54.7,vel:94.7},{type:'SL',name:'Slider',pct:33.3,vel:86.0},{type:'CU',name:'Curveball',pct:11.6,vel:82.1},{type:'UN',name:'UN',pct:0.4,vel:77.2}],
  'Logan Allen': [{type:'FF',name:'Four-seam Fastball',pct:33.0,vel:91.2},{type:'ST',name:'Sweeper',pct:23.4,vel:78.1},{type:'CH',name:'Changeup',pct:18.3,vel:82.4},{type:'SI',name:'Sinker',pct:13.7,vel:89.0},{type:'FC',name:'Cutter',pct:11.5,vel:85.7},{type:'SL',name:'Slider',pct:0.1,vel:83.4}],
  'Logan Evans': [{type:'FC',name:'Cutter',pct:26.6,vel:87.8},{type:'ST',name:'Sweeper',pct:23.5,vel:84.1},{type:'SI',name:'Sinker',pct:16.9,vel:92.9},{type:'CH',name:'Changeup',pct:12.2,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:11.0,vel:92.8},{type:'CU',name:'Curveball',pct:9.8,vel:81.6}],
  'Logan Gilbert': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:95.4},{type:'SL',name:'Slider',pct:33.2,vel:87.3},{type:'FS',name:'Splitter',pct:19.6,vel:81.5},{type:'CU',name:'Curveball',pct:8.1,vel:81.7},{type:'FC',name:'Cutter',pct:1.8,vel:91.1},{type:'SI',name:'Sinker',pct:0.8,vel:94.9},{type:'CH',name:'Changeup',pct:0.7,vel:84.8}],
  'Logan Gillaspie': [{type:'FF',name:'Four-seam Fastball',pct:29.1,vel:95.0},{type:'CH',name:'Changeup',pct:17.7,vel:87.4},{type:'SL',name:'Slider',pct:16.0,vel:85.9},{type:'FC',name:'Cutter',pct:12.0,vel:91.8},{type:'CU',name:'Curveball',pct:10.3,vel:82.9},{type:'SI',name:'Sinker',pct:8.0,vel:94.9},{type:'ST',name:'Sweeper',pct:6.9,vel:83.8}],
  'Logan Henderson': [{type:'FF',name:'Four-seam Fastball',pct:49.0,vel:93.0},{type:'CH',name:'Changeup',pct:38.6,vel:82.1},{type:'FC',name:'Cutter',pct:9.1,vel:87.6},{type:'SL',name:'Slider',pct:3.2,vel:83.2}],
  'Logan VanWey': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:92.7},{type:'ST',name:'Sweeper',pct:27.3,vel:82.0},{type:'CH',name:'Changeup',pct:10.8,vel:86.2},{type:'SI',name:'Sinker',pct:7.2,vel:90.9},{type:'FC',name:'Cutter',pct:2.4,vel:84.4}],
  'Logan Webb': [{type:'SI',name:'Sinker',pct:34.2,vel:92.5},{type:'ST',name:'Sweeper',pct:26.0,vel:84.6},{type:'CH',name:'Changeup',pct:24.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:7.9,vel:92.7},{type:'FC',name:'Cutter',pct:7.8,vel:91.0}],
  'Lou Trivino': [{type:'FC',name:'Cutter',pct:24.3,vel:91.8},{type:'SI',name:'Sinker',pct:22.6,vel:95.2},{type:'ST',name:'Sweeper',pct:20.4,vel:80.4},{type:'CH',name:'Changeup',pct:16.0,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:15.6,vel:94.8},{type:'CU',name:'Curveball',pct:1.1,vel:78.7}],
  'Louis Varland': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:98.2},{type:'KC',name:'Knuckle Curve',pct:36.9,vel:88.0},{type:'SL',name:'Slider',pct:7.3,vel:91.8},{type:'CH',name:'Changeup',pct:6.9,vel:92.8},{type:'SI',name:'Sinker',pct:5.2,vel:96.9}],
  'Luarbert Arias': [{type:'SL',name:'Slider',pct:46.4,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:28.5,vel:94.0},{type:'FS',name:'Splitter',pct:15.9,vel:83.1},{type:'SI',name:'Sinker',pct:9.2,vel:93.4}],
  'Lucas Erceg': [{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:97.5},{type:'SL',name:'Slider',pct:29.4,vel:84.8},{type:'SI',name:'Sinker',pct:23.3,vel:97.4},{type:'CH',name:'Changeup',pct:16.5,vel:89.9}],
  'Lucas Giolito': [{type:'FF',name:'Four-seam Fastball',pct:48.4,vel:93.3},{type:'SL',name:'Slider',pct:25.6,vel:86.0},{type:'CH',name:'Changeup',pct:22.6,vel:81.7},{type:'CU',name:'Curveball',pct:3.5,vel:78.6},{type:'PO',name:'PO',pct:0.0,vel:94.1}],
  'Lucas Sims': [{type:'FF',name:'Four-seam Fastball',pct:45.3,vel:94.6},{type:'ST',name:'Sweeper',pct:37.3,vel:84.8},{type:'SL',name:'Slider',pct:8.1,vel:86.4},{type:'CU',name:'Curveball',pct:4.9,vel:82.2},{type:'SI',name:'Sinker',pct:2.5,vel:95.2},{type:'FC',name:'Cutter',pct:1.0,vel:90.9},{type:'FS',name:'Splitter',pct:1.0,vel:87.6}],
  'Luinder Avila': [{type:'FF',name:'Four-seam Fastball',pct:29.8,vel:95.9},{type:'CU',name:'Curveball',pct:26.4,vel:82.6},{type:'SI',name:'Sinker',pct:25.0,vel:95.7},{type:'SL',name:'Slider',pct:12.5,vel:86.0},{type:'CH',name:'Changeup',pct:6.2,vel:88.1}],
  'Luis Castillo': [{type:'FF',name:'Four-seam Fastball',pct:45.6,vel:95.0},{type:'SI',name:'Sinker',pct:21.7,vel:94.9},{type:'SL',name:'Slider',pct:21.5,vel:84.6},{type:'CH',name:'Changeup',pct:11.0,vel:87.2},{type:'FC',name:'Cutter',pct:0.2,vel:91.6}],
  'Luis Contreras': [{type:'FF',name:'Four-seam Fastball',pct:50.4,vel:91.1},{type:'SL',name:'Slider',pct:19.6,vel:85.5},{type:'CH',name:'Changeup',pct:16.5,vel:83.6},{type:'ST',name:'Sweeper',pct:12.1,vel:79.2},{type:'SI',name:'Sinker',pct:1.3,vel:90.6}],
  'Luis Curvelo': [{type:'SL',name:'Slider',pct:38.3,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:27.0,vel:96.1},{type:'SI',name:'Sinker',pct:24.5,vel:95.3},{type:'FS',name:'Splitter',pct:6.1,vel:82.9},{type:'CH',name:'Changeup',pct:4.1,vel:89.0}],
  'Luis F. Castillo': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:92.2},{type:'ST',name:'Sweeper',pct:25.0,vel:80.7},{type:'SI',name:'Sinker',pct:16.1,vel:91.1},{type:'CH',name:'Changeup',pct:13.1,vel:86.3}],
  'Luis Garcia': [{type:'FF',name:'Four-seam Fastball',pct:49.1,vel:91.0},{type:'FC',name:'Cutter',pct:25.5,vel:82.0},{type:'CU',name:'Curveball',pct:12.3,vel:73.0},{type:'ST',name:'Sweeper',pct:8.5,vel:75.5},{type:'CH',name:'Changeup',pct:4.7,vel:82.5}],
  'Luis García': [{type:'SI',name:'Sinker',pct:43.1,vel:96.5},{type:'ST',name:'Sweeper',pct:32.1,vel:82.7},{type:'FS',name:'Splitter',pct:23.2,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:1.6,vel:96.8}],
  'Luis Gil': [{type:'FF',name:'Four-seam Fastball',pct:50.3,vel:95.5},{type:'SL',name:'Slider',pct:25.3,vel:86.8},{type:'CH',name:'Changeup',pct:22.6,vel:90.9},{type:'SI',name:'Sinker',pct:1.7,vel:95.1}],
  'Luis Guerrero': [{type:'SL',name:'Slider',pct:41.7,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:96.6},{type:'ST',name:'Sweeper',pct:13.8,vel:82.1},{type:'CH',name:'Changeup',pct:5.2,vel:88.4},{type:'FC',name:'Cutter',pct:4.0,vel:90.9},{type:'PO',name:'PO',pct:0.3,vel:94.3}],
  'Luis Medina': [{type:'SI',name:'Sinker',pct:41.2,vel:97.8},{type:'FF',name:'Four-seam Fastball',pct:31.1,vel:97.7},{type:'SL',name:'Slider',pct:15.8,vel:88.6},{type:'CH',name:'Changeup',pct:10.7,vel:90.1},{type:'CU',name:'Curveball',pct:1.1,vel:79.2}],
  'Luis Mey': [{type:'SI',name:'Sinker',pct:72.2,vel:98.7},{type:'SL',name:'Slider',pct:26.1,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:1.7,vel:98.7}],
  'Luis Morales': [{type:'FF',name:'Four-seam Fastball',pct:48.4,vel:97.1},{type:'ST',name:'Sweeper',pct:25.8,vel:82.0},{type:'CH',name:'Changeup',pct:12.5,vel:89.8},{type:'SL',name:'Slider',pct:7.5,vel:85.8},{type:'SI',name:'Sinker',pct:5.8,vel:96.9}],
  'Luis Ortiz': [{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:96.4},{type:'SL',name:'Slider',pct:25.9,vel:85.5},{type:'SI',name:'Sinker',pct:19.5,vel:95.5},{type:'CH',name:'Changeup',pct:12.9,vel:89.4},{type:'FC',name:'Cutter',pct:12.3,vel:91.1}],
  'Luis Peralta': [{type:'FF',name:'Four-seam Fastball',pct:70.6,vel:94.6},{type:'CU',name:'Curveball',pct:27.1,vel:81.6},{type:'CH',name:'Changeup',pct:2.3,vel:86.7}],
  'Luis Severino': [{type:'FF',name:'Four-seam Fastball',pct:26.6,vel:96.2},{type:'ST',name:'Sweeper',pct:24.4,vel:84.5},{type:'SI',name:'Sinker',pct:20.4,vel:95.7},{type:'FC',name:'Cutter',pct:18.8,vel:93.4},{type:'CH',name:'Changeup',pct:5.9,vel:86.6},{type:'SL',name:'Slider',pct:3.9,vel:87.0}],
  'Luke Jackson': [{type:'SL',name:'Slider',pct:48.8,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:33.4,vel:94.2},{type:'CU',name:'Curveball',pct:16.6,vel:84.1},{type:'FC',name:'Cutter',pct:0.7,vel:90.5},{type:'SI',name:'Sinker',pct:0.4,vel:93.9},{type:'CH',name:'Changeup',pct:0.1,vel:86.7}],
  'Luke Little': [{type:'FF',name:'Four-seam Fastball',pct:57.9,vel:93.9},{type:'ST',name:'Sweeper',pct:41.1,vel:82.7},{type:'SI',name:'Sinker',pct:1.1,vel:96.7}],
  'Luke Weaver': [{type:'FF',name:'Four-seam Fastball',pct:58.3,vel:95.0},{type:'CH',name:'Changeup',pct:30.5,vel:88.0},{type:'FC',name:'Cutter',pct:10.0,vel:91.2},{type:'SL',name:'Slider',pct:1.3,vel:86.9}],
  'Luke Williams': [{type:'EP',name:'EP',pct:73.2,vel:59.4},{type:'FA',name:'FA',pct:26.8,vel:73.1}],
  'Lyon Richardson': [{type:'CH',name:'Changeup',pct:40.5,vel:86.6},{type:'SI',name:'Sinker',pct:29.1,vel:95.1},{type:'FF',name:'Four-seam Fastball',pct:20.5,vel:95.7},{type:'CU',name:'Curveball',pct:9.6,vel:79.2},{type:'SL',name:'Slider',pct:0.3,vel:83.1}],
  'MacKenzie Gore': [{type:'FF',name:'Four-seam Fastball',pct:48.1,vel:95.3},{type:'CU',name:'Curveball',pct:23.9,vel:81.6},{type:'SL',name:'Slider',pct:11.6,vel:86.6},{type:'CH',name:'Changeup',pct:10.5,vel:86.3},{type:'FC',name:'Cutter',pct:5.0,vel:90.3},{type:'SI',name:'Sinker',pct:0.8,vel:95.6}],
  'Manuel Rodríguez': [{type:'SL',name:'Slider',pct:49.7,vel:89.4},{type:'SI',name:'Sinker',pct:34.1,vel:97.2},{type:'FF',name:'Four-seam Fastball',pct:16.2,vel:96.9}],
  'Marc Church': [{type:'SL',name:'Slider',pct:49.2,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:48.3,vel:96.2},{type:'CH',name:'Changeup',pct:2.5,vel:91.3}],
  'Marco Gonzales': [{type:'FC',name:'Cutter',pct:34.9,vel:86.2},{type:'CH',name:'Changeup',pct:26.5,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:19.3,vel:91.0},{type:'CU',name:'Curveball',pct:16.9,vel:81.8},{type:'SI',name:'Sinker',pct:2.4,vel:91.2}],
  'Marcus Stroman': [{type:'SI',name:'Sinker',pct:36.5,vel:89.8},{type:'SV',name:'Slurve',pct:19.3,vel:82.1},{type:'FC',name:'Cutter',pct:17.8,vel:88.8},{type:'FS',name:'Splitter',pct:10.7,vel:82.3},{type:'SL',name:'Slider',pct:6.5,vel:84.5},{type:'CU',name:'Curveball',pct:5.0,vel:77.9},{type:'FF',name:'Four-seam Fastball',pct:4.3,vel:89.5}],
  'Mark Leiter Jr.': [{type:'SI',name:'Sinker',pct:36.5,vel:93.5},{type:'FS',name:'Splitter',pct:29.2,vel:85.6},{type:'CU',name:'Curveball',pct:24.2,vel:74.1},{type:'FC',name:'Cutter',pct:4.0,vel:90.6},{type:'FF',name:'Four-seam Fastball',pct:4.0,vel:92.5},{type:'SL',name:'Slider',pct:2.1,vel:83.2}],
  'Martín Pérez': [{type:'SI',name:'Sinker',pct:31.2,vel:89.7},{type:'CH',name:'Changeup',pct:29.0,vel:82.5},{type:'FC',name:'Cutter',pct:27.3,vel:86.2},{type:'CU',name:'Curveball',pct:8.4,vel:76.6},{type:'FF',name:'Four-seam Fastball',pct:4.2,vel:89.9}],
  'Mason Barnett': [{type:'FF',name:'Four-seam Fastball',pct:53.4,vel:94.3},{type:'ST',name:'Sweeper',pct:21.3,vel:84.8},{type:'CU',name:'Curveball',pct:15.1,vel:78.5},{type:'CH',name:'Changeup',pct:10.2,vel:85.4}],
  'Mason Black': [{type:'FF',name:'Four-seam Fastball',pct:43.2,vel:92.7},{type:'ST',name:'Sweeper',pct:31.1,vel:81.8},{type:'SI',name:'Sinker',pct:16.2,vel:92.5},{type:'FC',name:'Cutter',pct:6.8,vel:90.7},{type:'CH',name:'Changeup',pct:2.7,vel:86.8}],
  'Mason Englert': [{type:'CH',name:'Changeup',pct:34.6,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:19.6,vel:93.7},{type:'FC',name:'Cutter',pct:18.5,vel:87.4},{type:'SI',name:'Sinker',pct:17.2,vel:92.7},{type:'CU',name:'Curveball',pct:9.1,vel:76.4},{type:'SV',name:'Slurve',pct:0.5,vel:81.4},{type:'ST',name:'Sweeper',pct:0.3,vel:80.9}],
  'Mason Fluharty': [{type:'FC',name:'Cutter',pct:56.8,vel:90.4},{type:'ST',name:'Sweeper',pct:42.1,vel:82.0},{type:'CH',name:'Changeup',pct:1.0,vel:88.8},{type:'SI',name:'Sinker',pct:0.1,vel:91.6}],
  'Mason Miller': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:101.3},{type:'SL',name:'Slider',pct:46.5,vel:87.8},{type:'CH',name:'Changeup',pct:2.5,vel:93.4}],
  'Mason Molina': [{type:'FF',name:'Four-seam Fastball',pct:49.3,vel:93.0},{type:'CH',name:'Changeup',pct:26.9,vel:83.1},{type:'SL',name:'Slider',pct:16.4,vel:82.9},{type:'ST',name:'Sweeper',pct:6.0,vel:80.7},{type:'CU',name:'Curveball',pct:1.5,vel:75.3}],
  'Mason Montgomery': [{type:'FF',name:'Four-seam Fastball',pct:64.9,vel:98.7},{type:'SL',name:'Slider',pct:30.2,vel:89.7},{type:'CU',name:'Curveball',pct:4.3,vel:86.9},{type:'CH',name:'Changeup',pct:0.4,vel:92.7},{type:'SI',name:'Sinker',pct:0.2,vel:98.9}],
  'Mason Thompson': [{type:'SI',name:'Sinker',pct:37.6,vel:95.0},{type:'SL',name:'Slider',pct:31.4,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:22.4,vel:94.9},{type:'CU',name:'Curveball',pct:4.7,vel:82.1},{type:'CH',name:'Changeup',pct:3.9,vel:87.7}],
  'Matt Bowman': [{type:'SI',name:'Sinker',pct:40.7,vel:91.2},{type:'FC',name:'Cutter',pct:25.0,vel:88.6},{type:'ST',name:'Sweeper',pct:19.8,vel:82.6},{type:'FS',name:'Splitter',pct:11.0,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:3.5,vel:90.7}],
  'Matt Brash': [{type:'SL',name:'Slider',pct:61.1,vel:86.1},{type:'SI',name:'Sinker',pct:21.4,vel:96.4},{type:'CH',name:'Changeup',pct:12.8,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:4.1,vel:95.9},{type:'KC',name:'Knuckle Curve',pct:0.5,vel:83.8}],
  'Matt Festa': [{type:'ST',name:'Sweeper',pct:39.2,vel:82.8},{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:91.9},{type:'FC',name:'Cutter',pct:12.8,vel:90.5},{type:'SI',name:'Sinker',pct:8.7,vel:92.8},{type:'SL',name:'Slider',pct:0.5,vel:85.9}],
  'Matt Gage': [{type:'SL',name:'Slider',pct:51.9,vel:85.2},{type:'FF',name:'Four-seam Fastball',pct:27.7,vel:92.4},{type:'CH',name:'Changeup',pct:10.0,vel:85.3},{type:'SI',name:'Sinker',pct:7.7,vel:93.0},{type:'ST',name:'Sweeper',pct:2.7,vel:80.9}],
  'Matt Krook': [{type:'SI',name:'Sinker',pct:41.4,vel:89.4},{type:'FC',name:'Cutter',pct:23.2,vel:87.5},{type:'ST',name:'Sweeper',pct:20.2,vel:82.5},{type:'CH',name:'Changeup',pct:15.2,vel:84.8}],
  'Matt Pushard': [{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:94.6},{type:'SL',name:'Slider',pct:27.1,vel:87.8},{type:'CH',name:'Changeup',pct:12.9,vel:86.5},{type:'ST',name:'Sweeper',pct:12.9,vel:83.4},{type:'CU',name:'Curveball',pct:7.1,vel:82.7}],
  'Matt Sauer': [{type:'FC',name:'Cutter',pct:31.8,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:94.1},{type:'SL',name:'Slider',pct:18.8,vel:83.8},{type:'SI',name:'Sinker',pct:17.6,vel:94.3},{type:'FS',name:'Splitter',pct:9.0,vel:87.3},{type:'CU',name:'Curveball',pct:1.0,vel:82.2}],
  'Matt Strahm': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:92.1},{type:'SL',name:'Slider',pct:31.9,vel:82.3},{type:'SI',name:'Sinker',pct:15.8,vel:92.2},{type:'FC',name:'Cutter',pct:13.5,vel:87.7},{type:'CH',name:'Changeup',pct:1.9,vel:82.0}],
  'Matt Svanson': [{type:'SI',name:'Sinker',pct:47.4,vel:96.6},{type:'ST',name:'Sweeper',pct:34.5,vel:87.0},{type:'FC',name:'Cutter',pct:17.0,vel:92.0},{type:'FF',name:'Four-seam Fastball',pct:1.1,vel:96.5}],
  'Matt Waldron': [{type:'KN',name:'Knuckleball',pct:57.4,vel:80.0},{type:'FF',name:'Four-seam Fastball',pct:15.9,vel:91.9},{type:'SI',name:'Sinker',pct:14.9,vel:91.8},{type:'ST',name:'Sweeper',pct:6.7,vel:82.0},{type:'FC',name:'Cutter',pct:5.1,vel:89.6}],
  'Matthew Boyd': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:93.2},{type:'CH',name:'Changeup',pct:23.6,vel:78.7},{type:'SL',name:'Slider',pct:14.3,vel:82.2},{type:'CU',name:'Curveball',pct:11.3,vel:73.5},{type:'SI',name:'Sinker',pct:2.9,vel:91.6}],
  'Matthew Liberatore': [{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:94.0},{type:'SL',name:'Slider',pct:21.7,vel:86.3},{type:'CU',name:'Curveball',pct:14.8,vel:77.5},{type:'CH',name:'Changeup',pct:13.0,vel:88.4},{type:'SI',name:'Sinker',pct:11.5,vel:94.0},{type:'FC',name:'Cutter',pct:9.3,vel:90.2},{type:'FS',name:'Splitter',pct:0.2,vel:87.3},{type:'PO',name:'PO',pct:0.1,vel:86.6}],
  'Max Fried': [{type:'FC',name:'Cutter',pct:27.1,vel:93.4},{type:'SI',name:'Sinker',pct:18.2,vel:94.0},{type:'CU',name:'Curveball',pct:16.9,vel:75.1},{type:'FF',name:'Four-seam Fastball',pct:13.2,vel:95.6},{type:'CH',name:'Changeup',pct:11.6,vel:85.4},{type:'ST',name:'Sweeper',pct:11.4,vel:81.4},{type:'SL',name:'Slider',pct:1.6,vel:85.4}],
  'Max Kranick': [{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:95.6},{type:'SL',name:'Slider',pct:39.9,vel:89.9},{type:'CU',name:'Curveball',pct:11.9,vel:79.1},{type:'ST',name:'Sweeper',pct:7.8,vel:82.5}],
  'Max Lazar': [{type:'FF',name:'Four-seam Fastball',pct:55.3,vel:94.5},{type:'KC',name:'Knuckle Curve',pct:26.2,vel:81.1},{type:'FC',name:'Cutter',pct:15.3,vel:88.3},{type:'FS',name:'Splitter',pct:3.3,vel:86.8}],
  'Max Meyer': [{type:'SL',name:'Slider',pct:33.8,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:21.8,vel:94.9},{type:'CH',name:'Changeup',pct:16.4,vel:89.1},{type:'ST',name:'Sweeper',pct:14.2,vel:87.2},{type:'SI',name:'Sinker',pct:13.7,vel:94.2}],
  'Max Scherzer': [{type:'FF',name:'Four-seam Fastball',pct:48.2,vel:93.6},{type:'SL',name:'Slider',pct:22.9,vel:86.3},{type:'CH',name:'Changeup',pct:13.9,vel:84.9},{type:'CU',name:'Curveball',pct:12.2,vel:76.7},{type:'FC',name:'Cutter',pct:2.8,vel:88.4}],
  'McCade Brown': [{type:'FF',name:'Four-seam Fastball',pct:57.0,vel:94.3},{type:'SL',name:'Slider',pct:19.3,vel:85.3},{type:'KC',name:'Knuckle Curve',pct:17.9,vel:78.7},{type:'CH',name:'Changeup',pct:5.6,vel:87.6},{type:'PO',name:'PO',pct:0.2,vel:91.9}],
  'Merrill Kelly': [{type:'CH',name:'Changeup',pct:26.9,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:23.6,vel:91.8},{type:'FC',name:'Cutter',pct:20.1,vel:90.6},{type:'SI',name:'Sinker',pct:12.6,vel:92.3},{type:'CU',name:'Curveball',pct:10.0,vel:81.6},{type:'SL',name:'Slider',pct:6.8,vel:85.8},{type:'PO',name:'PO',pct:0.0,vel:90.8}],
  'Michael Darrell-Hicks': [{type:'SI',name:'Sinker',pct:39.7,vel:94.3},{type:'FC',name:'Cutter',pct:35.1,vel:87.2},{type:'ST',name:'Sweeper',pct:17.8,vel:83.2},{type:'FF',name:'Four-seam Fastball',pct:7.5,vel:94.7}],
  'Michael Fulmer': [{type:'FC',name:'Cutter',pct:40.9,vel:88.7},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:93.5},{type:'SI',name:'Sinker',pct:14.2,vel:92.3},{type:'CU',name:'Curveball',pct:13.4,vel:79.7},{type:'CH',name:'Changeup',pct:9.4,vel:88.8},{type:'ST',name:'Sweeper',pct:3.1,vel:83.3}],
  'Michael Kelly': [{type:'ST',name:'Sweeper',pct:50.5,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:27.8,vel:95.9},{type:'SL',name:'Slider',pct:15.3,vel:90.2},{type:'SI',name:'Sinker',pct:5.0,vel:95.2},{type:'CH',name:'Changeup',pct:1.4,vel:89.3}],
  'Michael King': [{type:'SI',name:'Sinker',pct:31.1,vel:92.7},{type:'FF',name:'Four-seam Fastball',pct:22.6,vel:93.7},{type:'CH',name:'Changeup',pct:22.5,vel:86.6},{type:'ST',name:'Sweeper',pct:18.7,vel:82.2},{type:'SL',name:'Slider',pct:5.1,vel:83.8}],
  'Michael Kopech': [{type:'FF',name:'Four-seam Fastball',pct:82.7,vel:97.5},{type:'FC',name:'Cutter',pct:16.5,vel:91.1},{type:'CH',name:'Changeup',pct:0.9,vel:92.5}],
  'Michael Lorenzen': [{type:'FF',name:'Four-seam Fastball',pct:21.4,vel:93.9},{type:'SI',name:'Sinker',pct:17.8,vel:93.0},{type:'CH',name:'Changeup',pct:17.6,vel:83.8},{type:'SL',name:'Slider',pct:11.8,vel:85.1},{type:'CU',name:'Curveball',pct:11.7,vel:82.1},{type:'FC',name:'Cutter',pct:11.1,vel:90.1},{type:'ST',name:'Sweeper',pct:8.6,vel:82.2}],
  'Michael McGreevy': [{type:'FF',name:'Four-seam Fastball',pct:25.6,vel:92.6},{type:'SI',name:'Sinker',pct:20.5,vel:91.4},{type:'ST',name:'Sweeper',pct:17.4,vel:83.4},{type:'CH',name:'Changeup',pct:12.5,vel:87.3},{type:'CU',name:'Curveball',pct:11.8,vel:79.1},{type:'FC',name:'Cutter',pct:10.4,vel:87.9},{type:'SL',name:'Slider',pct:1.7,vel:83.2}],
  'Michael Mercado': [{type:'FF',name:'Four-seam Fastball',pct:55.3,vel:97.0},{type:'FC',name:'Cutter',pct:24.7,vel:88.4},{type:'CU',name:'Curveball',pct:15.3,vel:83.7},{type:'FS',name:'Splitter',pct:4.7,vel:90.8}],
  'Michael Petersen': [{type:'FF',name:'Four-seam Fastball',pct:54.6,vel:97.3},{type:'FC',name:'Cutter',pct:28.1,vel:89.2},{type:'SL',name:'Slider',pct:8.8,vel:84.6},{type:'CH',name:'Changeup',pct:6.9,vel:87.6},{type:'SI',name:'Sinker',pct:1.7,vel:97.1}],
  'Michael Soroka': [{type:'FF',name:'Four-seam Fastball',pct:42.7,vel:93.8},{type:'SV',name:'Slurve',pct:34.4,vel:80.6},{type:'SI',name:'Sinker',pct:10.6,vel:93.5},{type:'CH',name:'Changeup',pct:10.2,vel:84.8},{type:'FC',name:'Cutter',pct:2.0,vel:89.3},{type:'PO',name:'PO',pct:0.1,vel:87.5}],
  'Michael Tonkin': [{type:'FF',name:'Four-seam Fastball',pct:56.9,vel:92.4},{type:'SL',name:'Slider',pct:25.9,vel:83.9},{type:'ST',name:'Sweeper',pct:9.1,vel:80.1},{type:'SI',name:'Sinker',pct:8.1,vel:91.8}],
  'Michael Wacha': [{type:'FF',name:'Four-seam Fastball',pct:27.3,vel:93.0},{type:'CH',name:'Changeup',pct:25.0,vel:79.9},{type:'FC',name:'Cutter',pct:15.3,vel:88.3},{type:'SI',name:'Sinker',pct:13.2,vel:93.1},{type:'SL',name:'Slider',pct:11.7,vel:84.8},{type:'CU',name:'Curveball',pct:7.5,vel:75.1}],
  'Michel Otañez': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:97.4},{type:'SL',name:'Slider',pct:35.5,vel:85.2},{type:'SI',name:'Sinker',pct:22.3,vel:96.6}],
  'Mick Abel': [{type:'FF',name:'Four-seam Fastball',pct:42.2,vel:95.9},{type:'CU',name:'Curveball',pct:18.0,vel:82.1},{type:'SL',name:'Slider',pct:12.6,vel:87.4},{type:'CH',name:'Changeup',pct:11.6,vel:88.3},{type:'SI',name:'Sinker',pct:10.3,vel:95.2},{type:'ST',name:'Sweeper',pct:5.2,vel:83.8}],
  'Miguel Castro': [{type:'FF',name:'Four-seam Fastball',pct:47.6,vel:95.1},{type:'SL',name:'Slider',pct:28.6,vel:83.7},{type:'SI',name:'Sinker',pct:12.4,vel:95.3},{type:'CH',name:'Changeup',pct:11.4,vel:88.6}],
  'Miguel Rojas': [{type:'EP',name:'EP',pct:86.2,vel:47.2},{type:'FA',name:'FA',pct:13.8,vel:62.8}],
  'Mike Burrows': [{type:'FF',name:'Four-seam Fastball',pct:36.0,vel:95.4},{type:'CH',name:'Changeup',pct:24.3,vel:87.2},{type:'SL',name:'Slider',pct:19.6,vel:87.9},{type:'CU',name:'Curveball',pct:11.7,vel:78.8},{type:'SI',name:'Sinker',pct:8.4,vel:95.1}],
  'Mike Clevinger': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:94.7},{type:'FC',name:'Cutter',pct:22.4,vel:89.3},{type:'CH',name:'Changeup',pct:19.4,vel:88.1},{type:'ST',name:'Sweeper',pct:13.4,vel:79.2},{type:'SI',name:'Sinker',pct:2.5,vel:91.1},{type:'CU',name:'Curveball',pct:1.5,vel:76.9}],
  'Mike Vasil': [{type:'SI',name:'Sinker',pct:39.9,vel:94.4},{type:'ST',name:'Sweeper',pct:16.1,vel:81.7},{type:'FF',name:'Four-seam Fastball',pct:14.0,vel:94.6},{type:'CU',name:'Curveball',pct:12.3,vel:81.7},{type:'CH',name:'Changeup',pct:12.2,vel:86.6},{type:'FC',name:'Cutter',pct:5.5,vel:86.1}],
  'Miles Mikolas': [{type:'FF',name:'Four-seam Fastball',pct:26.9,vel:92.9},{type:'SL',name:'Slider',pct:22.8,vel:87.6},{type:'CU',name:'Curveball',pct:17.2,vel:76.1},{type:'SI',name:'Sinker',pct:17.2,vel:92.3},{type:'CH',name:'Changeup',pct:11.8,vel:85.8},{type:'ST',name:'Sweeper',pct:3.7,vel:80.7},{type:'CS',name:'CS',pct:0.2,vel:69.2},{type:'PO',name:'PO',pct:0.1,vel:88.7}],
  'Mitch Farris': [{type:'FF',name:'Four-seam Fastball',pct:49.8,vel:90.6},{type:'CH',name:'Changeup',pct:27.6,vel:78.0},{type:'SL',name:'Slider',pct:21.4,vel:81.5},{type:'FC',name:'Cutter',pct:1.2,vel:89.1}],
  'Mitch Keller': [{type:'FF',name:'Four-seam Fastball',pct:34.3,vel:94.0},{type:'ST',name:'Sweeper',pct:19.5,vel:82.3},{type:'SI',name:'Sinker',pct:18.6,vel:92.8},{type:'SL',name:'Slider',pct:12.3,vel:87.0},{type:'CH',name:'Changeup',pct:7.8,vel:89.1},{type:'CU',name:'Curveball',pct:7.4,vel:77.5},{type:'FC',name:'Cutter',pct:0.1,vel:92.4}],
  'Mitch Spence': [{type:'FC',name:'Cutter',pct:45.2,vel:91.1},{type:'SL',name:'Slider',pct:26.7,vel:84.5},{type:'CU',name:'Curveball',pct:17.6,vel:81.8},{type:'SI',name:'Sinker',pct:9.4,vel:92.6},{type:'CH',name:'Changeup',pct:1.0,vel:87.8},{type:'PO',name:'PO',pct:0.1,vel:85.4}],
  'Mitchell Parker': [{type:'FF',name:'Four-seam Fastball',pct:54.2,vel:92.9},{type:'CU',name:'Curveball',pct:21.7,vel:81.0},{type:'SL',name:'Slider',pct:13.9,vel:84.6},{type:'FS',name:'Splitter',pct:10.1,vel:85.4}],
  'Nabil Crismatt': [{type:'CH',name:'Changeup',pct:38.0,vel:81.4},{type:'SI',name:'Sinker',pct:25.3,vel:89.2},{type:'CU',name:'Curveball',pct:15.5,vel:73.8},{type:'FF',name:'Four-seam Fastball',pct:15.5,vel:89.1},{type:'SL',name:'Slider',pct:5.6,vel:81.8}],
  'Nate Pearson': [{type:'FF',name:'Four-seam Fastball',pct:52.1,vel:97.5},{type:'SL',name:'Slider',pct:40.7,vel:89.4},{type:'CU',name:'Curveball',pct:4.6,vel:82.8},{type:'SI',name:'Sinker',pct:2.7,vel:97.3}],
  'Nathan Eovaldi': [{type:'FS',name:'Splitter',pct:32.3,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:20.9,vel:94.2},{type:'FC',name:'Cutter',pct:20.2,vel:90.5},{type:'CU',name:'Curveball',pct:19.6,vel:76.0},{type:'SI',name:'Sinker',pct:5.7,vel:93.5},{type:'SL',name:'Slider',pct:1.3,vel:85.9}],
  'Nestor Cortes': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:90.1},{type:'FC',name:'Cutter',pct:34.6,vel:86.7},{type:'CH',name:'Changeup',pct:13.9,vel:82.2},{type:'ST',name:'Sweeper',pct:13.4,vel:78.1},{type:'SI',name:'Sinker',pct:0.2,vel:90.7}],
  'Nic Enright': [{type:'FF',name:'Four-seam Fastball',pct:66.4,vel:93.2},{type:'SL',name:'Slider',pct:25.4,vel:85.0},{type:'CU',name:'Curveball',pct:8.1,vel:82.7},{type:'CH',name:'Changeup',pct:0.2,vel:85.6}],
  'Nick Anderson': [{type:'FF',name:'Four-seam Fastball',pct:51.5,vel:95.1},{type:'CU',name:'Curveball',pct:27.4,vel:83.5},{type:'CH',name:'Changeup',pct:20.1,vel:88.5},{type:'SI',name:'Sinker',pct:1.0,vel:95.2}],
  'Nick Burdi': [{type:'SI',name:'Sinker',pct:43.4,vel:93.6},{type:'SL',name:'Slider',pct:31.3,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:22.9,vel:94.8},{type:'CH',name:'Changeup',pct:2.4,vel:86.8}],
  'Nick Dombkowski': [{type:'FF',name:'Four-seam Fastball',pct:49.3,vel:91.0},{type:'CH',name:'Changeup',pct:29.3,vel:85.9},{type:'FC',name:'Cutter',pct:14.7,vel:87.5},{type:'SL',name:'Slider',pct:6.7,vel:82.7}],
  'Nick Hernandez': [{type:'SL',name:'Slider',pct:45.7,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:91.3},{type:'FS',name:'Splitter',pct:11.3,vel:81.5}],
  'Nick Lodolo': [{type:'CU',name:'Curveball',pct:28.7,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:27.1,vel:93.9},{type:'SI',name:'Sinker',pct:22.8,vel:93.7},{type:'CH',name:'Changeup',pct:21.3,vel:87.9}],
  'Nick Martinez': [{type:'CH',name:'Changeup',pct:21.2,vel:78.5},{type:'FC',name:'Cutter',pct:20.8,vel:89.1},{type:'FF',name:'Four-seam Fastball',pct:20.0,vel:92.6},{type:'SI',name:'Sinker',pct:17.9,vel:92.5},{type:'CU',name:'Curveball',pct:10.4,vel:79.8},{type:'SL',name:'Slider',pct:9.8,vel:85.0},{type:'PO',name:'PO',pct:0.0,vel:91.0}],
  'Nick Mears': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:95.3},{type:'SL',name:'Slider',pct:39.6,vel:86.4},{type:'CU',name:'Curveball',pct:5.1,vel:82.1},{type:'CH',name:'Changeup',pct:2.7,vel:84.3},{type:'SI',name:'Sinker',pct:1.6,vel:93.5}],
  'Nick Pivetta': [{type:'FF',name:'Four-seam Fastball',pct:48.2,vel:93.9},{type:'CU',name:'Curveball',pct:21.6,vel:79.0},{type:'ST',name:'Sweeper',pct:17.9,vel:81.9},{type:'FC',name:'Cutter',pct:8.9,vel:90.5},{type:'SI',name:'Sinker',pct:2.6,vel:93.6},{type:'SL',name:'Slider',pct:0.6,vel:86.8},{type:'FS',name:'Splitter',pct:0.2,vel:87.3}],
  'Nick Raquet': [{type:'ST',name:'Sweeper',pct:47.9,vel:82.4},{type:'SI',name:'Sinker',pct:22.5,vel:91.2},{type:'SL',name:'Slider',pct:18.3,vel:84.2},{type:'CH',name:'Changeup',pct:4.2,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:4.2,vel:91.2},{type:'FC',name:'Cutter',pct:2.8,vel:87.8}],
  'Nick Sandlin': [{type:'SL',name:'Slider',pct:49.1,vel:78.2},{type:'FF',name:'Four-seam Fastball',pct:20.0,vel:91.3},{type:'FS',name:'Splitter',pct:20.0,vel:84.2},{type:'SI',name:'Sinker',pct:10.6,vel:91.7},{type:'PO',name:'PO',pct:0.3,vel:90.1}],
  'Noah Cameron': [{type:'FF',name:'Four-seam Fastball',pct:27.1,vel:92.2},{type:'FC',name:'Cutter',pct:22.3,vel:88.1},{type:'CH',name:'Changeup',pct:18.9,vel:81.3},{type:'CU',name:'Curveball',pct:18.9,vel:80.9},{type:'SL',name:'Slider',pct:12.8,vel:84.2}],
  'Noah Davis': [{type:'SI',name:'Sinker',pct:30.9,vel:94.3},{type:'ST',name:'Sweeper',pct:26.9,vel:79.8},{type:'FC',name:'Cutter',pct:19.1,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:14.2,vel:94.0},{type:'SC',name:'SC',pct:4.6,vel:84.2},{type:'CU',name:'Curveball',pct:2.8,vel:76.2},{type:'SL',name:'Slider',pct:1.5,vel:82.8}],
  'Noah Murdock': [{type:'SI',name:'Sinker',pct:55.8,vel:94.5},{type:'FC',name:'Cutter',pct:23.3,vel:89.4},{type:'ST',name:'Sweeper',pct:19.5,vel:82.3},{type:'FS',name:'Splitter',pct:1.2,vel:86.0},{type:'PO',name:'PO',pct:0.2,vel:89.3}],
  'Noah Schultz': [{type:'SI',name:'Sinker',pct:29.3,vel:96.5},{type:'FF',name:'Four-seam Fastball',pct:26.8,vel:97.2},{type:'FC',name:'Cutter',pct:19.5,vel:90.6},{type:'ST',name:'Sweeper',pct:19.5,vel:82.9},{type:'CH',name:'Changeup',pct:2.4,vel:91.8},{type:'SL',name:'Slider',pct:2.4,vel:85.8}],
  'Nolan McLean': [{type:'SI',name:'Sinker',pct:29.3,vel:94.9},{type:'ST',name:'Sweeper',pct:22.4,vel:85.2},{type:'FF',name:'Four-seam Fastball',pct:15.3,vel:96.1},{type:'CU',name:'Curveball',pct:14.2,vel:80.4},{type:'FC',name:'Cutter',pct:9.5,vel:91.0},{type:'CH',name:'Changeup',pct:9.1,vel:87.2},{type:'UN',name:'UN',pct:0.1,vel:80.6}],
  'Omar Cruz': [{type:'FF',name:'Four-seam Fastball',pct:61.7,vel:92.7},{type:'CH',name:'Changeup',pct:25.9,vel:82.2},{type:'CU',name:'Curveball',pct:11.1,vel:76.6},{type:'SL',name:'Slider',pct:1.2,vel:86.7}],
  'Orion Kerkering': [{type:'ST',name:'Sweeper',pct:47.7,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:32.8,vel:97.5},{type:'SI',name:'Sinker',pct:19.3,vel:96.3},{type:'FS',name:'Splitter',pct:0.2,vel:91.7}],
  'Orlando Ribalta': [{type:'FF',name:'Four-seam Fastball',pct:36.1,vel:96.4},{type:'SL',name:'Slider',pct:24.5,vel:87.3},{type:'CH',name:'Changeup',pct:20.1,vel:85.5},{type:'SI',name:'Sinker',pct:19.3,vel:95.7}],
  'Osvaldo Bido': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:94.5},{type:'SL',name:'Slider',pct:30.4,vel:85.4},{type:'SI',name:'Sinker',pct:15.7,vel:94.7},{type:'CH',name:'Changeup',pct:10.0,vel:88.8},{type:'FC',name:'Cutter',pct:6.3,vel:86.7},{type:'ST',name:'Sweeper',pct:0.6,vel:84.4},{type:'PO',name:'PO',pct:0.1,vel:92.8}],
  'Owen White': [{type:'FF',name:'Four-seam Fastball',pct:31.9,vel:92.3},{type:'ST',name:'Sweeper',pct:27.7,vel:81.7},{type:'FC',name:'Cutter',pct:21.8,vel:88.6},{type:'CH',name:'Changeup',pct:8.4,vel:86.7},{type:'SI',name:'Sinker',pct:5.9,vel:92.0},{type:'CU',name:'Curveball',pct:4.2,vel:77.3}],
  'PJ Poulin': [{type:'FF',name:'Four-seam Fastball',pct:37.9,vel:90.7},{type:'ST',name:'Sweeper',pct:28.2,vel:78.9},{type:'CH',name:'Changeup',pct:22.0,vel:80.4},{type:'SI',name:'Sinker',pct:11.9,vel:89.4}],
  'Pablo López': [{type:'FF',name:'Four-seam Fastball',pct:41.1,vel:94.5},{type:'CH',name:'Changeup',pct:21.2,vel:87.4},{type:'ST',name:'Sweeper',pct:21.2,vel:84.9},{type:'CU',name:'Curveball',pct:9.8,vel:82.7},{type:'SI',name:'Sinker',pct:6.5,vel:93.7},{type:'PO',name:'PO',pct:0.1,vel:94.5}],
  'Parker Messick': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:92.8},{type:'CH',name:'Changeup',pct:22.3,vel:84.5},{type:'SL',name:'Slider',pct:13.8,vel:86.2},{type:'SI',name:'Sinker',pct:13.3,vel:91.6},{type:'CU',name:'Curveball',pct:12.5,vel:77.3},{type:'FC',name:'Cutter',pct:2.9,vel:89.4}],
  'Patrick Corbin': [{type:'SL',name:'Slider',pct:33.4,vel:80.3},{type:'SI',name:'Sinker',pct:28.7,vel:91.6},{type:'FC',name:'Cutter',pct:25.3,vel:87.4},{type:'CH',name:'Changeup',pct:9.4,vel:81.5},{type:'FF',name:'Four-seam Fastball',pct:2.6,vel:91.2},{type:'CU',name:'Curveball',pct:0.6,vel:68.3}],
  'Patrick Monteverde': [{type:'FC',name:'Cutter',pct:44.8,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:14.9,vel:90.3},{type:'CU',name:'Curveball',pct:13.8,vel:76.7},{type:'SI',name:'Sinker',pct:12.6,vel:89.8},{type:'CH',name:'Changeup',pct:10.3,vel:82.7},{type:'SL',name:'Slider',pct:3.4,vel:80.9}],
  'Paul Blackburn': [{type:'SI',name:'Sinker',pct:31.5,vel:92.9},{type:'FC',name:'Cutter',pct:28.6,vel:90.2},{type:'ST',name:'Sweeper',pct:14.3,vel:81.8},{type:'CU',name:'Curveball',pct:11.2,vel:80.5},{type:'CH',name:'Changeup',pct:9.5,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:3.1,vel:92.5},{type:'SL',name:'Slider',pct:1.7,vel:84.4}],
  'Paul Gervase': [{type:'FF',name:'Four-seam Fastball',pct:57.2,vel:93.8},{type:'SL',name:'Slider',pct:29.6,vel:84.1},{type:'FC',name:'Cutter',pct:12.5,vel:89.9},{type:'CH',name:'Changeup',pct:0.7,vel:85.9}],
  'Paul Sewald': [{type:'FF',name:'Four-seam Fastball',pct:57.5,vel:90.7},{type:'ST',name:'Sweeper',pct:42.5,vel:82.4}],
  'Paul Skenes': [{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:98.1},{type:'ST',name:'Sweeper',pct:15.6,vel:84.3},{type:'FS',name:'Splitter',pct:12.9,vel:93.7},{type:'CH',name:'Changeup',pct:11.6,vel:88.8},{type:'SI',name:'Sinker',pct:11.0,vel:97.4},{type:'SL',name:'Slider',pct:5.3,vel:85.2},{type:'CU',name:'Curveball',pct:4.8,vel:83.6}],
  'Paxton Schultz': [{type:'FF',name:'Four-seam Fastball',pct:34.2,vel:93.8},{type:'FC',name:'Cutter',pct:33.1,vel:89.0},{type:'CH',name:'Changeup',pct:20.0,vel:86.3},{type:'SL',name:'Slider',pct:12.7,vel:85.4}],
  'Payton Tolle': [{type:'FF',name:'Four-seam Fastball',pct:60.6,vel:96.7},{type:'FC',name:'Cutter',pct:15.8,vel:89.3},{type:'SL',name:'Slider',pct:7.9,vel:88.6},{type:'CU',name:'Curveball',pct:7.1,vel:82.7},{type:'CH',name:'Changeup',pct:6.2,vel:89.9},{type:'SI',name:'Sinker',pct:2.4,vel:96.1}],
  'Penn Murfee': [{type:'ST',name:'Sweeper',pct:49.1,vel:78.5},{type:'FF',name:'Four-seam Fastball',pct:35.3,vel:88.1},{type:'SI',name:'Sinker',pct:14.7,vel:88.2},{type:'CH',name:'Changeup',pct:0.9,vel:85.1}],
  'Pete Fairbanks': [{type:'FF',name:'Four-seam Fastball',pct:50.1,vel:97.2},{type:'SL',name:'Slider',pct:37.9,vel:85.1},{type:'FC',name:'Cutter',pct:7.6,vel:89.9},{type:'CH',name:'Changeup',pct:4.4,vel:94.1}],
  'Peter Lambert': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:94.9},{type:'SL',name:'Slider',pct:35.2,vel:86.3},{type:'CH',name:'Changeup',pct:13.0,vel:87.8},{type:'SV',name:'Slurve',pct:11.1,vel:80.3},{type:'SI',name:'Sinker',pct:5.6,vel:94.4}],
  'Peyton Gray': [{type:'FF',name:'Four-seam Fastball',pct:43.6,vel:93.1},{type:'CH',name:'Changeup',pct:41.8,vel:83.1},{type:'FC',name:'Cutter',pct:10.9,vel:86.3},{type:'SL',name:'Slider',pct:3.6,vel:86.3}],
  'Peyton Pallette': [{type:'FF',name:'Four-seam Fastball',pct:55.8,vel:95.5},{type:'CU',name:'Curveball',pct:24.8,vel:81.8},{type:'SL',name:'Slider',pct:19.4,vel:85.3}],
  'Phil Maton': [{type:'FC',name:'Cutter',pct:37.6,vel:90.4},{type:'CU',name:'Curveball',pct:37.1,vel:75.9},{type:'ST',name:'Sweeper',pct:13.3,vel:83.5},{type:'SI',name:'Sinker',pct:11.4,vel:89.6},{type:'CH',name:'Changeup',pct:0.6,vel:83.4}],
  'Philip Abner': [{type:'FF',name:'Four-seam Fastball',pct:70.4,vel:90.3},{type:'SL',name:'Slider',pct:20.0,vel:79.8},{type:'CH',name:'Changeup',pct:6.1,vel:80.4},{type:'FS',name:'Splitter',pct:3.5,vel:83.3}],
  'Pierce Johnson': [{type:'CU',name:'Curveball',pct:71.5,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:24.0,vel:95.2},{type:'FC',name:'Cutter',pct:4.5,vel:92.4}],
  'Pierson Ohl': [{type:'FF',name:'Four-seam Fastball',pct:43.8,vel:91.9},{type:'CH',name:'Changeup',pct:37.7,vel:81.1},{type:'FC',name:'Cutter',pct:11.8,vel:85.3},{type:'CU',name:'Curveball',pct:5.9,vel:77.9},{type:'KN',name:'Knuckleball',pct:0.9,vel:79.7}],
  'Porter Hodge': [{type:'FF',name:'Four-seam Fastball',pct:50.4,vel:96.0},{type:'ST',name:'Sweeper',pct:31.9,vel:84.0},{type:'SL',name:'Slider',pct:17.2,vel:86.3},{type:'FS',name:'Splitter',pct:0.5,vel:90.8}],
  'Quinn Mathews': [{type:'FF',name:'Four-seam Fastball',pct:36.9,vel:93.7},{type:'SL',name:'Slider',pct:23.1,vel:85.1},{type:'CH',name:'Changeup',pct:21.5,vel:83.0},{type:'SI',name:'Sinker',pct:13.8,vel:93.7},{type:'CU',name:'Curveball',pct:4.6,vel:76.5}],
  'Quinn Priester': [{type:'SI',name:'Sinker',pct:41.4,vel:93.9},{type:'SL',name:'Slider',pct:26.8,vel:86.1},{type:'FC',name:'Cutter',pct:21.2,vel:92.3},{type:'CU',name:'Curveball',pct:9.1,vel:81.0},{type:'CH',name:'Changeup',pct:1.4,vel:88.4}],
  'Rafael Montero': [{type:'FS',name:'Splitter',pct:47.2,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:40.4,vel:95.2},{type:'SL',name:'Slider',pct:7.5,vel:85.1},{type:'SI',name:'Sinker',pct:4.9,vel:95.0}],
  'Raisel Iglesias': [{type:'FF',name:'Four-seam Fastball',pct:41.6,vel:94.8},{type:'CH',name:'Changeup',pct:28.3,vel:88.7},{type:'SI',name:'Sinker',pct:20.6,vel:94.6},{type:'SL',name:'Slider',pct:9.4,vel:83.5}],
  'Randy Dobnak': [{type:'SI',name:'Sinker',pct:33.8,vel:92.2},{type:'SL',name:'Slider',pct:30.9,vel:82.4},{type:'CH',name:'Changeup',pct:23.0,vel:85.2},{type:'FF',name:'Four-seam Fastball',pct:12.2,vel:92.8}],
  'Randy Rodríguez': [{type:'FF',name:'Four-seam Fastball',pct:55.4,vel:97.4},{type:'SL',name:'Slider',pct:44.6,vel:86.3}],
  'Randy Vásquez': [{type:'FC',name:'Cutter',pct:24.4,vel:90.1},{type:'FF',name:'Four-seam Fastball',pct:23.0,vel:93.9},{type:'SI',name:'Sinker',pct:18.2,vel:93.4},{type:'CU',name:'Curveball',pct:12.4,vel:81.6},{type:'ST',name:'Sweeper',pct:11.6,vel:82.3},{type:'CH',name:'Changeup',pct:7.8,vel:87.3},{type:'SL',name:'Slider',pct:2.6,vel:85.7}],
  'Ranger Suarez': [{type:'SI',name:'Sinker',pct:28.6,vel:90.1},{type:'CH',name:'Changeup',pct:19.2,vel:79.7},{type:'FC',name:'Cutter',pct:18.1,vel:86.5},{type:'CU',name:'Curveball',pct:15.6,vel:74.0},{type:'FF',name:'Four-seam Fastball',pct:14.5,vel:91.3},{type:'SL',name:'Slider',pct:4.1,vel:79.7}],
  'Reed Garrett': [{type:'FC',name:'Cutter',pct:28.2,vel:92.5},{type:'SI',name:'Sinker',pct:24.3,vel:97.0},{type:'FS',name:'Splitter',pct:22.4,vel:89.1},{type:'ST',name:'Sweeper',pct:21.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:4.0,vel:97.9}],
  'Reese Olson': [{type:'SI',name:'Sinker',pct:27.2,vel:94.4},{type:'CH',name:'Changeup',pct:25.9,vel:87.7},{type:'SL',name:'Slider',pct:21.6,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:19.4,vel:94.3},{type:'CU',name:'Curveball',pct:5.5,vel:79.7},{type:'ST',name:'Sweeper',pct:0.4,vel:82.5}],
  'Reid Detmers': [{type:'FF',name:'Four-seam Fastball',pct:44.7,vel:95.3},{type:'SL',name:'Slider',pct:31.8,vel:87.7},{type:'CU',name:'Curveball',pct:17.7,vel:73.5},{type:'CH',name:'Changeup',pct:3.1,vel:82.4},{type:'SI',name:'Sinker',pct:2.7,vel:94.7},{type:'PO',name:'PO',pct:0.1,vel:83.5}],
  'Reynaldo López': [{type:'FF',name:'Four-seam Fastball',pct:51.3,vel:93.4},{type:'SL',name:'Slider',pct:31.1,vel:82.6},{type:'CU',name:'Curveball',pct:12.3,vel:73.4},{type:'CH',name:'Changeup',pct:5.4,vel:83.1}],
  'Rhett Lowder': [{type:'SI',name:'Sinker',pct:31.0,vel:92.5},{type:'FF',name:'Four-seam Fastball',pct:25.3,vel:93.1},{type:'SL',name:'Slider',pct:22.8,vel:85.1},{type:'CH',name:'Changeup',pct:20.8,vel:86.1}],
  'Rich Hill': [{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:88.5},{type:'CU',name:'Curveball',pct:34.5,vel:72.4},{type:'FC',name:'Cutter',pct:15.8,vel:83.7},{type:'SI',name:'Sinker',pct:6.4,vel:87.2},{type:'ST',name:'Sweeper',pct:5.8,vel:70.9},{type:'CH',name:'Changeup',pct:0.6,vel:80.5}],
  'Richard Fitts': [{type:'FF',name:'Four-seam Fastball',pct:38.9,vel:95.9},{type:'SL',name:'Slider',pct:27.9,vel:87.8},{type:'CU',name:'Curveball',pct:11.3,vel:82.9},{type:'ST',name:'Sweeper',pct:10.3,vel:85.0},{type:'SI',name:'Sinker',pct:8.5,vel:94.9},{type:'CH',name:'Changeup',pct:3.1,vel:89.3}],
  'Richard Lovelady': [{type:'ST',name:'Sweeper',pct:41.6,vel:82.9},{type:'SI',name:'Sinker',pct:34.8,vel:91.4},{type:'FF',name:'Four-seam Fastball',pct:14.8,vel:91.6},{type:'SL',name:'Slider',pct:8.8,vel:86.4}],
  'Rico Garcia': [{type:'FF',name:'Four-seam Fastball',pct:39.3,vel:95.5},{type:'SL',name:'Slider',pct:21.1,vel:87.3},{type:'CH',name:'Changeup',pct:20.8,vel:86.5},{type:'CU',name:'Curveball',pct:18.9,vel:85.3}],
  'Riley O\'Brien': [{type:'SI',name:'Sinker',pct:49.6,vel:98.0},{type:'SL',name:'Slider',pct:28.3,vel:90.2},{type:'ST',name:'Sweeper',pct:21.9,vel:83.3},{type:'CH',name:'Changeup',pct:0.2,vel:90.4}],
  'Roansy Contreras': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:95.2},{type:'SL',name:'Slider',pct:18.8,vel:84.2},{type:'CU',name:'Curveball',pct:16.8,vel:79.0},{type:'CH',name:'Changeup',pct:11.2,vel:88.2},{type:'SI',name:'Sinker',pct:11.2,vel:95.4}],
  'Rob Zastryzny': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:91.9},{type:'FC',name:'Cutter',pct:33.1,vel:86.3},{type:'ST',name:'Sweeper',pct:14.4,vel:80.6},{type:'FS',name:'Splitter',pct:5.2,vel:83.5},{type:'CH',name:'Changeup',pct:2.9,vel:81.6}],
  'Robbie Ray': [{type:'FF',name:'Four-seam Fastball',pct:51.5,vel:93.6},{type:'SL',name:'Slider',pct:23.9,vel:87.4},{type:'CH',name:'Changeup',pct:12.8,vel:84.9},{type:'KC',name:'Knuckle Curve',pct:11.3,vel:81.0},{type:'ST',name:'Sweeper',pct:0.3,vel:80.0},{type:'SI',name:'Sinker',pct:0.1,vel:93.8}],
  'Robby Snelling': [{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:93.7},{type:'CU',name:'Curveball',pct:35.9,vel:81.8},{type:'CH',name:'Changeup',pct:10.9,vel:89.5},{type:'FC',name:'Cutter',pct:7.8,vel:92.6},{type:'SL',name:'Slider',pct:7.8,vel:84.3}],
  'Robert Garcia': [{type:'FF',name:'Four-seam Fastball',pct:44.7,vel:94.4},{type:'CH',name:'Changeup',pct:29.1,vel:88.9},{type:'SL',name:'Slider',pct:26.2,vel:86.6}],
  'Robert Gasser': [{type:'ST',name:'Sweeper',pct:33.2,vel:82.4},{type:'SI',name:'Sinker',pct:23.2,vel:92.9},{type:'FF',name:'Four-seam Fastball',pct:21.6,vel:93.5},{type:'CH',name:'Changeup',pct:11.6,vel:88.5},{type:'FC',name:'Cutter',pct:10.4,vel:88.5}],
  'Robert Stephenson': [{type:'FC',name:'Cutter',pct:68.7,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:15.6,vel:96.4},{type:'FS',name:'Splitter',pct:8.2,vel:88.1},{type:'SL',name:'Slider',pct:7.5,vel:86.2}],
  'Robert Stock': [{type:'FC',name:'Cutter',pct:44.1,vel:88.9},{type:'SI',name:'Sinker',pct:32.2,vel:93.7},{type:'FF',name:'Four-seam Fastball',pct:10.2,vel:95.0},{type:'ST',name:'Sweeper',pct:8.5,vel:81.8},{type:'CH',name:'Changeup',pct:5.1,vel:79.4}],
  'Robert Suarez': [{type:'FF',name:'Four-seam Fastball',pct:61.7,vel:98.6},{type:'CH',name:'Changeup',pct:24.3,vel:90.4},{type:'SI',name:'Sinker',pct:12.5,vel:98.3},{type:'FC',name:'Cutter',pct:1.5,vel:94.9}],
  'Robinson Piña': [{type:'SI',name:'Sinker',pct:42.6,vel:93.9},{type:'FS',name:'Splitter',pct:23.0,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:93.4},{type:'SL',name:'Slider',pct:16.4,vel:83.9}],
  'Roddery Muñoz': [{type:'SL',name:'Slider',pct:35.1,vel:86.8},{type:'FC',name:'Cutter',pct:24.7,vel:91.5},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:95.6},{type:'SI',name:'Sinker',pct:16.9,vel:95.3},{type:'CH',name:'Changeup',pct:4.3,vel:89.8}],
  'Roki Sasaki': [{type:'FF',name:'Four-seam Fastball',pct:46.8,vel:96.8},{type:'FS',name:'Splitter',pct:34.0,vel:85.3},{type:'SL',name:'Slider',pct:9.3,vel:86.6},{type:'ST',name:'Sweeper',pct:8.6,vel:81.9},{type:'SI',name:'Sinker',pct:1.3,vel:97.2}],
  'Rolddy Muñoz': [{type:'SL',name:'Slider',pct:49.6,vel:89.4},{type:'SI',name:'Sinker',pct:44.9,vel:96.3},{type:'FF',name:'Four-seam Fastball',pct:3.1,vel:96.5},{type:'CH',name:'Changeup',pct:2.4,vel:88.7}],
  'Ron Marinaccio': [{type:'FF',name:'Four-seam Fastball',pct:44.2,vel:93.7},{type:'CH',name:'Changeup',pct:30.5,vel:81.4},{type:'FC',name:'Cutter',pct:19.1,vel:86.4},{type:'ST',name:'Sweeper',pct:6.2,vel:82.9}],
  'Ronel Blanco': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:93.2},{type:'SL',name:'Slider',pct:31.5,vel:85.5},{type:'CU',name:'Curveball',pct:20.3,vel:80.2},{type:'CH',name:'Changeup',pct:12.5,vel:84.4}],
  'Ronny Henriquez': [{type:'FF',name:'Four-seam Fastball',pct:29.6,vel:96.7},{type:'ST',name:'Sweeper',pct:28.3,vel:85.4},{type:'SL',name:'Slider',pct:23.3,vel:87.7},{type:'CH',name:'Changeup',pct:16.6,vel:91.7},{type:'SI',name:'Sinker',pct:2.2,vel:95.0}],
  'Ryan Bergert': [{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:93.5},{type:'SL',name:'Slider',pct:24.2,vel:87.4},{type:'ST',name:'Sweeper',pct:17.9,vel:82.6},{type:'CH',name:'Changeup',pct:7.6,vel:87.6},{type:'SI',name:'Sinker',pct:7.1,vel:92.6},{type:'CU',name:'Curveball',pct:0.7,vel:82.4}],
  'Ryan Borucki': [{type:'SL',name:'Slider',pct:41.7,vel:86.0},{type:'SI',name:'Sinker',pct:26.3,vel:94.0},{type:'FS',name:'Splitter',pct:17.6,vel:83.7},{type:'ST',name:'Sweeper',pct:13.7,vel:81.2},{type:'FC',name:'Cutter',pct:0.6,vel:90.4},{type:'FF',name:'Four-seam Fastball',pct:0.1,vel:91.1}],
  'Ryan Brasier': [{type:'FF',name:'Four-seam Fastball',pct:35.9,vel:94.1},{type:'SL',name:'Slider',pct:34.1,vel:85.3},{type:'SI',name:'Sinker',pct:17.7,vel:93.9},{type:'FC',name:'Cutter',pct:12.2,vel:89.2}],
  'Ryan Cusick': [{type:'SL',name:'Slider',pct:46.0,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:36.5,vel:96.7},{type:'SI',name:'Sinker',pct:9.5,vel:95.3},{type:'CH',name:'Changeup',pct:4.8,vel:91.8},{type:'CU',name:'Curveball',pct:3.2,vel:83.5}],
  'Ryan Feltner': [{type:'FF',name:'Four-seam Fastball',pct:30.1,vel:94.1},{type:'SL',name:'Slider',pct:18.8,vel:88.7},{type:'CH',name:'Changeup',pct:17.0,vel:85.2},{type:'SI',name:'Sinker',pct:15.0,vel:94.0},{type:'ST',name:'Sweeper',pct:12.4,vel:82.7},{type:'CU',name:'Curveball',pct:6.8,vel:79.3}],
  'Ryan Fernandez': [{type:'SL',name:'Slider',pct:46.5,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:38.6,vel:95.2},{type:'CH',name:'Changeup',pct:8.3,vel:87.1},{type:'FC',name:'Cutter',pct:6.7,vel:91.3}],
  'Ryan Gusto': [{type:'FF',name:'Four-seam Fastball',pct:43.6,vel:94.1},{type:'CU',name:'Curveball',pct:14.8,vel:80.3},{type:'FC',name:'Cutter',pct:11.0,vel:89.1},{type:'SI',name:'Sinker',pct:10.6,vel:93.5},{type:'ST',name:'Sweeper',pct:10.3,vel:82.4},{type:'CH',name:'Changeup',pct:9.5,vel:87.3},{type:'SL',name:'Slider',pct:0.2,vel:87.7}],
  'Ryan Helsley': [{type:'FF',name:'Four-seam Fastball',pct:46.8,vel:99.2},{type:'SL',name:'Slider',pct:45.6,vel:88.7},{type:'CU',name:'Curveball',pct:5.3,vel:80.8},{type:'FC',name:'Cutter',pct:1.1,vel:93.5},{type:'FS',name:'Splitter',pct:1.1,vel:90.1}],
  'Ryan Johnson': [{type:'FC',name:'Cutter',pct:39.4,vel:91.0},{type:'SI',name:'Sinker',pct:21.3,vel:94.0},{type:'ST',name:'Sweeper',pct:21.3,vel:81.0},{type:'FS',name:'Splitter',pct:13.6,vel:84.9},{type:'SL',name:'Slider',pct:3.3,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:1.0,vel:94.5}],
  'Ryan Loutos': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:95.4},{type:'SL',name:'Slider',pct:22.5,vel:87.0},{type:'CH',name:'Changeup',pct:16.9,vel:89.0},{type:'ST',name:'Sweeper',pct:9.1,vel:87.6},{type:'SI',name:'Sinker',pct:5.2,vel:94.0}],
  'Ryan Pepiot': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:95.1},{type:'CH',name:'Changeup',pct:25.2,vel:86.7},{type:'SL',name:'Slider',pct:17.7,vel:89.0},{type:'FC',name:'Cutter',pct:6.2,vel:91.6},{type:'CU',name:'Curveball',pct:3.3,vel:80.7},{type:'SI',name:'Sinker',pct:2.6,vel:94.7},{type:'PO',name:'PO',pct:0.0,vel:95.1}],
  'Ryan Pressly': [{type:'FF',name:'Four-seam Fastball',pct:37.1,vel:93.4},{type:'CU',name:'Curveball',pct:24.7,vel:81.3},{type:'SL',name:'Slider',pct:20.8,vel:88.8},{type:'SI',name:'Sinker',pct:11.9,vel:93.4},{type:'CH',name:'Changeup',pct:5.6,vel:88.7}],
  'Ryan Rolison': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:92.9},{type:'CU',name:'Curveball',pct:33.3,vel:79.5},{type:'SL',name:'Slider',pct:17.0,vel:85.5},{type:'CH',name:'Changeup',pct:3.3,vel:87.3}],
  'Ryan Thompson': [{type:'SI',name:'Sinker',pct:54.3,vel:89.5},{type:'SL',name:'Slider',pct:37.1,vel:77.9},{type:'FF',name:'Four-seam Fastball',pct:8.3,vel:91.1},{type:'FS',name:'Splitter',pct:0.2,vel:81.2}],
  'Ryan Walker': [{type:'SI',name:'Sinker',pct:61.6,vel:95.9},{type:'SL',name:'Slider',pct:37.8,vel:83.8},{type:'CH',name:'Changeup',pct:0.3,vel:91.2},{type:'FF',name:'Four-seam Fastball',pct:0.3,vel:95.2}],
  'Ryan Watson': [{type:'FF',name:'Four-seam Fastball',pct:24.5,vel:94.0},{type:'SI',name:'Sinker',pct:24.5,vel:93.1},{type:'CU',name:'Curveball',pct:19.2,vel:82.4},{type:'ST',name:'Sweeper',pct:14.7,vel:84.3},{type:'FC',name:'Cutter',pct:14.0,vel:90.7},{type:'FS',name:'Splitter',pct:3.0,vel:88.7}],
  'Ryan Weathers': [{type:'FF',name:'Four-seam Fastball',pct:39.5,vel:96.8},{type:'CH',name:'Changeup',pct:25.4,vel:86.8},{type:'ST',name:'Sweeper',pct:20.3,vel:83.2},{type:'SI',name:'Sinker',pct:10.1,vel:95.0},{type:'SL',name:'Slider',pct:4.7,vel:89.3}],
  'Ryan Weiss': [{type:'FF',name:'Four-seam Fastball',pct:46.0,vel:95.6},{type:'ST',name:'Sweeper',pct:25.7,vel:84.1},{type:'CH',name:'Changeup',pct:13.4,vel:89.1},{type:'SI',name:'Sinker',pct:13.0,vel:93.7},{type:'CU',name:'Curveball',pct:1.9,vel:80.5}],
  'Ryan Yarbrough': [{type:'FC',name:'Cutter',pct:25.1,vel:83.4},{type:'CH',name:'Changeup',pct:20.5,vel:77.8},{type:'SI',name:'Sinker',pct:19.8,vel:86.9},{type:'ST',name:'Sweeper',pct:19.4,vel:71.8},{type:'FF',name:'Four-seam Fastball',pct:15.2,vel:88.1}],
  'Ryan Zeferjahn': [{type:'FF',name:'Four-seam Fastball',pct:31.3,vel:97.3},{type:'ST',name:'Sweeper',pct:27.3,vel:84.0},{type:'FC',name:'Cutter',pct:19.1,vel:91.0},{type:'SL',name:'Slider',pct:15.5,vel:88.1},{type:'SI',name:'Sinker',pct:4.8,vel:96.1},{type:'SV',name:'Slurve',pct:1.9,vel:83.9}],
  'Ryder Ryan': [{type:'SL',name:'Slider',pct:47.2,vel:82.6},{type:'SI',name:'Sinker',pct:24.5,vel:94.2},{type:'CH',name:'Changeup',pct:15.1,vel:89.7},{type:'FF',name:'Four-seam Fastball',pct:13.2,vel:92.8}],
  'Ryne Nelson': [{type:'FF',name:'Four-seam Fastball',pct:62.0,vel:95.7},{type:'SL',name:'Slider',pct:15.2,vel:86.9},{type:'CU',name:'Curveball',pct:11.1,vel:80.0},{type:'FC',name:'Cutter',pct:9.3,vel:90.9},{type:'CH',name:'Changeup',pct:2.4,vel:87.0}],
  'Ryne Stanek': [{type:'FF',name:'Four-seam Fastball',pct:56.0,vel:98.5},{type:'SL',name:'Slider',pct:21.5,vel:88.9},{type:'FS',name:'Splitter',pct:12.9,vel:89.2},{type:'ST',name:'Sweeper',pct:8.0,vel:84.4},{type:'SI',name:'Sinker',pct:1.6,vel:97.2}],
  'Sam Aldegheri': [{type:'FF',name:'Four-seam Fastball',pct:47.2,vel:91.6},{type:'CH',name:'Changeup',pct:23.8,vel:82.2},{type:'SL',name:'Slider',pct:17.5,vel:82.4},{type:'CU',name:'Curveball',pct:11.6,vel:75.3}],
  'Sam Bachman': [{type:'SL',name:'Slider',pct:52.1,vel:88.2},{type:'SI',name:'Sinker',pct:34.6,vel:97.8},{type:'CH',name:'Changeup',pct:11.9,vel:91.5},{type:'FF',name:'Four-seam Fastball',pct:1.2,vel:96.2},{type:'PO',name:'PO',pct:0.2,vel:90.2}],
  'Sam Long': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:93.2},{type:'SL',name:'Slider',pct:25.7,vel:84.9},{type:'CU',name:'Curveball',pct:17.9,vel:76.8},{type:'SI',name:'Sinker',pct:10.8,vel:92.7},{type:'FS',name:'Splitter',pct:9.3,vel:86.4},{type:'ST',name:'Sweeper',pct:1.0,vel:82.3}],
  'Sam Moll': [{type:'ST',name:'Sweeper',pct:40.6,vel:81.1},{type:'SI',name:'Sinker',pct:27.1,vel:91.4},{type:'FF',name:'Four-seam Fastball',pct:16.4,vel:92.2},{type:'CH',name:'Changeup',pct:15.9,vel:84.6}],
  'Sammy Peralta': [{type:'SL',name:'Slider',pct:46.4,vel:80.9},{type:'SI',name:'Sinker',pct:32.7,vel:89.1},{type:'CH',name:'Changeup',pct:10.1,vel:84.1},{type:'FF',name:'Four-seam Fastball',pct:8.3,vel:89.0},{type:'FC',name:'Cutter',pct:1.8,vel:83.5},{type:'ST',name:'Sweeper',pct:0.6,vel:80.8}],
  'Samy Natera Jr.': [{type:'FF',name:'Four-seam Fastball',pct:66.1,vel:95.4},{type:'SL',name:'Slider',pct:32.3,vel:86.2},{type:'CH',name:'Changeup',pct:1.6,vel:88.0}],
  'Sandy Alcantara': [{type:'SI',name:'Sinker',pct:25.3,vel:97.1},{type:'CH',name:'Changeup',pct:23.1,vel:90.4},{type:'FF',name:'Four-seam Fastball',pct:17.9,vel:97.6},{type:'SL',name:'Slider',pct:17.0,vel:85.1},{type:'FC',name:'Cutter',pct:15.5,vel:89.3},{type:'ST',name:'Sweeper',pct:1.3,vel:83.7}],
  'Sauryn Lao': [{type:'SL',name:'Slider',pct:48.1,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:29.7,vel:92.8},{type:'SI',name:'Sinker',pct:14.6,vel:93.1},{type:'CH',name:'Changeup',pct:7.6,vel:87.0}],
  'Sawyer Gipson-Long': [{type:'FF',name:'Four-seam Fastball',pct:28.3,vel:92.8},{type:'SL',name:'Slider',pct:21.4,vel:82.3},{type:'CH',name:'Changeup',pct:21.2,vel:84.2},{type:'SI',name:'Sinker',pct:18.4,vel:91.1},{type:'FC',name:'Cutter',pct:10.8,vel:87.7}],
  'Scott Alexander': [{type:'SI',name:'Sinker',pct:65.2,vel:91.3},{type:'SL',name:'Slider',pct:20.8,vel:83.2},{type:'CH',name:'Changeup',pct:14.1,vel:83.5}],
  'Scott Barlow': [{type:'ST',name:'Sweeper',pct:28.2,vel:81.3},{type:'FF',name:'Four-seam Fastball',pct:20.3,vel:92.1},{type:'CU',name:'Curveball',pct:18.6,vel:78.0},{type:'SL',name:'Slider',pct:16.8,vel:84.2},{type:'SI',name:'Sinker',pct:15.8,vel:91.9},{type:'CH',name:'Changeup',pct:0.1,vel:86.1},{type:'PO',name:'PO',pct:0.1,vel:91.6},{type:'UN',name:'UN',pct:0.1,vel:71.0}],
  'Scott Blewett': [{type:'SL',name:'Slider',pct:43.1,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:36.3,vel:93.5},{type:'FS',name:'Splitter',pct:18.7,vel:85.1},{type:'SI',name:'Sinker',pct:1.2,vel:93.8},{type:'FC',name:'Cutter',pct:0.7,vel:90.0}],
  'Scott Effross': [{type:'SI',name:'Sinker',pct:47.4,vel:89.2},{type:'ST',name:'Sweeper',pct:33.3,vel:78.8},{type:'CH',name:'Changeup',pct:12.2,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:7.1,vel:89.4}],
  'Scott McGough': [{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:92.3},{type:'FS',name:'Splitter',pct:33.3,vel:84.8},{type:'SL',name:'Slider',pct:23.6,vel:86.4},{type:'SI',name:'Sinker',pct:4.4,vel:92.2}],
  'Sean Burke': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:94.3},{type:'KC',name:'Knuckle Curve',pct:22.9,vel:79.7},{type:'SL',name:'Slider',pct:21.5,vel:86.7},{type:'CH',name:'Changeup',pct:6.5,vel:85.7},{type:'SI',name:'Sinker',pct:6.0,vel:94.2},{type:'CS',name:'CS',pct:0.0,vel:68.1}],
  'Sean Guenther': [{type:'SI',name:'Sinker',pct:42.7,vel:90.0},{type:'SL',name:'Slider',pct:32.0,vel:78.8},{type:'FS',name:'Splitter',pct:23.0,vel:83.3},{type:'FF',name:'Four-seam Fastball',pct:2.2,vel:90.3}],
  'Sean Hjelle': [{type:'SI',name:'Sinker',pct:50.0,vel:93.6},{type:'KC',name:'Knuckle Curve',pct:35.8,vel:85.8},{type:'FC',name:'Cutter',pct:14.2,vel:89.6}],
  'Sean Manaea': [{type:'FF',name:'Four-seam Fastball',pct:55.5,vel:91.4},{type:'ST',name:'Sweeper',pct:34.1,vel:77.0},{type:'CH',name:'Changeup',pct:6.0,vel:84.1},{type:'SI',name:'Sinker',pct:3.5,vel:88.7},{type:'FC',name:'Cutter',pct:1.0,vel:83.8}],
  'Sean Newcomb': [{type:'FF',name:'Four-seam Fastball',pct:28.5,vel:93.4},{type:'SV',name:'Slurve',pct:24.0,vel:81.9},{type:'SI',name:'Sinker',pct:23.6,vel:92.5},{type:'FC',name:'Cutter',pct:12.3,vel:89.5},{type:'CH',name:'Changeup',pct:6.7,vel:85.4},{type:'CU',name:'Curveball',pct:4.9,vel:79.1}],
  'Sean Reynolds': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:96.0},{type:'SL',name:'Slider',pct:32.0,vel:87.1},{type:'ST',name:'Sweeper',pct:10.5,vel:82.8},{type:'CH',name:'Changeup',pct:5.7,vel:88.0}],
  'Seranthony Domínguez': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:97.6},{type:'ST',name:'Sweeper',pct:22.2,vel:86.3},{type:'FS',name:'Splitter',pct:15.7,vel:86.9},{type:'SI',name:'Sinker',pct:14.0,vel:97.9},{type:'CU',name:'Curveball',pct:4.3,vel:83.7},{type:'PO',name:'PO',pct:0.1,vel:96.1}],
  'Seth Halvorsen': [{type:'FF',name:'Four-seam Fastball',pct:54.0,vel:99.9},{type:'FS',name:'Splitter',pct:25.3,vel:90.6},{type:'SL',name:'Slider',pct:20.4,vel:89.3},{type:'SI',name:'Sinker',pct:0.3,vel:98.2}],
  'Seth Johnson': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:97.2},{type:'SL',name:'Slider',pct:33.8,vel:88.1},{type:'CU',name:'Curveball',pct:7.8,vel:78.8},{type:'FS',name:'Splitter',pct:7.5,vel:89.4},{type:'SI',name:'Sinker',pct:2.4,vel:95.9}],
  'Seth Lugo': [{type:'FF',name:'Four-seam Fastball',pct:20.9,vel:91.7},{type:'CU',name:'Curveball',pct:17.7,vel:78.6},{type:'SI',name:'Sinker',pct:15.7,vel:91.4},{type:'FC',name:'Cutter',pct:13.9,vel:89.4},{type:'CH',name:'Changeup',pct:9.3,vel:86.2},{type:'SV',name:'Slurve',pct:8.4,vel:79.0},{type:'SL',name:'Slider',pct:6.6,vel:83.4},{type:'CS',name:'CS',pct:4.4,vel:71.1},{type:'ST',name:'Sweeper',pct:2.7,vel:79.8},{type:'FS',name:'Splitter',pct:0.5,vel:84.4}],
  'Seth Martinez': [{type:'ST',name:'Sweeper',pct:36.7,vel:77.5},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:90.1},{type:'FC',name:'Cutter',pct:16.7,vel:84.8},{type:'CH',name:'Changeup',pct:10.8,vel:82.6},{type:'SI',name:'Sinker',pct:9.2,vel:88.8}],
  'Shane Baz': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:96.9},{type:'KC',name:'Knuckle Curve',pct:27.5,vel:85.1},{type:'FC',name:'Cutter',pct:15.8,vel:90.3},{type:'CH',name:'Changeup',pct:11.0,vel:89.3},{type:'SL',name:'Slider',pct:2.7,vel:86.7},{type:'SI',name:'Sinker',pct:0.1,vel:96.2}],
  'Shane Bieber': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:92.6},{type:'SL',name:'Slider',pct:21.7,vel:85.4},{type:'KC',name:'Knuckle Curve',pct:18.0,vel:82.7},{type:'CH',name:'Changeup',pct:14.5,vel:89.0},{type:'FC',name:'Cutter',pct:12.8,vel:87.5}],
  'Shane Drohan': [{type:'FF',name:'Four-seam Fastball',pct:38.9,vel:93.9},{type:'FC',name:'Cutter',pct:22.2,vel:88.8},{type:'CH',name:'Changeup',pct:12.5,vel:82.8},{type:'SL',name:'Slider',pct:12.5,vel:83.3},{type:'CU',name:'Curveball',pct:9.7,vel:78.0},{type:'SI',name:'Sinker',pct:4.2,vel:92.7}],
  'Shane McClanahan': [{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:94.7},{type:'CH',name:'Changeup',pct:26.7,vel:86.4},{type:'SL',name:'Slider',pct:21.4,vel:87.2},{type:'CU',name:'Curveball',pct:10.6,vel:80.6}],
  'Shane Smith': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:95.6},{type:'CH',name:'Changeup',pct:17.0,vel:90.0},{type:'CU',name:'Curveball',pct:15.4,vel:82.1},{type:'SI',name:'Sinker',pct:13.0,vel:95.7},{type:'SL',name:'Slider',pct:11.5,vel:89.6},{type:'ST',name:'Sweeper',pct:0.1,vel:88.1}],
  'Shaun Anderson': [{type:'SL',name:'Slider',pct:29.3,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:27.9,vel:92.8},{type:'CH',name:'Changeup',pct:24.2,vel:86.6},{type:'ST',name:'Sweeper',pct:13.1,vel:81.9},{type:'SI',name:'Sinker',pct:5.5,vel:93.5}],
  'Shawn Armstrong': [{type:'FF',name:'Four-seam Fastball',pct:29.2,vel:93.5},{type:'ST',name:'Sweeper',pct:24.6,vel:84.9},{type:'SI',name:'Sinker',pct:23.3,vel:94.0},{type:'FC',name:'Cutter',pct:22.8,vel:90.7},{type:'SV',name:'Slurve',pct:0.1,vel:84.6}],
  'Shawn Dubin': [{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:94.3},{type:'ST',name:'Sweeper',pct:16.8,vel:83.3},{type:'SI',name:'Sinker',pct:15.0,vel:93.9},{type:'CH',name:'Changeup',pct:14.3,vel:87.7},{type:'CU',name:'Curveball',pct:14.0,vel:81.7},{type:'FC',name:'Cutter',pct:3.5,vel:89.0},{type:'SL',name:'Slider',pct:1.4,vel:86.5}],
  'Shelby Miller': [{type:'FF',name:'Four-seam Fastball',pct:61.8,vel:95.2},{type:'FS',name:'Splitter',pct:28.8,vel:86.9},{type:'ST',name:'Sweeper',pct:8.4,vel:83.5},{type:'SL',name:'Slider',pct:0.9,vel:91.1},{type:'FC',name:'Cutter',pct:0.1,vel:91.0}],
  'Shinnosuke Ogasawara': [{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:91.1},{type:'CH',name:'Changeup',pct:22.3,vel:80.7},{type:'KC',name:'Knuckle Curve',pct:19.1,vel:72.3},{type:'SL',name:'Slider',pct:18.5,vel:81.6},{type:'SI',name:'Sinker',pct:0.9,vel:90.4},{type:'ST',name:'Sweeper',pct:0.4,vel:76.5}],
  'Shohei Ohtani': [{type:'FF',name:'Four-seam Fastball',pct:39.7,vel:98.1},{type:'ST',name:'Sweeper',pct:20.4,vel:84.9},{type:'CU',name:'Curveball',pct:12.2,vel:77.2},{type:'SL',name:'Slider',pct:8.5,vel:88.3},{type:'FS',name:'Splitter',pct:7.9,vel:88.5},{type:'SI',name:'Sinker',pct:6.5,vel:95.9},{type:'FC',name:'Cutter',pct:4.8,vel:93.7}],
  'Shota Imanaga': [{type:'FF',name:'Four-seam Fastball',pct:48.0,vel:91.1},{type:'FS',name:'Splitter',pct:31.2,vel:83.1},{type:'ST',name:'Sweeper',pct:16.2,vel:80.8},{type:'SI',name:'Sinker',pct:2.2,vel:89.5},{type:'CU',name:'Curveball',pct:1.8,vel:72.6},{type:'SL',name:'Slider',pct:0.6,vel:81.9}],
  'Simeon Woods Richardson': [{type:'FF',name:'Four-seam Fastball',pct:45.4,vel:93.1},{type:'SL',name:'Slider',pct:26.9,vel:85.5},{type:'FS',name:'Splitter',pct:12.7,vel:86.3},{type:'CU',name:'Curveball',pct:11.5,vel:77.8},{type:'CH',name:'Changeup',pct:3.5,vel:83.2}],
  'Slade Cecconi': [{type:'FF',name:'Four-seam Fastball',pct:42.6,vel:94.2},{type:'CU',name:'Curveball',pct:16.6,vel:75.3},{type:'SL',name:'Slider',pct:15.2,vel:84.3},{type:'SI',name:'Sinker',pct:10.7,vel:93.5},{type:'FC',name:'Cutter',pct:6.6,vel:87.7},{type:'CH',name:'Changeup',pct:6.4,vel:84.4},{type:'ST',name:'Sweeper',pct:1.7,vel:81.8}],
  'Sonny Gray': [{type:'FF',name:'Four-seam Fastball',pct:21.1,vel:91.7},{type:'ST',name:'Sweeper',pct:18.7,vel:85.1},{type:'SI',name:'Sinker',pct:18.6,vel:92.4},{type:'CU',name:'Curveball',pct:18.3,vel:80.2},{type:'FC',name:'Cutter',pct:13.7,vel:88.0},{type:'CH',name:'Changeup',pct:8.1,vel:86.3},{type:'SL',name:'Slider',pct:1.5,vel:84.4},{type:'CS',name:'CS',pct:0.1,vel:74.9},{type:'PO',name:'PO',pct:0.0,vel:89.0}],
  'Spencer Arrighetti': [{type:'FF',name:'Four-seam Fastball',pct:29.5,vel:93.1},{type:'CU',name:'Curveball',pct:24.7,vel:77.2},{type:'ST',name:'Sweeper',pct:14.1,vel:79.7},{type:'FC',name:'Cutter',pct:12.8,vel:87.1},{type:'CH',name:'Changeup',pct:9.5,vel:84.8},{type:'SI',name:'Sinker',pct:9.5,vel:92.4}],
  'Spencer Bivens': [{type:'SI',name:'Sinker',pct:38.0,vel:94.7},{type:'FC',name:'Cutter',pct:27.0,vel:90.9},{type:'CH',name:'Changeup',pct:14.8,vel:88.5},{type:'ST',name:'Sweeper',pct:8.7,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:6.0,vel:95.2},{type:'SV',name:'Slurve',pct:5.4,vel:79.9}],
  'Spencer Miles': [{type:'FF',name:'Four-seam Fastball',pct:31.1,vel:95.8},{type:'SI',name:'Sinker',pct:27.4,vel:96.0},{type:'SL',name:'Slider',pct:25.8,vel:87.5},{type:'CU',name:'Curveball',pct:15.8,vel:79.8}],
  'Spencer Schwellenbach': [{type:'FF',name:'Four-seam Fastball',pct:35.3,vel:97.1},{type:'SL',name:'Slider',pct:18.1,vel:87.0},{type:'FS',name:'Splitter',pct:13.9,vel:84.7},{type:'CU',name:'Curveball',pct:11.4,vel:81.0},{type:'FC',name:'Cutter',pct:11.3,vel:94.1},{type:'SI',name:'Sinker',pct:10.0,vel:95.6}],
  'Spencer Strider': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:95.5},{type:'SL',name:'Slider',pct:35.3,vel:84.1},{type:'CU',name:'Curveball',pct:8.9,vel:78.4},{type:'CH',name:'Changeup',pct:4.6,vel:85.9}],
  'Spencer Turnbull': [{type:'FF',name:'Four-seam Fastball',pct:37.6,vel:90.9},{type:'ST',name:'Sweeper',pct:22.4,vel:83.3},{type:'CU',name:'Curveball',pct:15.2,vel:78.1},{type:'CH',name:'Changeup',pct:11.2,vel:86.1},{type:'SL',name:'Slider',pct:7.2,vel:83.9},{type:'SI',name:'Sinker',pct:6.4,vel:92.4}],
  'Stephen Kolek': [{type:'FF',name:'Four-seam Fastball',pct:25.6,vel:94.0},{type:'SI',name:'Sinker',pct:24.1,vel:93.6},{type:'SL',name:'Slider',pct:16.5,vel:85.4},{type:'FC',name:'Cutter',pct:15.2,vel:90.5},{type:'CH',name:'Changeup',pct:11.6,vel:87.5},{type:'ST',name:'Sweeper',pct:6.9,vel:82.5},{type:'CU',name:'Curveball',pct:0.1,vel:78.6}],
  'Steven Cruz': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:97.9},{type:'FC',name:'Cutter',pct:24.6,vel:93.3},{type:'SL',name:'Slider',pct:24.3,vel:89.0}],
  'Steven Matz': [{type:'SI',name:'Sinker',pct:55.5,vel:94.3},{type:'CH',name:'Changeup',pct:21.5,vel:83.6},{type:'CU',name:'Curveball',pct:19.6,vel:79.4},{type:'SL',name:'Slider',pct:3.3,vel:85.6},{type:'PO',name:'PO',pct:0.1,vel:92.7}],
  'Steven Okert': [{type:'SL',name:'Slider',pct:59.2,vel:80.7},{type:'FF',name:'Four-seam Fastball',pct:40.1,vel:91.7},{type:'FC',name:'Cutter',pct:0.6,vel:91.2},{type:'CH',name:'Changeup',pct:0.1,vel:85.9},{type:'PO',name:'PO',pct:0.1,vel:88.9}],
  'Steven Wilson': [{type:'ST',name:'Sweeper',pct:58.3,vel:82.1},{type:'FF',name:'Four-seam Fastball',pct:33.4,vel:93.9},{type:'CH',name:'Changeup',pct:7.3,vel:84.9},{type:'FC',name:'Cutter',pct:1.0,vel:90.7}],
  'T.J. McFarland': [{type:'SI',name:'Sinker',pct:51.1,vel:87.9},{type:'ST',name:'Sweeper',pct:37.1,vel:78.1},{type:'CH',name:'Changeup',pct:10.7,vel:80.9},{type:'FF',name:'Four-seam Fastball',pct:1.1,vel:87.3}],
  'Taijuan Walker': [{type:'FC',name:'Cutter',pct:28.5,vel:87.0},{type:'FS',name:'Splitter',pct:22.9,vel:87.3},{type:'SI',name:'Sinker',pct:20.2,vel:91.9},{type:'SL',name:'Slider',pct:11.6,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:9.4,vel:92.1},{type:'CU',name:'Curveball',pct:7.3,vel:74.7}],
  'Taj Bradley': [{type:'FF',name:'Four-seam Fastball',pct:40.4,vel:96.3},{type:'FC',name:'Cutter',pct:22.1,vel:89.5},{type:'FS',name:'Splitter',pct:16.0,vel:91.1},{type:'CU',name:'Curveball',pct:14.1,vel:81.8},{type:'SI',name:'Sinker',pct:7.4,vel:96.0}],
  'Tanner Banks': [{type:'SL',name:'Slider',pct:35.2,vel:87.2},{type:'ST',name:'Sweeper',pct:24.6,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:21.0,vel:92.5},{type:'SI',name:'Sinker',pct:12.8,vel:92.0},{type:'CH',name:'Changeup',pct:6.4,vel:82.8}],
  'Tanner Bibee': [{type:'FF',name:'Four-seam Fastball',pct:28.1,vel:94.3},{type:'FC',name:'Cutter',pct:22.0,vel:86.2},{type:'CH',name:'Changeup',pct:15.3,vel:81.7},{type:'SI',name:'Sinker',pct:14.8,vel:94.0},{type:'ST',name:'Sweeper',pct:13.8,vel:83.0},{type:'CU',name:'Curveball',pct:6.1,vel:79.4}],
  'Tanner Gordon': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:92.4},{type:'SL',name:'Slider',pct:25.5,vel:84.4},{type:'CH',name:'Changeup',pct:20.2,vel:83.3},{type:'CU',name:'Curveball',pct:2.0,vel:81.2},{type:'SI',name:'Sinker',pct:0.5,vel:91.0}],
  'Tanner Houck': [{type:'SI',name:'Sinker',pct:39.8,vel:94.5},{type:'ST',name:'Sweeper',pct:35.4,vel:83.5},{type:'FS',name:'Splitter',pct:19.0,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:5.9,vel:95.0}],
  'Tanner Rainey': [{type:'FF',name:'Four-seam Fastball',pct:54.0,vel:95.2},{type:'SL',name:'Slider',pct:46.0,vel:86.4}],
  'Tanner Scott': [{type:'FF',name:'Four-seam Fastball',pct:51.9,vel:96.5},{type:'SL',name:'Slider',pct:47.5,vel:89.1},{type:'SI',name:'Sinker',pct:0.7,vel:95.8}],
  'Tarik Skubal': [{type:'FF',name:'Four-seam Fastball',pct:31.1,vel:97.5},{type:'CH',name:'Changeup',pct:30.2,vel:88.0},{type:'SI',name:'Sinker',pct:22.8,vel:97.3},{type:'SL',name:'Slider',pct:13.2,vel:90.1},{type:'CU',name:'Curveball',pct:2.8,vel:81.1},{type:'FS',name:'Splitter',pct:0.1,vel:89.3}],
  'Tatsuya Imai': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:94.7},{type:'SL',name:'Slider',pct:42.9,vel:86.9},{type:'FS',name:'Splitter',pct:3.4,vel:84.6},{type:'CH',name:'Changeup',pct:2.9,vel:85.7},{type:'CU',name:'Curveball',pct:2.9,vel:77.6}],
  'Tayler Saucedo': [{type:'SI',name:'Sinker',pct:48.6,vel:90.9},{type:'CH',name:'Changeup',pct:17.6,vel:85.2},{type:'ST',name:'Sweeper',pct:14.9,vel:80.3},{type:'SL',name:'Slider',pct:12.5,vel:83.2},{type:'FF',name:'Four-seam Fastball',pct:6.3,vel:91.3}],
  'Tayler Scott': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:92.0},{type:'FS',name:'Splitter',pct:28.9,vel:83.9},{type:'ST',name:'Sweeper',pct:14.0,vel:82.7},{type:'SL',name:'Slider',pct:6.5,vel:86.3},{type:'SI',name:'Sinker',pct:2.8,vel:91.7}],
  'Taylor Clarke': [{type:'SL',name:'Slider',pct:38.4,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:20.2,vel:94.8},{type:'CH',name:'Changeup',pct:20.1,vel:89.6},{type:'SI',name:'Sinker',pct:18.6,vel:94.7},{type:'FC',name:'Cutter',pct:2.6,vel:93.2}],
  'Taylor Rashi': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:90.1},{type:'FS',name:'Splitter',pct:23.7,vel:84.8},{type:'SL',name:'Slider',pct:13.9,vel:83.7},{type:'CU',name:'Curveball',pct:9.7,vel:75.5},{type:'SV',name:'Slurve',pct:0.8,vel:77.9}],
  'Taylor Rogers': [{type:'ST',name:'Sweeper',pct:49.3,vel:78.1},{type:'SI',name:'Sinker',pct:46.7,vel:92.5},{type:'FC',name:'Cutter',pct:4.0,vel:87.6}],
  'Thomas Harrington': [{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:92.1},{type:'FS',name:'Splitter',pct:23.5,vel:83.3},{type:'ST',name:'Sweeper',pct:19.5,vel:81.2},{type:'FC',name:'Cutter',pct:10.0,vel:85.6},{type:'SI',name:'Sinker',pct:6.5,vel:91.4}],
  'Thomas Hatch': [{type:'FC',name:'Cutter',pct:27.3,vel:90.1},{type:'SL',name:'Slider',pct:18.4,vel:85.5},{type:'SI',name:'Sinker',pct:17.6,vel:93.3},{type:'CH',name:'Changeup',pct:17.4,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:11.9,vel:93.3},{type:'ST',name:'Sweeper',pct:7.3,vel:82.2}],
  'Tim Herrin': [{type:'CU',name:'Curveball',pct:39.8,vel:81.2},{type:'FF',name:'Four-seam Fastball',pct:26.2,vel:94.6},{type:'SL',name:'Slider',pct:18.2,vel:87.1},{type:'SI',name:'Sinker',pct:15.8,vel:93.4}],
  'Tim Hill': [{type:'SI',name:'Sinker',pct:80.8,vel:88.4},{type:'FF',name:'Four-seam Fastball',pct:13.1,vel:89.8},{type:'FC',name:'Cutter',pct:3.8,vel:84.6},{type:'SL',name:'Slider',pct:2.3,vel:77.0}],
  'Tim Mayza': [{type:'SI',name:'Sinker',pct:63.5,vel:93.7},{type:'SL',name:'Slider',pct:33.5,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:3.0,vel:93.8}],
  'Tobias Myers': [{type:'FF',name:'Four-seam Fastball',pct:44.8,vel:93.3},{type:'FC',name:'Cutter',pct:18.2,vel:87.5},{type:'SL',name:'Slider',pct:18.0,vel:83.5},{type:'FS',name:'Splitter',pct:16.8,vel:82.3},{type:'CH',name:'Changeup',pct:1.1,vel:80.1},{type:'CU',name:'Curveball',pct:1.1,vel:76.4}],
  'Tom Cosgrove': [{type:'ST',name:'Sweeper',pct:42.2,vel:76.2},{type:'SI',name:'Sinker',pct:32.8,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:88.5}],
  'Tommy Henry': [{type:'CU',name:'Curveball',pct:28.0,vel:77.7},{type:'FF',name:'Four-seam Fastball',pct:25.2,vel:89.0},{type:'CH',name:'Changeup',pct:23.4,vel:81.9},{type:'SL',name:'Slider',pct:21.5,vel:85.1},{type:'SI',name:'Sinker',pct:1.9,vel:87.2}],
  'Tommy Kahnle': [{type:'CH',name:'Changeup',pct:84.4,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:14.8,vel:93.6},{type:'SL',name:'Slider',pct:0.8,vel:86.3}],
  'Tommy Nance': [{type:'SL',name:'Slider',pct:40.4,vel:88.7},{type:'CU',name:'Curveball',pct:32.6,vel:84.9},{type:'SI',name:'Sinker',pct:27.0,vel:94.5}],
  'Tomoyuki Sugano': [{type:'FS',name:'Splitter',pct:23.1,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:19.8,vel:92.7},{type:'ST',name:'Sweeper',pct:18.3,vel:83.6},{type:'SI',name:'Sinker',pct:15.4,vel:92.9},{type:'FC',name:'Cutter',pct:12.8,vel:88.3},{type:'CU',name:'Curveball',pct:9.2,vel:78.3},{type:'SL',name:'Slider',pct:1.4,vel:84.5}],
  'Tony Gonsolin': [{type:'FF',name:'Four-seam Fastball',pct:40.2,vel:93.5},{type:'FS',name:'Splitter',pct:26.8,vel:84.2},{type:'CU',name:'Curveball',pct:16.9,vel:81.7},{type:'SL',name:'Slider',pct:16.1,vel:88.1}],
  'Tony Santillan': [{type:'FF',name:'Four-seam Fastball',pct:64.2,vel:96.0},{type:'SV',name:'Slurve',pct:23.9,vel:85.8},{type:'SL',name:'Slider',pct:11.9,vel:86.5},{type:'CH',name:'Changeup',pct:0.1,vel:95.1}],
  'Travis Adams': [{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:94.8},{type:'SL',name:'Slider',pct:20.1,vel:85.6},{type:'FC',name:'Cutter',pct:18.6,vel:90.8},{type:'CH',name:'Changeup',pct:16.7,vel:87.4},{type:'SI',name:'Sinker',pct:11.2,vel:94.1},{type:'CU',name:'Curveball',pct:4.1,vel:79.1}],
  'Trent Thornton': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:94.4},{type:'FC',name:'Cutter',pct:22.7,vel:90.1},{type:'CU',name:'Curveball',pct:18.6,vel:81.0},{type:'ST',name:'Sweeper',pct:18.6,vel:80.2},{type:'SI',name:'Sinker',pct:2.4,vel:93.5},{type:'FS',name:'Splitter',pct:2.3,vel:84.8},{type:'CH',name:'Changeup',pct:1.4,vel:87.1},{type:'SL',name:'Slider',pct:0.9,vel:84.0}],
  'Trevor McDonald': [{type:'SL',name:'Slider',pct:47.8,vel:86.1},{type:'SI',name:'Sinker',pct:41.2,vel:93.4},{type:'CH',name:'Changeup',pct:6.7,vel:84.4},{type:'FC',name:'Cutter',pct:4.3,vel:89.2}],
  'Trevor Megill': [{type:'FF',name:'Four-seam Fastball',pct:60.4,vel:98.9},{type:'KC',name:'Knuckle Curve',pct:39.6,vel:87.5}],
  'Trevor Richards': [{type:'FF',name:'Four-seam Fastball',pct:59.0,vel:91.6},{type:'CH',name:'Changeup',pct:31.7,vel:79.6},{type:'SL',name:'Slider',pct:9.4,vel:83.9}],
  'Trevor Rogers': [{type:'FF',name:'Four-seam Fastball',pct:41.3,vel:93.0},{type:'CH',name:'Changeup',pct:23.9,vel:86.3},{type:'SI',name:'Sinker',pct:14.2,vel:92.7},{type:'FC',name:'Cutter',pct:12.2,vel:81.4},{type:'ST',name:'Sweeper',pct:8.4,vel:78.2}],
  'Trevor Williams': [{type:'FF',name:'Four-seam Fastball',pct:42.3,vel:87.7},{type:'ST',name:'Sweeper',pct:27.5,vel:76.8},{type:'CH',name:'Changeup',pct:12.8,vel:81.3},{type:'SL',name:'Slider',pct:8.8,vel:80.7},{type:'SI',name:'Sinker',pct:8.6,vel:86.7}],
  'Trey Supak': [{type:'CH',name:'Changeup',pct:23.5,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:23.5,vel:92.4},{type:'SL',name:'Slider',pct:19.6,vel:86.5},{type:'SI',name:'Sinker',pct:17.6,vel:91.6},{type:'CU',name:'Curveball',pct:15.7,vel:76.1}],
  'Trey Yesavage': [{type:'FF',name:'Four-seam Fastball',pct:40.1,vel:94.3},{type:'SL',name:'Slider',pct:32.5,vel:88.5},{type:'FS',name:'Splitter',pct:27.4,vel:83.8}],
  'Tristan Beck': [{type:'FF',name:'Four-seam Fastball',pct:32.7,vel:94.7},{type:'ST',name:'Sweeper',pct:28.3,vel:83.1},{type:'SL',name:'Slider',pct:22.0,vel:89.7},{type:'CU',name:'Curveball',pct:16.9,vel:80.6}],
  'Triston McKenzie': [{type:'FF',name:'Four-seam Fastball',pct:80.5,vel:93.7},{type:'CU',name:'Curveball',pct:13.0,vel:79.5},{type:'SL',name:'Slider',pct:6.5,vel:86.0}],
  'Troy Melton': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:97.3},{type:'SL',name:'Slider',pct:21.4,vel:85.5},{type:'SI',name:'Sinker',pct:11.0,vel:95.8},{type:'FS',name:'Splitter',pct:9.5,vel:88.4},{type:'FC',name:'Cutter',pct:9.1,vel:90.9},{type:'CU',name:'Curveball',pct:4.5,vel:78.8}],
  'Troy Taylor': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:96.4},{type:'ST',name:'Sweeper',pct:37.5,vel:84.9},{type:'SI',name:'Sinker',pct:14.0,vel:96.1},{type:'CH',name:'Changeup',pct:1.5,vel:90.5}],
  'Ty Adcock': [{type:'FF',name:'Four-seam Fastball',pct:42.2,vel:97.0},{type:'SL',name:'Slider',pct:30.4,vel:86.9},{type:'FC',name:'Cutter',pct:18.6,vel:93.1},{type:'FS',name:'Splitter',pct:7.8,vel:87.4},{type:'SI',name:'Sinker',pct:1.0,vel:94.9}],
  'Tyler Alexander': [{type:'FF',name:'Four-seam Fastball',pct:24.3,vel:90.8},{type:'ST',name:'Sweeper',pct:21.5,vel:80.2},{type:'SI',name:'Sinker',pct:19.0,vel:90.5},{type:'FC',name:'Cutter',pct:18.1,vel:87.0},{type:'CH',name:'Changeup',pct:17.1,vel:83.4}],
  'Tyler Anderson': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:89.3},{type:'CH',name:'Changeup',pct:34.0,vel:78.7},{type:'FC',name:'Cutter',pct:20.5,vel:84.4},{type:'SI',name:'Sinker',pct:3.6,vel:88.5},{type:'SL',name:'Slider',pct:3.5,vel:80.7},{type:'CU',name:'Curveball',pct:0.3,vel:69.2}],
  'Tyler Ferguson': [{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:94.7},{type:'ST',name:'Sweeper',pct:31.7,vel:83.7},{type:'SI',name:'Sinker',pct:14.8,vel:94.2},{type:'FC',name:'Cutter',pct:10.9,vel:89.9},{type:'CH',name:'Changeup',pct:4.0,vel:86.3}],
  'Tyler Gilbert': [{type:'SI',name:'Sinker',pct:32.0,vel:89.9},{type:'ST',name:'Sweeper',pct:30.3,vel:80.9},{type:'FC',name:'Cutter',pct:18.4,vel:87.6},{type:'FF',name:'Four-seam Fastball',pct:11.8,vel:90.6},{type:'FS',name:'Splitter',pct:7.4,vel:83.0}],
  'Tyler Glasnow': [{type:'FF',name:'Four-seam Fastball',pct:33.7,vel:95.8},{type:'CU',name:'Curveball',pct:24.9,vel:81.8},{type:'SL',name:'Slider',pct:20.9,vel:89.4},{type:'SI',name:'Sinker',pct:20.5,vel:96.1}],
  'Tyler Heineman': [{type:'EP',name:'EP',pct:82.3,vel:50.5},{type:'FA',name:'FA',pct:17.7,vel:64.5}],
  'Tyler Holton': [{type:'FC',name:'Cutter',pct:30.3,vel:88.6},{type:'SI',name:'Sinker',pct:21.9,vel:91.4},{type:'ST',name:'Sweeper',pct:17.6,vel:81.3},{type:'CH',name:'Changeup',pct:15.3,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:11.2,vel:91.9},{type:'CU',name:'Curveball',pct:3.8,vel:80.2}],
  'Tyler Kinley': [{type:'SL',name:'Slider',pct:63.9,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:22.3,vel:95.1},{type:'CU',name:'Curveball',pct:12.9,vel:83.4},{type:'CH',name:'Changeup',pct:0.8,vel:87.1},{type:'SI',name:'Sinker',pct:0.1,vel:94.2}],
  'Tyler Mahle': [{type:'FF',name:'Four-seam Fastball',pct:48.1,vel:92.0},{type:'FS',name:'Splitter',pct:27.8,vel:84.3},{type:'FC',name:'Cutter',pct:12.6,vel:85.9},{type:'SL',name:'Slider',pct:10.6,vel:83.5},{type:'SI',name:'Sinker',pct:1.0,vel:91.9}],
  'Tyler Matzek': [{type:'FF',name:'Four-seam Fastball',pct:59.8,vel:94.5},{type:'SL',name:'Slider',pct:33.1,vel:84.4},{type:'SI',name:'Sinker',pct:7.1,vel:94.6}],
  'Tyler Owens': [{type:'FF',name:'Four-seam Fastball',pct:42.4,vel:95.5},{type:'FC',name:'Cutter',pct:27.3,vel:94.2},{type:'SL',name:'Slider',pct:22.7,vel:88.0},{type:'FS',name:'Splitter',pct:7.6,vel:90.1}],
  'Tyler Phillips': [{type:'SI',name:'Sinker',pct:30.5,vel:95.6},{type:'ST',name:'Sweeper',pct:22.9,vel:84.5},{type:'CU',name:'Curveball',pct:22.7,vel:84.1},{type:'FS',name:'Splitter',pct:14.4,vel:87.1},{type:'FF',name:'Four-seam Fastball',pct:9.2,vel:95.1},{type:'FC',name:'Cutter',pct:0.4,vel:90.4}],
  'Tyler Rogers': [{type:'SI',name:'Sinker',pct:75.0,vel:83.4},{type:'SL',name:'Slider',pct:25.0,vel:74.0}],
  'Tyler Samaniego': [{type:'SI',name:'Sinker',pct:40.4,vel:92.7},{type:'ST',name:'Sweeper',pct:20.2,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:17.0,vel:93.0},{type:'CH',name:'Changeup',pct:11.7,vel:85.7},{type:'FC',name:'Cutter',pct:10.6,vel:89.8}],
  'Tyler Uberstine': [{type:'FC',name:'Cutter',pct:23.9,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:22.5,vel:93.1},{type:'ST',name:'Sweeper',pct:19.7,vel:80.6},{type:'SI',name:'Sinker',pct:18.3,vel:92.2},{type:'CH',name:'Changeup',pct:15.5,vel:85.4}],
  'Tyler Wells': [{type:'FF',name:'Four-seam Fastball',pct:37.7,vel:93.0},{type:'CH',name:'Changeup',pct:23.1,vel:86.8},{type:'SL',name:'Slider',pct:21.3,vel:87.0},{type:'FC',name:'Cutter',pct:11.3,vel:90.5},{type:'CU',name:'Curveball',pct:6.7,vel:78.6}],
  'Tyler Zuber': [{type:'FF',name:'Four-seam Fastball',pct:30.7,vel:94.6},{type:'ST',name:'Sweeper',pct:30.3,vel:82.8},{type:'SL',name:'Slider',pct:18.3,vel:87.8},{type:'SI',name:'Sinker',pct:11.4,vel:93.9},{type:'CH',name:'Changeup',pct:7.6,vel:87.9},{type:'FC',name:'Cutter',pct:1.7,vel:91.8}],
  'Tylor Megill': [{type:'FF',name:'Four-seam Fastball',pct:42.3,vel:95.4},{type:'SL',name:'Slider',pct:22.9,vel:83.9},{type:'SI',name:'Sinker',pct:19.5,vel:94.2},{type:'CH',name:'Changeup',pct:7.2,vel:88.2},{type:'CU',name:'Curveball',pct:7.0,vel:80.4},{type:'ST',name:'Sweeper',pct:1.1,vel:83.2}],
  'Valente Bellozo': [{type:'FC',name:'Cutter',pct:33.5,vel:84.8},{type:'FF',name:'Four-seam Fastball',pct:27.5,vel:90.8},{type:'ST',name:'Sweeper',pct:16.4,vel:78.8},{type:'CH',name:'Changeup',pct:15.1,vel:81.4},{type:'CU',name:'Curveball',pct:4.3,vel:76.4},{type:'FS',name:'Splitter',pct:1.6,vel:80.4},{type:'SI',name:'Sinker',pct:1.6,vel:88.6}],
  'Victor Mederos': [{type:'SI',name:'Sinker',pct:48.7,vel:94.6},{type:'SL',name:'Slider',pct:25.8,vel:89.1},{type:'ST',name:'Sweeper',pct:20.1,vel:81.8},{type:'CH',name:'Changeup',pct:3.8,vel:88.1},{type:'FS',name:'Splitter',pct:1.6,vel:87.8}],
  'Victor Vodnik': [{type:'FF',name:'Four-seam Fastball',pct:54.1,vel:98.7},{type:'CH',name:'Changeup',pct:25.2,vel:92.1},{type:'SL',name:'Slider',pct:14.5,vel:87.5},{type:'FC',name:'Cutter',pct:5.2,vel:92.5},{type:'SI',name:'Sinker',pct:1.0,vel:99.2}],
  'Wade Miley': [{type:'FC',name:'Cutter',pct:34.1,vel:88.3},{type:'CH',name:'Changeup',pct:23.9,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:92.1},{type:'SI',name:'Sinker',pct:15.1,vel:91.5},{type:'ST',name:'Sweeper',pct:3.4,vel:81.4},{type:'SL',name:'Slider',pct:1.0,vel:83.6},{type:'CU',name:'Curveball',pct:0.5,vel:79.7}],
  'Walbert Urena': [{type:'SI',name:'Sinker',pct:46.9,vel:98.4},{type:'CH',name:'Changeup',pct:19.4,vel:91.9},{type:'ST',name:'Sweeper',pct:18.8,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:15.0,vel:98.8}],
  'Walker Buehler': [{type:'FF',name:'Four-seam Fastball',pct:24.4,vel:93.9},{type:'FC',name:'Cutter',pct:17.5,vel:90.3},{type:'SI',name:'Sinker',pct:15.2,vel:93.7},{type:'SL',name:'Slider',pct:14.0,vel:87.4},{type:'KC',name:'Knuckle Curve',pct:13.4,vel:77.3},{type:'CH',name:'Changeup',pct:8.4,vel:89.2},{type:'ST',name:'Sweeper',pct:7.1,vel:81.0}],
  'Wander Suero': [{type:'FC',name:'Cutter',pct:76.4,vel:91.9},{type:'CH',name:'Changeup',pct:21.0,vel:85.2},{type:'CU',name:'Curveball',pct:2.5,vel:78.1}],
  'Wandy Peralta': [{type:'SI',name:'Sinker',pct:44.6,vel:95.4},{type:'CH',name:'Changeup',pct:35.5,vel:89.0},{type:'SL',name:'Slider',pct:16.5,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:3.4,vel:95.3}],
  'Wikelman González': [{type:'FF',name:'Four-seam Fastball',pct:56.0,vel:95.1},{type:'SV',name:'Slurve',pct:23.4,vel:79.4},{type:'CH',name:'Changeup',pct:15.5,vel:88.9},{type:'SL',name:'Slider',pct:5.2,vel:84.1}],
  'Will Klein': [{type:'FF',name:'Four-seam Fastball',pct:54.5,vel:97.8},{type:'CU',name:'Curveball',pct:21.1,vel:85.3},{type:'ST',name:'Sweeper',pct:11.8,vel:89.2},{type:'FC',name:'Cutter',pct:8.9,vel:92.6},{type:'SL',name:'Slider',pct:3.7,vel:90.1}],
  'Will Vest': [{type:'FF',name:'Four-seam Fastball',pct:51.0,vel:96.5},{type:'SL',name:'Slider',pct:24.8,vel:88.4},{type:'SI',name:'Sinker',pct:15.8,vel:95.9},{type:'CH',name:'Changeup',pct:8.4,vel:90.0}],
  'Will Warren': [{type:'FF',name:'Four-seam Fastball',pct:41.8,vel:93.4},{type:'SI',name:'Sinker',pct:21.6,vel:93.3},{type:'ST',name:'Sweeper',pct:20.8,vel:83.0},{type:'CH',name:'Changeup',pct:9.0,vel:87.0},{type:'CU',name:'Curveball',pct:6.7,vel:80.4}],
  'Xzavion Curry': [{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:90.5},{type:'SL',name:'Slider',pct:37.5,vel:80.2},{type:'CU',name:'Curveball',pct:17.9,vel:72.4},{type:'FS',name:'Splitter',pct:5.4,vel:85.6},{type:'ST',name:'Sweeper',pct:1.8,vel:80.0}],
  'Yaramil Hiraldo': [{type:'FF',name:'Four-seam Fastball',pct:35.6,vel:95.0},{type:'FS',name:'Splitter',pct:35.4,vel:86.8},{type:'SL',name:'Slider',pct:28.5,vel:86.5},{type:'SI',name:'Sinker',pct:0.5,vel:94.7}],
  'Yariel Rodríguez': [{type:'SL',name:'Slider',pct:41.8,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:95.7},{type:'FS',name:'Splitter',pct:12.2,vel:89.3},{type:'SI',name:'Sinker',pct:5.9,vel:95.5},{type:'PO',name:'PO',pct:0.1,vel:94.1}],
  'Yennier Cano': [{type:'SI',name:'Sinker',pct:45.5,vel:95.1},{type:'SL',name:'Slider',pct:20.5,vel:86.0},{type:'CH',name:'Changeup',pct:11.4,vel:91.8},{type:'FF',name:'Four-seam Fastball',pct:10.9,vel:94.9},{type:'FS',name:'Splitter',pct:9.1,vel:90.7},{type:'FC',name:'Cutter',pct:2.6,vel:92.0}],
  'Yerry De los Santos': [{type:'SI',name:'Sinker',pct:53.5,vel:95.6},{type:'CH',name:'Changeup',pct:27.4,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:10.2,vel:95.2},{type:'SL',name:'Slider',pct:9.0,vel:85.1}],
  'Yilber Díaz': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:95.4},{type:'SL',name:'Slider',pct:37.4,vel:83.5},{type:'KC',name:'Knuckle Curve',pct:9.1,vel:77.4}],
  'Yimi García': [{type:'FF',name:'Four-seam Fastball',pct:44.3,vel:96.0},{type:'CU',name:'Curveball',pct:17.3,vel:84.5},{type:'ST',name:'Sweeper',pct:17.3,vel:85.7},{type:'SI',name:'Sinker',pct:15.0,vel:95.2},{type:'CH',name:'Changeup',pct:5.6,vel:89.5},{type:'SL',name:'Slider',pct:0.6,vel:91.9}],
  'Yoendrys Gómez': [{type:'FF',name:'Four-seam Fastball',pct:34.8,vel:93.9},{type:'SI',name:'Sinker',pct:19.0,vel:93.3},{type:'ST',name:'Sweeper',pct:16.8,vel:82.4},{type:'CU',name:'Curveball',pct:12.2,vel:80.8},{type:'FC',name:'Cutter',pct:9.2,vel:90.4},{type:'CH',name:'Changeup',pct:6.9,vel:89.3},{type:'SL',name:'Slider',pct:1.1,vel:86.8}],
  'Yohan Ramírez': [{type:'FF',name:'Four-seam Fastball',pct:40.4,vel:96.4},{type:'ST',name:'Sweeper',pct:27.7,vel:83.5},{type:'CU',name:'Curveball',pct:17.0,vel:83.9},{type:'SI',name:'Sinker',pct:10.7,vel:96.1},{type:'SL',name:'Slider',pct:3.1,vel:87.0},{type:'FC',name:'Cutter',pct:1.0,vel:90.0},{type:'FA',name:'FA',pct:0.1,vel:70.1}],
  'Yoshinobu Yamamoto': [{type:'FF',name:'Four-seam Fastball',pct:32.5,vel:95.5},{type:'FS',name:'Splitter',pct:26.2,vel:91.0},{type:'CU',name:'Curveball',pct:17.9,vel:77.0},{type:'FC',name:'Cutter',pct:12.2,vel:91.2},{type:'SI',name:'Sinker',pct:7.9,vel:94.9},{type:'SL',name:'Slider',pct:3.2,vel:86.5},{type:'ST',name:'Sweeper',pct:0.0,vel:84.2}],
  'Yosver Zulueta': [{type:'SI',name:'Sinker',pct:38.7,vel:95.6},{type:'SL',name:'Slider',pct:38.2,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:16.2,vel:97.9},{type:'CH',name:'Changeup',pct:5.2,vel:88.5},{type:'CU',name:'Curveball',pct:1.7,vel:85.7}],
  'Yu Darvish': [{type:'SI',name:'Sinker',pct:20.0,vel:93.4},{type:'FF',name:'Four-seam Fastball',pct:16.8,vel:93.9},{type:'CU',name:'Curveball',pct:15.3,vel:71.1},{type:'SL',name:'Slider',pct:13.8,vel:85.9},{type:'FC',name:'Cutter',pct:11.8,vel:90.7},{type:'FS',name:'Splitter',pct:10.3,vel:86.3},{type:'ST',name:'Sweeper',pct:9.9,vel:82.8},{type:'KC',name:'Knuckle Curve',pct:1.3,vel:78.6},{type:'CH',name:'Changeup',pct:0.7,vel:88.0},{type:'PO',name:'PO',pct:0.1,vel:93.5},{type:'UN',name:'UN',pct:0.1,vel:71.3}],
  'Yuki Matsui': [{type:'FF',name:'Four-seam Fastball',pct:39.5,vel:92.1},{type:'FS',name:'Splitter',pct:32.2,vel:84.0},{type:'SL',name:'Slider',pct:15.9,vel:86.6},{type:'ST',name:'Sweeper',pct:10.7,vel:81.4},{type:'SI',name:'Sinker',pct:1.5,vel:91.5},{type:'CU',name:'Curveball',pct:0.2,vel:74.8}],
  'Yusei Kikuchi': [{type:'SL',name:'Slider',pct:34.7,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:94.8},{type:'CU',name:'Curveball',pct:14.6,vel:79.8},{type:'CH',name:'Changeup',pct:10.7,vel:85.6},{type:'FS',name:'Splitter',pct:2.8,vel:86.8},{type:'FC',name:'Cutter',pct:2.3,vel:89.9},{type:'SI',name:'Sinker',pct:1.0,vel:92.9},{type:'ST',name:'Sweeper',pct:0.2,vel:80.8}],
  'Zac Gallen': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:93.6},{type:'KC',name:'Knuckle Curve',pct:22.7,vel:81.1},{type:'CH',name:'Changeup',pct:15.9,vel:86.4},{type:'SL',name:'Slider',pct:14.1,vel:88.7},{type:'SI',name:'Sinker',pct:2.8,vel:93.2},{type:'FC',name:'Cutter',pct:0.1,vel:92.4},{type:'PO',name:'PO',pct:0.0,vel:91.2}],
  'Zach Agnos': [{type:'FC',name:'Cutter',pct:31.2,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:26.6,vel:95.7},{type:'FS',name:'Splitter',pct:17.1,vel:86.7},{type:'ST',name:'Sweeper',pct:14.2,vel:84.9},{type:'SL',name:'Slider',pct:5.3,vel:85.7},{type:'SI',name:'Sinker',pct:4.3,vel:94.5},{type:'CU',name:'Curveball',pct:1.3,vel:83.8}],
  'Zach Brzykcy': [{type:'FF',name:'Four-seam Fastball',pct:53.1,vel:94.7},{type:'CU',name:'Curveball',pct:24.0,vel:83.1},{type:'CH',name:'Changeup',pct:22.1,vel:88.2},{type:'FC',name:'Cutter',pct:0.8,vel:88.8}],
  'Zach Eflin': [{type:'FC',name:'Cutter',pct:22.0,vel:88.5},{type:'SI',name:'Sinker',pct:18.3,vel:91.8},{type:'CH',name:'Changeup',pct:16.8,vel:86.7},{type:'CU',name:'Curveball',pct:16.6,vel:78.1},{type:'ST',name:'Sweeper',pct:13.5,vel:79.2},{type:'FF',name:'Four-seam Fastball',pct:12.9,vel:92.0}],
  'Zach Maxwell': [{type:'FF',name:'Four-seam Fastball',pct:60.5,vel:99.4},{type:'FC',name:'Cutter',pct:20.5,vel:94.2},{type:'SL',name:'Slider',pct:19.0,vel:87.7}],
  'Zach Pop': [{type:'SI',name:'Sinker',pct:57.9,vel:96.3},{type:'SL',name:'Slider',pct:24.7,vel:86.1},{type:'FC',name:'Cutter',pct:15.8,vel:94.4},{type:'ST',name:'Sweeper',pct:1.6,vel:84.3}],
  'Zach Thompson': [{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:91.2},{type:'FC',name:'Cutter',pct:26.7,vel:85.3},{type:'CU',name:'Curveball',pct:15.0,vel:74.1},{type:'CH',name:'Changeup',pct:13.3,vel:84.9},{type:'SI',name:'Sinker',pct:5.0,vel:90.1}],
  'Zach Thornton': [{type:'SI',name:'Sinker',pct:40.0,vel:90.9},{type:'SL',name:'Slider',pct:28.3,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:90.4},{type:'CU',name:'Curveball',pct:8.3,vel:79.1},{type:'CH',name:'Changeup',pct:6.7,vel:82.6}],
  'Zack Kelly': [{type:'FC',name:'Cutter',pct:33.5,vel:91.7},{type:'ST',name:'Sweeper',pct:20.3,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:96.1},{type:'SI',name:'Sinker',pct:15.8,vel:96.1},{type:'CH',name:'Changeup',pct:10.2,vel:83.1},{type:'CU',name:'Curveball',pct:1.1,vel:82.8},{type:'PO',name:'PO',pct:0.1,vel:97.1}],
  'Zack Littell': [{type:'SL',name:'Slider',pct:27.6,vel:87.2},{type:'FS',name:'Splitter',pct:26.6,vel:83.4},{type:'FF',name:'Four-seam Fastball',pct:24.3,vel:92.0},{type:'SI',name:'Sinker',pct:15.6,vel:91.4},{type:'ST',name:'Sweeper',pct:5.9,vel:79.3}],
  'Zack Wheeler': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:96.1},{type:'SI',name:'Sinker',pct:17.1,vel:95.4},{type:'ST',name:'Sweeper',pct:14.9,vel:83.7},{type:'CU',name:'Curveball',pct:9.7,vel:81.1},{type:'FS',name:'Splitter',pct:8.9,vel:87.1},{type:'FC',name:'Cutter',pct:8.6,vel:91.8}],
  'Zak Kent': [{type:'SL',name:'Slider',pct:38.8,vel:85.9},{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:92.2},{type:'CU',name:'Curveball',pct:21.0,vel:81.3},{type:'SI',name:'Sinker',pct:4.6,vel:93.4},{type:'ST',name:'Sweeper',pct:0.7,vel:84.0}],
  'Zebby Matthews': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:96.2},{type:'SL',name:'Slider',pct:25.0,vel:88.1},{type:'FC',name:'Cutter',pct:13.3,vel:91.6},{type:'CH',name:'Changeup',pct:10.0,vel:87.5},{type:'CU',name:'Curveball',pct:5.8,vel:82.6},{type:'SI',name:'Sinker',pct:4.6,vel:95.6},{type:'FS',name:'Splitter',pct:0.4,vel:83.5}],
};
const PITCH_COLORS = {
  FF:'#3B82F6', SI:'#F472B6', FC:'#FB923C',
  SL:'#06D6A0', ST:'#A78BFA', CH:'#FACC15',
  CU:'#60a5fa', KC:'#818cf8', FS:'#4ade80',
  FO:'#4ade80', KN:'#e2e8f0', SV:'#c084fc',
  FA:'#3B82F6', CS:'#60a5fa', SC:'#f97316',
  EP:'#a78bfa',
};

function PitchBars({ pitches }) {
  if (!pitches?.length) return null;
  return (
    <div style={{ marginTop:12, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>
        Pitch usage · 2025 season to date · Statcast
      </div>
      {pitches.map(p => {
        const color = PITCH_COLORS[p.type] || '#94a3b8';
        return (
          <div key={p.type} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{p.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {p.vel && (
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{p.vel} mph</span>
                )}
                <span style={{ fontSize:12, fontWeight:600, color, minWidth:38, textAlign:'right' }}>{p.pct}%</span>
              </div>
            </div>
            <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${p.pct}%`, background:color, borderRadius:3, transition:'width 0.6s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PitcherCard({ pitcher, isWinner, isLoser, isFinal }) {
  const raw = PITCH_ARSENALS[pitcher.name] || null;
  const HIDDEN_PITCH_TYPES = new Set(['PO', 'FA', 'EP', 'CS']);
  const arsenal = raw ? raw.filter(p => !HIDDEN_PITCH_TYPES.has(p.type)) : null;
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';
  const showPitching = pitcher.isCurrentPitcher && !isFinal;
  const [playerPage, setPlayerPage] = useState(null);

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
      {playerPage && <PlayerPage playerId={playerPage.id} playerName={playerPage.name} onClose={() => setPlayerPage(null)} />}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <div onClick={() => setPlayerPage({ id: pitcher.id, name: pitcher.name })} style={{ cursor:'pointer' }}>
            <PlayerPhoto playerId={pitcher.id} name={pitcher.name} size={36} />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span
                onClick={() => setPlayerPage({ id: pitcher.id, name: pitcher.name })}
                style={{ color:'#60a5fa', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.5)', cursor:'pointer' }}
              >{pitcher.name}</span>
              {isWinner && <span style={{ fontSize:10, background:'rgba(74,222,128,0.15)', color:'#4ade80', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>W</span>}
              {isLoser && <span style={{ fontSize:10, background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>L</span>}
              {showPitching && <span style={{ fontSize:10, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>Pitching now</span>}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{roleLabel} · {pitcher.pitchCount} pitches</div>
            {(pitcher.seasonEra || pitcher.seasonWhip) && (
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3, display:'flex', gap:10, flexWrap:'wrap' }}>
                {pitcher.seasonEra && <span style={{ display:'flex', alignItems:'center', gap:4 }}>ERA {pitcher.seasonEra} <TrendArrow rating={rateERA(pitcher.seasonEra)} size={11} /></span>}
                {pitcher.seasonWhip && <span style={{ display:'flex', alignItems:'center', gap:4 }}>WHIP {pitcher.seasonWhip} <TrendArrow rating={rateWHIP(pitcher.seasonWhip)} size={11} /></span>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[['IP',pitcher.ip,false],['K',pitcher.k,false],['BB',pitcher.bb,false],['H',pitcher.h,false],['ER',pitcher.er,pitcher.er===0]].map(([label,val,good])=>(
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:600, color:good?'#4ade80':label==='ER'&&val>0?'#f87171':'#fff' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      {arsenal && <PitchBars pitches={arsenal} />}
    </div>
  );
}

function parseIP(ip) {
  const parts = String(ip).split('.');
  return parseInt(parts[0] || 0) + (parseInt(parts[1] || 0) / 3);
}

function analyzePitching({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, keyPlays, isFinal }) {
  const sp1 = awayPitchers.find(p => p.isStarter);
  const sp2 = homePitchers.find(p => p.isStarter);
  const rel1 = awayPitchers.filter(p => !p.isStarter);
  const rel2 = homePitchers.filter(p => !p.isStarter);
  const past = isFinal;

  const observations = [];

  const pairs = [
    [sp1, awayTeam, rel1, awayScore],
    [sp2, homeTeam, rel2, homeScore],
  ];

  for (const [sp, team, rels] of pairs) {
    if (!sp || sp.pitchCount < 15) continue;

    const ipNum = parseIP(sp.ip);
    const outs = Math.round(ipNum * 3);
    const ppo = outs > 0 ? sp.pitchCount / outs : null;
    const seasonEraNum = sp.seasonEra ? parseFloat(sp.seasonEra) : null;
    const gameEraEquiv = ipNum > 0 ? (sp.er / ipNum) * 9 : null;
    const whip = ipNum > 0 ? (sp.h + sp.bb) / ipNum : null;
    const hrsAllowed = keyPlays.filter(p => p.event === 'home_run' && p.pitcher === sp.name);

    // Pitch efficiency — high burn rate
    if (ppo !== null && ppo > 4.8 && sp.pitchCount >= 50) {
      if (ipNum < 5) {
        observations.push({ priority: 9, text: `${sp.name} ${past ? 'lasted' : 'has lasted'} just ${sp.ip} innings while throwing ${sp.pitchCount} pitches — ${ppo.toFixed(1)} per out — ${past ? 'putting the' : 'leaving a taxed'} ${team.abbr} bullpen to absorb the rest.` });
      } else {
        observations.push({ priority: 7, text: `${sp.name} ${past ? 'worked' : 'is working'} at an expensive ${ppo.toFixed(1)} pitches per out — ${sp.pitchCount} total — which ${past ? 'shortened' : 'threatens to shorten'} his outing more than the innings line suggests.` });
      }
    } else if (ppo !== null && ppo < 3.3 && sp.pitchCount >= 50) {
      const qsNote = ipNum >= 6 && sp.er <= 3 ? `, easily clearing a quality start` : '';
      observations.push({ priority: 5, text: `${sp.name} ${past ? 'was' : 'is'} dialled in on efficiency — ${ppo.toFixed(1)} pitches per out${qsNote}.` });
    }

    // Walk problems
    if (sp.bb >= 4) {
      observations.push({ priority: 9, text: `${sp.name} ${past ? 'had' : 'has'} a command problem: ${sp.bb} walks${sp.k > sp.bb ? ` against ${sp.k} strikeouts` : ` with only ${sp.k} Ks`}, running up pitch counts and ${past ? 'keeping' : 'keeping'} opponents on base all day.` });
    } else if (sp.bb === 0 && sp.k >= 5) {
      observations.push({ priority: 7, text: `${sp.name} ${past ? 'didn\'t issue' : 'hasn\'t issued'} a single walk and ${past ? 'struck out' : 'has struck out'} ${sp.k} — that kind of command means you almost never need to fear the big inning.` });
    } else if (sp.bb === 0 && sp.k >= 3) {
      observations.push({ priority: 5, text: `${sp.name} ${past ? 'kept it clean' : 'is keeping it clean'} with zero walks allowed.` });
    } else if (sp.k >= 8) {
      observations.push({ priority: 7, text: `${sp.name} ${past ? 'was' : 'is'} in strikeout mode — ${sp.k} Ks through ${sp.ip} innings, which at that pace makes hitters look helpless.` });
    }

    // Performance vs season norm
    if (seasonEraNum && gameEraEquiv !== null && ipNum >= 4) {
      const diff = gameEraEquiv - seasonEraNum;
      if (diff > 3.5 && sp.er >= 3) {
        observations.push({ priority: 8, text: `${sp.name} came in with a ${sp.seasonEra} ERA but ${past ? 'had' : 'is having'} a rough one — ${sp.er} earned over ${sp.ip} innings is well below his standard.` });
      } else if (diff < -2.5 && ipNum >= 5 && sp.er <= 2) {
        observations.push({ priority: 6, text: `${sp.name}'s ${sp.seasonEra} ERA doesn't tell the full story today — ${sp.er === 0 ? 'he\'s been spotless' : `only ${sp.er} earned in ${sp.ip} innings`}, one of his stronger outings.` });
      }
    }

    // Home runs allowed — multiple
    if (hrsAllowed.length >= 2) {
      observations.push({ priority: 8, text: `${sp.name} ${past ? 'gave up' : 'has given up'} ${hrsAllowed.length} home runs — the long ball ${past ? 'was' : 'is'} the defining story of his day.` });
    }

    // High WHIP — traffic without necessarily a blowup
    if (whip !== null && whip > 1.75 && ipNum >= 4 && sp.er <= 2) {
      observations.push({ priority: 5, text: `${sp.name} ${past ? 'pitched around' : 'is pitching around'} heavy traffic — a game WHIP over ${whip.toFixed(2)} — but ${past ? 'kept' : 'is keeping'} the damage limited.` });
    }

    // Bullpen overuse after early starter exit
    if (ipNum < 4.1 && rels.length >= 3) {
      const totalRelIP = rels.reduce((s, p) => s + parseIP(p.ip), 0);
      observations.push({ priority: 7, text: `With ${sp.name} out after ${sp.ip} innings, the ${team.name} bullpen ${past ? 'was leaned on heavily' : 'is carrying the load'} — ${rels.length} relievers covering ${totalRelIP.toFixed(1)} frames.` });
    }
  }

  // Contrast between the two starters
  if (sp1 && sp2) {
    const ip1 = parseIP(sp1.ip);
    const ip2 = parseIP(sp2.ip);
    const diff = Math.abs(ip1 - ip2);
    if (diff >= 2.1) {
      const longer = ip1 > ip2 ? sp1 : sp2;
      const shorter = ip1 > ip2 ? sp2 : sp1;
      const longerTeam = longer === sp1 ? awayTeam : homeTeam;
      observations.push({ priority: 4, text: `${longer.name} went ${longer.ip} innings while ${shorter.name} lasted just ${shorter.ip} — a clear rotation edge for ${longerTeam.abbr} on the day.` });
    }
  }

  observations.sort((a, b) => b.priority - a.priority);
  const picked = observations.slice(0, 3);

  if (!picked.length) {
    const parts = [];
    if (sp1) parts.push(`${sp1.name} ${past ? 'went' : 'has gone'} ${sp1.ip} innings for ${awayTeam.abbr}${sp1.er === 0 ? ', allowing no earned runs' : `, giving up ${sp1.er} earned`}.`);
    if (sp2) parts.push(`${sp2.name} ${past ? 'went' : 'has gone'} ${sp2.ip} for ${homeTeam.abbr}${sp2.er === 0 ? ' and kept it scoreless' : `, yielding ${sp2.er} earned`}.`);
    return parts.join(' ') || 'No pitching data available yet.';
  }

  return picked.map(o => o.text).join(' ');
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf }) {
  const text = analyzePitching({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, keyPlays, isFinal });

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>Analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color:'rgba(255,255,255,0.75)' }}>
        {text}
      </div>
    </div>
  );
}

function generateRecap({ awayTeam, homeTeam, awayScore, homeScore, awayPitchers, homePitchers, awayBatters, homeBatters, keyPlays, decisions }) {
  const winner = awayScore > homeScore ? awayTeam : homeTeam;
  const loser = awayScore > homeScore ? homeTeam : awayTeam;
  const winScore = Math.max(awayScore, homeScore);
  const loseScore = Math.min(awayScore, homeScore);
  const margin = winScore - loseScore;

  const sp1 = awayPitchers.find(p => p.isStarter);
  const sp2 = homePitchers.find(p => p.isStarter);
  const winnerSP = winner === awayTeam ? sp1 : sp2;
  const loserSP = winner === awayTeam ? sp2 : sp1;

  const hrs = keyPlays.filter(p => p.event === 'home_run');
  const allBatters = [...awayBatters, ...homeBatters];
  const topBatter = allBatters
    .filter(b => b.h >= 2 || b.rbi >= 2 || b.hr > 0)
    .sort((a, b) => (b.hr * 3 + b.rbi * 2 + b.h) - (a.hr * 3 + a.rbi * 2 + a.h))[0];
  const topBatterTeam = topBatter && awayBatters.includes(topBatter) ? awayTeam : homeTeam;

  const parts = [];

  // Opening — lead with the most interesting story
  if (winnerSP && parseIP(winnerSP.ip) >= 6 && winnerSP.er <= 2) {
    const outs = Math.round(parseIP(winnerSP.ip) * 3);
    const ppo = outs > 0 ? (winnerSP.pitchCount / outs).toFixed(1) : null;
    const kNote = winnerSP.k >= 7 ? ` and punching out ${winnerSP.k}` : winnerSP.k >= 5 ? ` with ${winnerSP.k} strikeouts` : '';
    parts.push(`${winnerSP.name} carried ${winner.name} to a ${winScore}-${loseScore} win, going ${winnerSP.ip} innings${kNote}${ppo ? ` on ${ppo} pitches per out` : ``} while allowing just ${winnerSP.er === 0 ? 'nothing' : winnerSP.er + ' earned'}.`);
  } else if (hrs.length >= 2) {
    const hrNames = hrs.slice(0, 2).map(h => h.batter).join(' and ');
    parts.push(`${winner.name} won ${winScore}-${loseScore} on the long ball — ${hrNames} both went deep in a ${margin <= 2 ? 'tight' : 'decisive'} performance.`);
  } else if (topBatter && topBatterTeam === winner && (topBatter.rbi >= 3 || topBatter.hr > 0)) {
    parts.push(`${topBatter.name} was the difference in ${winner.name}'s ${winScore}-${loseScore} win — ${topBatter.rbi} RBI${topBatter.hr > 0 ? ' with a home run' : ''}${topBatter.h >= 2 ? ` and ${topBatter.h} hits` : ''}.`);
  } else if (margin >= 5) {
    parts.push(`${winner.name} were never seriously tested, rolling to a ${winScore}-${loseScore} win over ${loser.name}.`);
  } else {
    parts.push(`${winner.name} held on for a ${winScore}-${loseScore} decision against ${loser.name}.`);
  }

  // Loser's starter if they were the main story on that side
  if (loserSP && loserSP.er >= 4 && parseIP(loserSP.ip) < 5) {
    parts.push(`${loserSP.name} couldn't get out of trouble for ${loser.name}, giving up ${loserSP.er} earned in just ${loserSP.ip} innings.`);
  } else if (loserSP && loserSP.bb >= 4) {
    parts.push(`${loserSP.name}'s ${loserSP.bb} walks doomed ${loser.name} — free passes kept turning into runs.`);
  }

  // Top hitter if not already mentioned
  if (topBatter && !parts.some(s => s.includes(topBatter.name))) {
    const atBatStr = topBatter.ab > 0 ? `${topBatter.h}-for-${topBatter.ab}` : `${topBatter.h}H`;
    parts.push(`${topBatter.name} (${topBatterTeam.abbr}) went ${atBatStr}${topBatter.rbi > 0 ? ` with ${topBatter.rbi} RBI` : ''}.`);
  }

  // Decisions line
  if (decisions?.winner?.fullName && !parts.some(s => s.includes(decisions.winner.fullName))) {
    const saveStr = decisions.save?.fullName ? ` ${decisions.save.fullName} closed it out.` : '';
    parts.push(`${decisions.winner.fullName} picks up the win.${saveStr}`);
  }

  return parts.slice(0, 3).join(' ') || `${winner.name} defeated ${loser.name} ${winScore}-${loseScore}.`;
}

export function GameRecap({ awayTeam, homeTeam, awayScore, homeScore, awayPitchers, homePitchers, awayBatters, homeBatters, keyPlays, decisions }) {
  const text = generateRecap({ awayTeam, homeTeam, awayScore, homeScore, awayPitchers, homePitchers, awayBatters, homeBatters, keyPlays, decisions });

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:10 }}>
        Game recap
      </div>
      <div style={{ fontSize:14, lineHeight:1.75, color:'rgba(255,255,255,0.85)' }}>
        {text}
      </div>
    </div>
  );
}


export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf } = data;
  const winnerName = decisions?.winner?.fullName || '';
  const loserName = decisions?.loser?.fullName || '';

  return (
    <div className="tab-panel">
      {/* Only show AI analysis once there's something to analyse */}
      {(() => {
        const allPitchers = [...awayPitchers, ...homePitchers];
        const totalPitches = allPitchers.reduce((sum, p) => sum + (p.pitchCount || 0), 0);
        if (totalPitches < 20) return null;
        return (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
            <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} awayBatters={awayBatters||[]} homeBatters={homeBatters||[]} keyPlays={keyPlays||[]} isFinal={isFinal} inning={inning} inningHalf={inningHalf} />
          </div>
        );
      })()}
      {[['away', awayTeam, awayPitchers], ['home', homeTeam, homePitchers]].map(([side, team, pitchers]) => (
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p => (
            <PitcherCard key={p.id} pitcher={p} isFinal={isFinal}
              isWinner={winnerName && p.name === winnerName}
              isLoser={loserName && p.name === loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
    </div>
  );
}
