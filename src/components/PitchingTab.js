import React, { useState, useEffect } from 'react';
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
  'A.J. Minter': [{type:'FC',name:'Cutter',pct:47.9,vel:89.3},{type:'FF',name:'Four-seam Fastball',pct:41.9,vel:94.4},{type:'CH',name:'Changeup',pct:10.2,vel:86.1}],
  'A.J. Puk': [{type:'FF',name:'Four-seam Fastball',pct:62.6,vel:96.3},{type:'SL',name:'Slider',pct:35.9,vel:85.4},{type:'SI',name:'Sinker',pct:1.0,vel:95.8}],
  'AJ Blubaugh': [{type:'FF',name:'Four-seam Fastball',pct:54.8,vel:94.6},{type:'ST',name:'Sweeper',pct:21.3,vel:81.8},{type:'CH',name:'Changeup',pct:19.3,vel:86.4},{type:'CU',name:'Curveball',pct:3.4,vel:78.3},{type:'FC',name:'Cutter',pct:1.2,vel:86.4}],
  'AJ Smith-Shawver': [{type:'FF',name:'Four-seam Fastball',pct:46.7,vel:95.6},{type:'FS',name:'Splitter',pct:33.9,vel:83.2},{type:'CU',name:'Curveball',pct:15.2,vel:77.3},{type:'SL',name:'Slider',pct:4.2,vel:86.9}],
  'Aaron Ashby': [{type:'SI',name:'Sinker',pct:51.3,vel:97.5},{type:'CU',name:'Curveball',pct:26.4,vel:82.2},{type:'CH',name:'Changeup',pct:11.8,vel:91.4},{type:'SL',name:'Slider',pct:8.1,vel:84.2},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:96.9}],
  'Aaron Bummer': [{type:'CU',name:'Curveball',pct:35.1,vel:81.0},{type:'SI',name:'Sinker',pct:34.8,vel:90.8},{type:'ST',name:'Sweeper',pct:17.6,vel:81.2},{type:'FF',name:'Four-seam Fastball',pct:12.4,vel:91.6}],
  'Aaron Civale': [{type:'FC',name:'Cutter',pct:35.0,vel:89.2},{type:'CU',name:'Curveball',pct:18.9,vel:77.7},{type:'SI',name:'Sinker',pct:16.8,vel:92.3},{type:'FF',name:'Four-seam Fastball',pct:15.5,vel:92.1},{type:'SL',name:'Slider',pct:7.7,vel:83.3},{type:'FS',name:'Splitter',pct:5.8,vel:85.7}],
  'Aaron Nola': [{type:'FF',name:'Four-seam Fastball',pct:30.2,vel:91.7},{type:'KC',name:'Knuckle Curve',pct:29.0,vel:78.1},{type:'SI',name:'Sinker',pct:17.6,vel:90.6},{type:'CH',name:'Changeup',pct:15.8,vel:84.7},{type:'FC',name:'Cutter',pct:7.4,vel:86.1}],
  'Abner Uribe': [{type:'SI',name:'Sinker',pct:51.9,vel:98.7},{type:'SL',name:'Slider',pct:46.0,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:2.1,vel:99.8}],
  'Abraham Toro': [{type:'EP',name:'Eephus',pct:86.7,vel:41.6},{type:'FA',name:'Fastball',pct:13.3,vel:56.8}],
  'Adam Mazur': [{type:'SL',name:'Slider',pct:28.6,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:23.9,vel:94.8},{type:'SI',name:'Sinker',pct:16.0,vel:94.3},{type:'ST',name:'Sweeper',pct:12.3,vel:83.5},{type:'CU',name:'Curveball',pct:10.8,vel:82.4},{type:'CH',name:'Changeup',pct:8.4,vel:89.3}],
  'Adam Ottavino': [{type:'SI',name:'Sinker',pct:35.7,vel:92.3},{type:'ST',name:'Sweeper',pct:33.3,vel:78.7},{type:'FF',name:'Four-seam Fastball',pct:23.8,vel:93.1},{type:'FC',name:'Cutter',pct:7.1,vel:86.9}],
  'Adisyn Coffey': [{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:94.5},{type:'SL',name:'Slider',pct:33.3,vel:87.6},{type:'CH',name:'Changeup',pct:29.6,vel:83.8}],
  'Adonis Medina': [{type:'SI',name:'Sinker',pct:57.9,vel:92.1},{type:'CH',name:'Changeup',pct:36.8,vel:85.5},{type:'ST',name:'Sweeper',pct:5.3,vel:83.7}],
  'Adrian Houser': [{type:'SI',name:'Sinker',pct:45.6,vel:94.4},{type:'SL',name:'Slider',pct:15.5,vel:88.0},{type:'CH',name:'Changeup',pct:15.1,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:12.2,vel:95.2},{type:'CU',name:'Curveball',pct:11.6,vel:81.7}],
  'Adrian Morejon': [{type:'SI',name:'Sinker',pct:61.2,vel:97.7},{type:'SL',name:'Slider',pct:24.2,vel:87.5},{type:'CH',name:'Changeup',pct:6.7,vel:90.6},{type:'FC',name:'Cutter',pct:3.7,vel:94.1},{type:'FF',name:'Four-seam Fastball',pct:3.5,vel:96.5}],
  'Alan Busenitz': [{type:'SI',name:'Sinker',pct:44.4,vel:90.6},{type:'FF',name:'Four-seam Fastball',pct:22.2,vel:93.2},{type:'CU',name:'Curveball',pct:11.1,vel:83.3},{type:'FC',name:'Cutter',pct:11.1,vel:89.0},{type:'ST',name:'Sweeper',pct:11.1,vel:81.1}],
  'Alan Rangel': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:92.8},{type:'CH',name:'Changeup',pct:31.0,vel:82.2},{type:'SL',name:'Slider',pct:19.0,vel:85.0},{type:'CU',name:'Curveball',pct:6.3,vel:73.6}],
  'Alan Trejo': [{type:'FA',name:'Fastball',pct:81.2,vel:82.6},{type:'CH',name:'Changeup',pct:18.8,vel:59.1}],
  'Albert Suárez': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:93.9},{type:'FC',name:'Cutter',pct:21.0,vel:86.4},{type:'CH',name:'Changeup',pct:13.7,vel:85.6},{type:'CU',name:'Curveball',pct:12.4,vel:79.6},{type:'SV',name:'Slurve',pct:12.0,vel:81.0}],
  'Alec Burleson': [{type:'CH',name:'Changeup',pct:100.0,vel:51.2}],
  'Alejandro Lugo': [{type:'SI',name:'Sinker',pct:80.0,vel:90.8},{type:'SL',name:'Slider',pct:20.0,vel:81.0}],
  'Alek Jacob': [{type:'FF',name:'Four-seam Fastball',pct:41.1,vel:85.4},{type:'CH',name:'Changeup',pct:32.2,vel:74.4},{type:'SI',name:'Sinker',pct:15.4,vel:84.3},{type:'ST',name:'Sweeper',pct:11.4,vel:72.1}],
  'Alex Carrillo': [{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:97.8},{type:'SL',name:'Slider',pct:32.1,vel:86.9},{type:'FS',name:'Splitter',pct:26.2,vel:90.4}],
  'Alex Jackson': [{type:'FA',name:'Fastball',pct:54.2,vel:62.2},{type:'EP',name:'Eephus',pct:45.8,vel:40.5}],
  'Alex Lange': [{type:'SL',name:'Slider',pct:60.0,vel:88.4},{type:'CH',name:'Changeup',pct:15.0,vel:91.1},{type:'SI',name:'Sinker',pct:15.0,vel:96.2},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:95.9}],
  'Alex Pham': [{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:93.8},{type:'FC',name:'Cutter',pct:32.7,vel:86.6},{type:'CU',name:'Curveball',pct:26.9,vel:77.4},{type:'SL',name:'Slider',pct:1.9,vel:83.7}],
  'Alex Speas': [{type:'SL',name:'Slider',pct:42.1,vel:88.6},{type:'FC',name:'Cutter',pct:36.8,vel:94.4},{type:'FF',name:'Four-seam Fastball',pct:21.1,vel:98.4}],
  'Alex Vesia': [{type:'FF',name:'Four-seam Fastball',pct:57.9,vel:92.7},{type:'SL',name:'Slider',pct:35.8,vel:84.9},{type:'CH',name:'Changeup',pct:6.3,vel:83.8}],
  'Alexis Díaz': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:93.6},{type:'SL',name:'Slider',pct:42.3,vel:87.5}],
  'Ali Sánchez': [{type:'CS',name:'Slow Curve',pct:77.8,vel:57.8},{type:'EP',name:'Eephus',pct:16.7,vel:34.1},{type:'FA',name:'Fastball',pct:5.6,vel:77.0}],
  'Allan Hernandez': [{type:'FC',name:'Cutter',pct:47.6,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:96.6},{type:'SI',name:'Sinker',pct:19.0,vel:96.2}],
  'Allan Winans': [{type:'CH',name:'Changeup',pct:32.9,vel:82.8},{type:'SI',name:'Sinker',pct:28.7,vel:90.1},{type:'ST',name:'Sweeper',pct:22.1,vel:80.3},{type:'FF',name:'Four-seam Fastball',pct:13.3,vel:89.9},{type:'CU',name:'Curveball',pct:2.9,vel:76.5}],
  'Alonzo Richardson': [{type:'SL',name:'Slider',pct:36.0,vel:81.7},{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:90.3},{type:'CU',name:'Curveball',pct:20.0,vel:79.8},{type:'CH',name:'Changeup',pct:12.0,vel:83.0},{type:'SI',name:'Sinker',pct:4.0,vel:91.1}],
  'Amed Rosario': [{type:'EP',name:'Eephus',pct:92.9,vel:48.9},{type:'FA',name:'Fastball',pct:7.1,vel:63.0}],
  'Amos Willingham': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:94.0},{type:'CH',name:'Changeup',pct:26.2,vel:86.5},{type:'FC',name:'Cutter',pct:26.2,vel:85.5},{type:'SL',name:'Slider',pct:9.5,vel:85.4}],
  'Anderson Paulino': [{type:'FF',name:'Four-seam Fastball',pct:66.7,vel:96.5},{type:'SI',name:'Sinker',pct:33.3,vel:97.0}],
  'Andre Granillo': [{type:'SL',name:'Slider',pct:63.7,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:28.9,vel:94.6},{type:'CH',name:'Changeup',pct:6.1,vel:88.3},{type:'SI',name:'Sinker',pct:1.3,vel:95.1}],
  'Andre Pallante': [{type:'FF',name:'Four-seam Fastball',pct:44.3,vel:94.4},{type:'SL',name:'Slider',pct:28.3,vel:87.4},{type:'KC',name:'Knuckle Curve',pct:13.9,vel:78.2},{type:'SI',name:'Sinker',pct:13.4,vel:94.9}],
  'Andrew Abbott': [{type:'FF',name:'Four-seam Fastball',pct:47.5,vel:92.7},{type:'CH',name:'Changeup',pct:19.5,vel:84.8},{type:'CU',name:'Curveball',pct:14.7,vel:81.0},{type:'ST',name:'Sweeper',pct:14.1,vel:82.8},{type:'FC',name:'Cutter',pct:4.1,vel:88.6}],
  'Andrew Alvarez': [{type:'FF',name:'Four-seam Fastball',pct:34.1,vel:91.3},{type:'SL',name:'Slider',pct:29.0,vel:82.4},{type:'CU',name:'Curveball',pct:27.1,vel:82.5},{type:'CH',name:'Changeup',pct:5.3,vel:85.2},{type:'SI',name:'Sinker',pct:4.6,vel:90.9}],
  'Andrew Bechtold': [{type:'FC',name:'Cutter',pct:57.9,vel:87.7},{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:97.8}],
  'Andrew Chafin': [{type:'SI',name:'Sinker',pct:40.3,vel:89.7},{type:'SL',name:'Slider',pct:39.1,vel:80.5},{type:'FF',name:'Four-seam Fastball',pct:20.1,vel:89.5}],
  'Andrew Dalquist': [{type:'FF',name:'Four-seam Fastball',pct:54.3,vel:94.8},{type:'CU',name:'Curveball',pct:42.9,vel:79.3},{type:'SI',name:'Sinker',pct:2.9,vel:95.5}],
  'Andrew Heaney': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:90.1},{type:'CH',name:'Changeup',pct:17.3,vel:82.0},{type:'SL',name:'Slider',pct:16.6,vel:80.5},{type:'SI',name:'Sinker',pct:11.2,vel:89.2},{type:'CU',name:'Curveball',pct:5.8,vel:76.8},{type:'CS',name:'Slow Curve',pct:5.4,vel:73.5}],
  'Andrew Hoffmann': [{type:'CH',name:'Changeup',pct:48.7,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:40.7,vel:94.6},{type:'SL',name:'Slider',pct:7.3,vel:87.6},{type:'CU',name:'Curveball',pct:3.3,vel:84.1}],
  'Andrew Kittredge': [{type:'SL',name:'Slider',pct:52.6,vel:89.3},{type:'SI',name:'Sinker',pct:36.0,vel:95.2},{type:'FF',name:'Four-seam Fastball',pct:10.5,vel:94.8}],
  'Andrew Magno': [{type:'FF',name:'Four-seam Fastball',pct:75.0,vel:94.0},{type:'SL',name:'Slider',pct:25.0,vel:83.0}],
  'Andrew Marrero': [{type:'SL',name:'Slider',pct:75.0,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:90.0}],
  'Andrew Misiaszek': [{type:'SL',name:'Slider',pct:65.4,vel:83.7},{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:90.4},{type:'CH',name:'Changeup',pct:3.8,vel:84.9}],
  'Andrew Moore': [{type:'FF',name:'Four-seam Fastball',pct:56.2,vel:96.3},{type:'SI',name:'Sinker',pct:18.8,vel:96.7},{type:'SL',name:'Slider',pct:18.8,vel:84.0},{type:'CU',name:'Curveball',pct:6.2,vel:81.1}],
  'Andrew Saalfrank': [{type:'SI',name:'Sinker',pct:45.7,vel:89.3},{type:'CU',name:'Curveball',pct:44.7,vel:79.7},{type:'FF',name:'Four-seam Fastball',pct:9.6,vel:89.2}],
  'Andrew Walters': [{type:'FF',name:'Four-seam Fastball',pct:64.0,vel:96.7},{type:'SL',name:'Slider',pct:28.1,vel:87.2},{type:'FS',name:'Splitter',pct:7.9,vel:87.3}],
  'Andry Lara': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:94.2},{type:'SL',name:'Slider',pct:32.5,vel:86.0},{type:'SI',name:'Sinker',pct:16.1,vel:94.5},{type:'FS',name:'Splitter',pct:5.9,vel:88.2}],
  'Andrés Muñoz': [{type:'SL',name:'Slider',pct:49.9,vel:86.1},{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:98.4},{type:'SI',name:'Sinker',pct:13.0,vel:97.7},{type:'CH',name:'Changeup',pct:2.1,vel:91.6}],
  'Angel Chivilli': [{type:'FF',name:'Four-seam Fastball',pct:46.1,vel:97.1},{type:'CH',name:'Changeup',pct:36.5,vel:88.7},{type:'SL',name:'Slider',pct:17.4,vel:90.2}],
  'Angel Cuenca': [{type:'CH',name:'Changeup',pct:42.9,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:90.7},{type:'CU',name:'Curveball',pct:14.3,vel:78.0}],
  'Angel Perdomo': [{type:'FF',name:'Four-seam Fastball',pct:62.7,vel:92.8},{type:'SL',name:'Slider',pct:29.7,vel:83.8},{type:'CH',name:'Changeup',pct:7.6,vel:90.2}],
  'Angel Zerpa': [{type:'SI',name:'Sinker',pct:43.4,vel:96.6},{type:'SL',name:'Slider',pct:31.7,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:20.8,vel:96.2},{type:'CH',name:'Changeup',pct:4.0,vel:90.5}],
  'Anthony Banda': [{type:'SL',name:'Slider',pct:49.3,vel:85.9},{type:'FF',name:'Four-seam Fastball',pct:23.7,vel:95.9},{type:'SI',name:'Sinker',pct:23.3,vel:95.8},{type:'CH',name:'Changeup',pct:3.7,vel:89.9}],
  'Anthony Bender': [{type:'ST',name:'Sweeper',pct:44.6,vel:83.9},{type:'SI',name:'Sinker',pct:27.6,vel:96.5},{type:'SL',name:'Slider',pct:22.4,vel:87.3},{type:'CH',name:'Changeup',pct:3.8,vel:89.2},{type:'FF',name:'Four-seam Fastball',pct:1.6,vel:95.4}],
  'Anthony DeSclafani': [{type:'SL',name:'Slider',pct:22.1,vel:88.2},{type:'KC',name:'Knuckle Curve',pct:21.5,vel:83.2},{type:'FS',name:'Splitter',pct:20.3,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:93.9},{type:'SI',name:'Sinker',pct:17.8,vel:94.1}],
  'Anthony Maldonado': [{type:'SL',name:'Slider',pct:51.9,vel:83.9},{type:'FF',name:'Four-seam Fastball',pct:48.1,vel:92.5}],
  'Anthony Misiewicz': [{type:'FC',name:'Cutter',pct:57.6,vel:87.6},{type:'CH',name:'Changeup',pct:18.4,vel:86.6},{type:'CU',name:'Curveball',pct:16.0,vel:78.2},{type:'FF',name:'Four-seam Fastball',pct:8.0,vel:92.1}],
  'Anthony Molina': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:95.6},{type:'CH',name:'Changeup',pct:18.1,vel:87.0},{type:'CU',name:'Curveball',pct:15.0,vel:83.4},{type:'SL',name:'Slider',pct:14.3,vel:86.9},{type:'SI',name:'Sinker',pct:4.8,vel:94.9},{type:'FC',name:'Cutter',pct:3.5,vel:91.0}],
  'Anthony Seigler': [{type:'FA',name:'Fastball',pct:100.0,vel:70.0}],
  'Anthony Veneziano': [{type:'FF',name:'Four-seam Fastball',pct:30.6,vel:94.1},{type:'ST',name:'Sweeper',pct:28.1,vel:82.7},{type:'SL',name:'Slider',pct:22.6,vel:87.1},{type:'SI',name:'Sinker',pct:10.7,vel:92.7},{type:'CH',name:'Changeup',pct:8.0,vel:87.3}],
  'Antonio Jimenez': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:94.2},{type:'SI',name:'Sinker',pct:25.0,vel:93.5},{type:'SL',name:'Slider',pct:25.0,vel:80.9}],
  'Antonio Menendez': [{type:'SI',name:'Sinker',pct:64.3,vel:89.2},{type:'ST',name:'Sweeper',pct:21.4,vel:80.3},{type:'CU',name:'Curveball',pct:14.3,vel:85.3}],
  'Antonio Senzatela': [{type:'FF',name:'Four-seam Fastball',pct:57.0,vel:95.0},{type:'SL',name:'Slider',pct:18.6,vel:86.8},{type:'CU',name:'Curveball',pct:14.5,vel:80.3},{type:'CH',name:'Changeup',pct:7.7,vel:87.6},{type:'FC',name:'Cutter',pct:1.7,vel:91.2}],
  'Aroldis Chapman': [{type:'FF',name:'Four-seam Fastball',pct:40.4,vel:98.4},{type:'SI',name:'Sinker',pct:33.1,vel:99.4},{type:'SL',name:'Slider',pct:15.6,vel:86.7},{type:'FS',name:'Splitter',pct:11.0,vel:91.2}],
  'Austin Cox': [{type:'FF',name:'Four-seam Fastball',pct:35.9,vel:92.8},{type:'SL',name:'Slider',pct:31.2,vel:86.6},{type:'CU',name:'Curveball',pct:17.9,vel:80.3},{type:'FS',name:'Splitter',pct:10.0,vel:82.2},{type:'FC',name:'Cutter',pct:4.5,vel:90.9}],
  'Austin Davis': [{type:'SI',name:'Sinker',pct:71.4,vel:91.3},{type:'ST',name:'Sweeper',pct:28.6,vel:77.6}],
  'Austin Gomber': [{type:'FF',name:'Four-seam Fastball',pct:34.0,vel:89.4},{type:'KC',name:'Knuckle Curve',pct:24.8,vel:76.0},{type:'CH',name:'Changeup',pct:16.4,vel:81.0},{type:'SL',name:'Slider',pct:15.3,vel:82.4},{type:'FC',name:'Cutter',pct:4.6,vel:86.0},{type:'FS',name:'Splitter',pct:4.5,vel:81.0}],
  'Austin Hedges': [{type:'FA',name:'Fastball',pct:87.5,vel:73.0},{type:'EP',name:'Eephus',pct:12.5,vel:55.3}],
  'Austin Nola': [{type:'FA',name:'Fastball',pct:55.2,vel:57.9},{type:'EP',name:'Eephus',pct:44.8,vel:49.3}],
  'Austin Pope': [{type:'FF',name:'Four-seam Fastball',pct:52.8,vel:94.1},{type:'SL',name:'Slider',pct:25.0,vel:84.4},{type:'CU',name:'Curveball',pct:16.7,vel:81.4},{type:'SI',name:'Sinker',pct:5.6,vel:92.6}],
  'Austin Slater': [{type:'EP',name:'Eephus',pct:100.0,vel:38.8}],
  'Austin Warren': [{type:'SI',name:'Sinker',pct:34.4,vel:94.0},{type:'ST',name:'Sweeper',pct:30.0,vel:83.9},{type:'FC',name:'Cutter',pct:16.2,vel:88.4},{type:'FF',name:'Four-seam Fastball',pct:14.4,vel:93.8},{type:'CH',name:'Changeup',pct:4.4,vel:87.6}],
  'Avery Weems': [{type:'CH',name:'Changeup',pct:33.3,vel:86.1},{type:'CU',name:'Curveball',pct:33.3,vel:79.6},{type:'SL',name:'Slider',pct:33.3,vel:85.5}],
  'Bailey Dees': [{type:'FF',name:'Four-seam Fastball',pct:46.7,vel:93.0},{type:'SL',name:'Slider',pct:28.9,vel:83.4},{type:'CH',name:'Changeup',pct:24.4,vel:83.4}],
  'Bailey Falter': [{type:'FF',name:'Four-seam Fastball',pct:50.7,vel:92.1},{type:'SL',name:'Slider',pct:18.3,vel:85.0},{type:'CU',name:'Curveball',pct:12.9,vel:77.7},{type:'SI',name:'Sinker',pct:9.8,vel:92.1},{type:'FS',name:'Splitter',pct:7.5,vel:85.2}],
  'Bailey Horn': [{type:'FF',name:'Four-seam Fastball',pct:33.0,vel:95.5},{type:'ST',name:'Sweeper',pct:32.6,vel:84.7},{type:'SI',name:'Sinker',pct:19.1,vel:95.2},{type:'FC',name:'Cutter',pct:15.2,vel:88.3}],
  'Bailey Ober': [{type:'FF',name:'Four-seam Fastball',pct:36.2,vel:90.2},{type:'CH',name:'Changeup',pct:28.3,vel:83.2},{type:'SL',name:'Slider',pct:17.7,vel:83.6},{type:'ST',name:'Sweeper',pct:10.5,vel:78.4},{type:'CU',name:'Curveball',pct:4.0,vel:75.0},{type:'SI',name:'Sinker',pct:3.2,vel:90.2}],
  'Baron Stuart': [{type:'SI',name:'Sinker',pct:56.0,vel:94.0},{type:'SL',name:'Slider',pct:24.0,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:12.0,vel:93.1},{type:'CH',name:'Changeup',pct:8.0,vel:86.4}],
  'Beau Brieske': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:95.7},{type:'CH',name:'Changeup',pct:24.8,vel:89.7},{type:'SI',name:'Sinker',pct:15.7,vel:95.7},{type:'SL',name:'Slider',pct:11.1,vel:87.8}],
  'Ben Bowden': [{type:'FF',name:'Four-seam Fastball',pct:58.8,vel:93.4},{type:'SL',name:'Slider',pct:28.3,vel:84.0},{type:'CH',name:'Changeup',pct:11.8,vel:86.3},{type:'CU',name:'Curveball',pct:1.1,vel:82.0}],
  'Ben Brown': [{type:'FF',name:'Four-seam Fastball',pct:55.6,vel:95.8},{type:'KC',name:'Knuckle Curve',pct:39.9,vel:87.2},{type:'CH',name:'Changeup',pct:4.5,vel:90.5}],
  'Ben Casparius': [{type:'ST',name:'Sweeper',pct:32.2,vel:85.3},{type:'FF',name:'Four-seam Fastball',pct:30.2,vel:96.1},{type:'FC',name:'Cutter',pct:22.0,vel:92.1},{type:'CU',name:'Curveball',pct:14.3,vel:80.8},{type:'SI',name:'Sinker',pct:1.2,vel:95.2}],
  'Ben Joyce': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:101.0},{type:'SI',name:'Sinker',pct:45.8,vel:94.4},{type:'SL',name:'Slider',pct:3.3,vel:84.8}],
  'Ben Lively': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:89.8},{type:'SI',name:'Sinker',pct:24.3,vel:90.4},{type:'ST',name:'Sweeper',pct:10.8,vel:78.5},{type:'SL',name:'Slider',pct:8.8,vel:82.7},{type:'FC',name:'Cutter',pct:8.1,vel:84.4},{type:'CH',name:'Changeup',pct:7.8,vel:84.8},{type:'CU',name:'Curveball',pct:7.1,vel:77.3}],
  'Ben Sears': [{type:'SI',name:'Sinker',pct:58.3,vel:93.2},{type:'CH',name:'Changeup',pct:16.7,vel:84.1},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:91.8},{type:'SL',name:'Slider',pct:8.3,vel:82.6}],
  'Ben Vespi': [{type:'CH',name:'Changeup',pct:33.3,vel:85.2},{type:'FC',name:'Cutter',pct:33.3,vel:91.3},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:93.4}],
  'Bennett Sousa': [{type:'SL',name:'Slider',pct:58.1,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:95.1},{type:'SI',name:'Sinker',pct:1.4,vel:93.9}],
  'Blade Tidwell': [{type:'FF',name:'Four-seam Fastball',pct:39.2,vel:95.8},{type:'ST',name:'Sweeper',pct:21.7,vel:82.9},{type:'SI',name:'Sinker',pct:18.4,vel:94.8},{type:'SL',name:'Slider',pct:17.2,vel:88.4},{type:'CH',name:'Changeup',pct:3.2,vel:83.2}],
  'Blake Snell': [{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:95.2},{type:'CH',name:'Changeup',pct:24.8,vel:85.5},{type:'CU',name:'Curveball',pct:21.5,vel:80.7},{type:'SL',name:'Slider',pct:10.7,vel:88.3}],
  'Blake Treinen': [{type:'ST',name:'Sweeper',pct:46.6,vel:84.4},{type:'SI',name:'Sinker',pct:30.5,vel:95.9},{type:'FF',name:'Four-seam Fastball',pct:12.1,vel:95.3},{type:'FC',name:'Cutter',pct:10.8,vel:91.6}],
  'Blas Castaño': [{type:'FC',name:'Cutter',pct:40.0,vel:89.8},{type:'CH',name:'Changeup',pct:32.0,vel:88.6},{type:'ST',name:'Sweeper',pct:12.0,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:93.3},{type:'SI',name:'Sinker',pct:6.0,vel:93.9}],
  'Bobby Miller': [{type:'CU',name:'Curveball',pct:27.6,vel:79.0},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:97.6},{type:'SI',name:'Sinker',pct:22.4,vel:97.2},{type:'CH',name:'Changeup',pct:13.8,vel:86.0},{type:'SL',name:'Slider',pct:9.5,vel:88.6}],
  'Bowden Francis': [{type:'FF',name:'Four-seam Fastball',pct:56.1,vel:92.5},{type:'FS',name:'Splitter',pct:22.6,vel:82.3},{type:'CU',name:'Curveball',pct:13.9,vel:73.7},{type:'SL',name:'Slider',pct:5.8,vel:82.4},{type:'SI',name:'Sinker',pct:1.6,vel:91.5}],
  'Brad Keller': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:97.2},{type:'SL',name:'Slider',pct:17.3,vel:87.2},{type:'SI',name:'Sinker',pct:14.7,vel:96.7},{type:'ST',name:'Sweeper',pct:14.4,vel:86.2},{type:'CH',name:'Changeup',pct:11.5,vel:92.7}],
  'Brad Lord': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:94.8},{type:'SL',name:'Slider',pct:20.2,vel:85.5},{type:'SI',name:'Sinker',pct:18.0,vel:94.3},{type:'CH',name:'Changeup',pct:13.1,vel:85.9}],
  'Bradgley Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:98.3},{type:'SI',name:'Sinker',pct:25.2,vel:98.7},{type:'CH',name:'Changeup',pct:23.6,vel:88.2},{type:'FC',name:'Cutter',pct:10.2,vel:89.2}],
  'Bradley Blalock': [{type:'FF',name:'Four-seam Fastball',pct:46.7,vel:94.7},{type:'SL',name:'Slider',pct:15.6,vel:85.4},{type:'FS',name:'Splitter',pct:14.8,vel:86.9},{type:'CU',name:'Curveball',pct:13.5,vel:81.0},{type:'FC',name:'Cutter',pct:9.5,vel:89.8}],
  'Brady Basso': [{type:'FF',name:'Four-seam Fastball',pct:52.4,vel:92.7},{type:'FC',name:'Cutter',pct:18.4,vel:88.3},{type:'CU',name:'Curveball',pct:17.5,vel:77.7},{type:'CH',name:'Changeup',pct:9.7,vel:86.0},{type:'SI',name:'Sinker',pct:1.9,vel:91.9}],
  'Brady Choban': [{type:'SI',name:'Sinker',pct:62.5,vel:94.0},{type:'FC',name:'Cutter',pct:31.2,vel:86.5},{type:'SL',name:'Slider',pct:6.2,vel:85.1}],
  'Brady Singer': [{type:'SI',name:'Sinker',pct:41.1,vel:92.2},{type:'SL',name:'Slider',pct:28.2,vel:82.5},{type:'ST',name:'Sweeper',pct:10.7,vel:81.6},{type:'FF',name:'Four-seam Fastball',pct:10.6,vel:91.3},{type:'FC',name:'Cutter',pct:9.5,vel:87.6}],
  'Brandon Bielak': [{type:'FF',name:'Four-seam Fastball',pct:48.9,vel:92.4},{type:'CH',name:'Changeup',pct:17.0,vel:86.8},{type:'CU',name:'Curveball',pct:12.8,vel:82.0},{type:'ST',name:'Sweeper',pct:12.8,vel:83.1},{type:'SI',name:'Sinker',pct:8.5,vel:91.9}],
  'Brandon Eisert': [{type:'SL',name:'Slider',pct:36.0,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:32.0,vel:89.7},{type:'CH',name:'Changeup',pct:28.8,vel:83.6},{type:'SI',name:'Sinker',pct:3.2,vel:88.0}],
  'Brandon Komar': [{type:'CH',name:'Changeup',pct:50.0,vel:81.0},{type:'SI',name:'Sinker',pct:31.2,vel:88.7},{type:'CU',name:'Curveball',pct:18.8,vel:77.1}],
  'Brandon Pfaadt': [{type:'FF',name:'Four-seam Fastball',pct:24.0,vel:93.6},{type:'SI',name:'Sinker',pct:23.2,vel:93.1},{type:'ST',name:'Sweeper',pct:18.7,vel:84.7},{type:'CH',name:'Changeup',pct:15.6,vel:87.4},{type:'CU',name:'Curveball',pct:9.7,vel:82.1},{type:'FC',name:'Cutter',pct:8.7,vel:89.8}],
  'Brandon Sproat': [{type:'SI',name:'Sinker',pct:34.8,vel:95.7},{type:'ST',name:'Sweeper',pct:19.0,vel:84.5},{type:'CU',name:'Curveball',pct:14.8,vel:79.9},{type:'CH',name:'Changeup',pct:14.1,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:13.8,vel:96.7},{type:'SL',name:'Slider',pct:3.4,vel:89.5}],
  'Brandon Waddell': [{type:'ST',name:'Sweeper',pct:23.6,vel:78.8},{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:90.7},{type:'SI',name:'Sinker',pct:21.7,vel:91.0},{type:'SL',name:'Slider',pct:17.4,vel:86.4},{type:'CH',name:'Changeup',pct:14.6,vel:83.5}],
  'Brandon Walter': [{type:'FC',name:'Cutter',pct:27.4,vel:88.2},{type:'ST',name:'Sweeper',pct:22.5,vel:79.5},{type:'FF',name:'Four-seam Fastball',pct:19.3,vel:91.8},{type:'CH',name:'Changeup',pct:18.3,vel:80.9},{type:'SI',name:'Sinker',pct:12.5,vel:91.5}],
  'Brandon Woodruff': [{type:'SI',name:'Sinker',pct:31.0,vel:92.9},{type:'FF',name:'Four-seam Fastball',pct:30.7,vel:93.1},{type:'CH',name:'Changeup',pct:17.6,vel:83.6},{type:'FC',name:'Cutter',pct:15.7,vel:89.5},{type:'CU',name:'Curveball',pct:3.7,vel:78.6},{type:'ST',name:'Sweeper',pct:1.2,vel:80.7}],
  'Brandon Young': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:93.8},{type:'FS',name:'Splitter',pct:17.8,vel:87.3},{type:'CU',name:'Curveball',pct:15.7,vel:76.1},{type:'FC',name:'Cutter',pct:9.1,vel:86.8},{type:'SL',name:'Slider',pct:8.9,vel:83.3},{type:'CH',name:'Changeup',pct:4.6,vel:87.1}],
  'Brandyn Garcia': [{type:'SI',name:'Sinker',pct:51.9,vel:96.8},{type:'ST',name:'Sweeper',pct:31.2,vel:85.2},{type:'SL',name:'Slider',pct:14.7,vel:89.6},{type:'CH',name:'Changeup',pct:2.1,vel:90.4}],
  'Brant Hurter': [{type:'SI',name:'Sinker',pct:52.3,vel:92.3},{type:'ST',name:'Sweeper',pct:31.8,vel:82.2},{type:'CH',name:'Changeup',pct:10.6,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:5.2,vel:92.1}],
  'Braxton Ashcraft': [{type:'SL',name:'Slider',pct:31.2,vel:92.0},{type:'FF',name:'Four-seam Fastball',pct:29.7,vel:97.0},{type:'CU',name:'Curveball',pct:21.1,vel:84.3},{type:'SI',name:'Sinker',pct:14.8,vel:96.6},{type:'CH',name:'Changeup',pct:3.3,vel:91.6}],
  'Brayan Bello': [{type:'SI',name:'Sinker',pct:35.0,vel:95.3},{type:'ST',name:'Sweeper',pct:18.9,vel:85.7},{type:'FC',name:'Cutter',pct:15.7,vel:88.2},{type:'CH',name:'Changeup',pct:15.2,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:15.1,vel:95.1}],
  'Braydon Fisher': [{type:'SL',name:'Slider',pct:38.2,vel:87.8},{type:'CU',name:'Curveball',pct:36.6,vel:82.9},{type:'FF',name:'Four-seam Fastball',pct:22.1,vel:95.5},{type:'FC',name:'Cutter',pct:3.0,vel:92.8}],
  'Brenan Hanifee': [{type:'SI',name:'Sinker',pct:62.6,vel:95.2},{type:'SL',name:'Slider',pct:21.0,vel:87.7},{type:'FF',name:'Four-seam Fastball',pct:11.8,vel:96.1},{type:'CH',name:'Changeup',pct:4.6,vel:89.8}],
  'Brendan Cellucci': [{type:'SL',name:'Slider',pct:61.5,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:94.9}],
  'Brendon Little': [{type:'SI',name:'Sinker',pct:46.4,vel:93.4},{type:'KC',name:'Knuckle Curve',pct:45.6,vel:87.0},{type:'FC',name:'Cutter',pct:8.0,vel:93.3}],
  'Brennan Bernardino': [{type:'SI',name:'Sinker',pct:44.5,vel:90.8},{type:'CU',name:'Curveball',pct:25.4,vel:79.2},{type:'FC',name:'Cutter',pct:13.6,vel:86.6},{type:'CH',name:'Changeup',pct:12.4,vel:79.9},{type:'SL',name:'Slider',pct:3.9,vel:83.9}],
  'Brent Headrick': [{type:'FF',name:'Four-seam Fastball',pct:66.1,vel:93.8},{type:'SL',name:'Slider',pct:22.5,vel:81.8},{type:'FS',name:'Splitter',pct:10.7,vel:83.8}],
  'Brent Suter': [{type:'FF',name:'Four-seam Fastball',pct:42.7,vel:87.2},{type:'SI',name:'Sinker',pct:23.2,vel:89.2},{type:'CH',name:'Changeup',pct:21.8,vel:76.7},{type:'SL',name:'Slider',pct:12.3,vel:78.6}],
  'Brett de Geus': [{type:'SI',name:'Sinker',pct:57.4,vel:95.5},{type:'KC',name:'Knuckle Curve',pct:19.1,vel:84.1},{type:'FC',name:'Cutter',pct:14.9,vel:90.8},{type:'FS',name:'Splitter',pct:8.5,vel:87.8}],
  'Brian Van Belle': [{type:'CH',name:'Changeup',pct:43.4,vel:84.3},{type:'SI',name:'Sinker',pct:25.6,vel:90.9},{type:'ST',name:'Sweeper',pct:14.7,vel:80.8},{type:'SL',name:'Slider',pct:8.5,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:7.8,vel:90.9}],
  'Brock Burke': [{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:96.1},{type:'SL',name:'Slider',pct:27.4,vel:87.9},{type:'CH',name:'Changeup',pct:22.0,vel:88.8},{type:'SI',name:'Sinker',pct:8.1,vel:93.5}],
  'Brock Stewart': [{type:'FF',name:'Four-seam Fastball',pct:54.4,vel:96.2},{type:'ST',name:'Sweeper',pct:14.3,vel:84.7},{type:'SI',name:'Sinker',pct:11.0,vel:96.2},{type:'CH',name:'Changeup',pct:10.8,vel:90.6},{type:'FC',name:'Cutter',pct:9.5,vel:93.2}],
  'Brody Rodning': [{type:'FC',name:'Cutter',pct:47.4,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:91.1},{type:'SL',name:'Slider',pct:15.8,vel:79.6}],
  'Brooks Crawford': [{type:'FF',name:'Four-seam Fastball',pct:55.0,vel:91.1},{type:'SL',name:'Slider',pct:35.0,vel:80.9},{type:'CU',name:'Curveball',pct:10.0,vel:77.4}],
  'Brooks Kriske': [{type:'FS',name:'Splitter',pct:53.5,vel:82.3},{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:93.4},{type:'FC',name:'Cutter',pct:11.0,vel:86.1}],
  'Brooks Raley': [{type:'ST',name:'Sweeper',pct:42.0,vel:81.3},{type:'SI',name:'Sinker',pct:24.2,vel:90.7},{type:'FC',name:'Cutter',pct:20.1,vel:87.1},{type:'CH',name:'Changeup',pct:13.7,vel:84.0}],
  'Bruce Zimmermann': [{type:'SI',name:'Sinker',pct:30.8,vel:89.8},{type:'FS',name:'Splitter',pct:20.9,vel:82.7},{type:'SL',name:'Slider',pct:17.6,vel:82.8},{type:'CU',name:'Curveball',pct:13.2,vel:78.9},{type:'FF',name:'Four-seam Fastball',pct:11.0,vel:90.3},{type:'FC',name:'Cutter',pct:6.6,vel:86.1}],
  'Bryan Abreu': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:97.3},{type:'SL',name:'Slider',pct:48.4,vel:86.5},{type:'SI',name:'Sinker',pct:1.2,vel:96.0}],
  'Bryan Baker': [{type:'FF',name:'Four-seam Fastball',pct:47.2,vel:96.8},{type:'CH',name:'Changeup',pct:27.8,vel:85.1},{type:'SL',name:'Slider',pct:25.0,vel:88.5}],
  'Bryan Hoeing': [{type:'SI',name:'Sinker',pct:46.6,vel:92.5},{type:'FS',name:'Splitter',pct:38.9,vel:86.5},{type:'SL',name:'Slider',pct:9.9,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:4.6,vel:92.6}],
  'Bryan Hudson': [{type:'FF',name:'Four-seam Fastball',pct:65.8,vel:90.7},{type:'ST',name:'Sweeper',pct:20.9,vel:80.5},{type:'SI',name:'Sinker',pct:7.2,vel:89.1},{type:'FC',name:'Cutter',pct:4.8,vel:85.9},{type:'CH',name:'Changeup',pct:1.3,vel:84.7}],
  'Bryan King': [{type:'FF',name:'Four-seam Fastball',pct:62.5,vel:92.0},{type:'ST',name:'Sweeper',pct:30.2,vel:80.1},{type:'SI',name:'Sinker',pct:5.2,vel:91.0},{type:'CH',name:'Changeup',pct:1.7,vel:87.2}],
  'Bryan Mata': [{type:'SI',name:'Sinker',pct:45.8,vel:98.2},{type:'CU',name:'Curveball',pct:20.8,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:20.8,vel:97.7},{type:'SL',name:'Slider',pct:12.5,vel:89.7}],
  'Bryan Shaw': [{type:'FC',name:'Cutter',pct:54.5,vel:93.2},{type:'ST',name:'Sweeper',pct:38.6,vel:84.0},{type:'CU',name:'Curveball',pct:6.8,vel:81.9}],
  'Bryan Woo': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:95.6},{type:'SI',name:'Sinker',pct:25.3,vel:95.4},{type:'SL',name:'Slider',pct:11.1,vel:88.3},{type:'ST',name:'Sweeper',pct:9.2,vel:84.7},{type:'CH',name:'Changeup',pct:7.4,vel:89.6}],
  'Bryce Collins': [{type:'FF',name:'Four-seam Fastball',pct:60.0,vel:95.4},{type:'CU',name:'Curveball',pct:40.0,vel:78.8}],
  'Bryce Elder': [{type:'SI',name:'Sinker',pct:42.1,vel:91.5},{type:'SL',name:'Slider',pct:35.3,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:12.3,vel:92.8},{type:'CH',name:'Changeup',pct:10.4,vel:86.6}],
  'Bryce Jarvis': [{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:94.0},{type:'CH',name:'Changeup',pct:20.4,vel:82.6},{type:'SL',name:'Slider',pct:19.8,vel:85.1},{type:'SI',name:'Sinker',pct:10.0,vel:93.0},{type:'FC',name:'Cutter',pct:7.1,vel:88.2},{type:'CU',name:'Curveball',pct:4.0,vel:82.7}],
  'Bryce Miller': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:94.9},{type:'FS',name:'Splitter',pct:18.3,vel:83.9},{type:'SI',name:'Sinker',pct:17.0,vel:94.5},{type:'KC',name:'Knuckle Curve',pct:10.3,vel:83.4},{type:'SL',name:'Slider',pct:7.9,vel:85.6},{type:'ST',name:'Sweeper',pct:4.2,vel:82.8},{type:'FC',name:'Cutter',pct:1.4,vel:91.4}],
  'Bryse Wilson': [{type:'FC',name:'Cutter',pct:24.2,vel:88.0},{type:'SI',name:'Sinker',pct:24.0,vel:91.9},{type:'CH',name:'Changeup',pct:17.7,vel:85.9},{type:'FF',name:'Four-seam Fastball',pct:17.1,vel:92.6},{type:'CU',name:'Curveball',pct:17.0,vel:80.8}],
  'Bubba Chandler': [{type:'FF',name:'Four-seam Fastball',pct:54.0,vel:98.9},{type:'CH',name:'Changeup',pct:22.6,vel:91.7},{type:'SL',name:'Slider',pct:17.4,vel:89.0},{type:'CU',name:'Curveball',pct:6.1,vel:85.4}],
  'Burch Smith': [{type:'FF',name:'Four-seam Fastball',pct:63.2,vel:94.3},{type:'FC',name:'Cutter',pct:15.8,vel:87.7},{type:'CU',name:'Curveball',pct:10.5,vel:81.4},{type:'ST',name:'Sweeper',pct:10.5,vel:83.6}],
  'Cade Austin': [{type:'CH',name:'Changeup',pct:32.0,vel:80.9},{type:'SI',name:'Sinker',pct:32.0,vel:92.1},{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:92.8},{type:'SL',name:'Slider',pct:8.0,vel:82.9}],
  'Cade Cavalli': [{type:'KC',name:'Knuckle Curve',pct:30.2,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:29.3,vel:97.1},{type:'SI',name:'Sinker',pct:18.7,vel:96.9},{type:'CH',name:'Changeup',pct:13.6,vel:89.8},{type:'FC',name:'Cutter',pct:8.0,vel:93.6}],
  'Cade Gibson': [{type:'CU',name:'Curveball',pct:28.5,vel:78.8},{type:'SI',name:'Sinker',pct:23.7,vel:91.6},{type:'CH',name:'Changeup',pct:14.5,vel:84.9},{type:'ST',name:'Sweeper',pct:14.2,vel:79.6},{type:'SL',name:'Slider',pct:9.6,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:9.5,vel:91.9}],
  'Cade Horton': [{type:'FF',name:'Four-seam Fastball',pct:50.3,vel:95.7},{type:'ST',name:'Sweeper',pct:21.6,vel:83.4},{type:'CH',name:'Changeup',pct:12.8,vel:88.0},{type:'CU',name:'Curveball',pct:9.7,vel:83.9},{type:'SI',name:'Sinker',pct:5.5,vel:95.1}],
  'Cade Povich': [{type:'FF',name:'Four-seam Fastball',pct:37.2,vel:92.2},{type:'CU',name:'Curveball',pct:21.8,vel:78.9},{type:'CH',name:'Changeup',pct:15.6,vel:83.7},{type:'SI',name:'Sinker',pct:12.3,vel:91.9},{type:'ST',name:'Sweeper',pct:11.5,vel:82.8},{type:'FC',name:'Cutter',pct:1.6,vel:91.5}],
  'Cade Smith': [{type:'FF',name:'Four-seam Fastball',pct:69.8,vel:96.4},{type:'FS',name:'Splitter',pct:21.6,vel:87.5},{type:'ST',name:'Sweeper',pct:8.6,vel:85.1}],
  'Caden Dana': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:94.9},{type:'SL',name:'Slider',pct:27.6,vel:85.6},{type:'CH',name:'Changeup',pct:19.4,vel:87.0},{type:'CU',name:'Curveball',pct:8.0,vel:79.0}],
  'Cal Quantrill': [{type:'FC',name:'Cutter',pct:21.9,vel:88.9},{type:'SI',name:'Sinker',pct:21.7,vel:93.7},{type:'FS',name:'Splitter',pct:21.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:15.1,vel:93.6},{type:'CU',name:'Curveball',pct:11.7,vel:79.9},{type:'SL',name:'Slider',pct:8.3,vel:84.9}],
  'Caleb Boushley': [{type:'SI',name:'Sinker',pct:28.2,vel:92.2},{type:'FF',name:'Four-seam Fastball',pct:19.2,vel:92.0},{type:'FC',name:'Cutter',pct:18.7,vel:89.7},{type:'CH',name:'Changeup',pct:13.2,vel:85.0},{type:'SL',name:'Slider',pct:12.9,vel:83.8},{type:'CU',name:'Curveball',pct:7.2,vel:75.9}],
  'Caleb Ferguson': [{type:'FF',name:'Four-seam Fastball',pct:31.2,vel:93.9},{type:'SI',name:'Sinker',pct:23.7,vel:93.9},{type:'FC',name:'Cutter',pct:23.6,vel:88.6},{type:'SV',name:'Slurve',pct:21.5,vel:80.4}],
  'Caleb Freeman': [{type:'FF',name:'Four-seam Fastball',pct:50.5,vel:96.1},{type:'CU',name:'Curveball',pct:33.9,vel:83.0},{type:'SL',name:'Slider',pct:15.6,vel:88.6}],
  'Caleb Thielbar': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:92.9},{type:'CU',name:'Curveball',pct:28.1,vel:76.0},{type:'ST',name:'Sweeper',pct:15.1,vel:80.9},{type:'SL',name:'Slider',pct:14.7,vel:88.6}],
  'Calvin Faucher': [{type:'FC',name:'Cutter',pct:36.8,vel:92.0},{type:'ST',name:'Sweeper',pct:17.8,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:17.7,vel:95.8},{type:'CU',name:'Curveball',pct:14.6,vel:86.1},{type:'SI',name:'Sinker',pct:12.6,vel:95.7}],
  'Cam Booser': [{type:'FF',name:'Four-seam Fastball',pct:45.6,vel:95.6},{type:'ST',name:'Sweeper',pct:31.3,vel:81.2},{type:'FC',name:'Cutter',pct:20.7,vel:87.4},{type:'CH',name:'Changeup',pct:2.4,vel:87.5}],
  'Cam Sanders': [{type:'FF',name:'Four-seam Fastball',pct:52.4,vel:95.7},{type:'SL',name:'Slider',pct:25.2,vel:86.8},{type:'CH',name:'Changeup',pct:12.2,vel:91.3},{type:'ST',name:'Sweeper',pct:10.2,vel:83.0}],
  'Cam Schlittler': [{type:'FF',name:'Four-seam Fastball',pct:55.9,vel:97.6},{type:'FC',name:'Cutter',pct:17.9,vel:92.0},{type:'CU',name:'Curveball',pct:14.9,vel:83.2},{type:'SI',name:'Sinker',pct:5.5,vel:97.6},{type:'ST',name:'Sweeper',pct:4.3,vel:86.0},{type:'SL',name:'Slider',pct:1.1,vel:90.0}],
  'Cameron Foster': [{type:'FF',name:'Four-seam Fastball',pct:62.1,vel:95.2},{type:'SL',name:'Slider',pct:20.7,vel:84.3},{type:'CU',name:'Curveball',pct:10.3,vel:77.6},{type:'FC',name:'Cutter',pct:6.9,vel:86.3}],
  'Camilo Doval': [{type:'SL',name:'Slider',pct:48.2,vel:89.0},{type:'FC',name:'Cutter',pct:39.7,vel:98.2},{type:'SI',name:'Sinker',pct:12.0,vel:96.6}],
  'Carl Edwards Jr.': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:93.1},{type:'CU',name:'Curveball',pct:34.4,vel:78.9},{type:'CH',name:'Changeup',pct:14.4,vel:88.6}],
  'Carlos A. Francisco': [{type:'FF',name:'Four-seam Fastball',pct:52.9,vel:93.9},{type:'CH',name:'Changeup',pct:29.4,vel:87.2},{type:'SL',name:'Slider',pct:17.6,vel:84.6}],
  'Carlos Carrasco': [{type:'SL',name:'Slider',pct:25.0,vel:84.4},{type:'SI',name:'Sinker',pct:22.7,vel:90.3},{type:'CH',name:'Changeup',pct:20.8,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:20.5,vel:91.5},{type:'CU',name:'Curveball',pct:10.8,vel:77.7}],
  'Carlos Duran': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:95.9},{type:'SI',name:'Sinker',pct:33.3,vel:95.1},{type:'SL',name:'Slider',pct:22.2,vel:85.4}],
  'Carlos Estévez': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:95.7},{type:'SL',name:'Slider',pct:30.8,vel:87.3},{type:'CH',name:'Changeup',pct:15.6,vel:87.6}],
  'Carlos Hernández': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:97.7},{type:'FS',name:'Splitter',pct:19.6,vel:88.8},{type:'SL',name:'Slider',pct:18.7,vel:86.6},{type:'KC',name:'Knuckle Curve',pct:7.6,vel:82.7},{type:'SI',name:'Sinker',pct:2.2,vel:96.6}],
  'Carlos Peña': [{type:'SI',name:'Sinker',pct:35.7,vel:91.0},{type:'SL',name:'Slider',pct:21.4,vel:80.9},{type:'CH',name:'Changeup',pct:14.3,vel:83.4},{type:'CU',name:'Curveball',pct:14.3,vel:76.2},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:90.8}],
  'Carlos Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:26.0,vel:93.9},{type:'CH',name:'Changeup',pct:22.1,vel:86.1},{type:'FC',name:'Cutter',pct:20.7,vel:88.7},{type:'SL',name:'Slider',pct:18.8,vel:80.1},{type:'CU',name:'Curveball',pct:6.7,vel:75.7},{type:'SI',name:'Sinker',pct:5.8,vel:94.3}],
  'Carlos Rodón': [{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:94.1},{type:'SL',name:'Slider',pct:28.2,vel:85.9},{type:'CH',name:'Changeup',pct:16.6,vel:85.0},{type:'SI',name:'Sinker',pct:9.6,vel:92.0},{type:'CU',name:'Curveball',pct:3.8,vel:80.3}],
  'Carlos Vargas': [{type:'SI',name:'Sinker',pct:60.9,vel:97.6},{type:'SL',name:'Slider',pct:19.2,vel:90.1},{type:'FC',name:'Cutter',pct:13.5,vel:94.9},{type:'FF',name:'Four-seam Fastball',pct:3.4,vel:97.6},{type:'CH',name:'Changeup',pct:3.0,vel:93.7}],
  'Carmen Mlodzinski': [{type:'FF',name:'Four-seam Fastball',pct:36.4,vel:96.0},{type:'SI',name:'Sinker',pct:15.3,vel:95.8},{type:'FS',name:'Splitter',pct:15.1,vel:87.6},{type:'SL',name:'Slider',pct:14.3,vel:88.7},{type:'ST',name:'Sweeper',pct:10.3,vel:84.0},{type:'CU',name:'Curveball',pct:8.5,vel:84.8}],
  'Carson Fulmer': [{type:'CH',name:'Changeup',pct:27.1,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:26.3,vel:92.6},{type:'SI',name:'Sinker',pct:22.0,vel:92.3},{type:'SL',name:'Slider',pct:17.9,vel:86.6},{type:'CU',name:'Curveball',pct:6.4,vel:81.1}],
  'Carson Palmquist': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:90.4},{type:'ST',name:'Sweeper',pct:31.5,vel:73.8},{type:'FC',name:'Cutter',pct:12.5,vel:81.9},{type:'CH',name:'Changeup',pct:3.5,vel:81.3}],
  'Carson Ragsdale': [{type:'CU',name:'Curveball',pct:31.6,vel:81.3},{type:'FF',name:'Four-seam Fastball',pct:28.4,vel:93.9},{type:'SI',name:'Sinker',pct:23.2,vel:92.4},{type:'FS',name:'Splitter',pct:9.5,vel:88.0},{type:'SL',name:'Slider',pct:7.4,vel:89.2}],
  'Carson Seymour': [{type:'SI',name:'Sinker',pct:42.4,vel:96.1},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:96.8},{type:'SL',name:'Slider',pct:21.1,vel:86.9},{type:'FC',name:'Cutter',pct:10.0,vel:93.5},{type:'CU',name:'Curveball',pct:4.7,vel:85.1}],
  'Carson Spiers': [{type:'ST',name:'Sweeper',pct:22.0,vel:81.4},{type:'CH',name:'Changeup',pct:21.5,vel:87.1},{type:'SI',name:'Sinker',pct:20.3,vel:92.0},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:92.1},{type:'FC',name:'Cutter',pct:17.2,vel:88.0}],
  'Carson Whisenhunt': [{type:'FF',name:'Four-seam Fastball',pct:47.8,vel:92.6},{type:'CH',name:'Changeup',pct:37.3,vel:81.1},{type:'SL',name:'Slider',pct:14.0,vel:83.3},{type:'CU',name:'Curveball',pct:1.0,vel:78.3}],
  'Casey Kelly': [{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:91.5},{type:'SL',name:'Slider',pct:20.8,vel:85.3},{type:'CH',name:'Changeup',pct:16.7,vel:85.6},{type:'SI',name:'Sinker',pct:16.7,vel:91.3},{type:'CU',name:'Curveball',pct:4.2,vel:80.7}],
  'Casey Lawrence': [{type:'SI',name:'Sinker',pct:39.9,vel:87.5},{type:'ST',name:'Sweeper',pct:24.6,vel:77.7},{type:'CH',name:'Changeup',pct:21.7,vel:80.6},{type:'FF',name:'Four-seam Fastball',pct:6.9,vel:87.9},{type:'SL',name:'Slider',pct:4.7,vel:78.4},{type:'FC',name:'Cutter',pct:1.4,vel:83.0}],
  'Casey Legumina': [{type:'FF',name:'Four-seam Fastball',pct:49.7,vel:94.3},{type:'SI',name:'Sinker',pct:22.2,vel:93.9},{type:'ST',name:'Sweeper',pct:17.1,vel:81.0},{type:'CH',name:'Changeup',pct:10.5,vel:87.6}],
  'Casey Mize': [{type:'FF',name:'Four-seam Fastball',pct:33.4,vel:94.6},{type:'FS',name:'Splitter',pct:24.1,vel:88.6},{type:'SL',name:'Slider',pct:16.6,vel:88.2},{type:'SV',name:'Slurve',pct:13.2,vel:83.6},{type:'SI',name:'Sinker',pct:12.6,vel:94.8}],
  'Chad Green': [{type:'FF',name:'Four-seam Fastball',pct:49.7,vel:95.2},{type:'SL',name:'Slider',pct:47.5,vel:88.0},{type:'SI',name:'Sinker',pct:2.7,vel:94.1}],
  'Chad Patrick': [{type:'FC',name:'Cutter',pct:41.2,vel:87.9},{type:'SI',name:'Sinker',pct:23.0,vel:94.1},{type:'FF',name:'Four-seam Fastball',pct:22.2,vel:94.2},{type:'CH',name:'Changeup',pct:6.7,vel:88.7},{type:'SL',name:'Slider',pct:5.3,vel:84.2},{type:'SV',name:'Slurve',pct:1.6,vel:85.8}],
  'Chance Huff': [{type:'SI',name:'Sinker',pct:53.8,vel:95.5},{type:'CH',name:'Changeup',pct:23.1,vel:88.1},{type:'FC',name:'Cutter',pct:23.1,vel:89.7}],
  'Chandler Jozwiak': [{type:'SL',name:'Slider',pct:41.9,vel:80.1},{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:88.8},{type:'ST',name:'Sweeper',pct:12.9,vel:75.4},{type:'CH',name:'Changeup',pct:6.5,vel:83.0}],
  'Charlie Beilenson': [{type:'ST',name:'Sweeper',pct:35.3,vel:82.6},{type:'SI',name:'Sinker',pct:29.4,vel:93.7},{type:'FS',name:'Splitter',pct:23.5,vel:87.1},{type:'FC',name:'Cutter',pct:5.9,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:5.9,vel:94.4}],
  'Charlie Morton': [{type:'CU',name:'Curveball',pct:38.3,vel:81.4},{type:'FF',name:'Four-seam Fastball',pct:27.6,vel:94.2},{type:'SI',name:'Sinker',pct:15.1,vel:94.0},{type:'CH',name:'Changeup',pct:9.9,vel:87.5},{type:'FC',name:'Cutter',pct:9.1,vel:88.0}],
  'Chas McCormick': [{type:'FA',name:'Fastball',pct:92.6,vel:69.0},{type:'EP',name:'Eephus',pct:7.4,vel:62.0}],
  'Chase Burns': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:98.7},{type:'SL',name:'Slider',pct:33.9,vel:90.9},{type:'CH',name:'Changeup',pct:5.5,vel:91.2},{type:'CU',name:'Curveball',pct:1.7,vel:85.0},{type:'SI',name:'Sinker',pct:1.0,vel:100.1}],
  'Chase Dollander': [{type:'FF',name:'Four-seam Fastball',pct:49.4,vel:97.9},{type:'CU',name:'Curveball',pct:21.1,vel:79.2},{type:'SL',name:'Slider',pct:12.5,vel:89.4},{type:'SI',name:'Sinker',pct:9.5,vel:97.2},{type:'CH',name:'Changeup',pct:7.6,vel:89.3}],
  'Chase Lee': [{type:'SI',name:'Sinker',pct:38.2,vel:88.9},{type:'ST',name:'Sweeper',pct:34.8,vel:79.9},{type:'FF',name:'Four-seam Fastball',pct:21.0,vel:89.5},{type:'CH',name:'Changeup',pct:6.0,vel:85.8}],
  'Chase Petty': [{type:'SL',name:'Slider',pct:31.4,vel:91.4},{type:'SI',name:'Sinker',pct:23.1,vel:95.3},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:96.5},{type:'CH',name:'Changeup',pct:11.8,vel:88.3},{type:'ST',name:'Sweeper',pct:11.8,vel:86.3}],
  'Chase Plymell': [{type:'SL',name:'Slider',pct:54.5,vel:83.4},{type:'SI',name:'Sinker',pct:36.4,vel:91.9},{type:'FF',name:'Four-seam Fastball',pct:9.1,vel:92.2}],
  'Chase Shugart': [{type:'ST',name:'Sweeper',pct:28.8,vel:80.9},{type:'FC',name:'Cutter',pct:25.4,vel:89.9},{type:'SI',name:'Sinker',pct:20.2,vel:94.3},{type:'FF',name:'Four-seam Fastball',pct:18.5,vel:95.4},{type:'CH',name:'Changeup',pct:7.1,vel:88.2}],
  'Chase Silseth': [{type:'FF',name:'Four-seam Fastball',pct:32.9,vel:94.9},{type:'ST',name:'Sweeper',pct:28.4,vel:84.6},{type:'FS',name:'Splitter',pct:22.1,vel:86.2},{type:'SI',name:'Sinker',pct:13.5,vel:94.3},{type:'CU',name:'Curveball',pct:2.4,vel:79.4}],
  'Chase Solesky': [{type:'FF',name:'Four-seam Fastball',pct:46.8,vel:91.2},{type:'CH',name:'Changeup',pct:23.4,vel:85.6},{type:'ST',name:'Sweeper',pct:17.0,vel:80.2},{type:'FC',name:'Cutter',pct:10.6,vel:89.3},{type:'CU',name:'Curveball',pct:2.1,vel:71.7}],
  'Chayce McDermott': [{type:'FF',name:'Four-seam Fastball',pct:53.8,vel:93.5},{type:'SL',name:'Slider',pct:26.7,vel:83.6},{type:'FC',name:'Cutter',pct:10.8,vel:87.2},{type:'FS',name:'Splitter',pct:5.1,vel:83.9},{type:'ST',name:'Sweeper',pct:2.6,vel:80.8},{type:'CU',name:'Curveball',pct:1.0,vel:75.8}],
  'Chris Bassitt': [{type:'SI',name:'Sinker',pct:41.5,vel:91.5},{type:'FC',name:'Cutter',pct:16.9,vel:88.5},{type:'CU',name:'Curveball',pct:15.9,vel:71.3},{type:'FF',name:'Four-seam Fastball',pct:9.0,vel:91.5},{type:'ST',name:'Sweeper',pct:5.6,vel:72.6},{type:'FS',name:'Splitter',pct:4.0,vel:83.4},{type:'SL',name:'Slider',pct:3.6,vel:83.4},{type:'CH',name:'Changeup',pct:3.5,vel:84.5}],
  'Chris Devenski': [{type:'CH',name:'Changeup',pct:39.2,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:21.6,vel:92.4},{type:'ST',name:'Sweeper',pct:21.2,vel:78.4},{type:'FC',name:'Cutter',pct:16.2,vel:86.3},{type:'SI',name:'Sinker',pct:1.1,vel:92.1}],
  'Chris Flexen': [{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:92.4},{type:'FC',name:'Cutter',pct:28.2,vel:89.1},{type:'CU',name:'Curveball',pct:17.1,vel:72.8},{type:'SL',name:'Slider',pct:8.9,vel:81.0},{type:'SV',name:'Slurve',pct:2.5,vel:77.6},{type:'CH',name:'Changeup',pct:2.1,vel:81.1}],
  'Chris Martin': [{type:'FC',name:'Cutter',pct:36.7,vel:91.4},{type:'FF',name:'Four-seam Fastball',pct:29.3,vel:94.7},{type:'FS',name:'Splitter',pct:17.8,vel:88.4},{type:'SI',name:'Sinker',pct:14.2,vel:94.2},{type:'ST',name:'Sweeper',pct:2.0,vel:84.5}],
  'Chris Murphy': [{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:94.3},{type:'CU',name:'Curveball',pct:31.1,vel:76.8},{type:'SL',name:'Slider',pct:20.0,vel:87.6},{type:'ST',name:'Sweeper',pct:6.3,vel:78.9},{type:'CH',name:'Changeup',pct:5.1,vel:83.8},{type:'SI',name:'Sinker',pct:4.9,vel:92.3},{type:'FS',name:'Splitter',pct:1.1,vel:81.6}],
  'Chris Paddack': [{type:'FF',name:'Four-seam Fastball',pct:43.4,vel:93.7},{type:'CH',name:'Changeup',pct:23.4,vel:84.5},{type:'FC',name:'Cutter',pct:14.1,vel:87.1},{type:'CU',name:'Curveball',pct:12.0,vel:78.2},{type:'SI',name:'Sinker',pct:4.9,vel:93.4},{type:'SL',name:'Slider',pct:2.1,vel:84.8}],
  'Chris Rodriguez': [{type:'CU',name:'Curveball',pct:47.4,vel:83.4},{type:'SL',name:'Slider',pct:28.9,vel:88.4},{type:'SI',name:'Sinker',pct:18.4,vel:93.8},{type:'CH',name:'Changeup',pct:2.6,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:2.6,vel:94.9}],
  'Chris Roycroft': [{type:'SI',name:'Sinker',pct:49.1,vel:95.3},{type:'FF',name:'Four-seam Fastball',pct:26.9,vel:95.6},{type:'FC',name:'Cutter',pct:24.0,vel:88.5}],
  'Chris Sale': [{type:'SL',name:'Slider',pct:47.3,vel:79.1},{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:94.8},{type:'CH',name:'Changeup',pct:7.6,vel:86.8},{type:'SI',name:'Sinker',pct:3.5,vel:94.0}],
  'Chris Stratton': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:91.3},{type:'CU',name:'Curveball',pct:21.1,vel:80.1},{type:'CH',name:'Changeup',pct:18.2,vel:84.7},{type:'SL',name:'Slider',pct:15.5,vel:85.7},{type:'SI',name:'Sinker',pct:3.1,vel:91.3},{type:'ST',name:'Sweeper',pct:1.3,vel:83.9}],
  'Christian Koss': [{type:'EP',name:'Eephus',pct:88.1,vel:51.1},{type:'FA',name:'Fastball',pct:7.1,vel:83.6},{type:'KN',name:'Knuckleball',pct:4.8,vel:58.8}],
  'Christian Montes De Oca': [{type:'FF',name:'Four-seam Fastball',pct:34.8,vel:96.1},{type:'SL',name:'Slider',pct:30.4,vel:85.5},{type:'SI',name:'Sinker',pct:26.1,vel:95.5},{type:'CH',name:'Changeup',pct:8.7,vel:91.1}],
  'Christian Roa': [{type:'SI',name:'Sinker',pct:41.5,vel:96.3},{type:'SL',name:'Slider',pct:29.3,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:97.0},{type:'CH',name:'Changeup',pct:7.3,vel:86.7}],
  'Cionel Pérez': [{type:'SI',name:'Sinker',pct:42.0,vel:95.6},{type:'SL',name:'Slider',pct:23.2,vel:88.2},{type:'SV',name:'Slurve',pct:21.9,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:11.4,vel:95.6},{type:'FC',name:'Cutter',pct:1.6,vel:90.9}],
  'Clarke Schmidt': [{type:'FC',name:'Cutter',pct:40.9,vel:92.2},{type:'KC',name:'Knuckle Curve',pct:18.2,vel:85.0},{type:'SL',name:'Slider',pct:12.9,vel:85.3},{type:'ST',name:'Sweeper',pct:12.2,vel:83.1},{type:'SI',name:'Sinker',pct:8.3,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:7.6,vel:94.3}],
  'Clay Holmes': [{type:'SI',name:'Sinker',pct:40.6,vel:93.8},{type:'ST',name:'Sweeper',pct:19.1,vel:81.9},{type:'CH',name:'Changeup',pct:15.7,vel:88.1},{type:'SL',name:'Slider',pct:10.8,vel:85.4},{type:'FC',name:'Cutter',pct:8.5,vel:89.8},{type:'FF',name:'Four-seam Fastball',pct:5.3,vel:93.2}],
  'Clayton Beeter': [{type:'FF',name:'Four-seam Fastball',pct:54.0,vel:96.5},{type:'SL',name:'Slider',pct:46.0,vel:87.4}],
  'Clayton Kershaw': [{type:'SL',name:'Slider',pct:41.4,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:34.6,vel:89.0},{type:'CU',name:'Curveball',pct:17.9,vel:72.3},{type:'FS',name:'Splitter',pct:5.5,vel:83.1}],
  'Codi Heuer': [{type:'SL',name:'Slider',pct:49.4,vel:84.3},{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:94.5},{type:'CH',name:'Changeup',pct:6.9,vel:87.5}],
  'Cody Bolton': [{type:'SI',name:'Sinker',pct:47.5,vel:93.9},{type:'ST',name:'Sweeper',pct:37.5,vel:82.9},{type:'FC',name:'Cutter',pct:7.5,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:7.5,vel:94.4}],
  'Cody Laweryson': [{type:'FF',name:'Four-seam Fastball',pct:62.6,vel:93.1},{type:'CH',name:'Changeup',pct:23.4,vel:83.4},{type:'FC',name:'Cutter',pct:9.3,vel:85.3},{type:'SL',name:'Slider',pct:4.7,vel:82.3}],
  'Cody Poteet': [{type:'SL',name:'Slider',pct:35.3,vel:84.3},{type:'SI',name:'Sinker',pct:29.4,vel:92.2},{type:'CH',name:'Changeup',pct:19.1,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:7.4,vel:92.2},{type:'ST',name:'Sweeper',pct:5.9,vel:82.0},{type:'CU',name:'Curveball',pct:2.9,vel:79.2}],
  'Cole Ayers': [{type:'SL',name:'Slider',pct:48.1,vel:81.1},{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:91.9},{type:'CH',name:'Changeup',pct:7.4,vel:87.8}],
  'Cole Henry': [{type:'FF',name:'Four-seam Fastball',pct:50.6,vel:94.4},{type:'ST',name:'Sweeper',pct:32.9,vel:80.8},{type:'SI',name:'Sinker',pct:10.1,vel:94.5},{type:'FC',name:'Cutter',pct:3.6,vel:87.7},{type:'CH',name:'Changeup',pct:2.8,vel:87.3}],
  'Cole Ragans': [{type:'FF',name:'Four-seam Fastball',pct:49.1,vel:95.3},{type:'CH',name:'Changeup',pct:19.3,vel:84.4},{type:'SL',name:'Slider',pct:13.8,vel:84.7},{type:'KC',name:'Knuckle Curve',pct:12.2,vel:80.1},{type:'FC',name:'Cutter',pct:5.6,vel:90.0}],
  'Cole Sands': [{type:'FF',name:'Four-seam Fastball',pct:26.5,vel:95.0},{type:'FC',name:'Cutter',pct:24.6,vel:89.5},{type:'FS',name:'Splitter',pct:21.1,vel:88.2},{type:'CU',name:'Curveball',pct:18.6,vel:81.7},{type:'SI',name:'Sinker',pct:8.9,vel:94.0}],
  'Cole Sulser': [{type:'FF',name:'Four-seam Fastball',pct:39.9,vel:92.9},{type:'CH',name:'Changeup',pct:37.7,vel:84.0},{type:'FC',name:'Cutter',pct:21.4,vel:87.6},{type:'ST',name:'Sweeper',pct:1.0,vel:78.7}],
  'Cole Wilcox': [{type:'SI',name:'Sinker',pct:35.9,vel:97.0},{type:'SL',name:'Slider',pct:25.6,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:23.1,vel:95.9},{type:'ST',name:'Sweeper',pct:15.4,vel:87.0}],
  'Cole Winn': [{type:'FF',name:'Four-seam Fastball',pct:27.6,vel:96.2},{type:'SI',name:'Sinker',pct:21.0,vel:95.3},{type:'SL',name:'Slider',pct:19.2,vel:86.1},{type:'FC',name:'Cutter',pct:19.1,vel:91.3},{type:'FS',name:'Splitter',pct:12.1,vel:87.8},{type:'CU',name:'Curveball',pct:1.0,vel:83.7}],
  'Colin Holderman': [{type:'SI',name:'Sinker',pct:36.4,vel:97.4},{type:'ST',name:'Sweeper',pct:27.2,vel:82.9},{type:'FC',name:'Cutter',pct:23.7,vel:90.5},{type:'FF',name:'Four-seam Fastball',pct:7.6,vel:97.0},{type:'FS',name:'Splitter',pct:4.4,vel:90.2}],
  'Colin Poche': [{type:'FF',name:'Four-seam Fastball',pct:70.3,vel:92.2},{type:'SL',name:'Slider',pct:29.7,vel:82.6}],
  'Colin Rea': [{type:'FF',name:'Four-seam Fastball',pct:41.5,vel:93.9},{type:'FS',name:'Splitter',pct:12.0,vel:87.4},{type:'SI',name:'Sinker',pct:10.6,vel:93.0},{type:'SL',name:'Slider',pct:10.0,vel:85.2},{type:'ST',name:'Sweeper',pct:9.3,vel:82.8},{type:'CU',name:'Curveball',pct:9.2,vel:80.4},{type:'FC',name:'Cutter',pct:7.4,vel:88.2}],
  'Colin Selby': [{type:'SI',name:'Sinker',pct:42.1,vel:95.5},{type:'KC',name:'Knuckle Curve',pct:26.2,vel:83.2},{type:'SL',name:'Slider',pct:16.8,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:15.0,vel:95.8}],
  'Collin Snider': [{type:'ST',name:'Sweeper',pct:32.7,vel:82.4},{type:'FF',name:'Four-seam Fastball',pct:25.2,vel:92.5},{type:'FC',name:'Cutter',pct:20.9,vel:86.9},{type:'SI',name:'Sinker',pct:11.2,vel:92.6},{type:'SV',name:'Slurve',pct:10.0,vel:84.8}],
  'Colten Brewer': [{type:'CU',name:'Curveball',pct:34.8,vel:80.8},{type:'FF',name:'Four-seam Fastball',pct:32.6,vel:93.6},{type:'SL',name:'Slider',pct:19.6,vel:86.1},{type:'SI',name:'Sinker',pct:13.0,vel:93.4}],
  'Colton Gordon': [{type:'FF',name:'Four-seam Fastball',pct:41.0,vel:91.1},{type:'ST',name:'Sweeper',pct:28.0,vel:80.7},{type:'SI',name:'Sinker',pct:10.8,vel:91.5},{type:'CU',name:'Curveball',pct:10.2,vel:75.6},{type:'CH',name:'Changeup',pct:7.9,vel:83.9},{type:'FC',name:'Cutter',pct:2.1,vel:84.5}],
  'Connelly Early': [{type:'FF',name:'Four-seam Fastball',pct:29.1,vel:94.0},{type:'CU',name:'Curveball',pct:20.7,vel:80.7},{type:'CH',name:'Changeup',pct:19.5,vel:84.0},{type:'SI',name:'Sinker',pct:13.0,vel:93.0},{type:'SL',name:'Slider',pct:11.5,vel:86.6},{type:'ST',name:'Sweeper',pct:6.2,vel:82.9}],
  'Connor Brogdon': [{type:'CH',name:'Changeup',pct:41.9,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:41.9,vel:95.5},{type:'FC',name:'Cutter',pct:16.2,vel:86.8}],
  'Connor Gillispie': [{type:'FF',name:'Four-seam Fastball',pct:30.2,vel:91.4},{type:'ST',name:'Sweeper',pct:29.9,vel:81.2},{type:'FC',name:'Cutter',pct:24.5,vel:86.9},{type:'CH',name:'Changeup',pct:14.6,vel:87.2}],
  'Connor Overton': [{type:'FC',name:'Cutter',pct:22.6,vel:88.7},{type:'CH',name:'Changeup',pct:19.4,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:19.4,vel:92.7},{type:'SI',name:'Sinker',pct:19.4,vel:92.7},{type:'SL',name:'Slider',pct:9.7,vel:82.2},{type:'ST',name:'Sweeper',pct:9.7,vel:82.3}],
  'Connor Phillips': [{type:'FF',name:'Four-seam Fastball',pct:49.5,vel:98.2},{type:'ST',name:'Sweeper',pct:45.8,vel:85.8},{type:'CU',name:'Curveball',pct:4.8,vel:86.4}],
  'Connor Seabold': [{type:'FF',name:'Four-seam Fastball',pct:51.6,vel:92.2},{type:'CH',name:'Changeup',pct:26.0,vel:81.3},{type:'FC',name:'Cutter',pct:17.9,vel:86.4},{type:'ST',name:'Sweeper',pct:2.7,vel:79.8},{type:'SL',name:'Slider',pct:1.8,vel:83.5}],
  'Connor Thomas': [{type:'SI',name:'Sinker',pct:36.6,vel:89.7},{type:'FC',name:'Cutter',pct:25.6,vel:86.8},{type:'CH',name:'Changeup',pct:17.7,vel:84.4},{type:'ST',name:'Sweeper',pct:15.2,vel:83.2},{type:'FF',name:'Four-seam Fastball',pct:4.9,vel:90.4}],
  'Conor Grammes': [{type:'SI',name:'Sinker',pct:62.1,vel:96.0},{type:'FC',name:'Cutter',pct:24.1,vel:87.0},{type:'SL',name:'Slider',pct:10.3,vel:86.1},{type:'FF',name:'Four-seam Fastball',pct:3.4,vel:95.5}],
  'Cooper Adams': [{type:'SI',name:'Sinker',pct:33.3,vel:95.7},{type:'FC',name:'Cutter',pct:26.7,vel:88.6},{type:'CH',name:'Changeup',pct:20.0,vel:88.8},{type:'SL',name:'Slider',pct:13.3,vel:85.2},{type:'CU',name:'Curveball',pct:6.7,vel:84.3}],
  'Cooper Criswell': [{type:'CH',name:'Changeup',pct:31.8,vel:84.4},{type:'FC',name:'Cutter',pct:29.8,vel:87.0},{type:'SI',name:'Sinker',pct:26.1,vel:89.4},{type:'ST',name:'Sweeper',pct:12.4,vel:76.6}],
  'Cooper Hummel': [{type:'FA',name:'Fastball',pct:100.0,vel:77.6}],
  'Corbin Burnes': [{type:'FC',name:'Cutter',pct:56.0,vel:94.1},{type:'CU',name:'Curveball',pct:18.6,vel:80.1},{type:'SI',name:'Sinker',pct:9.2,vel:95.6},{type:'SL',name:'Slider',pct:8.9,vel:87.9},{type:'CH',name:'Changeup',pct:7.3,vel:88.5}],
  'Corbin Martin': [{type:'FF',name:'Four-seam Fastball',pct:43.8,vel:95.8},{type:'SL',name:'Slider',pct:32.0,vel:91.8},{type:'CU',name:'Curveball',pct:18.5,vel:86.7},{type:'CH',name:'Changeup',pct:3.3,vel:90.4},{type:'ST',name:'Sweeper',pct:2.5,vel:86.6}],
  'Craig Kimbrel': [{type:'FF',name:'Four-seam Fastball',pct:64.3,vel:93.5},{type:'KC',name:'Knuckle Curve',pct:19.1,vel:84.0},{type:'ST',name:'Sweeper',pct:10.9,vel:84.9},{type:'CH',name:'Changeup',pct:5.2,vel:88.0}],
  'Craig Yoho': [{type:'CH',name:'Changeup',pct:46.1,vel:77.1},{type:'FF',name:'Four-seam Fastball',pct:38.3,vel:92.8},{type:'ST',name:'Sweeper',pct:8.9,vel:75.9},{type:'FC',name:'Cutter',pct:6.7,vel:89.0}],
  'Cristian Javier': [{type:'FF',name:'Four-seam Fastball',pct:39.9,vel:92.9},{type:'ST',name:'Sweeper',pct:19.9,vel:78.8},{type:'CH',name:'Changeup',pct:18.6,vel:84.1},{type:'KC',name:'Knuckle Curve',pct:12.0,vel:76.4},{type:'SI',name:'Sinker',pct:9.6,vel:92.6}],
  'Cristian Mena': [{type:'CU',name:'Curveball',pct:33.0,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:29.0,vel:95.3},{type:'CH',name:'Changeup',pct:15.0,vel:91.5},{type:'SI',name:'Sinker',pct:12.0,vel:94.4},{type:'ST',name:'Sweeper',pct:11.0,vel:87.1}],
  'Cristopher Sánchez': [{type:'SI',name:'Sinker',pct:46.1,vel:95.4},{type:'CH',name:'Changeup',pct:37.3,vel:86.3},{type:'SL',name:'Slider',pct:16.6,vel:85.7}],
  'Cruz Noriega': [{type:'FF',name:'Four-seam Fastball',pct:48.0,vel:95.0},{type:'CH',name:'Changeup',pct:32.0,vel:86.5},{type:'FC',name:'Cutter',pct:12.0,vel:86.4},{type:'SL',name:'Slider',pct:8.0,vel:82.4}],
  'César Salazar': [{type:'EP',name:'Eephus',pct:100.0,vel:58.4}],
  'DL Hall': [{type:'FF',name:'Four-seam Fastball',pct:29.8,vel:94.2},{type:'SL',name:'Slider',pct:18.5,vel:86.0},{type:'FC',name:'Cutter',pct:18.0,vel:92.3},{type:'CH',name:'Changeup',pct:17.7,vel:84.7},{type:'CU',name:'Curveball',pct:9.5,vel:80.0},{type:'SI',name:'Sinker',pct:6.5,vel:94.8}],
  'Dakota Hawkins': [{type:'SL',name:'Slider',pct:66.7,vel:82.8},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:92.4}],
  'Dan Altavilla': [{type:'SL',name:'Slider',pct:28.3,vel:90.5},{type:'FF',name:'Four-seam Fastball',pct:26.2,vel:95.9},{type:'CH',name:'Changeup',pct:23.0,vel:91.6},{type:'SI',name:'Sinker',pct:22.5,vel:96.5}],
  'Dane Dunning': [{type:'FC',name:'Cutter',pct:36.9,vel:88.7},{type:'SI',name:'Sinker',pct:30.7,vel:90.2},{type:'CH',name:'Changeup',pct:17.9,vel:85.5},{type:'SL',name:'Slider',pct:11.0,vel:80.4},{type:'KC',name:'Knuckle Curve',pct:3.1,vel:75.7}],
  'Daniel Harper': [{type:'FC',name:'Cutter',pct:48.0,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:36.0,vel:96.8},{type:'SI',name:'Sinker',pct:16.0,vel:94.5}],
  'Daniel Juarez': [{type:'SL',name:'Slider',pct:58.3,vel:82.9},{type:'SI',name:'Sinker',pct:25.0,vel:94.1},{type:'CH',name:'Changeup',pct:16.7,vel:85.7}],
  'Daniel Lynch IV': [{type:'SL',name:'Slider',pct:28.9,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:94.1},{type:'CH',name:'Changeup',pct:19.8,vel:85.9},{type:'SI',name:'Sinker',pct:18.7,vel:93.8},{type:'KC',name:'Knuckle Curve',pct:9.6,vel:82.5}],
  'Daniel Palencia': [{type:'FF',name:'Four-seam Fastball',pct:71.7,vel:99.6},{type:'SL',name:'Slider',pct:23.1,vel:88.5},{type:'FS',name:'Splitter',pct:4.5,vel:88.3}],
  'Daniel Robert': [{type:'ST',name:'Sweeper',pct:41.4,vel:84.1},{type:'FC',name:'Cutter',pct:25.9,vel:91.0},{type:'FF',name:'Four-seam Fastball',pct:24.0,vel:96.2},{type:'SI',name:'Sinker',pct:8.7,vel:95.3}],
  'Danny Coulombe': [{type:'FC',name:'Cutter',pct:39.4,vel:85.2},{type:'SI',name:'Sinker',pct:19.8,vel:90.1},{type:'ST',name:'Sweeper',pct:19.0,vel:80.6},{type:'FF',name:'Four-seam Fastball',pct:18.6,vel:90.3},{type:'KC',name:'Knuckle Curve',pct:3.0,vel:78.2}],
  'Danny Young': [{type:'SI',name:'Sinker',pct:53.0,vel:93.0},{type:'ST',name:'Sweeper',pct:42.4,vel:82.4},{type:'FC',name:'Cutter',pct:4.5,vel:90.1}],
  'Darren McCaughan': [{type:'ST',name:'Sweeper',pct:41.9,vel:82.2},{type:'FF',name:'Four-seam Fastball',pct:23.3,vel:88.9},{type:'SI',name:'Sinker',pct:23.3,vel:90.1},{type:'CH',name:'Changeup',pct:11.6,vel:80.8}],
  'Dauri Moreta': [{type:'SL',name:'Slider',pct:56.8,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:94.6}],
  'David Bednar': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:97.0},{type:'CU',name:'Curveball',pct:36.2,vel:77.6},{type:'FS',name:'Splitter',pct:19.4,vel:92.3}],
  'David Festa': [{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:94.1},{type:'CH',name:'Changeup',pct:29.0,vel:87.8},{type:'SL',name:'Slider',pct:26.8,vel:87.6},{type:'SI',name:'Sinker',pct:12.7,vel:93.9}],
  'David Morgan': [{type:'FF',name:'Four-seam Fastball',pct:37.3,vel:97.9},{type:'CU',name:'Curveball',pct:23.2,vel:83.1},{type:'SI',name:'Sinker',pct:21.3,vel:96.9},{type:'SL',name:'Slider',pct:18.1,vel:88.0}],
  'David Peterson': [{type:'SI',name:'Sinker',pct:29.6,vel:91.3},{type:'FF',name:'Four-seam Fastball',pct:22.3,vel:92.3},{type:'SL',name:'Slider',pct:19.1,vel:84.6},{type:'CH',name:'Changeup',pct:15.3,vel:84.6},{type:'CU',name:'Curveball',pct:13.7,vel:78.7}],
  'David Robertson': [{type:'FC',name:'Cutter',pct:49.7,vel:91.7},{type:'KC',name:'Knuckle Curve',pct:34.2,vel:84.5},{type:'SL',name:'Slider',pct:9.9,vel:83.7},{type:'SI',name:'Sinker',pct:5.3,vel:91.2},{type:'CH',name:'Changeup',pct:1.0,vel:86.8}],
  'Davis Daniel': [{type:'FF',name:'Four-seam Fastball',pct:50.8,vel:89.8},{type:'FS',name:'Splitter',pct:22.4,vel:84.5},{type:'SL',name:'Slider',pct:16.4,vel:80.0},{type:'ST',name:'Sweeper',pct:10.4,vel:81.0}],
  'Davis Martin': [{type:'FF',name:'Four-seam Fastball',pct:32.3,vel:94.0},{type:'CH',name:'Changeup',pct:24.4,vel:90.2},{type:'SL',name:'Slider',pct:21.4,vel:88.1},{type:'SI',name:'Sinker',pct:10.6,vel:93.0},{type:'CU',name:'Curveball',pct:4.9,vel:78.8},{type:'ST',name:'Sweeper',pct:4.5,vel:83.5},{type:'FC',name:'Cutter',pct:1.7,vel:90.0}],
  'Daysbel Hernández': [{type:'SL',name:'Slider',pct:56.1,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:43.9,vel:97.7}],
  'Dean Kremer': [{type:'FF',name:'Four-seam Fastball',pct:26.6,vel:93.3},{type:'FS',name:'Splitter',pct:21.1,vel:81.9},{type:'FC',name:'Cutter',pct:20.2,vel:86.9},{type:'SI',name:'Sinker',pct:19.3,vel:92.8},{type:'CU',name:'Curveball',pct:12.8,vel:78.3}],
  'Declan Cronin': [{type:'SL',name:'Slider',pct:33.3,vel:87.1},{type:'SI',name:'Sinker',pct:29.6,vel:92.1},{type:'ST',name:'Sweeper',pct:22.2,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:14.8,vel:91.6}],
  'Dedniel Núñez': [{type:'FF',name:'Four-seam Fastball',pct:51.0,vel:96.3},{type:'SL',name:'Slider',pct:47.6,vel:88.8},{type:'CH',name:'Changeup',pct:1.4,vel:92.5}],
  'Dennis Santana': [{type:'SL',name:'Slider',pct:46.0,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:28.8,vel:94.7},{type:'FC',name:'Cutter',pct:10.6,vel:90.6},{type:'SI',name:'Sinker',pct:8.4,vel:94.6},{type:'CH',name:'Changeup',pct:6.2,vel:88.4}],
  'Devin Sweet': [{type:'CH',name:'Changeup',pct:40.8,vel:78.5},{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:92.7},{type:'SL',name:'Slider',pct:20.4,vel:86.5}],
  'Devin Williams': [{type:'CH',name:'Changeup',pct:52.0,vel:83.7},{type:'FF',name:'Four-seam Fastball',pct:47.5,vel:94.1}],
  'Didier Fuentes': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:96.0},{type:'ST',name:'Sweeper',pct:27.3,vel:83.4},{type:'CU',name:'Curveball',pct:11.9,vel:79.5},{type:'FS',name:'Splitter',pct:3.1,vel:88.1}],
  'Diego Castillo': [{type:'SI',name:'Sinker',pct:50.0,vel:95.8},{type:'SL',name:'Slider',pct:42.4,vel:87.1},{type:'FF',name:'Four-seam Fastball',pct:7.6,vel:95.8}],
  'Dietrich Enns': [{type:'FF',name:'Four-seam Fastball',pct:45.9,vel:94.0},{type:'CH',name:'Changeup',pct:29.6,vel:84.6},{type:'FC',name:'Cutter',pct:16.6,vel:85.2},{type:'CU',name:'Curveball',pct:4.9,vel:77.2},{type:'SI',name:'Sinker',pct:3.1,vel:93.1}],
  'Dillon Tate': [{type:'ST',name:'Sweeper',pct:43.2,vel:79.3},{type:'SI',name:'Sinker',pct:33.8,vel:92.1},{type:'CH',name:'Changeup',pct:20.9,vel:82.7},{type:'FF',name:'Four-seam Fastball',pct:2.2,vel:90.9}],
  'Dionys Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:30.0,vel:90.8},{type:'CU',name:'Curveball',pct:20.0,vel:76.8},{type:'SI',name:'Sinker',pct:20.0,vel:91.8},{type:'SL',name:'Slider',pct:20.0,vel:79.4},{type:'CH',name:'Changeup',pct:10.0,vel:82.4}],
  'Dom Hamel': [{type:'SL',name:'Slider',pct:30.8,vel:83.6},{type:'ST',name:'Sweeper',pct:30.8,vel:81.3},{type:'FF',name:'Four-seam Fastball',pct:15.4,vel:92.0},{type:'CH',name:'Changeup',pct:7.7,vel:82.6},{type:'FC',name:'Cutter',pct:7.7,vel:87.8},{type:'SI',name:'Sinker',pct:7.7,vel:91.3}],
  'Doug Nikhazy': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:90.2},{type:'SL',name:'Slider',pct:28.7,vel:86.2},{type:'CU',name:'Curveball',pct:11.1,vel:79.0},{type:'CH',name:'Changeup',pct:7.4,vel:83.2},{type:'ST',name:'Sweeper',pct:5.6,vel:82.4}],
  'Douglas Orellana': [{type:'FF',name:'Four-seam Fastball',pct:53.8,vel:95.4},{type:'FC',name:'Cutter',pct:43.6,vel:87.1},{type:'CU',name:'Curveball',pct:2.6,vel:79.5}],
  'Drake Fellows': [{type:'SI',name:'Sinker',pct:46.7,vel:93.9},{type:'SL',name:'Slider',pct:46.7,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:6.7,vel:92.5}],
  'Drew Pomeranz': [{type:'FF',name:'Four-seam Fastball',pct:76.7,vel:92.8},{type:'KC',name:'Knuckle Curve',pct:23.3,vel:83.7}],
  'Drew Rasmussen': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:95.8},{type:'FC',name:'Cutter',pct:31.4,vel:90.3},{type:'SI',name:'Sinker',pct:22.9,vel:95.4},{type:'ST',name:'Sweeper',pct:4.7,vel:84.6},{type:'CU',name:'Curveball',pct:4.3,vel:80.4},{type:'CH',name:'Changeup',pct:1.2,vel:89.4}],
  'Drew Sommers': [{type:'SI',name:'Sinker',pct:43.6,vel:93.5},{type:'SL',name:'Slider',pct:42.3,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:12.8,vel:92.9},{type:'CH',name:'Changeup',pct:1.3,vel:87.2}],
  'Drey Jameson': [{type:'FF',name:'Four-seam Fastball',pct:26.4,vel:98.7},{type:'CH',name:'Changeup',pct:25.0,vel:90.5},{type:'SL',name:'Slider',pct:25.0,vel:87.8},{type:'SI',name:'Sinker',pct:23.6,vel:96.3}],
  'Dugan Darnell': [{type:'FF',name:'Four-seam Fastball',pct:52.6,vel:93.7},{type:'FS',name:'Splitter',pct:27.6,vel:84.6},{type:'SL',name:'Slider',pct:19.9,vel:82.0}],
  'Dustin May': [{type:'ST',name:'Sweeper',pct:39.1,vel:85.2},{type:'SI',name:'Sinker',pct:33.7,vel:94.6},{type:'FF',name:'Four-seam Fastball',pct:16.8,vel:95.4},{type:'FC',name:'Cutter',pct:9.7,vel:91.4}],
  'Dylan Cease': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:97.2},{type:'SL',name:'Slider',pct:40.7,vel:89.1},{type:'KC',name:'Knuckle Curve',pct:8.2,vel:82.3},{type:'SI',name:'Sinker',pct:4.0,vel:95.8},{type:'ST',name:'Sweeper',pct:3.5,vel:84.3},{type:'CH',name:'Changeup',pct:1.5,vel:78.7}],
  'Dylan Dodd': [{type:'FC',name:'Cutter',pct:53.9,vel:86.9},{type:'SI',name:'Sinker',pct:35.3,vel:93.8},{type:'SL',name:'Slider',pct:8.4,vel:82.7},{type:'CH',name:'Changeup',pct:2.4,vel:87.5}],
  'Dylan Lee': [{type:'SL',name:'Slider',pct:55.5,vel:86.0},{type:'FF',name:'Four-seam Fastball',pct:31.2,vel:94.1},{type:'CH',name:'Changeup',pct:13.2,vel:86.7}],
  'Dylan Smith': [{type:'FF',name:'Four-seam Fastball',pct:51.6,vel:94.8},{type:'ST',name:'Sweeper',pct:31.7,vel:85.6},{type:'FS',name:'Splitter',pct:9.1,vel:86.1},{type:'SI',name:'Sinker',pct:6.5,vel:93.9},{type:'CU',name:'Curveball',pct:1.1,vel:81.2}],
  'Easton Lucas': [{type:'FF',name:'Four-seam Fastball',pct:49.8,vel:93.8},{type:'CH',name:'Changeup',pct:21.0,vel:87.4},{type:'SL',name:'Slider',pct:12.1,vel:86.4},{type:'ST',name:'Sweeper',pct:9.8,vel:81.1},{type:'FC',name:'Cutter',pct:7.3,vel:91.5}],
  'Easton McGee': [{type:'SI',name:'Sinker',pct:31.8,vel:93.5},{type:'CU',name:'Curveball',pct:29.6,vel:79.8},{type:'FF',name:'Four-seam Fastball',pct:20.2,vel:93.0},{type:'FC',name:'Cutter',pct:13.0,vel:87.8},{type:'ST',name:'Sweeper',pct:3.6,vel:82.0},{type:'CH',name:'Changeup',pct:1.8,vel:87.2}],
  'Eddy Yean': [{type:'SI',name:'Sinker',pct:58.3,vel:97.1},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:96.4},{type:'SL',name:'Slider',pct:16.7,vel:87.6}],
  'Edgar Isea': [{type:'FF',name:'Four-seam Fastball',pct:68.4,vel:97.6},{type:'SI',name:'Sinker',pct:21.1,vel:98.3},{type:'CH',name:'Changeup',pct:5.3,vel:87.6},{type:'FC',name:'Cutter',pct:5.3,vel:86.9}],
  'Edgardo Henriquez': [{type:'SI',name:'Sinker',pct:29.6,vel:100.9},{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:100.9},{type:'FC',name:'Cutter',pct:18.9,vel:96.0},{type:'SL',name:'Slider',pct:12.8,vel:90.4},{type:'CU',name:'Curveball',pct:10.1,vel:83.7}],
  'Eduard Bazardo': [{type:'ST',name:'Sweeper',pct:42.8,vel:82.5},{type:'SI',name:'Sinker',pct:39.7,vel:95.5},{type:'FF',name:'Four-seam Fastball',pct:14.8,vel:94.8},{type:'FS',name:'Splitter',pct:2.2,vel:90.4}],
  'Eduardo Rodriguez': [{type:'FF',name:'Four-seam Fastball',pct:47.0,vel:92.0},{type:'CH',name:'Changeup',pct:20.2,vel:85.9},{type:'FC',name:'Cutter',pct:15.6,vel:89.2},{type:'SI',name:'Sinker',pct:8.7,vel:91.5},{type:'CU',name:'Curveball',pct:4.5,vel:79.4},{type:'SL',name:'Slider',pct:4.0,vel:84.6}],
  'Eduardo Salazar': [{type:'SI',name:'Sinker',pct:44.5,vel:94.4},{type:'SL',name:'Slider',pct:31.8,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:95.3},{type:'CH',name:'Changeup',pct:1.6,vel:87.0}],
  'Eduarniel Núñez': [{type:'FF',name:'Four-seam Fastball',pct:59.8,vel:98.0},{type:'SL',name:'Slider',pct:35.0,vel:88.1},{type:'CU',name:'Curveball',pct:4.1,vel:85.9},{type:'SI',name:'Sinker',pct:1.1,vel:96.6}],
  'Edward Cabrera': [{type:'CH',name:'Changeup',pct:25.8,vel:94.2},{type:'CU',name:'Curveball',pct:23.6,vel:84.0},{type:'SI',name:'Sinker',pct:20.4,vel:96.9},{type:'SL',name:'Slider',pct:17.3,vel:88.5},{type:'FF',name:'Four-seam Fastball',pct:13.0,vel:97.0}],
  'Edwin Díaz': [{type:'FF',name:'Four-seam Fastball',pct:52.6,vel:97.2},{type:'SL',name:'Slider',pct:47.3,vel:89.1}],
  'Edwin Núñez': [{type:'SI',name:'Sinker',pct:52.6,vel:98.0},{type:'CH',name:'Changeup',pct:42.1,vel:88.6},{type:'SV',name:'Slurve',pct:5.3,vel:83.9}],
  'Edwin Uceta': [{type:'FF',name:'Four-seam Fastball',pct:40.7,vel:94.0},{type:'CH',name:'Changeup',pct:38.8,vel:88.4},{type:'FC',name:'Cutter',pct:15.9,vel:89.4},{type:'ST',name:'Sweeper',pct:3.0,vel:82.1},{type:'SI',name:'Sinker',pct:1.6,vel:94.0}],
  'Eiberson Castellano': [{type:'FF',name:'Four-seam Fastball',pct:41.1,vel:96.5},{type:'CU',name:'Curveball',pct:30.4,vel:83.5},{type:'SI',name:'Sinker',pct:17.9,vel:96.6},{type:'CH',name:'Changeup',pct:10.7,vel:89.4}],
  'Eli Morgan': [{type:'CH',name:'Changeup',pct:41.7,vel:79.4},{type:'FF',name:'Four-seam Fastball',pct:29.5,vel:91.9},{type:'SL',name:'Slider',pct:28.8,vel:86.5}],
  'Elvin Rodríguez': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:94.2},{type:'CU',name:'Curveball',pct:19.4,vel:78.6},{type:'FC',name:'Cutter',pct:18.9,vel:87.8},{type:'ST',name:'Sweeper',pct:10.8,vel:82.0},{type:'CH',name:'Changeup',pct:5.0,vel:86.8}],
  'Elvis Alvarado': [{type:'FF',name:'Four-seam Fastball',pct:48.6,vel:98.7},{type:'SL',name:'Slider',pct:32.0,vel:88.9},{type:'SI',name:'Sinker',pct:15.3,vel:98.3},{type:'CH',name:'Changeup',pct:4.1,vel:89.5}],
  'Elvis Peguero': [{type:'SI',name:'Sinker',pct:50.0,vel:95.1},{type:'SL',name:'Slider',pct:49.5,vel:87.9}],
  'Emerson Hancock': [{type:'SI',name:'Sinker',pct:38.7,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:26.1,vel:94.9},{type:'CH',name:'Changeup',pct:20.1,vel:86.5},{type:'SL',name:'Slider',pct:10.9,vel:81.8},{type:'ST',name:'Sweeper',pct:4.0,vel:79.0}],
  'Emilio Pagán': [{type:'FF',name:'Four-seam Fastball',pct:61.0,vel:95.7},{type:'FS',name:'Splitter',pct:20.1,vel:83.9},{type:'FC',name:'Cutter',pct:19.0,vel:86.7}],
  'Emmanuel Clase': [{type:'FC',name:'Cutter',pct:69.0,vel:98.9},{type:'SL',name:'Slider',pct:30.0,vel:88.5},{type:'SI',name:'Sinker',pct:1.0,vel:98.6}],
  'Emmanuel Rivera': [{type:'EP',name:'Eephus',pct:82.2,vel:52.9},{type:'FA',name:'Fastball',pct:15.6,vel:83.4},{type:'CH',name:'Changeup',pct:2.2,vel:69.1}],
  'Emmet Sheehan': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:95.6},{type:'SL',name:'Slider',pct:30.4,vel:87.8},{type:'CH',name:'Changeup',pct:16.4,vel:86.2},{type:'CU',name:'Curveball',pct:6.0,vel:77.9}],
  'Enrique Hernández': [{type:'EP',name:'Eephus',pct:55.2,vel:53.9},{type:'CS',name:'Slow Curve',pct:40.8,vel:51.5},{type:'FA',name:'Fastball',pct:4.0,vel:84.2}],
  'Enyel De Los Santos': [{type:'FF',name:'Four-seam Fastball',pct:48.9,vel:96.2},{type:'SL',name:'Slider',pct:35.9,vel:88.3},{type:'CH',name:'Changeup',pct:15.2,vel:87.6}],
  'Erasmo Ramírez': [{type:'FC',name:'Cutter',pct:44.3,vel:88.9},{type:'SI',name:'Sinker',pct:32.3,vel:90.7},{type:'CH',name:'Changeup',pct:11.4,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:6.3,vel:90.0},{type:'CU',name:'Curveball',pct:5.7,vel:81.5}],
  'Eric Adler': [{type:'SL',name:'Slider',pct:46.2,vel:85.2},{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:94.4},{type:'CU',name:'Curveball',pct:15.4,vel:81.9}],
  'Eric Lauer': [{type:'FF',name:'Four-seam Fastball',pct:46.5,vel:91.7},{type:'FC',name:'Cutter',pct:20.5,vel:86.5},{type:'CU',name:'Curveball',pct:14.4,vel:75.0},{type:'SL',name:'Slider',pct:10.6,vel:83.1},{type:'CH',name:'Changeup',pct:8.0,vel:85.0}],
  'Eric Orze': [{type:'FS',name:'Splitter',pct:48.2,vel:84.1},{type:'SL',name:'Slider',pct:26.5,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:25.3,vel:93.9}],
  'Eric Pardinho': [{type:'FS',name:'Splitter',pct:54.5,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:27.3,vel:92.3},{type:'SL',name:'Slider',pct:18.2,vel:87.2}],
  'Eric Reyzelman': [{type:'FF',name:'Four-seam Fastball',pct:56.8,vel:95.1},{type:'ST',name:'Sweeper',pct:40.9,vel:80.6},{type:'CH',name:'Changeup',pct:2.3,vel:79.6}],
  'Erick Fedde': [{type:'SI',name:'Sinker',pct:33.3,vel:93.2},{type:'FC',name:'Cutter',pct:27.8,vel:90.3},{type:'ST',name:'Sweeper',pct:25.8,vel:82.6},{type:'CH',name:'Changeup',pct:12.1,vel:87.6}],
  'Erik Miller': [{type:'FF',name:'Four-seam Fastball',pct:35.1,vel:97.1},{type:'CH',name:'Changeup',pct:25.2,vel:87.0},{type:'SL',name:'Slider',pct:21.8,vel:86.3},{type:'SI',name:'Sinker',pct:17.9,vel:97.1}],
  'Erik Sabrowski': [{type:'FF',name:'Four-seam Fastball',pct:68.3,vel:93.9},{type:'SL',name:'Slider',pct:16.7,vel:87.0},{type:'CU',name:'Curveball',pct:15.0,vel:80.3}],
  'Erik Swanson': [{type:'FF',name:'Four-seam Fastball',pct:46.1,vel:92.9},{type:'FS',name:'Splitter',pct:43.8,vel:83.3},{type:'SL',name:'Slider',pct:10.2,vel:86.4}],
  'Ethan Roberts': [{type:'ST',name:'Sweeper',pct:57.6,vel:82.2},{type:'FC',name:'Cutter',pct:36.1,vel:91.4},{type:'SI',name:'Sinker',pct:6.2,vel:92.7}],
  'Ethan Routzahn': [{type:'SI',name:'Sinker',pct:92.0,vel:90.4},{type:'FC',name:'Cutter',pct:4.0,vel:85.3},{type:'SL',name:'Slider',pct:4.0,vel:80.5}],
  'Eury Pérez': [{type:'FF',name:'Four-seam Fastball',pct:51.3,vel:97.9},{type:'SL',name:'Slider',pct:21.9,vel:86.1},{type:'CU',name:'Curveball',pct:9.2,vel:79.9},{type:'CH',name:'Changeup',pct:7.8,vel:89.7},{type:'ST',name:'Sweeper',pct:7.8,vel:82.8},{type:'FC',name:'Cutter',pct:1.0,vel:84.0},{type:'SI',name:'Sinker',pct:1.0,vel:96.5}],
  'Evan McKendry': [{type:'CH',name:'Changeup',pct:30.0,vel:77.7},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:90.1},{type:'FC',name:'Cutter',pct:20.0,vel:84.0},{type:'ST',name:'Sweeper',pct:13.3,vel:73.6},{type:'SI',name:'Sinker',pct:10.0,vel:88.4}],
  'Evan Phillips': [{type:'ST',name:'Sweeper',pct:53.3,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:31.5,vel:95.4},{type:'FC',name:'Cutter',pct:7.6,vel:92.5},{type:'SI',name:'Sinker',pct:7.6,vel:95.4}],
  'Evan Sisk': [{type:'SI',name:'Sinker',pct:31.3,vel:90.0},{type:'ST',name:'Sweeper',pct:26.7,vel:79.9},{type:'FF',name:'Four-seam Fastball',pct:20.1,vel:90.6},{type:'CU',name:'Curveball',pct:10.3,vel:77.6},{type:'FC',name:'Cutter',pct:10.3,vel:87.1},{type:'SL',name:'Slider',pct:1.2,vel:79.2}],
  'Ezequiel Duran': [{type:'EP',name:'Eephus',pct:76.0,vel:41.5},{type:'CS',name:'Slow Curve',pct:8.0,vel:41.2},{type:'SL',name:'Slider',pct:8.0,vel:40.0},{type:'CU',name:'Curveball',pct:4.0,vel:37.8},{type:'FA',name:'Fastball',pct:4.0,vel:49.0}],
  'Fernando Cruz': [{type:'FS',name:'Splitter',pct:59.2,vel:80.6},{type:'FF',name:'Four-seam Fastball',pct:20.5,vel:93.9},{type:'SI',name:'Sinker',pct:13.7,vel:93.0},{type:'SL',name:'Slider',pct:6.7,vel:82.3}],
  'Forrest Whitley': [{type:'FF',name:'Four-seam Fastball',pct:33.6,vel:96.3},{type:'FC',name:'Cutter',pct:26.6,vel:89.4},{type:'SI',name:'Sinker',pct:17.6,vel:96.1},{type:'CU',name:'Curveball',pct:11.7,vel:81.6},{type:'SV',name:'Slurve',pct:9.4,vel:83.6},{type:'CH',name:'Changeup',pct:1.2,vel:87.8}],
  'Framber Valdez': [{type:'SI',name:'Sinker',pct:45.7,vel:94.2},{type:'CU',name:'Curveball',pct:32.9,vel:79.4},{type:'CH',name:'Changeup',pct:18.0,vel:89.8},{type:'SL',name:'Slider',pct:3.2,vel:84.3}],
  'Frankie Montas': [{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:95.6},{type:'FS',name:'Splitter',pct:20.6,vel:86.3},{type:'SI',name:'Sinker',pct:17.5,vel:95.1},{type:'SL',name:'Slider',pct:14.0,vel:86.9},{type:'ST',name:'Sweeper',pct:12.6,vel:84.7},{type:'FC',name:'Cutter',pct:10.2,vel:91.4}],
  'Fraser Ellard': [{type:'FF',name:'Four-seam Fastball',pct:51.5,vel:94.9},{type:'SL',name:'Slider',pct:27.0,vel:84.8},{type:'SI',name:'Sinker',pct:12.6,vel:93.7},{type:'CH',name:'Changeup',pct:8.2,vel:89.7}],
  'Freddy Peralta': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:94.8},{type:'CH',name:'Changeup',pct:21.2,vel:88.9},{type:'CU',name:'Curveball',pct:12.7,vel:79.5},{type:'SL',name:'Slider',pct:9.1,vel:83.8},{type:'CS',name:'Slow Curve',pct:2.4,vel:74.7},{type:'ST',name:'Sweeper',pct:1.1,vel:80.2}],
  'Freddy Tarnok': [{type:'FF',name:'Four-seam Fastball',pct:33.8,vel:95.4},{type:'CH',name:'Changeup',pct:24.6,vel:83.7},{type:'CU',name:'Curveball',pct:17.7,vel:79.8},{type:'SL',name:'Slider',pct:16.9,vel:86.6},{type:'SI',name:'Sinker',pct:6.9,vel:93.7}],
  'Félix Bautista': [{type:'SI',name:'Sinker',pct:61.7,vel:97.2},{type:'FS',name:'Splitter',pct:28.5,vel:88.9},{type:'SL',name:'Slider',pct:9.1,vel:85.4}],
  'Gabe Bierman': [{type:'SL',name:'Slider',pct:50.0,vel:84.2},{type:'FC',name:'Cutter',pct:21.4,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:21.4,vel:93.0},{type:'CH',name:'Changeup',pct:7.1,vel:93.6}],
  'Gabe Speier': [{type:'FF',name:'Four-seam Fastball',pct:44.6,vel:95.0},{type:'SI',name:'Sinker',pct:29.5,vel:94.4},{type:'SL',name:'Slider',pct:25.9,vel:83.2}],
  'Gabriel Sosa': [{type:'SI',name:'Sinker',pct:100.0,vel:92.4}],
  'Gabriel Yanez': [{type:'CH',name:'Changeup',pct:46.7,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:89.5},{type:'SL',name:'Slider',pct:20.0,vel:80.6}],
  'Garrett Acton': [{type:'FF',name:'Four-seam Fastball',pct:81.0,vel:94.2},{type:'CH',name:'Changeup',pct:19.0,vel:86.4}],
  'Garrett Cleavinger': [{type:'SL',name:'Slider',pct:38.9,vel:87.1},{type:'SI',name:'Sinker',pct:36.9,vel:96.3},{type:'FF',name:'Four-seam Fastball',pct:12.4,vel:97.0},{type:'ST',name:'Sweeper',pct:10.2,vel:81.2},{type:'FC',name:'Cutter',pct:1.7,vel:90.7}],
  'Garrett Crochet': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:96.5},{type:'FC',name:'Cutter',pct:27.8,vel:90.9},{type:'SI',name:'Sinker',pct:16.2,vel:96.1},{type:'ST',name:'Sweeper',pct:15.8,vel:82.8},{type:'CH',name:'Changeup',pct:4.3,vel:87.7}],
  'Garrett Hampson': [{type:'SL',name:'Slider',pct:66.7,vel:47.6},{type:'CU',name:'Curveball',pct:33.3,vel:46.5}],
  'Garrett McDaniels': [{type:'SL',name:'Slider',pct:50.2,vel:85.0},{type:'SI',name:'Sinker',pct:43.3,vel:92.1},{type:'CU',name:'Curveball',pct:4.8,vel:80.1},{type:'FF',name:'Four-seam Fastball',pct:1.7,vel:93.2}],
  'Garrett Schoenle': [{type:'SI',name:'Sinker',pct:59.1,vel:93.0},{type:'SL',name:'Slider',pct:22.7,vel:82.1},{type:'CH',name:'Changeup',pct:18.2,vel:86.0}],
  'Garrett Stallings': [{type:'FC',name:'Cutter',pct:25.0,vel:86.4},{type:'SI',name:'Sinker',pct:20.8,vel:92.0},{type:'CH',name:'Changeup',pct:16.7,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:91.7},{type:'SL',name:'Slider',pct:16.7,vel:84.0},{type:'CU',name:'Curveball',pct:4.2,vel:80.0}],
  'Garrett Whitlock': [{type:'SI',name:'Sinker',pct:47.0,vel:95.8},{type:'SL',name:'Slider',pct:30.6,vel:84.7},{type:'CH',name:'Changeup',pct:21.3,vel:84.3},{type:'ST',name:'Sweeper',pct:1.1,vel:81.8}],
  'Gary Sánchez': [{type:'FA',name:'Fastball',pct:57.9,vel:82.6},{type:'EP',name:'Eephus',pct:42.1,vel:63.8}],
  'Gavin Hollowell': [{type:'FF',name:'Four-seam Fastball',pct:45.3,vel:94.4},{type:'ST',name:'Sweeper',pct:33.7,vel:85.1},{type:'SI',name:'Sinker',pct:20.9,vel:95.3}],
  'Gavin Williams': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:96.6},{type:'CU',name:'Curveball',pct:22.1,vel:81.9},{type:'ST',name:'Sweeper',pct:19.7,vel:86.5},{type:'FC',name:'Cutter',pct:13.6,vel:91.7},{type:'SI',name:'Sinker',pct:6.4,vel:95.9}],
  'Geoff Hartlieb': [{type:'SL',name:'Slider',pct:61.0,vel:84.8},{type:'FF',name:'Four-seam Fastball',pct:28.5,vel:94.6},{type:'SI',name:'Sinker',pct:10.5,vel:94.0}],
  'Geoffrey Gilbert': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:91.5},{type:'CH',name:'Changeup',pct:22.2,vel:82.9},{type:'SI',name:'Sinker',pct:14.8,vel:91.3},{type:'SL',name:'Slider',pct:11.1,vel:76.0},{type:'CU',name:'Curveball',pct:7.4,vel:76.2}],
  'George Kirby': [{type:'FF',name:'Four-seam Fastball',pct:28.8,vel:96.1},{type:'SL',name:'Slider',pct:28.2,vel:87.1},{type:'SI',name:'Sinker',pct:26.8,vel:96.3},{type:'KC',name:'Knuckle Curve',pct:11.3,vel:84.3},{type:'FS',name:'Splitter',pct:2.8,vel:86.0},{type:'CH',name:'Changeup',pct:2.1,vel:87.8}],
  'George Soriano': [{type:'SL',name:'Slider',pct:32.4,vel:85.8},{type:'CH',name:'Changeup',pct:29.8,vel:88.4},{type:'SI',name:'Sinker',pct:20.0,vel:95.3},{type:'FF',name:'Four-seam Fastball',pct:17.7,vel:96.0}],
  'Gerardo Gutierrez': [{type:'CU',name:'Curveball',pct:25.0,vel:78.6},{type:'SI',name:'Sinker',pct:25.0,vel:93.8},{type:'SL',name:'Slider',pct:25.0,vel:80.0},{type:'CH',name:'Changeup',pct:12.5,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:12.5,vel:93.9}],
  'Germán Márquez': [{type:'FF',name:'Four-seam Fastball',pct:35.3,vel:94.8},{type:'KC',name:'Knuckle Curve',pct:31.1,vel:85.5},{type:'SI',name:'Sinker',pct:20.0,vel:94.2},{type:'SL',name:'Slider',pct:11.0,vel:88.8},{type:'CH',name:'Changeup',pct:2.6,vel:88.6}],
  'Gerson Garabito': [{type:'SL',name:'Slider',pct:24.3,vel:89.0},{type:'FF',name:'Four-seam Fastball',pct:22.1,vel:93.6},{type:'CU',name:'Curveball',pct:20.4,vel:82.0},{type:'SI',name:'Sinker',pct:17.7,vel:92.8},{type:'CH',name:'Changeup',pct:15.5,vel:86.8}],
  'Gordon Graceffo': [{type:'FF',name:'Four-seam Fastball',pct:43.5,vel:95.7},{type:'SL',name:'Slider',pct:26.6,vel:89.2},{type:'CU',name:'Curveball',pct:25.8,vel:83.4},{type:'CH',name:'Changeup',pct:2.6,vel:86.2},{type:'SI',name:'Sinker',pct:1.5,vel:95.3}],
  'Graham Ashcraft': [{type:'FC',name:'Cutter',pct:54.8,vel:97.0},{type:'SL',name:'Slider',pct:45.2,vel:89.8}],
  'Grant Anderson': [{type:'ST',name:'Sweeper',pct:38.1,vel:80.2},{type:'FF',name:'Four-seam Fastball',pct:32.7,vel:93.4},{type:'SI',name:'Sinker',pct:25.0,vel:93.1},{type:'CH',name:'Changeup',pct:4.2,vel:86.8}],
  'Grant Ford': [{type:'FF',name:'Four-seam Fastball',pct:61.9,vel:92.1},{type:'SL',name:'Slider',pct:19.0,vel:81.4},{type:'CU',name:'Curveball',pct:14.3,vel:80.2},{type:'FC',name:'Cutter',pct:4.8,vel:85.5}],
  'Grant Hartwig': [{type:'ST',name:'Sweeper',pct:48.0,vel:83.6},{type:'SI',name:'Sinker',pct:32.0,vel:94.2},{type:'FC',name:'Cutter',pct:8.0,vel:92.8},{type:'SL',name:'Slider',pct:8.0,vel:86.7},{type:'CH',name:'Changeup',pct:4.0,vel:87.7}],
  'Grant Holman': [{type:'FF',name:'Four-seam Fastball',pct:47.6,vel:94.6},{type:'FS',name:'Splitter',pct:38.8,vel:87.1},{type:'SL',name:'Slider',pct:13.3,vel:86.6}],
  'Grant Holmes': [{type:'SL',name:'Slider',pct:35.5,vel:85.3},{type:'FF',name:'Four-seam Fastball',pct:33.2,vel:94.5},{type:'CU',name:'Curveball',pct:15.2,vel:83.4},{type:'FC',name:'Cutter',pct:14.5,vel:92.1},{type:'CH',name:'Changeup',pct:1.6,vel:90.1}],
  'Grant Taylor': [{type:'FF',name:'Four-seam Fastball',pct:55.4,vel:98.7},{type:'CU',name:'Curveball',pct:21.6,vel:85.2},{type:'FC',name:'Cutter',pct:16.7,vel:95.3},{type:'SL',name:'Slider',pct:6.2,vel:90.0}],
  'Grant Wolfram': [{type:'SI',name:'Sinker',pct:40.6,vel:96.0},{type:'SL',name:'Slider',pct:25.0,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:15.2,vel:95.5},{type:'CU',name:'Curveball',pct:14.8,vel:84.3},{type:'ST',name:'Sweeper',pct:4.2,vel:84.4}],
  'Greg Weissert': [{type:'FF',name:'Four-seam Fastball',pct:33.4,vel:94.1},{type:'SI',name:'Sinker',pct:27.8,vel:93.9},{type:'SL',name:'Slider',pct:16.2,vel:85.6},{type:'CH',name:'Changeup',pct:9.7,vel:86.0},{type:'ST',name:'Sweeper',pct:8.9,vel:81.4},{type:'CU',name:'Curveball',pct:4.0,vel:81.1}],
  'Gregory Santos': [{type:'SL',name:'Slider',pct:60.9,vel:88.7},{type:'SI',name:'Sinker',pct:39.1,vel:97.2}],
  'Gregory Soto': [{type:'SI',name:'Sinker',pct:52.8,vel:96.9},{type:'SL',name:'Slider',pct:32.3,vel:86.2},{type:'ST',name:'Sweeper',pct:7.4,vel:84.2},{type:'FF',name:'Four-seam Fastball',pct:7.0,vel:97.2}],
  'Griffin Canning': [{type:'FF',name:'Four-seam Fastball',pct:34.0,vel:94.0},{type:'SL',name:'Slider',pct:31.4,vel:87.7},{type:'CH',name:'Changeup',pct:23.6,vel:89.4},{type:'KC',name:'Knuckle Curve',pct:5.8,vel:81.4},{type:'FC',name:'Cutter',pct:4.3,vel:89.5}],
  'Griffin Jax': [{type:'ST',name:'Sweeper',pct:43.4,vel:87.8},{type:'CH',name:'Changeup',pct:22.6,vel:92.3},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:97.0},{type:'SI',name:'Sinker',pct:11.4,vel:96.5},{type:'FC',name:'Cutter',pct:3.9,vel:93.4}],
  'Guillo Zuñiga': [{type:'SI',name:'Sinker',pct:33.3,vel:97.9},{type:'SL',name:'Slider',pct:33.3,vel:85.9},{type:'CH',name:'Changeup',pct:20.8,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:12.5,vel:98.1}],
  'Gunnar Hoglund': [{type:'FF',name:'Four-seam Fastball',pct:35.8,vel:93.6},{type:'CH',name:'Changeup',pct:23.0,vel:86.0},{type:'ST',name:'Sweeper',pct:17.4,vel:81.2},{type:'SI',name:'Sinker',pct:16.6,vel:93.2},{type:'SL',name:'Slider',pct:7.1,vel:90.7}],
  'Gus Varland': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:95.3},{type:'SL',name:'Slider',pct:36.6,vel:88.7},{type:'CH',name:'Changeup',pct:17.1,vel:90.7}],
  'Génesis Cabrera': [{type:'SI',name:'Sinker',pct:24.4,vel:95.4},{type:'FF',name:'Four-seam Fastball',pct:23.0,vel:95.7},{type:'FC',name:'Cutter',pct:20.4,vel:89.9},{type:'CU',name:'Curveball',pct:19.5,vel:80.1},{type:'FS',name:'Splitter',pct:12.7,vel:85.0}],
  'Hagen Smith': [{type:'FF',name:'Four-seam Fastball',pct:57.1,vel:94.7},{type:'SL',name:'Slider',pct:35.7,vel:81.2},{type:'CH',name:'Changeup',pct:7.1,vel:88.0}],
  'Harold Chirino': [{type:'CU',name:'Curveball',pct:28.6,vel:80.2},{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:93.5},{type:'SI',name:'Sinker',pct:28.6,vel:92.5},{type:'CH',name:'Changeup',pct:14.3,vel:86.9}],
  'Harrison Cohen': [{type:'FF',name:'Four-seam Fastball',pct:63.6,vel:92.4},{type:'FC',name:'Cutter',pct:36.4,vel:84.6}],
  'Hayden Birdsong': [{type:'FF',name:'Four-seam Fastball',pct:44.1,vel:95.5},{type:'SL',name:'Slider',pct:24.4,vel:88.9},{type:'CH',name:'Changeup',pct:16.8,vel:88.7},{type:'CU',name:'Curveball',pct:13.0,vel:80.3},{type:'SV',name:'Slurve',pct:1.7,vel:84.7}],
  'Hayden Harris': [{type:'FF',name:'Four-seam Fastball',pct:71.7,vel:91.9},{type:'SL',name:'Slider',pct:11.7,vel:82.7},{type:'ST',name:'Sweeper',pct:10.0,vel:81.8},{type:'FS',name:'Splitter',pct:3.3,vel:87.5},{type:'SI',name:'Sinker',pct:3.3,vel:92.7}],
  'Hayden Juenger': [{type:'CH',name:'Changeup',pct:45.5,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:93.7},{type:'SL',name:'Slider',pct:18.2,vel:86.0},{type:'FC',name:'Cutter',pct:13.6,vel:86.3}],
  'Hayden Snelsire': [{type:'SL',name:'Slider',pct:50.0,vel:84.8},{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:94.6},{type:'FC',name:'Cutter',pct:14.3,vel:86.0},{type:'CH',name:'Changeup',pct:7.1,vel:83.7}],
  'Hayden Wesneski': [{type:'FF',name:'Four-seam Fastball',pct:36.6,vel:93.9},{type:'ST',name:'Sweeper',pct:24.6,vel:83.3},{type:'FC',name:'Cutter',pct:11.4,vel:88.3},{type:'SI',name:'Sinker',pct:11.0,vel:91.9},{type:'CU',name:'Curveball',pct:9.3,vel:77.1},{type:'CH',name:'Changeup',pct:7.1,vel:85.7}],
  'Henry Gomez': [{type:'SI',name:'Sinker',pct:33.3,vel:94.2},{type:'SL',name:'Slider',pct:33.3,vel:81.5},{type:'FF',name:'Four-seam Fastball',pct:26.7,vel:93.8},{type:'CU',name:'Curveball',pct:6.7,vel:79.0}],
  'Hoby Milner': [{type:'ST',name:'Sweeper',pct:35.1,vel:78.2},{type:'SI',name:'Sinker',pct:32.9,vel:87.5},{type:'CH',name:'Changeup',pct:17.2,vel:81.1},{type:'FF',name:'Four-seam Fastball',pct:14.4,vel:87.9}],
  'Hogan Harris': [{type:'FF',name:'Four-seam Fastball',pct:56.7,vel:93.5},{type:'CU',name:'Curveball',pct:22.8,vel:73.5},{type:'CH',name:'Changeup',pct:13.2,vel:82.0},{type:'ST',name:'Sweeper',pct:3.1,vel:78.2},{type:'FC',name:'Cutter',pct:2.7,vel:89.1},{type:'SL',name:'Slider',pct:1.6,vel:84.4}],
  'Huascar Brazobán': [{type:'CH',name:'Changeup',pct:38.1,vel:90.8},{type:'SI',name:'Sinker',pct:37.2,vel:96.4},{type:'FC',name:'Cutter',pct:12.9,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:11.9,vel:96.4}],
  'Huascar Ynoa': [{type:'FF',name:'Four-seam Fastball',pct:80.0,vel:93.2},{type:'SL',name:'Slider',pct:20.0,vel:82.9}],
  'Hunter Barco': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:94.0},{type:'FS',name:'Splitter',pct:28.3,vel:85.3},{type:'SL',name:'Slider',pct:21.7,vel:82.8}],
  'Hunter Bigge': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:97.5},{type:'SL',name:'Slider',pct:44.4,vel:89.1},{type:'CU',name:'Curveball',pct:6.2,vel:81.6},{type:'SI',name:'Sinker',pct:4.1,vel:95.8}],
  'Hunter Brown': [{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:96.6},{type:'SI',name:'Sinker',pct:22.7,vel:95.7},{type:'KC',name:'Knuckle Curve',pct:17.9,vel:83.5},{type:'CH',name:'Changeup',pct:12.0,vel:88.2},{type:'SL',name:'Slider',pct:8.5,vel:91.4},{type:'FC',name:'Cutter',pct:1.4,vel:93.4}],
  'Hunter Dobbins': [{type:'FF',name:'Four-seam Fastball',pct:40.5,vel:95.5},{type:'SL',name:'Slider',pct:27.1,vel:87.7},{type:'CU',name:'Curveball',pct:12.0,vel:78.7},{type:'ST',name:'Sweeper',pct:10.3,vel:81.3},{type:'FS',name:'Splitter',pct:8.7,vel:90.5},{type:'SI',name:'Sinker',pct:1.4,vel:95.0}],
  'Hunter Gaddis': [{type:'SL',name:'Slider',pct:53.4,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:32.8,vel:94.7},{type:'CH',name:'Changeup',pct:13.7,vel:78.9}],
  'Hunter Greene': [{type:'FF',name:'Four-seam Fastball',pct:53.9,vel:99.5},{type:'SL',name:'Slider',pct:35.4,vel:89.6},{type:'FS',name:'Splitter',pct:10.6,vel:88.3}],
  'Hunter Harvey': [{type:'FF',name:'Four-seam Fastball',pct:52.8,vel:96.2},{type:'FS',name:'Splitter',pct:20.8,vel:87.8},{type:'SL',name:'Slider',pct:16.9,vel:86.6},{type:'CU',name:'Curveball',pct:9.5,vel:81.5}],
  'Hunter Stratton': [{type:'FF',name:'Four-seam Fastball',pct:45.6,vel:96.0},{type:'SL',name:'Slider',pct:29.2,vel:84.8},{type:'FC',name:'Cutter',pct:22.1,vel:93.4},{type:'SI',name:'Sinker',pct:2.0,vel:95.5},{type:'FS',name:'Splitter',pct:1.1,vel:91.2}],
  'Hunter Strickland': [{type:'FF',name:'Four-seam Fastball',pct:33.7,vel:93.6},{type:'SL',name:'Slider',pct:32.6,vel:84.9},{type:'ST',name:'Sweeper',pct:13.5,vel:81.5},{type:'SI',name:'Sinker',pct:11.4,vel:92.9},{type:'CH',name:'Changeup',pct:8.8,vel:87.7}],
  'Hurston Waldrep': [{type:'FS',name:'Splitter',pct:32.4,vel:86.8},{type:'FC',name:'Cutter',pct:21.8,vel:93.1},{type:'SI',name:'Sinker',pct:18.8,vel:95.9},{type:'CU',name:'Curveball',pct:13.1,vel:82.7},{type:'SL',name:'Slider',pct:11.6,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:95.5}],
  'Héctor Neris': [{type:'FS',name:'Splitter',pct:43.1,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:40.3,vel:92.4},{type:'SI',name:'Sinker',pct:8.0,vel:92.6},{type:'CH',name:'Changeup',pct:5.7,vel:88.7},{type:'SL',name:'Slider',pct:2.9,vel:86.3}],
  'Ian Anderson': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:93.7},{type:'CH',name:'Changeup',pct:35.0,vel:88.2},{type:'CU',name:'Curveball',pct:13.8,vel:80.9}],
  'Ian Gibaut': [{type:'FF',name:'Four-seam Fastball',pct:52.1,vel:94.1},{type:'ST',name:'Sweeper',pct:18.0,vel:83.8},{type:'FC',name:'Cutter',pct:14.2,vel:90.7},{type:'SL',name:'Slider',pct:12.6,vel:87.3},{type:'CH',name:'Changeup',pct:2.9,vel:84.3}],
  'Ian Hamilton': [{type:'SI',name:'Sinker',pct:48.9,vel:94.8},{type:'SL',name:'Slider',pct:37.7,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:13.4,vel:95.4}],
  'Ian Seymour': [{type:'FF',name:'Four-seam Fastball',pct:31.8,vel:91.6},{type:'CH',name:'Changeup',pct:31.6,vel:83.6},{type:'FC',name:'Cutter',pct:21.6,vel:88.3},{type:'ST',name:'Sweeper',pct:5.8,vel:81.0},{type:'SI',name:'Sinker',pct:5.4,vel:90.7},{type:'SL',name:'Slider',pct:2.2,vel:83.0},{type:'CU',name:'Curveball',pct:1.6,vel:74.4}],
  'Isaac Mattson': [{type:'FF',name:'Four-seam Fastball',pct:78.2,vel:93.9},{type:'CH',name:'Changeup',pct:12.0,vel:86.0},{type:'SL',name:'Slider',pct:8.7,vel:85.4},{type:'CU',name:'Curveball',pct:1.1,vel:79.0}],
  'Isaiah Campbell': [{type:'SL',name:'Slider',pct:43.1,vel:89.7},{type:'FF',name:'Four-seam Fastball',pct:23.4,vel:95.2},{type:'ST',name:'Sweeper',pct:16.1,vel:84.6},{type:'CU',name:'Curveball',pct:9.5,vel:83.8},{type:'SI',name:'Sinker',pct:8.0,vel:94.7}],
  'Isiah Kiner-Falefa': [{type:'FA',name:'Fastball',pct:85.7,vel:69.2},{type:'EP',name:'Eephus',pct:14.3,vel:62.9}],
  'J.C. Flowers': [{type:'SL',name:'Slider',pct:55.6,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:93.5},{type:'CH',name:'Changeup',pct:11.1,vel:87.9}],
  'J.P. Feyereisen': [{type:'FF',name:'Four-seam Fastball',pct:40.2,vel:91.3},{type:'CH',name:'Changeup',pct:39.2,vel:87.0},{type:'SL',name:'Slider',pct:20.6,vel:83.3}],
  'J.P. France': [{type:'FC',name:'Cutter',pct:39.5,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:34.2,vel:92.5},{type:'CU',name:'Curveball',pct:18.4,vel:77.1},{type:'CH',name:'Changeup',pct:5.3,vel:85.2},{type:'SI',name:'Sinker',pct:1.3,vel:90.7},{type:'ST',name:'Sweeper',pct:1.3,vel:80.8}],
  'J.T. Ginn': [{type:'SI',name:'Sinker',pct:51.4,vel:93.4},{type:'SL',name:'Slider',pct:25.8,vel:86.1},{type:'FC',name:'Cutter',pct:13.3,vel:92.0},{type:'CH',name:'Changeup',pct:9.4,vel:88.5}],
  'JP Sears': [{type:'FF',name:'Four-seam Fastball',pct:40.3,vel:92.2},{type:'ST',name:'Sweeper',pct:27.3,vel:79.1},{type:'CH',name:'Changeup',pct:14.8,vel:83.4},{type:'SI',name:'Sinker',pct:6.8,vel:90.4},{type:'SL',name:'Slider',pct:6.5,vel:80.7},{type:'CU',name:'Curveball',pct:3.8,vel:79.5}],
  'JT Brubaker': [{type:'SI',name:'Sinker',pct:49.9,vel:93.4},{type:'SL',name:'Slider',pct:24.3,vel:86.3},{type:'CH',name:'Changeup',pct:15.4,vel:87.9},{type:'CU',name:'Curveball',pct:10.4,vel:81.6}],
  'JT Chargois': [{type:'SL',name:'Slider',pct:53.8,vel:81.7},{type:'SI',name:'Sinker',pct:46.2,vel:92.6}],
  'Jack Carey': [{type:'FC',name:'Cutter',pct:50.0,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:90.7},{type:'CH',name:'Changeup',pct:8.3,vel:83.5},{type:'CU',name:'Curveball',pct:8.3,vel:80.3},{type:'SL',name:'Slider',pct:8.3,vel:83.3}],
  'Jack Dallas': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:92.3},{type:'SL',name:'Slider',pct:40.0,vel:82.3},{type:'FC',name:'Cutter',pct:10.0,vel:91.8}],
  'Jack Dreyer': [{type:'SL',name:'Slider',pct:46.1,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:45.1,vel:92.7},{type:'CU',name:'Curveball',pct:8.7,vel:78.9}],
  'Jack Flaherty': [{type:'FF',name:'Four-seam Fastball',pct:46.6,vel:92.9},{type:'KC',name:'Knuckle Curve',pct:25.0,vel:77.8},{type:'SL',name:'Slider',pct:23.6,vel:85.0},{type:'CH',name:'Changeup',pct:3.0,vel:86.0},{type:'SI',name:'Sinker',pct:1.9,vel:91.0}],
  'Jack Jasiak': [{type:'FF',name:'Four-seam Fastball',pct:52.6,vel:93.6},{type:'ST',name:'Sweeper',pct:36.8,vel:84.8},{type:'SL',name:'Slider',pct:10.5,vel:81.2}],
  'Jack Kochanowicz': [{type:'SI',name:'Sinker',pct:47.6,vel:95.5},{type:'FF',name:'Four-seam Fastball',pct:18.3,vel:95.5},{type:'SL',name:'Slider',pct:15.0,vel:87.2},{type:'CH',name:'Changeup',pct:13.5,vel:89.9},{type:'ST',name:'Sweeper',pct:5.5,vel:82.4}],
  'Jack Leiter': [{type:'FF',name:'Four-seam Fastball',pct:38.4,vel:97.4},{type:'SL',name:'Slider',pct:23.0,vel:87.6},{type:'CH',name:'Changeup',pct:16.9,vel:90.8},{type:'SI',name:'Sinker',pct:12.3,vel:96.2},{type:'CU',name:'Curveball',pct:9.2,vel:82.0}],
  'Jack Little': [{type:'FF',name:'Four-seam Fastball',pct:57.9,vel:94.0},{type:'SL',name:'Slider',pct:26.3,vel:86.6},{type:'FS',name:'Splitter',pct:15.8,vel:86.4}],
  'Jack Perkins': [{type:'FF',name:'Four-seam Fastball',pct:41.9,vel:96.0},{type:'ST',name:'Sweeper',pct:32.8,vel:86.3},{type:'FC',name:'Cutter',pct:14.1,vel:93.4},{type:'CH',name:'Changeup',pct:10.4,vel:89.3}],
  'Jack Sellinger': [{type:'SL',name:'Slider',pct:66.7,vel:84.0},{type:'SI',name:'Sinker',pct:33.3,vel:94.0}],
  'Jack Sinclair': [{type:'SI',name:'Sinker',pct:50.0,vel:92.4},{type:'ST',name:'Sweeper',pct:36.4,vel:80.6},{type:'CH',name:'Changeup',pct:13.6,vel:84.1}],
  'Jack Young': [{type:'CH',name:'Changeup',pct:37.5,vel:83.6},{type:'CU',name:'Curveball',pct:29.2,vel:77.3},{type:'FF',name:'Four-seam Fastball',pct:20.8,vel:91.9},{type:'FC',name:'Cutter',pct:4.2,vel:90.3},{type:'SI',name:'Sinker',pct:4.2,vel:92.3},{type:'SL',name:'Slider',pct:4.2,vel:80.4}],
  'Jackson Ferris': [{type:'FF',name:'Four-seam Fastball',pct:59.7,vel:94.1},{type:'SL',name:'Slider',pct:21.0,vel:84.6},{type:'CU',name:'Curveball',pct:17.7,vel:75.2},{type:'SI',name:'Sinker',pct:1.6,vel:95.3}],
  'Jackson Jobe': [{type:'FF',name:'Four-seam Fastball',pct:31.3,vel:96.5},{type:'SL',name:'Slider',pct:30.2,vel:88.8},{type:'CH',name:'Changeup',pct:16.7,vel:85.4},{type:'SI',name:'Sinker',pct:13.1,vel:95.2},{type:'CU',name:'Curveball',pct:8.3,vel:81.4}],
  'Jackson Kowar': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:97.3},{type:'SL',name:'Slider',pct:35.6,vel:86.2},{type:'CH',name:'Changeup',pct:5.3,vel:87.0},{type:'SI',name:'Sinker',pct:1.4,vel:96.4}],
  'Jackson Rutledge': [{type:'SI',name:'Sinker',pct:32.5,vel:95.2},{type:'SL',name:'Slider',pct:25.9,vel:85.3},{type:'FF',name:'Four-seam Fastball',pct:18.5,vel:95.6},{type:'FC',name:'Cutter',pct:13.7,vel:89.0},{type:'FS',name:'Splitter',pct:9.4,vel:85.2}],
  'Jacob Amaya': [{type:'EP',name:'Eephus',pct:100.0,vel:48.1}],
  'Jacob Barnes': [{type:'FC',name:'Cutter',pct:56.2,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:94.1},{type:'FS',name:'Splitter',pct:6.2,vel:86.3}],
  'Jacob Bosiokovic': [{type:'FF',name:'Four-seam Fastball',pct:66.7,vel:95.8},{type:'SL',name:'Slider',pct:33.3,vel:86.0}],
  'Jacob Latz': [{type:'FF',name:'Four-seam Fastball',pct:49.4,vel:94.2},{type:'CH',name:'Changeup',pct:23.3,vel:84.7},{type:'SL',name:'Slider',pct:20.9,vel:84.4},{type:'CU',name:'Curveball',pct:6.4,vel:78.3}],
  'Jacob Lopez': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:90.8},{type:'SL',name:'Slider',pct:30.6,vel:78.1},{type:'FC',name:'Cutter',pct:14.6,vel:87.6},{type:'CH',name:'Changeup',pct:13.4,vel:82.8},{type:'SI',name:'Sinker',pct:6.2,vel:90.2}],
  'Jacob Misiorowski': [{type:'FF',name:'Four-seam Fastball',pct:55.2,vel:99.3},{type:'SL',name:'Slider',pct:24.3,vel:94.1},{type:'CU',name:'Curveball',pct:14.6,vel:87.1},{type:'CH',name:'Changeup',pct:5.9,vel:92.3}],
  'Jacob Stallings': [{type:'FA',name:'Fastball',pct:65.4,vel:70.7},{type:'CS',name:'Slow Curve',pct:23.1,vel:42.5},{type:'CH',name:'Changeup',pct:11.5,vel:55.5}],
  'Jacob Waguespack': [{type:'FC',name:'Cutter',pct:46.2,vel:84.8},{type:'FF',name:'Four-seam Fastball',pct:34.6,vel:93.0},{type:'CH',name:'Changeup',pct:15.4,vel:83.6},{type:'CU',name:'Curveball',pct:3.8,vel:76.2}],
  'Jacob Wallace': [{type:'FC',name:'Cutter',pct:80.0,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:20.0,vel:95.2}],
  'Jacob Webb': [{type:'FF',name:'Four-seam Fastball',pct:44.1,vel:93.4},{type:'CH',name:'Changeup',pct:34.8,vel:84.8},{type:'ST',name:'Sweeper',pct:21.1,vel:82.0}],
  'Jacob Wosinski': [{type:'SL',name:'Slider',pct:46.2,vel:81.8},{type:'SI',name:'Sinker',pct:23.1,vel:92.6},{type:'CH',name:'Changeup',pct:15.4,vel:85.9},{type:'CU',name:'Curveball',pct:7.7,vel:81.1},{type:'FC',name:'Cutter',pct:7.7,vel:85.4}],
  'Jacob deGrom': [{type:'FF',name:'Four-seam Fastball',pct:46.0,vel:97.4},{type:'SL',name:'Slider',pct:37.5,vel:90.3},{type:'CH',name:'Changeup',pct:11.2,vel:89.8},{type:'CU',name:'Curveball',pct:5.3,vel:80.9}],
  'Jaden Hill': [{type:'SI',name:'Sinker',pct:28.5,vel:96.9},{type:'SL',name:'Slider',pct:24.7,vel:88.5},{type:'CH',name:'Changeup',pct:24.3,vel:84.7},{type:'FF',name:'Four-seam Fastball',pct:22.2,vel:96.7}],
  'Jake Bauers': [{type:'FA',name:'Fastball',pct:79.7,vel:67.4},{type:'EP',name:'Eephus',pct:16.5,vel:57.2},{type:'FF',name:'Four-seam Fastball',pct:3.8,vel:79.3}],
  'Jake Bird': [{type:'ST',name:'Sweeper',pct:39.3,vel:83.9},{type:'SI',name:'Sinker',pct:34.7,vel:94.4},{type:'CU',name:'Curveball',pct:22.9,vel:80.5},{type:'FC',name:'Cutter',pct:3.1,vel:92.8}],
  'Jake Eder': [{type:'FF',name:'Four-seam Fastball',pct:44.7,vel:93.1},{type:'ST',name:'Sweeper',pct:19.5,vel:83.0},{type:'SL',name:'Slider',pct:18.2,vel:87.8},{type:'CH',name:'Changeup',pct:17.5,vel:84.5}],
  'Jake Faherty': [{type:'SI',name:'Sinker',pct:81.8,vel:99.1},{type:'SL',name:'Slider',pct:18.2,vel:85.2}],
  'Jake Higginbotham': [{type:'FF',name:'Four-seam Fastball',pct:80.0,vel:94.1},{type:'SL',name:'Slider',pct:20.0,vel:83.6}],
  'Jake Irvin': [{type:'FF',name:'Four-seam Fastball',pct:31.8,vel:92.3},{type:'CU',name:'Curveball',pct:29.2,vel:77.8},{type:'SI',name:'Sinker',pct:21.9,vel:91.9},{type:'CH',name:'Changeup',pct:8.0,vel:85.6},{type:'FC',name:'Cutter',pct:4.7,vel:87.3},{type:'SL',name:'Slider',pct:4.2,vel:83.6}],
  'Jake Palisch': [{type:'FF',name:'Four-seam Fastball',pct:36.4,vel:91.0},{type:'CH',name:'Changeup',pct:29.5,vel:84.8},{type:'SL',name:'Slider',pct:20.5,vel:81.4},{type:'FC',name:'Cutter',pct:13.6,vel:85.6}],
  'Jake Rice': [{type:'SI',name:'Sinker',pct:66.7,vel:92.1},{type:'SL',name:'Slider',pct:33.3,vel:82.9}],
  'Jake Rogers': [{type:'EP',name:'Eephus',pct:49.0,vel:52.9},{type:'FA',name:'Fastball',pct:40.8,vel:75.8},{type:'KN',name:'Knuckleball',pct:10.2,vel:64.5}],
  'Jake Woodford': [{type:'SI',name:'Sinker',pct:31.3,vel:93.2},{type:'ST',name:'Sweeper',pct:22.7,vel:81.0},{type:'CH',name:'Changeup',pct:18.4,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:18.2,vel:93.1},{type:'FC',name:'Cutter',pct:9.4,vel:89.0}],
  'Jakob Junis': [{type:'SL',name:'Slider',pct:44.4,vel:82.9},{type:'SI',name:'Sinker',pct:27.7,vel:90.9},{type:'CH',name:'Changeup',pct:19.5,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:8.4,vel:91.1}],
  'Jalen Beeks': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:94.4},{type:'CH',name:'Changeup',pct:37.6,vel:88.8},{type:'FC',name:'Cutter',pct:9.9,vel:84.2}],
  'James Hicks': [{type:'FF',name:'Four-seam Fastball',pct:36.0,vel:93.7},{type:'SI',name:'Sinker',pct:28.0,vel:93.1},{type:'CH',name:'Changeup',pct:12.0,vel:87.3},{type:'SL',name:'Slider',pct:12.0,vel:86.7},{type:'ST',name:'Sweeper',pct:12.0,vel:79.7}],
  'James Karinchak': [{type:'CU',name:'Curveball',pct:59.2,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:93.1}],
  'Jameson Taillon': [{type:'FF',name:'Four-seam Fastball',pct:38.0,vel:92.3},{type:'ST',name:'Sweeper',pct:15.6,vel:80.2},{type:'FC',name:'Cutter',pct:14.6,vel:85.8},{type:'CU',name:'Curveball',pct:13.3,vel:79.7},{type:'CH',name:'Changeup',pct:11.2,vel:84.0},{type:'SI',name:'Sinker',pct:7.3,vel:92.3}],
  'Janson Junk': [{type:'FF',name:'Four-seam Fastball',pct:37.4,vel:93.6},{type:'SL',name:'Slider',pct:27.9,vel:86.9},{type:'ST',name:'Sweeper',pct:15.1,vel:82.0},{type:'CU',name:'Curveball',pct:11.6,vel:81.9},{type:'CH',name:'Changeup',pct:8.0,vel:88.2}],
  'Jared Koenig': [{type:'SI',name:'Sinker',pct:56.7,vel:95.8},{type:'FC',name:'Cutter',pct:17.4,vel:90.8},{type:'CU',name:'Curveball',pct:15.5,vel:81.7},{type:'CH',name:'Changeup',pct:9.1,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:1.3,vel:96.5}],
  'Jared Shuster': [{type:'CH',name:'Changeup',pct:34.6,vel:84.1},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:92.4},{type:'SL',name:'Slider',pct:27.7,vel:85.8},{type:'SI',name:'Sinker',pct:3.8,vel:91.9}],
  'Jared Triolo': [{type:'EP',name:'Eephus',pct:73.9,vel:41.4},{type:'FA',name:'Fastball',pct:26.1,vel:81.4}],
  'Jared Young': [{type:'FA',name:'Fastball',pct:54.5,vel:70.7},{type:'EP',name:'Eephus',pct:45.5,vel:54.0}],
  'Jason Adam': [{type:'SL',name:'Slider',pct:34.3,vel:83.9},{type:'CH',name:'Changeup',pct:33.6,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:23.5,vel:94.5},{type:'ST',name:'Sweeper',pct:8.3,vel:77.5}],
  'Jason Alexander': [{type:'SI',name:'Sinker',pct:39.9,vel:90.9},{type:'CH',name:'Changeup',pct:32.7,vel:80.3},{type:'ST',name:'Sweeper',pct:16.0,vel:78.5},{type:'FF',name:'Four-seam Fastball',pct:10.1,vel:91.9},{type:'FC',name:'Cutter',pct:1.0,vel:87.2}],
  'Jason Foley': [{type:'SL',name:'Slider',pct:50.0,vel:87.3},{type:'SI',name:'Sinker',pct:22.2,vel:94.9},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:94.8},{type:'CH',name:'Changeup',pct:11.1,vel:91.6}],
  'Javier Assad': [{type:'SI',name:'Sinker',pct:40.6,vel:92.2},{type:'FC',name:'Cutter',pct:21.9,vel:89.0},{type:'ST',name:'Sweeper',pct:12.9,vel:80.9},{type:'FF',name:'Four-seam Fastball',pct:12.7,vel:92.2},{type:'CU',name:'Curveball',pct:6.3,vel:76.9},{type:'CH',name:'Changeup',pct:4.2,vel:85.2},{type:'SL',name:'Slider',pct:1.4,vel:83.8}],
  'Javier Sanoja': [{type:'FA',name:'Fastball',pct:98.8,vel:62.6}],
  'Jayden Murray': [{type:'FF',name:'Four-seam Fastball',pct:47.2,vel:96.2},{type:'SI',name:'Sinker',pct:22.2,vel:95.5},{type:'ST',name:'Sweeper',pct:19.3,vel:82.1},{type:'FC',name:'Cutter',pct:5.7,vel:92.9},{type:'CH',name:'Changeup',pct:3.4,vel:90.1},{type:'CU',name:'Curveball',pct:2.3,vel:81.4}],
  'Jaydenn Estanista': [{type:'FF',name:'Four-seam Fastball',pct:67.6,vel:95.6},{type:'SL',name:'Slider',pct:32.4,vel:88.1}],
  'Jaylen Nowlin': [{type:'SI',name:'Sinker',pct:50.0,vel:91.7},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:91.3},{type:'SL',name:'Slider',pct:25.0,vel:84.6}],
  'Jayvien Sandridge': [{type:'SL',name:'Slider',pct:41.9,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:95.6},{type:'SI',name:'Sinker',pct:12.9,vel:95.9},{type:'FS',name:'Splitter',pct:6.5,vel:85.8}],
  'Jean Reyes': [{type:'SI',name:'Sinker',pct:60.0,vel:95.8},{type:'SL',name:'Slider',pct:28.6,vel:83.6},{type:'CU',name:'Curveball',pct:5.7,vel:81.4},{type:'FC',name:'Cutter',pct:5.7,vel:86.1}],
  'Jeff Brigham': [{type:'FF',name:'Four-seam Fastball',pct:47.6,vel:94.2},{type:'FC',name:'Cutter',pct:31.5,vel:89.4},{type:'ST',name:'Sweeper',pct:21.0,vel:81.9}],
  'Jeff Hoffman': [{type:'FF',name:'Four-seam Fastball',pct:37.3,vel:96.4},{type:'SL',name:'Slider',pct:29.9,vel:87.0},{type:'FS',name:'Splitter',pct:23.9,vel:90.0},{type:'SI',name:'Sinker',pct:8.8,vel:96.5}],
  'Jeffrey Springs': [{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:90.7},{type:'CH',name:'Changeup',pct:25.3,vel:79.1},{type:'SL',name:'Slider',pct:20.2,vel:83.5},{type:'ST',name:'Sweeper',pct:6.1,vel:76.2},{type:'FC',name:'Cutter',pct:5.9,vel:86.9}],
  'Jeremiah Estrada': [{type:'FF',name:'Four-seam Fastball',pct:56.6,vel:97.8},{type:'FS',name:'Splitter',pct:23.2,vel:83.6},{type:'SL',name:'Slider',pct:20.2,vel:88.4}],
  'Jesse Bergin': [{type:'SL',name:'Slider',pct:54.2,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:95.2},{type:'SI',name:'Sinker',pct:8.3,vel:96.7},{type:'ST',name:'Sweeper',pct:4.2,vel:82.1}],
  'Jesse Chavez': [{type:'FC',name:'Cutter',pct:38.6,vel:87.9},{type:'SI',name:'Sinker',pct:34.3,vel:89.5},{type:'CH',name:'Changeup',pct:18.6,vel:83.9},{type:'CU',name:'Curveball',pct:4.8,vel:73.8},{type:'SL',name:'Slider',pct:3.8,vel:80.4}],
  'Jesse Hahn': [{type:'SI',name:'Sinker',pct:55.6,vel:95.1},{type:'ST',name:'Sweeper',pct:21.4,vel:82.3},{type:'CU',name:'Curveball',pct:15.4,vel:79.0},{type:'FF',name:'Four-seam Fastball',pct:7.7,vel:95.2}],
  'Jesse Scholtens': [{type:'FF',name:'Four-seam Fastball',pct:38.3,vel:95.3},{type:'SL',name:'Slider',pct:33.1,vel:87.8},{type:'ST',name:'Sweeper',pct:23.4,vel:81.1},{type:'FS',name:'Splitter',pct:5.2,vel:84.9}],
  'Jesus Tinoco': [{type:'SL',name:'Slider',pct:41.7,vel:85.0},{type:'SI',name:'Sinker',pct:31.5,vel:95.1},{type:'CH',name:'Changeup',pct:16.6,vel:89.2},{type:'FF',name:'Four-seam Fastball',pct:10.1,vel:95.1}],
  'Jesús Liranzo': [{type:'FF',name:'Four-seam Fastball',pct:52.9,vel:95.7},{type:'FC',name:'Cutter',pct:29.4,vel:86.1},{type:'CH',name:'Changeup',pct:17.6,vel:89.9}],
  'Jesús Luzardo': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:96.5},{type:'ST',name:'Sweeper',pct:30.6,vel:86.1},{type:'CH',name:'Changeup',pct:17.3,vel:87.9},{type:'SI',name:'Sinker',pct:10.9,vel:95.8},{type:'SL',name:'Slider',pct:8.1,vel:86.5}],
  'Jhoan Duran': [{type:'SI',name:'Sinker',pct:39.7,vel:97.7},{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:100.5},{type:'KC',name:'Knuckle Curve',pct:19.4,vel:87.5},{type:'ST',name:'Sweeper',pct:5.9,vel:87.2}],
  'Jhonathan Díaz': [{type:'SL',name:'Slider',pct:46.2,vel:78.5},{type:'CH',name:'Changeup',pct:19.2,vel:81.8},{type:'CU',name:'Curveball',pct:11.5,vel:71.6},{type:'FF',name:'Four-seam Fastball',pct:11.5,vel:89.6},{type:'SI',name:'Sinker',pct:11.5,vel:87.8}],
  'Jhonny Pereda': [{type:'FA',name:'Fastball',pct:77.1,vel:67.7},{type:'FF',name:'Four-seam Fastball',pct:12.9,vel:88.0},{type:'EP',name:'Eephus',pct:10.0,vel:45.1}],
  'Jhosmer Alvarez': [{type:'FC',name:'Cutter',pct:75.0,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:96.1},{type:'SI',name:'Sinker',pct:8.3,vel:97.0}],
  'Jimmy Herget': [{type:'ST',name:'Sweeper',pct:30.9,vel:77.8},{type:'SL',name:'Slider',pct:28.6,vel:85.5},{type:'SI',name:'Sinker',pct:27.6,vel:92.0},{type:'FF',name:'Four-seam Fastball',pct:7.5,vel:93.0},{type:'CH',name:'Changeup',pct:5.4,vel:86.6}],
  'Jimmy Joyce': [{type:'SI',name:'Sinker',pct:75.0,vel:88.8},{type:'CU',name:'Curveball',pct:25.0,vel:79.3}],
  'Jimmy Kingsbury': [{type:'SI',name:'Sinker',pct:33.3,vel:90.3},{type:'CH',name:'Changeup',pct:16.7,vel:82.8},{type:'CU',name:'Curveball',pct:16.7,vel:78.5},{type:'FC',name:'Cutter',pct:16.7,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:90.6}],
  'Jimmy Reyes': [{type:'CH',name:'Changeup',pct:50.0,vel:87.0},{type:'SI',name:'Sinker',pct:50.0,vel:88.2}],
  'JoJo Romero': [{type:'SL',name:'Slider',pct:37.7,vel:83.0},{type:'SI',name:'Sinker',pct:31.8,vel:93.7},{type:'CH',name:'Changeup',pct:22.5,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:6.5,vel:94.2},{type:'SV',name:'Slurve',pct:1.3,vel:82.5}],
  'Joan Adon': [{type:'SI',name:'Sinker',pct:33.3,vel:92.8},{type:'FF',name:'Four-seam Fastball',pct:29.2,vel:93.8},{type:'CU',name:'Curveball',pct:25.0,vel:80.8},{type:'CH',name:'Changeup',pct:12.5,vel:87.2}],
  'Joe Barlow': [{type:'SL',name:'Slider',pct:75.0,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:94.3}],
  'Joe Boyle': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:98.5},{type:'SL',name:'Slider',pct:35.1,vel:90.8},{type:'FS',name:'Splitter',pct:16.3,vel:93.0}],
  'Joe La Sorsa': [{type:'SI',name:'Sinker',pct:45.2,vel:91.8},{type:'ST',name:'Sweeper',pct:22.9,vel:78.2},{type:'FF',name:'Four-seam Fastball',pct:19.1,vel:92.9},{type:'CH',name:'Changeup',pct:12.7,vel:85.3}],
  'Joe Mantiply': [{type:'SI',name:'Sinker',pct:37.2,vel:88.4},{type:'CU',name:'Curveball',pct:32.9,vel:78.7},{type:'CH',name:'Changeup',pct:27.3,vel:80.5},{type:'FF',name:'Four-seam Fastball',pct:2.6,vel:88.2}],
  'Joe Rock': [{type:'SI',name:'Sinker',pct:44.1,vel:93.5},{type:'SL',name:'Slider',pct:26.2,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:22.8,vel:94.2},{type:'CH',name:'Changeup',pct:6.9,vel:87.7}],
  'Joe Ross': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:94.2},{type:'SI',name:'Sinker',pct:28.1,vel:94.6},{type:'SL',name:'Slider',pct:21.5,vel:87.2},{type:'CH',name:'Changeup',pct:9.0,vel:90.0},{type:'CU',name:'Curveball',pct:5.8,vel:83.4}],
  'Joe Ryan': [{type:'FF',name:'Four-seam Fastball',pct:50.3,vel:93.6},{type:'ST',name:'Sweeper',pct:13.2,vel:80.6},{type:'SI',name:'Sinker',pct:12.4,vel:93.1},{type:'FS',name:'Splitter',pct:11.0,vel:87.6},{type:'SL',name:'Slider',pct:9.3,vel:87.8},{type:'KC',name:'Knuckle Curve',pct:3.8,vel:79.1}],
  'Joel Hurtado': [{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:95.8},{type:'SI',name:'Sinker',pct:33.3,vel:95.3},{type:'SL',name:'Slider',pct:19.0,vel:85.4},{type:'CH',name:'Changeup',pct:14.3,vel:84.9}],
  'Joel Kuhnel': [{type:'SI',name:'Sinker',pct:40.0,vel:93.2},{type:'CU',name:'Curveball',pct:30.0,vel:80.1},{type:'SL',name:'Slider',pct:15.0,vel:85.7},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:92.8},{type:'CH',name:'Changeup',pct:5.0,vel:88.9}],
  'Joel Payamps': [{type:'ST',name:'Sweeper',pct:47.0,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:94.7},{type:'SI',name:'Sinker',pct:16.5,vel:94.8}],
  'Joel Peguero': [{type:'SI',name:'Sinker',pct:34.0,vel:99.8},{type:'SL',name:'Slider',pct:33.1,vel:91.7},{type:'FF',name:'Four-seam Fastball',pct:32.8,vel:99.9}],
  'Joey Cantillo': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:91.7},{type:'CH',name:'Changeup',pct:30.7,vel:78.3},{type:'CU',name:'Curveball',pct:18.6,vel:77.3},{type:'SL',name:'Slider',pct:8.6,vel:85.1}],
  'Joey Estes': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:91.2},{type:'SL',name:'Slider',pct:18.4,vel:82.3},{type:'ST',name:'Sweeper',pct:14.7,vel:77.2},{type:'CH',name:'Changeup',pct:10.2,vel:83.9},{type:'SI',name:'Sinker',pct:8.3,vel:89.8}],
  'Joey Gerber': [{type:'FF',name:'Four-seam Fastball',pct:70.3,vel:93.8},{type:'SL',name:'Slider',pct:28.1,vel:84.9},{type:'CH',name:'Changeup',pct:1.6,vel:87.4}],
  'Joey Lucchesi': [{type:'SI',name:'Sinker',pct:47.8,vel:92.4},{type:'CU',name:'Curveball',pct:26.6,vel:77.8},{type:'FF',name:'Four-seam Fastball',pct:25.5,vel:92.6}],
  'Joey Wentz': [{type:'FF',name:'Four-seam Fastball',pct:43.9,vel:93.5},{type:'SL',name:'Slider',pct:24.6,vel:84.9},{type:'CU',name:'Curveball',pct:17.9,vel:79.3},{type:'FC',name:'Cutter',pct:10.1,vel:86.9},{type:'CH',name:'Changeup',pct:3.4,vel:86.1}],
  'Johan Oviedo': [{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:95.5},{type:'SL',name:'Slider',pct:32.2,vel:86.7},{type:'CU',name:'Curveball',pct:15.8,vel:77.7},{type:'SI',name:'Sinker',pct:9.2,vel:95.1},{type:'CH',name:'Changeup',pct:5.9,vel:88.6}],
  'John Brebbia': [{type:'FF',name:'Four-seam Fastball',pct:49.5,vel:92.5},{type:'SL',name:'Slider',pct:41.7,vel:83.9},{type:'CH',name:'Changeup',pct:8.0,vel:86.3}],
  'John Curtiss': [{type:'FF',name:'Four-seam Fastball',pct:52.3,vel:94.3},{type:'FC',name:'Cutter',pct:28.5,vel:90.5},{type:'SL',name:'Slider',pct:13.2,vel:86.5},{type:'CH',name:'Changeup',pct:6.0,vel:87.7}],
  'John King': [{type:'SI',name:'Sinker',pct:59.5,vel:93.0},{type:'CH',name:'Changeup',pct:19.2,vel:85.7},{type:'SL',name:'Slider',pct:14.3,vel:84.3},{type:'CU',name:'Curveball',pct:5.4,vel:80.1},{type:'FF',name:'Four-seam Fastball',pct:1.4,vel:93.6}],
  'John McMillon': [{type:'FF',name:'Four-seam Fastball',pct:53.3,vel:96.4},{type:'SL',name:'Slider',pct:46.7,vel:85.7}],
  'John Murphy': [{type:'FF',name:'Four-seam Fastball',pct:66.7,vel:90.9},{type:'SL',name:'Slider',pct:28.6,vel:82.2},{type:'CU',name:'Curveball',pct:4.8,vel:81.0}],
  'John Rooney': [{type:'ST',name:'Sweeper',pct:60.9,vel:81.5},{type:'SI',name:'Sinker',pct:21.7,vel:90.8},{type:'FF',name:'Four-seam Fastball',pct:17.4,vel:91.2}],
  'John Schreiber': [{type:'FF',name:'Four-seam Fastball',pct:31.0,vel:93.7},{type:'ST',name:'Sweeper',pct:28.0,vel:82.3},{type:'SI',name:'Sinker',pct:20.4,vel:93.1},{type:'FC',name:'Cutter',pct:18.8,vel:89.3},{type:'CH',name:'Changeup',pct:1.9,vel:86.1}],
  'John Stankiewicz': [{type:'FC',name:'Cutter',pct:36.8,vel:87.9},{type:'CH',name:'Changeup',pct:21.1,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:21.1,vel:92.9},{type:'ST',name:'Sweeper',pct:15.8,vel:82.7},{type:'CU',name:'Curveball',pct:5.3,vel:80.0}],
  'Jon Berti': [{type:'FA',name:'Fastball',pct:51.0,vel:62.2},{type:'EP',name:'Eephus',pct:49.0,vel:49.6}],
  'Jon Gray': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:94.8},{type:'SL',name:'Slider',pct:42.4,vel:87.3},{type:'CH',name:'Changeup',pct:7.6,vel:88.3},{type:'CU',name:'Curveball',pct:2.9,vel:77.3}],
  'Jonah Bride': [{type:'FA',name:'Fastball',pct:77.2,vel:72.2},{type:'KN',name:'Knuckleball',pct:12.3,vel:61.8},{type:'CS',name:'Slow Curve',pct:10.5,vel:68.5}],
  'Jonah Tong': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:95.2},{type:'CH',name:'Changeup',pct:27.5,vel:85.8},{type:'CU',name:'Curveball',pct:12.4,vel:77.5},{type:'SL',name:'Slider',pct:2.7,vel:87.1}],
  'Jonathan Bowlan': [{type:'FF',name:'Four-seam Fastball',pct:33.6,vel:95.5},{type:'SL',name:'Slider',pct:31.5,vel:85.8},{type:'SI',name:'Sinker',pct:16.9,vel:96.1},{type:'CU',name:'Curveball',pct:9.5,vel:81.0},{type:'CH',name:'Changeup',pct:8.6,vel:88.4}],
  'Jonathan Cannon': [{type:'FC',name:'Cutter',pct:23.1,vel:89.3},{type:'SI',name:'Sinker',pct:22.2,vel:93.1},{type:'CH',name:'Changeup',pct:21.3,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:17.7,vel:93.8},{type:'ST',name:'Sweeper',pct:15.5,vel:81.5}],
  'Jonathan Hernández': [{type:'SL',name:'Slider',pct:57.1,vel:88.7},{type:'SI',name:'Sinker',pct:34.7,vel:96.8},{type:'CH',name:'Changeup',pct:8.2,vel:90.7}],
  'Jonathan Loáisiga': [{type:'SI',name:'Sinker',pct:57.8,vel:96.8},{type:'CH',name:'Changeup',pct:18.8,vel:90.3},{type:'CU',name:'Curveball',pct:16.7,vel:86.0},{type:'FC',name:'Cutter',pct:3.6,vel:93.1},{type:'FF',name:'Four-seam Fastball',pct:3.0,vel:96.8}],
  'Jonathan Pintaro': [{type:'FC',name:'Cutter',pct:72.4,vel:91.7},{type:'FF',name:'Four-seam Fastball',pct:20.7,vel:96.7},{type:'CH',name:'Changeup',pct:6.9,vel:87.4}],
  'Jonathan Todd': [{type:'FF',name:'Four-seam Fastball',pct:56.2,vel:94.4},{type:'SL',name:'Slider',pct:31.2,vel:84.8},{type:'FC',name:'Cutter',pct:12.5,vel:85.9}],
  'Jordan Balazovic': [{type:'FF',name:'Four-seam Fastball',pct:46.7,vel:93.5},{type:'SL',name:'Slider',pct:23.3,vel:85.9},{type:'CH',name:'Changeup',pct:20.0,vel:89.0},{type:'CU',name:'Curveball',pct:10.0,vel:81.7}],
  'Jordan Hicks': [{type:'SI',name:'Sinker',pct:54.4,vel:97.5},{type:'ST',name:'Sweeper',pct:22.3,vel:82.6},{type:'FF',name:'Four-seam Fastball',pct:9.8,vel:97.4},{type:'SL',name:'Slider',pct:6.9,vel:84.3},{type:'FS',name:'Splitter',pct:6.6,vel:89.2}],
  'Jordan Leasure': [{type:'FF',name:'Four-seam Fastball',pct:53.2,vel:96.3},{type:'SL',name:'Slider',pct:42.6,vel:87.3},{type:'FS',name:'Splitter',pct:2.9,vel:87.2},{type:'SI',name:'Sinker',pct:1.2,vel:95.8}],
  'Jordan Mikel': [{type:'CH',name:'Changeup',pct:37.5,vel:85.1},{type:'SI',name:'Sinker',pct:37.5,vel:93.4},{type:'CU',name:'Curveball',pct:25.0,vel:77.4}],
  'Jordan Montgomery': [{type:'SI',name:'Sinker',pct:45.0,vel:90.2},{type:'CU',name:'Curveball',pct:32.5,vel:77.3},{type:'CH',name:'Changeup',pct:12.5,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:90.6}],
  'Jordan Romano': [{type:'SL',name:'Slider',pct:62.7,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:37.3,vel:95.5}],
  'Jordan Weems': [{type:'FF',name:'Four-seam Fastball',pct:58.2,vel:95.7},{type:'SL',name:'Slider',pct:28.6,vel:88.5},{type:'FS',name:'Splitter',pct:11.2,vel:87.5},{type:'CU',name:'Curveball',pct:2.0,vel:79.5}],
  'Jordan Wicks': [{type:'FF',name:'Four-seam Fastball',pct:39.6,vel:94.4},{type:'CH',name:'Changeup',pct:24.4,vel:83.0},{type:'SL',name:'Slider',pct:12.9,vel:86.8},{type:'ST',name:'Sweeper',pct:12.0,vel:82.5},{type:'SI',name:'Sinker',pct:10.1,vel:93.4}],
  'Jordany Ventura': [{type:'CU',name:'Curveball',pct:35.7,vel:80.8},{type:'SI',name:'Sinker',pct:28.6,vel:93.2},{type:'FF',name:'Four-seam Fastball',pct:21.4,vel:94.1},{type:'SL',name:'Slider',pct:14.3,vel:81.5}],
  'Jorge Alcala': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:97.4},{type:'CU',name:'Curveball',pct:22.8,vel:85.4},{type:'SL',name:'Slider',pct:16.3,vel:89.9},{type:'SI',name:'Sinker',pct:13.4,vel:96.8},{type:'CH',name:'Changeup',pct:2.1,vel:90.4}],
  'Jorge López': [{type:'SI',name:'Sinker',pct:27.6,vel:94.7},{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:94.7},{type:'SL',name:'Slider',pct:20.7,vel:85.8},{type:'KC',name:'Knuckle Curve',pct:16.8,vel:81.3},{type:'CH',name:'Changeup',pct:9.6,vel:87.0}],
  'Jorge Mateo': [{type:'FA',name:'Fastball',pct:62.9,vel:68.4},{type:'EP',name:'Eephus',pct:37.1,vel:61.0}],
  'Jose A. Ferrer': [{type:'SI',name:'Sinker',pct:62.0,vel:97.7},{type:'CH',name:'Changeup',pct:21.8,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:8.8,vel:97.9},{type:'SL',name:'Slider',pct:7.4,vel:89.7}],
  'Jose Corniell': [{type:'FF',name:'Four-seam Fastball',pct:48.8,vel:96.4},{type:'FC',name:'Cutter',pct:29.3,vel:92.7},{type:'CH',name:'Changeup',pct:19.5,vel:87.9},{type:'ST',name:'Sweeper',pct:2.4,vel:84.4}],
  'Jose Cuas': [{type:'ST',name:'Sweeper',pct:41.2,vel:81.0},{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:90.7},{type:'SI',name:'Sinker',pct:23.5,vel:91.1},{type:'CH',name:'Changeup',pct:5.9,vel:85.6}],
  'Jose Espada': [{type:'FF',name:'Four-seam Fastball',pct:54.5,vel:93.9},{type:'FS',name:'Splitter',pct:22.7,vel:89.8},{type:'SL',name:'Slider',pct:22.7,vel:83.1}],
  'Jose Herrera': [{type:'EP',name:'Eephus',pct:92.6,vel:43.6},{type:'FA',name:'Fastball',pct:7.4,vel:44.7}],
  'Jose Quintana': [{type:'SI',name:'Sinker',pct:43.8,vel:90.5},{type:'CH',name:'Changeup',pct:22.2,vel:85.6},{type:'CU',name:'Curveball',pct:13.7,vel:78.2},{type:'FF',name:'Four-seam Fastball',pct:11.7,vel:90.4},{type:'SV',name:'Slurve',pct:8.6,vel:78.5}],
  'Jose Trevino': [{type:'FA',name:'Fastball',pct:44.7,vel:57.3},{type:'EP',name:'Eephus',pct:29.8,vel:34.1},{type:'KN',name:'Knuckleball',pct:25.5,vel:56.5}],
  'Joseph Yabbour': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:94.6},{type:'SL',name:'Slider',pct:38.5,vel:84.4},{type:'FC',name:'Cutter',pct:3.8,vel:87.2}],
  'Josh Ekness': [{type:'ST',name:'Sweeper',pct:43.5,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:39.1,vel:97.6},{type:'SI',name:'Sinker',pct:13.0,vel:97.7},{type:'SL',name:'Slider',pct:4.3,vel:85.4}],
  'Josh Fleming': [{type:'FC',name:'Cutter',pct:46.7,vel:86.6},{type:'SI',name:'Sinker',pct:33.3,vel:88.8},{type:'CH',name:'Changeup',pct:20.0,vel:82.6}],
  'Josh Hader': [{type:'SI',name:'Sinker',pct:54.6,vel:95.4},{type:'SL',name:'Slider',pct:40.9,vel:83.3},{type:'CH',name:'Changeup',pct:4.6,vel:88.5}],
  'Josh Harlow': [{type:'FF',name:'Four-seam Fastball',pct:35.3,vel:90.8},{type:'FC',name:'Cutter',pct:23.5,vel:90.4},{type:'CU',name:'Curveball',pct:17.6,vel:77.2},{type:'SL',name:'Slider',pct:17.6,vel:78.9},{type:'CH',name:'Changeup',pct:5.9,vel:84.9}],
  'Josh Hejka': [{type:'SL',name:'Slider',pct:100.0,vel:74.8}],
  'Josh Simpson': [{type:'ST',name:'Sweeper',pct:25.6,vel:82.3},{type:'CU',name:'Curveball',pct:25.2,vel:80.5},{type:'SI',name:'Sinker',pct:22.4,vel:93.9},{type:'FF',name:'Four-seam Fastball',pct:10.9,vel:94.3},{type:'CH',name:'Changeup',pct:10.8,vel:89.2},{type:'SL',name:'Slider',pct:5.1,vel:88.0}],
  'Josh Walker': [{type:'CU',name:'Curveball',pct:52.0,vel:83.7},{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:93.2},{type:'SI',name:'Sinker',pct:6.9,vel:92.1}],
  'Josh White': [{type:'CU',name:'Curveball',pct:50.0,vel:80.0},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:91.9},{type:'CH',name:'Changeup',pct:16.7,vel:81.6}],
  'Josh Winckowski': [{type:'FF',name:'Four-seam Fastball',pct:29.5,vel:94.7},{type:'FC',name:'Cutter',pct:26.6,vel:89.4},{type:'CH',name:'Changeup',pct:17.4,vel:91.9},{type:'SI',name:'Sinker',pct:17.4,vel:94.9},{type:'SL',name:'Slider',pct:9.2,vel:85.3}],
  'Joshua Cornielly': [{type:'FC',name:'Cutter',pct:42.1,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:94.2},{type:'CH',name:'Changeup',pct:15.8,vel:85.5},{type:'CU',name:'Curveball',pct:5.3,vel:86.3}],
  'José Alvarado': [{type:'SI',name:'Sinker',pct:63.3,vel:99.2},{type:'FC',name:'Cutter',pct:29.1,vel:93.3},{type:'CU',name:'Curveball',pct:5.2,vel:85.1},{type:'FF',name:'Four-seam Fastball',pct:2.3,vel:99.6}],
  'José Berríos': [{type:'SI',name:'Sinker',pct:33.2,vel:92.2},{type:'SV',name:'Slurve',pct:25.7,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:93.0},{type:'CH',name:'Changeup',pct:16.7,vel:85.2},{type:'FC',name:'Cutter',pct:6.4,vel:89.5}],
  'José Buttó': [{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:95.2},{type:'SL',name:'Slider',pct:29.9,vel:86.5},{type:'SI',name:'Sinker',pct:17.0,vel:94.7},{type:'CH',name:'Changeup',pct:15.1,vel:88.3},{type:'ST',name:'Sweeper',pct:7.0,vel:83.6}],
  'José Caballero': [{type:'FA',name:'Fastball',pct:64.3,vel:80.4},{type:'EP',name:'Eephus',pct:32.1,vel:58.7},{type:'CH',name:'Changeup',pct:3.6,vel:64.9}],
  'José Castillo': [{type:'SL',name:'Slider',pct:43.6,vel:84.2},{type:'SI',name:'Sinker',pct:38.9,vel:93.0},{type:'FF',name:'Four-seam Fastball',pct:14.9,vel:93.3},{type:'CH',name:'Changeup',pct:2.6,vel:87.0}],
  'José De León': [{type:'FF',name:'Four-seam Fastball',pct:47.5,vel:90.6},{type:'SV',name:'Slurve',pct:23.8,vel:74.6},{type:'SL',name:'Slider',pct:15.8,vel:82.4},{type:'CH',name:'Changeup',pct:12.9,vel:83.5}],
  'José Fermin': [{type:'SL',name:'Slider',pct:48.8,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:96.8},{type:'SI',name:'Sinker',pct:4.6,vel:96.2}],
  'José Leclerc': [{type:'FF',name:'Four-seam Fastball',pct:32.6,vel:94.1},{type:'SL',name:'Slider',pct:20.1,vel:80.5},{type:'CH',name:'Changeup',pct:19.3,vel:86.4},{type:'FC',name:'Cutter',pct:15.9,vel:88.9},{type:'SI',name:'Sinker',pct:9.5,vel:93.7},{type:'CU',name:'Curveball',pct:2.7,vel:78.4}],
  'José Quijada': [{type:'FF',name:'Four-seam Fastball',pct:77.3,vel:94.1},{type:'SI',name:'Sinker',pct:10.3,vel:90.8},{type:'SL',name:'Slider',pct:8.2,vel:82.8},{type:'CH',name:'Changeup',pct:4.1,vel:89.1}],
  'José Rodríguez': [{type:'SL',name:'Slider',pct:50.0,vel:86.3},{type:'SI',name:'Sinker',pct:29.2,vel:96.2},{type:'CH',name:'Changeup',pct:12.5,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:8.3,vel:96.2}],
  'José Ruiz': [{type:'FF',name:'Four-seam Fastball',pct:37.1,vel:95.6},{type:'CU',name:'Curveball',pct:30.2,vel:85.4},{type:'SI',name:'Sinker',pct:16.5,vel:95.1},{type:'CH',name:'Changeup',pct:15.6,vel:88.9}],
  'José Soriano': [{type:'SI',name:'Sinker',pct:49.7,vel:97.1},{type:'KC',name:'Knuckle Curve',pct:26.1,vel:85.2},{type:'FS',name:'Splitter',pct:9.0,vel:92.3},{type:'FF',name:'Four-seam Fastball',pct:8.6,vel:97.8},{type:'SL',name:'Slider',pct:6.2,vel:89.0}],
  'José Suarez': [{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:93.3},{type:'CH',name:'Changeup',pct:28.7,vel:83.2},{type:'SL',name:'Slider',pct:21.4,vel:82.2},{type:'SI',name:'Sinker',pct:7.0,vel:92.9},{type:'ST',name:'Sweeper',pct:1.4,vel:75.9}],
  'José Ureña': [{type:'SI',name:'Sinker',pct:36.2,vel:96.1},{type:'SL',name:'Slider',pct:25.4,vel:87.5},{type:'CH',name:'Changeup',pct:24.8,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:10.3,vel:96.3},{type:'FS',name:'Splitter',pct:3.3,vel:85.0}],
  'José Urquidy': [{type:'FF',name:'Four-seam Fastball',pct:32.1,vel:93.0},{type:'CH',name:'Changeup',pct:28.6,vel:84.9},{type:'CU',name:'Curveball',pct:26.8,vel:79.8},{type:'FC',name:'Cutter',pct:12.5,vel:88.0}],
  'Jovani Morán': [{type:'CH',name:'Changeup',pct:38.8,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:36.2,vel:92.3},{type:'FC',name:'Cutter',pct:17.5,vel:85.0},{type:'ST',name:'Sweeper',pct:6.2,vel:80.4},{type:'CU',name:'Curveball',pct:1.2,vel:80.7}],
  'Juan Burgos': [{type:'FC',name:'Cutter',pct:34.7,vel:91.8},{type:'SI',name:'Sinker',pct:31.8,vel:95.8},{type:'ST',name:'Sweeper',pct:29.3,vel:85.2},{type:'CH',name:'Changeup',pct:2.1,vel:92.5},{type:'CU',name:'Curveball',pct:2.1,vel:82.7}],
  'Juan Mejia': [{type:'FF',name:'Four-seam Fastball',pct:67.1,vel:96.6},{type:'ST',name:'Sweeper',pct:32.8,vel:83.2}],
  'Juan Morillo': [{type:'FF',name:'Four-seam Fastball',pct:47.0,vel:99.0},{type:'SL',name:'Slider',pct:22.0,vel:89.4},{type:'SI',name:'Sinker',pct:18.8,vel:98.9},{type:'CH',name:'Changeup',pct:12.1,vel:91.9}],
  'Juan Nuñez': [{type:'FF',name:'Four-seam Fastball',pct:44.4,vel:92.9},{type:'SL',name:'Slider',pct:28.6,vel:85.2},{type:'CH',name:'Changeup',pct:14.3,vel:89.2},{type:'ST',name:'Sweeper',pct:12.7,vel:81.0}],
  'Julian Fernández': [{type:'FF',name:'Four-seam Fastball',pct:68.4,vel:97.4},{type:'CH',name:'Changeup',pct:31.6,vel:86.2}],
  'Julian Merryweather': [{type:'SL',name:'Slider',pct:49.6,vel:84.7},{type:'FF',name:'Four-seam Fastball',pct:47.9,vel:96.0},{type:'ST',name:'Sweeper',pct:1.4,vel:83.1},{type:'CH',name:'Changeup',pct:1.1,vel:80.0}],
  'Justin Anderson': [{type:'SL',name:'Slider',pct:61.5,vel:84.0},{type:'SI',name:'Sinker',pct:25.6,vel:92.8},{type:'FC',name:'Cutter',pct:7.7,vel:91.5},{type:'FF',name:'Four-seam Fastball',pct:5.1,vel:94.2}],
  'Justin Bruihl': [{type:'SI',name:'Sinker',pct:51.1,vel:90.2},{type:'ST',name:'Sweeper',pct:41.6,vel:78.4},{type:'FC',name:'Cutter',pct:7.3,vel:87.5}],
  'Justin Garza': [{type:'FC',name:'Cutter',pct:50.0,vel:89.6},{type:'FF',name:'Four-seam Fastball',pct:37.2,vel:96.1},{type:'CU',name:'Curveball',pct:9.3,vel:81.8},{type:'FS',name:'Splitter',pct:3.5,vel:83.9}],
  'Justin Hagenman': [{type:'FC',name:'Cutter',pct:30.9,vel:86.4},{type:'SI',name:'Sinker',pct:26.6,vel:92.5},{type:'CH',name:'Changeup',pct:22.3,vel:86.5},{type:'SL',name:'Slider',pct:20.3,vel:83.6}],
  'Justin Lawrence': [{type:'ST',name:'Sweeper',pct:48.3,vel:83.0},{type:'SI',name:'Sinker',pct:43.2,vel:95.2},{type:'FF',name:'Four-seam Fastball',pct:8.5,vel:95.0}],
  'Justin Martinez': [{type:'FS',name:'Splitter',pct:33.1,vel:88.4},{type:'SI',name:'Sinker',pct:32.5,vel:99.5},{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:100.2},{type:'SL',name:'Slider',pct:9.2,vel:91.5}],
  'Justin Slaten': [{type:'FF',name:'Four-seam Fastball',pct:36.1,vel:96.7},{type:'FC',name:'Cutter',pct:33.6,vel:92.6},{type:'CU',name:'Curveball',pct:18.5,vel:84.9},{type:'ST',name:'Sweeper',pct:11.7,vel:85.2}],
  'Justin Steele': [{type:'FF',name:'Four-seam Fastball',pct:56.5,vel:90.8},{type:'SL',name:'Slider',pct:31.0,vel:81.5},{type:'SI',name:'Sinker',pct:6.1,vel:90.4},{type:'CU',name:'Curveball',pct:3.8,vel:79.4},{type:'CH',name:'Changeup',pct:2.6,vel:84.9}],
  'Justin Sterner': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:93.5},{type:'FC',name:'Cutter',pct:31.8,vel:87.4},{type:'ST',name:'Sweeper',pct:15.9,vel:81.6}],
  'Justin Topa': [{type:'SI',name:'Sinker',pct:36.3,vel:94.1},{type:'ST',name:'Sweeper',pct:29.7,vel:82.8},{type:'FC',name:'Cutter',pct:19.5,vel:91.1},{type:'CH',name:'Changeup',pct:14.4,vel:87.1}],
  'Justin Verlander': [{type:'FF',name:'Four-seam Fastball',pct:45.4,vel:93.9},{type:'SL',name:'Slider',pct:23.2,vel:87.1},{type:'CU',name:'Curveball',pct:14.3,vel:78.5},{type:'CH',name:'Changeup',pct:8.5,vel:84.7},{type:'ST',name:'Sweeper',pct:8.2,vel:80.5}],
  'Justin Wilson': [{type:'FF',name:'Four-seam Fastball',pct:46.4,vel:94.5},{type:'SL',name:'Slider',pct:33.5,vel:88.0},{type:'FC',name:'Cutter',pct:15.1,vel:91.5},{type:'FS',name:'Splitter',pct:5.0,vel:85.2}],
  'Justin Wrobleski': [{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:96.0},{type:'SL',name:'Slider',pct:24.8,vel:87.8},{type:'SI',name:'Sinker',pct:20.6,vel:95.0},{type:'FC',name:'Cutter',pct:14.1,vel:92.1},{type:'CU',name:'Curveball',pct:8.6,vel:81.4},{type:'CH',name:'Changeup',pct:3.3,vel:88.1}],
  'Justin Yeager': [{type:'FF',name:'Four-seam Fastball',pct:62.5,vel:94.2},{type:'SL',name:'Slider',pct:25.0,vel:85.8},{type:'FC',name:'Cutter',pct:12.5,vel:87.3}],
  'Kade Strowd': [{type:'FC',name:'Cutter',pct:41.1,vel:91.7},{type:'FF',name:'Four-seam Fastball',pct:18.2,vel:95.8},{type:'SI',name:'Sinker',pct:15.3,vel:96.3},{type:'ST',name:'Sweeper',pct:13.1,vel:84.6},{type:'CU',name:'Curveball',pct:12.3,vel:83.0}],
  'Kai Wynyard': [{type:'SL',name:'Slider',pct:60.0,vel:84.2},{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:92.3}],
  'Kai-Wei Teng': [{type:'ST',name:'Sweeper',pct:38.6,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:24.9,vel:93.2},{type:'CU',name:'Curveball',pct:14.0,vel:83.0},{type:'SI',name:'Sinker',pct:12.3,vel:92.9},{type:'CH',name:'Changeup',pct:10.2,vel:87.7}],
  'Kaleb Bowman': [{type:'SI',name:'Sinker',pct:45.5,vel:93.2},{type:'CU',name:'Curveball',pct:27.3,vel:78.5},{type:'SL',name:'Slider',pct:18.2,vel:84.5},{type:'FC',name:'Cutter',pct:9.1,vel:88.1}],
  'Kaleb Ort': [{type:'FF',name:'Four-seam Fastball',pct:54.3,vel:96.4},{type:'ST',name:'Sweeper',pct:23.2,vel:83.9},{type:'FC',name:'Cutter',pct:14.2,vel:90.6},{type:'CH',name:'Changeup',pct:8.2,vel:89.6}],
  'Keaton Winn': [{type:'FS',name:'Splitter',pct:44.1,vel:89.2},{type:'FF',name:'Four-seam Fastball',pct:26.3,vel:95.8},{type:'SI',name:'Sinker',pct:24.9,vel:95.1},{type:'SL',name:'Slider',pct:4.7,vel:87.4}],
  'Keegan Akin': [{type:'FF',name:'Four-seam Fastball',pct:51.4,vel:93.7},{type:'SL',name:'Slider',pct:28.7,vel:85.6},{type:'CH',name:'Changeup',pct:19.9,vel:86.6}],
  'Keider Montero': [{type:'FF',name:'Four-seam Fastball',pct:31.3,vel:94.0},{type:'SL',name:'Slider',pct:21.7,vel:84.1},{type:'SI',name:'Sinker',pct:19.3,vel:93.7},{type:'KC',name:'Knuckle Curve',pct:14.5,vel:79.0},{type:'CH',name:'Changeup',pct:13.1,vel:86.9}],
  'Kendall Graveman': [{type:'SI',name:'Sinker',pct:39.5,vel:94.6},{type:'SL',name:'Slider',pct:21.9,vel:85.2},{type:'CH',name:'Changeup',pct:20.4,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:16.0,vel:94.2},{type:'CU',name:'Curveball',pct:2.2,vel:81.1}],
  'Kenley Jansen': [{type:'FC',name:'Cutter',pct:81.4,vel:92.7},{type:'SI',name:'Sinker',pct:9.2,vel:93.1},{type:'SL',name:'Slider',pct:6.0,vel:83.7},{type:'ST',name:'Sweeper',pct:3.4,vel:81.9}],
  'Kenta Maeda': [{type:'FS',name:'Splitter',pct:34.7,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:19.6,vel:90.4},{type:'ST',name:'Sweeper',pct:19.6,vel:80.0},{type:'SL',name:'Slider',pct:16.1,vel:81.4},{type:'SI',name:'Sinker',pct:8.0,vel:90.1},{type:'SV',name:'Slurve',pct:1.0,vel:81.6}],
  'Kervin Castro': [{type:'FC',name:'Cutter',pct:43.2,vel:91.0},{type:'FF',name:'Four-seam Fastball',pct:32.4,vel:94.0},{type:'ST',name:'Sweeper',pct:18.9,vel:86.9},{type:'CU',name:'Curveball',pct:2.7,vel:79.7},{type:'SI',name:'Sinker',pct:2.7,vel:90.6}],
  'Kevin Gausman': [{type:'FF',name:'Four-seam Fastball',pct:53.7,vel:94.4},{type:'FS',name:'Splitter',pct:37.3,vel:84.8},{type:'SL',name:'Slider',pct:8.9,vel:83.2}],
  'Kevin Ginkel': [{type:'FF',name:'Four-seam Fastball',pct:50.1,vel:94.9},{type:'SL',name:'Slider',pct:43.1,vel:84.9},{type:'SI',name:'Sinker',pct:6.8,vel:94.1}],
  'Kevin Gowdy': [{type:'SL',name:'Slider',pct:43.3,vel:85.4},{type:'FC',name:'Cutter',pct:26.9,vel:88.9},{type:'SI',name:'Sinker',pct:25.4,vel:94.3},{type:'FF',name:'Four-seam Fastball',pct:4.5,vel:94.6}],
  'Kevin Herget': [{type:'FF',name:'Four-seam Fastball',pct:44.0,vel:92.1},{type:'CH',name:'Changeup',pct:36.6,vel:81.4},{type:'FC',name:'Cutter',pct:18.5,vel:86.8}],
  'Kevin Kelly': [{type:'SI',name:'Sinker',pct:58.8,vel:91.0},{type:'ST',name:'Sweeper',pct:19.9,vel:78.6},{type:'FC',name:'Cutter',pct:12.6,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:8.6,vel:92.2}],
  'Kevin Kopps': [{type:'FC',name:'Cutter',pct:58.8,vel:85.1},{type:'CU',name:'Curveball',pct:26.5,vel:84.7},{type:'SI',name:'Sinker',pct:14.7,vel:90.9}],
  'Kevin Newman': [{type:'EP',name:'Eephus',pct:79.4,vel:54.2},{type:'KN',name:'Knuckleball',pct:14.7,vel:56.1},{type:'FA',name:'Fastball',pct:5.9,vel:74.1}],
  'Kirby Yates': [{type:'FF',name:'Four-seam Fastball',pct:57.8,vel:92.8},{type:'FS',name:'Splitter',pct:42.2,vel:85.9}],
  'Kodai Senga': [{type:'FF',name:'Four-seam Fastball',pct:31.4,vel:94.7},{type:'FO',name:'Forkball',pct:28.5,vel:82.5},{type:'FC',name:'Cutter',pct:20.5,vel:89.6},{type:'ST',name:'Sweeper',pct:7.8,vel:80.0},{type:'SI',name:'Sinker',pct:6.0,vel:88.6},{type:'SL',name:'Slider',pct:4.1,vel:83.7},{type:'CU',name:'Curveball',pct:1.7,vel:68.5}],
  'Kody Clemens': [{type:'EP',name:'Eephus',pct:90.0,vel:59.8},{type:'FA',name:'Fastball',pct:10.0,vel:85.6}],
  'Kody Funderburk': [{type:'SI',name:'Sinker',pct:32.7,vel:93.3},{type:'FC',name:'Cutter',pct:24.7,vel:92.0},{type:'ST',name:'Sweeper',pct:19.9,vel:82.1},{type:'CH',name:'Changeup',pct:12.0,vel:89.0},{type:'SL',name:'Slider',pct:10.8,vel:86.3}],
  'Kolby Allard': [{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:90.1},{type:'CH',name:'Changeup',pct:20.4,vel:81.5},{type:'FC',name:'Cutter',pct:19.5,vel:84.9},{type:'CU',name:'Curveball',pct:12.8,vel:72.1},{type:'SI',name:'Sinker',pct:8.5,vel:90.6}],
  'Konnor Pilkington': [{type:'FF',name:'Four-seam Fastball',pct:58.6,vel:94.4},{type:'CH',name:'Changeup',pct:21.6,vel:85.5},{type:'SL',name:'Slider',pct:19.8,vel:85.3}],
  'Korey Lee': [{type:'FA',name:'Fastball',pct:81.8,vel:77.6},{type:'EP',name:'Eephus',pct:13.6,vel:49.6},{type:'FF',name:'Four-seam Fastball',pct:4.5,vel:90.4}],
  'Kris Bubic': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:92.2},{type:'CH',name:'Changeup',pct:21.3,vel:85.5},{type:'ST',name:'Sweeper',pct:20.3,vel:83.0},{type:'SL',name:'Slider',pct:13.8,vel:85.5},{type:'SI',name:'Sinker',pct:6.6,vel:91.6}],
  'Kumar Rocker': [{type:'SI',name:'Sinker',pct:25.7,vel:95.7},{type:'FC',name:'Cutter',pct:22.9,vel:90.1},{type:'FF',name:'Four-seam Fastball',pct:21.2,vel:96.0},{type:'SL',name:'Slider',pct:14.7,vel:84.2},{type:'CU',name:'Curveball',pct:9.7,vel:77.8},{type:'CH',name:'Changeup',pct:5.9,vel:89.5}],
  'Kyle Amendt': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:92.7},{type:'SL',name:'Slider',pct:43.5,vel:88.1},{type:'CU',name:'Curveball',pct:4.3,vel:79.4}],
  'Kyle Backhus': [{type:'SI',name:'Sinker',pct:62.9,vel:91.0},{type:'ST',name:'Sweeper',pct:27.6,vel:78.3},{type:'CH',name:'Changeup',pct:9.5,vel:78.5}],
  'Kyle Bradish': [{type:'SI',name:'Sinker',pct:32.6,vel:94.8},{type:'SL',name:'Slider',pct:32.0,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:22.7,vel:94.4},{type:'CU',name:'Curveball',pct:12.8,vel:84.0}],
  'Kyle Farmer': [{type:'EP',name:'Eephus',pct:100.0,vel:42.5}],
  'Kyle Finnegan': [{type:'FF',name:'Four-seam Fastball',pct:58.3,vel:96.3},{type:'FS',name:'Splitter',pct:37.2,vel:87.4},{type:'SL',name:'Slider',pct:4.5,vel:84.3}],
  'Kyle Freeland': [{type:'FF',name:'Four-seam Fastball',pct:33.1,vel:91.6},{type:'KC',name:'Knuckle Curve',pct:25.3,vel:82.6},{type:'FC',name:'Cutter',pct:15.8,vel:87.3},{type:'ST',name:'Sweeper',pct:12.8,vel:83.6},{type:'SI',name:'Sinker',pct:6.7,vel:91.4},{type:'CH',name:'Changeup',pct:6.3,vel:86.3}],
  'Kyle Gibson': [{type:'SI',name:'Sinker',pct:35.7,vel:90.9},{type:'ST',name:'Sweeper',pct:18.9,vel:81.2},{type:'CH',name:'Changeup',pct:12.9,vel:85.4},{type:'CU',name:'Curveball',pct:11.1,vel:78.8},{type:'FC',name:'Cutter',pct:10.4,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:9.3,vel:91.5},{type:'SL',name:'Slider',pct:1.8,vel:83.3}],
  'Kyle Harrison': [{type:'FF',name:'Four-seam Fastball',pct:58.7,vel:94.6},{type:'SV',name:'Slurve',pct:27.4,vel:82.2},{type:'CH',name:'Changeup',pct:8.0,vel:86.3},{type:'FC',name:'Cutter',pct:3.7,vel:86.8},{type:'SI',name:'Sinker',pct:2.0,vel:93.0}],
  'Kyle Hart': [{type:'ST',name:'Sweeper',pct:31.9,vel:81.2},{type:'SI',name:'Sinker',pct:21.6,vel:91.3},{type:'FF',name:'Four-seam Fastball',pct:16.2,vel:91.3},{type:'CH',name:'Changeup',pct:14.5,vel:83.2},{type:'SL',name:'Slider',pct:11.7,vel:87.0},{type:'FS',name:'Splitter',pct:4.0,vel:85.1}],
  'Kyle Hendricks': [{type:'CH',name:'Changeup',pct:38.4,vel:79.5},{type:'SI',name:'Sinker',pct:38.4,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:15.0,vel:86.5},{type:'CU',name:'Curveball',pct:8.2,vel:72.2}],
  'Kyle Leahy': [{type:'FF',name:'Four-seam Fastball',pct:30.3,vel:95.4},{type:'SL',name:'Slider',pct:21.1,vel:91.1},{type:'CU',name:'Curveball',pct:17.8,vel:83.6},{type:'ST',name:'Sweeper',pct:13.7,vel:86.7},{type:'CH',name:'Changeup',pct:9.5,vel:90.3},{type:'SI',name:'Sinker',pct:7.7,vel:95.3}],
  'Kyle Nelson': [{type:'SL',name:'Slider',pct:58.1,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:22.1,vel:89.9},{type:'FC',name:'Cutter',pct:19.8,vel:86.8}],
  'Kyle Nicolas': [{type:'FF',name:'Four-seam Fastball',pct:51.1,vel:97.6},{type:'SL',name:'Slider',pct:26.8,vel:90.4},{type:'CU',name:'Curveball',pct:21.7,vel:83.8}],
  'Kyle Scott': [{type:'FF',name:'Four-seam Fastball',pct:75.0,vel:92.9},{type:'CU',name:'Curveball',pct:25.0,vel:75.7}],
  'Lael Lockhart': [{type:'FF',name:'Four-seam Fastball',pct:44.2,vel:90.2},{type:'SL',name:'Slider',pct:32.6,vel:85.8},{type:'FS',name:'Splitter',pct:14.0,vel:82.2},{type:'CU',name:'Curveball',pct:9.3,vel:77.4}],
  'Lake Bachar': [{type:'FF',name:'Four-seam Fastball',pct:36.5,vel:94.8},{type:'ST',name:'Sweeper',pct:27.7,vel:86.4},{type:'SL',name:'Slider',pct:23.0,vel:89.2},{type:'FS',name:'Splitter',pct:12.8,vel:83.8}],
  'Lance McCullers Jr.': [{type:'ST',name:'Sweeper',pct:32.0,vel:82.8},{type:'SI',name:'Sinker',pct:24.7,vel:91.5},{type:'CH',name:'Changeup',pct:17.0,vel:86.7},{type:'KC',name:'Knuckle Curve',pct:16.4,vel:82.3},{type:'FF',name:'Four-seam Fastball',pct:5.4,vel:91.8},{type:'FC',name:'Cutter',pct:4.5,vel:89.3}],
  'Landen Roupp': [{type:'SI',name:'Sinker',pct:39.9,vel:92.8},{type:'CU',name:'Curveball',pct:35.7,vel:76.7},{type:'CH',name:'Changeup',pct:17.0,vel:86.6},{type:'FC',name:'Cutter',pct:6.7,vel:90.3}],
  'Landon Knack': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:93.1},{type:'CH',name:'Changeup',pct:26.1,vel:84.6},{type:'KC',name:'Knuckle Curve',pct:13.5,vel:80.2},{type:'SL',name:'Slider',pct:11.9,vel:85.3}],
  'Landon Sims': [{type:'FF',name:'Four-seam Fastball',pct:63.6,vel:92.1},{type:'ST',name:'Sweeper',pct:36.4,vel:80.7}],
  'Landon Tomkins': [{type:'SL',name:'Slider',pct:61.5,vel:84.9},{type:'SI',name:'Sinker',pct:38.5,vel:93.4}],
  'Lazaro Estrada': [{type:'FF',name:'Four-seam Fastball',pct:48.7,vel:93.6},{type:'SL',name:'Slider',pct:33.3,vel:85.7},{type:'CU',name:'Curveball',pct:11.3,vel:75.3},{type:'FS',name:'Splitter',pct:6.7,vel:84.1}],
  'Leo Rivas': [{type:'EP',name:'Eephus',pct:100.0,vel:42.1}],
  'Leonardo Pestana': [{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:94.4},{type:'SL',name:'Slider',pct:28.6,vel:84.6},{type:'FC',name:'Cutter',pct:25.7,vel:86.3},{type:'CU',name:'Curveball',pct:5.7,vel:81.7}],
  'Liam Hendriks': [{type:'FF',name:'Four-seam Fastball',pct:55.2,vel:94.9},{type:'SL',name:'Slider',pct:32.6,vel:86.3},{type:'CU',name:'Curveball',pct:11.7,vel:82.1}],
  'Logan Allen': [{type:'FF',name:'Four-seam Fastball',pct:33.2,vel:91.2},{type:'ST',name:'Sweeper',pct:23.5,vel:78.1},{type:'CH',name:'Changeup',pct:18.3,vel:82.4},{type:'SI',name:'Sinker',pct:13.5,vel:89.0},{type:'FC',name:'Cutter',pct:11.3,vel:85.7}],
  'Logan Boyer': [{type:'FC',name:'Cutter',pct:80.0,vel:90.7},{type:'FF',name:'Four-seam Fastball',pct:13.3,vel:97.6},{type:'SL',name:'Slider',pct:6.7,vel:86.2}],
  'Logan Davidson': [{type:'EP',name:'Eephus',pct:100.0,vel:65.1}],
  'Logan Evans': [{type:'FC',name:'Cutter',pct:25.9,vel:87.8},{type:'ST',name:'Sweeper',pct:23.8,vel:84.2},{type:'SI',name:'Sinker',pct:17.6,vel:93.0},{type:'CH',name:'Changeup',pct:12.0,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:10.6,vel:92.8},{type:'CU',name:'Curveball',pct:10.1,vel:81.7}],
  'Logan Gilbert': [{type:'FF',name:'Four-seam Fastball',pct:36.6,vel:95.4},{type:'SL',name:'Slider',pct:35.1,vel:87.5},{type:'FS',name:'Splitter',pct:19.6,vel:81.8},{type:'CU',name:'Curveball',pct:7.7,vel:82.2},{type:'SI',name:'Sinker',pct:1.0,vel:94.8}],
  'Logan Gillaspie': [{type:'FF',name:'Four-seam Fastball',pct:30.6,vel:95.2},{type:'CH',name:'Changeup',pct:19.4,vel:88.3},{type:'SL',name:'Slider',pct:19.4,vel:86.3},{type:'FC',name:'Cutter',pct:11.8,vel:91.8},{type:'CU',name:'Curveball',pct:10.0,vel:82.9},{type:'SI',name:'Sinker',pct:7.1,vel:95.0},{type:'ST',name:'Sweeper',pct:1.8,vel:83.5}],
  'Logan Henderson': [{type:'FF',name:'Four-seam Fastball',pct:48.7,vel:92.9},{type:'CH',name:'Changeup',pct:38.0,vel:81.9},{type:'FC',name:'Cutter',pct:9.1,vel:87.9},{type:'SL',name:'Slider',pct:4.2,vel:83.4}],
  'Logan Porter': [{type:'SL',name:'Slider',pct:93.3,vel:36.5},{type:'CU',name:'Curveball',pct:6.7,vel:37.2}],
  'Logan VanWey': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:93.1},{type:'ST',name:'Sweeper',pct:24.3,vel:82.5},{type:'CH',name:'Changeup',pct:11.1,vel:86.3},{type:'SI',name:'Sinker',pct:10.2,vel:91.6},{type:'FC',name:'Cutter',pct:2.7,vel:84.4}],
  'Logan Webb': [{type:'SI',name:'Sinker',pct:33.6,vel:92.6},{type:'ST',name:'Sweeper',pct:26.6,vel:84.6},{type:'CH',name:'Changeup',pct:24.1,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:7.9,vel:92.8},{type:'FC',name:'Cutter',pct:7.8,vel:91.0}],
  'Lou Trivino': [{type:'FC',name:'Cutter',pct:24.7,vel:91.8},{type:'SI',name:'Sinker',pct:22.1,vel:95.2},{type:'ST',name:'Sweeper',pct:19.9,vel:80.5},{type:'CH',name:'Changeup',pct:16.5,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:15.7,vel:94.8},{type:'CU',name:'Curveball',pct:1.2,vel:78.7}],
  'Louis Varland': [{type:'FF',name:'Four-seam Fastball',pct:44.9,vel:98.1},{type:'KC',name:'Knuckle Curve',pct:36.6,vel:88.0},{type:'SL',name:'Slider',pct:7.7,vel:91.4},{type:'SI',name:'Sinker',pct:6.1,vel:97.0},{type:'CH',name:'Changeup',pct:4.8,vel:91.8}],
  'Luarbert Arias': [{type:'SL',name:'Slider',pct:46.4,vel:82.5},{type:'FF',name:'Four-seam Fastball',pct:28.5,vel:94.0},{type:'FS',name:'Splitter',pct:15.9,vel:83.1},{type:'SI',name:'Sinker',pct:9.2,vel:93.4}],
  'Lucas Braun': [{type:'SI',name:'Sinker',pct:43.6,vel:92.1},{type:'SL',name:'Slider',pct:20.0,vel:84.6},{type:'FC',name:'Cutter',pct:14.5,vel:87.4},{type:'CH',name:'Changeup',pct:12.7,vel:87.6},{type:'FF',name:'Four-seam Fastball',pct:7.3,vel:93.1},{type:'CU',name:'Curveball',pct:1.8,vel:78.7}],
  'Lucas Erceg': [{type:'FF',name:'Four-seam Fastball',pct:30.4,vel:97.5},{type:'SL',name:'Slider',pct:28.8,vel:85.0},{type:'SI',name:'Sinker',pct:23.7,vel:97.5},{type:'CH',name:'Changeup',pct:17.1,vel:90.0}],
  'Lucas Gilbreath': [{type:'SL',name:'Slider',pct:44.4,vel:79.1},{type:'FF',name:'Four-seam Fastball',pct:38.9,vel:89.1},{type:'FS',name:'Splitter',pct:16.7,vel:83.5}],
  'Lucas Giolito': [{type:'FF',name:'Four-seam Fastball',pct:48.4,vel:93.3},{type:'SL',name:'Slider',pct:25.6,vel:86.0},{type:'CH',name:'Changeup',pct:22.6,vel:81.7},{type:'CU',name:'Curveball',pct:3.5,vel:78.6}],
  'Lucas Sims': [{type:'FF',name:'Four-seam Fastball',pct:44.8,vel:94.8},{type:'ST',name:'Sweeper',pct:44.1,vel:84.8},{type:'CU',name:'Curveball',pct:4.3,vel:82.2},{type:'SI',name:'Sinker',pct:2.9,vel:95.4},{type:'SL',name:'Slider',pct:2.2,vel:87.1},{type:'FC',name:'Cutter',pct:1.4,vel:90.9}],
  'Lucas Wepf': [{type:'FF',name:'Four-seam Fastball',pct:100.0,vel:94.2}],
  'Luinder Avila': [{type:'CU',name:'Curveball',pct:32.7,vel:82.7},{type:'FF',name:'Four-seam Fastball',pct:29.0,vel:95.8},{type:'SI',name:'Sinker',pct:24.0,vel:95.8},{type:'SL',name:'Slider',pct:11.5,vel:85.1},{type:'CH',name:'Changeup',pct:2.8,vel:86.9}],
  'Luis Castillo': [{type:'FF',name:'Four-seam Fastball',pct:45.4,vel:94.9},{type:'SI',name:'Sinker',pct:22.0,vel:94.8},{type:'SL',name:'Slider',pct:21.0,vel:84.4},{type:'CH',name:'Changeup',pct:11.6,vel:87.1}],
  'Luis Contreras': [{type:'FF',name:'Four-seam Fastball',pct:50.5,vel:91.2},{type:'SL',name:'Slider',pct:20.8,vel:85.2},{type:'CH',name:'Changeup',pct:15.2,vel:83.6},{type:'ST',name:'Sweeper',pct:11.1,vel:79.0},{type:'SI',name:'Sinker',pct:1.7,vel:91.0}],
  'Luis Curvelo': [{type:'SL',name:'Slider',pct:40.4,vel:84.6},{type:'FF',name:'Four-seam Fastball',pct:30.9,vel:96.3},{type:'SI',name:'Sinker',pct:23.2,vel:95.5},{type:'CH',name:'Changeup',pct:5.5,vel:89.0}],
  'Luis F. Castillo': [{type:'FF',name:'Four-seam Fastball',pct:45.8,vel:92.2},{type:'ST',name:'Sweeper',pct:25.0,vel:80.7},{type:'SI',name:'Sinker',pct:16.1,vel:91.1},{type:'CH',name:'Changeup',pct:13.1,vel:86.3}],
  'Luis Frías': [{type:'FC',name:'Cutter',pct:50.0,vel:90.8},{type:'SI',name:'Sinker',pct:40.0,vel:94.4},{type:'SL',name:'Slider',pct:10.0,vel:83.1}],
  'Luis Garcia': [{type:'FF',name:'Four-seam Fastball',pct:49.1,vel:91.0},{type:'FC',name:'Cutter',pct:25.5,vel:82.0},{type:'CU',name:'Curveball',pct:12.3,vel:73.0},{type:'ST',name:'Sweeper',pct:8.5,vel:75.5},{type:'CH',name:'Changeup',pct:4.7,vel:82.5}],
  'Luis García': [{type:'SI',name:'Sinker',pct:42.5,vel:96.9},{type:'ST',name:'Sweeper',pct:33.5,vel:82.9},{type:'FS',name:'Splitter',pct:22.1,vel:88.6},{type:'FF',name:'Four-seam Fastball',pct:1.9,vel:96.8}],
  'Luis Gastelum': [{type:'CH',name:'Changeup',pct:38.1,vel:82.4},{type:'SI',name:'Sinker',pct:38.1,vel:93.5},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:93.5},{type:'SL',name:'Slider',pct:9.5,vel:84.6}],
  'Luis Gil': [{type:'FF',name:'Four-seam Fastball',pct:50.6,vel:95.3},{type:'SL',name:'Slider',pct:25.8,vel:86.7},{type:'CH',name:'Changeup',pct:23.6,vel:90.8}],
  'Luis Guerrero': [{type:'SL',name:'Slider',pct:42.9,vel:84.6},{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:96.5},{type:'ST',name:'Sweeper',pct:14.9,vel:82.0},{type:'CH',name:'Changeup',pct:4.8,vel:87.7}],
  'Luis Mey': [{type:'SI',name:'Sinker',pct:72.9,vel:98.9},{type:'SL',name:'Slider',pct:25.1,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:1.9,vel:98.7}],
  'Luis Morales': [{type:'FF',name:'Four-seam Fastball',pct:51.5,vel:97.2},{type:'ST',name:'Sweeper',pct:26.8,vel:82.3},{type:'CH',name:'Changeup',pct:13.0,vel:89.8},{type:'SL',name:'Slider',pct:7.8,vel:85.9}],
  'Luis Moreno': [{type:'SI',name:'Sinker',pct:30.3,vel:93.8},{type:'FF',name:'Four-seam Fastball',pct:24.2,vel:88.0},{type:'SL',name:'Slider',pct:18.2,vel:79.8},{type:'ST',name:'Sweeper',pct:18.2,vel:81.0},{type:'FC',name:'Cutter',pct:9.1,vel:85.3}],
  'Luis Ortiz': [{type:'FF',name:'Four-seam Fastball',pct:30.6,vel:96.3},{type:'SL',name:'Slider',pct:25.5,vel:85.4},{type:'SI',name:'Sinker',pct:18.9,vel:95.5},{type:'FC',name:'Cutter',pct:12.9,vel:90.9},{type:'CH',name:'Changeup',pct:12.2,vel:89.4}],
  'Luis Peralta': [{type:'FF',name:'Four-seam Fastball',pct:71.3,vel:94.6},{type:'CU',name:'Curveball',pct:25.9,vel:81.5},{type:'CH',name:'Changeup',pct:2.9,vel:87.1}],
  'Luis Severino': [{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:96.1},{type:'ST',name:'Sweeper',pct:24.8,vel:84.5},{type:'SI',name:'Sinker',pct:20.2,vel:95.6},{type:'FC',name:'Cutter',pct:17.6,vel:93.2},{type:'CH',name:'Changeup',pct:5.4,vel:86.2},{type:'SL',name:'Slider',pct:4.0,vel:87.0}],
  'Luis Torrens': [{type:'FA',name:'Fastball',pct:87.0,vel:64.6},{type:'EP',name:'Eephus',pct:8.7,vel:48.4},{type:'CH',name:'Changeup',pct:4.3,vel:59.0}],
  'Luis Vázquez': [{type:'EP',name:'Eephus',pct:96.9,vel:36.1},{type:'SL',name:'Slider',pct:3.1,vel:34.1}],
  'Luke Craig': [{type:'SI',name:'Sinker',pct:71.0,vel:92.3},{type:'SL',name:'Slider',pct:29.0,vel:80.9}],
  'Luke Jackson': [{type:'SL',name:'Slider',pct:49.1,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:94.2},{type:'CU',name:'Curveball',pct:16.3,vel:84.1}],
  'Luke Little': [{type:'FF',name:'Four-seam Fastball',pct:53.9,vel:93.3},{type:'ST',name:'Sweeper',pct:46.1,vel:82.3}],
  'Luke Maile': [{type:'FA',name:'Fastball',pct:84.6,vel:69.3},{type:'KN',name:'Knuckleball',pct:15.4,vel:54.4}],
  'Luke Weaver': [{type:'FF',name:'Four-seam Fastball',pct:58.8,vel:95.1},{type:'CH',name:'Changeup',pct:29.8,vel:88.1},{type:'FC',name:'Cutter',pct:9.5,vel:91.5},{type:'SL',name:'Slider',pct:1.9,vel:86.8}],
  'Luke Williams': [{type:'EP',name:'Eephus',pct:73.2,vel:59.4},{type:'FA',name:'Fastball',pct:26.8,vel:73.1}],
  'Lyon Richardson': [{type:'CH',name:'Changeup',pct:40.4,vel:86.6},{type:'SI',name:'Sinker',pct:28.8,vel:95.1},{type:'FF',name:'Four-seam Fastball',pct:20.8,vel:95.7},{type:'CU',name:'Curveball',pct:9.5,vel:79.3}],
  'MacKenzie Gore': [{type:'FF',name:'Four-seam Fastball',pct:49.6,vel:95.3},{type:'CU',name:'Curveball',pct:23.7,vel:81.6},{type:'SL',name:'Slider',pct:11.8,vel:86.7},{type:'CH',name:'Changeup',pct:10.4,vel:86.2},{type:'FC',name:'Cutter',pct:4.5,vel:90.3}],
  'Madison Jeffrey': [{type:'FC',name:'Cutter',pct:37.8,vel:90.2},{type:'FF',name:'Four-seam Fastball',pct:29.7,vel:94.4},{type:'SL',name:'Slider',pct:27.0,vel:84.0},{type:'CH',name:'Changeup',pct:5.4,vel:88.1}],
  'Manuel Rodríguez': [{type:'SL',name:'Slider',pct:49.8,vel:89.4},{type:'SI',name:'Sinker',pct:33.8,vel:97.2},{type:'FF',name:'Four-seam Fastball',pct:16.4,vel:96.9}],
  'Marc Church': [{type:'SL',name:'Slider',pct:48.4,vel:87.2},{type:'FF',name:'Four-seam Fastball',pct:45.9,vel:96.3},{type:'CH',name:'Changeup',pct:5.7,vel:91.4}],
  'Marcus Stroman': [{type:'SI',name:'Sinker',pct:36.2,vel:89.7},{type:'SV',name:'Slurve',pct:19.0,vel:82.1},{type:'FC',name:'Cutter',pct:17.5,vel:88.7},{type:'FS',name:'Splitter',pct:10.5,vel:82.8},{type:'SL',name:'Slider',pct:7.0,vel:84.5},{type:'CU',name:'Curveball',pct:5.3,vel:77.8},{type:'FF',name:'Four-seam Fastball',pct:4.5,vel:89.5}],
  'Mark Leiter Jr.': [{type:'SI',name:'Sinker',pct:38.1,vel:93.7},{type:'FS',name:'Splitter',pct:30.9,vel:85.8},{type:'CU',name:'Curveball',pct:25.4,vel:74.1},{type:'FC',name:'Cutter',pct:3.2,vel:91.2},{type:'SL',name:'Slider',pct:2.0,vel:83.3}],
  'Mark McLaughlin': [{type:'FF',name:'Four-seam Fastball',pct:69.2,vel:93.3},{type:'CU',name:'Curveball',pct:23.1,vel:79.8},{type:'FC',name:'Cutter',pct:7.7,vel:87.3}],
  'Martín Pérez': [{type:'SI',name:'Sinker',pct:30.8,vel:89.5},{type:'CH',name:'Changeup',pct:28.9,vel:82.2},{type:'FC',name:'Cutter',pct:27.6,vel:86.0},{type:'CU',name:'Curveball',pct:8.7,vel:76.3},{type:'FF',name:'Four-seam Fastball',pct:4.0,vel:89.7}],
  'Mason Barnett': [{type:'FF',name:'Four-seam Fastball',pct:53.4,vel:94.3},{type:'ST',name:'Sweeper',pct:21.3,vel:84.8},{type:'CU',name:'Curveball',pct:15.1,vel:78.5},{type:'CH',name:'Changeup',pct:10.2,vel:85.4}],
  'Mason Black': [{type:'FF',name:'Four-seam Fastball',pct:43.2,vel:92.7},{type:'ST',name:'Sweeper',pct:31.1,vel:81.8},{type:'SI',name:'Sinker',pct:16.2,vel:92.5},{type:'FC',name:'Cutter',pct:6.8,vel:90.7},{type:'CH',name:'Changeup',pct:2.7,vel:86.8}],
  'Mason Englert': [{type:'CH',name:'Changeup',pct:33.9,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:19.9,vel:93.9},{type:'FC',name:'Cutter',pct:19.5,vel:87.7},{type:'SI',name:'Sinker',pct:17.1,vel:92.9},{type:'CU',name:'Curveball',pct:8.3,vel:76.9}],
  'Mason Erla': [{type:'SI',name:'Sinker',pct:53.3,vel:92.2},{type:'CH',name:'Changeup',pct:26.7,vel:84.8},{type:'SL',name:'Slider',pct:20.0,vel:84.2}],
  'Mason Fluharty': [{type:'FC',name:'Cutter',pct:58.4,vel:90.2},{type:'ST',name:'Sweeper',pct:41.5,vel:81.6}],
  'Mason Miller': [{type:'FF',name:'Four-seam Fastball',pct:52.0,vel:101.2},{type:'SL',name:'Slider',pct:45.8,vel:87.8},{type:'CH',name:'Changeup',pct:2.2,vel:92.7}],
  'Mason Montgomery': [{type:'FF',name:'Four-seam Fastball',pct:66.6,vel:98.7},{type:'SL',name:'Slider',pct:33.4,vel:89.7}],
  'Mason Thompson': [{type:'SI',name:'Sinker',pct:40.2,vel:95.0},{type:'SL',name:'Slider',pct:33.5,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:18.4,vel:94.8},{type:'CU',name:'Curveball',pct:5.0,vel:82.1},{type:'CH',name:'Changeup',pct:2.9,vel:87.3}],
  'Matt Bowman': [{type:'SI',name:'Sinker',pct:43.4,vel:91.1},{type:'FC',name:'Cutter',pct:25.7,vel:88.5},{type:'ST',name:'Sweeper',pct:19.5,vel:82.7},{type:'FS',name:'Splitter',pct:8.5,vel:84.1},{type:'FF',name:'Four-seam Fastball',pct:2.9,vel:90.4}],
  'Matt Brash': [{type:'SL',name:'Slider',pct:60.0,vel:86.0},{type:'SI',name:'Sinker',pct:22.3,vel:96.4},{type:'CH',name:'Changeup',pct:11.9,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:5.2,vel:95.9}],
  'Matt Festa': [{type:'FF',name:'Four-seam Fastball',pct:39.5,vel:92.1},{type:'ST',name:'Sweeper',pct:38.2,vel:83.1},{type:'FC',name:'Cutter',pct:14.2,vel:90.6},{type:'SI',name:'Sinker',pct:8.1,vel:93.2}],
  'Matt Gage': [{type:'SL',name:'Slider',pct:50.5,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:27.8,vel:92.4},{type:'SI',name:'Sinker',pct:9.3,vel:93.0},{type:'CH',name:'Changeup',pct:8.6,vel:85.6},{type:'ST',name:'Sweeper',pct:3.7,vel:80.9}],
  'Matt Krook': [{type:'SI',name:'Sinker',pct:32.4,vel:89.7},{type:'ST',name:'Sweeper',pct:26.8,vel:82.5},{type:'FC',name:'Cutter',pct:23.9,vel:87.4},{type:'CH',name:'Changeup',pct:16.9,vel:85.1}],
  'Matt Manning': [{type:'FF',name:'Four-seam Fastball',pct:43.1,vel:92.7},{type:'ST',name:'Sweeper',pct:25.0,vel:80.8},{type:'CU',name:'Curveball',pct:20.8,vel:79.7},{type:'FS',name:'Splitter',pct:11.1,vel:89.1}],
  'Matt Sauer': [{type:'FC',name:'Cutter',pct:31.8,vel:90.0},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:94.1},{type:'SL',name:'Slider',pct:18.8,vel:83.8},{type:'SI',name:'Sinker',pct:17.6,vel:94.3},{type:'FS',name:'Splitter',pct:9.0,vel:87.3},{type:'CU',name:'Curveball',pct:1.0,vel:82.2}],
  'Matt Strahm': [{type:'FF',name:'Four-seam Fastball',pct:37.6,vel:92.3},{type:'SL',name:'Slider',pct:32.0,vel:82.6},{type:'SI',name:'Sinker',pct:15.3,vel:92.4},{type:'FC',name:'Cutter',pct:14.5,vel:87.7}],
  'Matt Svanson': [{type:'SI',name:'Sinker',pct:47.4,vel:96.8},{type:'ST',name:'Sweeper',pct:34.9,vel:87.2},{type:'FC',name:'Cutter',pct:16.4,vel:92.2},{type:'FF',name:'Four-seam Fastball',pct:1.3,vel:96.5}],
  'Matt Waldron': [{type:'KN',name:'Knuckleball',pct:74.0,vel:79.4},{type:'FF',name:'Four-seam Fastball',pct:14.4,vel:90.2},{type:'SI',name:'Sinker',pct:8.7,vel:89.7},{type:'ST',name:'Sweeper',pct:2.9,vel:81.0}],
  'Matthew Boyd': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:93.3},{type:'CH',name:'Changeup',pct:23.8,vel:78.7},{type:'SL',name:'Slider',pct:15.0,vel:82.0},{type:'CU',name:'Curveball',pct:11.2,vel:73.5},{type:'SI',name:'Sinker',pct:3.0,vel:91.5}],
  'Matthew Liberatore': [{type:'FF',name:'Four-seam Fastball',pct:28.7,vel:93.9},{type:'SL',name:'Slider',pct:21.1,vel:86.4},{type:'CU',name:'Curveball',pct:15.3,vel:77.5},{type:'SI',name:'Sinker',pct:12.3,vel:94.1},{type:'CH',name:'Changeup',pct:11.9,vel:88.4},{type:'FC',name:'Cutter',pct:10.8,vel:90.3}],
  'Max Fried': [{type:'FC',name:'Cutter',pct:27.2,vel:93.6},{type:'SI',name:'Sinker',pct:17.7,vel:94.0},{type:'CU',name:'Curveball',pct:17.2,vel:75.2},{type:'FF',name:'Four-seam Fastball',pct:13.1,vel:95.5},{type:'CH',name:'Changeup',pct:11.4,vel:85.2},{type:'ST',name:'Sweeper',pct:11.4,vel:81.4},{type:'SL',name:'Slider',pct:1.9,vel:85.6}],
  'Max Kranick': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:95.6},{type:'SL',name:'Slider',pct:39.5,vel:89.9},{type:'CU',name:'Curveball',pct:12.1,vel:79.1},{type:'ST',name:'Sweeper',pct:7.6,vel:82.5}],
  'Max Lazar': [{type:'FF',name:'Four-seam Fastball',pct:55.3,vel:94.5},{type:'KC',name:'Knuckle Curve',pct:26.2,vel:81.1},{type:'FC',name:'Cutter',pct:15.3,vel:88.3},{type:'FS',name:'Splitter',pct:3.3,vel:86.8}],
  'Max Meyer': [{type:'SL',name:'Slider',pct:34.7,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:95.0},{type:'CH',name:'Changeup',pct:17.7,vel:89.3},{type:'SI',name:'Sinker',pct:13.7,vel:94.3},{type:'ST',name:'Sweeper',pct:12.0,vel:86.9}],
  'Max Rajcic': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:93.3},{type:'CH',name:'Changeup',pct:28.6,vel:84.0},{type:'CU',name:'Curveball',pct:27.1,vel:81.0},{type:'ST',name:'Sweeper',pct:1.4,vel:83.7}],
  'Max Scherzer': [{type:'FF',name:'Four-seam Fastball',pct:49.0,vel:93.6},{type:'SL',name:'Slider',pct:22.9,vel:86.3},{type:'CH',name:'Changeup',pct:13.8,vel:84.8},{type:'CU',name:'Curveball',pct:11.9,vel:76.7},{type:'FC',name:'Cutter',pct:2.4,vel:87.7}],
  'McCade Brown': [{type:'FF',name:'Four-seam Fastball',pct:57.0,vel:94.3},{type:'SL',name:'Slider',pct:19.3,vel:85.3},{type:'KC',name:'Knuckle Curve',pct:17.9,vel:78.7},{type:'CH',name:'Changeup',pct:5.6,vel:87.6}],
  'Merrill Kelly': [{type:'CH',name:'Changeup',pct:26.9,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:23.2,vel:91.9},{type:'FC',name:'Cutter',pct:20.0,vel:90.6},{type:'SI',name:'Sinker',pct:12.9,vel:92.3},{type:'CU',name:'Curveball',pct:9.6,vel:81.7},{type:'SL',name:'Slider',pct:7.4,vel:85.9}],
  'Michael Cuevas': [{type:'SI',name:'Sinker',pct:54.5,vel:91.6},{type:'SL',name:'Slider',pct:27.3,vel:80.8},{type:'CU',name:'Curveball',pct:18.2,vel:79.8}],
  'Michael Darrell-Hicks': [{type:'SI',name:'Sinker',pct:43.8,vel:94.5},{type:'FC',name:'Cutter',pct:28.8,vel:87.5},{type:'ST',name:'Sweeper',pct:24.0,vel:83.0},{type:'FF',name:'Four-seam Fastball',pct:3.4,vel:95.2}],
  'Michael Fulmer': [{type:'FC',name:'Cutter',pct:43.3,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:23.3,vel:93.7},{type:'CH',name:'Changeup',pct:10.0,vel:89.5},{type:'SI',name:'Sinker',pct:10.0,vel:93.1},{type:'CU',name:'Curveball',pct:8.9,vel:80.3},{type:'ST',name:'Sweeper',pct:4.4,vel:83.3}],
  'Michael Kelly': [{type:'ST',name:'Sweeper',pct:50.5,vel:82.9},{type:'FF',name:'Four-seam Fastball',pct:29.2,vel:95.8},{type:'SL',name:'Slider',pct:14.3,vel:90.3},{type:'SI',name:'Sinker',pct:4.6,vel:95.0},{type:'CH',name:'Changeup',pct:1.5,vel:89.2}],
  'Michael King': [{type:'SI',name:'Sinker',pct:29.8,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:24.5,vel:93.7},{type:'CH',name:'Changeup',pct:21.4,vel:86.7},{type:'ST',name:'Sweeper',pct:18.8,vel:82.3},{type:'SL',name:'Slider',pct:5.5,vel:83.7}],
  'Michael Kopech': [{type:'FF',name:'Four-seam Fastball',pct:82.7,vel:97.5},{type:'FC',name:'Cutter',pct:16.5,vel:91.1}],
  'Michael Lorenzen': [{type:'FF',name:'Four-seam Fastball',pct:22.1,vel:93.9},{type:'SI',name:'Sinker',pct:18.0,vel:93.0},{type:'CH',name:'Changeup',pct:17.3,vel:83.7},{type:'SL',name:'Slider',pct:11.4,vel:85.2},{type:'CU',name:'Curveball',pct:11.3,vel:82.1},{type:'FC',name:'Cutter',pct:10.9,vel:90.2},{type:'ST',name:'Sweeper',pct:9.1,vel:82.3}],
  'Michael McGreevy': [{type:'FF',name:'Four-seam Fastball',pct:25.4,vel:93.0},{type:'SI',name:'Sinker',pct:22.6,vel:91.7},{type:'ST',name:'Sweeper',pct:20.4,vel:83.7},{type:'CU',name:'Curveball',pct:11.7,vel:79.6},{type:'CH',name:'Changeup',pct:9.9,vel:88.0},{type:'FC',name:'Cutter',pct:9.8,vel:88.6}],
  'Michael Mercado': [{type:'FF',name:'Four-seam Fastball',pct:52.2,vel:96.7},{type:'FC',name:'Cutter',pct:28.3,vel:88.1},{type:'CU',name:'Curveball',pct:13.3,vel:83.7},{type:'FS',name:'Splitter',pct:5.3,vel:90.7}],
  'Michael Petersen': [{type:'FF',name:'Four-seam Fastball',pct:56.0,vel:97.5},{type:'FC',name:'Cutter',pct:41.3,vel:89.2},{type:'SI',name:'Sinker',pct:2.4,vel:97.1}],
  'Michael Soroka': [{type:'FF',name:'Four-seam Fastball',pct:45.4,vel:93.6},{type:'SV',name:'Slurve',pct:34.8,vel:80.4},{type:'CH',name:'Changeup',pct:10.0,vel:84.3},{type:'SI',name:'Sinker',pct:9.7,vel:93.3}],
  'Michael Stefanic': [{type:'EP',name:'Eephus',pct:100.0,vel:61.2}],
  'Michael Tonkin': [{type:'FF',name:'Four-seam Fastball',pct:56.9,vel:92.4},{type:'SL',name:'Slider',pct:25.9,vel:83.9},{type:'ST',name:'Sweeper',pct:9.1,vel:80.1},{type:'SI',name:'Sinker',pct:8.1,vel:91.8}],
  'Michael Wacha': [{type:'FF',name:'Four-seam Fastball',pct:27.5,vel:93.0},{type:'CH',name:'Changeup',pct:25.2,vel:79.9},{type:'FC',name:'Cutter',pct:14.5,vel:88.1},{type:'SI',name:'Sinker',pct:12.6,vel:93.1},{type:'SL',name:'Slider',pct:12.5,vel:84.9},{type:'CU',name:'Curveball',pct:7.7,vel:75.1}],
  'Michel Otañez': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:97.4},{type:'SL',name:'Slider',pct:35.5,vel:85.2},{type:'SI',name:'Sinker',pct:22.3,vel:96.6}],
  'Mick Abel': [{type:'FF',name:'Four-seam Fastball',pct:42.1,vel:96.4},{type:'CU',name:'Curveball',pct:21.4,vel:82.7},{type:'SI',name:'Sinker',pct:13.2,vel:95.4},{type:'SL',name:'Slider',pct:11.5,vel:87.3},{type:'CH',name:'Changeup',pct:8.8,vel:89.1},{type:'ST',name:'Sweeper',pct:3.1,vel:84.5}],
  'Miguel Castro': [{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:95.1},{type:'SL',name:'Slider',pct:28.7,vel:83.5},{type:'SI',name:'Sinker',pct:20.2,vel:95.0},{type:'CH',name:'Changeup',pct:12.4,vel:88.5}],
  'Miguel Rojas': [{type:'EP',name:'Eephus',pct:84.1,vel:45.3},{type:'FA',name:'Fastball',pct:15.9,vel:61.7}],
  'Mike Burrows': [{type:'FF',name:'Four-seam Fastball',pct:39.2,vel:95.5},{type:'CH',name:'Changeup',pct:23.7,vel:87.3},{type:'SL',name:'Slider',pct:19.5,vel:87.3},{type:'CU',name:'Curveball',pct:11.9,vel:78.5},{type:'SI',name:'Sinker',pct:5.7,vel:95.7}],
  'Mike Clevinger': [{type:'FF',name:'Four-seam Fastball',pct:38.4,vel:93.9},{type:'FC',name:'Cutter',pct:22.6,vel:89.6},{type:'ST',name:'Sweeper',pct:21.3,vel:79.2},{type:'CH',name:'Changeup',pct:12.8,vel:87.7},{type:'SI',name:'Sinker',pct:3.0,vel:91.1},{type:'CU',name:'Curveball',pct:1.8,vel:79.6}],
  'Mike Vasil': [{type:'SI',name:'Sinker',pct:39.3,vel:94.4},{type:'ST',name:'Sweeper',pct:15.9,vel:81.7},{type:'FF',name:'Four-seam Fastball',pct:14.6,vel:94.6},{type:'CH',name:'Changeup',pct:12.3,vel:86.5},{type:'CU',name:'Curveball',pct:12.2,vel:81.7},{type:'FC',name:'Cutter',pct:5.7,vel:86.3}],
  'Mike Yastrzemski': [{type:'EP',name:'Eephus',pct:38.1,vel:56.6},{type:'KN',name:'Knuckleball',pct:38.1,vel:65.8},{type:'FA',name:'Fastball',pct:19.0,vel:72.2},{type:'CU',name:'Curveball',pct:4.8,vel:65.7}],
  'Miles Mastrobuoni': [{type:'EP',name:'Eephus',pct:95.7,vel:51.2},{type:'FA',name:'Fastball',pct:4.3,vel:79.3}],
  'Miles Mikolas': [{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:92.9},{type:'SL',name:'Slider',pct:23.4,vel:87.7},{type:'CU',name:'Curveball',pct:17.2,vel:76.1},{type:'SI',name:'Sinker',pct:16.7,vel:92.3},{type:'CH',name:'Changeup',pct:11.6,vel:85.9},{type:'ST',name:'Sweeper',pct:2.8,vel:80.7}],
  'Mitch Farris': [{type:'FF',name:'Four-seam Fastball',pct:49.9,vel:90.3},{type:'CH',name:'Changeup',pct:26.7,vel:77.6},{type:'SL',name:'Slider',pct:23.5,vel:81.5}],
  'Mitch Keller': [{type:'FF',name:'Four-seam Fastball',pct:34.8,vel:94.1},{type:'ST',name:'Sweeper',pct:19.1,vel:82.3},{type:'SI',name:'Sinker',pct:17.8,vel:92.9},{type:'SL',name:'Slider',pct:14.0,vel:86.9},{type:'CU',name:'Curveball',pct:7.3,vel:77.4},{type:'CH',name:'Changeup',pct:7.0,vel:89.2}],
  'Mitch Spence': [{type:'FC',name:'Cutter',pct:45.3,vel:91.1},{type:'SL',name:'Slider',pct:26.4,vel:84.6},{type:'CU',name:'Curveball',pct:17.5,vel:81.8},{type:'SI',name:'Sinker',pct:9.5,vel:92.6},{type:'CH',name:'Changeup',pct:1.2,vel:88.1}],
  'Mitchell Parker': [{type:'FF',name:'Four-seam Fastball',pct:55.5,vel:93.0},{type:'CU',name:'Curveball',pct:22.0,vel:81.1},{type:'SL',name:'Slider',pct:12.1,vel:85.0},{type:'FS',name:'Splitter',pct:10.5,vel:85.4}],
  'Nabil Crismatt': [{type:'CH',name:'Changeup',pct:38.0,vel:81.4},{type:'SI',name:'Sinker',pct:25.3,vel:89.2},{type:'CU',name:'Curveball',pct:15.5,vel:73.8},{type:'FF',name:'Four-seam Fastball',pct:15.5,vel:89.1},{type:'SL',name:'Slider',pct:5.6,vel:81.8}],
  'Nate Eaton': [{type:'FA',name:'Fastball',pct:57.1,vel:71.1},{type:'EP',name:'Eephus',pct:42.9,vel:58.3}],
  'Nate Garkow': [{type:'CH',name:'Changeup',pct:50.0,vel:76.2},{type:'FF',name:'Four-seam Fastball',pct:36.7,vel:88.8},{type:'SL',name:'Slider',pct:13.3,vel:79.5}],
  'Nate Pearson': [{type:'FF',name:'Four-seam Fastball',pct:52.1,vel:97.6},{type:'SL',name:'Slider',pct:40.4,vel:89.5},{type:'CU',name:'Curveball',pct:5.0,vel:83.2},{type:'SI',name:'Sinker',pct:2.5,vel:97.3}],
  'Nathan Eovaldi': [{type:'FS',name:'Splitter',pct:31.4,vel:87.6},{type:'FF',name:'Four-seam Fastball',pct:22.5,vel:94.1},{type:'FC',name:'Cutter',pct:20.1,vel:90.5},{type:'CU',name:'Curveball',pct:19.7,vel:75.8},{type:'SI',name:'Sinker',pct:5.1,vel:93.3},{type:'SL',name:'Slider',pct:1.2,vel:85.7}],
  'Nathan Wiles': [{type:'CH',name:'Changeup',pct:43.8,vel:85.5},{type:'FC',name:'Cutter',pct:29.2,vel:87.8},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:94.3},{type:'SL',name:'Slider',pct:2.1,vel:83.9}],
  'Nelson L. Alvarez': [{type:'FC',name:'Cutter',pct:33.3,vel:87.0},{type:'CU',name:'Curveball',pct:30.6,vel:78.1},{type:'SL',name:'Slider',pct:19.4,vel:81.7},{type:'SI',name:'Sinker',pct:16.7,vel:92.8}],
  'Nestor Cortes': [{type:'FF',name:'Four-seam Fastball',pct:39.2,vel:90.2},{type:'FC',name:'Cutter',pct:33.5,vel:86.6},{type:'CH',name:'Changeup',pct:14.4,vel:82.2},{type:'ST',name:'Sweeper',pct:12.5,vel:77.8}],
  'Nic Enright': [{type:'FF',name:'Four-seam Fastball',pct:66.4,vel:93.2},{type:'SL',name:'Slider',pct:25.4,vel:85.0},{type:'CU',name:'Curveball',pct:8.1,vel:82.7}],
  'Nicholas Padilla': [{type:'FC',name:'Cutter',pct:44.7,vel:90.7},{type:'CU',name:'Curveball',pct:23.7,vel:78.9},{type:'SI',name:'Sinker',pct:18.4,vel:92.0},{type:'ST',name:'Sweeper',pct:13.2,vel:81.3}],
  'Nick Anderson': [{type:'FF',name:'Four-seam Fastball',pct:48.5,vel:95.1},{type:'CU',name:'Curveball',pct:29.8,vel:83.2},{type:'CH',name:'Changeup',pct:20.6,vel:88.3},{type:'SI',name:'Sinker',pct:1.1,vel:95.2}],
  'Nick Burdi': [{type:'SI',name:'Sinker',pct:43.4,vel:93.6},{type:'SL',name:'Slider',pct:31.3,vel:86.2},{type:'FF',name:'Four-seam Fastball',pct:22.9,vel:94.8},{type:'CH',name:'Changeup',pct:2.4,vel:86.8}],
  'Nick Dombkowski': [{type:'FC',name:'Cutter',pct:50.0,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:89.7}],
  'Nick Hernandez': [{type:'SL',name:'Slider',pct:45.7,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:43.0,vel:91.3},{type:'FS',name:'Splitter',pct:11.3,vel:81.5}],
  'Nick Jones': [{type:'FF',name:'Four-seam Fastball',pct:59.3,vel:91.6},{type:'SV',name:'Slurve',pct:29.6,vel:79.8},{type:'SI',name:'Sinker',pct:11.1,vel:91.9}],
  'Nick Lodolo': [{type:'CU',name:'Curveball',pct:28.8,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:27.8,vel:93.9},{type:'SI',name:'Sinker',pct:21.9,vel:93.7},{type:'CH',name:'Changeup',pct:21.5,vel:87.9}],
  'Nick Martinez': [{type:'FC',name:'Cutter',pct:20.9,vel:89.1},{type:'FF',name:'Four-seam Fastball',pct:20.9,vel:92.6},{type:'CH',name:'Changeup',pct:19.7,vel:78.6},{type:'SI',name:'Sinker',pct:17.1,vel:92.5},{type:'CU',name:'Curveball',pct:10.9,vel:79.8},{type:'SL',name:'Slider',pct:10.4,vel:84.9}],
  'Nick Mears': [{type:'FF',name:'Four-seam Fastball',pct:53.5,vel:95.4},{type:'SL',name:'Slider',pct:42.4,vel:86.6},{type:'CU',name:'Curveball',pct:4.1,vel:82.7}],
  'Nick Mikolajchak': [{type:'FC',name:'Cutter',pct:43.8,vel:90.3},{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:94.0},{type:'CH',name:'Changeup',pct:12.5,vel:83.8},{type:'SL',name:'Slider',pct:6.2,vel:82.2}],
  'Nick Pivetta': [{type:'FF',name:'Four-seam Fastball',pct:47.7,vel:93.8},{type:'CU',name:'Curveball',pct:22.0,vel:79.0},{type:'ST',name:'Sweeper',pct:18.2,vel:81.9},{type:'FC',name:'Cutter',pct:8.6,vel:90.3},{type:'SI',name:'Sinker',pct:2.8,vel:93.6}],
  'Nick Raquet': [{type:'ST',name:'Sweeper',pct:48.1,vel:82.1},{type:'SI',name:'Sinker',pct:29.6,vel:91.4},{type:'CH',name:'Changeup',pct:11.1,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:11.1,vel:91.2}],
  'Nick Robertson': [{type:'CH',name:'Changeup',pct:62.5,vel:86.0},{type:'FF',name:'Four-seam Fastball',pct:31.2,vel:93.5},{type:'SL',name:'Slider',pct:6.2,vel:88.4}],
  'Nick Sandlin': [{type:'SL',name:'Slider',pct:48.3,vel:78.5},{type:'FF',name:'Four-seam Fastball',pct:21.0,vel:91.5},{type:'FS',name:'Splitter',pct:20.4,vel:84.1},{type:'SI',name:'Sinker',pct:10.1,vel:91.7}],
  'Nick Vespi': [{type:'FC',name:'Cutter',pct:56.2,vel:88.2},{type:'CU',name:'Curveball',pct:18.8,vel:78.9},{type:'SL',name:'Slider',pct:18.8,vel:82.5},{type:'SI',name:'Sinker',pct:6.2,vel:86.1}],
  'Nicky Lopez': [{type:'FA',name:'Fastball',pct:100.0,vel:64.3}],
  'Nigel Belgrave': [{type:'SI',name:'Sinker',pct:42.9,vel:92.2},{type:'SL',name:'Slider',pct:21.4,vel:88.4},{type:'CH',name:'Changeup',pct:14.3,vel:90.5},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:94.4},{type:'ST',name:'Sweeper',pct:7.1,vel:84.2}],
  'Niko Kavadas': [{type:'FA',name:'Fastball',pct:84.0,vel:57.6},{type:'EP',name:'Eephus',pct:16.0,vel:44.3}],
  'Noah Cameron': [{type:'FF',name:'Four-seam Fastball',pct:26.4,vel:92.3},{type:'FC',name:'Cutter',pct:21.6,vel:88.2},{type:'CU',name:'Curveball',pct:19.3,vel:80.9},{type:'CH',name:'Changeup',pct:18.6,vel:81.3},{type:'SL',name:'Slider',pct:14.1,vel:84.1}],
  'Noah Davis': [{type:'SI',name:'Sinker',pct:37.1,vel:94.4},{type:'ST',name:'Sweeper',pct:31.5,vel:79.9},{type:'FC',name:'Cutter',pct:18.7,vel:88.0},{type:'FF',name:'Four-seam Fastball',pct:7.6,vel:94.8},{type:'SC',name:'Screwball',pct:2.8,vel:85.8},{type:'SL',name:'Slider',pct:2.0,vel:82.8}],
  'Noah Denoyer': [{type:'FF',name:'Four-seam Fastball',pct:44.8,vel:92.2},{type:'CU',name:'Curveball',pct:31.0,vel:81.7},{type:'FC',name:'Cutter',pct:13.8,vel:86.6},{type:'FS',name:'Splitter',pct:6.9,vel:87.6},{type:'SL',name:'Slider',pct:3.4,vel:83.3}],
  'Noah Murdock': [{type:'SI',name:'Sinker',pct:57.0,vel:94.5},{type:'FC',name:'Cutter',pct:22.7,vel:89.3},{type:'ST',name:'Sweeper',pct:19.6,vel:82.2}],
  'Noah Schultz': [{type:'SI',name:'Sinker',pct:32.1,vel:93.9},{type:'SL',name:'Slider',pct:28.3,vel:80.8},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:94.5},{type:'FC',name:'Cutter',pct:17.0,vel:90.4},{type:'CH',name:'Changeup',pct:3.8,vel:87.1}],
  'Nolan Hoffman': [{type:'SI',name:'Sinker',pct:53.8,vel:94.6},{type:'CU',name:'Curveball',pct:26.9,vel:79.0},{type:'CH',name:'Changeup',pct:11.5,vel:87.4},{type:'FC',name:'Cutter',pct:7.7,vel:90.2}],
  'Nolan McLean': [{type:'SI',name:'Sinker',pct:27.9,vel:94.8},{type:'ST',name:'Sweeper',pct:25.7,vel:85.3},{type:'CU',name:'Curveball',pct:15.8,vel:80.0},{type:'FF',name:'Four-seam Fastball',pct:13.3,vel:95.8},{type:'CH',name:'Changeup',pct:8.7,vel:86.8},{type:'FC',name:'Cutter',pct:8.5,vel:90.9}],
  'Omar Cruz': [{type:'FF',name:'Four-seam Fastball',pct:59.4,vel:92.5},{type:'CH',name:'Changeup',pct:24.2,vel:81.9},{type:'CU',name:'Curveball',pct:14.1,vel:76.5},{type:'SL',name:'Slider',pct:2.3,vel:82.9}],
  'Orion Kerkering': [{type:'ST',name:'Sweeper',pct:48.1,vel:86.7},{type:'FF',name:'Four-seam Fastball',pct:33.2,vel:97.5},{type:'SI',name:'Sinker',pct:18.7,vel:96.4}],
  'Orlando Ribalta': [{type:'FF',name:'Four-seam Fastball',pct:35.9,vel:96.4},{type:'SL',name:'Slider',pct:23.8,vel:87.2},{type:'CH',name:'Changeup',pct:21.3,vel:85.3},{type:'SI',name:'Sinker',pct:19.0,vel:95.6}],
  'Osvaldo Bido': [{type:'FF',name:'Four-seam Fastball',pct:37.9,vel:94.5},{type:'SL',name:'Slider',pct:29.8,vel:85.2},{type:'SI',name:'Sinker',pct:14.8,vel:94.7},{type:'CH',name:'Changeup',pct:10.6,vel:88.8},{type:'FC',name:'Cutter',pct:6.8,vel:86.6}],
  'Oswald Peraza': [{type:'CU',name:'Curveball',pct:80.0,vel:38.8},{type:'SL',name:'Slider',pct:20.0,vel:39.8}],
  'Owen White': [{type:'FF',name:'Four-seam Fastball',pct:26.6,vel:92.3},{type:'ST',name:'Sweeper',pct:26.6,vel:81.5},{type:'FC',name:'Cutter',pct:25.3,vel:88.9},{type:'CH',name:'Changeup',pct:9.1,vel:86.7},{type:'SI',name:'Sinker',pct:8.4,vel:92.3},{type:'CU',name:'Curveball',pct:3.2,vel:77.3}],
  'PJ Poulin': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:90.8},{type:'ST',name:'Sweeper',pct:22.9,vel:78.6},{type:'CH',name:'Changeup',pct:21.5,vel:80.3},{type:'SI',name:'Sinker',pct:11.1,vel:89.8},{type:'SL',name:'Slider',pct:1.6,vel:77.8}],
  'Pablo López': [{type:'FF',name:'Four-seam Fastball',pct:41.0,vel:94.5},{type:'CH',name:'Changeup',pct:22.0,vel:87.2},{type:'ST',name:'Sweeper',pct:20.7,vel:84.9},{type:'CU',name:'Curveball',pct:9.7,vel:82.6},{type:'SI',name:'Sinker',pct:6.5,vel:93.8}],
  'Pablo Reyes': [{type:'FA',name:'Fastball',pct:72.2,vel:66.8},{type:'EP',name:'Eephus',pct:27.8,vel:44.5}],
  'Parker Messick': [{type:'FF',name:'Four-seam Fastball',pct:36.0,vel:92.8},{type:'CH',name:'Changeup',pct:23.4,vel:84.6},{type:'SL',name:'Slider',pct:14.6,vel:86.3},{type:'SI',name:'Sinker',pct:13.4,vel:91.4},{type:'CU',name:'Curveball',pct:12.6,vel:77.1}],
  'Parker Mushinski': [{type:'FC',name:'Cutter',pct:39.0,vel:88.5},{type:'CU',name:'Curveball',pct:29.3,vel:80.8},{type:'ST',name:'Sweeper',pct:12.2,vel:79.2},{type:'FF',name:'Four-seam Fastball',pct:9.8,vel:92.4},{type:'SI',name:'Sinker',pct:9.8,vel:91.8}],
  'Patrick Copen': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:97.1},{type:'FC',name:'Cutter',pct:21.4,vel:94.5},{type:'CU',name:'Curveball',pct:14.3,vel:84.7},{type:'SI',name:'Sinker',pct:7.1,vel:96.5},{type:'ST',name:'Sweeper',pct:7.1,vel:85.5}],
  'Patrick Corbin': [{type:'SL',name:'Slider',pct:33.5,vel:80.4},{type:'SI',name:'Sinker',pct:28.9,vel:91.6},{type:'FC',name:'Cutter',pct:25.0,vel:87.5},{type:'CH',name:'Changeup',pct:9.3,vel:81.6},{type:'FF',name:'Four-seam Fastball',pct:2.7,vel:91.2}],
  'Patrick Monteverde': [{type:'FC',name:'Cutter',pct:44.8,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:14.9,vel:90.3},{type:'CU',name:'Curveball',pct:13.8,vel:76.7},{type:'SI',name:'Sinker',pct:12.6,vel:89.8},{type:'CH',name:'Changeup',pct:10.3,vel:82.7},{type:'SL',name:'Slider',pct:3.4,vel:80.9}],
  'Patrick Murphy': [{type:'SL',name:'Slider',pct:26.7,vel:83.7},{type:'CU',name:'Curveball',pct:22.2,vel:81.0},{type:'FF',name:'Four-seam Fastball',pct:22.2,vel:95.2},{type:'SI',name:'Sinker',pct:22.2,vel:94.7},{type:'CH',name:'Changeup',pct:6.7,vel:89.3}],
  'Paul Blackburn': [{type:'SI',name:'Sinker',pct:30.2,vel:92.5},{type:'FC',name:'Cutter',pct:27.5,vel:90.0},{type:'ST',name:'Sweeper',pct:16.2,vel:81.6},{type:'CU',name:'Curveball',pct:13.1,vel:80.4},{type:'CH',name:'Changeup',pct:9.3,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:3.7,vel:92.5}],
  'Paul Gervase': [{type:'FF',name:'Four-seam Fastball',pct:58.8,vel:93.8},{type:'SL',name:'Slider',pct:29.4,vel:84.2},{type:'FC',name:'Cutter',pct:11.8,vel:89.8}],
  'Paul Sewald': [{type:'FF',name:'Four-seam Fastball',pct:58.0,vel:90.3},{type:'ST',name:'Sweeper',pct:42.0,vel:82.2}],
  'Paul Skenes': [{type:'FF',name:'Four-seam Fastball',pct:39.3,vel:98.2},{type:'ST',name:'Sweeper',pct:15.6,vel:84.5},{type:'FS',name:'Splitter',pct:14.0,vel:93.7},{type:'CH',name:'Changeup',pct:10.7,vel:88.7},{type:'SI',name:'Sinker',pct:10.2,vel:97.6},{type:'SL',name:'Slider',pct:5.5,vel:85.3},{type:'CU',name:'Curveball',pct:4.6,vel:83.9}],
  'Paxton Schultz': [{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:93.8},{type:'FC',name:'Cutter',pct:28.8,vel:88.9},{type:'CH',name:'Changeup',pct:19.5,vel:86.3},{type:'SL',name:'Slider',pct:14.6,vel:85.4}],
  'Payton Tolle': [{type:'FF',name:'Four-seam Fastball',pct:65.0,vel:96.7},{type:'FC',name:'Cutter',pct:13.5,vel:89.5},{type:'SL',name:'Slider',pct:9.3,vel:88.6},{type:'CH',name:'Changeup',pct:6.4,vel:89.8},{type:'CU',name:'Curveball',pct:5.8,vel:83.0}],
  'Penn Murfee': [{type:'ST',name:'Sweeper',pct:48.7,vel:78.6},{type:'FF',name:'Four-seam Fastball',pct:37.0,vel:88.2},{type:'SI',name:'Sinker',pct:13.6,vel:88.2}],
  'Pete Fairbanks': [{type:'FF',name:'Four-seam Fastball',pct:51.3,vel:97.3},{type:'SL',name:'Slider',pct:39.7,vel:85.3},{type:'CH',name:'Changeup',pct:4.9,vel:94.2},{type:'FC',name:'Cutter',pct:4.1,vel:90.6}],
  'Peter Strzelecki': [{type:'FF',name:'Four-seam Fastball',pct:49.3,vel:94.0},{type:'ST',name:'Sweeper',pct:22.4,vel:81.8},{type:'CH',name:'Changeup',pct:14.9,vel:85.2},{type:'CU',name:'Curveball',pct:7.5,vel:80.7},{type:'SI',name:'Sinker',pct:6.0,vel:93.9}],
  'Peyton Pallette': [{type:'FF',name:'Four-seam Fastball',pct:39.7,vel:95.0},{type:'CU',name:'Curveball',pct:37.9,vel:81.0},{type:'CH',name:'Changeup',pct:22.4,vel:85.5}],
  'Phil Fox': [{type:'FF',name:'Four-seam Fastball',pct:53.1,vel:91.5},{type:'CH',name:'Changeup',pct:21.9,vel:84.6},{type:'SL',name:'Slider',pct:21.9,vel:84.1},{type:'FC',name:'Cutter',pct:3.1,vel:86.9}],
  'Phil Maton': [{type:'CU',name:'Curveball',pct:38.3,vel:75.9},{type:'FC',name:'Cutter',pct:35.8,vel:90.6},{type:'ST',name:'Sweeper',pct:13.7,vel:83.6},{type:'SI',name:'Sinker',pct:12.2,vel:89.6}],
  'Philip Abner': [{type:'FF',name:'Four-seam Fastball',pct:73.3,vel:90.3},{type:'SL',name:'Slider',pct:21.3,vel:79.2},{type:'CH',name:'Changeup',pct:5.3,vel:80.6}],
  'Pierce Johnson': [{type:'CU',name:'Curveball',pct:72.1,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:23.0,vel:95.3},{type:'FC',name:'Cutter',pct:4.9,vel:92.4}],
  'Pierson Ohl': [{type:'FF',name:'Four-seam Fastball',pct:43.8,vel:91.9},{type:'CH',name:'Changeup',pct:37.7,vel:81.1},{type:'FC',name:'Cutter',pct:11.8,vel:85.3},{type:'CU',name:'Curveball',pct:5.9,vel:77.9}],
  'Porter Hodge': [{type:'FF',name:'Four-seam Fastball',pct:50.3,vel:96.0},{type:'ST',name:'Sweeper',pct:31.9,vel:84.0},{type:'SL',name:'Slider',pct:17.3,vel:86.2}],
  'Quinn Mathews': [{type:'FF',name:'Four-seam Fastball',pct:59.7,vel:94.3},{type:'SL',name:'Slider',pct:19.4,vel:86.4},{type:'CH',name:'Changeup',pct:12.9,vel:81.4},{type:'CU',name:'Curveball',pct:4.8,vel:74.0},{type:'SI',name:'Sinker',pct:3.2,vel:95.0}],
  'Quinn Priester': [{type:'SI',name:'Sinker',pct:41.7,vel:93.9},{type:'SL',name:'Slider',pct:26.9,vel:86.1},{type:'FC',name:'Cutter',pct:20.6,vel:92.3},{type:'CU',name:'Curveball',pct:9.3,vel:81.0},{type:'CH',name:'Changeup',pct:1.5,vel:88.4}],
  'Rafael Montero': [{type:'FS',name:'Splitter',pct:46.7,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:40.3,vel:95.1},{type:'SL',name:'Slider',pct:7.6,vel:85.1},{type:'SI',name:'Sinker',pct:5.4,vel:94.9}],
  'Raisel Iglesias': [{type:'FF',name:'Four-seam Fastball',pct:40.1,vel:94.9},{type:'CH',name:'Changeup',pct:27.7,vel:88.8},{type:'SI',name:'Sinker',pct:22.3,vel:94.7},{type:'SL',name:'Slider',pct:9.9,vel:83.7}],
  'Randy Dobnak': [{type:'SI',name:'Sinker',pct:35.4,vel:92.0},{type:'SL',name:'Slider',pct:27.8,vel:82.2},{type:'CH',name:'Changeup',pct:24.1,vel:84.9},{type:'FF',name:'Four-seam Fastball',pct:12.7,vel:92.3}],
  'Randy Rodríguez': [{type:'FF',name:'Four-seam Fastball',pct:56.5,vel:97.3},{type:'SL',name:'Slider',pct:43.2,vel:86.3}],
  'Randy Vásquez': [{type:'FC',name:'Cutter',pct:24.9,vel:90.2},{type:'FF',name:'Four-seam Fastball',pct:21.0,vel:93.5},{type:'SI',name:'Sinker',pct:19.0,vel:93.1},{type:'ST',name:'Sweeper',pct:13.1,vel:82.1},{type:'CU',name:'Curveball',pct:12.8,vel:81.2},{type:'CH',name:'Changeup',pct:6.9,vel:86.9},{type:'SL',name:'Slider',pct:2.1,vel:85.8}],
  'Randy Wynne': [{type:'FF',name:'Four-seam Fastball',pct:42.6,vel:90.5},{type:'FC',name:'Cutter',pct:19.1,vel:86.5},{type:'CH',name:'Changeup',pct:12.8,vel:80.6},{type:'CU',name:'Curveball',pct:10.6,vel:75.5},{type:'SI',name:'Sinker',pct:8.5,vel:90.4},{type:'SL',name:'Slider',pct:6.4,vel:80.8}],
  'Ranger Suarez': [{type:'SI',name:'Sinker',pct:28.6,vel:90.1},{type:'CH',name:'Changeup',pct:19.1,vel:79.5},{type:'FC',name:'Cutter',pct:17.6,vel:86.4},{type:'CU',name:'Curveball',pct:16.1,vel:73.9},{type:'FF',name:'Four-seam Fastball',pct:14.5,vel:91.3},{type:'SL',name:'Slider',pct:4.1,vel:79.6}],
  'Raul Brito': [{type:'FF',name:'Four-seam Fastball',pct:62.1,vel:93.3},{type:'CU',name:'Curveball',pct:37.9,vel:73.9}],
  'Reed Garrett': [{type:'FC',name:'Cutter',pct:28.2,vel:92.5},{type:'SI',name:'Sinker',pct:24.3,vel:97.0},{type:'FS',name:'Splitter',pct:22.4,vel:89.1},{type:'ST',name:'Sweeper',pct:21.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:4.0,vel:97.9}],
  'Reese McGuire': [{type:'SL',name:'Slider',pct:70.6,vel:41.1},{type:'CU',name:'Curveball',pct:29.4,vel:38.6}],
  'Reese Olson': [{type:'SI',name:'Sinker',pct:28.2,vel:94.5},{type:'CH',name:'Changeup',pct:25.0,vel:87.8},{type:'SL',name:'Slider',pct:21.5,vel:84.4},{type:'FF',name:'Four-seam Fastball',pct:19.3,vel:94.4},{type:'CU',name:'Curveball',pct:5.7,vel:79.8}],
  'Reid Detmers': [{type:'FF',name:'Four-seam Fastball',pct:45.4,vel:95.8},{type:'SL',name:'Slider',pct:31.2,vel:88.3},{type:'CU',name:'Curveball',pct:21.1,vel:73.6},{type:'SI',name:'Sinker',pct:2.1,vel:95.6}],
  'Reiver Sanmartin': [{type:'FF',name:'Four-seam Fastball',pct:35.3,vel:91.8},{type:'CH',name:'Changeup',pct:33.3,vel:87.6},{type:'SI',name:'Sinker',pct:19.6,vel:92.1},{type:'SL',name:'Slider',pct:11.8,vel:83.9}],
  'Reynaldo López': [{type:'FF',name:'Four-seam Fastball',pct:47.0,vel:94.7},{type:'SL',name:'Slider',pct:35.5,vel:83.0},{type:'CU',name:'Curveball',pct:12.0,vel:73.3},{type:'CH',name:'Changeup',pct:5.4,vel:84.6}],
  'Rich Hill': [{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:88.5},{type:'CU',name:'Curveball',pct:34.5,vel:72.4},{type:'FC',name:'Cutter',pct:15.8,vel:83.7},{type:'SI',name:'Sinker',pct:6.4,vel:87.2},{type:'ST',name:'Sweeper',pct:5.8,vel:70.9}],
  'Richard Fitts': [{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:95.9},{type:'SL',name:'Slider',pct:28.0,vel:87.8},{type:'CU',name:'Curveball',pct:11.0,vel:83.0},{type:'ST',name:'Sweeper',pct:10.6,vel:85.0},{type:'SI',name:'Sinker',pct:9.0,vel:94.8},{type:'CH',name:'Changeup',pct:2.6,vel:89.3}],
  'Richard Lovelady': [{type:'ST',name:'Sweeper',pct:39.2,vel:83.6},{type:'SI',name:'Sinker',pct:32.8,vel:91.3},{type:'FF',name:'Four-seam Fastball',pct:14.3,vel:91.6},{type:'SL',name:'Slider',pct:13.6,vel:86.4}],
  'Rico Garcia': [{type:'FF',name:'Four-seam Fastball',pct:39.4,vel:95.5},{type:'CH',name:'Changeup',pct:22.0,vel:86.5},{type:'CU',name:'Curveball',pct:19.5,vel:85.3},{type:'SL',name:'Slider',pct:19.1,vel:87.0}],
  'Riley Cooper': [{type:'CH',name:'Changeup',pct:50.0,vel:82.2},{type:'SI',name:'Sinker',pct:37.5,vel:92.0},{type:'SL',name:'Slider',pct:12.5,vel:78.8}],
  'Riley O\'Brien': [{type:'SI',name:'Sinker',pct:48.3,vel:98.0},{type:'SL',name:'Slider',pct:30.3,vel:90.1},{type:'ST',name:'Sweeper',pct:21.2,vel:83.4}],
  'Roansy Contreras': [{type:'FF',name:'Four-seam Fastball',pct:42.4,vel:95.4},{type:'CU',name:'Curveball',pct:17.5,vel:79.0},{type:'SL',name:'Slider',pct:17.1,vel:84.2},{type:'SI',name:'Sinker',pct:11.5,vel:95.5},{type:'CH',name:'Changeup',pct:10.1,vel:88.2},{type:'ST',name:'Sweeper',pct:1.4,vel:85.0}],
  'Rob Zastryzny': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:91.8},{type:'FC',name:'Cutter',pct:33.7,vel:86.1},{type:'ST',name:'Sweeper',pct:14.0,vel:80.4},{type:'CH',name:'Changeup',pct:4.7,vel:81.0},{type:'FS',name:'Splitter',pct:4.4,vel:83.5}],
  'Robbie Ray': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:93.6},{type:'SL',name:'Slider',pct:22.7,vel:87.9},{type:'CH',name:'Changeup',pct:13.2,vel:84.8},{type:'KC',name:'Knuckle Curve',pct:11.8,vel:81.2}],
  'Robert Cranz': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:93.0},{type:'CU',name:'Curveball',pct:25.0,vel:78.8},{type:'SL',name:'Slider',pct:25.0,vel:81.0},{type:'FC',name:'Cutter',pct:5.0,vel:92.1}],
  'Robert Garcia': [{type:'FF',name:'Four-seam Fastball',pct:44.8,vel:94.4},{type:'CH',name:'Changeup',pct:28.6,vel:88.9},{type:'SL',name:'Slider',pct:26.5,vel:86.9}],
  'Robert Gasser': [{type:'ST',name:'Sweeper',pct:33.3,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:26.5,vel:93.2},{type:'SI',name:'Sinker',pct:26.5,vel:92.9},{type:'CH',name:'Changeup',pct:10.8,vel:88.9},{type:'FC',name:'Cutter',pct:2.9,vel:89.4}],
  'Robert Stephenson': [{type:'FC',name:'Cutter',pct:68.7,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:15.6,vel:96.4},{type:'FS',name:'Splitter',pct:8.2,vel:88.1},{type:'SL',name:'Slider',pct:7.5,vel:86.2}],
  'Robert Stock': [{type:'FC',name:'Cutter',pct:44.1,vel:88.9},{type:'SI',name:'Sinker',pct:32.2,vel:93.7},{type:'FF',name:'Four-seam Fastball',pct:10.2,vel:95.0},{type:'ST',name:'Sweeper',pct:8.5,vel:81.8},{type:'CH',name:'Changeup',pct:5.1,vel:79.4}],
  'Robert Suarez': [{type:'FF',name:'Four-seam Fastball',pct:63.1,vel:98.6},{type:'CH',name:'Changeup',pct:24.1,vel:90.4},{type:'SI',name:'Sinker',pct:12.6,vel:98.4}],
  'Robert Wegielnik': [{type:'SL',name:'Slider',pct:50.0,vel:82.9},{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:93.7},{type:'CU',name:'Curveball',pct:12.5,vel:81.2}],
  'Robinson Piña': [{type:'SI',name:'Sinker',pct:42.6,vel:93.9},{type:'FS',name:'Splitter',pct:23.0,vel:85.4},{type:'FF',name:'Four-seam Fastball',pct:18.0,vel:93.4},{type:'SL',name:'Slider',pct:16.4,vel:83.9}],
  'Roddery Muñoz': [{type:'SL',name:'Slider',pct:30.6,vel:88.1},{type:'FC',name:'Cutter',pct:27.9,vel:91.8},{type:'SI',name:'Sinker',pct:21.8,vel:95.5},{type:'FF',name:'Four-seam Fastball',pct:16.6,vel:96.1},{type:'CH',name:'Changeup',pct:3.1,vel:90.1}],
  'Roki Sasaki': [{type:'FF',name:'Four-seam Fastball',pct:50.2,vel:96.2},{type:'FS',name:'Splitter',pct:33.5,vel:85.0},{type:'ST',name:'Sweeper',pct:16.0,vel:82.0}],
  'Rolddy Muñoz': [{type:'SI',name:'Sinker',pct:53.8,vel:96.6},{type:'SL',name:'Slider',pct:44.9,vel:90.3},{type:'FF',name:'Four-seam Fastball',pct:1.3,vel:96.8}],
  'Roman Phansalkar': [{type:'SI',name:'Sinker',pct:100.0,vel:91.8}],
  'Ron Marinaccio': [{type:'FF',name:'Four-seam Fastball',pct:50.2,vel:94.0},{type:'CH',name:'Changeup',pct:24.3,vel:82.2},{type:'FC',name:'Cutter',pct:13.3,vel:87.5},{type:'ST',name:'Sweeper',pct:12.2,vel:82.3}],
  'Ronel Blanco': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:93.2},{type:'SL',name:'Slider',pct:31.5,vel:85.5},{type:'CU',name:'Curveball',pct:20.3,vel:80.2},{type:'CH',name:'Changeup',pct:12.5,vel:84.4}],
  'Ronny Henriquez': [{type:'FF',name:'Four-seam Fastball',pct:29.6,vel:96.7},{type:'ST',name:'Sweeper',pct:28.3,vel:85.4},{type:'SL',name:'Slider',pct:23.3,vel:87.7},{type:'CH',name:'Changeup',pct:16.6,vel:91.7},{type:'SI',name:'Sinker',pct:2.2,vel:95.0}],
  'Rowdy Tellez': [{type:'EP',name:'Eephus',pct:95.7,vel:56.0},{type:'FA',name:'Fastball',pct:4.3,vel:75.6}],
  'Ryan Bergert': [{type:'FF',name:'Four-seam Fastball',pct:42.5,vel:93.4},{type:'SL',name:'Slider',pct:24.8,vel:87.4},{type:'ST',name:'Sweeper',pct:17.8,vel:82.6},{type:'CH',name:'Changeup',pct:7.5,vel:87.6},{type:'SI',name:'Sinker',pct:6.6,vel:92.5}],
  'Ryan Borucki': [{type:'SL',name:'Slider',pct:41.2,vel:85.8},{type:'SI',name:'Sinker',pct:26.6,vel:94.0},{type:'FS',name:'Splitter',pct:17.4,vel:83.9},{type:'ST',name:'Sweeper',pct:14.7,vel:81.1}],
  'Ryan Brasier': [{type:'FF',name:'Four-seam Fastball',pct:35.4,vel:94.0},{type:'SL',name:'Slider',pct:35.1,vel:85.3},{type:'SI',name:'Sinker',pct:16.6,vel:93.9},{type:'FC',name:'Cutter',pct:12.9,vel:89.2}],
  'Ryan Burr': [{type:'SL',name:'Slider',pct:76.9,vel:84.2},{type:'FF',name:'Four-seam Fastball',pct:23.1,vel:93.9}],
  'Ryan Feltner': [{type:'FF',name:'Four-seam Fastball',pct:34.0,vel:93.6},{type:'CH',name:'Changeup',pct:17.8,vel:84.7},{type:'SL',name:'Slider',pct:17.3,vel:88.0},{type:'SI',name:'Sinker',pct:12.4,vel:93.3},{type:'ST',name:'Sweeper',pct:12.1,vel:81.5},{type:'CU',name:'Curveball',pct:6.5,vel:78.7}],
  'Ryan Fernandez': [{type:'SL',name:'Slider',pct:47.2,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:38.2,vel:95.2},{type:'CH',name:'Changeup',pct:7.7,vel:87.2},{type:'FC',name:'Cutter',pct:6.8,vel:91.3}],
  'Ryan Fitzgerald': [{type:'EP',name:'Eephus',pct:45.8,vel:38.6},{type:'SL',name:'Slider',pct:45.8,vel:61.8},{type:'CU',name:'Curveball',pct:8.3,vel:48.0}],
  'Ryan Gusto': [{type:'FF',name:'Four-seam Fastball',pct:43.7,vel:94.1},{type:'CU',name:'Curveball',pct:14.8,vel:80.3},{type:'FC',name:'Cutter',pct:11.1,vel:89.1},{type:'SI',name:'Sinker',pct:10.6,vel:93.4},{type:'ST',name:'Sweeper',pct:10.3,vel:82.4},{type:'CH',name:'Changeup',pct:9.5,vel:87.3}],
  'Ryan Helsley': [{type:'SL',name:'Slider',pct:46.9,vel:88.9},{type:'FF',name:'Four-seam Fastball',pct:45.6,vel:99.2},{type:'CU',name:'Curveball',pct:6.0,vel:80.7},{type:'FC',name:'Cutter',pct:1.6,vel:93.7}],
  'Ryan Hendrix': [{type:'SL',name:'Slider',pct:48.4,vel:85.9},{type:'SI',name:'Sinker',pct:41.9,vel:96.0},{type:'CH',name:'Changeup',pct:6.5,vel:89.9},{type:'FF',name:'Four-seam Fastball',pct:3.2,vel:95.2}],
  'Ryan Johnson': [{type:'FC',name:'Cutter',pct:44.2,vel:90.9},{type:'SI',name:'Sinker',pct:22.1,vel:94.4},{type:'ST',name:'Sweeper',pct:21.2,vel:82.8},{type:'FS',name:'Splitter',pct:6.5,vel:87.4},{type:'SL',name:'Slider',pct:5.0,vel:86.5}],
  'Ryan Loutos': [{type:'FF',name:'Four-seam Fastball',pct:46.3,vel:95.4},{type:'SL',name:'Slider',pct:22.5,vel:87.0},{type:'CH',name:'Changeup',pct:16.9,vel:89.0},{type:'ST',name:'Sweeper',pct:9.1,vel:87.6},{type:'SI',name:'Sinker',pct:5.2,vel:94.0}],
  'Ryan Middendorf': [{type:'SI',name:'Sinker',pct:40.0,vel:92.4},{type:'SL',name:'Slider',pct:40.0,vel:87.5},{type:'CH',name:'Changeup',pct:10.0,vel:86.2},{type:'CU',name:'Curveball',pct:10.0,vel:78.8}],
  'Ryan Pepiot': [{type:'FF',name:'Four-seam Fastball',pct:45.1,vel:95.2},{type:'CH',name:'Changeup',pct:25.1,vel:86.8},{type:'SL',name:'Slider',pct:17.6,vel:89.0},{type:'FC',name:'Cutter',pct:6.4,vel:91.6},{type:'CU',name:'Curveball',pct:3.3,vel:80.7},{type:'SI',name:'Sinker',pct:2.6,vel:94.7}],
  'Ryan Pressly': [{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:93.4},{type:'CU',name:'Curveball',pct:24.7,vel:81.4},{type:'SL',name:'Slider',pct:21.2,vel:88.8},{type:'SI',name:'Sinker',pct:11.8,vel:93.4},{type:'CH',name:'Changeup',pct:5.6,vel:88.7}],
  'Ryan Rolison': [{type:'FF',name:'Four-seam Fastball',pct:47.3,vel:92.8},{type:'CU',name:'Curveball',pct:33.0,vel:79.5},{type:'SL',name:'Slider',pct:16.4,vel:85.5},{type:'CH',name:'Changeup',pct:3.3,vel:87.3}],
  'Ryan Shreve': [{type:'CH',name:'Changeup',pct:28.6,vel:78.8},{type:'FC',name:'Cutter',pct:28.6,vel:86.1},{type:'SI',name:'Sinker',pct:28.6,vel:88.9},{type:'ST',name:'Sweeper',pct:14.3,vel:75.3}],
  'Ryan Thompson': [{type:'SI',name:'Sinker',pct:51.1,vel:89.7},{type:'SL',name:'Slider',pct:40.5,vel:77.9},{type:'FF',name:'Four-seam Fastball',pct:7.7,vel:91.2}],
  'Ryan Walker': [{type:'SI',name:'Sinker',pct:61.6,vel:96.0},{type:'SL',name:'Slider',pct:37.8,vel:84.0}],
  'Ryan Weathers': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:96.9},{type:'CH',name:'Changeup',pct:28.7,vel:87.2},{type:'ST',name:'Sweeper',pct:18.8,vel:83.7},{type:'SI',name:'Sinker',pct:3.8,vel:95.3},{type:'SL',name:'Slider',pct:3.7,vel:90.2}],
  'Ryan Yarbrough': [{type:'FC',name:'Cutter',pct:25.7,vel:83.2},{type:'CH',name:'Changeup',pct:20.4,vel:77.9},{type:'SI',name:'Sinker',pct:20.3,vel:86.9},{type:'ST',name:'Sweeper',pct:19.4,vel:71.8},{type:'FF',name:'Four-seam Fastball',pct:14.2,vel:88.2}],
  'Ryan Zeferjahn': [{type:'FF',name:'Four-seam Fastball',pct:31.4,vel:97.4},{type:'ST',name:'Sweeper',pct:26.6,vel:83.9},{type:'FC',name:'Cutter',pct:23.1,vel:90.9},{type:'SL',name:'Slider',pct:16.0,vel:88.2},{type:'SV',name:'Slurve',pct:2.3,vel:83.9}],
  'Ryne Nelson': [{type:'FF',name:'Four-seam Fastball',pct:61.7,vel:95.6},{type:'SL',name:'Slider',pct:14.2,vel:86.6},{type:'CU',name:'Curveball',pct:10.7,vel:80.0},{type:'FC',name:'Cutter',pct:10.5,vel:90.8},{type:'CH',name:'Changeup',pct:2.9,vel:86.9}],
  'Ryne Stanek': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:98.5},{type:'SL',name:'Slider',pct:21.3,vel:88.8},{type:'FS',name:'Splitter',pct:12.1,vel:89.3},{type:'ST',name:'Sweeper',pct:9.2,vel:84.4}],
  'Sam Aldegheri': [{type:'FF',name:'Four-seam Fastball',pct:47.2,vel:91.6},{type:'CH',name:'Changeup',pct:23.8,vel:82.2},{type:'SL',name:'Slider',pct:17.5,vel:82.4},{type:'CU',name:'Curveball',pct:11.6,vel:75.3}],
  'Sam Bachman': [{type:'SL',name:'Slider',pct:55.2,vel:87.8},{type:'SI',name:'Sinker',pct:34.0,vel:97.2},{type:'CH',name:'Changeup',pct:8.7,vel:90.8},{type:'FF',name:'Four-seam Fastball',pct:1.8,vel:96.2}],
  'Sam Benschoter': [{type:'FC',name:'Cutter',pct:30.0,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:30.0,vel:93.4},{type:'SI',name:'Sinker',pct:20.0,vel:91.8},{type:'SL',name:'Slider',pct:20.0,vel:85.3}],
  'Sam Carlson': [{type:'SL',name:'Slider',pct:50.0,vel:80.7},{type:'FC',name:'Cutter',pct:20.0,vel:88.2},{type:'SI',name:'Sinker',pct:20.0,vel:92.8},{type:'FF',name:'Four-seam Fastball',pct:10.0,vel:91.1}],
  'Sam Long': [{type:'FF',name:'Four-seam Fastball',pct:34.7,vel:93.2},{type:'SL',name:'Slider',pct:26.0,vel:84.9},{type:'CU',name:'Curveball',pct:18.0,vel:76.7},{type:'SI',name:'Sinker',pct:10.9,vel:92.7},{type:'FS',name:'Splitter',pct:9.4,vel:86.4}],
  'Sam Moll': [{type:'ST',name:'Sweeper',pct:42.2,vel:81.1},{type:'SI',name:'Sinker',pct:24.2,vel:91.4},{type:'FF',name:'Four-seam Fastball',pct:23.4,vel:92.0},{type:'CH',name:'Changeup',pct:10.2,vel:85.5}],
  'Sam Weatherly': [{type:'FF',name:'Four-seam Fastball',pct:60.0,vel:92.8},{type:'SL',name:'Slider',pct:32.0,vel:80.2},{type:'CH',name:'Changeup',pct:8.0,vel:88.3}],
  'Sammy Peralta': [{type:'SL',name:'Slider',pct:48.4,vel:80.9},{type:'SI',name:'Sinker',pct:32.0,vel:89.0},{type:'CH',name:'Changeup',pct:10.5,vel:84.1},{type:'FF',name:'Four-seam Fastball',pct:8.5,vel:89.0}],
  'Samuel Perez': [{type:'CH',name:'Changeup',pct:46.2,vel:76.7},{type:'FF',name:'Four-seam Fastball',pct:30.8,vel:84.4},{type:'SL',name:'Slider',pct:15.4,vel:77.4},{type:'CU',name:'Curveball',pct:7.7,vel:76.6}],
  'Sandy Alcantara': [{type:'SI',name:'Sinker',pct:25.8,vel:97.1},{type:'CH',name:'Changeup',pct:23.2,vel:90.4},{type:'FF',name:'Four-seam Fastball',pct:17.1,vel:97.7},{type:'SL',name:'Slider',pct:17.1,vel:85.3},{type:'FC',name:'Cutter',pct:16.7,vel:89.3}],
  'Sauryn Lao': [{type:'SL',name:'Slider',pct:48.1,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:29.7,vel:92.8},{type:'SI',name:'Sinker',pct:14.6,vel:93.1},{type:'CH',name:'Changeup',pct:7.6,vel:87.0}],
  'Sawyer Gipson-Long': [{type:'FF',name:'Four-seam Fastball',pct:28.3,vel:92.8},{type:'SL',name:'Slider',pct:21.4,vel:82.3},{type:'CH',name:'Changeup',pct:21.2,vel:84.2},{type:'SI',name:'Sinker',pct:18.4,vel:91.1},{type:'FC',name:'Cutter',pct:10.8,vel:87.7}],
  'Scott Alexander': [{type:'SI',name:'Sinker',pct:64.9,vel:91.0},{type:'SL',name:'Slider',pct:21.4,vel:83.1},{type:'CH',name:'Changeup',pct:13.7,vel:83.2}],
  'Scott Barlow': [{type:'ST',name:'Sweeper',pct:28.3,vel:81.5},{type:'FF',name:'Four-seam Fastball',pct:21.9,vel:92.3},{type:'SL',name:'Slider',pct:19.0,vel:84.3},{type:'CU',name:'Curveball',pct:16.4,vel:78.4},{type:'SI',name:'Sinker',pct:14.2,vel:92.5}],
  'Scott Blewett': [{type:'SL',name:'Slider',pct:44.0,vel:84.0},{type:'FF',name:'Four-seam Fastball',pct:36.2,vel:93.4},{type:'FS',name:'Splitter',pct:19.1,vel:85.0}],
  'Scott Effross': [{type:'SI',name:'Sinker',pct:47.4,vel:89.2},{type:'ST',name:'Sweeper',pct:33.3,vel:78.8},{type:'CH',name:'Changeup',pct:12.2,vel:82.0},{type:'FF',name:'Four-seam Fastball',pct:7.1,vel:89.4}],
  'Scott Kingery': [{type:'EP',name:'Eephus',pct:97.3,vel:38.7},{type:'SL',name:'Slider',pct:2.7,vel:32.8}],
  'Scott McGough': [{type:'FF',name:'Four-seam Fastball',pct:38.6,vel:92.4},{type:'FS',name:'Splitter',pct:32.8,vel:84.9},{type:'SL',name:'Slider',pct:24.7,vel:86.4},{type:'SI',name:'Sinker',pct:3.9,vel:92.2}],
  'Sean Burke': [{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:94.4},{type:'KC',name:'Knuckle Curve',pct:23.1,vel:79.7},{type:'SL',name:'Slider',pct:22.5,vel:86.6},{type:'CH',name:'Changeup',pct:6.7,vel:85.6},{type:'SI',name:'Sinker',pct:4.9,vel:94.0}],
  'Sean Guenther': [{type:'SI',name:'Sinker',pct:41.2,vel:90.0},{type:'SL',name:'Slider',pct:33.9,vel:78.7},{type:'FS',name:'Splitter',pct:21.8,vel:83.2},{type:'FF',name:'Four-seam Fastball',pct:3.0,vel:90.4}],
  'Sean Hjelle': [{type:'SI',name:'Sinker',pct:50.0,vel:93.6},{type:'KC',name:'Knuckle Curve',pct:35.8,vel:85.8},{type:'FC',name:'Cutter',pct:14.2,vel:89.6}],
  'Sean Manaea': [{type:'FF',name:'Four-seam Fastball',pct:60.5,vel:91.7},{type:'ST',name:'Sweeper',pct:33.9,vel:77.7},{type:'CH',name:'Changeup',pct:5.6,vel:84.7}],
  'Sean Newcomb': [{type:'FF',name:'Four-seam Fastball',pct:28.9,vel:93.3},{type:'SI',name:'Sinker',pct:22.0,vel:92.5},{type:'SV',name:'Slurve',pct:22.0,vel:82.0},{type:'FC',name:'Cutter',pct:14.4,vel:89.3},{type:'CH',name:'Changeup',pct:7.0,vel:85.3},{type:'CU',name:'Curveball',pct:5.6,vel:79.0}],
  'Sean Reynolds': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:96.0},{type:'SL',name:'Slider',pct:32.0,vel:87.1},{type:'ST',name:'Sweeper',pct:10.5,vel:82.8},{type:'CH',name:'Changeup',pct:5.7,vel:88.0}],
  'Seranthony Domínguez': [{type:'FF',name:'Four-seam Fastball',pct:43.2,vel:97.6},{type:'ST',name:'Sweeper',pct:21.8,vel:86.4},{type:'FS',name:'Splitter',pct:16.6,vel:87.1},{type:'SI',name:'Sinker',pct:13.2,vel:97.9},{type:'CU',name:'Curveball',pct:5.3,vel:83.6}],
  'Seth Halvorsen': [{type:'FF',name:'Four-seam Fastball',pct:53.6,vel:100.0},{type:'FS',name:'Splitter',pct:25.4,vel:90.8},{type:'SL',name:'Slider',pct:21.0,vel:89.4}],
  'Seth Johnson': [{type:'FF',name:'Four-seam Fastball',pct:51.4,vel:97.2},{type:'SL',name:'Slider',pct:34.1,vel:87.9},{type:'FS',name:'Splitter',pct:7.5,vel:88.4},{type:'CU',name:'Curveball',pct:7.0,vel:77.7}],
  'Seth Lugo': [{type:'FF',name:'Four-seam Fastball',pct:21.4,vel:91.8},{type:'CU',name:'Curveball',pct:17.7,vel:78.8},{type:'SI',name:'Sinker',pct:14.7,vel:91.4},{type:'FC',name:'Cutter',pct:14.3,vel:89.3},{type:'CH',name:'Changeup',pct:9.5,vel:86.2},{type:'SV',name:'Slurve',pct:9.2,vel:79.0},{type:'SL',name:'Slider',pct:5.9,vel:83.3},{type:'CS',name:'Slow Curve',pct:4.9,vel:71.3},{type:'ST',name:'Sweeper',pct:2.1,vel:80.6}],
  'Seth Martinez': [{type:'ST',name:'Sweeper',pct:36.0,vel:77.4},{type:'FF',name:'Four-seam Fastball',pct:24.7,vel:90.1},{type:'FC',name:'Cutter',pct:16.0,vel:84.8},{type:'SI',name:'Sinker',pct:12.7,vel:89.0},{type:'CH',name:'Changeup',pct:10.7,vel:82.8}],
  'Shane Baz': [{type:'FF',name:'Four-seam Fastball',pct:43.9,vel:97.0},{type:'KC',name:'Knuckle Curve',pct:26.9,vel:85.0},{type:'FC',name:'Cutter',pct:14.7,vel:90.2},{type:'CH',name:'Changeup',pct:11.4,vel:89.3},{type:'SL',name:'Slider',pct:3.0,vel:86.7}],
  'Shane Bieber': [{type:'FF',name:'Four-seam Fastball',pct:35.7,vel:92.6},{type:'SL',name:'Slider',pct:20.2,vel:85.4},{type:'KC',name:'Knuckle Curve',pct:18.6,vel:82.6},{type:'CH',name:'Changeup',pct:12.9,vel:89.1},{type:'FC',name:'Cutter',pct:12.7,vel:87.4}],
  'Shane Murphy': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:90.7},{type:'CH',name:'Changeup',pct:16.7,vel:84.2},{type:'FC',name:'Cutter',pct:16.7,vel:85.2},{type:'SI',name:'Sinker',pct:16.7,vel:89.4}],
  'Shane Smith': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:95.7},{type:'CH',name:'Changeup',pct:16.8,vel:90.0},{type:'CU',name:'Curveball',pct:14.6,vel:82.1},{type:'SI',name:'Sinker',pct:12.4,vel:95.7},{type:'SL',name:'Slider',pct:11.1,vel:89.5}],
  'Shaun Anderson': [{type:'SL',name:'Slider',pct:31.0,vel:88.3},{type:'FF',name:'Four-seam Fastball',pct:27.8,vel:92.3},{type:'CH',name:'Changeup',pct:22.2,vel:85.7},{type:'ST',name:'Sweeper',pct:15.7,vel:82.3},{type:'SI',name:'Sinker',pct:3.2,vel:93.1}],
  'Shawn Armstrong': [{type:'FF',name:'Four-seam Fastball',pct:28.8,vel:93.5},{type:'FC',name:'Cutter',pct:24.3,vel:90.8},{type:'SI',name:'Sinker',pct:23.6,vel:94.1},{type:'ST',name:'Sweeper',pct:23.2,vel:85.1}],
  'Shawn Dubin': [{type:'FF',name:'Four-seam Fastball',pct:35.0,vel:94.3},{type:'ST',name:'Sweeper',pct:17.4,vel:83.3},{type:'SI',name:'Sinker',pct:14.9,vel:93.9},{type:'CH',name:'Changeup',pct:14.5,vel:87.7},{type:'CU',name:'Curveball',pct:14.5,vel:81.7},{type:'FC',name:'Cutter',pct:3.6,vel:89.0}],
  'Shelby Miller': [{type:'FF',name:'Four-seam Fastball',pct:61.6,vel:95.1},{type:'FS',name:'Splitter',pct:28.2,vel:86.9},{type:'ST',name:'Sweeper',pct:9.1,vel:83.3}],
  'Shinnosuke Ogasawara': [{type:'FF',name:'Four-seam Fastball',pct:38.7,vel:91.1},{type:'CH',name:'Changeup',pct:22.3,vel:80.7},{type:'KC',name:'Knuckle Curve',pct:19.1,vel:72.3},{type:'SL',name:'Slider',pct:18.5,vel:81.6}],
  'Shintaro Fujinami': [{type:'FF',name:'Four-seam Fastball',pct:52.1,vel:97.7},{type:'FS',name:'Splitter',pct:31.5,vel:90.8},{type:'FC',name:'Cutter',pct:15.1,vel:85.4},{type:'ST',name:'Sweeper',pct:1.4,vel:83.0}],
  'Shohei Ohtani': [{type:'FF',name:'Four-seam Fastball',pct:38.8,vel:98.4},{type:'ST',name:'Sweeper',pct:22.8,vel:85.0},{type:'SL',name:'Slider',pct:11.3,vel:88.1},{type:'CU',name:'Curveball',pct:8.8,vel:78.6},{type:'SI',name:'Sinker',pct:7.0,vel:96.2},{type:'FC',name:'Cutter',pct:6.6,vel:93.9},{type:'FS',name:'Splitter',pct:4.6,vel:90.3}],
  'Shota Imanaga': [{type:'FF',name:'Four-seam Fastball',pct:49.0,vel:90.9},{type:'FS',name:'Splitter',pct:31.0,vel:83.0},{type:'ST',name:'Sweeper',pct:16.6,vel:80.4},{type:'CU',name:'Curveball',pct:1.6,vel:71.6},{type:'SI',name:'Sinker',pct:1.2,vel:88.3}],
  'Simeon Woods Richardson': [{type:'FF',name:'Four-seam Fastball',pct:45.1,vel:93.2},{type:'SL',name:'Slider',pct:27.5,vel:85.4},{type:'CU',name:'Curveball',pct:13.4,vel:77.8},{type:'FS',name:'Splitter',pct:9.5,vel:86.1},{type:'CH',name:'Changeup',pct:4.4,vel:83.2}],
  'Simon Miller': [{type:'FC',name:'Cutter',pct:38.5,vel:86.5},{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:91.3},{type:'SL',name:'Slider',pct:23.1,vel:85.7}],
  'Slade Cecconi': [{type:'FF',name:'Four-seam Fastball',pct:43.6,vel:94.3},{type:'SL',name:'Slider',pct:18.2,vel:84.2},{type:'CU',name:'Curveball',pct:16.5,vel:75.5},{type:'SI',name:'Sinker',pct:11.0,vel:93.6},{type:'CH',name:'Changeup',pct:7.5,vel:84.3},{type:'FC',name:'Cutter',pct:3.1,vel:88.8}],
  'Sonny Gray': [{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:91.6},{type:'ST',name:'Sweeper',pct:19.0,vel:85.0},{type:'CU',name:'Curveball',pct:18.1,vel:80.2},{type:'SI',name:'Sinker',pct:18.0,vel:92.3},{type:'FC',name:'Cutter',pct:12.6,vel:87.8},{type:'CH',name:'Changeup',pct:8.6,vel:86.3},{type:'SL',name:'Slider',pct:1.6,vel:84.4}],
  'Spencer Arrighetti': [{type:'FF',name:'Four-seam Fastball',pct:31.7,vel:93.1},{type:'CU',name:'Curveball',pct:22.5,vel:77.5},{type:'FC',name:'Cutter',pct:13.9,vel:87.1},{type:'ST',name:'Sweeper',pct:13.6,vel:79.9},{type:'CH',name:'Changeup',pct:9.4,vel:85.0},{type:'SI',name:'Sinker',pct:8.9,vel:92.5}],
  'Spencer Bivens': [{type:'SI',name:'Sinker',pct:37.7,vel:94.8},{type:'FC',name:'Cutter',pct:27.8,vel:91.0},{type:'CH',name:'Changeup',pct:14.9,vel:88.5},{type:'ST',name:'Sweeper',pct:8.4,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:6.0,vel:95.2},{type:'SV',name:'Slurve',pct:5.1,vel:79.9}],
  'Spencer Schwellenbach': [{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:97.0},{type:'SL',name:'Slider',pct:18.3,vel:87.0},{type:'FS',name:'Splitter',pct:13.8,vel:84.6},{type:'CU',name:'Curveball',pct:11.8,vel:81.0},{type:'FC',name:'Cutter',pct:11.6,vel:94.0},{type:'SI',name:'Sinker',pct:9.6,vel:95.5}],
  'Spencer Strider': [{type:'FF',name:'Four-seam Fastball',pct:51.2,vel:95.5},{type:'SL',name:'Slider',pct:35.3,vel:84.1},{type:'CU',name:'Curveball',pct:8.9,vel:78.4},{type:'CH',name:'Changeup',pct:4.6,vel:85.9}],
  'Spencer Turnbull': [{type:'FF',name:'Four-seam Fastball',pct:37.6,vel:90.9},{type:'ST',name:'Sweeper',pct:22.4,vel:83.3},{type:'CU',name:'Curveball',pct:15.2,vel:78.1},{type:'CH',name:'Changeup',pct:11.2,vel:86.1},{type:'SL',name:'Slider',pct:7.2,vel:83.9},{type:'SI',name:'Sinker',pct:6.4,vel:92.4}],
  'Stefan Raeth': [{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:92.7},{type:'CU',name:'Curveball',pct:18.8,vel:78.8},{type:'SI',name:'Sinker',pct:18.8,vel:91.1},{type:'SL',name:'Slider',pct:18.8,vel:81.3},{type:'CH',name:'Changeup',pct:12.5,vel:87.9},{type:'FC',name:'Cutter',pct:6.2,vel:87.6}],
  'Stephen Kolek': [{type:'FF',name:'Four-seam Fastball',pct:25.3,vel:94.0},{type:'SI',name:'Sinker',pct:24.5,vel:93.6},{type:'SL',name:'Slider',pct:16.3,vel:85.4},{type:'FC',name:'Cutter',pct:15.3,vel:90.5},{type:'CH',name:'Changeup',pct:11.2,vel:87.5},{type:'ST',name:'Sweeper',pct:7.2,vel:82.6}],
  'Steven Cruz': [{type:'FF',name:'Four-seam Fastball',pct:50.2,vel:98.2},{type:'FC',name:'Cutter',pct:25.5,vel:93.7},{type:'SL',name:'Slider',pct:24.3,vel:89.3}],
  'Steven Matz': [{type:'SI',name:'Sinker',pct:57.9,vel:94.4},{type:'CU',name:'Curveball',pct:21.0,vel:79.5},{type:'CH',name:'Changeup',pct:18.8,vel:83.8},{type:'SL',name:'Slider',pct:2.1,vel:88.4}],
  'Steven Okert': [{type:'SL',name:'Slider',pct:57.5,vel:80.9},{type:'FF',name:'Four-seam Fastball',pct:41.4,vel:92.0}],
  'Steven Wilson': [{type:'ST',name:'Sweeper',pct:58.0,vel:82.1},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:93.8},{type:'CH',name:'Changeup',pct:7.2,vel:85.0},{type:'FC',name:'Cutter',pct:1.4,vel:90.2}],
  'Stevie Emanuels': [{type:'FF',name:'Four-seam Fastball',pct:57.1,vel:92.8},{type:'FC',name:'Cutter',pct:28.6,vel:86.4},{type:'CU',name:'Curveball',pct:14.3,vel:77.0}],
  'T.J. Fondtain': [{type:'CH',name:'Changeup',pct:37.5,vel:78.7},{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:90.0},{type:'SL',name:'Slider',pct:25.0,vel:81.1}],
  'T.J. McFarland': [{type:'SI',name:'Sinker',pct:50.7,vel:87.9},{type:'ST',name:'Sweeper',pct:36.5,vel:78.1},{type:'CH',name:'Changeup',pct:11.5,vel:80.9},{type:'FF',name:'Four-seam Fastball',pct:1.4,vel:87.5}],
  'TJ Shook': [{type:'SI',name:'Sinker',pct:40.9,vel:92.9},{type:'CH',name:'Changeup',pct:31.8,vel:84.9},{type:'FC',name:'Cutter',pct:9.1,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:9.1,vel:92.4},{type:'SL',name:'Slider',pct:9.1,vel:84.8}],
  'Taijuan Walker': [{type:'FC',name:'Cutter',pct:29.6,vel:87.1},{type:'FS',name:'Splitter',pct:22.4,vel:87.3},{type:'SI',name:'Sinker',pct:19.5,vel:92.0},{type:'SL',name:'Slider',pct:11.5,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:10.3,vel:92.2},{type:'CU',name:'Curveball',pct:6.7,vel:74.8}],
  'Taj Bradley': [{type:'FF',name:'Four-seam Fastball',pct:39.4,vel:96.2},{type:'FC',name:'Cutter',pct:22.5,vel:89.7},{type:'FS',name:'Splitter',pct:15.2,vel:91.2},{type:'CU',name:'Curveball',pct:14.4,vel:81.8},{type:'SI',name:'Sinker',pct:8.5,vel:96.0}],
  'Tanner Banks': [{type:'SL',name:'Slider',pct:35.6,vel:87.2},{type:'ST',name:'Sweeper',pct:23.9,vel:81.9},{type:'FF',name:'Four-seam Fastball',pct:21.1,vel:92.6},{type:'SI',name:'Sinker',pct:12.7,vel:92.1},{type:'CH',name:'Changeup',pct:6.7,vel:82.8}],
  'Tanner Bibee': [{type:'FF',name:'Four-seam Fastball',pct:28.6,vel:94.3},{type:'FC',name:'Cutter',pct:21.2,vel:86.2},{type:'ST',name:'Sweeper',pct:15.4,vel:83.0},{type:'CH',name:'Changeup',pct:14.9,vel:81.8},{type:'SI',name:'Sinker',pct:14.6,vel:94.1},{type:'CU',name:'Curveball',pct:5.3,vel:79.7}],
  'Tanner Dodson': [{type:'SI',name:'Sinker',pct:80.0,vel:91.0},{type:'ST',name:'Sweeper',pct:20.0,vel:80.3}],
  'Tanner Gordon': [{type:'FF',name:'Four-seam Fastball',pct:52.8,vel:92.3},{type:'SL',name:'Slider',pct:25.3,vel:84.2},{type:'CH',name:'Changeup',pct:21.1,vel:83.2}],
  'Tanner Houck': [{type:'SI',name:'Sinker',pct:39.8,vel:94.5},{type:'ST',name:'Sweeper',pct:35.4,vel:83.5},{type:'FS',name:'Splitter',pct:19.0,vel:89.4},{type:'FF',name:'Four-seam Fastball',pct:5.9,vel:95.0}],
  'Tanner Rainey': [{type:'FF',name:'Four-seam Fastball',pct:52.5,vel:95.0},{type:'SL',name:'Slider',pct:46.6,vel:86.2}],
  'Tanner Scott': [{type:'FF',name:'Four-seam Fastball',pct:52.8,vel:96.5},{type:'SL',name:'Slider',pct:47.0,vel:88.9}],
  'Tarik Skubal': [{type:'CH',name:'Changeup',pct:30.9,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:97.6},{type:'SI',name:'Sinker',pct:23.7,vel:97.3},{type:'SL',name:'Slider',pct:13.1,vel:90.1},{type:'CU',name:'Curveball',pct:2.8,vel:81.3}],
  'Tayler Saucedo': [{type:'SI',name:'Sinker',pct:51.3,vel:90.8},{type:'CH',name:'Changeup',pct:18.1,vel:85.2},{type:'ST',name:'Sweeper',pct:15.1,vel:80.4},{type:'SL',name:'Slider',pct:10.9,vel:82.9},{type:'FF',name:'Four-seam Fastball',pct:4.5,vel:91.2}],
  'Tayler Scott': [{type:'FF',name:'Four-seam Fastball',pct:47.7,vel:92.0},{type:'FS',name:'Splitter',pct:28.6,vel:83.9},{type:'ST',name:'Sweeper',pct:14.6,vel:82.8},{type:'SL',name:'Slider',pct:6.3,vel:86.3},{type:'SI',name:'Sinker',pct:2.7,vel:91.7}],
  'Taylor Clarke': [{type:'SL',name:'Slider',pct:39.2,vel:87.5},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:94.9},{type:'CH',name:'Changeup',pct:20.5,vel:89.6},{type:'SI',name:'Sinker',pct:18.1,vel:94.7}],
  'Taylor Rashi': [{type:'FF',name:'Four-seam Fastball',pct:55.2,vel:90.0},{type:'FS',name:'Splitter',pct:24.0,vel:84.7},{type:'SL',name:'Slider',pct:11.8,vel:83.0},{type:'CU',name:'Curveball',pct:9.0,vel:74.9}],
  'Taylor Rogers': [{type:'ST',name:'Sweeper',pct:50.9,vel:78.2},{type:'SI',name:'Sinker',pct:49.1,vel:92.7}],
  'Thaddeus Ward': [{type:'FC',name:'Cutter',pct:35.8,vel:88.6},{type:'SI',name:'Sinker',pct:28.4,vel:93.4},{type:'ST',name:'Sweeper',pct:22.4,vel:81.1},{type:'FF',name:'Four-seam Fastball',pct:7.5,vel:92.8},{type:'CU',name:'Curveball',pct:4.5,vel:77.5},{type:'CH',name:'Changeup',pct:1.5,vel:87.7}],
  'Thomas Harrington': [{type:'FF',name:'Four-seam Fastball',pct:42.8,vel:92.2},{type:'FS',name:'Splitter',pct:22.2,vel:83.5},{type:'ST',name:'Sweeper',pct:19.0,vel:81.0},{type:'FC',name:'Cutter',pct:8.4,vel:86.0},{type:'SI',name:'Sinker',pct:6.4,vel:91.3},{type:'SL',name:'Slider',pct:1.3,vel:82.7}],
  'Thomas Hatch': [{type:'FC',name:'Cutter',pct:27.5,vel:90.0},{type:'CH',name:'Changeup',pct:17.9,vel:88.2},{type:'SI',name:'Sinker',pct:17.0,vel:93.4},{type:'SL',name:'Slider',pct:16.8,vel:85.5},{type:'FF',name:'Four-seam Fastball',pct:12.6,vel:93.4},{type:'ST',name:'Sweeper',pct:6.7,vel:82.2},{type:'CU',name:'Curveball',pct:1.4,vel:83.1}],
  'Thomas Schultz': [{type:'FC',name:'Cutter',pct:46.2,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:23.1,vel:92.9},{type:'SI',name:'Sinker',pct:15.4,vel:92.8},{type:'CU',name:'Curveball',pct:7.7,vel:80.3},{type:'SL',name:'Slider',pct:7.7,vel:83.9}],
  'Tim Herrin': [{type:'CU',name:'Curveball',pct:38.4,vel:81.3},{type:'FF',name:'Four-seam Fastball',pct:25.9,vel:94.6},{type:'SL',name:'Slider',pct:18.9,vel:87.2},{type:'SI',name:'Sinker',pct:16.7,vel:93.4}],
  'Tim Hill': [{type:'SI',name:'Sinker',pct:81.6,vel:88.4},{type:'FF',name:'Four-seam Fastball',pct:13.4,vel:89.9},{type:'FC',name:'Cutter',pct:4.9,vel:84.6}],
  'Tim Mayza': [{type:'SI',name:'Sinker',pct:65.6,vel:93.5},{type:'SL',name:'Slider',pct:30.8,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:3.6,vel:93.6}],
  'Tobias Myers': [{type:'FF',name:'Four-seam Fastball',pct:45.2,vel:93.5},{type:'FC',name:'Cutter',pct:20.0,vel:87.6},{type:'SL',name:'Slider',pct:16.3,vel:84.4},{type:'FS',name:'Splitter',pct:15.6,vel:83.1},{type:'CH',name:'Changeup',pct:1.5,vel:80.1},{type:'CU',name:'Curveball',pct:1.5,vel:76.4}],
  'Tom Cosgrove': [{type:'ST',name:'Sweeper',pct:42.2,vel:76.2},{type:'SI',name:'Sinker',pct:32.8,vel:87.3},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:88.5}],
  'Tommy Henry': [{type:'CU',name:'Curveball',pct:28.0,vel:77.7},{type:'FF',name:'Four-seam Fastball',pct:25.2,vel:89.0},{type:'CH',name:'Changeup',pct:23.4,vel:81.9},{type:'SL',name:'Slider',pct:21.5,vel:85.1},{type:'SI',name:'Sinker',pct:1.9,vel:87.2}],
  'Tommy Kahnle': [{type:'CH',name:'Changeup',pct:85.4,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:14.0,vel:93.5}],
  'Tommy Nance': [{type:'SL',name:'Slider',pct:40.6,vel:88.6},{type:'CU',name:'Curveball',pct:30.0,vel:84.9},{type:'SI',name:'Sinker',pct:29.4,vel:94.5}],
  'Tomoyuki Sugano': [{type:'FS',name:'Splitter',pct:23.5,vel:87.3},{type:'ST',name:'Sweeper',pct:19.8,vel:83.6},{type:'FF',name:'Four-seam Fastball',pct:18.9,vel:92.7},{type:'SI',name:'Sinker',pct:16.1,vel:92.9},{type:'FC',name:'Cutter',pct:12.0,vel:88.2},{type:'CU',name:'Curveball',pct:9.7,vel:78.2}],
  'Tomás Nido': [{type:'SL',name:'Slider',pct:77.8,vel:56.4},{type:'CU',name:'Curveball',pct:22.2,vel:46.2}],
  'Tony Gonsolin': [{type:'FF',name:'Four-seam Fastball',pct:40.2,vel:93.5},{type:'FS',name:'Splitter',pct:26.8,vel:84.2},{type:'CU',name:'Curveball',pct:16.9,vel:81.7},{type:'SL',name:'Slider',pct:16.1,vel:88.1}],
  'Tony Santillan': [{type:'FF',name:'Four-seam Fastball',pct:64.8,vel:96.2},{type:'SV',name:'Slurve',pct:21.9,vel:86.1},{type:'SL',name:'Slider',pct:13.2,vel:86.5}],
  'Touki Toussaint': [{type:'SI',name:'Sinker',pct:56.8,vel:91.8},{type:'FS',name:'Splitter',pct:24.3,vel:87.5},{type:'CU',name:'Curveball',pct:18.9,vel:77.5}],
  'Travis Adams': [{type:'FF',name:'Four-seam Fastball',pct:29.4,vel:94.8},{type:'SL',name:'Slider',pct:20.1,vel:85.6},{type:'FC',name:'Cutter',pct:18.6,vel:90.8},{type:'CH',name:'Changeup',pct:16.7,vel:87.4},{type:'SI',name:'Sinker',pct:11.2,vel:94.1},{type:'CU',name:'Curveball',pct:4.1,vel:79.1}],
  'Travis Jankowski': [{type:'EP',name:'Eephus',pct:69.2,vel:43.9},{type:'CU',name:'Curveball',pct:30.8,vel:45.7}],
  'Trent Thornton': [{type:'FF',name:'Four-seam Fastball',pct:32.3,vel:94.4},{type:'FC',name:'Cutter',pct:22.2,vel:90.1},{type:'ST',name:'Sweeper',pct:19.1,vel:80.2},{type:'CU',name:'Curveball',pct:18.1,vel:81.0},{type:'SI',name:'Sinker',pct:2.6,vel:93.6},{type:'FS',name:'Splitter',pct:2.1,vel:84.8},{type:'CH',name:'Changeup',pct:2.0,vel:86.9},{type:'SL',name:'Slider',pct:1.6,vel:85.9}],
  'Trevor Martin': [{type:'FF',name:'Four-seam Fastball',pct:60.0,vel:94.1},{type:'FC',name:'Cutter',pct:30.0,vel:87.5},{type:'SL',name:'Slider',pct:10.0,vel:87.0}],
  'Trevor McDonald': [{type:'SL',name:'Slider',pct:50.5,vel:86.0},{type:'SI',name:'Sinker',pct:38.7,vel:93.0},{type:'CH',name:'Changeup',pct:5.7,vel:84.4},{type:'FC',name:'Cutter',pct:5.2,vel:89.2}],
  'Trevor Megill': [{type:'FF',name:'Four-seam Fastball',pct:60.6,vel:99.1},{type:'KC',name:'Knuckle Curve',pct:39.4,vel:87.5}],
  'Trevor Richards': [{type:'FF',name:'Four-seam Fastball',pct:58.6,vel:91.4},{type:'CH',name:'Changeup',pct:31.0,vel:79.6},{type:'SL',name:'Slider',pct:10.3,vel:84.0}],
  'Trevor Rogers': [{type:'FF',name:'Four-seam Fastball',pct:40.9,vel:93.0},{type:'CH',name:'Changeup',pct:25.0,vel:86.2},{type:'SI',name:'Sinker',pct:14.9,vel:92.8},{type:'FC',name:'Cutter',pct:11.7,vel:81.2},{type:'ST',name:'Sweeper',pct:7.5,vel:78.3}],
  'Trevor Williams': [{type:'FF',name:'Four-seam Fastball',pct:42.3,vel:87.7},{type:'ST',name:'Sweeper',pct:27.5,vel:76.8},{type:'CH',name:'Changeup',pct:12.8,vel:81.3},{type:'SL',name:'Slider',pct:8.8,vel:80.7},{type:'SI',name:'Sinker',pct:8.6,vel:86.7}],
  'Trey McLoughlin': [{type:'FF',name:'Four-seam Fastball',pct:36.8,vel:91.4},{type:'SL',name:'Slider',pct:36.8,vel:82.9},{type:'FS',name:'Splitter',pct:26.3,vel:84.5}],
  'Trey Yesavage': [{type:'FF',name:'Four-seam Fastball',pct:45.2,vel:94.7},{type:'SL',name:'Slider',pct:28.5,vel:88.7},{type:'FS',name:'Splitter',pct:26.4,vel:84.1}],
  'Tristan Beck': [{type:'FF',name:'Four-seam Fastball',pct:33.4,vel:94.6},{type:'ST',name:'Sweeper',pct:27.9,vel:83.1},{type:'SL',name:'Slider',pct:21.7,vel:89.6},{type:'CU',name:'Curveball',pct:16.9,vel:80.6}],
  'Triston McKenzie': [{type:'FF',name:'Four-seam Fastball',pct:74.6,vel:94.0},{type:'CU',name:'Curveball',pct:14.1,vel:79.9},{type:'SL',name:'Slider',pct:11.3,vel:87.2}],
  'Troy Melton': [{type:'FF',name:'Four-seam Fastball',pct:42.2,vel:97.1},{type:'SL',name:'Slider',pct:23.1,vel:85.5},{type:'FC',name:'Cutter',pct:10.6,vel:90.9},{type:'SI',name:'Sinker',pct:10.3,vel:95.4},{type:'FS',name:'Splitter',pct:8.5,vel:88.3},{type:'CU',name:'Curveball',pct:5.2,vel:78.8}],
  'Troy Taylor': [{type:'FF',name:'Four-seam Fastball',pct:47.1,vel:96.4},{type:'ST',name:'Sweeper',pct:37.5,vel:84.9},{type:'SI',name:'Sinker',pct:14.0,vel:96.1},{type:'CH',name:'Changeup',pct:1.5,vel:90.5}],
  'Troy Watson': [{type:'FF',name:'Four-seam Fastball',pct:45.5,vel:94.6},{type:'SI',name:'Sinker',pct:27.3,vel:93.6},{type:'CH',name:'Changeup',pct:9.1,vel:86.7},{type:'FC',name:'Cutter',pct:9.1,vel:85.7},{type:'ST',name:'Sweeper',pct:9.1,vel:84.3}],
  'Tucker Barnhart': [{type:'EP',name:'Eephus',pct:95.5,vel:42.8},{type:'FA',name:'Fastball',pct:4.5,vel:65.3}],
  'Ty Adcock': [{type:'FF',name:'Four-seam Fastball',pct:41.5,vel:97.1},{type:'SL',name:'Slider',pct:30.5,vel:86.9},{type:'FC',name:'Cutter',pct:20.7,vel:93.1},{type:'FS',name:'Splitter',pct:6.1,vel:87.6},{type:'SI',name:'Sinker',pct:1.2,vel:94.9}],
  'Tyler Alexander': [{type:'FF',name:'Four-seam Fastball',pct:26.4,vel:90.7},{type:'ST',name:'Sweeper',pct:22.1,vel:80.2},{type:'FC',name:'Cutter',pct:17.7,vel:86.8},{type:'SI',name:'Sinker',pct:17.6,vel:90.5},{type:'CH',name:'Changeup',pct:16.3,vel:83.2}],
  'Tyler Anderson': [{type:'FF',name:'Four-seam Fastball',pct:38.1,vel:89.3},{type:'CH',name:'Changeup',pct:34.0,vel:78.7},{type:'FC',name:'Cutter',pct:20.5,vel:84.4},{type:'SI',name:'Sinker',pct:3.6,vel:88.5},{type:'SL',name:'Slider',pct:3.5,vel:80.7}],
  'Tyler Baum': [{type:'CH',name:'Changeup',pct:62.5,vel:83.5},{type:'FF',name:'Four-seam Fastball',pct:31.2,vel:97.3},{type:'SL',name:'Slider',pct:6.2,vel:85.7}],
  'Tyler Bryant': [{type:'FF',name:'Four-seam Fastball',pct:62.5,vel:95.2},{type:'CU',name:'Curveball',pct:18.8,vel:83.4},{type:'SL',name:'Slider',pct:18.8,vel:84.7}],
  'Tyler Davis': [{type:'FF',name:'Four-seam Fastball',pct:57.7,vel:95.5},{type:'SL',name:'Slider',pct:30.8,vel:85.7},{type:'CH',name:'Changeup',pct:11.5,vel:88.5}],
  'Tyler Ferguson': [{type:'FF',name:'Four-seam Fastball',pct:38.5,vel:94.8},{type:'ST',name:'Sweeper',pct:31.6,vel:83.7},{type:'SI',name:'Sinker',pct:14.8,vel:94.2},{type:'FC',name:'Cutter',pct:10.9,vel:89.9},{type:'CH',name:'Changeup',pct:4.2,vel:86.3}],
  'Tyler Gilbert': [{type:'SI',name:'Sinker',pct:30.9,vel:89.8},{type:'ST',name:'Sweeper',pct:29.9,vel:81.0},{type:'FC',name:'Cutter',pct:18.3,vel:87.7},{type:'FF',name:'Four-seam Fastball',pct:12.1,vel:90.5},{type:'FS',name:'Splitter',pct:8.8,vel:82.7}],
  'Tyler Glasnow': [{type:'FF',name:'Four-seam Fastball',pct:36.3,vel:95.7},{type:'CU',name:'Curveball',pct:22.3,vel:82.0},{type:'SL',name:'Slider',pct:22.1,vel:89.4},{type:'SI',name:'Sinker',pct:19.4,vel:96.0}],
  'Tyler Heineman': [{type:'EP',name:'Eephus',pct:91.4,vel:51.5},{type:'FA',name:'Fastball',pct:8.6,vel:67.3}],
  'Tyler Holton': [{type:'FC',name:'Cutter',pct:29.6,vel:88.7},{type:'SI',name:'Sinker',pct:22.9,vel:91.4},{type:'ST',name:'Sweeper',pct:18.5,vel:81.3},{type:'CH',name:'Changeup',pct:14.2,vel:84.6},{type:'FF',name:'Four-seam Fastball',pct:11.4,vel:92.0},{type:'CU',name:'Curveball',pct:3.4,vel:80.3}],
  'Tyler Kinley': [{type:'SL',name:'Slider',pct:63.8,vel:87.4},{type:'FF',name:'Four-seam Fastball',pct:22.9,vel:95.1},{type:'CU',name:'Curveball',pct:12.4,vel:83.6}],
  'Tyler Mahle': [{type:'FF',name:'Four-seam Fastball',pct:50.1,vel:92.0},{type:'FS',name:'Splitter',pct:28.0,vel:84.1},{type:'FC',name:'Cutter',pct:11.6,vel:85.4},{type:'SL',name:'Slider',pct:10.4,vel:83.5}],
  'Tyler Matzek': [{type:'FF',name:'Four-seam Fastball',pct:59.8,vel:94.5},{type:'SL',name:'Slider',pct:33.1,vel:84.4},{type:'SI',name:'Sinker',pct:7.1,vel:94.6}],
  'Tyler Myrick': [{type:'FC',name:'Cutter',pct:44.4,vel:89.0},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:93.5},{type:'SI',name:'Sinker',pct:11.1,vel:93.0},{type:'SL',name:'Slider',pct:11.1,vel:83.7}],
  'Tyler Owens': [{type:'FF',name:'Four-seam Fastball',pct:42.4,vel:95.5},{type:'FC',name:'Cutter',pct:27.3,vel:94.2},{type:'SL',name:'Slider',pct:22.7,vel:88.0},{type:'FS',name:'Splitter',pct:7.6,vel:90.1}],
  'Tyler Phillips': [{type:'SI',name:'Sinker',pct:31.8,vel:95.4},{type:'ST',name:'Sweeper',pct:22.7,vel:84.5},{type:'CU',name:'Curveball',pct:22.4,vel:84.1},{type:'FS',name:'Splitter',pct:13.6,vel:86.9},{type:'FF',name:'Four-seam Fastball',pct:9.1,vel:94.6}],
  'Tyler Rogers': [{type:'SI',name:'Sinker',pct:74.3,vel:83.5},{type:'SL',name:'Slider',pct:25.7,vel:74.1}],
  'Tyler Wade': [{type:'EP',name:'Eephus',pct:94.4,vel:51.5},{type:'FA',name:'Fastball',pct:5.6,vel:72.0}],
  'Tyler Wells': [{type:'FF',name:'Four-seam Fastball',pct:36.5,vel:92.8},{type:'CH',name:'Changeup',pct:23.1,vel:86.4},{type:'SL',name:'Slider',pct:18.4,vel:86.9},{type:'FC',name:'Cutter',pct:13.2,vel:90.5},{type:'CU',name:'Curveball',pct:8.8,vel:78.7}],
  'Tyler Zuber': [{type:'ST',name:'Sweeper',pct:34.6,vel:82.8},{type:'FF',name:'Four-seam Fastball',pct:28.0,vel:94.6},{type:'SL',name:'Slider',pct:16.1,vel:87.6},{type:'SI',name:'Sinker',pct:11.8,vel:93.9},{type:'CH',name:'Changeup',pct:7.1,vel:87.6},{type:'FC',name:'Cutter',pct:2.4,vel:91.1}],
  'Tylor Megill': [{type:'FF',name:'Four-seam Fastball',pct:41.5,vel:95.5},{type:'SL',name:'Slider',pct:23.6,vel:84.2},{type:'SI',name:'Sinker',pct:19.8,vel:94.2},{type:'CH',name:'Changeup',pct:7.4,vel:88.2},{type:'CU',name:'Curveball',pct:6.8,vel:80.6}],
  'Valente Bellozo': [{type:'FC',name:'Cutter',pct:34.3,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:28.9,vel:90.8},{type:'ST',name:'Sweeper',pct:16.3,vel:78.7},{type:'CH',name:'Changeup',pct:13.7,vel:81.5},{type:'CU',name:'Curveball',pct:4.5,vel:76.5},{type:'FS',name:'Splitter',pct:2.3,vel:80.6}],
  'Valentin Linarez': [{type:'FF',name:'Four-seam Fastball',pct:65.4,vel:95.2},{type:'SL',name:'Slider',pct:34.6,vel:82.1}],
  'Vicarte Domingo': [{type:'FF',name:'Four-seam Fastball',pct:41.7,vel:91.6},{type:'SL',name:'Slider',pct:25.0,vel:83.0},{type:'CH',name:'Changeup',pct:16.7,vel:83.9},{type:'FC',name:'Cutter',pct:16.7,vel:88.5}],
  'Victor Mederos': [{type:'SI',name:'Sinker',pct:48.7,vel:94.6},{type:'SL',name:'Slider',pct:25.8,vel:89.1},{type:'ST',name:'Sweeper',pct:20.1,vel:81.8},{type:'CH',name:'Changeup',pct:3.8,vel:88.1},{type:'FS',name:'Splitter',pct:1.6,vel:87.8}],
  'Victor Vodnik': [{type:'FF',name:'Four-seam Fastball',pct:55.6,vel:98.7},{type:'CH',name:'Changeup',pct:25.7,vel:92.0},{type:'SL',name:'Slider',pct:13.3,vel:87.2},{type:'FC',name:'Cutter',pct:4.9,vel:92.3}],
  'Vidal Bruján': [{type:'EP',name:'Eephus',pct:91.3,vel:53.7},{type:'CS',name:'Slow Curve',pct:4.3,vel:51.3},{type:'FA',name:'Fastball',pct:4.3,vel:76.4}],
  'Vince Velasquez': [{type:'FF',name:'Four-seam Fastball',pct:41.8,vel:93.0},{type:'SL',name:'Slider',pct:27.3,vel:83.8},{type:'KC',name:'Knuckle Curve',pct:12.7,vel:82.2},{type:'CH',name:'Changeup',pct:10.9,vel:88.6},{type:'SI',name:'Sinker',pct:7.3,vel:93.8}],
  'Vinny Capra': [{type:'EP',name:'Eephus',pct:96.9,vel:52.1},{type:'KN',name:'Knuckleball',pct:3.1,vel:53.6}],
  'Wade Miley': [{type:'FC',name:'Cutter',pct:34.1,vel:88.3},{type:'CH',name:'Changeup',pct:23.9,vel:84.5},{type:'FF',name:'Four-seam Fastball',pct:22.0,vel:92.1},{type:'SI',name:'Sinker',pct:15.1,vel:91.5},{type:'ST',name:'Sweeper',pct:3.4,vel:81.4},{type:'SL',name:'Slider',pct:1.0,vel:83.6}],
  'Walbert Urena': [{type:'SI',name:'Sinker',pct:39.3,vel:98.4},{type:'CH',name:'Changeup',pct:32.1,vel:90.3},{type:'SL',name:'Slider',pct:17.9,vel:86.4},{type:'FF',name:'Four-seam Fastball',pct:10.7,vel:98.2}],
  'Walker Buehler': [{type:'FF',name:'Four-seam Fastball',pct:25.1,vel:94.0},{type:'FC',name:'Cutter',pct:17.1,vel:90.6},{type:'SI',name:'Sinker',pct:16.3,vel:93.8},{type:'SL',name:'Slider',pct:14.4,vel:87.5},{type:'KC',name:'Knuckle Curve',pct:12.9,vel:77.4},{type:'CH',name:'Changeup',pct:7.1,vel:89.7},{type:'ST',name:'Sweeper',pct:7.1,vel:80.8}],
  'Wander Suero': [{type:'FC',name:'Cutter',pct:76.1,vel:92.1},{type:'CH',name:'Changeup',pct:22.5,vel:85.2},{type:'CU',name:'Curveball',pct:1.4,vel:79.6}],
  'Wandy Peralta': [{type:'SI',name:'Sinker',pct:45.1,vel:95.3},{type:'CH',name:'Changeup',pct:34.7,vel:88.9},{type:'SL',name:'Slider',pct:16.6,vel:87.9},{type:'FF',name:'Four-seam Fastball',pct:3.6,vel:95.3}],
  'Welinton Herrera': [{type:'SI',name:'Sinker',pct:66.7,vel:95.8},{type:'FF',name:'Four-seam Fastball',pct:16.7,vel:96.0},{type:'SL',name:'Slider',pct:16.7,vel:84.9}],
  'Wes Benjamin': [{type:'FC',name:'Cutter',pct:40.6,vel:86.8},{type:'FF',name:'Four-seam Fastball',pct:35.6,vel:91.0},{type:'SL',name:'Slider',pct:19.8,vel:82.1},{type:'CH',name:'Changeup',pct:4.0,vel:84.4}],
  'Weston Wilson': [{type:'EP',name:'Eephus',pct:69.4,vel:49.8},{type:'FA',name:'Fastball',pct:30.6,vel:59.6}],
  'Wikelman González': [{type:'FF',name:'Four-seam Fastball',pct:56.0,vel:95.1},{type:'SV',name:'Slurve',pct:23.4,vel:79.4},{type:'CH',name:'Changeup',pct:15.5,vel:88.9},{type:'SL',name:'Slider',pct:5.2,vel:84.1}],
  'Wilkin Ramos': [{type:'SV',name:'Slurve',pct:47.7,vel:78.8},{type:'FF',name:'Four-seam Fastball',pct:27.3,vel:94.1},{type:'SI',name:'Sinker',pct:25.0,vel:93.3}],
  'Wilking Rodríguez': [{type:'FF',name:'Four-seam Fastball',pct:46.4,vel:97.5},{type:'CU',name:'Curveball',pct:32.1,vel:81.9},{type:'FC',name:'Cutter',pct:21.4,vel:95.8}],
  'Will Childers': [{type:'FC',name:'Cutter',pct:75.0,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:25.0,vel:97.4}],
  'Will Klein': [{type:'FF',name:'Four-seam Fastball',pct:57.4,vel:97.9},{type:'CU',name:'Curveball',pct:22.0,vel:85.7},{type:'FC',name:'Cutter',pct:16.1,vel:92.6},{type:'ST',name:'Sweeper',pct:4.6,vel:90.8}],
  'Will Vest': [{type:'FF',name:'Four-seam Fastball',pct:51.8,vel:96.6},{type:'SL',name:'Slider',pct:24.0,vel:88.6},{type:'SI',name:'Sinker',pct:16.6,vel:96.0},{type:'CH',name:'Changeup',pct:7.6,vel:90.2}],
  'Will Warren': [{type:'FF',name:'Four-seam Fastball',pct:41.5,vel:93.3},{type:'SI',name:'Sinker',pct:21.1,vel:93.2},{type:'ST',name:'Sweeper',pct:20.6,vel:82.7},{type:'CH',name:'Changeup',pct:9.9,vel:87.0},{type:'CU',name:'Curveball',pct:6.9,vel:80.1}],
  'Will Wilson': [{type:'SL',name:'Slider',pct:57.7,vel:47.8},{type:'CH',name:'Changeup',pct:34.6,vel:57.1},{type:'CU',name:'Curveball',pct:7.7,vel:48.4}],
  'Willi Castro': [{type:'EP',name:'Eephus',pct:83.3,vel:37.5},{type:'FA',name:'Fastball',pct:16.7,vel:58.3}],
  'Willie MacIver': [{type:'EP',name:'Eephus',pct:100.0,vel:41.2}],
  'Xavier Meachem': [{type:'SL',name:'Slider',pct:50.0,vel:82.1},{type:'FF',name:'Four-seam Fastball',pct:42.9,vel:91.9},{type:'CH',name:'Changeup',pct:7.1,vel:85.9}],
  'Xzavion Curry': [{type:'FF',name:'Four-seam Fastball',pct:37.5,vel:90.5},{type:'SL',name:'Slider',pct:37.5,vel:80.2},{type:'CU',name:'Curveball',pct:17.9,vel:72.4},{type:'FS',name:'Splitter',pct:5.4,vel:85.6},{type:'ST',name:'Sweeper',pct:1.8,vel:80.0}],
  'Yaramil Hiraldo': [{type:'FF',name:'Four-seam Fastball',pct:37.9,vel:94.9},{type:'FS',name:'Splitter',pct:35.4,vel:86.9},{type:'SL',name:'Slider',pct:26.1,vel:86.5}],
  'Yariel Rodríguez': [{type:'SL',name:'Slider',pct:41.2,vel:85.6},{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:95.7},{type:'FS',name:'Splitter',pct:11.9,vel:89.3},{type:'SI',name:'Sinker',pct:6.0,vel:95.5}],
  'Yennier Cano': [{type:'SI',name:'Sinker',pct:45.8,vel:95.1},{type:'SL',name:'Slider',pct:20.3,vel:86.2},{type:'CH',name:'Changeup',pct:12.6,vel:91.8},{type:'FF',name:'Four-seam Fastball',pct:11.4,vel:94.9},{type:'FS',name:'Splitter',pct:7.1,vel:90.6},{type:'FC',name:'Cutter',pct:2.8,vel:92.0}],
  'Yerry De los Santos': [{type:'SI',name:'Sinker',pct:51.8,vel:95.5},{type:'CH',name:'Changeup',pct:27.4,vel:88.2},{type:'FF',name:'Four-seam Fastball',pct:10.8,vel:95.1},{type:'SL',name:'Slider',pct:10.0,vel:85.0}],
  'Yilber Díaz': [{type:'FF',name:'Four-seam Fastball',pct:56.7,vel:94.6},{type:'SL',name:'Slider',pct:35.0,vel:81.0},{type:'KC',name:'Knuckle Curve',pct:8.3,vel:75.4}],
  'Yimi García': [{type:'FF',name:'Four-seam Fastball',pct:45.2,vel:96.0},{type:'CU',name:'Curveball',pct:16.5,vel:84.4},{type:'ST',name:'Sweeper',pct:16.5,vel:85.7},{type:'SI',name:'Sinker',pct:14.7,vel:95.2},{type:'CH',name:'Changeup',pct:6.1,vel:89.3},{type:'SL',name:'Slider',pct:1.0,vel:91.8}],
  'Yoendrys Gómez': [{type:'FF',name:'Four-seam Fastball',pct:35.2,vel:93.8},{type:'SI',name:'Sinker',pct:18.2,vel:93.2},{type:'ST',name:'Sweeper',pct:17.3,vel:82.2},{type:'CU',name:'Curveball',pct:14.2,vel:80.8},{type:'CH',name:'Changeup',pct:7.3,vel:89.3},{type:'FC',name:'Cutter',pct:6.4,vel:90.3},{type:'SL',name:'Slider',pct:1.3,vel:86.8}],
  'Yohan Ramírez': [{type:'FF',name:'Four-seam Fastball',pct:43.4,vel:96.4},{type:'ST',name:'Sweeper',pct:25.3,vel:83.2},{type:'CU',name:'Curveball',pct:18.9,vel:83.9},{type:'SI',name:'Sinker',pct:7.6,vel:96.5},{type:'SL',name:'Slider',pct:3.6,vel:87.0},{type:'FC',name:'Cutter',pct:1.2,vel:90.0}],
  'Yoshinobu Yamamoto': [{type:'FF',name:'Four-seam Fastball',pct:35.4,vel:95.4},{type:'FS',name:'Splitter',pct:25.1,vel:91.0},{type:'CU',name:'Curveball',pct:18.0,vel:76.9},{type:'FC',name:'Cutter',pct:10.9,vel:91.1},{type:'SI',name:'Sinker',pct:7.8,vel:94.8},{type:'SL',name:'Slider',pct:2.8,vel:86.3}],
  'Yosver Zulueta': [{type:'SI',name:'Sinker',pct:41.3,vel:95.3},{type:'SL',name:'Slider',pct:35.5,vel:86.6},{type:'FF',name:'Four-seam Fastball',pct:17.4,vel:97.9},{type:'CH',name:'Changeup',pct:5.8,vel:88.5}],
  'Yu Darvish': [{type:'SI',name:'Sinker',pct:20.0,vel:93.4},{type:'FF',name:'Four-seam Fastball',pct:16.4,vel:93.9},{type:'CU',name:'Curveball',pct:15.3,vel:71.1},{type:'SL',name:'Slider',pct:13.8,vel:85.8},{type:'FC',name:'Cutter',pct:11.7,vel:90.7},{type:'FS',name:'Splitter',pct:10.4,vel:86.3},{type:'ST',name:'Sweeper',pct:10.1,vel:82.8},{type:'KC',name:'Knuckle Curve',pct:1.3,vel:78.6}],
  'Yuki Matsui': [{type:'FF',name:'Four-seam Fastball',pct:39.4,vel:92.1},{type:'FS',name:'Splitter',pct:31.8,vel:84.0},{type:'SL',name:'Slider',pct:15.6,vel:86.6},{type:'ST',name:'Sweeper',pct:11.2,vel:81.4},{type:'SI',name:'Sinker',pct:1.8,vel:91.4}],
  'Yusei Kikuchi': [{type:'SL',name:'Slider',pct:36.4,vel:87.0},{type:'FF',name:'Four-seam Fastball',pct:34.9,vel:94.8},{type:'CU',name:'Curveball',pct:15.1,vel:79.9},{type:'CH',name:'Changeup',pct:12.1,vel:85.6},{type:'SI',name:'Sinker',pct:1.2,vel:92.5}],
  'Zac Gallen': [{type:'FF',name:'Four-seam Fastball',pct:45.0,vel:93.5},{type:'KC',name:'Knuckle Curve',pct:23.5,vel:81.0},{type:'CH',name:'Changeup',pct:15.8,vel:86.3},{type:'SL',name:'Slider',pct:13.2,vel:88.6},{type:'SI',name:'Sinker',pct:2.5,vel:93.2}],
  'Zach Agnos': [{type:'FC',name:'Cutter',pct:33.1,vel:92.6},{type:'FF',name:'Four-seam Fastball',pct:29.6,vel:95.8},{type:'FS',name:'Splitter',pct:20.7,vel:86.7},{type:'ST',name:'Sweeper',pct:16.3,vel:84.9}],
  'Zach Barnes': [{type:'SL',name:'Slider',pct:43.2,vel:83.1},{type:'FF',name:'Four-seam Fastball',pct:35.1,vel:93.3},{type:'SI',name:'Sinker',pct:16.2,vel:92.4},{type:'CU',name:'Curveball',pct:2.7,vel:81.7},{type:'FC',name:'Cutter',pct:2.7,vel:86.3}],
  'Zach Bryant': [{type:'FC',name:'Cutter',pct:37.5,vel:88.1},{type:'FF',name:'Four-seam Fastball',pct:33.3,vel:95.3},{type:'SL',name:'Slider',pct:20.8,vel:82.3},{type:'SI',name:'Sinker',pct:8.3,vel:95.2}],
  'Zach Brzykcy': [{type:'FF',name:'Four-seam Fastball',pct:53.4,vel:94.7},{type:'CU',name:'Curveball',pct:24.4,vel:83.1},{type:'CH',name:'Changeup',pct:22.2,vel:88.3}],
  'Zach Eflin': [{type:'FC',name:'Cutter',pct:21.6,vel:88.5},{type:'SI',name:'Sinker',pct:18.8,vel:91.6},{type:'CH',name:'Changeup',pct:16.5,vel:86.6},{type:'CU',name:'Curveball',pct:16.2,vel:78.1},{type:'ST',name:'Sweeper',pct:13.8,vel:79.2},{type:'FF',name:'Four-seam Fastball',pct:13.1,vel:91.9}],
  'Zach Franklin': [{type:'FF',name:'Four-seam Fastball',pct:56.5,vel:93.7},{type:'FS',name:'Splitter',pct:30.4,vel:85.3},{type:'SL',name:'Slider',pct:13.0,vel:85.9}],
  'Zach Greene': [{type:'CU',name:'Curveball',pct:50.0,vel:76.2},{type:'FC',name:'Cutter',pct:50.0,vel:88.8}],
  'Zach Maxwell': [{type:'FF',name:'Four-seam Fastball',pct:57.6,vel:99.6},{type:'FC',name:'Cutter',pct:23.6,vel:94.3},{type:'SL',name:'Slider',pct:18.8,vel:88.1}],
  'Zach McCambley': [{type:'SL',name:'Slider',pct:46.7,vel:83.6},{type:'FC',name:'Cutter',pct:26.7,vel:88.8},{type:'FF',name:'Four-seam Fastball',pct:20.0,vel:94.3},{type:'CU',name:'Curveball',pct:6.7,vel:81.6}],
  'Zach McKinstry': [{type:'EP',name:'Eephus',pct:100.0,vel:36.0}],
  'Zach Pop': [{type:'SI',name:'Sinker',pct:56.2,vel:96.0},{type:'FC',name:'Cutter',pct:22.2,vel:92.9},{type:'SL',name:'Slider',pct:17.0,vel:85.5},{type:'ST',name:'Sweeper',pct:4.6,vel:84.3}],
  'Zach Thompson': [{type:'FF',name:'Four-seam Fastball',pct:40.0,vel:91.2},{type:'FC',name:'Cutter',pct:26.7,vel:85.3},{type:'CU',name:'Curveball',pct:15.0,vel:74.1},{type:'CH',name:'Changeup',pct:13.3,vel:84.9},{type:'SI',name:'Sinker',pct:5.0,vel:90.1}],
  'Zack Kelly': [{type:'FC',name:'Cutter',pct:31.6,vel:91.8},{type:'ST',name:'Sweeper',pct:20.6,vel:81.8},{type:'FF',name:'Four-seam Fastball',pct:19.5,vel:96.0},{type:'SI',name:'Sinker',pct:15.4,vel:96.1},{type:'CH',name:'Changeup',pct:11.8,vel:83.1},{type:'CU',name:'Curveball',pct:1.0,vel:82.2}],
  'Zack Littell': [{type:'SL',name:'Slider',pct:27.6,vel:87.3},{type:'FS',name:'Splitter',pct:27.0,vel:83.4},{type:'FF',name:'Four-seam Fastball',pct:24.0,vel:92.1},{type:'SI',name:'Sinker',pct:16.0,vel:91.5},{type:'ST',name:'Sweeper',pct:5.4,vel:79.4}],
  'Zack Weiss': [{type:'FF',name:'Four-seam Fastball',pct:57.1,vel:94.4},{type:'ST',name:'Sweeper',pct:35.7,vel:83.1},{type:'SL',name:'Slider',pct:7.1,vel:87.5}],
  'Zack Wheeler': [{type:'FF',name:'Four-seam Fastball',pct:40.8,vel:96.0},{type:'SI',name:'Sinker',pct:17.0,vel:95.4},{type:'ST',name:'Sweeper',pct:14.8,vel:83.7},{type:'CU',name:'Curveball',pct:9.6,vel:81.1},{type:'FC',name:'Cutter',pct:9.0,vel:91.8},{type:'FS',name:'Splitter',pct:8.9,vel:87.1}],
  'Zak Kent': [{type:'SL',name:'Slider',pct:38.3,vel:85.8},{type:'FF',name:'Four-seam Fastball',pct:30.2,vel:92.6},{type:'CU',name:'Curveball',pct:25.0,vel:81.6},{type:'SI',name:'Sinker',pct:5.5,vel:93.6},{type:'ST',name:'Sweeper',pct:1.0,vel:84.0}],
  'Zane Mills': [{type:'SI',name:'Sinker',pct:56.5,vel:91.5},{type:'SL',name:'Slider',pct:43.5,vel:81.1}],
  'Zane Morehouse': [{type:'FF',name:'Four-seam Fastball',pct:50.0,vel:94.8},{type:'SL',name:'Slider',pct:40.0,vel:85.8},{type:'FC',name:'Cutter',pct:10.0,vel:90.2}],
  'Zebby Matthews': [{type:'FF',name:'Four-seam Fastball',pct:41.2,vel:96.2},{type:'SL',name:'Slider',pct:24.9,vel:88.2},{type:'FC',name:'Cutter',pct:13.2,vel:91.7},{type:'CH',name:'Changeup',pct:10.6,vel:87.5},{type:'CU',name:'Curveball',pct:5.8,vel:82.9},{type:'SI',name:'Sinker',pct:4.3,vel:95.8}],
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
        Pitch usage · 2025 season · Baseball Savant
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
  const arsenal = PITCH_ARSENALS[pitcher.name] || null;
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

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const rel1 = awayPitchers.filter(p => !p.isStarter);
    const rel2 = homePitchers.filter(p => !p.isStarter);
    const hrs = keyPlays.filter(p => p.event === 'home_run');
    const topHitters = [...awayBatters, ...homeBatters]
      .filter(b => b.h > 1 || b.hr > 0)
      .map(b => `${b.name} (${b.h}H${b.hr > 0 ? ' ' + b.hr + 'HR' : ''})`)
      .join(', ');

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const lines = [];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.pitchCount} pitches.${sp1.seasonEra ? ' Season ERA: ' + sp1.seasonEra + '.' : ''}`);
    if (rel1.length) lines.push(`${awayTeam.abbr} bullpen: ${rel1.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.pitchCount} pitches.${sp2.seasonEra ? ' Season ERA: ' + sp2.seasonEra + '.' : ''}`);
    if (rel2.length) lines.push(`${homeTeam.abbr} bullpen: ${rel2.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (hrs.length) lines.push(`Home runs: ${hrs.map(h => h.batter).join(', ')}.`);
    if (topHitters) lines.push(`Standout hitters: ${topHitters}.`);

    const gameContext = isFinal
      ? `GAME STATUS: FINAL. Score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`
      : `GAME STATUS: IN PROGRESS. Score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}. Now: ${inningHalf || ''} ${inning || ''}.`;

    const tenseGuide = isFinal
      ? `The game has finished. Write entirely in PAST TENSE. Give a definitive verdict on why the game was won or lost.`
      : `The game is still in progress. Write entirely in PRESENT/PRESENT PERFECT TENSE. Focus on what has happened so far and what to watch.`;

    const prompt = `You are an expert baseball analyst. ${gameContext}

${tenseGuide}

${lines.join('\n')}

3-4 sentences of genuine insight. Focus on pitch efficiency (pitches per out = pitches divided by innings×3, good is 3.5-4.5), command, whether the line contradicts the score, bullpen impact, or a standout hitter. Never show infinity or ÷ symbols. If no walks, say "no walks allowed".`;

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
    })
      .then(r => r.json())
      .then(d => { setText(d?.content?.find(b => b.type === 'text')?.text || buildFallback(sp1, sp2, isFinal)); })
      .catch(() => { setText(buildFallback(sp1, sp2, isFinal)); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1, sp2, finished) {
    const parts = [];
    if (sp1) {
      const outs = parseFloat(sp1.ip) * 3;
      const ppo = outs > 0 ? (sp1.pitchCount / outs).toFixed(1) : '?';
      const kbb = sp1.bb > 0 ? (sp1.k / sp1.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp1.name} ${finished?'threw':'has thrown'} ${sp1.pitchCount} pitches over ${sp1.ip} innings (${ppo} per out), K/BB ${kbb}.`);
    }
    if (sp2) {
      const kbb = sp2.bb > 0 ? (sp2.k / sp2.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp2.name} ${finished?'went':'has gone'} ${sp2.ip} innings, K/BB ${kbb}, ${finished?'allowing':'having allowed'} ${sp2.er} earned run${sp2.er !== 1 ? 's' : ''}.`);
    }
    return parts.join(' ') || 'Analysis unavailable.';
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', fontStyle: loading ? 'italic' : 'normal' }}>
        {loading ? 'Generating analysis...' : text}
      </div>
    </div>
  );
}

export function GameRecap({ awayTeam, homeTeam, awayScore, homeScore, awayPitchers, homePitchers, awayBatters, homeBatters, keyPlays, decisions }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const winner = awayScore > homeScore ? awayTeam : homeTeam;
    const loser = awayScore > homeScore ? homeTeam : awayTeam;
    const winScore = Math.max(awayScore, homeScore);
    const loseScore = Math.min(awayScore, homeScore);

    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const allRelievers = [...awayPitchers.filter(p=>!p.isStarter), ...homePitchers.filter(p=>!p.isStarter)];
    const hrs = keyPlays.filter(p => p.event === 'home_run');
    const scoringPlays = keyPlays.filter(p => p.rbi > 0).slice(0, 5);

    const allBatters = [...awayBatters, ...homeBatters];
    const topHitters = allBatters
      .filter(b => b.h >= 2 || b.hr > 0 || b.rbi >= 2)
      .sort((a, b) => (b.hr * 3 + b.rbi * 2 + b.h) - (a.hr * 3 + a.rbi * 2 + a.h))
      .slice(0, 4)
      .map(b => `${b.name} (${awayBatters.includes(b) ? awayTeam.abbr : homeTeam.abbr}): ${b.h}H, ${b.rbi}RBI${b.hr > 0 ? ', ' + b.hr + 'HR' : ''}${b.bb > 0 ? ', ' + b.bb + 'BB' : ''}`)
      .join('\n');

    const lines = [`${awayTeam.name} ${awayScore}, ${homeTeam.name} ${homeScore}`];
    if (decisions?.winner?.fullName) lines.push(`W: ${decisions.winner.fullName}${decisions.loser?.fullName ? '  L: ' + decisions.loser.fullName : ''}${decisions.save?.fullName ? '  SV: ' + decisions.save.fullName : ''}`);
    if (sp1) {
      const outs = parseFloat(sp1.ip) * 3;
      const ppo = outs > 0 ? (sp1.pitchCount / outs).toFixed(1) : '?';
      lines.push(`${sp1.name} (${awayTeam.abbr} SP): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB — ${ppo} pitches/out`);
    }
    if (sp2) {
      const outs = parseFloat(sp2.ip) * 3;
      const ppo = outs > 0 ? (sp2.pitchCount / outs).toFixed(1) : '?';
      lines.push(`${sp2.name} (${homeTeam.abbr} SP): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB — ${ppo} pitches/out`);
    }
    if (allRelievers.length) lines.push(`Relievers: ${allRelievers.map(p=>`${p.name} ${p.ip}IP/${p.er}ER`).join(', ')}`);
    if (hrs.length) lines.push(`HRs: ${hrs.map(h=>`${h.batter} (${h.half==='top'?awayTeam.abbr:homeTeam.abbr})`).join(', ')}`);
    if (topHitters) lines.push(`Key performers:\n${topHitters}`);
    if (scoringPlays.length) lines.push(`Scoring plays: ${scoringPlays.map(p=>`${p.batter} (${p.rbi} RBI)`).join(', ')}`);

    if (!sp1 && !sp2 && !topHitters) {
      setText(`${winner.name} defeated ${loser.name} ${winScore}-${loseScore}.`);
      setLoading(false);
      return;
    }

    const prompt = `You are writing a post-game recap for a baseball fan who just watched this game. Write 3-4 sentences in past tense. Be specific and analytical — reference actual players and stats. Do NOT start with the final score (they already know it). Lead with the most interesting story of the game: was it a dominant pitching performance? A comeback? A single player who drove everything?

Avoid: clichés, phrases like "gutsy" "electric" "fired up", generic praise.
Include: specific stat observations (pitch count efficiency, K/BB ratio, exit velos if notable), context for why something matters.

Game data:
${lines.join('\n')}`;

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 350, messages: [{ role: 'user', content: prompt }] }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => {
        const t = d?.content?.find(b => b.type === 'text')?.text;
        if (t) setText(t);
        else throw new Error('no text');
      })
      .catch(() => {
        setError(true);
        // Build a decent fallback from the data we have
        const parts = [];
        if (sp1 || sp2) {
          const starter = sp1 && parseFloat(sp1.ip) >= parseFloat(sp2?.ip||0) ? sp1 : sp2;
          const team = starter === sp1 ? awayTeam : homeTeam;
          const outs = parseFloat(starter.ip) * 3;
          const ppo = outs > 0 ? (starter.pitchCount / outs).toFixed(1) : null;
          parts.push(`${starter.name} led ${team.name} with ${starter.ip} innings pitched, allowing ${starter.er} earned run${starter.er!==1?'s':''} on ${ppo ? ppo + ' pitches per out' : starter.pitchCount + ' pitches'}.`);
        }
        if (hrs.length) parts.push(`${hrs.map(h=>h.batter).join(' and ')} hit ${hrs.length > 1 ? 'home runs' : 'a home run'} in the game.`);
        if (topHitters.split('\n')[0]) {
          const top = allBatters.sort((a,b)=>(b.hr*3+b.rbi*2+b.h)-(a.hr*3+a.rbi*2+a.h))[0];
          if (top && (top.h >= 2 || top.rbi >= 2)) parts.push(`${top.name} went ${top.h}-for-${top.ab} with ${top.rbi} RBI.`);
        }
        if (!parts.length) parts.push(`${winner.name} defeated ${loser.name} ${winScore}-${loseScore}.`);
        setText(parts.join(' '));
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:10 }}>
        Game recap
      </div>
      <div style={{ fontSize:14, lineHeight:1.75, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)', fontStyle: loading ? 'italic' : 'normal' }}>
        {loading ? 'Writing recap...' : text}
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
    </div>
  );
}
